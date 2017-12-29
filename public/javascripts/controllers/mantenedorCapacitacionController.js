reportMedias.controller('mantenedorCapacitacionController',function($scope, $http,$cookies,$location,Notification, Title){
	$scope.tablaURL = "interior/mantenedor_capacitacion/tabla.html";
	$scope.modalURL = "interior/mantenedor_capacitacion/form.html";
	$scope.filtroURL = "interior/mantenedor_capacitacion/filtro.html";
	$scope.detalleURL = "interior/mantenedor_capacitacion/detalle.html";
	$scope.tablaDetalleURL = "interior/mantenedor_capacitacion/detalle-capacitacion/tabla.html";
	$scope.graficoDetalleURL = "interior/mantenedor_capacitacion/detalle-capacitacion/grafico.html";
	$scope.modalDetalleURL = "interior/mantenedor_capacitacion/detalle-capacitacion/form.html";
	$scope.modalEjecutivaURL = "interior/mantenedor_capacitacion/detalle-capacitacion/form-detalle.html";
	$scope.form = {};
	$scope.formDetalle = {};
	$scope.formCapacitacion = {};
	$scope.formPath = {};
	$scope.dataTable = '';
	$scope.detalle = false;
	$scope.formEvaluar = {};
	$scope.formVal = {};
	$scope.evaluar = false;
	$scope.formEval = {};
	$scope.dataTable = '';
	$scope.dataTable2 = '';
	$scope.formAdicional = {};
	$scope.habilitarEstandar = false;

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

   	$http.get("/postulacion/listarGruposActivos").then(function(result){
   		$scope.listaGrupos = result.data;
   	});

   	$scope.listarCapacitaciones = function(){
   		$scope.detalle = false;
   		$http.post('/postulacion/listarCapacitaciones',$scope.form).then(function(result){
   			$scope.listaCapacitaciones = result.data;
	        $scope.tablaURL = "interior/mantenedor_capacitacion/tabla.html?upd="+((1+Math.random())*1000);
   			if($scope.dataTable!='')
	   	    	$scope.dataTable.destroy(true);
	        setTimeout($scope.startDataTable,500);
   		});
   	}

   	$scope.listarCapacitaciones();

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
		$scope.traerGrupos($scope.form);
	}

	$scope.traerGrupos = function(data){
		$scope.formCapacitacion = data;
		$http.post("/postulacion/listarGrupos",$scope.formCapacitacion).then(function(result){
			$scope.listarGruposDisponibles = result.data;
		});
	}

	$scope.guardarCapacitacion = function(){
		$scope.form.grupo = $scope.listarGruposDisponibles.asignado;
		$http.post('/postulacion/guardarCapacitacion',$scope.form).then(function(result){
			if(result.data.save){
				Notification.success({message:"Capacitación grabada correctamente.",delay:10000});
				$('.cerrarModal').click();
				$scope.listarCapacitaciones();
         	}
			else
				Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});  
		});
	}

	$scope.confirmDesactivarCapacitacion = function(data){
		$scope.formDelete = data;
		$scope.dialog = {
			titleDialog:'Eliminar capacitación',
			contentDialog:'¿Esta seguro que desea eliminar la capacitación '+$scope.form.ca_descripcion+'?',
			botonDialog:'Eliminar',
			callback:$scope.eliminarGrupo
		};
		$('#dialogConfirm').modal();
	}

	$scope.eliminarGrupo = function(data){
		$scope.formDelete = data;
		$http.post('/postulacion/estadoCapacitacion',$scope.formDelete).then(function(result){
         	if(result.data.save){
				Notification.success({message:"Estado cambiado correctamente.",delay:10000});
				$scope.listarCapacitaciones();
         	}
			else
				Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});  
        });
	}

	$scope.detalleCapacitacion = function(data){
		$scope.detalle = true;
		Title.setTitle("Capacitación "+data.ca_descripcion, '');
		$scope.formDetalle = data;
		$http.post('/postulacion/detalleCapacitacion',$scope.formDetalle).then(function(result){
			$scope.listaDetalleCapacitacion = result.data;
			console.log($scope.dataTable2);
			if($scope.dataTable2 != '')
	   	    	$scope.dataTable2.destroy(true);
	   	    setTimeout($scope.startDataTable2,500);
		});
	}

	$scope.levantarEvaluacion = function(data){
		$scope.detEditar = false;
		$scope.formVal = {};
		$scope.formEval = {};
		$scope.evaluar = false;
		$scope.estandarEval = {};
		$scope.formEvaluar = data;
		$scope.formEval.evpo_valor_estandarizado = null;
		$http.get('/postulacion/listaTipoEstandar').then(function(result){
			$scope.listaTipoEstandar = result.data;
		});
		$http.get('/postulacion/listaTipoEvaluacion').then(function(result){
			$scope.listaTipoEvaluacion = result.data;
		});
		$http.get('/postulacion/listaEtapa').then(function(result){
			$scope.listaEtapa = result.data;
		});
		$http.post('/postulacion/listaPostulantesGrupos',$scope.formEvaluar).then(function(result){
         	$scope.listaPostulantes = result.data;
        });
	}

	$scope.validarBuscarEstandar = function(data, grupo){
		$scope.habilitarEstandar = false;
		$scope.formVal.estandar = [];
		$scope.evaluar = false;
		$scope.estandarEval = {};
		$scope.formVal = data;
		$scope.formVal.grupo = grupo;
		if(data.tiev_id_tipo_evaluacion==14){
			$scope.confirmCalidad(data, grupo);
		}else{
			$http.post("/postulacion/buscarEstandar", $scope.formVal).then(function(result){
				if(result.data.status){
					$scope.formVal.estandar = result.data.data;
					$scope.evaluar = true;
					if(data.tiev_id_tipo_evaluacion == 5){
						$scope.formVal.estandar.es_valor_estandar = 1;
						$scope.habilitarEstandar = true;
					}
				}else{
					Notification.error({message:result.data.data,delay:10000});
				}
			});
		}
	}

	$scope.guardarEvaluacionGrupal = function(){
		$http.post("/postulacion/guardarEvaluacionGrupal", $scope.formVal).then(function(result){
			if(result.data.save){
				Notification.success({message:"Evaluación ingresada correctamente.",delay:10000});
				$(".cerrarModal").click();
				$scope.detalleCapacitacion($scope.formDetalle);
         	}
			else
				Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});  
		});
	}

	$scope.verCumplimiento = function(modo,id_estandar, valor, estandar, postulante){
		$scope.formEstandar = {es_id_estandar:id_estandar, evpo_valor:valor, es_valor_estandar:estandar, id_tipo_evaluacion:$scope.formVal.tiev_id_tipo_evaluacion};
		if(modo=='agregar')
			$scope.formEval.resultados[postulante].evpo_valor_estandarizado = null;
		$http.post("/postulacion/obtenerCumplimiento", $scope.formEstandar).then(function(result){
			if(modo=='agregar')
				$scope.formEval.resultados[postulante].evpo_valor_estandarizado = result.data;
			else(modo=='editar')
				$scope.formDetalleEditar.evpo_valor_estandarizado = result.data;

		});
		console.log(id_estandar, valor, estandar);
	}

	$scope.detallePostulante = function(postulante, info){
		$scope.detEditar = false;
		$scope.formPostulante = {postulante:postulante,info:info};
		$http.post("/postulacion/detallePostulante", $scope.formPostulante).then(function(result){
			$scope.listaPostulantes = result.data;
		});
	}

	$scope.startDataTable2 = function(){
		$scope.dataTable2 = $('.tablaDetalle').DataTable({
			scrollX:true,
			scrollY:"400px",
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
	$scope.confirmCalidad = function(datoEvaluacion, grupo){
		$scope.formAdicional.info = datoEvaluacion;
		$scope.formAdicional.grupo = grupo;
		$scope.dialog = {
			titleDialog:'Generar Nota de calidad',
			contentDialog:'¿Desea buscar las notas de calidad para el grupo '+grupo.gr_id_grupo+'?',
			botonDialog:'Buscar',
			callback:$scope.generarNotasDeCalidad
		};
		$('#dialogConfirm').modal();
	}

	$scope.generarNotasDeCalidad = function(){
		$http.post("/postulacion/generarNotasDeCalidad", $scope.formAdicional).then(function(result){
			if(result.data.save){
				Notification.success({message:result.data.msje,delay:10000});
				$(".cerrarModal").click();
				$scope.detalleCapacitacion($scope.formDetalle);
         	}
			else
				Notification.error({message:result.data.msje,delay:10000});
		});
	}

	$scope.editarEvaluacion = function(data){
		$scope.detEditar = true;
		$scope.formDetalleEditar = data;
	}

	$scope.guardarEvaluacionUnica = function(){
		$http.post("/postulacion/guardarEvaluacionUnica", $scope.formDetalleEditar).then(function(result){
			if(result.data.save){
				Notification.success({message:"Evaluación ingresada correctamente.",delay:10000});
				$scope.detallePostulante($scope.formPostulante.postulante,$scope.formPostulante.info);
         	}
			else
				Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});  
		});
	}

});
