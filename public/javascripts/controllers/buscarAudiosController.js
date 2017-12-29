reportMedias.controller('BuscarAudiosController',function($scope, $http,$cookies,$location, Title,Notification){
	$scope.frmFiltroAudios = {};
	$scope.dataAudio = [];
	$scope.listaEstados = {};
	$scope.callIniDataTable = false;
	$scope.dataTable = "";
	$scope.tablaAudios = 'interior/buscador_audios/tabla.html';
	$scope.showLoading = false;
	$scope.clientesVibox         = {};
	$scope.serviciosVibox        = {};
	$scope.busquedaAudio = false;
	$scope.seconds_1 = 3000;
	$scope.seconds_2 = 3000;
	$scope.flagExterno = false;
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
		if(!angular.isUndefined($cookies.operadora) && (!angular.isUndefined($cookies.nivel) && parseInt($cookies.nivel) == 2)){
			$scope.flagExterno = true;
		}		
	}

	$scope.startCookies();

	$http.post('/escucha/getClientes')
		.then(function(result){
			$scope.clientesVibox = result.data;
			$scope.seleccioneCli = {id_cliente:0,cliente:"Seleccione Cliente"};
			$scope.clientesVibox.unshift($scope.seleccioneCli);
		});

	$scope.getServiciosVibox = function(){
		$scope.limpiarForm(0);
		$http.post('/escucha/getServicios',$scope.frmFiltroAudios)
			.then(function(result){
				$scope.serviciosVibox = result.data;
				$scope.seleccioneServ = {id_servicio:0,servicio:"Seleccione Servicio"};
				$scope.serviciosVibox.unshift($scope.seleccioneServ);
			});
	}
	$scope.getEstados = function(){
		var cliente_id = $scope.frmFiltroAudios.idCliente;
		var servicio_id = $scope.frmFiltroAudios.idServicio;
		$http.get('/getEstadosClienteServicio?id_cliente='+cliente_id+'&servicio_id='+servicio_id)
		.then(function(result){
			$scope.listaEstados = result.data;
		});
	}

	$scope.buscaCampanaViboxSiodial = function(){
		//$scope.limpiarForm(1);
		if($scope.frmFiltroAudios.idCliente != 0 && $scope.frmFiltroAudios.idServicio != 0 && $scope.frmFiltroAudios.date_begin != '' && $scope.frmFiltroAudios.date_end != ''){
			$http.post('/vibox/getCampanas',$scope.frmFiltroAudios)
				.then(function(result){
					$scope.campanasVibox = result.data;
				});
			$http.post('/getListaCampanas',$scope.frmFiltroAudios)
				.then(function(result){
					$scope.campanas = result.data;
				});
			$http.post('/getUsers',$scope.frmFiltroAudios)
				.then(function(result){
					$scope.users = result.data;
					$scope.users.unshift("Seleccione ejecutiv@");
				});
			$scope.getEstados();
			$scope.buscoClienteServicios = true;
		}
	}

	$scope.traerAudios = function(){
		if($scope.validaBusquedaAudio()){
			cant_days = $scope.countDays($scope.frmFiltroAudios.date_begin,$scope.frmFiltroAudios.date_end);
			if(cant_days <= 31){
				$scope.seconds_1 = 4000;
				$scope.seconds_2 = 4000;
			}else{
				Notification.info({message:"El periodo no puede superar el mes",delay:10000});
				return false;
			}
			$scope.busquedaAudio = false;
			$scope.dataAudio = [];
			if($scope.dataTable != ""){
				$scope.dataTable.destroy(true);
			}

			$scope.showLoading = true;
			$(".loadingGif").show();
			$http.post("/buscarAudio",$scope.frmFiltroAudios)
				.then(function(result){
					if($scope.callIniDataTable){
						$scope.dataTable.destroy(true);
						$scope.busquedaAudio = true;
						$scope.tablaAudios = 'interior/buscador_audios/tabla.html?upd='+Math.random();
						$scope.dataAudio = result.data;
						setTimeout($scope.iniciarDataTable,$scope.seconds_1);
						return;
					}
					$scope.tablaAudios = 'interior/buscador_audios/tabla.html?upd='+Math.random();
					$scope.dataAudio = result.data;
					console.log($scope.dataAudio);
					$scope.busquedaAudio = true;
					setTimeout($scope.iniciarDataTable,$scope.seconds_2);
				});
		}else{
			Notification.info({message:"Debe seleccionar cliente-servicio, un periodo y algun otro filtro",delay:10000});

		}
	}

	$scope.iniciarDataTable = function (){
		$scope.showLoading = false;
		$(".loadingGif").hide();
		if(!$scope.callIniDataTable){
			$scope.dataTable = $('#tablaAudios').DataTable({
	            scrollX:true,
	            scrollY:"400px",
	            scrollCollapse:true,
	            paging:false,
	            destroy: true,
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
			$scope.dataTable = $('#tablaAudios').DataTable({
	            scrollX:true,
	            scrollY:"400px",
	            scrollCollapse:true,
	            paging:false,
	            destroy: true,
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
    			$scope.frmFiltroAudios.idServicio=0;
    			$scope.frmFiltroAudios.date_begin='';
    			$scope.frmFiltroAudios.date_end='';
				break;
			case 1:
				$scope.frmFiltroAudios.date_begin = '';
				$scope.frmFiltroAudios.date_end = '';
				break;
    	}
    }

    $scope.validaBusquedaAudio = function(){
    		console.log("$scope.frmFiltroAudios:",$scope.frmFiltroAudios);
    	if((!angular.isUndefined($scope.frmFiltroAudios.idCliente) && $scope.frmFiltroAudios.idCliente != "") && (!angular.isUndefined($scope.frmFiltroAudios.idServicio) && $scope.frmFiltroAudios.idServicio != "")){
    		if(angular.isUndefined($scope.frmFiltroAudios.id_ani) && angular.isUndefined($scope.frmFiltroAudios.telefono) && angular.isUndefined($scope.frmFiltroAudios.rut)
    			&& angular.isUndefined($scope.frmFiltroAudios.nombre) && angular.isUndefined($scope.frmFiltroAudios.ic_cliente) && angular.isUndefined($scope.frmFiltroAudios.cu_cliente) && angular.isUndefined($scope.frmFiltroAudios.id_cliente)
    			&& (angular.isUndefined($scope.frmFiltroAudios.users) || $scope.frmFiltroAudios.users == "Seleccione Operador") && (angular.isUndefined($scope.frmFiltroAudios.estado) || $scope.frmFiltroAudios.estado == "")){
    			return false;
    		}
    		if($scope.frmFiltroAudios.id_ani != "" || $scope.frmFiltroAudios.telefono != "" || $scope.frmFiltroAudios.rut != "" || $scope.frmFiltroAudios.nombre != "" || 
    				$scope.frmFiltroAudios.ic_cliente != "" || $scope.frmFiltroAudios.cu_cliente != "" || $scope.frmFiltroAudios.id_cliente != "" || ($scope.frmFiltroAudios.users != "" && $scope.frmFiltroAudios.users != "Seleccione Operador")
    				|| ($scope.frmFiltroAudios.estado != "")){
    			return true;
    		}
    	}
    	return false;
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
});