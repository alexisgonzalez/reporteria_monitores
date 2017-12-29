reportMedias.controller('postulacionController',function($scope, $http,$cookies,$location, Title, Notification){
    $scope.filtroURL = 'interior/postulacion/filtro.html';
    $scope.tablaURL = 'interior/postulacion/tabla.html';
    $scope.datos = false;
    $scope.formPath = {};
    $scope.formFiltro = {};
    $scope.formPostulante = {};

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

    $scope.buscarPostulaciones = function(){
    $scope.formPostulante = {};
    $scope.loading = true;
    $scope.datos = false;
        $http.post('/listaPostulacion',$scope.formFiltro).then(function(result){
            $scope.data = result.data.list;
            $scope.loading = false;
            $scope.datos = true;
            $scope.export = result.data.export;
            $scope.tablaURL = 'interior/postulacion/tabla.html?upd='+Math.random();
            setTimeout($scope.startDataTable,1000);
        });   
    }
    
    $http.get('/listaPaisesPostulacion').then(function(result){
        $scope.paises = result.data;
    });

    $http.get('/listaEstadoPostulacion').then(function(result){
        $scope.estados = result.data;
        $scope.estados.unshift({es_id_estado:null, es_nombre:"Todos"});
    });

    $http.get('/listaEstadoPostulacion').then(function(result){
        $scope.listEstados = result.data;
    });

    $scope.startDataTable = function(){
        $scope.dataTable = $('.tabla').DataTable({
            scrollX:true,
            scrollY:"500px",
            scrollCollapse:true,
            paging:false,
            destroy: true,
            order: [[ 0, "asc" ]],
            buttons: [
               'copy', 'csv', 'excel', 'pdf', 'print'
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

    $scope.exportData = function () {
        var blob = new Blob([document.getElementById('divTabla').innerHTML], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });
        saveAs(blob, "Postulacion.xls");
    }

    $scope.guardarEstado = function(post){
        $scope.formPostulante.pos_id_postulante = post;
        $http.post('/guardarEstadoPostulacion',$scope.formPostulante).then(function(result){
            if(result.data.save){;
                Notification.success({message:"Estado cambiado existosamente!",delay:10000});
                $scope.buscarPostulaciones();
            }else{
                Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});
            }
        });
    }
});