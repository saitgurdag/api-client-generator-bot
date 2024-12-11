#!/usr/bin/env node
const { Command } = require("commander");
const createWorkflow = require("../src/createWorkflow");
const removeWorkflow = require("../src/removeWorkflow");

const program = new Command();

program
  .command("create")
  .description("Add Api Client Generator bot to the project")
  .option("--on-push", "Create to run on push event")
  .option("--on-pull-request", "Create to run on pull request event")
  .option("--branch <branch>", "Branch name to open PR (default: main)", "main")
  .option(
    "--path <swagger-url>",
    "The path of the Swagger JSON file cannot be empty",
    ""
  )
  .action((options) => {
    if (!options.path) {
      console.error("You must specify the Swagger URL (--path).");
      process.exit(1);
    }

    if (!options.onPush && !options.onPullRequest) {
      options.onPullRequest = true;
    }

    const projectDir = process.cwd();
    createWorkflow(projectDir, options);
  });

program
  .command("remove")
  .description("Remove the api client generator bot from the project.")
  .action(() => {
    const projectDir = process.cwd();
    removeWorkflow(projectDir);
  });

program
  .command("set-branch <branch>")
  .description("Set the target branch for the workflow")
  .action((branch) => {
    const projectDir = process.cwd();
    createWorkflow(projectDir, { setBranch: branch });
  });

program
  .command("set-path <swagger-url>")
  .description("Set the Swagger URL path for the workflow")
  .action((swaggerUrl) => {
    const projectDir = process.cwd();
    createWorkflow(projectDir, { setPath: swaggerUrl });
  });

program.parse(process.argv);
