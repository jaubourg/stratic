#!/usr/bin/env node
"use strict";

require( "./index.js" )( require( "path" ).resolve( process.cwd(), process.argv[ 2 ] || "." ) );
