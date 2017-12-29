'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */
angular.module('reportMedias')
	.directive('header',function(){
		return {
        templateUrl:'scripts/directives/header/header.html',
        restrict: 'E',
        replace: true,
    	controller:function($scope,$http,$cookies){
    		$("#menu-toggle").click(function(e) {
    			e.preventDefault();

    			$("#wrapper").toggleClass("toggled");

    			$('#wrapper.toggled').find("#sidebar-wrapper").find(".collapse").collapse('hide');
    		});

    		
    	}
    	}
	});


