reportMedias.controller('mantenedorTipoEjecutivaController',function($scope, $http,$cookies,$location,Notification,Title){
	$scope.tablaURL = "interior/mantenedor_tipo_ejecutiva/tabla.html";
	$scope.modalURL = "interior/mantenedor_tipo_ejecutiva/form.html";
	$scope.formPath = {};
	$scope.form = {};
	$scope.dataTable = '';

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

    $scope.cargarTipo = function(){
    	$http.get('/postulacion/listaTipoEjecutiva').then(function(result){
    		$scope.listaTipoEjecutiva = result.data;
    		$scope.tablaURL = "interior/mantenedor_tipo_ejecutiva/tabla.html?upd="+((1+Math.random())*1000);
	            if($scope.dataTable!='')
	            	$scope.dataTable.destroy(true);
	        setTimeout($scope.startDataTable,500);
    	});
    }
    $scope.cargarTipo();

    $scope.startDataTable = function(){
		$scope.dataTable = $('#tabla').DataTable({
			scrollX:true,
			scrollY:"500px",
			scrollCollapse:true,
			paging:false,
			destroy: true,
			order: [[ 0, "asc" ]],
			columnDefs: [
				{ type: 'date-uk', targets: [2]}
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

	$scope.levantarModal = function(modo, data){
		$scope.form = {};
		if(modo == 'editar')
			$scope.form = data;
		$scope.form.modo = modo;
	}

	$scope.guardarTipo = function(){
		$http.post('/postulacion/guardarTipo',$scope.form).then(function(result){
			if(result.data.save){
				Notification.success({message:"Tipo guardado correctamente.",delay:10000});
				$('.cerrarModal').click();
				$scope.cargarTipo();
         	}
			else
				Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});  
		});
	}

	$scope.confirmEliminarTipo = function(data){
		$scope.form = data;
		$scope.dialog = {
			titleDialog:'Eliminar tipo',
			contentDialog:'¿Esta seguro que desea eliminar el tipo '+$scope.form.tiej_nombre+'?',
			botonDialog:'Eliminar',
			callback:$scope.eliminarTipo
		};
		$('#dialogConfirm').modal();
	}

	$scope.eliminarTipo = function(){
		$http.post('/postulacion/eliminarTipo',$scope.form).then(function(result){
         	if(result.data.save){
				Notification.success({message:"Tipo eliminado correctamente.",delay:10000});
				$scope.cargarTipo();
         	}
			else
				Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});  
        });
	}

});
