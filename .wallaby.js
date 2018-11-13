'use strict';

const {files} = require('./package.json');

module.exports = () => {
  return {
    files,
    tests: ['test/**/*.spec.js'],
    env: {
      type: 'node',
      runner: `${process.env.HOME}/.nvm/versions/node/v8.12.0/bin/node`
    },
    testFramework: 'mocha'
  };
};
