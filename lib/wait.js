"use strict";

module.exports = function( func, callback ) {
	var counter = 0;
	var done = false;
	function wait( func ) {
		if ( done ) {
			throw "already done";
		}
		counter++;
		var called = false;
		func( function() {
			if ( called ) {
				throw "already called";
			}
			if ( !( --counter ) ) {
				done = true;
				if ( callback ) {
					callback();
				}
			}
		}, wait );
	}
	wait( func );
};
