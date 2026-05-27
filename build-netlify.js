const fs = require("fs");
const path = require("path");

const root = __dirname;
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8").replace(/<\/style/gi, "<\\/style");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8").replace(/<\/script/gi, "<\\/script");

const bundled = html
  .replace('<link rel="stylesheet" href="styles.css">', () => `<style>\n${css}\n</style>`)
  .replace('<script src="app.js"></script>', () => `<script>\n${js}\n</script>`);

const deployDir = path.join(root, "netlify-pronto");
fs.mkdirSync(deployDir, { recursive: true });
fs.writeFileSync(path.join(deployDir, "index.html"), bundled, "utf8");

console.log(path.join(deployDir, "index.html"));
