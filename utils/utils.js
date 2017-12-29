function moda(array){
	//iniciamos las variables necesarias en todo el codigo
	var moda, moda2;
	var contador = 0, contador2 = 0;
	//Recorremos la array
	for (var x=0; x<array.length; x++){
		//Miramos que el numero cogido no sea el de la moda
		if(array[x] != moda){
			var contadorReinicia=0;
			//Recorremos la array para encontrar concordancias on el numero sacado de la array de X
			for(var i=0; i<array.length; i++){
				//cunado el numero sea igual al de la array de x le añadimos 1 al contador
				if (array[i] == array[x]) contadorReinicia++;
			}
			//si el contador que se reinicia nos da mas alto que el contador general añadimos el numero a la variable moda y cambiamos el contador general por el que reinicia
			if (contadorReinicia>contador){
				contador = contadorReinicia;
				moda = array[x];
			}
		}
	}
	//Miramos que no hayan 2 con la misma cantidad
	for ( var x=0; x<array.length; x++ ){
		//Miramos que el numero cogido no sea el de la moda
		if(array[x] != moda && array[x] != moda2){
			var contadorReinicia=0;
			//Recorremos la array para encontrar concordancias on el numero sacado de la array de X
			for(var i=0; i<array.length; i++){
				//cunado el numero sea igual al de la array de x le añadimos 1 al contador
				if (array[i] == array[x]) contadorReinicia++;
			}
			//si el contador que se reinicia nos da mas alto que el contador general añadimos el numero a la variable moda y cambiamos el contador general por el que reinicia
			if (contadorReinicia>contador2){
				contador2 = contadorReinicia;
				moda2 = array[x];
			}
			//Si tenemos 2 de la misma cantidad retornamos la primera moda ;)
			if (contador2 == contador) return moda;
		}
	}
	//Retornamos la moda!!!
	return moda;
}

/**
 devuelve un extracto de una matriz ordenada descendentemente segun el porcentaje en decimal
 	ej = 10% --> 0,1
**/
function extractArr(array,porc){
	array.sort(function(a,b){
		return b-a;
	});
	limit = array.length*0.1
	var arrRet = [];
	for (var i = 0; i < limit; i++) {
		arrRet.push(parseInt(array[i])); //Obligatoriamiente se tiene convertir a entero
	}

	return arrRet;
}

exports.moda = moda;
exports.extractArr = extractArr;