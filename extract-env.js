const secureEnv = require('secure-env');
const fs = require('fs');
require('dotenv').config();

const getEnvVars = () => {
  const env = process.env.NODE_ENV || 'development';
  console.log("env ---> ", env);
  switch (env) {
    case 'development':
      return secureEnv({
        secret: process.env.SECRET,
        path: '.env.dev.enc',
      });
    case 'staging':
      return secureEnv({
        secret: process.env.SECRET,
        path: '.env.stg.enc',
      });
    case 'production':
      return secureEnv({
        secret: process.env.SECRET,
        path: '.env.prod.enc',
      });
    case 'preproduction':
      return secureEnv({
        secret: process.env.SECRET,
        path: '.env.preprod.enc',
      });
  }
};

const envVars = getEnvVars();
console.log("envVars ----> ", envVars);
// Function to format object keys and values as environment variables
function formatEnv(envVars) {
  return Object.entries(envVars)
    .map(([key, value]) => `${key.toUpperCase()}=${value}`)
    .join('\n');
}

// Function to write the env data into .env
function writeToEnvFile(envData) {
  fs.writeFileSync('.env', envData);
}

function extract() {
  const envData = formatEnv(envVars);
  writeToEnvFile(envData);
  console.log('.env file created successfully.');
}

extract();
