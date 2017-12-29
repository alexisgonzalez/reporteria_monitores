reportMedias.controller('produccionOperadorController',function($scope, $http,$cookies,$location,Notification,Title){
	$scope.operador=$cookies.operadora;
	$scope.tablaURL = 'interior/produccion_operador/tabla.html';
	$scope.filtroURL = "interior/produccion_operador/filtro.html";
	$scope.formProduccion={};
	fecha_filtro = '';
	$scope.formPath = {};
	$('.loadingGif').hide();
	$('#contenido').hide();
	$scope.pais = $cookies.id_pais;

	$scope.actualizarTitulo = function(){
        path = $location.path();
        $scope.formPath.path = path;
        $http.post('/tituloPagina',$scope.formPath).then(function(result){
            $scope.title = result.data;
            Title.setTitle($scope.title[0].mos_titulo_pagina+" "+$scope.operador, $scope.title[0].mos_descripcion);
            $('#wrapper.toggled').find("#sidebar-wrapper").find(".collapse").collapse('hide');
        });
    }

    $scope.actualizarTitulo();
	$scope.verProduccion = function(){
		$('.loadingGif').show();
		$('#contenido').hide();
		$http.post("/getProduccionOperador",$scope.formProduccion).then(function(result){
			$scope.fechas = result.data['fechas'];
			$scope.vicidial = result.data['datosVicidial'];
			$scope.totalDia = result.data['totalDias'];
			$scope.totalFinal = result.data['totalFinal'];
			$scope.vibox = result.data['datosVibox'];
			$scope.tablaURL = 'interior/produccion_operador/tabla.html?upd='+Math.random();
			setTimeout($scope.startDataTable,1000);
			$('.loadingGif').hide();
			$('#contenido').show();
		});
	}

	$scope.startDataTable = function(){
		$scope.dataTable = $('#tabla').DataTable({
			scrollX:true,
			info: false,
			scrollY:"200px",
			scrollCollapse:true,
			searching: false,
			paging:false,
			destroy: true,
			fixedColumns: {
				leftColumns: 1,
				rightColumns:2
			},
			order: [[ 0, "asc" ]],
			language: {
				"sZeroRecords": "No se encontraron resultados",
				"sEmptyTable": "Ningún dato disponible en esta tabla",
				"sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ ",
				"sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0",
				"sInfoFiltered": "(filtrado de un total de _MAX_ )",
				"sInfoPostFix": "",
				"sSearch": "Buscar:",
				"sUrl": "",
				"sInfoThousands": ",",
				"sLoadingRecords": "Cargando...",
				"oPaginate": {
					"sFirst": "Primero",
					"sLast": "Ultimo",
					"sNext": "Siguiente",
					"sPrevious": "Anterior"
				},
				"oAria": {
					"sSortAscending": ": Activar para ordenar la columna de manera ascendente",
					"sSortDescending": ": Activar para ordenar la columna de manera descendente"
				}
			}
		});
	}
	
	$scope.exportData = function () {
        var blob = new Blob([document.getElementById('divTabla').innerHTML], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });
        saveAs(blob, "Produccion.xls");
    };
});