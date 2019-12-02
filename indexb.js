#!/usr/bin/env node

const program = require("commander");

//==================//
//Commander version
//==================//
program.option("-n, --normalize-audio", "output extra debugging");

program.parse(process.argv);

if (program.normalize) console.log(program.opts());

console.log(program.normalizeAudio)