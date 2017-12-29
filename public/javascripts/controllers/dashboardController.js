reportMedias.controller('DashboardController',function($scope, $http,$cookies,$location, Title, Notification){
	$scope.datosMedias = {};
	$scope.mediaUrl = 'interior/dashboard_supervisor/graficos.html';
	$scope.usuarios = [];
	$scope.conectados = [];
	$scope.bitacoras = {};
	$scope.espera = {};
	$scope.drop = {};
	$scope.supervisor = $cookies.operadora;
	$scope.url = "/medias_general";
	$scope.isSupervisor = false;
	$scope.formPath = {};
	$scope.elegidos = false;
	$scope.frmCampanas = {};
	$scope.campanas = {};
	$scope.adherencia = {};
	$scope.validacion = false;

	$scope.actualizarTitulo = function(){
        path = $location.path();
        $scope.formPath.path = path;
        $http.post('/tituloPagina',$scope.formPath).then(function(result){
            $scope.title = result.data;
            $('#wrapper.toggled').find("#sidebar-wrapper").find(".collapse").collapse('hide');
        });
    }
    $scope.actualizarTitulo();

    if(angular.isUndefined($cookies.campanas) && $cookies.campanas != []){
    	$scope.elegidos = false;
    }else{
    	$scope.elegidos = true;
    }

    $scope.getAdherencia = function(){
    	$http.get('/monitor/adherencia?todas=1')
		.then(function(result){
			$scope.adherencia = result.data.adheData;
			delete $scope.dataAdherencia["3301"];
			delete $scope.dataAdherencia["S/C"];
			console.log($scope.dataAdherencia);
		});
    }

	$scope.getData = function(){
		$scope.getAdherencia();
		var nivel = $cookies.nivel;
		if(!angular.isUndefined($cookies.nivel)){
			if(nivel == 9 || nivel == 27){
				$scope.supervisor = "del día "+moment().format('DD-MM-YYYY HH:mm');
				$scope.url = "/medias_general";
			}else{
				$scope.url = "/dashboard";
			}
		}
		if(!$scope.elegidos && (nivel == 9 || nivel == 27)){
			$scope.getCampanas();
		}else{
			$scope.elegidos = true;
			$http.get($scope.url)
				.then(function(result){
					$scope.actualizacion = $scope.title[0].mos_titulo_pagina + " "+moment().format('DD-MM-YYYY HH:mm');
	            	Title.setTitle($scope.actualizacion, $scope.title[0].mos_descripcion);
					//Title.setTitle($location.url());
					//Title.setTitle("Campañas "+$scope.supervisor+ " " + $scope.actualizacion);
					$scope.datosMedias = result.data;
					$scope.mediaUrl = 'interior/dashboard_supervisor/graficos.html?upd='+((1+Math.random())*1000);
					$scope.usuarios = $scope.getUsuariosArr($scope.datosMedias["usuarios"]);
					$scope.conectados = $scope.datosMedias["conectados"];
					$scope.bitacoras = $scope.datosMedias["bitacoras"];
					$scope.espera = $scope.datosMedias["esperas"];
					$scope.drop = $scope.datosMedias["drop"];
					delete $scope.datosMedias["usuarios"];
					delete $scope.datosMedias["conectados"];
					delete $scope.datosMedias["bitacoras"];
					delete $scope.datosMedias["esperas"];
					delete $scope.datosMedias["drop"];
				});
		}
	}

	$scope.getCampanas = function(){
		$http.get("/get_campanas_monitor")
		.then(function(result){
			$scope.campanas = result.data;
		})
	}

	$scope.setCampanas = function(){
		if(!$scope.validarMonitor($scope.frmCampanas)){
            Notification.info({message:"<b>Debe seleccionar alguna preferencia</b>. .",delay:500});   
        }else{
			$http.post("/setear_campana_monitor",$scope.frmCampanas)
			.then(function(result){
				$scope.elegidos = true;
				$scope.getData();
			});
		}
	}

	$scope.getData();
	setInterval($scope.getData,300000);

	$scope.getUsuariosArr = function(data){
		var arrUsuario = [];
		_.forEach(data,function(value,key){
			if(!angular.isUndefined(value.us_sup_user))
				arrUsuario.push(value.us_sup_user);
			else
				arrUsuario.push(value.user);
		})
		return arrUsuario;
	}

	$scope.$on("create", function(evt, chart) {
		var barras = chart.datasets[0].bars;
		var max = barras[0].value;
		for (var i = 0; i < barras.length; i++) {
			var encontro = _.indexOf($scope.usuarios,barras[i].label);
			var porc = Math.floor((barras[i].value*100)/max);
			if(encontro >= 0){
				if(porc <= 100 && porc >= 92){
					barras[i] = $scope.asignarColor(barras[i],"#09F");
				}
				else if( porc >=80 && porc < 92){
					barras[i] = $scope.asignarColor(barras[i],"#0C0");
				}
				else if( porc >=40 && porc < 80){
					barras[i] = $scope.asignarColor(barras[i],"goldenrod");
				}
				else if(porc < 40){
					barras[i] = $scope.asignarColor(barras[i],"red");
				}
			}else{
				barras[i] = $scope.asignarColor(barras[i],"#999");
			}
		}
      	chart.update();
    });

	/* color verde : #66BB66
		color negro : #000 */
    $scope.asignarColor = function(barra,color){
    	if($scope.conectados.indexOf(barra.label) >= 0){
    		var colorBorde = color;
    		if(!angular.isUndefined($scope.bitacoras[barra.label]) && $scope.bitacoras[barra.label] == 18)
    			colorBorde = '#000';
    		if(!angular.isUndefined($scope.bitacoras[barra.label]) && $scope.bitacoras[barra.label] == 20)
    			colorBorde = '#66BB66';
			barra.fillColor=color;
			barra.strokeColor=colorBorde;
			barra.highlightFill=color;
			barra.highlightStroke=colorBorde;
			barra.strokeWidth=3;
    	}else{
    		var colorBorde = color;
    		if(!angular.isUndefined($scope.bitacoras[barra.label]) && $scope.bitacoras[barra.label] == 18)
    			colorBorde = '#000';
    		if(!angular.isUndefined($scope.bitacoras[barra.label]) && $scope.bitacoras[barra.label] == 20)
    			colorBorde = '#66BB66';
			barra.strokeColor=colorBorde;
			barra.strokeWidth=3;
    	}
		return barra;
    }

    $scope.validarMonitor = function(formulario){
        $scope.validacion = false;
        angular.forEach(formulario, function(key, form){
            $scope.validacion = true;
        });
        return $scope.validacion;
    }
});