reportMedias.controller('mantenedorTramoProduccionController',function($scope, $http,$cookies,$location,Notification,Title){
	$scope.tablaURL = 'interior/mantenedor_tramo_produccion/tabla.html';
	$scope.formURL = 'interior/mantenedor_tramo_produccion/crear.html';
	$scope.frmTramoProduccion={};
	$scope.clientesServicio = [];
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
	
	$scope.cargaLista = function(){
		$http.get('/mantenedor/getTramoProduccion').then(function(result){
			console.log(result.data);
			$scope.list = result.data;
			$scope.tablaURL = 'interior/mantenedor_tramo_produccion/tabla.html?upd='+Math.random();
			setTimeout($scope.startDataTable,1000);
		});
	}

	$scope.getClienteServicio = function(){
		$http.get('/mantenedor/getClienteServicio')
		.then(function(result){
			$scope.clientesServicio = result.data;
		});
	}

	$scope.cargaLista();
	$scope.getClienteServicio();

	$scope.startDataTable = function(){
		$scope.dataTable = $('#tabla').DataTable({
			scrollX:true,
			scrollY:"500px",
			scrollCollapse:true,
			paging:false,
			destroy: true,
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

	$scope.guardarTramo = function(){
		$http.post("/mantenedor/guardarTramoProduccion",$scope.frmTramoProduccion).then(function(result){
			if(result.data.save){
				$scope.cargaLista();
				Notification.success({message:"Tramo guardado correctamente.",delay:10000});
				$scope.limpiarForm();
				$('#cerrarModal').click();
			}
			else{
				Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});
			}
		});
	}

	$scope.limpiarForm = function(){
		$scope.frmTramoProduccion={};
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