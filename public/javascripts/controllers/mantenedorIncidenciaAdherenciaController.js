reportMedias.controller('mantenedorIncidenciaAdherenciaController',function($scope, $http,$cookies,$location,Notification,Title){
	$scope.tablaURL = "interior/mantenedor_incidencia_adherencia/tabla.html";
	$scope.filtroURL = "interior/mantenedor_incidencia_adherencia/filtro.html";
	$scope.formIncidencia = {};
	$scope.class_desc = "col-lg-12";
	$scope.multiple = false;
	$scope.only = true;
	$scope.masivo = false;
	$scope.ok = ($cookies.nivel==9 || $cookies.nivel==27) ? true : false;
	$scope.loading =true;
	$scope.guardando = false;
	$scope.formPath = {};
	$scope.formFiltro = {};

	$http.get('/listOperador').then(function(result){
		$scope.ejecutivos = result.data;
	});

	$http.get('/listTipo').then(function(result){
		$scope.tipo = result.data;
	});

	$http.get('/tipoPermiso').then(function(result){
		$scope.permisos = result.data;
	});

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

	$scope.listadoIncidencias = function(){
		$scope.loading = true;
		$scope.formFiltro.reporte = false;
		$http.post('/listaIncidenciasAdherencia',$scope.formFiltro).then(function(result){
			$scope.incidencia = result.data;
			$scope.tablaURL = "interior/mantenedor_incidencia_adherencia/tabla.html?upd="+Math.random();
			setTimeout($scope.startDataTable,1000);
			$scope.loading = false;
			$scope.guardando = false;
		});
	}

	$scope.listadoIncidencias();

	$scope.cambioTipo = function(){
		if ($scope.formIncidencia.tipo == 33 || $scope.formIncidencia.tipo == 32 || $scope.formIncidencia.tipo == 34 || $scope.formIncidencia.tipo == 35){//Si es validacion o permiso debe ingresar hora
			$('.hora').show();
			$('.periodo').hide();
		} else {
			$('.hora').hide();
			$('.periodo').show();
		}

		if($scope.formIncidencia.tipo == 33 || $scope.formIncidencia.tipo == 34 || $scope.formIncidencia.tipo == 35){
				$scope.formIncidencia.masiva=false;
				$scope.masivo = true;
				$scope.multiple = true;
				$scope.only = false;
		}else {
				$scope.masivo = false;
				$scope.multiple = false;
				$scope.only = true;
				$scope.formIncidencia.operador = [];
				$scope.formIncidencia.masiva = [];
		}
		if ($scope.formIncidencia.tipo == 32){ //Si es tipo permiso, debe indicar el tipo de este	
			$('.permiso').show();
			$scope.cambioPermiso();
			$scope.class_desc = "col-lg-6";
		} else {
				$('.permiso').hide();
				$('.recupero').hide();
				$scope.class_desc = "col-lg-12";
		}
	}
	
	$scope.cambioMasivo = function(){
		if($scope.formIncidencia.masiva)
		{
			$scope.multiple = false;
			$scope.formIncidencia.operador = [];
		}
		else
			$scope.multiple = true;
	}

	$scope.cambioPermiso = function(){
		if($scope.formIncidencia.permiso == 1){ //Si es tipo permiso, debe indicar el tipo de este
			$('.recupero').show();
			$scope.class_desc = "col-lg-4";
		} else{
			$('.recupero').hide();
			$scope.class_desc = "col-lg-6";
		}
	}

	$scope.guardarIncidencia = function(){
		var save = true;
		$scope.formIncidencia.date_end = ($scope.formIncidencia.hasOwnProperty('date_end')) ? $scope.formIncidencia.date_end:$scope.formIncidencia.date_begin;
		var cant_dias = $scope.countDays($scope.formIncidencia.date_begin,$scope.formIncidencia.date_end);
		$scope.formIncidencia.cant_dias = cant_dias;
		$http.post('/guardarIncidencia',$scope.formIncidencia).then(function(result){
			if(result.data.save){
				Notification.success({message:result.data.msje,delay:10000});
				$scope.listadoIncidencias();
			}
			else if(!result.data.save){
				Notification.error({message:result.data.msje,delay:10000});
				$scope.listadoIncidencias();
			}
			if(result.data.list!='')
				Notification.error({message:"Ejecutivas sin id vibox: "+result.data.list,delay:10000});
		});
	}

	$scope.countDays = function(date_begin, date_end){
		var sep_begin = date_begin.split("/");
		var sep_end = date_end.split("/");
  		var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
  		var firstDate = new Date(sep_begin[2],sep_begin[1],sep_begin[0]);
  		var secondDate = new Date(sep_end[2],sep_end[1],sep_end[0]);
  		var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
  		return diffDays;
  	}

  	$scope.startDataTable = function(){
		$scope.dataTable = $('#tabla').DataTable({
			scrollX:true,
			scrollY:"200px",
			scrollCollapse:true,
			paging:false,
			destroy: true,
			fixedColumns: true,
			order: [[ 9, "desc" ]],
			columnDefs: [
				{ type: 'date-uk', targets: [3, 4, 5, 6, 7, 9]}
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

	$scope.confirmarRevision = function(resp, data){
		$scope.registro = data;
		$scope.registro.estado = (resp == 'aprobar') ? 1:0;
		$scope.dialog = {
			titleDialog:'Revisión incidencia:',
			contentDialog:'¿Esta seguro que quiere '+resp+' la incidencia '+data.incidencia+' - '+data.ejecutivo+'?',
			botonDialog:'Si',
			callback:$scope.revisionIncidencia
		};
		$('#dialogConfirm').modal();

	}

	$scope.revisionIncidencia = function(){
		$('#dialogConfirm').modal('hide');
		$scope.guardando = true;
		$http.post('/revisionIncidencia', $scope.registro).then(function(result){
			if(result.data.save){
				Notification.success({message:result.data.msje,delay:5000});
				$scope.listadoIncidencias();
			}
			else if(!result.data.save){
				Notification.error({message:msje,delay:5000});
			}
		});
	}

	$scope.exportData = function () {
        var blob = new Blob([document.getElementById('divTabla').innerHTML], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });
        saveAs(blob, "sio-calling-adherencia.xls");
    }

    	/****FUNCIONALIDADES BITACORA***/
	$scope.frmBitacora         = {};
	$scope.listaIncidencias    = [];
	$scope.listaTgs            = [];
	$scope.listaComunicaciones = [];
	$scope.listaResoluciones   = [];
	$scope.imagenOperador      = "";
	$scope.dataTableBitacora   = "";
	$scope.operador_bitacora   = "";
	$scope.bitacoras           = [];
	$scope.tablaBitacora    = 'interior/bitacoras/tabla_bitacora.html';
	$scope.isSupervisor = ($cookies.supervisor == 1) ? true:false;
	$scope.dataOperador = {};

	$scope.cargarBitacoraOperador = function(operador){
		$scope.operador_bitacora = operador;
		$http.get('/vibox/bitacoraOperador?operador='+operador)
			.then(function(result){
				if($scope.dataTableBitacora != "")
					$scope.dataTableBitacora.destroy(true);
				$scope.tablaBitacora = 'interior/bitacoras/tabla_bitacora.html?upd='+Math.random();
				$scope.bitacoras = result.data;
				setTimeout($scope.iniciarDataTableBitacora,300);
			});
		$http.get('/get_data_user?operador='+operador)
			.then(function(result){
				console.log(result);
				$scope.dataOperador = result.data.user;
			});
	}

	$scope.guardarBitacora = function(){
		$http.post('/bitacora/guardar',$scope.frmBitacora)
			.then(function(result){
				if(result.data.save)
					Notification.success({message:"Bitacora agregada correctamente.",delay:10000});
				else
					Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});
				$scope.cargarBitacoraOperador($scope.operador_bitacora);
			});
			$('#modalAgregarBitacora').modal("hide");
	}
	
	$scope.mostrarAgregarBitacora = function(){
		var supervisor = ($cookies.operadora == "6666") ? 'egonzalezm':$cookies.operadora;
		$scope.frmBitacora = {};
		$scope.postAgregarBitacora = {operador:$scope.operador_bitacora,supervisor:supervisor}
			$scope.imageDefault('images/operadores/'+$scope.operador_bitacora);
		$http.get('bitacora/idUsuariosBitacoras?operador='+$scope.operador_bitacora+"&supervisor="+supervisor)
			.then(function(result){
				$scope.frmBitacora = result.data;
			});
		$http.get('/cierresBitacora').then(function(result){
				$scope.listCierre = result.data;
		});
		$scope.cargaListasBitacora();
	}

	$scope.cargaListasBitacora = function(){
		$http.get('/bitacora/getListas')
			.then(function(result){
				$scope.listaIncidencias = result.data.incidencias;
				$scope.listaTgs = result.data.gestiones;
				$scope.listaComunicaciones = result.data.comunicaciones;
				$scope.listaResoluciones = result.data.resoluciones;
			});
	}
	$scope.imageDefault = function(url){
		$http.get(url).success(function(result){
            //$scope.imagenOperador = 'images/operadores/'+frmOperador.user
            if(result[0] == '<'){
            	$scope.imagenOperador = '/images/default.png';
            }else{
           		$scope.imagenOperador = url;
            }
            return url;
        }).error(function(){
            $scope.imagenOperador = '/images/default.png';
            //element.attr('src', '/images/default.png'); // set default image
        });
	}

	$scope.iniciarDataTableBitacora = function(){
		$scope.dataTableBitacora = $('#tablaBitacora').DataTable({
            scrollX:true,
            scrollY:"400px",
            scrollCollapse:true,
            paging:false,
            destroy: true,
            order: [],
            bFilter: false,
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

	$scope.mostrarHorario = function(user_id,operador){
		var baseUrl = $location.protocol()+"://"+$location.host()+":"+$location.port();
		window.open(baseUrl+'/#/reportes/mantenedorHorarioOperador?op_id='+user_id+'&code='+operador,'_blank');
	}

	$scope.is_cierre = function(){
		$scope.cierre = true;
		if($scope.frmBitacora.is_cierre){
			$scope.cierre = false;
			setTimeout($scope.iniciarTime,300);
		}
	}

	$scope.is_cierre();


	$scope.iniciarTime = function(){
		$scope.inputTimePicker = $('#time').timepicker({
			minuteStep: 1,
			showInputs: false,
			disableFocus: true,
			showMeridian: false
		});
	}

});
