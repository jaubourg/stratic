"use strict";

module.exports = function( basedir ) {

	var basename = require( "./basename" );
	var marked = require( "marked" );
	var path = require( "path" );
	var sass = require( "node-sass" );

	var jade = require( "jade" );

	jade.filters.md = function( text, data ) {
		return "<div id=\"" + basename( data.filename ) + "\"><div class=\"content\">" + marked( text ) + "</div></div>";
	};

	jade.filters.sass = function( text, data ) {
		return "<style>" + sass.renderSync( {
			data: text,
			outputStyle: "compressed",
			includePaths: [
				path.dirname( data.filename ),
				path.resolve( basedir, "compiled-layout", "style-include" )
			]
		} ) + "</style>";
	};

	return jade;

};
