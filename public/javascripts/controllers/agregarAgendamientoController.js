reportMedias.controller('agregarAgendamientoController',function($scope, $http, $cookies, $location,Notification, Title){
	$scope.frmAgregarAgenda = {};
	$scope.operadores = [];
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

	$scope.cargarOperadores = function(){
		$http.post('/listOperador', $scope.formLiquidacion).then(function(result){
			$scope.operadores=result.data;
			console.log($scope.operadores);
		});
	}
	$scope.cargarOperadores(); 
	$scope.agregarAgendamiento = function(){
		console.log($scope.frmAgregarAgenda);
		$http.post('/mantenedor/agregarAgenda',$scope.frmAgregarAgenda)
		.then(function(result){
			if(result.data.save){
				Notification.success({message:"Agenda guardada correctamente.",delay:10000});
				$scope.limpiarForm();
			}
			else{
				Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});
			}
		});
	}
});