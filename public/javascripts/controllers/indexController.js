reportMedias.controller('IndexController',function($scope, $http,$cookies,$location, Title){
	Title.setTitle("Sio Calling");
	$('#wrapper.toggled').find("#sidebar-wrapper").find(".collapse").collapse('hide');
});