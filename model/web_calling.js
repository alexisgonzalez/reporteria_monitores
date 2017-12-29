var mysql = require('mysql');

var connection_webcalling = {
		host: '190.196.18.131',
		//host: '192.168.0.110',
		user: 'reportes',
		password: 'reportes2904',
		database: 'web_calling'
	}

var reportWebCalling = {}; 

reportWebCalling.getListaAntenecedentesPostulantes = function(filtro, callback){
	var connection = mysql.createConnection(connection_webcalling);
	if(connection){
		var query = "SELECT\
		post.pos_id_postulante,\
		poa_genero,\
		pos_rut,\
		pos_nombre,\
		pos_apellido,\
		DATE_FORMAT(pos_id_fecha_postulacion, '%d/%m/%Y') pos_id_fecha_postulacion,\
		DATE_FORMAT(poa_fecha_nacimiento, '%d/%m/%Y') poa_fecha_nacimiento,\
		poa_telefono,\
		poa_direccion,\
		com_nombre,\
		poa_correo,\
		poa_computador,\
		poa_tipo_equipo,\
		poa_web,\
		poa_banda_ancha,\
		poa_velocidad,\
		poa_tipo_conexion,\
		poa_lugar,\
		niv_nombre,\
		sit_nombre,\
		poe_titulo,\
		poa_experiencia_callcenter AS experiencia_en_call,\
		pos.es_id_estado,\
		es_nombre\
		FROM web_calling.postulante post\
		INNER JOIN web_calling.postulante_antecedentes poa ON post.pos_id_postulante = poa.pos_id_postulante\
		AND poa.poa_estado = 1\
		INNER JOIN web_calling.comuna com ON poa.com_id_comuna=com.com_id_comuna\
		INNER JOIN web_calling.postulante_educacion poe ON post.pos_id_postulante = poe.pos_id_postulante\
		AND poe_estado = 1\
		INNER JOIN web_calling.nivel_educacional niv ON poe.niv_id_niv_eduacional=niv.niv_id_nivel_educacional\
		INNER JOIN web_calling.situacion_estudio sit ON poe.sit_id_situacion_estudio=sit.sit_id_situacion_estudio\
		INNER JOIN web_calling.postulacion pos ON post.pos_id_postulante = pos.pos_id_postulante\
		AND pos.pos_estado = 1\
		INNER JOIN estado es ON pos.es_id_estado=es.es_id_estado\
		"+filtro+"\
		ORDER BY\
		post.pos_rut;"
		console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		});
	}
	connection.end();
}

reportWebCalling.getListaCargosPostulantes = function(filtro, callback){
	var connection = mysql.createConnection(connection_webcalling);
	if(connection){
		var query = "SELECT\
		pos_rut,\
		car.car_nombre\
		FROM web_calling.postulante post\
		INNER JOIN web_calling.postulacion pos ON post.pos_id_postulante = pos.pos_id_postulante\
		AND pos.pos_estado = 1\
		INNER JOIN web_calling.postulante_cargo poc ON post.pos_id_postulante = poc.pos_id_postulante\
		AND poc.poc_estado = 1\
		INNER JOIN web_calling.cargo car ON poc.car_id_cargo = car.car_id_cargo\
		"+filtro+"\
		ORDER BY\
		post.pos_rut;"
		console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		});
	}
	connection.end();
}

reportWebCalling.getListaExperienciaPostulantes = function(filtro, callback){
	var connection = mysql.createConnection(connection_webcalling);
	if(connection){
		var query = "SELECT\
		pos_rut,\
		pox_empresa,\
		pox_cargo,\
		DATE_FORMAT(pox_fecha_ingreso, '%d/%m/%Y') pox_fecha_ingreso,\
		DATE_FORMAT(pox_fecha_fin, '%d/%m/%Y') pox_fecha_fin,\
		pox_actual,\
		pox_descripcion\
		FROM web_calling.postulante post\
		INNER JOIN web_calling.postulante_experiencia poex ON post.pos_id_postulante = poex.pos_id_postulante\
		AND poex.pox_estado = 1\
		INNER JOIN web_calling.postulacion pos ON post.pos_id_postulante = pos.pos_id_postulante\
		AND pos.pos_estado = 1\
		"+filtro+"\
		ORDER BY\
		post.pos_rut;"
		console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		});
	}
	connection.end();
}


reportWebCalling.getListPaisesPostulantes = function(filtro, callback){
	var connection = mysql.createConnection(connection_webcalling);
	if(connection){
		var query = "SELECT pai_id_pais, pai_nombre FROM web_calling.pais "+filtro+";"
		console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		});
	}
	connection.end();
}

reportWebCalling.getListEstados = function(filtro, callback){
	var connection = mysql.createConnection(connection_webcalling);
	if(connection){
		var query = "SELECT es_id_estado, es_nombre FROM web_calling.estado \
		"+filtro+"\
		ORDER BY es_nombre;"
		console.log(query);
		connection.query(query,function(err,rows){
			if(err)
				throw err;
			else
				callback(null,rows);
		});
	}
	connection.end();
}

reportWebCalling.executeQuery = function(query,callback){
	var connection = mysql.createConnection(connection_webcalling);
	if(connection){
		console.log(query);
		connection.query(query,function(error,rows){
			if(error)
				callback(true,rows);
			else
				callback(false,rows);
		});
	}
	connection.end();
}

reportWebCalling.listaEstadoCivil = function(callback){
	var connection = mysql.createConnection(connection_webcalling);
	if(connection){
		var query = "SELECT est_id_estado_civil, est_nombre FROM web_calling.`estado_civil`;";
		console.log(query);
		connection.query(query,function(error,rows){
			if(error)
				callback(true,rows);
			else
				callback(false,rows);
		});
	}
	connection.end();
}

reportWebCalling.listaNivelEducacional = function(callback){
	var connection = mysql.createConnection(connection_webcalling);
	if(connection){
		var query = "SELECT niv_id_nivel_educacional, niv_nombre FROM web_calling.`nivel_educacional`;";
		console.log(query);
		connection.query(query,function(error,rows){
			if(error)
				callback(true,rows);
			else
				callback(false,rows);
		});
	}
	connection.end();
}

reportWebCalling.listaSituacionEstudios = function(callback){
	var connection = mysql.createConnection(connection_webcalling);
	if(connection){
		var query = "SELECT sit_id_situacion_estudio, sit_nombre FROM web_calling.`situacion_estudio`;";
		console.log(query);
		connection.query(query,function(error,rows){
			if(error)
				callback(true,rows);
			else
				callback(false,rows);
		});
	}
	connection.end();
}

reportWebCalling.listaComunas = function(callback){
	var connection = mysql.createConnection(connection_webcalling);
	if(connection){
		var query = "SELECT com_id_comuna, com_nombre FROM web_calling.`comuna`;";
		console.log(query);
		connection.query(query,function(error,rows){
			if(error)
				callback(true,rows);
			else
				callback(false,rows);
		});
	}
	connection.end();
}

module.exports = reportWebCalling;