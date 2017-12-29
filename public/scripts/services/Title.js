angular.module('reportMedias').service('Title',['$rootScope',function($rootScope){
    return {
        setTitle: function(title){
            $rootScope.title = title;
        }
    }
});