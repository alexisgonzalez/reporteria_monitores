var mysql = require('mysql');
var conexion_vici = {
 	host: '190.196.18.131',
 	user: 'reportes',
 	password: 'reportes2904',
 	database: 'report_vicidial'
 }
/*
 var conexion_vici = {
 	host: '192.168.0.110',
 	user: 'reportes',
 	password: 'reportes2904',
 	database: 'report_vicidial'
 }
*/
/*
 var connection = mysql.createConnection({
	host: '192.168.1.194',
	user: 'root',
	password: '1234',
	database: 'report_vicidial'
});
*/




var reportModel = {}; 

reportModel.getMedias = function(filtros,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		if(filtros != ""){
			var active_event = "set global event_scheduler=on;";
			var query = "SELECT media_produccion.campaign_id,campaign_name, media_produccion.mpr_full_name, media_produccion.mpr_user,sup.usuario_codigo as supervisor, media_produccion.mpr_date,\
							media_produccion.mpr_hour,\
							media_produccion.mpr_call,\
							media_produccion.mpr_talk_sec,\
							media_produccion.mpr_wait_sec,\
							media_produccion.mpr_pause_sec,\
							media_produccion.mpr_status,\
							media_produccion.mpr_sub_status,\
							media_produccion.mpr_pause_bill_sec,\
							media_produccion.mpr_sale\
							FROM `media_produccion`\
								LEFT join hermes.usuario_supervisor usup on media_produccion.mpr_user = usup.us_sup_user\
								LEFT join hermes.supervisor sup on usup.us_sup_supervisor_id = sup.id_vici\
								LEFT join asterisk.vicidial_campaigns cam on  media_produccion.campaign_id= cam.campaign_id COLLATE utf8_unicode_ci\
						where mpr_user_group IN(select DISTINCT grupo_cliente from hermes.grupo_ejecutivo) "+filtros+" order by mpr_user,mpr_date asc";
			console.log("medias vicidial");
			console.log(query);
			connection.query(active_event,function(error,rows){});
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

reportModel.getMediasDomo = function(filtros,callback){
	var connection = mysql.createConnection(conexion_vici);
	if(connection){
		if(filtros != ""){
			var active_event = "set global event_scheduler=on;"
			var query = "SELECT media_produccion.campaign_id,cam.campaign_name, media_produccion.mpr_full_name, media_produccion.mpr_user,media_produccion.mpr_status, sup.usuario_codigo as supervisor, DATE_FORMAT(media_produccion.mpr_date,'%Y-%m-%d') mpr_date,\
							media_produccion.mpr_hour,\
							media_produccion.mpr_call,\
							media_produccion.mpr_talk_sec,\
							media_produccion.mpr_wait_sec,\
							media_produccion.mpr_pause_sec,\
							media_produccion.mpr_sale,\
							media_produccion.mpr_sub_status,\
							media_produccion.mpr_pause_bill_sec,\
							cli.cliente,\
							ser.servicio\
							FROM `media_produccion`\
								LEFT join hermes.usuario_supervisor usup on media_produccion.mpr_user = usup.us_sup_user\
								LEFT join hermes.supervisor sup on usup.us_sup_supervisor_id = sup.id_vici\
								INNER JOIN hermes.campana_clientes cli on (substr(campaign_id,1,2)*1) = cli.id_cliente\
								INNER JOIN hermes.campana_servicio ser on (substr(campaign_id,3,2)*1) = ser.id_servicio\
								LEFT join asterisk.vicidial_campaigns cam on  media_produccion.campaign_id= cam.campaign_id COLLATE utf8_unicode_ci\
						where mpr_user_group IN(select DISTINCT grupo_cliente from hermes.grupo_ejecutivo) AND mpr_user not like '%ntrenamiento%' AND list_id > 0 "+filtros+" order by mpr_user asc,mpr_status";
			console.log("medias vicidial");
			console.log(query);
			connection.query(active_event,function(error,rows){});
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

reportModel.getEstadosDomo = function (callback){
	var connection = mysql.createConnection(conexion_vici);
	if(connection){
		var active_event = "set global event_scheduler=on;"
		var query = "select es_id_estado,es_codigo_estado,es_descripcion from hermes.estado_domo;";
		connection.query(active_event,function(error,rows){});
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

reportModel.getCampanasLista = function (filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select campaign_id,list_name from asterisk.vicidial_lists list "+filtro;
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

reportModel.getCampanas = function(callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select campaign_id,campaign_name from asterisk.vicidial_campaigns order by campaign_id*1";
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		})
	}
}

reportModel.getCampanasVicidial = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select campaign_id,campaign_name from asterisk.vicidial_campaigns WHERE 1=1 "+filtro+" order by campaign_id*1";
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		})
	}
}

reportModel.getUsers = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT DISTINCT med.mpr_user as user FROM `media_produccion` med INNER JOIN asterisk.vicidial_users us on med.mpr_user = us.user "+filtro+" order by user";
		console.log("USERS");
		console.log(query);
		console.log("FIN USERS");
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		})
	}
}

reportModel.getUsersHorario = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select us.user from asterisk.vicidial_users us\
								inner join hermes.usuario_detalle usde on us.user_id = usde.user_id\
							where us.user_level = 1 and us.`user`not like 'entrenamiento%' and us.`user` not like '10%' \
						"+filtro;
		console.log("USUARIOS VICI");
		console.log(query);
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		})
	}
}

reportModel.getUsersClienteServicio = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select us.user,cli.cliente,ser.servicio,corto from asterisk.vicidial_users us\
								inner join hermes.usuario_detalle usde on us.user_id = usde.user_id\
								inner join hermes.campana_clientes cli on usde.id_cliente = cli.id_cliente\
								inner join hermes.campana_servicio ser on usde.id_servicio = ser.id_servicio\
							where us.user_level = 1 and us.`user`not like 'entrenamiento%' and us.`user` not like '10%' \
						"+filtro;
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		})
	}
}

reportModel.getHorario = function (filtroFecha,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		/*var query = "select date(mpr_date) mpr_date,mpr_user,SEC_TO_TIME(sum(mpr_talk_sec+mpr_wait_sec)) total_adhe,SEC_TO_TIME(sum(mpr_pause_sec)) total_pausa\n\
				from media_produccion\n\
					where mpr_user_group = 'ejecutivas'\
						and mpr_user <> 'daniela' "+filtroFecha+"\
					group by mpr_date,mpr_user\
					order by mpr_date,mpr_user asc ";*/
		var query ="SELECT  DATE_FORMAT(mpr_date,'%Y-%m-%d') mpr_date, mpr_user, user_id,sum(mpr_talk_sec + mpr_wait_sec +mpr_pause_bill_sec) as second_adhe,\
							SEC_TO_TIME(sum(mpr_pause_sec)) total_pausa, ( SELECT sum(hop_segundos) FROM hermes.horario_operadora hop WHERE hop.vicu_user_id = user_id AND hop.hop_fecha = mpr_date ) AS total_ideal \
		FROM media_produccion med INNER JOIN asterisk.vicidial_users us ON us.`user` = med.mpr_user WHERE mpr_user_group IN(select DISTINCT grupo_cliente from hermes.grupo_ejecutivo) AND mpr_user <> 'daniela' \
		AND mpr_user NOT LIKE '%entrenamiento%' "+filtroFecha+" GROUP BY mpr_date, user_id, mpr_user \
		ORDER BY user_id,mpr_date ASC;";
		console.log("REAL HORARIO");
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

reportModel.getHorarioExcepcion = function (filtroFecha,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query ="select DATE_FORMAT(hop_fecha,'%Y-%m-%d') hop_fecha,user,vicu_user_id,hop_inicio,hop_termino,exep.sup_usuario,tho_id,hop_segundos\
							from hermes.horario_operadora_excepciones exep\
								INNER JOIN asterisk.vicidial_users us on exep.vicu_user_id = us.user_id\
						where 1=1 AND hop_aprobado = 1 AND hop_estado = 1 "+filtroFecha+"\
					order by user,hop_fecha,hop_inicio ASC;";
		console.log("HORARIO EXCEPCION");
		console.log(query);
		console.log("FIN HORARIO EXCEPCION");
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

reportModel.getHorarioDomo = function (filtroFecha,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query ="SELECT  mpr_user,sum(mpr_talk_sec + mpr_wait_sec+mpr_pause_bill_sec) as second_adhe\
		FROM media_produccion med INNER JOIN asterisk.vicidial_users us ON us.`user` = med.mpr_user WHERE mpr_user_group IN(select DISTINCT grupo_cliente from hermes.grupo_ejecutivo) AND mpr_user <> 'daniela' \
		AND mpr_user NOT LIKE '%entrenamiento%' "+filtroFecha+" GROUP BY mpr_user;";
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

reportModel.getHorarioIdeal = function (filtroFecha,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT user_id,DATE_FORMAT(hop_fecha,'%Y-%m-%d') hop_fecha,us.`user`,SEC_TO_TIME(sum(hop_segundos)) as ideal,sum(hop_segundos) as total_ideal \
			FROM hermes.horario_operadora hop\
		INNER JOIN asterisk.vicidial_users us ON hop.vicu_user_id = user_id\
		WHERE 1=1 and hop.hop_estado = 1 "+filtroFecha+"\
		group by hop_fecha,us.`user`\
		order by us.`user`,hop_fecha asc";
		console.log("Ideal vicideal");
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

reportModel.getListaCampanas = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT DISTINCT CONVERT(list.list_id , CHAR(20)) list_id,list_name from asterisk.vicidial_lists list\
							INNER JOIN report_vicidial.media_produccion med on list.list_id= med.list_id "+filtro;
		console.log("CAMPAÑAS VICIDIAL");
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

reportModel.getAudios = function(isExterno,filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var location = "CASE SUBSTR(rec.location,1,18)\
							WHEN 'http://192.168.1.5' THEN\
								CONCAT('http://192.168.0.53',SUBSTR(rec.location,20))\
							WHEN 'http://192.168.0.5' THEN\
								CONCAT('http://192.168.0.53',SUBSTR(rec.location,20))\
							WHEN 'http://192.168.1.1' THEN\
								CONCAT('http://192.168.0.164',SUBSTR(rec.location,21))\
							WHEN 'http://192.168.0.1' THEN\
								CONCAT('http://192.168.0.164',SUBSTR(rec.location,21))\
							WHEN 'http://172.21.1.4/' THEN\
								CONCAT('http://190.196.18.131:8222',SUBSTR(rec.location,18))\
							ELSE CONCAT('http://190.196.18.131:8211',SUBSTR(rec.location,18))\
							END location \
						";
		console.log("isExterno",isExterno);
		if(isExterno){
			location = "CASE SUBSTR(rec.location,1,18)\
							WHEN 'http://192.168.1.5' THEN\
								CONCAT('http://200.111.174.147:8300',SUBSTR(rec.location,20))\
							WHEN 'http://192.168.0.5' THEN\
								CONCAT('http://200.111.174.147:8300',SUBSTR(rec.location,20))\
							WHEN 'http://192.168.1.1' THEN\
								CONCAT('http://200.111.174.147:8400',SUBSTR(rec.location,21))\
							WHEN 'http://192.168.0.1' THEN\
								CONCAT('http://200.111.174.147:8400',SUBSTR(rec.location,21))\
							WHEN 'http://172.21.1.4/' THEN\
								CONCAT('http://190.196.18.131:8222',SUBSTR(rec.location,18))\
							ELSE CONCAT('http://190.196.18.131:8211',SUBSTR(rec.location,18))\
							END location \
							";
		}
		var query = "select lead.`user`,lead.vendor_lead_code,lead.list_id,lead.status as estado, \
	DATE_FORMAT(rec.start_time,'%d-%m-%Y %H:%m:%s') fecha_llamado,sec_to_time(length_in_sec) as segundos,"+location+"\
						from asterisk.vicidial_list lead\
						INNER JOIN asterisk.recording_log rec on rec.lead_id = lead.lead_id\
						"+filtro+"\
						order by lead.vendor_lead_code*1 asc";
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

reportModel.getPuntajesNotas = function(callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT pu_puntaje,pu_nota FROM hermes.`puntaje_nota`";
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

reportModel.getUserLogin = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT user_level,user_id,full_name FROM asterisk.`vicidial_users` "+filtro;
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

reportModel.getUser = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT user_level,us.user_id,user,sup.supervisor FROM asterisk.`vicidial_users` us \
													INNER JOIN hermes.usuario_supervisor ussup on us.user_id = ussup.us_sup_user_id\
													INNER JOIN hermes.supervisor sup on ussup.us_sup_supervisor_id = sup.id_vici "+filtro;
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

reportModel.getListUser = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT us.user FROM asterisk.`vicidial_users` us \
													INNER JOIN hermes.usuario_supervisor ussup on us.user_id = ussup.us_sup_user_id\
													INNER JOIN hermes.supervisor sup on ussup.us_sup_supervisor_id = sup.id_vici "+filtro+" \
						order by us.user asc";
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

reportModel.getListaMantenedorOperador = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT ";
		query += 	"usde.usde_rut,us.user_id,user,us.full_name,sup.id_vici,sup.usuario_codigo,usde.usde_direccion,usde.usde_telefono,usde.usde_correo,usde.is_id_isapre,isi.is_nombre,usde.afp_id_afp,afp.afp_nombre,DATE_FORMAT(usde.usde_fec_ingreso,'%Y-%m-%d') ingreso,DATE_FORMAT(usde.usde_fec_ingreso,'%d/%m/%Y') usde_fec_ingreso,us.active,usde.con_id_contrato,con.contrato_nombre,DATE_FORMAT(usde.usde_fec_despido,'%d/%m/%Y') usde_fec_despido,DATE_FORMAT(usde.usde_fec_vencimiento,'%d/%m/%Y') usde_fec_vencimiento,";
		query += 	"usde_contrato_indef,usde.id_cliente,cliente,usde.id_servicio,servicio,per_id_perfil,pa.id_pais,pa.nombre_pais,";
		query += 	"DATE_FORMAT(usde.usde_fec_nacimiento,'%d/%m/%Y') usde_fec_nacimiento,usde_genero,usde_hijos,usde_camara_web,";
		query +=    "usde_velocidad,usde.com_id_comuna,com_nombre,usde.est_id_estado_civil,est_nombre,usde.niv_id_nivel_educacional,";
		query +=	"niv_nombre,ticon.tico_id_tipo_conexion,tico_descripcion_conexion,ticom.tico_id_tipo_computador,tico_descripcion_computador, hermes.sp_cantidad_hijos_operador(usde.user_id) AS cant_hijos from asterisk.vicidial_users us ";
		query +=	" LEFT JOIN hermes.usuario_detalle usde on us.user_id = usde.user_id";
		query +=	" LEFT JOIN hermes.usuario_supervisor ussup on us.user_id = ussup.us_sup_user_id";
		query +=	" LEFT JOIN hermes.supervisor sup on ussup.us_sup_supervisor_id = sup.id_vici";
		query +=	" LEFT JOIN hermes.afp  afp on usde.afp_id_afp = afp.afp_id_afp";
		query +=	" LEFT JOIN hermes.isapre isi on usde.is_id_isapre = isi.is_id_isapre";
		query +=	" LEFT JOIN hermes.contratos con on usde.con_id_contrato = con.id_contrato";
		query +=	" LEFT JOIN hermes.campana_clientes ccli ON usde.id_cliente=ccli.id_cliente";
  		query +=	" LEFT JOIN hermes.campana_servicio cser ON usde.id_servicio=cser.id_servicio";
  		query +=	" LEFT JOIN hermes.usuario_perfil perus ON us.user_id=perus.user_id";
  		query +=	" LEFT JOIN hermes.paises pa ON usde.id_pais = pa.id_pais";
  		query +=	" LEFT JOIN hermes.comuna com ON usde.com_id_comuna=com.com_id_comuna";
  		query +=	" LEFT JOIN hermes.estado_civil est ON usde.est_id_estado_civil=est.est_id_estado_civil";
		query +=	" LEFT JOIN hermes.nivel_educacional niv ON usde.niv_id_nivel_educacional=niv.niv_id_nivel_educacional";
		query +=	" LEFT JOIN hermes.tipo_computador ticom ON usde.tico_id_tipo_computador=ticom.tico_id_tipo_computador";
		query +=	" LEFT JOIN hermes.tipo_conexion ticon ON usde.tico_id_tipo_conexion= ticon.tico_id_tipo_conexion "+filtro+" order by user_id desc";
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


reportModel.getListSupervisor = function (callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select  * from hermes.supervisor\
						where id_vici is not null order by usuario_codigo";
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else
				callback(null,rows);
		});
	}
	connection.end();
}

reportModel.getListIsapres = function (callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select  * from hermes.isapre";
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else
				callback(null,rows);
		});
	}
	connection.end();
}

reportModel.getListAfps = function (callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select  * from hermes.afp";
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else
				callback(null,rows);
		});
	}
	connection.end();
}

reportModel.getListContrato = function (callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select  * from hermes.contratos";
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else
				callback(null,rows);
		});
	}
	connection.end();
}

reportModel.executeQuery = function(query,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		connection.query(query,function(error,rows){
			if(error)
				callback(true,rows);
			else
				callback(false,rows);
		});
	}
	connection.end();
}

reportModel.getListaMantenedorSupervisor = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select user_id,user,pass,full_name,vigente,active,correo,anexo,supervisor,usuario_codigo,pass from asterisk.vicidial_users us\
							INNER JOIN hermes.supervisor sup on us.user_id = sup.id_vici\
					"+filtro+"\
					order by sup.id_supervisor asc;";
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else
				callback(null,rows);
		});
	}
	connection.end();
}

reportModel.getHorarioSemanaOperador = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
	if (connection){
		var query = "select * from hermes.horario_operadora_semana "+filtro+"\
					ORDER BY ophs_usuario_codigo,ophs_dia_semana asc,ophs_hora_entrada asc";
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else
				callback(null,rows);
		});
	}
	connection.end();
}

reportModel.getOperadorContrato = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
	if (connection){
		var query = "select  us.full_name,con.contrato_nombre, con.contrato_horas from asterisk.vicidial_users us\
								INNER JOIN hermes.usuario_detalle usde on us.user_id = usde.user_id\
								INNER JOIN hermes.contratos con on usde.con_id_contrato = con.id_contrato\
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

reportModel.getSupervisorId = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query=" SELECT id_sioweb FROM hermes.supervisor sup\
									INNER JOIN asterisk.vicidial_users us on sup.id_vici = us.user_id\
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

reportModel.getHorarioEntrada = function(fecha_inicio,filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select DISTINCT `user`,(select ophs_hora_entrada from hermes.horario_operadora_semana\
								where ophs_usuario_codigo = `user` and ophs_dia_semana = WEEKDAY('"+fecha_inicio+"')+2 AND ophs_estado = 1 ORDER BY ophs_hora_entrada limit 1) as horario_entrada \
								,(select ophs_hora_fin from hermes.horario_operadora_semana\
								where ophs_usuario_codigo = `user` and ophs_dia_semana = WEEKDAY('"+fecha_inicio+"')+2 AND ophs_estado = 1  ORDER BY ophs_hora_fin DESC limit 1) as horario_salida\
						from asterisk.vicidial_users us "+filtro;
		//console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		});
	}
	connection.end();
}

reportModel.getHorarioSemana = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT * FROM hermes.horario_operadora_semana hos \
							"+filtro+"\
					order by ophs_usuario_codigo,ophs_hora_entrada asc";
		//console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		});
	}
	connection.end();
}

reportModel.getUsersHorarioMonitor = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select DISTINCT us.`user` from hermes.horario_operadora hop\
								INNER JOIN asterisk.vicidial_users us on hop.vicu_user_id = us.user_id\
					\
						"+filtro+"\
					order by us.`user`";
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

reportModel.getHorarioMonitor = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT DISTINCT us.`user`,DATE_FORMAT(hop_fecha,'%Y-%m-%d') hop_fecha,hop_inicio,hop_termino from hermes.horario_operadora hop\
									INNER JOIN asterisk.vicidial_users us on hop.vicu_user_id = us.user_id\
					"+filtro+"\
					ORDER BY `user`,hop_inicio";
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

reportModel.getUserIsSupervisor = function(user_id, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT * FROM hermes.`supervisor` where id_vici="+user_id;
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		});
	}
	connection.end();	
}

reportModel.getListCamposDomo = function(callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT * from hermes.campo_domo WHERE camdo_estado = 1";
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		})
	}
}

reportModel.getCamposDomoUser= function(user_id,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT * from hermes.user_campo_domo WHERE user_id = "+user_id;
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		})
	}
}

reportModel.getDetalleUsuario = function(usuario_codigo,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select usde_contrato_indef,DATE_FORMAT(usde_fec_ingreso,'%Y-%m-%d') usde_fec_ingreso,usde_fec_vencimiento,us.user from hermes.usuario_detalle usde\
							inner join asterisk.vicidial_users us on usde.user_id = us.user_id\
						where us.user = '"+usuario_codigo+"'";
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		})
	}	
}

reportModel.getDetalleUsuarios = function(usuarios,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select usde_contrato_indef,DATE_FORMAT(usde_fec_ingreso,'%Y-%m-%d') usde_fec_ingreso,usde_fec_vencimiento,us.user from hermes.usuario_detalle usde\
							inner join asterisk.vicidial_users us on usde.user_id = us.user_id\
						where us.user_id IN ("+usuarios+")";
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		})
	}	
}

reportModel.getClienteServicioUser = function(user_id,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT * from hermes.cliente_usuario WHERE user_id = "+user_id;
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

reportModel.getEstadosClienteServicio = function(campaign_id,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT DISTINCT mpr_status as status FROM report_vicidial.media_produccion\
						WHERE campaign_id='"+campaign_id+"' ORDER BY status;";
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

reportModel.getUsersBySupervisor = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select us_sup_user,us_sup_user_id from hermes.usuario_supervisor usup \
						INNER JOIN asterisk.vicidial_users us ON usup.us_sup_user_id=us.user_id\
						INNER JOIN hermes.usuario_detalle usde ON us.user_id=usde.user_id\
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

reportModel.getCampaingBySupervisor = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT DISTINCT campaign_id from report_vicidial.media_produccion\
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

reportModel.getTotalLlamadosCampaña = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select count(*) as numero_llamadas from asterisk.vicidial_log \
						where  1=1 "+filtro;
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

reportModel.getListaMantenedorMeta = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select met_id_meta,met_meta,met_mes,met_ano,met_periodo,cliente,servicio,cli.id_cliente,ser.id_servicio from hermes.meta\
							INNER JOIN hermes.campana_clientes cli on meta.id_cliente = cli.id_cliente\
							INNER JOIN hermes.campana_servicio ser on meta.id_servicio = ser.id_servicio\
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

reportModel.getUserConnect = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT DISTINCT user,campaign_id FROM asterisk.`vicidial_live_agents` "+filtro;

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

reportModel.getAgendaOperador = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT DISTINCT ag_agenda_id,DATE_FORMAT(ag_fecha_creacion, '%d/%m%/%Y') as fecha_creacion ,ag_fecha_agenda, DATE_FORMAT(ag_fecha_agenda, '%d/%m%/%Y') as fecha,\
		 DATE_FORMAT(ag_fecha_agenda, '%H:%i:%s') as hora,vicu_user_id,lead_id,id_ani,ag_estado,DATE_FORMAT(ag_llamado,'%d/%m/%Y %H:%i:%s') fecha_llamado from hermes.agendar_llamado\
					WHERE ag_activo=1 "+filtro+" ORDER BY ag_fecha_agenda";
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

reportModel.getFechaContrato = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = " select us.user,usde.usde_fec_ingreso,usde_rut from asterisk.vicidial_users us \
													INNER JOIN hermes.usuario_detalle usde on us.user_id = usde.user_id \
						";
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


reportModel.getCampanaHorasOperador = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT `user`,usde.id_cliente,usde.id_servicio,cliente,servicio,\
				SUM(hop.hop_segundos) segundos,\
				SEC_TO_TIME(SUM(hop.hop_segundos) ) format_segundos\
			FROM\
				asterisk.vicidial_users us\
							INNER JOIN hermes.usuario_detalle usde ON us.user_id = usde.user_id\
							INNER JOIN hermes.horario_operadora hop ON hop.vicu_user_id = us.user_id\
							INNER JOIN hermes.campana_clientes cli on usde.id_cliente = cli.id_cliente\
							INNER JOIN hermes.campana_servicio ser on usde.id_servicio = ser.id_servicio AND hop.hop_estado = 1\
			"+filtro+"\
			GROUP BY  `user`,usde.id_cliente,usde.id_servicio\
			ORDER BY cliente,servicio ASC";
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

reportModel.getCampanaClienteServicioMeta = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT DISTINCT cliente,servicio,usde.id_cliente,usde.id_servicio,\
					SUM(hop.hop_segundos) segundos,\
					SEC_TO_TIME(SUM(hop.hop_segundos) ) format_segundos\
			FROM\
				asterisk.vicidial_users us\
							INNER JOIN hermes.usuario_detalle usde ON us.user_id = usde.user_id\
							INNER JOIN hermes.horario_operadora hop ON hop.vicu_user_id = us.user_id\
							INNER JOIN hermes.campana_clientes cli on usde.id_cliente = cli.id_cliente\
							INNER JOIN hermes.campana_servicio ser on usde.id_servicio = ser.id_servicio AND hop.hop_estado = 1\
			"+filtro+"\
			GROUP BY  cliente,servicio,usde.id_cliente,usde.id_servicio\
			ORDER BY cliente,servicio ASC";
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


reportModel.getListSupervisorActive = function (callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select id_supervisor, supervisor, usuario_codigo, id_vici from hermes.supervisor\
		where id_vici is not null AND vigente=1;";
		connection.query(query,function(error,rows){
			if(error)
				throw error;
			else
				callback(null,rows);
		});
	}
	connection.end();
}

reportModel.getListaMetaDiarias = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select DATE_FORMAT(met_dia_fecha,'%d-%m-%Y') met_dia_fecha,met_dia_meta,met_dia_media from hermes.meta_diaria "+filtro+"\
					order by met_dia_fecha";
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

reportModel.getListaValorEfectivo = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT cvr_id_cliente_valor_registro, cvr_id_cliente, cvr_id_servicio, cvr_descripcion, cvr_velocidad,\
		cvr_valorRegistro, cvr_estado, DATE_FORMAT(cvr_fec_crea, '%d/%m/%Y') as cvr_fec_crea, DATE_FORMAT(cvr_fec_inicio, '%d/%m/%Y') as cvr_fec_inicio\
		,pa.id_pais,pa.nombre_pais,pa.simbolo_moneda FROM hermes.cvr_cliente_valor_registro cvr \
			INNER JOIN hermes.paises pa on cvr.cvr_id_pais = pa.id_pais \
		 "+filtro+ " ORDER BY cvr_fec_crea;";
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

reportModel.getvaloresProduccion = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select mpr_user,\
						substr(campaign_id,1,4) campana,\
						cvr.cvr_id_cliente,\
						cvr.cvr_id_servicio,\
						ifnull(cvr.cvr_valorRegistro,0) valor,\
						SUM(mpr_sale) efectivos,\
						SUM(mpr_sale)*ifnull(cvr.cvr_valorRegistro,0) produccion\
					from report_vicidial.media_produccion med\
							inner join hermes.grupo_ejecutivo grup on med.mpr_user_group = grupo_cliente\
							left join hermes.cvr_cliente_valor_registro cvr on cvr.cvr_id_cliente = SUBSTR(campaign_id,1,2)*1 AND \																																																																																				cvr_id_servicio=SUBSTR(campaign_id,3,2)*1\
					"+filtro+"\
							group by mpr_user,substr(campaign_id,1,4)\
					order by mpr_user asc";
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

reportModel.getValorEfectivos = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select cvr_id_cliente_valor_registro,cvr_id_cliente,cvr_id_servicio,cvr_valorRegistro from hermes.cvr_cliente_valor_registro cvr \
							INNER JOIN hermes.paises pa on cvr.cvr_id_pais = pa.id_pais \
					"+filtro;
		console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		})
	}
	connection.end();
}

reportModel.getSueldoMinimo = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT sum_sueldo, DATE_FORMAT(sum_fecha_creacion, '%d/%m/%Y') as sum_fecha_creacion, DATE_FORMAT(sum_fecha_inicio, '%d/%m/%Y') as sum_fecha_inicio, sum_estado, user_id,pa.id_pais,pa.nombre_pais,pa.simbolo_moneda \
					FROM hermes.sueldo_minimo su\
						INNER JOIN hermes.paises pa on su.id_pais = pa.id_pais \
		 "+filtro+"\
		ORDER BY sum_fecha_creacion;";
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
reportModel.getTramoCalidad = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT trc_id_tramo_calidad, trc_tramo, trc_bono, DATE_FORMAT(trc_fecha_creacion, '%d/%m/%Y') as trc_fecha_creacion, DATE_FORMAT(trc_fecha_inicio, '%d/%m/%Y') as trc_fecha_inicio, trc_estado,pa.id_pais,pa.nombre_pais,pa.simbolo_moneda FROM hermes.tramo_calidad trc \
						INNER JOIN hermes.paises pa on trc.id_pais = pa.id_pais \
			"+filtro+" \
			ORDER BY id_pais asc ,trc_tramo asc";
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

reportModel.getProduccionVicidial = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select mpr_user operador,\
						date_format(mpr_date,'%d/%m/%Y') as fecha,\
						cliente,\
						cvr.cvr_id_cliente,\
						servicio,\
						cvr.cvr_id_servicio,\
						ifnull(cvr.cvr_valorRegistro,0) valor,\
						SUM(mpr_sale) efectivos,\
						SUM(mpr_sale)*ifnull(cvr.cvr_valorRegistro,0) produccion\
					from report_vicidial.media_produccion med\
							inner join hermes.grupo_ejecutivo grup on med.mpr_user_group = grupo_cliente\
							left join hermes.cvr_cliente_valor_registro cvr on cvr.cvr_id_cliente = SUBSTR(campaign_id,1,2)*1 AND cvr_id_servicio=SUBSTR(campaign_id,3,2)*1\
							INNER JOIN hermes.campana_clientes ccli ON cvr.cvr_id_cliente=ccli.id_cliente\
							INNER JOIN hermes.campana_servicio cser ON cvr.cvr_id_servicio=cser.id_servicio\
					"+filtro+"\
					group by mpr_user,cvr.cvr_id_cliente,\
					cvr.cvr_id_servicio,mpr_date\
					order by mpr_date, cvr.cvr_id_cliente,  cvr.cvr_id_servicio";
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

reportModel.getFeriados = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT\
		hfe_id_horario_feriado,\
		DATE_FORMAT(hfe_fecha_feriado, '%d/%m/%Y') as hfe_fecha_feriado,\
		hfe_descripcion,\
		IF(hfe_irrenunciable=1,'SI','NO') AS hfe_irrenunciable,\
		hfe_estado,\
		hfe_fecha_creacion,\
		hfe_estado\
		FROM\
		hermes.horario_feriado\
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

reportModel.getTramosCalidad = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT trc_id_tramo_calidad,trc_tramo,trc_bono,trc_estado,user_id from hermes.tramo_calidad \
						"+filtro+"\
					ORDER BY trc_tramo DESC";
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		});
	}
	connection.end();
}

reportModel.getProduccionMediasDias = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select mpr_user,DATE_FORMAT(mpr_date,'%d/%m/%Y') mpr_date,sum(mpr_sale) efectivos,sum(mpr_talk_sec+mpr_wait_sec+mpr_pause_bill_sec) tiempos, convert(sum(mpr_sale)/(sum(mpr_talk_sec+mpr_wait_sec+mpr_pause_bill_sec) /3600),DECIMAL(5,2)) media from report_vicidial.media_produccion med\
						"+filtro+"\
						GROUP BY mpr_user,mpr_date,campaign_id\
					ORDER BY mpr_user ASC, mpr_date ASC";
		console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		})
	}
	connection.end();
}

reportModel.getMetaMonitorCampana = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		/*where
								md.met_dia_fecha >= '2017/04/01' and md.met_dia_fecha <= '2017/04/24' */
		var query = "select COALESCE( concat(lpad(id_cliente,2,'0'),lpad(id_servicio,2,'0')),'S/C') campana,sum(met_dia_meta) met_dia_meta  FROM hermes.`meta_diaria`md  \
											INNER JOIN hermes.meta m on md.met_id = m.met_id_meta \
						"+filtro+" \
						group by COALESCE( concat(lpad(id_cliente,2,'0'),lpad(id_servicio,2,'0')),'S/C') \
						order by met_dia_fecha asc;";
		console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		})
	}
	connection.end();
}

reportModel.getEfectivosMonitorCampana = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		/*where mpr_date >= '2017/04/01' and mpr_date <= '2017/04/25' */
		var query = "select SUBSTR(campaign_id,1,4) campaign_id,sum(mpr_sale) efectivos from report_vicidial.media_produccion med\
						"+filtro+" \
						GROUP BY SUBSTR(campaign_id,1,4)";
		console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		})
	}
	connection.end();
}

reportModel.getProduccionMediasDiasMeta = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select SUBSTR(campaign_id,1,4) campaign_id,DATE_FORMAT(mpr_date,'%d/%m/%Y') mpr_date,sum(mpr_sale) efectivos,sum(mpr_talk_sec+mpr_wait_sec+mpr_pause_bill_sec) tiempos, convert(sum(mpr_sale)/(sum(mpr_talk_sec+mpr_wait_sec+mpr_pause_bill_sec) /3600),DECIMAL(5,2)) media from report_vicidial.media_produccion med\
						"+filtro+"\
						GROUP BY SUBSTR(campaign_id,1,4),mpr_date\
					ORDER BY mpr_date ASC";
		console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		})
	}
	connection.end();
}

reportModel.getIncidencias = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT\
		inc_id_incidencia,\
		inc_nom_incidencia,\
		inc_cod_incidencia,\
		inc_descripcion,\
		inc.tin_id_tipo_incidencia,\
		tin_nombre,\
		inc_icono,\
		inc_estado\
		FROM\
		hermes.incidencia inc\
		LEFT JOIN hermes.tipo_incidencia tin ON inc.tin_id_tipo_incidencia = tin.tin_id_tipo_incidencia\
						"+filtro+"\
		ORDER BY inc_nom_incidencia";
		console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		})
	}
	connection.end();
}

reportModel.getProduccionMediasHoras = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select mpr_user,mpr_hour,sum(mpr_sale) efectivos,sum(mpr_talk_sec+mpr_wait_sec+mpr_pause_bill_sec) tiempos, convert(sum(mpr_sale)/(sum(mpr_talk_sec+mpr_wait_sec+mpr_pause_bill_sec) /3600),DECIMAL(5,2)) media from report_vicidial.media_produccion med\
						"+filtro+"\
						group by mpr_user,mpr_hour\
					ORDER BY mpr_user ASC, mpr_hour ASC";
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

reportModel.getTipoPermiso = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT tip_id_tipo_permiso, tip_descripcion FROM hermes.tipo_permiso \
						"+filtro+"\
					ORDER BY tip_descripcion";
		console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		})
	}
	connection.end();
}

reportModel.getProduccionCabezeras = function(campo,filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		if(campo == "mpr_date"){

			var query = "select DATE_FORMAT("+campo+",'%d/%m/%Y') mpr_date from report_vicidial.media_produccion med\
							"+filtro+"\
							group by "+campo+"\
						ORDER BY "+campo+" ASC";
		}else{
			var query = "select "+campo+" from report_vicidial.media_produccion med\
							"+filtro+"\
							group by "+campo+"\
						ORDER BY "+campo+" ASC";
		}
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		});
	}
	connection.end();
}

reportModel.getlistTipoIncidencia = function(callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT tin_id_tipo_incidencia, tin_nombre, tin_descripcion FROM hermes.tipo_incidencia;";
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

reportModel.getSupOperador = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT\
		us_sup_user,\
		us_sup_user_id,\
		sup.usuario_codigo\
		FROM\
		hermes.usuario_supervisor usup\
		INNER JOIN asterisk.vicidial_users us ON usup.us_sup_user_id = us.user_id\
		INNER JOIN hermes.supervisor sup ON usup.us_sup_supervisor_id = sup.id_vici\
		"+filtro;
		console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		})
	}
	connection.end();
}

reportModel.getListClienteServicios = function(callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT idcampana_servicio_clientes,concat(cli.cliente,' / ',ser.corto) glosa FROM hermes.campana_servicio_clientes sercli \
																			INNER JOIN hermes.campana_servicio ser on sercli.id_servicio = ser.id_servicio\
																			INNER JOIN hermes.campana_clientes cli on sercli.id_cliente = cli.id_cliente\
					order by glosa ASC";
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

reportModel.getBrechasProduccion = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT id_bre_brecha,bre_brecha,bre_color,concat(cli.cliente,' / ',ser.corto) cliente from hermes.bre_brecha bre \
																			INNER JOIN hermes.campana_servicio_clientes sercli on sercli.idcampana_servicio_clientes = cliente_servicio \
																			INNER JOIN hermes.campana_servicio ser on sercli.id_servicio = ser.id_servicio\
																			INNER JOIN hermes.campana_clientes cli on sercli.id_cliente = cli.id_cliente\
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

reportModel.getBrechasProduccionGestiones = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT id_bre_brecha,bre_brecha,bre_color from hermes.bre_brecha bre \
																			INNER JOIN hermes.campana_servicio_clientes sercli on sercli.idcampana_servicio_clientes = cliente_servicio \
																			INNER JOIN hermes.campana_servicio ser on sercli.id_servicio = ser.id_servicio\
																			INNER JOIN hermes.campana_clientes cli on sercli.id_cliente = cli.id_cliente\
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

reportModel.getTipoHorarioUser = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select con.contrato_horas,us.user,con.contrato_semana_corrida from hermes.usuario_detalle usde \
											INNER JOIN hermes.contratos con on usde.con_id_contrato = con.id_contrato\
											INNER JOIN asterisk.vicidial_users us on us.user_id = usde.user_id\
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

reportModel.findLeadByAni = function(id_ani,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT lead_id from asterisk.vicidial_list \
						WHERE vendor_lead_code = "+id_ani;

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

reportModel.getUserId = function(operador,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT user_id from asterisk.vicidial_users \
						WHERE user = '"+operador+"'";

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

reportModel.getSemanaCorrida = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT user,sum(valor) valor FROM hermes.semana_corrida\
						"+filtro+"\
					GROUP BY user;";
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


reportModel.getHorarioOperadorValidado = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT bop_id_bitacora_operadora,hov.user_id,hov_fecha,hov_inicio,hov_fin as hov_termino,hov_aprobado,tho_id,hov_segundos,DATE_FORMAT(hov_fecha_apro, '%d/%m/%Y') as fecha,\
		sup.full_name as supervisor\
		FROM hermes.horario_operador_validado hov\
		LEFT JOIN asterisk.vicidial_users sup ON hov.hov_us_apro=sup.user_id\
						"+filtro+"\
					GROUP BY bop_id_bitacora_operadora;";

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

reportModel.getHistorialCarteraEjecutivo = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT CONCAT(cliente,' / ',servicio) cartera,DATE_FORMAT(fecha_asignacion,'%d/%m/%Y %H:%i:%s') fecha_asignacion FROM hermes.historial_ejecutivo_cliente_servicio his \
																	INNER JOIN hermes.campana_clientes cli on his.cliente_id = cli.id_cliente \
																	INNER JOIN hermes.campana_servicio ser on his.servicio_id = ser.id_servicio \
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

reportModel.getHorarioOperadorExcepcion = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT bop_id_bitacora_operadora,hop_fecha,hop_inicio,hop_termino,hop_aprobado,tho_id,hop_segundos,DATE_FORMAT(hop_fecha_apro, '%d/%m/%Y') as fecha,\
		sup.full_name as supervisor\
		FROM hermes.horario_operadora_excepciones hex\
		LEFT JOIN asterisk.vicidial_users sup ON hex.hop_us_apro=sup.user_id\
						"+filtro+"\
					GROUP BY bop_id_bitacora_operadora, tho_id;";
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

reportModel.getUsuarioSioWeb = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT id_sioweb, id_vici, usuario_codigo FROM hermes.supervisor\
		"+filtro+"\
		ORDER BY usuario_codigo;";
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

reportModel.getUsuariosConectados = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT DISTINCT al.user FROM asterisk.vicidial_agent_log al\
		INNER JOIN asterisk.vicidial_users vu ON al.user = vu.user\
		"+filtro+"\
		ORDER BY al.user;";
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


reportModel.getSueldoMinimoCosto = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT * FROM hermes.`sueldo_minimo` "+filtro+" order by sum_fecha_inicio desc limit 1;"
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

reportModel.getListadoContratos = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT ";
		query += "COUNT(viu.user_id) ejecutivos,id_contrato,contrato_nombre,contrato_base,contrato_horas,contrato_semana_corrida,ind_vigente FROM hermes.contratos co ";
		query += "LEFT JOIN hermes.usuario_detalle det ";
		query+= "ON co.id_contrato=det.con_id_contrato ";
		query += "LEFT JOIN vicidial.vicidial_users viu ";
		query += "ON det.user_id=viu.user_id AND viu.active='Y'\
		"+filtro+"\
		GROUP BY co.id_contrato;";
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

reportModel.getPromedioEsperaCampana = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select campaign_id,avg(wait_sec) segundos,SEC_TO_TIME(avg(wait_sec)) format_segundos from asterisk.vicidial_agent_log val \
						"+filtro+" \
						GROUP BY campaign_id";
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

reportModel.getPorcentajeDropCampana = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT campaign_id,sum(cantidad) cantidad, \
				(select sum(cantidad) FROM report_vicidial.resumen_drop where fecha = rd.fecha and campaign_id = rd.campaign_id) as llamados \
 					FROM report_vicidial.`resumen_drop` rd \
				"+filtro+" \
					GROUP BY campaign_id";
		console.log(query);
		connection.query(query,function(err,data){
			if(err)
				throw err;
			else
				callback(null,data);
		});
	}
	connection.end();
}

reportModel.getMetasDia = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select date_format(met_dia_fecha,'%d/%m/%Y') met_dia_fecha,met_dia_fecha as fecha_meta,met_dia_meta,met_dia_media FROM hermes.`meta_diaria`md \
											INNER JOIN hermes.meta m on md.met_id = m.met_id_meta \
						"+filtro+" \
						order by met_dia_fecha asc";
		console.log(query);
		connection.query(query,function(err,data){
			if(err)
				throw err;
			else
				callback(null,data);
		})
	}
	connection.end();
}
reportModel.getListaBrechaCosto = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select brecha_costo_id,brecha_costo_numero,brecha_costo_estado,bre.id_cliente,bre.id_servicio,concat(cli.cliente,' ',ser.servicio) cliente from hermes.brecha_costo bre \
												INNER JOIN hermes.campana_clientes cli on bre.id_cliente = cli.id_cliente\
												INNER JOIN hermes.campana_servicio ser on bre.id_servicio = ser.id_servicio\
						WHERE 1=1 AND brecha_costo_estado = 1 "+filtro;
		console.log(query);
		connection.query(query,function(err,data){
			if(err)
				throw err;
			else
				callback(null,data);
		})
	}
	connection.end();
}

reportModel.getMonitorMediaCampana = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select user,extension,cam.campaign_id,cam.campaign_name,\
											(select convert(sum(mpr_sale)/(sum(mpr_talk_sec+mpr_wait_sec+mpr_pause_bill_sec) /3600),DECIMAL(5,2)) media \
																							from report_vicidial.media_produccion med\
													where med.mpr_user = liv.user and mpr_date = DATE(now()) AND med.campaign_id = liv.campaign_id collate utf8_unicode_ci) media,\
							CASE liv.`status`\
								WHEN 'READY' then 'ESPERANDO LLAMADO'\
								WHEN 'INCALL' then 'EN LLAMADO'\
								WHEN 'QUEUE' then 'EN LLAMADO'\
								WHEN 'PAUSED' then 'PAUSA'\
								WHEN 'DISPO' then 'ESPERA DE TIPIFICACION'\
								WHEN 'DEAD' then 'TIEMPO MUERTO'\
							END  estado,\
							liv.pause_code,\
							SEC_TO_TIME(TIME_TO_SEC(TIMEDIFF(now(),liv.last_state_change)) ) tiempo_estado,\
							(select sum(mpr_sale) from report_vicidial.media_produccion med where med.mpr_user = liv.user and mpr_date = DATE(now()) AND med.campaign_id = liv.campaign_id collate utf8_unicode_ci) efectivos,\
							(select sec_to_time(sum(mpr_talk_sec+mpr_wait_sec+mpr_pause_bill_sec))  from report_vicidial.media_produccion med where med.mpr_user = liv.user and mpr_date = DATE(now()) AND med.campaign_id = liv.campaign_id collate utf8_unicode_ci) tiempo,\
							liv.calls_today,\
							TIME_TO_SEC(TIMEDIFF(now(),liv.last_state_change))  tiempo_estado_seg,\
							(select sum(mpr_talk_sec+mpr_wait_sec+mpr_pause_bill_sec)  from report_vicidial.media_produccion med where med.mpr_user = liv.user and mpr_date = DATE(now()) AND med.campaign_id = liv.campaign_id collate utf8_unicode_ci) tiempo_seg\
				from asterisk.vicidial_live_agents liv\
				INNER JOIN asterisk.vicidial_campaigns cam on liv.campaign_id = cam.campaign_id\
				WHERE user not like '1%' \
				"+filtro+" \
				ORDER BY liv.campaign_id,user asc,`status`";
		console.log(query);
		connection.query(query,function(err,data){
			if(err)
				throw err;
			else
				callback(null,data);
		})
	}
	connection.end();
}

reportModel.getMonitorCampana = function(callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select DISTINCT cam.campaign_id,cam.campaign_name  \
				from asterisk.vicidial_live_agents liv\
				INNER JOIN asterisk.vicidial_campaigns cam on liv.campaign_id = cam.campaign_id\
				ORDER BY cam.campaign_name";
		connection.query(query,function(err,data){
			if(err)
				throw err;
			else
				callback(null,data);
		});
	}
	connection.end();
}
reportModel.getLogin = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT vu.user_id,up.per_id_perfil,user,full_name,id_pais FROM asterisk.vicidial_users vu INNER JOIN hermes.usuario_perfil up ON vu.user_id=up.user_id\
			left JOIN hermes.usuario_detalle usde ON vu.user_id=usde.user_id\
						"+filtro;
		console.log(query);
		connection.query(query,function(err,data){
			if(err)
				throw err;
			else
				callback(null,data);
		});
	}
	connection.end();
}

reportModel.getTurno = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT vicu_user_id,DATE_FORMAT(hop_fecha,'%Y-%m-%d') hop_fecha,SEC_TO_TIME(sum(hop_segundos)) as ideal,sum(hop_segundos) as total_ideal,\
		TIME(hop_inicio) hop_inicio, TIME(hop_termino) hop_termino\
		FROM hermes.horario_operadora\
						"+filtro+"\
		group by hop_fecha,vicu_user_id, hop_inicio, hop_termino\
		order by vicu_user_id,hop_fecha asc;";
		console.log(query);
		connection.query(query,function(err,data){
			if(err)
				throw err;
			else
				callback(null,data);
		})
	}
	connection.end();
}

reportModel.getEstadoEnvioICS = function(callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT flag_envio_ics as estado from hermes.estado_envio_ics limit 1";
		console.log(query);
		connection.query(query,function(err,data){
			if(err)
				throw err;
			else
				callback(null,data);
		})	
	}
	connection.end();
}

reportModel.getMenuUsuario = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT mos_url,mos_titulo, mos_icon,ms.mop_id_modulo_padre,mop_nombre,mop_icon,ms.mos_id_modulo_sio_calling FROM hermes.modulo_sio_calling ms\
		INNER JOIN hermes.modulo_padre_sio_calling mp \
		ON ms.mop_id_modulo_padre=mp.mop_id_modulo_padre_sio_calling\
		INNER JOIN hermes.perfil_modulo pm\
		ON ms.mos_id_modulo_sio_calling=pm.mos_id_modulo_sio_calling\
		"+filtro+" ORDER BY mop_id_modulo_padre";
		console.log(query);
		connection.query(query,function(err,data){
			if(err)
				throw err;
			else
				callback(null,data);
		})	
	}
	connection.end();
}

reportModel.getListaMenuPadre = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT DISTINCT mop_id_modulo_padre_sio_calling as mop_id_modulo_padre,mop_nombre,mop_icon  FROM hermes.modulo_padre_sio_calling\
		"+filtro+" ORDER BY mop_id_modulo_padre_sio_calling";
		console.log(query);
		connection.query(query,function(err,data){
			if(err)
				throw err;
			else
				callback(null,data);
		})
	}
	connection.end();
}

reportModel.getListaModulosMenu = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT mos_url, mos_titulo, mos_titulo_pagina, mos_descripcion, mos_icon, mop_id_modulo_padre, mos_id_modulo_sio_calling, mos_location_path, mos_estado FROM hermes.modulo_sio_calling ms\
		"+filtro+" ORDER BY mop_id_modulo_padre";
		console.log(query);
		connection.query(query,function(err,data){
			if(err)
				throw err;
			else
				callback(null,data);
		})
	}
	connection.end();
}
reportModel.getMenuPadreUsuario = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT DISTINCT ms.mop_id_modulo_padre,mop_nombre,mop_icon FROM hermes.modulo_sio_calling ms\
		INNER JOIN hermes.modulo_padre_sio_calling mp \
		ON ms.mop_id_modulo_padre=mp.mop_id_modulo_padre_sio_calling\
		INNER JOIN hermes.perfil_modulo pm\
		ON ms.mos_id_modulo_sio_calling=pm.mos_id_modulo_sio_calling\
		"+filtro+" ORDER BY mop_id_modulo_padre";
		console.log(query);
		connection.query(query,function(err,data){
			if(err)
				throw err;
			else
				callback(null,data);
		})
	}
	connection.end();
}

reportModel.getListaPerfiles = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT p.per_id_perfil,per_nombre,per_descripcion,COUNT(up.user_id) as asignado,per_estado FROM hermes.perfil p\
		LEFT JOIN hermes.usuario_perfil up ON p.per_id_perfil=up.per_id_perfil\
		LEFT JOIN vicidial.vicidial_users vu ON up.user_id=vu.user_id AND  vu.active='Y'\
		"+filtro+"\
		GROUP BY per_id_perfil\
		ORDER BY per_id_perfil;";
		console.log(query);
		connection.query(query,function(err,data){
			if(err)
				throw err;
			else
				callback(null,data);
		})
	}
	connection.end();
}

reportModel.getListaUsuarios = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT vu.user_id,user,pass,full_name,active,per_nombre,if(p.per_id_perfil!=null,p.per_id_perfil,'') as per_id_perfil,vu.user_level FROM asterisk.vicidial_users vu\
		LEFT JOIN hermes.usuario_perfil up ON vu.user_id = up.user_id\
		LEFT JOIN hermes.perfil p ON up.per_id_perfil = p.per_id_perfil\
		"+filtro+"\
		ORDER BY user;";
		console.log(query);
		connection.query(query,function(err,data){
			if(err)
				throw err;
			else
				callback(null,data);
		})
	}
	connection.end();
}

reportModel.getListaEncuestas = function(callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		//TRAER INFORMACION LISTA ENCUESTA
		var query="SELECT id_lista_encuesta,id_list,zona_id,limite from hermes.lista_encuesta where id_estado = 1";
		console.log(query);
		connection.query(query,function(err,data){
			if(err)
				throw err;
			else
				callback(null,data);
		});
	}
	connection.end();
}

reportModel.getListas = function(callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		//TRAER INFORMACION LISTA ENCUESTA
		var query="SELECT list_id from asterisk.vicidial_lists list \
									inner join asterisk.vicidial_campaigns cam on list.campaign_id = cam.campaign_id \
		 			where cam.campaign_id like '%03' or cam.campaign_id = 101 and cam.active = 'Y'";
		console.log(query);
		connection.query(query,function(err,data){
			if(err)
				throw err;
			else
				callback(null,data);
		});
	}
	connection.end();
}

reportModel.getZonasPorLista = function(list_id,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		//TRAER INFORMACION LISTA ENCUESTA
		var query="SELECT distinct country_code from asterisk.vicidial_list lead \
									inner join asterisk.vicidial_lists list on lead.list_id = list.list_id \
		 			where lead.list_id = "+list_id+" order by country_code";
		console.log(query);
		connection.query(query,function(err,data){
			if(err)
				throw err;
			else
				callback(null,data);
		});
	}
	connection.end();
}

reportModel.getMediaAlguardar = function(usuario,callback){
	///devolver media operador y campana al momento
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select mpr_user,med.campaign_id,\
					convert(sum(mpr_sale)/(sum(mpr_talk_sec+mpr_wait_sec+mpr_pause_bill_sec) /3600),DECIMAL(5,2)) media,\
					(select convert(sum(mpr_sale)/(sum(mpr_talk_sec+mpr_wait_sec+mpr_pause_bill_sec) /3600),DECIMAL(5,2)) media from report_vicidial.media_produccion med2 \
															where med2.campaign_id = med.campaign_id and mpr_date = date(now())) media_campana \
									from report_vicidial.media_produccion med\
													inner join asterisk.vicidial_live_agents liv on med.mpr_user = liv.user and med.campaign_id = liv.campaign_id collate utf8_unicode_ci \
					where med.mpr_date = DATE(now()) and mpr_user = '"+usuario+"' \
					GROUP BY mpr_user,med.campaign_id;"
		console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		})
	}
	connection.end();
}

reportModel.getCampanasDelDia = function(fecha,callback){
	///devolver media operador y campana al momento
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select med.campaign_id,cam.campaign_name from report_vicidial.media_produccion med \
										INNER JOIN asterisk.vicidial_campaigns cam on med.campaign_id = cam.campaign_id collate utf8_unicode_ci \
		where mpr_date = '"+fecha+"' group by campaign_id order by campaign_id"
		console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		})
	}
	connection.end();
}

reportModel.getPosicionCampana = function(callback){
	///devolver media operador y campana al momento
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select posicion from hermes.posicion_campana limit 1"
		console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		})
	}
	connection.end();
}

reportModel.getListEstadoEvioICS = function(callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT envio ,count(id_envio_ics) as cantidad FROM hermes.envio_ics  GROUP BY envio;"
		console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		})
	}
	connection.end();
}

reportModel.getCantidadUsuarioCampana = function(callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select COALESCE( concat(lpad(id_cliente,2,'0'),lpad(id_servicio,2,'0')),'S/C') campana, count(*) cantidad \
								from hermes.usuario_detalle usde \
									inner join asterisk.vicidial_users us on usde.user_id = us.user_id\
					where us.active = 'Y' \
					group by concat(lpad(id_cliente,2,'0'),lpad(id_servicio,2,'0'));";
					console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		})
	}
	connection.end();
}

reportModel.getCampanasMonitor = function(callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select campaign_id,campaign_name from asterisk.vicidial_campaigns cam where cam.active = 'Y'\
order by campaign_id";
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

reportModel.getListaMetas = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT date_format(met_dia_fecha, '%d/%m/%Y') met_dia_fecha,met_dia_meta,met_dia_media,id_servicio,id_cliente\
		FROM hermes.`meta_diaria` md INNER JOIN hermes.meta m ON md.met_id = m.met_id_meta\
		"+filtro+"\
		ORDER BY id_cliente, id_servicio, met_dia_fecha ASC;"
		console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		})
	}
	connection.end();
}

reportModel.getListaPreferenciaMetas = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT monitor, pre.id_cliente, cliente, servicio, ser.id_servicio FROM hermes.prueba_prefrencias_metas pre\
		LEFT JOIN hermes.campana_clientes cli\
		ON pre.id_cliente=cli.id_cliente\
		LEFT JOIN hermes.campana_servicio ser\
		ON pre.id_servicio=ser.id_servicio\
		"+filtro+"\
		ORDER BY monitor;"
		console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		})
	}
	connection.end();
}

reportModel.getListaColorMetas = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT cme_color,cme_rango FROM hermes.color_meta\
		"+filtro+"\
		ORDER BY cme_rango DESC;";
		console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		})
	}
	connection.end();
}

reportModel.getHorarioDiaOperadorMonitor = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		//
		var query = "select us.user,hop.hop_fecha,hop_inicio,hop_termino,hop_segundos from  hermes.horario_operadora hop\
												inner join asterisk.vicidial_users us on hop.vicu_user_id = us.user_id\
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

reportModel.getUsuarioCampanaMonitor = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select COALESCE( concat(lpad(id_cliente,2,'0'),lpad(id_servicio,2,'0')),'S/C') campana, us.user \
								from hermes.usuario_detalle usde \
									inner join asterisk.vicidial_users us on usde.user_id = us.user_id \
					where us.active = 'Y' "+filtro+" \
					group by concat(lpad(id_cliente,2,'0'),lpad(id_servicio,2,'0')),us.user;";
					console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		})
	}
	connection.end();
}

reportModel.getUsuarioCampanaMonitorCampana = function(callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select COALESCE( concat(lpad(id_cliente,2,'0'),lpad(id_servicio,2,'0')),'S/C') campana, us.user \
								from hermes.usuario_detalle usde \
									inner join asterisk.vicidial_users us on usde.user_id = us.user_id \
					where us.active = 'Y' \
					group by concat(lpad(id_cliente,2,'0'),lpad(id_servicio,2,'0')),us.user;";
					console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		})
	}
	connection.end();
}

reportModel.getTotalLlamadosPorCampañas = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select campaign_id,count(*) as numero_llamadas from asterisk.vicidial_log \
						where  1=1 "+filtro+ " group by campaign_id;";
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

reportModel.getHorarioIdealMonitorAdhe = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select 			COALESCE( concat(lpad(usde.id_cliente,2,'0'),lpad(usde.id_servicio,2,'0')),'S/C') campana, \
									us.user_id, \
									DATE_FORMAT(hop_fecha,'%Y-%m-%d') hop_fecha, \
									us.`user`, hop.hop_inicio,hop.hop_termino,hop.hop_segundos \
									 from hermes.horario_operadora hop \
									inner join asterisk.vicidial_users us on hop.vicu_user_id = us.user_id \
									inner join hermes.usuario_detalle usde on us.user_id = usde.user_id \
					where 1=1 and hop.hop_estado = 1 "+filtro+" \
					group by COALESCE( concat(lpad(usde.id_cliente,2,'0'),lpad(usde.id_servicio,2,'0')),'S/C'),us.user,hop.hop_inicio,hop.hop_termino,hop.hop_segundos \
					order by campana,us.user;";
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

reportModel.getHorarioRealMonitor = function (fecha,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select mpr_user as user,\
									SUBSTR(campaign_id,1,4) campana,\
									sum(mpr_talk_sec+mpr_wait_sec+mpr_pause_bill_sec) segundos, \
									SEC_TO_TIME(sum(mpr_talk_sec+mpr_wait_sec+mpr_pause_bill_sec)) format_real \
					from report_vicidial.media_produccion med \
					where med.mpr_date = '"+fecha+"' \
					GROUP BY mpr_user,SUBSTR(campaign_id,1,4)";

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

reportModel.getListaPreferenciaAdherencia = function (filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select campana from hermes.campana_monitor_adherencia\
		"+filtro+"\
		ORDER BY campana";
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

reportModel.getHorarioOperador = function (filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select us.user,date_format(hop.hop_fecha,'%Y-%m-%d') hop_fecha,hop.hop_inicio,hop.hop_termino,hop_segundos \
						from hermes.horario_operadora hop \
							inner join asterisk.vicidial_users us on hop.vicu_user_id = us.user_id \
						"+filtro+" \
					order by hop_fecha,vicu_user_id,hop_inicio";
		console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		})
	}
	connection.end();
}

reportModel.getDataGraficoLlamado = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select concat(hora,':',lpad(minuto,2,'0')) fecha ,sum(cantidad_llamando) cantidad_llamando,sum(cantidad_espera) cantidad_espera,sum(total_sin_pausa) total_sin_pausa \
						from report_vicidial.resumen_llamados \
						where date(fecha_guardado) = date(now()) "+filtro+" \
					GROUP BY concat(hora,':',lpad(minuto,2,'0'))";
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

reportModel.getExcepcionesTurno = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT vicu_user_id,DATE_FORMAT(hop_fecha,'%Y-%m-%d') hop_fecha,\
		SEC_TO_TIME(sum(hop_segundos)) as ideal,sum(hop_segundos) as total_ideal,\
		TIME(hop_inicio) hop_inicio, TIME(hop_termino) hop_termino, tho_id\
		FROM hermes.horario_operadora_excepciones\
		"+filtro+"\
		group by hop_fecha,vicu_user_id, hop_inicio, hop_termino\
		order by vicu_user_id,hop_fecha asc;";
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

reportModel.getIconos = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT ic_id, ic_nombre FROM hermes.iconos\
		" +filtro;
		console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		})
	}
	connection.end();
}

reportModel.getOperadorId = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select us.user_id,us.user,usde.usde_correo as email,usde.usde_telefono as telefono,us.phone_login as extension,us.user as operador \
						from asterisk.vicidial_users us \
						INNER JOIN hermes.usuario_detalle usde on us.user_id = usde.user_id \
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

reportModel.getListaCampanasActivas = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT SUBSTR(campaign_id,1,4) campaign_id, CONCAT(cli.cliente,' ',ser.servicio) as campaing_name\
		FROM asterisk.vicidial_campaigns vcam\
		INNER JOIN hermes.campana_clientes cli\
		ON SUBSTR(campaign_id,1,2)=cli.id_cliente\
		INNER JOIN hermes.campana_servicio ser\
		ON SUBSTR(campaign_id,3,2)=ser.id_servicio\
		"+filtro+"\
		GROUP BY SUBSTR(campaign_id,1,4);";
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

reportModel.getPaises = function(callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT id_pais,nombre_pais,codigo_pais,codigo_moneda,simbolo_moneda from hermes.paises WHERE estado = 1";
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

reportModel.getPais = function(id_pais,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT id_pais,nombre_pais,codigo_pais,codigo_moneda,simbolo_moneda from hermes.paises WHERE estado = 1 AND id_pais="+id_pais;
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
/*BITACORA*/
reportModel.getBitacoraOperador = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT bop_id,DATE_FORMAT(bop_fecha_ingreso,'%Y-%m-%d %H:%i:%s') bop_fecha_ingreso,DATE_FORMAT(bop_fecha_incidencia,'%Y-%m-%d %H:%i:%s') bop_fecha_incidencia,bop_observacion,supervisor usu_nom_usuario,\
						inc.inc_nom_incidencia,tgo.tgo_descripcion_gestion,tgs.tgs_descripcion,coalesce(res.res_descripcion,'NO SELECCIONADO') res_descripcion\
					FROM hermes.`bop_bitacora_operadora` bit\
							INNER JOIN hermes.supervisor us on bit.usu_id_usuario_ingreso = us.id_vici\
							INNER JOIN hermes.incidencia inc on bit.inc_id = inc.inc_id_incidencia\
							LEFT JOIN hermes.tipo_gestion_operador tgo on bit.tgo_id =tgo.tgo_id\
							LEFT JOIN hermes.tipo_gestion_supervisor tgs on bit.tgs_id = tgs.tgs_id\
							LEFT JOIN hermes.resolucion_bitacora res on bit.res_id = res.res_id\
							INNER JOIN asterisk.vicidial_users usvi on bit.usu_id_operadora = usvi.user_id\
						"+filtro+"\
					ORDER BY bop_id desc;";
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

reportModel.getBitacoras = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT bop_id,DATE_FORMAT(bop_fecha_ingreso,'%Y-%m-%d %H:%i:%s') bop_fecha_ingreso,DATE_FORMAT(bop_fecha_incidencia,'%Y-%m-%d %H:%i:%s') bop_fecha_incidencia,bop_observacion,us.supervisor usu_nom_usuario,\
						inc.inc_nom_incidencia,tgo.tgo_descripcion_gestion,tgs.tgs_descripcion,coalesce(res.res_descripcion,'NO SELECCIONADO') res_descripcion, usvi.user usuario_codigo,bop_estado\
						FROM hermes.`bop_bitacora_operadora` bit\
							INNER JOIN hermes.supervisor us on bit.usu_id_usuario_ingreso = us.id_vici\
							INNER JOIN hermes.incidencia inc on bit.inc_id = inc.inc_id_incidencia\
							INNER JOIN hermes.tipo_gestion_operador tgo on bit.tgo_id =tgo.tgo_id\
							INNER JOIN hermes.tipo_gestion_supervisor tgs on bit.tgs_id = tgs.tgs_id\
							LEFT JOIN hermes.resolucion_bitacora res on bit.res_id = res.res_id\
							INNER JOIN asterisk.vicidial_users usvi on bit.usu_id_operadora = usvi.user_id\
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

reportModel.getListIncidencias = function(callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select inc_id_incidencia,inc_nom_incidencia from hermes.incidencia WHERE inc_estado = 1 order by inc_nom_incidencia asc";
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


reportModel.getListGestion = function(callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select tgs_id,tgs_descripcion from hermes.tipo_gestion_supervisor where tgs_estado=1 order by tgs_descripcion asc";
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

reportModel.getListComunicacion = function(callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select tgo_id,tgo_descripcion_gestion from hermes.tipo_gestion_operador";
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

reportModel.getListResoluciones = function(callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select * from hermes.resolucion_bitacora where res_estado = 1";
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

reportModel.getBitacorasUser = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select user,inc_id,tgo_id from hermes.bop_bitacora_operadora bop \
												INNER JOIN asterisk.vicidial_users us on bop.usu_id_operadora = us.user_id "+filtro+ "\
							group by user \
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

reportModel.getBitacorasUserDetail = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select user,inc_id,tgo_id,DATE_FORMAT(date(bop_fecha_incidencia),	'%d/%m/%Y') AS fecha,bop_observacion,usu_nom_usuario,bop_media,bop_media_campana,DATE_FORMAT(bop_fecha_ingreso,'%d/%m/%Y %H:%i:%s') as fecha_ingreso\
		from hermes.bop_bitacora_operadora bop\
		INNER JOIN asterisk.vicidial_users us on bop.usu_id_operadora = us.user_id\
		INNER JOIN hermes.supervisor sup on bop.usu_id_usuario_ingreso = sup.id_vici\
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

reportModel.getCambiosHorariosEjecutivo = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT DATE_FORMAT(fecha_cambio,'%d-%m-%Y %H:%i:%s') fecha_cambio,user,operador from hermes.log_cambio_horario \
		 			"+filtro+" \
		order by fecha_cambio desc";
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

reportModel.getBitacoraIncidencias= function(filtro,limit, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT usu_id_operadora,DATE_FORMAT(bop_fecha_ingreso,'%d/%m/%Y') as ingreso,bit.bop_id,if(usu_id_operadora<>0,user,'MASIVA') as usuario_codigo,inc_id,inc_nom_incidencia,bop_observacion\
		FROM hermes.bop_bitacora_operadora bit\
		LEFT JOIN asterisk.vicidial_users usvi ON bit.usu_id_operadora = usvi.user_id\
		INNER JOIN hermes.incidencia inc ON bit.inc_id = inc.inc_id_incidencia\
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
reportModel.getEjecutivos = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT us.user_id as id_usuario, user as usuario_codigo FROM asterisk.vicidial_users us\
		INNER JOIN hermes.usuario_detalle usde ON us.user_id=usde.user_id\
		"+filtro+"\
		ORDER BY user;";
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

reportModel.getBitacorasUserDetailHour = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select user as usuario_codigo,inc_id,tgo_id, DATE_FORMAT(date(bop_fecha_incidencia),'%d/%m/%Y') as fecha,hour(bop_fecha_incidencia) as hora,bop_observacion,supervisor as usu_nom_usuario,bop_media,bop_media_campana,DATE_FORMAT(bop_fecha_ingreso,'%d/%m/%Y %H:%i:%s') as fecha_ingreso\
		from hermes.bop_bitacora_operadora bop \
		INNER JOIN asterisk.vicidial_users us on bop.usu_id_operadora = us.user_id \
		INNER JOIN hermes.supervisor us on bop.usu_id_usuario_ingreso = us.id_vici \
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

reportModel.getBitacorasUserDetail = function(filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select user as usuario_codigo,inc_id,tgo_id,DATE_FORMAT(date(bop_fecha_incidencia),	'%d/%m/%Y') AS fecha,bop_observacion,supervisor as usu_nom_usuario,bop_media,bop_media_campana,DATE_FORMAT(bop_fecha_ingreso,'%d/%m/%Y %H:%i:%s') as fecha_ingreso\
		from hermes.bop_bitacora_operadora bop\
		INNER JOIN asterisk.vicidial_users us on bop.usu_id_operadora = us.user_id\
		INNER JOIN hermes.supervisor us on bop.usu_id_usuario_ingreso = us.id_vici\
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

reportModel.getClientes = function (filtro,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select id_cliente,cliente from hermes.campana_clientes "+filtro+" order by cliente asc";
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

reportModel.getServicios = function(id_cliente,callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "select ser.*,cliente from hermes.campana_servicio ser\
						inner join hermes.campana_servicio_clientes sercli on ser.id_servicio = sercli.id_servicio\
						inner join hermes.campana_clientes cli on sercli.id_cliente = cli.id_cliente\
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

reportModel.getListaGrupos = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT gr_id_grupo, gr_descripcion, date_format(gr_fecha_inicio,'%d/%m/%Y') as gr_fecha_inicio,\
		date_format(gr_fecha_fin,'%d/%m/%Y') as gr_fecha_fin, gr_estado, id_pais FROM hermes.`grupo` "+filtro;
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

reportModel.getListaPostulantesGrupos = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT pos.pos_id_postulante,pos_rut,pos_nombre, pos_apellido,grpo.gr_id_grupo,gr_descripcion,DATE_FORMAT(pos_id_fecha_postulacion, '%d-%m-%Y') as pos_id_fecha_postulacion,grpo_codigo\
		FROM web_calling.postulacion post\
		INNER JOIN web_calling.postulante pos ON post.pos_id_postulante = pos.pos_id_postulante AND pos_estado = 1\
		INNER JOIN hermes.grupo_postulante grpo ON post.pos_id_postulante = grpo.pos_id_postulante\
		INNER JOIN hermes.grupo gr ON grpo.gr_id_grupo = gr.gr_id_grupo\
		"+filtro+"\
		ORDER BY pos_nombre, pos_apellido;";
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

reportModel.getListaPostulantesSinGrupo = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT pos.pos_id_postulante, CONCAT( pos_nombre, ' ', pos_apellido ) as pos_nombre_completo, poa_genero, date_format(poa_fecha_nacimiento,'%d-%m-%Y') poa_fecha_nacimiento, grpo.gr_id_grupo, gr_descripcion, DATE_FORMAT(pos_id_fecha_postulacion, '%d-%m-%Y') as pos_id_fecha_postulacion,grpo.pos_id_postulante\
		FROM web_calling.postulacion post\
		INNER JOIN web_calling.postulante pos ON post.pos_id_postulante = pos.pos_id_postulante AND pos_estado = 1\
		INNER JOIN web_calling.postulante_antecedentes poa ON post.pos_id_postulante = poa.pos_id_postulante\
		AND poa.poa_estado = 1\
		INNER JOIN web_calling.comuna com ON poa.com_id_comuna=com.com_id_comuna\
		LEFT JOIN hermes.grupo_postulante grpo ON post.pos_id_postulante = grpo.pos_id_postulante\
		LEFT JOIN hermes.grupo gr ON grpo.gr_id_grupo = gr.gr_id_grupo\
		"+filtro+"\
		ORDER BY pos_nombre_completo;";
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

reportModel.getListaTipoEstandar = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT ties_id_tipo_estandar,ties_descripcion,ties_estado FROM hermes.`tipo_estandar`\
		"+filtro+"\
		ORDER BY ties_descripcion;";
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

reportModel.getListaTipoEvaluacion = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT tiev_id_tipo_evaluacion,tiev_descripcion,tiev_estado FROM hermes.`tipo_evaluacion`\
		"+filtro+"\
		ORDER BY tiev_descripcion;";
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


reportModel.getListaEstandar = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT es_id_estandar, es.tiev_id_tipo_evaluacion, tiev_descripcion, es.ties_id_tipo_estandar, ties_descripcion,\
		es_valor_estandar, es_estado,DATE_FORMAT(es_fecha_inicio,'%d/%m/%Y') as es_fecha_inicio, DATE_FORMAT(es_fecha_fin,'%d/%m/%Y') as es_fecha_fin,\
		DATE_FORMAT(es_fecha_actualizacion,'%d/%m/%Y') as es_fecha_actualizacion, full_name,et.et_id_etapa,et_descripcion FROM hermes.`estandar` es INNER JOIN hermes.tipo_estandar ties ON es.ties_id_tipo_estandar = ties.ties_id_tipo_estandar\
		 INNER JOIN hermes.tipo_evaluacion tiev ON es.tiev_id_tipo_evaluacion = tiev.tiev_id_tipo_evaluacion\
		 INNER JOIN hermes.etapa et ON es.et_id_etapa=et.et_id_etapa\
		 INNER JOIN asterisk.vicidial_users viu ON es.user_id = viu.user_id\
		"+filtro;
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

reportModel.getListaTipoEjecutiva = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT tiej_nombre,tiej_descripcion,tiej_antiguedad_valor,tiej_estado,tiej_id_tipo_ejecutiva FROM hermes.`tipo_ejecutiva`\
		"+filtro+" ORDER BY tiej_antiguedad_valor";
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

reportModel.getListaCapacitaciones = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT DISTINCT ca.ca_id_capacitacion, ca_descripcion, date_format(ca_fecha_inicio,'%d/%m/%Y') as ca_fecha_inicio, date_format(ca_fecha_fin,'%d/%m/%Y') as ca_fecha_fin, ca_estado FROM hermes.`capacitacion` ca\
		LEFT JOIN hermes.capacitacion_grupo cagr ON ca.ca_id_capacitacion=cagr.ca_id_capacitacion\
		"+filtro;
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

reportModel.getListaGruposCapacitacion = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT gr.gr_id_grupo, gr_descripcion, cap.ca_id_capacitacion FROM hermes.grupo gr LEFT JOIN hermes.capacitacion_grupo cap\
			ON gr.gr_id_grupo=cap.gr_id_grupo AND cagr_estado=1\
			"+filtro;
		console.log(query);
		connection.query(query,function (error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportModel.getListaEvaluacionesCapacitacionGrupo = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT es_valor_estandar, ev.ev_id_evaluacion, es.es_id_estandar, ev.gr_id_grupo, pos_id_postulante, evpo_valor,evpo_valor_estandarizado, et.et_id_etapa, et.et_descripcion, tiev.tiev_id_tipo_evaluacion, tiev_descripcion, ties.ties_id_tipo_estandar, ties_descripcion\
		FROM hermes.evaluacion ev\
		INNER JOIN hermes.evaluacion_postulante evpo ON ev.ev_id_evaluacion = evpo.ev_id_evaluacion\
		INNER JOIN hermes.estandar es ON ev.es_id_estandar = es.es_id_estandar\
		INNER JOIN hermes.etapa et ON es.et_id_etapa = et.et_id_etapa\
		INNER JOIN hermes.tipo_evaluacion tiev ON es.tiev_id_tipo_evaluacion = tiev.tiev_id_tipo_evaluacion\
		INNER JOIN hermes.tipo_estandar ties ON es.ties_id_tipo_estandar = ties.ties_id_tipo_estandar\
		INNER JOIN hermes.capacitacion_grupo cagr ON ev.gr_id_grupo=cagr.gr_id_grupo\
			"+filtro;
		console.log(query);
		connection.query(query,function (error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportModel.getEvaluacionesCapacitacion = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT	et_id_etapa,tiev_id_tipo_evaluacion,ties_id_tipo_estandar\
			FROM\
		hermes.evaluacion ev\
		INNER JOIN hermes.capacitacion_grupo cagr ON ev.gr_id_grupo = cagr.gr_id_grupo AND cagr_estado=1\
		INNER JOIN hermes.estandar es ON ev.es_id_estandar=es.es_id_estandar\
			"+filtro+" GROUP BY et_id_etapa, tiev_id_tipo_evaluacion;";
		console.log(query);
		connection.query(query,function (error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportModel.getListaEtapa = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT et_id_etapa, et_descripcion, et_estado FROM hermes.`etapa`\
		"+filtro+" ORDER BY et_id_etapa;";
		console.log(query);
		connection.query(query,function (error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportModel.getListaEvaluaciones = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT ev_id_evaluacion, es_id_estandar,gr_id_grupo FROM hermes.`evaluacion`\
		"+filtro+" ORDER BY ev_id_evaluacion;";
		console.log(query);
		connection.query(query,function (error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportModel.getListaEtapaTipoEvaluacion = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT et.et_id_etapa, et_descripcion, etti.tiev_id_tipo_evaluacion, tiev_descripcion, ettiev_valor FROM hermes.etapa et\
		INNER JOIN hermes.etapa_tipo_evaluacion etti\
		ON et.et_id_etapa=etti.et_id_etapa\
		INNER JOIN hermes.tipo_evaluacion tiev\
		ON etti.tiev_id_tipo_evaluacion=tiev.tiev_id_tipo_evaluacion\
		"+filtro+" ORDER BY et.et_id_etapa,tiev_descripcion;";
		console.log(query);
		connection.query(query,function (error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportModel.getListaComunas = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT com_id_comuna, com_nombre FROM hermes.`comuna`\
		"+filtro+" ORDER BY com_nombre;";
		console.log(query);
		connection.query(query,function (error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportModel.getListaEstadoCivil = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT est_id_estado_civil, est_nombre FROM hermes.`estado_civil`\
		"+filtro+" ORDER BY est_nombre;";
		console.log(query);
		connection.query(query,function (error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportModel.getListaNivelEducacional = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT niv_id_nivel_educacional, niv_nombre FROM hermes.`nivel_educacional`\
		"+filtro+" ORDER BY niv_nombre;";
		console.log(query);
		connection.query(query,function (error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportModel.getListaTipoComputador = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT tico_id_tipo_computador, tico_descripcion_computador FROM hermes.`tipo_computador`\
		"+filtro+" ORDER BY tico_descripcion_computador;";
		console.log(query);
		connection.query(query,function (error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportModel.getListaTipoConexion = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT tico_id_tipo_conexion, tico_descripcion_conexion FROM hermes.`tipo_conexion`\
		"+filtro+" ORDER BY tico_descripcion_conexion;";
		console.log(query);
		connection.query(query,function (error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportModel.getListaHijosEjecutivo = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT user_id, date_format(ushi_fecha_nacimiento, '%d/%m/%Y') as ushi_fecha_nacimiento FROM hermes.usuario_hijo\
		"+filtro+" ORDER BY ushi_fecha_nacimiento;";
		console.log(query);
		connection.query(query,function (error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportModel.getListaEvaluacionesCapacitacionPostulante = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT es_valor_estandar, ev.ev_id_evaluacion, es.es_id_estandar, pos_id_postulante, evpo_valor,evpo_valor_estandarizado, et.et_id_etapa, et.et_descripcion, tiev.tiev_id_tipo_evaluacion, tiev_descripcion, ties.ties_id_tipo_estandar, ties_descripcion\
		FROM hermes.evaluacion ev\
		INNER JOIN hermes.evaluacion_postulante evpo ON ev.ev_id_evaluacion = evpo.ev_id_evaluacion\
		INNER JOIN hermes.estandar es ON ev.es_id_estandar = es.es_id_estandar\
		INNER JOIN hermes.etapa et ON es.et_id_etapa = et.et_id_etapa\
		INNER JOIN hermes.tipo_evaluacion tiev ON es.tiev_id_tipo_evaluacion = tiev.tiev_id_tipo_evaluacion\
		INNER JOIN hermes.tipo_estandar ties ON es.ties_id_tipo_estandar = ties.ties_id_tipo_estandar\
			"+filtro;
		console.log(query);
		connection.query(query,function (error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportModel.getListaColumnasPostulaciones = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
    if(connection){
		var query = "SELECT ccp_id_carga_columna_postulante, ccp_descripcion FROM hermes.carga_columna_postulante\
			"+filtro;
		console.log(query);
		connection.query(query,function (error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportModel.getListaConfiguracionCampanas = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
	if(connection){
		var query = "SELECT coca_id_configuracion_campana, coca_cantidad_postulantes, coca_dias, date_format(coca_fecha_inicio,'%d/%m/%Y') coca_fecha_inicio, coca_estado FROM hermes.`configuracion_campana`;\
			"+filtro;
		console.log(query);
		connection.query(query,function (error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportModel.getListaEfectivosReclutamiento = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
	if(connection){
		var query = "SELECT vendor_lead_code FROM asterisk.`vicidial_list` vl INNER JOIN asterisk.vicidial_lists vls ON vl.list_id = vls.list_id\
		WHERE campaign_id LIKE '5426%' AND STATUS = 'OK' AND DATE(list_lastcalldate) BETWEEN DATE( DATE_ADD(NOW(), INTERVAL - 30 DAY)) AND CURDATE()\
			"+filtro;
		console.log(query);
		connection.query(query,function (error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportModel.getListaCampanasReclutamiento = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
	if(connection){
		var query = "SELECT locr_id_log_creacion_campana, DATE_FORMAT(locr_id_fecha_creacion,'%d-%m-%Y') as locr_id_fecha_creacion, id_campana FROM  hermes.log_creacion_campana\
			"+filtro;
		console.log(query);
		connection.query(query,function (error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportModel.getListaDetalleCampanasReclutamiento = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
	if(connection){
		var query = "SELECT cam.pos_rut, pos_nombre, pos_apellido FROM hermes.`campana_postulante` cam\
		INNER JOIN web_calling.postulante pos ON cam.pos_id_postulante=pos.pos_id_postulante\
			"+filtro;
		console.log(query);
		connection.query(query,function (error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}

reportModel.getListaUsuariosPostulantes = function(filtro, callback){
	var connection = mysql.createConnection(conexion_vici);
	if(connection){
		var query = "SELECT grpo.pos_id_postulante, pos_rut, usde.user_id, user FROM hermes.`grupo_postulante` grpo INNER JOIN web_calling.postulante pos ON grpo.pos_id_postulante = pos.pos_id_postulante AND grpo_estado = 1\
		INNER JOIN hermes.usuario_detalle usde ON pos.pos_rut = usde.usde_rut COLLATE utf8_unicode_ci\
		INNER JOIN asterisk.vicidial_users vius ON usde.user_id = vius.user_id\
			"+filtro;
		console.log(query);
		connection.query(query,function (error,rows){
			if(error)
				throw error;
			else{
				callback(null,rows);
			}
		});
	}
	connection.end();
}
module.exports = reportModel;