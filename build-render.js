const fs = require("fs");
const path = require("path");

const root = __dirname;
const outputDir = path.join(root, "render-public");
const files = ["index.html", "styles.css", "app.js"];

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(outputDir, file));
}

console.log(`Render static build ready: ${outputDir}`);
