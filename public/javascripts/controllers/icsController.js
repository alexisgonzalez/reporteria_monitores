reportMedias.controller('icsController',function($scope, $http, $cookies, $location,Notification, Title){
	$scope.estadoICS = 0;
	$scope.formPath = {};
	$scope.tabla = 'interior/activacion_ics/tabla.html';

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

	$scope.verEstadoICS = function(){
		$http.get("/estadoEnvioICS")
		.then(function(result){
			console.log(result);
			$scope.estadoICS = result.data.estado;
		});
	}

	$scope.activacionICS = function(){
		console.log("asdasdsasd");
		$http.post('/activacionICS',{estado:$scope.estadoICS}).then(function(result){
			if(result.data.save){
				Notification.success({message:"Cambio estado guardado correctamente.",delay:10000});
				$scope.verEstadoICS();
			}
			else{
				Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});
			}
		});
	}
	$scope.verEstadoICS();
	
	$scope.resumenICS = function(){
		$http.get('/resumenEnvio').then(function(result){
			$scope.resumen = result.data.list;
			$scope.total = result.data.total;
		});
	}

	$scope.resumenICS();
});