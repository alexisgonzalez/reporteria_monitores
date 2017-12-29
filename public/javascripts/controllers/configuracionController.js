reportMedias.controller('configuracionController',function($scope, $http,$cookies,$location,Notification,GlobalServices, Title){
	$scope.listCamposDomo = {};
	$scope.frmCamposDomo = {campos:{}};
	$scope.status = {
	    isCustomHeaderOpen: false,
	    isFirstOpen: true,
	    isFirstDisabled: false,
	    open: true
	 };
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

	$scope.getListaCamposDomo = function (){
		GlobalServices.getListaCamposDomo()
			.success(function(result){
				$scope.listCamposDomo = result;
				$scope.startCookies();
			})
	}

	$scope.startCookies = function(){
		if($cookies.campos_domo != 0){
			$scope.frmCamposDomo.campos = JSON.parse($cookies.campos_domo);
		}else{// SINO TIENE DEFINIDO SE SELECCIONAN TODOS
			for(var campo in $scope.listCamposDomo){
				$scope.frmCamposDomo.campos[$scope.listCamposDomo[campo].camdo_id] = true;
			}
		}
	}

	$scope.guardarCamposDomo = function(){
		console.log("sadlasdldaslasdldsjfasdf");
		console.log($scope.frmCamposDomo);
		$('#dialogGuardando').modal('show');
		$http.post('/guardaCamposDomo',$scope.frmCamposDomo)
			.success(function(res){
				$('#dialogGuardando').modal('hide');
				if(res.save)
					Notification.success({message:res.mesj,delay:10000});
				else
					Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});
			})
	}
	$scope.getListaCamposDomo();
	
});
