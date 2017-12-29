reportMedias.controller('mantenedorIncidenciaController',function($scope, $http,$cookies,$location,Notification, Title){
	$scope.tablaURL = "interior/mantenedor_incidencia/tabla.html";
	$scope.filtroURL = "interior/mantenedor_incidencia/filtro.html";
	$scope.modalURL = "interior/mantenedor_incidencia/modal.html";
	$scope.formIncidencia = {};
	$scope.formPath = {};
	$scope.iconos = [];   
	$scope.formIcons = {};
	$scope.loadingGif=true;

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

	$scope.listarIncidencias = function(){
		$scope.loadingGif=true;
		$http.get('/mantenedor/listaIncidencia').then(function(result){
			$scope.incidencia = result.data;
			$scope.loadingGif=false;
			$scope.tablaURL = 'interior/mantenedor_incidencia/tabla.html?upd='+Math.random();
			setTimeout($scope.iniciarDataTable,800);
		});
	}
	$scope.listarIncidencias();
	$http.get('/mantenedor/listTipo').then(function(result){
		$scope.tipo = result.data;
	});

	$scope.editarIncidencia = function(modo, data){
		$scope.formIncidencia = {};
		if(modo == 'editar'){
			$scope.formIncidencia = data;
		}
	}

	$scope.guardarIncidencia = function(){
		$http.post("/mantenedor/guardarIncidencia",$scope.formIncidencia)
		.then(function(result){
			$scope.listarIncidencias();
			$('#cerrarModal').click();
			if(result.data.save)
				Notification.success({message:result.data.msje,delay:10000});
			else
				Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});
		});
	}

	$scope.iniciarDataTable = function(){
		$scope.dataTable = $('#tabla').DataTable({
            scrollX:true,
            scrollY:"600px",
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

	$http.get("/mantenedor/iconos").then(function(result){
		$scope.iconos = result.data;
	});
});
