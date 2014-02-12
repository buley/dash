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

dashApp.controller('dashAppDocsController', [ '$scope', '$templateCache' function( $scope, $templateCache ) {
    console.log('docs controller');
    $scope.documentation = [ {
        'slug': 'overview',
        'description': $templateCache.get('/docs/documents/overview.md')
    } ];
}]);
dashApp.controller('dashAppDocsContentController', [ function() {
    console.log('content controller');
}]);
dashApp.controller('dashAppDocsSidebarController', [ function() {
    console.log('sidebar controller');
}]);
dashApp.controller('dashAppSplashController', [ function() {
    console.log('splash controller');
}]);

