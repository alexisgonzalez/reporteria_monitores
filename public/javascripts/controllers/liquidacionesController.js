reportMedias.controller('liquidacionesController',function($scope, $http,$cookies,$location,$timeout){
	$('#wrapper.toggled').find("#sidebar-wrapper").find(".collapse").collapse('hide');
	$scope.frmLiquidaciones = {periodoLiquidacion:''};
	$scope.tablaUrl = 'interior/liquidaciones/tabla.html';
	$scope.periodoLiquidacion = [];
	$scope.listLiquidaciones = {}
	$scope.formPath = {};

	$scope.generarPeriodoLiquidaciones = function(){
		var date_init = new Date('2015-05-23');
		var date_now = new Date();
		var month_diff = $scope.monthDiff(date_init,date_now);
		var date_before = new Date('2015-05-23');
		date_init = date_init.addMonths(1);
		var date_current = date_init;
		$scope.periodoLiquidacion.push({label:"Selecione periodo",value:''});
		for(var i=0;i<month_diff;i++){
			var period_label = date_current.getFullYear()+"-"+(date_current.getMonth()+1).toString().paddingLeft('00');
			var period_value = {date_begin:date_before.getFullYear()+'-'+(date_before.getMonth()+1).toString().paddingLeft('00')+"-24",date_end:date_current.getFullYear()+'-'+(date_current.getMonth()+1).toString().paddingLeft('00')+"-23"};
			date_before = date_before.addMonths(1);
			date_current = date_current.addMonths(1);
			$scope.periodoLiquidacion.push({label:period_label,value:period_value});
		}
		$scope.periodoLiquidacion.sort(function(a,b){return b-a});
	}

	$scope.monthDiff = function(d1, d2) {
	    var months;
	    months = (d2.getFullYear() - d1.getFullYear()) * 12;
	    months -= d1.getMonth() + 1;
	    months += d2.getMonth();
	    // edit: increment months if d2 comes later in its month than d1 in its month
	    if (d2.getDate() >= d1.getDate())
	        months++
	    // end edit
	    return months <= 0 ? 0 : months;
	}
	$scope.generarPeriodoLiquidaciones();

	$scope.mostrarLiquidaciones = function(){
		console.log($scope.frmLiquidaciones);
		$http.post('/showLiquidaciones',$scope.frmLiquidaciones)
			.then(function(result){
				$scope.listLiquidaciones=result;
			});
	}
});
Date.isLeapYear = function (year) { 
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)); 
};

Date.getDaysInMonth = function (year, month) {
    return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};

Date.prototype.isLeapYear = function () { 
    return Date.isLeapYear(this.getFullYear()); 
};

Date.prototype.getDaysInMonth = function () { 
    return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
};

Date.prototype.addMonths = function (value) {
    var n = this.getDate();
    this.setDate(1);
    this.setMonth(this.getMonth() + value);
    this.setDate(Math.min(n, this.getDaysInMonth()));
    return this;
};
String.prototype.paddingLeft = function (paddingValue) {
   return String(paddingValue + this).slice(-paddingValue.length);
};