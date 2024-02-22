const fs = require('fs/promises');
const path = require('path');

const directoryPath = path.join(__dirname, '/path/to/directory');
console.log(__dirname);

fs.mkdir(directoryPath, { recursive: true })
  .then(() => {
    console.log('Directory created successfully');
  })
  .catch((error) => {
    console.error('Error creating directory:', error);
  });
fs.stat(directoryPath).then((stats) => {
  console.log(stats);
});
