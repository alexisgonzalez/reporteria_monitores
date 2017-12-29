reportMedias.controller('monitorGraphLlamadoController',function($scope, $http,$cookies,$location,Title){
	$scope.dataGrafico = {};
	$scope.formPath = {};
	$scope.campanas = [];
	$scope.frmFiltro = {campanas:[]};
	$scope.graficoURl = 'interior/monitor_llamado_graph/graficos.html';
	$scope.titulo_grafico = "Todas";
	
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

	$scope.getCampanas = function(){
		$http.get("/monitor/campanasTiempoReal")
		.then(function(result){
			$scope.campanas = result.data;
		})
	}
	$scope.getCampanas();

	$scope.getGrafico = function(){
		if($scope.frmFiltro.campanas.length > 0){
			$scope.titulo_grafico = "";
			angular.forEach($scope.campanas,function(campana,key){
				angular.forEach($scope.frmFiltro.campanas,function(campana_id,key_2){
					if(campana_id == campana.campaign_id){
						if($scope.titulo_grafico == "")
							$scope.titulo_grafico += campana.campaign_name;
						else
							$scope.titulo_grafico += ", "+campana.campaign_name;
					}
				});
			});
		}
		$http.post("/monitor/llamadosGraph",$scope.frmFiltro)
		.then(function(result){
			$scope.dataGrafico = result.data;
			$scope.graficoURl = 'interior/monitor_llamado_graph/graficos.html?upd='+((1+Math.random())*1000);
			console.log($scope.dataGrafico);
		});	
	}
	$scope.getGrafico();
	setInterval($scope.getGrafico,30000);

	$scope.options = {
		 scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
	  };

	$scope.datasetOverride = [{ yAxisID: 'y-axis-1' }];

	$scope.$on("create", function(evt, chart) {
		console.log(chart);
		chart.scale.beginAtZero = true;
		chart.scale.min = 0;
		chart.scale.max = 100;
		chart.options.tooltipTemplate = "<%if (label){%><%=label%>: <%}%><%= value %> %";

		chart.update();
	});
});