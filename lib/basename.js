"use strict";

var sep = require( "path" ).sep;

var rDir =  sep === "/" ? /\// : /\\|\//;
var rExtension = /\.[^\.]+$/;

module.exports = function( filename ) {
	filename = filename.split( rDir ).pop();
	return filename.replace( rExtension, "" );
};
