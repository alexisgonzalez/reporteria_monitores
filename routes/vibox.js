var reportVibox = require('../model/vibox');
var reportModel = require('../model/user');
var helpers = require('../helpers/helpers');
var reportControlCalidad = require('../model/control_calidad');
var helpersCalidad = require('../helpers/helpersCalidad');

module.exports = function (app){
	app.get("/vibox/getClientes",function(req,res){
		var filtro = "";
		if(Object.keys(req.cookies).length > 0 && req.cookies.hasOwnProperty("operadora") && req.cookies.operadora != "undefined" && (parseInt(req.cookies.nivel) == 2 || parseInt(req.cookies.nivel) == 3)){
			var implode_cli = helpers.implodeClientesExterno(JSON.parse(req.cookies.clientes));
			filtro += " WHERE id_cliente IN ("+implode_cli+") ";
		}
		reportVibox.getClientes(filtro,function(error,data){
			res.status(200).json(data);
		});
	});
	app.post("/vibox/getServicios",function(req,res){
		var filtroCliente = "";
		if(req.body.hasOwnProperty("idCliente") && req.body.idCliente != ""){
			filtroCliente = "WHERE cli.id_cliente = "+req.body.idCliente;
		}
		else if(req.body.hasOwnProperty("id_cliente") && req.body.id_cliente != ""){
			filtroCliente = "WHERE cli.id_cliente = "+req.body.id_cliente;
		}
		else if(req.body.hasOwnProperty("id_cliente1") && req.body.id_cliente1 != ""){
			filtroCliente = "WHERE cli.id_cliente = "+req.body.id_cliente1;
		}
		else if(req.body.hasOwnProperty("id_cliente2") && req.body.id_cliente2 != ""){
			filtroCliente = "WHERE cli.id_cliente = "+req.body.id_cliente2;
		}
		else if(req.body.hasOwnProperty("id_cliente3") && req.body.id_cliente3 != ""){
			filtroCliente = "WHERE cli.id_cliente = "+req.body.id_cliente3;
		}
		else if(req.body.hasOwnProperty("id_cliente4") && req.body.id_cliente4 != ""){
			filtroCliente = "WHERE cli.id_cliente = "+req.body.id_cliente4;
		}

		filtroCliente +=" order by servicio";
		reportVibox.getServicios(filtroCliente,function(error,data){
			res.status(200).json(data);
		});
	});

	app.post("/vibox/getCampanas",function(req,res){
		var filtroCampana = " WHERE 1=1 and (observacion is null or observacion <> 'Vicidial') ";
		if(req.body.hasOwnProperty("idCliente") && req.body.idCliente != ""){
			filtroCampana += " AND cam.id_cliente = "+req.body.idCliente;
		}
		if(req.body.hasOwnProperty("idServicio") && req.body.idServicio != ""){
			filtroCampana += " AND cam.id_servicio = "+req.body.idServicio;
		}
		if(req.body.hasOwnProperty("date_begin") && req.body.date_begin != ""){
			var fecha_inicio = req.body.date_begin.split("/").reverse().join("-");
			var fecha_fin = req.body.date_end.split("/").reverse().join("-");
			filtroCampana += " AND med.fecha_llamado BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"'";
		}
		reportVibox.getCampanas(filtroCampana,function(error,data){
			res.status(200).json(data);
		});
	});

	app.get("/vibox/bitacoraOperador",function(req,res){
		var operador = req.query.operador;
		var filtro = "WHERE 1=1 ";
		filtro += "AND usvi.user = '"+operador+"'";
		reportModel.getBitacoraOperador(filtro,function(error,data){
			res.status(200).json(data);
		})
	});

	app.post("/vibox/bitacoras",function(req,res){
		var filtro = "WHERE 1=1 ";
		var flag_period = true;
		if(typeof(req.body.date_begin) == "undefined" || req.body.date_begin == ""){
			flag_period = false;
			filtro += " ORDER BY bop_id desc";
			filtro += " LIMIT 100";
		}
		if(flag_period){
			var fecha_inicio = req.body.date_begin.split("/").reverse().join("-");
			var fecha_fin = req.body.date_end.split("/").reverse().join("-");
			if(req.body.cant_days > 0)
				filtro += " AND (date(bop_fecha_ingreso) >= '"+fecha_inicio+"' AND date(bop_fecha_ingreso) <= '"+fecha_fin+"' )";
			else
				filtro += " AND date(bop_fecha_ingreso) = '"+fecha_inicio+"'";
			filtro += " ORDER BY bop_id desc";
		}
		reportModel.getBitacoras(filtro,function(error,data){
			res.status(200).json(data);
		})
	});

	app.post("/vibox/editarBitacora",function(req,res){
		var sqlUpdate = "UPDATE hermes.bop_bitacora_operadora SET bop_observacion='"+req.body.bop_observacion+"', bop_estado="+req.body.bop_estado+" WHERE bop_id="+req.body.bop_id;
		console.log(sqlUpdate);
		reportModel.executeQuery(sqlUpdate,function(err,data){
			if(err){
				res.status(200).json({save:false,message:"Error a la tratar de editar bitacora."})
			}else{
				res.status(200).json({save:true,message:"Se guardo correctamente."})
			}
		})
	})

	app.post("/bitacora/guardar",function(req,res){
		console.log(req.body);
		var fecha_incidencia = req.body.bop_fecha_incidencia.split("/").reverse().join("-");
		var tiempo_incidencia = "";
		if(req.body.hasOwnProperty("cierre") && req.body.cierre != ""){
			tiempo_incidencia = req.body.cierre
		}else{
			tiempo_incidencia = req.body.bop_tiempo_incidencia;
		}
		var fecha_hora_incidencia = fecha_incidencia+" "+tiempo_incidencia;
		var insertar_bitacora = "INSERT INTO hermes.bop_bitacora_operadora(usu_id_operadora,bop_fecha_ingreso,bop_fecha_incidencia,bop_observacion";
		insertar_bitacora += ",usu_id_usuario_ingreso,inc_id,tgo_id,tgs_id,res_id,bop_estado,bop_media,bop_media_campana) ";
		insertar_bitacora += "VALUES ("+req.body.user_id+",now(),'"+fecha_hora_incidencia+"','"+req.body.bop_observacion+"',";
		insertar_bitacora += req.cookies.user_id+","+req.body.inc_id+","+req.body.tgo_id+","+req.body.tgs_id+","+req.body.res_id+",1";
		//res.status(200).json({save:false,message:"Error a la tratar de agregar bitacora."})
		var usuario_codigo = req.body.user;
		reportModel.getMediaAlguardar(usuario_codigo,function(errorMedia,dataMedia){
			console.log(insertar_bitacora);
			if(dataMedia.length > 0){
				var media = dataMedia[0].media;
				var media_campana = dataMedia[0].media_campana;
			}else{
				var media = 0;
				var media_campana = 0;
			}
			insertar_bitacora += ","+media;
			insertar_bitacora += ","+media_campana;
			insertar_bitacora += ")";
			reportModel.executeQuery(insertar_bitacora,function(error,data){
				if(error){
					res.status(200).json({save:false,message:"Error a la tratar de agregar bitacora."})
				}else{
					res.status(200).json({save:true,message:"Se guardo correctamente."})
				}
			});
		});
		/*repo.getnombreUser(req.body.id_usuario,function(errorV,dataOperador){
		});*/
	});

	/**OBTIENE LISTA DE INCIDENCIAS, GESTION , CANALES DE COMUNICACION**/
	app.get('/bitacora/getListas',function(req,res){
		reportModel.getListIncidencias(function(error,dataIncidencias){
			reportModel.getListGestion(function(error,dataGestion){
				reportModel.getListResoluciones(function(error,dataResolucion){
					reportModel.getListComunicacion(function(error,dataComunicacion){
					res.status(200).json({incidencias:dataIncidencias,gestiones:dataGestion,comunicaciones:dataComunicacion,resoluciones:dataResolucion});
					});
				});
			});
		});
	});

	app.get('/listar_agendamiento',function(req,res){
		console.log("LISTAR AGENDAMIENTO");
		var filtro_operador = '';
		if(Object.keys(req.cookies).length > 0 && req.cookies.hasOwnProperty("operadora") && req.cookies.operadora != "undefined" && parseInt(req.cookies.nivel) == 1){
			filtro_operador = " AND vicu_user_id="+req.cookies.user_id+" ";
		}
		reportModel.getAgendaOperador(filtro_operador,function(error,dataAgenda){
			var id_anis = helpers.extractAnis(dataAgenda);
			var filtro_agenda = "WHERE 1=1 ";
			filtro_agenda = " AND id_ani IN ("+id_anis.join()+")";
			if(Object.keys(req.cookies).length > 0 && req.cookies.hasOwnProperty("operadora") && req.cookies.operadora != "undefined" && parseInt(req.cookies.nivel) == 1){
				filtro_agenda += " AND operador='"+req.cookies.operadora+"' ";
			}
			reportVibox.getDataAgendaOperador(filtro_agenda,function(error_agenda,dataTotal){
				var agendas = helpers.ordenarAgendamiento(dataAgenda,dataTotal);
				res.status(200).json(agendas);
			});
		});
	});

	app.get('/listar_supervisores_activos',function(req,res){
		console.log('LISTA SUPERVISOR');
		reportModel.getListSupervisorActive(function(error,data){
			var supervisor=data;
			res.status(200).json(supervisor);
		});
	});

	app.post("/buscar_retro_calidad",function(req,res){
		console.log('DATOS GESTION SUPERVISOR');
		if(req.body.selectSupervisor != "" && req.body.date_begin != "" && req.body.date_end != ""){
			console.log(req.body);
			req.body.date_begin = req.body.date_begin.split("/").reverse().join("-");
			req.body.date_end = req.body.date_end.split("/").reverse().join("-");
			var filtro = "WHERE opno_fecha_evaluacion BETWEEN date('"+req.body.date_begin+"') AND date('"+req.body.date_end+"')";
			reportControlCalidad.getFechasEvaluacion(filtro, function(err_fecha, fechas){
				var filtro_critico = "WHERE reev_fecha_evaluacion BETWEEN '"+req.body.date_begin+"' AND '"+req.body.date_end+"' AND ticri_id_tipo_critico in (select ticri_id_tipo_critico from control_calidad.tipo_critico_supervisor) \
				GROUP BY reev_operador, reev_fecha_evaluacion";
				reportControlCalidad.getCriticidadesOperador(filtro_critico, function(err_cri, criticidades){
					var filtro_nota = "WHERE date(ev_fecha_creacion) BETWEEN '"+req.body.date_begin+"' AND '"+req.body.date_end+"' GROUP BY opno_operador, opno_fecha_evaluacion";
					reportControlCalidad.getNotaOperador(filtro_nota, function(err_prom, promedios){
						var filtro_supervisor="WHERE usup.us_sup_supervisor_id = "+req.body.selectSupervisor+" AND us.active='Y'";
						reportModel.getUsersBySupervisor(filtro_supervisor,function(err_ejec,ejecutivos){
							var filtro_bitacora = "WHERE DATE(bop_fecha_incidencia) BETWEEN '"+req.body.date_begin+"'\
							AND '"+req.body.date_end+"' AND inc_id IN (select inc_id from viboxpanel2.inc_incidencia_calidad)";
							reportVibox.getBitacorasUserDetail(filtro_bitacora,function(error_bit,bitacora){
								var datos = {};
								datos['fechas'] = fechas;
								datos['criticidades'] = criticidades;
								datos['promedios'] =promedios;
								datos['ejecutivos'] = ejecutivos;
								datos['bitacora'] = bitacora;
								var formatRetro = {};
								formatRetro['info'] = helpersCalidad.formatRetroalimentacion(datos);
								formatRetro['fechas'] = helpersCalidad.convertFechaRetro(datos['fechas']);
								res.status(200).json(formatRetro);
							});
						});
					});
				});
			});
		}
	});
	app.post("/vibox/getServiciosMonitor",function(req,res){
		var num = req.body.monitor;
		var filtroCliente = "";
		filtroCliente = "WHERE cli.id_cliente = "+req.body[num].id_cliente;
		filtroCliente +=" order by servicio";
		reportVibox.getServicios(filtroCliente,function(error,data){
			res.status(200).json(data);
		});
	});
}