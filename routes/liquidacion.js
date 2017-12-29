var reportModel = require('../model/user');
var reportCalidad = require('../model/control_calidad');
var reportVibox = require('../model/vibox');
var helpers = require('../helpers/helpers');
var helpersLiquidacion = require('../helpers/helpersLiquidaciones');

module.exports = function(app){
	app.post('/showLiquidaciones',function(req,res){
		var fecha_inicio = req.body.periodoLiquidacion.date_begin;
		var fecha_fin = req.body.periodoLiquidacion.date_end;
		var filtro = "WHERE opt.opt_fec_fecha >= '"+fecha_inicio+"' and opt.opt_fec_fecha <= '"+fecha_fin+"'";
		reportVibox.getHorariosIdealVibox(true,filtro, function(error,data_ideal_vibox){
			filtroRealVibox = "where med.fecha_llamado BETWEEN  '"+fecha_inicio+"' and '"+fecha_fin+"'";
			if(Object.keys(req.cookies).length > 0 && req.cookies.hasOwnProperty("operadora") && req.cookies.operadora != "undefined" && parseInt(req.cookies.nivel) == 1){
				filtroRealVibox += " AND med.operador='"+req.cookies.operadora+"'";
			}
			reportVibox.getHorariosRealVibox(filtroRealVibox,function(error,data_real_vibox){
				filtro_fecha = " AND mpr_date BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"'";
				filtro_fecha_2 = " AND hop_fecha BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"'";
				filtroRealVibox = "where med.fecha_llamado BETWEEN  '"+fecha_inicio+"' and '"+fecha_fin+"'";
				if(Object.keys(req.cookies).length > 0 && req.cookies.hasOwnProperty("operadora") && req.cookies.operadora != "undefined" && parseInt(req.cookies.nivel) == 1){
					filtro_fecha += " AND mpr_user='"+req.cookies.operadora+"'";
				}
				var fechas;
				reportModel.getHorario(filtro_fecha,function(error,data){
					reportVibox.getHorarioIdeal(filtro,function(error,data2){
						
						fechas = data2;
						var arrFechas = helpers.extractDateHH(data2);
						//var arrHorarioIdeal = helpers.formatHorarioIdeal(arrFechas,fechas);
						var arrHorario = helpers.formatHorarioOp(arrFechas,data,fechas,data_ideal_vibox,data_real_vibox);
						
						helpersLiquidacion.arrFormatLiquidaciones(arrHorario.horario);
						
						res.status(200).json({"fechas":arrFechas,"horarios":arrHorario.horario,"globalesDia":arrHorario.globalesDia,"globalesOperador":arrHorario.globalesOperador,
							"globalesHorario":arrHorario.totales});
					});
				});
			});
		});
	});

	app.post('/listOperador',function(req,res){
		var filtro_op = 'WHERE 1=1 ';
		if(req.body.filterOp){
			filtro_op=" AND us.active='Y'";
		}
		if(typeof(req.body.id_pais) != "undefined")
			filtro_op += " AND usde.id_pais="+req.body.id_pais;
		reportModel.getUsersBySupervisor(filtro_op,function(err,ejecutivos){
			res.status(200).json(ejecutivos);
		});
	});

	app.post('/liquidacionOperador', function(req,res){
		var fecha_inicio = "";
		var fecha_fin = "";
		if(req.body.date_begin!='' && req.body.date_end!='' && req.body.selectOperador.length!=0){
			fecha_inicio = req.body.date_begin.split("/").reverse().join("-");
			fecha_fin = req.body.date_end.split("/").reverse().join("-");
		}

		var operadores = req.body.selectOperador.join();
		var filtro = "";
		filtro = " AND hop_fecha BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"'";
		if(Object.keys(req.cookies).length > 0 && req.cookies.hasOwnProperty("operadora") && req.cookies.operadora != "undefined" && parseInt(req.cookies.nivel) == 1){
			filtro += " AND us.user='"+req.cookies.operadora+"'";
		}
		filtro += " AND us.user_id IN ("+operadores+") ";
		var filtro_users = " AND us.user_id IN ("+operadores+") ";
		var filtro_tipoHorario = "WHERE 1=1 ";
		filtro_tipoHorario += "AND usde.user_id IN ("+operadores+") "
		reportModel.getTipoHorarioUser(filtro_tipoHorario,function(errorTipo,dataTipoHorario){
			reportModel.getUsersHorario(filtro_users,function(error,dataUser){
				var result_users = helpers.mergeOperador(dataUser,[]);
				reportModel.getHorarioIdeal(filtro,function(error,dataIDealVicidial){
					var filtroRealVibox = "where med.fecha_llamado BETWEEN  '"+fecha_inicio+"' and '"+fecha_fin+"'";
					if(Object.keys(req.cookies).length > 0 && req.cookies.hasOwnProperty("operadora") && req.cookies.operadora != "undefined" && parseInt(req.cookies.nivel) == 1){
						filtroRealVibox += " AND med.operador='"+req.cookies.operadora+"'";
					}
					filtroRealVibox += " AND operador not like '%amiento%' AND operador not like '%prueba%'";
					reportVibox.getHorariosRealVibox(filtroRealVibox,function(error,data_real_vibox){
						filtro_fecha = " AND mpr_date BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"'";
						filtroRealVibox = "where med.fecha_llamado BETWEEN  '"+fecha_inicio+"' and '"+fecha_fin+"' ";
						if(Object.keys(req.cookies).length > 0 && req.cookies.hasOwnProperty("operadora") && req.cookies.operadora != "undefined" && parseInt(req.cookies.nivel) == 1){
							filtro_fecha += " AND mpr_user='"+req.cookies.operadora+"'";
						}
						var fechas;
						filtro_horario_entrada = "WHERE 1=1 ";
						filtro_horario_entrada += " AND us.user_id IN ("+operadores+")";
						reportModel.getHorarioEntrada(fecha_inicio,filtro_horario_entrada,function(err,dataHorarioEntrada){
							reportModel.getHorario(filtro_fecha,function(error,data){
								reportModel.getHorarioExcepcion(filtro,function(errorr,dataExecption){
									var arrFormatExcepciones = helpers.formatExecepcionesOperador(dataExecption);
									var data_ideal_vibox = {};
									var horarioIdeal = helpers.mergeHorarioOperador(dataIDealVicidial,data_ideal_vibox);
									var arrFechas = helpers.extractDateHH(horarioIdeal);
									var arrFechasNombre = helpers.arrFechasNombre(arrFechas);
									var horariosEntrada = helpers.formatArrHorarioEntrada(dataHorarioEntrada);
									var arrTipoHorarioUser = helpersLiquidacion.formatArrHorarioTipoUsuario(dataTipoHorario);
									var arrAplicaSemanaCorridaUser = helpersLiquidacion.formatArrHorarioAplicaSemanaCorrida(dataTipoHorario);
									//var arrHorarioIdeal = helpers.formatHorarioIdeal(arrFechas,fechas);
									var arrHorario = helpers.formatHorarioOp(arrFechas,data,fechas,horarioIdeal,data_real_vibox,result_users,arrFormatExcepciones);
									var filtro_produccion = "WHERE 1=1 ";
									filtro_produccion += " AND mpr_date BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"' AND cvr.cvr_estado=1 and cvr.cvr_id_pais="+req.body.id_pais;
									reportModel.getvaloresProduccion(filtro_produccion,function(error_produccion,dataProduccion){
										var filtro_vibox = "WHERE 1=1";
										filtro_vibox += " AND fecha_llamado BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"'";
										filtro_vibox += " GROUP BY operador,cam.id_cliente,ccli.cliente,cam.id_servicio,cser.servicio,fecha";
										//TODO FALTA COMBINACION DE PRODUCCION VIBOX PARA MOSTRAR EN VISTAS
										reportVibox.getProduccionVibox(filtro_vibox,function(error_vibox,dataProdVibox){
											filtro_valor = "WHERE 1=1 AND cvr_estado=1 and pa.id_pais="+req.body.id_pais;
											reportModel.getValorEfectivos(filtro_valor,function(err_valor,dataValorProduccion){
												var produccion_vibox = helpersLiquidacion.getProduccionCalculadaVibox(dataProdVibox,dataValorProduccion);
												var filtro_calidad = "WHERE 1=1 ";
												filtro_calidad += "AND DATE(orcam.otcam_valor) BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"' AND ev_estado=1 AND ev_nota is not null";
												reportCalidad.getCalidadLiquidacion(filtro_calidad,function(error_calidad,dataCalidad){
													var filtro_tramos = "WHERE 1=1 ";
													filtro_tramos += "AND trc_fecha_inicio <= '"+fecha_inicio+"' AND trc_fecha_inicio < '"+fecha_fin+"' and id_pais="+req.body.id_pais;
													reportModel.getTramosCalidad(filtro_tramos,function(error_tramo,dataTramos){
														var filtro_semanaCorrida = "WHERE pay_date BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"'";
														reportModel.getSemanaCorrida(filtro_semanaCorrida,function(errSemana,dataSemana){
															reportModel.getDetalleUsuarios(operadores,function(errDetalles,dataDetalles){
																reportModel.getPais(req.body.id_pais,function(errorPais,dataPais){
																	var pais = {};
																	if(dataPais.length > 0){
																		pais = dataPais[0];
																	}
																	var arrDetalles = helpersLiquidacion.formatDetalleUsuario(dataDetalles);
																	//console.log(arrHorario);
																	var arrSemanaCorrida = helpersLiquidacion.formatSemanaCorrida(dataSemana,pais);
																	var variables_horarios = {"fechas":arrFechas,"fechas_nombre":arrFechasNombre,"horarios":arrHorario.horario,"globalesDia":arrHorario.globalesDia,"globalesOperador":arrHorario.globalesOperador,
																		"globalesHorario":arrHorario.totales,"operadoresExcepciones":arrHorario.operadoresExcepciones,"cantidadExcepciones":arrHorario.cantidadExcepciones,"horarioEntrada":horariosEntrada,"showEstado":false};
																	var retorno_format = helpersLiquidacion.formatRetorno(variables_horarios.globalesOperador,variables_horarios.horarios,dataProduccion,dataCalidad,dataTramos,produccion_vibox,arrTipoHorarioUser,arrSemanaCorrida,arrDetalles,arrAplicaSemanaCorridaUser);


																	res.status(200).json({list:retorno_format,'pais':pais});
																});
															});
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
}