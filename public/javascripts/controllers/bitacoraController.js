reportMedias.controller('BitacoraController',function($scope, $http,$cookies,$location,Notification,Title){
    $scope.bitacoras = {};
    $scope.tablaBitacora = 'interior/bitacoras/tabla_bitacora_general.html';
    $scope.dataTableBitacora = "";
    $scope.frmBitacoras = {date_begin:"",date_end:""};
    $scope.frmEditarBitacora = {};
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

	$scope.countDays = function(date_begin, date_end){
    	var sep_begin = date_begin.split("/");
    	var sep_end = date_end.split("/");
    	var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
		var firstDate = new Date(sep_begin[2],sep_begin[1],sep_begin[0]);
		var secondDate = new Date(sep_end[2],sep_end[1],sep_end[0]);

		var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));

		return diffDays;
    }

	$scope.traerBitacoras = function (){
		cant_days = $scope.countDays($scope.frmBitacoras.date_begin,$scope.frmBitacoras.date_end);
		$scope.frmBitacoras.cant_days = cant_days;
		$http.post('/vibox/bitacoras',$scope.frmBitacoras)
				.then(function(result){
					if($scope.dataTableBitacora != "")
						$scope.dataTableBitacora.destroy(true);
					$scope.tablaBitacora = 'interior/bitacoras/tabla_bitacora_general.html?upd='+Math.random();
					$scope.bitacoras = result.data;
                    console.log($scope.bitacoras);
					setTimeout($scope.iniciarDataTableBitacora,300);
				});
	}

    $scope.editarBitacora = function(bitacora){
        $scope.frmEditarBitacora = bitacora;
        //$("#modalEditarBitacora").modal();
    }

    $scope.guardaEditarBitacora = function(){
        $http.post('/vibox/editarBitacora',$scope.frmEditarBitacora)
        .then(function(result){
            if(result.data.save){
                $scope.traerBitacoras();
                Notification.success({message:"Bitacora guardada correctamente.",delay:10000});
            }else
                Notification.error({message:"<b>Error</b>: Intente nuevamente.",delay:10000});
        })
    }
	$scope.traerBitacoras();

	$scope.iniciarDataTableBitacora = function(){
        var i_col = 0;
        $scope.dataTableBitacora = $('#tablaBitacora').DataTable({
            preDrawCallback: function () {
                i_col = 0;
                this.api().columns().every( function () {
                    i_col++;
                    if(i_col == 1 || i_col == 2 || i_col == 3 || i_col == 9 || i_col == 10){
                        console.log("No va");
                    }else{
                        console.log("va");
                        var column = this;
                        var select = $('<select class="form-control"><option value=""></option></select>')
                            .appendTo( $(column.footer()).empty() )
                            .on( 'change', function () {
                                console.log("cambio");
                                var val = $.fn.dataTable.util.escapeRegex(
                                    $(this).val()
                                );
         
                                column
                                    .search( val ? '^'+val+'$' : '', true, false )
                                    .draw();
                            } );
         
                            column.data().unique().sort().each( function ( d, j ) {
                                if(column.search() === '^'+d+'$'){
                                    select.append( '<option value="'+d+'" selected="selected">'+d+'</option>' )
                                } else {
                                    select.append( '<option value="'+d+'">'+d+'</option>' )
                                }
                            } );
                    }
                } );
            },
            dom: 'Bfrtip',
            buttons: [
               'copy', 'csv', 'excel', 'pdf', 'print'
            ],
            scrollX:true,
            scrollY:"250px",
            scrollCollapse:true,
            paging:false,
            destroy: true,
            fixedColumns:{
                rightColumns:1
            },
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