var helpers = require('./helpers');
var estados_tmo = [];

var cant_acum_cuartil1 = 0;
var cant_acum_cuartil2 = 0;
var cant_acum_cuartil3 = 0;
var cant_acum_cuartil4 = 0;

var acum_medias_cuatil1 = 0;
var acum_medias_cuatil4 = 0;

var prom_cuartil1 = 0;
var prom_cuartil4 = 0;

function reFormatMediasDomo(data_sioDial,data_vibox,data_tabla_domo_vi,flag_minimo,tiempo_minimo,estados_contactados){
	limpiarGlobales();
	estados_tmo = [];
	var retornoMediasDomo = helpers.reFormatMedia(data_sioDial,data_vibox,true,null,flag_minimo,parseInt(tiempo_minimo),estados_contactados);
	console.log("retornoMediasDomo.media",retornoMediasDomo.media);
	if(typeof(retornoMediasDomo.media) != "undefined" && retornoMediasDomo.media.length > 0){
		var brecha = calcularBrechaCuartile(retornoMediasDomo.tabla);
		var arrTMO = formatTMO(data_sioDial,data_tabla_domo_vi);
		var pos_mediana = (retornoMediasDomo.media.length%2 != 0) ? (retornoMediasDomo.media.length+1)/2:retornoMediasDomo.media.length/2;
		if(retornoMediasDomo.media.length ==1)
			pos_mediana = 0;
		console.log("pos_mediana",pos_mediana);
		var mediana = retornoMediasDomo.media[pos_mediana].media;

		return {valido:true,medias:retornoMediasDomo,tmo:arrTMO,estado_tmo:estados_tmo,brecha:parseFloat(brecha),prom_cuart1:parseFloat(prom_cuartil1),
					prom_cuart4:parseFloat(prom_cuartil4),tot_mediana:mediana,
					graficoCuartiles:{labels:["Cuartil 1","Cuartil 2","Cuartil 3","Cuartil 4"],value:[cant_acum_cuartil1,cant_acum_cuartil2,cant_acum_cuartil3,cant_acum_cuartil4]}
				};	
	}else{
		return {valido:false};
	}
}

function formatTMO(data_sioDial,data_vibox){
	var arrTMO = {tmoVicidial:{},tmoVibox:{}};
	arrTMO.tmoVibox = formatTMOVibox(data_vibox);
	arrTMO.tmoVicidial = formatTMOVicidial(data_sioDial);

	return arrTMO;
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

function formatTMOVibox(data_vibox){
	var user_current = estado_current = "";
	var acum_estado = acum_segundo = 0;
	var arrTmo = {};
	var interior = {}
	for (var i = 0,len = data_vibox.length; i < len; i++) {
		if(estados_tmo.indexOf(data_vibox[i].estado) == -1 && data_vibox[i].estado != ""){
			estados_tmo.push(data_vibox[i].estado);
		}
		if(user_current == ""){
			user_current = data_vibox[i].operador;
			estado_current = data_vibox[i].estado;
		}
		if(user_current == data_vibox[i].operador && estado_current != data_vibox[i].estado){
			interior[estado_current] = {cantidad:acum_estado,segundos:acum_segundo,segundos_format:acum_segundo.toHHMMSS()};
			estado_current = data_vibox[i].estado;
			acum_estado = acum_segundo = 0;
		}
		if(user_current != data_vibox[i].operador){
			interior[estado_current] = {cantidad:acum_estado,segundos:acum_segundo,segundos_format:acum_segundo.toHHMMSS()};
			arrTmo[user_current]= interior;
			interior = {}
			acum_estado = acum_segundo = 0;
			user_current = data_vibox[i].operador;
			estado_current = data_vibox[i].estado;
		}
		acum_estado += data_vibox[i].cantidad;
		acum_segundo += data_vibox[i].segundos;
		if(i == len-1){
			interior[estado_current] = {cantidad:acum_estado,segundos:acum_segundo,segundos_format:acum_segundo.toHHMMSS()};
			arrTmo[user_current]= interior;
			interior = {}
		}
	}
	return arrTmo;
}

function formatTMOVicidial(data_vicidial){
	var user_current = fecha_current = estado_current = "";
	var acum_estado = acum_segundo = 0;
	var arrTmo = {};
	var interior = {}
	var prom_segundo = 0;
	for (var i = 0,len = data_vicidial.length; i < len; i++) {
		if(estados_tmo.indexOf(data_vicidial[i].mpr_status) == -1 && data_vicidial[i].mpr_status != ""){
			estados_tmo.push(data_vicidial[i].mpr_status);
		}
		if(user_current == ""){
			user_current = data_vicidial[i].mpr_user;
			fecha_current = data_vicidial[i].mpr_date;
			estado_current = data_vicidial[i].mpr_status;
		}
		if(user_current == data_vicidial[i].mpr_user && estado_current != data_vicidial[i].mpr_status){
			prom_segundo = parseInt(acum_segundo/acum_estado);
			interior[estado_current] = {cantidad:acum_estado,segundos:prom_segundo,segundos_format:prom_segundo.toHHMMSS()};
			estado_current = data_vicidial[i].mpr_status;
			acum_estado = acum_segundo = 0;
		}
		if(user_current != data_vicidial[i].mpr_user){
			prom_segundo = parseInt(acum_segundo/acum_estado);
			interior[estado_current] = {cantidad:acum_estado,segundos:prom_segundo,segundos_format:prom_segundo.toHHMMSS()};
			arrTmo[user_current]= interior;
			interior = {}
			acum_estado = acum_segundo = 0;
			user_current = data_vicidial[i].mpr_user;
			fecha_current = data_vicidial[i].mpr_date;
			estado_current = data_vicidial[i].mpr_status;
		}
		acum_estado += data_vicidial[i].mpr_call;
		acum_segundo += data_vicidial[i].mpr_talk_sec;
		if(i == len-1){
			prom_segundo = parseInt(acum_segundo/acum_estado);
			interior[estado_current] = {cantidad:acum_estado,segundos:prom_segundo,segundos_format:prom_segundo.toHHMMSS()};
			arrTmo[user_current]= interior;
			interior = {}
		}
	}
	return arrTmo;
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


function implodeEstado(estados){
	var ret = "";
	for (var i = 0, len = estados.length; i < len; i++) {
		if(i == 0){
			ret += "'"+estados[i]+"'";
		}else{
			ret += ",'"+estados[i]+"'";
		}
	}
	return ret;
}

function implodeUsuarios(usuarios){
	var ret = "";
	for (var i = 0, len = usuarios.length; i < len; i++) {
		if(i == 0){
			ret += "'"+usuarios[i].user+"'";
		}else{
			ret += ",'"+usuarios[i].user+"'";
		}
	}
	return ret;
}

function calcularBrechaCuartile(data){
	for (var i = 0; i < data.length; i++) {
		switch(data[i].tramo){
			case 1:
				acum_medias_cuatil1 += parseFloat(data[i].media);
				cant_acum_cuartil1++;
				break;
			case 2:
				cant_acum_cuartil2++;
				break;
			case 3:
				cant_acum_cuartil3++;
				break;
			case 4:
				acum_medias_cuatil4 += parseFloat(data[i].media);
				cant_acum_cuartil4++;
				break;
			default:
				break;
		}
	}

	prom_cuartil4 = (acum_medias_cuatil4/cant_acum_cuartil4).toFixed(2);
	prom_cuartil1 = (acum_medias_cuatil1/cant_acum_cuartil1).toFixed(2);

	return (prom_cuartil1-prom_cuartil4).toFixed(2);
}

function limpiarGlobales(){
	cant_acum_cuartil1 = 0;
	cant_acum_cuartil2 = 0;
	cant_acum_cuartil3 = 0;
	cant_acum_cuartil4 = 0;

	acum_medias_cuatil1 = 0;
	acum_medias_cuatil4 = 0;

	prom_cuartil1 = 0;
	prom_cuartil4 = 0;
}

function formatArrFechaIngresos(data){
	var arrFechaIngresos = {};
	for (var i = 0; i < data.length; i++) {
		arrFechaIngresos[data[i].user] = {opc_fec_contrato:data[i].usde_fec_ingreso,opc_des_rut:data[i].usde_rut}
	}

	return arrFechaIngresos;
}

function formatArrPuntajes(dataPuntajes){
	var arrPuntajes = {};
	for (var i = 0; i < dataPuntajes.length; i++) {
		arrPuntajes[dataPuntajes[i].pu_puntaje.toFixed(2)] = dataPuntajes[i].pu_nota;
	}

	return arrPuntajes;
}

function formatArrIdealVibox(dataIdeal){
	var arrIdealVibox = {};
	for (var i = 0; i < dataIdeal.length; i++) {
		if(typeof(arrIdealVibox[dataIdeal[i].user]) == "undefined" )
			arrIdealVibox[dataIdeal[i].user] = {'ideal_segundos':0,'ideal':""};	
		//arrIdealVibox[dataIdeal[i].user] = {'ideal_segundos':dataIdeal[i].total_ideal,'ideal':dataIdeal[i].ideal};
		arrIdealVibox[dataIdeal[i].user].ideal_segundos += parseInt(dataIdeal[i].total_ideal);
		arrIdealVibox[dataIdeal[i].user].ideal = arrIdealVibox[dataIdeal[i].user].ideal_segundos.toHHMMSS();
	}

	return arrIdealVibox;	
}

function formatArrHorarioRealOperador(data_real_vibox,data_real_vicidial){
	var arrReal = {};
	var tiempo_acum = 0;
	//sumamos los de vicidial primero
	for (var i = 0; i < data_real_vicidial.length; i++) {
		arrReal[data_real_vicidial[i].mpr_user] = {'segundos_reales':parseInt(data_real_vicidial[i].second_adhe),'horario_real':parseInt(data_real_vicidial[i].second_adhe).toHHMMSS()};
	}

	//se agrega lo de vicidial
	for (var i = 0; i < data_real_vibox.length; i++) {
		if(typeof(arrReal[data_real_vibox[i].operador]) == "undefined") arrReal[data_real_vibox[i].operador]= {'segundos_reales':0};
		tiempo_acum = arrReal[data_real_vibox[i].operador].segundos_reales + data_real_vibox[i].real_segundos;
		arrReal[data_real_vibox[i].operador] = { 'segundos_reales':tiempo_acum,'horario_real':tiempo_acum.toHHMMSS()};
	}

	return arrReal;
}

var arrAdheCuartil = [];

function formatArrAdherencia(data_hh,dataIdeal,dataReal){
	var arrAdherencia = {};
	var porc_adhe = 0;
	var tiempo_real = 0;
	var arrIdealVibox = formatArrIdealVibox(dataIdeal);
	arrAdheCuartil = [];
	for (var i = 0; i < data_hh.length; i++) {
		if(typeof(arrIdealVibox[data_hh[i].user]) != 'undefined'){
			tiempo_real= dataReal[data_hh[i].user].segundos_reales;
			porc_adhe = ((tiempo_real*100)/arrIdealVibox[data_hh[i].user].ideal_segundos).toFixed(2);

			data_hh[i]['porc_adherencia'] = porc_adhe;
		}else{
			data_hh[i]['porc_adherencia'] = 0;
		}
		arrAdheCuartil.push(parseFloat(porc_adhe));
	}
	return data_hh;
}

function formatArrEstadosContactados(dataEstadosContactados){
	var arrEstadosContactados = [];
	for (var i = 0; i < dataEstadosContactados.length; i++) {
		arrEstadosContactados.push(dataEstadosContactados[i].estado);
	}
	return arrEstadosContactados;
}

function colocarCuartilAdhe(data_hh,arrCuartilCalidad,dataCalidad){
	var cuartiles = [helpers.cuartilMedias(arrAdheCuartil,0.25),helpers.cuartilMedias(arrAdheCuartil,0.5),helpers.cuartilMedias(arrAdheCuartil,0.75)];
	cuartiles.sort(function(a, b) {
	 	return a - b;
	});
	var q1=q2=q3 = 0; //inicializacion de los cuartiles
	var q_ca_1=q_ca_2=q_ca_3 = 0; //inicializacion de los cuartiles de calidad

	/*
	q1 = cuartiles[0]; //VALOR MAS BAJO
	q2 = cuartiles[1]; //VALOR MEDIANO
	q3 = cuartiles[2]; //VALOR ALTO
	*/
	q1 = 90; //VALOR MAS BAJO
	q2 = 95; //VALOR MEDIANO
	q3 = 98; //VALOR ALTO

	var cuartiles_calidad = [helpers.cuartilMedias(arrCuartilCalidad,0.25),helpers.cuartilMedias(arrCuartilCalidad,0.5),helpers.cuartilMedias(arrCuartilCalidad,0.75)];
	cuartiles_calidad.sort(function(a, b) {
	 	return a - b;
	});
	/*
	q_ca_1 = cuartiles_calidad[0]; //VALOR MAS BAJO
	q_ca_2 = cuartiles_calidad[1]; //VALOR MEDIANO
	q_ca_3 = cuartiles_calidad[2]; //VALOR ALTO
	*/
	q_ca_1 = 80; //VALOR MAS BAJO
	q_ca_2 = 90; //VALOR MEDIANO
	q_ca_3 = 95; //VALOR ALTO
	for (var i = 0; i < data_hh.length; i++) {
		data_hh[i].tramo_adhe = retNumCuartil(parseFloat(data_hh[i].porc_adherencia),q1,q2,q3);
		if(typeof(dataCalidad[data_hh[i].user]) != 'undefined')
			data_hh[i].tramo_calidad = retNumCuartil(dataCalidad[data_hh[i].user],q_ca_1,q_ca_2,q_ca_3);
		else
			data_hh[i].tramo_calidad = 0;
	}
	return data_hh;
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

exports.reFormatMediasDomo           = reFormatMediasDomo;
exports.implodeEstado                = implodeEstado;
exports.formatArrHorarioEntrada      = helpers.formatArrHorarioEntrada;
exports.implodeUsuarios              = implodeUsuarios;
exports.formatArrFechaIngresos       = formatArrFechaIngresos;
exports.formatArrAdherencia          = formatArrAdherencia;
exports.colocarCuartilAdhe           = colocarCuartilAdhe;
exports.formatArrEstadosContactados  = formatArrEstadosContactados;
exports.formatArrPuntajes            = formatArrPuntajes;
exports.formatArrHorarioRealOperador = formatArrHorarioRealOperador;
exports.formatArrHorarioRealOperador = formatArrHorarioRealOperador;