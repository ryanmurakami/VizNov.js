module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> v.<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'scripts/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>_<%= pkg.version %>.min.js'
      }
    },
    copy: {
      toBreathe: {
        files: [
          {
            expand: true,
            cwd: 'dist/',
            src: ['<%= pkg.name %>_<%= pkg.version %>.min.js'],
            dest: '../Breathe/Game/js/'
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['build', 'copy2breathe']);
  grunt.registerTask('build', ['uglify:build']);
  grunt.registerTask('copy2breathe', ['copy:toBreathe']);

};