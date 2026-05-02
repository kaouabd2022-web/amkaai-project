const fs = require("fs");
const path = require("path");

function walk(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
      let content = fs.readFileSync(fullPath, "utf8");

      if (content.includes("auth()")) {
        content = content.replace(/auth\(\)/g, "await auth()");
        fs.writeFileSync(fullPath, content);
        console.log("Fixed:", fullPath);
      }
    }
  });
}

walk("./app");
console.log("Done");