reportMedias.controller('mantenedorUsuarioController',function($scope, $http,$cookies,$location,Notification,Upload,Title){
	$scope.listSupervisores = [];
	$scope.formUsuario = {};
	$scope.tablaURL = 'interior/mantenedor_usuario/tabla.html';
	$scope.dataTable = "";
	$scope.dialog = {};
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

	$scope.listaUsuario = function(){
		$http.get('/mantenedor/listUsuarios')
			.then(function(result){
				if($scope.dataTable != "")
					$scope.dataTable.destroy(true);
				$scope.tablaURL = 'interior/mantenedor_usuario/tabla.html?upd='+Math.random();
				$scope.listUsuarios = result.data;
				setTimeout($scope.iniciarDataTable,300);
			});
	}

	$scope.listaUsuario();

	$scope.mostrarFormUsuario = function(modo, data){
		$scope.formUsuario = data;
		$http.get('/mantenedor/listPerfilesActivos').then(function(result){
			$scope.perfil = result.data;
		});
	}

	$scope.guardarUsuario = function(){
		$http.post('/mantenedor/guardarUsuario',$scope.formUsuario).then(function(result){
			if(result.data.save){
				Notification.success({message:"Usuario guardado correctamente.",delay:10000});
				$scope.listaUsuario();
				$('#closeModal').click();
			}
			else
				Notification.error({message:"No se ha podido guardar correctamente.",delay:10000});
		});
	}

	$scope.desactivarUsuario = function(data) {
		$scope.formUsuario=data;
		$scope.dialog = {
			titleDialog:'Desactivar '+$scope.formUsuario.full_name,
			contentDialog:'¿Estas seguro que quieres desactivar el usuario?',
			botonDialog:'Desactivar',
			callback:$scope.desactivar
		};
		$('#dialogConfirm').modal();
	}

	$scope.desactivar = function(){
		$http.post('/mantenedor/desactivarUsuario',$scope.formUsuario).then(function(result){
			if(result.data.save){
				Notification.success({message:"Usuario guardado correctamente.",delay:10000});
				$scope.listaUsuario();
			}
			else
				Notification.error({message:"No se ha podido guardar correctamente.",delay:10000});
		});
	}

	$scope.iniciarDataTable = function(){
		$scope.dataTable = $('#tabla').DataTable({
            scrollX:true,
            scrollY:"600px",
            scrollCollapse:true,
            paging:false,
            destroy: true,
            order: [],
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
