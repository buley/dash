var dashApp = angular.module('dashApp', [ 'ngRoute' ]);

dashApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/about', {
            templateUrl: '/docs/templates/about.html',
            controller: 'dashAppAboutController'
        }).
        when('/docs', {
            templateUrl: '/docs/templates/docs.html',
            controller: 'dashAppDocsController'
        }).
        when('/docs/:doc1', {
            templateUrl: '/docs/templates/docs.html',
            controller: 'dashAppDocsController'
        }).
        when('/docs/:doc1/:doc2', {
            templateUrl: '/docs/templates/docs.html',
            controller: 'dashAppDocsController'
        }).
        when('/docs/:doc1/:doc2/:doc3', {
            templateUrl: '/docs/templates/docs.html',
            controller: 'dashAppDocsController'
        }).
        when('/docs/:doc1/:doc2/:doc3/:doc4', {
            templateUrl: '/docs/templates/docs.html',
            controller: 'dashAppDocsController'
        }).
        when('/', {
            templateUrl: '/docs/templates/splash.html',
            controller: 'dashAppSplashController'
        }).
        otherwise({
            redirectTo: '/docs'
        });
}]);

dashApp.controller( 'dashAppController', [ '$location', '$scope', function( $location, $scope ) {
    $scope.isSplash = function() {
        return '/' === $location.path();
    };
    $scope.isDocs = function() {
        return '/docs' === $location.path();
    };
    $scope.isAbout = function() {
        return '/about' === $location.path();
    };
}]);

dashApp.controller('dashAppAboutController', [ function() {
}]);

dashApp.controller('dashAppDocsController', [ '$scope', '$http', '$templateCache', '$routeParams', function( $scope, $http, $templateCache, $routeParams ) {
    $scope.parentSelected = function(parent) {
        var current = $scope.currentTopic();
        return parent.path === current;
    };
    $scope.currentTopic = function() {
        var params = [];
        if ($routeParams.doc1) {
            params.push($routeParams.doc1);
        }
        if ($routeParams.doc2) {
            params.push($routeParams.doc2);
        }
        if ($routeParams.doc3) {
            params.push($routeParams.doc3);
        }
        if ($routeParams.doc4) {
            params.push($routeParams.doc4);
        }
        return params.join('/');
    };
    $scope.parentShowing = function(obj, child) {
        var params = [],
            match,
            regx,
            current,
            others;
        if ($routeParams.doc1) {
            params.push($routeParams.doc1);
        }
        if ($routeParams.doc2) {
            params.push($routeParams.doc2);
        }
        if ($routeParams.doc3) {
            params.push($routeParams.doc3);
        }
        if ($routeParams.doc4) {
            params.push($routeParams.doc4);
        }
        current = params.join('\/');
        if ( '' === current ) {
            return false;
        }
        regx = new RegExp( '^' + current );
        match = ( null !== obj.path.match( regx ) ) ? true : false;
        others = child.path.split('/');
        others.pop();
        others = others.join('/');
        regx = new RegExp( '^' + others);
        return match || ( null !== current.match( regx ) ) ? true : false;
    };


    $scope.documents = [
        { path: 'overview',
            children: [
                { 'path': 'overview',
                    'title': 'Overview',
                    'default': true,
                    'children': [
                        { 'path': 'general/security',
                            'title': 'Security'
                        },
                        { 'path': 'general/transactions',
                            'title': 'Transactions',
                            'children': [ { 'path': 'general/transaction/requests',
                                'title': 'Requests'
                            } ]
                        }
                    ]
                },
                { 'path': 'databases',
                    'title': 'Databases',
                    'children': [
                        { 'path': 'database/opening',
                            'title': 'Opening',
                            'demos': [ {
                                'title': 'Opening A Database Example: Simple Case',
                                'id': 'dashdb/ZCngL'
                            } ]
                        },
                        { 'path': 'database/closing',
                            'title': 'Closing',
                            'demos': [
                                {
                                    'title': 'Closing A Database Example: Simple Case',
                                    'id': 'dashdb/SFYx5'
                                }
                            ]
                        },
                        { 'path': 'database/removing',
                            'title': 'Removing',
                            'demos': [ {
                                'title': 'Removing A Database Example: Simple Case',
                                'id': 'dashdb/retKS'
                            } ]
                        },
                        { 'path': 'database/getting',
                            'title': 'Getting',
                            'demos': [
                                { 'title': 'Getting Existing Databases Example: Simple Case',
                                    'id': 'dashdb/5ZWMg'
                                }
                            ]
                        } ]
                },
                { 'path': 'stores',
                    'title': 'Stores',
                    'children': [
                        { 'path': 'objectstore/clearing', 'title': 'Clearing',
                            'demos': [ {
                                'title': 'Clearing An Object Store Example: Simple Case',
                                'id': 'dashdb/YCj4Q'
                            } ] },
                        { 'path': 'objectstore/creating', 'title': 'Creating',
                            'demos': [ {
                                'title': 'Creating An Object Store Example: Simple Case',
                                'id': 'dashdb/8mCew'
                            } ] },
                        { 'path': 'objectstore/getting', 'title': 'Getting',
                            'demos': [ {
                                'title': 'Getting An Object Store Example: Simple Case',
                                'id': 'dashdb/LJqjA'
                            } ] },
                        { 'path': 'objectstore/iteration', 'title': 'Iterating',
                            'demos': [ {
                                'title': 'Getting Multiple Object Stores Example: Simple Case',
                                'id': 'dashdb/ZCngL'
                            } ] },
                        { 'path': 'objectstore/removing', 'title': 'Removing',
                            'demos': [ {
                                'title': 'Removing An Object Store Example: Simple Case',
                                'id': 'dashdb/Zcw46'
                            } ] }
                    ]
                },

                { 'path': 'keys',
                    'title': 'Keys',
                    'children': [
                        { 'path': 'key/ranges',
                            'title': 'Keyranges',
                            'children': [
                                { 'path': 'key/range/bounds',
                                    'title': 'Bounds' },
                                { 'path': 'key/range/direction',
                                    'title': 'Direction' }
                            ]
                        },
                        { 'path': 'key/cursors',
                            'title': 'Cursors',
                            'children': []
                        } ]
                },
                { 'path': 'indexes',
                    'title': 'Indexes',
                    'children': [
                        { 'path': 'index/creating',
                            'title': 'Creating',
                            'demos': [ {
                                'title': 'Creating An Index Example: Simple Case',
                                'id': 'dashdb/kM4sQ'
                            } ] },
                        { 'path': 'index/getting',
                            'title': 'Getting',
                            'demos': [ {
                                'title': 'Getting An Index Example: Simple Case',
                                'id': 'dashdb/2vqYW'
                            } ]},
                        { 'path': 'index/iterating',
                            'title': 'Iterating',
                            'demos': [ {
                                'title': 'Getting Multiple Indexes Example: Simple Case',
                                'id': 'dashdb/2FmJg'
                            } ] },
                        { 'path': 'index/removing',
                            'title': 'Removing',
                            'demos': [ {
                                'title': 'Removing An Index Example: Simple Case',
                                'id': 'dashdb/2td5q'
                            } ]
                        }
                    ]
                },
                { 'path': 'entries',
                    'title': 'Entries',
                    'children': [
                        { 'path': 'entry/adding',
                            'title': 'Adding',
                            'demos': [ {
                                'title': 'Adding An Object To An Object Store Example: Simple Case',
                                'id': 'dashdb/LD42e'
                            } ] },
                        { 'path': 'entry/getting',
                            'title': 'Getting',
                            'demos': [ {
                                'title': 'Getting An Object From An Object Store Example: Simple Case',
                                'id': 'dashdb/ALXu8'
                            },
                                {
                                    'title': 'Getting Multiple Objects From A Database Example: Simple Case',
                                    'id': 'dashdb/R8ZL4'
                                } ] },
                        { 'path': 'entry/putting',
                            'title': 'Putting',
                            'demos': [ {
                                'title': 'Putting An Object Into An Object Store Example: Simple Case',
                                'id': 'dashdb/zHLWL'
                            } ] },
                        { 'path': 'entry/removing',
                            'title': 'Removing',
                            'demos': [ {
                                'title': 'Removing An Object From An Object Store Example: Simple Case',
                                'id': 'dashdb/Gb2CC'
                            },
                                {
                                    'title': 'Removing Multiple Objects From A Database Example: Simple Case',
                                    'id': 'dashdb/H6r9x'
                                } ] },
                        { 'path': 'entry/updating',
                            'title': 'Updating',
                            'demos': [ {
                                'title': 'Updating Multiple Objects In A Database Example: Simple Case',
                                'id': 'dashdb/dqx4R'
                            } ] }
                    ]
                },
            ]
        }
    ];
    $scope.emptyPath = function() {
        return '' === $scope.currentTopic();
    };
    var getPath = function(path) {
        return ['/documentation/', path, '.md' ].join('');
    }
    $scope.documentContent = function(path) {
        return $templateCache.get(getPath(path))[1];
    }
    $scope.currentDocument = function() {
        var topic = $scope.currentTopic(),
            found = false;
        _.map($scope.documents, function(item) {
            if (item.path === topic) {
                found = item;
                return;
            }
            if(item.children) {
                _.map(item.children, function(item2) {
                    if (item2.path === topic) {
                        found = item2;
                        return;
                    }
                    if (item2.children) {
                        _.map(item2.children, function(item3) {
                            if(item3.path === topic) {
                                found = item3;
                                return;
                            }
                            if (item3.children) {
                                _.map(item3.children, function(item4) {
                                    if(item4.path === topic) {
                                        found = item4;
                                        return;
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
        return found;
    }
    var process = function(item) {
        $http.get( getPath(item.path), { cache: $templateCache } );
        if (!item.children) {
            return;
        } else {
            _.map(item.children, function(datum) {
                process(datum);
            });
        }
    };
    _.map( $scope.documents, process );

}]);

dashApp.controller('dashAppDocsContentController', [ '$routeParams', '$scope', function( $routeParams, $scope ) {
    $scope.pathLevel = function(obj) {
        var current = $scope.currentTopic();
        return (true === obj.default && '' === current) || obj.path === current;
    };
}]);

dashApp.controller('dashAppDocsSidebarController', [ '$routeParams', '$scope', function($routeParams, $scope) {

}]);

dashApp.controller('dashAppDocsDemosController', [ '$scope', '$sce', function( $scope, $sce ) {
    $scope.demos = function() {
        var current = $scope.currentDocument(),
            stack = current.demos || [];
        _.map(current.children || [], function(child) {
            stack.push.apply(stack, child.demos || []);
        });
        return stack;
    };
    $scope.demoUrl = function(demo) {
        return $sce.trustAsResourceUrl('http://jsfiddle.net/' + demo.id + '/embedded');
    };
}]);


dashApp.directive('dashSplash', [ 'dashAppSplashBroadcast', 'dashWorkerService', function(dashAppSplashBroadcast, dashWorkerService) { 
    return {
        scope: {},
        restrict: 'AE',
        compile: function() {
            return function link(scope, element, attrs) {
            };
        }
    };
} ] );

dashApp.factory( 'dashAppSplashBroadcast', function() {
	stack = [];
	return {
		current: function(data) {
			var x = 0, xlen = stack.length;
			for ( x = 0; x < xlen; x += 1 ) {
				stack[ x ].apply( stack[ x ], [ data ] );
			}
		},
		subscribe: function(cb) {
			stack.push(cb);
		}
	};
});;
dashApp.controller('dashAppSplashController', [ '$scope', '$http', function( $scope, $http ) {
    var start = 2013,
        stack = [],
	start_promise,
        in_progress = false,
	fresh_start = true,
	totalRun = 0,
        processNext = function() {
            if(!in_progress && stack.length > 0) {
                in_progress = true;
		if ( true === fresh_start ) {
			start_promise = new Date().getTime();
			fresh_start = false;
			totalRun = 0;
		}
                doNext(stack.shift());
		totalRun += 1;
            } else {
	        statsUpdate('complete', 'adds', totalRun, new Date().getTime() - start_promise);
		fresh_start = true;
	    }
        },
        doNext = function(next) {
            dash.add.entry({
                database: 'dash-demo',
                store: 'imdb',
                auto_increment: true,
                store_key_path: 'id',
                data: next
            })
            (function(context) {
                in_progress = false;
                processNext();
            }, function(context) {
                in_progress = false;
                processNext();
            });
        },
        key = 'dash-demo-installed-2',
        dashInstalled = localStorage.getItem(key);
    if (!dashInstalled) {
        for (; start > 2000; start -= 1) {
            localStorage.setItem(key, 'YES');
            $http( {
                method: 'GET',
                url: '/docs/demo/data/' + start + '.json'
            }).success(function(data, status, headers, config) {
                stack.push.apply(stack, data);
                processNext();
            }).error( function(data, status, headers, config) {
                console.log('error',data, status, headers, config);
            });
        }
    }

}]);


dashApp.directive('dashSplashOverlay', [ '$q', '$http', '$timeout', 'dashAppSplashBroadcast', 'dashWorkerService', function( $q, $http, $timeout, dashAppSplashBroadcast, dashWorkerService ) { 
    return {
        scope: {},
        restrict: 'AE',
	templateUrl: '/docs/templates/overlay.html',
        compile: function() {
	    var el = document.createElement('div'), pid;
            el.setAttribute('id', 'dash-splash-container');
            return function link(scope, element, attrs) {
                var system = IMDBSystem(el, $('#dash-splash-overlay').width(), $('#dash-splash-overlay').height(), function(data) {
		    if (pid) {
			clearTimeout(pid);
		    }
		    if (!data) {
			pid = setTimeout( function() {
			scope.$apply(function() {
				scope.data = {
					se: '',
					ep: ''
				};
			});
			}, 3000);
			return;
		    }
		    dash.get.entry({
			database: 'dash-demo',
			store: 'imdb',
			key: data,
			store_key_path: 'id'
		    })
		    (function(context) {
			dashAppSplashBroadcast.current(context.entry);
		    }, function(context) {
			console.log('missing entry', context);
		    });
		}),
		layout = system.layout;

                element[0].appendChild(el);

		scope.data = {
			se: '',
			ep: ''
		};
		scope.range = 2014;
		scope.sort = 'from';
		scope.field = 'thousand';
		scope.verb = 'explore';
		scope.stats = function() {
			if ( scope.statsData ) {
				var pretty = function(rate) {
					var quant = (rate/scope.statsData.elapsed) * 1000;
					if ( quant < 1 ) {
						return Math.floor(quant * 60) + ' entries per minute';
					}
					return Math.floor(quant) + ' entries per second';
					
				};
				if ( true === scope.statsData.clear ) {
					return 'dash is ready to go';
				}
				if ( true === scope.statsData.complete) { 
					if ( 'adds' === scope.statsData.verb ) {
						return 'dash added ' + scope.statsData.amount + ' entries in ' + scope.statsData.elapsed + 'ms';
					} else if ( 'gets' === scope.statsData.verb ) {
						return 'dash got ' + scope.statsData.amount + ' entries in ' + scope.statsData.elapsed + 'ms';
					} else if ( 'removes' === scope.statsData.verb ) {
						return 'dash removed ' + scope.statsData.amount + ' entries in ' + scope.statsData.elapsed + 'ms';
					} else if ( 'searches' === scope.statsData.verb ) {
						return 'dash searched ' + scope.statsData.amount + ' entries in ' + scope.statsData.elapsed + 'ms';
					}
				} else {
					if ( undefined !== scope.statsData.adds ) {
						return 'dash is adding ' + pretty(scope.statsData.adds);
					} else if ( undefined !== scope.statsData.gets ) {
						return 'dash is getting ' + pretty(scope.statsData.gets);
					} else if ( undefined !== scope.statsData.removes ) {
						return 'dash is removing ' + pretty(scope.statsData.removes);
					} else if ( undefined !== scope.statsData.searches ) {
						return 'dash is searching ' + pretty(scope.statsData.searches);
					}

				}
				return '';
			} else {
				return 'dash is ready to go';
			};
		};
		scope.estimate = function() {
			var field = scope.field, limit = 0;
			if ( 'search' === scope.verb || 'remove' === scope.verb || hasDownloaded(scope.downloaded, scope.range, scope.sort ) ) {
				limit = totalDownloaded(scope.downloaded, scope.range, scope.sort );
				if ( 'million' === field && limit > 1000000 ) {
					limit = 1000000;
				} else if ( 'hundredthousand' === field && limit > 100000 ) {
					limit = 100000;
				} else if ( 'tenthousand' === field && limit > 10000  ) {
					limit = 10000;
				} else if ( 'thousand' === field && limit > 1000 ) {
					limit = 1000;

				}
				return limit.toString() + ' entries';
			}
			var values = [],
			    start = false,
			    file;
			if ( 'from' === scope.sort ) {
				values = [ scope.files[ scope.range ] ];
			} else {
				for ( file in scope.files) {
					if ( false === start && scope.files.hasOwnProperty( file ) ) {
						if ( file === scope.range.toString() ) {
							start = true;
						}
					}
					if ( start && false === scope.downloaded[ file ] ) {
						values.push( scope.files[ file ] );
					}
				}
			}
			var x = 0, xlen = values.length, xitem, total = 0;
			for ( x = 0; x < xlen; x += 1 ) {
				xitem = values[ x ].filesize;
				var cut = xitem.replace(/K$/, '');
				if ( cut !== xitem ) {
					cut = parseInt( cut, 10 );
					total += cut * 1024;
				} else {
					cut = xitem.replace(/M$/, '');
					if ( cut !== xitem ) {
						cut = parseInt( cut, 10 );
						total += cut * 1048576;
					} else {
						cut = parseInt( cut, 10 );
						total += cut;
					}
				}
			}
			if ( total < 1024 ) {
				return ( total ).toString() + 'B download';
			} else if ( total < 1048576 ) {	
				return Math.floor( total / 1024 ).toString() + 'KB download';
			} else {
				return Math.round( total / 1048576 ).toString() + 'MB download';
			}
		};
		scope.files = { 
			'1880': { filesize: '79'},
			'1887': { filesize: '82'},
			'1888': { filesize: '364'},
			'1889': { filesize: '198'},
			'1890': { filesize: '374'},
			'1891': { filesize: '580'},
			'1892': { filesize: '589'},
			'1893': { filesize: '134'},
			'1894': { filesize: '6.3K'},
			'1895': { filesize: '7.6K'},
			'1896': { filesize: '48K'},
			'1897': { filesize: '85K'},
			'1898': { filesize: '124K'},
			'1899': { filesize: '128K'},
			'1900': { filesize: '133K'},
			'1901': { filesize: '133K'},
			'1902': { filesize: '131K'},
			'1903': { filesize: '194K'},
			'1904': { filesize: '130K'},
			'1905': { filesize: '117K'},
			'1906': { filesize: '103K'},
			'1907': { filesize: '114K'},
			'1908': { filesize: '181K'},
			'1909': { filesize: '209K'},
			'1910': { filesize: '282K'},
			'1911': { filesize: '377K'},
			'1912': { filesize: '500K'},
			'1913': { filesize: '578K'},
			'1914': { filesize: '542K'},
			'1915': { filesize: '512K'},
			'1916': { filesize: '379K'},
			'1917': { filesize: '281K'},
			'1918': { filesize: '229K'},
			'1919': { filesize: '226K'},
			'1920': { filesize: '248K'},
			'1921': { filesize: '224K'},
			'1922': { filesize: '191K'},
			'1923': { filesize: '160K'},
			'1924': { filesize: '161K'},
			'1925': { filesize: '173K'},
			'1926': { filesize: '177K'},
			'1927': { filesize: '178K'},
			'1928': { filesize: '172K'},
			'1929': { filesize: '172K'},
			'1930': { filesize: '155K'},
			'1931': { filesize: '153K'},
			'1932': { filesize: '152K'},
			'1933': { filesize: '143K'},
			'1934': { filesize: '154K'},
			'1935': { filesize: '153K'},
			'1936': { filesize: '169K'},
			'1937': { filesize: '173K'},
			'1938': { filesize: '169K'},
			'1939': { filesize: '152K'},
			'1940': { filesize: '131K'},
			'1941': { filesize: '132K'},
			'1942': { filesize: '127K'},
			'1943': { filesize: '113K'},
			'1944': { filesize: '104K'},
			'1945': { filesize: '101K'},
			'1946': { filesize: '117K'},
			'1947': { filesize: '136K'},
			'1948': { filesize: '176K'},
			'1949': { filesize: '253K'},
			'1950': { filesize: '331K'},
			'1951': { filesize: '408K'},
			'1952': { filesize: '461K'},
			'1953': { filesize: '502K'},
			'1954': { filesize: '543K'},
			'1955': { filesize: '617K'},
			'1956': { filesize: '657K'},
			'1957': { filesize: '727K'},
			'1958': { filesize: '746K'},
			'1959': { filesize: '804K'},
			'1960': { filesize: '849K'},
			'1961': { filesize: '833K'},
			'1962': { filesize: '762K'},
			'1963': { filesize: '842K'},
			'1964': { filesize: '846K'},
			'1965': { filesize: '956K'},
			'1966': { filesize: '1.0M'},
			'1967': { filesize: '1.1M'},
			'1968': { filesize: '997K'},
			'1969': { filesize: '6.9M'},
			'1970': { filesize: '975K'},
			'1971': { filesize: '1008K'},
			'1972': { filesize: '943K'},
			'1973': { filesize: '1008K'},
			'1974': { filesize: '987K'},
			'1975': { filesize: '996K'},
			'1976': { filesize: '1004K'},
			'1977': { filesize: '1012K'},
			'1978': { filesize: '1.1M'},
			'1979': { filesize: '1.1M'},
			'1980': { filesize: '1.1M'},
			'1981': { filesize: '1016K'},
			'1982': { filesize: '1.1M'},
			'1983': { filesize: '1.1M'},
			'1984': { filesize: '1.2M'},
			'1985': { filesize: '1.4M'},
			'1986': { filesize: '1.4M'},
			'1987': { filesize: '1.5M'},
			'1988': { filesize: '1.4M'},
			'1989': { filesize: '1.6M'},
			'1990': { filesize: '1.6M'},
			'1991': { filesize: '1.7M'},
			'1992': { filesize: '1.8M'},
			'1993': { filesize: '2.0M'},
			'1994': { filesize: '2.2M'},
			'1995': { filesize: '2.6M'},
			'1996': { filesize: '2.6M'},
			'1997': { filesize: '2.9M'},
			'1998': { filesize: '3.3M'},
			'1999': { filesize: '3.6M'},
			'2000': { filesize: '3.8M'},
			'2001': { filesize: '4.2M'},
			'2002': { filesize: '4.5M'},
			'2003': { filesize: '5.0M'},
			'2004': { filesize: '6.2M'},
			'2005': { filesize: '7.0M'},
			'2006': { filesize: '8.0M'},
			'2007': { filesize: '8.9M'},
			'2008': { filesize: '9.3M'},
			'2009': { filesize: '9.9M'},
			'2010': { filesize: '11M'},
			'2011': { filesize: '13M'},
			'2012': { filesize: '14M'},
			'2013': { filesize: '13M'},
			'2014': { filesize: '2.0M'},
			'2015': { filesize: '155K'},
			'2016': { filesize: '21K'},
			'2017': { filesize: '4.1K'},
			'2018': { filesize: '1.3K'},
			'2019': { filesize: '294'},
			'2020': { filesize: '150'},
			'2021': { filesize: '67'}
		};
		scope.downloaded = JSON.parse( localStorage.getItem('dash-demo-downloaded') ) || {};
		var dirty = false, attr;
		for ( attr in scope.files ) {
			if ( scope.files.hasOwnProperty(attr) && undefined === scope.downloaded[ attr ] ) {
				scope.downloaded[ attr ] = false;
				dirty = true;
			}
		}
		if ( dirty ) {
			localStorage.setItem('dash-demo-downloaded', JSON.stringify( scope.downloaded ) );
		}
		dirty = false;
		scope.progress = JSON.parse( localStorage.getItem('dash-demo-progress') ) || {};
		for ( attr in scope.files ) {
			if ( scope.files.hasOwnProperty(attr) && undefined === scope.progress[ attr ] ) {
				scope.progress[ attr ] = false;
				dirty = true;
			}
		}
		if ( dirty ) {
			localStorage.setItem('dash-demo-progress', JSON.stringify( scope.progress ) );
		}


		scope.sorts = [ {
			name: 'from',
			display: 'from',
			selected: 'from' === scope.sort ? 'selected' : '',
			enabled: true
		}, {
			name: 'since',
			display: 'since',
			selected: 'since' === scope.sort ? 'selected' : '',
			enabled: true
		} ];
		scope.fields = [ {
			name: 'everything',
			display: 'all entries',
			selected: 'everything' === scope.field ? 'selected' : '',
			enabled: true
		}, {
			name: 'hundredthousand',
			display: '100k entries',
			selected: 'hundredthousand' === scope.field ? 'selected' : '',
			enabled: true
		}, {
			name: 'tenthousand',
			display: '10k entries',
			selected: 'tenthousand' === scope.field ? 'selected' : '',
			enabled: true
		}, {
			name: 'thousand',
			display: '1k entries',
			selected: ( null === scope.field || 'thousand' === scope.field ) ? 'selected' : '',
			enabled: true
		} ];
		scope.verbs = [ {
			name: 'explore',
			display: 'explore',
			selected: 'explore' === scope.verb ? 'selected' : '',
			enabled: true
		}, {
			name: 'search',
			display: 'search',
			selected: 'search' === scope.verb ? 'selected' : '',
			enabled: true
		}, {
			name: 'remove',
			display: 'remove',
			selected: 'remove' === scope.verb ? 'selected' : '',
			enabled: true
		} ];

		scope.numFields = function() {
			return hasDownloaded(scope.range) ? 3 : 1;
		};

		scope.numEntries = function() {
			return totalDownloaded(scope.downloaded, scope.range, scope.sort);
		};
		var hasDownloaded = function(range) {
			var attr;
			for ( attr in scope.downloaded ) {
				if ( scope.downloaded.hasOwnProperty( attr ) ) {
					if ( parseInt( attr, 10 ) >= range ) {
						if ( false === scope.downloaded[ attr ] ) {
							return false;
						}
						if ( 'from' === scope.sort ) {
							return true;
						}
					}
				}
			}
			return true;
		};
		var totalDownloaded = function(downloaded, range, sort) {
			var attr, total = 0;
			for ( attr in downloaded ) {
				if ( downloaded.hasOwnProperty( attr ) ) {
					if ( parseInt( attr, 10 ) >= range ) {
						if ( false === downloaded[ attr ] ) {
							continue;
						}
						if ( 'from' === sort ) {
							return downloaded[ attr ];
						} else {
							total += downloaded[ attr ];
						}
					}
				}
			}
			return downloaded;
		};
		scope.$watch( 'range', function(newer, older) {
			var is_installed, x, xlen = scope.verbs.length;
			if ( true === hasDownloaded(newer) ) {
				is_installed = true;
			} else {
				is_installed = false;
			}
			for ( x = 0; x < xlen; x += 1 ) {
				if ( 'search' === scope.verbs[ x ].name || 'remove' === scope.verbs[ x ].name ) {
					scope.verbs[ x ].enabled = is_installed;
				}
			}
			if ( is_installed ) {
				xlen = scope.fields.length;
				var field,
				    total = totalDownloaded(scope.downloaded, scope.range, scope.sort );
				for ( x = 0; x < xlen; x += 1 ) {
					field = scope.fields[ x ].name;
					if ( 'million' === field && total < 1000000) {
						scope.fields[ x ].enabled = false;
					} else if ( 'hundredthousand' === field && total < 100000 ) {
						scope.fields[ x ].enabled = false;
					} else if ( 'tenthousand' === field && total < 10000 ) {
						scope.fields[ x ].enabled = false;
					} else if ( 'thousand' === field && total < 1000 ) {
						scope.fields[ x ].enabled = false;
					}
				}
			}
			console.log('range changed', newer, older);
		});

		scope.$watch( 'verb', function(newer, older) {
			console.log('verb changed',newer, older);
		});

		scope.$watch( 'field', function(newer, older) {
			console.log('field changed',newer, older);
		});


		scope.$watch( 'sort', function(newer, older) {
			console.log('sort changed',newer, older);
		});
		$('#dash-demo-overlay-marketing').hover(function() {
			system.controls(false);
		}, function() {
			system.controls(true);
		});

		scope.verb = 'explore';
		scope.go = function() {	
			console.log('GO',scope.field,scope.range,scope.query,scope.sort, scope.verb);
			system.reset();
			$('.dash-demo-overlay-marketing-button').blur();
			var limit = null, //default: everything
			    field = scope.field;
			if ( 'million' === field ) {
				limit = 1000000;
			} else if ( 'hundredthousand' === field ) {
				limit = 100000;
			} else if ( 'tenthousand' === field ) {
				limit = 10000;
			} else if ( 'thousand' === field ) {
				limit = 1000;
			}
			var ctx = {}, callLayout = function() {
				doLayout({
					range: scope.range,
					limit: limit,
					query: scope.query,
					sort: scope.sort,
					verb: scope.verb
				});
			};
			if ( 'remove' !== scope.verb && 'search' !== scope.verb ) {
				callLayout();
			} else if ( 'remove' === scope.verb ) {
				console.log('REMOVE');
			    var ctx = {
				  database: 'dash-demo',
				  store: 'imdb',
				  auto_increment: true,
				  store_key_path: 'id',
				  index: 'season',
				  index_key_path: 'sy',
				  limit: limit,
				  key: new Date('1/1/' + scope.range).getTime()
				},
				dash_promise = dashWorkerService.remove.entries(ctx),
				start_promise = new Date().getTime();
			    dash_promise.then( function(context) {
				//xxx
				var values = [],
				    start = false,
				    file;
				if ( 'from' === scope.sort ) {
					values = [ scope.files[ scope.range ] ];
				} else {
					for ( file in scope.files) {
						if ( false === start && scope.files.hasOwnProperty( file ) ) {
							if ( file === scope.range.toString() ) {
								start = true;
							}
						}
						if ( start ) {
							scope.progress[ file ] = false;
							if ( 'from' === scope.field ) {
								return;
							}
						}
					}
				}
				statsUpdate('complete', 'removes', context.amount, new Date().getTime() - start_promise);
			    }, function(context) {
				console.log('dash promise rejected', context);
			    }, function(context) {
				system.remove(context);
				console.log('removed one');
				statsUpdate('removes');
				//system.cameraMod( 'z', 2, 50000, 10 );
				//system.cameraMod( 'z', 1, 10000, 0 );
			    });

			} else {
				console.log("SEARCH", scope.query);
			    var ctx = {
				  database: 'dash-demo',
				  store: 'imdb',
				  auto_increment: true,
				  store_key_path: 'id',
				  index: 'season',
				  index_key_path: 'sy',
				  limit: limit,
				  key: new Date('1/1/' + scope.range).getTime()
				},
				q =  new RegExp( scope.query ),
				dash_promise = dashWorkerService.get.entries(ctx),
				start_promise = new Date().getTime();

			    dash_promise.then( function(context) {
				console.log('searched all',context.amount);
				statsUpdate('complete', 'searches', context.amount, new Date().getTime() - start_promise);
			    }, function(context) {
				console.log('dash promise rejected', context);
			    }, function(context) {
				if ( !!context.entry.se && null !== context.entry.se.match(q) || !!context.entry.ep && null !== context.entry.ep.match(q) ) {
					context.id = context.primary_key;
					system.add(context);
					//system.highlight(context);
				}
				
				statsUpdate('searches');
				//system.cameraMod( 'z', 2, 50000, 10 );
				//system.cameraMod( 'z', 1, 10000, 0 );
			    });


			}

		};
		var statsObj = {},
		    last_time = new Date().getTime(),
		    statsProc = null,
		    statsTimeout = 1000,
		    wasCompleted = false,
		    statsFunc = function() {
			statsObj.elapsed = new Date().getTime() - last_time;
			last_time = new Date().getTime();
			scope.statsData = scope.statsData || {};
			if ( ( new Date().getTime() - scope.statsData.updated ) > 10000 ) {
				statsObj = { clear: true };
			}
			scope.statsData = statsObj;
			statsObj = {};
			statsProc = null;
		    },
		    statsUpdate = function() {
				var tag = arguments[0];
				if ( 'complete' === tag ) {
					statsObj = { verb: arguments[1], complete: true, amount: arguments[2], elapsed: arguments[3], updated: new Date().getTime() };
					scope.statsData = statsObj;
					return;
				} else {
					statsObj[ tag ] = statsObj[ tag ] || 0;
					statsObj[ tag ] += 1;
				}
				if ( !statsProc ) {
					statsProc = setTimeout(statsFunc, statsTimeout);
				}
		    },
		    doLayout = function(cmdargs) {
			var file, start = false, values = [];
			last_time = new Date().getTime();
			if ( 'from' === scope.sort ) {
				values.push( [ scope.range, !scope.downloaded[ scope.range ] ] );
			} else {
				for ( file in scope.downloaded ) {
					if (scope.downloaded.hasOwnProperty( file ) ) {
						if ( false === start ) {
							if ( file === scope.range.toString() ) {
								start = true;
							}
						}
						if ( start ) {
							values.push( [ file, !scope.downloaded[ file ] ] );
						}
					}
				}
			}
			var deferred = $q.defer(),
				promise = deferred.promise,
				ndeferred, count = 0;
			var x = 0, xlen = values.length;
			for ( x = 0; x < xlen; x += 1 ) {
				if ( true === values[ x ][ 1 ] ) {
					promise = promise.then( (function(attr) {
						var deferred2 = $q.defer();
						return function() {
							    var start = 2013,
								stacklist = [],
								stack_count = 0,
								addCount = 0,
								addLimit = cmdargs.limit,
								stack_length = 0,
								in_progress = false,
								processNext = function(context) {
								    if ( 0 === stacklist.length ) {
									deferred2.resolve({ range: attr, count: stack_count });
									//scope.downloaded[ attr ] = stack_count;
									//localStorage.setItem('dash-demo-downloaded', JSON.stringify( scope.downloaded ) );
								    }
								    if(!in_progress && stacklist.length > 0) {
									in_progress = true;
									doNext(stacklist.shift());
									deferred2.notify({ range: attr, count: stack_count, context: context });
								    }
								},
								doNext = function(next) {
							 	    stack_count += 1;
								    dash.add.entry({
									database: 'dash-demo',
									store: 'imdb',
				  					index: 'season',
									index_key_path: 'sy',
									auto_increment: true,
									store_key_path: null,
									data: next,
									throttle: 100
								    })
								    (function(context) {
									in_progress = false;
									system.add( { id: context.key } );
									statsUpdate('adds');
									scope.progress[ attr ] = context;

									if ( !addLimit || ( addCount++ < addLimit ) ) {
										processNext(context);
									}
								    }, function(context) {
									in_progress = false;
									processNext(context);
								    });
								};
								    $http( {
									method: 'GET',
									url: '/docs/demo/data/' + attr + '.json'
								    }).success(function(data, status, headers, config) {
									var x = 0, xlen = data.length;
									for ( x = 0; x < xlen; x += 1 ) {
										stacklist.push( data[ x ] );
									}
									stack_length = stacklist.length;
									processNext();
								    }).error( function(data, status, headers, config) {
									console.log('error',data, status, headers, config);
								    });
							return deferred2.promise;
						}
					}(values[x][0])) );
				} else {
					promise = promise.then( (function(attr) {
						var deferred2 = $q.defer();
						return function() {
							deferred2.notify({range: attr});
							deferred2.resolve({range: attr});
							return deferred2.promise;
						}
					}(values[x][0])) );
				}
			}
			promise.then( function(args) {
			    var ctx = {
				  database: 'dash-demo',
				  store: 'imdb',
				  auto_increment: true,
				  store_key_path: 'id',
				  index: 'season',
				  index_key_path: 'sy',
				  limit: cmdargs.limit,
				  key: new Date('1/1/' + args.range).getTime()
				},
				dash_promise = dashWorkerService.get.entries(ctx),
				start_promise = new Date().getTime();
			    dash_promise.then( function(context) {
				statsUpdate('complete', 'gets', context.amount, new Date().getTime() - start_promise);
			    }, function(context) {
				console.log('dash promise rejected', context);
			    }, function(context) {
				system.add(context.entry);
				statsUpdate('gets');
				//system.cameraMod( 'z', -2, 50000, 10 );
				//system.cameraMod( 'z', 1, 10000, 0 );
			    });

			}, null, function(args) {
				//console.log('notify',args);
			} );
			deferred.resolve();
		};
		dashAppSplashBroadcast.subscribe(function(data) {
			scope.$apply( function() {
				scope.data = data;
			} );
		});
            };
        }
    };
} ]  );




dashApp.directive('markdown', function () {
    var converter = new Showdown.converter();
    return {
        restrict: 'AE',
        link: function (scope, element, attrs) {
            if (attrs.markdown) {
                scope.$watch(attrs.markdown, function (newVal) {
                    if (!newVal) {
                        return;
                    }
                    var html = converter.makeHtml(newVal);
                    element.html(html);
                });
            } else {
                var text = element.text(),
                    html = text ? converter.makeHtml(element.text()) : '';
                element.html(html);
            }
        }
    };
});

dashApp.factory( 'dashWorkerService', [ '$q', function( $q ) {
	var worker = new Worker( '/lib/dash.dev.js' ),
            queue = {},
	    methods = [
	      'add.entry',
	      'count.entries',
	      'get.database',
	      'get.databases',
	      'get.store',
	      'get.stores',
	      'get.index',
	      'get.indexes',
	      'get.entry',
	      'get.entries',
	      'update.entries',
	      'put.entry',
	      'clear.store',
	      'remove.database',
	      'remove.store',
	      'remove.index',
	      'remove.entry',
	      'remove.entries'
	    ],
	    register = function( message, context, success, error, notify) {
                var random = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
		    count = 16,
		    x = 0,
		    xlength = 0,
		    strlen = random.length,
                    str = [],
		    id;
		for ( x = 0; x < count; x += 1 ) {
			str.push( random[ Math.floor( Math.random() * 100 ) % strlen ] );
		}
		id = str.join('');
		queue[ id ] = {
			success: success,
			error: error,
			notify: notify
		};
		worker.postMessage({ dash: message, context: context, uid: id });
	    },
	    send = function( message, context ) {
		var deferred = $q.defer();
		register( message, context, function(data) {
			deferred.resolve(data);
		}, function(data) {
			deferred.reject(data);
		}, function(data) {
			deferred.notify(data);
		} );
                return deferred.promise;
	    },
	    API = {},
	    y = 0,
	    ylen = methods.length,
            method,
	    commands;
        worker.addEventListener( 'message', function(e) {
	    var data = e.data,
		queued = queue[ data.uid ];
	    if ( undefined !== queued ) {
	    	switch( e.data.type ) {
			case 'success':
				if ( 'function' === typeof queued.success ) {
					queued.success( data.context );
				}
				break;
				delete queue[ data.uid ];
			case 'error':
				if ( 'function' === typeof queued.error ) {
					queued.error( data.context );
				}
				break;
				delete queue[ data.uid ];
			case 'notify':
				if ( 'function' === typeof queued.notify ) {
					queued.notify( data.context );
				}
				break;
			default:
				break;
		}
            }
	} );
	for( y = 0; y < methods.length; y += 1 ) {
		method = methods[ y ];
	    	commands = method.split('.');
		if ( undefined === API[ commands[ 0 ] ] ) {
			API[ commands[ 0 ] ] = {};
		}	
		API[ commands[ 0 ] ][ commands[ 1 ]] = (function(signature) { return function(context) {
			return send(signature, context);
		}; }(method));

	}
	return API;
} ]);


