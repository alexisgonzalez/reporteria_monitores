var reportModel = require('../model/user');
var reportVibox = require('../model/vibox');
var reportControlCalidad = require('../model/control_calidad');
var helpersDomo = require('../helpers/helpersDomo');
var helpersCalidad = require('../helpers/helpersCalidad');
module.exports = function (app){
	app.post("/getDomo",function (req,res){
		//TRAER MEDIAS
		var filtro_usuarios_activos = ""
		if(req.body.hasOwnProperty("omitUsers") && req.body.omitUsers){
			req.body.omitUsers.forEach(function (usuario_omitido) {
				filtro_usuarios_activos += " and user not like '"+usuario_omitido+"'";
			})
		}
		if(req.body.hasOwnProperty("userActive") && req.body.userActive){
			filtro_usuarios_activos += " AND active='Y'";
		}
		reportModel.getUsersHorario(filtro_usuarios_activos,function(error,user_activos){
			var lista_operadoras = helpersDomo.implodeUsuarios(user_activos);
			var fecha_inicio = req.body.date_begin.split("/").reverse().join("-");
			var fecha_fin = req.body.date_end.split("/").reverse().join("-");
			var campana = "";
			var flag_minimo = false;
			filtro = " AND mpr_date BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"'";
			filtro += " AND mpr_user IN ("+lista_operadoras+") ";
			if(req.body.hasOwnProperty("idCliente") && req.body.idCliente != ""){
				campana += req.body.idCliente.toString();
			}
			if(req.body.idCliente.toString().length  == 1){
				campana = "0"+req.body.idCliente.toString();
			}
			if(req.body.hasOwnProperty("is_tiempo_minimo") && req.body.is_tiempo_minimo){
				flag_minimo = true;
			}
			if(req.body.hasOwnProperty("idServicio") && req.body.idServicio != ""){
				console.log(req.body.idServicio.toString().length);
				if(req.body.idServicio.toString().length  == 1)
					campana += "0"+req.body.idServicio.toString();
				else
					campana += req.body.idServicio.toString();
			}
			if(campana != ""){
				filtro += " AND media_produccion.campaign_id like '"+campana+"%' ";
			}
			if(req.body.hasOwnProperty("id_supervisor") && req.body.id_supervisor != "" && req.body.id_supervisor != "Todos"){
				filtro += " AND REPLACE(sup.usuario_codigo,'.','') = REPLACE('"+req.body.id_supervisor+"','.','') ";
			}
			var filtro_contactados = " WHERE 1=1";
			filtro_contactados += " AND esc.id_servicio = "+req.body.idServicio;
			reportVibox.getEstadosContactados(filtro_contactados,function(error,dataEstadosContactados){
				reportModel.getMediasDomo(filtro,function(error,data_siodial){
					var filtro_vibox = " WHERE 1=1 AND operador not like 'entrenamiento%' ";
					filtro_vibox += " AND fecha_llamado BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"'";
					if(req.body.hasOwnProperty("idCliente") && req.body.idCliente != ""){
						filtro_vibox += " AND cam.id_cliente = "+req.body.idCliente;
					}
					if(req.body.hasOwnProperty("idServicio") && req.body.idServicio != ""){
						filtro_vibox += " AND cam.id_servicio = "+req.body.idServicio;
					}
					if(req.body.hasOwnProperty("id_supervisor") && req.body.id_supervisor != "" && req.body.id_supervisor != "Todos"){
						filtro_vibox += " AND REPLACE(sup.usuario_codigo,'.','') = REPLACE('"+req.body.id_supervisor+"','.','') ";
					}
					filtro_vibox += " AND operador IN ("+lista_operadoras+") ";
					reportVibox.getMediasDomo(filtro_vibox,function(error,data_vibox){
						var filtro_dato_domo = "WHERE 1=1 AND operador not like 'entrenamiento%' ";
						filtro_dato_domo += " AND fecha_llamado BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+" 23:59:59' and (operador  <> '' and operador is not null)";
						filtro_dato_domo += " and (cam.observacion is null or cam.observacion <> 'Vicidial')";
						if(req.body.hasOwnProperty("idCliente") && req.body.idCliente != ""){
							filtro_dato_domo += " AND cam.id_cliente = "+req.body.idCliente;
						}
						if(req.body.hasOwnProperty("idServicio") && req.body.idServicio != ""){
							filtro_dato_domo += " AND cam.id_servicio = "+req.body.idServicio;
						}
						reportVibox.getDatosDomo(filtro_dato_domo,function(error,dato_tabla_domo){
							filtro_calidad = "'"+fecha_inicio+"','"+fecha_fin+"',"+req.body.idCliente+","+req.body.idServicio+",1";
							reportControlCalidad.getPorcentajeCalidad(filtro_calidad,function(error,dataCalidad){
								reportControlCalidad.getActitudesCriticas(filtro_calidad,function(error,dataActitudes){
									var arrEstadosContactados = helpersDomo.formatArrEstadosContactados(dataEstadosContactados);
									var arrSiodial = helpersDomo.reFormatMediasDomo(data_siodial,data_vibox,dato_tabla_domo,flag_minimo,req.body.tiempo_minimo,arrEstadosContactados);
									console.log("arrSiodial",arrSiodial);
									if(!arrSiodial.valido){
										res.status(200).json(arrSiodial);
										return false;
									}
									arrSiodial.fecha_inicio = fecha_inicio;
									arrSiodial.fecha_fin = fecha_fin;
									
									var retCalidad = helpersCalidad.formatArrCalidad(dataCalidad);
									arrSiodial.actitudes = helpersCalidad.formatArrActitudes(dataActitudes);;

									arrSiodial.calidad = retCalidad[0];
									var arrCuartilCalidad = retCalidad[1];
									var filtro_estado = "WHERE 1=1 ";
									filtro_estado += "AND estado IN ("+helpersDomo.implodeEstado(arrSiodial.estado_tmo)+")";
									reportVibox.getEstados(filtro_estado,function(error,datosEstadoDomo){
										//filtro = "WHERE opt.opt_fec_fecha >= '"+fecha_inicio+"' and opt.opt_fec_fecha <= '"+fecha_fin+"'";
										filtro = "AND hop_fecha >= '"+fecha_inicio+"' and hop_fecha <= '"+fecha_fin+"'";
										//reportVibox.getHorariosIdealVibox(false,filtro, function(error,data_ideal_vibox){
										reportModel.getHorarioIdeal(filtro, function(error,data_ideal_vici){
											var filtro_real_vibox = "where med.fecha_llamado BETWEEN  '"+fecha_inicio+"' and '"+fecha_fin+"'";
											reportVibox.getHorariosRealViboxDomo(filtro_real_vibox,function(error,data_real_vibox){
												var filtro_real_vicidial = " AND mpr_date BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"'";
												reportModel.getHorarioDomo(filtro_real_vicidial,function(error,data_real_vicidial){
													var filtro_contrato = "";
													var arrRealOperador = helpersDomo.formatArrHorarioRealOperador(data_real_vibox,data_real_vicidial);
													arrSiodial.medias.tabla = helpersDomo.formatArrAdherencia(arrSiodial.medias.tabla,data_ideal_vici,arrRealOperador);
													arrSiodial.medias.tabla = helpersDomo.colocarCuartilAdhe(arrSiodial.medias.tabla,arrCuartilCalidad,arrSiodial.calidad);
													filtro_contrato += "WHERE 1=1 AND usuario_codigo IN ("+lista_operadoras+") ";
													arrSiodial.estado_tmo = datosEstadoDomo;
													reportModel.getFechaContrato(filtro_contrato,function(error,data_contratacion){
														reportModel.getPuntajesNotas(function(error,dataPuntajes){
															var filtro_horario_entrada = "";
															filtro_horario_entrada += "WHERE 1=1 ";
															filtro_horario_entrada += " AND us.`user` IN ("+lista_operadoras+")";
															reportModel.getHorarioEntrada(fecha_inicio,filtro_horario_entrada,function(err,dataHorarioEntrada){
																arrSiodial.puntajes = helpersDomo.formatArrPuntajes(dataPuntajes);
																arrSiodial.fecha_ingreso = helpersDomo.formatArrFechaIngresos(data_contratacion);
																arrSiodial.horario_real = arrRealOperador;
																arrSiodial.hora_ingreso = helpersDomo.formatArrHorarioEntrada(dataHorarioEntrada);
																res.status(200).json(arrSiodial);
															});
														});
													});
												});
											})
										});
									});
								});
							})
						})
					})
				});
			})
		});
	})
}
