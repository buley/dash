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
    console.log('docs controller');
    $scope.documents = [
        'overview',
        'databases',
        'stores'
    ];
    _.each( $scope.documents, function(slug) {
        $http.get(['/docs/documents/', slug, '.md' ].join(), { cache: $templateCache } );
    });
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

