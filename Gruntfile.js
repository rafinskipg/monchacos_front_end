// Generated on 2013-10-18 using generator-angular 0.4.0
'use strict';
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({
    port: LIVERELOAD_PORT
});
var mountFolder = function(connect, dir) {
    return connect.static(require('path').resolve(dir));
};
var proxySnippet = require('grunt-connect-proxy/lib/utils').proxyRequest;
// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);


    grunt.initConfig({

        watch: {
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    'app/{,**/}**.html',
                    'app/{,**/}**.js',
                    'app/{,**/}**.css',
                    '!app/js/canvas/**/**.js'
                ]
            },

            canvas: {
              files: ['app/js/canvas/**/*.js'],
              tasks: ['browserify']
            }
        },
        browserify: {
          dist: {
            files: {
              'app/js/canvas.js': ['app/js/canvas/**/*.js'],
            }
          }
        },
        connect: {
             options: {
                port: 9000,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: '0.0.0.0'
            },
            //This is used for the express server
            proxies: [{
                context: '/monchacos/rest',
                host: 'http://rvpg.me',

            },{
                context: '/monchacos/rest',
                host: 'rvpg.me',

                    port: 80,
                    https: false,
                    changeOrigin: true

            }],
            livereload: {
                options: {
                    middleware: function (connect, options) {
                        if (!Array.isArray(options.base)) {
                            options.base = [options.base];
                        }

                        // Setup the proxy
                        var middlewares = [require('grunt-connect-proxy/lib/utils').proxyRequest];

                        // Serve static files.
                        options.base.forEach(function(base) {
                            middlewares.push(connect.static(base));
                        });
                        middlewares.push(mountFolder(connect, 'app'))
                        // Make directory browse-able.
                        var directory = options.directory || options.base[options.base.length - 1];
                        middlewares.push(connect.directory(directory));

                        return middlewares;
                    }
                }
            },
            
        },
        open: {
            server: {
                url: 'http://localhost:<%= connect.options.port %>'
            }
        }
    });


    grunt.registerTask('server', [
        'configureProxies',
        'browserify',
        'connect:livereload',
        'open',
        'watch'
    ]);

    grunt.registerTask('default', [
        'server'
    ]);
};
