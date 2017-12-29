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
    'daypilot',
    'colorpicker.module',
    'angular-sortable-view'
  ])
  .config(['$stateProvider','$urlRouterProvider','$ocLazyLoadProvider',function ($stateProvider,$urlRouterProvider,$ocLazyLoadProvider,$timeout,$cookies, $scope) {
    $ocLazyLoadProvider.config({
      debug:false,
      events:true,
    });

    $urlRouterProvider.otherwise('/reportes/index');


    $stateProvider
      .state('reportes', {
        abstract: true, // this state can not be activated itself and must be a parent
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
                    'scripts/directives/sidebar/sidebar.js',
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
                'bower_components/angular-chart.js/dist/angular-chart.css',
              ]
            })
          }
        }
      })
      .state('reportes.dashboardGeneral',{
        url:'/vistaMedias',
        controller: 'DashboardController',
        templateUrl: 'interior/dashboard_supervisor/index.html',
        resolve: {
          loadMyFile:function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name:'chart.js',
              files:[
                'bower_components/angular-chart.js/angular-chart.js',
                'bower_components/angular-chart.js/dist/angular-chart.css',
              ]
            })
          }
        }
      })
      .state('reportes.resumenPeriodo',{
        url:'/resumenPeriodo',
        templateUrl:'interior/resumen_periodo/',
        controller:'ResumenPeriodoController'
      })
      .state('reportes.monitorCampañas',{
        url:'/monitorCampañas',
        templateUrl:'interior/monitor_campanas/',
        controller:'monitorCampañasController'
      })
      .state('reportes.liquidacionOperador',{
        url:'/liquidacionOperador',
        templateUrl:'interior/liquidacion_operador',
        controller:'liquidacionOperadorController'
      })
      .state('reportes.liquidacionOperadorPeru',{
        url:'/liquidacionOperadorPeru',
        templateUrl:'interior/liquidacion_operador_peru',
        controller:'liquidacionOperadorPeruController'
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
      .state('reportes.mantenedorMetas',{
        url:'/mantenedorMetas',
        templateUrl:'interior/mantenedor_metas/',
        controller:'mantenedorMetaController'
      })
      .state('reportes.monitorAdherencia',{
        url:'/monitorAdherencia',
        templateUrl:'interior/monitor_adherencia/',
        controller:'monitorAdherenciaController'
      })
      .state('reportes.mantenedorSupervisores',{
        url:'/mantenedorSupervisores',
        templateUrl:'interior/mantenedor_supervisor/',
        controller:'mantenedorSupervisorController'
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
      .state('reportes.retroCalidad',{
        url:'/retroCalidad',
        templateUrl:'interior/retro_calidad',
        controller:'retroCalidadController'
      })
      .state('reportes.mantenedorValorEfectivo',{
        url:'/mantenedorValorEfectivo',
        templateUrl:'interior/mantenedor_valor_efectivo',
        controller:'mantenedorValorEfectivoController'
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
      .state('reportes.gestionesProduccion',{
        url:'/gestionesProduccion',
        templateUrl:'interior/gestiones_produccion',
        controller:'gestionesProduccionController',
        resolve: {
          loadMyFile:function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name:'tooltips',
              files:[
                'bower_components/angular-tooltips/dist/angular-tooltips.js',
              ]
            })
          }
        }
      })
      .state('reportes.mantenedorIncidenciaAdherencia',{
        url:'/mantenedorIncidenciaAdherencia',
        templateUrl:'interior/mantenedor_incidencia_adherencia',
        controller:'mantenedorIncidenciaAdherenciaController'
      })
      .state('reportes.mantenedorIncidencia',{
        url:'/mantenedorIncidencia',
        templateUrl:'interior/mantenedor_incidencia',
        controller:'mantenedorIncidenciaController'
      })
      .state('reportes.mantenedorTramoProduccion',{
        url:'/mantenedorTramoProduccion',
        templateUrl:'interior/mantenedor_tramo_produccion',
        controller:'mantenedorTramoProduccionController'
      })
      .state('reportes.mantenedorBrechaCosto',{
        url:'/mantenedorBrechaCosto',
        templateUrl:'interior/mantenedor_brecha_costo',
        controller:'mantenedorBrechaCostoController'
      })
      .state('reportes.agregarAgendamiento',{
        url:'/agregarAgendamiento',
        templateUrl:'interior/agregar_agendamiento',
        controller:'agregarAgendamientoController'
      })
      .state('reportes.listaAgendamiento',{
        url:'/listaAgendamiento',
        templateUrl:'interior/lista_agendamiento/',
        controller: 'listaAgendamientoController'
      })
      .state('reportes.costoefectivo',{
        url:'/costoPorEfectivos',
        templateUrl:'interior/costo_efectivos/',
        controller: 'costoEfectivosController'
      })
      .state('reportes.tiempoReal',{
        url:'/tiempoReal',
        templateUrl:'interior/monitor_tiempo_real/',
        controller: 'monitorTiempoRealController'
      })
      .state('reportes.llamadosGraph',{
        url:'/llamadosGraph',
        templateUrl:'interior/monitor_llamado_graph/',
        controller: 'monitorGraphLlamadoController',
        resolve: {
          loadMyFile:function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name:'chart.js',
              files:[
                'bower_components/angular-chart.js/dist/angular-chart.js',
                'bower_components/angular-chart.js/dist/angular-chart.css',
              ]
            })
          }
        }
      })
      .state('reportes.estadoMeta',{
        url:'/estadoMeta',
        templateUrl:'interior/monitor_metas/',
        controller: 'monitorMetaController',
        resolve: {
          loadMyFile:function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name:'chart.js',
              files:[
                'bower_components/angular-chart.js/dist/angular-chart.js',
                'bower_components/angular-chart.js/dist/angular-chart.css',
              ]
            })
          }
        }
      })
      .state('reportes.mantenedorPerfiles',{
        url:'/mantenedorPerfiles',
        templateUrl:'interior/mantenedor_perfiles/',
        controller: 'mantenedorPerfilesController'
      })
      .state('reportes.estadoICS',{
        url:'/estadoEnvioICS',
        templateUrl:'interior/activacion_ics/',
        controller: 'icsController'
      })
       .state('reportes.produccionOperador',{
        url:'/produccionOperador',
        templateUrl:'interior/produccion_operador/',
        controller: 'produccionOperadorController'
      })
       .state('reportes.monitorCalidad',{
        url:'/monitorCalidad',
        templateUrl:'interior/monitor_calidad/',
        controller: 'monitorCalidadController'
      })
      .state('reportes.index',{
        url:'/index',
        templateUrl:'interior/index/',
        controller: 'indexController'
      })
      .state('reportes.mantenedorUsuario',{
        url:'/mantenedorUsuario',
        templateUrl:'interior/mantenedor_usuario/',
        controller: 'mantenedorUsuarioController'
      })
      .state('reportes.mantenedorListaEncuesta',{
        url:'/mantenedorListaEncuesta',
        templateUrl:'interior/mantenedor_lista_encuesta/',
        controller: 'mantenedorListaEncuestaController'
      })
      .state('reportes.mantenedorContrato',{
        url:'/mantenedorContrato',
        templateUrl:'interior/mantenedor_contrato',
        controller:'mantenedorContratoController'
      })
      .state('reportes.mantenedorModulos',{
        url:'/mantenedorModulos',
        templateUrl:'interior/mantenedor_modulos',
        controller:'mantenedorModulosController'
      })
      .state('reportes.monitorGestiones',{
        url:'/gestionesTiempoReal',
        templateUrl:'interior/monitor_gestiones/',
        controller: 'monitorGestionesController'
      })
      .state('reportes.postulacion',{
        url:'/postulacion',
        templateUrl:'interior/postulacion/',
        controller: 'postulacionController'
      })
      .state('reportes.monitoreoMeta',{
        url:'/monitoreoMeta',
        templateUrl:'interior/monitoreo_meta/',
        controller: 'monitoreoMetaController',
        resolve: {
          loadMyFile:function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name:'chart.js',
              files:[
              'bower_components/angular-chart.js/dist/angular-chart.js',
              'bower_components/angular-chart.js/dist/angular-chart.css',
              ]
            })
          }
        }
      })
      .state('reportes.planificacionHorario',{
        url:'/planificacion_horario_ejecutivo',
        templateUrl:'interior/planificacion_hora_ejecutivo/',
        controller: 'planificacionHorarioController'
      })
      .state('reportes.reporteIncidenciaAdherencia',{
        url:'/reporteIncidenciaAdherencia',
        templateUrl:'interior/reporte_incidencia_adherencia',
        controller:'reporteIncidenciaAdherenciaController'
      })
      .state('reportes.mantenedorPaises',{
        url:'/mantenedorPais',
        templateUrl:'interior/mantenedor_pais',
        controller:'mantenedorPaisController'
      })
      .state('reportes.produccionNesting',{
        url:'/produccionNesting',
        templateUrl:'interior/produccion_operador_nesting',
        controller:'produccionOperadorNestingController'
      })
      .state('reportes.mantenedorGrupo',{
        url:'/mantenedorGrupo',
        templateUrl:'interior/mantenedor_grupos',
        controller:'mantenedorGrupoController'
      })
      .state('reportes.mantenedorEstandar',{
        url:'/mantenedorEstandar',
        templateUrl:'interior/mantenedor_estandar',
        controller:'mantenedorEstandarController'
      })
      .state('reportes.mantenedorTipoEjecutiva',{
        url:'/mantenedorTipoEjecutiva',
        templateUrl:'interior/mantenedor_tipo_ejecutiva',
        controller:'mantenedorTipoEjecutivaController'
      })
      .state('reportes.mantenedorCapacitacion',{
        url:'/mantenedorCapacitacion',
        templateUrl:'interior/mantenedor_capacitacion',
        controller:'mantenedorCapacitacionController'
      })
      .state('reportes.cargaPostulante',{
        url:'/cargaPostulante',
        templateUrl:'interior/carga_postulante',
        controller:'cargaPostulanteController'
      })
      .state('reportes.mantenedorConfiguracionCampanas',{
        url:'/mantenedorConfiguracionCampanas',
        templateUrl:'interior/mantenedor_configuracion_campanas',
        controller:'mantenedorConfiguracionCampanasController'
      })
      .state('reportes.logCampanasPostulantes',{
        url:'/logCampanasPostulantes',
        templateUrl:'interior/log_campanas_postulantes',
        controller:'logCampanasPostulantesController'
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
    setTitle: function(title,descripcion){
      $rootScope.is = true;
      $rootScope.title = title;
      $rootScope.descripcion = descripcion;
    }
  }
}]);