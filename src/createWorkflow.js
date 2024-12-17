const fs = require("fs");
const path = require("path");
const { ensureDirectoryExists } = require("./workflowHelpers");

function createWorkflow(projectDir, options) {
  const configFile = path.join(projectDir, "api-client-bot-configs.json");

  if (!fs.existsSync(configFile)) {
    fs.writeFileSync(
      configFile,
      JSON.stringify(
        {
          path: "",
          branch: "main",
          onPush: false,
          onPullRequest: true,
        },
        null,
        2
      ),
      "utf8"
    );
  }

  const config = JSON.parse(fs.readFileSync(configFile, "utf8"));

  if (options.setPath) {
    console.log(`Setting new Swagger path to: ${options.setPath}`);
    config.path = options.setPath;
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2), "utf8");
    console.log("Swagger path updated.");
  }

  if (options.setBranch) {
    console.log(`Setting new branch to: ${options.setBranch}`);
    config.branch = options.setBranch;
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2), "utf8");
    console.log("Target branch updated.");
  }

  if (options.setAction) {
    console.log(`Setting new actions to: ${options.action}`);
    config.onPush = options.action.includes("push");
    config.onPullRequest = options.action.includes("pull-request");

    fs.writeFileSync(configFile, JSON.stringify(config, null, 2), "utf8");
    console.log("Actions updated.");
  }

  const finalConfig = {
    path: config.path || options.path,
    branch: options.branch || config.branch || "main",
    onPush: options.onPush !== undefined ? options.onPush : config.onPush,
    onPullRequest:
      options.onPullRequest !== undefined
        ? options.onPullRequest
        : config.onPullRequest,
  };

  createApiClientBotWorkflow(projectDir, finalConfig);
}

function createApiClientBotWorkflow(
  projectDir,
  { path: swaggerPath, branch, onPush, onPullRequest }
) {
  const workflowDir = path.join(projectDir, ".github", "workflows");
  const workflowFile = path.join(workflowDir, "api-client-bot.yml");

  const token = "${{ secrets.GITHUB_TOKEN }}";

  ensureDirectoryExists(workflowDir);

  let onEvents = [];

  if (onPush) {
    onEvents.push("push");
  }
  if (onPullRequest) {
    onEvents.push("pull_request");
  }

  if (onEvents.length === 0) {
    onEvents.push("pull_request");
  }

  const workflowContent = `
name: api-client-bot

on:
  ${onEvents
    .map(
      (event) => `${event}:
    branches:
      - ${branch}`
    )
    .join("\n  ")}

jobs:
  update-swagger-api:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '23'

      - name: Install dependencies
        run: |
          yarn install

      - name: Check if http-client exists
        id: check_http_client
        run: |
          if [ ! -f ./services/api/http-client.ts ]; then
            echo "http-client.ts does not exist. Creating new file."
            echo "// Generated file" > ./services/api/http-client.ts
          else
            echo "http-client.ts exists. Creating backup."
            cp ./services/api/http-client.ts ./services/api/http-client.ts.bak
          fi

      - name: Generate Swagger API Code
        run: |
          npx swagger-typescript-api -p ${swaggerPath} -o ./services/api --axios --modular --module-name-first-tag

      - name: Paste old http-client if exists
        run: |
          if [ -f ./services/api/http-client.ts.bak ]; then
            echo "Restoring old http-client.ts file."
            cp ./services/api/http-client.ts.bak ./services/api/http-client.ts
            rm -rf ./services/api/http-client.ts.bak
          else
            echo "No backup found. Using the newly generated http-client.ts file."
          fi

      - name: Stage all changes
        run: |
          git add .
          git status

      - name: Check for changes in services/api and create PR
        id: check_changes
        run: |
          echo "Checking for changes in ./services/api"
          
          git fetch origin ${branch}
          git checkout ${branch}
      
          git diff --cached --quiet ./services/api || echo "Changes detected in ./services/api"

          if git diff --cached --quiet ./services/api; then
            echo "No changes detected in ./services/api"
            echo "changes=no" >> $GITHUB_ENV
          else
            echo "Changes detected, creating new branch and PR"
            NEW_BRANCH="update-swagger-api-$(date +%Y%m%d%H%M%S)"
            git config --global user.name 'GitHub Actions'
            git config --global user.email 'actions@github.com'
            git checkout -b $NEW_BRANCH
            git add ./services/api
            git commit -m "feat(swagger): update API code from Swagger" --no-verify
            git push origin $NEW_BRANCH
            
            PR_TITLE="Update API from Swagger"
            PR_BODY="Automated update of API client code from Swagger definition."
            gh pr create --title "$PR_TITLE" --body "$PR_BODY" --base ${branch} --head $NEW_BRANCH
          fi
        env:
          GITHUB_TOKEN: ${token}
`;

  fs.writeFileSync(workflowFile, workflowContent, "utf8");
  console.log("Api-Client bot created/updated.");
}

module.exports = createWorkflow;
