reportMedias.controller('monitorCampañasController',function($scope, $http,$cookies,$location,Title){
	$scope.frmResumenPeriodo = {};
	$scope.dataHorario = [];
	$scope.dataHoras = {};
	$scope.busquedaResumen = false;
	$scope.tablaMonitor = 'interior/monitor_campanas/tabla.html';
	$scope.flagDia = false;
	$scope.isOpe = false;
	$scope.formPath = {};

	$scope.actualizarTitulo = function(){
		path = $location.path();
		$scope.formPath.path = path;
		$http.post('/tituloPagina',$scope.formPath).then(function(result){
			$scope.title = result.data;
			Title.setTitle($scope.title[0].mos_titulo_pagina, $scope.title[0].mos_descripcion);
			$('#wrapper.toggled').find("#sidebar-wrapper").find(".collapse").collapse('hide');
		});
	}

	$scope.actualizarTitulo();

	$scope.startCookies = function(){
		if(!angular.isUndefined($cookies.operadora) && (!angular.isUndefined($cookies.nivel) && parseInt($cookies.nivel) == 1)){
			$scope.isOpe = true;
		}
	}

	$scope.startCookies();

	$scope.traerHorario = function (){
		cant_days = $scope.countDays($scope.frmResumenPeriodo.date_begin,$scope.frmResumenPeriodo.date_end);
		console.log(cant_days);
		
		if(cant_days > 4){
			$scope.seconds_1 = 12000;
			$scope.seconds_2 = 12000;
			$scope.showLoading = true;
			$(".loadingGif").show();
		}
		$scope.flagDia = (cant_days == 0) ? true:false;
		$scope.frmResumenPeriodo.cant_days = cant_days;
		
		$http.post('/reportHorario',$scope.frmResumenPeriodo)
		.then(function(result){
			$scope.tablaUrl = 'interior/resumen_periodo/resumen_general.html?upd='+Math.random();
			$scope.dataHorario = result.data;
			$scope.busquedaResumen = true;
		});

	}

	$scope.countDays = function(date_begin, date_end){
    	var sep_begin = date_begin.split("/");
    	var sep_end = date_end.split("/");
    	var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
		var firstDate = new Date(sep_begin[2],sep_begin[1],sep_begin[0]);
		var secondDate = new Date(sep_end[2],sep_end[1],sep_end[0]);

		var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));

		return diffDays;
    }

    $scope.validarMonitor = function(formulario){
        $scope.validacion = false;
        angular.forEach(formulario, function(key, form){
            $scope.validacion = true;
        });
        return $scope.validacion;
    }
});