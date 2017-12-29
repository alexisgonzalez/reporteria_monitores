reportMedias.controller('cargaPostulanteController',function($scope, $http, $cookies, $location,Notification, Title, Upload){
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
	$scope.formURL = "interior/carga_postulante/form.html";
    $scope.tablaURL = "interior/carga_postulante/tabla.html";
    $scope.formCarga = {};
    $scope.listaParaCarga = {};
    $scope.contenido = false;
    $scope.loading = false;
    $scope.listaColumnas = function(){
		$scope.desactivarSelect = false;
		$http.get("/postulacion/listaColumnasPostulaciones").then(function(result){
			$scope.listaColumnasPostulaciones = result.data;
		});
	}

	$scope.listaColumnas();

	$scope.cargarArchivo = function(){
        $scope.contenido = false;
        $scope.loading = false;
		$scope.upload($scope.formCarga.file);
	}

	$scope.upload = function (file) {
        $scope.armaLista($scope.listaColumnasPostulaciones);
        Upload.upload({
            url: '/postulacion/leerCabeceras',
            data: {file: file, 'username': 'prueba'}
        }).then(function (resp) {
        	$scope.cabeceras = resp.data.cabeceras;
            $scope.datosCarga = resp.data.data;
            $scope.contenido = true;
        });
    };

    $scope.cargarDatos = function(){
        $scope.formCargaDatos = {};
        $scope.formCargaDatos.ordenCarga = $scope.listaParaCarga;
        $scope.formCargaDatos.datos = $scope.datosCarga;
        $scope.formCargaDatos.listaColumnas = $scope.listaColumnasPostulaciones;
        $scope.loading = true;
        $http.post("/postulacion/cargarDatos",$scope.formCargaDatos).then(function(result){
            if(result.data.save){
                Notification.success({message:"Archivo cargado correctamente.",delay:10000});
                $scope.loading = false;
                $scope.contenido = false;
                $scope.formCarga = {};
            }
            else{
                Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});  
                $scope.loading = false;
            }

        });
    }

    $scope.armaLista = function(values){
        angular.forEach(values, function(value, key) {
            $scope.listaParaCarga[value.ccp_descripcion] = [];
        });
        console.log($scope.listaParaCarga);
    }

    $scope.cambio = function(id,key){
        console.log(id);
        console.log(key);
    }
});