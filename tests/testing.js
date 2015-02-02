var path = require("path");
var fs = require("fs");
var promises = require("../lib/promises");
var _ = require("underscore");

exports.test = test;
exports.testPath = testPath;
exports.testData = testData;
exports.createFakeDocxFile = createFakeDocxFile;


function test(name, func) {
    it(name, function(done) {
        var result = func();
        promises.when(result).then(function() {
            done();
        }).done();
    });
}

function testPath(filename) {
    return path.join(__dirname, "test-data", filename);
}

function testData(testDataPath) {
    var fullPath = testPath(testDataPath);
    return promises.nfcall(fs.readFile, fullPath, "utf-8");
}

function createFakeDocxFile(files) {
    function read(path, encoding) {
        return promises.when(files[path], function(buffer) {
            if (_.isString(buffer)) {
                buffer = new Buffer(buffer);
            }

            if (!Buffer.isBuffer(buffer)) {
                return promises.reject(new Error("file was not a buffer"));
            } else if (encoding) {
                return promises.when(buffer.toString(encoding));
            } else {
                return promises.when(buffer);
            }
        });
    }

    function exists(path) {
        return !!files[path];
    }

    return {
        read: read,
        exists: exists
    };
}
