const AWS = require('aws-sdk');
const fs = require("fs");
const mime = require('mime-types');
const path = require("path");
const semver = require('semver');
const slash = require('slash');

const config = require('../config.js');

// Configuration for DigtialOcean Spaces
const doSpaces = new AWS.S3({
  endpoint: new AWS.Endpoint(config.doSpaces.endpoint),
  accessKeyId: config.doSpaces.accessKeyId,
  secretAccessKey: config.doSpaces.secretAccessKey,
});

// Helper function to upload file to DigitalOcean Spaces,
// Returns a promise.
const uploadFile = (options = {}) => {
  var params = {
    Body: options.body,
    Key: options.key,
    Bucket: options.bucket || config.doSpaces.defaultBucket,
    ACL: options.acl || config.doSpaces.defaultACL,
    ContentType: mime.lookup(options.key),
  }

  return doSpaces.putObject(params).promise();
}

// Helper function to get all files in the /dist directory
const getAllFiles = (dirPath, arrayOfFiles) => {
  files = fs.readdirSync(dirPath)
 
  arrayOfFiles = arrayOfFiles || []
 
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join(dirPath, file))
    }
  })
  // map slash(file) for windows compatability
  return arrayOfFiles.map( file => slash(file) );
}

// Helper function to get the version of our package
const majorMinorVersion = () => `${semver.major(process.env.npm_package_version)}.${semver.minor(process.env.npm_package_version)}.x`;

// Begin the madness.
(async () => {
  let uploadPromises = [];

  getAllFiles('dist').forEach((filePath) => {
    let key = process.env.npm_package_name + '/v' + majorMinorVersion() + '/' + filePath.replace('dist/', '');

    let uploadPromise = uploadFile({
      body: fs.createReadStream(filePath),
      key: key
    });

    uploadPromises.push(uploadPromise);
  });

  Promise.all(uploadPromises).then((values) => {
    console.log(values);
  });
})();