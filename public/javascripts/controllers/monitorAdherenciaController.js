reportMedias.controller('monitorAdherenciaController',function($scope, $http,$cookies,$location,Notification,GlobalServices,Title){
	$scope.frmFiltro             = {users:[],idCliente:0,idServicio:0,date_begin:'',date_end:'',selectVibox:false,selectSiodial:false};
	$scope.dataAdherencia        = {};
	$scope.campanas              = {};
	$scope.campanasVicidial      = {};
	$scope.dataTableBitacora     = "";
	$scope.users                 = {};
	$scope.dataBitacora          = {};
	$scope.nombre_campana          = {};
	$scope.buscoClienteServicios = $scope.traerMediasRealTime = $scope.mostarGrafico = false;
	$scope.callIniDatatable      = false;
	$scope.dataTable             = "";
	$scope.gestionesUrl          = 'interior/monitor_adherencia/tabla.html';
	$scope.clientesVibox         = {};
	$scope.serviciosVibox        = {};
	$scope.adicionarLlamado      = 0;
	$scope.busquedaGestiones     = false;
    $scope.formPath = {};
    $scope.preferencias = false;
    $scope.formPreferencias = {};
    $scope.formulario          = 'interior/monitor_adherencia/form.html';
    $scope.serviciosMonitor = {};
    $scope.loading = false;
    $scope.title = {};
    $scope.validacion = false;

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

	$scope.getDataMonitor = function(){
        $scope.loading = false;
        console.log($scope.title);
        $scope.actualizacion = $scope.title[0].mos_titulo_pagina + "  "+moment().format('DD-MM-YYYY HH:mm');
        Title.setTitle($scope.actualizacion, $scope.title[0].mos_descripcion);
		$http.get('/monitor/adherencia')
		.then(function(result){
			$scope.dataAdherencia = result.data.adheData;
			$scope.nombre_campana = result.data.campana;
			delete $scope.dataAdherencia["3301"];
			delete $scope.dataAdherencia["S/C"];
			console.log($scope.dataAdherencia);
		});
	}

    $scope.configDataTable = function (){
        if(!$scope.callIniDatatable){
            $scope.dataTable = $('#tablaHH').DataTable({
                scrollX:true,
                scrollY:"500px",
                scrollCollapse:true,
                paging:false,
                destroy: true,
                bFilter: false,
                bInfo: false,
                order: [[ 0, "asc" ]],
                fixedColumns:{
                    leftColumns:1,
                    rightColumns:1
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
            $scope.dataTable = $('#tablaHH').DataTable({
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

    $scope.exportData = function () {
        var blob = new Blob([document.getElementById('divTabla').innerHTML], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });
        saveAs(blob, "gestiones.xls");
    };
    $scope.getClientes = function(){
        $http.get('/vibox/getClientes')
        .then(function(result){
            $scope.listaClientes = result.data;
            $scope.listaClientes.unshift($scope.seleccioneCli);
        });
    }
    $scope.getServiciosVibox = function(pref){
        $scope.formPreferencias.monitor = pref;
        $http.post('/vibox/getServiciosMonitor',$scope.formPreferencias)
        .then(function(result){
            $scope.serviciosMonitor[pref] = result.data;
            $scope.serviciosMonitor[pref].unshift($scope.seleccioneServ);
        });
    }

    $scope.guardarPreferenciaAdherencia = function(){
        if(!$scope.validarMonitor($scope.formPreferencias)){
            Notification.info({message:"<b>Debe seleccionar alguna preferencia</b>.",delay:5000});   
        }else{
            $scope.formPreferencias.monitor = null;
            $http.post('/monitor/guardarPreferenciasAdherencia',$scope.formPreferencias).then(function(result){
                if(result.data.save){
                    Notification.success({message:"<b>Cargando adherencia</b>. .",delay:2000});
                    $scope.revisarPreferencias();
                }else{
                    Notification.error({message:"<b>Info</b>: Revise sus datos e intente nuevamente.",delay:10000});
                }
            });
        }
    }

    $scope.revisarPreferencias = function(){
        $scope.loading = true;
        $http.get('/monitor/buscarPreferenciasAdherencia').then(function(result){
            if(result.data.preferencias){
                $scope.getDataMonitor();
                $scope.preferencias = false;
            }else{
                $scope.loading = false;
                $scope.preferencias = true;
                $scope.getClientes();
            }
        }); 
    }

    $scope.revisarPreferencias();
    setInterval($scope.revisarPreferencias,300000);

    $scope.validarMonitor = function(formulario){
        $scope.validacion = false;
        angular.forEach(formulario, function(key, form){
            $scope.validacion = true;
        });
        return $scope.validacion;
    }
});