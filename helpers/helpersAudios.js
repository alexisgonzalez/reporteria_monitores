var _ = require("lodash");	
/***
	Se recorre el arreglo y se separan los audios que vienen desde vicidial o vibox
	se retorno un json que separa ambos
**/
function extractAudiosVicidial(audios){
	var arrVicidal = [];
	var arrVibox = [];
	for(var i=0,len=audios.length;i<len;i++){
		if(audios[i].observacion == 'Vicidial'){
			arrVicidal.push(audios[i]);
		}else{
			arrVibox.push(audios[i]);
		}
	}
	return {audios_vicidial:arrVicidal,audios_vibox:arrVibox};
}

/**
	Se recorre el array de audios de vicidial para modificar la ruta donde se encuentra la grabacion
**/
function putAudioLocationVicidial(audiosVici,locationAudios){
	audiosVici.sort(function(a, b){
	    if(a.id_ani < b.id_ani) return -1;
	    if(a.id_ani > b.id_ani) return 1;
	    return 0;
	});
	audios = [];
	audioBases = {};
	_.forEach(audiosVici,function(audio,key){
		audioBases[audio.id_ani] = audio;
	});
	_.forEach(locationAudios,function(loca,key){
		var audio = {};
		audio.segundos = loca.segundos;
		audio.grabacion = loca.location;
		audio.fecha_llamado = loca.fecha_llamado;
		audio.cu_cliente = audioBases[loca.vendor_lead_code].cu_cliente;
		audio.estado = audioBases[loca.vendor_lead_code].estado;
		audio.ic_cliente = audioBases[loca.vendor_lead_code].ic_cliente;
		audio.id_ani = audioBases[loca.vendor_lead_code].id_ani;
		audio.id_cliente = audioBases[loca.vendor_lead_code].id_cliente;
		audio.nombre = audioBases[loca.vendor_lead_code].nombre;
		audio.observacion = audioBases[loca.vendor_lead_code].observacion;
		audio.operador = audioBases[loca.vendor_lead_code].operador;
		audio.rut_cliente = audioBases[loca.vendor_lead_code].rut_cliente;
		audios.push(audio);
	});
	return audios;
}

/**
	implodeIdAniFiltro transformara todos los id_ani del array a un string de condicion para una consulta
**/
function implodeIdAniFiltro(audiosVici){
	var retorno = "";
	retorno += "AND lead.vendor_lead_code IN (";
	for (var i = 0; i < audiosVici.length; i++) {
		if(i == 0)
			retorno += audiosVici[i].id_ani.toString();
		else{
			retorno += ","+audiosVici[i].id_ani.toString();
		}
	}
	retorno +=")";

	return retorno;
}

exports.extractAudiosVicidial    = extractAudiosVicidial;
exports.putAudioLocationVicidial = putAudioLocationVicidial;
exports.implodeIdAniFiltro       = implodeIdAniFiltro;