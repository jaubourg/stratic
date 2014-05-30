"use strict";

var fs = require( "fs" );
var ls = require( "./ls" );
var path = require( "path" );
var wait = require( "./wait" );

module.exports = function( dir, callback ) {
	var dirtree = {};
	ls( {
		target: dir,
		dir: function( dir ) {
			dirtree[ dir ] = {
				"/": dir
			};
			var parent = dirtree[ path.dirname( dir ) ];
			if ( parent ) {
				parent[ path.basename( dir ) ] = dirtree[ dir ];
			}
		},
		file: function( file, wait ) {
			wait( function( done ) {
				fs.unlink( file, done );
			} );
		}
	}, function() {
		function del( tree, callback ) {
			wait( function( done, wait ) {
				Object.keys( tree ).slice( 1 ).forEach( function( sub ) {
					wait( function( done ) {
						del( tree[ sub ], done );
					} );
				} );
				done();
			}, function() {
				fs.rmdir( tree[ "/" ], callback );
			} );
		}
		del( dirtree[ Object.keys( dirtree )[ 0 ] ], callback );
	} );
};
