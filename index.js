#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const stream = require("stream");

const unzipper = require("unzipper");
const ffmpegNormalize = require("ffmpeg-normalize");
const uniqid = require("uniqid");

const ffmpeg_static = require("ffmpeg-static");
const ffprobe_static = require("ffprobe-static");

//fluent ffmpeg init type 1
// const FfmpegCommand = require("fluent-ffmpeg");
// FfmpegCommand.setFfmpegPath(ffmpeg_static.path);
// FfmpegCommand.setFfprobePath(ffprobe_static.path);
// const ffmpeg_command = new FfmpegCommand();

//fluent ffmpeg init type 2
// var ffmpeg = require("fluent-ffmpeg");
// ffmpeg.setFfmpegPath(ffmpeg_static.path);
// ffmpeg.setFfprobePath(ffprobe_static.path);
// var command = ffmpeg();

//==================//
//Caporal
//==================//
const prog = require("caporal");
prog
  .version("1.0.0")
  .argument("<source>", "Source of powerpoint file")
  .argument("[destination]", "Output directory")
  .option(
    "-n, --normalize",
    `Perform two pass audio normalization.`,
    prog.BOOL
  )
  .action(function(args, options, logger) {
    // args and options are objects
    // args = {"app": "myapp", "env": "production"}
    // options = {"tail" : 100}

    if (args.source) {
      const src = path.resolve(args.source);
      const destDefault = path.resolve(__dirname, path.parse(args.source).name);
      //If no destination provided, set it to name of file, without extension
      const dest = !!args.destination
        ? path.resolve(args.destination)
        : destDefault;

      if (options.normalize) {
        // console.log("normalize");
        extract(args.source, dest, true);

        // const test = path.join(__dirname, "ch07.3/media1.wav");
        // console.log(test);
        //One pass normalization:
        // ffmpeg -i input.wav -filter:a loudnorm output.wav
        //INCOMPLETE Attempt:
        // ffmpeg(test).output("outputfile.wav").on('end', function() {
          //   console.log("FINISHED");
          // }).run()
          //See: https://superuser.com/questions/323119/how-can-i-normalize-audio-using-ffmpeg
        } else {
          extract(args.source, dest, false);
      }
    } 
  });

prog.parse(process.argv);

//==================//
//UNZIP
//==================//
function extract(source, destination, normalize = false) {
  const pptPath = source;
  const root = path.resolve(__dirname);
  // const outputDir = path.resolve(path.join(__dirname, "/output"));
  const outputDir = destination;

  fs.createReadStream(pptPath)
    .pipe(unzipper.Parse())
    .on("entry", async entry => {
      try {
        const fileName = entry.path;
        const type = entry.type; // 'Directory' or 'File'
        const size = entry.vars.uncompressedSize; // There is also compressedSize;
        if (path.extname(fileName) === ".wav") {
          // console.log(type, size, fileName)
          const fullFilePath = path.join(outputDir, path.parse(fileName).base);
          const fullFilePath_normalized = path.join(
            outputDir,
            path.parse(fileName).name + "_normalized" + path.parse(fileName).ext
          );
          console.log(fullFilePath_normalized);

          console.log(outputDir);
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
          }
          // entry.pipe(fs.createWriteStream(outputDir));
          const content = await entry.buffer();
          // await fs.writeFile(outputDir, content);
          if (normalize) {
            const uid = uniqid();
            const fullFilePath_temp = path.join(
              outputDir,
              path.parse(fileName).name +
                uid +
                path.parse(fileName).ext
            );
            fs.writeFileSync(fullFilePath_temp, content);
            ffmpegNormalize({
              input: fullFilePath_temp,
              output: fullFilePath_normalized,
              loudness: {
                normalization: "ebuR128",
                target: {
                  input_i: -23,
                  input_lra: 7.0,
                  input_tp: -2.0
                }
              },
              verbose: false
            })
            .then(normalized => {
              //Delete non-normalized version (async)
              fs.unlink(fullFilePath_temp, err => {
                if (err) {
                  console.error("Error while deleting temp file: " + fullFilePath_temp, err);
                  return;
                }
                //file removed
              });
            })
            .catch(error => {
              // Some error happened
              console.log("Error during normalization: ", error);
              
            });
          } else {
            //Write non-normalized file
            fs.writeFileSync(fullFilePath, content);
          }
        } else {
          entry.autodrain();
        }
      } catch (err) {
        console.log(err);
      }
    });
}
