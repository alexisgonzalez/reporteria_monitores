reportMedias.controller('listaAgendamientoController',function($scope, $http,$cookies,$location,Notification, Title){
	$scope.tablaURL = 'interior/lista_agendamiento/tabla_agendamiento.html';
	$scope.usuario = $cookies.operadora;
	$scope.dataTable='';
	$scope.agenda_id = 0;
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

	$scope.verDatos = function(){
		$('#contenido').hide();
		if($scope.dataTable!=''){
			$scope.dataTable.destroy();
		}
		$http.get('/listar_agendamiento').then(function(result){
			$scope.agendas=result.data;
			setTimeout($scope.startDataTable,1500);
			$scope.tablaURL = 'interior/lista_agendamiento/tabla_agendamiento.html?upd='+Math.random();
			$('#contenido').show();
		});
		console.log("Actualizando datos. . ");
	}

	$scope.verDatos();
	setInterval($scope.verDatos,300000);

	$scope.startDataTable = function(){
		$scope.dataTable = $('#tablaAgendamiento').DataTable({
			scrollX:true,
			scrollY:"500px",
			scrollCollapse:true,
			paging:false,
			destroy: true,
			order: [],
			columnDefs: [
				{ type: 'date-uk', targets: [6, 7]}
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
	//href="http://190.196.18.131:8200/CTI/camExecJF.php?id_ani={{agenda.id_ani}}&user={{agenda.operador}}"
	//http://190.196.18.131:8210/agc/api.php
	//?source=test&user=6666&pass=optimizachile2904&agent_user=daniela&function=external_dial&value=56989777897&phone_code=1&search=YES&preview=NO&focus=YES
	$scope.mandarLlamado = function(data,original){
		console.log("SOLO PARA CLARO");
		var agente = data.operador;
		//var agente = "daniela";
		var value = (original) ? data.ani:data.telefono_recuperado;
		$scope.agenda_id = data.agenda_id;
		var port = "8210";
		if(value.length == 9)
			value = "56"+value;
		if(value.length == 8)
			value = "562"+value;
		//var value = "56989777897";
		var options = {
			method: "GET",
			url:'http://190.196.18.131:'+port+'/agc/api.php?source=test&user=llamadoagendamiento&pass=xGmBtFAmm3sMQBNG&agent_user='+agente+'&function=external_dial&lead_id='+data.lead_id+'&value='+value+'&phone_code=1&search=YES&preview=NO&focus=YES',
			data:{source:'test',user:'llamadoagendamiento',pass:'xGmBtFAmm3sMQBNG',lead_id:data.lead_id,agent_user:data.operador,function:'external_dial',value:data.ani,phone_code:1,search:'YES',preview:'NO',focus:'YES'}
			//data:{source:'test',user:'6666',pass:'xGmBtFAmm3sMQBNG',agent_user:'daniela',function:'external_dial',value:'56989777897',phone_code:1,search:'YES',preview:'NO',focus:'YES'}
		}
		$http(options).then(function(result){
			$scope.getNotificacionLlamada(result.data,data);
		}, function(error){
			port = "8200";
			options.url='http://190.196.18.131:'+port+'/agc/api.php?source=test&user=llamadoagendamiento&pass=xGmBtFAmm3sMQBNG&agent_user='+agente+'&function=external_dial&lead_id='+data.lead_id+'&value='+value+'&phone_code=1&search=YES&preview=NO&focus=YES',
			$http(options).then(function(result){
				$scope.getNotificacionLlamada(result.data,data);
			});		
		});
	}

	$scope.getNotificacionLlamada = function (data,params){
		var error_login = data.indexOf('logged');
		if(error_login >= 0){
			Notification.error({message:"<b>Error</b>: El operador no esta conectado.",delay:10000});
		}else{
			var error_permiso = data.indexOf('allowed');
			if(error_permiso >= 0){
				Notification.error({message:"<b>Error</b>: El operador no tiene permisos para llamadas externas.",delay:10000});
				return false;
			}
			var error_lead = data.indexOf('lead_id');
			if(error_lead >= 0){
				Notification.error({message:"<b>Error</b>: El número no se encuentra en la lista.",delay:10000});
				return false;
			}
			texto = data.substr(0,5);
			if(texto == "ERROR"){
				Notification.error({message:"<b>Error</b>: El operador se encuentra en llamada.",delay:10000});
			}else{
				Notification.success({message:"Se envio llamada.",delay:10000});
				$http.post('/agenda/notificarLlamado',params)
				.then(function(result){
					$scope.verDatos();
				});
			}
		}
	}
});