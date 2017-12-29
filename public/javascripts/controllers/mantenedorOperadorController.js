reportMedias.controller('mantenedorOperadorController',function($scope, $http,$cookies,$location,Notification,Upload,Title){
	$scope.listOperadores = [];
	$scope.frmOperador = {};
	$scope.filtroListaOperador = {filtroActivo:true}
	$scope.tablaOP = 'interior/mantenedor_operador/tabla.html';
	$scope.dataTable = "";
	$scope.dataTableBitacora = "";
	$scope.listaSupervisores = [];
	$scope.isapres = [];
	$scope.afps = [];
	$scope.contratos = [];
	$scope.dialog = {};
	$scope.dataOperador = {};
	$scope.levantoVentana = false;
	$scope.imagenOperador = "";
	$scope.listaClientes = {};
	$scope.listaServicio = {};
	$scope.listaCampanas = {};
	$scope.listaCartera = {};
	$scope.paises = {};
	$scope.formPath = {};
	$scope.is_lm = false;
	$scope.listaHijos = [];

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
		$http.post('/vibox/getServicios',$scope.frmOperador)
			.then(function(result){
				$scope.listaServicio = result.data;
				$scope.seleccioneServ = {id_servicio:0,servicio:"Seleccione Servicio"};
				$scope.listaServicio.unshift($scope.seleccioneServ);
			});
	}


	$scope.traerListaOperador = function(){
		$http.post('/mantenedor/listaOperador',$scope.filtroListaOperador)
			.then(function(result){
				if($scope.dataTable != "")
					$scope.dataTable.destroy(true);
				$scope.tablaOP = 'interior/mantenedor_operador/tabla.html?upd='+Math.random();
				$scope.listOperadores = result.data;
				setTimeout($scope.iniciarDataTable,800);
			});
	}

	$scope.traerListas = function(){
		$http.get('/mantenedor/listaSupervisores')
			.then(function(result){
				$scope.listaSupervisores = result.data;
			});
		$http.get('/mantenedor/listaIsapres')
			.then(function(result){
				$scope.isapres = result.data;
			});
		$http.get('/mantenedor/listaAfps')
			.then(function(result){
				$scope.afps = result.data;
			});
		$http.get('/mantenedor/listaContratos')
			.then(function(result){
				$scope.contratos = result.data;
			});
		$http.get('/mantenedor/campanasActivas')
			.then(function(result){
				$scope.listaCampanas = result.data;
			});
		$http.get('/mantenedor/paises')
			.then(function(result){
				$scope.paises = result.data;
			});
		$http.get('/mantenedor/estadoCivil')
			.then(function(result){
				$scope.estadoCivil = result.data;
			});
		$http.get('/mantenedor/nivelEstudios')
			.then(function(result){
				$scope.nivelEstudios = result.data;
			});
		$http.get('/mantenedor/tipoComputador')
			.then(function(result){
				$scope.tipoComputador = result.data;
			});
		$http.get('/mantenedor/tipoConexion')
			.then(function(result){
				$scope.tipoConexion = result.data;
			});
	}

	$scope.listarComunas = function(){
		$http.post('/mantenedor/comunas', $scope.frmOperador).then(function(result){
			$scope.comunas = result.data;
		});
	}
	$scope.traerListaOperador();
	$scope.traerListas();

	$scope.mostrarFormOperador = function(modo,data){
		$scope.frmOperador = {};
		$scope.levantoVentana = true;
		if(modo == 'editar'){
			$scope.frmOperador = data;
			$scope.getServiciosVibox();
			$scope.imageDefault('images/operadores/'+$scope.frmOperador.user);
			$http.post('/mantenedor/campanasEjecutivo', $scope.frmOperador).then(function(result){
				$scope.frmOperador.campanas = result.data;
				$scope.frmOperador.campanas_old = result.data;
			});
			$http.post('/mantenedor/listaHijosEjecutivo', $scope.frmOperador).then(function(result){
				$scope.frmOperador.listaHijos = result.data;
			});
		}
	}

	$scope.mostrarHorario = function(operador){
		console.log(operador);
		if (operador && operador.user_id) {
			//location.url('/reportes/mantenedorHorarioOperador?op_id='+operador.user_id+'&code='+operador.user);
			var baseUrl = $location.protocol()+"://"+$location.host()+":"+$location.port();
			window.open(baseUrl+'/#/reportes/mantenedorHorarioOperador?op_id='+operador.user_id+'&code='+operador.user,'_blank');
		}
	}

	$scope.guardarOperador = function (){
		console.log($scope.frmOperador);
		var rut_sep = ($scope.frmOperador.usde_rut != null) ? $scope.frmOperador.usde_rut.split("-"):"";
		if(rut_sep != "" && $scope.validarRut(rut_sep[0],rut_sep[1],$scope.frmOperador.id_pais)){
			$http.post("/mantenedor/guardarOperador",$scope.frmOperador)
				.then(function(result){
					$scope.traerListaOperador();
					$scope.upload($scope.frmOperador.file);
					if(result.data.save)
						Notification.success({message:"Operador guardado correctamente.",delay:10000});
					else
						Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});
				});
				$("#formOperador").modal("hide");
		}else{
			Notification.error({message:"<b>Error</b>: El rut no es correcto.",delay:10000});	
		}
	}

	$scope.mostrarHistorialClienteServicio = function(operador){
		$scope.ejecutivo = operador.user;
		$http.get("/mantenedor/historialCartera?user_id="+operador.user_id)
		.then(function(result){
			$scope.listaCartera = result.data;
		});
		$("#dialogHistorialCartera").modal();
	}

	$scope.upload = function (file) {
        Upload.upload({
            url: '/mantenedor/operadores/subirImagen',
            data: {file: file, 'username': $scope.frmOperador.user}
        }).then(function (resp) {
        	console.log(resp);
            console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });
    };

	$scope.iniciarDataTable = function(){
		$scope.dataTable = $('#tablaOperadores').DataTable({
			dom: 'Bfrtip',
            buttons: [
               'copy', 'csv', 'excel', 'pdf', 'print'
            ],
            scrollX:true,
            scrollY:"250px",
            scrollCollapse:true,
            paging:false,
            destroy: true,
            fixedColumns:{
            	rightColumns:1
            },
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

	$scope.showConfirm = function(data,modo) {
		if(modo = "eliminar"){
			$scope.dataOperador = data;
			$scope.dialog = {titleDialog:'Desactivar registro',
								contentDialog:'¿Estas seguro que quieres desactivar el registro?',
								botonDialog:'Desactivar',
								callback:$scope.desactivarOperador
							};
			$('#dialogConfirm').modal();
		}
	}

	$scope.desactivarOperador = function(){
		$http.post("mantenedor/desactivarOperador",$scope.dataOperador)
			.then(function(result){
				if(result.data.save)
					Notification.success({message:"Operador desactivado correctamente.",delay:10000});
				else
					Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});
				$scope.traerListaOperador();
			})
	}

	$scope.imageDefault = function(url){
		if($scope.levantoVentana){
			console.log("url",url);
			$http.get(url).success(function(result){
				console.log("result",result[0]);
	            //$scope.imagenOperador = 'images/operadores/'+frmOperador.user
	            if(result[0] == ''){
	            	$scope.imagenOperador = '/images/default.png';
	            }else{
	           		$scope.imagenOperador = url;
	            }
	            return url;
	        }).error(function(){
	            $scope.imagenOperador = '/images/default.png';
	            //element.attr('src', '/images/default.png'); // set default image
	        });
	        $scope.levantoVentana = false;
		}
	}

	$scope.validarRut = function(poc_rut,poc_dv,id_pais){ 
		verificado=true;
		if(id_pais==1){
			if (poc_rut == ""){ 
				verificado=false; 
				return verificado; 
			} 
			x=2; 
			sumatorio=0; 
			for (i=(poc_rut.length)-1;i>=0;i--){ 
				if (x>7){x=2;} 
				sumatorio=sumatorio+(poc_rut[i]*x); 
				x++; 
			} 
			digito=sumatorio%11; 
			digito=11-digito; 

			switch (digito){ 
				case 10: 
				digito="k"; 
				break; 
				case 11: 
				digito="0"; 
				break; 
			} 
			if (poc_dv.toLowerCase()==digito){ 
				verificado=true; 
			} else { 
				verificado=false; 
			} 
		}
		return verificado; 
	}

	$scope.sinCampana = function(){
		$scope.is_lm = false;
		if($scope.frmOperador.is_lm){
			$scope.is_lm = true;
			$scope.frmOperador.id_cliente = "";
			$scope.frmOperador.id_servicio = "";
		}
	}

	$scope.arrHijos = function(cant){
		$scope.listaHijos = [];
		for (var i = 1; i <=cant; i++) {
			console.log(cant);
			$scope.listaHijos.push({ushi_fecha_nacimiento:null});
		}
		console.log($scope.listaHijos);
		$scope.frmOperador.listaHijos = $scope.listaHijos;
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
			$scope.imageDefault('images/operadores/'+$scope.operador_bitacora+'.png');
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
