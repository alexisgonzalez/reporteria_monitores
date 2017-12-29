reportMedias.controller('reportMediaController',function($scope, $http,$cookies,$location,Notification,GlobalServices,Title){
	$scope.frmFiltro             = {users:[],idCliente:0,idServicio:0,date_begin:'',date_end:'',selectVibox:false,selectSiodial:false};
	$scope.datosMedias           = {};
	$scope.campanas              = {};
	$scope.campanasVicidial      = {};
	$scope.dataTableBitacora     = "";
	$scope.users                 = {};
	$scope.buscoClienteServicios = $scope.traerMediasRealTime = $scope.mostarGrafico = false;
	$scope.callIniDatatable      = false;
	$scope.dataTable             = "";
	$scope.mediaUrl              = 'interior/reporte_medias/graficos.html';
	$scope.clientesVibox         = {};
	$scope.serviciosVibox        = {};
	$scope.adicionarLlamado      = 0;
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
			$location.path('/reporteHorario');
		}
	}
	$scope.startCookies();

	$http.get('/vibox/getClientes')
		.then(function(result){
			$scope.clientesVibox = result.data;
			$scope.seleccioneCli = {id_cliente:0,cliente:"Seleccione Cliente"};
			$scope.clientesVibox.unshift($scope.seleccioneCli);
		});

	$scope.getServiciosVibox = function(){
		$scope.limpiarForm(0);
		$http.post('/vibox/getServicios',$scope.frmFiltro)
			.then(function(result){
				$scope.serviciosVibox = result.data;
				$scope.seleccioneServ = {id_servicio:0,servicio:"Seleccione Servicio"};
				$scope.serviciosVibox.unshift($scope.seleccioneServ);
			});
	}

	$scope.getCampanas = function (){
		$http.get('/getCampanas')
			.then(function(result){
				$scope.campanas = result.data;
			});
	}

	$scope.selectAllCampanaSioDial = function(){
		console.log("$scope.frmFiltro.selectSiodial",$scope.frmFiltro.selectSiodial);
		$scope.frmFiltro.campanasSiodial = [];
		if($scope.frmFiltro.selectSiodial){
			angular.forEach($scope.campanas,function(value,key){
				$scope.frmFiltro.campanasSiodial.push(value.list_id);
			});
		}
	}

	$scope.selectAllCampanaVibox = function(){
		console.log("$scope.frmFiltro.selectVibox",$scope.frmFiltro.selectVibox);
		$scope.frmFiltro.campanasVibox = [];
		if($scope.frmFiltro.selectVibox){
			angular.forEach($scope.campanasVibox,function(value,key){
				$scope.frmFiltro.campanasVibox.push(value.id);
			});
		}
	}

	$scope.selectAllCampanaVicidial = function(){
		$scope.frmFiltro.campanasVicidial = [];
		if($scope.frmFiltro.selectCampanas){
			console.log($scope.campanasVicidial);
			angular.forEach($scope.campanasVicidial,function(value,key){
				$scope.frmFiltro.campanasVicidial.push(value.campaign_id);
			});
			$scope.traerListaCampanas();
		}
	}

	$scope.selectAllUser = function(){
		$scope.frmFiltro.users = [];
		if($scope.frmFiltro.selectUser){
			angular.forEach($scope.users,function(value,key){
				$scope.frmFiltro.users.push(value);
			});
		}
	}

	$scope.buscaCampanaViboxSiodial = function(){
		//$scope.limpiarForm(1);
		if($scope.frmFiltro.idCliente != 0 && $scope.frmFiltro.idServicio != 0 && $scope.frmFiltro.date_begin != '' && $scope.frmFiltro.date_end != ''){
			$http.post('/vibox/getCampanas',$scope.frmFiltro)
				.then(function(result){
					$scope.campanasVibox = result.data;
				});
			$http.get('/getCampanasVicidial?id_servicio='+$scope.frmFiltro.idServicio+"&id_cliente="+$scope.frmFiltro.idCliente)
				.then(function(result){
					$scope.campanasVicidial = result.data;
				});
			$http.post('/getUsers',$scope.frmFiltro)
				.then(function(result){
					$scope.users = result.data;
				});
			$scope.buscoClienteServicios = true;
			/*
			$http.post('/getListaCampanas',$scope.frmFiltro)
				.then(function(result){
					$scope.campanas = result.data;
				});
			*/
		}
	}

	$scope.traerListaCampanas = function(){
		$http.post('/getListaCampanas',$scope.frmFiltro)
				.then(function(result){
					$scope.campanas = result.data;
				});
	}

	$scope.traerMedias = function(){
		$scope.traerMediasRealTime = true;
		$http.post('/reportMedias',$scope.frmFiltro)
		.then(function(result){
			$scope.mostarGrafico = true;
			if($scope.callIniDatatable){
				$scope.dataTable.destroy(true);
				$scope.mediaUrl = 'interior/reporte_medias/graficos.html?upd='+((1+Math.random())*1000);
				$scope.datosMedias = result.data;
				console.log($scope.datosMedias);
				if(!angular.isUndefined($scope.datosMedias.total_llamados)){
					$scope.calculateCalls($scope.datosMedias.total_llamados);
				}
				setTimeout($scope.configDataTable,1000);
				return;
			}
			$scope.datosMedias = result.data;
			if(!angular.isUndefined($scope.datosMedias.total_llamados)){
				$scope.calculateCalls($scope.datosMedias.total_llamados);
			}
			setTimeout($scope.configDataTable,800);
		});
	}

	$scope.callTraerMedias = function (){
		if($scope.traerMediasRealTime){
			$scope.traerMedias();
		}
	}


	$scope.$on("create", function(evt, chart) {
		var barras = chart.datasets[0].bars;
		var max = barras[0].value;
		for (var i = 0; i < barras.length; i++) {
			var porc = Math.floor((barras[i].value*100)/max);
			if(porc <= 100 && porc >= 92){
				barras[i] = $scope.asignarColor(barras[i],"#09F");
			}
			else if( porc >=80 && porc < 92){
				barras[i] = $scope.asignarColor(barras[i],"#0C0");
			}
			else if( porc >=40 && porc < 80){
				barras[i] = $scope.asignarColor(barras[i],"goldenrod");
			}
			else if(porc < 40){
				barras[i] = $scope.asignarColor(barras[i],"red");
			}
		}
      chart.update();
    });

    $scope.asignarColor = function(barra,color){
		barra.fillColor=color;
		barra.strokeColor=color;
		barra.highlightFill=color;
		barra.highlightStroke=color;
		return barra;
    }

    $scope.configDataTable = function (){
    	if(!$scope.callIniDatatable){
			$scope.dataTable = $('#tablaOp').DataTable({
				dom: 'Bfrtip',
                buttons: [
                   'copy', 'csv', 'excel', 'pdf', 'print'
                ],
	            scrollX:true,
	            scrollY:"400px",
	            scrollCollapse:true,
	            paging:false,
	            destroy: true,
	            bFilter: false,
        		bInfo: false,
        		order: [[ 2, "desc" ]],
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
			$scope.callIniDatatable = true;
			console.log("$scope.callIniDatatable",$scope.callIniDatatable);
    	}else{
    		$scope.dataTable = $('#tablaOp').DataTable({
				dom: 'Bfrtip',
                buttons: [
                   'copy', 'csv', 'excel', 'pdf', 'print'
                ],
	            scrollX:true,
	            scrollY:"400px",
	            scrollCollapse:true,
	            paging:false,
	            destroy: true,
	            bFilter: false,
        		bInfo: false,
        		order: [[ 2, "desc" ]],
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
    }

    $scope.limpiarForm = function(etapa){
    	switch(etapa){
    		case 0:
    			$scope.frmFiltro.idServicio=0;
    			$scope.frmFiltro.date_begin='';
    			$scope.frmFiltro.date_end='';
    			$scope.frmFiltro.selectVibox=false;
    			$scope.frmFiltro.selectSiodial=false;
    			$scope.frmFiltro.idServicio = 0;
				$scope.frmFiltro.date_begin = '';
				$scope.frmFiltro.date_end = '';
				$scope.frmFiltro.users = [];
				$scope.campanas = [];
				$scope.campanasVibox = [];
				$scope.campanasVicidial = [];
				break;
			case 1:
    			$scope.frmFiltro.selectVibox=false;
    			$scope.frmFiltro.selectSiodial=false;
				$scope.frmFiltro.date_begin = '';
				$scope.frmFiltro.date_end = '';
				$scope.frmFiltro.users = [];
				$scope.campanas = [];
				$scope.campanasVibox = [];
				$scope.campanasVicidial = [];
				break;
    	}
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
				if(result.data.save){
					Notification.success({message:"Bitacora agregada correctamente.",delay:10000});
					$('#modalAgregarBitacora').modal("hide");
				}else
					Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});
				$scope.cargarBitacoraOperador($scope.operador_bitacora);
			});
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

	/*$http.get('/getUsers')
		.then(function(result){
			$scope.users = result.data;
		});

	$scope.selectAllUser = function(){
		angular.forEach($scope.users,function(value,key){
			$scope.frmFiltro.users.push(value.user);
		});
	}*/