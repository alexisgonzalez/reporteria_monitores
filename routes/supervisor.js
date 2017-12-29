var reportModel = require('../model/user');
var reportVibox = require('../model/vibox');
var reportControlCalidad = require('../model/control_calidad');
var reportWebCalling = require('../model/web_calling');
var helpers = require('../helpers/helpers');
var helpersSupervisor = require('../helpers/helpersSupervisor');
var helpersCalidad = require('../helpers/helpersCalidad');
var moment = require('moment');
var _ = require('lodash');

module.exports = function(app){
	app.get("/dashboard",function(req,res){
		var fecha = moment().format("YYYY/MM/DD");
		var user_id = req.cookies.user_id;
		var filtroConnect = "WHERE 1=1 ";
		var filtroIdSioweb = "WHERE 1=1 AND us.user_id="+user_id;
		reportModel.getSupervisorId(filtroIdSioweb,function(err_sioweb,dataSioWeb){
			var id_sioweb = dataSioWeb[0].id_sioweb;
			reportModel.getUserConnect(filtroConnect,function(error_users,dataConectados){
				var filtroBitacoras = "WHERE 1=1  AND DATE(bop_fecha_incidencia) = '"+fecha+"' AND inc_id IN (select inc_id from viboxpanel2.inc_incidencia_media) and usu_id_usuario_ingreso="+id_sioweb+" ";
				reportVibox.getBitacorasUser(filtroBitacoras,function(error_bit,dataBitacoras){
					var filtro_op="where usup.us_sup_supervisor_id = "+user_id
					reportModel.getUsersBySupervisor(filtro_op,function(err,dataUsuarios){
						var usuarios = helpers.implodeUserSup(dataUsuarios,0);

						var filtroForCampaign = "WHERE mpr_user IN ("+usuarios+") AND mpr_date = '"+fecha+"';";
						reportModel.getCampaingBySupervisor(filtroForCampaign,function(error,dataCampaign){
							var filtro = "";
							var campaigns = helpers.implodeCampaign(dataCampaign);
							//filtro += " AND mpr_user IN ("+usuarios+")";
							filtro += " AND cam.campaign_id IN ("+campaigns+")";
							filtro += " AND mpr_date = '"+fecha+"' ";
							reportModel.getMedias(filtro,function(error,data_siodial){
								var hashMediasCampaign = helpersSupervisor.getSeparatedMedias(data_siodial);
								var arr_siodial = {};
								_.forEach(hashMediasCampaign,function(value,key){
									console.log(key);
									arr_siodial[key] = helpers.reFormatMedia(value,{},false,null,false,null);
								});
								var usuario_conectado = helpersSupervisor.formatUsuarioConectado(dataConectados);
								var usuario_bitacoras = helpersSupervisor.formatBitacoraUser(dataBitacoras);
								arr_siodial["usuarios"] = dataUsuarios;
								arr_siodial["conectados"] = usuario_conectado;
								arr_siodial["bitacoras"] = usuario_bitacoras;
								res.status(200).json(arr_siodial);
							});
						});
					});
				});
			});
		});
	});

	app.get("/medias_general",function(req,res){

		//solo si seleccionaron en la vista la campaña. verlo por cookies.
		var user_id = req.cookies.user_id;
		var fecha = moment().format("YYYY/MM/DD");
		//var fecha = '2017/05/11';
		var filtroUser = " AND mpr_date = '"+fecha+"' AND mpr_user_group in (select grupo_cliente from hermes.grupo_ejecutivo) ";
		console.log("DASHBOARD-GENERAL");
		var filtroConnect = "WHERE 1=1 "

		if(req.cookies.hasOwnProperty('campanas') && req.cookies.campanas != []){
			reportModel.getUserConnect(filtroConnect,function(error_users,dataConectados){
				var filtroBitacoras = "WHERE 1=1  AND DATE(bop_fecha_incidencia) = '"+fecha+"' AND inc_id IN (select inc_id from viboxpanel2.inc_incidencia_media)";
				reportVibox.getBitacorasUser(filtroBitacoras,function(error_bit,dataBitacoras){
					reportModel.getUsers(filtroUser,function(err,dataUsuarios){
						var usuarios = helpers.implodeUserSup(dataUsuarios,1);

						var filtroForCampaign = "WHERE mpr_user IN ("+usuarios+") AND mpr_date = '"+fecha+"';";
						reportModel.getCampaingBySupervisor(filtroForCampaign,function(error,dataCampaign){
							var filtro = "";
							var campaigns = helpers.implodeCampaign(dataCampaign);
							//filtro += " AND mpr_user IN ("+usuarios+")";
							filtro += " AND cam.campaign_id IN ("+campaigns+")";
							filtro += " AND mpr_date = '"+fecha+"' ";
							reportModel.getMedias(filtro,function(error,data_siodial){
								var filtro_espera = "where date(event_time) = '"+fecha+"'";
								reportModel.getPromedioEsperaCampana(filtro_espera,function(error_espera,dataEspera){
									var filtro_campana = "where fecha = '"+fecha+"' and estado = 'DROP'";
									reportModel.getPorcentajeDropCampana(filtro_campana,function(errPorc,dataPorcentaje){
										reportModel.getCantidadUsuarioCampana(function(errCant,dataCantidadCampana	){
											var filtroMeta = "WHERE 1=1 ";
											//traer meta por campanas por consulta que paja el codigo 
											var formatDropCampana = helpersSupervisor.formatPorcentajeCampana(dataPorcentaje);
											var formatEspera = helpersSupervisor.formatEsperaCampana(dataEspera);
											var hashMediasCampaign = helpersSupervisor.getSeparatedMedias(data_siodial);
											var arr_siodial = {};

											var fecha_inicio_mes = moment().format("YYYY-MM-01");
											var filtro_meta = "where	md.met_dia_fecha >= '"+fecha_inicio_mes+"' and md.met_dia_fecha <= '"+fecha+"'"
											reportModel.getMetaMonitorCampana(filtro_meta,function(errMeta,dataMeta){
												var filtro_efectivos = "where mpr_date >= '"+fecha_inicio_mes+"' and mpr_date <= '"+fecha+"'";
												reportModel.getEfectivosMonitorCampana(filtro_efectivos,function(erroEfec,dataEfectivos){
													reportControlCalidad.getDatosMonitorCampana(fecha,function(errCalidad,dataCalidad){
														//var filtroHorario = "where hop_fecha = '"+fecha+"' and hop_termino <= time('22:00:00') and hop_inicio <= time('22:00:00') ";
														var filtroHorario = "where hop_fecha = '"+fecha+"' and hop_inicio <= time(now()) ";
														filtroHorario += "AND us.user IN ("+usuarios+")";
															reportModel.getUsuarioCampanaMonitorCampana(function(err,dataOperadoraCampana){
																var filtroTotal = " AND date(call_date) = '"+fecha+"' ";
																reportModel.getTotalLlamadosPorCampañas(filtroTotal,function(error_total,dataTotalLlama){
																	var formatUserByCampana = helpersSupervisor.formatUserByCampana(dataOperadoraCampana);
																	var campanas_elegidas = req.cookies.campanas;
																	_.forEach(hashMediasCampaign,function(value,key){
																		//comprobamos que sean las campanas elegidas
																		if(campanas_elegidas.indexOf(key) >= 0){
																			arr_siodial[key] = helpers.reFormatMedia(value,{},false,null,false,null);
																			_.forEach(dataTotalLlama,function(llamados,key_7){
																				if(key == llamados.campaign_id){
																					arr_siodial[key] = helpers.addRecorridos(arr_siodial[key],llamados.numero_llamadas)	
																				}
																			});
																			arr_siodial[key].totales.conectados_maximos = 0;
																			arr_siodial[key].totales.conectados = 0;
																			arr_siodial[key].totales.efectivos = 0;
																			arr_siodial[key].totales.metas_efectivas = 0;
																			arr_siodial[key].totales.meta = 0;
																			arr_siodial[key].totales.cantidad_evaluaciones = 0;
																			arr_siodial[key].totales.porcentaje_calidad = 0;


																			_.forEach(dataCantidadCampana,function(cantidades,key_2){
																				if(key.substr(0,4) == cantidades.campana){
																					arr_siodial[key].totales.conectados_maximos = cantidades.cantidad;
																				}
																			});
																			_.forEach(dataConectados,function(conectado,key_3){
																				if(key == conectado.campaign_id){
																					arr_siodial[key].totales.conectados++;
																				}
																			});
																			_.forEach(dataMeta,function(meta,key_4){
																				if(key.substr(0,4) == meta.campana){
																					arr_siodial[key].totales.metas_efectivas = meta.met_dia_meta;
																				}
																			});
																			_.forEach(dataEfectivos,function(efectivoMeta,key_5){
																				if(key.substr(0,4) == efectivoMeta.campaign_id){
																					arr_siodial[key].totales.efectivos = efectivoMeta.efectivos;	
																				}
																			});
																			_.forEach(dataCalidad,function(dCalidad,key_6){
																				if(key.substr(0,4) == dCalidad.campana){
																					arr_siodial[key].totales.cantidad_evaluaciones = dCalidad.cantidad_evaluaciones;	
																					arr_siodial[key].totales.porcentaje_calidad = parseFloat(dCalidad.nota).toFixed(2);	
																				}
																			});
																			if(arr_siodial[key].totales.metas_efectivas > 0){
																				arr_siodial[key].totales.meta = ((arr_siodial[key].totales.efectivos*100)/arr_siodial[key].totales.metas_efectivas).toFixed(2);
																			}
																		}
																	});
																	var usuario_conectado = helpersSupervisor.formatUsuarioConectado(dataConectados);
																	var usuario_bitacoras = helpersSupervisor.formatBitacoraUser(dataBitacoras);
																	arr_siodial["usuarios"] = dataUsuarios;
																	arr_siodial["conectados"] = usuario_conectado;
																	arr_siodial["bitacoras"] = usuario_bitacoras;
																	arr_siodial["esperas"] = formatEspera;
																	arr_siodial["drop"] = formatDropCampana;
																	res.status(200).json(arr_siodial);
															})
														});
													});
												});
											});
										});
									})
								});
							});
						});
					});
				});
			});
		}

	});

	app.post("/setear_campana_monitor",function(req,res){
		//req.cookies.campanas = [];
		var campanas = [];
		_.forEach(req.body,function(campana,key){
			if(campana != "" && campana != null){
				campanas.push(campana);
			}
		});
		res.cookie("campanas",campanas);
		res.status(200).json({msg:"Se agrego"})
	});

	app.get("/get_campanas_monitor",function(req,res){
		reportModel.getCampanasMonitor(function(error,dataCampanas){
			res.status(200).json(dataCampanas);
		});
	});

	app.get("/monitor_calidad", function(req, res){
		var user_id = req.cookies.user_id;
		var fecha = moment().format("YYYY/MM/DD");
		var formatFecha = moment().format("DD/MM/YYYY");
		console.log("MONITOR-CALIDAD");
		filtro_op="where usup.us_sup_supervisor_id = "+user_id+" AND us.active='Y'";
		reportModel.getUsersBySupervisor(filtro_op,function(err,ejecutivos){
			reportControlCalidad.getDiasMonitor(fecha, function(err, dias){
				var filtro_fecha_nota="WHERE DATE(ev_fecha_creacion) BETWEEN DATE(DATE_ADD('"+fecha+"', INTERVAL -"+dias[0].fem_dias_monitor+" DAY)) \
					AND DATE(DATE_ADD('"+fecha+"', INTERVAL -1 DAY)) GROUP BY otcam_valor";
				reportControlCalidad.getNotaOperador(filtro_fecha_nota,function(err_pro, promedios){
					var filtro_fecha_cri="WHERE reev_fecha_evaluacion BETWEEN DATE(DATE_ADD('"+fecha+"', INTERVAL -"+dias[0].fem_dias_monitor+" DAY)) \
						AND DATE(DATE_ADD('"+fecha+"', INTERVAL -1 DAY)) AND ticri_id_tipo_critico in (select ticri_id_tipo_critico from control_calidad.tipo_critico_supervisor)\
						 GROUP BY reev_operador";
					reportControlCalidad.getCriticidadesOperador(filtro_fecha_cri,function(err_cri, critico){				
						var filtro = "WHERE DATE(bop_fecha_ingreso) = '"+fecha+"' AND inc_id IN (select inc_id from viboxpanel2.inc_incidencia_calidad)";
						reportVibox.getBitacorasUserDetail(filtro,function(error_bit,dataBitacoras){
							var monitor ={};
							var cantidad = critico;
							var promedio = promedios;
							var bitacora = dataBitacoras;
							var criticidades = helpersCalidad.formatCriticidadesOperador(ejecutivos, cantidad);
							var notas = helpersCalidad.formatNotasOperador(ejecutivos, promedio);
							var array_operador = helpersSupervisor.formatOperadoresMonitor(ejecutivos);
							monitor['criticidades']=criticidades;
							monitor['promedio']=notas;
							monitor['bitacora']=bitacora;
							monitor['operadores']=array_operador;
							var formatMonitor={};
							formatMonitor['datos'] = helpersCalidad.formatMonitorJSON(monitor);
							formatMonitor['informacion'] = helpersCalidad.formatTotalesJSON(monitor, formatFecha);
							res.status(200).json(formatMonitor);
						});
					});
				});
			});
		});	
	});

	app.post("/getProduccionOperador", function(req,res){
		console.log("PRODUCCION OPERADOR");
		var fecha_inicio = '';
		var fecha_fin = '';
		var fecha_minina = '2017-02-24';
		var user = req.cookies.operadora;
		if(req.body.hasOwnProperty('date_begin') && req.body.date_begin != ''
			&& req.body.hasOwnProperty('date_end') && req.body.date_end != ''){
			fecha_inicio = req.body.date_begin.split("/").reverse().join("-");
			fecha_fin = req.body.date_end.split("/").reverse().join("-");
			if (fecha_inicio < fecha_minina) {
				fecha_inicio = fecha_minina;
				console.log("FECHA MINIMA ", fecha_inicio);
			}
			var filtro_vic = "WHERE mpr_user='"+user+"' AND mpr_date BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"' and cvr_estado=1  and cvr.cvr_id_pais="+req.cookies.id_pais;
			reportModel.getProduccionVicidial(filtro_vic,function(err, valorVidicial){
				var filtro_vib ="WHERE operador='"+user+"' AND fecha_llamado BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"'\
					GROUP BY operador,cam.id_cliente,ccli.cliente,cam.id_servicio,cser.servicio,fecha ORDER BY fecha_llamado,cam.id_cliente, cam.id_servicio";
				reportVibox.getProduccionVibox(filtro_vib,function(err, valorVibox){
					var filtro_efec ="WHERE cvr_estado=1 AND cvr_fec_crea in \
					(SELECT MAX(cvr_fec_crea) FROM hermes.cvr_cliente_valor_registro GROUP BY cvr_id_cliente, cvr_id_servicio) \
					GROUP BY  cvr_id_cliente, cvr_id_servicio";
					reportModel.getValorEfectivos(filtro_efec,function(err, valorEfectivo){
						var list = {};
						var fechas = helpers.listFechaProduccion(valorVidicial,valorVibox);
						fechas.sort(function(a, b) {
						    a = new Date(moment(a,"DD-MM-YYYY"));
						    b = new Date(moment(b,"DD-MM-YYYY"));
						    return b>a ? -1 : b<a ? 1 : 0;
						});
						var cliServVic = helpers.listClienteServicioVicidial(valorVidicial);
						var cliServVib = helpers.listClienteServicioVibox(valorVibox);
						var listaCompletaVib = helpers.formatListaValorVibox(valorEfectivo, valorVibox);
						list['datosVicidial'] = helpers.formatListProduccion(fechas, valorVidicial, cliServVic);
						list['datosVibox'] = helpers.formatListProduccion(fechas, listaCompletaVib, cliServVib);
						list['fechas'] = fechas;
						list['totalDias'] = helpers.formatTotalesDiasProduccion(list);
						list['totalFinal'] = helpers.formatTotalFinalProduccion(list['totalDias']);
						res.status(200).json(list);
					});
				});
			});
		}
	});

	app.post("/tituloPagina",function(req,res){
		console.log("TITULO");
		console.log(req.body);
		filtro="WHERE mos_location_path='"+req.body.path+"'";
		reportModel.getListaModulosMenu(filtro, function(err, data){
			res.status(200).json(data);
		});
	});
	app.get("/resumenEnvio",function(req,res){
		console.log(req.body);
		reportModel.getListEstadoEvioICS(function(err, data){
			var resumen = helpersSupervisor.totalResumenICS(data);
			res.status(200).json(resumen);
		});
	});

	app.post("/listaPostulacion",function(req,res){
		console.log(req.body);
		if(req.body.hasOwnProperty('date_begin') && req.body.date_begin != ''
			&& req.body.hasOwnProperty('date_end') && req.body.date_end != ''
			&& req.body.hasOwnProperty('pais') && req.body.pais !=''){
			fecha_inicio = req.body.date_begin.split("/").reverse().join("-");
			fecha_fin = req.body.date_end.split("/").reverse().join("-");
			filtro="WHERE pai_id_pais="+req.body.pais+" AND date(pos_id_fecha_postulacion) BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"'";
			if(req.body.hasOwnProperty('es_id_estado') && req.body.es_id_estado != '' && req.body.es_id_estado== 1){
				filtro += " AND poa_telefono is not null"
				if(req.body.pais==2)
				filtro +=" AND com.com_id_comuna=567";
			}
			reportWebCalling.getListaAntenecedentesPostulantes(filtro, function(err1, antecedentes){
				filtro1="WHERE date(pos_id_fecha_postulacion) BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"'";
				reportWebCalling.getListaCargosPostulantes(filtro1, function(err2, cargos){
					reportWebCalling.getListaExperienciaPostulantes(filtro1, function(err3, experiencia){
						var list = helpersSupervisor.formatoPostulantes(antecedentes, cargos, experiencia, req.body.es_id_estado);
						//console.log(list);
						res.status(200).json({list:list, export:antecedentes});
					});
				});
			});
		}

	});

	app.get("/listaPaisesPostulacion",function(req,res){
		var filtro = "WHERE pai_estado = 1";
		reportWebCalling.getListPaisesPostulantes(filtro, function(err, data){
			res.status(200).json(data);
		});
	});

	app.get("/cierresBitacora", function(req, res){
		var cierres = helpers.cierreBitacora();
		console.log(cierres);
		res.status(200).json(cierres);
	});

	app.get("/listaEstadoPostulacion",function(req,res){
		var filtro = "WHERE es_estado = 1";
		reportWebCalling.getListEstados(filtro, function(err, data){
			res.status(200).json(data);
		});
	});

	app.post("/guardarEstadoPostulacion",function(req,res){
		console.log(req.body);
		var post = req.body.pos_id_postulante;
		var update = "UPDATE web_calling.postulacion\
		SET es_id_estado="+req.body[post].es_id_estado+", pos_cambio_estado=now()\
		WHERE pos_id_postulante="+post+" AND pos_estado=1";
		console.log(update);
		reportWebCalling.executeQuery(update, function(err,rep){
			if(err)
				res.status(200).json({save:false});
			else
				res.status(200).json({save:true});
		});
	});
}
