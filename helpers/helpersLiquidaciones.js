var _ = require('lodash');

function arrFormatLiquidaciones(data,fechas){
	var arrLiquidaciones = {};
	for(operador in data){ // SE RECORREN LAS OPERADORAS
		console.log(data[operador]);
	}
}

function formatRetorno(dataGlobalesHorario,horarios,produccion,calidad,tramos,prod_vibox,arrTipoHorarioUser,semanaCorrida,arrDetalle,arrAplicaSemanaCorridaUser){
	var arrRetorno = [];
	var userHorario = {};

	_.forEach(dataGlobalesHorario,function(horario,op){
		var interior = {operador:op,hh_real:horario.formatAdhe,hh_contrato:horario.formatIdeal,hh_ideal:horario.formatIdealExce};
		if(horario.totalIdeal <= horario.totalAdhe)
			userHorario[op] = horario.totalIdeal;
		if(horario.totalAdhe <= horario.totalIdeal)
			userHorario[op] = horario.totalAdhe;
		arrRetorno.push(interior);
	})

	_.forEach(arrRetorno,function(data,key){
		var operador = data.operador;
		var acum_horas_ausentes = 0;
		var acum_dias_ausentes = 0;
		var acum_diferencias = 0;
		_.forEach(horarios[operador],function(datos,dia){
			if(datos.flag_excepciones == 6){
				//acum_diferencias+=datos.ideal.toSeconds();
				acum_dias_ausentes++;
			}else{
				if(datos.diferencia_sin_format < 0)
					acum_diferencias += Math.abs(datos.diferencia_sin_format);
			}
		});
		arrRetorno[key].fecha_ingreso = arrDetalle[operador];
		arrRetorno[key].diferencias = acum_diferencias.toHHMMSS();
		arrRetorno[key].horas_ausente = acum_diferencias.toHHMMSS();
		arrRetorno[key].dias_ausente = acum_dias_ausentes;
	});

	arrRetorno = formatProduccionRetorno(arrRetorno,produccion,prod_vibox);

	arrRetorno = formatCalidadPorTramos(arrRetorno,calidad,tramos,arrTipoHorarioUser,userHorario);

	arrRetorno = addSemanaCorrida(arrRetorno,semanaCorrida,arrAplicaSemanaCorridaUser);

	return arrRetorno;
}

function formatProduccionRetorno(arrRetorno,produccion,prod_vibox){
	_.forEach(arrRetorno,function(data,key){
		var operador = data.operador;
		var acum_produccion = 0;
		arrRetorno[key].produccion = 0;
		_.forEach(produccion,function(prod,key_prod){
			if(operador == prod.mpr_user){
				arrRetorno[key].produccion += prod.produccion;
			}
		});
		if(typeof(prod_vibox[operador]) != "undefined"){
			arrRetorno[key].produccion += prod_vibox[operador].acum_produccion;
		}
	});
	return arrRetorno;
}

function formatCalidadPorTramos(arrRetorno,calidad,tramos,arrTipoHorarioUser,hhUser){
	_.forEach(arrRetorno,function(data,key){
		var operador = data.operador;
		arrRetorno[key].cant_calidad = 'Sin evaluacion';
		_.forEach(calidad,function(cali,key_calidad){
			if(cali.operador == operador){
				var prom = cali.promedio;
				arrRetorno[key].porc_calidad = prom.toFixed(2);
				arrRetorno[key].cant_calidad = cali.cantidad_evaluaciones;
				_.forEach(tramos,function(tramo,key_tramos){
					if(prom >= tramo.trc_tramo){
						var horas = parseFloat(hhUser[operador]/3600)
						if(horas > 180)
							horas = 180;
						var bono = Math.round((tramo.trc_bono/180)*horas);
						//arrRetorno[key].calidad = parseInt(bono*(prom/100));
						arrRetorno[key].calidad = parseInt(bono);
						return false;
					}
				});
				return false;
			}
		});
	});
	return arrRetorno;
}

function addSemanaCorrida(arrRetorno,semanaCorrida, aplica){
	_.forEach(arrRetorno,function(data,key){
		var operador = data.operador;
		arrRetorno[key].semana_corrida = (aplica[operador]) ? semanaCorrida[operador] : null;
	});

	return arrRetorno;
}


String.prototype.toSeconds = function () { 
	if (!this) 
		return null; 
	var hms = this.split(':'); 
	return (+hms[0]) * 60 * 60 + (+hms[1]) * 60 + (+hms[2] || 0); 
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

function getProduccionCalculadaVibox(dataProdVibox,dataValores){
	var arrProdVibox = {};

	_.forEach(dataProdVibox,function(prod,key){
		if(typeof(arrProdVibox[prod.operador]) == "undefined")
			arrProdVibox[prod.operador] = {acum_produccion:0};
		_.forEach(dataValores,function(valor,key_valores){
			if(prod.id_cliente == valor.cvr_id_cliente && prod.id_servicio == valor.cvr_id_servicio){
				arrProdVibox[prod.operador].acum_produccion += prod.efectivos*valor.cvr_valorRegistro;
			}
		})
	});
	console.log(arrProdVibox);
	return arrProdVibox;
}

function formatArrProducciones(dataProduccion,flag_horas){
	var arrFormat = {};
	var llave = "";
	_.forEach(dataProduccion,function(data,key){
		llave = (flag_horas) ? data.mpr_hour:data.mpr_date;
		if(typeof(arrFormat[data.mpr_user]) == "undefined")
			arrFormat[data.mpr_user] = {};
		if(typeof(arrFormat[data.mpr_user][llave]) == "undefined")
			arrFormat[data.mpr_user][llave] = {};

		arrFormat[data.mpr_user][llave] = data;
	});
	return arrFormat;
}

function formatProduccionesIndicador(dataProduccion,flag_horas){
	var indice = 0;
	var llave_ant = "";
	var arrRet = [];
	var key = "";
	_.forEach(dataProduccion,function(data,operador){
		indice = 0;
		llave_ant = "";
		_.forEach(data,function(datos,fecha){
			key = (flag_horas) ? datos.mpr_hour:datos.mpr_date;
			if(indice > 0){
				if(dataProduccion[operador][llave_ant].media < datos.media)
					dataProduccion[operador][key].indicador = 'subio';
				if(dataProduccion[operador][llave_ant].media > datos.media)
					dataProduccion[operador][key].indicador = 'bajo';
				if(dataProduccion[operador][llave_ant].media == datos.media)
					dataProduccion[operador][key].indicador = 'mantuvo';

				llave_ant = (flag_horas) ? datos.mpr_hour:datos.mpr_date;
			}else{
				llave_ant = (flag_horas) ? datos.mpr_hour:datos.mpr_date;
			}
			indice ++;
		});
	});
	return dataProduccion;
}

function formatArrBitacoras(dataBitacoras,flag_horas){
	var arrRetorno = {};
	var key = "";
	_.forEach(dataBitacoras,function(data,key){
		if(typeof(arrRetorno[data.usuario_codigo]) == "undefined")
			arrRetorno[data.usuario_codigo] = {};
		key = (flag_horas) ? data.hora:data.fecha;
		if(!flag_horas){
			if(typeof(arrRetorno[data.usuario_codigo][key]) == "undefined")
				arrRetorno[data.usuario_codigo][key] = [];
			arrRetorno[data.usuario_codigo][key].push(data);
		}else{
			arrRetorno[data.usuario_codigo][key] = data;
		}
	});
	return arrRetorno;
}

function formatGlobalesProduccion(data,brechas){
	var arrGlobales = {};
	var acum_tiempo = 0;
	var acum_efectivos = 0;
	var maxMedia = 0;
	_.forEach(data,function(value,operador){
		acum_tiempo = 0;
		acum_efectivos = 0;
		arrGlobales[operador] = {};
		_.forEach(value,function(datos,key){
			acum_efectivos += datos.efectivos;
			acum_tiempo += datos.tiempos;
			arrGlobales[operador].media = (acum_efectivos/(acum_tiempo/3600)).toFixed(2);
		});
		if(maxMedia == 0){
			console.log(operador,arrGlobales[operador].media);
			maxMedia = arrGlobales[operador].media;
		}else{
			if(maxMedia < arrGlobales[operador].media){
				console.log(operador,arrGlobales[operador].media);
				maxMedia = arrGlobales[operador].media;
			}
		}
	});
	console.log("maxMedia",maxMedia);
	_.forEach(arrGlobales,function(datos,operador){
		var indice = 0;
		_.forEach(brechas,function(brecha,llave){
			if(indice == 0){
				if(maxMedia >= datos.media && maxMedia-brecha.bre_brecha <= datos.media){
					arrGlobales[operador].color = brecha.bre_color;
				}
			}else{
				if(maxMedia-brechas[indice-1].bre_brecha >= datos.media && maxMedia-brecha.bre_brecha <= datos.media){
					arrGlobales[operador].color = brecha.bre_color;
				}
			}
			indice++;
		});
	});
	return arrGlobales;
}

function formatGlobalesProduccionTotal(data){
	var arrGlobales = {};
	var acum_tiempo = 0;
	var acum_efectivos = 0;
	_.forEach(data,function(value,operador){
		_.forEach(value,function(datos,key){
			acum_efectivos += datos.efectivos;
			acum_tiempo += datos.tiempos;
		})
	});
	arrGlobales.media = (acum_efectivos/(acum_tiempo/3600)).toFixed(2);

	return arrGlobales;
}

function formatGlobalesProduccionColumnas(data,columnas,flag_horas){
	var arrGlobales = {};
	var acum_tiempo = 0;
	var acum_efectivos = 0;
	_.forEach(columnas,function(value,key){
		var llave = (flag_horas) ? value.mpr_hour:value.mpr_date;
		var acum_tiempo = 0;
		var acum_efectivos = 0;
		arrGlobales[llave] = {};
		_.forEach(data,function(datos,operador){
			if(typeof(datos[llave]) != "undefined"){
				acum_efectivos += datos[llave].efectivos;
				acum_tiempo += datos[llave].tiempos;
			}
		});
		arrGlobales[llave].media = (acum_efectivos/(acum_tiempo/3600)).toFixed(2);
	});

	return arrGlobales;
}

function formatMaximosColumnas(data,columnas,flag_horas){
	var maxMediaColumna = {};
	_.forEach(columnas,function(value,key){
		var llave = (flag_horas) ? value.mpr_hour:value.mpr_date;
		_.forEach(data,function(datos,operador){
			if(typeof(datos[llave]) != "undefined"){
				if(typeof(maxMediaColumna[llave]) == "undefined"){
					maxMediaColumna[llave] = {};
					maxMediaColumna[llave].media = datos[llave].media
				}
				if(typeof(maxMediaColumna[llave]) != "undefined" && maxMediaColumna[llave].media < datos[llave].media){
					maxMediaColumna[llave].media = datos[llave].media
				} 
			}
		});
	});

	return maxMediaColumna;
}

function asignarBrechas(data,brechas,maxMediaColumna){
	console.log(maxMediaColumna);
	_.forEach(data,function(value,operador){
		_.forEach(value,function(indicador,key){
			var indice = 0;
			_.forEach(brechas,function(brecha,llave){
				if(indice == 0){
					if(maxMediaColumna[key].media >= indicador.media && maxMediaColumna[key].media-brecha.bre_brecha <= indicador.media){
						data[operador][key].color = brecha.bre_color;
					}
				}else{
					if(maxMediaColumna[key].media-brechas[indice-1].bre_brecha >= indicador.media && maxMediaColumna[key].media-brecha.bre_brecha <= indicador.media){
						data[operador][key].color = brecha.bre_color;
					}
				}
				indice++;
			});
		});
	});
	return data;
}

function formatArrHorarioTipoUsuario(data){
	var arrTipoHorarioUsuario = {};
	_.forEach(data,function(tipoHorario,key){
		arrTipoHorarioUsuario[tipoHorario.user] = tipoHorario.contrato_horas;
	});

	return arrTipoHorarioUsuario;
}

function formatSemanaCorrida(data,pais){
	var arrSemana = {};
	_.forEach(data,function(semana,key){
		if(pais.nombre_pais == "Chile"){
			arrSemana[semana.user] = semana.valor;
		}else{
			arrSemana[semana.user] = 0;
		}
	});

	return arrSemana;
}

function formatDetalleUsuario(data){
	var arrDetalle = {}
	_.forEach(data,function(detalle,key){
		arrDetalle[detalle.user] = detalle.usde_fec_ingreso;
	});

	return arrDetalle;
}

function formatMetas(data){
	var format = {dataMedia:[],dataLabels:[]};
	acum_meta = 0;
	_.forEach(data,function(meta,key){
		acum_meta += meta.met_dia_meta;
		format.dataMedia.push(acum_meta);
		format.dataLabels.push(meta.met_dia_fecha);
	});
	/*var acum_dia = 0;
	var flag_terminar = false;
	_.forEach(dataMeta,function(meta,key){
		var flag_dia = false;
		if(fecha == meta.met_dia_fecha){
			flag_terminar = true;
		}
		_.forEach(dataDiaria,function(dia,key_2){
			if(dia.mpr_date ==  meta.met_dia_fecha){
				flag_dia = true;
				acum_dia += dia.efectivos;
				format.dataMedia.push(acum_dia);
			}
		});
		if(!flag_dia && !flag_terminar){
			format.dataMedia.push(acum_dia);
		}
	});*/

	return format;
}


function getFormatMediaMetas(dataMeta,dataDiaria,fecha){
	var format = {dataMedia:[],dataLabels:[]};
	/*
	acum_meta = 0;
	_.forEach(data,function(med,key){
		acum_meta += med.efectivos;
		format.dataMedia.push(acum_meta);
		format.dataLabels.push(med.mpr_date);
	});
	*/
	var acum_dia = 0;
	var flag_terminar = false;
	_.forEach(dataMeta,function(meta,key){
		var flag_dia = false;
		if(fecha == meta.met_dia_fecha){
			flag_terminar = true;
		}
		_.forEach(dataDiaria,function(dia,key_2){
			if(dia.mpr_date ==  meta.met_dia_fecha){
				flag_dia = true;
				acum_dia += dia.efectivos;
				format.dataMedia.push(acum_dia);
			}
		});
		if(!flag_dia && !flag_terminar){
			format.dataMedia.push(acum_dia);
		}
	});

	return format;	
}

function formatArrHorarioAplicaSemanaCorrida(data){
	var arrTipoHorarioUsuario = {};
	_.forEach(data,function(tipoHorario,key){
		arrTipoHorarioUsuario[tipoHorario.user] = (tipoHorario.contrato_semana_corrida==1) ? true: false;
	});

	return arrTipoHorarioUsuario;
}

function formatTablaMonitMeta(dataMeta,dataDiaria){
	var arrFormatTabla = []
	var acum_meta = 0;
	var acum_dia = 0;
	_.forEach(dataMeta,function(meta,key){
		//console.log(meta);
		var flag_dia = false;
		acum_meta += meta.met_dia_meta;
		var interior = {fecha:meta.met_dia_fecha,meta:acum_meta,dia:0,cumplimiento:0};
		//console.log(interior);
		_.forEach(dataDiaria,function(dia,key_2){
			if(dia.mpr_date ==  meta.met_dia_fecha){
				flag_dia = true;
				acum_dia += dia.efectivos;
				interior.dia = acum_dia;
				interior.cumplimiento = ((acum_dia*100)/acum_meta).toFixed(2);
			}
		});
		if(!flag_dia){
			interior.dia = acum_dia;
			interior.cumplimiento = ((acum_dia*100)/acum_meta).toFixed(2);
		}
		arrFormatTabla.push(interior);
	});

	return arrFormatTabla;
}

function formatTablaMonitMetaGlobal(dataMeta,dataDiaria,fecha){
	var arrGlobal = {fecha:'',meta:'',dia:0,cumplimiento:0};
	var acum_meta = 0;
	var acum_dia = 0;
	_.forEach(dataMeta,function(meta,key){
		//console.log(meta);
		var flag_dia = false;
		acum_meta += meta.met_dia_meta;
		if(fecha == meta.met_dia_fecha){
			arrGlobal.fecha=meta.met_dia_fecha;
			arrGlobal.meta=acum_meta
		}
		//console.log(interior);
		_.forEach(dataDiaria,function(dia,key_2){
			if(dia.mpr_date ==  meta.met_dia_fecha){
				acum_dia += dia.efectivos;
				arrGlobal.dia = acum_dia;
				arrGlobal.cumplimiento = ((acum_dia*100)/acum_meta).toFixed(2);
				flag_dia = false;
			}
		});
	});

	return arrGlobal;
}

function formatArrUsuarioSupervisor(data){
	var format = {};
	_.forEach(data,function(sup,key){
		format[sup.us_sup_user] = sup.usuario_codigo; 
	})
	return format;
}

exports.arrFormatLiquidaciones = arrFormatLiquidaciones;
exports.formatRetorno = formatRetorno;
exports.formatArrProducciones = formatArrProducciones;
exports.formatProduccionesIndicador = formatProduccionesIndicador;
exports.formatArrBitacoras = formatArrBitacoras;
exports.formatGlobalesProduccion = formatGlobalesProduccion;
exports.formatGlobalesProduccionColumnas = formatGlobalesProduccionColumnas;
exports.formatGlobalesProduccionTotal = formatGlobalesProduccionTotal;
exports.asignarBrechas = asignarBrechas;
exports.formatMaximosColumnas = formatMaximosColumnas;
exports.getProduccionCalculadaVibox = getProduccionCalculadaVibox;
exports.formatArrHorarioTipoUsuario = formatArrHorarioTipoUsuario;
exports.formatSemanaCorrida = formatSemanaCorrida;
exports.formatDetalleUsuario = formatDetalleUsuario;
exports.formatArrHorarioAplicaSemanaCorrida = formatArrHorarioAplicaSemanaCorrida;
exports.formatMetas = formatMetas;
exports.getFormatMediaMetas = getFormatMediaMetas;
exports.formatTablaMonitMeta = formatTablaMonitMeta;
exports.formatTablaMonitMetaGlobal = formatTablaMonitMetaGlobal;
exports.formatArrUsuarioSupervisor = formatArrUsuarioSupervisor;