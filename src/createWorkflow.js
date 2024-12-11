const fs = require("fs");
const path = require("path");
const { ensureDirectoryExists } = require("./workflowHelpers");

function createWorkflow(projectDir, options) {
  if (!options.path || options.path === "") {
    console.log("Swagger URL (--path) cannot be empty.");
    return;
  }

  const workflowDir = path.join(projectDir, ".github", "workflows");
  const workflowFile = path.join(workflowDir, "api-client-bot.yml");

  const token = "${{ secrets.GITHUB_TOKEN }}";

  ensureDirectoryExists(workflowDir);

  let onEvents = [];

  if (options.onPush) {
    onEvents.push("push");
  }
  if (options.onPullRequest) {
    onEvents.push("pull_request");
  }

  if (onEvents.length === 0) {
    console.log(
      "You must select at least one event type: --on-push or --on-pull-request"
    );
    return;
  }

  const workflowContent = `
name: api-client-bot

on:
  ${onEvents
    .map(
      (event) => `  ${event}:
    branches:
      - ${options.branch || "main"}`
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

      - name: Copy http-client
        run: |
          cp ./services/api/http-client.ts ./services/api/http-client.ts.bak

      - name: Generate Swagger API Code
        run: |
          npx swagger-typescript-api -p ${
            options.path
          } -o ./services/api --axios --modular --module-name-first-tag

      - name: Paste old http-client
        run: |
          cp ./services/api/http-client.ts.bak ./services/api/http-client.ts
          rm -rf ./services/api/http-client.ts.bak

      - name: Stage all changes
        run: |
          git add .
          git status

      - name: Check for changes in services/api and create PR
        id: check_changes
        run: |
          echo "Checking for changes in ./services/api"
          
          git fetch origin ${options.branch || "main"}
          git checkout ${options.branch || "main"}
      
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
            git commit -m "feat(swagger): update API code from Swagger"
            git push origin $NEW_BRANCH
            
            PR_TITLE="Update API from Swagger"
            PR_BODY="Automated update of API client code from Swagger definition."
            gh pr create --title "$PR_TITLE" --body "$PR_BODY" --base ${
              options.branch || "main"
            } --head $NEW_BRANCH
          fi
        env:
          GITHUB_TOKEN: ${token}
`;

  fs.writeFileSync(workflowFile, workflowContent, "utf8");
  console.log("GitHub Action workflow created.");
}

module.exports = createWorkflow;
