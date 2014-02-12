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
                    'title': 'Keys'
                },
                { 'path': 'overview/records',
                    'title': 'Records'
                },
                { 'path': 'overview/requests',
                    'title': 'Requests'
                },
                { 'path': 'overview/security',
                    'title': 'Security'
                },
                { 'path': 'overview/transactions',
                    'title': 'Transactions'
                },
            ]
        },

        {   path: 'indexeddb',
            title: 'IndexedDB',
            tags: [ 'indexeddb', 'spec', 'overview', 'html5' ],
            children: [
                { 'path': 'indexeddb/cursors',
                    'title': 'Cursors'
                },
                { 'path': 'indexeddb/databases',
                    'title': 'Databases',
                    children: [
                        { 'path': 'indexeddb/database/closing',
                            'title': 'Closing'
                        },
                        { 'path': 'indexeddb/database/removing',
                            'title': 'Removing'
                        },
                        { 'path': 'indexeddb/database/getting',
                            'title': 'Getting'
                        },
                        { 'path': 'indexeddb/database/names',
                            'title': 'Names'
                        },
                        { 'path': 'indexeddb/database/opening',
                            'title': 'Opening'
                        },
                        { 'path': 'indexeddb/database/versionchanges',
                            'title': 'Version Changes'
                        },
                        { 'path': 'indexeddb/database/versions',
                            'title': 'Versions'
                        } ]
                },
                { 'path': 'indexeddb/entries',
                    'title': 'Entries',
                    children: [
                        { 'path': 'indexeddb/entry/adding',
                            title: 'Adding' },
                        { 'path': 'indexeddb/entry/getting',
                            'title': 'Getting' },
                        { 'path': 'indexeddb/entry/putting',
                            'title': 'Putting' },
                        { 'path': 'indexeddb/entry/removing',
                            'title': 'Removing' },
                        { 'path': 'indexeddb/entry/updating',
                            'title': 'Updating' }
                    ]
                },
                { 'path': 'indexeddb/indexes',
                    'title': 'Indexes',
                    'children': [
                        { 'path': 'indexeddb/index/creating',

                            'title': 'Creating' },
                        { 'path': 'indexeddb/index/getting',
                            'title': 'Getting'},
                        { 'path': 'indexeddb/index/iterating',
                            'title': 'Iterating' },
                        { 'path': 'indexeddb/index/removing',
                            'title': 'Removing'
                        }
                    ]
                },
                { 'path': 'indexeddb/keyranges',
                    'title': 'Keyranges',
                    'children': [
                        { 'path': 'indexeddb/keyrange/bounds',
                            'title': 'Bounds' },
                        { 'path': 'indexeddb/keyrange/direction',
                            'title': 'Direction' }
                    ]
                },
                { 'path': 'indexeddb/stores',
                    'title': 'Stores',
                    children: [
                        { 'path': 'indexeddb/objectstore/clearing', 'title': 'Clearing' },
                        { 'path': 'indexeddb/objectstore/creating', 'title': 'Creating' },
                        { 'path': 'indexeddb/objectstore/getting', 'title': 'Getting' },
                        { 'path': 'indexeddb/objectstore/iteration', 'title': 'Iterating' },
                        { 'path': 'indexeddb/objectstore/keypaths', 'title': 'Keypaths' },
                        { 'path': 'indexeddb/objectstore/removing', 'title': 'Removing' }
                    ]
                }
            ]
        }
    ];
    var getPath = function(path) {
        return ['/docs/documents/', path, '.md' ].join('');
    }
    $scope.documentContent = function(path) {
        return $templateCache.get(getPath(path));
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

