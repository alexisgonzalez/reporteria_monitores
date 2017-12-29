/**
	se formatea datos de calidad en el siguiente formato para ser mas facilmente leido en la vista
**/
_ = require("lodash");
moment = require('moment');
function formatArrCalidad(dataCalidad){
	var arrRetorno = {};
	var arrRetornoCuartil = [];
	var op = "";
	for(var i=0;i<dataCalidad[0].length;i++){
		op = dataCalidad[0][i].res_operador;
		arrRetorno[op]= Math.round(dataCalidad[0][i].promedio);
		arrRetornoCuartil.push(dataCalidad[0][i].promedio);
	}
	return [arrRetorno,arrRetornoCuartil];
}

function formatArrActitudes(dataActitudes){
	var arrRetorno = {};
	var op = "";
	for(var i=0;i<dataActitudes[0].length;i++){
		op = dataActitudes[0][i].resact_operador;
		arrRetorno[op]= {'q_actitud':dataActitudes[0][i].q_actitud,'q_falsificacion':dataActitudes[0][i].q_falsificacion,
							'q_error_critico':dataActitudes[0][i].q_error_critico,'q_evaluaciones':dataActitudes[0][i].q_evaluaciones};
	}
	return arrRetorno;
}

function formatCriticidadesOperador(operadores, criticos){
	var criticidades = [];
	operadores.forEach(function (operador) {
		var flag=true;
		var data = {};
		var op=operador.us_sup_user;
		criticos.forEach(function (critico) {
			if(op==critico.reev_operador){
			console.log(critico);
				data = {
					"operador":op,
					"cantidad":critico.cantidad,
					"fecha":critico.reev_fecha_evaluacion
				}
				flag = false;
			}
		});
		if(flag){
			data = {
				"operador":op,
				"cantidad":'',
				"fecha":''
			}
		}
		criticidades.push(data);
	});
	return criticidades;
}

function formatNotasOperador(operadores, promedios){
	var notas = [];
	operadores.forEach(function (operador) {
		var flag=true;
		var data = {};
		var op=operador.us_sup_user;
		promedios.forEach(function (promedio) {
			if(op==promedio.opno_operador){
				data = {
					"operador":op,
					"promedio":promedio.promedio,
					"cantidad":promedio.cantidad,
					"fecha":promedio.opno_fecha_evaluacion
				}
				flag = false;
			}
		});
		if(flag){
			data = {
				"operador":op,
				"promedio":null,
				"cantidad":null,
				"fecha":null
			}
		}
		notas.push(data);
	});
	_.orderBy(notas, ['operador'], ['asc']);
	console.log(notas)
	return notas;
}
function formatMonitorJSON(data){
	var formatMonitor = [];
	_.forEach(data["operadores"],function(separacion,key){
		var contenido = [];
		_.forEach(separacion,function(operador,key){
			var body = {operador:operador.us_sup_user,flag_27_mail:false,flag_27_llamada:false,flag_27_presencial:false};
			_.forEach(data["promedio"],function(promedio,key_prom){
				if(promedio.operador == body.operador)
				{	
					body.promedio = promedio.promedio;
					body.cantidad_eval = promedio.cantidad;
				}
			})
			_.forEach(data["criticidades"],function(criticidad,key_prom){
				if(criticidad.operador == body.operador)
					body.criticidad = criticidad.cantidad;
			})
			_.forEach(data["bitacora"],function(bitacora,key_prom){
				/*
					tgo_id:

					1	Llamada telefonica
					2	E-Mail
					3	Chat
					5	Sin gestión
					4	Presencial en oficina
					7	Videollamada
				*/
				if(bitacora.usuario_codigo == body.operador){
					if(bitacora.inc_id == 27){
						if(bitacora.tgo_id == 2)
							body.flag_27_mail = true;
						if(bitacora.tgo_id == 1)
							body.flag_27_llamada = true;
						if(bitacora.tgo_id == 4)
							body.flag_27_presencial = true;
						if(bitacora.tgo_id == 5)
							body.flag_27_sin_gestion = true;
						if(bitacora.tgo_id == 3)
							body.flag_27_chat = true;
						if(bitacora.tgo_id == 7)
							body.flag_27_videollamada = true;

						body.inc_id_27 = bitacora.inc_id;
					}
					if(bitacora.inc_id == 19){
						if(bitacora.tgo_id == 2)
							body.flag_19_mail = true;
						if(bitacora.tgo_id == 1)
							body.flag_19_llamada = true;
						if(bitacora.tgo_id == 4)
							body.flag_19_presencial = true;
						if(bitacora.tgo_id == 5)
							body.flag_19_sin_gestion = true;
						if(bitacora.tgo_id == 3)
							body.flag_19_chat = true;
						if(bitacora.tgo_id == 7)
							body.flag_19_videollamada = true;

						body.inc_id_19 = bitacora.inc_id;
					}
					if(bitacora.inc_id == 30){
						if(bitacora.tgo_id == 2)
							body.flag_30_mail = true;
						if(bitacora.tgo_id == 1)
							body.flag_30_llamada = true;
						if(bitacora.tgo_id == 4)
							body.flag_30_presencial = true;
						if(bitacora.tgo_id == 5)
							body.flag_30_sin_gestion = true;
						if(bitacora.tgo_id == 3)
							body.flag_30_chat = true;
						if(bitacora.tgo_id == 7)
							body.flag_30_videollamada = true;

						body.inc_id_30 = bitacora.inc_id;
					}
				}
			})
			contenido.push(body)
		})
		formatMonitor.push(contenido);
	})
	return formatMonitor;
}
function formatTotalesJSON(data, fecha){
	var informacion=[];
	var	c=0;
	var cantidad_eval=0;
	var prom=0;
	var criticidad=0;
	_.forEach(data["promedio"],function(promedio,key_prom){
		if(promedio.promedio!='' && promedio.promedio!=null)
		{	
			cantidad_eval+=promedio.cantidad;
			prom+=promedio.promedio;
			c++;
		}
	})
	_.forEach(data["criticidades"],function(critico,key_prom){
		if(critico.cantidad!='')
		{
			criticidad+=critico.cantidad;
		}
	})

	if(c!=0){
		prom=prom/c;
	}

	data={
		"fecha": fecha,
		"promedio_total":prom.toFixed(1),
		"cant_op" : c,
		"cantidad_eval":cantidad_eval,
		"criticidad":criticidad
	}

	informacion.push(data);

	return informacion;
}

function formatRetroalimentacion(info){
	var contenido = {};
	_.forEach(info['ejecutivos'],function(ejecutivo, key_ejec){
		var operador = ejecutivo.us_sup_user;
		var op = {};
		_.forEach(info['fechas'],function(fecha, key_fecha){
			var fecha_ev = moment(fecha.opno_fecha_evaluacion).format('DD-MM-YYYY');
			var data = {};
			data.operador = operador;
			data.fecha_ev = fecha_ev;
			_.forEach(info['promedios'], function(promedio, key_prom){	
				if(promedio.opno_operador == data.operador && moment(promedio.opno_fecha_evaluacion).format('DD-MM-YYYY') == data.fecha_ev)
				{	
					data.promedio = promedio.promedio;
					data.cantidad_eval = promedio.cantidad;
				}
			});
			_.forEach(info['criticidades'], function(criticidad, key_cri){
				if(criticidad.reev_operador == data.operador && moment(criticidad.reev_fecha_evaluacion).format('DD-MM-YYYY') == data.fecha_ev)
				{	
					data.criticidad = criticidad.cantidad;
				}
			});
			_.forEach(info['bitacora'], function(bit, key_bit){
				if(bit.usuario_codigo == data.operador && moment(bit.fecha,"DD/MM/YYYY").format('DD-MM-YYYY') == data.fecha_ev){
					if(bit.inc_id == 27){
						if(bit.tgo_id == 2)
							data.flag_27_mail = true;
						if(bit.tgo_id == 1)
							data.flag_27_llamada = true;
						if(bit.tgo_id == 4)
							data.flag_27_presencial = true;
						if(bit.tgo_id == 5)
							data.flag_27_sin_gestion = true;
						if(bit.tgo_id == 3)
							data.flag_27_chat = true;
						if(bit.tgo_id == 7)
							data.flag_27_videollamada = true;

						data.inc_id_27 = bit.inc_id;
					}
					if(bit.inc_id == 19){
						if(bit.tgo_id == 2)
							data.flag_19_mail = true;
						if(bit.tgo_id == 1)
							data.flag_19_llamada = true;
						if(bit.tgo_id == 4)
							data.flag_19_presencial = true;
						if(bit.tgo_id == 5)
							data.flag_19_sin_gestion = true;
						if(bit.tgo_id == 3)
							data.flag_19_chat = true;
						if(bit.tgo_id == 7)
							data.flag_19_videollamada = true;

						data.inc_id_19 = bit.inc_id;
					}
					if(bit.inc_id == 30){
						if(bit.tgo_id == 2)
							data.flag_30_mail = true;
						if(bit.tgo_id == 1)
							data.flag_30_llamada = true;
						if(bit.tgo_id == 4)
							data.flag_30_presencial = true;
						if(bit.tgo_id == 5)
							data.flag_30_sin_gestion = true;
						if(bit.tgo_id == 3)
							data.flag_30_chat = true;
						if(bit.tgo_id == 7)
							data.flag_30_videollamada = true;

						data.inc_id_30 = bit.inc_id;
					}
				}
			});
			op[fecha_ev] = data;
		});
		contenido[operador] = op;
	});
	return contenido;
}

function convertFechaRetro(fechas){
	var arr_fecha = [];
	_.forEach(fechas, function(fecha, key){
		var fecha_format = {fecha:moment(fecha.opno_fecha_evaluacion).format('DD-MM-YYYY')};
		arr_fecha.push(fecha_format);
	});

	return arr_fecha;
}

exports.formatArrCalidad   = formatArrCalidad;
exports.formatArrActitudes = formatArrActitudes;
exports.formatCriticidadesOperador = formatCriticidadesOperador;
exports.formatNotasOperador = formatNotasOperador;
exports.formatMonitorJSON = formatMonitorJSON;
exports.formatTotalesJSON = formatTotalesJSON;
exports.formatRetroalimentacion = formatRetroalimentacion;
exports.convertFechaRetro = convertFechaRetro;