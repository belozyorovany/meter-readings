let options = {};

options.port = 3000;
options.serverURL = `http://localhost:${options.port}/api`;

exports.connection = require('../libs/connection');
exports.expect = require('chai').expect;

exports.options = options;
