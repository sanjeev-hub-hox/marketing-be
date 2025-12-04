const fs = require('fs');
require('dotenv').config();

const getWiteFilePath = () => {
  switch (process.env.NODE_ENV) {
    case 'development':
      return '.env.dev.enc';
    case 'staging':
      return '.env.stg.enc';
    case 'production':
      return '.env.prod.enc';
    case 'preproduction':
      return '.env.preprod.enc';
  }
};
const readFilePath = '.env.enc';
const writeFilePath = getWiteFilePath();

fs.writeFile(writeFilePath, '', (err) => {
  if (err) {
    console.error('Error creating file:', err);
    return;
  }
});
fs.copyFileSync(readFilePath, writeFilePath);
fs.unlink(readFilePath, (err) => {
  if (err) {
    console.error('Error deleting file:', err);
    return;
  }
});
