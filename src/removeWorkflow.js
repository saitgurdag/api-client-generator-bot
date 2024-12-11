const fs = require("fs");
const path = require("path");

function removeWorkflow(projectDir) {
  const workflowFile = path.join(
    projectDir,
    ".github",
    "workflows",
    "api-client-bot.yml"
  );
  if (fs.existsSync(workflowFile)) {
    fs.unlinkSync(workflowFile);
    console.log("Api Client Generator Bot deleted.");
  } else {
    console.log("No workflow found to delete.");
  }
}

module.exports = removeWorkflow;
