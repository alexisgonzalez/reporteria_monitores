reportMedias.controller('mantenedorEstandarController',function($scope, $http,$cookies,$location,Notification,Title){
	$scope.tablaURL = "interior/mantenedor_estandar/tabla.html";
	$scope.modalAgregarURL = "interior/mantenedor_estandar/form-agregar.html";
	$scope.modalEditarURL = "interior/mantenedor_estandar/form-editar.html";
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

    $http.get('/postulacion/listaTipoEstandar').then(function(result){
    	$scope.listaTipoEstandar = result.data;
    });

    $http.get('/postulacion/listaTipoEvaluacion').then(function(result){
    	$scope.listaTipoEvaluacion = result.data;
    });

    $http.get('/postulacion/listaEtapa').then(function(result){
    	$scope.listaEtapa = result.data;
    });

    $scope.cargarEstandar = function(){
    	$http.get('/postulacion/listaEstandar').then(function(result){
    		$scope.listaEstandar = result.data;
    		$scope.tablaURL = "interior/mantenedor_estandar/tabla.html?upd="+((1+Math.random())*1000);
	            if($scope.dataTable!='')
	            	$scope.dataTable.destroy(true);
	        setTimeout($scope.startDataTable,500);
    	});
    }

    $scope.cargarEstandar();

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

	$scope.guardarEstandar = function(){
		$http.post('/postulacion/guardarEstandar',$scope.form).then(function(result){
			if(result.data.save){
				Notification.success({message:"Estándar guardado correctamente.",delay:10000});
				$('.cerrarModal').click();
				$scope.cargarEstandar();
         	}
			else
				Notification.error({message:result.data.msje,delay:10000});  
		});
	}

	$scope.confirmDesactivarEstandar = function(data){
		$scope.form = data;
		$scope.dialog = {
			titleDialog:'Desactivar estándar',
			contentDialog:'¿Esta seguro que desea desactivar el estándar '+$scope.form.es_id_estandar+'?',
			botonDialog:'Desactivar',
			callback:$scope.eliminarEstandar
		};
		$('#dialogConfirm').modal();
	}

	$scope.eliminarEstandar = function(){
		$http.post('/postulacion/eliminarEstandar',$scope.form).then(function(result){
         	if(result.data.save){
				Notification.success({message:"Estándar desactivado correctamente.",delay:10000});
				$scope.cargarEstandar();
         	}
			else
				Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});  
        });
	}

});
