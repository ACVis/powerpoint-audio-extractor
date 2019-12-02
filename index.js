#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const stream = require("stream");

const unzipper = require("unzipper");
const ffmpegNormalize = require("ffmpeg-normalize");

const ffmpeg_static = require("ffmpeg-static");
const ffprobe_static = require("ffprobe-static");
// console.log(ffmpeg.path);
const NormalizeVolume = require("normalize-volume");

// const FfmpegCommand = require("fluent-ffmpeg");
// FfmpegCommand.setFfmpegPath(ffmpeg_static);
// FfmpegCommand.setFfprobePath(ffprobe_static);
// const ffmpeg_command = new FfmpegCommand();
var ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpeg_static.path);
ffmpeg.setFfprobePath(ffprobe_static.path);
var command = ffmpeg();

// console.log(__dirname);
//==================//
//list root directory
//==================//
// fs.readdir(__dirname, (err, files) => {
//     files.forEach( (file) => {

//         // console.log(file);
//     })
// })

//==================//
//Caporal Version
//==================//
const prog = require("caporal");
prog
  .version("1.0.0")
  // you specify arguments using .argument()
  // 'app' is required, 'env' is optional
  // .command('deploy', 'Deploy an application')
  .argument("<source>", "App to deploy")
  .argument("[destination]", "Environment to deploy on")
  // you specify options using .option()
  // if --tail is passed, its value is required
  .option(
    "-n, --normalize",
    "Tail <lines> lines of logs after deploy",
    prog.BOOL
  )
  .action(function(args, options, logger) {
    // args and options are objects
    // args = {"app": "myapp", "env": "production"}
    // options = {"tail" : 100}
    console.log(args);
    console.log(options);
    logger.info(options);
    // logger.warn(options);
    // logger.error(options);
    // logger.debug(options);
    if (args.source) {
      const src = path.resolve(args.source);
      const destDefault = path.resolve(__dirname, path.parse(args.source).name);
      //If no destination provided, set it to name of file, without extension
      const dest = !!args.destination
        ? path.resolve(args.destination)
        : destDefault;
      // extract(args.source, dest);
      
      if (options.normalize) {
        console.log("normalize");
        
        const test = path.join(__dirname, "ch07.3/media1.wav");
        console.log(test);
        extract(args.source, dest, true);
        //One pass normalization:
        // ffmpeg -i input.wav -filter:a loudnorm output.wav
        //INCOMPLETE Attempt:
        // ffmpeg(test).output("outputfile.wav").on('end', function() {
        //   console.log("FINISHED");
        // }).run()
        //See: https://superuser.com/questions/323119/how-can-i-normalize-audio-using-ffmpeg

        // normalize({
        //   input: test,
        //   output: "output.mp4",
        //   loudness: {
        //     normalization: "ebuR128",
        //     target: {
        //       input_i: -23,
        //       input_lra: 7.0,
        //       input_tp: -2.0
        //     }
        //   },
        //   verbose: true
        // })
        //   .then(normalized => {
        //     // Normalized
        //   })
        //   .catch(error => {
        //     // Some error happened
        //   });
      }
    } else {
      logger.warn("Please specify a source");
    }
  });

prog.parse(process.argv);

//==================//
//UNZIP
//==================//
function extract(source, destination, normalize = false) {
  // const pptPath = path.resolve(__dirname, "ch07.3.pptx");
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
          const fullFilePath_normalized = path.join(outputDir, path.parse(fileName).name + "_normalized" + path.parse(fileName).ext);
          console.log(fullFilePath_normalized);

          console.log(outputDir);
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
          }
          // entry.pipe(fs.createWriteStream(outputDir));
          const content = await entry.buffer();
          // await fs.writeFile(outputDir, content);
          fs.writeFileSync(fullFilePath_normalized, content);
          if (normalize) {
          ffmpegNormalize({
            input: fullFilePath_normalized,
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
              // Normalized
            })
            .catch(error => {
              // Some error happened
            });
          }
        } else {
          entry.autodrain();
        }
      } catch (err) {
        console.log(err);
      }
    });
}
