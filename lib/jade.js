"use strict";

module.exports = function( basedir ) {

	var basename = require( "./basename" );
	var md = new ( require( "markdown-it" ) )();
	var path = require( "path" );
	var sass = require( "node-sass" );

	var jade = require( "jade" );

	var rTitle = /^#(.*)$/m;

	jade.filters.md = function( text, data ) {
		var title = rTitle.exec( text );
		data.title = title && title[ 1 ].trim() || "";
		return "<div id=\"" + basename( data.filename ) + "\"><div class=\"content\">" + md.render( text ) + "</div></div>";
	};

	jade.filters.sass = function( text, data ) {
		return "<style>" + sass.renderSync( {
			data: text,
			outputStyle: "compressed",
			includePaths: [
				path.dirname( data.filename ),
				path.resolve( basedir, "compiled-layout", "style-include" )
			]
		}).css + "</style>";
	};

	return jade;
};
