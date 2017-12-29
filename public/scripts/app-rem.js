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

    $urlRouterProvider.otherwise('/reportes/reporteHorario');


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
                    'scripts/directives/sidebar/sidebar-rem.js',
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
      .state('reportes.reporteHorario',{
        url:'/reporteHorario',
        templateUrl: 'interior/reporte_horario/',
        controller: 'reportHorarioController'
      })
       .state('reportes.mantenedorOperadoras',{
        url:'/mantenedorOperadoras',
        templateUrl:'interior/mantenedor_operador/',
        controller:'mantenedorOperadorController'
      })
      .state('reportes.mantenedorHorarioOperador',{
        url:'/mantenedorHorarioOperador',
        templateUrl:'interior/mantenedor_operador/horario/',
        controller:'mantenedorHorarioOperadorController'
      })
      .state('reportes.mantenedorSupervisores',{
        url:'/mantenedorSupervisores',
        templateUrl:'interior/mantenedor_supervisor/',
        controller:'mantenedorSupervisorController'
      })
      .state('reportes.mantenedorValorEfectivo',{
        url:'/mantenedorValorEfectivo',
        templateUrl:'interior/mantenedor_valor_efectivo',
        controller:'mantenedorValorEfectivoController'
      })
      .state('reportes.liquidacionOperador',{
        url:'/liquidacionOperador',
        templateUrl:'interior/liquidacion_operador',
        controller:'liquidacionOperadorController'
      })
      .state('reportes.mantenedorSueldoMinimo',{
        url:'/mantenedorSueldoMinimo',
        templateUrl:'interior/mantenedor_sueldo_minimo',
        controller:'mantenedorSueldoMinimoController'
      })
      .state('reportes.mantenedorTramoCalidad',{
        url:'/mantenedorTramoCalidad',
        templateUrl:'interior/mantenedor_tramo_calidad',
        controller:'mantenedorTramoCalidadController'
      })
      .state('reportes.mantenedorFeriado',{
        url:'/mantenedorFeriado',
        templateUrl:'interior/mantenedor_feriado',
        controller:'mantenedorFeriadoController'
      })
      .state('reportes.mantenedorContrato',{
        url:'/mantenedorContrato',
        templateUrl:'interior/mantenedor_contrato',
        controller:'mantenedorContratoController'
      })
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
