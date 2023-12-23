const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

function processFile(filePath) {
  return new Promise((resolve, reject) => {
    const ext = path.extname(filePath).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".gif", ".tiff", ".bmp"].includes(ext)) {
      sharp(filePath)
        .withMetadata() // Keep this method without options to retain the orientation
        .toBuffer((err, buffer, info) => {
          if (err) reject(err);
          sharp(buffer).toFile(filePath, (err) => {
            if (err) reject(err);
            resolve();
          });
        });
    } else if (
      [".mp4", ".mkv", ".avi", ".mov", ".wmv", ".flv", ".webm"].includes(ext)
    ) {
      ffmpeg(filePath)
        .outputOptions("-map_metadata -1")
        .saveToFile(filePath)
        .on("end", () => resolve())
        .on("error", (err) => reject(err));
    } else {
      resolve();
    }
  });
}

module.exports = processFile;
