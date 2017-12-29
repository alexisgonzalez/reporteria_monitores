reportMedias.controller('mantenedorPerfilesController',function($scope, $http, $cookies, $location,Notification, Title){
	$scope.tablaURL ="interior/mantenedor_perfiles/tabla.html";
	$scope.modalURL ="interior/mantenedor_perfiles/form.html";
	$scope.formPerfil = [];
	$scope.formPath = {};

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

	$scope.cargarPerfiles = function(){
		$http.get('/mantenedor/listarPerfiles').then(function(result){
			$scope.list=result.data;
			$scope.tablaURL = 'interior/mantenedor_perfiles/tabla.html?upd='+Math.random();
			setTimeout($scope.startDataTable,500);
		});
	}
	$scope.cargarPerfiles();
	$scope.editarPerfil = function(modo,data){
		$scope.formPerfil = data;
		$scope.formPerfil.modo = modo;
		$http.post("/mantenedor/listaMenu", $scope.formPerfil).then(function(result){
          $scope.menu_perfil = result.data;
        });
        $http.post("/mantenedor/listaMenuPadre", $scope.formPerfil).then(function(result){
         	$scope.menu_padre_perfil = result.data.perfil;
        });
        $scope.perfil=[];
	}

	$scope.guardarPerfil = function(){
		$scope.formPerfil.perfil = $scope.menu_perfil.perfil;
		if($scope.formPerfil.modo==0)
			var url = "/mantenedor/agregarPerfil";
		else 
			var url = "/mantenedor/modificarPerfil"; 
		$http.post(url, $scope.formPerfil).then(function(result){
			if(result.data.save){
				Notification.success({message:"Perfil guardado correctamente.",delay:10000});
				$('#modalClose').click();
				$scope.cargarPerfiles();
			}else{
				Notification.Error({message:"Vuelva a intentar mas tarde.",delay:10000});
			}
		});
	}

	$scope.agregarPerfil = function(modo){
		$scope.formPerfil = {};
		$scope.formPerfil.modo = modo;
		$http.post("/mantenedor/listaMenu", $scope.formPerfil).then(function(result){
          $scope.menu_perfil = result.data;
        });
        $http.post("/mantenedor/listaMenuPadre", $scope.formPerfil).then(function(result){
         	$scope.menu_padre_perfil = result.data.perfil;
        });
        $scope.perfil=[];
	}

	$scope.estadoPerfil = function(modo, data){
		$scope.formPerfil = data;
		$scope.formPerfil.modo = modo;
		if($scope.formPerfil.modo==0 && $scope.formPerfil.asignado > 0)
		{
			Notification.info({message:"No es posible desativar perfil mientras se encuentre asignado.",delay:10000});
		}else{
			$http.post("/mantenedor/estadoPerfil", $scope.formPerfil).then(function(result){
          		if(result.data.save){
          			Notification.success({message:"Perfil modificado correctamente.",delay:10000});
          			$scope.cargarPerfiles();
          		}else{
          			Notification.Error({message:"Vuelva a intentar mas tarde.",delay:10000});
          		}
        	});
		}
	}

	$scope.startDataTable = function(){
		$scope.dataTable = $('#tabla').DataTable({
			scrollX:true,
			scrollY:"400px",
			scrollCollapse:true,
			paging:false,
			destroy: true,
			fixedColumns: true,
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