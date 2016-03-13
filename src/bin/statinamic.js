"use strict"

require("babel-core/register")

const program = require("commander")
const pkg = require("../../package.json")

const runner = require("./runner.js")

program.version(pkg.version)

program
  .command("setup", "setup a project")

program
  .command("start [script] [options...]")
  .description("start your project (server / development mode)")
  .option("-c, --config <file>", "Configuration file")
  .action(runner([ "--dev", "--server", "--open" ]))

program
  .command("build [script] [options...]")
  .description("build your project (static / production mode)")
  .option("-c, --config <file>", "Configuration file")
  .action(runner([ "--production", "--static" ]))

program.parse(process.argv)
