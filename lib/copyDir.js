"use strict";

var fs = require( "fs" );
var ls = require( "./ls" );
var path = require( "path" );

module.exports = function( options, callback ) {
	var dirLength;
	function srcToDest( filename ) {
		return options.dest + filename.substr( dirLength );
	}
	ls( {
		target: options.src,
		block: options.block,
		dir: function( dir, wait ) {
			if ( dirLength == null ) {
				dirLength = dir.length;
			}
			dir = srcToDest( dir );
			wait( function( done ) {
				fs.mkdir( dir, done );
			} );
		},
		file: function( filename, wait ) {
			wait( function( done ) {
				var ext = path.extname( filename );
				if ( options[ ext ] ) {
					fs.readFile( filename, function( error, content ) {
						if ( error ) {
							throw error;
						}
						var destContent = options[ ext ]( content, filename );
						if ( destContent.filename ) {
							filename = path.dirname( filename ) + "/" + destContent.filename;
							destContent = destContent.content;
						}
						fs.writeFile( srcToDest( filename ), destContent, function( error ) {
							if ( error ) {
								throw error;
							}
							done();
						} );
					} );
				} else {
					fs.createReadStream( filename )
						.pipe( fs.createWriteStream( srcToDest( filename ) ) )
						.on( "error", function( error ) {
							throw error;
						} )
						.on( "finish", done );
				}
			} );
		}
	}, callback );
};
