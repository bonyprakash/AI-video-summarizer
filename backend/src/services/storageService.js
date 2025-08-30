const fs = require('fs');

function saveFile(tempPath, finalPath) {
  fs.renameSync(tempPath, finalPath);
  return finalPath;
}

module.exports = { saveFile };
