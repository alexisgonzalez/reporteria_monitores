var reportModel = require('../model/user');
var reportVibox = require('../model/vibox');
var helpers = require('../helpers/helpers');
var helpersMantenedor = require('../helpers/helpersMantenedores');
var helpersLiquidaciones = require('../helpers/helpersLiquidaciones');
var helpersSupervisor = require('../helpers/helpersSupervisor');
var helpersMonitor = require('../helpers/helpersMonitor');
var moment = require('moment');
var _ = require('lodash');

module.exports = function(app){
	app.get("/monitor/getUsers",function(req,res){
		var filtro_users = "WHERE 1=1 ";
		filtro_users += "AND hop.hop_fecha = '"+req.query.fecha_inicio+"' and us.active = 'Y' ";
		reportModel.getUsersHorarioMonitor(filtro_users,function(err,dataUsers){
			res.status(200).json(dataUsers);
		})
	});

	app.get("/monitor/getHorarioUsers",function(req,res){
		var filtro_horario = "WHERE 1=1 "
		filtro_horario += "AND hop.hop_fecha = '"+req.query.fecha_inicio+"' and us.active = 'Y' ";
		reportModel.getHorarioMonitor(filtro_horario,function(error,dataHorario){
			var arrHorario = helpersMantenedor.arrFormatHorario(dataHorario);

			res.status(200).json(arrHorario);
		})
	});

	app.post("/monitor/getHorasOperador",function(req,res){
		var filtro = "";
		var fecha_inicio = req.body.date_begin.split("/").reverse().join("-");
		var fecha_fin = req.body.date_end.split("/").reverse().join("-");
		filtro += "WHERE usde.id_cliente IS NOT NULL AND hop.hop_fecha BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"'";
		if(typeof(req.body.id_cliente) != "undefined")
			filtro += " AND cli.id_cliente = "+req.body.id_cliente;
		if(typeof(req.body.id_servicio) != "undefined")
			filtro += " AND ser.id_servicio = "+req.body.id_servicio;

		reportModel.getCampanaHorasOperador(filtro,function(err,dataHoras){
			reportModel.getCampanaClienteServicioMeta(filtro,function(err_clie,dataClienteServicio){
				var formarArrHoras = helpersMantenedor.formatHorasOperador(dataHoras);

				res.status(200).json({'operadores':formarArrHoras,'servicios':helpersMantenedor.getDataClienteServicio(dataClienteServicio)});
			});
		});
	});

	app.post("/monitor/gestionesProduccion",function(req,res){
		var fecha_inicio = req.body.date_begin.split("/").reverse().join("-");
		var fecha_fin = req.body.date_end.split("/").reverse().join("-");
		var filtro = " WHERE 1=1 ";
		var filtro_campana = "";
		var filtro_fecha = "";
		var cant_days = req.body.cant_days;

		if(req.body.hasOwnProperty("campanasSiodial") && req.body.campanasSiodial.length > 0){
			console.log(req.body.campanasSiodial.length);
			filtro_campana += " AND list_id IN ("+req.body.campanasSiodial.join()+")";
			filtro_campana += " AND campaign_id IN ("+helpers.implodeUser(req.body.campanasVicidial)+")";
			filtro_fecha = " AND mpr_date BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"'";
			filtro += filtro_campana+filtro_fecha;
			flagListas = true;
		}else{
			flagListas = false;
			filtro = "";
		}
		var funcionProduccion = null;

		var flag_horas = (cant_days > 0) ? false:true;

		funcionProduccion = (cant_days > 0) ? reportModel.getProduccionMediasDias: reportModel.getProduccionMediasHoras;
		var campo = (flag_horas) ? "mpr_hour":"mpr_date";
		var filtroBrechas = "WHERE 1=1 AND ";
		filtroBrechas += " cli.id_cliente="+req.body.idCliente+" AND ser.id_servicio="+req.body.idServicio;
		reportModel.getBrechasProduccionGestiones(filtroBrechas,function(errBrechas,dataBrecha){
			funcionProduccion(filtro,function(errDias,dataProduccion){
				reportModel.getProduccionCabezeras(campo,filtro,function(errCampos,dataCabezeras){
					var funcionBitacora = null;
					if(flag_horas){
						funcionBitacora = reportModel.getBitacorasUserDetailHour
						var filtroBit = "WHERE DATE(bop_fecha_ingreso) = '"+fecha_inicio+"' AND inc_id IN (select inc_id from hermes.incidencia_media)";
					}else{
						funcionBitacora = reportModel.getBitacorasUserDetail
						var filtroBit = "WHERE DATE(bop_fecha_ingreso) BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"' AND inc_id IN (select inc_id from hermes.incidencia_media)";
					}			
					funcionBitacora(filtroBit,function(error_bit,dataBitacoras){
						var arrFormatBitacoras = helpersLiquidaciones.formatArrBitacoras(dataBitacoras,flag_horas);
						var arrFormatRetorno = helpersLiquidaciones.formatArrProducciones(dataProduccion,flag_horas);

						arrFormatRetorno = helpersLiquidaciones.formatProduccionesIndicador(arrFormatRetorno,flag_horas);


						var arrGlobalesOperador = helpersLiquidaciones.formatGlobalesProduccion(arrFormatRetorno,dataBrecha);

						var arrGlobalesColumnas = helpersLiquidaciones.formatGlobalesProduccionColumnas(arrFormatRetorno,dataCabezeras,flag_horas);
						var maximoColumnas = helpersLiquidaciones.formatMaximosColumnas(arrFormatRetorno,dataCabezeras,flag_horas);
						var arrGlobalesTotal = helpersLiquidaciones.formatGlobalesProduccionTotal(arrFormatRetorno);
						
						arrFormatRetorno = helpersLiquidaciones.asignarBrechas(arrFormatRetorno,dataBrecha,maximoColumnas);

						res.status(200).json({data:arrFormatRetorno,cabezeras:dataCabezeras,bitacoras:arrFormatBitacoras,globalesOperador:arrGlobalesOperador,globalesColumnas:arrGlobalesColumnas,globalTotal:arrGlobalesTotal});
					});
				})
			})
		});
	});

	app.post("/monitor/gestionesProduccionReal",function(req,res){
		var fecha_inicio = moment().format("YYYY-MM-DD");
		var fecha_fin = moment().format("YYYY-MM-DD");
		//var fecha_inicio = moment().format("2017-05-11");
		//var fecha_fin = moment().format("2017-05-11");
		var filtro = " WHERE 1=1 ";
		var filtro_campana = "";
		var filtro_fecha = "";
		var cant_days = 0;

		/* recorrer campanas de media_produccion y mover posicion **/
		reportModel.getCampanasDelDia(fecha_inicio,function(err,dataCampanas){
			reportModel.getPosicionCampana(function(errorPos,dataPosicion){
				var pos = dataPosicion[0].posicion;
				console.log(dataCampanas,pos);
				if(dataCampanas.length > 0){
					var campana = (typeof(dataCampanas[pos].campaign_id) != "undefined") ? dataCampanas[pos].campaign_id:dataCampanas[pos-1].campaign_id;
					var campana_nombre = (typeof(dataCampanas[pos].campaign_name) != "undefined") ? dataCampanas[pos].campaign_name:dataCampanas[pos-1].campaign_name;
					var id_servicio = campana.substr(2,2);
					var id_cliente = campana.substr(0,2);
					var funcionProduccion = null;

					filtro += " AND campaign_id IN ('"+campana+"')";
					filtro += " AND mpr_date BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"'";
					var flag_horas = (cant_days > 0) ? false:true;

					funcionProduccion = (cant_days > 0) ? reportModel.getProduccionMediasDias: reportModel.getProduccionMediasHoras;
					var campo = (flag_horas) ? "mpr_hour":"mpr_date";
					var filtroBrechas = "WHERE 1=1 AND ";
					filtroBrechas += " cli.id_cliente="+id_cliente+" AND ser.id_servicio="+id_servicio;
					reportModel.getBrechasProduccionGestiones(filtroBrechas,function(errBrechas,dataBrecha){
						funcionProduccion(filtro,function(errDias,dataProduccion){
							reportModel.getProduccionCabezeras(campo,filtro,function(errCampos,dataCabezeras){
								var funcionBitacora = null;
								if(flag_horas){
									funcionBitacora = reportModel.getBitacorasUserDetailHour
									var filtroBit = "WHERE DATE(bop_fecha_ingreso) = '"+fecha_inicio+"' AND inc_id IN (select inc_id from hermes.incidencia_media)";
								}else{
									funcionBitacora = reportModel.getBitacorasUserDetail
									var filtroBit = "WHERE DATE(bop_fecha_ingreso) BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"' AND inc_id IN (select inc_id from hermes.incidencia_media)";
								}			
								funcionBitacora(filtroBit,function(error_bit,dataBitacoras){
									filtro_2 = "WHERE 1=1 ";
									reportModel.getSupOperador(filtro_2,function(err,dataSupervisor){
										var arrUsuarioSuper = helpersLiquidaciones.formatArrUsuarioSupervisor(dataSupervisor);
										var arrFormatBitacoras = helpersLiquidaciones.formatArrBitacoras(dataBitacoras,flag_horas);
										var arrFormatRetorno = helpersLiquidaciones.formatArrProducciones(dataProduccion,flag_horas);

										arrFormatRetorno = helpersLiquidaciones.formatProduccionesIndicador(arrFormatRetorno,flag_horas);


										var arrGlobalesOperador = helpersLiquidaciones.formatGlobalesProduccion(arrFormatRetorno,dataBrecha);

										var arrGlobalesColumnas = helpersLiquidaciones.formatGlobalesProduccionColumnas(arrFormatRetorno,dataCabezeras,flag_horas);
										var maximoColumnas = helpersLiquidaciones.formatMaximosColumnas(arrFormatRetorno,dataCabezeras,flag_horas);
										var arrGlobalesTotal = helpersLiquidaciones.formatGlobalesProduccionTotal(arrFormatRetorno);
										
										arrFormatRetorno = helpersLiquidaciones.asignarBrechas(arrFormatRetorno,dataBrecha,maximoColumnas);

										res.status(200).json({data:arrFormatRetorno,cabezeras:dataCabezeras,bitacoras:arrFormatBitacoras,globalesOperador:arrGlobalesOperador,globalesColumnas:arrGlobalesColumnas,globalTotal:arrGlobalesTotal,"campana":campana,"campana_nombre":campana_nombre
											, "supervisores":arrUsuarioSuper});
									})
								});
							})
						})
					});
				}else{
					res.status(200).json({data:{},cabezeras:{},bitacoras:{},globalesOperador:{},globalesColumnas:{},globalTotal:{},"campana":{},"campana_nombre":{}
											, "supervisores":{}});
				}
			});
		});
	});

	app.get("/monitor/metas",function(req,res){
		var fecha_inicio = moment().format("YYYY-MM-01");
		var fecha = moment().format("DD/MM/YYYY");
		var fecha_fin = helpersMantenedor.ultimoDiaMesFecha(fecha_inicio);
		var id_cliente = (parseInt(req.query.id_cliente) < 10) ? "0"+req.query.id_cliente:req.query.id_cliente;
		var id_servicio = (parseInt(req.query.id_servicio) < 10) ? "0"+req.query.id_servicio:req.query.id_servicio;
		var campaign_id = id_cliente+id_servicio;
		var filtroMeta = "WHERE 1=1 ";
		filtroMeta += "AND id_cliente="+id_cliente+" AND id_servicio="+id_servicio;
		filtroMeta += " AND met_dia_fecha BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"'";
		reportModel.getMetasDia(filtroMeta,function(err,dias){
			var filtro = "WHERE 1=1 AND campaign_id like '"+campaign_id+"%'";
			filtro += " AND mpr_date BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"' ";
			reportModel.getProduccionMediasDiasMeta(filtro,function(error,data_siodial){
				var arrMeta = helpersLiquidaciones.formatMetas(dias);
				var arrFormatTabla = helpersLiquidaciones.formatTablaMonitMeta(dias,data_siodial);
				var hashMediasCampaign = helpersLiquidaciones.getFormatMediaMetas(dias,data_siodial,fecha);
				var arrGlobal = helpersLiquidaciones.formatTablaMonitMetaGlobal(dias,data_siodial,fecha);
				res.status(200).json({metas:arrMeta,medias:hashMediasCampaign,tabla:arrFormatTabla,global:arrGlobal});
			});
		});
	});

	app.post("/monitor/tiempoReal", function(req,res){
		var filtroCam = "";
		if(typeof(req.body.campanas) != "undefined" && req.body.campanas != []){
			filtroCam = " AND liv.campaign_id IN ("+helpersSupervisor.implodeCampanas(req.body.campanas)+") ";
		}
		var fecha = moment().format("YYYY-MM-DD");
		reportModel.getMonitorMediaCampana(filtroCam,function(error,dataMonitor){
			filtro = "AND hop_fecha = '"+fecha+"' ";
			reportModel.getHorarioIdeal(filtro, function(error,data_ideal_vici){
				var filtro_real_vicidial = " AND mpr_date ='"+fecha+"'";
				reportModel.getHorarioDomo(filtro_real_vicidial,function(error,data_real_vicidial){
					var formatAdhe = helpersSupervisor.formatAdherencia(data_ideal_vici,data_real_vicidial);
					var formatGlobales = helpersSupervisor.formatGlobalesMonitor(dataMonitor);
					dataMonitor = helpersSupervisor.addColorCampana(dataMonitor);
					res.status(200).json({monitor:dataMonitor,adherencia:formatAdhe,globales:formatGlobales});
				});
			});
		});
	});

	app.get("/monitor/campanasTiempoReal",function(req,res){
		reportModel.getMonitorCampana(function(error,dataCampana){
			res.status(200).json(dataCampana);
		});
	});

	app.get("/monitor/buscarPreferencias", function(req,res){
		var fecha = moment().format("DD/MM/YYYY");
		console.log(fecha);
		var filtrop = "WHERE user_id="+req.cookies.user_id;
		reportModel.getListaPreferenciaMetas(filtrop,function(error, preferencias){
			if(preferencias.length==0)
				res.status(200).json({preferencias:false});
			else
				res.status(200).json({preferencias:true});
		});
	});

	app.get("/monitor/metasDiarias", function(req,res){
		var fecha = moment().format("DD/MM/YYYY");
		console.log(fecha);
		var filtrop = "WHERE user_id="+req.cookies.user_id;
		reportModel.getListaPreferenciaMetas(filtrop,function(error, preferencias){
			var filtro = "WHERE MONTH(met_dia_fecha)=MONTH(CURDATE()) AND YEAR(met_dia_fecha)=YEAR(CURDATE())";
			reportModel.getListaMetas(filtro, function(err, metas){
				filtroMedia = "WHERE MONTH(mpr_date)=MONTH(CURDATE()) AND YEAR(mpr_date)=YEAR(CURDATE())";
				reportModel.getProduccionMediasDiasMeta(filtroMedia,function(error,medias){
					var filtroColor = "WHERE cme_estado=1";
					reportModel.getListaColorMetas(filtroColor, function(errr, color){
						var arrMeta = helpersMonitor.formatMetas(preferencias,metas);
						var arrMedias = helpersMonitor.formatMediaMetas(preferencias,medias,fecha);
						var arrGlobal = helpersMonitor.formatMetaGlobal(preferencias,metas,medias,fecha,color);
						res.status(200).json({preferencias:preferencias, metas:arrMeta, medias:arrMedias, global: arrGlobal});
					});
				});
			});
		});
	});

	app.post("/monitor/guardarPreferenciasMetas", function(req,res){
		console.log(req);
		if(req.body!=''){
			console.log('aqui');
			var insert ='';
			if(req.body.hasOwnProperty("id_cliente1") && req.body.id_cliente1 != "")
			{
				if(insert!='') insert+=',';
				else insert="\
				INSERT INTO hermes.prueba_prefrencias_metas (id_cliente,id_servicio,monitor,user_id) VALUES";
				insert+="\
				("+req.body.id_cliente1+", "+req.body.id_servicio1+",1,"+req.cookies.user_id+")\
				";
			}
			if(req.body.hasOwnProperty("id_cliente2") && req.body.id_cliente2 != "")
			{
				if(insert!='') insert+=',';
				else insert="\
				INSERT INTO hermes.prueba_prefrencias_metas (id_cliente,id_servicio,monitor,user_id) VALUES";
				insert+="\
				("+req.body.id_cliente2+", "+req.body.id_servicio2+",2,"+req.cookies.user_id+")\
				";
			}
			if(req.body.hasOwnProperty("id_cliente3") && req.body.id_cliente3 != "")
			{
				if(insert!='') insert+=',';
				else insert="\
				INSERT INTO hermes.prueba_prefrencias_metas (id_cliente,id_servicio,monitor,user_id) VALUES";
				insert+="\
				("+req.body.id_cliente3+", "+req.body.id_servicio3+",3,"+req.cookies.user_id+")\
				";
			}
			if(req.body.hasOwnProperty("id_cliente4") && req.body.id_cliente4 != "")
			{
				if(insert!='') insert+=',';
				else insert="\
				INSERT INTO hermes.prueba_prefrencias_metas (id_cliente,id_servicio,monitor,user_id) VALUES";
				insert+="\
				("+req.body.id_cliente4+", "+req.body.id_servicio4+",4,"+req.cookies.user_id+")\
				";
			}
			console.log(insert);
			reportModel.executeQuery(insert, function(err, data){
				if(!err)
					res.status(200).json({save:true});
				else
					res.status(200).json({save:false});
			});
		}
		
	});

	app.get("/monitor/adherencia",function(req,res){
		var fecha = moment().format("YYYY-MM-DD");
		var hora = moment().format('H:mm:ss');
		var hora_format = moment().format('Hms');

		var filtroHorarioIdeal = "and hop_fecha = '"+fecha+"' and hop_inicio <= time(now())";
		//var filtroHorarioIdeal = "and hop_fecha = '"+fecha+"' and hop_inicio <= '18:00:00'";
		var filtroPreferencias = "";
		if(typeof(req.query.todas) == "undefined")
			filtroPreferencias = " and COALESCE( concat(lpad(id_cliente,2,'0'),lpad(id_servicio,2,'0')),'S/C') IN (select campana from hermes.campana_monitor_adherencia WHERE user_id="+req.cookies.user_id+")";
		reportModel.getUsuarioCampanaMonitor(filtroPreferencias,function(err,dataOperadoraCampana){
			var formatUserByCampana = helpersSupervisor.formatUserByCampana(dataOperadoraCampana);
			reportModel.getHorarioIdealMonitorAdhe(filtroHorarioIdeal,function(errorIdeal,dataHorarioIdeal){
				reportModel.getHorarioRealMonitor(fecha,function(errReal,dataHorarioReal){
					var formatAdherenciaReal = helpersSupervisor.getAdherenciaMonitorReal(dataHorarioReal);
					var formatAdherenciaIdeal = helpersSupervisor.getAdherenciaMonitor(dataHorarioIdeal,formatUserByCampana);

					//combinar datos combinar datos
					var formatAdherenciaTotal = helpersSupervisor.getMergeAdherencia(formatAdherenciaIdeal,formatAdherenciaReal);
					filtro_fecha_2 = " AND hop_fecha = '"+fecha+"'";
					reportModel.getHorarioExcepcion(filtro_fecha_2,function(errorr,dataExecption){
						reportModel.getCampanas(function(error,dataCampana){
							var arrFormatCampana = helpersSupervisor.formatCampana(dataCampana);
							var arrFormatExcepciones = helpers.formatExecepcionesOperador(dataExecption);
							var extractExcepcionCampana = helpersSupervisor.getExtractExcepciones(arrFormatExcepciones,formatUserByCampana,fecha,formatAdherenciaTotal);
							var arrDefinitivoMonitor = helpersSupervisor.getArrayDefinitivoMonitor(formatAdherenciaTotal,extractExcepcionCampana)
							res.status(200).json({adheData:arrDefinitivoMonitor,campana:arrFormatCampana});
						});
					});
				});
			});
		});
	});
	app.post("/monitor/guardarPreferenciasAdherencia", function(req,res){
		console.log(req.body);
		var insert = helpersMonitor.formatoInsertarPreferencias(req.body,req.cookies.user_id);
		reportModel.executeQuery(insert, function(err, data){
			if(!err)
				res.status(200).json({save:true});
			else
				res.status(200).json({save:false});
		});
	});

	app.get("/monitor/buscarPreferenciasAdherencia", function(req,res){
		var filtrop = "WHERE user_id="+req.cookies.user_id;
		reportModel.getListaPreferenciaAdherencia(filtrop,function(error, preferencias){
			if(preferencias.length==0)
				res.status(200).json({preferencias:false});
			else
				res.status(200).json({preferencias:true});
		});
	});

	app.post("/monitor/llamadosGraph",function(req,res){
		var filtro = "";
		if(typeof(req.body.campanas) != "undefined" && req.body.campanas.length > 0){
			filtro += " AND campaign_id IN ("+helpersSupervisor.implodeCampanas(req.body.campanas)+") ";
		}
		reportModel.getDataGraficoLlamado(filtro,function(err,dataGrafico){
			var formatDataGraph = helpersSupervisor.getDatGrafico(dataGrafico);
			res.status(200).json(formatDataGraph);
		});
	});
}