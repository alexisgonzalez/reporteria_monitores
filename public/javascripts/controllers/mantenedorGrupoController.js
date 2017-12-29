reportMedias.controller('mantenedorGrupoController',function($scope, $http,$cookies,$location,Notification,Title){
	$scope.tablaURL = "interior/mantenedor_grupos/tabla.html";
	$scope.modalAgregarURL = "interior/mantenedor_grupos/form-agregar.html";
	$scope.modalEditarURL = "interior/mantenedor_grupos/form-editar.html";
	$scope.filtroURL = "interior/mantenedor_grupos/filtro.html";
	$scope.modalDetalleURL = "interior/mantenedor_grupos/modal.html";
	$scope.tablaDetalleURL = "interior/mantenedor_grupos/tabla-detalle.html";
	$scope.formPath = {};
	$scope.form = {};
	$scope.dataTable = '';
	$scope.dataTable2 = '';
	$scope.seleccionarPostulantes = false;
	$scope.postulantes = {};

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

    $scope.cargarGrupos = function(){
    	$http.get('/postulacion/listarGrupos').then(function(result){
    		$scope.listaGrupos = result.data;
    		$scope.tablaURL = "interior/mantenedor_grupos/tabla.html?upd="+((1+Math.random())*1000);
    		if($scope.dataTable!='')
    			$scope.dataTable.destroy(true);
    		setTimeout($scope.startDataTable,500);
    	});
    }

    $scope.cargarGrupos();

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

	$scope.guardarGrupo = function(){
		$http.post('/postulacion/guardarGrupo',$scope.form).then(function(result){
         	if(result.data.save){
				Notification.success({message:"Grupo guardado correctamente.",delay:10000});
				$('.cerrarModal').click();
				$scope.cargarGrupos();
         	}
			else
				Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});  
        });
	}

	 $scope.startDatepicker = function(){
		$scope.datePicker =  $('.datepicker').datepicker({
	        language:"es",
	        daysOfWeekHighlighted: "0,6",
	        todayHighlight: true
    	});
	}

	$scope.confirmEliminarGrupo = function(data){
		$scope.form = data;
		$scope.dialog = {
			titleDialog:'Eliminar grupo',
			contentDialog:'¿Esta seguro que desea eliminar el grupo '+$scope.form.gr_descripcion+'?',
			botonDialog:'Eliminar',
			callback:$scope.eliminarGrupo
		};
		$('#dialogConfirm').modal();
	}

	$scope.eliminarGrupo = function(){
		$http.post('/postulacion/eliminarGrupo',$scope.form).then(function(result){
         	if(result.data.save){
				Notification.success({message:"Grupo eliminado correctamente.",delay:10000});
				$scope.cargarGrupos();
         	}
			else
				Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});  
        });
	}

	$scope.estadoGrupo = function(data){
		$scope.form = data;
		$http.post('/postulacion/estadoGrupo',$scope.form).then(function(result){
         	if(result.data.save){
				Notification.success({message:"Estado cambiado correctamente.",delay:10000});
				$scope.cargarGrupos();
         	}
			else
				Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});  
        });
	}

	$scope.verPortulantes = function(data){
		$scope.seleccionarPostulantes = false;
		$scope.form = data;
		$http.post('/postulacion/listaPostulantesGrupos',$scope.form).then(function(result){
         	$scope.listaPostulantes = result.data;
			$scope.tablaDetalleURL = "interior/mantenedor_grupos/tabla-detalle.html?upd="+((1+Math.random())*1000);
         	if($scope.dataTable2!='')
    			$scope.dataTable2.destroy(true);
	        setTimeout($scope.startDataTable2,500);
        });
	}

	$scope.startDataTable2 = function(){
		$scope.dataTable2 = $('#tablaDetalle').DataTable({
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
				"sEmptyTable": "No hay postulantes asignados",
				"sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ ",
				"sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0",
				"sInfoFiltered": "(filtrado de un total de _MAX_ )",
				"sInfoPostFix": "",
				"sSearch": "Buscar:",
				"sUrl": "",
				"sInfoThousands": ",",
				"sLoadingRecords": "Cargando...",
				"oAria": {
					"sSortAscending": ": Activar para ordenar la columna de manera ascendente",
					"sSortDescending": ": Activar para ordenar la columna de manera descendente"
				}
			}
        });
	}

	$scope.editarPostulantesGrupo = function(data){
		$scope.seleccionarPostulantes = true;
		$http.post('/postulacion/listaPostulantesSinGrupo',$scope.form).then(function(result){
       		$scope.listaPostulantesSinGrupo = result.data;	
        });
	}

	$scope.guardarPostulantes = function(){
		$scope.postulantes.grupo = $scope.form;
		$scope.postulantes.postulantes = $scope.listaPostulantes;
		$http.post('/postulacion/guardarPostulantesGrupo',$scope.postulantes).then(function(result){
       		if(result.data.save){
				Notification.success({message:"Grupo cambiado correctamente.",delay:10000});
				$scope.verPortulantes($scope.postulantes.grupo);
         	}
			else
				Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});  
        });
	}

	$scope.limpiarGrupo = function(){
		$scope.listaPostulantes = [];
	}

	$http.get('/postulacion/listaPaises').then(function(result){
		$scope.listaPaises = result.data;
	});
});
