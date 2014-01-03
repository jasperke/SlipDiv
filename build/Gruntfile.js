//'use strict';

module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		LIB_PATH: './bower_components/',
		banner: [
				 '/*',
				 '* Project: <%= pkg.name %>',
				 '* Version: <%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd HH:MM") %>)',
				 '* Development By: <%= pkg.author %>',
				 '* Copyright(c): <%= grunt.template.today("yyyy") %>',
				 '*/',
				 ''
		],
		uglify: {
			options: {
				banner: '<%= banner.join("\\n") %>'
			},
			dist: {
				files: {
					'../jquery.SlipDiv.min.js': ['../jquery.SlipDiv.js']
				}
			}
		},
		copy: {
			dist: {
				files: [
					{expand:true, cwd:'<%= LIB_PATH %>jquery', src:'jquery.min.js', dest:'../'},
					{expand:true, cwd:'<%= LIB_PATH %>jquery.easing/js', src:'jquery.easing.min.js', dest:'../'}
				]
			},
			dev: {
				files: [
					{src:'../jquery.SlipDiv.js', dest:'../jquery.SlipDiv.min.js'}
				]
				// files: [
				// 	{expand:false, cwd:'../', src:'datePicker.js', dest:''}
				// ]
			}
		},
		watch: {
			scripts: {
				files: ['../jquery.SlipDiv.js'],
				tasks: ['copy:dev'],
				options: {
					spawn: true,
				}
			}
		},

		// grunt bump 或 grunt bump:patch
		// grunt bump:minor
		// grunt bump:major
		// grunt bump:build ??
		// grunt bump --setversion=2.0.1
		// Sometimes you want to run another task between bumping the version and commiting, for instance generate changelog. You can use bump-only and bump-commit to achieve that
		bump: {
			options: {
				files: ['package.json'],
				updateConfigs: [],
				commit: true,
				commitMessage: 'Release v%VERSION%',
				commitFiles: ['package.json'], // '-a' for all files
				createTag: true,
				tagName: 'v%VERSION%',
				tagMessage: 'Version %VERSION%',
				push: false,
				pushTo: 'master',
				gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-bump');

	grunt.registerTask('dev', ['copy:dev']);
	grunt.registerTask('default', ['copy:dist', 'uglify']);
};