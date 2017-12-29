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
  'ui-notification',
  'ngFileUpload',
  'daypilot'
  ])
 .config(['$stateProvider','$urlRouterProvider','$ocLazyLoadProvider',function ($stateProvider,$urlRouterProvider,$ocLazyLoadProvider) {

  $ocLazyLoadProvider.config({
    debug:false,
    events:true,
  });

  $urlRouterProvider.otherwise('/reportes/dashboard');


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
          'scripts/directives/sidebar/sidebar-adhe.js',
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
  .state('reportes.dashboard',{
    url:'/dashboard',
    controller: 'DashboardController',
    templateUrl: 'interior/dashboard_supervisor/index.html',
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
  .state('reportes.reporteHorario',{
    url:'/reporteHorario',
    templateUrl: 'interior/reporte_horario/',
    controller: 'reportHorarioController'
  })
  .state('reportes.bitacoras',{
    url:'/bitacoras',
    templateUrl: 'interior/bitacoras/',
    controller: 'BitacoraController'
  })
  .state('reportes.reporteDomo',{
    url:'/reporteDomo',
    templateUrl: 'interior/domo/',
    controller: 'reportDomoController',
    resolve: {
      loadMyFile:function($ocLazyLoad) {
        return $ocLazyLoad.load({
          name:'chart.js',
          files:[
          'bower_components/angular-chart.js/dist/angular-chart.js',
          'bower_components/angular-chart.js/dist/angular-chart.css',
          'bower_components/Chart.js/Chart.min.js'
          ]
        })
      }
    }
  })
  .state('reportes.mantenedorOperadoras',{
    url:'/mantenedorOperadoras',
    templateUrl:'interior/mantenedor_operador/',
    controller:'mantenedorOperadorController'
  })
  .state('reportes.configuraciones',{
    url:'/campos-domo',
    templateUrl:'interior/configuraciones/campos_domo.html',
    controller:'configuracionController'
  })
  .state('login',{
    url:'/login',
    templateUrl: 'interior/login/',
    controller: 'LoginController'
  })
  .state('reportes.gestionesProduccion',{
    url:'/gestionesProduccion',
    templateUrl:'interior/gestiones_produccion',
    controller:'gestionesProduccionController'
  })
  .state('reportes.mantenedorIncidenciaAdherencia',{
    url:'/mantenedorIncidenciaAdherencia',
    templateUrl:'interior/mantenedor_incidencia_adherencia',
    controller:'mantenedorIncidenciaAdherenciaController'
  })
}])
.service('GlobalServices',['$http',function($http){
  return {
    getListaCamposDomo: function(){
      return $http({
        method: 'GET',
        url: '/listCamposDomo'
      });
    }
  }
}])
.directive('userName',['$cookies',function($cookies) {
  console.log($cookies);
  return {
    restrict: "E",
    template: "<span>"+$cookies.nombre+"</span>",
    replace: true,
  };
}])
.service('Title',['$rootScope',function($rootScope){
  return {
   setTitle: function(title){
    $rootScope.title = title;
  }
}
}]);
