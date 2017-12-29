reportMedias.controller('monitoreoMetaController',function($scope, $http, $cookies, $location,Notification,Title){
	$scope.elegir_metas = false;
	$scope.metas = "interior/monitoreo_meta/meta1.html";
	$scope.formulario = "interior/monitoreo_meta/form_meta.html";
	$scope.loading = false;
	$scope.preferencias = {};
	$scope.formPath = {};
	$scope.frmMetas = {};
	$scope.actualizacion = '';
	$scope.revisarPreferencias = function(){
		$scope.loading = true;
		$http.get('/monitor/buscarPreferencias').then(function(result){
			if(result.data.preferencias){
	    		$scope.listaMetas();
                $scope.elegir_metas = false;
	    	}else{
				$scope.frmMetas = {};
	    		$scope.loading = false;
	    		$scope.elegir_metas = true;
	    		$scope.getClientes();
	    	}
	    });	
	}

    $scope.actualizarTitulo = function(){
        path = $location.path();
        $scope.formPath.path = path;
        $http.post('/tituloPagina',$scope.formPath).then(function(result){
            $scope.title = result.data;
            Title.setTitle($scope.title[0].mos_titulo_pagina, $scope.title[0].mos_descripcion);
            $('#wrapper.toggled').find("#sidebar-wrapper").find(".collapse").collapse('hide');
        });
    }

    $scope.listaMetas = function(){
        $scope.actualizacion = $scope.title[0].mos_titulo_pagina + "  "+moment().format('DD-MM-YYYY HH:mm');
        Title.setTitle($scope.actualizacion, $scope.title[0].mos_descripcion);
        $http.get('/monitor/metasDiarias').then(function(result){
            $scope.datosMetas = result.data;
            $scope.preferencias = $scope.datosMetas.preferencias;
            $scope.loading = false;
            $scope.metas = 'interior/monitoreo_meta/meta1.html?upd='+((1+Math.random())*1000);

        }); 
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

    $scope.asignarColor = function(barra,color){
            var color = "rgba(0, 255, 46,0.2)";
            barra.fillColor=color;
            barra.strokeColor=color;
            barra.highlightFill=color;
            barra.highlightStroke=color;
        return barra;
    }

    $scope.getClientes = function(){
        $http.get('/vibox/getClientes')
        .then(function(result){
            $scope.listaClientes = result.data;
            $scope.listaClientes.unshift($scope.seleccioneCli);
        });
    }

    $scope.getServiciosVibox1 = function(){
        $http.post('/vibox/getServicios',$scope.frmMetas)
        .then(function(result){
            $scope.listaServicio1 = result.data;
            $scope.listaServicio1.unshift($scope.seleccioneServ);
        });
    }
    $scope.getServiciosVibox2 = function(){
        $http.post('/vibox/getServicios',$scope.frmMetas)
        .then(function(result){
            $scope.listaServicio2 = result.data;
            $scope.listaServicio2.unshift($scope.seleccioneServ);
        });
    }
    $scope.getServiciosVibox3 = function(){
        $http.post('/vibox/getServicios',$scope.frmMetas)
        .then(function(result){
            $scope.listaServicio3 = result.data;
            $scope.listaServicio3.unshift($scope.seleccioneServ);
        });
    }
    $scope.getServiciosVibox4 = function(){
        $http.post('/vibox/getServicios',$scope.frmMetas)
        .then(function(result){
            $scope.listaServicio4 = result.data;
            $scope.listaServicio4.unshift($scope.seleccioneServ);
        });
    }

    $scope.guardarPreferencia = function(){
        $http.post('/monitor/guardarPreferenciasMetas',$scope.frmMetas).then(function(result){
            if(result.data.save){
                Notification.success({message:"<b>Cargando metas</b>. .",delay:200});
                $scope.revisarPreferencias();
            }else
                Notification.info({message:"<b>Info</b>: Revise sus datos e intente nuevamente.",delay:10000});
        });
    }

    $scope.actualizarTitulo();
    $scope.revisarPreferencias();
    setInterval($scope.revisarPreferencias,180000);
}); 