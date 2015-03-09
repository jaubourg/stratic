"use strict";

var minify = require( "html-minifier").minify;

var options = {
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
};

var rSpacePunctuation = /\s(?=[!?;:»])|([«])\s/g;

module.exports = function( html ) {
	return minify( html, options ).replace( rSpacePunctuation, "$1&nbsp;" );
};
