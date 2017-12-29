var utils = require('../utils/utils');
var _ = require('lodash');
var moment = require('moment');
/***
	reFormatMedia: se recibe los datos de los sistema de vicidial y vibox
	Ejecución:
		* Homologa los datos tanto de vibox y vicidial por separados
		* Los junta en un solo arreglo
		* Este arreglo se ordenar por operador
		* Se recorre el arreglo para lo siguiente:
			- Se calulan y acumulan las medias por operador
			- Se calculan y acumulan los efectivos por operador
			- Se acumula el tiempo real trabajado por operador.
			- Se calcula el cuartil por operador
			- el arreglo se separa en 3 arreglos mas correspondiente a la tabla que se muestra, el grafico de medias y efectividad
		* se retorna arreglo que contiene la separacion por función.
***/
function reFormatMedia(data,data_vibox,flag_domo,data_domo,flag_minimo,tiempo_minimo,estados_contactados){
 	var retorno = {media:[],tabla:[],efectividad:[]};
 	var medias = {};
 	var user_current = "";
 	var medias_cuartil = [];
 	var lllamadas_cuartil = [];
 	var efectividad_cuartil = [];
	var mediaSiodial = formatMediaSiodial(data,flag_domo,estados_contactados);
	var mediaVibox = formatMediaVibox(data_vibox,flag_domo);
 	var acum_llamado = acum_contactos = acum_efectivos = acum_time = acum_llamado_total = porc_efectividad_total = acum_efectivos_total = acum_time_total = 0;
 	var universo = 0;
 	var porc_efectividad = 0;
	medias = mediaSiodial.tabla.concat(mediaVibox.tabla);
	//ORDENO EL ARRAY ASCENDENTE POR USUARIO
	medias.sort(function(a, b){
	    if(a.user < b.user) return -1;
	    if(a.user > b.user) return 1;
	    return 0;
	});
	console.log("MEDIAS", medias);
	for(var i =0,len=medias.length;i < len;i++){
		if(user_current == ""){
			user_current = medias[i].user;
			supervisor_current = medias[i].supervisor;
			campaign_current = medias[i].campaign;
			servicio_current = medias[i].servicio;
		}
		if( user_current != medias[i].user){
			if(flag_minimo && acum_time <= tiempo_minimo){
				acum_efectivos_total = acum_efectivos_total - acum_efectivos;
				acum_time_total = acum_time_total-acum_time;
				acum_llamado_total = acum_llamado_total - acum_llamado;
				//continue;
			}else{
				//realizar el avance cuando cambie de operador guardar la media y sus efectivos
				media_calc = (acum_efectivos == 0) ? 0:acum_efectivos/(acum_time/3600);
				universo = (flag_domo) ? acum_contactos:acum_llamado;
				if(universo > 0){
					porc_efectividad = (acum_efectivos*100/universo).toFixed(2);
					porc_contactabilidad = parseFloat(acum_contactos*100/acum_llamado).toFixed(2);
				}else{
					porc_efectividad = 0;
					porc_contactabilidad = 0;
				}
				porc_efectividad_total = parseFloat(porc_efectividad_total)+parseFloat(porc_efectividad);
				retorno.media.push({"user":user_current,"media":parseFloat(media_calc.toFixed(2))});
				medias_cuartil.push(media_calc.toFixed(2)*1);
				lllamadas_cuartil.push(parseFloat(porc_contactabilidad));
				efectividad_cuartil.push(porc_efectividad);
				retorno.efectividad.push({"user":user_current,"efectividad":porc_efectividad});
				retorno.tabla.push({"user":user_current,
									"supervisor":supervisor_current,
									"campaign":campaign_current,
									"campaign_name":medias[i].campaign_name,
									"cuartil":0,
									"efectivos":acum_efectivos,
									"servicio":servicio_current,
									"media":media_calc.toFixed(2),
									"tiempo_fin_format":acum_time,
									"llamados":acum_llamado,
									"contactos":acum_contactos,
									"porc_efectividad":porc_efectividad,
									"porc_contactabilidad":porc_contactabilidad,
									"tiempo":acum_time.toHHMMSS()});
			}
			user_current = medias[i].user;
			supervisor_current = medias[i].supervisor;
			campaign_current = medias[i].campaign;
			servicio_current = medias[i].servicio;
			acum_llamado = acum_efectivos = acum_contactos = acum_time = 0;
		}
		acum_efectivos_total += medias[i].efectivos;
		acum_efectivos += medias[i].efectivos;
		acum_contactos += medias[i].contactos;
		acum_time_total += medias[i].tiempo_fin_format;
		acum_time += medias[i].tiempo_fin_format;
		acum_llamado += medias[i].llamados;
		acum_llamado_total += medias[i].llamados;
		if(i == len-1){
			media_calc = (acum_efectivos == 0) ? 0:acum_efectivos/(acum_time/3600);
			universo = (flag_domo) ? acum_contactos:acum_llamado;
			if(universo > 0){
				porc_efectividad = parseFloat(acum_efectivos*100/universo).toFixed(2);
				porc_contactabilidad = parseFloat(acum_contactos*100/acum_llamado).toFixed(2);
			}else{
				porc_efectividad = 0;
				porc_contactabilidad = 0;
			}
				
			porc_efectividad_total = parseFloat(porc_efectividad_total)+parseFloat(porc_efectividad);
			retorno.media.push({"user":user_current,"media":parseFloat(media_calc.toFixed(2))});
			medias_cuartil.push(media_calc.toFixed(2)*1);
			lllamadas_cuartil.push(parseFloat(porc_contactabilidad));
			efectividad_cuartil.push(porc_efectividad);
			retorno.efectividad.push({"user":user_current,"efectividad":porc_efectividad});
			retorno.tabla.push({"user":user_current,
								"supervisor":supervisor_current,
								"campaign":campaign_current,
								"cuartil":0,
								"efectivos":acum_efectivos,
								"servicio":servicio_current,
								"media":media_calc.toFixed(2),
								"tiempo_fin_format":acum_time,
								"llamados":acum_llamado,
								"contactos":acum_contactos,
								"porc_efectividad":porc_efectividad,
								"porc_contactabilidad":porc_contactabilidad,
								"tiempo":acum_time.toHHMMSS()});
		}
	}
	var cuartiles = utils.extractArr(medias_cuartil,0.1);
	console.log("cuartiles");
	console.log(cuartiles);
	var cuartiles_llamados = utils.extractArr(lllamadas_cuartil,0.1);
	var cuartiles_efectividad = utils.extractArr(efectividad_cuartil,0.1);
	retorno.tabla = ponerCuartilMedias(retorno.tabla,cuartiles,cuartiles_llamados,cuartiles_efectividad);
	var media_total = acum_efectivos_total/(acum_time_total/3600);
	var prom_efectividad = parseFloat(porc_efectividad_total/retorno.tabla.length).toFixed(2);
	var total_contac = 0;
		console.log(lllamadas_cuartil);
	_.forEach(lllamadas_cuartil,function(valor,key){
		total_contac += valor;
	});
	//console.log("||||||||||||||||||||||||||||||| ",total_contac,lllamadas_cuartil.length);
	console.log("prom_efectividad",prom_efectividad,retorno.tabla.length,porc_efectividad_total);
	retorno.totales = {porc_contactabilidad:(total_contac/(lllamadas_cuartil.length)).toFixed(2),tiempo_segundos:acum_time_total,media:media_total.toFixed(2),tiempo:acum_time_total.toHHMMSS(),efectivos:acum_efectivos_total,total_llamado:acum_llamado_total,promedio_efectividad:prom_efectividad};
	retorno.efectividad.sort(predicatBy("efectividad"));
	retorno.media.sort(predicatBy("media"));
	retorno.graficoMedia = {media: extractDataSort(retorno.media,'media'),user:extractDataSort(retorno.media,'user')};
	retorno.graficoEfectividad = {efectividad: extractDataSort(retorno.efectividad,'efectividad'),user:extractDataSort(retorno.efectividad,'user')};
	return retorno;
}

function extractDataSort(data,extract){
	var arrRet = [];
	for (var i = 0; i < data.length; i++) {
		if(extract == 'media'){
			arrRet.push(data[i].media);
		}
		if(extract == 'user'){
			arrRet.push(data[i].user);
		}
		if(extract == 'efectividad'){
			arrRet.push(data[i].efectividad);
		}
	}
	return arrRet;
}
/**
 cuartilMedias se reciben dos parametros
 	medias: array de medias sin repetir
 	cuartil: 
 		0.25 para el primer cuartil
 		0.5  para el segundo cuartil
 		0.75 para el tercer cuartil
***/
function cuartilMedias(medias,cuartil) {
	medias.sort(function(a, b) {
	 	return a - b;
	});
	var brec = medias[medias.length-1] - medias[0];

	return brec*cuartil;
	/*var pos = (medias.length - 1) * cuartil;

	var base = Math.floor(pos);
	var rest = pos - base;

	if( medias.hasOwnProperty(base+1) ) {
		return medias[base] + rest * (medias[base+1] - medias[base]);
	} else {
		return medias[base];
	}*/
}

function ponerCuartilMedias(tabla,cuartiles,cuartiles_llamados,cuartiles_efectividad){
	moda_media = utils.moda(cuartiles);
	moda_contactabilidad = utils.moda(cuartiles_llamados);
	moda_efectividad = utils.moda(cuartiles_efectividad);


	var q3 = 0.9;
	var q2 = 0.8;
	var q1 = 0.7;
	
	for(var i =0;i<tabla.length;i++){
		tabla[i].tramo = retNumCuartil(tabla[i].media,moda_media*q1,moda_media*q2,moda_media*q3);
		if(tabla[i].contactos == null){
			tabla[i].tramo_contactabilidad = 0;
			tabla[i].tramo_efectividad = 0;
		}else{
			tabla[i].tramo_contactabilidad = retNumCuartil(tabla[i].porc_contactabilidad,moda_contactabilidad*q1,moda_contactabilidad*q2,moda_contactabilidad*q3);
			tabla[i].tramo_efectividad = retNumCuartil(tabla[i].porc_efectividad,moda_efectividad*q1,moda_efectividad*q2,moda_efectividad*q3);
		}
	}
	return tabla;
}

function retNumCuartil(campo,q1,q2,q3){
	if(parseFloat(campo) <= q1){
		return 4;
	}
	if(parseFloat(campo) > q1 && parseFloat(campo) < q2){
		return 3;
	}
	if(parseFloat(campo) >= q2 && parseFloat(campo) < q3){
		return 2;
	}
	if(parseFloat(campo) >= q3){
		return 1;
	}
}

function extractMediasCuartil(array_medias){
	var fecha = "";
 	var arrMedias = [];
 	for (var i = 0; i < array_medias.length; i++) {
 		if(arrFechas.indexOf(array_medias[i]["opt_fec_fecha"]) >= 0){ //ENCONTRO LA FECHA
 			continue;
 		}
 		if(fecha == ""){
 			fecha = data[i]["opt_fec_fecha"];
 			arrFechas.push(fecha);
 		}else if(fecha != data[i]["opt_fec_fecha"]){
 			fecha = data[i]["opt_fec_fecha"];
 			arrFechas.push(fecha);
 		}
 	}
 	return arrFechas;
}

function formatMediaSiodial(data,flag_domo,estados_contactados){
 	var acum_llamado = porc_efectividad = acum_efectivos = acum_contactos = acum_time = media_calc = 0;
 	var user_current = supervisor_current = campaign_current = servicio_current = "";
 	var retorno = {media:[],tabla:[],efectividad:[]};
 	console.log(estados_contactados);
	for (var i = 0, len = data.length; i < len; i++) {
		if(user_current == ""){
			user_current = data[i].mpr_user;
			supervisor_current = data[i].supervisor;
			campaign_current = data[i].campaign_id;
			if(flag_domo) servicio_current = data[i].cliente+"/"+data[i].servicio;
		}
		if( user_current != data[i].mpr_user){
			//realizar el avance cuando cambie de operador guardar la media y sus efectivos
			media_calc = (acum_efectivos == 0) ? 0:acum_efectivos/(acum_time/3600);
			porc_efectividad = parseFloat(acum_efectivos*100/acum_contactos).toFixed(2);
			retorno.tabla.push({"user":user_current,
								"supervisor":supervisor_current,
								"campaign":campaign_current,
								"campaign_name":data[i].campaign_name,
								"efectivos":acum_efectivos,
								"servicio":servicio_current,
								"media":media_calc.toFixed(2),
								"llamados":acum_llamado,
								"contactos":acum_contactos,
								"porc_efectividad":porc_efectividad,
								"tiempo_fin_format":acum_time,
								"tiempo":acum_time.toHHMMSS()});
			user_current = data[i].mpr_user;
			supervisor_current = data[i].supervisor;
			campaign_current = data[i].campaign_id;
			if(flag_domo) servicio_current = data[i].cliente+"/"+data[i].servicio;
			acum_llamado = acum_efectivos = acum_contactos = acum_time = 0;
		}
		acum_efectivos += data[i].mpr_sale;
		acum_time += data[i].mpr_talk_sec+data[i].mpr_wait_sec + data[i].mpr_pause_bill_sec;
		acum_llamado += data[i].mpr_call;
		if(flag_domo && estados_contactados.indexOf(data[i].mpr_status) >= 0){
			acum_contactos += data[i].mpr_call;
		}
		if(!flag_domo){
			acum_contactos += data[i].mpr_call;
		}

		if(i == len-1){
			media_calc = (acum_efectivos == 0) ? 0:acum_efectivos/(acum_time/3600);
			porc_efectividad = parseFloat(acum_efectivos*100/acum_contactos).toFixed(2);
			retorno.tabla.push({"user":user_current,
								"supervisor":supervisor_current,
								"campaign":campaign_current,
								"campaign_name":data[i].campaign_name,
								"efectivos":acum_efectivos,
								"servicio":servicio_current,
								"media":media_calc.toFixed(2),
								"tiempo_fin_format":acum_time,
								"llamados":acum_llamado,
								"contactos":acum_contactos,
								"porc_efectividad":porc_efectividad,
								"tiempo":acum_time.toHHMMSS()});
		}
	}
	return retorno;
}

function formatMediaVibox(data_vibox,flag_domo){
 	var acum_llamado = porc_efectividad = acum_efectivos = acum_contactos = acum_time = media_calc = 0;
 	var user_current = supervisor_current = campaign_current = servicio_current = "";
 	var retorno = {media:[],tabla:[],efectividad:[]};
 	for (var i = 0, len = data_vibox.length; i < len; i++) {
		if(user_current == ""){
			user_current = data_vibox[i].operador;
			supervisor_current = data_vibox[i].supervisor;
			campaign_current = data_vibox[i].nombre_campana;
			if(flag_domo) servicio_current = data_vibox[i].cliente+"/"+data_vibox[i].servicio;
		}
		if( user_current != data_vibox[i].operador){
			//realizar el avance cuando cambie de operador guardar la media y sus efectivos
			media_calc = (acum_efectivos == 0) ? 0:acum_efectivos/(acum_time/3600);
			porc_efectividad = parseFloat(acum_efectivos*100/acum_llamado).toFixed(2);
			retorno.media.push({"user":user_current,"media":media_calc.toFixed(2)});
			retorno.efectividad.push({"user":user_current,"efectividad":porc_efectividad});
			retorno.tabla.push({"user":user_current,
								"supervisor":supervisor_current,
								"campaign":campaign_current,
								"efectivos":acum_efectivos,
								"servicio":servicio_current,
								"media":media_calc.toFixed(2),
								"llamados":acum_llamado,
								"contactos":acum_contactos,
								"porc_efectividad":porc_efectividad,
								"tiempo_fin_format":acum_time,
								"tiempo":acum_time.toHHMMSS()});
			user_current = data_vibox[i].operador;
			supervisor_current = data_vibox[i].supervisor;
			campaign_current = data_vibox[i].nombre_campana;
			if(flag_domo) servicio_current = data_vibox[i].cliente+"/"+data_vibox[i].servicio;
			acum_llamado = acum_efectivos = acum_contactos = acum_time = 0;
		}
		acum_efectivos += data_vibox[i].efectivos;
		acum_time += data_vibox[i].segundos;
		acum_llamado += data_vibox[i].contactos;
		if(data_vibox[i].contactos_directo == null){
			acum_contactos = null;
		}else{
			acum_contactos += data_vibox[i].contactos_directo;
		}
		if(user_current == 'acruzv'){
			console.log("acum_contactos vibox",data_vibox[i].contactos_directo)
		}
		if(i == len-1){
			media_calc = (acum_efectivos == 0) ? 0:acum_efectivos/(acum_time/3600);
			porc_efectividad = parseFloat(acum_efectivos*100/acum_llamado).toFixed(2);
			retorno.media.push({"user":user_current,"media":media_calc.toFixed(2)});
			retorno.efectividad.push({"user":user_current,"efectividad":porc_efectividad});
			retorno.tabla.push({"user":user_current,	
								"supervisor":supervisor_current,
								"campaign":campaign_current,
								"efectivos":acum_efectivos,
								"servicio":servicio_current,
								"media":media_calc.toFixed(2),
								"tiempo_fin_format":acum_time,
								"llamados":acum_llamado,
								"contactos":acum_contactos,
								"porc_efectividad":porc_efectividad,
								"tiempo":acum_time.toHHMMSS()});
		}
	}
	return retorno;
}

 function extractDateHH(data){
 	var fecha = "";
 	var arrFechas = [];
 	for (var i = 0; i < data.length; i++) {
 		if(arrFechas.indexOf(data[i]["opt_fec_fecha"]) >= 0){ //ENCONTRO LA FECHA
 			continue;
 		}
 		if(fecha == ""){
 			fecha = data[i]["opt_fec_fecha"];
 			arrFechas.push(fecha);
 		}else if(fecha != data[i]["opt_fec_fecha"]){
 			fecha = data[i]["opt_fec_fecha"];
 			arrFechas.push(fecha);
 		}
 	}
 	return arrFechas;
 }

 function extractDateHHReal(realVibox,realVicidial){
 	var arrFechas = [];
 	var fecha = "";
 	_.forEach(realVibox,function(real,key){
 		if(arrFechas.indexOf(real["fecha"]) >= 0){ //ENCONTRO LA FECHA
 			return;
 		}
 		if(fecha == ""){
 			fecha = real["fecha"];
 			arrFechas.push(fecha);
 		}else if(fecha != real["fecha"]){
 			fecha = real["fecha"];
 			arrFechas.push(fecha);
 		}
 	});
 	_.forEach(realVicidial,function(real,key){
 		if(arrFechas.indexOf(real["mpr_date"]) >= 0){ //ENCONTRO LA FECHA
 			return;
 		}
 		if(fecha == ""){
 			fecha = real["mpr_date"];
 			arrFechas.push(fecha);
 		}else if(fecha != real["mpr_date"]){
 			fecha = real["mpr_date"];
 			arrFechas.push(fecha);
 		}
 	});
 	return arrFechas;
 }

 function arrFechasNombre(dataFechas){
 	var arrFechasNombre = [];
 	var dias = ["Lunes","Martes","Miercoles","Jueves","Viernes","Sabado"];
 	for(var i = 0; i< dataFechas.length;i++){
 		var fecha = new Date(dataFechas[i]);
 		arrFechasNombre.push(dias[fecha.getDay()]);
 	}
 	return arrFechasNombre;
 }

 function formatHorarioIdeal(fechas,data){
 	var format = {};
 	var userCurrent = "";
 	var fechaCurrent = "";
 	var interior = {};
 	for (var i = 0; i < data.length; i++) {
 		if(userCurrent == "" && fechaCurrent == ""){
 			userCurrent = data[i]["user"];
 			fechaCurrent = data[i]["hop_fecha"];
 			flag = true;
 		}
 		if(flag && userCurrent == data[i]["user"]){
 			interior[data[i]["hop_fecha"]] = {"formatIdeal":data[i]["ideal"],"ideal":data[i]["total_ideal"]};
 		}
 		if(flag && userCurrent != data[i]["user"]){
 			format[userCurrent] = interior;
 			interior = {};
 			userCurrent = data[i]["user"];
 			fechaCurrent = data[i]["hop_fecha"];
 			interior[data[i]["hop_fecha"]] = {"formatIdeal":data[i]["ideal"],"ideal":data[i]["total_ideal"]};
 		}
 		if(i == data.length-1){
 			format[userCurrent] = interior;
 		}
 	}
 	return format;
 }

 var diaGlobalHorario;
 var globalHorarioOperador;
 var globalHorario;
 var globalhorarioReal;
 var globalVicidial;
 var globalVibox;
 var cantidadExcepciones;
 var operadoresExcepciones;

 function formatHorarioOp(fechas,data,arrHorarioIdealFechas,arrHorarioIdeal,arrHorarioRealVibox,arrUsers,excepciones){
 	diaGlobalHorario = {};
 	globalHorarioOperador = {};
 	globalHorario = {totalIdealExce:0,totalIdeal:0,totalAdhe:0,totalDif:0,totalPorc:0,totalPorcExce:0,totalAusentes:0,totalValidacionesManual:0,totalSobreTiempo:0,formatIdeal:'',formatIdealExce:'',formatAdhe:'',formatDif:''
 						,totalVacaciones:0,totalLicencia:0,totalPermisos:0,totalRecupero:0,totalPermisosEsp:0,totalFaltaHorario:0,formatVacaciones:'',formatLicencia:'',formatPermisos:'',formatPermisosEsp:'',formatRecupero:'',formatAusentes:'',formatValidacionesManual:'',formatSobreTiempo:'',formatFaltaHorario:''};
 	globalhorarioReal = data;
 	cantidadExcepciones = {acumLicencias:0,acumVacaciones:0,acumPermisos:0,acumPermisosEsp:0,acumRecupero:0,acumAusentes:0,acumValidacionesManual:0,acumSobreTiempo:0,acumFaltaHorario:0};
 	operadoresExcepciones = {operadorLicencias:[],operadorVacaciones:[],operadorPermisos:[],operadorPermisosEsp:[],operadorRecupero:[],operadorAusentes:[],operadorValidacionesManual:[],operadorSobreTiempo:[],operadorFaltaHorario:[]};
 	var arrHorario = {};
 	var userCurrent = "";
 	var fechaCurrent = "";
 	var flag = false;
 	var interior = {};
 	var idealData = {};
 	globalVicidial = 0;
 	globalVibox = 0;
	for (var j = 0; j < arrUsers.length; j++) { // RECORREMOS LOS OPERADORES POR FECHA
		userCurrent = arrUsers[j];
		interior = {};
		for (var i = 0; i < fechas.length; i++) {
			fechaCurrent = fechas[i];
 			flag = false;
 			var idealData = {};
 			for (var k = 0; k < arrHorarioIdeal.length; k++) { // RECORREMOS PARA ENCONTRAR EL IDEAL DEL USUARIO SINO LO ENCUENTRA ES 0
 				if(arrHorarioIdeal[k]["usuario_codigo"] == userCurrent && arrHorarioIdeal[k]["opt_fec_fecha"] == fechaCurrent){
 				//if(arrHorarioIdeal[k]["user"] == userCurrent && arrHorarioIdeal[k]["hop_fecha"] == fechaCurrent){
 					flag = true;
 					idealData = arrHorarioIdeal[k];
 					break;
 				}
 			}
 			if(!flag) // SINO ENCONTRO IDEAL ES 0
 				idealData = 0;
 			interior[fechaCurrent] = getInteriorPush(idealData,data,fechaCurrent,userCurrent,arrHorarioRealVibox,excepciones);
 		}
 		arrHorario[userCurrent] = interior;
 	}
 	userCurrent = "";
	fechaCurrent = "";
	interior = {};

 	return {"horario":arrHorario,"globalesDia":diaGlobalHorario,"globalesOperador":globalHorarioOperador,"totales":globalHorario,"operadoresExcepciones":operadoresExcepciones,"cantidadExcepciones":cantidadExcepciones};
 }
/**
	Excepciones pueden ser:
		2 Permiso solicitado con recuperación del 
		3 Permiso solicitado con descuento de tiempo
		4 Recuperación de tiempo de permiso
		5 Licencia médica
		6 Vacaciones
		7 Permiso especial sin descuento de tiempo
	Flag excepciones
		0 sin excepciones
		1 vacaciones
		2 licencia
		3 permiso
		4 recupero
		5 permiso especial
**/
 function getInteriorPush(horarioData,data,fecha,operador,dataRealVibox,excepciones){
 	var tiempo_ideal = (horarioData != 0) ? horarioData["ideal_segundos"] : 0;
 	var tiempo_ideal_con_exep = (horarioData != 0) ? horarioData["ideal_segundos"] : 0;
 	//var tiempo_ideal = (horarioData != 0) ? horarioData["total_ideal"] : 0;
 	var total_adherencia = '00:00:00';
 	var tiempo_adherencia = 0;
 	var diferencia = 0;
 	var porc = 0;
 	var flag_encontro = false;
 	var flag_excepciones = 0;
 	var tiempo_permiso = 0;
	var tiempo_recupero = 0;
 	var tiempo_vacaciones = 0;
	var tiempo_licencias = 0;
	var tiempo_permiso_esp = 0;
	var acum_permiso = 0;
	var acum_permiso_esp = 0;
	var acum_recupero = 0;
 	var acum_vacaciones = 0;
	var acum_licencias = 0;
	var acum_ausentes = 0;
	var acum_validacionesManual = 0;
	var acum_sobreTiempo = 0;
	var acum_faltaHorario = 0;
 	//SI EXCEPCION viene 5, 6 o 7 IDEAL EN 0
 	if(typeof(excepciones[operador]) != "undefined" && typeof(excepciones[operador][fecha]) != "undefined"){

	 	for (var i = 0; i < excepciones[operador][fecha].length; i++) {
	 		if(excepciones[operador][fecha][i].tho_id == 5 || excepciones[operador][fecha][i].tho_id == 6 || excepciones[operador][fecha][i].tho_id == 7){
	 			tiempo_ideal_con_exep = 0;
	 			if(excepciones[operador][fecha][i].tho_id == 5){
	 				flag_excepciones = 2;
	 				tiempo_licencias += tiempo_ideal;
	 				if(operadoresExcepciones.operadorLicencias.indexOf(operador) < 0){
	 					//acum_licencias ++;
	 					cantidadExcepciones.acumLicencias++;
	 					operadoresExcepciones.operadorLicencias.push(operador);
	 				}
	 			}
	 			if(excepciones[operador][fecha][i].tho_id == 6){
	 				flag_excepciones = 1;
	 				tiempo_vacaciones += tiempo_ideal;
	 				if(operadoresExcepciones.operadorVacaciones.indexOf(operador) < 0){
	 					//acum_vacaciones ++;
	 					cantidadExcepciones.acumVacaciones++;
	 					operadoresExcepciones.operadorVacaciones.push(operador);
	 				}
	 			}
	 			if(excepciones[operador][fecha][i].tho_id == 7){
	 				flag_excepciones = 5;
	 				tiempo_permiso_esp += tiempo_ideal;
	 				if(operadoresExcepciones.operadorPermisosEsp.indexOf(operador) < 0){
	 					cantidadExcepciones.acumPermisosEsp++;
	 					operadoresExcepciones.operadorPermisosEsp.push(operador);
	 				}
	 			}
	 			break;
	 		}
	 	}
 	}

 	//SI EXCEPCION viene 2 ,3 o 4 IDEAL EN 0
 	if(typeof(excepciones[operador]) != "undefined" && typeof(excepciones[operador][fecha]) != "undefined"){
	 	for (var i = 0; i < excepciones[operador][fecha].length; i++) {
	 		if(excepciones[operador][fecha][i].tho_id == 4 ){
	 			tiempo_ideal_con_exep += excepciones[operador][fecha][i].hop_segundos;
	 			tiempo_recupero += excepciones[operador][fecha][i].hop_segundos;
	 			flag_excepciones = 4;
	 			if(operadoresExcepciones.operadorRecupero.indexOf(operador) < 0){
 					//acum_recupero++;
 					cantidadExcepciones.acumRecupero++;
 					operadoresExcepciones.operadorRecupero.push(operador);
 				}
	 			//console.log("El operador "+operador+" Recupero "+fecha+" "+excepciones[operador][fecha][i].hop_segundos.toHHMMSS());
	 		}
	 		if(excepciones[operador][fecha][i].tho_id == 2 || excepciones[operador][fecha][i].tho_id == 3){
	 			tiempo_ideal_con_exep	 -= excepciones[operador][fecha][i].hop_segundos;
	 			tiempo_permiso += excepciones[operador][fecha][i].hop_segundos;
	 			flag_excepciones = 3;
	 			if(operadoresExcepciones.operadorPermisos.indexOf(operador) < 0){
 					//acum_permiso++;
 					cantidadExcepciones.acumPermisos++;
 					operadoresExcepciones.operadorPermisos.push(operador);
 				}
	 			//var texto = "El operador "+operador+" pidio permiso "+fecha+" "+excepciones[operador][fecha][i].hop_segundos.toHHMMSS();
	 			//if(excepciones[operador][fecha][i].tho_id == 3) texto += " sin recupero";
	 			//console.log(texto);
	 		}
	 	}
 	}

 	for(var i = 0;i<data.length;i++){
 		//console.log(data[i],i);
 		if(data[i]["mpr_date"] == fecha && data[i]["mpr_user"] == operador){
		 	tiempo_adherencia += (typeof(data) != "undefined") ? data[i]["second_adhe"]:0;
		 	total_adherencia = tiempo_adherencia.toHHMMSS();
		 	diferencia = tiempo_adherencia-tiempo_ideal;
		 	if(tiempo_ideal == 0)
		 		porc = 0;
		 	else
				porc = (tiempo_adherencia*100/tiempo_ideal).toFixed(2);
 			//flag_encontro = true;
 			if(horarioData != 0){
 				globalhorarioReal.splice(i,1);
 			} 
			break;
 		}
 	}

 	if(!flag_encontro){
	 	for(var i = 0;i<dataRealVibox.length;i++){
	 		//console.log(data[i],i);
	 		if(dataRealVibox[i]["fecha"] == fecha && dataRealVibox[i]["operador"] == operador){
			 	tiempo_adherencia += (typeof(dataRealVibox) != "undefined") ? dataRealVibox[i]["real_segundos"]:0;
			 	total_adherencia = tiempo_adherencia.toHHMMSS();
			 	diferencia = tiempo_adherencia-tiempo_ideal;
				if(tiempo_ideal == 0)
			 		porc = 0;
			 	else
					porc = (tiempo_adherencia*100/tiempo_ideal).toFixed(2);
				if(parseInt(dataRealVibox[i]["id_campana"]) == 1){
					acum_validacionesManual += parseInt(dataRealVibox[i]["real_segundos"]);
					if(operadoresExcepciones.operadorValidacionesManual.indexOf(operador) < 0){
	 					//acum_permiso++;
	 					cantidadExcepciones.acumValidacionesManual++;
	 					operadoresExcepciones.operadorValidacionesManual.push(operador);
	 				}
				}
	 			flag_encontro = true;
				//break;
	 		}
	 	}
 	}

 	if(tiempo_ideal < tiempo_adherencia){
 		acum_sobreTiempo +=  tiempo_adherencia-tiempo_ideal;
 		if(operadoresExcepciones.operadorSobreTiempo.indexOf(operador) < 0){
			//acum_permiso++;
			cantidadExcepciones.acumSobreTiempo++;
			operadoresExcepciones.operadorSobreTiempo.push(operador);
		}
 	}
 	var flagAusentes = false;

 	if(tiempo_ideal > 0 && tiempo_adherencia == 0 && flag_excepciones == 0){
 		flag_excepciones = 6;
 		acum_ausentes+=tiempo_ideal;
 		texto = "Ausente "+tiempo_ideal.toHHMMSS();
 		flagAusentes = true;
 		if(operadoresExcepciones.operadorAusentes.indexOf(operador) < 0){
			cantidadExcepciones.acumAusentes++;
			operadoresExcepciones.operadorAusentes.push(operador)
		}
 	}

 	if(tiempo_ideal > tiempo_adherencia && flag_excepciones == 0){
 		flag_excepciones = 7;
 		acum_faltaHorario +=  tiempo_ideal-tiempo_adherencia;
 		if(operadoresExcepciones.operadorFaltaHorario.indexOf(operador) < 0){
			//acum_permiso++;
			cantidadExcepciones.acumFaltaHorario++;
			operadoresExcepciones.operadorFaltaHorario.push(operador);
		}
 	}

 	//texto para enviar a la vista como title
 	var texto = '';
 	if(flag_excepciones == 1)
 		texto = "Vacaciones";
 	if(flag_excepciones == 2)
 		texto = "Licencia";
 	if(flag_excepciones == 3)
 		texto = "Permiso de "+tiempo_permiso.toHHMMSS();
 	if(flag_excepciones == 4)
 		texto = "Recupero de "+tiempo_recupero.toHHMMSS();
 	if(flag_excepciones == 5)
 		texto = "Perm. Especial de  "+tiempo_permiso_esp.toHHMMSS();
 	if(flag_excepciones == 7)
 		texto = "No cumplio Horario ";


	ret = {"ideal":tiempo_ideal.toHHMMSS(),
				"real":total_adherencia,
				"real_sin_format":tiempo_adherencia,
				"diferencia":diferencia.toHHMMSS(),
				"diferencia_sin_format":diferencia,
				"porcentaje":porc,
				"flag_excepciones":flag_excepciones,
				"texto":texto,
				"flagAusentes":flagAusentes
			};

 	sumHorarioGlobalDia(tiempo_ideal,fecha,tiempo_adherencia,tiempo_ideal_con_exep);
 	sumHorarioGlobalOperador(tiempo_ideal,operador,tiempo_adherencia,tiempo_ideal_con_exep);
 	sumHorarioGlobal(tiempo_ideal,tiempo_adherencia,tiempo_ideal_con_exep,tiempo_vacaciones,tiempo_licencias,tiempo_permiso,tiempo_recupero,acum_ausentes,tiempo_permiso_esp,acum_validacionesManual,acum_sobreTiempo,acum_faltaHorario);
	return ret;
 }

 function sumHorarioGlobalDia(tiempo_ideal,fecha,tiempo_adherencia,tiempo_ideal_con_exep){
 	if(typeof(diaGlobalHorario[fecha]) == "undefined"){
 		diaGlobalHorario[fecha] = {totalIdeal:0,totalIdealExce:0,totalAdhe:0,totalDif:0,totalPorc:0,totalDifExce:0,totalPorcExce:0,formatIdeal:'',formatIdealExce:'',formatAdhe:'',formatDif:'',formatDifExce:''};
	 }
 	diaGlobalHorario[fecha].totalIdeal += tiempo_ideal;
 	diaGlobalHorario[fecha].totalIdealExce += tiempo_ideal_con_exep;
 	diaGlobalHorario[fecha].totalAdhe += tiempo_adherencia;
 	diaGlobalHorario[fecha].totalDif = diaGlobalHorario[fecha].totalAdhe - diaGlobalHorario[fecha].totalIdeal;
 	diaGlobalHorario[fecha].totalDifExce = diaGlobalHorario[fecha].totalAdhe - diaGlobalHorario[fecha].totalIdealExce;
	diaGlobalHorario[fecha].totalPorc = (diaGlobalHorario[fecha].totalIdeal == 0) ? 0:(diaGlobalHorario[fecha].totalAdhe*100/diaGlobalHorario[fecha].totalIdeal).toFixed(2);
	diaGlobalHorario[fecha].totalPorcExce = (diaGlobalHorario[fecha].totalIdealExce == 0) ? 0:(diaGlobalHorario[fecha].totalAdhe*100/diaGlobalHorario[fecha].totalIdealExce).toFixed(2);

	diaGlobalHorario[fecha].formatIdeal = diaGlobalHorario[fecha].totalIdeal.toHHMMSS();
	diaGlobalHorario[fecha].formatIdealExce = diaGlobalHorario[fecha].totalIdealExce.toHHMMSS();
	diaGlobalHorario[fecha].formatAdhe = diaGlobalHorario[fecha].totalAdhe.toHHMMSS();
	diaGlobalHorario[fecha].formatDif = diaGlobalHorario[fecha].totalDif.toHHMMSS();
	diaGlobalHorario[fecha].formatDifExce = diaGlobalHorario[fecha].totalDifExce.toHHMMSS();
 }

 function sumHorarioGlobalOperador(tiempo_ideal,operador,tiempo_adherencia,tiempo_ideal_con_exep){
 	if(typeof(globalHorarioOperador[operador]) == "undefined"){
 		globalHorarioOperador[operador] = {totalIdealExce:0,totalIdeal:0,totalAdhe:0,totalDif:0,totalPorc:0,totalPorcExce:0,formatIdeal:'',formatIdealExce:'',formatAdhe:'',formatDif:''};
	 }

 	globalHorarioOperador[operador].totalIdeal += tiempo_ideal;
 	globalHorarioOperador[operador].totalIdealExce += tiempo_ideal_con_exep;
 	globalHorarioOperador[operador].totalAdhe += tiempo_adherencia;
 	globalHorarioOperador[operador].totalDif = globalHorarioOperador[operador].totalAdhe - globalHorarioOperador[operador].totalIdeal;
	globalHorarioOperador[operador].totalPorc = (globalHorarioOperador[operador].totalIdeal == 0) ? 0:(globalHorarioOperador[operador].totalAdhe*100/globalHorarioOperador[operador].totalIdeal).toFixed(2);
	globalHorarioOperador[operador].totalPorcExce = (globalHorarioOperador[operador].totalIdealExce == 0) ? 0:(globalHorarioOperador[operador].totalAdhe*100/globalHorarioOperador[operador].totalIdealExce).toFixed(2);

	globalHorarioOperador[operador].formatIdeal = globalHorarioOperador[operador].totalIdeal.toHHMMSS();
	globalHorarioOperador[operador].formatIdealExce = globalHorarioOperador[operador].totalIdealExce.toHHMMSS();
	globalHorarioOperador[operador].formatAdhe = globalHorarioOperador[operador].totalAdhe.toHHMMSS();
	globalHorarioOperador[operador].formatDif = globalHorarioOperador[operador].totalDif.toHHMMSS();
 }

 function sumHorarioGlobal(tiempo_ideal,tiempo_adherencia,tiempo_ideal_con_exep,tiempo_vacaciones,tiempo_licencias,tiempo_permiso,tiempo_recupero,tiempo_ausentes,tiempo_permiso_esp,tiempo_validacionesManual,tiempo_sobreTiempo,tiempo_faltaHorario){

 	globalHorario.totalIdeal += tiempo_ideal;
 	globalHorario.totalIdealExce += tiempo_ideal_con_exep;
 	globalHorario.totalVacaciones += tiempo_vacaciones;
 	globalHorario.totalLicencia += tiempo_licencias;
 	globalHorario.totalPermisos += tiempo_permiso;
 	globalHorario.totalRecupero += tiempo_recupero;
 	globalHorario.totalAusentes += tiempo_ausentes;
 	globalHorario.totalPermisosEsp += tiempo_permiso_esp;
 	globalHorario.totalValidacionesManual += tiempo_validacionesManual;
 	globalHorario.totalSobreTiempo += tiempo_sobreTiempo;
 	globalHorario.totalFaltaHorario += tiempo_faltaHorario;
 	globalHorario.totalAdhe += tiempo_adherencia;
 	globalHorario.totalDif = globalHorario.totalAdhe - globalHorario.totalIdeal;
	globalHorario.totalPorc = (globalHorario.totalIdeal == 0) ? 0:(globalHorario.totalAdhe*100/globalHorario.totalIdeal).toFixed(2);
	globalHorario.totalPorcExce = (globalHorario.totalIdealExce == 0) ? 0:(globalHorario.totalAdhe*100/globalHorario.totalIdealExce).toFixed(2);

	globalHorario.formatIdeal = globalHorario.totalIdeal.toHHMMSS();
	globalHorario.formatIdealExce = globalHorario.totalIdealExce.toHHMMSS();
	globalHorario.formatAdhe = globalHorario.totalAdhe.toHHMMSS();
	globalHorario.formatDif = globalHorario.totalDif.toHHMMSS();
	globalHorario.formatVacaciones = globalHorario.totalVacaciones.toHHMMSS();
	globalHorario.formatLicencia = globalHorario.totalLicencia.toHHMMSS();
	globalHorario.formatPermisos = globalHorario.totalPermisos.toHHMMSS();
	globalHorario.formatPermisosEsp = globalHorario.totalPermisosEsp.toHHMMSS();
	globalHorario.formatRecupero = globalHorario.totalRecupero.toHHMMSS();
	globalHorario.formatAusentes = globalHorario.totalAusentes.toHHMMSS();
	globalHorario.formatValidacionesManual = globalHorario.totalValidacionesManual.toHHMMSS();
	globalHorario.formatSobreTiempo = globalHorario.totalSobreTiempo.toHHMMSS();
	globalHorario.formatFaltaHorario = globalHorario.totalFaltaHorario.toHHMMSS();
 }

 function predicatBy(prop){
   return function(a,b){
      if( parseFloat(a[prop]) < parseFloat(b[prop])){
          return 1;
      }else if( parseFloat(a[prop]) > parseFloat(b[prop]) ){
          return -1;
      }
      return 0;
   }
}

Number.prototype.toHHMMSS = function () {
	var flagNegative = false;
    var sec_num = parseInt(this, 10); // don't forget the second param
    if(sec_num < 0){
		flagNegative = true;
		sec_num = Math.abs(sec_num);
    }
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return (flagNegative) ? '-'+hours+':'+minutes+':'+seconds : hours+':'+minutes+':'+seconds;
}

function implodeUser(user){
	var ret = "";
	for (var i = 0, len = user.length; i < len; i++) {
		if(i == 0){
			ret += "'"+user[i]+"'";
		}else{
			ret += ",'"+user[i]+"'";
		}
	}
	return ret;
}

function implodeUserSup(user,modo){
	var ret = "";
	for (var i = 0, len = user.length; i < len; i++) {
		if(i == 0){
			if(modo == 0)
				ret += "'"+user[i].us_sup_user+"'";
			else
				ret += "'"+user[i].user+"'";
		}else{
			if(modo == 0)
				ret += ",'"+user[i].us_sup_user+"'";
			else
				ret += ",'"+user[i].user+"'";
		}
	}
	return ret;
}

function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}

/****
	Recibe como parametros tanto las operadoras de Vicidial "operadoraVici"
	y las operadora Vibox "operadoraVibox"

	@return Retorna una metriz mezclada de operadoras Vibox x Vicidial
***/
function mergeOperador(operadoraVici,operadoraVibox){
	var operadoras = [];
	for (var i = 0; i < operadoraVici.length; i++) {
		operadoras.push(operadoraVici[i]["user"]);
	}
	for (var i = 0; i < operadoraVibox.length; i++) {
		if(operadoras.indexOf(operadoraVibox[i]["operador"]) >= 0){ //ENCONTRO LA FECHA
 			continue;
 		}
 		operadoras.push(operadoraVibox[i]["operador"])
	}
	operadoras.sort(function(a,b){
	    if(a < b) return -1;
	    if(a > b) return 1;
	    return 0;
	});

	return operadoras;
}

function extractUserIdeal(dataIdealVibox,arrUsers){
	for (var i = 0; i < dataIdealVibox.length; i++) {
		if(arrUsers.indexOf(dataIdealVibox[i]["user"]) >= 0)
			continue;
		arrUsers.push(dataIdealVibox[i]["user"]);
	}
	return arrUsers;
}

function implodeClientesExterno(dataCliente){
	var strRet = "";
	for (var i = 0; i < dataCliente.length; i++) {
		strRet += (i==0) ? dataCliente[i].cliente_id: ","+dataCliente[i].cliente_id;
	}

	return strRet;
}

function implodeClientesExternoServicio(dataCliente){
	var strRet = "";
	for (var i = 0; i < dataCliente.length; i++) {
		strRet += (i==0) ? dataCliente[i].servicio_id: ","+dataCliente[i].servicio_id;
	}

	return strRet;
}

function implodeCampaign(data){
	var strRet = "";
	for (var i = 0; i < data.length; i++) {
		strRet += (i==0) ? "'"+data[i].campaign_id+"'": ",'"+data[i].campaign_id+"'";
	}

	return strRet;
}

function mergeHorarioOperador(dataIdealVicidial,dataIdealVibox){
	var arrIdealTotal = [];
	var tmpIdealVicidial = dataIdealVicidial;
	var usuario = "";
	var flagUsuario = false;
	for (var j = 0; j < dataIdealVicidial.length; j++) {
		flagUsuario = true;
		arrIdealTotal.push({usuario_codigo:dataIdealVicidial[j].user
							,opt_fec_fecha:dataIdealVicidial[j].hop_fecha
							,ideal_segundos:dataIdealVicidial[j].total_ideal,
							ideal:dataIdealVicidial[j].ideal});
	}
	//RECORREMOS NUEVAMENTE PARA VER IDEALES DE VICIDIAL, QUE NO ESTEN EN VIBOX
	return arrIdealTotal;
}

function formatExecepcionesOperador(dataExcepcion){
	var arrRet = {};
	var user_current = "";
	var fecha_current;
	var interior = [];
	for (var i = 0; i < dataExcepcion.length; i++) {
		if(user_current == "" ||  user_current != dataExcepcion[i].user){
			user_current = dataExcepcion[i].user;
			arrRet[user_current] = {};
		}
		if(typeof(arrRet[user_current][dataExcepcion[i].hop_fecha]) == "undefined"){ // INICIALIZAMOS LA FECHA POR USUARIO PARA ADJUNTAR EL DETALLE
			arrRet[user_current][dataExcepcion[i].hop_fecha] = [];
		}
		arrRet[user_current][dataExcepcion[i].hop_fecha].push({
			hop_inicio:dataExcepcion[i].hop_inicio,
			hop_termino:dataExcepcion[i].hop_termino,
			tho_id:dataExcepcion[i].tho_id,
			supervisor:dataExcepcion[i].sup_usuario,
			hop_segundos:dataExcepcion[i].hop_segundos
		});
	}
	return arrRet;
}

function formatArrHorarioEntrada(dataHorarioEntrada){
	var arrHorarioEntrada = {};
	for (var i = 0; i < dataHorarioEntrada.length; i++) {
		arrHorarioEntrada[dataHorarioEntrada[i].user] = {'horario_entrada':dataHorarioEntrada[i].horario_entrada,'horario_salida':dataHorarioEntrada[i].horario_salida};
	}

	return arrHorarioEntrada;	
}

function formatHorarioSemana(dataHorarioSemana){
	var arrHorarioSemana = {};
	for(var i=0; i < dataHorarioSemana.length;i++){
		if(typeof(arrHorarioSemana[dataHorarioSemana[i].ophs_usuario_codigo]) == "undefined"){
			arrHorarioSemana[dataHorarioSemana[i].ophs_usuario_codigo] = [];
		}
		arrHorarioSemana[dataHorarioSemana[i].ophs_usuario_codigo].push(dataHorarioSemana[i]);
	}

	return arrHorarioSemana;

}

function addEstadoAdherencia(arrHorarioSemana, dataHorario,fecha){
	Object.keys(dataHorario).forEach(function(operador){
		estado = getEstadoAdherencia(arrHorarioSemana,operador)
		if(typeof(dataHorario[operador][fecha]) != "undefined")
			dataHorario[operador][fecha].estado_adherencia = estado;
	});
	return dataHorario;
}

function getEstadoAdherencia(arrHorarioSemana,operador){
	var fecha_current = new Date();
	var time = "";
		time += (fecha_current.getHours() < 10) ? "0"+fecha_current.getHours().toString():fecha_current.getHours().toString();
		time += (fecha_current.getMinutes() < 10) ? "0"+fecha_current.getMinutes().toString():fecha_current.getHours().toString();
		time += (fecha_current.getSeconds() < 10) ? "0"+fecha_current.getSeconds().toString():fecha_current.getHours().toString();
	var flag_noentro = true;
	var flag_trabajando = false;
	var flag_termino = false;
	var flag_libre = false;
	if(typeof(arrHorarioSemana[operador]) != "undefined"){
		for(var i=0;i<arrHorarioSemana[operador].length;i++){
			var tiempo_horario_entrada = arrHorarioSemana[operador][i].ophs_hora_entrada.split(":");
			var tiempo_horario_salida = arrHorarioSemana[operador][i].ophs_hora_fin.split(":");
			var tiempo_entrada = tiempo_horario_entrada[0]+tiempo_horario_entrada[1]+tiempo_horario_entrada[2];
			var tiempo_salida = tiempo_horario_salida[0]+tiempo_horario_salida[1]+tiempo_horario_salida[2];
			if(time < tiempo_entrada && flag_noentro){
				return "Por comenzar";
			}
			if(time < tiempo_entrada && !flag_noentro){
				return "Ventana";
			}
			if(time >= tiempo_entrada && time <= tiempo_salida){
				flag_trabajando = true;
				flag_noentro = false;
				return "Trabajando";
			}
			if(time > tiempo_salida){
				flag_noentro = false;
				flag_termino = true;
			}
		}
		if(flag_termino){
			return "Terminado";
		}
	}else{
		return "Horario no definido";
	}
}

function addRecorridos(arrSiodial,llamados_totales){
	var acum_penetrados = 0;
	var acum_porc_recorridos = 0;
	var cantidadTabla = arrSiodial.tabla.length;
	var total_llamados = arrSiodial.totales.total_llamado;
	var split_hour = arrSiodial.totales.tiempo.split(":");
	var hours = parseInt(split_hour[0]);
	var cantidadTotalRecorridos = Math.round((llamados_totales-total_llamados)/hours);
	
	_.forEach(arrSiodial.tabla,function(value,key){
		var cantidad_recorridos = 0;
		var split_hour_op = arrSiodial.tabla[key].tiempo.split(":");
		var hours_op = parseFloat(split_hour_op[0]+"."+split_hour_op[1]);
		cantidad_recorridos = parseInt((cantidadTotalRecorridos*hours_op)+arrSiodial.tabla[key].llamados);
		var porc_reco = parseFloat((arrSiodial.tabla[key].llamados*100)/cantidad_recorridos).toFixed(2);
		arrSiodial.tabla[key].recorridos = cantidad_recorridos;
		arrSiodial.tabla[key].porc_recorridos = porc_reco;
		acum_penetrados += cantidad_recorridos;
		acum_porc_recorridos += parseFloat(porc_reco);
	});
	arrSiodial.totales.total_recorridos = acum_penetrados;
	arrSiodial.totales.promedio_recorridos = parseFloat(acum_porc_recorridos/cantidadTabla).toFixed(2);
	return arrSiodial;
}

function extractAnis(data){
	var arrFormatAnis = [];
	_.forEach(data,function(ani,key){
		arrFormatAnis.push(ani.id_ani);
	});

	return arrFormatAnis;
}

function ordenarAgendamiento(agendaHermes, agendaVibox){
	var total = [];
	_.forEach(agendaHermes,function(hermes, key){
		_.forEach(agendaVibox,function(vibox, key){
			if(hermes.id_ani == vibox.id_ani){
				//TODO: Cambiar obs a hermes
				var data={
					'operador':vibox.operador,
					'id_ani':vibox.id_ani,
					'rut_cliente':vibox.rut_cliente,
					'ani':vibox.ani,
					'nombre':vibox.nombre,
					'direccion':vibox.direccion,
					'comuna':vibox.comuna,
					'observacion':vibox.observacion,
					'fecha_creacion': hermes.fecha_creacion,
					'fecha':hermes.fecha,
					'hora':hermes.hora,
					'telefono_recuperado':vibox.ani_nuevo,
					'estado':hermes.ag_estado,
					'fecha_llamado':hermes.fecha_llamado,
					'agenda_id':hermes.ag_agenda_id,
					'lead_id':hermes.lead_id
				}
				total.push(data);
			}
		});
	});

	return total;

};

function formatUsuarioClienteServicio(dataUsuario){
	var arrFormat = {};
	_.forEach(dataUsuario,function(value,key){
		arrFormat[value.user] = value;
	});

	return arrFormat;
}

function listFechaProduccion(dataVicidial, dataVibox){
	var list = [];
	_.forEach(dataVicidial, function(vic, key){
		if(list.indexOf(vic.fecha) >= 0){ //ENCONTRO LA FECHA
 			var a=1;
 		}else{
			list.push(vic.fecha);
 		}
	});
	_.forEach(dataVibox, function(vib, key){
		if(list.indexOf(vib.fecha) >= 0){ //ENCONTRO LA FECHA
 			var a=1;
 		}else{
			list.push(vib.fecha);
 		};
	});

	return list;
}

function sort_unique(arr) {
    return arr.filter(function(el,i,a) {
        return (i==a.indexOf(el));
    });
}

function listClienteServicioVicidial(data){
	var list = [];
	var cli = '';
	var ser = '';
	_.forEach(data, function(vic, key){
		if(cli != vic.cvr_id_cliente || ser != vic.cvr_id_servicio){
			list.push({cliente:vic.cliente, id_cliente:vic.cvr_id_cliente, servicio:vic.servicio, id_servicio:vic.cvr_id_servicio});
			cli = vic.cvr_id_cliente;
			ser = vic.cvr_id_servicio;
		}
	});
	return list;
}

function listClienteServicioVibox(data){
	var list = [];
	var cli = '';
	var ser = '';
	_.forEach(data, function(vib, key){
		if(cli != vib.id_cliente || ser != vib.id_servicio){
			list.push({cliente:vib.cliente, id_cliente:vib.id_cliente, servicio:vib.servicio, id_servicio:vib.id_servicio});
			cli = vib.id_cliente;
			ser = vib.id_servicio;
		}
	});
	return list;
}

function formatListProduccion(fechas, dataList, clienteServicio){
	var list = {};
	_.forEach(clienteServicio, function(value, key){
		var cont = {};
		var total = {efectivos:0, produccion: 0};
		_.forEach(fechas,function(fecha, key_fecha){
			var data = {cliente:value.id_cliente, servicio:value.id_servicio, fecha: fecha}
			_.forEach(dataList,function(reg, key_fecha){
				if(data.cliente == reg.cvr_id_cliente && data.servicio == reg.cvr_id_servicio && data.fecha == reg.fecha){
					data.flag = true;
					data.efectivos = parseInt(reg.efectivos);
					data.produccion = parseFloat(reg.produccion);
					total.efectivos += parseInt(reg.efectivos);
					total.produccion += parseFloat(reg.produccion);
				}
			});
			cont[fecha] = data;
		});
		var cliServ=value.cliente +" "+ value.servicio;
		list[cliServ] = {data: cont, totales:total};
	})
	return list;
}

function formatListProduccionCosto(fechas, dataList, clienteServicio){
	var list = {};
	_.forEach(clienteServicio, function(value, key){
		var cont = {};
		var total = {efectivos:0, produccion: 0};
		_.forEach(fechas,function(fecha, key_fecha){
			var data = {cliente:value.id_cliente, servicio:value.id_servicio, fecha: fecha}
			_.forEach(dataList,function(reg, key_fecha){
				var interior = {}

				if(data.cliente == reg.cvr_id_cliente && data.servicio == reg.cvr_id_servicio && data.fecha == reg.fecha){
					interior.flag = true;
					interior.efectivos = parseInt(reg.efectivos);
					interior.produccion = parseInt(reg.produccion);
					total.efectivos += parseInt(reg.efectivos);
					total.produccion += parseInt(reg.produccion);
					data[reg.operador] = interior;
				}
			});
			sep_fecha = fecha.split('/');
			keyKey = sep_fecha[2]+"-"+sep_fecha[1]+"-"+sep_fecha[0];
			cont[keyKey] = data;
		});
		list = {data: cont, totales:total};
	})
	return list;
}

function formatListaValorVibox(listEfectivos, listVibox){
	var list = [];
	_.forEach(listVibox, function(value, key){
		var reg = {cvr_id_cliente:value.id_cliente, cvr_id_servicio:value.id_servicio, efectivos: 0, produccion:0};
		_.forEach(listEfectivos, function(data, key_cvr){
			if(reg.cvr_id_cliente == data.cvr_id_cliente && reg.cvr_id_servicio==data.cvr_id_servicio){
				reg.efectivos = value.efectivos;
				reg.produccion = (parseInt(value.efectivos)*parseInt(data.cvr_valorRegistro));
				reg.fecha = value.fecha;
				reg.operador = value.operador;
			}
		});
		list.push(reg);
	});
	return list;
}

function listarDiasEntreFechas(d, fecha){
	var listFecha = [];
	var Fecha = new Date();
	var sFecha = fecha || (Fecha.getDate() + "/" + (Fecha.getMonth() +1) + "/" + Fecha.getFullYear());
	var sep = sFecha.indexOf('/') != -1 ? '/' : '-'; 
	var aFecha = sFecha.split(sep);
	var fecha = aFecha[2]+'/'+aFecha[1]+'/'+aFecha[0];
	listFecha.push(fecha);
	fecha= new Date(fecha);
	for(c=0; c<d; c++){
		fecha.setDate(fecha.getDate()+parseInt(1));
		var anno=fecha.getFullYear();
		var mes= fecha.getMonth()+1;
		var dia= fecha.getDate();
		mes = (mes < 10) ? ("0" + mes) : mes;
		dia = (dia < 10) ? ("0" + dia) : dia;
		var fechaFinal = anno+sep+mes+sep+dia;
		listFecha.push(fechaFinal);
	}
	return listFecha;
}

function diferenciaHoras(inicio, fin){
	var fechaInicio = Date.parse(inicio);
	var fechaFin = Date.parse(fin);
	console.log(fechaInicio);
	var dif= fechaFin - fechaInicio; // diferencia en milisegundos
	var difSeg = Math.floor(dif/1000); //diferencia en segundos
	var segundos = difSeg % 60; //segundos
	var difMin = Math.floor(difSeg/60); //diferencia en minutos
	var minutos = difMin % 60; //minutos
	var difHs = Math.floor(difMin/60); //diferencia en horas
	var horas = difHs % 24; //horas
	return horas+":"+minutos+":"+segundos;
}

function formatoInsertIncidencia(ejecutivo,data){
	var flag = true;
	var recupero = false;
	var insert = "";
	var hora_inicio = (data['filtro'].hasOwnProperty('h_begin')) ? data['filtro'].h_begin : '00:00:00';
	var hora_fin =  (data['filtro'].hasOwnProperty('h_end')) ? data['filtro'].h_end : '23:59:59';
	var segundos =  data['segundos'];
	_.forEach(data['fechas'], function(fecha, key){
		/*TIPOS:
		*	3	Licencia
		*	4	Vacaciones
		*	32	Permiso
		*	33	Validacion
		*	34	Validacion al 100%
		*/

		if(data['tipo'] == 3 || data['tipo'] == 4 || data['tipo'] == 32){
		//SUMA A HORARIO IDEAL
			if(flag){
				insert = "INSERT INTO hermes.horario_operadora_excepciones (vicu_user_id, sup_usuario, hop_fecha, hop_inicio, hop_termino,\
				hop_segundos, tho_id, bop_id_bitacora_operadora) VALUES ";
				flag = false;
			} else {
				insert += ",";
			}


			if(data['tipo'] == 3 || data['tipo'] == 4){
				var excepcion = (data['tipo'] == 4) ? 6 : 5;
				var segundos = 36399;
			}else if(data['tipo'] == 32){
				var segundos =  data['segundos'];

				/*PERMISOS
					1	Con Recupero
					2	Legal
					3	Sin Recupero
				*/
				if(data['filtro'].permiso == 3)
					var excepcion = 3;
				else if(data['filtro'].permiso == 2)
					var excepcion = 7;
				else if(data['filtro'].permiso == 1){
					var excepcion = 2;
					recupero = true;
				}
			}
		}else{
		//SUMA A HORARIO REAL
			var segundos =  data['segundos'];
			if(flag){
				insert = "INSERT INTO hermes.horario_operador_validado (user_id, sup_usuario, hov_fecha, hov_inicio, hov_fin, hov_segundos,\
				tho_id, bop_id_bitacora_operadora) VALUES ";
				flag = false;
			} else
				insert += ",";
			var excepcion = 8;
		}
		insert += "("+ejecutivo+", '"+data.supervisor+"', '"+fecha+"', '"+hora_inicio+"', '"+hora_fin+"', "+segundos+", "+excepcion+", "+data.id_bitacora+") ";
	});
	return {insert:insert,recupero:recupero};
}

function formatTotalesDiasProduccion(list){
	var total = {};
	_.forEach(list['fechas'], function(fecha, key){
		var data = {fecha: fecha, efectivos: 0, produccion:0}
		_.forEach(list['datosVicidial'], function(vici, key){
			if(vici.data[fecha].fecha == data.fecha && typeof(vici.data[fecha].efectivos) != 'undefined' && typeof(vici.data[fecha].produccion) != 'undefined'){
				data.efectivos += parseInt(vici.data[fecha].efectivos);
				data.produccion += parseInt(vici.data[fecha].produccion);
			}

		});

		_.forEach(list['datosVibox'], function(vibox, key){
			if(vibox.data[fecha].fecha == data.fecha && typeof(vibox.data[fecha].efectivos) != 'undefined' && typeof(vibox.data[fecha].produccion) != 'undefined'){
				data.efectivos += parseInt(vibox.data[fecha].efectivos);
				data.produccion += parseInt(vibox.data[fecha].produccion);
			}
		});

		total[fecha] = data;
	});
	return total;
}

function formatTotalFinalProduccion(list){
	var total = {efectivos: 0, produccion:0}
	_.forEach(list, function(data, value){
		if(typeof(data.efectivos) != 'undefined' && typeof(data.produccion) != 'undefined'){
			total.efectivos += parseInt(data.efectivos);
			total.produccion += parseInt(data.produccion);
		}
	});

	return total;
}

function formatHoraATiempo(hora){
	var sep = hora.split(":");
	sep[0] = sep[0]*60*60;
	sep[1] = sep[1]*60;

	var tiempo = parseInt(sep[0]+sep[1]);

	return tiempo;
}

function implodeEjecutivos(ejec){
	var ret = "";
	for (var i = 0, len = ejec.length; i < len; i++) {
		if(i == 0){
			ret += "'"+ejec[i].user+"'";
		}else{
			ret += ",'"+ejec[i].user+"'";
		}
	}
	return ret;
}

function implodeIDEjecutivos(ejec){
	var ret = "";
	for (var i = 0, len = ejec.length; i < len; i++) {
		if(i == 0){
			ret += "'"+ejec[i].user_id+"'";
		}else{
			ret += ",'"+ejec[i].user_id+"'";
		}
	}
	return ret;
}

function formatSegundoHora(time){
	var hours = Math.floor( parseInt(time) / 3600 );  
	var minutes = Math.floor( (parseInt(time) % 3600) / 60 );
	var seconds = parseInt(time) % 60;
	hours = hours < 10 ? '0' + hours : hours;
	//Anteponiendo un 0 a los minutos si son menos de 10 
	minutes = minutes < 10 ? '0' + minutes : minutes;

	//Anteponiendo un 0 a los segundos si son menos de 10 
	seconds = seconds < 10 ? '0' + seconds : seconds;

	var result = hours + ":" + minutes + ":" + seconds;

	return result;
}

function formatHorarioReal(dataVibox,dataVicidial){
	var format = {};
	_.forEach(dataVibox,function(vibox,key){
		if(typeof(format[vibox["operador"]]) == "undefined"){
			format[vibox["operador"]] = {};
		}
		if(typeof(format[vibox["operador"][vibox["fecha"]]]) == "undefined"){
			format[vibox["operador"]][vibox["fecha"]] = {};
		}

		format[vibox["operador"]][vibox["fecha"]] = {fecha:vibox["fecha"],operador:vibox["operador"],segundos:vibox["real_segundos"],format:parseInt(vibox["real_segundos"]).toHHMMSS()};
	});

	_.forEach(dataVicidial,function(vici,key){
		if(typeof(format[vici["mpr_user"]]) == "undefined"){
			format[vici["mpr_user"]] = {};
		}
		if(typeof(format[vici["mpr_user"][vici["mpr_date"]]]) == "undefined"){
			format[vici["mpr_user"]][vici["mpr_date"]] = {};
		}

		format[vici["mpr_user"]][vici["mpr_date"]] = {fecha:vici["mpr_date"],operador:vici["mpr_user"],segundos:vici["second_adhe"],format:parseInt(vici["second_adhe"]).toHHMMSS()};
	});

	return format;
}

function formatCosto(dataHH,dataProd,sueldo){
	var valor_hora = Math.round(sueldo/180);
	var costos = {};
	_.forEach(dataHH,function(data,operador){
		_.forEach(data,function(detalle,fecha){
			var horas_trabajadas = detalle.segundos/3600;
			var valor_por_hora = valor_hora*horas_trabajadas;
			if(typeof(dataProd.data[fecha][operador]) == "undefined")
				return; //sino esta lo salta
			var costo = 0;
			if(dataProd.data[fecha][operador].efectivos == 0){
				costo =Math.round((valor_por_hora+dataProd.data[fecha][operador].produccion));
			}else{
				costo =  Math.round((valor_por_hora+dataProd.data[fecha][operador].produccion)/dataProd.data[fecha][operador].efectivos);
			}
			if(typeof(costos[operador]) == "undefined")
				costos[operador] = {};
			if(typeof(costos[operador][fecha]) == "undefined")
				costos[operador][fecha] = {};

			costos[operador][fecha] = {costo:costo};
		});
	});
	return costos;
}

function formatCostoGlobales(dataHH,dataProd,sueldo){
	var valor_hora = Math.round(sueldo/180);
	console.log("HORA",valor_hora);
	var costosGlobales = {};
	costosGlobales["global"] = {produccion:0,efectivos:0,tiempo:0,tiempo_format:'',costo:0};
	_.forEach(dataHH,function(data,operador){
		if(typeof(costosGlobales[operador]) == "undefined")
			costosGlobales[operador] = {produccion:0,efectivos:0,tiempo:0,tiempo_format:'',costo:0};
		_.forEach(data,function(detalle,fecha){
			var horas_trabajadas = detalle.segundos/3600;
			var valor_por_hora = valor_hora*horas_trabajadas;
			//console.log(dataProd.data[fecha],fecha,operador)
			if(typeof(dataProd.data[fecha][operador]) == "undefined")
				return; //sino esta lo salta

			var costo = 0;
			if(dataProd.data[fecha][operador].efectivos == 0){
				costo =Math.round((valor_por_hora+dataProd.data[fecha][operador].produccion));
			}else{
				costo =  Math.round((valor_por_hora+dataProd.data[fecha][operador].produccion)/dataProd.data[fecha][operador].efectivos);
			}
			//var costo = Math.round((valor_por_hora+dataProd.data[fecha][operador].produccion)/dataProd.data[fecha][operador].efectivos);
			if(typeof(costosGlobales[fecha]) == "undefined")
				costosGlobales[fecha] = {produccion:0,efectivos:0,tiempo:0,tiempo_format:'',costo:0};
			//sumandoooooo
			costosGlobales[operador].produccion += dataProd.data[fecha][operador].produccion;
			costosGlobales[operador].efectivos += dataProd.data[fecha][operador].efectivos;
			costosGlobales[operador].tiempo += detalle.segundos;
			if(costosGlobales[operador].efectivos == 0)
				costosGlobales[operador].costo = Math.round((valor_hora*(costosGlobales[operador].tiempo/3600)+costosGlobales[operador].produccion));
			else
				costosGlobales[operador].costo = Math.round((valor_hora*(costosGlobales[operador].tiempo/3600)+costosGlobales[operador].produccion)/costosGlobales[operador].efectivos);
			costosGlobales[operador].tiempo_format = costosGlobales[operador].tiempo.toHHMMSS();

			costosGlobales[fecha].produccion += dataProd.data[fecha][operador].produccion;
			costosGlobales[fecha].efectivos += dataProd.data[fecha][operador].efectivos;
			costosGlobales[fecha].tiempo += detalle.segundos;
			if(costosGlobales[fecha].efectivos == 0)
				costosGlobales[fecha].costo = Math.round((valor_hora*(costosGlobales[fecha].tiempo/3600)+costosGlobales[fecha].produccion));
			else
				costosGlobales[fecha].costo = Math.round((valor_hora*(costosGlobales[fecha].tiempo/3600)+costosGlobales[fecha].produccion)/costosGlobales[fecha].efectivos);
			costosGlobales[fecha].tiempo_format = costosGlobales[fecha].tiempo.toHHMMSS();

			costosGlobales["global"].produccion += dataProd.data[fecha][operador].produccion;
			costosGlobales["global"].efectivos += dataProd.data[fecha][operador].efectivos;
			costosGlobales["global"].tiempo += detalle.segundos;
			costosGlobales["global"].tiempo_format = costosGlobales["global"].tiempo.toHHMMSS();
			if(costosGlobales["global"].efectivos == 0)
				costosGlobales["global"].costo = Math.round((valor_hora*(costosGlobales["global"].tiempo/3600)+costosGlobales["global"].produccion));
			else
				costosGlobales["global"].costo = Math.round((valor_hora*(costosGlobales["global"].tiempo/3600)+costosGlobales["global"].produccion)/costosGlobales["global"].efectivos);
		});
	});
	return costosGlobales;
}

//FALTA asignar por operador las horas
// sumar el tiempo que esta cada operador en esas horas
function separaHorasOperador(data){
	var arrFormatSeparar = {tabla:{}};
	_.forEach(data,function(horario,key){
		if(typeof(arrFormatSeparar[horario.user]) == "undefined")
			arrFormatSeparar[horario.user] = {};
		if(typeof(arrFormatSeparar[horario.user][horario.hop_fecha]) == "undefined")
			arrFormatSeparar[horario.user][horario.hop_fecha] = {};
		if(typeof(arrFormatSeparar.tabla[horario.hop_fecha]) == "undefined")
			arrFormatSeparar.tabla[horario.hop_fecha] = {"10":{},"11":{},"12":{},"13":{},"14":{},"15":{},"16":{},"17":{},
				"18":{},"19":{},"20":{}};

		var hora_inicio_sep = horario.hop_inicio.split(":");
		var hora_termino_sep = horario.hop_termino.split(":");
		var hora_inicio = hora_inicio_sep[0];
		var hora_termino = hora_termino_sep[0];
		var minuto_inicio = hora_inicio_sep[1];
		var minuto_termino = hora_termino_sep[1];
		for(var i=parseInt(hora_inicio);i<=parseInt(hora_termino);i++){
			if((parseInt(minuto_termino) > 0 && i == hora_termino) || i < hora_termino){
				var tiempo = 0;
				if(i == parseInt(hora_inicio)){
					var minuto = parseInt(minuto_inicio);
					if(minuto > 0){
						tiempo = (60-minuto) * 60;
					}else{
						tiempo = 3600;
					}
					arrFormatSeparar[horario.user][horario.hop_fecha][i] = tiempo;
				}else if(i == parseInt(hora_termino)){
					minuto_end = parseInt(minuto_termino);
					if(minuto_end > 0){
						tiempo = minuto_end * 60;
					}else{
						tiempo = 3600;
					}
					arrFormatSeparar[horario.user][horario.hop_fecha][i] = tiempo;
				}else{
					tiempo = 3600;
					arrFormatSeparar[horario.user][horario.hop_fecha][i] = tiempo;
				}
			}	
		}
	});

	return arrFormatSeparar;
}

function mezclarHorasHorarioOperador(dataHoras, dataTabla){
	_.forEach(dataTabla,function(horas,fecha){
		_.forEach(horas,function(valor,hora){
			dataTabla[fecha][hora] = {cantidad_usuarios:0,tiempo:0,tiempo_format:'',usuarios:[]};
			_.forEach(dataHoras,function(valores,usuario){
				if(typeof(valores[fecha]) != "undefined"){
					if(typeof(valores[fecha][hora]) != "undefined"){
						dataTabla[fecha][hora].cantidad_usuarios++;
						dataTabla[fecha][hora].tiempo += valores[fecha][hora];
						dataTabla[fecha][hora].tiempo_format = dataTabla[fecha][hora].tiempo.toHHMMSS();
						dataTabla[fecha][hora].usuarios.push(usuario);
					}
				}
			});
		});
	});
	return dataTabla;
}

function extractHeader(dataTabla){
	var formatHeader = {fechas:[],horas:[]};
	_.forEach(dataTabla,function(horas,fecha){
		formatHeader.fechas.push(fecha);
		_.forEach(horas,function(data,hora){
			if(formatHeader.horas.indexOf(hora) < 0)
				formatHeader.horas.push(hora);
		});
	});
	return formatHeader;
}

function cierreBitacora(){
	var cierre = [
		{name: '11', hora: '10:00:00'},
		{name: '12', hora: '11:00:00'},
		{name: '13', hora: '12:00:00'},
		{name: '14', hora: '13:00:00'},
		{name: '15', hora: '14:00:00'},
		{name: '16', hora: '15:00:00'},
		{name: '17', hora: '16:00:00'},
		{name: '18', hora: '17:00:00'},
		{name: '19', hora: '18:00:00'},
		{name: '20', hora: '19:00:00'},
		{name: '21', hora: '20:00:00'}
	]
	return cierre;
}

 exports.reFormatMedia = reFormatMedia;
 exports.addRecorridos = addRecorridos;
 exports.implodeUser = implodeUser;
 exports.implodeUserSup = implodeUserSup;
 exports.extractDateHH = extractDateHH;
 exports.formatHorarioOp = formatHorarioOp;
 exports.formatHorarioIdeal = formatHorarioIdeal;
 exports.mergeOperador = mergeOperador;
 exports.cuartilMedias = cuartilMedias;
 exports.extractUserIdeal = extractUserIdeal;
 exports.implodeClientesExterno = implodeClientesExterno;
 exports.implodeCampaign = implodeCampaign;
 exports.mergeHorarioOperador = mergeHorarioOperador;
 exports.formatExecepcionesOperador = formatExecepcionesOperador;
 exports.arrFechasNombre = arrFechasNombre;
 exports.formatArrHorarioEntrada = formatArrHorarioEntrada;
 exports.formatHorarioSemana = formatHorarioSemana;
 exports.addEstadoAdherencia = addEstadoAdherencia;
 exports.extractAnis = extractAnis;
 exports.ordenarAgendamiento = ordenarAgendamiento;
 exports.formatUsuarioClienteServicio = formatUsuarioClienteServicio;
 exports.listFechaProduccion = listFechaProduccion;
 exports.listClienteServicioVicidial = listClienteServicioVicidial;
 exports.listClienteServicioVibox = listClienteServicioVibox;
 exports.formatListProduccion = formatListProduccion;
 exports.sort_unique = sort_unique;
 exports.formatListaValorVibox = formatListaValorVibox;
 exports.listarDiasEntreFechas = listarDiasEntreFechas;
 exports.diferenciaHoras = diferenciaHoras;
 exports.formatoInsertIncidencia = formatoInsertIncidencia;
 exports.formatTotalesDiasProduccion = formatTotalesDiasProduccion;
 exports.formatTotalFinalProduccion = formatTotalFinalProduccion;
 exports.formatHoraATiempo = formatHoraATiempo;
 exports.implodeEjecutivos = implodeEjecutivos;
 exports.implodeIDEjecutivos = implodeIDEjecutivos;
 exports.formatSegundoHora = formatSegundoHora;
 exports.extractDateHHReal = extractDateHHReal;
 exports.formatHorarioReal = formatHorarioReal;
 exports.formatListProduccionCosto = formatListProduccionCosto;
 exports.formatCosto = formatCosto;
 exports.formatCostoGlobales = formatCostoGlobales;
 exports.separaHorasOperador = separaHorasOperador;
 exports.mezclarHorasHorarioOperador = mezclarHorasHorarioOperador;
 exports.extractHeader = extractHeader;
 exports.cierreBitacora = cierreBitacora;
 exports.implodeClientesExternoServicio = implodeClientesExternoServicio;