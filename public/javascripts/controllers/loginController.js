reportMedias.controller('LoginController',function($scope, $http,$cookies,$location){
	$scope.frmLogin = {};
	$scope.startCookies = function(){
		if(!angular.isUndefined($cookies.operadora) && (!angular.isUndefined($cookies.nivel) && parseInt($cookies.nivel) == 1)){
			$location.path('/reporteHorario');
		}
	}

	$scope.startCookies();
});