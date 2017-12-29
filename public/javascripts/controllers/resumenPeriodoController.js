reportMedias.controller('ResumenPeriodoController',function($scope, $http,$cookies,$location,$timeout,Title){
	$scope.frmResumenPeriodo = {};
	$scope.dataHorario = [];
	$scope.dataHoras = [];
	$scope.operadores = [];
	$scope.busquedaResumen = false;
	$scope.tablaUrl = 'interior/resumen_periodo/resumen_general.html';
	$scope.flagDia = false;
	$scope.isOpe = false;
	$scope.colorVacaciones = "#19E542";
	$scope.colorLicencias = "#1960E5";
	$scope.colorPermisos = "#A42CCC";
	$scope.colorPermisosEsp = "#55557F";
	$scope.colorRecupero = "#E58C19";
	$scope.colorAusentes = "#E51919";
	$scope.oneAtATime = true;
	$scope.dataTableOperador = "";
	$scope.showLoading = false;
	$scope.totalesHoraServicios = {};

	 $scope.groups = [
    {
      title: 'Dynamic Group Header - 1',
      content: 'Dynamic Group Body - 1'
    },
    {
      title: 'Dynamic Group Header - 2',
      content: 'Dynamic Group Body - 2'
    }
  ];
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
		cant_days = $scope.countDays($scope.frmResumenPeriodo.date_begin,$scope.frmResumenPeriodo.date_end);
		console.log(cant_days);
		
		if(cant_days > 4){
			$scope.seconds_1 = 12000;
			$scope.seconds_2 = 12000;
			$(".loadingGif").show();
		}
		$scope.showLoading = true;
		$scope.flagDia = (cant_days == 0) ? true:false;
		$scope.frmResumenPeriodo.cant_days = cant_days;

		$http.post('/reportHorario',$scope.frmResumenPeriodo)
		.then(function(result){
			$scope.tablaUrl = 'interior/resumen_periodo/resumen_general.html?upd='+Math.random();
			$scope.dataHorario = result.data;
			$scope.busquedaResumen = true;
			$scope.showLoading = false;
			$http.post('/monitor/getHorasOperador',$scope.frmResumenPeriodo)
			.then(function(result){
				$scope.dataHoras = result.data;
				$scope.crearHorasOperador($scope.dataHoras.operadores);
			});
		});

	}

	$scope.mostrarOperadores = function(data,id_cliente,id_servicio){
		$scope.operadores = data[id_cliente][id_servicio];
		if($scope.dataTableOperador != "")
			$scope.dataTableOperador.destroy(true);
		//setTimeout($scope.iniciarDataTableOperador,300);
	}

	$scope.iniciarDataTableOperador = function(){
		$scope.dataTableOperador = $('#tablaOperadores').DataTable({
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



	$scope.exportData = function () {
        var blob = new Blob([document.getElementById('exportTablaOperadores').innerHTML], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });
        saveAs(blob, "operadores.xls");
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

    $scope.crearHorasOperador = function(data){
    	_.forEach(data,function(servicio,cliente_id){
    		$scope.totalesHoraServicios[cliente_id]= {};
    		_.forEach(servicio,function(operadores,servicio_id){
    			$scope.totalesHoraServicios[cliente_id][servicio_id] = {tiempo:0,format_tiempo:''};
    			_.forEach(operadores,function(operador,key){
    				var tiempo = $scope.dataHorario.globalesOperador[operador.user].totalIdealExce;
    				$scope.totalesHoraServicios[cliente_id][servicio_id].tiempo += tiempo;
    				$scope.totalesHoraServicios[cliente_id][servicio_id].format_tiempo = $scope.totalesHoraServicios[cliente_id][servicio_id].tiempo.toHHMMSS();
    			});
    		});
    	});
    	console.log($scope.totalesHoraServicios);
    }

    Number.prototype.toHHMMSS = function () {
		var flagNegative = false;
	    var sec_num = parseInt(this, 10); // don't forget the second param
	    if(sec_num < 0){
			flagNegative = true;
			sec_num = Math.abs(sec_num);
	    }
	    var hours   = Math.floor(sec_num / 3600);
	    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	    var seconds = sec_num - (hours * 3600) - (minutes * 60);

	    if (hours   < 10) {hours   = "0"+hours;}
	    if (minutes < 10) {minutes = "0"+minutes;}
	    if (seconds < 10) {seconds = "0"+seconds;}
	    return (flagNegative) ? '-'+hours+':'+minutes+':'+seconds : hours+':'+minutes+':'+seconds;
	}
});