reportMedias.controller('mantenedorSupervisorController',function($scope, $http,$cookies,$location,Notification,Upload,Title){
	$scope.listSupervisores = [];
	$scope.frmSupervisor = {};
	$scope.filtroListaSupervisores = {filtroActivo:true}
	$scope.tablaSUP = 'interior/mantenedor_supervisor/tabla.html';
	$scope.dataTable = "";
	$scope.dialog = {};
	$scope.dataSupervisor = {};
	$scope.modo_agregar = false;
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

	$scope.traerListaSupervisores = function(){
		$http.post('/mantenedor/listaSupervisor',$scope.filtroListaSupervisores)
			.then(function(result){
				if($scope.dataTable != "")
					$scope.dataTable.destroy(true);
				$scope.tablaSUP = 'interior/mantenedor_supervisor/tabla.html?upd='+Math.random();
				$scope.listSupervisores = result.data;
				setTimeout($scope.iniciarDataTable,300);
			});
	}

	$scope.traerListaSupervisores();

	$scope.mostrarFormSupervisor = function(modo,data){
		$scope.frmSupervisor = {};
		if(modo == 'editar'){
			$scope.modo_agregar = false;
			$scope.frmSupervisor = data;
		}
		if(modo=='agregar'){
			$scope.modo_agregar = true;
			$scope.frmSupervisor = {};
		}
	}

	$scope.guardarSupervisores = function (){
		$http.post("/mantenedor/guardarSupervisores",$scope.frmSupervisor)
			.then(function(result){
				$scope.traerListaSupervisores();
				$scope.upload($scope.frmSupervisor.file);
				if(result.data.save){
					$('#cerrarModal').click();
					Notification.success({message:"Supervisor guardado correctamente.",delay:10000});
				}
				else
					Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});
			});
	}

	$scope.upload = function (file) {
        Upload.upload({
            url: '/mantenedor/supervisor/subirImagen',
            data: {file: file, 'username': $scope.frmSupervisor.user}
        }).then(function (resp) {
            console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });
    };

	$scope.iniciarDataTable = function(){
		$scope.dataTable = $('#tablaOperadores').DataTable({
            scrollX:true,
            scrollY:"400px",
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

	$scope.showConfirm = function(data,modo) {
		if(modo == "eliminar"){
			$scope.dataSupervisor = data;
			$scope.dialog = {titleDialog:'Desactivar registro',
								contentDialog:'¿Estas seguro que quieres desactivar el registro?',
								botonDialog:'Desactivar',
								callback:$scope.desactivarSupervisor
							};
			$('#dialogConfirm').modal();
		}
	}

	$scope.desactivarSupervisor = function(){
		$http.post("mantenedor/desactivarSupervisor",$scope.dataSupervisor)
			.then(function(result){
				if(result.data.save)
					Notification.success({message:"Supervisor desactivado correctamente.",delay:10000});
				else
					Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});
				$scope.traerListaOperador();
			})
	}
})
.directive('fileModel', ['$parse', function ($parse) {
return {
    restrict: 'A',
    link: function(scope, element, attrs) {
        var model = $parse(attrs.fileModel);
        var modelSetter = model.assign;

        element.bind('change', function(){
            scope.$apply(function(){
                modelSetter(scope, element[0].files[0]);
            });
        });
    }
};
}]);
