module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    var banner_tmpl = grunt.file.read('./banner.part');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        babel: {
            options: {
                sourceMap: false,
                presets: ['es2015']
            },
            dist: {
                files: {
                    'dist/version.js': 'src/version.js',
                    'dist/main.js': 'src/main.js',
                    'dist/core.js': 'src/core.js',
                    'dist/moenotice.js': 'src/moenotice.js',
                    'dist/util.js': 'src/util.js',
                    'dist/ui.js': 'src/ui.js',
                    'dist/i18n.js': 'src/i18n.js'
                }
            }
        },
        browserify: {
            options: {
                banner: banner_tmpl
            },
            dist: {
                src: "dist/main.js",
                dest: "./Wikiplus.js"
            }
        },
        uglify: {
            options: {
                banner: banner_tmpl
            },
            dist: {
                files: {
                    './Wikiplus.min.js': './Wikiplus.js'
                }
            }
        },
        watch: {
            dist: {
                files: ['./src/*.js'],
                tasks: ['babel', 'browserify', 'uglify'],
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.registerTask('default', ['watch']);
    grunt.registerTask('build', ['babel', 'browserify', 'uglify']);
}