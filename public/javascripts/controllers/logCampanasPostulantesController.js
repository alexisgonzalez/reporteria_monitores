reportMedias.controller('logCampanasPostulantesController',function($scope, $http,$cookies,$location,Notification, Title){
	$scope.tablaURL = 'interior/log_campanas_postulantes/tabla.html';
	$scope.formURL = 'interior/log_campanas_postulantes/form.html';
	$scope.tablaDetalleURL = 'interior/log_campanas_postulantes/tabla-detalle.html';
	$scope.formPath = {};
	$scope.dataTable = '';
	$scope.dataTable2 = '';
	$scope.formDetalle = {};

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

    $scope.listarCampanas = function(){
    	$http.get("/postulacion/listaCampanas").then(function(result){
    		$scope.lista = result.data;
    		$scope.tablaURL = "interior/log_campanas_postulantes/tabla.html?upd="+((1+Math.random())*1000);
   			if($scope.dataTable!='')
	   	    	$scope.dataTable.destroy(true);
	        setTimeout($scope.startDataTable,500);
    	});
    }

    $scope.listarCampanas();
    
    $scope.verDetalle = function(data){
    	$scope.formDetalle = data;
    	$http.post("/postulacion/listaCampanasDetalle",$scope.formDetalle).then(function(result){
    		$scope.listaDetalle = result.data;
    		$scope.tablaDetalleURL = "interior/log_campanas_postulantes/tabla-detalle.html?upd="+((1+Math.random())*1000);
   			if($scope.dataTable2!='')
	   	    	$scope.dataTable2.destroy(true);
	        setTimeout($scope.startDataTable2,500);
    	});
    }

	$scope.startDataTable = function(){
		$scope.dataTable = $('#tabla').DataTable({
			scrollX:true,
			info: false,
			scrollY:"400px",
			scrollCollapse:true,
			searching: false,
			paging:false,
			destroy: true,
			fixedColumns: {
				leftColumns: 1,
				rightColumns:4
			},
			order: [[ 0, "asc" ]],
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

	$scope.startDataTable2 = function(){
		$scope.dataTable2 = $('#tablaDetalle').DataTable({
			scrollX:true,
			info: false,
			scrollY:"400px",
			scrollCollapse:true,
			searching: false,
			paging:false,
			destroy: true,
			fixedColumns: {
				leftColumns: 1,
				rightColumns:4
			},
			order: [[ 0, "asc" ]],
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