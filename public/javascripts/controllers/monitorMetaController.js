reportMedias.controller('monitorMetaController',function($scope, $http,$cookies,$location,Title){
	$scope.datosMetas = {};
	$scope.mediaUrl = 'interior/monitor_metas/graficos.html';
	$scope.url = "/monitor/metas";
	$scope.serieData = [];
	$scope.campana = "";
	$scope.callIniDatatable = false;
	$scope.dataTable = "";
	$scope.Math = Math;
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

	$scope.getData = function(){
		console.log("$scope.url",$scope.url);
		$scope.id_servicio = (parseInt(getParam("id_servicio")) < 10) ? "0"+getParam("id_servicio"):getParam("id_servicio");
		$scope.id_cliente = (parseInt(getParam("id_cliente")) < 10) ? "0"+getParam("id_cliente"):getParam("id_cliente");
		$scope.campana = getParam("campana").replace(/%20/g, " ");;
		Title.setTitle("Metas para la campaña "+$scope.campana+" :");
		$http.get($scope.url+"?id_cliente="+getParam("id_cliente")+"&id_servicio="+getParam("id_servicio"))
			.then(function(result){
				$scope.datosMetas = result.data;
				$scope.serieData = [$scope.datosMetas.metas.dataMedia,$scope.datosMetas.medias.dataMedia];
				$scope.mediaUrl = 'interior/monitor_metas/graficos.html?upd='+((1+Math.random())*1000);
				setTimeout($scope.configDataTable,1000);
			});
	}

	$scope.getData();
	setInterval($scope.getData,300000);

	function getParam(needle) {
        if (location.href.indexOf(needle + "=") != -1) {
            var result = location.href.substring(location.href.indexOf(needle + "=") + needle.length + 1);
            return result.substring(0, (result.indexOf("&") != -1 ? result.indexOf("&") : result.length));
        }
        return '';
    }

    $scope.options = {
	    scales: {
	      yAxes: [
	        {
	          id: 'y-axis-1',
	          type: 'linear',
	          display: true,
	          position: 'left'
	        },
	        {
	          id: 'y-axis-2',
	          type: 'linear',
	          display: true,
	          hoverBackgroundColor: "rgba(255,99,132,0.4)",
        	  hoverBorderColor: "rgba(255,99,132,1)",
	          position: 'right'
	        }
	      ]
	    }
	  };

	$scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];

	$scope.$on("create", function(evt, chart) {
		console.log("adasdasdasdasdasd");
		console.log(chart);
		var barras = chart.datasets;
		for (var i = 0; i < barras.length; i++) {
			if(i == 1){
				barras[i] = $scope.asignarColor(barras[i],"green");
			}
		}
      	chart.update();
		/*
		var max = barras[0].value;
		*/
    });

    $scope.volverMeta = function(){
    	var baseUrl = $location.protocol()+"://"+$location.host()+":"+$location.port();
		window.open(baseUrl+'/#/reportes/mantenedorMetas');
    }

	/* color verde : #66BB66
		color negro : #000 */
    $scope.asignarColor = function(barra,color){
    		var color = "rgba(0, 255, 46,0.2)";
			barra.fillColor=color;
			barra.strokeColor=color;
			barra.highlightFill=color;
			barra.highlightStroke=color;
    	return barra;
    }

    $scope.configDataTable = function (){
		$scope.dataTable = $('#tablaMeta').DataTable({
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
    }
});