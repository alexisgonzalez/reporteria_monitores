reportMedias.controller('mantenedorTramoCalidadController',function($scope, $http,$cookies,$location,Notification,Title){
	$scope.tablaURL = 'interior/mantenedor_tramo_calidad/tabla.html';
	$scope.formURL = 'interior/mantenedor_tramo_calidad/crear.html';
	$scope.detalleURL = "interior/mantenedor_tramo_calidad/detalle.html";
	$scope.formTramoCalidad={};
	$scope.formPath = {};
	$scope.paises = {};
	
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

	$scope.cargaLista = function(){
		$http.get('/mantenedor/getTramoCalidad').then(function(result){
			console.log(result.data);
			$scope.list = result.data;
			$scope.tablaURL = 'interior/mantenedor_tramo_calidad/tabla.html?upd='+Math.random();
			setTimeout($scope.startDataTable,500);
		});
		$http.get('/mantenedor/paises')
		.then(function(result){
			$scope.paises = result.data;
		});
	}

	$scope.cargaLista();

	$scope.startDataTable = function(){
		$scope.dataTable = $('#tabla').DataTable({
			scrollX:true,
			scrollY:"500px",
			scrollCollapse:true,
			paging:false,
			destroy: true,
			order: [[ 4, "asc" ]],
			columnDefs: [
				{ type: 'date-uk', targets: [2,3]}
			],
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

	$scope.guardarTramo = function(){
		$http.post("/mantenedor/guardarTramoCalidad",$scope.formTramoCalidad).then(function(result){
			if(result.data.save){
				$scope.cargaLista();
				Notification.success({message:"Sueldo guardado correctamente.",delay:10000});
				$scope.limpiarForm();
				$('#cerrarModal').click();
			}
			else{
				Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});
			}
		});
	}

	$scope.limpiarForm = function(){
		$('#tramo').val('');
		$('#bono').val('');
		$('#date').val('');
	}

	$scope.verDetalle = function(data){
		$scope.detalle = data;
		console.log($scope.detalle);
		$http.post("/mantenedor/detalleTramoCalidad",$scope.detalle).then(function(result){
			$scope.listDetalle = result.data['lista'];
			$scope.ptje = result.data['ptje'];
		});
	}

	$scope.cambiarEstado = function(data, modo){
		$scope.registro = data;
		//console.log($scope.registro);
		if(modo == "desactivado") $scope.registro.modo = 0;
		else $scope.registro.modo = 1;
		$http.post("/mantenedor/cambiarEstadoTramoCalidad",$scope.registro).then(function(result){
			if(result.data.save){
				$('#cerrarModal').click();
				$scope.cargaLista();
				$scope.verDetalle($scope.registro);
				Notification.success({message:"Tramo "+modo+" correctamente.",delay:10000});
			}else{
				Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});
			}
		});
	}
});