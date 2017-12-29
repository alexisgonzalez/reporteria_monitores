reportMedias.controller('mantenedorValorEfectivoController',function($scope, $http, $cookies, $location,Notification,Title){
	$scope.tablaURL = "interior/mantenedor_valor_efectivo/tabla_valor_efectivo.html";
	$scope.modalForm = "interior/mantenedor_valor_efectivo/crear.html";
	$scope.modalDetalle = "interior/mantenedor_valor_efectivo/detalle.html";
	$scope.formValorEfectivo = {};
	$scope.cliente = "";
	$scope.servicio = "";
	$scope.paises = {};
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
		$http.get('/mantenedor/getListValorEfectivo').then(function(result){
			$scope.list = result.data['list'];
			$scope.clientes = result.data['clientes'];
			$scope.servicios = result.data['servicios'];
			$scope.tablaURL = 'interior/mantenedor_valor_efectivo/tabla_valor_efectivo.html?upd='+Math.random();
			setTimeout($scope.startDataTable,500);
		});
		$http.get('/mantenedor/paises')
		.then(function(result){
			$scope.paises = result.data;
		});
	}
	$scope.cargaLista();

	$scope.limpiarForm = function(){
		$('#id_cliente').val('');
		$('#id_servicio').val('');
		$('#velocidad').val('');
		$('#valor').val('');
		$('#descripcion').val('');
	}

	$scope.guardarValor = function(){
		$http.post("/mantenedor/guardarValorEfectivo",$scope.formValorEfectivo).then(function(result){
			if(result.data.save){
				$scope.cargaLista();
				Notification.success({message:"Valor guardado correctamente.",delay:10000});
				$scope.limpiarForm();
				$('#cerrarModal').click();
			}
			else{
				Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});
			}
		});
	}

	$scope.verDetalle = function(data){
		$scope.detalle = data;
		$http.post("/mantenedor/verDetalle",$scope.detalle).then(function(result){
			$scope.listaDetalle = result.data['lista'];
			$scope.cliente = result.data['cliente'];
			$scope.servicio = result.data['servicio'];
		});
	}

	$scope.startDataTable = function(){
		$scope.dataTable = $('#tabla').DataTable({
			scrollX:true,
			scrollY:"500px",
			scrollCollapse:true,
			paging:false,
			destroy: true,
			order: [[ 0, "asc" ]],
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

	$scope.cambiarEstado = function(data, modo){
		$scope.registro = data;
		console.log($scope.registro);
		if(modo == "desactivado") $scope.registro.modo = 0;
		else $scope.registro.modo = 1;
		$http.post("/mantenedor/cambiarEstadoValorEfectivo",$scope.registro).then(function(result){
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