angular.module('reportMedias').service('GlobalServices',['$http',function($http){
	return {
		getListaCamposDomo: function(){
			return $http({
				method: 'GET',
				url: '/listCamposDomo'
			});
		}
	}
}]);