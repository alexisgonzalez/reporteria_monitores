var reportModel = require('../model/user');
var reportVibox = require('../model/vibox');
var helpers = require('../helpers/helpers');
var helpersAudios = require('../helpers/helpersAudios');
var helpersMantenedor = require('../helpers/helpersMantenedores');
var _ = require('lodash');
module.exports = function(app){

	app.post("/login_verified",function(req,res){
		var filtro = 'WHERE 1=1 AND ';
		filtro +="`user`= '"+req.body.user+"' AND pass='"+req.body.password+"'";
		reportModel.getUserLogin(filtro,function(error,rows){

			if(rows.length > 0){
				//var user_id = (req.body.user == '6666') ? 124:rows[0].user_id; // TRUCO PARA SER SUPERVISOR
				var user_id = rows[0].user_id; // TRUCO PARA SER SUPERVISOR
				var nivel_usuario = parseInt(rows[0].user_level);
				res.cookie('nivel', parseInt(nivel_usuario), { expire : new Date() + 9999 });
				res.cookie('operadora', req.body.user, { expire : new Date() + 9999 });
				res.cookie('nombre', rows[0].full_name, { expire : new Date() + 9999 });
				res.cookie('user_id', parseInt(user_id), { expire : new Date() + 9999 });
				if(nivel_usuario > 3){
					reportModel.getUserIsSupervisor(user_id,function(err,rowSup){
						reportModel.getCamposDomoUser(user_id,function(erro,dataCampos){
							if(dataCampos.length > 0){
								var listCamposDomo = helpersMantenedor.arrListCamposDomo(dataCampos);
								res.cookie('campos_domo', JSON.stringify(listCamposDomo), { expire : new Date() + 9999 });
							}else
								res.cookie('campos_domo', parseInt(0), { expire : new Date() + 9999 });
							if(rowSup.length > 0)
								res.cookie('supervisor', parseInt(1), { expire : new Date() + 9999 });
							else
								res.cookie('supervisor', parseInt(0), { expire : new Date() + 9999 });
							res.redirect("/");
						});
					});
				}else if(nivel_usuario == 2 || nivel_usuario == 3){
					reportModel.getClienteServicioUser(user_id,function(error,dataClienteServicio){
						res.cookie('clientes',JSON.stringify(dataClienteServicio), { expire : new Date() + 9999 });
						res.redirect("/");
					});
				}else{
					res.redirect("/");
				}
			}else{
				res.redirect("/");
			}
		})
	});

	app.post("/login_verified2",function(req,res){
		var filtro = ' ';
		filtro +="WHERE `user`= '"+req.body.user+"' AND pass='"+req.body.password+"'";
		reportModel.getLogin(filtro,function(error,rows){
		if(rows.length > 0){
				//var user_id = (req.body.user == '6666') ? 124:rows[0].user_id; // TRUCO PARA SER SUPERVISOR
				var user_id = rows[0].user_id; // TRUCO PARA SER SUPERVISOR
				var nivel_usuario = parseInt(rows[0].per_id_perfil);
				var id_pais = rows[0].id_pais; // TRUCO PARA SER SUPERVISOR
				var p_calend = 15;
				res.cookie('nivel', parseInt(nivel_usuario), { expire : new Date() + 9999 });
				res.cookie('operadora', req.body.user, { expire : new Date() + 9999 });
				res.cookie('nombre', rows[0].full_name, { expire : new Date() + 9999 });
				res.cookie('user_id', parseInt(user_id), { expire : new Date() + 9999 });
				res.cookie('id_pais', parseInt(id_pais), { expire : new Date() + 9999 });
				res.cookie('p_calendar', parseInt(p_calend), { expire : new Date() + 9999 });

				reportModel.getClienteServicioUser(user_id,function(error,dataClienteServicio){
					if(dataClienteServicio.length > 0)
						res.cookie('clientes',JSON.stringify(dataClienteServicio), { expire : new Date() + 9999 });
					else{
						res.clearCookie('clientes');
					}
					if(nivel_usuario > 3){
						reportModel.getUserIsSupervisor(user_id,function(err,rowSup){
							reportModel.getCamposDomoUser(user_id,function(erro,dataCampos){
								if(dataCampos.length > 0){
									var listCamposDomo = helpersMantenedor.arrListCamposDomo(dataCampos);
									res.cookie('campos_domo', JSON.stringify(listCamposDomo), { expire : new Date() + 9999 });
								}else
								res.cookie('campos_domo', parseInt(0), { expire : new Date() + 9999 });
								if(rowSup.length > 0)
									res.cookie('supervisor', parseInt(1), { expire : new Date() + 9999 });
								else
									res.cookie('supervisor', parseInt(0), { expire : new Date() + 9999 });
								res.redirect("/");
							});
						});
					}else{
						res.redirect("/");
					}
				});
			}else{
				res.redirect("/");
			}
		})
	});

	app.get("/get_data_user",function(req,res){
		var filtro = 'WHERE 1=1 AND ';
		filtro +="`user`= '"+req.query.operador+"'";
		reportModel.getUser(filtro,function(error,rows){
			res.status(200).json({"user":rows[0]});
		});
	});

	app.get("/get_usuarios_activos",function(req,res){
		var filtro = "WHERE 1=1 AND active = 'Y' and us.user not like '%namiento%'";
		reportModel.getListUser(filtro,function(error,rows){
			res.status(200).json(rows);
		});
	});

	app.get('/logout',function(req,res){
		var delete_meta="delete from hermes.prueba_prefrencias_metas where user_id="+req.cookies.user_id;
		console.log(delete_meta);
		var delete_ad="delete from hermes.campana_monitor_adherencia where user_id="+req.cookies.user_id;
		console.log(delete_ad);
		reportModel.executeQuery(delete_meta, function(errd, dm){
			reportModel.executeQuery(delete_ad, function(errd, d){
				res.clearCookie('operadora');
				res.clearCookie('nivel');
				res.clearCookie('campanas');
				res.redirect("/");
			});
		});
	});

	app.get("/setSession",function(req,res){
		if (req.query.operadora){
		 	res.cookie('operadora', req.query.operadora, { expire : new Date() + 9999 });
		 	res.cookie('nivel', 1, { expire : new Date() + 9999 });
  			res.redirect('/ope');
  		}else{
  			res.status(404).send("Sitio no encontrado");
  		}
	});

	app.post("/reportMedias",function(req,res){
		console.log("res.cookie",req.cookies);
		var oper_alone = "";
		if(Object.keys(req.cookies).length > 0 && req.cookies.hasOwnProperty("operadora") && req.cookies.operadora != "undefined" && parseInt(req.cookies.nivel) == 1){
			oper_alone = req.cookies.operadora;
		}
		var filtro_campana = "";
		var filtro_user = "";
		var filtro_fecha = "";
		var filtro = "";
		var fecha_inicio = req.body.date_begin.split("/").reverse().join("-");
		var fecha_fin = req.body.date_end.split("/").reverse().join("-");
		var flagListas = false;
		if(!req.body.hasOwnProperty("users") || req.body.users.length > 0){
			filtro_user = " AND mpr_user IN ("+helpers.implodeUser(req.body.users)+")";
		}
		if(oper_alone != ""){
			filtro_user = " AND mpr_user = '"+oper_alone+"'";
		}

		if(req.body.hasOwnProperty("campanasSiodial") && req.body.campanasSiodial.length > 0){
			console.log(req.body.campanasSiodial.length);
			filtro_campana += " AND list_id IN ("+req.body.campanasSiodial.join()+")";
			filtro_campana += " AND media_produccion.campaign_id IN ("+helpers.implodeUser(req.body.campanasVicidial)+")";
			filtro_fecha = " AND mpr_date BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"'";
			filtro = filtro_user+filtro_campana+filtro_fecha;
			flagListas = true;
		}else{
			flagListas = false;
			filtro = "";
		}

		reportModel.getMedias(filtro,function(error,data_siodial){
			var filtro_vibox = " WHERE 1=1 ";
			filtro_vibox += " AND fecha_llamado BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"'";
			if(!req.body.hasOwnProperty("users") || req.body.users.length > 0){
				filtro_vibox += " AND med.operador IN ("+helpers.implodeUser(req.body.users)+")";
			}
			if(req.body.hasOwnProperty("campanasVibox") && req.body.campanasVibox.length > 0){
				filtro_vibox += " AND med.id_campana IN ("+req.body.campanasVibox.join()+")";
			}else{
				filtro_vibox = "";
			}

			reportVibox.getMedias(filtro_vibox,function(error,data_vibox){
				var nivel = req.cookies.nivel;
				var servicio_id = (parseInt(req.body.idServicio) < 10) ? req.body.idServicio: "0"+req.body.idServicio;
				var cliente_id = (parseInt(req.body.cliente_id) < 10) ? req.body.cliente_id : "0"+req.body.cliente_id;
				var filtroTotal = " AND date(call_date) BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"'"
				var arrSiodial = helpers.reFormatMedia(data_siodial,data_vibox,false,null,false,null);
				if(flagListas){
					filtroTotal += "and list_id IN ("+req.body.campanasSiodial.join()+")";
					reportModel.getTotalLlamadosCampaña(filtroTotal,function(error_total,dataTotal){
						arrSiodial = helpers.addRecorridos(arrSiodial,dataTotal[0].numero_llamadas)
						res.status(200).json(arrSiodial);
					});
				}else{
					res.status(200).json(arrSiodial);
					filtroTotal += "and list_id IN ('nada')";
				}
			});
		});
	});

	app.get("/getCampanas",function(req,res){
		reportModel.getCampanas(function(error,data){
			res.status(200).json(data);
		});
	});

	app.get("/getCampanasVicidial",function(req,res){
		var id_cliente = (parseInt(req.query.id_cliente) < 10) ? "0"+req.query.id_cliente:req.query.id_cliente;
		var id_servicio = (parseInt(req.query.id_servicio) < 10) ? "0"+req.query.id_servicio:req.query.id_servicio;
		var campaign_id = id_cliente+id_servicio;
		var filtro = " AND campaign_id like '"+campaign_id+"%' ";
		reportModel.getCampanasVicidial(filtro,function(error,data){
			res.status(200).json(data);
		});
	});

	app.post('/getUsers',function(req,res){
		var filtro_user = "WHERE 1=1";
		var campana = "";
		var fecha_inicio = req.body.date_begin.split("/").reverse().join("-");
		var fecha_fin = req.body.date_end.split("/").reverse().join("-");
		if(Object.keys(req.cookies).length > 0 && req.cookies.hasOwnProperty("operadora") && req.cookies.operadora != "undefined" && parseInt(req.cookies.nivel) == 1){
			filtro_user += " AND user='"+req.cookies.operadora+"'";
		}
		if(req.body.hasOwnProperty("idCliente") && req.body.idCliente != ""){
			campana += req.body.idCliente.toString();
		}
		if(req.body.hasOwnProperty("idServicio") && req.body.idServicio != ""){
			console.log(req.body.idServicio.toString().length);
			if(req.body.idServicio.toString().length  == 1)
				campana += "0"+req.body.idServicio.toString();
			else
				campana += req.body.idServicio.toString();
		}
		if(campana != ""){
			filtro_user += " AND med.campaign_id ="+campana;
		}
		
		filtro_user += " AND med.mpr_date BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"'";
		reportModel.getUsers(filtro_user,function(error,data){
			var filtro = "WHERE 1=1";
			if(req.body.hasOwnProperty("date_begin") && req.body.date_begin != ""){
				filtro += " AND med.fecha_llamado BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"'";
			}
			if(Object.keys(req.cookies).length > 0 && req.cookies.hasOwnProperty("operadora") && req.cookies.operadora != "undefined" && parseInt(req.cookies.nivel) == 1){
				filtro += " AND med.operador='"+req.cookies.operadora+"'";
			}
			if(req.body.hasOwnProperty("idCliente") && req.body.idCliente != ""){
				filtro += " AND cam.id_cliente = "+req.body.idCliente;
			}
			if(req.body.hasOwnProperty("idServicio") && req.body.idServicio != ""){
				filtro += " AND cam.id_servicio = "+req.body.idServicio;
			}
			reportVibox.getUsersVibox(filtro,function(error,data2){
				var result = helpers.mergeOperador(data,data2);
				res.status(200).json(result);
			});
		});
	});

	app.post("/reportHorario",function(req,res){
		console.log(req.query);
		console.log(req.body);
		var fecha_inicio = req.body.date_begin.split("/").reverse().join("-");
		var fecha_fin = req.body.date_end.split("/").reverse().join("-");
		var filtro_users = "";
		filtro_users += " and (usde.usde_fec_despido > '"+fecha_inicio+"' or usde.usde_fec_despido = '0000-00-00' or usde.usde_fec_despido is null)";
		if(req.body.hasOwnProperty("userActive") && req.body.userActive){
			filtro_users += " AND us.active='Y' ";
		}
		if(Object.keys(req.cookies).length > 0 && req.cookies.hasOwnProperty("operadora") && req.cookies.operadora != "undefined" && parseInt(req.cookies.nivel) == 1){
			filtro_users += " AND us.user='"+req.cookies.operadora+"' ";
		}
		if(typeof(req.body.operadores) != "undefined"){
			filtro_users += " AND us.user IN ("+helpers.implodeUser(req.body.operadores)+") ";
		}
		reportModel.getUsersHorario(filtro_users,function(error,dataUser){
			var filtro_user_vibox = "WHERE 1=1";
			filtro_user_vibox += " AND med.fecha_llamado BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"' AND operador NOT LIKE '%amiento%' AND operador not like '%prueba'";
			if(Object.keys(req.cookies).length > 0 && req.cookies.hasOwnProperty("operadora") && req.cookies.operadora != "undefined" && parseInt(req.cookies.nivel) == 1){
				filtro_user_vibox += " AND med.operador='"+req.cookies.operadora+"' ";
			}
			if(typeof(req.body.operadores) != "undefined"){
				filtro_user_vibox += " AND med.operador IN ("+helpers.implodeUser(req.body.operadores)+") ";
			}
			if(req.body.hasOwnProperty("userActive") && req.body.userActive){
				filtro_user_vibox += " AND us.ind_estado=1 ";
			}
			//console.log(dataUser2);
			var result_users = helpers.mergeOperador(dataUser,[]);
			var lista_ope = helpers.implodeUser(result_users);
			filtro = "WHERE opt.opt_fec_fecha >= '"+fecha_inicio+"' and opt.opt_fec_fecha <= '"+fecha_fin+"'";
			if(Object.keys(req.cookies).length > 0 && req.cookies.hasOwnProperty("operadora") && req.cookies.operadora != "undefined" && parseInt(req.cookies.nivel) == 1){
				filtro += " AND us.usuario_codigo='"+req.cookies.operadora+"'";
			}
			filtro_fecha_2 = " AND hop_fecha BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"'";
			if(Object.keys(req.cookies).length > 0 && req.cookies.hasOwnProperty("operadora") && req.cookies.operadora != "undefined" && parseInt(req.cookies.nivel) == 1){
				filtro_fecha_2 += " AND us.user='"+req.cookies.operadora+"'";
			}else{
				filtro_fecha_2 += " AND us.user IN ("+lista_ope+") ";
			}
			if(typeof(req.body.operadores) != "undefined"){
				filtro_fecha_2 += " AND us.user IN ("+helpers.implodeUser(req.body.operadores)+") ";
			}
			reportModel.getHorarioIdeal(filtro_fecha_2,function(error,dataIDealVicidial){
				//reportVibox.getHorariosIdealVibox(true,filtro, function(error,data_ideal_vibox){
				result_users = helpers.extractUserIdeal(dataIDealVicidial,result_users);
					filtroRealVibox = "where med.fecha_llamado BETWEEN  '"+fecha_inicio+"' and '"+fecha_fin+"'";
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
					filtro_horario_entrada += " AND us.`user` IN ("+lista_ope+")";
					reportModel.getHorarioEntrada(fecha_inicio,filtro_horario_entrada,function(err,dataHorarioEntrada){
						reportModel.getHorario(filtro_fecha,function(error,data){
							reportVibox.getHorarioIdeal(filtro,function(error,data2){
								reportModel.getUsersClienteServicio(filtro_users,function(errorCliente,dataUsuarioCliente){
									var arrUsuarioCampana = helpers.formatUsuarioClienteServicio(dataUsuarioCliente);
									reportModel.getHorarioExcepcion(filtro_fecha_2,function(errorr,dataExecption){
										fechas = data2;
										var arrFormatExcepciones = helpers.formatExecepcionesOperador(dataExecption);
										var data_ideal_vibox = {};
										var horarioIdeal = helpers.mergeHorarioOperador(dataIDealVicidial,data_ideal_vibox);
										var arrFechas = helpers.extractDateHH(horarioIdeal);
										var arrFechasNombre = helpers.arrFechasNombre(arrFechas);
										var horariosEntrada = helpers.formatArrHorarioEntrada(dataHorarioEntrada);
										//var arrHorarioIdeal = helpers.formatHorarioIdeal(arrFechas,fechas);
										var arrHorario = helpers.formatHorarioOp(arrFechas,data,fechas,horarioIdeal,data_real_vibox,result_users,arrFormatExcepciones);
										//console.log(arrHorario);
										var cantidadDias = req.body.cant_days;

										if(cantidadDias < 1){
											var filtroHorarioSemana = "where 1 = 1 and hos.ophs_dia_semana = WEEKDAY('"+fecha_inicio+"')+2 and ophs_estado = 1 and hos.ophs_usuario_codigo IN ("+lista_ope+")";
											reportModel.getHorarioSemana(filtroHorarioSemana,function(error,dataHorarioSemana){
												var arrHorarioSemana = helpers.formatHorarioSemana(dataHorarioSemana);
												arrHorario.horario = helpers.addEstadoAdherencia(arrHorarioSemana,arrHorario.horario,fecha_inicio);
												var fecha = new Date();
												var mes = ((fecha.getMonth()+1) < 10) ? "0"+(parseInt(fecha.getMonth())+1):fecha.getMonth()+1;
												console.log("mes",mes,fecha.getMonth());
												var dia = ((fecha.getDate()) < 10) ? "0"+fecha.getDate():fecha.getDate();
												var fecha_actual = fecha.getFullYear()+"-"+mes+"-"+dia;
												console.log(fecha_inicio,fecha_actual);
												var flagEstado = (fecha_inicio == fecha_actual) ? true:false;
												res.status(200).json({"fechas":arrFechas,"fechas_nombre":arrFechasNombre,"horarios":arrHorario.horario,"globalesDia":arrHorario.globalesDia,"globalesOperador":arrHorario.globalesOperador,
												"globalesHorario":arrHorario.totales,"operadoresExcepciones":arrHorario.operadoresExcepciones,"cantidadExcepciones":arrHorario.cantidadExcepciones,"horarioEntrada":horariosEntrada,"arrHorarioSemana":arrHorarioSemana,"showEstado":flagEstado,
												"arrUsuarioCampana":arrUsuarioCampana
												});
											});
											return false;
										}
										
										res.status(200).json({"fechas":arrFechas,"fechas_nombre":arrFechasNombre,"horarios":arrHorario.horario,"globalesDia":arrHorario.globalesDia,"globalesOperador":arrHorario.globalesOperador,
											"globalesHorario":arrHorario.totales,"operadoresExcepciones":arrHorario.operadoresExcepciones,"cantidadExcepciones":arrHorario.cantidadExcepciones,"horarioEntrada":horariosEntrada,"showEstado":false,
												"arrUsuarioCampana":arrUsuarioCampana});
									});
								});
							});
						});
					});
				});
			});
		});
	});

	app.post("/getListaCampanas",function(req,res){
		console.log("res.cookie",req.cookies);
		var filtro = "WHERE 1=1";
		var campana ="";
		
		campana += helpers.implodeUser(req.body.campanasVicidial);

		filtro += " AND med.campaign_id in ("+campana+")";

		if(req.body.hasOwnProperty("date_begin") && req.body.date_begin != ""){
			var fecha_inicio = req.body.date_begin.split("/").reverse().join("-");
			var fecha_fin = req.body.date_end.split("/").reverse().join("-");
			filtro += " AND med.mpr_date BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"'";
		}

		reportModel.getListaCampanas(filtro,function (error,data){
			res.status(200).json(data);
		});
	});

	app.post("/buscarAudio",function(req,res){
		var filtro = "WHERE 1=1 ";
		if(req.body.hasOwnProperty("idCliente") && req.body.idCliente != ""){
			filtro += " AND cam.id_cliente = "+req.body.idCliente;
		}
		if(req.body.hasOwnProperty("idServicio") && req.body.idServicio != ""){
			filtro += " AND cam.id_servicio = "+req.body.idServicio;
		}
		if(req.body.hasOwnProperty("date_begin") && req.body.date_begin != ""){
			var fecha_inicio = req.body.date_begin.split("/").reverse().join("-");
			var fecha_fin = req.body.date_end.split("/").reverse().join("-");
			filtro += " AND DATE(ca_ani.fecha_llamado) BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"'";
		}
		if(req.body.hasOwnProperty("users") && (req.body.users != "" && req.body.users != "Seleccione Operador")){
			filtro += " AND ca_ani.operador = '"+req.body.users+"'";
		}

		if(req.body.hasOwnProperty("id_ani") && req.body.id_ani != ""){
			filtro += " AND ca_ani.id_ani = "+req.body.id_ani;
		}
		if(req.body.hasOwnProperty("telefono") && req.body.telefono != ""){
			filtro += " AND ca_ani.ani = '"+req.body.telefono+"'";
		}
		if(req.body.hasOwnProperty("rut") && req.body.rut != ""){
			filtro += " AND ca_ani.rut_cliente = '"+req.body.rut+"'";
		}
		if(req.body.hasOwnProperty("nombre") && req.body.nombre != ""){
			filtro += " AND ca_ani.nombre LIKE '"+req.body.nombre+"%'";
		}
		if(req.body.hasOwnProperty("ic_cliente") && req.body.ic_cliente != ""){
			filtro += " AND ca_ani.ic_cliente = "+req.body.ic_cliente;
		}
		if(req.body.hasOwnProperty("cu_cliente") && req.body.cu_cliente != ""){
			filtro += " AND ca_ani.cu_cliente = "+req.body.cu_cliente;
		}
		if(req.body.hasOwnProperty("id_cliente") && req.body.id_cliente != ""){
			filtro += " AND (ca_ani.cu_cliente = "+req.body.id_cliente+" OR ca_ani.ic_cliente = "+req.body.id_cliente+" OR ca_ani.id_cliente LIKE '%"+req.body.id_cliente+"')";
		}
		if(req.body.hasOwnProperty("estado") && req.body.estado != ""){
			filtro += " AND ca_ani.estado = '"+req.body.estado+"'";
		}
		var isExterno = false;
		console.log(req.headers.host);
		if(req.headers.host[0] == "1" || req.headers.host[0] == "l"){
			isExterno = false;
		}else{
			isExterno = true;
		}
		reportVibox.getAudios(isExterno,filtro,function(error,data){
			reportVibox.getAudiosHistorico(isExterno,filtro,function(error,dataHistorico){
				data = data.concat(dataHistorico);
				var audios = helpersAudios.extractAudiosVicidial(data);
				if(audios.audios_vicidial.length > 0){
					var filtro_vicidial = "WHERE 1 =1 ";
					filtro_vicidial += helpersAudios.implodeIdAniFiltro(audios.audios_vicidial);
					if(req.body.hasOwnProperty("date_begin") && req.body.date_begin != ""){
						var fecha_inicio = req.body.date_begin.split("/").reverse().join("-");
						var fecha_fin = req.body.date_end.split("/").reverse().join("-");
						filtro_vicidial += " AND DATE(rec.start_time) BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"'";
					}
					console.log("BUSCANDO");
					reportModel.getAudios(isExterno,filtro_vicidial,function(error,dataVici){
						var ret = helpersAudios.putAudioLocationVicidial(audios.audios_vicidial,dataVici);
						//ret_audio = audios.audios_vibox.concat(audios.audios_vicidial);
						res.status(200).json(ret);
					});
				}else{
					res.status(200).json(audios.audios_vibox);
				}
			});
		});
	});



	app.get('/bitacora/idUsuariosBitacoras',function(req,res){
		var usuario_codigo_operador = req.query.operador;
		var usuario_codigo_supervisor = req.query.supervisor;

		var filtro_operador_vici = "WHERE 1=1 ";
		filtro_operador_vici += "AND us.user='"+usuario_codigo_operador+"' "

			reportModel.getOperadorId(filtro_operador_vici,function(error,dataOp){
				//dataOp[0]["id_usuario"] = dataOpVi[0]["id_usuario"];
				var filtro_supervisor = "WHERE 1=1 ";
				filtro_supervisor += "AND us.user='"+usuario_codigo_supervisor+"' ";
				reportModel.getSupervisorId(filtro_supervisor,function(error,dataSup){
					//var retorno = {us_id_operadora:dataOp[0].id_usuario,us_id_usuario_ingreso:dataSup[0].id_sioweb};
					var retorno = dataOp[0]; // SE ASIGNA DATOS DEL OPERADOR PRIMERO
					retorno.us_id_usuario_ingreso = dataSup[0].id_sioweb;
					console.log("retorno",retorno);
					res.status(200).json(retorno);
				});
			});
		/*reportVibox.getOperadorId(filtro_operador,function(error,dataOpVi){
		var filtro_operador = "WHERE 1=1 ";
		filtro_operador += "AND usuario_codigo='"+usuario_codigo_operador+"' "
		});*/
	});

	app.get('/listSupervisores',function(req,res){
		reportModel.getListSupervisor(function(err,dataSupervisor){
			res.status(200).json(dataSupervisor);
		});
	});

	app.get('/listCamposDomo',function(req,res){
		reportModel.getListCamposDomo(function(err,dataListaCampos){
			res.status(200).json(dataListaCampos);
		})
	});

	app.post('/guardaCamposDomo',function(req,res){
		var user = req.cookies.user_id;
		var listCampos = req.body.campos;
		var sqlLimpiarCampos = "delete from hermes.user_campo_domo where user_id="+user;
		reportModel.executeQuery(sqlLimpiarCampos,function(err,data){
			if(!err){
				sql_campos = helpersMantenedor.strInsertCamposUpdate(listCampos,user);
				reportModel.executeQuery(sql_campos,function(error,data){
					if(error){
						res.status(200).json({save:false,mesj:"No se guardo los campos. Intente nuevamente"});
					}else{
						res.cookie('campos_domo', JSON.stringify(listCampos), { expire : new Date() + 9999 });
						res.status(200).json({save:true,mesj:"se guardo correctamente"});
					}
				});
			}
		});
	});

	app.get('/getEstadosClienteServicio',function(req,res){
		var cliente_id = req.query.id_cliente;
		var servicio_id = req.query.servicio_id;

		if(servicio_id.length == 1){
			servicio_id = "0"+servicio_id;
		}
		if(cliente_id.length == 1){
			cliente_id = "0"+cliente_id;
		}
		var campaign = cliente_id+servicio_id;
		reportModel.getEstadosClienteServicio(campaign,function(err,data){
			if(err){
				res.status(500).send("ERROR: "+err);
			}else{
				res.status(200).json(data);
			}
		});
	});

	app.post('/agenda/notificarLlamado',function(req,res){
		var sql = "UPDATE hermes.agendar_llamado set ag_estado = 1,ag_llamado = now() where ag_agenda_id="+req.body.agenda_id;
		console.log(sql);
		reportModel.executeQuery(sql,function(err,rows){
			if(err){
				res.status(200).json({save:false,mesj:"No se guardo los campos. Intente nuevamente"});
			}else{
				res.status(200).json({save:true,mesj:"se guardo correctamente"});
			}
		})
	});

	app.get("/estadoEnvioICS",function(req,res){
		reportModel.getEstadoEnvioICS(function(err,dataEstado){
			res.status(200).json({estado:dataEstado[0].estado});
		});
	})

	app.post("/activacionICS",function(req,res){
		var estado = 0;
		if(req.body.estado == 0){
			estado = 1;
		}
		var sql = "UPDATE hermes.estado_envio_ics SET flag_envio_ics="+estado;
		reportModel.executeQuery(sql,function(err,data){
			if(err)
				res.status(200).json({save:false});
			else
				res.status(200).json({save:true});
		});
	})

	app.post('/reportes/costoEfectivos',function(req,res){
		var id_cliente = (parseInt(req.body.idCliente) < 10) ? "0"+req.body.idCliente:req.body.idCliente;
		var id_servicio = (parseInt(req.body.idServicio) < 10) ? "0"+req.body.idServicio:req.body.idServicio;
		var campaign_id = id_cliente.toString()+id_servicio.toString();
		var fecha_inicio = req.body.date_begin.split("/").reverse().join("-");
		var fecha_fin = req.body.date_end.split("/").reverse().join("-");

		var filtroRealVici = " AND mpr_date BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"' AND campaign_id like '"+campaign_id+"%' ";

		var filtroRealVibox = "where med.fecha_llamado BETWEEN  '"+fecha_inicio+"' and '"+fecha_fin+"'";
		filtroRealVibox += " AND operador not like '%amiento%' AND operador not like '%prueba%' and cam.id_servicio="+id_servicio+" AND cam.id_cliente="+id_cliente+" ";
		reportVibox.getHorariosRealVibox(filtroRealVibox,function(error,data_real_vibox){
			reportModel.getHorario(filtroRealVici,function(errorVici,data_real_vici){
				var filtro_vic = "WHERE mpr_date BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"' AND campaign_id like '"+campaign_id+"%' ";
				reportModel.getProduccionVicidial(filtro_vic,function(err, valorVidicial){
					var filtro_vib ="WHERE fecha_llamado BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"' and cam.id_servicio="+id_servicio+" AND cam.id_cliente="+id_cliente+" \
						GROUP BY operador,cam.id_cliente,ccli.cliente,cam.id_servicio,cser.servicio,fecha ORDER BY fecha_llamado,cam.id_cliente, cam.id_servicio";
					reportVibox.getProduccionVibox(filtro_vib,function(err, valorVibox){
						var filtro_efec ="WHERE cvr_estado=1 and cvr_id_cliente="+id_cliente+" AND cvr_id_servicio="+id_servicio+" AND cvr_fec_crea in \
						(SELECT MAX(cvr_fec_crea) FROM hermes.cvr_cliente_valor_registro GROUP BY cvr_id_cliente, cvr_id_servicio) \
						GROUP BY  cvr_id_cliente, cvr_id_servicio";
						reportModel.getValorEfectivos(filtro_efec,function(err, valorEfectivo){
							var filtroSueldo = "WHERE sum_fecha_inicio <= '"+fecha_inicio+"'";
							reportModel.getSueldoMinimoCosto(filtroSueldo,function(err,dataSueldoMinimo){
								var filtroBrechaCosto = " AND bre.id_cliente="+id_cliente+" AND bre.id_servicio="+id_servicio+" LIMIT 1";
								reportModel.getListaBrechaCosto(filtroBrechaCosto,function(errBre,dataBrecha){
									var brecha = {};
									if(dataBrecha.length > 0)
										brecha = dataBrecha[0];
									var sueldo_minimo = dataSueldoMinimo[0].sum_sueldo;
									var formatHorarioReal = helpers.formatHorarioReal(data_real_vibox,data_real_vici);
									var arrFechas = helpers.extractDateHHReal(data_real_vibox,data_real_vici);
									arrFechas.sort(function(a, b) {
									    a = new Date(moment(a,"YYYY-MM-DD"));
									    b = new Date(moment(b,"YYYY-MM-DD"));
									    return b>a ? -1 : b<a ? 1 : 0;
									});
									var arrFechasNombre = helpers.arrFechasNombre(arrFechas);
									var list = {};
									var fechas = helpers.listFechaProduccion(valorVidicial,valorVibox);
									fechas.sort(function(a, b) {
									    a = new Date(moment(a,"YYYY-MM-DD"));
									    b = new Date(moment(b,"YYYY-MM-DD"));
									    return b>a ? -1 : b<a ? 1 : 0;
									});
									var cliServVic = helpers.listClienteServicioVicidial(valorVidicial);
									var cliServVib = helpers.listClienteServicioVibox(valorVibox);
									if(data_real_vibox.length > 0){
										console.log("VIBOX");
										var listaCompletaVib = helpers.formatListaValorVibox(valorEfectivo, valorVibox);
										list = helpers.formatListProduccionCosto(fechas, listaCompletaVib, cliServVib);
									}
									if(data_real_vici.length > 0){
										var list2 = {};
										list2 = helpers.formatListProduccionCosto(fechas, valorVidicial, cliServVic);
										list = _.merge(list,list2);
									}

									var arrCosto = helpers.formatCosto(formatHorarioReal,list,sueldo_minimo);
									var arrCostoGlobales = helpers.formatCostoGlobales(formatHorarioReal,list,sueldo_minimo);

									res.status(200).json({horario:formatHorarioReal,fechas_nombre:arrFechasNombre,fechas:arrFechas,produccion:list,costo:arrCosto,globales:arrCostoGlobales,brecha:brecha});
								});
							})
						});
					});
				});
			});
		});

	});

	app.get("/menu/listaMenuUserLogin",function(req,res){
		filtro = "WHERE per_id_perfil="+req.cookies.nivel;
		reportModel.getMenuUsuario(filtro, function(err, men){
			res.status(200).json(men);
		});
	});
	app.get("/menu/listaMenuPadreUserLogin",function(req,res){
		filtro = "WHERE per_id_perfil="+req.cookies.nivel;
		reportModel.getMenuPadreUsuario(filtro, function(err, men){
			res.status(200).json(men);
		});
	});

	app.post("/horario/operadorPorHora",function(req,res){
		var fecha_inicio = req.body.date_begin.split("/").reverse().join("-");
		var fecha_fin = req.body.date_end.split("/").reverse().join("-");
		//var fecha_inicio = '2017-05-01';
		//var fecha_fin = '2017-05-18';

		var filtro_horario = "WHERE 1=1 ";
		filtro_horario += "AND hop_fecha BETWEEN '"+fecha_inicio+"' AND '"+fecha_fin+"' ";
		filtro_horario += " AND us.user IN ("+helpers.implodeUser(req.body.users)+")";
		reportModel.getHorarioOperador(filtro_horario,function(err,horaOperador){
			var separaHoraOperador = helpers.separaHorasOperador(horaOperador);
			var horarioTabla = separaHoraOperador.tabla;
			var cabezeras = helpers.extractHeader(horarioTabla);
			cabezeras.nombres = helpers.arrFechasNombre(cabezeras.fechas);
			delete separaHoraOperador["tabla"];
			horarioTabla = helpers.mezclarHorasHorarioOperador(separaHoraOperador,horarioTabla);
			res.status(200).json({horasOperador:separaHoraOperador,tabla:horarioTabla,header:cabezeras});
		});
	});

	app.post("/escucha/getClientes",function(req,res){
		var filtro = "";
		if(Object.keys(req.cookies).length > 0 && req.cookies.hasOwnProperty("clientes")){
			var implode_cli = helpers.implodeClientesExterno(JSON.parse(req.cookies.clientes));
			filtro += " WHERE id_cliente IN ("+implode_cli+") ";
		}
		reportModel.getClientes(filtro,function(error,data){
			res.status(200).json(data);
		});
	});
	app.post("/escucha/getServicios",function(req,res){
		var filtroCliente = "";
		if(req.body.hasOwnProperty("idCliente") && req.body.idCliente != ""){
			filtroCliente = "WHERE cli.id_cliente = "+req.body.idCliente;
		}
		else if(req.body.hasOwnProperty("id_cliente") && req.body.id_cliente != ""){
			filtroCliente = "WHERE cli.id_cliente = "+req.body.id_cliente;
		}
		else if(req.body.hasOwnProperty("id_cliente1") && req.body.id_cliente1 != ""){
			filtroCliente = "WHERE cli.id_cliente = "+req.body.id_cliente1;
		}
		else if(req.body.hasOwnProperty("id_cliente2") && req.body.id_cliente2 != ""){
			filtroCliente = "WHERE cli.id_cliente = "+req.body.id_cliente2;
		}
		else if(req.body.hasOwnProperty("id_cliente3") && req.body.id_cliente3 != ""){
			filtroCliente = "WHERE cli.id_cliente = "+req.body.id_cliente3;
		}
		else if(req.body.hasOwnProperty("id_cliente4") && req.body.id_cliente4 != ""){
			filtroCliente = "WHERE cli.id_cliente = "+req.body.id_cliente4;
		}

		if(Object.keys(req.cookies).length > 0 && req.cookies.hasOwnProperty("clientes")){
			var implode_ser = helpers.implodeClientesExternoServicio(JSON.parse(req.cookies.clientes));
			filtroCliente += " AND ser.id_servicio IN ("+implode_ser+") ";
		}

		filtroCliente +=" order by servicio";
		reportModel.getServicios(filtroCliente,function(error,data){
			res.status(200).json(data);
		});
	});
}