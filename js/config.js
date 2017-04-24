/**
 * INSPINIA - Responsive Admin Theme
 *
 * Inspinia theme use AngularUI Router to manage routing and views
 * Each view are defined as state.
 * Initial there are written state for all view in theme.
 *
 */
function config($stateProvider, $urlRouterProvider, $ocLazyLoadProvider,$httpProvider) {
    $urlRouterProvider.otherwise("/index/main");

    $ocLazyLoadProvider.config({
        // Set to true if you want to see what and when is dynamically loaded
        debug: true
       , loadedModules: ['iNaprzod']
       // asyncLoader: require
    });

    $stateProvider

        .state('login', {

            url: "/login",
            templateUrl: "views/common/login.html",
        })
        .state('index', {
            abstract: true,
            url: "/index",
            templateUrl: "views/common/content.html",
        })
        .state('index.main', {
            url: "/main",
            templateUrl: "views/main.html",
            data: { pageTitle: 'Example view' }
        })
        .state('index.minor', {
            url: "/minor",
            templateUrl: "views/minor.html",
            data: { pageTitle: 'Example view' }
        })
        // CRM
        .state('crm', {
            url: "/crm",
            templateUrl: "views/common/content_100.html",
            data: { pageTitle: 'Lista kontrahentów - CRM'}
        })
        .state('crm.companys', {
            url: "/companys",
            templateUrl: "pl/egeria/companys/crmCompanys.html",
            data: { pageTitle: 'Lista kontrahentów - CRM'}
            //,resolve: {
            //    ListCompanysCtrl: function ($ocLazyLoad) {
            //        return $ocLazyLoad.load([
            //            {
            //               //serie: true,
            //                //name: 'ListCompanysCtrl',
            //                insertBefore: '#load_controllers_before',
            //                files: [ 'pl/egeria/companys/ListCompanysCtrl.js' ]
            //            }
            //        ]);
            //    }
            //}
            })
        .state('ctl', {
            url: "/ctl",
            templateUrl: "views/common/content_topmenu.html",
            //data: { pageTitle: 'Off canvas menu', specialClass: 'canvas-menu' }
            data: { pageTitle: 'Controlling', specialClass: 'canvas-menu' }
        })
        .state('ctl.mc', {
            url: "/ctl/mc",
            templateUrl: "pl/egeria/ctl/ctlKosztyJedenMc.html",
            data: { pageTitle: 'Controlling - koszty jeden mc', specialClass: 'canvas-menu'}
        })


    $httpProvider.interceptors.push('GlobalErrorHandler');
}
angular
    .module('iNaprzod')
    .config(config)
    .run(function($rootScope, $state) {
        $rootScope.$state = $state;

    });
