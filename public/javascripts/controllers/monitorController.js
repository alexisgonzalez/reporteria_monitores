reportMedias.controller('monitorController', function($scope, $http, $cookies, $location, Notification, Upload, $timeout) {
	$('#wrapper.toggled').find("#sidebar-wrapper").find(".collapse").collapse('hide');
	/*$scope.group = [{name:moment(DayPilot.Date.today()).format("YYYY-MM-DD").toString(),children:[]}];
    $scope.dayChoise = moment(DayPilot.Date.today()).format("YYYY-MM-DD");
    $scope.events = [{
			        start: new DayPilot.Date("2016-09-06T12:00:00"),
			        end: new DayPilot.Date("2016-09-06T13:30:00"),
			        id: DayPilot.guid(),
			        text: "First Event",
			        resource: "col_abravo"
			    }];
	$scope.config = {
        startDate: moment(DayPilot.Date.today()).format("YYYY-MM-DD"),
        viewType: "Resources",
        days: 1,
        locale: "Es-es",
        allDayEventHeight: 20,
        cellDuration: 15, // duracion en minutos de cada fila
        cellHeight: 15,
        dayBeginsHour: 9, // hora comienzo a mostrar
        dayEndsHour: 22, // hora fin
        //businessEndsHour: 22,
        allowMultiSelect: false,
        showEventStartEnd: true, // permite mostrar la hora de comienxo y fin de un evento (ej: 9:00 - 13:00)
        columnWidthSpec: "Fixed",
        columnWidth: 60,
        headerLevels: 2,
		eventMoveHandling: "Disabled",
   		eventResizeHandling: "Disabled",
        columns: $scope.group,

        // antes de pintar cada celda
        onBeforeCellRender: function(args) {
            args.cell.business = true;
            $('.calendar_default_corner_inner').parent().parent().html('');
            $('#dp').css('border', 'none');
        }
    	$(".calendar_default_now").css("z-index",999);
		$(".calendar_default_now").parent().css("z-index",999);
    }*/
	$scope.listUsers = [];
	$scope.tablaMonitor = 'interior/monitor/tabla_monitor.html';
	$scope.horasMonitor = {};
	$scope.cuartosMonitor = {};
	$scope.fechaMonitor = moment(DayPilot.Date.today()).format("YYYY-MM-DD");
	$scope.sizeHoras = 0;

	$scope.rellenarCalendar = function (){
		$http.get("/monitor/getHorarioUsers?fecha_inicio="+$scope.dayChoise)
			.then(function(result){
				$scope.events= result.data;
				console.log($scope.events);
			});
	}
    $scope.getUsers = function(){
    	$http.get("/monitor/getUsers?fecha_inicio="+moment(DayPilot.Date.today()).format("YYYY-MM-DD"))
    		.then(function(result){
    			$scope.listUsers = result.data;
    			$scope.rellenarCalendar();
    		});
    }
    $scope.rellenarHora = function(){
    	$scope.cuartosMonitor = {'09:00:00':{label:'00'},'09:15:00':{label:'15'},'09:30:00':{label:'30'},'09:45:00':{label:'45'},
			'10:00:00':{label:'00'},'10:15:00':{label:'15'},'10:30:00':{label:'30'},'10:45:00':{label:'45'},
			'11:00:00':{label:'00'},'11:15:00':{label:'15'},'11:30:00':{label:'30'},'11:45:00':{label:'45'},
			'12:00:00':{label:'00'},'12:15:00':{label:'15'},'12:30:00':{label:'30'},'12:45:00':{label:'45'},
			'13:00:00':{label:'00'},'13:15:00':{label:'15'},'13:30:00':{label:'30'},'13:45:00':{label:'45'},
			'14:00:00':{label:'00'},'14:15:00':{label:'15'},'14:30:00':{label:'30'},'14:45:00':{label:'45'},
			'15:00:00':{label:'00'},'15:15:00':{label:'15'},'15:30:00':{label:'30'},'15:45:00':{label:'45'},
			'16:00:00':{label:'00'},'16:15:00':{label:'15'},'16:30:00':{label:'30'},'16:45:00':{label:'45'},
			'17:00:00':{label:'00'},'17:15:00':{label:'15'},'17:30:00':{label:'30'},'17:45:00':{label:'45'},
			'18:00:00':{label:'00'},'18:15:00':{label:'15'},'18:30:00':{label:'30'},'18:45:00':{label:'45'},
			'19:00:00':{label:'00'},'19:15:00':{label:'15'},'19:30:00':{label:'30'},'19:45:00':{label:'45'},
			'20:00:00':{label:'00'},'20:15:00':{label:'15'},'20:30:00':{label:'30'},'20:45:00':{label:'45'},
			'21:00:00':{label:'00'},'21:15:00':{label:'15'},'21:30:00':{label:'30'},'21:45:00':{label:'45'}
		};
		$scope.horasMonitor = {
			'09:00:00':{label:'09:00'},
			'10:00:00':{label:'10:00'},
			'11:00:00':{label:'11:00'},
			'12:00:00':{label:'12:00'},
			'13:00:00':{label:'13:00'},
			'14:00:00':{label:'14:00'},
			'15:00:00':{label:'15:00'},
			'16:00:00':{label:'16:00'},
			'17:00:00':{label:'17:00'},
			'18:00:00':{label:'18:00'},
			'19:00:00':{label:'19:00'},
			'20:00:00':{label:'20:00'},
			'21:00:00':{label:'21:00'}
		}
		$scope.sizeHoras = Object.keys($scope.cuartosMonitor).length;
    }
    $scope.rellenarHora();
	$scope.getUsers();

});