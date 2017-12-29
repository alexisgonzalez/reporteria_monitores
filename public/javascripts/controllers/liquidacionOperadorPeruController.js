reportMedias.controller('liquidacionOperadorPeruController',function($scope, $http,$cookies,$location, $rootScope, Title){
	$scope.filtroURL = 'interior/liquidacion_operador_peru/filtro.html';
	$scope.tablaURL = 'interior/liquidacion_operador_peru/tabla_liquidacion.html';
	$scope.formLiquidacion = {id_pais:2}; //ID PERU
	$scope.operadores = {};
	$scope.formPath = {};
	$scope.pais = {};

	$('.loadingGif').hide();
	$('#contenido').hide();

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

	$scope.cargarOperadores = function(){
		$scope.formLiquidacion.selectAll = [];
		$scope.formLiquidacion.selectOperador = [];
		$http.post('/listOperador', $scope.formLiquidacion).then(function(result){
			console.log($scope.formLiquidacion);
			$scope.operadores=result.data;
		});
	}

	$scope.cargarOperadores();
	$scope.selectAllOp = function(){
		console.log($scope.formLiquidacion.selectAll);
		$scope.formLiquidacion.selectOperador = [];
		if($scope.formLiquidacion.selectAll){
			angular.forEach($scope.operadores, function(value,key){
				$scope.formLiquidacion.selectOperador.push(value.us_sup_user_id);
			});
		}
		console.log($scope.formLiquidacion.selectOperador);
	}

	$scope.buscarDatos = function(){
		$('.loadingGif').show();
		$('#contenido').hide();
		$http.post('/liquidacionOperador', $scope.formLiquidacion).then(function(result){
			$scope.list=result.data.list;
			$scope.pais=result.data.pais;
			$scope.tablaURL = 'interior/liquidacion_operador_peru/tabla_liquidacion.html?upd='+Math.random();
			setTimeout($scope.startDataTable,1000);
			$('.loadingGif').hide();
			$('#contenido').show();
		});
	}

	$scope.startDataTable = function(){
		$scope.dataTable = $('#tabla').DataTable({
			dom: 'Bfrtip',
            buttons: [
               'copy', 'csv', 'excel', 'pdf', 'print'
            ],
			scrollX:true,
			scrollY:"450px",
			scrollCollapse:true,
			paging:false,
			destroy: true,
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
});