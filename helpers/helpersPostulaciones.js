var _ = require('lodash');
var moment = require('moment');

function formatInsertPostulantes(id_grupo, postulantes, user_id){
	var query = '';
	var c = 1;
	var fecha = moment().format('YYMM');
	var codigo = '';
	_.forEach(postulantes, function(pos, key){
		codigo = (id_grupo<10)?fecha+'0'+id_grupo:fecha+id_grupo;
		codigo += (c<10)?'0'+c:c;
		query += (query=='')?'INSERT INTO hermes.grupo_postulante (gr_id_grupo,pos_id_postulante,grpo_codigo) VALUES ':',';
		query += "("+id_grupo+","+pos.pos_id_postulante+",'"+codigo+"')";	
		c++;
	});
	return query;
}

function formatInsertGrupoCapacitacion(id, grupos, user_id){
	var query = '';
	_.forEach(grupos,function(gru, key){
		query += (query=='')?'INSERT INTO hermes.capacitacion_grupo (ca_id_capacitacion,gr_id_grupo,user_id,cagr_fecha_actualizacion) VALUES ':',';
		query += "("+id+","+gru.gr_id_grupo+","+user_id+",now())";	
	});
	return query;
}

function implodeGrupos(grupos){
	var imp = '';
	_.forEach(grupos, function(gru,key){
		if(imp!='')
			imp += ',';
		imp += gru.gr_id_grupo;
	});
	return imp;
}

function formatoDetalleEvaluaciones(grupos,postulantes,tipos,etapas,evaluaciones,detalle){
	var list = [];
	_.forEach(grupos, function(gru, key){
		var value = {};
		value.gr_id_grupo = gru.gr_id_grupo;
		value.gr_descripcion = gru.gr_descripcion;
		value.evaluaciones = evaluacionesEtapas(etapas,tipos,evaluaciones);
		value.postulantes = listaPostulantes(value.gr_id_grupo,postulantes,value.evaluaciones,detalle,etapas,tipos);
		value.tipos = tipos;
		list.push(value);
	});
	return list;
}

function listaPostulantes(id_grupo, postulantes, evaluaciones,detalle,etapas,tipos){
	var lista = [];
	_.forEach(postulantes, function(pos, keyp){
		if(id_grupo == pos.gr_id_grupo){
			var postulante = {pos_id_postulante:pos.pos_id_postulante, pos_nombre_completo:pos.pos_nombre_completo, grpo_codigo: pos.grpo_codigo, pos_rut:pos.pos_rut};
			postulante.evaluaciones = evaluacionesPostulante(pos.pos_id_postulante,evaluaciones,detalle,etapas,tipos);
			postulante.estado = estadoPostulante(pos.pos_id_postulante,postulante.evaluaciones, evaluaciones.etapasF,tipos);
			lista.push(postulante);
		}
	});
	return lista;
}

function estadoPostulante(id_postulante,evaluaciones,etapas,tipos){
	var lista = {};
	var final = false;
	_.forEach(etapas, function(et, key){
		_.forEach(et.key, function(data,key_et){
			final = revisarEvaluaciones(id_postulante, data, tipos, evaluaciones);
		});
		lista[et.key]=final;
	});
	return lista;
}

function revisarEvaluaciones(id_postulante, id_etapa, tipos, evaluaciones){
	var resultado = 0;
	var cantidad = 0;
	var aprobadas = 0;
	var flag = false;
	_.forEach(tipos, function(tip, key){
		if(id_etapa==tip.et_id_etapa){
			cantidad++;
			var prom = evaluaciones[id_etapa+'-'+tip.tiev_id_tipo_evaluacion];
			if(prom!=null)
				flag=true;
			if(prom>=tip.ettiev_valor)
				aprobadas++;
				
		}
	});
	if(cantidad!=0 && aprobadas!=0)
		resultado = cantidad/aprobadas;
	return (!flag || cantidad==0)?null:(resultado==1)?'PASA':'NO PASA';
}

function evaluacionesPostulante(id_postulante,evaluaciones,detalle,etapas,tipos){
	var list = {};
		var value = [];
	_.forEach(etapas, function(et,k_et){
		_.forEach(tipos, function(tip, key){
			var ettip = et.et_id_etapa+'-'+tip.tiev_id_tipo_evaluacion;
			var nota = promedioPostulanteTipo(ettip, id_postulante, detalle);
			var ettip = ettip;
			list[ettip] = nota;
		});
	});
	return list;
}

function promedioPostulanteTipo(id_ettip,id_postulante, detalle){
	var nota = null;
	var c = 0;
	_.forEach(detalle, function(det, key){
		var ettip = det.et_id_etapa+'-'+det.tiev_id_tipo_evaluacion;
		if(id_ettip==ettip && id_postulante==det.pos_id_postulante){
			nota += det.evpo_valor_estandarizado;
			c++;
		}
	});
	if(c>0)
		nota = nota/c;
	return nota;
}

function evaluacionesEtapas(etapas,tipo,evaluaciones){
	var lista = {};
	_.forEach(etapas, function(et,k_et){
		var flag = buscarEvaluaciones(et.et_id_etapa, evaluaciones);
		if(flag){
			var cant = buscarCantTipos(et.et_id_etapa,tipo);
			if(cant>0)
			lista[et.et_descripcion] = {id:et.et_id_etapa,cant:cant,flag:true};
		}
	});
	var etapasF = etapasFinal(etapas);
	lista['Final'] = {id:99, cant:etapasF.length, flag:false};
	var tipos = buscarTipos(lista,tipo);
	return {etapas:lista, tipos:tipos, etapasF:etapasF};
}

function buscarEvaluaciones(id_etapa, evaluaciones){
	var flag = false;
	_.forEach(evaluaciones, function(ev, key){
		if(id_etapa==ev.et_id_etapa)
			flag=true;
	});
	return flag;
}

function etapasFinal(etapas){
	var cierre = [];
	_.forEach(etapas, function(et, key){
		et.key = [et.et_id_etapa];
		cierre.push(et);
	});
	cierre.push({key:[1,2,3],et_descripcion:"Habilidades"});
	cierre.push({key:[4,5],et_descripcion:"Técnicas"});
	return cierre;
}
function buscarTipos(etapas, tipo){
	var datos = [];
	_.forEach(etapas, function(et, keye){
		_.forEach(tipo, function(tip, key){
			if(et.id==tip.et_id_etapa){
				tip.ettip = et.id+'-'+tip.tiev_id_tipo_evaluacion;
				datos.push(tip);
			}
		});
	})
	return datos;
}

function buscarCantTipos(id_etapa,tipo){
	var datos = [];
	c = 0;
	_.forEach(tipo, function(tip, key){
		if(id_etapa==tip.et_id_etapa){
			tip.et_id_etapa = id_etapa;
			tip.ettip = id_etapa+'-'+tip.tiev_id_tipo_evaluacion;
			datos.push(tip);
			c++;
		}
	});
	return c;
}

function formatoInsertDetalle(ev_id, resultados){
	var insert = '';
	_.forEach(resultados, function(res, id_pos){
		if(typeof(res.evpo_valor)!='undefined' && res.evpo_valor!='' && typeof(res.evpo_valor_estandarizado)!='undefined' && res.evpo_valor_estandarizado!=''){
			insert+=(insert=='')?"INSERT INTO hermes.evaluacion_postulante(ev_id_evaluacion, pos_id_postulante, evpo_valor, evpo_valor_estandarizado) VALUES ":",";
			insert+="("+ev_id+","+id_pos+",'"+res.evpo_valor+"', "+res.evpo_valor_estandarizado+")";
		}
	});
	return insert;
}

function obtenerCumplimiento(datos){
	var res = null;
	if(datos.es_id_estandar==2){
		res = (datos.evpo_valor>=datos.es_valor_estandar)?100:parseFloat(datos.evpo_valor/datos.es_valor_estandar*100).toFixed(2);
	}else if(datos.es_id_estandar==1){
		var tiempo = minutosSegundos(datos.evpo_valor);
		var estandar = minutosSegundos(datos.es_valor_estandar);
		console.log("tiempo",tiempo);
		console.log("estandar",estandar);
		res = (tiempo<=estandar)?100:parseFloat(estandar/tiempo*100).toFixed(2);
	}else if(datos.es_id_estandar==3){
		res = (datos.evpo_valor=='Sí')?100:0;
	}else if(datos.es_id_estandar==4){
		res = (datos.evpo_valor<3.5)?0:parseFloat(datos.evpo_valor/5*100).toFixed(2);
	}if(datos.es_id_estandar==5){
		if(datos.id_tipo_evaluacion==5)
			res = parseFloat((1-(datos.evpo_valor/datos.es_valor_estandar))*100).toFixed(2);
		else
			res = datos.evpo_valor;
	}
	return res;
}

function minutosSegundos(tiempo){
	var t = tiempo.split(':');
	var segundos = parseInt(t[0]*60);
	segundos += parseInt(t[1]);

	return segundos;
}

function formatoPostulantes(postulantes) {
	var lista = [];
	_.forEach(postulantes, function(pos, key){
		console.log(pos);
		var flag = false;
		var value = {};
		value.pos_id_postulante = pos.pos_id_postulante;
		value.pos_nombre_completo = pos.pos_nombre_completo;
		value.edad = calcular_edad(pos.poa_fecha_nacimiento);
		value.genero = (pos.poa_genero=='')?'':(pos.poa_genero=='F')?'Femenino':'Masculino';
		if(value.edad<=59){
			if(pos.poa_genero='F' && value.edad>=26)
				flag=true;
			if(pos.poa_genero='M' && value.edad>=23)
				flag=true;
		}
		if(flag)
			lista.push(value);
		console.log(value);
	});
	return lista;
}

function calcular_edad(fecha){
	var array_fecha = fecha.split("-");
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

function formatoPostulanteDetalle(detalle){
	var lista = [];
	_.forEach(detalle, function(det, key){
		var data = {};
		data = det;
		if(data.ties_id_tipo_estandar == 2 || data.ties_id_tipo_estandar == 4){
			console.log(typeof(det.evpo_valor));
			det.evpo_valor = parseFloat(data.evpo_valor);
			console.log(typeof(det.evpo_valor));

		}
		lista.push(data);
	});
	console.log(lista);
	return lista;
}

function convertToJSON(array) {
  var first = array[0].join()
  var headers = first.split(',');

  var jsonData = [];
  for ( var i = 1, length = array.length; i < length; i++ )
  {

    var myRow = array[i].join();
    var row = myRow.split(',');

    var data = {};
    for ( var x = 0; x < row.length; x++ )
    {
      data[headers[x]] = row[x];
    }
    jsonData.push(data);

  }
  return jsonData;
}

function formatoInsertPostulaciones(datos){
	var lista = {};
	_.forEach(datos.listaColumnas, function(value, key){
		if(typeof(datos.ordenCarga[value.ccp_descripcion][0])!='undefined'){
			value.columna = datos.ordenCarga[value.ccp_descripcion][0].nombre;
			lista[value.ccp_descripcion] = value;
		}
	});
	return lista;
}

function buscarComuna(comuna, comunas){
	var id = null;
	_.forEach(comunas, function(com, key){
		if(com.com_nombre==comuna)
			id = com.com_id_comuna;
	});
	return id;
}

function buscarEstadoCivil(estado, estados){
	var id = null;
	_.forEach(estados, function(est, key){
		if(est.est_nombre=estado)
			id = est.est_id_estado_civil;
	});
	return id;
}

function buscarNivelEstudios(nivel, niveles){
	var id = null;
	_.forEach(niveles, function(niv, key){
		if(niv.niv_nombre==nivel)
			id = niv.niv_id_nivel_educacional;
	});
	return id;
}

function buscarSituacionEstudios(situacion, situaciones){
	var id = null;
	_.forEach(situaciones, function(sit, key){
		if(sit.sit_nombre==situacion)
			id = sit.sit_id_situacion_estudio;
	});
	return id;
}

function formatoInsertExperiencia(row,columnas){
	var insert = '';
	if(typeof(columnas['Exp1 Empresa'])!='undefined' && typeof(columnas['Exp1 Cargo'])!='undefined' &&
	typeof(columnas['Exp1 Funciones'])!='undefined' && typeof(columnas['Exp1 Fecha ingreso'])!='undefined' &&
	typeof(columnas['Exp1 Fecha salida'])!='undefined'){
		insert += "INSERT INTO web_calling.postulante_experiencia(pos_id_postulante,pox_empresa,pox_cargo,pox_fecha_ingreso,\
		pox_fecha_fin,pox_descripcion) VALUES ("+id+",'"+row[columnas['Exp1 Empresa'].columna]+"',\
		'"+row[columnas['Exp1 Cargo'].columna]+"','"+row[columnas['Exp1 Fecha ingreso'].columna]+"','"+row[columnas['Exp1 Fecha salida'].columna]+"',\
		'"+row[columnas['Exp1 Funciones'].columna]+"')";
		if(typeof(columnas['Exp2 Empresa'])!='undefined' && typeof(columnas['Exp2 Cargo'])!='undefined' &&
		typeof(columnas['Exp2 Funciones'])!='undefined' && typeof(columnas['Exp2 Fecha ingreso'])!='undefined' &&
		typeof(columnas['Exp2 Fecha salida'])!='undefined'){
			insert += ",("+id+",'"+row[columnas['Exp2 Empresa'].columna]+"',\
			'"+row[columnas['Exp2 Cargo'].columna]+"','"+row[columnas['Exp2 Fecha ingreso'].columna]+"','"+row[columnas['Exp2 Fecha salida'].columna]+"',\
			'"+row[columnas['Exp2 Funciones'].columna]+"')";
				if(typeof(columnas['Exp3 Empresa'])!='undefined' && typeof(columnas['Exp3 Cargo'])!='undefined' &&
				typeof(columnas['Exp3 Funciones'])!='undefined' && typeof(columnas['Exp3 Fecha ingreso'])!='undefined' &&
				typeof(columnas['Exp3 Fecha salida'])!='undefined'){
					insert += ",("+id+",'"+row[columnas['Exp3 Empresa'].columna]+"',\
					'"+row[columnas['Exp3 Cargo'].columna]+"','"+row[columnas['Exp3 Fecha ingreso'].columna]+"','"+row[columnas['Exp3 Fecha salida'].columna]+"',\
					'"+row[columnas['Exp3 Funciones'].columna]+"')";
					if(typeof(columnas['Exp4 Empresa'])!='undefined' && typeof(columnas['Exp4 Cargo'])!='undefined' &&
					typeof(columnas['Exp4 Funciones'])!='undefined' && typeof(columnas['Exp4 Fecha ingreso'])!='undefined' &&
					typeof(columnas['Exp4 Fecha salida'])!='undefined'){
						insert += ",("+id+",'"+row[columnas['Exp4 Empresa'].columna]+"',\
						'"+row[columnas['Exp4 Cargo'].columna]+"','"+row[columnas['Exp4 Fecha ingreso'].columna]+"','"+row[columnas['Exp4 Fecha salida'].columna]+"',\
						'"+row[columnas['Exp4 Funciones'].columna]+"')";
					}
				}
		}
	}
	return insert;
}

function implodeIdAni(efectivos){
	var imp = '';
	_.forEach(efectivos, function(efec, key){
		if(imp!='') imp+=',';
		imp+=efec.vendor_lead_code;
	});
	return imp;
}

function implodePostulantes(postulantes){
	var imp = '';
	_.forEach(postulantes, function(pos, key){
		if(imp!='') imp+=',';
		imp+="'"+pos.id_cliente+"'";
	});
	return imp;
}

function formatPostulantes(postulantes){
	var lista = [];
	_.forEach(postulantes, function(pos,key){
		var value = pos;
		var apellido = (pos.pos_apellido!=null)?pos.pos_apellido:'';
		var nombre = (pos.pos_nombre!=null)?pos.pos_nombre:'';
		value.pos_nombre_completo = nombre +' '+apellido;
		lista.push(value);
	});
	return lista;
}

function formatoImplodeRut(postulantes){
	var imp = '';
	_.forEach(postulantes, function(pos, key){
		if(imp!='') imp+=',';
		imp +="'"+pos.pos_rut+"'";
	});
	return imp;
}

function formatoImplodeAni(postulantes){
	var imp = '';
	_.forEach(postulantes, function(pos, key){
		if(imp!='') imp+=',';
		imp +=pos.id_ani;
	});
	return imp;
}

function formatInsertNotaCalidad(postulantes,anis,notas,id_evaluacion){
	var listaPostulantes = unificarPostulantes(postulantes,anis);
	var query = '';
	_.forEach(listaPostulantes, function(pos,key){
		var ani_postulante = pos.id_ani;
		_.forEach(notas, function(nota, keyn){
			if(ani_postulante == nota.otcam_valor){
				query += (query!='')?',':'INSERT INTO hermes.evaluacion_postulante(ev_id_evaluacion, pos_id_postulante, evpo_valor, evpo_valor_estandarizado) VALUES ';
				query+="("+id_evaluacion+","+pos.pos_id_postulante+",'"+nota.nota+"', "+nota.nota+")";
			}
		});
	});
	return query;
}

function unificarPostulantes(postulantes, anis){
	var lista = [];
	_.forEach(postulantes, function(pos, key){
		var value = pos;
		_.forEach(anis, function(an, key){
			if(pos.pos_rut==an.id_cliente)
				value.id_ani = an.id_ani;
		});
		lista.push(value);
	});
	return lista;
}

function buscarEstandarActivo(lista){
	var flag = false;
	var estandar = {};
	var fecha = moment().format('DD/MM/YYYY');
	_.forEach(lista, function(list, key){
		if((fecha>=list.es_fecha_inicio && fecha<=list.es_fecha_fin) || (list.es_fecha_fin == null && fecha>=list.es_fecha_inicio)){
			flag = true;
			estandar = list;
		}
	});
	return {flag:flag, estandar:estandar};
}

function formatUsuariosPostulantes(usuarios){
	var imp = '';
	_.forEach(usuarios, function(us, key){
		if(imp!='') imp+=',';
		imp += "'"+us.user+"'";
	});
	return imp;
}

function formatInsertNotaCalidadEjecutivas(usuarios, notas,id_evaluacion){
	var query = '';
	_.forEach(usuarios, function(us,key){
		var user = us.user;
		_.forEach(notas, function(nota, keyn){
			if(user == nota.res_operador){
				query += (query!='')?',':'INSERT INTO hermes.evaluacion_postulante(ev_id_evaluacion, pos_id_postulante, evpo_valor, evpo_valor_estandarizado) VALUES ';
				query+="("+id_evaluacion+","+us.pos_id_postulante+",'"+nota.promedio+"', "+nota.promedio+")";
			}
		});
	});
	return query;
}
exports.formatInsertPostulantes = formatInsertPostulantes;
exports.formatInsertGrupoCapacitacion = formatInsertGrupoCapacitacion;
exports.implodeGrupos = implodeGrupos;
exports.formatoDetalleEvaluaciones = formatoDetalleEvaluaciones;
exports.formatoInsertDetalle = formatoInsertDetalle;
exports.obtenerCumplimiento = obtenerCumplimiento;
exports.formatoPostulantes = formatoPostulantes;
exports.formatoPostulanteDetalle = formatoPostulanteDetalle;
exports.convertToJSON = convertToJSON;
exports.formatoInsertPostulaciones = formatoInsertPostulaciones;
exports.buscarComuna = buscarComuna;
exports.buscarEstadoCivil = buscarEstadoCivil;
exports.buscarNivelEstudios = buscarNivelEstudios;
exports.buscarSituacionEstudios = buscarSituacionEstudios;
exports.formatoInsertExperiencia = formatoInsertExperiencia;
exports.implodeIdAni = implodeIdAni;
exports.implodePostulantes = implodePostulantes;
exports.formatPostulantes = formatPostulantes;
exports.formatoImplodeRut = formatoImplodeRut;
exports.formatoImplodeAni = formatoImplodeAni;
exports.formatInsertNotaCalidad = formatInsertNotaCalidad;
exports.buscarEstandarActivo = buscarEstandarActivo;
exports.formatUsuariosPostulantes = formatUsuariosPostulantes;
exports.formatInsertNotaCalidadEjecutivas = formatInsertNotaCalidadEjecutivas;