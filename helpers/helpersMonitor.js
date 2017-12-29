var utils = require('../utils/utils');
_ = require("lodash");
moment = require('moment');

function formatPreferenciasMetas(preferencias){
	var arrRetorno = [];
	max_metas = 4;
	tam_pref = preferencias.length;
	if((max_metas - tam_pref) == 0){
		arrRetorno = preferencias;
	}
	else if((max_metas - tam_pref) == 4){
		var data = {id_cliente:'', id_servicio:''};
		for (var i = 1; i <= 4; i++){
			data.monitor = false;
			data.codigo = Math.random();
			arrRetorno.push(data);
		}	
	}else if((max_metas - tam_pref) < 4){
		faltante = max_metas - tam_pref;
		arrRetorno = preferencias;
		var data = {id_cliente:'', id_servicio:''};
		for (var i = 1; i <= faltante; i++){
			if(preferencias[i]){
				data.monitor = false;
				data.codigo = Math.random();
				arrRetorno.push(data);
			}
		}
	}
	return(arrRetorno);
}

function formatMonitorMetas(preferencias, metas){
	var arrRetorno = {};

	_.forEach(preferencias, function(pref, key){
		console.log(pref);
		var data = {monitor: pref.monitor, id_cliente:pref.id_cliente, id_servicio:pref.id_servicio};
		var list = [];
		_.forEach(metas, function(met, key){
			if(data.id_cliente == met.id_cliente && data.id_servicio == met.id_servicio){
				var meta = {};
				meta.met_dia_meta = met.met_dia_meta;
				meta.met_dia_media = met.met_dia_media;
				meta.met_dia_fecha = met.met_dia_fecha;
				list.push(meta);
			}
			data.metas = list;
		});
		arrRetorno[pref.monitor] = data;
	});
	return(arrRetorno);
}


function formatMetas(preferencias, metas){
	var arrRetorno = {};
	_.forEach(preferencias, function(pref, key){
		var data = {monitor: pref.monitor, id_cliente:pref.id_cliente, id_servicio:pref.id_servicio};
		data.format = {dataMedia:[],dataLabels:[]};
		acum_meta = 0;
		_.forEach(metas,function(met,key){
			if(data.id_cliente == met.id_cliente && data.id_servicio == met.id_servicio){
				acum_meta += met.met_dia_meta;
				data.format.dataMedia.push(acum_meta);
				data.format.dataLabels.push(met.met_dia_fecha);
			}
		});
		arrRetorno[pref.monitor] = data;
	});
	return arrRetorno;
}

function formatMediaMetas(preferencias, medias,fecha){
	console.log('medias',fecha);
	var arrRetorno = {};
	_.forEach(preferencias, function(pref, key){
		var id_cliente = (pref.id_cliente<10)?'0'+ pref.id_cliente:pref.id_cliente;
		var id_servicio = (pref.id_servicio<10)?'0'+ pref.id_servicio:pref.id_servicio;
		var data = {monitor: pref.monitor, id_cliente:pref.id_cliente, id_servicio:pref.id_servicio, campana:id_cliente+id_servicio};
		data.format = {dataMedia:[],dataLabels:[]};
		var flag_terminar = false;
		var acum_dia = 0;
		_.forEach(medias,function(med,key_2){
			if(data.campana == med.campaign_id){
				flag_dia = true;
				acum_dia += med.efectivos;
				data.format.dataMedia.push(acum_dia);
			}
		});
		arrRetorno[pref.monitor] = data;
	});
	return arrRetorno;	
}

function formatMetaGlobal(preferencias, metas, medias,fecha, color){
	var arrRetorno = {};
	_.forEach(preferencias, function(pref, key){
		var id_cliente = (pref.id_cliente<10)?'0'+ pref.id_cliente:pref.id_cliente;
		var id_servicio = (pref.id_servicio<10)?'0'+ pref.id_servicio:pref.id_servicio;
		var data = {monitor: pref.monitor, id_cliente:pref.id_cliente, id_servicio:pref.id_servicio, campana:id_cliente+id_servicio};
		data.arrGlobal = {fecha:'',meta:''};
		var acum_meta = 0;
		var acum_dia = 0;
		var meta = 0;
		var meta_dia = 0;
		var flag_hoy = true;
		_.forEach(metas,function(met,key){
			var flag_dia = true;
			acum_meta += met.met_dia_meta;
			if(data.id_cliente == met.id_cliente && data.id_servicio == met.id_servicio){
				meta += parseInt(met.met_dia_meta);
				if(flag_hoy) meta_dia += parseInt(met.met_dia_meta);
				if(fecha == met.met_dia_fecha){
					flag_hoy = false;
				}
			}
			data.arrGlobal.total_meta = meta;
			data.arrGlobal.meta_hoy = meta_dia;
			var efec = 0;
			_.forEach(medias,function(med,key_2){
				if(data.campana == med.campaign_id){
					efec += parseInt(med.efectivos);
				}
			});
			data.arrGlobal.efectivos = efec;
			cumplimiento_mes = ((meta_dia*100)/meta).toFixed(2);
			cumplimiento_dia = ((efec*100)/meta_dia).toFixed(2);
			data.arrGlobal.cumplimiento_mes = numberWithCommas(cumplimiento_mes);
			cumplimiento_mes_color = formatMetaColores(color, cumplimiento_mes);
			data.arrGlobal.cumplimiento_mes_color = cumplimiento_mes_color;
			data.arrGlobal.cumplimiento_dia = numberWithCommas(cumplimiento_dia);
			cumplimiento_dia_color = formatMetaColores(color, cumplimiento_dia);
			data.arrGlobal.cumplimiento_dia_color = cumplimiento_dia_color;
		});
		arrRetorno[pref.monitor] = data;
	});

	return arrRetorno;
}

function formatMetaColores(colo, cumplimiento){
	var color = '';

	_.forEach(colo, function(col, key1){
		if(parseInt(cumplimiento) <= parseInt(col.cme_rango))
			color = col.cme_color;
	});
	if(color=='')
		color = '#00CC00';

	return color;
}

function numberWithCommas(n) {
    var parts=n.toString().split(".");
    return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "," + parts[1] : "");
}

function formatoInsertarPreferencias(preferencias,id_user){
	var insert = "INSERT INTO hermes.campana_monitor_adherencia(id_cliente,id_servicio,campana,user_id) VALUES";
	var data = "";
	_.forEach(preferencias, function(pref,key){
		var campana = "";
		var id_cliente = "";
		var id_servicio = "";
		if(key!='monitor' && !_.isEmpty(pref)){
			if(data != "") data += ",";
			id_cliente = (pref.id_cliente<10)?'0'+ pref.id_cliente:pref.id_cliente;
			id_servicio = (pref.id_servicio<10)?'0'+ pref.id_servicio:pref.id_servicio;
			campana = id_cliente.toString()+id_servicio.toString();
			data += "("+pref.id_cliente+","+pref.id_servicio+",'"+campana+"',"+id_user+")";
		}
	});
	insert += data+";";
	console.log(insert);
	return insert;
}

exports.formatMonitorMetas = formatMonitorMetas;
exports.formatMetas = formatMetas;
exports.formatMediaMetas = formatMediaMetas;
exports.formatMetaGlobal = formatMetaGlobal;
exports.formatPreferenciasMetas = formatPreferenciasMetas;
exports.formatoInsertarPreferencias = formatoInsertarPreferencias;