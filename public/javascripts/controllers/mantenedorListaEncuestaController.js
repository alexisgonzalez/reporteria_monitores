reportMedias.controller('mantenedorListaEncuestaController',function($scope, $http, $cookies, $location,Notification,Title){
	$scope.frmListaEncuesta = {};
	$scope.listasEncuestas = [];
	$scope.listas = [];
	$scope.zonas = [];
	$scope.edit = false;
	$scope.tabla = "interior/mantenedor_lista_encuesta/tabla.html";
	$scope.dataTable = "";
	$scope.modalURL = "interior/mantenedor_lista_encuesta/form.html";
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

	$scope.getListasEncuestas = function(){
		$http.get("/mantenedor/listasEncuestas")
		.then(function(result){
			if($scope.dataTable != "")
				$scope.dataTable.destroy();
			$scope.listasEncuestas = result.data;
			$scope.tabla = "interior/mantenedor_lista_encuesta/tabla.html?upd="+((1+Math.random())*1000);
			setTimeout($scope.iniciarDataTable,500);
		});
	}

	$scope.getListasEncuestas();

	$scope.getListas = function(){
		$scope.edit = false;
		$scope.frmListaEncuesta = {};
		$http.get("/mantenedor/traerListas")
		.then(function(result){
			$scope.listas = result.data;
		});
	}

	$scope.getZonaPorLista = function(){
		$scope.lista_id = $scope.frmListaEncuesta.list_id;
		$http.get("/mantenedor/getZonaLista?list_id="+$scope.lista_id)
		.then(function(result){
			$scope.zonas = result.data;
		});
	}

	$scope.agregarListaEncuesta = function(){
		$http.post("/mantenedor/guardaListaEncuesta",$scope.frmListaEncuesta)
		.then(function(result){
			if(result.data.save){
				$("#formListaEncuesta").modal('hide');
				$scope.getListasEncuestas();
				Notification.success({message:"Limite guardado correctamente.",delay:10000});
			}
			else
				Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});
		});
	}
	$scope.editarListaEncuesta = function(data){
		$scope.frmListaEncuesta = data;
		$scope.edit = true;
		$("#formListaEncuesta").modal();
	}

	$scope.iniciarDataTable = function(){
		$scope.dataTable = $('#tablaListas').DataTable({
            scrollX:true,
            scrollY:"400px",
            scrollCollapse:true,
            paging:false,
            destroy: true,
            order: [],
            bFilter: false,
            language: {
                    "sZeroRecords": "No se encontraron resultados",
                    "sEmptyTable": "Ningún dato disponible en esta tabla",
                    "sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ ",
                    "sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0",
                    "sInfoFiltered": "(filtrado de un total de _MAX_ )",
                    "sInfoPostFix": "",
                    "sSearch": "Buscar:",
                    "sUrl": "",
                    "sInfoThousands": ",",
                    "sLoadingRecords": "Cargando...",
                    "oPaginate": {
                            "sFirst": "Primero",
                            "sLast": "Ultimo",
                            "sNext": "Siguiente",
                            "sPrevious": "Anterior"
                    },
                    "oAria": {
                            "sSortAscending": ": Activar para ordenar la columna de manera ascendente",
                            "sSortDescending": ": Activar para ordenar la columna de manera descendente"
                    }
            }
        });
	}
});