var reportModel = require('../model/user');
var reportVibox = require('../model/vibox');
var controlCalidad = require('../model/control_calidad');
var reportWebCalling = require('../model/web_calling');
var helpersPostulacion = require('../helpers/helpersPostulaciones');
var formidable  = require('formidable');
var path = require('path');
var fs = require('fs'), json;
var moment = require('moment');
var async = require('async');
var _ = require('lodash');
var helpersDomo = require('../helpers/helpersDomo');
var XLSX = require('xlsx');

module.exports = function(app){

	app.get("/postulacion/listarGrupos", function(req, res){
		var filtro = "WHERE gr_eliminar=0";
		reportModel.getListaGrupos(filtro, function(err, data){
			res.status(200).json(data);
		});
	});

	app.post('/postulacion/guardarGrupo', function(req, res){
		console.log(req.body);
		var query = "";
		if(req.body.modo=='agregar'){
			query += "INSERT INTO hermes.grupo(gr_fecha_inicio,gr_estado,user_id,gr_fecha_actualizacion,id_pais) VALUES\
			(now(),"+req.body.gr_estado+","+req.cookies.user_id+",now(),"+req.body.id_pais+");";
		}else{
			query += "UPDATE hermes.grupo SET\
			gr_estado="+req.body.gr_estado+", gr_fecha_inicio='"+req.body.gr_fecha_inicio.split("/").reverse().join("-")+"',\
			user_id="+req.cookies.user_id+", gr_fecha_actualizacion=now()";
			if(typeof(req.body.gr_fecha_fin) != "undefined" && req.body.gr_fecha_fin!='' && req.body.gr_fecha_fin!=null)
				query += ", gr_fecha_fin='"+req.body.gr_fecha_fin.split("/").reverse().join("-")+"'";
			query += " WHERE gr_id_grupo="+req.body.gr_id_grupo+";";
		}
		console.log(query);
		reportModel.executeQuery(query, function(err, data){
			if(!err)
				res.status(200).json({save:true});
			else
				res.status(200).json({save:false});
		});
	});

	app.post('/postulacion/eliminarGrupo', function(req, res){
		console.log(req.body);
		var query = "UPDATE hermes.grupo SET gr_eliminar=1, user_id="+req.cookies.user_id+", gr_fecha_actualizacion=now()\
		WHERE gr_id_grupo="+req.body.gr_id_grupo+";";
		console.log(query);
		reportModel.executeQuery(query, function(err, data){
			if(!err)
				res.status(200).json({save:true});
			else
				res.status(200).json({save:false});
		});
	});

	app.post('/postulacion/estadoGrupo', function(req, res){
		console.log(req.body);
		var estado = (!req.body.gr_estado)?0:1;
		var query = "UPDATE hermes.grupo SET gr_estado="+estado+", user_id="+req.cookies.user_id+", gr_fecha_actualizacion=now()\
		WHERE gr_id_grupo="+req.body.gr_id_grupo+";";
		console.log(query);
		reportModel.executeQuery(query, function(err, data){
			if(!err)
				res.status(200).json({save:true});
			else
				res.status(200).json({save:false});
		});
	});

	app.post('/postulacion/listaPostulantesGrupos', function(req, res){
		var filtro = "WHERE gr.gr_id_grupo="+req.body.gr_id_grupo+" AND grpo_estado=1";
		reportModel.getListaPostulantesGrupos(filtro, function(err, data){
			var formatPostulantes = helpersPostulacion.formatPostulantes(data);
			res.status(200).json(formatPostulantes);
		});
	});

	app.post('/postulacion/listaPostulantesSinGrupo', function(req, res){
		console.log(req.body);
		var filtro = "";
		reportModel.getListaEfectivosReclutamiento(filtro, function(err, efectivos){
			var ids_ani = helpersPostulacion.implodeIdAni(efectivos);
			var filtro_v = "WHERE id_ani in ("+ids_ani+")";
			reportVibox.getListaDatosPorIdAni(filtro_v, function(errv, post){
				var listaPostulantes = helpersPostulacion.implodePostulantes(post);
				var filtro_p = "WHERE pos_rut in ("+listaPostulantes+") AND pai_id_pais="+req.body.id_pais+" HAVING grpo.pos_id_postulante is null";
				reportModel.getListaPostulantesSinGrupo(filtro_p, function(errp, postulantes){
					res.status(200).json(postulantes);
				});
			});
		});
	});

	app.post('/postulacion/guardarPostulantesGrupo', function(req, res){
		console.log(req.body);
		var formatInsertPostulantes = helpersPostulacion.formatInsertPostulantes(req.body.grupo.gr_id_grupo,req.body.postulantes,req.cookies.user_id);
		var desactivar = "UPDATE hermes.grupo_postulante SET grpo_estado=0 WHERE gr_id_grupo="+req.body.grupo.gr_id_grupo+";";
		var query_log = "INSERT INTO hermes.log_postulante(user_id, lop_update, lop_query) VALUES ("+req.cookies.user_id+",now(),'"+desactivar.replace(/[^a-zA-Z 0-9.]+/g,' ')+" "+formatInsertPostulantes.replace(/[^a-zA-Z 0-9.]+/g,' ')+"')";
		console.log(query_log);
		reportModel.executeQuery(query_log,function(errl, log){
			if(!errl){
				console.log(desactivar);
				reportModel.executeQuery(desactivar,function(errd, datad){
					if(errd)
						res.status(200).json({save:false});
					else{
						if(formatInsertPostulantes!=''){
							console.log(formatInsertPostulantes);
							reportModel.executeQuery(formatInsertPostulantes,function(erri, datai){
								if(!erri)
									res.status(200).json({save:true});
								else
									res.status(200).json({save:false});
							});
						}else
						res.status(200).json({save:true});
					}
				});
			}else
				res.status(200).json({save:false});
		});
	});

	app.get('/postulacion/listaTipoEstandar', function(req, res){
		var filtro ='';
		reportModel.getListaTipoEstandar(filtro, function(err,data){
			res.status(200).json(data);
		});
	});

	app.get('/postulacion/listaTipoEvaluacion', function(req, res){
		var filtro ='WHERE tiev_estado=1';
		reportModel.getListaTipoEvaluacion(filtro, function(err,data){
			res.status(200).json(data);
		});
	});

	app.get('/postulacion/listaEstandar', function(req, res){
		var filtro ='WHERE es_eliminar=0';
		reportModel.getListaEstandar(filtro, function(err,data){
			res.status(200).json(data);
		});
	});

	app.post('/postulacion/guardarEstandar', function(req, res){
		var flag = true;
		var query='';
		if(req.body.ties_id_tipo_estandar==3)
			req.body.es_valor_estandar='Sí';
		if(req.body.ties_id_tipo_estandar==4)
			req.body.es_valor_estandar=5;
		if(req.body.ties_id_tipo_estandar==5)
			req.body.es_valor_estandar='No aplica';
		if(req.body.modo!='editar'){
			query += "INSERT INTO hermes.estandar(tiev_id_tipo_evaluacion,ties_id_tipo_estandar,es_valor_estandar,et_id_etapa,es_fecha_inicio,user_id,es_fecha_actualizacion,es_estado)\
			VALUES("+req.body.tiev_id_tipo_evaluacion+","+req.body.ties_id_tipo_estandar+",'"+req.body.es_valor_estandar+"',"+req.body.et_id_etapa+",now(),"+req.cookies.user_id+",now(),"+req.body.es_estado+");";
		}else{
			query += "UPDATE hermes.estandar SET ties_id_tipo_estandar="+req.body.ties_id_tipo_estandar+", tiev_id_tipo_evaluacion="+req.body.tiev_id_tipo_evaluacion+",\
			es_valor_estandar='"+req.body.es_valor_estandar+"', es_fecha_inicio='"+req.body.es_fecha_inicio.split("/").reverse().join("-")+"',\
			user_id="+req.cookies.user_id+",es_fecha_actualizacion=now(),es_estado="+req.body.es_estado+",et_id_etapa="+req.body.et_id_etapa;
			if(typeof(req.body.es_fecha_fin) != "undefined" && req.body.es_fecha_fin!='' && req.body.es_fecha_fin!=null){
				if(moment(req.body.es_fecha_inicio, "DD/MM/YYYY").toDate()>moment(req.body.es_fecha_fin, "DD/MM/YYYY").toDate())
					flag = false;
				query += ",es_fecha_fin='"+req.body.es_fecha_fin.split("/").reverse().join("-")+"'";
			}
			query += " WHERE es_id_estandar="+req.body.es_id_estandar;
		}
		if(flag){
			console.log(query);
			reportModel.executeQuery(query,function(err, data){
				if(!err)
					res.status(200).json({save:true});
				else
					res.status(200).json({save:false, msje:"<b>Error</b>: Intente nuevamente."});
			});	
		}else{
			res.status(200).json({save:false, msje:"Fecha de inicio debe ser menor a fecha de fin"});
		}
	});

	app.post('/postulacion/eliminarEstandar', function(req, res){
		var query='';
		query += "UPDATE hermes.estandar SET es_eliminar=1 WHERE es_id_estandar="+req.body.es_id_estandar;
		console.log(query);
		reportModel.executeQuery(query,function(err, data){
			if(!err)
				res.status(200).json({save:true});
			else
				res.status(200).json({save:false});
		});
	});

	app.get('/postulacion/listaTipoEjecutiva', function(req, res){
		var filtro = 'WHERE tiej_estado=1';
		reportModel.getListaTipoEjecutiva(filtro, function(err, data){
			res.status(200).json(data);
		});
	});

	app.post('/postulacion/guardarTipo', function(req, res){
		var query='';
		if(req.body.modo!='editar'){
			query += "INSERT INTO hermes.tipo_ejecutiva(tiej_nombre,tiej_descripcion,tiej_antiguedad_valor, user_id, tiej_fecha_actualizacion) VALUES\
			('"+req.body.tiej_nombre+"', '"+req.body.tiej_descripcion+"', "+req.body.tiej_antiguedad_valor+","+req.cookies.user_id+",now())";
		}else{
			query += "UPDATE hermes.tipo_ejecutiva SET tiej_nombre='"+req.body.tiej_nombre+"', tiej_descripcion='"+req.body.tiej_descripcion+"',\
			tiej_antiguedad_valor="+req.body.tiej_antiguedad_valor+", user_id="+req.cookies.user_id+", tiej_fecha_actualizacion=now() WHERE tiej_id_tipo_ejecutiva="+req.body.tiej_id_tipo_ejecutiva;
		}
		console.log(query);
		reportModel.executeQuery(query,function(err, data){
			if(!err)
				res.status(200).json({save:true});
			else
				res.status(200).json({save:false});
		});
	});

	app.post('/postulacion/eliminarTipo', function(req, res){
		var query='';
		query += "UPDATE hermes.tipo_ejecutiva SET tiej_estado=0,user_id="+req.cookies.user_id+",tiej_fecha_actualizacion=now() WHERE tiej_id_tipo_ejecutiva="+req.body.tiej_id_tipo_ejecutiva;
		console.log(query);
		reportModel.executeQuery(query,function(err, data){
			if(!err)
				res.status(200).json({save:true});
			else
				res.status(200).json({save:false});
		});
	});

	app.get("/postulacion/listarGruposActivos", function(req, res){
		var filtro = "WHERE gr_eliminar=0 AND gr_estado=1";
		reportModel.getListaGrupos(filtro, function(err, data){
			res.status(200).json(data);
		});
	});

	app.post('/postulacion/listarCapacitaciones', function(req, res){
		console.log(req.body);
		var filtro = "WHERE ca_estado=1";
		if(typeof(req.body.date_begin) != 'undefined' && req.body.date_begin !=null && req.body.date_begin != ''
		&& typeof(req.body.date_end) != 'undefined' && req.body.date_end !=null && req.body.date_end != ''){
			filtro += " AND ca_fecha_inicio BETWEEN '"+req.body.date_begin.split("/").reverse().join("-")+"' AND '"+req.body.date_end.split("/").reverse().join("-")+"'\
			AND gr_id_grupo in ("+_.join(req.body.grupos,',')+")";
		}
		reportModel.getListaCapacitaciones(filtro, function(err, data){
			res.status(200).json(data);
		});
	});

	app.post("/postulacion/listarGrupos", function(req,res){
		var filtro_sa = "HAVING cap.ca_id_capacitacion is null";
		var arrGrupos = {};
		reportModel.getListaGruposCapacitacion(filtro_sa, function(errsa, sin_asignar){
			if(req.body.modo == 'agregar'){
				arrGrupos.sin_asignar = sin_asignar;
				arrGrupos.asignado = [];
				res.status(200).json(arrGrupos);
			}else{
				var filtro_as = "HAVING cap.ca_id_capacitacion="+req.body.ca_id_capacitacion;
				reportModel.getListaGruposCapacitacion(filtro_as, function(errsa, asignado){
					arrGrupos.sin_asignar = sin_asignar;
					arrGrupos.asignado = asignado;
					res.status(200).json(arrGrupos);
				});
			}
		});
	});

	app.post("/postulacion/guardarCapacitacion", function(req, res){
		console.log(req.body);
		var query = '';
		var id = null;
		if(req.body.modo == "agregar"){
			query += "INSERT INTO hermes.capacitacion(ca_descripcion,ca_fecha_inicio,ca_fecha_fin,user_id,ca_fecha_actualizacion) VALUES\
			('"+req.body.ca_descripcion+"','"+req.body.ca_fecha_inicio.split("/").reverse().join("-")+"','"+req.body.ca_fecha_fin.split("/").reverse().join("-")+"',"+req.cookies.user_id+", now())";
		}else{
			query += "UPDATE hermes.capacitacion SET ca_descripcion='"+req.body.ca_descripcion+"', ca_fecha_inicio='"+req.body.ca_fecha_inicio.split("/").reverse().join("-")+"',\
			ca_fecha_fin='"+req.body.ca_fecha_fin.split("/").reverse().join("-")+"',user_id="+req.cookies.user_id+", ca_fecha_actualizacion=now() WHERE ca_id_capacitacion="+req.body.ca_id_capacitacion;
			var id = req.body.ca_id_capacitacion;
		}
		console.log(query);
		reportModel.executeQuery(query, function(err, dataQuery){
			if(!err){
				if(id==null) id = dataQuery.insertId;
				var update = "UPDATE hermes.capacitacion_grupo SET cagr_estado=0, user_id="+req.cookies.user_id+", cagr_fecha_actualizacion=now() WHERE ca_id_capacitacion="+id;
				console.log(update);
				reportModel.executeQuery(update, function(erru, dataupdate){
					if(erru)
						res.status(200).json({save:false});
					else{
						var insert_grupos = helpersPostulacion.formatInsertGrupoCapacitacion(id, req.body.grupo, req.cookies.user_id);
						console.log(insert_grupos);
						if(insert_grupos!=''){
							reportModel.executeQuery(insert_grupos, function(erri, datainsert_grupos){
								if(!erri)
									res.status(200).json({save:true});
								else res.status(200).json({save:false});
							});
						}
						else res.status(200).json({save:true});
					}
				});
			}else res.status(200).json({save:false});
		});

	});

	app.post("/postulacion/detalleCapacitacion", function(req,res){
		console.log(req.body);
		var filtro_grupos = "WHERE cagr_estado=1 HAVING cap.ca_id_capacitacion="+req.body.ca_id_capacitacion;
		reportModel.getListaGruposCapacitacion(filtro_grupos, function(errsa, arrGrupos){
			var implodeGrupos = helpersPostulacion.implodeGrupos(arrGrupos);
			var filtroPostulantes = "WHERE gr.gr_id_grupo in ("+implodeGrupos+") AND grpo_estado=1";
			reportModel.getListaPostulantesGrupos(filtroPostulantes, function(errpo, arrPostulantes){
				var arrPostulantes = helpersPostulacion.formatPostulantes(arrPostulantes);
				var filtro ='';
				reportModel.getListaEtapaTipoEvaluacion(filtro, function(errte,arrTipoEvaluacion){
					var filtro_evaluaciones = "WHERE cagr.ca_id_capacitacion="+req.body.ca_id_capacitacion;
					reportModel.getEvaluacionesCapacitacion(filtro_evaluaciones, function(errCa, arrEvaluaciones){
						reportModel.getListaEvaluacionesCapacitacionGrupo(filtro_evaluaciones, function(errev,arrDetalleEvaluaciones){
							var filtro = "WHERE et_estado=1";
							reportModel.getListaEtapa(filtro, function(err, arrEtapas){
								var arrFinal = helpersPostulacion.formatoDetalleEvaluaciones(arrGrupos,arrPostulantes,arrTipoEvaluacion,arrEtapas,arrEvaluaciones,arrDetalleEvaluaciones);
								res.status(200).json(arrFinal);
							});
						});
					});
				});
			});
		});
	});

	app.get('/postulacion/listaEtapa', function(req, res){
		var filtro = "WHERE et_estado=1";
		reportModel.getListaEtapa(filtro, function(err, data){
			res.status(200).json(data);
		});
	});

	app.get('/postulacion/listaPaises', function(req, res){
		reportModel.getPaises(function(err, data){
			res.status(200).json(data);
		});
	});

	app.post("/postulacion/buscarEstandar", function(req,res){
		console.log(req.body);
		var filtro ="WHERE es_eliminar=0 AND es_estado=1 AND et.et_id_etapa="+req.body.et_id_etapa+" AND tiev.tiev_id_tipo_evaluacion="+req.body.tiev_id_tipo_evaluacion+" AND ties.ties_id_tipo_estandar="+req.body.ties_id_tipo_estandar+" AND NOW()>es_fecha_inicio";
		reportModel.getListaEstandar(filtro, function(err,data){
			var lista = helpersPostulacion.buscarEstandarActivo(data);
			if(data.length>0 && lista.flag){
				console.log(data);
				var filtro_ev="WHERE es_id_estandar="+lista.estandar.es_id_estandar+" AND gr_id_grupo="+req.body.grupo.gr_id_grupo;
				reportModel.getListaEvaluaciones(filtro_ev, function(erre, evl){
					if(evl.length>0)
						res.status(200).json({status:false,data:"Ya existen evaluaciones con esa combinación"});
					else 
						res.status(200).json({status:true,data:lista.estandar});
				});
			}else{
				res.status(200).json({status:false,data:"No existen estándar de evaluaciones con esa combinación"});
			}
		});
	});

	app.post("/postulacion/guardarEvaluacionGrupal", function(req,res){
		console.log(req.body);
		var insert = "INSERT INTO hermes.evaluacion (es_id_estandar,gr_id_grupo,ev_fecha_creacion,user_id) VALUES\
		("+req.body.estandar.es_id_estandar+", "+req.body.grupo.gr_id_grupo+", now(), "+req.cookies.user_id+");";
		console.log(insert);
		reportModel.executeQuery(insert, function(err, ev){
			if(!err){
				var insertDetalle = helpersPostulacion.formatoInsertDetalle(ev.insertId,req.body.resultados);
				console.log(insertDetalle);
				if(insertDetalle!=''){
					reportModel.executeQuery(insertDetalle, function(erri, ev){
						if(!erri)res.status(200).json({save:true});
						else res.status(200).json({save:false});
					});								
				}else res.status(200).json({save:false});
			}else res.status(200).json({save:false});
		});
	});

	app.post("/postulacion/obtenerCumplimiento", function(req,res){
		console.log(req.body);
		var estandar = helpersPostulacion.obtenerCumplimiento(req.body);
		res.status(200).json(estandar);
	});

	app.post("/postulacion/detallePostulante", function(req,res){
		console.log(req.body);
		var filtro_evaluaciones = "WHERE tiev.tiev_id_tipo_evaluacion="+req.body.info.tiev_id_tipo_evaluacion+" AND et.et_id_etapa="+req.body.info.et_id_etapa+"\
		AND pos_id_postulante="+req.body.postulante.pos_id_postulante;
		reportModel.getListaEvaluacionesCapacitacionPostulante(filtro_evaluaciones, function(errev,arrDetalleEvaluaciones){
			var detalle = helpersPostulacion.formatoPostulanteDetalle(arrDetalleEvaluaciones);
			res.status(200).json(detalle);
		});
	});

	app.post("/postulacion/estadoCapacitacion", function(req, res){
		console.log(req.body);
		var query = '';
		var id = null;
		query += "UPDATE hermes.capacitacion SET ca_estado=0,user_id="+req.cookies.user_id+", ca_fecha_actualizacion=now() WHERE ca_id_capacitacion="+req.body.ca_id_capacitacion;
		console.log(query);
		reportModel.executeQuery(query, function(err, dataQuery){
			if(!err){
				res.status(200).json({save:true});
			}else res.status(200).json({save:false});
		});

	});

	app.get("/postulacion/listaColumnasPostulaciones", function(req, res){
		console.log(req.body);
		var filtro = 'WHERE ccp_estado=1';
		reportModel.getListaColumnasPostulaciones(filtro, function(err, data){
			res.status(200).json(data);
		});

	});

	app.post("/postulacion/leerCabeceras", function(req, res){
		var form = new formidable.IncomingForm();
		form.parse(req, function (err, fields, files) {
			var file = files.file;
			var workbook = XLSX.readFile(file.path);
			var sheet_name_list = workbook.SheetNames;
			sheet_name_list.forEach(function(y) {
				var worksheet = workbook.Sheets[y];
				var headers = {};
				var data = [];
				var cabeceras = [];
				for(z in worksheet) {
					if(z[0] === '!') continue;
					var col = z.substring(0,1);
					var row = parseInt(z.substring(1));
					var value = worksheet[z].v;

					if(row == 1) {
						cabeceras.push({nombre:value});
						headers[col] = value;
						continue;
					}

					if(!data[row]) data[row]={};
					data[row][headers[col]] = value;
				}
				data.shift();
				data.shift();
				console.log(cabeceras);
				var fin = {};
				fin.lista = cabeceras;
				fin.listaFinal = [];
				res.status(200).json({cabeceras:fin,data:data});
			});

		});
	});

	app.post("/postulacion/cargarDatos", function(req, res){
		//console.log(req.body.ordenCarga); 
		var flag = true;
		var columnas = helpersPostulacion.formatoInsertPostulaciones(req.body);
		console.log(columnas);
		var datos = req.body.datos;
		var i=0;
		reportWebCalling.listaEstadoCivil(function(err,estados){
			reportWebCalling.listaNivelEducacional(function(err,niveles){
				reportWebCalling.listaSituacionEstudios(function(err,situacion){
					reportWebCalling.listaComunas(function(err,comunas){
						async.whilst(function(){
							return i < datos.length;
						},function(next){
							var row = datos[i];
							console.log(row);
							var rut = (typeof(columnas['DNI – RUT'])!='undefined' && columnas['DNI – RUT'].columna!='') ? row[columnas['DNI – RUT'].columna] : '';
							var nombre = (typeof(columnas['Nombre'])!='undefined' && columnas['Nombre'].columna!='') ? row[columnas['Nombre'].columna] : '';
							var apellido = (typeof(columnas['Apellidos'])!='undefined' && columnas['Apellidos'].columna!='') ? row[columnas['Apellidos'].columna] : '';
							var insert_postulante = "INSERT INTO web_calling.postulante (pos_rut, pos_nombre, pos_apellido, pos_ingreso) VALUES\
							('"+rut+"', '"+nombre+"', '"+apellido+"', now())";
							reportWebCalling.executeQuery(insert_postulante, function(errip, postulante){
								if(!errip){
									var id_postulante = postulante.insertId;
									var insert_postulacion="INSERT INTO web_calling.postulacion(pos_id_postulante,pos_id_fecha_postulacion) VALUES("+id_postulante+",now());";
									reportWebCalling.executeQuery(insert_postulacion, function(erripos, postulancion){
										if(!erripos){
											var fecha_nacimiento = (typeof(columnas['Fecha de Nacimiento'])!='undefined' && columnas['Fecha de Nacimiento'].columna!='') ? row[columnas['Fecha de Nacimiento'].columna].split("-").reverse().join("-") : '';
											var telefono = (typeof(columnas['Teléfono'])!='undefined' && columnas['Teléfono'].columna!='') ? row[columnas['Teléfono'].columna] : '';
											var direccion = (typeof(columnas['Dirección'])!='undefined' && columnas['Dirección'].columna!='') ? row[columnas['Dirección'].columna] : '';
											var comuna = (typeof(columnas['Comuna'])!='undefined' && columnas['Comuna'].columna!='') ? row[columnas['Comuna'].columna] : '';
											var id_comuna = helpersPostulacion.buscarComuna(comuna, comunas);
											var estado_civil = (typeof(columnas['Estado civil'])!='undefined' && columnas['Estado civil'].columna!='') ? row[columnas['Estado civil'].columna] : '';
											var id_estado_civil = helpersPostulacion.buscarEstadoCivil(estado_civil,estados);
											var correo = (typeof(columnas['Correo'])!='undefined' && columnas['Correo'].columna!='') ? row[columnas['Correo'].columna] : '';
											var insert_antecedentes = "INSERT INTO web_calling.postulante_antecedentes (pos_id_postulante,poa_fecha_nacimiento,\
											poa_telefono,poa_direccion,com_id_comuna,est_id_estado_civil,poa_correo) VALUES ("+id_postulante+",'"+fecha_nacimiento+"',\
											'"+direccion+"',"+id_comuna+","+id_estado_civil+",'"+correo+"')";

											reportWebCalling.executeQuery(insert_antecedentes, function(erria, antecedentes){
												if(!erria){
													var nivel_estudios = (typeof(columnas['Nivel educacional'])!='undefined' && columnas['Nivel educacional'].columna!='') ? row[columnas['Nivel educacional'].columna] : '';
													var id_nivel_estudios = helpersPostulacion.buscarNivelEstudios(nivel_estudios,niveles);
													var situacion_estudios = (typeof(columnas['Situación de estudios'])!='undefined' && columnas['Situación de estudios'].columna) ? row[columnas['Situación de estudios'].columna] : '';
													var id_situacion_estudios = helpersPostulacion.buscarSituacionEstudios(situacion_estudios,situacion);
													var titulo = (typeof(columnas['Titulo'])!='undefined' && columnas['Titulo'].columna!='') ? row[columnas['Titulo'].columna] : '';
													var insert_educacion = "INSERT INTO web_calling.postulante_educacion(pos_id_postulante,niv_id_niv_eduacional\
													sit_id_situacion_estudio,poe_titulo) VALUES ("+id_postulante+","+id_nivel_estudios+", "+id_situacion_estudios+", '"+titulo+"')";
													reportWebCalling.executeQuery(insert_educacion, function(errie, educacion){
														if(!errie){
															var insert_experiencia = helpersPostulacion.formatoInsertExperiencia(id_postulante,row,columnas);
															if(insert_experiencia!=''){
																reportWebCalling.executeQuery(insert_experiencia, function(errix, experiencia){
																	if (!errix) {
																		i++;
																		next();
																	}else{
																		flag='false-exp';
																		i++;
																		next();
																	}
																});
															}else{
																i++;
																next();
															}
														}else{
															flag='false-ed';
															i++;
															next();
														}
													});
												}else{
													flag='false-ant';
													i++;
													next();
												}
											});
										}else{
											flag='false-post';
											i++;
											next();
										}										
									});
								}else{
									flag='false-postulante';
									i++;
									next();
								}
							});

						},function(error_each){
							console.log('fin');
							if(flag)
								res.status(200).json({save:true});
							else res.status(200).json({save:flag});
						});
					});
				});
			});
		});

	});

	app.post("/postulacion/generarNotasDeCalidad", function(req,res){
		console.log(req.body.grupo.postulantes);
		var filtro ="WHERE es_eliminar=0 AND es_estado=1 AND et.et_id_etapa="+req.body.info.et_id_etapa+" AND tiev.tiev_id_tipo_evaluacion="+req.body.info.tiev_id_tipo_evaluacion+" AND ties.ties_id_tipo_estandar="+req.body.info.ties_id_tipo_estandar+" AND NOW()>es_fecha_inicio ORDER BY es_fecha_inicio ASC";
		reportModel.getListaEstandar(filtro, function(err,data){
			var lista = helpersPostulacion.buscarEstandarActivo(data);
			if(data.length>0 && lista.flag){
				var filtro_ev="WHERE es_id_estandar="+lista.estandar.es_id_estandar+" AND gr_id_grupo="+req.body.grupo.gr_id_grupo;
				reportModel.getListaEvaluaciones(filtro_ev, function(erre, evl){
					if(evl.length>0)
						res.status(200).json({status:false,data:"Ya existen evaluaciones con esa combinación"});
					else {
						if(req.body.info.et_id_etapa==0){
							var rut_postulantes = helpersPostulacion.formatoImplodeRut(req.body.grupo.postulantes);
							var filtroani = "WHERE id_cliente in ("+rut_postulantes+")";
							reportVibox.getListaDatosPorIdAni(filtroani, function(errani, listaani){
								if(listaani.length>0){
									var ani_postulante = helpersPostulacion.formatoImplodeAni(listaani);
									var filtro_calidad = "WHERE cli_id_cliente=25 AND ser_id_servicio=22 AND cam_id_campo=3 AND otcam_valor in ("+ani_postulante+")";
									controlCalidad.getNotaSeleccionReclutamiento(filtro_calidad, function(errcalidad, calidad){
										console.log("CALIDAD", calidad);
										if(calidad.length>0 && calidad[0].otcam_valor!=null && typeof(calidad[0].otcam_valor)!='undefined'){
											var insert = "INSERT INTO hermes.evaluacion (es_id_estandar,gr_id_grupo,ev_fecha_creacion,user_id) VALUES\
											("+lista.estandar.es_id_estandar+", "+req.body.grupo.gr_id_grupo+", now(), "+req.cookies.user_id+");";
											console.log(insert);
											reportModel.executeQuery(insert, function(errev, ev){
												if(!errev){
													var insert_nota_calidad = helpersPostulacion.formatInsertNotaCalidad(req.body.grupo.postulantes,listaani,calidad,ev.insertId);
													console.log(insert_nota_calidad);
													reportModel.executeQuery(insert_nota_calidad, function(errevd, evd){
														if(!errevd){
															res.status(200).json({status:true,data:"Evaluaciones de calidad guardadas correctamente"});
														}else res.status(200).json({status:false,data:"No se ha podido guardar el detalle de las evaluaciones correctamente"});
													});
												}else res.status(200).json({status:false,data:"No se ha podido guardar la evaluacion correctamente"});
											});
										}else res.status(200).json({status:false,data:"No existen resultados de calidad para el grupo seleccionado"});
									});
								}else res.status(200).json({status:false,data:"No existen resultados de calidad para el grupo seleccionado"});
							});
						}else{
							var rut_postulantes = helpersPostulacion.formatoImplodeRut(req.body.grupo.postulantes);
							var filtro = "WHERE gr_id_grupo="+req.body.grupo.gr_id_grupo+" AND pos_rut in ("+rut_postulantes+")";
							reportModel.getListaUsuariosPostulantes(filtro, function(errus, usuarios){
							var implodeUsuarios = helpersPostulacion.formatUsuariosPostulantes(usuarios);
								if(implodeUsuarios!=''){
									var filtro_calidad = "WHERE res_fecha = DATE(DATE_ADD(NOW(), INTERVAL -1 DAY)) AND res_operador in ("+implodeUsuarios+")";
									controlCalidad.getPromedioEjecutiva(filtro_calidad, function(err, calidad){
										if(calidad.length>0 && calidad[0].res_operador!=null && typeof(calidad[0].res_operador)!='undefined'){
											var insert = "INSERT INTO hermes.evaluacion (es_id_estandar,gr_id_grupo,ev_fecha_creacion,user_id) VALUES\
											("+lista.estandar.es_id_estandar+", "+req.body.grupo.gr_id_grupo+", now(), "+req.cookies.user_id+");";
											console.log(insert);
											reportModel.executeQuery(insert, function(errev, ev){
												if(!errev){
													var insert_nota_calidad = helpersPostulacion.formatInsertNotaCalidadEjecutivas(usuarios, calidad, ev.insertId);
													console.log(insert_nota_calidad);
													reportModel.executeQuery(insert_nota_calidad, function(errevd, evd){
														if(!errevd){
															res.status(200).json({status:true,data:"Evaluaciones de calidad guardadas correctamente"});
														}else res.status(200).json({status:false,data:"No se ha podido guardar el detalle de las evaluaciones correctamente"});
													});
												}else res.status(200).json({status:false,data:"No se ha podido guardar la evaluacion correctamente"});
											});
										}else res.status(200).json({status:false,data:"No existen resultados de calidad para el grupo seleccionado"});
									});
								}
							});

						}
					}
				});
			}else{
				res.status(200).json({status:false,data:"No existen estándar de evaluaciones con esa combinación"});
			}
		});
	});

/*	app.post("/postulacion/generarNotaDirecciones", function(req,res){
		console.log(req.body.grupo.postulantes);
		var filtro ="WHERE es_eliminar=0 AND es_estado=1 AND et.et_id_etapa="+req.body.info.et_id_etapa+" AND tiev.tiev_id_tipo_evaluacion="+req.body.info.tiev_id_tipo_evaluacion+" AND ties.ties_id_tipo_estandar="+req.body.info.ties_id_tipo_estandar+" AND NOW()>es_fecha_inicio ORDER BY es_fecha_inicio ASC";
		reportModel.getListaEstandar(filtro, function(err,data){
			var lista = helpersPostulacion.buscarEstandarActivo(data);
			if(data.length>0 && lista.flag){
				var filtro_ev="WHERE es_id_estandar="+lista.estandar.es_id_estandar+" AND gr_id_grupo="+req.body.grupo.gr_id_grupo;
				reportModel.getListaEvaluaciones(filtro_ev, function(erre, evl){
					if(evl.length>0)
						res.status(200).json({status:false,data:"Ya existen evaluaciones con esa combinación"});
					else {
						var rut_postulantes = helpersPostulacion.formatoImplodeRut(req.body.grupo.postulantes);
						var filtro = "WHERE gr_id_grupo="+req.body.grupo.gr_id_grupo+" AND pos_rut in ("+rut_postulantes+")";
						reportModel.getListaUsuariosPostulantes(filtro, function(errus, usuarios){
						var implodeUsuarios = helpersPostulacion.formatUsuariosPostulantes(usuarios);
						if(implodeUsuarios!=''){
							var filtro_contactados = " WHERE 1=1 AND esc.esc_id != 4 ";
							reportVibox.getEstadosContactados(filtro_contactados,function(error,dataEstadosContactados){
								console.log("AQUI");
								var filtro_vici = "AND mpr_date = curdate() AND mpr_user IN ("+implodeUsuarios+") ";
								reportModel.getMediasDomo(filtro_vici,function(error,data_siodial){
									var filtro_vibox = " WHERE 1=1 AND operador not like 'entrenamiento%' ";
									filtro_vibox += " AND fecha_llamado = now()";
									filtro_vibox += " AND operador IN ("+implodeUsuarios+") ";
									reportVibox.getMediasDomo(filtro_vibox,function(error,data_vibox){
										var filtro_dato_domo = "WHERE 1=1 AND operador not like 'entrenamiento%' ";
										filtro_dato_domo += " AND fecha_llamado BETWEEN curdate() AND 'curdate() 23:59:59' and (operador  <> '' and operador is not null)";
										filtro_dato_domo += " and (cam.observacion is null or cam.observacion <> 'Vicidial')";
										reportVibox.getDatosDomo(filtro_dato_domo,function(error,dato_tabla_domo){
											var arrEstadosContactados = helpersDomo.formatArrEstadosContactados(dataEstadosContactados);
											var arrSiodial = helpersDomo.reFormatMediasDomo(data_siodial,data_vibox,dato_tabla_domo,false,0,arrEstadosContactados);
											console.log("RES",arrSiodial);
											res.status(200).json(arrSiodial);
										//	console.log(arrEstadosContactados);
										});
									});
								});
							});
						}
						});
					}


				});
			}else{
				res.status(200).json({status:false,data:"No existen estándar de evaluaciones con esa combinación"});
			}
		});
	});
*/
	app.get("/postulacion/listaCampanas", function(req,res){
		var filtro = "";
		reportModel.getListaCampanasReclutamiento(filtro, function(err, lista){
			res.status(200).json(lista);
		});
	});

	app.post("/postulacion/listaCampanasDetalle", function(req,res){
		var filtro = "WHERE id_campana="+req.body.id_campana;
		reportModel.getListaDetalleCampanasReclutamiento(filtro, function(err, lista){
			res.status(200).json(lista);
		});
	});

	app.post("/postulacion/guardarEvaluacionUnica", function(req,res){
		console.log(req.body);
		var update = "UPDATE hermes.evaluacion_postulante SET evpo_valor='"+req.body.evpo_valor+"', evpo_valor_estandarizado="+req.body.evpo_valor_estandarizado+"\
		WHERE ev_id_evaluacion="+req.body.ev_id_evaluacion;
		reportModel.executeQuery(update, function(err, dataQuery){
			if(!err){
				res.status(200).json({save:true});
			}else res.status(200).json({save:false});
		});
	});
}