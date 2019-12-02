#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const stream = require("stream");

const unzipper = require("unzipper");
const commander = require("commander");
let program = new commander.Command();
program.version("0.0.1");
console.log(__dirname);
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
// const prog = require('caporal');
// prog
//   .version('1.0.0')
//   // you specify arguments using .argument()
//   // 'app' is required, 'env' is optional
//   .command('deploy', 'Deploy an application')
//   .argument('<app>', 'App to deploy', /^myapp|their-app$/)
//   .argument('[env]', 'Environment to deploy on', /^dev|staging|production$/, 'local')
//   // you specify options using .option()
//   // if --tail is passed, its value is required
//   .option('--tail <lines>', 'Tail <lines> lines of logs after deploy', prog.INT)
//   .action(function (args, options, logger) {
  //     // args and options are objects
  //     // args = {"app": "myapp", "env": "production"}
  //     // options = {"tail" : 100}
  //     console.log(args)
  //     console.log(options)
  //     logger.info(options)
  //     logger.warn(options)
  //     logger.error(options)
  //     logger.debug(options)
  //   });
  
  // prog.parse(process.argv);
  
  
  
//==================//
//Commander version
//==================//
program
.arguments("<source> [destination]")
.option("-n, --normalize", "normalize the files")
.action((source, destination, cmdObj) => {
  // console.log({program});
  console.log({cmdObj})
  console.log(source, destination);
  src = source;
  dest = destination;
})
.parse(process.argv);
console.log({program})
if(typeof src !== 'undefined') {
  src = path.resolve(src);
  dest = path.resolve(dest)
  console.log("HAS SOURCE", src)
  console.log("HAS DESTINATION", dest)
  extract(src, dest);
}

// console.log({program})

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
function extract(source, destination) {
  

// const pptPath = path.resolve(__dirname, "ch07.3.pptx");
const pptPath = source;
const root = path.resolve(__dirname);
// const outputDir = path.resolve(path.join(__dirname, "/output"));
const outputDir = destination;


fs.createReadStream(pptPath)
  .pipe(unzipper.Parse())
  .on('entry', async (entry) => {
    try {

      const fileName = entry.path;
      const type = entry.type; // 'Directory' or 'File'
      const size = entry.vars.uncompressedSize; // There is also compressedSize;
      if (path.extname(fileName) === ".wav") {
        // console.log(type, size, fileName)
        const fullFilePath = path.join(outputDir, path.parse(fileName).base); 
        console.log(fullFilePath)
        
        console.log(outputDir)
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir)
        }
        // entry.pipe(fs.createWriteStream(outputDir));
        const content = await entry.buffer();
        // await fs.writeFile(outputDir, content);
        fs.writeFileSync(fullFilePath, content);
      } else {
        entry.autodrain();
      }
    }
    catch(err) {
      console.log(err)
    }
  });
}