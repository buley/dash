# dash [![Build Status](https://travis-ci.org/buley/dash.png?branch=master)](https://travis-ci.org/buley/dash.svg) [![Coverage Status](https://coveralls.io/repos/buley/dash/badge.png?branch=master)](https://coveralls.io/r/buley/dash?branch=master) [![Docs Status](http://inch-ci.org/github/buley/dash.svg?branch=master)]

A cookie-sized JavaSript library wrapping the IndexedDB "HTML5" database API.

#### Key Features
* Simpified callbacks through promises
* Transaction and optionally version-free 
* Declarative databases, object stores and indexes
* 5KB gzipped (18KB uncompressed)
* Tests passing on Chrome 41.0.2272 (Mac OS X 10.10.2), Firefox 35.0.0 (Mac OS X 10.10), Safari 8.0.4 (Mac OS X 10.10.2) and Opera 25.0.1614 (Mac OS X 10.10.2)

#### Installation Options

* Download [dash.js](https://raw.github.com/buley/dash/master/lib/dash.js)
* Install via [bower](https://github.com/bower/bower): `bower install dash`

#### Up And Running

	/* There's no setup required to get started using IndexedDB with dash. */
	/* Just start adding entries and any declared databases, object stores and 
	 * indexes will be provided */
	dash.add.object({ database: 'foo', store: 'bar', data: { baz: new Date().getTime() } )
	  (function(add_context) {
	    dash.get.object(add_context)
	    (function(get_context) {
	      console.log('Data', get_context.entry)
	    });
	  });

### Developer Features

* Free (MIT Licensed)
* [Task-based](http://gruntjs.com/) Development Workflow
* [Automated](https://github.com/karma-runner/karma) [Jasmine](https://jasmine.github.io/) [Testing](https://github.com/karma-runner/karma-jasmine) 
* [Coverage](https://github.com/gotwarlost/istanbul) [Testing](https://github.com/karma-runner/karma-coverage)
* Continuous [Integration](http://travis-ci.org/buley/dash) and [Coverage](https://github.com/cainus/node-coveralls) Reporting


#### To Test

    npm install
    grunt

Building requires `grunt-cli`

#### Documention

[http://dashdb.com/#/docs](http://dashdb.com/#/docs)

#### Demos

[http://dashdb.com/#/demos](http://dashdb.com/#/demos)

#### License

[http://dashdb.com/#/about](http://dashdb.com/#/about)
