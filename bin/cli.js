#!/usr/bin/env node
const { Command } = require("commander");
const createWorkflow = require("../src/createWorkflow");
const removeWorkflow = require("../src/removeWorkflow");

const program = new Command();

program
  .command("create")
  .description("Add Api Client Generator bot to the project")
  .option(
    "--action <actions>",
    "Comma-separated list of actions to trigger the workflow (e.g., push,pull-request)",
    (value) => value.split(",")
  )
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

    if (!options.onPush && !options.onPullRequest && !options.action) {
      options.onPullRequest = true;
    }

    if (options.action) {
      options.onPush = options.action.includes("push");
      options.onPullRequest = options.action.includes("pull-request");
    }

    const projectDir = process.cwd();
    createWorkflow(projectDir, options);
  });

program
  .command("set-actions <action>")
  .description("Set the actions (push, pull-request) for the workflow")
  .action((action) => {
    const actions = action.split(",");

    const validActions = ["push", "pull-request"];
    const setActions = {
      setAction: true,
      action: [],
    };

    actions.forEach((a) => {
      if (validActions.includes(a.trim())) {
        setActions.action.push(a.trim());
      } else {
        console.error(
          `Invalid action: ${a.trim()}. Valid actions are 'push' and 'pull-request'.`
        );
        process.exit(1);
      }
    });

    if (setActions.action.length === 0) {
      setActions.action.push("pull-request");
    }

    const projectDir = process.cwd();
    createWorkflow(projectDir, setActions);
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
