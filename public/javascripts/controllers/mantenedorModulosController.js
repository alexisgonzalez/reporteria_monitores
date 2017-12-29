reportMedias.controller('mantenedorModulosController',function($scope, $http,$cookies,$location,Notification,Title){
	$scope.tablaURL = "interior/mantenedor_modulos/tabla.html";
	$scope.modalURL = "interior/mantenedor_modulos/modal.html";
	$scope.formMod = {};
	$scope.loading = true;
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

	$scope.listarModulos = function(){
		$http.get('/mantenedor/listaModulos').then(function(result){
			$scope.modulos = result.data;
			$scope.loading = false;
			$scope.tablaURL = 'interior/mantenedor_modulos/tabla.html?upd='+Math.random();
			setTimeout($scope.startDataTable,1000);
		});	
	}
	$scope.listarModulos();

	$scope.editarModulo = function(data){
		$scope.formMod = data;
	}

	$scope.guardarModulo = function(){
		$http.post('/mantenedor/guardarModulo', $scope.formMod).then(function(result){
			if(result.data.save){
				Notification.success({message:"Modulo guardado correctamente.",delay:10000});
				$('#cerrarModal').click();
			}else
				Notification.error({message:"Intente mas tarde.",delay:10000});
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