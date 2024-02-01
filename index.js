const fs = require("fs");
const { nanoid } = require("nanoid");
const path = require("path");

const source = Object.freeze({
  id: "",
  slug: "",
  content: "",
  name: "",
  created_at: "",
  updated_at: "",
  url: ""
});

const result = {
  files: [],
  rapid_standard: [],
  rapid_core: []
};

function traverseFileTree(dir) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      traverseFileTree(filePath);
    } else {
      if (path.extname(file) === ".md") {
        result.files.push(filePath);
      }
    }
  });
}

traverseFileTree("/home/st/src/Rapid-Docs/docs/Rapid");

/**
 *
 * @param {string[]} strArr
 */
function getFirstHashTag(strArr) {
  for (const a of strArr) {
    if (a?.trim().startsWith("#")) {
      return a.replace("#", "")?.trim();
    }
  }
}

const domain = "https://rapiddocs.z8.web.core.windows.net/";

function parseUrlFromFilePath(str) {
  let returnStr = "";
  const newStr = str.split("/docs/")[1]
  const strParts = newStr.split("/")

  for (let i = 0; i < strParts.length; i++) {
    strParts[i] = strParts[i]?.replace(/^\d.*-/g, "")
  }

  if (strParts[strParts.length - 1].endsWith(".md")) {
    strParts[strParts.length - 1] = strParts[strParts.length - 1].substring(0, strParts[strParts.length - 1].length - 3)
  }

  if (strParts[strParts.length - 1] === strParts[strParts.length - 2]) {
    strParts.pop()
  }

  returnStr = strParts.join('/')
  return domain + "docs/" + returnStr
}

for (let i = 0; i < result.files.length; i++) {
  const file = result.files[i];
  const fileName = file.split("/")[file.split("/").length - 1]?.replace(".md", "");
  const fileContents = fs.readFileSync(file).toString();

  const indexObj = structuredClone(source);

  indexObj.content = fileContents;
  indexObj.created_at = (() => {
    const { birthtime } = fs.statSync(file);
    return birthtime;
  })();
  indexObj.id = nanoid();
  indexObj.name = getFirstHashTag(fileContents.split("\n"));
  indexObj.slug = fileName;
  indexObj.updated_at = new Date().toISOString();
  indexObj.url = parseUrlFromFilePath(file);
  if (file.includes("2-Rapid Standard")) {
    result.rapid_standard.push(indexObj);
  }
  if (file.includes("1-Getting Started") || file.includes("3-User Manual") || file.includes("4-Keyper Manual") || file.includes("5-Developer Manual")) {
    result.rapid_core.push(indexObj);
  }
}

fs.writeFileSync("./output.json", JSON.stringify(result, null, 2));