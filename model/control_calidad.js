var mysql = require('mysql');

var connection_settings = {host: '192.168.0.240',user: 'db_controlcali',password: 'cc_00414',database: 'control_calidad'};

var reportControlCalidad = {};

reportControlCalidad.getPorcentajeCalidad = function(filtro,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "call resumen_operador_caser_vibox("+filtro+")";
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

reportControlCalidad.getActitudesCriticas = function(filtro,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "call resumen_actitudes_criticas_caser_vibox("+filtro+")";
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

reportControlCalidad.getNotaOperador = function(filtro, callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "SELECT DATE(ev_fecha_creacion) as opno_fecha_evaluacion,otcam_valor as opno_operador,AVG(ev_nota) as promedio, COUNT(ev_id_evaluacion) as cantidad  from evaluacion ev INNER JOIN registro reg\
		ON ev.reg_id_registro=reg.reg_id_registro AND ev_nota is not null AND ev_estado=1\
		INNER JOIN orden_campo orcam \
		ON reg.reg_id_registro=orcam.reg_id_registro AND cam_id_campo=22\
		INNER JOIN orden_trabajo_calificacion ot\
		ON reg.ot_id=ot.ot_id\
		INNER JOIN call_center_cliente_servicio caser \
		ON ot.caser_id_call_center_cliente_servicio=caser.caser_id_call_center_cliente_servicio AND call_id_call_center=1\
		"+filtro+"\
		ORDER BY otcam_valor;";
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

reportControlCalidad.getCriticidadesOperador = function(filtro, callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "SELECT reev_fecha_evaluacion, reev_operador, SUM(reev_cantidad) as cantidad FROM resumen_critico_evaluacion\
		 "+filtro+" \
		ORDER BY reev_fecha_evaluacion DESC;";
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

reportControlCalidad.getDiasMonitor = function(filtro, callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "SELECT fem_dias_monitor FROM fecha_monitor\
		WHERE fem_nro_dia=DATE_FORMAT('"+filtro+"', '%w');";
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

reportControlCalidad.getFechasEvaluacion = function(filtro, callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "SELECT DISTINCT opno_fecha_evaluacion FROM operador_nota_final "+filtro+" \
		ORDER BY opno_fecha_evaluacion;";
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

reportControlCalidad.getCalidadLiquidacion = function(filtro, callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "SELECT orcam2.otcam_valor as operador\
		,AVG(ev_nota) as promedio, COUNT(DISTINCT ev_id_evaluacion) as cantidad_evaluaciones ";
		query+="from evaluacion ev ";
		query+="INNER JOIN registro reg "; 
		query+="ON ev.reg_id_registro=reg.reg_id_registro AND ev_estado=1 AND ev_nota is not null ";
		query+="INNER JOIN orden_trabajo_calificacion ot ";
		query+="ON reg.ot_id=ot.ot_id ";
		query+="INNER JOIN call_center_cliente_servicio caser ";
		query+="ON ot.caser_id_call_center_cliente_servicio=caser.caser_id_call_center_cliente_servicio and call_id_call_center=1 ";
		query+="INNER JOIN orden_campo orcam ";
		query+="ON reg.reg_id_registro=orcam.reg_id_registro AND orcam.cam_id_campo=23 ";
		query+="INNER JOIN orden_campo orcam2 ";
		query+="ON reg.reg_id_registro=orcam2.reg_id_registro AND orcam2.cam_id_campo=22 ";
		query+=filtro+" \
		GROUP BY orcam2.otcam_valor";
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

reportControlCalidad.getDatosMonitorCampana = function(fecha_fin,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "SELECT concat(lpad(cli.cli_id_cliente_vibox,2,'0'),lpad(ser.id_servicio_vibox,2,'0')) campana,COUNT(ev_id_evaluacion) cantidad_evaluaciones,avg(ev_nota) nota"
			query += " FROM  control_calidad.evaluacion ev "; 
			query += " INNER JOIN control_calidad.registro reg "; 
			query += "ON ev.reg_id_registro=reg.reg_id_registro ";
			query += "INNER JOIN control_calidad.orden_trabajo_calificacion ot "; 
			query += "ON reg.ot_id=ot.ot_id ";
			query += "INNER JOIN control_calidad.call_center_cliente_servicio caser ";
			query += "ON ot.caser_id_call_center_cliente_servicio=caser.caser_id_call_center_cliente_servicio AND call_id_call_center=1 ";
			query += "INNER JOIN control_calidad.cliente_servicio cliser ";
			query += "ON caser.cliser_id_cliente_servicio=cliser.cliser_id_cliente_servicio ";
			query += "INNER JOIN control_calidad.cliente cli ";
			query += "ON cliser.cli_id_cliente=cli.cli_id_cliente ";
			query += "INNER JOIN control_calidad.servicio ser ";
			query += "ON cliser.ser_id_servicio=ser.ser_id_servicio ";
			query += "WHERE MONTH(ev_fecha_creacion)=MONTH('"+fecha_fin+"') AND YEAR(ev_fecha_creacion)=YEAR('"+fecha_fin+"') AND ev_estado=1 ";
			query += "GROUP BY  lpad(cli.cli_id_cliente_vibox,2,'0'),lpad(ser.id_servicio_vibox,2,'0');";
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

reportControlCalidad.getNotaSeleccionReclutamiento = function(filtro,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "SELECT otcam_valor, SUM(paupre_valor*evpa_cumplio) as nota FROM control_calidad.evaluacion ev\
		INNER JOIN control_calidad.evaluacion_pauta_pregunta evpa ON ev.ev_id_evaluacion = evpa.ev_id_evaluacion AND ev_estado=1\
		INNER JOIN control_calidad.pauta_pregunta paupre ON evpa.paupre_id_pauta_pregunta=paupre.paupre_id_pauta_pregunta\
		INNER JOIN control_calidad.registro reg ON ev.reg_id_registro=reg.reg_id_registro\
		INNER JOIN control_calidad.orden_trabajo_calificacion ot ON reg.ot_id=ot.ot_id\
		INNER JOIN control_calidad.call_center_cliente_servicio caser ON ot.caser_id_call_center_cliente_servicio=caser.caser_id_call_center_cliente_servicio\
		INNER JOIN control_calidad.cliente_servicio cliser ON caser.cliser_id_cliente_servicio=cliser.cliser_id_cliente_servicio\
		INNER JOIN control_calidad.orden_campo orcam ON reg.reg_id_registro=orcam.reg_id_registro\
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

reportControlCalidad.getPromedioEjecutiva = function(filtro,callback){
	connection = mysql.createConnection(connection_settings);
	if(connection){
		var query = "SELECT res_operador, avg(res_prom_categoria) promedio FROM resumen res INNER JOIN call_center_cliente_servicio caser\
		on res.caser_id_call_center_cliente_servicio=caser.caser_id_call_center_cliente_servicio\
		"+filtro+" GROUP BY res_operador";
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
module.exports = reportControlCalidad;