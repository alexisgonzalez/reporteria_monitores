reportMedias.controller('reportDomoController',function($scope, $http,$cookies,$location,$timeout,Notification,Title){
	$scope.frmFiltroDomo    = {tiempo_minimo:3600,id_supervisor:"Todos"};
	$scope.dataDomo         = [];
	$scope.listaSupervisores = [];
	$scope.listaCamposDomo = {};
	$scope.callIniDataTable = false;
	$scope.dataTable        = "";
	$scope.dataTableBitacora = "";
	$scope.tablaDomo        = 'interior/domo/tabla.html';
	$scope.clientesVibox    = {};
	$scope.serviciosVibox   = {};
	$scope.showLoading      = false;
	$scope.seconds_1        = 1000;
	$scope.seconds_2        = 800;
	$scope.omitidos         = [];
	$scope.reFiltroDomo     = {};
	$scope.urlGrafico       = 'interior/domo/grafico.html';
	$scope.mostarGrafico = false;
	$scope.mostrarHorarioEntrada = false;
	$scope.filtrarCampos = false;
	$scope.valido = true;
	$scope.pieOptions = {
	    series: {
	     	pie: {
	     		show: true,
	     		radius: 1,
	            label: {
	                show: true,
	                radius: 2/3,
	                threshold: 0.1
	            }
	     	}
	    },
	    legend: {
	        show: false
	    }
  	};
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

	$http.get('/vibox/getClientes')
		.then(function(result){
			$scope.clientesVibox = result.data;
			$scope.seleccioneCli = {id_cliente:0,cliente:"Seleccione Cliente"};
			$scope.clientesVibox.unshift($scope.seleccioneCli);
		});
	$http.get('/listSupervisores')
		.then(function(result){
			$scope.listaSupervisores = result.data;
			$scope.listaSupervisores.unshift({usuario_codigo:"Todos"});
		});

	$scope.getServiciosVibox = function(){
		$scope.limpiarForm(0);
		$http.post('/vibox/getServicios',$scope.frmFiltroDomo)
			.then(function(result){
				$scope.serviciosVibox = result.data;
				$scope.seleccioneServ = {id_servicio:0,servicio:"Seleccione Servicio"};
				$scope.serviciosVibox.unshift($scope.seleccioneServ);
			});
	}

	$scope.traerDomo = function(){
		$scope.busquedaHorario = false;
		$scope.dataDomo = [];
		$scope.omitidos = [];
		if($scope.dataTable != ""){
			$scope.dataTable.destroy(true);
		}
		cant_days = $scope.countDays($scope.frmFiltroDomo.date_begin,$scope.frmFiltroDomo.date_end);
		$scope.frmFiltroDomo.cant_days = cant_days;

		if(cant_days >= 1){
			$scope.seconds_1 = 4000;
			$scope.seconds_2 = 4000;
			$scope.showLoading = true;
			$(".loadingGif").show();
			$scope.mostrarHorarioEntrada = false;
		}else{
			$scope.mostrarHorarioEntrada = true;
		}

		$scope.reFiltroDomo = JSON.parse(JSON.stringify($scope.frmFiltroDomo));

		$http.post('/getDomo',$scope.frmFiltroDomo)
		.then(function(result){
			console.log(result);
			if(result.valido || result.data.valido){
				if($scope.callIniDataTable){
					$scope.dataTable.destroy(true);
					$scope.busquedaHorario = true;
					$scope.tablaDomo = 'interior/domo/tabla.html?upd='+Math.random();
					$scope.dataDomo = result.data;
					setTimeout($scope.iniciarDataTable,$scope.seconds_1);
					return;
				}
				$scope.tablaDomo = 'interior/domo/tabla.html?upd='+Math.random();
				$scope.dataDomo = result.data;
				$scope.busquedaHorario = true;
				setTimeout($scope.iniciarDataTable,$scope.seconds_2);
				$scope.valido = true;
			}else{
				$scope.valido = false;
			}
		});
	}

	$scope.reFiltrarDomo = function(){
		$scope.busquedaHorario = false;
		$scope.dataDomo = [];
		if($scope.dataTable != ""){
			$scope.dataTable.destroy(true);
		}
		cant_days = $scope.countDays($scope.reFiltroDomo.date_begin,$scope.reFiltroDomo.date_end);

		if(cant_days > 1){
			$scope.seconds_1 = 4000;
			$scope.seconds_2 = 4000;
			$scope.showLoading = true;
			$(".loadingGif").show();
		}

		$scope.reFiltroDomo.omitUsers = $scope.omitidos;

		$http.post('/getDomo',$scope.reFiltroDomo)
		.then(function(result){
			if($scope.callIniDataTable){
				$scope.dataTable.destroy(true);
				$scope.busquedaHorario = true;
				$scope.tablaDomo = 'interior/domo/tabla.html?upd='+Math.random();
				$scope.dataDomo = result.data;
				setTimeout($scope.iniciarDataTable,$scope.seconds_1);
				return;
			}
			$scope.tablaDomo = 'interior/domo/tabla.html?upd='+Math.random();
			$scope.dataDomo = result.data;
			$scope.busquedaHorario = true;
			setTimeout($scope.iniciarDataTable,$scope.seconds_2);
		});
	}

	$scope.reFiltroDomoChange = function (user,checked) {
		console.log(user,checked);
		if (checked) {
			$scope.omitidos.push(user);
		}
		else {
			$scope.omitidos.splice($scope.omitidos.indexOf(user),1);
		}
	}

	$scope.iniciarDataTable = function (){
		$scope.showLoading = false;
		$(".loadingGif").hide();
		$scope.confTable = {
            scrollX:true,
            scrollY:"400px",
            scrollCollapse:true,
            paging:false,
            destroy: true,
            fixedColumns:{
							fnDrawCallback: function (oSettings) {
								// evento para pintar las filas al dar click sobre ellas
								$('table.DTFC_Cloned tbody, #tablaDomo tbody').off('click', 'tr');
								$('#tablaDomo tbody, table.DTFC_Cloned tbody').on( 'click', 'tr', function () {
					            var row_index = $(this).index();
						            $('table.DTFC_Cloned tbody tr:eq('+row_index+'), #tablaDomo tbody tr:eq('+row_index+')').toggleClass('selected');
						        } );

								// evento para agregar/quitar del array de omitidos (para refiltrar)
								$('table.DTFC_Cloned tbody tr td input.checkFiltro').off( 'click' );
								$('table.DTFC_Cloned tbody tr td input.checkFiltro').on( 'click', function () {
									$scope.reFiltroDomoChange($(this).val(),$(this).prop('checked'))
								});

								$(".buttons-colvis").on("click",function(){ // COULTAR TMO DEL BOTON OCULTAR COLUMNAS
									$(".buttons-columnVisibility").each(function(index){
										var texto = $(this).children().text();
										if(texto == "Vibox" || texto == "Vicidial"){
											$(this).remove();
										}
									})
								})
							},
            	leftColumns:10
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
        };
        /* MOSTRAR BOTON OCULTAR COLUMNAS
        if($cookies.nivel > 8){
        	$scope.confTable.buttons = [{
	            extend: 'colvis',
	            text: '<i class="fa fa-eye"></i> Mostrar/Ocultar columnas</strong>'
	        }];
        	console.log("confTable",$scope.confTable);
        }*/
		$scope.dataTable = $('#tablaDomo').DataTable($scope.confTable);
		if(!$scope.callIniDataTable){
			$scope.callIniDataTable = true;
		}
	}

    $scope.countDays = function(date_begin, date_end){
    	var sep_begin = date_begin.split("/");
    	var sep_end = date_end.split("/");
    	console.log("sep_end",sep_end);
    	var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
		var firstDate = new Date(sep_begin[2],sep_begin[1],sep_begin[0]);
		var secondDate = new Date(sep_end[2],sep_end[1],sep_end[0]);

		var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));

		return diffDays;
    }

    $scope.exportData = function () {
        var blob = new Blob([document.getElementById('divTabla').innerHTML], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });
        saveAs(blob, "Reporte.xls");
    };

	$scope.limpiarForm = function(etapa){
    	switch(etapa){
    		case 0:
    			$scope.frmFiltroDomo.idServicio=0;
    			$scope.frmFiltroDomo.date_begin='';
    			$scope.frmFiltroDomo.date_end='';
    			$scope.frmFiltroDomo.id_supervisor='Todos';
				break;
			case 1:
				$scope.frmFiltroDomo.date_begin = '';
				$scope.frmFiltroDomo.date_end = '';
				$scope.frmFiltroDomo.id_supervisor = 'Todos';
				break;
    	}
    }

    $scope.startCookies = function(){
		if(!angular.isUndefined($cookies.operadora) && (!angular.isUndefined($cookies.nivel) && parseInt($cookies.nivel) == 1)){
			$location.path('/reporteHorario');
		}

		if($cookies.campos_domo != 0){
			$scope.listaCamposDomo = JSON.parse($cookies.campos_domo);
			$scope.filtrarCampos = true;
		}else
			$scope.filtrarCampos = false;
	}

	$scope.resizeGrafico= function(){
		$scope.urlGrafico       = 'interior/domo/grafico.html?upd='+Math.random();
		$timeout(function(){ $scope.$broadcast('resizeChart'); console.log("enviado rezise"); $scope.mostarGrafico = true;},400);
	}

	$scope.colorPorTramo = function (tramo){
		var str = "";
		switch(parseInt(tramo)){
			case 1:
				str="color: #09F !important;font-weight: bold;";
				break;
			case 2:
				str="color: #0C0 !important;font-weight: bold;";
				break;
			case 3:
				str="color: goldenrod !important;font-weight: bold;";
				break;
			case 4:
				str="color: red !important;font-weight: bold;";
				break;
		}
		return str;
	}

	$scope.colorPorNota = function(nota){
		var str = "";
		if(parseFloat(nota) < 4){
			str="color: red !important;font-weight: bold;";
		}else{
			str="color: #09F !important;font-weight: bold;";
		}
		return str;
	}

	$scope.colorPorbrecha = function(brecha){
		var str = "";
		if(parseFloat(brecha) < 0){
			str="color: red !important;font-weight: bold;";
		}else{
			str="color: #09F !important;font-weight: bold;";
		}
		return str;
	}

	$scope.startCookies();

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