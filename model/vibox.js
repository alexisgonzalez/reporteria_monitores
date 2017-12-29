var mysql = require('mysql');

var connection_settings = {host: '192.168.0.240',user: 'viboxuserweb',password: 'b5t1',database: 'viboxpanel'}; // PRODUCCION
var connection_settings_total = {host: '192.168.0.240',user: 'dbmanager',password: 'b4b2t1',database: 'viboxpanel'}; // PRODUCCION

//var connection_settings = {host: '200.111.174.150',port:3260,user: 'dbmanager',password: 'b4b2t1',database: 'viboxpanel'}; //DESARROLLO

var reportVibox = {};

reportVibox.getClientes = function (filtro,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "select id_cliente,cliente from campana_clientes "+filtro+" order by cliente asc";
		console.log(query);
		connection.query(query, function (error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportVibox.getServicios = function(id_cliente,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "select ser.*,cliente from campana_servicio ser\
						inner join campana_servicio_clientes sercli on ser.id_servicio = sercli.id_servicio\
						inner join campana_clientes cli on sercli.id_cliente = cli.id_cliente\
						"+id_cliente;
		console.log(query);
		connection.query(query,function ( error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportVibox.getCampanas = function(filtro,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "SELECT DISTINCT cam.id,cam.nombre FROM `campana`  cam\
							inner join viboxpanel2.med_media_diaria med on cam.id = med.id_campana "+filtro+" order by cam.id desc";
		//console.log(query);
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows)
			}
		});
	}
	connection.end();
}

reportVibox.getMedias = function (filtro,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		if(filtro != ""){
			var query = "select id_campana,\
								nombre_campana,\
								operador,\
								sup.usuario_codigo as supervisor,\
								fecha_llamado,\
								horas_llamado, \
								contactos,\
								segundos,\
								efectivos,\
								media,\
								cam.observacion,\
								contactos_directo\
						from viboxpanel2.med_media_diaria med\
							INNER JOIN viboxpanel.campana cam on med.id_campana = cam.id\
							inner join viboxpanel.usuarios us on med.operador = us.usuario_codigo\
							INNER JOIN viboxpanel.supervisor sup on us.id_supervisor = sup.id_supervisor\
							"+filtro+"order by operador,fecha_llamado";
			//console.log(query);
			connection.query(query,function(error,rows){
				if(error)
					throw error;
				else{
					callback(null,rows);
				}
			});
		}else{
			callback(null,[]);
		}
	}
	connection.end();
}

reportVibox.getMediasDomo = function (filtro,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		if(filtro != ""){
			var query = "select id_campana,\
								nombre_campana,\
								operador,\
								sup.usuario_codigo as supervisor,\
								DATE_FORMAT(fecha_llamado,'%Y-%m-%d') fecha_llamado,\
								horas_llamado, \
								contactos,\
								segundos,\
								efectivos,\
								media,\
								cam.observacion,\
								cli.cliente,\
								ser.servicio,\
								contactos_directo\
						from viboxpanel2.med_media_diaria med\
							INNER JOIN viboxpanel.campana cam on med.id_campana = cam.id and (cam.observacion  is null or cam.observacion <> 'Vicidial')\
							inner join viboxpanel.usuarios us on med.operador = us.usuario_codigo\
							INNER JOIN viboxpanel.supervisor sup on us.id_supervisor = sup.id_supervisor\
							INNER JOIN viboxpanel.campana_clientes cli on cam.id_cliente = cli.id_cliente\
							INNER JOIN viboxpanel.campana_servicio ser on cam.id_servicio = ser.id_servicio\
							"+filtro+" order by operador,fecha_llamado";
			//console.log(query);
			connection.query(query,function(error,rows){
				if(error)
					throw error;
				else{
					callback(null,rows);
				}
			});
		}else{
			callback(null,[]);
		}
	}
	connection.end();
}

reportVibox.getDatosDomo = function(filtro,callback){
		connection = mysql.createConnection(connection_settings);
		if(connection){
			if(filtro != ""){
				var query = "SELECT operador,estado,cliente,servicio,floor(avg(segundos_llamado))  segundos , count(estado) as cantidad \
								FROM `campana_bitacora` cam_bi\
								INNER JOIN viboxpanel.campana cam on cam_bi.id_campana = cam.id\
								INNER JOIN viboxpanel.campana_clientes cli on cam.id_cliente = cli.id_cliente\
								INNER JOIN viboxpanel.campana_servicio ser on cam.id_servicio = ser.id_servicio\
										"+filtro+"\
									group by \
										operador,estado,cliente,servicio\
									order by operador,estado ;";
				//console.log(query);
				connection.query(query,function(error,rows){
					if(error)
						throw error;
					else{
						callback(null,rows);
					}
				});
			}else{
				callback(null,[]);
			}
		}
		connection.end();
}

reportVibox.getHorariosIdealVibox = function(flag,filtro,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		if(flag){
			var query = "SELECT us.usuario_codigo,\
									DATE_FORMAT(opt_fec_fecha,'%Y-%m-%d') as opt_fec_fecha,\
									sum(opt_nro_segundos_ideales) as ideal_segundos,\
									SEC_TO_TIME(sum(opt_nro_segundos_ideales) ) as ideal \
						FROM viboxpanel2.`opt_operadoras_tiempos` opt\
													INNER JOIN viboxpanel.usuarios us on opt.opc_id_operadora = us.id_usuario\
						"+filtro+"\
						GROUP BY\
								us.usuario_codigo,\
						opt_fec_fecha\
						order by usuario_codigo,opt_fec_fecha,opt_nro_hora;";
		}else{
			var query = "SELECT us.usuario_codigo,\
									sum(opt_nro_segundos_ideales) as ideal_segundos,\
									SEC_TO_TIME(sum(opt_nro_segundos_ideales) ) as ideal \
						FROM viboxpanel2.`opt_operadoras_tiempos` opt\
													INNER JOIN viboxpanel.usuarios us on opt.opc_id_operadora = us.id_usuario\
						"+filtro+"\
						GROUP BY\
								us.usuario_codigo\
						order by usuario_codigo,opt_nro_hora;";
		}
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportVibox.getHorarioIdeal = function(filtro,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "SELECT DISTINCT\
						DATE_FORMAT(opt_fec_fecha, '%Y-%m-%d') AS opt_fec_fecha \
					FROM viboxpanel2.`opt_operadoras_tiempos` opt\
												INNER JOIN viboxpanel.usuarios us on opt.opc_id_operadora = us.id_usuario\
					"+filtro+"\
					GROUP BY\
							us.usuario_codigo,\
					opt_fec_fecha\
					order by opt_fec_fecha asc;"
		//console.log("Ideal Vibox");
		//console.log(query);
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportVibox.getHorariosRealVibox = function(filtro,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "select med.id_campana,med.operador,DATE_FORMAT(med.fecha_llamado,'%Y-%m-%d') as fecha, sum(segundos) as real_segundos,SEC_TO_TIME(sum(segundos)) as real_format from viboxpanel2.med_media_diaria med\
									inner join viboxpanel.campana cam on med.id_campana = cam.id and (cam.observacion  is null or cam.observacion <> 'Vicidial')\
					"+filtro+"\
					group by \
						med.id_campana,operador,fecha\
					order by operador,fecha";
		console.log("Real Vibox");
		console.log(query);
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}



reportVibox.getHorariosRealViboxDomo = function(filtro,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "select med.operador, sum(segundos) as real_segundos,SEC_TO_TIME(sum(segundos)) as real_format from viboxpanel2.med_media_diaria med\
									inner join viboxpanel.campana cam on med.id_campana = cam.id and (cam.observacion  is null or cam.observacion <> 'Vicidial')\
					"+filtro+"\
					group by \
						operador\
					order by operador";
		console.log("Real Vibox");
		console.log(query);
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportVibox.getUsersVibox = function (filtro,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "SELECT DISTINCT operador FROM viboxpanel2.`med_media_diaria` med\
											INNER JOIN viboxpanel.campana cam on med.id_campana = cam.id\
											INNER JOIN viboxpanel.usuarios us on med.operador = us.usuario_codigo\
						"+filtro+"\
						order by operador asc;";
		console.log("USUARIO VIBOX!");
		console.log(query);
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportVibox.getAudios = function(is_externo,filtro,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		enlace = (is_externo) ? "http://apps.firewalloptimiza.cl/vibox/monitor/":"http://192.168.0.220:80/vibox/monitor/";
		var query = "SELECT ca_ani.id_ani,DATE_FORMAT(ca_ani.fecha_llamado,'%Y-%m-%d') fecha_llamado,ca_ani.operador,ca_ani.nombre,ca_ani.rut_cliente,\
								ca_ani.ic_cliente,ca_ani.cu_cliente,ca_ani.estado,SEC_TO_TIME(ca_ani.segundos_llamado) as segundos,\
								cam.observacion,cam.observacion,concat('"+enlace+"',ca_ani.grabacion) as grabacion,ca_ani.id_cliente\
							FROM viboxpanel.campana_anis ca_ani\
							INNER JOIN viboxpanel.campana cam on ca_ani.id_campana = cam.id\
							"+filtro;
		console.log(query);
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportVibox.getAudiosHistorico = function(is_externo,filtro,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		enlace = (is_externo) ? "http://apps.firewalloptimiza.cl/vibox/monitor/":"http://192.168.0.220:80/vibox/monitor/";
		var query = "SELECT ca_ani.id_ani,DATE_FORMAT(ca_ani.fecha_llamado,'%Y-%m-%d') fecha_llamado,ca_ani.operador,ca_ani.nombre,ca_ani.rut_cliente,\
								ca_ani.ic_cliente,ca_ani.cu_cliente,ca_ani.estado,SEC_TO_TIME(ca_ani.segundos_llamado) as segundos,\
								cam.observacion,cam.observacion,concat('"+enlace+"',ca_ani.grabacion) as grabacion,ca_ani.id_cliente\
							FROM viboxpanel.campana_anis_historico ca_ani\
							INNER JOIN viboxpanel.campana cam on ca_ani.id_campana = cam.id\
							"+filtro;
		console.log(query);
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportVibox.getEstados = function(filtro,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "SELECT estado as es_codigo_estado,estado_glosa as es_descripcion\
							FROM viboxpanel.campana_estados ca_es\
							"+filtro;
		//console.log(query);
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportVibox.getUserActive = function(filtro, callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query ="SELECT usuario_codigo FROM `usuarios` where id_perfil = 0 and usuario_codigo not like 'SYSTEM' "+filtro
		//console.log(query);
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportVibox.getFechaContrato = function(filtro,callback){
 	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "SELECT us.usuario_codigo,DATE_FORMAT(op.opc_fec_contrato,'%Y-%m-%d') opc_fec_contrato,opc_des_rut FROM viboxpanel2.`opc_operadoras_complemento` op\
										INNER JOIN viboxpanel.usuarios us on op.opc_id_operadora = us.id_usuario\
 					"+filtro;
		//console.log(query);
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}


reportVibox.getEstadosContactados = function(filtro,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "select es.estado\
					from viboxpanel.esc_estados_contables esc\
					inner join viboxpanel.ste_status_estados ste \
							on esc.ste_id = ste.ste_id\
					inner JOIN viboxpanel.campana_estados es \
							on esc.idcampana_estados = es.idcampana_estados"+filtro;
		//console.log(query);
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportVibox.getBitacoraOperador = function(filtro,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "SELECT bop_id,DATE_FORMAT(bop_fecha_ingreso,'%Y-%m-%d %H:%i:%s') bop_fecha_ingreso,DATE_FORMAT(bop_fecha_incidencia,'%Y-%m-%d %H:%i:%s') bop_fecha_incidencia,bop_observacion,usu_nom_usuario,\
						inc.inc_nom_incidencia,tgo.tgo_descripcion_gestion,tgs.tgs_descripcion,coalesce(res.res_descripcion,'NO SELECCIONADO') res_descripcion\
					FROM viboxpanel2.`bop_bitacora_operadora` bit\
							INNER JOIN db_sioweb.usu_usuarios us on bit.usu_id_usuario_ingreso = us.usu_id_usuario\
							INNER JOIN viboxpanel2.inc_listado_incidencias inc on bit.inc_id = inc.inc_id_incidencia\
							LEFT JOIN viboxpanel2.tgo_tipo_gestion_operador tgo on bit.tgo_id =tgo.tgo_id\
							LEFT JOIN viboxpanel2.tgs_tipo_gestion_supervisor tgs on bit.tgs_id = tgs.tgs_id\
							LEFT JOIN viboxpanel2.res_resolucion_bitacora res on bit.res_id = res.res_id\
							INNER JOIN viboxpanel.usuarios usvi on bit.usu_id_operadora = usvi.id_usuario\
						"+filtro+"\
					ORDER BY bop_id desc;";
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportVibox.getBitacoras = function(filtro,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "SELECT bop_id,DATE_FORMAT(bop_fecha_ingreso,'%Y-%m-%d %H:%i:%s') bop_fecha_ingreso,DATE_FORMAT(bop_fecha_incidencia,'%Y-%m-%d %H:%i:%s') bop_fecha_incidencia,bop_observacion,usu_nom_usuario,\
						inc.inc_nom_incidencia,tgo.tgo_descripcion_gestion,tgs.tgs_descripcion,coalesce(res.res_descripcion,'NO SELECCIONADO') res_descripcion, usvi.usuario_codigo,bop_estado\
						FROM viboxpanel2.`bop_bitacora_operadora` bit\
							INNER JOIN db_sioweb.usu_usuarios us on bit.usu_id_usuario_ingreso = us.usu_id_usuario\
							INNER JOIN viboxpanel2.inc_listado_incidencias inc on bit.inc_id = inc.inc_id_incidencia\
							INNER JOIN viboxpanel2.tgo_tipo_gestion_operador tgo on bit.tgo_id =tgo.tgo_id\
							INNER JOIN viboxpanel2.tgs_tipo_gestion_supervisor tgs on bit.tgs_id = tgs.tgs_id\
							LEFT JOIN viboxpanel2.res_resolucion_bitacora res on bit.res_id = res.res_id\
							INNER JOIN viboxpanel.usuarios usvi on bit.usu_id_operadora = usvi.id_usuario\
						"+filtro;
		console.log(query);
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportVibox.getOperadorId = function(filtro,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "select id_usuario,email,telefono,extension,nombre as operador from viboxpanel.usuarios us "+filtro;
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else
				callback(null,rows);
		});
	}
	connection.end();
}

reportVibox.executeQuery = function(query,callback){
	connection = mysql.createConnection(connection_settings_total);
	if(connection){
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else
				callback(null,rows);
		});
	}
	connection.end();
}

reportVibox.getListIncidencias = function(callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "select inc_id_incidencia,inc_nom_incidencia from viboxpanel2.inc_listado_incidencias WHERE inc_estado = 1 order by inc_nom_incidencia asc";
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else
				callback(null,rows);
		});
	}
	connection.end();
}

reportVibox.getListGestion = function(callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "select tgs_id,tgs_descripcion from viboxpanel2.tgs_tipo_gestion_supervisor where tgs_estado=1 order by tgs_descripcion asc";
		connection.query(query,function(error,rows){
			if(error)
				callback(true,rows);
			else
				callback(false,rows);
		});
	}
	connection.end();
}

reportVibox.getListComunicacion = function(callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "select tgo_id,tgo_descripcion_gestion from viboxpanel2.tgo_tipo_gestion_operador";
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else
				callback(null,rows);
		});
	}
	connection.end();
}

reportVibox.getListResoluciones = function(callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "select * from viboxpanel2.res_resolucion_bitacora where res_estado = 1";
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else
				callback(null,rows);
		});
	}
	connection.end();
}

reportVibox.getBitacorasUser = function(filtro,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "select usuario_codigo,inc_id,tgo_id from viboxpanel2.bop_bitacora_operadora bop \
												INNER JOIN viboxpanel.usuarios us on bop.usu_id_operadora = us.id_usuario "+filtro+ "\
							group by usuario_codigo \
							order by bop_id DESC";
		console.log(query);
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else
				callback(null,rows);
		});
	}
	connection.end();	
}

reportVibox.getBitacorasUserDetail = function(filtro,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "select usuario_codigo,inc_id,tgo_id,DATE_FORMAT(date(bop_fecha_incidencia),	'%d/%m/%Y') AS fecha,bop_observacion,usu_nom_usuario,bop_media,bop_media_campana,DATE_FORMAT(bop_fecha_ingreso,'%d/%m/%Y %H:%i:%s') as fecha_ingreso from viboxpanel2.bop_bitacora_operadora bop \
												INNER JOIN viboxpanel.usuarios us on bop.usu_id_operadora = us.id_usuario \
												INNER JOIN db_sioweb.usu_usuarios us on bop.usu_id_usuario_ingreso = us.usu_id_usuario \
												 "+filtro+ "\
							order by usuario_codigo DESC";
		console.log(query);
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else
				callback(null,rows);
		});
	}
	connection.end();	
}

reportVibox.getDataAgendaOperador = function (filtro,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "SELECT operador, id_ani, ani, ani.nombre, ani.rut_cliente, ani.direccion, ani.comuna, ani.obs_general as observacion, fentrega, ani_nuevo FROM viboxpanel.campana_anis ani\
																	INNER JOIN viboxpanel.campana cam on ani.id_campana = cam.id\
																	\
						"+filtro;
		console.log(query);
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else
				callback(null,rows);
		});
	}
	connection.end();
}

reportVibox.getListaServicios = function (filtro,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "SELECT id_servicio, servicio, ind_vigencia FROM viboxpanel.campana_servicio "+filtro +" ORDER BY servicio";
		console.log(query);
		connection.query(query, function (error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportVibox.getExistClienteServicio = function(filtro, callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "SELECT idcampana_servicio_clientes, id_cliente, id_servicio, activo FROM viboxpanel.campana_servicio_clientes\
		" +filtro;
		console.log(query);
		connection.query(query, function (error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportVibox.getProduccionVibox = function (filtro,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		//TODO: inner join con campana and (observacion is null or observacion <> 'Vicidial')
		var query = "select operador,SUM(efectivos) efectivos,cam.id_cliente,ccli.cliente,cam.id_servicio,cser.servicio,date_format(fecha_llamado,'%d/%m/%Y') as fecha from viboxpanel2.med_media_diaria med \
							inner join viboxpanel.campana cam on cam.id = med.id_campana and (observacion is null or observacion <> 'Vicidial')\
							INNER JOIN viboxpanel.campana_clientes ccli ON cam.id_cliente=ccli.id_cliente\
							INNER JOIN viboxpanel.campana_servicio cser ON cam.id_servicio=cser.id_servicio\
					"+filtro;
		console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		});
	}
	connection.end();
}

reportVibox.getProduccionViboxDetail = function (filtro,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		//TODO: inner join con campana and (observacion is null or observacion <> 'Vicidial')
		var query = "select operador,sum(efectivos) as efectivos,cam.id_cliente,ccli.cliente,cam.id_servicio,cser.servicio,date_format(fecha_llamado,'%d/%m/%Y') as fecha from viboxpanel2.med_media_diaria med \
							inner join viboxpanel.campana cam on cam.id = med.id_campana and (observacion is null or observacion <> 'Vicidial')\
							INNER JOIN viboxpanel.campana_clientes ccli ON cam.id_cliente=ccli.id_cliente\
							INNER JOIN viboxpanel.campana_servicio cser ON cam.id_servicio=cser.id_servicio\
					"+filtro;
		console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		});
	}
	connection.end();
}

reportVibox.getBitacorasUserDetailHour = function(filtro,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "select usuario_codigo,inc_id,tgo_id, DATE_FORMAT(date(bop_fecha_incidencia),'%d/%m/%Y') as fecha,hour(bop_fecha_incidencia) as hora,bop_observacion,usu_nom_usuario,bop_media,bop_media_campana,DATE_FORMAT(bop_fecha_ingreso,'%d/%m/%Y %H:%i:%s') as fecha_ingreso from viboxpanel2.bop_bitacora_operadora bop \
												INNER JOIN viboxpanel.usuarios us on bop.usu_id_operadora = us.id_usuario \
												INNER JOIN db_sioweb.usu_usuarios us on bop.usu_id_usuario_ingreso = us.usu_id_usuario \
												 "+filtro+ "\
							order by usuario_codigo DESC";
		console.log(query);
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else
				callback(null,rows);
		});
	}
	connection.end();	
}

reportVibox.findAniRut = function(rut,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "SELECT id_ani from viboxpanel.campana_anis ani \
									INNER JOIN viboxpanel.campana cam on ani.id_campana = cam.id \
						WHERE rut_cliente = '"+rut+"' AND cam.id_cliente = 57 AND cam.id_servicio=31";
		console.log(query);
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else
				callback(null,rows);
		});
	}
	connection.end();	
}

reportVibox.getBitacoraIncidencias= function(filtro,limit, callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "SELECT usu_id_operadora,DATE_FORMAT(bop_fecha_ingreso,'%d/%m/%Y') as ingreso,bit.bop_id,if(usu_id_operadora<>0,usuario_codigo,'MASIVA') as usuario_codigo,inc_id,inc_nom_incidencia,bop_observacion\
		FROM viboxpanel2.bop_bitacora_operadora bit\
		LEFT JOIN viboxpanel.usuarios usvi ON bit.usu_id_operadora = usvi.id_usuario\
		INNER JOIN viboxpanel2.inc_listado_incidencias inc ON bit.inc_id = inc.inc_id_incidencia\
		"+filtro+"\
		ORDER BY bop_fecha_ingreso DESC\
		"+limit;
		console.log(query);
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else
				callback(null,rows);
		});
	}
	connection.end();
}

reportVibox.getEjecutivos = function(filtro, callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "SELECT id_usuario, usuario_codigo FROM viboxpanel.usuarios\
		"+filtro+"\
		ORDER BY usuario_codigo;";
		console.log(query);
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else
				callback(null,rows);
		});
	}
	connection.end();
}

reportVibox.getnombreUser = function(id_operadora,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "SELECT usuario_codigo from viboxpanel.usuarios where id_usuario = "+id_operadora+" LIMIT 1";
		console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows)
		});
	}
	connection.end();
}

reportVibox.getListRealVibox = function(filtro, callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "SELECT med.id_campana, med.operador, DATE_FORMAT( med.fecha_llamado, '%Y-%m-%d' ) AS fecha, sum(segundos) AS real_segundos, SEC_TO_TIME(sum(segundos)) AS real_format\
		FROM viboxpanel2.med_media_diaria med\
		INNER JOIN viboxpanel.campana cam ON med.id_campana = cam.id\
		AND (cam.observacion IS NULL OR cam.observacion <> 'Vicidial')\
		"+filtro+"\
		GROUP BY operador,fecha\
		ORDER BY operador, fecha;";
		console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows)
		});
	}
	connection.end();
}

reportVibox.getListaDatosPorIdAni = function(filtro, callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "SELECT id_ani, id_cliente, nombre, ani FROM viboxpanel.`campana_anis`\
		"+filtro;
		console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows)
		});
	}
	connection.end();
}
module.exports = reportVibox;
