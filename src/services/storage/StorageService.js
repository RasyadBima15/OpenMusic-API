const fs = require('fs');
const path = require('path');
const process = require('process');
class StorageService {
    constructor() {
      this._baseUploadFolder = path.join(process.cwd(), 'src', 'api', 'uploads', 'file', 'images');
   
      if (!fs.existsSync(this._baseUploadFolder)) {
        fs.mkdirSync(this._baseUploadFolder, { recursive: true });
      }
    }
   
    writeFile(file, meta) {
      const filename = +new Date() + meta.filename;
      const outputPath = path.join(this._baseUploadFolder, filename);
      const fileStream = fs.createWriteStream(outputPath);
   
      return new Promise((resolve, reject) => {
        fileStream.on('error', (error) => reject(error));
        file.pipe(fileStream);
        file.on('end', () => resolve(filename));
      });
    }
  }
   
  module.exports = StorageService;