var reportModel = require('../model/user');
var reportVibox = require('../model/vibox');
var helpers = require('../helpers/helpers');
var helpersMantenedor = require('../helpers/helpersMantenedores');
var formidable  = require('formidable');
var path = require('path');
var fs = require('fs');
var moment = require('moment');
var async = require('async');
var _ = require('lodash');

module.exports = function(app){
	app.post('/mantenedor/listaOperador',function(req,res){
		var filtro = "WHERE 1=1 AND user_level=1 ";
		if(req.body.filtroActivo){
			filtro += "AND us.active='Y'";
		}
		reportModel.getListaMantenedorOperador(filtro,function(error,data){
			var filtro = 'WHERE tiej_estado=1';
			reportModel.getListaTipoEjecutiva(filtro, function(err, tipos){
				var listado = helpersMantenedor.formatoEjecutivas(data,tipos);
				res.status(200).json(listado);
			});
		});
	});

	app.post('/mantenedor/guardarOperador',function(req,res){
		console.log(req.body);
		var cambios_usuario  = "";
		var cambios_usuario_detalle  = "";
		var cambio_supervisor = "";
		var flag_eliminar_horario_vencimiento = false;
		var flag_eliminar_horario_despido = false;
		var perfil = "";
		var campanas = false;
		var detalle_hijos = '';

		var exists_users_detalle = " SELECT * from hermes.usuario_detalle where user_id="+req.body.user_id;

		reportModel.executeQuery(exists_users_detalle,function(errorExist,dataExists){
			if(req.body.campanas.length!=0){
				var insertCampanasEjecutivo = helpersMantenedor.formatInsertCampanaEjecutivo(req.body.user_id,req.body.campanas,req.cookies.user_id);
				var updateCampanasEjecutivo = "UPDATE hermes.campana_capacitacion_ejecutiva SET cce_estado=0 WHERE vicuser_id="+req.body.user_id;
				campanas = true;
			}

			var existe =(dataExists.length == 0) ? false:true;
			var id_cliente = dataExists.id_cliente;
			var id_servicio = dataExists.id_servicio;
			cambios_usuario += "UPDATE asterisk.vicidial_users SET full_name='"+req.body.full_name+"',active='"+req.body.active+"' WHERE 1=1 AND user_id="+req.body.user_id;
			if(req.body.usde_fec_vencimiento == "" && req.body.usde_contrato_indef == "1"){
				req.body.usde_fec_vencimiento = "00/00/0000";
			}

			if(req.body.usde_hijos){
				detalle_hijos = helpersMantenedor.insertHijosOperador(req.body.user_id, req.body.listaHijos);
				console.log(detalle_hijos);
			}
			cambios_usuario_detalle = helpersMantenedor.getSqlUsuarioDetalle(existe,req.body);
			console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||");
			if(existe > 0){
				cambio_supervisor += "UPDATE hermes.usuario_supervisor SET us_sup_supervisor_id="+req.body.id_vici+",us_sup_fecha_asignacion=now() WHERE us_sup_user_id="+req.body.user_id;
			}else{
				cambio_supervisor += "INSERT INTO hermes.usuario_supervisor(us_sup_user,us_sup_user_id,us_sup_supervisor_id,us_sup_fecha_asignacion) VALUES ('"+req.body.user+"',"+req.body.user_id+","+req.body.id_vici+",now())";
			}
			if(req.body.per_id_perfil != ''){
				perfil +="UPDATE hermes.usuario_perfil SET per_id_perfil=1 WHERE user_id="+req.body.user_id;
			}else{
				perfil +="INSERT INTO hermes.usuario_perfil (per_id_perfil, user_id) VALUES (1,"+req.body.user_id+")";	
			}
			if(req.body.hasOwnProperty("usde_fec_vencimiento") && req.body.usde_fec_vencimiento != "" && req.body.usde_fec_vencimiento != null){
				var fecha_vencimiento = req.body.usde_fec_vencimiento.split("/").reverse().join("-");
				flag_eliminar_horario = true;
			}
			if(req.body.hasOwnProperty("usde_fec_despido") && req.body.usde_fec_despido != "" && req.body.usde_fec_despido != null){
				var fecha_despido = req.body.usde_fec_despido.split("/").reverse().join("-");
				flag_eliminar_horario = true;
			}
			var cambio_cliente = false;
			if(id_cliente != req.body.id_cliente || id_servicio != req.body.id_servicio){
				cambio_cliente = true;
			}
			console.log("cambio_cliente",cambio_cliente);
			reportModel.executeQuery(cambios_usuario,function(error,data){
				if(error)
					res.status(200).json({save:false});
				else{
					console.log(cambios_usuario_detalle);
					reportModel.executeQuery(cambios_usuario_detalle,function(error2,data2){
						if(error2)
							res.status(200).json({save:false,paso:"2"});
						else{
							reportModel.executeQuery(cambio_supervisor,function(error3,data3){
								console.log(perfil);
								reportModel.executeQuery(perfil,function(error_per,perfil){
									if(fecha_despido != '0000-00-00')
										flag_eliminar_horario_despido = true;
									if(fecha_vencimiento != '0000-00-00')
										flag_eliminar_horario_vencimiento = true;
									if(flag_eliminar_horario_despido || flag_eliminar_horario_vencimiento && (fecha_despido != '0000-00-00' || fecha_vencimiento != '0000-00-00')){
										if(cambio_cliente){
											var insert_cambio_cliente = "INSERT INTO hermes.historial_ejecutivo_cliente_servicio(user_id,cliente_id,servicio_id,fecha_asignacion) VALUES(";
											insert_cambio_cliente += req.body.user_id+","+req.body.id_cliente+","+req.body.id_servicio+",now())";
											console.log(insert_cambio_cliente);
											reportModel.executeQuery(insert_cambio_cliente,function(error5,data5){
												console.log("Eliminar horario");
												var fecha = (flag_eliminar_horario_despido) ? fecha_despido:fecha_vencimiento;
												var query_eliminar = "DELETE FROM hermes.horario_operadora where vicu_user_id = "+req.body.user_id+" AND hop_fecha > '"+fecha+"'";
												console.log(query_eliminar);
												reportModel.executeQuery(query_eliminar,function(error4,data4){
													if(error4)
														res.status(200).json({save:false,paso:'4'});
													else{
														if(campanas){
															console.log(updateCampanasEjecutivo);
															reportModel.executeQuery(updateCampanasEjecutivo,function(error8,data8){
																if(error8)
																	res.status(200).json({save:false,paso:'8'});
																else{
																	console.log(insertCampanasEjecutivo);
																	reportModel.executeQuery(insertCampanasEjecutivo,function(error9,data9){
																		if(error9)
																			res.status(200).json({save:false,paso:'9'});
																		else if(detalle_hijos !='' && detalle_hijos.insert!=''){
																			reportModel.executeQuery(detalle_hijos.update,function(error10,data10){
																				if(error10)
																					res.status(200).json({save:false,paso:'106'});
																				else{
																					reportModel.executeQuery(detalle_hijos.insert,function(error11,data11){
																						if(error11)
																							res.status(200).json({save:false,paso:'11'});
																						else
																							res.status(200).json({save:!error11,paso:'11'});
																					});
																				}
																			});
																		}
																		else{
																			res.status(200).json({save:!error9,paso:"9"});
																		}
																	});		
																}
															});	
														}else if(detalle_hijos !='' && detalle_hijos.insert!=''){
															console.log(detalle_hijos.update);
															reportModel.executeQuery(detalle_hijos.update,function(error10,data10){
																if(error10)
																	res.status(200).json({save:false,paso:'105'});
																else{
																	reportModel.executeQuery(detalle_hijos.insert,function(error11,data11){
																		if(error11)
																			res.status(200).json({save:false,paso:'11'});
																		else
																			res.status(200).json({save:!error11,paso:'11'});
																	});
																}
															});
														}else
														res.status(200).json({save:!error4,paso:"4"});
													}
													
												});	
											});
										}else{
											var fecha = (flag_eliminar_horario_despido) ? fecha_despido:fecha_vencimiento;
											var query_eliminar = "DELETE FROM hermes.horario_operadora where vicu_user_id = "+req.body.user_id+" AND hop_fecha > '"+fecha+"'";
											console.log(query_eliminar);
											reportModel.executeQuery(query_eliminar,function(error4,data4){
												if(error4)
													res.status(200).json({save:false,paso:'4'});
												else{
													if(campanas){
														console.log(updateCampanasEjecutivo);
														reportModel.executeQuery(updateCampanasEjecutivo,function(error8,data8){
															if(error8)
																res.status(200).json({save:false,paso:'8'});
															else{
																console.log(insertCampanasEjecutivo);
																reportModel.executeQuery(insertCampanasEjecutivo,function(error9,data9){
																	if(error9)
																		res.status(200).json({save:false,paso:'9'});
																	else if(detalle_hijos !='' && detalle_hijos.insert!=''){
																		reportModel.executeQuery(detalle_hijos.update,function(error10,data10){
																			if(error10)
																				res.status(200).json({save:false,paso:'104'});
																			else{
																				reportModel.executeQuery(detalle_hijos.insert,function(error11,data11){
																					if(error11)
																						res.status(200).json({save:false,paso:'11'});
																					else
																						res.status(200).json({save:!error11,paso:'11'});
																				});
																			}
																		});
																	}
																	else{
																		res.status(200).json({save:!error9,paso:"9"});
																	}
																});		
															}
														});	
													}else if(detalle_hijos !='' && detalle_hijos.insert!=''){
														reportModel.executeQuery(detalle_hijos.update,function(error10,data10){
															if(error10)
																res.status(200).json({save:false,paso:error10});
															else{
																reportModel.executeQuery(detalle_hijos.insert,function(error11,data11){
																	if(error11)
																		res.status(200).json({save:false,paso:'11'});
																	else
																		res.status(200).json({save:!error11,paso:'11'});
																});
															}
														});
													}
													else
														res.status(200).json({save:!error4,paso:"4"});
												}
												
											});
										}
									}else{
										var insert_cambio_cliente = "INSERT INTO hermes.historial_ejecutivo_cliente_servicio(user_id,cliente_id,servicio_id,fecha_asignacion) VALUES(";
										insert_cambio_cliente += req.body.user_id+","+req.body.id_cliente+","+req.body.id_servicio+",now())";
										console.log(insert_cambio_cliente);
										reportModel.executeQuery(insert_cambio_cliente,function(error5,data5){
											if(campanas){
												console.log(updateCampanasEjecutivo);
												reportModel.executeQuery(updateCampanasEjecutivo,function(error8,data8){
													if(error8)
														res.status(200).json({save:false,paso:'8'});
													else{
														console.log(insertCampanasEjecutivo);
														reportModel.executeQuery(insertCampanasEjecutivo,function(error9,data9){
															if(error9)
																res.status(200).json({save:false,paso:'9'});
															else if(detalle_hijos !='' && detalle_hijos.insert!=''){
																reportModel.executeQuery(detalle_hijos.update,function(error10,data10){
																	if(error10)
																		res.status(200).json({save:false,paso:'102'});
																	else{
																		reportModel.executeQuery(detalle_hijos.insert,function(error11,data11){
																			if(error11)
																				res.status(200).json({save:false,paso:'11'});
																			else
																				res.status(200).json({save:!error11,paso:'11'});
																		});
																	}
																});
															}
															else{
																res.status(200).json({save:!error9,paso:"9"});
															}
														});		
													}
												});	
											}
											else if(detalle_hijos !='' && detalle_hijos.insert!=''){
												reportModel.executeQuery(detalle_hijos.update,function(error10,data10){
													if(error10)
														res.status(200).json({save:false,paso:'101'});
													else{
														reportModel.executeQuery(detalle_hijos.insert,function(error11,data11){
															if(error11)
																res.status(200).json({save:false,paso:'11'});
															else
																res.status(200).json({save:!error11,paso:'11'});
														});
													}
												});
											}
											else
												res.status(200).json({save:!error3,paso:"3"});
										});
									}
								});
							});
						}
					});
				}
			});
		});
	});

app.post("/mantenedor/desactivarOperador",function(req,res){
	var desactivar_operador = "";

	desactivar_operador += "UPDATE asterisk.vicidial_users SET active='N' WHERE user_id="+req.body.user_id;

	reportModel.executeQuery(desactivar_operador,function(error,data){
		res.status(200).json({save:!error});
	})
});

app.get('/mantenedor/listaSupervisores',function(req,res){
	reportModel.getListSupervisor(function(error,data){
		res.status(200).json(data);
	});
});

app.get('/mantenedor/listaIsapres',function(req,res){
	reportModel.getListIsapres(function(error,data){
		res.status(200).json(data);
	});
});

app.get('/mantenedor/listaAfps',function(req,res){
	reportModel.getListAfps(function(error,data){
		res.status(200).json(data);
	});
});

app.get('/mantenedor/listaContratos',function(req,res){
	reportModel.getListContrato(function(error,data){
		res.status(200).json(data);
	});
});

app.post('/mantenedor/listaSupervisor',function(req,res){
	var filtro = "WHERE 1=1 ";
	if(req.body.filtroActivo){
		filtro += "AND us.active='Y'";
	}
	reportModel.getListaMantenedorSupervisor(filtro,function(error,data){
		res.status(200).json(data);
	})
});

app.post('/mantenedor/guardarSupervisores',function(req,res){
	var cambios_usuario  = "";
	var cambios_usuario_detalle  = "";
	var cambio_supervisor = "";
	var flag_insert = false;

	if(req.body.hasOwnProperty("user_id") && req.body.user_id != "" && req.body.user_id != null){
		var vigente = (req.body.active == "Y") ? 1:0;
		cambios_usuario += "UPDATE asterisk.vicidial_users SET user='"+req.body.user+"',full_name='"+req.body.full_name+"',pass='"+req.body.pass+"',active='"+req.body.active+"' WHERE 1=1 AND user_id="+req.body.user_id;
		cambios_usuario_detalle += "UPDATE hermes.supervisor SET supervisor='"+req.body.full_name+"'";
		cambios_usuario_detalle += ",usuario_codigo='"+req.body.user+"',vigente="+vigente+"";
		cambios_usuario_detalle += ",correo='"+req.body.correo+"',anexo="+req.body.anexo+"";
		cambios_usuario_detalle +=" WHERE 1=1 AND id_vici="+req.body.user_id;
	}else{
		flag_insert = true;
		cambios_usuario += "INSERT INTO asterisk.vicidial_users(user,pass,full_name,user_level,user_group,phone_login,phone_pass,active) values(";
		cambios_usuario += "'"+req.body.user+"','"+req.body.pass+"','"+req.body.full_name+"',9,'ADMIN','"+req.body.anexo+"','"+req.body.anexo+"','Y');";
	}
	console.log(cambios_usuario);
	reportModel.executeQuery(cambios_usuario,function(error,data){
		if(error)
			res.status(200).json({save:false});
		else{
			if(flag_insert){
				var id_vici = data.insertId;
				cambios_usuario_detalle += "INSERT INTO hermes.supervisor (supervisor,usuario_codigo,vigente,id_vici,correo,anexo) VALUES(";
				cambios_usuario_detalle += "'"+req.body.full_name+"','"+req.body.user+"',1,"+id_vici+",'"+req.body.correo+"','"+req.body.anexo+"')";
			}
			reportModel.executeQuery(cambios_usuario_detalle,function(error2,data2){
				if(error2)
					res.status(200).json({save:false,paso:"2"});
				else{
					res.status(200).json({save:!error2,paso:"2"});
				}
			});
		}
	});
});

app.post("/mantenedor/supervisor/subirImagen",function (req, res) {
	var form = new formidable.IncomingForm();
	form.parse(req, function (err, fields, files) {
		var file = files.file;
		var username = fields.username;
		if(typeof(file) != "undefined"){
			var tempPath = file.path;
			        //var targetPath = path.resolve('./public/images/supervisores/' + username + '/' + file.name);
			        var targetPath = path.resolve('./public/images/supervisores/' + username);
			        fs.rename(tempPath, targetPath, function (err) {
			        	if (err) {
			        		throw err
			        	}
			            //logger.debug(file.name + " upload complete for user: " + username);
			            console.log(file.name + " upload complete for user: " + username);
			            return res.status(200).json({path: 'images/supervisores/' + username});
			        });
			    }else{
			    	return res.status(200).json({path: 'images/supervisores/' + username});
			    }
			});
});

app.post("/mantenedor/operadores/subirImagen",function (req, res) {
	var form = new formidable.IncomingForm();
	form.parse(req, function (err, fields, files) {
		var file = files.file;
		console.log(file);
		var username = fields.username;
		if(typeof(file) != "undefined"){
			var type = file.type.split("/");
			var tempPath = file.path;
			        //var targetPath = path.resolve('./public/images/supervisores/' + username + '/' + file.name);
			        var targetPath = path.resolve('./public/images/operadores/' + username);
			        fs.rename(tempPath, targetPath, function (err) {
			        	if (err) {
			        		throw err
			        	}
			            //logger.debug(file.name + " upload complete for user: " + username);
			            console.log(file.name + " upload complete for user: " + username);
			            return res.status(200).json({path: 'images/operadores/' + username});
			        });
			    }else{
			    	return res.status(200).json({path: 'images/operadores/' + username});
			    }
			});
});

app.post("/mantenedor/desactivarSupervisor",function(req,res){
	var desactivar_supervisor = "";
	var desactivar_supervisor_2 = "";

	desactivar_supervisor += "UPDATE asterisk.vicidial_users SET active='N' WHERE user_id="+req.body.user_id;
	desactivar_supervisor_2 += "UPDATE hermes.supervisor SET vigente=0 WHERE id_vici="+req.body.user_id;

	reportModel.executeQuery(desactivar_supervisor,function(error,data){
		if(error)
			res.status(200).json({save:false});
		else{
			reportModel.executeQuery(desactivar_supervisor_2,function(error2,data){
				res.status(200).json({save:!error2});
			});
		}
	})
});

app.get("/mantenedor/getHorarioSemanaOperador",function(req,res){
	if(req.query.hasOwnProperty("op_id") && req.query.op_id != ""){
			//agregar los datos de la operadora en lo que se devuelve
			var operador_id = parseInt(req.query.op_id);
			var filtro_det = "WHERE 1=1 ";
			filtro_det += "AND us.user_id="+operador_id
			reportModel.getOperadorContrato(filtro_det,function(error,dataUser){
				var filtro = "WHERE 1=1 ";
				filtro += "AND vicu_user_id="+operador_id+" AND ophs_estado=1";
				console.log(filtro);
				reportModel.getHorarioSemanaOperador(filtro,function(error,dataHorarioSemana){
					var arrFinal  = helpersMantenedor.addDateWeekData(dataHorarioSemana);
					res.header("Access-Control-Allow-Origin", "*");
					res.status(200).json({dataOperador:dataUser[0],calendario:arrFinal});
				});
			});
		}else{
			res.status(404).send("No existe pagina");
		}
	});

app.post("/mantenedor/modificarHorarioOperador",function(req,res){
		//req.body = {"id":439,"newStart":"2016-08-29T10:00:00","newEnd":"2016-08-29T13:00:00"};
		var desactivar_horario = "update hermes.horario_operadora_semana set ophs_estado=0 where ophs_usuario_codigo='"+req.body.ophs_usuario_codigo+"'";
		reportModel.executeQuery(desactivar_horario,function(err,dataDesac){
			var horarios = (req.body.horario_completo) ? req.body.horario_completo : [];
			var cambiar_horario_operador = helpersMantenedor.getQueryInsertHorarioSemana(horarios);
			console.log(cambiar_horario_operador);
			reportModel.executeQuery(cambiar_horario_operador,function(error,data){
				if(error){
					res.status(200).json({result:false,message:"Error a la tratar de editar horario."})
				}else{
					var fecha_inicio = req.body.fecha_inicio.split("/").reverse().join("-");
					var update = "UPDATE hermes.horario_operadora SET hop_estado = 0 WHERE hop_fecha >= '"+fecha_inicio+"' AND vicu_user_id = "+horarios[0].vicu_user_id;
					console.log(update);
					reportModel.executeQuery(update,function(err,data2){
						reportModel.getDetalleUsuario(req.body.ophs_usuario_codigo,function(erro,dataUsuario){
							var is_indefinido = dataUsuario[0].usde_contrato_indef;
							var fecha_ingreso = dataUsuario[0].usde_fec_ingreso;
							var fecha_vencimiento = dataUsuario[0].usde_fec_vencimiento;
							var fecha_fin = helpersMantenedor.ultimoDiaMesFecha(fecha_inicio);
							var sql_insertar_horarios = "call hermes.sp_agregar_horario_operador('"+fecha_inicio+"','"+fecha_fin+"','"+req.body.ophs_usuario_codigo+"','"+fecha_vencimiento+
							"',"+is_indefinido+",'"+fecha_ingreso+"')";
							console.log("sql_insertar_horarios");
							console.log(sql_insertar_horarios);
							reportModel.executeQuery(sql_insertar_horarios,function(er,data3){
								var sql_log = "INSERT INTO hermes.log_cambio_horario(fecha_cambio,user,operador) VALUES ";
								sql_log += "(now(),'"+req.cookies.operadora+"','"+dataUsuario[0].user+"')";
								reportModel.executeQuery(sql_log,function(err,data5){
									res.status(200).json({result:true,message:"Se guardo correctamente."})
								})
							});
						});
					});
				}
			});
		})
	});

app.post("/mantenedor/insertarHorarioOperador",function(req,res){
		//req.body = {"id":439,"start":"2016-08-29T10:00:00","end":"2016-08-29T13:00:00","vicu_user_id": 30,"ophs_usuario_codigo": "mecheverriab"};
		var horarios = (req.body.horario_completo) ? req.body.horario_completo : [req.body];
		var cambiar_horario_operador = helpersMantenedor.getQueryInsertHorarioSemana(horarios);
		console.log(cambiar_horario_operador);
		reportModel.executeQuery(cambiar_horario_operador,function(error,data){
			if(error){
				res.status(200).json({result:false,message:"Error a la tratar de agregar horario."})
			}else{
				var fecha_inicio = new Date().toISOString().substring(0, 10);
				var fecha_fin = helpersMantenedor.ultimoDiaMesFecha(fecha_inicio);
				var update = "UPDATE hermes.horario_operadora SET hop_estado = 0 WHERE hop_fecha >= '"+fecha_inicio+"' AND vicu_user_id = "+horarios[0].vicu_user_id;
				reportModel.executeQuery(update,function(err,data2){
					reportModel.getDetalleUsuario(horarios[0].ophs_usuario_codigo,function(erro,dataUsuario){
						var is_indefinido = dataUsuario[0].usde_contrato_indef;
						var fecha_ingreso = dataUsuario[0].usde_fec_ingreso;
						var fecha_vencimiento = dataUsuario[0].usde_fec_vencimiento;
						var fecha_fin = helpersMantenedor.ultimoDiaMesFecha(fecha_inicio);
						var sql_insertar_horarios = "call hermes.sp_agregar_horario_operador('"+fecha_inicio+"','"+fecha_fin+"','"+horarios[0].ophs_usuario_codigo+"','"+fecha_vencimiento+
						"',"+is_indefinido+",'"+fecha_ingreso+"')";
						console.log(sql_insertar_horarios);
						reportModel.executeQuery(sql_insertar_horarios,function(er,data3){
							res.status(200).json({result:true,message:"Se guardo correctamente."})
						});
					});
				});
			}
		});

	});

app.post("/mantenedor/eliminarHorarioOperador",function(req,res){
		//req.body = {id:492};
		console.log('body', req.body);
		var eliminar_horario = "update hermes.horario_operadora_semana set ophs_estado=0 where ophs_id_operadora_horario_semana="+req.body.id;
		console.log(eliminar_horario);

		reportModel.executeQuery(eliminar_horario,function(error,data){
			if(error){
				res.status(200).json({result:false,message:"Error a la tratar de eliminar horario."})
			}else{
				res.status(200).json({result:true,message:"Se elimino correctamente."})
			}
		});
	});


/****** metas ********/
app.get('/mantenedor/listaMetas',function(req,res){
	var filtro = "WHERE 1=1 ";
	if(req.query.hasOwnProperty("periodo") && req.query.periodo != ""){
		filtro += "AND met_periodo ='Y'";
	}
	reportModel.getListaMantenedorMeta(filtro,function(error,data){
		res.status(200).json(data);
	});
});

app.get('/mantenedor/getMetasDiaras',function(req,res){
	var filtro = "WHERE 1=1 AND met_id ="+req.query.id_meta;
	reportModel.getListaMetaDiarias(filtro,function(error,data){
		res.status(200).json(data);
	});
});

app.post('/mantenedor/guardarMeta',function(req,res){
	var modo = 0;
	if(req.body.hasOwnProperty('met_id_meta') && req.body.met_id_meta != ""){
		modo = 1;
	}
	console.log("modo",modo);
	var sql_insert_meta = helpersMantenedor.getSqlInsertMeta(req.body,modo);
	console.log(sql_insert_meta);
	reportModel.executeQuery(sql_insert_meta,function(error,inserto){
		if(error){
			res.status(200).json({result:false,message:"Ocurrio un error al tratar de guardar la meta"});
		}else{
			res.status(200).json({result:true,message:"Guardo Correctamente",id_meta:inserto.insertId});
		}
	});
});

app.post('/mantenedor/generarMetasDiarias',function(req,res){
	var id_cliente = req.body.meta.id_cliente;
	var id_servicio = req.body.meta.id_servicio;
	var meta = req.body.meta.met_meta;
	var mes = req.body.meta.met_mes;
	var ano = req.body.meta.met_ano;
	var periodo = req.body.meta.met_periodo;
	var meta_id = req.body.meta.met_id_meta;

	var tiempo_total = req.body.globales.totalIdealExce;
	var tiempo_total_format = req.body.globales.formatIdealExce;

	var sep_tiempo = tiempo_total_format.split(':');

		if(parseInt(sep_tiempo[1]) >= 30) // si los minutos superan o son igual a 30 minutos le agrego una hora
			sep_tiempo[0] = parseInt(sep_tiempo[0])+1;
		var horas = sep_tiempo[0];
		var base_meta_dia = meta/horas;

		
		var sqlInsert = helpersMantenedor.getInsertMetaDiaria(req.body.dias,base_meta_dia,meta_id);
		console.log(sqlInsert);
		reportModel.executeQuery(sqlInsert,function(error,inserto){
			if(error){
				res.status(200).json({result:false,message:"Ocurrio un error al tratar de guardar la meta"});
			}else{
				res.status(200).json({result:true,message:"Guardo Correctamente"});
			}
		});
	});

app.get('/mantenedor/getListValorEfectivo',function(req,res){
	var filtro_lista = "WHERE cvr_estado=1 AND cvr_fec_crea in \
	(SELECT MAX(cvr_fec_crea) FROM hermes.cvr_cliente_valor_registro GROUP BY cvr_id_cliente, cvr_id_servicio,cvr_id_pais) \
	GROUP BY  cvr_id_cliente, cvr_id_servicio,cvr_id_pais";
	reportModel.getListaValorEfectivo(filtro_lista,function(error,lista){
		var filtro_cliente = "WHERE ind_vigencia=1";
		reportVibox.getClientes(filtro_cliente,function(error_cli, clientes){
			var filtro_servicio = "WHERE ind_vigencia=1";
			reportVibox.getListaServicios(filtro_servicio,function(error_serv, servicios){
				var data = {};
				data['list'] = helpersMantenedor.formatValorEfectivo(lista, clientes, servicios);
				data['clientes'] = clientes; 
				data['servicios'] = servicios; 
				res.status(200).json(data);
			});
		});
		
	});
});

app.post('/mantenedor/guardarValorEfectivo',function(req,res){
	console.log(req.body);
	if(req.body.hasOwnProperty('cvr_id_cliente') && req.body.cvr_id_cliente != '' 
		&& req.body.hasOwnProperty('cvr_id_servicio') && req.body.cvr_id_servicio != '' 
		&& req.body.hasOwnProperty('velocidad') && req.body.velocidad != ''
		&& req.body.hasOwnProperty('valor') && req.body.valor != '' 
		&& req.body.hasOwnProperty('descripcion') && req.body.descripcion!=''
		&& req.body.hasOwnProperty('date') && req.body.date!=''){
		var filtro_exist = "WHERE id_cliente="+req.body.cvr_id_cliente+" AND id_servicio="+req.body.cvr_id_servicio;
		var fecha = req.body.date.split("/").reverse().join("-");
		reportVibox.getExistClienteServicio(filtro_exist,function(err, exist){
			if(exist.length==0){
				var insert_cliente="INSERT\
				INTO\
				viboxpanel.campana_servicio_clientes\
				(id_cliente, id_servicio, activo) VALUES";

				insert_cliente+=" ("+req.body.cvr_id_cliente+","+req.body.cvr_id_servicio+",0)";
				reportVibox.executeQuery(insert_cliente,function(err_ins_cliser,insert_cliser){
					if(err_ins_cliser)
						res.status(200).json({save:false, msje:'Error al insertar cliser'});
				});
			}
		});
		var desactivar_valor="UPDATE hermes.cvr_cliente_valor_registro\
		SET cvr_estado=0\
		WHERE cvr_id_cliente="+req.body.cvr_id_cliente+" AND cvr_id_servicio="+req.body.cvr_id_servicio+"\
			AND cvr_id_pais="+req.body.id_pais;
		reportModel.executeQuery(desactivar_valor,function(err_up,update){
			if(err_up)
				res.status(200).json({save:false, msje:'Error al actualizar'});
		});
		var valor = req.body.valor.toString().replace(',','.');

		var insert_valor="INSERT INTO hermes.cvr_cliente_valor_registro (cvr_id_cliente, cvr_id_servicio, cvr_descripcion, cvr_velocidad,\
		cvr_valorRegistro, cvr_fec_crea, cvr_usr_crea, cvr_fec_inicio,cvr_id_pais)\
		VALUES\
		("+req.body.cvr_id_cliente+", "+req.body.cvr_id_servicio+", '"+req.body.descripcion+"',\
		"+req.body.velocidad+", "+valor+", now(), "+req.cookies.user_id+", '"+fecha+"',"+req.body.id_pais+")";
		console.log(insert_valor);
		reportModel.executeQuery(insert_valor,function(err_ins,insert){
			if(err_ins)
				res.status(200).json({save:false, msje:'Error al insertar'});
			else{
				res.status(200).json({save:true, msje:'Valor insertado'});
			}
		});
	}else{
		res.status(200).json({save:false, msje:'Error en datos a insertar'});
	}
});

app.post('/mantenedor/verDetalle', function(req, res) {
	var filtro = "WHERE cvr_id_cliente="+req.body.cvr_id_cliente+" AND cvr_id_servicio="+req.body.cvr_id_servicio;
	reportModel.getListaValorEfectivo(filtro,function(error,lista){
		var listado = {};
		listado['lista'] = lista;
		listado['cliente'] = req.body.nom_cliente;
		listado['servicio'] = req.body.nom_servicio;
		res.status(200).json(listado);
	});
});

app.get('/mantenedor/getSueldoMinimo', function(req,res){
	var filtro_lista = "WHERE sum_estado=1";
	reportModel.getSueldoMinimo(filtro_lista,function(error,lista){
		res.status(200).json(lista);
	});
});

app.post("/mantenedor/guardarSueldoMinimo", function(req, res){
	if(req.body.hasOwnProperty('sueldo') && req.body.sueldo != 0
	&& req.body.hasOwnProperty('date') && req.body.date != ''){
		var fecha = req.body.date.split("/").reverse().join("-");
		var up_suel="UPDATE hermes.sueldo_minimo\
		SET sum_estado=0\
		WHERE sum_fecha_inicio='"+fecha+"' AND id_pais="+req.body.id_pais;
		reportModel.executeQuery(up_suel,function(err_up,update){
			if(err_up)
				res.status(200).json({save:false, msje:'Error al update'});
		});
		var insert_suel="INSERT INTO hermes.sueldo_minimo (sum_sueldo, sum_fecha_creacion, sum_fecha_inicio, user_id,id_pais)\
		VALUES\
		("+req.body.sueldo+", now(),'"+fecha+"',"+req.cookies.user_id+","+req.body.id_pais+")";
		reportModel.executeQuery(insert_suel,function(err_sueld,insert){
			if(err_sueld)
				res.status(200).json({save:false, msje:'Error al insert'});
			else
				res.status(200).json({save:true, msje:'Sueldo insertado correctamente!'});
		});
	}else{
		res.status(200).json({save:false, msje:'Error datos a insertar'});
	}
});

app.get("/mantenedor/getTramoCalidad", function(req, res){
	var filtro_lista = "WHERE trc_estado=1";
	reportModel.getTramoCalidad(filtro_lista,function(error,lista){
		res.status(200).json(lista);
	});
});

app.post("/mantenedor/guardarTramoCalidad", function(req, res){
	if(req.body.hasOwnProperty('tramo')
	&& req.body.hasOwnProperty('bono') 
	&& req.body.hasOwnProperty('date') && req.body.date != ''){
		var fecha = req.body.date.split("/").reverse().join("-");
		var up_tramo="UPDATE hermes.tramo_calidad\
		SET trc_estado=0\
		WHERE trc_fecha_inicio='"+fecha+"' AND trc_tramo="+req.body.tramo+" AND id_pais="+req.body.id_pais;
		reportModel.executeQuery(up_tramo,function(err_up,update){
			if(err_up)
				res.status(200).json({save:false, msje:'Error al update'});
		});

		var valor = req.body.bono.toString().replace(',','.');
		var insert_tram="INSERT INTO hermes.tramo_calidad (trc_tramo, trc_bono, trc_fecha_creacion, trc_fecha_inicio, user_id, id_pais)\
		VALUES\
		("+req.body.tramo+","+valor+", now(),'"+fecha+"',"+req.cookies.user_id+","+req.body.id_pais+")";
		reportModel.executeQuery(insert_tram,function(err_ins,insert){
			if(err_ins)
				res.status(200).json({save:false, msje:'Error al insert'});
			else
				res.status(200).json({save:true, msje:'Sueldo insertado correctamente!'});
		});
	}else{
		res.status(200).json({save:false, msje:'Error datos a insertar'});
	}
});

app.post("/mantenedor/detalleTramoCalidad", function(req, res){
	var data = {};
	var filtro_lista = "WHERE trc_tramo="+req.body.trc_tramo;
	reportModel.getTramoCalidad(filtro_lista,function(error,lista){
		data['lista']=lista;
		data['ptje']=req.body.trc_tramo;
		res.status(200).json(data);
	});
});

app.post("/mantenedor/cambiarEstadoTramoCalidad", function(req, res){
	var up_tramo="UPDATE hermes.tramo_calidad\
	SET trc_estado="+req.body.modo+"\
	WHERE trc_id_tramo_calidad="+req.body.trc_id_tramo_calidad;
	reportModel.executeQuery(up_tramo,function(err_up,update){
		if(err_up)
			res.status(200).json({save:false, msje:'Error al update'});
		else 
			res.status(200).json({save:true, msje:'Estado correcto'});
	});
});

app.post("/mantenedor/cambiarEstadoValorEfectivo", function(req, res){
	var up_tramo="UPDATE hermes.cvr_cliente_valor_registro\
	SET cvr_estado="+req.body.modo+"\
	WHERE cvr_id_cliente_valor_registro="+req.body.cvr_id_cliente_valor_registro;
	console.log(up_tramo);
	reportModel.executeQuery(up_tramo,function(err_up,update){
		if(err_up)
			res.status(200).json({save:false, msje:'Error al update'});
		else 
			res.status(200).json({save:true, msje:'Estado correcto'});
	});
});

app.get("/listYear", function(req, res){
	var year = moment().format('YYYY');
	var range = [];
	for(var i=1;i<2;i++) {
		range.push({year:(parseInt(year) - i)});
		range.push({year:parseInt(year)});
		range.push({year:(parseInt(year) + i)});
	}
	res.status(200).json(range);
});

app.post("/mantenedor/getFeriados", function(req, res){
	var year = moment().format('YYYY');
	if(req.body.hasOwnProperty('selectYear')
		&& req.body.selectYear.length!=0){
		year = req.body.selectYear;
}
var filtro = "WHERE YEAR(hfe_fecha_feriado)="+year;
reportModel.getFeriados(filtro, function(error, val){
	res.status(200).json(val); 
});
});

app.post("/mantenedor/agregarFeriado", function(req, res){
	if(req.body.hasOwnProperty('date') && req.body.date != ''
		&& req.body.hasOwnProperty('descripcion') && req.body.descripcion != ''
		&& req.body.hasOwnProperty('irrenunciable') && req.body.irrenunciable != ''){
		var fecha = req.body.date.split("/").reverse().join("-");
	var insert_fer = "INSERT INTO hermes.horario_feriado (hfe_fecha_feriado, hfe_descripcion, hfe_irrenunciable, hfe_fecha_creacion, user_id )\
	VALUES\
	('"+fecha+"','"+req.body.descripcion+"',"+req.body.irrenunciable+", now(),"+req.cookies.user_id+")";
	console.log(insert_fer);
	reportModel.executeQuery(insert_fer,function(err,insert){
		if(err)
			res.status(200).json({save:false, msje:'Error al insertar'});
		else 
			res.status(200).json({save:true, msje:'Feriado guardado'});
	});
}
});

app.post("/mantenedor/cambiarEstadoFeriado", function(req, res){
	var up_tramo="UPDATE hermes.horario_feriado\
	SET hfe_estado="+req.body.modo+"\
	WHERE hfe_id_horario_feriado="+req.body.hfe_id_horario_feriado;
	console.log(up_tramo);
	reportModel.executeQuery(up_tramo,function(err_up,update){
		if(err_up)
			res.status(200).json({save:false, msje:'Error al update'});
		else 
			res.status(200).json({save:true, msje:'Estado correcto'});
	});
});

app.get('/mantenedor/listaIncidencia',function(req,res){
	var filtro="";
	reportModel.getIncidencias(filtro,function(err,inc){
		res.status(200).json(inc);
	});
});

app.get('/mantenedor/listTipo',function(req,res){
	reportModel.getlistTipoIncidencia(function(err,inc){
		res.status(200).json(inc);
	});
});

app.post('/mantenedor/guardarIncidencia',function(req,res){
	console.log(req.body);
	var incidencia_vib = '';
	var incidencia_her = '';
	var incidencia = '';
	var flag = true;
	var icono = (req.body.hasOwnProperty("inc_icono")) ? "'"+req.body.inc_icono+"'":null;
	if(req.body.hasOwnProperty("inc_id_incidencia") && req.body.inc_id_incidencia != '' && req.body.inc_id_incidencia != null){
		flag = true;
		incidencia_her = "UPDATE hermes.incidencia ";
		incidencia_vib = "UPDATE viboxpanel2.inc_listado_incidencias ";
		incidencia = "SET inc_nom_incidencia='"+req.body.inc_nom_incidencia+"', inc_cod_incidencia='"+req.body.inc_cod_incidencia+"',\
		inc_descripcion='"+req.body.inc_descripcion+"', tin_id_tipo_incidencia="+req.body.tin_id_tipo_incidencia+", user_id="+req.cookies.user_id+",\
		inc_update=now(), inc_estado="+req.body.inc_estado+",\
		inc_icono="+icono+"\
		WHERE inc_id_incidencia="+req.body.inc_id_incidencia+";";
	}else{
		flag = false;
		incidencia_her = "INSERT INTO hermes.incidencia ";
		incidencia_vib = "INSERT INTO viboxpanel2.inc_listado_incidencias ";
		incidencia="(inc_nom_incidencia, inc_cod_incidencia, inc_descripcion, tin_id_tipo_incidencia, user_id, inc_update, inc_estado, inc_icono)\
		VALUES('"+req.body.inc_nom_incidencia+"', '"+req.body.inc_cod_incidencia+"', '"+req.body.inc_descripcion+"', "+req.body.tin_id_tipo_incidencia+",\
		"+req.cookies.user_id+", now(), "+req.body.inc_estado+", "+icono+");"
	}
	console.log(incidencia);
	incidencia_her += incidencia;
	incidencia_vib += incidencia;
	reportModel.executeQuery(incidencia_her,function(error_vic,data){
		reportVibox.executeQuery(incidencia_vib, function(error_vib, data){
			if(error_vic || error_vib){
				res.status(200).json({save:false,msje:"Error al guardar"});
			}else{
				if(flag)
					res.status(200).json({save:true,msje:"Incidencia modificada correctamente"});
				else
					res.status(200).json({save:true,msje:"Incidencia insertada correctamente"});
			}	
		});
	});
});

app.get('/mantenedor/getClienteServicio',function(req,res){
	reportModel.getListClienteServicios(function(err,data){
		res.status(200).json(data);
	})
});

app.get('/mantenedor/getTramoProduccion',function(req,res){
	var filtro = "WHERE 1=1 ";
	filtro += "AND bre_estado=1";
	reportModel.getBrechasProduccion(filtro,function(err,data){
		res.status(200).json(data);
	});
});

app.post('/mantenedor/guardarTramoProduccion',function(req,res){
	var query = "";
	if(req.body.hasOwnProperty("id_bre_brecha") && req.body.id_bre_brecha != ""){
		query = "UPDATE hermes.bre_brecha SET bre_brecha="+req.body.tramo+",bre_color='"+req.body.colo+"',cliente_servicio="+req.body.cliente_servicio;
		query += " WHERE id_bre_brecha = "+req.body.id_bre_brecha;
	}else{
		query = "INSERT INTO hermes.bre_brecha (bre_brecha,bre_color,cliente_servicio) VALUES (";
		query += req.body.tramo+",'"+req.body.color+"',"+req.body.cliente_servicio;
		query += ")";
	}
	console.log(query);
	reportModel.executeQuery(query,function(err_ins,data){
		if(err_ins)
			res.status(200).json({save:false, msje:'Error al guardar'});
		else
			res.status(200).json({save:true, msje:'Guardo correctamente!'});
	});
})

app.post("/mantenedor/agregarAgenda",function(req,res){
	reportVibox.findAniRut(req.body.rut,function(err,dataAni){
		if(dataAni.length == 0){
			var sql = "insert into viboxpanel.campana_anis(id_campana,nombre,direccion,comuna,ani,rut_cliente,operador,zona,estado) values(";
			sql += "1000105,'"+req.body.nombre+"','"+req.body.direccion+"','"+req.body.comuna+"',"+req.body.telefono+",'"+req.body.rut+"','"+req.body.operador+"',01,'NL')";
			reportVibox.executeQuery(sql,function(err,result){
				if(!err){
					reportVibox.findAniRut(req.body.rut,function(err,dataAni){
						var id_ani = dataAni[0].id_ani;
						sqlList = "INSERT asterisk.vicidial_list(entry_date,status,vendor_lead_code,source_id,list_id,phone_number) VALUES (";
						sqlList += "now(),'NEW',"+id_ani+","+id_ani+",5731000,"+req.body.telefono+")";
						reportModel.executeQuery(sqlList,function(errList,result){
							if(!errList){
								reportModel.findLeadByAni(id_ani,function(errLead,dataLead){
									lead_id = dataLead[0].lead_id;
									reportModel.getUserId(req.body.operador,function(errUser,dataOperador){
										var user_id = dataOperador[0].user_id;
										var insertAgenda = "INSERT INTO hermes.agendar_llamado(ag_fecha_creacion,ag_fecha_agenda,id_ani,vicu_user_id,lead_id) VALUES(";
										insertAgenda += "now(),concat(date(now()),' 21:00:00'),"+id_ani+","+user_id+","+lead_id+")";
										reportModel.executeQuery(insertAgenda,function(errAgenda,dataAgenda){
											if(errAgenda)
												res.status(200).json({save:false, msje:'Error al guardar'});
											else
												res.status(200).json({save:true, msje:'Guardo correctamente!'});
										});
									})
								});
							}else{
								res.status(200).json({save:false, msje:'Error al guardar'});
							}
						})
					});
				}else{
					res.status(200).json({save:false, msje:'Error al guardar'});
				}
			})
		}else{
			var id_ani = dataAni[0].id_ani;
			sqlList = "INSERT asterisk.vicidial_list(entry_date,status,vendor_lead_code,source_id,list_id,phone_number) VALUES (";
			sqlList += "now(),'NEW',"+id_ani+","+id_ani+",5731000,"+req.body.telefono+")";
			reportModel.executeQuery(sqlList,function(errList,result){
				if(!errList){
					reportModel.findLeadByAni(id_ani,function(errLead,dataLead){
						lead_id = dataLead[0].lead_id;
						reportModel.getUserId(req.body.operador,function(errUser,dataOperador){
							if(dataOperador.length == 0){
								res.status(200).json({save:false, msje:'Error al guardar'});
								return;
							}
							var user_id = dataOperador[0].user_id;
							var insertAgenda = "INSERT INTO hermes.agendar_llamado(ag_fecha_creacion,ag_fecha_agenda,id_ani,vicu_user_id,lead_id) VALUES(";
							insertAgenda += "now(),concat(date(now()),' 21:00:00'),"+id_ani+","+user_id+","+lead_id+")";
							reportModel.executeQuery(insertAgenda,function(errAgenda,dataAgenda){
								if(errAgenda)
									res.status(200).json({save:false, msje:'Error al guardar'});
								else
									res.status(200).json({save:true, msje:'Guardo correctamente!'});
							});
						})
					});
				}else{
					res.status(200).json({save:false, msje:'Error al guardar'});
				}
			})
		}
	})
})


app.get("/mantenedor/historialCartera",function(req,res){
	var filtroHistorial = "WHERE 1=1 ";
	filtroHistorial += "AND user_id ="+req.query.user_id;
	reportModel.getHistorialCarteraEjecutivo(filtroHistorial,function(err,dataHistorial){
		res.status(200).json(dataHistorial);
	});
});

app.get('/listOperador',function(req,res){
	var filtro="WHERE active='Y' AND user not like '%entre%'";
	reportModel.getEjecutivos(filtro,function(err,tipo){
		res.status(200).json(tipo);
	});
});

app.get('/listTipo',function(req,res){
	var filtro="WHERE inc.tin_id_tipo_incidencia=3 AND inc_estado=1";
	reportModel.getIncidencias(filtro,function(err,inc){
		res.status(200).json(inc);
	});
});

app.get('/tipoPermiso',function(req,res){
	var filtro="WHERE tip_estado=1";
	reportModel.getTipoPermiso(filtro,function(err,tipo){
		res.status(200).json(tipo);
	});
});

app.post('/guardarIncidencia',function(req,res){
	console.log("GUARDAR INCIDENCIA ADHERENCIA");
	var datos = {};
	var ins_recupero = '';
	var operador = [];
	var modo = '';
	console.log(req.body);
	if(req.body.hasOwnProperty("tipo") && req.body.tipo != '' && req.body.hasOwnProperty("date_begin") &&
		req.body.date_begin != '' && req.body.hasOwnProperty("date_end") && req.body.date_end !=' ' && req.body.hasOwnProperty("obs") && req.body.obs != ''){
		
		datos['fecha_inicio'] = req.body.date_begin.split("/").reverse().join("-");
	datos['fecha_fin'] = req.body.date_end.split("/").reverse().join("-");
	datos['obs'] = req.body.obs;
	datos['tipo'] = req.body.tipo;


	modo = (req.body.tipo == 33 || req.body.tipo == 34 || req.body.tipo == 35) ? modo = 'multiple' : modo = 'unico';
	if(modo == 'multiple'){
		if(req.body.masiva){
			operador[0] = 0;
		}else{
			operador = req.body.operador;
		}
	} else if(modo = 'unico'){
		operador[0] = req.body.operador;
	}
	datos['filtro'] = req.body; 
	datos['usuario_creacion'] = req.cookies.user_id;
	datos['operador'] = operador;
	var flag = false;
	var msj=true;
	var i = 0;
	async.whilst(function(){
		return i < datos['operador'].length;
	},function(next){
		var ej = datos['operador'][i];
		console.log(msj);
		console.log(ej);
		if(msj){
			msj=false;
			i = 0;
			if(req.body.hasOwnProperty('h_begin') && req.body.h_begin!='' && req.body.hasOwnProperty('h_end') && req.body.h_end!=''){
				datos['fecha_inicio']+=" "+req.body.h_begin;
				var hora_inicio = helpers.formatHoraATiempo(req.body.h_begin);
				var hora_fin = helpers.formatHoraATiempo(req.body.h_end);
				if(hora_fin>hora_inicio)
					datos['segundos']=parseInt(hora_fin)-parseInt(hora_inicio);
				if(req.body.hasOwnProperty('permiso') && req.body.permiso == 1){
					var hora_inicio_rec = helpers.formatHoraATiempo(req.body.rec_h_begin);
					var hora_fin_rec = helpers.formatHoraATiempo(req.body.rec_h_end);
					if(hora_fin_rec>hora_inicio_rec){
						datos['segundos_rec']=parseInt(hora_fin_rec)-parseInt(hora_inicio_rec);
					}
					if(datos['segundos']!=datos['segundos_rec']){
						flag='info';
						i = datos['operador'].length;
					}
				}
			}
			next();
		}else{
			var insert_bitacora = "INSERT INTO hermes.bop_bitacora_operadora (usu_id_operadora, bop_fecha_ingreso, bop_fecha_incidencia,\
			bop_observacion,usu_id_usuario_ingreso, inc_id, tgo_id, tgs_id) VALUES ";
			insert_bitacora += "("+ej+", now(),'"+datos['fecha_inicio']+"','"+datos['obs']+"',"+req.cookies.user_id+","+datos['tipo']+",0,0)";
			console.log(insert_bitacora);
			reportModel.executeQuery(insert_bitacora,function(error,data){
				console.log(data.insertId);
				if(error)
					flag=false;
				var id_bitacora = data.insertId;

				var listFechas = helpers.listarDiasEntreFechas(req.body.cant_dias,req.body.date_begin);

				datos['filtro'] = req.body; 
				datos['fechas'] = listFechas;
				datos['id_bitacora'] = id_bitacora;
				var filtro_sup = "WHERE us_sup_fecha_asignacion = ( SELECT max(usup2.us_sup_fecha_asignacion) FROM hermes.usuario_supervisor usup2\
				WHERE usup2.us_sup_user = usup.us_sup_user AND us_sup_fecha_cambio <= CURDATE()) AND user_id ="+ej;
				reportModel.getSupOperador(filtro_sup,function(err,sup){
					if(err)
						flag=false;
					datos['supervisor'] = (sup.length==0) ? ' ': sup[0].usuario_codigo;
					var insert = helpers.formatoInsertIncidencia(ej,datos);
					console.log(insert.insert);
					reportModel.executeQuery(insert.insert,function(error_ins,ins){
						if(error_ins){
							i++;
							flag=false;
							next();
						}else if(!insert.recupero){
							flag=true;
							i++;
							next();
						}
						if(insert.recupero){
							var fecha_recupero = req.body.rec_date_begin.split("/").reverse().join("-");
							ins_recupero = "INSERT INTO hermes.horario_operadora_excepciones (vicu_user_id, sup_usuario, hop_fecha, hop_inicio, hop_termino, hop_segundos, tho_id, bop_id_bitacora_operadora) VALUES ";
							ins_recupero += "("+id_vicidial+", '"+datos['supervisor']+"', '"+fecha_recupero+"', '"+req.body.rec_h_begin+"', '"+req.body.rec_h_end+"', "+datos['segundos_rec']+", 4, "+id_bitacora+")";
							console.log(ins_recupero);
							reportModel.executeQuery(ins_recupero,function(error_rec,rec){
								if(error_rec)
								{	
									flag=false;
									i++;
									next();
								}else{
									flag=true;
									i++
									next();
								}
							});
						}
					});
				});

			});
		}
		},function(error_each){
			console.log("TERMINO", flag);
			if(flag=='info')
				res.status(200).json({save:'info', msje:"Tiempo a recuperar debe coincidir con el tiempo de permiso"});
			else if(flag)
				res.status(200).json({save:true, msje:"Incidencia ingresada"});
			else
				res.status(200).json({save:false, msje:"ERROR"});
		});
	}else{
		res.status(200).json({save:false,msje:"Revise su formulario y vuelva a intentar!!"});
	}
});

app.post('/listaIncidenciasAdherencia',function(req,res){
	var datos = {};
	var filtro_bitacora="WHERE tin_id_tipo_incidencia = 3";
	var limit = "";
	if(!req.body.reporte)
		limit = "LIMIT 20";
	else{
		var inicio = req.body.date_begin.split("/").reverse().join("-");
		var fin = req.body.date_end.split("/").reverse().join("-");
		filtro_bitacora += " AND DATE(bop_fecha_ingreso) BETWEEN '"+inicio+"' AND '"+fin+"'";
	}
	reportModel.getBitacoraIncidencias(filtro_bitacora, limit,function(err,bitacora){
		var imp_bop = helpersMantenedor.implodeBit(bitacora);
		var filtro_validado_max = "WHERE hov_fecha = (SELECT MAX(hov_fecha) FROM hermes.horario_operador_validado hov2\
		WHERE hov.bop_id_bitacora_operadora = hov2.bop_id_bitacora_operadora) AND bop_id_bitacora_operadora in ("+imp_bop+")";
		reportModel.getHorarioOperadorValidado(filtro_validado_max,function(err,val_max){
			var filtro_validado_min = "WHERE hov_fecha = (SELECT MIN(hov_fecha) FROM hermes.horario_operador_validado hov2\
			WHERE hov.bop_id_bitacora_operadora = hov2.bop_id_bitacora_operadora) AND bop_id_bitacora_operadora in ("+imp_bop+")";
			reportModel.getHorarioOperadorValidado(filtro_validado_min,function(err,val_min){
				var filtro_excepcion_max = "WHERE hop_fecha = (SELECT MAX(hop_fecha) FROM hermes.horario_operadora_excepciones hex2\
				WHERE hex.bop_id_bitacora_operadora = hex2.bop_id_bitacora_operadora AND hex.tho_id = hex2.tho_id) AND bop_id_bitacora_operadora in ("+imp_bop+")";
				reportModel.getHorarioOperadorExcepcion(filtro_excepcion_max,function(err,exc_max){
					var filtro_excepcion_min = "WHERE hop_fecha = (SELECT MIN(hop_fecha) FROM hermes.horario_operadora_excepciones hex2\
					WHERE hex.bop_id_bitacora_operadora = hex2.bop_id_bitacora_operadora AND hex.tho_id = hex2.tho_id) AND bop_id_bitacora_operadora in ("+imp_bop+")";
					reportModel.getHorarioOperadorExcepcion(filtro_excepcion_min,function(err,exc_min){
						datos['bitacora'] = bitacora;
						datos['val_max'] = val_max;
						datos['val_min'] = val_min;
						datos['exc_max'] = exc_max;
						datos['exc_min'] = exc_min;
						var incidencias = helpersMantenedor.formatIncidenciasAdherencia(datos);
						res.status(200).json(incidencias);
					});
				});
			});
		});
	});
});

app.post('/revisionIncidencia',function(req,res){
	//	console.log(req.body);
	if(req.body.length != 0){
		var masiva = false;
		var update = '';
		var ins_ho = false;
		var ejecutivos = {};
		var datos = {};
		console.log(req.body);
		datos['fecha'] = req.body.desde;
		var fecha = datos['fecha'].split(' ');
		var fecha_rev = fecha[0].split("/").reverse().join("-");
			/*ID INCIDENCIA 
			*33 = Validación
			*34 = Validación masiva
			*35 = Validación técnica
			*/
			if(req.body.id_incidencia != 33 && req.body.id_incidencia != 34  && req.body.id_incidencia != 35){
				update = "UPDATE hermes.horario_operadora_excepciones\
				SET hop_aprobado = "+req.body.estado+", hop_us_apro="+req.cookies.user_id+", hop_fecha_apro=now()\
				WHERE bop_id_bitacora_operadora = "+req.body.id_bitacora+";";
				ins_ho = false;
			}else{
				update = "UPDATE hermes.horario_operador_validado\
				SET hov_aprobado = "+req.body.estado+", hov_us_apro="+req.cookies.user_id+", hov_fecha_apro=now()\
				WHERE bop_id_bitacora_operadora = "+req.body.id_bitacora+";";
				if(req.body.estado == 1){
					ins_ho = true;
				}
			}
			if(ins_ho){
				if(req.body.id_ejecutivo !=0){
					ejecutivos[0] = {id_usuario: req.body.id_ejecutivo, usuario_codigo: req.body.ejecutivo};
					datos['excepcion'] = 'Excepción de operador';
				}else{
					masiva = true;
					datos['excepcion'] = 'Excepción de sistema';
				}	
				switch(req.body.id_incidencia){
					case 33:
						console.log("VALIDACIÓN");
						datos['horas'] = helpers.formatSegundoHora(req.body.segundos);
						datos['segundos'] = req.body.segundos;
						filtro_ejecutivas="WHERE us.active='Y'";
						if(!masiva){
							filtro_ejecutivas += " AND us.user_id="+ejecutivos[0].id_usuario;
						}
						reportModel.getUsersBySupervisor(filtro_ejecutivas,function(err,ejec){
							var im_ejec = helpersMantenedor.implodeEjecutivosActivo(ejec);
							im_ejec = (im_ejec != ' ') ? im_ejec : "'"+ejecutivos[0].usuario_codigo+"'";
							var filtro_ejec_vib = "WHERE ind_agente=1 AND ind_estado=1 AND usuario_codigo in ("+im_ejec+")";
							reportVibox.getEjecutivos(filtro_ejec_vib,function(err,ejec_v){
								if(ejec_v.length>0){
									ejecutivos = ejec_v;
									var insert = helpersMantenedor.formatoInsertHorariolReal(ejecutivos, datos);
									console.log(insert);
									reportVibox.executeQuery(insert,function(error_ins, ins){
										if(error_ins)
											res.status(200).json({save:false,msje:"No se ha modificado revision"});
										else{
											console.log(update);
											reportModel.executeQuery(update,function(error_hv,data){
												if(error_hv)
													res.status(200).json({save:false,msje:"No se ha modificado revisión"});
												else
													res.status(200).json({save:true,msje:"Revisión guardada correctamente"});
											});
										}
									});
								}else{
									res.status(200).json({save:false,msje:"No se ha modificado revisión",list:im_ejec});	
								}
							});
						});
					break;
					case 34:
						var f_inicio = req.body.desde.split(' ');
						var f_fin = req.body.hasta.split(' ');
						console.log(f_inicio);
						console.log(f_fin);
						console.log("VALIDACIÓN AL 100%");
						var turno_ideal = "AND date(hop_fecha) = '"+fecha_rev+"'";
						var turno_ideal_inc ="WHERE hop_estado=1 AND date(hop_fecha) = '"+fecha_rev+"'";
						if(!masiva){
							turno_ideal += " AND user_id = "+req.body.id_ejecutivo;
							turno_ideal_inc += " AND vicu_user_id = "+req.body.id_ejecutivo;
						}
						reportModel.getHorarioIdeal(turno_ideal, function(erri, idl){
							reportModel.getExcepcionesTurno(turno_ideal_inc,function(erret, exep){
							var ideal = idl;
							var i=0;
							var flag = false;
							var list = '';
							var id_imp = helpers.implodeIDEjecutivos(idl);
							var turno_real="AND date(mpr_date) = '"+fecha_rev+"' AND user_id in ("+id_imp+")";
							reportModel.getHorario(turno_real,function(errr, rl){
								var real =rl;
								var filtro_vib="WHERE med.fecha_llamado = '"+fecha_rev+"'";
								reportVibox.getListRealVibox(filtro_vib, function(errv, real_vib){
								var tiempos = helpersMantenedor.formatTiemposValidacionCompleta(ideal, real, real_vib);
									async.whilst(function(){
										return i < tiempos.length;
									},function(next){
										var tiempo = tiempos[i];
										console.log(tiempo);
										var aplica = helpersMantenedor.calculaValidacionTurnoCompleto(tiempo.real, tiempo.ideal, req.body.segundos,tiempo.id_user,exep,f_inicio[1],f_fin[1]);
										if(!aplica.aplica){
											flag=true;
											i++;
											next();
										}else{
											datos['segundos'] = aplica.tiempo_faltante;
											datos['horas'] = helpers.formatSegundoHora(aplica.tiempo_faltante);
											var filtro_ejec_vib = "WHERE ind_agente=1 AND ind_estado=1 AND usuario_codigo in ('"+tiempo.user+"')";
											reportVibox.getEjecutivos(filtro_ejec_vib,function(errej,ejec_v){
												if(errej)
													flag=false;
												else if(ejec_v.length>0){
													ejecutivos = ejec_v;
													var insert = helpersMantenedor.formatoInsertHorariolReal(ejecutivos, datos);
													console.log(insert);
													reportVibox.executeQuery(insert,function(error_ins, ins){
														if(error_ins)
															flag=false;
														else
															flag=true;
														i++;
														next();	
													});
												}else{
													if(list!='') list += ' - ';
													list += tiempo.user;
													i++;
													next();	
												}

											});
										}
									},function(error_each){
										if(flag){
											console.log(update);
											reportModel.executeQuery(update,function(error_hv,data){
												if(error_hv)
													res.status(200).json({save:false,msje:"No se ha modificado revisión",list:list});
												else
													res.status(200).json({save:true,msje:"Revisión guardada correctamente",list:list});
											});
										}
										else
											res.status(200).json({save:false, msje:"No se ha modificado revisión",list:list});
									});
								});
								});
							});
						});
					break;
					case 35:
						console.log("VALIDACIÓN TÉCNICA");
						var f_inicio = req.body.desde.split(' ');
						var f_fin = req.body.hasta.split(' ');
						var turno_ideal_inc ="WHERE hop_estado=1 AND date(hop_fecha) = '"+fecha_rev+"'\
						";
						var list = '';
						if(!masiva)
							turno_ideal_inc += " AND vicu_user_id = "+req.body.id_ejecutivo;
						reportModel.getTurno(turno_ideal_inc, function(errii, idli){
							reportModel.getExcepcionesTurno(turno_ideal_inc,function(erret, exep){
							if(errii)
								res.status(200).json({save:true, msje:"Incidencia modificada"});
							else{
								var turno_inc = idli;
								if(turno_inc.length!=0){
									var ejecutivos = helpersMantenedor.listEjecutiva(turno_inc);
									ejecutivos = helpers.sort_unique(ejecutivos);
									console.log(ejecutivos);
									var turno = helpersMantenedor.validarTurno(ejecutivos,turno_inc,f_inicio[1],f_fin[1],exep);
									console.log(turno);
									var id_imp = helpersMantenedor.implodeEjecutivos(ejecutivos);
									console.log(id_imp);	
									var turno_ideal = "AND date(hop_fecha) = '"+fecha_rev+"' AND user_id in ("+id_imp+")";
									reportModel.getHorarioIdeal(turno_ideal, function(erri, idl){
										var ideal_turno = idl;
										var turno_real="AND date(mpr_date) = '"+fecha_rev+"' AND user_id in ("+id_imp+")";
										reportModel.getHorario(turno_real,function(errr, rl){
											var real = rl;
											var filtro_vib="WHERE med.fecha_llamado = '"+fecha_rev+"'";
											reportVibox.getListRealVibox(filtro_vib, function(errv, real_vib){
											var tiempos = helpersMantenedor.formatoTiempoValidacionTecnica(turno, ideal_turno, real, real_vib);
											var i=0;
											var flag = false;
											async.whilst(function(){
												return i < tiempos.length;
											},function(next){
												var tiempo = tiempos[i];													
												console.log(tiempo);
												if(tiempo.msje!='' || tiempo.real<1){
													console.log("S V");
													if(tiempo.ideal <= tiempo.ideal_inc){
														console.log("VALIDACION - TURNO COMPLETO" );
														datos['segundos'] = tiempo.ideal;
														datos['horas'] = helpers.formatSegundoHora(tiempo.ideal);
														var filtro_ejec_vib = "WHERE ind_agente=1 AND ind_estado=1 AND usuario_codigo in ('"+tiempo.user+"')";
														reportVibox.getEjecutivos(filtro_ejec_vib,function(errej,ejec_v){
															if(errej)
																flag=false;
															else if(ejec_v.length>0){
																ej = ejec_v;
																var insert = helpersMantenedor.formatoInsertHorariolReal(ej, datos);
																console.log(insert);
																reportVibox.executeQuery(insert,function(error_ins, ins){
																	if(error_ins)
																		flag=false;
																	else{
																		flag=true;
																		i++;
																		next();	
																	}
																});
															}else{
																if(list!='') list += ' - ';
																list += tiempo.user;
																i++;
																next();	
															}

														});
													}else{
														if(tiempo.real > 0){
															console.log("VALIDACION - TURNO EN INCIDENCIA");
															datos['segundos'] = tiempo.ideal_inc;
															datos['horas'] = helpers.formatSegundoHora(tiempo.ideal_inc);
															var filtro_ejec_vib = "WHERE ind_agente=1 AND ind_estado=1 AND usuario_codigo in ('"+tiempo.user+"')";
															reportVibox.getEjecutivos(filtro_ejec_vib,function(errej,ejec_v){
																if(errej){
																	console.log("ERROR");
																	flag=false;
																}else if(ejec_v.length>0){
																	ej = ejec_v;
																	var insert = helpersMantenedor.formatoInsertHorariolReal(ej, datos);
																	console.log(insert);
																	reportVibox.executeQuery(insert,function(error_ins, ins){
																		if(error_ins)
																			flag=false;
																		else{
																			flag=true;
																			i++;
																			next();	
																		}
																	});
																}else{
																	if(list!='') list += ' - ';
																	list += tiempo.user;
																	i++;
																	next();	
																}
															});
														}else{
															flag=true;
															i++;
															console.log("S/V");
															next();
														}
													}
												}else{
													flag=true;
													i++;
													console.log("S/V");
													next();
												}
											},function(error_each){
												console.log("RESP ",flag);
												if(flag){
													console.log(update);
													reportModel.executeQuery(update,function(error_hv,data){
														if(error_hv)
															res.status(200).json({save:false,msje:"No se ha modificado revisión",list:list});
														else
															res.status(200).json({save:true,msje:"Revisión guardada correctamente",list:list});
													});
												}
												else
													res.status(200).json({save:false, msje:"ERROR",list:list});
												});
											});
										});
									});
								}
							}
							});
						});
					break;
				}
			}else{
				console.log(update);
				reportModel.executeQuery(update,function(error_hv,data){
					if(error_hv)
						res.status(200).json({save:false,msje:"No se ha modificado revisión"});
					else
						res.status(200).json({save:true,msje:"Revisión guardada correctamente"});
				});
			}

	}else
		res.status(200).json({save:false,msje:"No se han recibido datos"});
});

app.get("/mantenedor/getContratos", function(req, res){
	var filtro="";
	reportModel.getListadoContratos(filtro,function(err,data){
		res.status(200).json(data);
	});
});

app.post('/mantenedor/agregarContrato',function(req,res){
	console.log(req.body);
	if(req.body.contrato_nombre != ''  && req.body.contrato_semana_corrida !=''){
		var insert = "INSERT INTO hermes.contratos (contrato_nombre, contrato_base, contrato_horas, contrato_semana_corrida, contrato_fecha_modificacion, user_id)\
		VALUES ('"+req.body.contrato_nombre+"',"+req.body.contrato_base+","+req.body.contrato_horas+", "+req.body.contrato_semana_corrida+", now(),"+req.cookies.user_id+");";
		console.log(insert);
		reportModel.executeQuery(insert,function(error_ins, ins){
			if(error_ins)
				res.status(200).json({save:false, msje:"ERROR"});
			else
				res.status(200).json({save:true, msje:"Contrato agregado correctamente!"});
		});
	}
});

app.post('/mantenedor/estadoContrato',function(req,res){
	console.log(req.body);
	var estado = (req.body.modo=='desactivar') ? 0:1;
	if(estado==0 && req.body.ejecutivos>0)
		res.status(200).json({save:'info'});
	else{
		var update="UPDATE hermes.contratos\
		SET ind_vigente="+estado+", contrato_fecha_modificacion=now(), user_id="+req.cookies.user_id+"\
		WHERE id_contrato="+req.body.id_contrato;
		console.log(update);
		reportModel.executeQuery(update,function(error_ins, ins){
			if(error_ins)
				res.status(200).json({save:false, msje:"ERROR"});
			else
				res.status(200).json({save:true, msje:"Contrato modificado correctamente!"});
		});
	}
});

app.post('/mantenedor/semanaCorridaContrato',function(req,res){
	var estado = (req.body.modo=='desactivar') ? 0:1;
	var update="UPDATE hermes.contratos\
	SET contrato_semana_corrida="+estado+", contrato_fecha_modificacion=now(), user_id="+req.cookies.user_id+"\
	WHERE id_contrato="+req.body.id_contrato;
	console.log(update);
	reportModel.executeQuery(update,function(error_ins, ins){
		if(error_ins)
			res.status(200).json({save:false, msje:"ERROR"});
		else
			res.status(200).json({save:true, msje:"Semana corrida modificada correctamente!"});
	});
});

app.get('/mantenedor/listaCosto',function(req,res){
	var filtro = ""
	reportModel.getListaBrechaCosto(filtro,function(error,brechas){
		res.status(200).json(brechas);
	})
});

app.post('/mantenedor/guardaBrechaCosto',function(req,res){
	var sql = "";
	if(typeof(req.body.brecha_costo_id) == "undefined"){
		sql = "INSERT INTO hermes.brecha_costo(brecha_costo_numero,brecha_costo_estado,id_cliente,id_servicio) VALUES";
		sql += "("+req.body.brecha_costo_numero+",1,"+req.body.idCliente+","+req.body.idServicio+")";
	}
	else{
		sql = "UPDATE hermes.brecha_costo SET brecha_costo_numero="+req.body.brecha_costo_numero;
		sql += " WHERE brecha_costo_id="+req.body.brecha_costo_id;
	}
	console.log(sql);
	reportModel.executeQuery(sql,function(error,data){
		if(error)
			res.status(200).json({save:false, msje:"ERROR"});
		else
			res.status(200).json({save:true, msje:"Contrato modificado correctamente!"});
	})
});

app.post('/mantenedor/desactBrechaCosto',function(req,res){
	var sqlDesactivacion = "UPDATE hermes.brecha_costo SET brecha_costo_estado=0 WHERE brecha_costo_id="+req.body.brecha_costo_id;
	console.log(sqlDesactivacion);
	reportModel.executeQuery(sqlDesactivacion,function(err_del,data){
		if(err_del)
			res.status(200).json({save:false, msje:"ERROR"});
		else
			res.status(200).json({save:true, msje:"Contrato modificado correctamente!"});	
	})
});

app.get('/mantenedor/listarPerfiles',function(req,res){
	var filtro = " ";
	reportModel.getListaPerfiles(filtro, function(err, data){
		res.status(200).json(data);
	});
});

app.post("/mantenedor/listaMenu",function(req,res){
	console.log(req.body);
	var fl = '';
	if(req.body.modo==1){
		fl = "WHERE per_id_perfil="+req.body.per_id_perfil;
	}
	var filtro = "WHERE mos_estado = 1 AND (mos_id_modulo_sio_calling in (SELECT mos_id_modulo_sio_calling FROM hermes.perfil_modulo "+fl+"))";
	reportModel.getListaModulosMenu(filtro, function(err, menu_perfil){
		filtro_total = "WHERE mos_estado = 1 AND !(mos_id_modulo_sio_calling in(SELECT mos_id_modulo_sio_calling FROM hermes.perfil_modulo "+fl+"))";
		reportModel.getListaModulosMenu(filtro_total, function(err, menu){
			res.status(200).json({perfil:menu_perfil,general:menu});
		});
	});
});

app.post("/mantenedor/listaMenuPadre",function(req,res){
	filtro = "WHERE mop_estado = 1";
	reportModel.getListaMenuPadre(filtro, function(err, menu_perfil){
		res.status(200).json({perfil:menu_perfil});
	});
});

app.post("/mantenedor/modificarPerfil",function(req,res){
	console.log(req.body);
	var id_user=req.cookies.user_id;
	var update = "UPDATE hermes.perfil\
	SET per_nombre='"+req.body.per_nombre+"', per_descripcion='"+req.body.per_descripcion+"', per_fecha_actualizacion=now(), user_id="+req.cookies.user_id+"\
	WHERE per_id_perfil="+req.body.per_id_perfil;

	var delete_perfil="DELETE FROM hermes.perfil_modulo\
	WHERE per_id_perfil="+req.body.per_id_perfil;

	var insert = helpersMantenedor.formatInsertModuloPerfil(req.body.perfil, req.body.per_id_perfil,id_user);

	console.log(update);
	reportModel.executeQuery(update,function(err_up,data){
		if(err_up)
			res.status(200).json({save:false, msje:"ERROR"});
		else{
			console.log(delete_perfil);
			reportModel.executeQuery(delete_perfil,function(err_del,data){
				if(err_del)
					res.status(200).json({save:false, msje:"ERROR"});
				else{
					console.log(insert);
					reportModel.executeQuery(insert,function(err_ins,data){
						if(err_ins)
							res.status(200).json({save:false, msje:"ERROR"});
						else
							res.status(200).json({save:true, msje:"Perfil modificado exitosamente!"});
					});
				}
			});
		}
	});
});

app.post("/mantenedor/agregarPerfil",function(req,res){
	var id_user=req.cookies.user_id;
	var insert_perfil = "INSERT INTO hermes.perfil (per_nombre, per_descripcion,per_fecha_actualizacion,user_id) VALUES\
	('"+req.body.per_nombre+"','"+req.body.per_descripcion+"',now(),"+req.cookies.user_id+")";
	console.log(insert_perfil);
	reportModel.executeQuery(insert_perfil,function(err_up,data){
		if(err_up)
			res.status(200).json({save:false, msje:"ERROR1"});
		else{
			var id_perfil=data.insertId;
			var insert = helpersMantenedor.formatInsertModuloPerfil(req.body.perfil,id_perfil,id_user);
			console.log(insert);
			reportModel.executeQuery(insert,function(err_ins,data){
				if(err_ins)
					res.status(200).json({save:false, msje:"ERROR"});
				else
					res.status(200).json({save:true, msje:"Perfil creado exitosamente!"});
			});
		}
	});

});

app.post("/mantenedor/estadoPerfil",function(req,res){
	var update = "UPDATE hermes.perfil\
	SET per_estado="+req.body.modo+", per_fecha_actualizacion=now(), user_id="+req.cookies.user_id+"\
	WHERE per_id_perfil="+req.body.per_id_perfil;
	console.log(update);
	reportModel.executeQuery(update,function(err_up,data){
		if(err_up)
			res.status(200).json({save:false, msje:"ERROR1"});
		else{
			res.status(200).json({save:true, msje:"Perfil modificado exitosamente!"});
		}
	});

});

app.get("/mantenedor/listUsuarios", function(req, res){
		/*user_level
		*1 = Operador
		*7 = Remuneraciones
		*8 = supervisor
		*9 = Administrador
		*user 6666 - admin
		*/
		filtro="WHERE active='Y' AND user!=6666 AND user_level in (1,7,9,8)";
		reportModel.getListaUsuarios(filtro, function(err, data){
			res.status(200).json(data);
		});
	});

app.get("/mantenedor/listPerfilesActivos", function(req, res){
	var filtro = "WHERE per_estado=1";
	reportModel.getListaPerfiles(filtro, function(err, data){
		res.status(200).json(data);
	});
});

app.post("/mantenedor/guardarUsuario", function(req, res){
	console.log(req.body);
	var update_user = "UPDATE asterisk.vicidial_users SET full_name='"+req.body.full_name+"', pass='"+req.body.pass+"', active='"+req.body.active+"' WHERE user_id="+req.body.user_id;
	if(req.body.per_nombre!=null)
		var update_perfil = "UPDATE hermes.usuario_perfil SET per_id_perfil="+req.body.per_id_perfil+" WHERE user_id="+req.body.user_id;
	else
		var update_perfil = "INSERT INTO hermes.usuario_perfil (per_id_perfil,user_id) VALUES ("+req.body.per_id_perfil+","+req.body.user_id+");"
	console.log(update_user);
	reportModel.executeQuery(update_user,function(err_up,user){
		if(err_up)
			res.status(200).json({save:false, msje:"ERROR1"});
		else{
			console.log(update_perfil);
			reportModel.executeQuery(update_perfil,function(err_upp,perfil){
				if(err_up)
					res.status(200).json({save:false, msje:"ERROR2"});
				else{
					res.status(200).json({save:true, msje:"Perfil modificado exitosamente!"});
				}
			});
		}
	});

});

app.post("/mantenedor/desactivarUsuario", function(req, res){
	var update_user = "UPDATE asterisk.vicidial_users SET active='N' WHERE user_id="+req.body.user_id;
	console.log(update_user);
	reportModel.executeQuery(update_user,function(err_up,user){
		if(err_up)
			res.status(200).json({save:false, msje:"ERROR1"});
		else{
			res.status(200).json({save:true, msje:"Perfil modificado exitosamente!"});
		}
	});
});


app.get("/mantenedor/listaModulos", function(req,res){
	var filtro = "WHERE mos_estado=1";
	reportModel.getListaModulosMenu(filtro, function(err, data){

		res.status(200).json(data);
	});
})
app.get("/mantenedor/listasEncuestas", function(req,res){
	reportModel.getListaEncuestas(function(err,data){

		res.status(200).json(data);
	});
});

app.post("/mantenedor/guardarModulo",function(req,res){
	if(req.body.mos_titulo != "" && req.body.mos_titulo_pagina != "" && req.body.mos_descripcion != ""){
		var update="UPDATE hermes.modulo_sio_calling\
		SET mos_titulo='"+req.body.mos_titulo+"', mos_titulo_pagina='"+req.body.mos_titulo_pagina+"', mos_descripcion='"+req.body.mos_descripcion+"'\
		WHERE mos_id_modulo_sio_calling="+req.body.mos_id_modulo_sio_calling;
		console.log(update);
		reportModel.executeQuery(update, function(err, data){
			if(err)
				res.status(200).json({save:false, msje:"ERROR"});
			else{
				res.status(200).json({save:true, msje:"Modulo modificado exitosamente!"});
			}
		});
	}else
	res.status(200).json({save:false, msje:"ERROR"});
});
app.get("/mantenedor/traerListas",function(req,res){
	reportModel.getListas(function(err,data){
		res.status(200).json(data);
	})
});

app.get("/mantenedor/getZonaLista",function(req,res){
	var lista_id = req.query.list_id;
	reportModel.getZonasPorLista(lista_id,function(err,data){
		res.status(200).json(data);
	})
});

app.post("/mantenedor/guardaListaEncuesta",function(req,res){
	var sqlLista = "";
	if(typeof(req.body.id_lista_encuesta) != "undefined"){
		sqlLista = "UPDATE hermes.lista_encuesta SET limite = "+req.body.limite+" WHERE id_lista_encuesta = "+req.body.id_lista_encuesta;
	}else{
		sqlLista = "INSERT INTO hermes.lista_encuesta(id_list,limite,zona_id) VALUES(";
		sqlLista+= req.body.list_id+",";
		sqlLista+= req.body.limite+",";
		sqlLista+= "'"+req.body.zona_id+"')";
	}
	console.log(sqlLista);
	reportModel.executeQuery(sqlLista,function(error,data){
		if(error)
			res.status(200).json({save:false, msje:"ERROR"});
		else{
			res.status(200).json({save:true, msje:"Limite ingresado exitosamente"});
		}
	})
});
app.get("/mantenedor/iconos",function(req,res){
	var filtro = "WHERE ic_estado=1";
	reportModel.getIconos(filtro, function(err, icons){
		res.status(200).json(icons);
	});		
});

app.get('/mantenedor/campanasActivas', function(req, res){
	var filtro = "WHERE active='Y'";
	reportModel.getListaCampanasActivas(filtro, function(err, camp){
		res.status(200).json(camp);
	});
});

app.post('/mantenedor/campanasEjecutivo',function(req, res){
	var filtro="INNER JOIN hermes.campana_capacitacion_ejecutiva cce ON SUBSTR(campaign_id, 1, 4)=cce.campaing_id\
	WHERE active = 'Y' AND cce_estado=1 AND vicuser_id="+req.body.user_id;
	reportModel.getListaCampanasActivas(filtro, function(err,cam){
		var camp = helpersMantenedor.formatoCampanasEjecutivo(cam);
		res.status(200).json(camp);
	});
});

//GUARDAR PAIS
app.post('/mantenedor/guardarPais',function(req,res){
	console.log(req.body);
	var sql_execute = "";
	if(typeof(req.body.id_pais) == "undefined"){
		sql_execute = "INSERT INTO hermes.paises (nombre_pais,codigo_pais,codigo_moneda,simbolo_moneda)\
		VALUES ('"+req.body.nombre_pais+"','"+req.body.codigo_pais+"','"+req.body.codigo_moneda+"','"+req.body.simbolo_moneda+"');";
	}else{
		sql_execute = "UPDATE hermes.paises SET nombre_pais='"+req.body.nombre_pais+"',codigo_pais='"+req.body.codigo_pais+"',codigo_moneda='"+req.body.codigo_moneda+"',simbolo_moneda='"+req.body.simbolo_moneda+"' WHERE id_pais="+req.body.id_pais;
	}
	console.log(sql_execute);
	reportModel.executeQuery(sql_execute,function(error_ins, ins){
		if(error_ins)
			res.status(200).json({save:false, msje:"ERROR"});
		else
			res.status(200).json({save:true, msje:"Contrato agregado correctamente!"});
	});
});

app.get("/mantenedor/paises",function(req,res){
	reportModel.getPaises(function(errorPais,dataPaises){
		res.status(200).json(dataPaises);
	})
});

app.post("/mantenedor/desactivarPais",function(req,res){
	var update_pais = "UPDATE hermes.paises SET estado=0 WHERE id_pais="+req.body.id_pais;
	console.log(update_pais);
	reportModel.executeQuery(update_pais,function(err_up,user){
		if(err_up)
			res.status(200).json({save:false, msje:"ERROR1"});
		else{
			res.status(200).json({save:true, msje:"Pais desactivado!"});
		}
	});
});

app.get("/mantenedor/getCambiosHorarios",function(req,res){
	var filtro = " WHERE operador='"+req.query.user+"' ";
	reportModel.getCambiosHorariosEjecutivo(filtro,function(err,dataCambios){
		res.status(200).json(dataCambios);
	});
});

app.get("/mantenedor/estadoCivil",function(req,res){
	var filtro = '';
	reportModel.getListaEstadoCivil(filtro, function(err, data){
		res.status(200).json(data);
	});
});

app.get("/mantenedor/nivelEstudios",function(req,res){
	var filtro = '';
	reportModel.getListaNivelEducacional(filtro, function(err, data){
		res.status(200).json(data);
	});
});

app.get("/mantenedor/tipoComputador",function(req,res){
	var filtro = '';
	reportModel.getListaTipoComputador(filtro, function(err, data){
		res.status(200).json(data);
	});
});

app.get("/mantenedor/tipoConexion",function(req,res){
	var filtro = '';
	reportModel.getListaTipoConexion(filtro, function(err, data){
		res.status(200).json(data);
	});
});

app.post("/mantenedor/comunas",function(req,res){
	var filtro = 'WHERE pai_id_pais='+req.body.id_pais;
	reportModel.getListaComunas(filtro, function(err, data){
		res.status(200).json(data);
	});
});

app.post('/mantenedor/listaHijosEjecutivo', function(req,res){
	var filtro = "WHERE user_id="+req.body.user_id+" AND ushi_estado=1";
	reportModel.getListaHijosEjecutivo(filtro, function(err, data){
		res.status(200).json(data);
	});
});

app.post('/mantenedor/guardarConfiguracion', function(req, res){
	console.log(req.body);
	var query = '';
	query +="INSERT INTO hermes.configuracion_campana (coca_cantidad_postulantes,coca_dias,coca_fecha_inicio,coca_estado) VALUES\
		("+req.body.coca_cantidad_postulantes+","+req.body.coca_dias+",'"+req.body.coca_fecha_inicio.split("/").reverse().join("-")+"',"+req.body.coca_estado+")";
	console.log(query);
	reportModel.executeQuery(query,function(err,data){
		if(err)
			res.status(200).json({save:false});
		else
			res.status(200).json({save:true});
	});
});

app.get('/mantenedor/listaConfiguracion', function(req, res){
	var filtro = '';
	reportModel.getListaConfiguracionCampanas(filtro, function(err, data){
		res.status(200).json(data);
	});
});

app.post('/mantenedor/desactivarConfiguracion', function(req, res){
	var query = '';
	query += "UPDATE hermes.configuracion_campana SET coca_estado=0\
		WHERE coca_id_configuracion_campana="+req.body.coca_id_configuracion_campana;
	
	reportModel.executeQuery(query,function(err,data){
		if(err)
			res.status(200).json({save:false});
		else
			res.status(200).json({save:true});
	});
});
}
