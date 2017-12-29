reportMedias.controller('monitorTiempoRealController',function($scope, $http,$cookies,$location,Title){
	$scope.dataMonitor = {};
	$scope.dataAdhe = {};
	$scope.dataGlobales = {};
	$scope.tablaMonitor = "interior/monitor_tiempo_real/tabla.html";
	$scope.callIniDatatable = false;
	$scope.dataTable = "";
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
	$scope.campanas = [];
	$scope.frmFiltro = {};
	$scope.startCookies = function(){
		if(!angular.isUndefined($cookies.operadora) && (!angular.isUndefined($cookies.nivel) && parseInt($cookies.nivel) == 1)){
			$scope.isOpe = true;
		}
	}

	$scope.startCookies();

	$scope.getMonitor = function(){
		$http.post('/monitor/tiempoReal',$scope.frmFiltro)
			.then(function(result){
				$scope.dataMonitor = result.data.monitor;
				$scope.dataAdhe = result.data.adherencia;
				$scope.dataGlobales = result.data.globales;
				if($scope.dataTable != "")
					$scope.dataTable.destroy(true);
				$scope.tablaMonitor = "interior/monitor_tiempo_real/tabla.html?upd="+((1+Math.random())*1000);
				//setTimeout($scope.configDataTable,1000);
			});
	}

	$scope.getCampanas = function(){
		$http.get("/monitor/campanasTiempoReal")
		.then(function(result){
			$scope.campanas = result.data;
		})
	}
	$scope.getCampanas();
	$scope.colorMonitor = function(data){
		var retorno = {color:'',"background-color":''};
		//ESPERANDO LLAMADO
		if(data.estado == "ESPERANDO LLAMADO" && data.tiempo_estado_seg <= 60){
			retorno["background-color"]="#ADD8E6";
		}
		if(data.estado == "ESPERANDO LLAMADO" && data.tiempo_estado_seg > 60 && data.tiempo_estado_seg < 300){
			retorno["background-color"]="blue";
			retorno.color="white";
		}
		if(data.estado == "ESPERANDO LLAMADO" && data.tiempo_estado_seg > 300){
			retorno["background-color"]="#191970";
			retorno.color="white";
		}

		//LLAMANDO
		if(data.estado == "EN LLAMADO" && data.tiempo_estado_seg <= 60){
			retorno["background-color"]="#D8BFD8";
		}
		if(data.estado == "EN LLAMADO" && data.tiempo_estado_seg > 60 && data.tiempo_estado_seg < 300){
			retorno["background-color"]="#EE82EE";	
		}
		if(data.estado == "EN LLAMADO" && data.tiempo_estado_seg > 300){
			retorno["background-color"]="purple";
			retorno.color="white";
		}

		//PAUSA
		if(data.estado == "PAUSA" && data.tiempo_estado_seg <= 60){
			retorno["background-color"]="#F0E68C";
		}
		if(data.estado == "PAUSA" && data.tiempo_estado_seg > 60 && data.tiempo_estado_seg < 300){
			retorno["background-color"]="yellow";	
		}
		if(data.estado == "PAUSA" && data.tiempo_estado_seg > 300){
			retorno["background-color"]="#808000";
			retorno.color="white";
		}

		//DISPO
		if(data.estado == "DISPO"){
			retorno["background-color"]="yellow";
		}

		//DEAD
		if(data.estado == "DEAD"){
			retorno.background_color="black";	
			retorno.color="yellow";	
		}
		console.log(retorno);
		return retorno;
	}

	$scope.getMonitor();

	setInterval($scope.getMonitor,12000);

	$scope.configDataTable = function(){
		$scope.dataTable = $('#tablaMonitor').DataTable({
			dom: 'Bfrtip',
            buttons: [
               'copy', 'csv', 'excel', 'pdf', 'print'
            ],
            scrollX:true,
            scrollY:"800px",
            scrollCollapse:true,
            paging:false,
            destroy: true,
            bFilter: false,
    		bInfo: false,
            fixedColumns:{
            	leftColumns:1
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