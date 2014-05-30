"use strict";

var basename = require( "./basename" );
var fs = require( "fs" );

var rRequireable = /\.(js|json)$/;

module.exports = function( dir, object ) {
	object = object || {};
	var list;
	try {
		list = fs.readdirSync( dir );
	} catch ( e ) {
		list = [];
	}
	list.forEach( function( name ) {
		if ( rRequireable.test( name ) ) {
			object[ basename( name ) ] = require( dir + "/" + name );
		}
	} );
	return object;
};
