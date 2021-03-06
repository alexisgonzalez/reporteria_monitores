'use strict';
/**
 * @ngdoc overview
 * @name reportMedias
 * @description
 * # reportMedias
 *
 * Main module of the application.
 */
 var reportMedias =
angular
  .module('reportMedias', [
    'oc.lazyLoad',
    'ui.router',
    'ui.bootstrap',
    'angular-loading-bar',
    'ngCookies',
    'ui-notification'
  ])
  .config(['$stateProvider','$urlRouterProvider','$ocLazyLoadProvider',function ($stateProvider,$urlRouterProvider,$ocLazyLoadProvider) {
    
    $ocLazyLoadProvider.config({
      debug:false,
      events:true,
    });

    $urlRouterProvider.otherwise('/reportes/buscarAudios');


    $stateProvider
      .state('reportes', {
        url:'/reportes',
        templateUrl: 'interior/container.html',
        resolve: {
            loadMyDirectives:function($ocLazyLoad){
                return $ocLazyLoad.load(
                {
                    name:'reportMedias',
                    files:[
                    'scripts/directives/header/header.js',
                    'scripts/directives/header/header-notification/header-notification.js',
                    'scripts/directives/sidebar/sidebar-cli2.js',
                    'scripts/directives/sidebar/sidebar-search/sidebar-search.js'
                    ]
                }),
                $ocLazyLoad.load(
                {
                   name:'toggle-switch',
                   files:["bower_components/angular-toggle-switch/angular-toggle-switch.min.js",
                          "bower_components/angular-toggle-switch/angular-toggle-switch.css"
                      ]
                }),
                $ocLazyLoad.load(
                {
                  name:'ngAnimate',
                  files:['bower_components/angular-animate/angular-animate.js']
                })
                $ocLazyLoad.load(
                {
                  name:'ngCookies',
                  files:['bower_components/angular-cookies/angular-cookies.js']
                })
                $ocLazyLoad.load(
                {
                  name:'ngResource',
                  files:['bower_components/angular-resource/angular-resource.js']
                })
                $ocLazyLoad.load(
                {
                  name:'ngSanitize',
                  files:['bower_components/angular-sanitize/angular-sanitize.js']
                })
                $ocLazyLoad.load(
                {
                  name:'ngTouch',
                  files:['bower_components/angular-touch/angular-touch.js']
                })
            }
        }
    })
      .state('reportes.reporteMedias',{
        url:'/reporteMedias',
        controller: 'reportMediaController',
        templateUrl: 'interior/reporte_medias.html',
        resolve: {
          loadMyFile:function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name:'chart.js',
              files:[
                'bower_components/angular-chart.js/dist/angular-chart.js',
                'bower_components/angular-chart.js/dist/angular-chart.css'
              ]
            })
          }
        }
      })
     .state('reportes.buscarAudios',{
        url:'/buscarAudios',
        templateUrl: 'interior/buscador_audios/',
        controller: 'BuscarAudiosController'
      })
      .state('login',{
        url:'/login',
        templateUrl: 'interior/login/',
        controller: 'LoginController'
      })
  }]).
  service('GlobalServices',['$http',function($http){
  return {
    getListaCamposDomo: function(){
      return $http({
        method: 'GET',
        url: '/listCamposDomo'
      });
    }
  }
}])
.service('Title',['$rootScope',function($rootScope){
  return {
   setTitle: function(title){
    $rootScope.title = title;
  }
}
}]);