reportMedias.controller('mantenedorMetaController',function($scope, $http,$cookies,$location,Notification,Upload, Title){
	$scope.frmFiltroMetas = {};
	$scope.frmMetas = {};
	$scope.listaMetas = [];
	$scope.tablaSUP = 'interior/mantenedor_metas/tabla.html';
	$scope.tablaMetaDia = 'interior/mantenedor_metas/tabla_meta_diaria.html';
	$scope.dataTable = "";
	$scope.dataTable2 = "";
	$scope.listaClientes = {};
	$scope.listaServicio = {};
	$scope.metaDiarias = {};
	$scope.frmMetas = {};
	$scope.meses = [{'id':'1','mes':'Enero'}
							,{'id':'2','mes':'Febrero'}
							,{'id':'3','mes':'Marzo'}
							,{'id':'4','mes':'Abril'}
							,{'id':'5','mes':'Mayo'}
							,{'id':'6','mes':'Junio'}
							,{'id':'7','mes':'Julio'}
							,{'id':'8','mes':'Agosto'}
							,{'id':'9','mes':'Septiembre'}
							,{'id':'10','mes':'Octubre'}
							,{'id':'11','mes':'Noviembre'}
							,{'id':'12','mes':'Diciembre'}];
	// TODO: automatizar años
	$scope.anosPeriodo = [{'ano':'2016'},{'ano':'2017'}];

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
			$scope.listaClientes = result.data;
			$scope.seleccioneCli = {id_cliente:0,cliente:"Seleccione Cliente"};
			$scope.listaClientes.unshift($scope.seleccioneCli);
		});

	$scope.getServiciosVibox = function(){
		$http.post('/vibox/getServicios',$scope.frmMetas)
			.then(function(result){
				$scope.listaServicio = result.data;
				$scope.seleccioneServ = {id_servicio:0,servicio:"Seleccione Servicio"};
				$scope.listaServicio.unshift($scope.seleccioneServ);
			});
	}

	$scope.getListaMetas = function(){
		var url = "/mantenedor/listaMetas";
		if((!angular.isUndefined($scope.frmFiltroMetas.met_mes) && !angular.isUndefined($scope.frmFiltroMetas.met_ano))
			&& ($scope.frmFiltroMetas.met_mes != "" && $scope.frmFiltroMetas.met_ano != "")
		){
			var mes = (parseInt($scope.frmFiltroMetas.met_mes) < 10) ? "0"+$scope.frmFiltroMetas.met_mes:$scope.frmFiltroMetas.met_mes.toString();
			var periodo  = $scope.frmFiltroMetas.met_ano.toString()+mes;
			url += "?periodo="+periodo;
		}
		$http.get(url)
		.then(function(result){
			if($scope.dataTable != "")
					$scope.dataTable.destroy(true);
			$scope.tablaSUP = 'interior/mantenedor_metas/tabla.html?upd='+Math.random();
			$scope.listaMetas = result.data;
			_.forEach($scope.listaMetas,function(value,key){
				$scope.listaMetas[key].name_mes = "";
				_.forEach($scope.meses,function(val,index){
					if($scope.listaMetas[key].met_mes == val.id){
						$scope.listaMetas[key].name_mes = val.mes;
					}
				});
			});
			console.log($scope.listaMetas);

			setTimeout($scope.iniciarDataTable,400);
		});
	}

	$scope.crearMetasDiarias = function(meta){
		console.log(meta);
		var fecha_inicio = new Date(meta.met_ano,meta.met_mes-1,1);
		var fecha_fin = new Date(meta.met_ano,meta.met_mes,0);
		fecha_inicio = moment(fecha_inicio).format('DD/MM/YYYY');
		fecha_fin = moment(fecha_fin).format('DD/MM/YYYY');

		$scope.frmMetaDiaria = {date_begin:fecha_inicio,date_end:fecha_fin,id_cliente:meta.id_cliente,id_servicio:meta.id_servicio};
		$scope.frmMetaDiaria.meta = meta;

		$http.post("/monitor/getHorasOperador",$scope.frmMetaDiaria)
		.then(function(result){
			var operadores = $scope.genArrOperadores(result.data.operadores[meta.id_cliente][meta.id_servicio]);
			$scope.frmMetaDiaria.operadores = operadores;
			$http.post('/reportHorario',$scope.frmMetaDiaria)
			.then(function(result_horario){
				console.log(result_horario);
				$scope.frmMetaDiaria.globales = result_horario.data.globalesHorario;
				$scope.frmMetaDiaria.dias = result_horario.data.globalesDia;
				$http.post("/mantenedor/generarMetasDiarias",$scope.frmMetaDiaria)
				.then(function(result){
					if(result.data.result)
						Notification.success({message:"Metas generadas para el mes.",delay:10000});
					else
						Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});
					$("#dialogGuardando").modal("hide");
					$scope.getListaMetas();
				});
			});
		});
	}

	$scope.getListaMetas();

	$scope.mostrarFormMetas = function(modo,data){
		$scope.frmMetas = {};
		$scope.levantoVentana = true;
		if(modo == 'editar'){
			$scope.frmMetas = data;
			$scope.getServiciosVibox();
		}
	}

	$scope.verEstadoMeta = function(meta){
		var baseUrl = $location.protocol()+"://"+$location.host()+":"+$location.port();
		var nombreSer = meta.cliente+" "+meta.servicio;
		window.open(baseUrl+'/#/reportes/estadoMeta?id_cliente='+meta.id_cliente+'&id_servicio='+meta.id_servicio+"&campana="+nombreSer,'_blank');
	}

/******
	TODO: falta el guardar en el controlador de mantenedor
	envio globales,operadores y la meta
*****/
	$scope.guardarMeta = function (){
		if($scope.validaMeta()){
			var mes = (parseInt($scope.frmMetas.met_mes) < 10) ? "0"+$scope.frmMetas.met_mes:$scope.frmMetas.met_mes.toString();
			var periodo  = $scope.frmMetas.met_ano.toString()+mes;
			$scope.frmMetas.met_periodo = periodo;
			$http.post("/mantenedor/guardarMeta",$scope.frmMetas)
				.then(function(result){
					if(result.data.result){
						$scope.frmMetas.met_id_meta = result.data.id_meta;
						$("#dialogGuardando").modal("show");
						$scope.crearMetasDiarias($scope.frmMetas);
						Notification.success({message:"Meta guardada correctamente.",delay:10000});
					}
					else
						Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});
				});
			$("#formMetas").modal("hide");
		}else{
			Notification.error({message:"<b>Error</b>: Complete todos los datos del formulario.",delay:10000});
		}
	}

	$scope.verMetasDiarias = function(meta){
		$http.get("/mantenedor/getMetasDiaras?id_meta="+meta.met_id_meta)
		.then(function(result){
			if($scope.dataTable2 != "")
				$scope.dataTable2.destroy(true);
			$scope.tablaMetaDia = 'interior/mantenedor_metas/tabla_meta_diaria.html?upd='+Math.random();
			$scope.metaDiarias = result.data;
			setTimeout($scope.iniciarDataTableDiario,400);
		});
	}

	$scope.iniciarDataTable = function(){
		$scope.dataTable = $('#tablaMetas').DataTable({
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

	$scope.iniciarDataTableDiario = function(){
		$scope.dataTable2 = $('#tablaMetasDiarias').DataTable({
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

	$scope.validaMeta = function(){
		var flag_save = true;
		console.log("Validando",$scope.frmMetas);
		if($scope.frmMetas.length == 0){
			return false;
		}
		if(angular.isUndefined($scope.frmMetas.id_cliente) || $scope.frmMetas.id_cliente == ""){
			flag_save = false;
		}
		if(angular.isUndefined($scope.frmMetas.id_servicio) || $scope.frmMetas.id_servicio == ""){
			flag_save = false;
		}
		if(angular.isUndefined($scope.frmMetas.met_mes) || $scope.frmMetas.met_mes == ""){
			flag_save = false;
		}
		if(angular.isUndefined($scope.frmMetas.met_ano) || $scope.frmMetas.met_ano == ""){
			flag_save = false;
		}
		if(angular.isUndefined($scope.frmMetas.met_meta) || $scope.frmMetas.met_meta == ""){
			flag_save = false;
		}

		return flag_save;
	}

	$scope.genArrOperadores = function (data){
		var arrOperadores = [];
		_.forEach(data,function(operador,key){
			arrOperadores.push(operador.user);
		})
		return arrOperadores;
	}

});
