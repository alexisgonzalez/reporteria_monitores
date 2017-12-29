reportMedias.controller('planificacionHorarioController',function($scope, $http,$cookies,$location,Notification,GlobalServices,Title){
	$scope.dataTabla = {};
	$scope.fechas = {};
	$scope.nombreFechas = {};
	$scope.frmFiltro = {};
	$scope.tablaUrl = 'interior/planificacion_hora_ejecutivo/tabla.html';
	$scope.dataTable = "";
	$scope.busqueda = false;
	$scope.users = {}

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

    $scope.getUsuarios = function(){
    	$http.get("/get_usuarios_activos")
    	.then(function(result){
    		$scope.users = result.data;
    	});
    }

    $scope.actualizarTitulo();
    $scope.getUsuarios();

    $scope.getDatosHorario = function(){
    	$http.post("/horario/operadorPorHora",$scope.frmFiltro)
    	.then(function(result){
    		console.log(result);
    		$scope.busqueda = true;
    		if($scope.dataTable != ""){
    			$scope.dataTable.destroy(true);
    		}
    		$scope.dataTabla = result.data.tabla;
    		$scope.fechas = result.data.header;
    		$scope.nombreFechas = result.data.header.nombres;
    		$scope.tablaUrl = 'interior/planificacion_hora_ejecutivo/tabla.html?upd='+Math.random();
    		setTimeout($scope.iniciarDataTable,500);
    	});
    }

    $scope.iniciarDataTable = function(){
    	$scope.dataTable = $('#tabla').DataTable({
            scrollX:true,
            scrollY:"400px",
            scrollCollapse:true,
            paging:false,
            destroy: true,
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

	$scope.selectAllUser = function(){
		$scope.frmFiltro.users = [];
		if($scope.frmFiltro.selectUser){
			angular.forEach($scope.users,function(value,key){
				$scope.frmFiltro.users.push(value.user);
			});
		}
	}

    $scope.exportData = function () {
        var blob = new Blob([document.getElementById('DivTabla').innerHTML], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });
        saveAs(blob, "Planificacion.xls");
    };

});