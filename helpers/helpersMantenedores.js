var _ = require('lodash');
var moment = require('moment');
/*****
	funcion para agregar la semana siguiente al dato de semana por operadora
	Ej:
		fecha actual 23/08/2016
		Lunes 2 se transformara a 29/08/2016
		el martes 3 al 30/08/2016 y sucesivamente
****/
function addDateWeekData(dataHorarioSemena){
	var arrFormatFinal = [];
	var arrWeekPeriod = getWeekPeriod();
	for (var i = 0; i < dataHorarioSemena.length; i++) {
		if (dataHorarioSemena[i].ophs_dia_semana.toString() == '1')
				continue;
		console.log("arrWeekPeriod",arrWeekPeriod[dataHorarioSemena[i].ophs_dia_semana.toString()],dataHorarioSemena[i].ophs_dia_semana);
		var fecha_semana = new Date(arrWeekPeriod[dataHorarioSemena[i].ophs_dia_semana.toString()].getTime());
		var fecha_semana_fin = new Date(arrWeekPeriod[dataHorarioSemena[i].ophs_dia_semana.toString()].getTime());
		var sep_hora_ini = dataHorarioSemena[i].ophs_hora_entrada.split(':'); // separar Hora Inicio
		var sep_hora_fin = dataHorarioSemena[i].ophs_hora_fin.split(':'); // separar Hora Fin

		fecha_semana = getFormatDateHour(fecha_semana,sep_hora_ini);
		fecha_semana_fin = getFormatDateHour(fecha_semana_fin,sep_hora_fin);
		dataHorarioSemena[i].start = fecha_semana;
		dataHorarioSemena[i].end = fecha_semana_fin;
		dataHorarioSemena[i].text = "";
		dataHorarioSemena[i].id = dataHorarioSemena[i].ophs_id_operadora_horario_semana;
		arrFormatFinal.push(dataHorarioSemena[i]);
	}
	return arrFormatFinal;
}

function getFormatDateHour(fecha,sep_hour){
	var ret_fecha = "";
	var month = ((fecha.getMonth()+1) < 10) ? "0"+(fecha.getMonth()+1):(fecha.getMonth()+1);
	var day = (fecha.getDate() < 10) ? "0"+fecha.getDate():fecha.getDate();
	ret_fecha += fecha.getFullYear()+"-"+month+"-"+day+"T";
	ret_fecha += sep_hour[0]+":"+sep_hour[1]+":00";
	return ret_fecha;
}

/***
	segun el dia actual lo transforma al lunes de la semana
		y con suma de fechas se logra obtener el periodo de la semana que sigue
***/
function getWeekPeriod(){
	var curr_date = new Date();
	var diaSemana = curr_date.getDay();
	var difLunes = diaSemana-1;
	var diaLunes = (difLunes == 0) ? curr_date:changeDateForDay(0,difLunes,curr_date);

	var diaProxLunes = changeDateForDay(1,7,diaLunes);

	var arrPeriod = {2:diaProxLunes,3:changeDateForDay(1,1,diaProxLunes),
						4:changeDateForDay(1,2,diaProxLunes),5:changeDateForDay(1,3,diaProxLunes),
						6:changeDateForDay(1,4,diaProxLunes),7:changeDateForDay(1,5,diaProxLunes)};

	return arrPeriod;
	//ver como transformar a lunes de la semana
}

/**
	agrega o resta dias segun el modo
	0 => resta dias
	1 => suma dias
**/
function changeDateForDay(modo,dias,fecha_in){
	fecha = new Date(fecha_in.getTime());
    tiempo=fecha.getTime();
    milisegundos=parseInt(dias*24*60*60*1000);
	if(modo == 1){
		total=fecha.setTime(tiempo+milisegundos);
	}else if(modo == 0){
		total=fecha.setTime(tiempo-milisegundos);
	}else{
		return ;
	}
	return fecha;
}

function getQueryInsertHorarioSemana(horarios){
		var cambiar_horario_operador = "INSERT INTO hermes.horario_operadora_semana (ophs_hora_entrada,ophs_hora_fin,ophs_segundos,ophs_hora_diferencia,ophs_usuario_codigo,ophs_dia_semana,vicu_user_id) values";

		horarios.forEach(function (horario,index) {
			var diaSemana = new Date(horario.start).getDay()+1;
			var horaInicio = horario.start.split("T")[1];
			var horaFin = horario.end.split("T")[1];
			var diferencia_segundos = "TIME_TO_SEC('"+horaFin+"')-TIME_TO_SEC('"+horaInicio+"')";
			var diferencia_segundos_format = "SEC_TO_TIME(TIME_TO_SEC('"+horaFin+"')-TIME_TO_SEC('"+horaInicio+"'))";

			if (index>0) {
				cambiar_horario_operador += ", ";
			}
			cambiar_horario_operador += "('"+horaInicio+"','"+horaFin+"', "+diferencia_segundos+", "+diferencia_segundos_format+", ";
			cambiar_horario_operador += "'"+horario.ophs_usuario_codigo+"',"+diaSemana+", "+horario.vicu_user_id+")";
		});
		return cambiar_horario_operador;
}

function sumaFecha(d, fecha){
	var Fecha = new Date();
	var sFecha = fecha || (Fecha.getDate() + "/" + (Fecha.getMonth() +1) + "/" + Fecha.getFullYear());
	var sep = sFecha.indexOf('/') != -1 ? '/' : '-'; 
	var aFecha = sFecha.split(sep);
	var fecha = aFecha[2]+'/'+aFecha[1]+'/'+aFecha[0];
	fecha= new Date(fecha);
	fecha.setDate(fecha.getDate()+parseInt(d));
	var anno=fecha.getFullYear();
	var mes= fecha.getMonth()+1;
	var dia= fecha.getDate();
	mes = (mes < 10) ? ("0" + mes) : mes;
	dia = (dia < 10) ? ("0" + dia) : dia;
	var fechaFinal = dia+sep+mes+sep+anno;
	return (fechaFinal);
}

function ultimoDiaMesFecha(fecha){
	var date  = new Date(fecha);
	console.log(date);
	var ultimoDia = new Date(date.getFullYear(), date.getMonth() +2, 0);

	return ultimoDia.toISOString().substring(0, 10);
}

function arrFormatHorario(data){
	var arrRet = []
	for (var i = 0; i < data.length; i++) {
		console.log("data[i]",data[i]);
		var fecha_inicio = data[i].hop_fecha+"T"+data[i].hop_inicio;
		var fecha_fin = data[i].hop_fecha+"T"+data[i].hop_termino;
		
		data[i].start = fecha_inicio;
		data[i].end = fecha_fin;
		data[i].text = "";
		data[i].id = data[i].user+i;
		data[i].resource = "col_"+data[i].user;
		arrRet.push(data[i]);
	}
	return arrRet;
}


function strInsertCamposUpdate(campos,user_id){
	var strInsert = "INSERT INTO hermes.user_campo_domo (campo_id,user_id) VALUES";
	var strCampos = "";
	for(var campo_id in campos){
		if(campos[campo_id]){
			if(strCampos == ""){
				strCampos += "("+campo_id+","+user_id+")";
			}else{
				strCampos += ",("+campo_id+","+user_id+")";
			}
		}
	}
	strInsert += strCampos;
	return strInsert;
}

function arrListCamposDomo(dataCampos){
	var arrRet = {};
	for(var i = 0;i< dataCampos.length;i++){
		arrRet[dataCampos[i].campo_id] = true;
	}
	return arrRet;
}

function getSqlUsuarioDetalle(existe,data){
	var cambios_usuario_detalle = "";
	var flag_ingreso = false;
	var flag_vencimiento = false;
	var flag_despido = false;
	var flag_rut = false;
	var flag_cliente = false;
	var flag_servicio = false;
	var flag_genero = false;
	var flag_nacimiento = false;
	var flag_estcivil = false;
	var flag_estudios = false;
	var flag_hijos = false;
	var flag_computador = false;
	var flag_camara = false;
	var flag_velocidad = false;
	var flag_tipo = false;
	var flag_comuna = false;
	var lm = (data.hasOwnProperty("is_lm") && data.is_lm)?data.is_lm:null;
	if(data.hasOwnProperty("usde_fec_ingreso") && data.usde_fec_ingreso != "" && data.usde_fec_ingreso != null){
		var fecha_contrato = data.usde_fec_ingreso.split("/").reverse().join("-");
		flag_ingreso = true;
	}
	if(data.hasOwnProperty("usde_fec_vencimiento") && data.usde_fec_vencimiento != "" && data.usde_fec_vencimiento != null){
		var fecha_vencimiento = data.usde_fec_vencimiento.split("/").reverse().join("-");
		flag_vencimiento = true
	}
	if(data.hasOwnProperty("usde_fec_despido") && data.usde_fec_despido != "" && data.usde_fec_despido != null){
		var fecha_despido = data.usde_fec_despido.split("/").reverse().join("-");
		flag_despido = true
	}
	if(data.hasOwnProperty("usde_rut") && data.usde_rut != "" && data.usde_rut != null){
		flag_rut = true		
	}
	if(data.hasOwnProperty("id_cliente") && data.id_cliente != "" && data.id_cliente != null){
		flag_cliente = true		
	}
	if(data.hasOwnProperty("id_servicio") && data.id_servicio != "" && data.id_servicio != null){
		flag_servicio = true		
	}
	if(data.hasOwnProperty("id_servicio") && data.id_servicio != "" && data.id_servicio != null){
		flag_servicio = true		
	}
	if(data.hasOwnProperty("id_servicio") && data.id_servicio != "" && data.id_servicio != null){
		flag_servicio = true		
	}
	if(typeof(data.usde_genero) != "undefined" && data.usde_genero!='' && data.usde_genero!=null)
		flag_genero = true;
	if(typeof(data.usde_fec_nacimiento) != "undefined" && data.usde_fec_nacimiento!='' && data.usde_fec_nacimiento!=null)
		flag_nacimiento = true;
	if(typeof(data.est_id_estado_civil) != "undefined" && data.est_id_estado_civil!='' && data.est_id_estado_civil!=null)
		flag_estcivil = true;
	if(typeof(data.niv_id_nivel_educacional) != "undefined" && data.niv_id_nivel_educacional!='' && data.niv_id_nivel_educacional!=null)
		flag_estudios = true;
	if(typeof(data.usde_hijos) != "undefined" && data.usde_hijos!='' && data.usde_hijos!=null)
		flag_hijos = true;
	if(typeof(data.tico_id_tipo_computador) != "undefined" && data.tico_id_tipo_computador!='' && data.tico_id_tipo_computador!=null)
		flag_computador = true;
	if(typeof(data.usde_camara_web) != "undefined" && data.usde_camara_web!='' &&  data.usde_camara_web!=null)
		flag_camara = true;
	if(typeof(data.usde_velocidad) != "undefined" && data.usde_velocidad!='' && data.usde_velocidad!=null)
		flag_velocidad = true;
	if(typeof(data.tico_id_tipo_conexion) != "undefined" && data.tico_id_tipo_conexion!='' && data.tico_id_tipo_conexion!=null)
		flag_tipo = true;
	if(typeof(data.com_id_comuna) != "undefined" && data.com_id_comuna!='' && data.com_id_comuna!=null)
		flag_comuna = true;

	if(existe > 0){
		cambios_usuario_detalle += "UPDATE hermes.usuario_detalle SET usde_direccion='"+data.usde_direccion+"'";
		cambios_usuario_detalle += ",usde_telefono='"+data.usde_telefono+"',usde_correo='"+data.usde_correo+"'";
		cambios_usuario_detalle += ",is_id_isapre='"+data.is_id_isapre+"',afp_id_afp='"+data.afp_id_afp+"',con_id_contrato="+data.con_id_contrato+" ";
		cambios_usuario_detalle += ",usde_contrato_indef="+data.usde_contrato_indef+" ";
		cambios_usuario_detalle += ",usde_lm="+lm+" ";
		cambios_usuario_detalle += ",id_pais="+data.id_pais+" ";
		if(flag_ingreso){
			cambios_usuario_detalle += ",usde_fec_ingreso='"+fecha_contrato+"'";
		}
		if(flag_vencimiento){
			cambios_usuario_detalle += ",usde_fec_vencimiento='"+fecha_vencimiento+"'";
		}
		if(flag_despido){
			cambios_usuario_detalle += ",usde_fec_despido='"+fecha_despido+"'";
		}
		if(flag_rut){
			cambios_usuario_detalle += ",usde_rut='"+data.usde_rut+"'";
		}
		if(flag_cliente){
			cambios_usuario_detalle += ",id_cliente='"+data.id_cliente+"'";
		}
		if(flag_servicio){
			cambios_usuario_detalle += ",id_servicio='"+data.id_servicio+"'";
		}
		if(flag_genero)
			cambios_usuario_detalle += ",usde_genero='"+data.usde_genero+"'";
		if(flag_nacimiento)
			cambios_usuario_detalle += ",usde_fec_nacimiento='"+data.usde_fec_nacimiento.split("/").reverse().join("-")+"'";
		if(flag_estcivil)
			cambios_usuario_detalle += ",est_id_estado_civil="+data.est_id_estado_civil;
		if(flag_estudios)
			cambios_usuario_detalle += ",niv_id_nivel_educacional="+data.niv_id_nivel_educacional;
		if(flag_hijos)
			cambios_usuario_detalle += ",usde_hijos="+data.usde_hijos;
		if(flag_computador)
			cambios_usuario_detalle += ",tico_id_tipo_computador="+data.tico_id_tipo_computador;
		if(flag_camara)
			cambios_usuario_detalle += ",usde_camara_web="+data.usde_camara_web;	
		if(flag_velocidad)
			cambios_usuario_detalle += ",usde_velocidad="+data.usde_velocidad;
		if(flag_tipo)
			cambios_usuario_detalle += ",tico_id_tipo_conexion="+data.tico_id_tipo_conexion;
		if(flag_comuna)
			cambios_usuario_detalle += ",com_id_comuna="+data.com_id_comuna;
		cambios_usuario_detalle +=" WHERE 1=1 AND user_id="+data.user_id;
		
	}else{
		var camposAdicionales = "";
		var valoresAdicionales = "";
		if(flag_ingreso){
			var fecha_contrato = data.usde_fec_ingreso.split("/").reverse().join("-");
			camposAdicionales += ",usde_fec_ingreso";
			valoresAdicionales += ",'"+fecha_contrato+"'";
		}
		if(flag_vencimiento){
			camposAdicionales += ",usde_fec_vencimiento";
			valoresAdicionales += ",'"+fecha_vencimiento+"'";
		}
		if(flag_despido){
			camposAdicionales += ",usde_fec_despido";
			valoresAdicionales += ",'"+fecha_despido+"'";
		}
		if(flag_rut){
			camposAdicionales += ",usde_rut";
			valoresAdicionales += ",'"+data.usde_rut+"'";
		}
		if(flag_cliente){
			camposAdicionales += ",id_cliente";
			valoresAdicionales += ",'"+data.id_cliente+"'";
		}
		if(flag_servicio){
			camposAdicionales += ",id_servicio";
			valoresAdicionales += ",'"+data.id_servicio+"'";
		}
		if(flag_genero){
			camposAdicionales += ",usde_genero";
			valoresAdicionales += ",'"+data.usde_genero+"'";
		}
		if(flag_nacimiento){
			camposAdicionales += ",usde_fec_nacimiento";
			valoresAdicionales += ",'"+data.usde_fec_nacimiento.split("/").reverse().join("-")+"'";
		}
		if(flag_estcivil){
			camposAdicionales += ",est_id_estado_civil";
			valoresAdicionales += ","+data.est_id_estado_civil;
		}
		if(flag_estudios){
			camposAdicionales += ",niv_id_nivel_educacional";
			valoresAdicionales += ","+data.niv_id_nivel_educacional;
		}
		if(flag_hijos){
			camposAdicionales += ",usde_hijos";
			valoresAdicionales += ","+data.usde_hijos;
		}
		if(flag_computador){
			cambios_usuario_detalle += ",tico_id_tipo_computador="+data.tico_id_tipo_computador;
		}
		if(flag_camara)
			cambios_usuario_detalle += ",usde_camara_web="+data.usde_camara_web;	
		if(flag_velocidad)
			cambios_usuario_detalle += ",usde_velocidad="+data.usde_velocidad;
		if(flag_tipo)
			cambios_usuario_detalle += ",tico_id_tipo_conexion="+data.tico_id_tipo_conexion;
		if(flag_comuna)
			cambios_usuario_detalle += ",com_id_comuna="+data.com_id_comuna;
		cambios_usuario_detalle += "INSERT INTO hermes.usuario_detalle(user_id,usde_direccion,usde_telefono,usde_correo,is_id_isapre,afp_id_afp,con_id_contrato,usde_contrato_indef,usde_lm,id_pais"+camposAdicionales+")\
									VALUES ("+data.user_id+",'"+data.usde_direccion+"','"+data.usde_telefono+"','"+data.usde_correo+"','"+data.is_id_isapre+"'\
											,'"+data.afp_id_afp+"',"+data.con_id_contrato+","+data.usde_contrato_indef+","+lm+","+data.id_pais+valoresAdicionales+")";
	}
	return cambios_usuario_detalle;
}

/***
	modo 0 o 1
		0 Insertar
		1 Modificar
**/
function getSqlInsertMeta(data,modo){
	var sql = "";
	if(modo == 0){
		sql += "INSERT INTO hermes.meta(met_meta,met_mes,met_ano,met_periodo,id_cliente,id_servicio) VALUES (";

		sql += data.met_meta+",";
		sql += data.met_mes+",";
		sql += data.met_ano+",";
		sql += data.met_periodo+",";
		sql += data.id_cliente+",";
		sql += data.id_servicio

		sql += ")";
	}else{
		sql += "UPDATE hermes.meta set ";

		sql += "met_meta="+data.met_meta;
		sql += ",met_mes="+data.met_mes;
		sql += ",met_ano="+data.met_ano;
		sql += ",met_periodo="+data.met_periodo;
		sql += ",id_cliente="+data.id_cliente;
		sql += ",id_servicio="+data.id_servicio;

		sql += "WHERE met_id="+data.met_id;
	}
	return sql;
}

function formatHorasOperador(data){
	var arrHoras = {};
	var clienteServicio = [];
	_.forEach(data,function(value,key){
		if(typeof(arrHoras[value.id_cliente]) == "undefined")
			arrHoras[value.id_cliente] = {};
		if(typeof(arrHoras[value.id_cliente][value.id_servicio]) == "undefined")
			arrHoras[value.id_cliente][value.id_servicio] = [];
		value.format_segundos = value.segundos.toHHMMSS();
		arrHoras[value.id_cliente][value.id_servicio].push(value);
	})
	return arrHoras;
}

function getDataClienteServicio(data){
	_.forEach(data,function(value,key){
		data[key].format_segundos = data[key].segundos.toHHMMSS();
	})

	return data;
}

function getInsertMetaDiaria(dias,base_meta,id_meta){
	var sqlInsert = "INSERT INTO hermes.meta_diaria (met_dia_fecha,met_dia_meta,met_id,met_dia_media) VALUES ";
	var i = 0;
	var acum_meta = 0;
	var acum_hora = 0;
	_.forEach(dias,function(totales,dia){
		var sep_time = totales.formatIdealExce.split(":");
		var horas  = parseInt(sep_time[0]);
		if(parseInt(sep_time[1]) >= 30){
			horas += 1;
		}
		var meta = Math.round(base_meta*horas);
		var media_dia = (meta/(totales.totalIdealExce/3600)).toFixed(2);
		acum_meta += meta;
		acum_hora += horas;
		if(i == 0)
			sqlInsert += "('"+dia+"',"+meta+","+id_meta+","+media_dia+" )";
		else
			sqlInsert += ",('"+dia+"',"+meta+","+id_meta+","+media_dia+" )";
		i++;
	});
	return sqlInsert;	
}

Number.prototype.toHHMMSS = function () {
	var flagNegative = false;
    var sec_num = parseInt(this, 10); // don't forget the second param
    if(sec_num < 0){
		flagNegative = true;
		sec_num = Math.abs(sec_num);
    }
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return (flagNegative) ? '-'+hours+':'+minutes+':'+seconds : hours+':'+minutes+':'+seconds;
}

function formatValorEfectivo(listas, clientes, servicios){
	var format = [];
	listas.forEach(function (lista) {
		var info = {id: lista.cvr_id_cliente_valor_registro,
			cvr_id_cliente: lista.cvr_id_cliente,
			cvr_id_servicio: lista.cvr_id_servicio,
			descripcion: lista.cvr_descripcion,
			velocidad: lista.cvr_velocidad,
			valor_registro: lista.cvr_valorRegistro,
			fecha: lista.cvr_fec_crea,
			fecha_inicio: lista.cvr_fec_inicio,nombre_pais:lista.nombre_pais,id_pais:lista.id_pais,simbolo_moneda:lista.simbolo_moneda};
		clientes.forEach(function(cliente){
			if(cliente.id_cliente == info.cvr_id_cliente)
				info.nom_cliente = cliente.cliente; 
		});

		servicios.forEach(function(servicio){
			if(servicio.id_servicio == info.cvr_id_servicio)
				info.nom_servicio = servicio.servicio;
		});
		format.push(info);
	});
	return format;
}

function formatIncidenciasAdherencia(datos){
	var lista = [];
	_.forEach(datos['bitacora'],function(bit, key){
		var data = {
			id_ejecutivo: bit.usu_id_operadora,
			id_bitacora : bit.bop_id,
			ejecutivo : bit.usuario_codigo,
			id_incidencia: bit.inc_id,
			incidencia : bit.inc_nom_incidencia,
			observacion : bit.bop_observacion,
			ingreso: bit.ingreso,
			desde: null,
			hasta: null,
			aprobado : null,
			revision : null,
			responsable : null
		}

		_.forEach(datos['val_min'], function(val_min, key_vmn){
			if(data.id_bitacora == val_min.bop_id_bitacora_operadora){
				data.desde = moment(val_min.hov_fecha).format('DD/MM/YYYY');
				data.desde +=' '+val_min.hov_inicio;
				data.segundos = val_min.hov_segundos;
				data.aprobado = val_min.hov_aprobado;
				data.id_ejecutivo_vici = val_min.user_id;
				data.revision = val_min.fecha;
				data.responsable = val_min.supervisor;
			}
		});

		_.forEach(datos['val_max'], function(val_max, key_vmx){
			if(data.id_bitacora == val_max.bop_id_bitacora_operadora)
			{
				data.hasta = moment(val_max.hov_fecha).format('DD/MM/YYYY');
				data.hasta += ' '+val_max.hov_termino;
				data.aprobado = val_max.hov_aprobado;
			}
		});

		_.forEach(datos['exc_min'], function(exc_min, key_emn){
			if(data.id_bitacora == exc_min.bop_id_bitacora_operadora){
				if(exc_min.tho_id == 4){
					data.rec_desde = moment(exc_min.hop_fecha).format('DD/MM/YYYY');
					data.rec_desde +=' '+exc_min.hop_inicio;
				}else{
					data.desde = moment(exc_min.hop_fecha).format('DD/MM/YYYY');
					if(exc_min.hop_inicio != '00:00:00')
						data.desde +=' '+exc_min.hop_inicio;
					data.aprobado = exc_min.hop_aprobado;
					data.revision = exc_min.fecha;
					data.responsable = exc_min.supervisor;
				}
			}
		});

		_.forEach(datos['exc_max'], function(exc_max, key_emx){
			if(data.id_bitacora == exc_max.bop_id_bitacora_operadora){
				if(exc_max.tho_id == 4){
					data.rec_hasta = moment(exc_max.hop_fecha).format('DD/MM/YYYY');
					data.rec_hasta += ' '+exc_max.hop_termino;
				}else{
					data.hasta = moment(exc_max.hop_fecha).format('DD/MM/YYYY');
					if(exc_max.hop_termino != '23:59:59')
						data.hasta += ' '+exc_max.hop_termino;
					data.aprobado = exc_max.hop_aprobado;
				}
			}
		});
		lista.push(data);
	});

	return lista;
}

function formatoInsertHorariolReal(ejecutivos, datos){
	var query = '';
	var on = true;
	var fecha = datos['fecha'].split(' ');
	fecha_rev = fecha[0].split("/").reverse().join("-");
	fecha[0] = fecha[0].split("/").join("-");
	_.forEach(ejecutivos, function(ejecutivo,key){
		if(on){
			query = "INSERT INTO viboxpanel2.med_media_diaria (id_campana, nombre_campana, id_cliente, segundos, efectivos, contactos, operador,\
				horas, fecha, media, noContacto, contrato, fecha_llamado, horas_llamado, id_usuario) VALUES ";
			on = false;
		}else{
			query += ' , ';
		}
		query += "(1, '"+datos['excepcion']+"', 0, "+datos['segundos']+", 0, 0, '"+ejecutivo.usuario_codigo+"', '"+fecha[1]+"',\
		'"+fecha[0]+"', 0, 0, 1, '"+fecha_rev+"', '"+datos['horas']+"', "+ejecutivo.id_usuario+") ";
	});
	return query;

}

function implodeEjecutivos(ejec){
	console.log(ejec);
	var ret = "";
	for (var i = 0, len = ejec.length; i < len; i++) {
		if(i == 0){
			ret += ""+ejec[i]+"";
		}else{
			ret += ","+ejec[i]+"";
		}
	}
	return ret;
}

function formartIncidenciaBitacora(ejecutivos, datos){
	var insert_bitacora = '';
	var flag = true;
	_.forEach(ejecutivos, function(ej, key){
		if(flag){
			insert_bitacora += "INSERT INTO viboxpanel2.bop_bitacora_operadora (usu_id_operadora, bop_fecha_ingreso, bop_fecha_incidencia,\
				bop_observacion,usu_id_usuario_ingreso, inc_id, tgo_id, tgs_id) VALUES ";
			flag = false;
		}else
			insert_bitacora += ",";
		insert_bitacora += "("+ej+", now(),'"+datos['fecha_inicio']+"','"+datos['obs']+"',"+datos['usuario_creacion']+","+datos['tipo']+",0,0)";
	});

	return insert_bitacora;
}

function calculaValidacionTurnoCompleto(real, ideal, incidencia, user, excepcion,hora_inicio, hora_fin){
	var valida = {aplica : false, tiempo_faltante: 0};
	var inicio = formatHoraATiempo(hora_inicio);
	var fin = formatHoraATiempo(hora_fin);
	var excep = 0;
	excep = buscarExcepcion(user, excepcion);
	/*Excepciones horarias sin valiacion
	*5 = Vacaciones
	*6 = Licencia
	*/
	console.log("Excepcion horaria", excep);
	if(excep != 5 && excep != 6){
		if((parseInt(ideal)-parseInt(incidencia)) <= real){
			valida.tiempo_faltante = parseInt(ideal)-parseInt(real);
			valida.aplica = true;
			/*Permisos - Validacion de tiempo en bloques
			*2
			*3
			*7 
			*/
			if(excep == 2 || excep == 3 || excep == 7){
			console.log("Permiso");
				tiempo_nt = buscarExcepcionTiempoPermiso(user, excepcion,inicio, fin);
				console.log("Tiempo permiso",tiempo_nt);
				valida.tiempo_faltante = valida.tiempo_faltante - tiempo_nt;
			}
			if(valida.tiempo_faltante <= 0){
				valida.aplica=false;
			}
		}
	}
	console.log(valida);
	return valida;
}

function formatTiemposValidacionCompleta(ideal, real, real_vib){
	var tiempo = [];

	_.forEach(ideal, function(idl, key_idl){
		var data = {
			id_user : idl.user_id,
			user : idl.user,
			ideal : idl.total_ideal,
			real : 0
		};

		_.forEach(real, function(rl, key_rl){
			if(rl.user_id == data.id_user){
				data.real += rl.second_adhe;
			}
		});

		_.forEach(real_vib, function(rl_v, key_rl){
			if(rl_v.operador == data.user){
				data.real += rl_v.real_segundos;
			}
		});

		tiempo.push(data);
	})

	return tiempo;
}

function formatoTiempoValidacionTecnica(turno, ideal_turno, real,real_vib){
	var tiempo = [];

	_.forEach(turno, function(turn, key_idl){
		var data = {
			id_user : turn.user_id,
			ideal_inc : turn.tiempo_inc,
			user : turn.user,
			msje: turn.msje,
			ideal: 0,
			real : 0
		};

		_.forEach(ideal_turno, function(idl_t, key_rl){
			if(idl_t.user_id == data.id_user){
				data.ideal = idl_t.total_ideal;
				data.user = idl_t.user;
			}
		});

		_.forEach(real, function(rl, key_rl){
			if(rl.user_id == data.id_user){
				data.real += rl.second_adhe;
			}
		});

		_.forEach(real_vib, function(rl_v, key_rl){
			if(rl_v.operador == data.user){
				data.real += rl_v.real_segundos;
			}
		});

		tiempo.push(data);
	})

	return tiempo;
}

function listEjecutiva(turno){
	var flag = true;
	var ejecutivo = [];
	var op='';
	_.forEach(turno,function(value, key){
		ejecutivo.push(value.vicu_user_id);
	});
	return ejecutivo;
}

function validarTurno(ejecutivos,turno,hora_inicio,hora_fin,excepcion){
	var list = [];
	var inicio = formatHoraATiempo(hora_inicio);
	var fin = formatHoraATiempo(hora_fin);
	_.forEach(ejecutivos, function(ej, key){
		var data = {
			user_id : ej,
			tiempo_inc : 0,
			msje: ''
		};
		_.forEach(turno, function(tur, key_tur){
			if(data.user_id == tur.vicu_user_id){
				var tur_inicio = formatHoraATiempo(tur.hop_inicio);
				var tur_fin = formatHoraATiempo(tur.hop_termino);
				excep = buscarExcepcion(data.user_id, excepcion);
				/*Excepciones horarias sin valiacion
				*5 = Vacaciones
				*6 = Licencia
				*/
				if(excep != 5 && excep != 6){
					if(inicio.between(tur_inicio,tur_fin,true) && fin.between(tur_inicio,tur_fin,true)){
						data.msje += "IT"
						data.tiempo_inc += fin-inicio;
					}else if(inicio.between(tur_inicio,tur_fin,true) &&  fin.between(tur_inicio,tur_fin,false)){
						data.msje += "II"
						data.tiempo_inc += tur_fin-inicio;
					}else if(inicio.between(tur_inicio,tur_fin,false) &&  fin.between(tur_inicio,tur_fin,true)){
						data.msje += "IF"
						data.tiempo_inc += fin-tur_inicio;
					}else if(tur_inicio.between(inicio, fin, true) && tur_fin.between(inicio, fin, true)){
						data.msje += "IC"
						data.tiempo_inc += tur_fin-tur_inicio;
					}
				}
				/*Permisos - Validacion de tiempo en bloques
				*2
				*3
				*7
				*/
				if(excep == 2 || excep == 3 || excep == 7){
					tiempo_nt = buscarExcepcionTiempoPermiso(data.user_id, excepcion,inicio, fin);
					console.log("Tiempo permiso",tiempo_nt);
					data.tiempo_inc = data.tiempo_inc - tiempo_nt;
				}
			}
		});
		list.push(data);
	});
	return list;
}

function buscarExcepcion(user, excepcion){
	var id_exp = 0;
	_.forEach(excepcion, function(exep, key){
		if(exep.vicu_user_id==user)
			id_exp = exep.tho_id;
	});
	return id_exp;
};

function buscarExcepcionTiempoPermiso(user, excepcion,inicio, fin){
	var tiempo = 0;
	_.forEach(excepcion, function(tur, key){
		if(tur.vicu_user_id==user)
		{
			var tur_inicio = formatHoraATiempo(tur.hop_inicio);
			var tur_fin = formatHoraATiempo(tur.hop_termino);
			if(inicio.between(tur_inicio,tur_fin,true) && fin.between(tur_inicio,tur_fin,true)){
				tiempo += fin-inicio;
			}else if(inicio.between(tur_inicio,tur_fin,true) &&  fin.between(tur_inicio,tur_fin,false)){
				tiempo += tur_fin-inicio;
			}else if(inicio.between(tur_inicio,tur_fin,false) &&  fin.between(tur_inicio,tur_fin,true)){
				tiempo += fin-tur_inicio;
			}else if(tur_inicio.between(inicio, fin, true) && tur_fin.between(inicio, fin, true)){
				tiempo += tur_fin-tur_inicio;
			}
		}
	});
	return tiempo;
};


function formatHoraATiempo(hora){
	var sep = hora.split(":");
	sep[0] = sep[0]*60*60;
	sep[1] = sep[1]*60;

	var tiempo = parseInt(sep[0]+sep[1]);

	return tiempo;
}

Number.prototype.between = function(a, b, inclusive) {
  var min = Math.min(a, b),
    max = Math.max(a, b);

  return inclusive ? this >= min && this <= max : this > min && this < max;
}

function implodeEjecutivosActivo(ejec){
	var ret = "";
	for (var i = 0, len = ejec.length; i < len; i++) {
		if(i == 0){
			ret += "'"+ejec[i].us_sup_user+"'";
		}else{
			ret += ",'"+ejec[i].us_sup_user+"'";
		}
	}
	return ret;
}

function formatInsertModuloPerfil(modulos, perfil, id_user){
	var flag = true;
	var insert = '';
	_.forEach(modulos, function(mod, key){
		if(flag){
			insert = "INSERT INTO hermes.perfil_modulo (mos_id_modulo_sio_calling, per_id_perfil, pem_fecha_actualizacion, user_id) VALUES ";
			flag = false;
		}else
			insert += ", ";
		insert += " ("+mod.mos_id_modulo_sio_calling+", "+perfil+", now(), "+id_user+")";
	});
	return insert;
}

function implodeBit(bitacoras){
	var bit = "";
	_.forEach(bitacoras, function(bita, key){
		if(bit!="") bit+=",";
		bit += bita.bop_id;
	});

	return bit;
}

function formatInsertCampanaEjecutivo(user,campanas, in_user){
	var insert = "INSERT INTO hermes.campana_capacitacion_ejecutiva(vicuser_id,campaing_id,cce_usuario_ingreso,cce_fecha_ingreso) VALUES ";
	var data = "";
	_.forEach(campanas, function(cam, id){
		if(data!="") data +=",";
		data += "("+user+", '"+cam+"', "+in_user+", now())";
	});
	if(data!="") insert += data;

	return insert;
}

function formatoCampanasEjecutivo(campanas){
	var data = [];
	_.forEach(campanas, function(cam, id){
		data.push(cam.campaign_id);
	});

	return data;
}

function insertHijosOperador(id_user, lista){
	var insert = '';
	_.forEach(lista, function(lis, key){
		insert +=(insert!='')?',':'INSERT INTO hermes.usuario_hijo(user_id, ushi_fecha_nacimiento) VALUES';
		insert+="("+id_user+",'"+lis.ushi_fecha_nacimiento.split("/").reverse().join("-")+"')";
	});
	var update = "UPDATE hermes.usuario_hijo SET ushi_estado=0 WHERE user_id="+id_user;
	return {insert:insert, update:update};
}

function duration(f1, f2) {
	var numMeses = null
	
	if(f1!=null && f2!=null){
		aF1 = f1.split("-");
	  	aF2 = f2.split("-");
	  	numMeses = parseInt(aF2[0]*12) + parseInt(aF2[1]) - (parseInt(aF1[0]*12) + parseInt(aF1[1]));
		if (aF2[2]<aF1[2]){
			numMeses = numMeses - 1;
		}		
	}
	
	return numMeses;
}

function dayssInmonths(date){
	date = new Date(date);
	return 32 - new Date(date.getFullYear(), date.getMonth(), 32).getDate();
}

function formatoEjecutivas(listado, tipos){
	var lista  = [];
	_.forEach(listado, function(lis, key){
		var fecha_actual = moment().format('YYYY-MM-DD');
		var value = {};
		value = lis;
		value.antiguedad = duration(lis.ingreso,fecha_actual);
		value.tipo_ejecutiva = null;
		if(value.antiguedad!=null)
			value.tipo_ejecutiva = buscarTipo(value.antiguedad,tipos);
		lista.push(value);
	});
	return lista;
}

function buscarTipo(antiguedad, tipos){
	var value = '';
	_.forEach(tipos, function(tip, key){
		if(antiguedad>=tip.tiej_antiguedad_valor)
			value = tip.tiej_nombre;
	});
	return value;
}

exports.addDateWeekData = addDateWeekData;
exports.getSqlUsuarioDetalle = getSqlUsuarioDetalle;
exports.getQueryInsertHorarioSemana = getQueryInsertHorarioSemana;
exports.sumaFecha = sumaFecha;
exports.ultimoDiaMesFecha = ultimoDiaMesFecha;
exports.arrFormatHorario = arrFormatHorario;
exports.strInsertCamposUpdate = strInsertCamposUpdate;
exports.arrListCamposDomo = arrListCamposDomo;
exports.getSqlInsertMeta = getSqlInsertMeta;
exports.formatHorasOperador = formatHorasOperador;
exports.getDataClienteServicio = getDataClienteServicio;
exports.getInsertMetaDiaria = getInsertMetaDiaria;
exports.formatValorEfectivo = formatValorEfectivo;
exports.formatIncidenciasAdherencia = formatIncidenciasAdherencia;
exports.formatoInsertHorariolReal = formatoInsertHorariolReal;
exports.implodeEjecutivos = implodeEjecutivos;
exports.calculaValidacionTurnoCompleto = calculaValidacionTurnoCompleto;
exports.formatTiemposValidacionCompleta = formatTiemposValidacionCompleta;
exports.formatoTiempoValidacionTecnica = formatoTiempoValidacionTecnica;
exports.listEjecutiva = listEjecutiva;
exports.validarTurno = validarTurno;
exports.implodeEjecutivosActivo = implodeEjecutivosActivo;
exports.formatInsertModuloPerfil = formatInsertModuloPerfil;
exports.implodeBit = implodeBit;
exports.formatInsertCampanaEjecutivo = formatInsertCampanaEjecutivo;
exports.formatoCampanasEjecutivo = formatoCampanasEjecutivo;
exports.insertHijosOperador = insertHijosOperador;
exports.formatoEjecutivas = formatoEjecutivas;