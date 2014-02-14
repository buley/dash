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
    console.log('about controller');
}]);

dashApp.controller('dashAppDocsController', [ '$scope', '$http', '$templateCache', '$routeParams', function( $scope, $http, $templateCache, $routeParams ) {

    $scope.documents = [
        { path: 'overview',
            children: [
                { 'path': 'overview',
                    'title': 'Overview',
                    'default': true
                },
                { 'path': 'security',
                    'title': 'Security'
                },
                { 'path': 'transactions',
                    'title': 'Transactions'
                },
                { 'path': 'requests',
                    'title': 'Requests'
                },
                { 'path': 'records',
                    'title': 'Records'
                },
                { 'path': 'keys',
                    'title': 'Keys'
                },
                { 'path': 'databases',
                    'title': 'Databases',
                    'children': [
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
                            'title': 'Removing'
                        },
                        { 'path': 'database/getting',
                            'title': 'Getting',
                            'demos': [
                                { 'title': 'Getting Existing Databases Example: Simple Case',
                                    'id': 'dashdb/5ZWMg'
                                }
                            ]
                        },
                        { 'path': 'database/names',
                            'title': 'Names'
                        },
                        { 'path': 'database/opening',
                            'title': 'Opening'
                        },
                        { 'path': 'database/versionchanges',
                            'title': 'Version Changes'
                        },
                        { 'path': 'database/versions',
                            'title': 'Versions'
                        } ]
                },
                { 'path': 'entries',
                    'title': 'Entries',
                    'children': [
                        { 'path': 'entry/adding',
                            'title': 'Adding' },
                        { 'path': 'entry/getting',
                            'title': 'Getting' },
                        { 'path': 'entry/putting',
                            'title': 'Putting' },
                        { 'path': 'entry/removing',
                            'title': 'Removing' },
                        { 'path': 'entry/updating',
                            'title': 'Updating' }
                    ]
                },
                { 'path': 'indexes',
                    'title': 'Indexes',
                    'children': [
                        { 'path': 'index/creating',

                            'title': 'Creating' },
                        { 'path': 'index/getting',
                            'title': 'Getting'},
                        { 'path': 'index/iterating',
                            'title': 'Iterating' },
                        { 'path': 'index/removing',
                            'title': 'Removing'
                        }
                    ]
                },
                { 'path': 'keyranges',
                    'title': 'Keyranges',
                    'children': [
                        { 'path': 'keyrange/bounds',
                            'title': 'Bounds' },
                        { 'path': 'keyrange/direction',
                            'title': 'Direction' }
                    ]
                },
                { 'path': 'stores',
                    'title': 'Stores',
                    'children': [
                        { 'path': 'objectstore/clearing', 'title': 'Clearing' },
                        { 'path': 'objectstore/creating', 'title': 'Creating' },
                        { 'path': 'objectstore/getting', 'title': 'Getting' },
                        { 'path': 'objectstore/iteration', 'title': 'Iterating' },
                        { 'path': 'objectstore/keypaths', 'title': 'Keypaths' },
                        { 'path': 'objectstore/removing', 'title': 'Removing' }
                    ]
                },
                { 'path': 'cursors',
                    'title': 'Cursors'
                }

            ]
        }
    ];
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
    $scope.pathLevel = function(obj) {
        var current = $scope.currentTopic();
        return obj.default && '' === current || obj.path === current;
    };
}]);

dashApp.controller('dashAppDocsSidebarController', [ '$routeParams', '$scope', function($routeParams, $scope) {
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
        regx = new RegExp( '^' + current );
        match = ( null !== obj.path.match( regx ) ) ? true : false;
        others = child.path.split('/');
        others.pop();
        others = others.join('/');
        regx = new RegExp( '^' + others);
        return match || ( null !== current.match( regx ) ) ? true : false;
    };
}]);

dashApp.controller('dashAppDocsDemosController', [ '$scope', function( $scope ) {
    $scope.demos = function() {
        var current = $scope.currentDocument();
        return current.demos || [];
    };
}]);

dashApp.controller('dashAppSplashController', [ function() {
    console.log('splash controller');
}]);

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