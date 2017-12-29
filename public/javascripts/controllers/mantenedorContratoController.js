reportMedias.controller('mantenedorContratoController',function($scope, $http,$cookies,$location,Notification, Title){
	$scope.tablaURL = "interior/mantenedor_contrato/tabla.html";
	$scope.modalURL = "interior/mantenedor_contrato/formulario.html";
	$scope.formContrato = {};
	$scope.formPath = {};
	$('.loadingGif').hide();
	$('#contenido').hide();

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

	$scope.cargarContratos = function(){
		$('.loadingGif').show();
		$('#contenido').hide();
		$http.get("/mantenedor/getContratos").then(function(result){
			$scope.contratos=result.data;
			$scope.tablaURL = 'interior/mantenedor_contrato/tabla.html?upd='+Math.random();
			setTimeout($scope.startDataTable,500);
			$('.loadingGif').hide();
			$('#contenido').show();
			
		});
	}
	$scope.cargarContratos();


	$scope.agregarContrato = function(){
		$http.post("/mantenedor/agregarContrato",$scope.formContrato).then(function(result){
			if(result.data.save){
				$scope.cargarContratos();
				$('#cerrarModal').click();
				Notification.success({message:"Contrato guardado correctamente.",delay:10000});
			}
			else
				Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});
		});
	}

	$scope.startDataTable = function(){
		$scope.dataTable = $('#tabla').DataTable({
			scrollX:true,
			scrollY:"400px",
			scrollCollapse:true,
			paging:false,
			destroy: true,
			order: [[ 0, "asc" ]],
			columnDefs: [
				{ type: 'date-uk', targets: [0]}
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

	$scope.cambiarEstado = function(modo, data){
		$scope.registro = data;
		$scope.registro.modo = modo;
		$http.post("/mantenedor/estadoContrato",$scope.registro).then(function(result){
			if(result.data.save=='info'){
				Notification.info({message:"Contrato se encuentra vigente para: "+$scope.registro.ejecutivos+" ejecutiv@s, no se puede desactivar",delay:10000});
			}else if(result.data.save){
				$('#cerrarModal').click();
				$scope.cargarContratos();
				Notification.success({message:"Contrato "+modo+" correctamente.",delay:10000});
			}else{
				Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});
			}
		});
	}

	$scope.semanaCorrida = function(modo, data){
		$scope.registro = data;
		$scope.registro.modo = modo;
		$http.post("/mantenedor/semanaCorridaContrato",$scope.registro).then(function(result){
			if(result.data.save){
				$('#cerrarModal').click();
				$scope.cargarContratos();
				Notification.success({message:"Semana corrida "+modo+" correctamente.",delay:10000});
			}else{
				Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});
			}
		});
	}

	$scope.levantarModal = function(){
		$scope.formContrato = {};
	}

	
});
