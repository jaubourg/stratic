"use strict";

var fs = require( "fs" );
var path = require( "path" );
var wait = require( "./wait" );

module.exports = function( options, callback ) {
	wait( function( done, wait ) {
		( function list( dir ) {
			if ( options.dir ) {
				options.dir( dir, wait );
			}
			wait( function( done ) {
				fs.readdir( dir, function( error, filenames ) {
					if ( !error ) {
						filenames.forEach( function( filename ) {
							if ( !( options.block && options.block( filename ) ) ) {
								filename = path.join( dir, filename );
								wait( function( done ) {
									fs.stat( filename, function( error, stat ) {
										if ( stat.isDirectory() ) {
											list( filename );
										} else if ( stat.isFile() && options.file ) {
											options.file( filename, wait );
										}
										done();
									} );
								} );
							}
						} );
					}
					done();
				} );
			} );
		} )( path.resolve( options.target ) );
		done();
	}, callback );
};
