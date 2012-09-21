/*
 * grunt-handlebars-requirejs
 *
 * Copyright (c) 2012 Darcy Murphy
 * Licensed under the MIT license.
 * https://github.com/mrDarcyMurphy/grunt-handlebars-requirejs/blob/master/LICENSE
 */

module.exports = function(grunt) {
  'use strict';

  // TODO: ditch this when grunt v0.4 is released
  grunt.util = grunt.util || grunt.utils

  var _ = grunt.util._
  var helpers = require('grunt-contrib-lib').init(grunt);

  // filename conversion for templates
  var defaultProcessName = function(name) {
    name = name.substr(0, name.lastIndexOf('.'))
    return name

    // define('tmpl/errors/404', ['handlebars'], function(Handlebars){
    // return Handlebars.template(
  };

  // filename conversion for partials
  var defaultProcessPartialName = function(filePath) {
    var pieces = _.last(filePath.split('/')).split('.');
    var name   = _(pieces).without(_.last(pieces)).join('.'); // strips file extension
    return name.substr(1, name.length);                       // strips leading _ character
  };

  grunt.registerMultiTask('handlebars_requirejs', 'Compile Handlebars templates to RequireJS modules.', function() {

    var helpers = require('grunt-contrib-lib').init(grunt);
    var options = helpers.options(this, {namespace: 'JST'});

    grunt.verbose.writeflags(options, 'Options');

    // TODO: ditch this when grunt v0.4 is released
    this.files = this.files || helpers.normalizeMultiTaskFiles(this.data, this.target);

    var compiled, srcFiles, src, filename;
    var partials = [];
    var templates = [];
    var output = [];

    // TODO: implement this
    var defineAs = options.defineAs || null

    // assign regex for partial detection
    var isPartial = options.partialRegex || /^_/;

    // assign filename transformation functions
    var processName = options.processName || defaultProcessName
    var processPartialName = options.processPartialName || defaultProcessPartialName

    // iterate files, processing partials and templates separately
    this.files.forEach(function(files) {
      srcFiles = grunt.file.expandFiles(files.src);
      srcFiles.forEach(function(file) {
        src = grunt.file.read(file);

        try {
          compiled = require('handlebars').precompile(src);
          // Forcing wrap since we'll need it in the module
          compiled = 'Handlebars.template('+compiled+')';
        } catch (e) {
          grunt.log.error(e);
          grunt.fail.warn('Handlebars failed to compile '+file+'.');
        }

        // THIS IS GOING TO NEED THE MOST WORK
        // not sure yet how I want to handle partials since they're ALL going to be partials when they hit hte front-end

        // // register partial or add template to namespace
        // if(isPartial.test(_.last(file.split('/')))) {
        //   filename = processPartialName(file);
        //   partials.push('Handlebars.registerPartial('+JSON.stringify(filename)+', '+compiled+');');
        // } else {
          filename = processName(file);
          templates.push('define('+JSON.stringify(filename)+",['handlebars'], function(Handlebars){\n return "+compiled+'\n});')
        // }
      });

      output = output.concat(partials, templates);
      console.log('output:')
      console.log(output)

      if (output.length > 0) {
        grunt.file.write(files.dest, output.join('\n\n'));
        grunt.log.writeln('File "' + files.dest + '" created.');
      }
    });
  });
}
