var _ = require('lodash');
var moment = require('moment');

function getSeparatedMedias(data){
	var hash = {};
	_.forEach(data,function(value,key){
		if(typeof(hash[value.campaign_id]) == "undefined")
			hash[value.campaign_id] = [];
		hash[value.campaign_id].push(value);
	})
	return hash;
}

function formatBitacoraUser(data){
	var format = {};
	for(var i = 0;i < data.length;i++){
		format[data[i].usuario_codigo] = data[i].inc_id;
	}

	return format;
}

function formatUsuarioConectado(data){
	var format = [];
	for(var i = 0;i < data.length;i++){
		format.push(data[i].user);
	}

	return format;
}

function formatOperadoresMonitor(data){
	var flag=true;
	var flag2=false;
	var flag3=false;
	var op=[];
	var op2=[];
	var op3=[];
	data.forEach(function(operador){
		if(flag){
			op.push(operador);
			flag=false;
			flag1=true;
		}else if(flag1){
			op2.push(operador);
			flag1=false;
			flag2=true;
		}else if(flag2){
			op3.push(operador);
			flag2=false;
			flag=true;
		}
	});

	return [op,op2,op3];

}

function formatEsperaCampana(dataEspera){
	var format = {};
	_.forEach(dataEspera,function(espera,key){
		format[espera.campaign_id] = espera.format_segundos;
	});

	return format;
}

function formatPorcentajeCampana(dataPorcentaje){
	var format = {};
	_.forEach(dataPorcentaje,function(porc,key){
		format[porc.campaign_id] = ((porc.cantidad*100)/porc.llamados).toFixed(2);
	})

	return format;
}

function formatAdherencia(ideal,real){
	var formatAdhe = {};
	_.forEach(ideal,function(dataIdeal,key){
		var operador = dataIdeal.user;
		_.forEach(real,function(dataReal,key){
			if(operador == dataReal.mpr_user){
				if(typeof(formatAdhe[operador]) == "undefined")
					formatAdhe[operador] = {};
				formatAdhe[operador].porcentaje = ((dataReal.second_adhe*100)/dataIdeal.total_ideal).toFixed(2);
			}
		})
	});
	return formatAdhe;
}

function formatGlobalesMonitor(dataMonitor){
	var formatGlobales = {cantidadLlamando:0,cantidadPausa:0,cantidadEspera:0,cantidadMuertos:0};
	_.forEach(dataMonitor,function(monitor,key){
		switch(monitor.estado){
			case "ESPERANDO LLAMADO":
				formatGlobales.cantidadEspera++;
				break;
			case "EN LLAMADO":
				formatGlobales.cantidadLlamando++;
				break;
			case "PAUSA":
				formatGlobales.cantidadPausa++;
				break;
			case "TIEMPO MUERTO":
				formatGlobales.cantidadMuertos++;
				break;
		}
	});

	return formatGlobales;
}

function addColorCampana(dataMonitor){
	var campana = "";
	var color = "#FFFFFF"; //#fce8e8
	var flag_cambio = true;
	_.forEach(dataMonitor,function(monitor,key){
		if(campana == "")
			campana = monitor.campaign_id;

		if(campana != monitor.campaign_id && !flag_cambio){
			color = "#FFFFFF";
			campana = monitor.campaign_id;
			flag_cambio = true;
		}
		if(campana != monitor.campaign_id && flag_cambio){
			color = "#fce8e8";
			campana = monitor.campaign_id;
			flag_cambio = false;
		}
		dataMonitor[key].colores = {"background-color":color,"color":"#000"};
	})

	return dataMonitor;
}

function implodeCampanas(campanas){
	var ret = "";
	for (var i = 0, len = campanas.length; i < len; i++) {
		if(i == 0){
			ret += "'"+campanas[i]+"'";
		}else{
			ret += ",'"+campanas[i]+"'";
		}
	}
	return ret;
}

function totalResumenICS(data){
	var res = {total:0};
	var contenido = [];
	_.forEach(data, function(value, key){
		if(value.envio ==1)
			var list = { estado: 'ENVIADO', cantidad:value.cantidad};
		else if(value.envio == 0)
			var list = {estado: 'SIN ENVIAR', cantidad:value.cantidad};
		else
			var list = {estado: 'EN COLA', cantidad:value.cantidad};
		contenido.push(list);
		res.total+=parseInt(value.cantidad);
	});

	return {total:res, list:contenido};
}

function formatoPostulantes(antecedentes, cargo, experiencia, estado){
	var contenido = {};
	_.forEach(antecedentes, function(ant, key){
		var postulante = {
			id:ant.pos_id_postulante,
			rut:ant.pos_rut,
			nombre:ant.pos_nombre,
			apellido:ant.pos_apellido,
			fecha_postulacion:ant.pos_id_fecha_postulacion,
			fecha_nacimiento:ant.poa_fecha_nacimiento,
			edad:calcular_edad(ant.poa_fecha_nacimiento),
			genero:ant.poa_genero,
			es_id_estado:ant.es_id_estado
		};
		var ante = {
			telefono:ant.poa_telefono,
			direccion:ant.poa_direccion,
			correo:ant.poa_correo,
			tipo_pc:ant.poa_tipo_equipo,
			velocidad:ant.poa_velocidad,
			comuna:ant.com_nombre,
			urbanizacion:ant.poa_urbanizacion,
			tipo_conexion:ant.poa_tipo_conexion,
			nivel:ant.niv_nombre,
			situacion:ant.sit_nombre,
			titulo:ant.poe_titulo,
			foto:ant.poa_foto
		};
		if(ante.comuna=='Otro')
			ante.comuna = ante.comuna+'('+ant.poa_otra_comuna+')';
		if(ant.poa_tipo_equipo != null){
			ante.computador = (ant.poa_computador==1)?'Sí':'No';
			ante.web = (ant.poa_web==1)?'Sí':'No';
			ante.banda_ancha = (ant.poa_banda_ancha==1)?'Sí':'No';
			ante.lugar = (ant.poa_lugar==1)?'Sí':'No';
		}
		if(ant.experiencia_en_call==1)
			ante.experiencia='Sí';
		else if(ant.experiencia_en_call==0)
			ante.experiencia='No';
		else
			ante.experiencia=null;
		postulante['antecedentes']=ante;
		var expe = {};
		_.forEach(experiencia, function(exp, key_e){
			if(exp.pos_rut==postulante.rut){
				var data_exp = {
					empresa : exp.pox_empresa,
					cargo : exp.pox_cargo,
					ingreso : exp.pox_fecha_ingreso,
					fin : exp.pox_fecha_fin,
					funciones : exp.pox_descripcion
				};
				expe[key_e]=data_exp;
			}
		});
		postulante['experiencia']=expe;
		var carg = {};
		_.forEach(cargo, function(car, key_c){
			if(postulante.rut==car.pos_rut){
				var data_cargo = {};
				data_cargo.nombre=car.car_nombre;
				carg[key_c] = data_cargo;
			}
		});
		postulante['cargos']=carg;
		if(estado==1){
			if(postulante.edad<=59){
				if(postulante.genero='F' && postulante.edad>=26)
					contenido[key]=postulante;
				if(postulante.genero='M' && postulante.edad>=23)
					contenido[key]=postulante;
			}
		}else
			contenido[key]=postulante;
			postulante.genero = (ant.poa_genero=='')?'':(ant.poa_genero=='F')?'Femenino':'Masculino'
	});
	return contenido;
}

function calcular_edad(fecha){
	var array_fecha = fecha.split("/");
	if (array_fecha.length!=3)
       return false;
    var ano;
    ano = parseInt(array_fecha[2]);
    if (isNaN(ano))
       return false;
    var mes;
    mes = parseInt(array_fecha[1]);
    if (isNaN(mes))
       return false;
    var dia;
    dia = parseInt(array_fecha[0]);
    if (isNaN(dia))
       return false;

	fecha_hoy = new Date();
	ahora_ano = fecha_hoy.getYear();
	ahora_mes = fecha_hoy.getMonth();
	ahora_dia = fecha_hoy.getDate();
	edad = (ahora_ano + 1900) - ano;
	
	if ( ahora_mes < (mes - 1)){
		edad--;
	}
	if (((mes - 1) == ahora_mes) && (ahora_dia < dia)){ 
		edad--;
	}
	if (edad > 1900){
		edad -= 1900;
	}
	return edad;
}

function formatUserByCampana(data){
	var format_dato = {};
	_.forEach(data,function(dataOp,key){
		if(typeof(format_dato[dataOp["campana"]]) == "undefined"){
			format_dato[dataOp["campana"]] = [];
		}
		format_dato[dataOp["campana"]].push({usuario:dataOp["user"]});
	});

	return format_dato;
}

function getAdherenciaCampana(dataHorarioOperador,dataOperadoraCampana,campana){
	var formatAdhe = {};
	var hora = moment().format('H:m:s');
	var hora_format = moment().format('HHmmss');
	//var hora = moment().format('22:00:00');
	//var hora_format = '220000';
	formatAdhe = {segundos:0};
	_.forEach(dataOperadoraCampana,function(dataCampana,key){
		if(campana == key){
			_.forEach(dataCampana,function(usuarios,key_2){
				_.forEach(dataHorarioOperador,function(horarios,key_3){
					if(usuarios["usuario"] == horarios.user){
						//transformar la hora a algo que se pueda comparar
						var hora_actual = parseInt(hora_format);
						var hora_usuario = parseInt(horarios.hop_termino.replace(':',''));
						if(hora_actual <= hora_usuario){
							formatAdhe.segundos += parseInt(horarios.hop_segundos);
						}else{
							var hora_inicio = parseInt(horarios.hop_inicio.replace(':',''));
							if(hora_inicio.toString().length == 4){
								hora_inicio = hora_inicio*100;
							}
							var hora_restante = hora_actual-hora_inicio;
							var largo = hora_restante.toString().length;
							if(largo > 2){
								if(largo > 4){
									if(largo == 5){
										var horas = parseInt(hora_restante.toString().substr(0,1));
										var minutos = 	parseInt(hora_restante.toString().substr(1,2));
										var segundo = 	parseInt(hora_restante.toString().substr(3,2));
									}
									if(largo == 6){
										var horas = parseInt(hora_restante.toString().substr(0,2));
										var minutos = 	parseInt(hora_restante.toString().substr(2,2));
										var segundo = 	parseInt(hora_restante.toString().substr(4,2));
									}
									var segundos = horas*3600;
									segundos += (minutos*60);
									segundos += segundo;
									formatAdhe.segundos +=	segundos
								}else{
									if(largo == 3){
										var minutos = 	parseInt(hora_restante.toString().substr(0,1));
										var segundo = 	parseInt(hora_restante.toString().substr(1,2));
									}
									if(largo == 4){
										var minutos = 	parseInt(hora_restante.toString().substr(0,2));
										var segundo = 	parseInt(hora_restante.toString().substr(2,2));
									}
									var segundos = (minutos*60);
										segundos += segundo;
									formatAdhe.segundos +=	segundos
								}
							}else{
								formatAdhe.segundos +=	hora_restante
							}
						}
						formatAdhe.format_segundos = formatAdhe.segundos.toHHMMSS();
					}
				});
			});
		}
	});
	return formatAdhe;
}

function getAdherenciaMonitor(dataHorarioOperador,dataOperadoraCampana){
	var formatAdhe = {};
	var hora = moment().format('H:m:s');
	var hora_format = moment().format('HHmmss');
	//var hora = moment().format('18:00:00');
	//	var hora_format = '180000';
	formatAdhe = {};
	_.forEach(dataOperadoraCampana,function(dataCampana,key){
		formatAdhe[key] = {segundos:0,cantidad_usuarios:0,usuarios:[],horarios_ideales:{}};
		_.forEach(dataCampana,function(usuarios,key_2){
			formatAdhe[key].cantidad_usuarios++;
			_.forEach(dataHorarioOperador,function(horarios,key_3){
				if(usuarios["usuario"] == horarios.user){
					if(typeof(formatAdhe[key].horarios_ideales[horarios.user]) == "undefined")
						formatAdhe[key].horarios_ideales[horarios.user] = 0;
					//transformar la hora a algo que se pueda comparar
					var hora_actual = parseInt(hora_format);
					var hora_usuario = parseInt(horarios.hop_termino.replace(':',''));
					if(hora_usuario.toString().length == 4){
						hora_usuario = hora_usuario*100;
					}
					if(hora_actual >= hora_usuario){
						formatAdhe[key].segundos += parseInt(horarios.hop_segundos);
						formatAdhe[key].horarios_ideales[horarios.user] += horarios.hop_segundos;
					}else{
						var hora_inicio = parseInt(horarios.hop_inicio.replace(':',''));
						if(hora_inicio.toString().length == 4){
							hora_inicio = hora_inicio*100;
						}
						var hora_restante = hora_actual-hora_inicio;
						var largo = hora_restante.toString().length;
						if(largo > 2){
							if(largo > 4){
								if(largo == 5){
									var horas = parseInt(hora_restante.toString().substr(0,1));
									var minutos = 	parseInt(hora_restante.toString().substr(1,2));
									var segundo = 	parseInt(hora_restante.toString().substr(3,2));
								}
								if(largo == 6){
									var horas = parseInt(hora_restante.toString().substr(0,2));
									var minutos = 	parseInt(hora_restante.toString().substr(2,2));
									var segundo = 	parseInt(hora_restante.toString().substr(4,2));
								}
								var segundos = horas*3600;
								if(minutos > 40){
									segundos += ((minutos-40)*60);
								}else{
									segundos += (minutos*60);
								}
								segundos += segundo;
								formatAdhe[key].segundos +=	segundos
								formatAdhe[key].horarios_ideales[horarios.user] +=	segundos
							}else{
								if(largo == 3){
									var minutos = 	parseInt(hora_restante.toString().substr(0,1));
									var segundo = 	parseInt(hora_restante.toString().substr(1,2));
								}
								if(largo == 4){
									var minutos = 	parseInt(hora_restante.toString().substr(0,2));
									var segundo = 	parseInt(hora_restante.toString().substr(2,2));
								}
									if(minutos > 40){
										var segundos = ((minutos-40)*60);
									}else{
										var segundos = (minutos*60);
									}
									segundos += segundo;
								formatAdhe[key].segundos +=	segundos
								formatAdhe[key].horarios_ideales[horarios.user] +=	segundos
							}
						}else{
							formatAdhe[key].segundos +=	hora_restante
							formatAdhe[key].horarios_ideales[horarios.user] +=	hora_restante
						}
					}
					formatAdhe[key].format_segundos = formatAdhe[key].segundos.toHHMMSS();
					formatAdhe[key].usuarios.push(horarios.user);
				}
			});
		});
	});
	return formatAdhe;
}

function getAdherenciaMonitorReal(data){
	var formatReal = {};
	_.forEach(data,function(dataReal,key){
		if(typeof(formatReal[dataReal.campana]) == "undefined")
			formatReal[dataReal.campana] = {segundos:0,cantidad_usuarios:0,format_real:'',usuarios_conectados:[]};
		formatReal[dataReal.campana].segundos += dataReal.segundos;
		formatReal[dataReal.campana].cantidad_usuarios ++;
		formatReal[dataReal.campana].format_real = formatReal[dataReal.campana].segundos.toHHMMSS();
		formatReal[dataReal.campana].usuarios_conectados.push(dataReal.user);
	});
	return formatReal;
}

function getMergeAdherencia(dataIdeal,dataReal){
	var formatMerge = {};
	_.forEach(dataIdeal,function(ideal,keyIdeal){
		formatMerge[keyIdeal] = {usuarios_ausentes:[]};
		formatMerge[keyIdeal].segundos_ideal = ideal.segundos;
		formatMerge[keyIdeal].format_ideal = ideal.format_segundos;
		formatMerge[keyIdeal].horarios = ideal.horarios_ideales;
		formatMerge[keyIdeal].cantidad_usuario_ideal = Object.keys(ideal.horarios_ideales).length;
		//formatMerge[keyIdeal].cantidad_usuario_ideal = ideal.cantidad_usuarios;
		_.forEach(dataReal,function(real,keyReal){
			if(keyReal == keyIdeal){
				formatMerge[keyIdeal].segundos_real = real.segundos;
				formatMerge[keyIdeal].format_real = real.format_real;
				formatMerge[keyIdeal].cantidad_usuario_real = real.cantidad_usuarios;
				if(formatMerge[keyIdeal].segundos_ideal > 0){
					formatMerge[keyIdeal].porcentaje_contrato = (real.segundos > 0) ?((real.segundos*100)/formatMerge[keyIdeal].segundos_ideal).toFixed(2):0;
				}else{
					formatMerge[keyIdeal].porcentaje_contrato = 0;
				}
				_.forEach(ideal.usuarios,function(usuariosIdeal,keyUsIdeal){
					var encontro = false;
					_.forEach(real.usuarios,function(usuariosReales,keyUsReal){
						if(usuariosIdeal == usuariosReales){
							encontro = true;
						}
					});
					if(!encontro){
						formatMerge[keyIdeal].usuarios_ausentes.push(usuariosIdeal);
					}
				});
			}
		});
	});

	return formatMerge;
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

function getExtractExcepciones(dataExcepcion,dataUsuarioCampana,fecha,dataAdhe){
	var extractFormat = {};
	_.forEach(dataUsuarioCampana,function(usuario,keyUsuario){
		extractFormat[keyUsuario] = {segundos_licencias: 0,
										format_licencias: 0,
										cantidad_licencias: 0,
										segundos_vacaciones: 0,
										format_vacaciones: 0,
										cantidad_vacaciones: 0,
										segundos_recuperos: 0,
										format_recuperos: 0,
										cantidad_recuperos: 0,
										segundos_permiso_esp: 0,
										format_permiso_esp: 0,
										cantidad_permiso_esp: 0,
										segundos_permiso: 0,
										format_permiso: 0,
										cantidad_permiso: 0,
										format_usuarios_perdonados:[]};
		_.forEach(usuario,function(us,keyUser){
			if(typeof(dataExcepcion[us.usuario]) != "undefined"){
				_.forEach(dataExcepcion[us.usuario][fecha],function(excepcion,keyExce){
					if(excepcion.tho_id == 5){
						if(typeof(dataAdhe[keyUsuario].horarios[us.usuario]) != "undefined"){
							console.log(dataAdhe[keyUsuario].horarios[us.usuario].toHHMMSS(),us.usuario);
							extractFormat[keyUsuario].segundos_licencias += dataAdhe[keyUsuario].horarios[us.usuario];
							extractFormat[keyUsuario].format_licencias = extractFormat[keyUsuario].segundos_licencias.toHHMMSS();
							extractFormat[keyUsuario].cantidad_licencias++;
							extractFormat[keyUsuario].format_usuarios_perdonados.push(excepcion.user);
						}
					}
					if(excepcion.tho_id == 6){
						if(typeof(dataAdhe[keyUsuario].horarios[us.usuario]) != "undefined"){
							extractFormat[keyUsuario].segundos_vacaciones += dataAdhe[keyUsuario].horarios[us.usuario];
							extractFormat[keyUsuario].format_vacaciones = extractFormat[keyUsuario].segundos_vacaciones.toHHMMSS();
							extractFormat[keyUsuario].cantidad_vacaciones++;
							extractFormat[keyUsuario].format_usuarios_perdonados.push(excepcion.user);
						}	
					}
					if(excepcion.tho_id == 4){
						if(typeof(dataAdhe[keyUsuario].horarios[us.usuario]) != "undefined"){
							extractFormat[keyUsuario].segundos_recuperos += excepcion.hop_segundos;
							extractFormat[keyUsuario].format_recuperos = extractFormat[keyUsuario].segundos_recuperos.toHHMMSS();
							extractFormat[keyUsuario].cantidad_recuperos++;
						}
					}
					if(excepcion.tho_id == 7){
						if(typeof(dataAdhe[keyUsuario].horarios[us.usuario]) != "undefined"){
							extractFormat[keyUsuario].segundos_permiso_esp += excepcion.hop_segundos;
							extractFormat[keyUsuario].format_permiso_esp = extractFormat[keyUsuario].segundos_permiso_esp.toHHMMSS();
							extractFormat[keyUsuario].format_usuarios_perdonados.push(excepcion.user);
							extractFormat[keyUsuario].cantidad_permiso_esp++;
						}
					}
					if(excepcion.tho_id == 2 || excepcion.tho_id == 3){
						if(typeof(dataAdhe[keyUsuario].horarios[us.usuario]) != "undefined"){
							extractFormat[keyUsuario].segundos_permiso += excepcion.hop_segundos;
							extractFormat[keyUsuario].format_permiso = extractFormat[keyUsuario].segundos_permiso.toHHMMSS();
							extractFormat[keyUsuario].format_usuarios_perdonados.push(excepcion.user);
							extractFormat[keyUsuario].cantidad_permiso++;
						}
					}
				});
			}
		})
	});

	return extractFormat;
}

function getArrayDefinitivoMonitor(dataAdhe,dataExce){
	_.forEach(dataAdhe,function(adhe,campana){
		if(typeof(dataAdhe[campana].segundos_real) == "undefined"){
			dataAdhe[campana].segundos_real = 0;
			dataAdhe[campana].format_real = '00:00:00';
		}
		if(typeof(dataAdhe[campana].porcentaje_contrato) == "undefined")
			dataAdhe[campana].porcentaje_contrato = 0;
		dataAdhe[campana].segundos_licencias = dataExce[campana].segundos_licencias;
		dataAdhe[campana].format_licencias = dataExce[campana].format_licencias;
		dataAdhe[campana].segundos_vacaciones = dataExce[campana].segundos_vacaciones;
		dataAdhe[campana].format_vacaciones = dataExce[campana].format_vacaciones;
		dataAdhe[campana].segundos_recuperos = dataExce[campana].segundos_recuperos;
		dataAdhe[campana].format_recuperos = dataExce[campana].format_recuperos;
		dataAdhe[campana].segundos_permiso_esp = dataExce[campana].segundos_permiso_esp;
		dataAdhe[campana].format_permiso_esp = dataExce[campana].format_permiso_esp;
		dataAdhe[campana].segundos_permiso = dataExce[campana].segundos_permiso;
		dataAdhe[campana].format_permiso = dataExce[campana].format_permiso;

		dataAdhe[campana].cantidad_licencias = dataExce[campana].cantidad_licencias;
		dataAdhe[campana].cantidad_vacaciones = dataExce[campana].cantidad_vacaciones;
		dataAdhe[campana].cantidad_recuperos = dataExce[campana].cantidad_recuperos;
		dataAdhe[campana].cantidad_permiso_esp = dataExce[campana].cantidad_permiso_esp;
		dataAdhe[campana].cantidad_permiso = dataExce[campana].cantidad_permiso;
		
		dataAdhe[campana].segundos_calculados = (dataAdhe[campana].segundos_ideal-dataAdhe[campana].segundos_licencias
													 - dataAdhe[campana].segundos_vacaciones - dataAdhe[campana].segundos_permiso
													  - dataAdhe[campana].segundos_permiso_esp + dataAdhe[campana].segundos_recuperos);
  		
  		//dataAdhe[campana].segundos_calculados = dataAdhe[campana].segundos_ideal;
  		if(dataAdhe[campana].segundos_calculados > 0){
			dataAdhe[campana].porcentaje_calculado = ((dataAdhe[campana].segundos_real*100)/dataAdhe[campana].segundos_calculados).toFixed(2);
  		}else{
			dataAdhe[campana].porcentaje_calculado = 0;
  		}
		dataAdhe[campana].format_calculado = dataAdhe[campana].segundos_calculados.toHHMMSS();
		var diferencia = dataAdhe[campana].segundos_calculados-dataAdhe[campana].segundos_real;
		dataAdhe[campana].format_falta = '00:00:00';
		dataAdhe[campana].format_sobra = '00:00:00';
		if(diferencia >= 0){
			dataAdhe[campana].format_sobra = diferencia.toHHMMSS();
		}else{
			dataAdhe[campana].format_falta = Math.abs(diferencia).toHHMMSS();
		}
		var porc_contrato = parseFloat(dataAdhe[campana].porcentaje_contrato);
		if(porc_contrato >= 100 ){
			dataAdhe[campana].tramo_contrato = 1 
		}
		if(porc_contrato < 100 && porc_contrato >= 85){
			dataAdhe[campana].tramo_contrato = 2 
		}
		if(porc_contrato < 85 && porc_contrato >= 75){
			dataAdhe[campana].tramo_contrato = 3 
		}
		if(porc_contrato <  75){
			dataAdhe[campana].tramo_contrato = 4 
		}
		var porc_ideal = parseFloat(dataAdhe[campana].porcentaje_calculado);
		if(porc_ideal >= 100 ){
			dataAdhe[campana].tramo_ideal = 1 
		}
		if(porc_ideal < 100 && porc_ideal >= 98){
			dataAdhe[campana].tramo_ideal = 2 
		}
		if(porc_ideal < 98 && porc_ideal >= 90){
			dataAdhe[campana].tramo_ideal = 3 
		}
		if(porc_ideal <  90){
			dataAdhe[campana].tramo_ideal = 4 
		}
		dataAdhe[campana].ausentes = 0;

		//vemos los ausentes
		_.forEach(dataAdhe.usuarios_ausentes,function(ause,keyAus){
			var encontro = false;
			_.forEach(dataExce[campana].format_usuarios_perdonados,function(usPer,keyPer){
				if(ause==usPer){
					encontro=true;
				}
			});
			if(!encontro){
				dataAdhe[campana].ausentes++;
			}
		});
	});

	return dataAdhe;
}

function formatCampana(data){
	var format = {}
	_.forEach(data,function(campana,key){
		format[campana.campaign_id] = campana.campaign_name;
	});
	return format;
}

function getDatGrafico(data){
	var format = {label:[],data:[]};

	_.forEach(data,function(grafico,key){
		var porcentaje = Math.round((grafico.cantidad_llamando * 100)/grafico.total_sin_pausa);
		format.label.push(grafico.fecha);
		format.data.push(porcentaje);
	});
	return format;
}

exports.getSeparatedMedias = getSeparatedMedias;
exports.formatBitacoraUser = formatBitacoraUser;
exports.formatUsuarioConectado = formatUsuarioConectado;
exports.formatOperadoresMonitor = formatOperadoresMonitor;
exports.formatEsperaCampana = formatEsperaCampana;
exports.formatPorcentajeCampana = formatPorcentajeCampana;
exports.formatAdherencia = formatAdherencia;
exports.formatGlobalesMonitor = formatGlobalesMonitor;
exports.addColorCampana = addColorCampana;
exports.implodeCampanas = implodeCampanas;
exports.totalResumenICS = totalResumenICS;
exports.formatoPostulantes = formatoPostulantes;
exports.formatUserByCampana = formatUserByCampana;
exports.getAdherenciaCampana = getAdherenciaCampana;
exports.getAdherenciaMonitor = getAdherenciaMonitor;
exports.getAdherenciaMonitorReal = getAdherenciaMonitorReal;
exports.getMergeAdherencia = getMergeAdherencia;
exports.getExtractExcepciones = getExtractExcepciones;
exports.getArrayDefinitivoMonitor = getArrayDefinitivoMonitor;
exports.formatCampana = formatCampana;
exports.getDatGrafico = getDatGrafico;