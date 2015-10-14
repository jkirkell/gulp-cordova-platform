'use strict';

/**
 * Creates a new cordova project in the current directory.
 *
 * @author Jeff Kirkell      <jeff.kirkell@gmail.com>
 * @since  14 October 2015
 */

// module dependencies
var path = require('path'),
    through = require('through2'),
    gutil = require('gulp-util'),
    cordova = require('cordova-lib').cordova.raw,
    Q = require('q'),
    _ = require('lodash');

// export the module
module.exports = function(platforms) {

    var platformList;

    if(Array.isArray(platforms) || _.isPlainObject(platforms)) {
        platformList = platforms;
    }
    else {
        platformList = [platforms];
    }

    return through.obj(function(file, enc, cb) {
        // Change the working directory
        process.env.PWD = file.path;

        // Pipe the file to the next step
        this.push(file);

        cb();
    }, function(cb) {
        var promises = _.map(platformList, function(platform, key) {
            if(_.isPlainObject(platformList)) {
                // If the plugin list is an object, we should switch the plugin and key
                var temp = key;

                key = platform;
                platform = temp;
            }

            // Fire the add method
            return add(platform);
        });

        Q.all(promises)
            .then(function() {
                // Call the callback if all the plugins are added correctly
                cb();
            })
            .catch(function(err) {
                // Return an error if something happened
                cb(new gutil.PluginError('gulp-cordova-platform', err.message));
            });
    });
};

/**
 * Returns a promise that will add the plugin to the current working
 * directory cordova project.
 *
 * @param {String} plugin   The name of the plugin that should be added.
 * @param {Object} opts     The options object.
 */
function add(platform, opts) {
    return Q.fcall(function() {

        // Print which platform will be added
        gutil.log('\tadd ' + platform);

        // Add the platform without options
        return cordova.platform('add', platform);
    });
}
