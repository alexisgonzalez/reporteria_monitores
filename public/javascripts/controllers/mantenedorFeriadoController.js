reportMedias.controller('mantenedorFeriadoController',function($scope, $http,$cookies,$location,Notification,Title){
	$scope.tablaURL = "interior/mantenedor_feriado/tabla.html";
	$scope.modalURL = "interior/mantenedor_feriado/form.html";
	$scope.filtroURL = "interior/mantenedor_feriado/filtro.html";
	$scope.formFiltrarFeriado = {};
	$scope.formFeriado = {};
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

	$scope.cargarFeriados = function(){
		$('.loadingGif').show();
		$('#contenido').hide();
		$http.post("/mantenedor/getFeriados",$scope.formFiltrarFeriado).then(function(result){
			$scope.list=result.data;
			$scope.tablaURL = 'interior/mantenedor_feriado/tabla.html?upd='+Math.random();
			setTimeout($scope.startDataTable,500);
			$('.loadingGif').hide();
			$('#contenido').show();
			
		});
	}
	$scope.cargarFeriados();

	$scope.agregarFeriado = function(){
		$http.post("/mantenedor/agregarFeriado",$scope.formFeriado).then(function(result){
			if(result.data.save){
				$scope.cargarFeriados();
				$scope.formFeriado = {};
				$('#cerrarModal').click();
				Notification.success({message:"Feriado guardado correctamente.",delay:10000});
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

	$scope.cambiarEstado = function(data, modo){
		$scope.registro = data;
		if(modo == "desactivado") $scope.registro.modo = 0;
		else $scope.registro.modo = 1;
		$http.post("/mantenedor/cambiarEstadoFeriado",$scope.registro).then(function(result){
			if(result.data.save){
				$('#cerrarModal').click();
				$scope.cargarFeriados();

				Notification.success({message:"Feriado "+modo+" correctamente.",delay:10000});
			}else{
				Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});
			}
		});
	}

	$http.get("/listYear").then(function(result){
		$scope.listYear=result.data;
	});

	$scope.levantarModal = function(){
		$scope.formFeriado = {};
	}
});
