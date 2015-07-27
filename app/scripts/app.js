/*jslint
 browser: true,
 devel:true ,
 node:true,
 nomen: true,
 es5:true
 */

/**
 * @auth Gaurav Meena
 * @date 01/16/2014
 * This is the main router and controller handler file for angular MVC
 */

/*global angular*/

'use strict';
var DEV = true;
var ONPREM = false;
//var LOGINSTATE= false;

angular.module('odeskApp', [
    'angular-lodash',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ngAnimate',
    'braintree-angular',
    'ui.bootstrap',
    'chieffancypants.loadingBar',
    'ui.codemirror',
    'ui.select',
    'angularFileUpload',
    'ngClipboard'
]).config(function (cfpLoadingBarProvider) {

    /* this.spinnerTemplate = '<div id="loading-bar-spinner"><div class="spinner-icon"></div></div>';
    this.loadingBarTemplate = '<div id="loading-bar"><div class="bar"><div class="peg"></div></div></div>';*/

    cfpLoadingBarProvider.includeBar = false;
    /*cfpLoadingBarProvider.loadingBarTemplate = '<div ng-spinner-bar="" class="page-spinner-bar hide">  <div class="bounce1"></div>  <div class="bounce2"></div> <div class="bounce3"></div>  </div>';
    cfpLoadingBarProvider.spinnerTemplate= '<div ng-spinner-bar="" class="page-spinner-bar hide">  <div class="bounce1"></div>  <div class="bounce2"></div> <div class="bounce3"></div>  </div>';

*/

}).constant('udCodemirrorConfig', {
    codemirror: {
        lineWrapping: true,
        lineNumbers: true,
        mode: 'application/json',
        gutters: ['CodeMirror-lint-markers', 'CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        lint: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        foldGutter: true,
        styleActiveLine: true,
        theme: 'codenvy'
    }
}).config(function () {
    uiCodemirrorDirective.$inject = ["$timeout", "udCodemirrorConfig"];
}).factory('AuthInterceptor', function ($window, $cookies, $q, $location) {
    return {
        request: function (config) {



            //remove prefix url
            if (config.url.indexOf("http://nightly.codenvy-stg.com/api") == 0) {
                config.url = config.url.substring("http://nightly.codenvy-stg.com".length);
            }

            //Do not add token on auth login
            if (config.url.indexOf("/api/auth/login") == -1 && config.url.indexOf("api/") != -1 && $cookies.token) {
                config.params = config.params || {};
                angular.extend(config.params, {token: $cookies.token});
            }

            if (   typeof($cookies.token) === 'undefined' ) {
                // $log.info('Redirect to login page.');
                $location.path('/login');
            }

            return config || $q.when(config);
        },

        response: function (response) {

            console.log("response AuthInterceptor: " + response );

            if (response.status == 401 || response.status == 403 || response.status == 400 || response.status == 404 ||  typeof($cookies.token) === 'undefined' ) {
               // $log.info('Redirect to login page.');
                $location.path('/login');
            }else {

            }

            return response || $q.when(response);
        }
        ,

        responseError: function (rejection){

            //$location.path('/login');
            console.log(rejection.status);
            return $q.reject(rejection);
        }

    };
}).config(function ($routeProvider, $locationProvider, $httpProvider) {
    var DEFAULT;
    var BASE_URL;

    if (DEV) {
        /*DEFAULT = '/login';*/
        DEFAULT = '/dashbar';
        BASE_URL = '/';
    } else {
        DEFAULT = '/dashbar';
        BASE_URL = '/dashbar/';
    }

    if (DEV) {
        $httpProvider.interceptors.push('AuthInterceptor');
    }

    $routeProvider
        .when('/home', {
            templateUrl: BASE_URL + 'views/home.html',
            controller: 'DashboardCtrl',
            abstract:true
        })
        .when('/status', {
            templateUrl: BASE_URL + 'views/stats.html',
            controller: 'StatsCtrl'
        })
        .when('/dashbar', {
            templateUrl: BASE_URL + 'views/dashbar.html'
        })
        .when('/home/projects', {
            templateUrl: BASE_URL + 'views/dashboard.html',
            controller: 'DashboardCtrl'
        })
        .when('/dashboard', {
            templateUrl: BASE_URL + 'views/dashboard.html',
            controller: 'DashboardCtrl'
        })
        .when('/factories', {
            templateUrl: BASE_URL + 'views/factories.html',
            controller: 'FactoriesCtrl'
        })
        .when('/factory/:id', {
            templateUrl: BASE_URL + 'views/factorydetails.html',
            controller: 'FactoryCtrl'
        })
        .when('/stats', {
            templateUrl: BASE_URL + 'views/stats.html',
            controller: 'StatsCtrl'
        })
        .when('/runner', {
            templateUrl: BASE_URL + 'views/runner.html',
            controller: 'RunnerCtrl'
        })
        .when('/admin', {
            templateUrl: BASE_URL + 'views/admin.html',
            controller: 'AdminCtrl'
        })
        .when('/organizations', {
            templateUrl: BASE_URL + 'views/organization/workspaces.html',
            controller: 'OrganizationsCtrl'
        })
        .when('/organizations/members', {
            templateUrl: BASE_URL + 'views/organization/members.html',
            controller: 'OrganizationsCtrl'
        })
        .when('/organizations/workspace/:id', {
            templateUrl: BASE_URL + 'views/organization/workspace_info.html',
            controller: 'workspaceInfoCtrl'
        })
        .when('/organizations/workspace/:id/members', {
            templateUrl: BASE_URL + 'views/organization/workspace_members.html',
            controller: 'workspaceInfoCtrl'
        })
        .when('/organizations/:name', {
            templateUrl: BASE_URL + 'views/orgdetail.html',
            controller: 'OrgdetailCtrl'
        })
        .when('/account', {
            templateUrl: BASE_URL + 'account/profile.html',
            controller: 'ProfileCtrl'
        })
        .when('/account/profile', {
            templateUrl: BASE_URL + 'account/profile.html',
            controller: 'ProfileCtrl'
        })
        .when('/login', {
            templateUrl: BASE_URL + 'views/login.html',
            controller: 'LoginCtrl'
        })
        .otherwise({
            redirectTo: DEFAULT
        });
    if (!ONPREM) {
        $routeProvider
        .when('/account/subscriptions', {
                templateUrl: BASE_URL + 'account/subscription/subscriptions.html',
                controller: 'SubscriptionCtrl'
            })
        .when('/account/billing', {
                templateUrl: BASE_URL + 'account/billing/billing.html',
                controller: 'BillingCtrl'
        });
    }

    //while uncommenting line below fix # in navbar.js
    //$locationProvider.html5Mode(true);
}).directive('numbersOnly', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function (inputValue) {
                // this next if is necessary for when using ng-required on your input.
                // In such cases, when a letter is typed first, this parser will be called
                // again, and the 2nd time, the value will be undefined
                if (!inputValue) return ''
                var transformedInput = inputValue.replace(/[^0-9+.]/g, '');
                if (transformedInput != inputValue) {
                    modelCtrl.$setViewValue(transformedInput);
                    modelCtrl.$render();
                }
                return transformedInput;
            });
        }
    };
}).run(['$rootScope', function ($rootScope) {
    $rootScope.ONPREM = ONPREM;
}]);

angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
    .controller('CarouselController', ['$scope', '$timeout', '$transition', '$q', function ($scope, $timeout, $transition, $q) {
    }]).directive('carousel', [function () {
        return { }
    }]);