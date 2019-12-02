#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const stream = require("stream");

const unzipper = require("unzipper");
const commander = require("commander");
const ffmpeg = require("ffmpeg-static");
// console.log(ffmpeg.path);
const NormalizeVolume = require("normalize-volume");

let program = new commander.Command();
// let program = require("commander");
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
      console.log("extract");
      const src = path.resolve(args.source);
      const destDefault = path.resolve(__dirname, path.parse(args.source).name);
      //If no destination provided, set it to name of file, without extension
      const dest = !!args.destination
        ? path.resolve(args.destination)
        : destDefault;
      extract(args.source, dest);

      if (options.normalize) {
        //
      }
    } else {
      logger.warn("Please specify a source");
    }
  });

prog.parse(process.argv);

//==================//
//Commander version
//==================//
// program
//   .option("-n, --normaliz", "output extra debugging")

// program.parse(process.argv);

// if (program.normalize) console.log(program.opts());

// .action((args, options) => {
// console.log(args)
// console.log(options)
// })
// .arguments("<source> [destination]")
// .action((source, destination = path.parse(source).name, cmdObj) => {
//   // console.log({program});
//   console.log("OPTIONS: ", program.opts())
//   // console.log(source, destination);
//   src = source;
//   dest = destination;
// })
// .parse(process.argv);

// console.log("OPTIONS: ", program.options.n)
// console.log({program})
// if(typeof src !== 'undefined') {
//   src = path.resolve(src);
//   console.log("SOURCE     : ", src)
//   dest = path.resolve(dest)
//   console.log("DESTINATION: ", dest);
//   if(program.normalize) {
//     console.log("NORMALIZE!!!!!!!!!!!!!!!!!!!!!")
//   } else {
//     // extract(src, dest);
//     console.log("EXTRACT!!!!")
//   }
// }

// console.log(program.normalize == true)

//  program = require("commander");

// program
//   .version("0.1.0")
//   .arguments("<cmd> [env]")
//   .action(function(cmd, env) {
//     cmdValue = cmd;
//     envValue = env;
//   });

// program.parse(process.argv);

// if (typeof cmdValue === "undefined") {
//   console.error("no command given!");
//   process.exit(1);
// }
// console.log("command:", cmdValue);
// console.log("environment:", envValue || "no environment given");

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
          console.log(fullFilePath);

          console.log(outputDir);
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
          }
          // entry.pipe(fs.createWriteStream(outputDir));
          const content = await entry.buffer();
          // await fs.writeFile(outputDir, content);
          fs.writeFileSync(fullFilePath, content);
          // if (normalize) {
          //   let options = {
          //     normalize: true,
          //     waveform: { width: 1400, height: 225 },
          //     ffmpeg_bin: ffmpeg
          //     // convert_bin: "convert.exe"
          //   };

          //   NormalizeVolume(fullFilePath, fullFilePath + "n", options)
          //     .then(result => {
          //       console.log(result);
          //     })
          //     .catch(err => {
          //       console.log(err);
          //     });
          // }
        } else {
          entry.autodrain();
        }
      } catch (err) {
        console.log(err);
      }
    });
}
