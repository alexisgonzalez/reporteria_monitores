reportMedias.controller('mantenedorBrechaCostoController',function($scope, $http,$cookies,$location,Notification,Title){
	$scope.listaCosto = [];
	$scope.tablaURL = 'interior/mantenedor_brecha_costo/tabla.html';
	$scope.formURL = 'interior/mantenedor_brecha_costo/crear.html';
	$scope.frmCosto = {};
	$scope.brechaCosto = {};
	$scope.clientesVibox  = {};
	$scope.serviciosVibox = {};
	$scope.dataTable = "";
	$scope.dialog ={};
	$scope.desactivarSelect = false;
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

	$scope.getListaCosto = function(){
		$http.get("/mantenedor/listaCosto")
			.then(function(result){
				if($scope.dataTable != "")
						$scope.dataTable.destroy(true);
				$scope.listaCosto = result.data;
				$scope.tablaURL = 'interior/mantenedor_brecha_costo/tabla.html?upd='+((1+Math.random())*1000);
				setTimeout($scope.startDataTable,800);
			});
	}

	$scope.guardarBrechaCosto = function(){
		$scope.desactivarSelect = false;
		$http.post("/mantenedor/guardaBrechaCosto",$scope.frmCosto)
			.then(function(result){
				if(result.data.save){
					$('#modalBrechaCosto').modal('hide');
					$scope.frmCosto = {};
					$scope.getListaCosto();
					Notification.success({message:"Brecha guardada correctamente.",delay:10000});
				}else{
					Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});
				}
			});
	}

	$scope.editarBrecha = function(data){
		$scope.frmCosto = data;
		$scope.desactivarSelect = true;
		$("#modalBrechaCosto").modal();
	}

	$http.get('/vibox/getClientes')
		.then(function(result){
			$scope.clientesVibox = result.data;
			$scope.seleccioneCli = {id_cliente:0,cliente:"Seleccione Cliente"};
			$scope.clientesVibox.unshift($scope.seleccioneCli);
		});

	$scope.getListaCosto();

	$scope.getServiciosVibox = function(){
		$http.post('/vibox/getServicios',$scope.frmCosto)
			.then(function(result){
				$scope.serviciosVibox = result.data;
				$scope.seleccioneServ = {id_servicio:0,servicio:"Seleccione Servicio"};
				$scope.serviciosVibox.unshift($scope.seleccioneServ);
			});
	}

	$scope.showConfirm = function(data,modo) {
		if(modo == "eliminar"){
			$scope.brechaCosto = data;
			$scope.dialog = {titleDialog:'Desactivar registro',
								contentDialog:'¿Estas seguro que quieres desactivar el registro?',
								botonDialog:'Desactivar',
								callback:$scope.desactivarBrechaCosto
							};
			$('#dialogConfirm').modal();
		}
	}

	$scope.desactivarBrechaCosto = function(){
		$http.post('/mantenedor/desactBrechaCosto',$scope.brechaCosto)
			.then(function(result){
				if(result.data.save){
					$scope.getListaCosto();
					Notification.success({message:"Brecha desactivada correctamente.",delay:10000});
				}else{
					Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});
				}
			})
	}

	$scope.startDataTable = function(){
		$scope.dataTable = $('#tabla').DataTable({
			scrollX:true,
			scrollY:"500px",
			scrollCollapse:true,
			paging:false,
			destroy: true,
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