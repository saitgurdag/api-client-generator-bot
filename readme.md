# API Client Generator Bot

Generate API Clients with Github Action

## Description

api-client-generator-bot is an npm package that automates the creation of an API client generator bot using GitHub Actions. This bot generates API client code from a Swagger definition file and integrates it into your GitHub repository's workflow.

## Installation

To install the package in your project, run the following command:

```bash
npm install --save-dev api-client-generator-bot
```

or

```bash
yarn add --dev api-client-generator-bot
```

## CLI Commands

This package provides the following CLI commands:

### create

Adds the API Client Generator bot to the project and sets up the GitHub Actions workflow.

##### Options:

- --action <actions>: Comma-separated list of actions to trigger the workflow (e.g., push,pull-request).
- --on-push: Create the workflow to run on push events.
- --on-pull-request: Create the workflow to run on pull request events.
- --branch <branch>: Set the branch name for the pull request (default: main).
- --path <swagger-url>: The path to the Swagger JSON file (cannot be empty).
  Example usage:

```bash
npx api-client-generator-bot create --on-push --branch main --path https://example.com/swagger.json
```

### set-actions <action>

Sets the actions (push, pull-request) for the workflow.

Example usage:

```bash
npx api-client-generator-bot set-actions push,pull-request
```

### remove

Removes the API Client Generator bot and deletes the workflow from the project.

Example usage:

```bash
npx api-client-generator-bot remove
```

### set-branch <branch>

Sets the target branch for the workflow.

Example usage:

```bash
npx api-client-generator-bot set-branch dev
```

### set-path <swagger-url>

Sets the Swagger URL path for the workflow.

Example usage:

```bash
npx api-client-generator-bot set-path https://example.com/swagger.json
```

## Installation as a Global CLI Tool

To install the tool globally for use across multiple projects, run:

```bash
npm install -g api-client-generator-bot
```

or

```bash
yarn global add api-client-generator-bot
```

You can then run the CLI commands directly from the terminal:

```bash
api-client-generator-bot create --on-push --branch main --path https://example.com/swagger.json
```

### How It Works

**Create Workflow:** The create command generates a .github/workflows/api-client-bot.yml file, which configures the bot to run on GitHub events such as push and pull requests. The bot installs dependencies and generates the API client code based on the provided Swagger URL.

**Update Swagger Path and Target Branch:** Modify the Swagger path and target branch using the set-path and set-branch commands.

**Remove Workflow:** The remove command removes the generated workflow and any related files from the project.

## Example Project Structure

Once the bot is added, your GitHub repository will include a workflow file like the following:

```markdown
.github/
└── workflows/
└── api-client-bot.yml
```

The workflow is triggered based on the events (push, pull-request) you configure, automatically updating your API client code based on the Swagger definition.

## Acknowledgments

A big thank you to the [swagger-typescript-api](https://www.npmjs.com/package/swagger-typescript-api) package for providing a seamless solution to generate TypeScript-based API clients from Swagger definitions. This package is an integral part of the API Client Generator bot workflow.

## License

MIT License. See the LICENSE file for more information.

## Contributing

Feel free to fork the repository, open issues, and submit pull requests if you'd like to contribute!
