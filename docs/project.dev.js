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

dashApp.controller('dashAppDocsController', [ '$scope', '$http', '$templateCache', function( $scope, $http, $templateCache ) {

    $scope.documents = [
        { path: 'overview',
            title: 'Overview',
            tags: [ 'general', 'quickstart', 'overview' ],
            children: [
                { 'path': 'overview/keys',
                    'title': 'Keys', children: []
                },
                { 'path': 'overview/records',
                    'title': 'Records', children: []
                },
                { 'path': 'overview/requests',
                    'title': 'Requests', children: []
                },
                { 'path': 'overview/security',
                    'title': 'Security', children: []
                },
                { 'path': 'overview/transactions',
                    'title': 'Transactions', children: []
                },
            ]
        },

        {   path: 'indexeddb',
            title: 'IndexedDB',
            hidden: true,
            tags: [ 'indexeddb', 'spec', 'overview', 'html5' ],
            'children': [
                { 'path': 'indexeddb/databases',
                    'title': 'Databases',
                    'children': [
                        { 'path': 'indexeddb/database/closing',
                            'title': 'Closing', children: []
                        },
                        { 'path': 'indexeddb/database/removing',
                            'title': 'Removing', children: []
                        },
                        { 'path': 'indexeddb/database/getting',
                            'title': 'Getting', children: []
                        },
                        { 'path': 'indexeddb/database/names',
                            'title': 'Names', children: []
                        },
                        { 'path': 'indexeddb/database/opening',
                            'title': 'Opening', children: []
                        },
                        { 'path': 'indexeddb/database/versionchanges',
                            'title': 'Version Changes', children: []
                        },
                        { 'path': 'indexeddb/database/versions',
                            'title': 'Versions', children: []
                        } ]
                },
                { 'path': 'indexeddb/entries',
                    'title': 'Entries',
                    'children': [
                        { 'path': 'indexeddb/entry/adding',
                            'title': 'Adding', children: [] },
                        { 'path': 'indexeddb/entry/getting',
                            'title': 'Getting', children: [] },
                        { 'path': 'indexeddb/entry/putting',
                            'title': 'Putting', children: [] },
                        { 'path': 'indexeddb/entry/removing',
                            'title': 'Removing', children: [] },
                        { 'path': 'indexeddb/entry/updating',
                            'title': 'Updating', children: [] }
                    ]
                },
                { 'path': 'indexeddb/indexes',
                    'title': 'Indexes',
                    'children': [
                        { 'path': 'indexeddb/index/creating',

                            'title': 'Creating', children: [] },
                        { 'path': 'indexeddb/index/getting',
                            'title': 'Getting', children: []},
                        { 'path': 'indexeddb/index/iterating',
                            'title': 'Iterating', children: [] },
                        { 'path': 'indexeddb/index/removing',
                            'title': 'Removing', children: []
                        }
                    ]
                },
                { 'path': 'indexeddb/keyranges',
                    'title': 'Keyranges',
                    'children': [
                        { 'path': 'indexeddb/keyrange/bounds',
                            'title': 'Bounds', children: [] },
                        { 'path': 'indexeddb/keyrange/direction',
                            'title': 'Direction', children: [] }
                    ]
                },
                { 'path': 'indexeddb/stores',
                    'title': 'Stores',
                    'children': [
                        { 'path': 'indexeddb/objectstore/clearing', 'title': 'Clearing', children: [] },
                        { 'path': 'indexeddb/objectstore/creating', 'title': 'Creating', children: [] },
                        { 'path': 'indexeddb/objectstore/getting', 'title': 'Getting', children: [] },
                        { 'path': 'indexeddb/objectstore/iteration', 'title': 'Iterating', children: [] },
                        { 'path': 'indexeddb/objectstore/keypaths', 'title': 'Keypaths', children: [] },
                        { 'path': 'indexeddb/objectstore/removing', 'title': 'Removing', children: [] }
                    ]
                },
                { 'path': 'indexeddb/cursors',
                    'title': 'Cursors', children: []
                }

            ]
        }
    ];
    var getPath = function(path) {
        return ['/docs/documents/', path, '.md' ].join('');
    }
    $scope.documentContent = function(path) {
        return $templateCache.get(getPath(path))[1];
    }
    console.log('docs controller', $scope.documents);
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

dashApp.controller('dashAppDocsContentController', [ function() {
    console.log('content controller');
}]);

dashApp.controller('dashAppDocsSidebarController', [ function() {
    console.log('sidebar controller');
    _.each( [], function() {

    });
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