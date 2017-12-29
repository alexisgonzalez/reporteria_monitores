reportMedias.controller('mantenedorPaisController',function($scope, $http,$cookies,$location,Notification,Upload,Title){
	$scope.paises = [];
	$scope.tablaPais = "interior/mantenedor_pais/tabla.html";
	$scope.dataTable = "";
	$scope.tipo_modal = "Agregar";
	$scope.frmPais = {};

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

    $scope.getPaises = function(){
    	$http.get("/mantenedor/paises")
    	.then(function(result){
    		if($scope.dataTable != "")
    			$scope.dataTable.destroy(true);

    		$scope.tablaPais = "interior/mantenedor_pais/tabla.html?upd="+((1+Math.random())*1000);
    		$scope.paises = result.data;
    		setTimeout($scope.startDataTable,500);
    	});
    }

    $scope.getPaises();

    $scope.showFormPais = function(tipo,data){
    	if(tipo == "agregar"){
    		$scope.frmPais = {};
    		$scope.tipo_modal = "Agregar";
    	}else{
    		$scope.frmPais = data;
    		$scope.tipo_modal = "Editar";
    	}
    }

    $scope.guardarPais = function(){
    	$http.post("/mantenedor/guardarPais",$scope.frmPais)
    	.then(function(result){
    		if(result.data.save){
				Notification.success({message:"País guardado correctamente.",delay:10000});
				$scope.getPaises();
				$("#formPais").modal("hide");
			}else{
				Notification.Error({message:"Vuelva a intentar mas tarde.",delay:10000});
			}
    	});
    }
    $scope.paisEliminar = {};
    $scope.showConfirm = function(data,modo) {
		if(modo == "eliminar"){
			$scope.paisEliminar = data;
			$scope.dialog = {titleDialog:'Desactivar país',
								contentDialog:'¿Estas seguro que quieres desactivar el país?',
								botonDialog:'Desactivar',
								callback:$scope.desactivarPais
							};
			$('#dialogConfirm').modal();
		}
	}

    $scope.desactivarPais = function(){
    	$http.post("/mantenedor/desactivarPais",$scope.paisEliminar)
    	.then(function(result){
    		if(result.data.save){
				Notification.success({message:"País desactivador correctamente.",delay:10000});
				$scope.getPaises();
				$("#formPais").modal("hide");
			}else{
				Notification.Error({message:"Vuelva a intentar mas tarde.",delay:10000});
			}
    	});
    }

    $scope.startDataTable = function(){
		$scope.dataTable = $('#tablaPais').DataTable({
			scrollX:true,
			scrollY:"500px",
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