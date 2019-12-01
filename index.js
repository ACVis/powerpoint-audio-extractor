#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const stream = require("stream");

const unzipper = require("unzipper");
console.log(__dirname);

//list root directory
fs.readdir(__dirname, (err, files) => {
    files.forEach( (file) => {
      
        // console.log(file);
    })
})

// const 
const pptPath = path.resolve(__dirname, "ch07.3.pptx");
const root = path.resolve(__dirname);
const outputDir = path.resolve(path.join(__dirname, "/output"));

// fs.createReadStream(pptPath).pipe(
//   unzipper.Extract({ path: root })
// );

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

// fs.createReadStream(pptPath)
//   .pipe(unzipper.Parse())
//   .pipe(stream.Transform({
//     objectMode: true,
//     transform: function (entry, e, cb) {
//       const fileName = entry.path;
//       const type = entry.type; // 'Directory' or 'File'
//       const size = entry.vars.uncompressedSize; // There is also compressedSize;
//       if (path.extname(fileName) === ".wav") {
//         entry.pipe(fs.createWriteStream(outputDir))
//           .on('finish', cb);
//       } else {
//         entry.autodrain();
//         cb();
//       }
//     }
//   }
//   ));

console.log(new Date().toLocaleString());