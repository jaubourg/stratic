"use strict";

module.exports = function( basedir ) {

	var assign = require( "lodash.assign" );
	var copyDir = require( "./lib/copyDir" );
	var dirMap = require( "./lib/dirMap" );
	var fs = require( "fs" );
	var jade = require( "./lib/jade" )( basedir );
	var min = require( "./lib/min");
	var path = require( "path" );
	var rmDir = require( "./lib/rmDir" );
	var sass = require( "node-sass" );
	var slug = require( "speakingurl" );
	var template = require( "lodash.template" );

	var data = dirMap( basedir + "/layout/data", dirMap( basedir + "/data", {
		basedir: basedir
	} ) );

	function renderJade( content, filename, _data ) {
		return jade.render(
			"extends " + path.relative(
				path.dirname( filename ),
				basedir + "/compiled-layout/layout"
			) + "\n\n" + content,
			assign( {}, _data || data, {
				filename: filename,
				LAYOUT:
					path.join( path.relative(
						path.dirname( _data && _data.filename || filename ),
						basedir + "/content"
					), "layout.css" ).replace( /\\/g, "/" )
			} )
		);
	}

	copyDir( {
		src: basedir + "/layout",
		dest: basedir + "/compiled-layout",
		".scss": function( content ) {
			return template( content, {
				evaluate: /\/\*%([\s\S]+?)%\*\//g,
				interpolate: /\/\*%=([\s\S]+?)%\*\//g,
				escape: /\/\*%-([\s\S]+?)%\*\//g
			} )( data );
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
				var templateFileType = false;
				var templateHandler = false;
				if ( path.extname( basename ) === ".to" ) {
					basename = path.basename( basename, ".to" );
					templateFileType = path.extname( basename );
					if ( templateFileType ) {
						basename = path.basename( basename, templateFileType );
						if ( !( templateHandler = jade.filters[ templateFileType.substr( 1 ) ] ) ) {
							templateFileType = false;
						}
					}
				}
				copyDir( {
					src: path.resolve( dirname, "_" + basename, "resources" ),
					dest: basedir + "/dist/resources"
				} );
				if ( templateFileType ) {
					var options = {
						src: path.resolve( dirname, "_" + basename ),
						dest: path.resolve( basedir, "dist", path.relative( basedir + "/content", dirname ), basename ),
						block: function( filename ) {
							return path.extname( filename ) !== templateFileType;
						}
					};
					options[ templateFileType ] = function( _content, _filename ) {
						console.log( _filename );
						var _data = assign( {}, data, {
							filename: _filename
						} );
						_data.content = templateHandler( _content + "", _data );
						_filename = _data.title && slug( _data.title ) || basename( _filename, templateFileType );
						return {
							filename: path.basename( _filename, templateFileType ) + ".html",
							content: min( renderJade( content, _filename, _data ) )
						};
					};
					copyDir( options );
					return false;
				}
				return {
					filename: basename + ".html",
					content: min( renderJade( content, filename ) )
				};
			}
		}, function() {
			copyDir( {
				src: basedir + "/compiled-layout/resources",
				dest: basedir + "/dist/resources"
			} );
			sass.render( {
				file: basedir + "/compiled-layout/layout.scss",
				outputStyle: "compressed"
			}, function( error, result ) {
				if ( error ) {
					console.error( error );
				} else {
					fs.writeFile( basedir + "/dist/layout.css", result.css );
					rmDir( basedir + "/compiled-layout" );
				}
			} );
		} );
	} );

};
