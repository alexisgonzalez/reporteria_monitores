var reportMedias = angular.module('reportMedias', ['ngRoute','angular.morris-chart','ngCookies']);

reportMedias.config(function($routeProvider){
	$routeProvider
		.when('/reporteMedias',{
			templateUrl: 'interior/reporte_medias.html',
			controller: 'reportMediaController'
		}).when('/reporteHorario',{
			templateUrl: 'interior/reporte_horario/',
			controller: 'reportHorarioController'
		}).when('/reporteDomo',{
			templateUrl: 'interior/domo/',
			controller: 'reportDomoController'
		}).when('/buscarAudios',{
			templateUrl: 'interior/buscador_audios/',
			controller: 'BuscarAudiosController'
		}).when('/login',{
			templateUrl: 'interior/login/',
			controller: 'LoginController'
		}).otherwise({
            redirectTo: '/login'
        });
});