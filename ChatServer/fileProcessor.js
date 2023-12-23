const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");

function processFile(filePath) {
  return new Promise((resolve, reject) => {
    const ext = path.extname(filePath).toLowerCase();
    const tempFilePath = filePath + "_temp" + ext;

    if ([".jpg", ".jpeg", ".png", ".gif", ".tiff", ".bmp"].includes(ext)) {
      // Image processing
      sharp(filePath)
        .withMetadata()
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
        .save(tempFilePath)
        .on("end", () => {
          fs.rename(tempFilePath, filePath, (err) => {
            if (err) reject(err);
            resolve();
          });
        })
        .on("error", (err) => {
          fs.unlink(tempFilePath, () => reject(err));
        });
    } else {
      resolve();
    }
  });
}

module.exports = processFile;
