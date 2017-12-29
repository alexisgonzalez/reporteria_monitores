reportMedias.controller('mantenedorSueldoMinimoController',function($scope, $http,$cookies,$location,Notification,Title){
	$scope.tablaURL = "interior/mantenedor_sueldo_minimo/tabla.html";
	$scope.formURL = "interior/mantenedor_sueldo_minimo/crear.html";
	$scope.formSueldoMinimo = {};
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
		$http.get('/mantenedor/getSueldoMinimo').then(function(result){
			$scope.list = result.data;
			$scope.tablaURL = 'interior/mantenedor_sueldo_minimo/tabla.html?upd='+Math.random();
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
			scrollY:"400px",
			scrollCollapse:true,
			paging:false,
			destroy: true,
			fixedColumns: true,
			order: [[ 0, "desc" ]],
			columnDefs: [
				{ type: 'date-uk', targets: [1, 2]}
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

	$scope.guardarSueldo = function(){
		$http.post("/mantenedor/guardarSueldoMinimo",$scope.formSueldoMinimo).then(function(result){
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
		$('#sueldo').val('');
		$('#date').val('');
	}
});