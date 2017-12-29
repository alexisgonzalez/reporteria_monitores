reportMedias.controller('reportHorarioController',function($scope,$http,$templateCache,$location,$cookies,Notification,Title){
	$scope.frmFiltroHorario = {};
	$scope.dataHorario = [];
	$scope.busquedaHorario = false;
	$scope.callIniDataTable = false;
	$scope.dataTableBitacora = "";
	$scope.dataTable = "";
	$scope.dataTable2 = "";
	$scope.tablaUrl = 'interior/reporte_horario/tabla.html';
	$scope.showLoading = false;
	$scope.seconds_1 = 5000;
	$scope.seconds_2 = 3000;
	$scope.dialog = {};
	$scope.isOpe = false;
	$scope.colorVacaciones = "#19E542";
	$scope.colorLicencias = "#1960E5";
	$scope.colorPermisos = "#A42CCC";
	$scope.colorPermisosEsp = "#55557F";
	$scope.colorRecupero = "#E58C19";
	$scope.colorAusentes = "#E51919";
	$scope.flagDia = false;
	$scope.flagSameDay = false;
	$scope.widthColumns = 7;
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

	$scope.startCookies = function(){
		if(!angular.isUndefined($cookies.operadora) && (!angular.isUndefined($cookies.nivel) && parseInt($cookies.nivel) == 1)){
			$scope.isOpe = true;
			$("#reporteMediasLink").hide();
		}
	}
	$scope.startCookies();

	$scope.traerHorario = function (){
		cant_days = $scope.countDays($scope.frmFiltroHorario.date_begin,$scope.frmFiltroHorario.date_end);
		console.log(cant_days);
		busquedaHorario = false;
		if(cant_days > 4){
			$scope.seconds_1 = 12000;
			$scope.seconds_2 = 12000;
			$scope.showLoading = true;
			$(".loadingGif").show();
		}
		$scope.flagDia = (cant_days == 0) ? true:false;
		$scope.frmFiltroHorario.cant_days = cant_days;

		$http.post('/reportHorario',$scope.frmFiltroHorario)
		.then(function(result){
			$scope.widthColumns = (result.data.showEstado) ? 7:6;
			if($scope.callIniDataTable){
				$scope.dataTable.destroy(true);
				$scope.busquedaHorario = true;
				$scope.tablaUrl = 'interior/reporte_horario/tabla.html?upd='+Math.random();
				$scope.dataHorario = result.data;
				setTimeout($scope.iniciarDataTable,$scope.seconds_1);
				return;
			}
			$scope.tablaUrl = 'interior/reporte_horario/tabla.html?upd='+Math.random();
			$scope.dataHorario = result.data;
			$scope.busquedaHorario = true;
			setTimeout($scope.iniciarDataTable,$scope.seconds_2);
		});
	}

/*	$http.get('/reportHorario')
		.then(function(result){
			$scope.dataHorario = result.data;
			$scope.busquedaHorario = true;
			console.log($scope.dataHorario);
			setTimeout($scope.iniciarDataTable,2000);
			
		});*/

	$scope.iniciarDataTable = function (){
		$scope.showLoading = false;
		$(".loadingGif").hide();
		if(!$scope.callIniDataTable){
			$scope.dataTable = $('#tablaHH').DataTable({
	            scrollX:true,
	            scrollY:"400px",
	            scrollCollapse:true,
	            paging:false,
	            destroy: true,
	            fixedColumns:{
	            	leftColumns:2,
	            	rightColumns:5
	            },
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
			$scope.callIniDataTable = true;
		}else{
			$scope.dataTable = $('#tablaHH').DataTable({
	            scrollX:true,
	            scrollY:"400px",
	            scrollCollapse:true,
	            paging:false,
	            destroy: true,
	            fixedColumns:{
	            	leftColumns:1,
	            	rightColumns:5
	            },
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
	}

	$scope.isUndefined = function(variable){
		return angular.isUndefined(variable);
	}

	$scope.exportData = function () {
        var blob = new Blob([document.getElementById('divTabla').innerHTML], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });
        saveAs(blob, "Reporte.xls");
    };

    $scope.countDays = function(date_begin, date_end){
    	var sep_begin = date_begin.split("/");
    	var sep_end = date_end.split("/");
    	var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
		var firstDate = new Date(sep_begin[2],sep_begin[1],sep_begin[0]);
		var secondDate = new Date(sep_end[2],sep_end[1],sep_end[0]);

		var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));

		return diffDays;
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

	$scope.mostrarOperadorasExcepcion = function(dataOperador,title){
		$scope.dialog.titleDialog = "Operadores con "+title;
		$scope.dialog.contentDialog = dataOperador;
	}

	$scope.iniciarDataTableBitacora = function(){
		$scope.dataTableBitacora = $('#tablaBitacora').DataTable({
            scrollX:true,
            scrollY:"400px",
            scrollCollapse:true,
            paging:false,
            destroy: true,
            order: [],
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