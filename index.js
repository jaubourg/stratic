"use strict";

module.exports = function( basedir ) {

	var assign = require( "lodash.assign" );
	var copyDir = require( "./lib/copyDir" );
	var dirmap = require( "./lib/dirmap" );
	var fs = require( "fs" );
	var jade = require( "./lib/jade" )( basedir );
	var min = require( "html-minifier").minify;
	var path = require( "path" );
	var rmDir = require( "./lib/rmDir" );
	var sass = require( "node-sass" );
	var template = require( "lodash.template" );

	var data = dirmap( basedir + "/layout/data", dirmap( basedir + "/data", {
		basedir: basedir
	} ) );

	copyDir( {
		src: basedir + "/layout",
		dest: basedir + "/compiled-layout",
		".scss": function( content ) {
			return template( content, data, {
				evaluate: /\/\*%([\s\S]+?)%\*\//g,
				interpolate: /\/\*%=([\s\S]+?)%\*\//g,
				escape: /\/\*%-([\s\S]+?)%\*\//g
			} );
		}
	}, function() {

		copyDir( {
			src: basedir + "/content",
			dest: basedir + "/dist",
			block: function( filename ) {
				return filename[ 0 ] === "_";
			},
			".jade": function( content, filename ) {
				var basename = path.basename( filename, ".jade" );
				var dirname = path.dirname( filename );
				copyDir( {
					src: path.resolve( dirname, "_" + basename, "resources" ),
					dest: basedir + "/dist/resources"
				} );
				return {
					filename: basename + ".html",
					content: min(
						jade.render( "extends " + path.relative( dirname, basedir + "/compiled-layout/layout" ) + "\n\n" + content,
						assign( {}, data, {
							filename: filename
						} )
					), {
						minifyCSS: true,
						minifyJS: true,
						removeComments: true,
						removeCommentsFromCDATA: true,
						removeCDATASectionsFromCDATA: true,
						collapseWhitespace: true,
						collapseBooleanAttributes: true,
						removeAttributeQuotes: true,
						removeRedundantAttributes: true,
						useShortDoctype: true,
						removeEmptyAttributes: true,
						removeOptionalTags: true,
						removeEmptyElements: false
					} ).replace( /\s([!?;:])/g, function( _, $1 ) {
						return "&nbsp;" + $1;
					} )
				};
			}
		}, function() {
			copyDir( {
				src: basedir + "/compiled-layout/resources",
				dest: basedir + "/dist/resources"
			} );
			sass.render( {
				file: basedir + "/compiled-layout/layout.scss",
				success: function( css ) {
					fs.writeFile( basedir + "/dist/layout.css", css );
					rmDir( basedir + "/compiled-layout" );
				},
				error: function(error) {
					console.error( error );
				},
				outputStyle: "compressed"
			} );
		} );
	} );

};
