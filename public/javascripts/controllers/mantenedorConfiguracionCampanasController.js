reportMedias.controller('mantenedorConfiguracionCampanasController',function($scope,$http,$cookies,$location,Notification,Title){
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
	$scope.formURL = "interior/mantenedor_configuracion_campanas/form.html";
    $scope.tablaURL = "interior/mantenedor_configuracion_campanas/tabla.html";
    $scope.dataTable = '';
    $scope.form = {};

    $scope.listarConfiguraciones = function(){
        $http.get('/mantenedor/listaConfiguracion').then(function(result){
            $scope.listaConfiguracion = result.data;
            $scope.tablaURL = 'interior/mantenedor_configuracion_campanas/tabla.html?upd='+Math.random();
            if($scope.dataTable!='')
                $scope.dataTable.destroy(true);
            setTimeout($scope.startDataTable,500);
        });
    }

    $scope.listarConfiguraciones();

    $scope.levantarModal = function(){
        $scope.form = {};
        $scope.form.modo = 'Agregar';
    }

    $scope.guardarConfiguracion = function(){
        console.log($scope.form);
        $http.post("/mantenedor/guardarConfiguracion",$scope.form).then(function(result){
            if(result.data.save){
                Notification.success({message:"Campaña agendada correctamente.",delay:10000});
                $('#cerrarModal').click();
                $scope.listarConfiguraciones();
            }
            else
                Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});
        });
    }

    $scope.startDataTable = function(){
        $scope.dataTable = $('#tabla').DataTable({
            scrollX:true,
            scrollY:"500px",
            scrollCollapse:true,
            paging:false,
            destroy: true,
            order: [[ 0, "asc" ]],
            columnDefs: [
                { type: 'date-uk', targets: [2]}
            ],
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

    $scope.desactivarConfiguracion = function(data){
        $scope.form = data;
        $http.post("/mantenedor/desactivarConfiguracion",$scope.form).then(function(result){
            if(result.data.save){
                $scope.listarConfiguraciones();
                Notification.success({message:"Campaña agendada correctamente.",delay:10000});
            }
            else
                Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});
        });
    }
});