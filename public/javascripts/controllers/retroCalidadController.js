reportMedias.controller('retroCalidadController',function($scope, $http, $cookies, $location, Title){
	$scope.tablaURL = "interior/retro_calidad/tabla_retroalimentacion.html";
	$scope.filtroURL = "interior/retro_calidad/filtro.html";
	$scope.formRetro = {};
	$scope.fecha_filtro = '';
	$http.get('/listar_supervisores_activos').then(function(result){
		$scope.listaSupervisor=result.data;
	});
	$scope.formPath = {};
	$('.loadingGif').hide();
	$('#contenido').hide();

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

	$scope.filtrarRetro = function(){
		$('#contenido').hide();
		$('.loadingGif').show();
		$http.post("/buscar_retro_calidad",$scope.formRetro).then(function(result){
			$scope.fechas = result.data['fechas'];
			$scope.operadores = result.data['operadores'];
			$scope.datos = result.data['info'];
			$scope.tablaURL = 'interior/retro_calidad/tabla_retroalimentacion.html?upd='+Math.random();
			setTimeout($scope.startDataTable,1000);
			$('.loadingGif').hide();
			$('#contenido').show();
		});
	}

	$scope.startDataTable = function(){
		$scope.dataTable = $('#tabla').DataTable({
			scrollX:true,
			scrollY:"400px",
			scrollCollapse:true,
			paging:false,
			destroy: true,
			fixedColumns: true,
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

	$scope.exportData = function () {
        var blob = new Blob([document.getElementById('divTabla').innerHTML], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });
        saveAs(blob, "Retroalimentacion Calidad.xls");
    };

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