reportMedias.controller('mantenedorHorarioOperadorController', function($scope, $http, $cookies, $location, Notification, Upload, $timeout, Title) {
    // array con los eventos (por alguna razon se debe inicializar)
    $scope.events = [{
        start: new DayPilot.Date("2014-09-01T10:00:00"),
        end: new DayPilot.Date("2014-09-01T10:00:00"),
        id: 'xxx',
        text: "First Event"
    }];

    $scope.eventsBackup = [];


    $scope.dialog = {};

    $scope.dateBegin = ''; // fecha inicio para la modificacion de un horario
    $scope.opeName = ''; // nombre operador
    $scope.maxDuration = 0; // horas del contrato
    $scope.totalDuration = 0; // sumatoria de horas en el horario
    $scope.totalDurationText = '0 Horas 0 minutos';

    $scope.readyToSubmit = false; // si esta listo para enviar ($scope.totalDuration == )$scope.maxDuration
    $scope.editionAllowed = false; // indica si esta permitida la edicion
    $scope.editing = false; // indica si se esta editando
    $scope.eventsChanged = false;
    $scope.tablaCambio = 'interior/mantenedor_operador/horario/tabla_cambio.html';
    // objeto para el manejo de las suma de horas por dia
    $scope.hoursByDay = {
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0,
        Saturday: 0
    };
    $scope.formPath = {};

    $scope.actualizarTitulo = function(){
        path = $location.path();
        $scope.formPath.path = path;
        $http.post('/tituloPagina',$scope.formPath).then(function(result){
            $scope.title = result.data;
            Title.setTitle($scope.title[0].mos_titulo_pagina, $scope.title[0].mos_descripcion);
            $('#wrapper.toggled').find("#sidebar-wrapper").find(".collapse").collapse('hide');
        });
    }

    $scope.actualizarTitulo();

    $scope.showConfirm = function(modo) {
        if (modo == "update") {
            $scope.dialog = {
                titleDialog: 'Modificar Horario',
                contentDialog: '¿Estas seguro que quieres modificar el horario?',
                botonDialog: 'Modificar',
                callback: $scope.updateEvents
            };
            $('#dialogConfirm').modal();
        } else if (modo == "create") {
            $scope.dialog = {
                titleDialog: 'Crear Horario',
                contentDialog: '¿Estas seguro que quieres crear el horario?',
                botonDialog: 'Crear',
                callback: $scope.createEvents
            };
            $('#dialogConfirm').modal();
        } else if (modo == "allowEdit") {
            $scope.dialog = {
                titleDialog: 'Permitir Modificar Horario',
                contentDialog: '¿Estas seguro que quieres modificar el horario?',
                botonDialog: 'Modificar',
                callback: $scope.allowEdit
            };
            $('#dialogConfirm').modal();
        }
    }

    // configuracion para DayPilot
    $scope.rangoCalendar = $cookies.p_calendar;
    $scope.config = {
        startDate: moment(DayPilot.Date.today()).add(7, 'days').isoWeekday(1).format("YYYY-MM-DD"),
        viewType: "Days",
        days: 6,
        WeekStars: 1,
        locale: "Es-es",
        headerDateFormat: "dddd", // formato fecha en que se muestra el header de la tabla
        allDayEventHeight: 20,
        cellDuration: $cookies.p_calendar, // duracion en minutos de cada fila
        cellHeight: 15,
        dayBeginsHour: 9, // hora comienzo a mostrar
        dayEndsHour: 22, // hora fin
        businessEndsHour: 22,
        allowMultiSelect: false,
        showEventStartEnd: true, // permite mostrar la hora de comienxo y fin de un evento (ej: 9:00 - 13:00)
        eventDeleteHandling: "Update",
        // antes de pintar cada celda
        onBeforeCellRender: function(args) {
            args.cell.business = true;
            $('.calendar_default_corner_inner').parent().parent().html('');
            $('#dp').css('border', 'none');
        },
        // Create
        onTimeRangeSelected: function(args) {
            console.log(args);
            // si no esta permitida la edicion del horario
            if (!$scope.editionAllowed) {
                args.preventDefault();
                this.clearSelection();
                Notification.warning({
                    message: "Horario no se puede editar",
                    dalay: 2000
                })
                return;
            }

            // se evita que choquen los eventos
            if (collideEvents(args.start, args.end, null)) {
                args.preventDefault();
                this.clearSelection();
                Notification.warning({
                    message: "Bloques concurrentes son denegados",
                    dalay: 2000
                })
                return;
            }

            // se calcula el totalDuration y si es mayor al max retorna false
            if (!setNewTotalDuration(args.start, args.end, null)) {
                args.preventDefault();
                $scope.dp.clearSelection();
                Notification.warning({
                    message: "Horario sobrepasa el limite de horas por semana",
                    dalay: 2000
                })
                return;
            }
            // add event
            $scope.events.push({
                id: DayPilot.guid(),
                start: args.start,
                end: args.end,
                backColor: '#4897D0',
                fontColor: '#ffffff',
                cssClass: 'text-bold',
                vicu_user_id: getParam('op_id'),
                ophs_usuario_codigo: getParam('code'),
                text: ''
            });

            // this.message("Created");
            // se refrescan los botones y cuentas de horas por dias
            $('#totalDurationText').html(getTotalDurationInText());
            setHoursOfWeek();
            $scope.eventsChanged = !_.isEqual(generateBackup($scope.events), $scope.eventsBackup);
            repaintButtons();

            this.update();
        },
        // Move
        onEventMove: function(args) {
            if (!$scope.editionAllowed) {
                args.preventDefault();
                Notification.warning({
                    message: "Horario no se puede editar",
                    dalay: 2000
                })
                return;
            }
            // no se permiten mover event a otro dia
            if (moment(args.newStart.value).day() != moment(args.e.start().value).day()) {
                args.preventDefault();
                Notification.warning({
                    message: "No puedes cambiar de día un bloque del horario",
                    dalay: 2000
                })
                return;
            }
            if (collideEvents(args.newStart, args.newEnd, args.e.id())) {
                args.preventDefault();
                Notification.warning({
                    message: "Bloques concurrentes no permitidos",
                    dalay: 2000
                })
                return;
            }

        },
        // despues que un event se movió se
        onEventMoved: function(args) {
            $scope.eventsChanged = !_.isEqual(generateBackup($scope.events), $scope.eventsBackup);
            setNewTotalDuration(null, null, null);
            repaintButtons();
        },
        // Resize
        onEventResize: function(args) {
            if (!$scope.editionAllowed) {
                args.preventDefault();
                Notification.warning({
                    message: "Horario no se puede editar",
                    dalay: 2000
                })

                return;
            }
            console.log(args);
            if (collideEvents(args.newStart, args.newEnd, args.e.id())) {
                args.preventDefault();
                Notification.warning({
                    message: "Bloques concurrentes no permitidos",
                    dalay: 2000
                })
                return;
            }
            $scope.eventsChanged = !_.isEqual(generateBackup($scope.events), $scope.eventsBackup);
            if (!setNewTotalDuration(args.newStart, args.newEnd, args.e.id())) {
                args.preventDefault();
                $scope.dp.clearSelection();
                Notification.warning({
                    message: "Horario sobrepasa el limite de horas por semana",
                    dalay: 2000
                })
                return;
            } else {
                repaintButtons();
            }
        },
        // cuando se cambió el tamaño a un evento
        onEventResized: function(args) {
            console.log('onEventResized', args, $scope.events);
            setHoursOfWeek();
            repaintButtons();
            $scope.eventsChanged = !_.isEqual(generateBackup($scope.events), $scope.eventsBackup);

        },
        // Delete
        // antes de borrar
        onEventDelete: function(args) {
            if (!$scope.editionAllowed) {
                args.preventDefault();
                this.clearSelection();
                Notification.warning({
                    message: "Horario no se puede editar",
                    dalay: 2000
                })
                return;
            }
            // if (!$scope.showConfirm("Seguro quieres eliminar un bloque?")) {
            //     args.preventDefault();
            //     return;
            // }

            // NOTA: descomentar estas lines para eliminar bloques de la base de datos
            // if ($scope.editionAllowed) {
            //     deleteEvent(args.e.id());
            // }
        },
        // despues de borrado
        onEventDeleted: function(args) {
            $scope.eventsChanged = !_.isEqual(generateBackup($scope.events), $scope.eventsBackup);
            setHoursOfWeek();
            setNewTotalDuration(null, null, null);
            $('#totalDurationText').html(getTotalDurationInText());
        }
    };

    $scope.changeDate = function() {
        repaintButtons();
    }

    // se regresan las variables a sus valores prohibiendo la edicion
    $scope.cancelUpdate = function() {
        console.log('cancelUpdate');
        $scope.eventsChanged = false;
        $scope.editionAllowed = false;
        repaintButtons();
        getEvents();
    }

    // se envian los eventos para insertar
    $scope.createEvents = function() {
        if (!$scope.editionAllowed || !$scope.readyToSubmit) {
            return;
        }

        $('#btnGuardar').attr('disabled', 'true').hide();

        var params = {
            horario_completo: []
        }

        _.each($scope.events, function(e) {
            params.horario_completo.push({
                start: e.start.value,
                end: e.end.value,
                vicu_user_id: getParam('op_id'),
                ophs_usuario_codigo: getParam('code')
            });
        })

        $http.post("/mantenedor/insertarHorarioOperador", params)
            .success(function(data) {
                console.log(data);
                Notification.success({
                    message: "Horario credo",
                    dalay: 2000
                })
                $('#btnPermitirEditar').show();
                $scope.readyToSubmit = false;
                $scope.editionAllowed = false;
            });
    }

    // se envian los eventos para ser insertados luego de una modificacion de horario
    $scope.updateEvents = function() {
        if (!$scope.editing || !$scope.editionAllowed || !$scope.eventsChanged || !$scope.readyToSubmit) {
            return
        }

        $('#divEditar').hide();
        $('#btnPermitirEditar').show();

        var params = {
            fecha_inicio: $scope.dateBegin,
            ophs_usuario_codigo: getParam('code'),
            horario_completo: []
        }

        _.each($scope.events, function(e) {
            params.horario_completo.push({
                start: e.start.value,
                end: e.end.value,
                vicu_user_id: getParam('op_id'),
                ophs_usuario_codigo: getParam('code')
            });
        })

        $http.post("/mantenedor/modificarHorarioOperador", params)
            .success(function(data) {
                console.log(data);
                Notification.success({
                    message: "Horario modificado",
                    dalay: 2000
                })
                $scope.readyToSubmit = false;
                $scope.eventsChanged = false;
                $scope.editing = false;
                $scope.editionAllowed = false;
            });
    }

    // se cambian las variables a los valores que permitan editar un horario existente
    $scope.allowEdit = function() {
        $('#btnPermitirEditar').hide();
        $('#divEditar').show();
        $('#btnEditar').attr('disabled', 'true');
        $scope.dateBegin = '';
        $scope.editionAllowed = true;
        $scope.editing = true;
        $scope.readyToSubmit = false;
        $scope.eventsChanged = false;

        $scope.eventsBackup = generateBackup($scope.events);

        console.log($scope.eventsBackup);
    }

    // segun los valores de las variables (banderas) se mostrará los botones correspondientes
    function repaintButtons() {
        $scope.eventsChanged = !_.isEqual(generateBackup($scope.events), $scope.eventsBackup);
        $scope.readyToSubmit = ($scope.totalDuration == $scope.maxDuration);
        if ($scope.readyToSubmit) {
            $('#totalDurationText').addClass('text-success').removeClass('text-danger');
            if ($scope.editionAllowed && getParam('code') != '' && getParam('op_id') != '') {
                if ($scope.editing) {
                    $scope.dateBegin && $scope.eventsChanged ? $('#btnEditar').removeAttr('disabled') : $('#btnEditar').attr('disabled', 'true');
                } else {
                    $('#btnGuardar').removeAttr('disabled').show();
                }
            } else if ($scope.editing) {
                $scope.editing = false;
                $('#divEditar, #btnGuardar').hide();
                $('#btnPermitirEditar').show();
                $('#btnEditar').attr('disabled', 'true');
            }
        } else {
            $('#totalDurationText').addClass('text-danger').removeClass('text-success');
            $('#btnGuardar').attr('disabled', 'true');
            $('#btnEditar').attr('disabled', 'true');
        }
    }

    // se refresca el totalDurationText
    function getTotalDurationInText() {
        repaintButtons();
        return Math.floor($scope.totalDuration) + ' Horas ' + ($scope.totalDuration % 1 == 0 ? '' : 60 * ($scope.totalDuration % 1) + ' minutos')
    }

    // se setean las horas para cada dia
    function setHoursOfWeek() {
        $timeout(function() {
            $scope.hoursByDay = {
                Monday: 0,
                Tuesday: 0,
                Wednesday: 0,
                Thursday: 0,
                Friday: 0,
                Saturday: 0
            }

            $scope.events.forEach(function(e) {
                $scope.hoursByDay[moment(e.start.value || e.start).format("dddd")] += (new Date(e.end).getTime() - new Date(e.start).getTime()) / (3600 * 1000);
            });

            $('#mondayText').html(Math.floor($scope.hoursByDay.Monday) + ' Horas ' + ($scope.hoursByDay.Monday % 1 == 0 ? '' : 60 * ($scope.hoursByDay.Monday % 1) + ' minutos'));
            $('#tuesdayText').html(Math.floor($scope.hoursByDay.Tuesday) + ' Horas ' + ($scope.hoursByDay.Tuesday % 1 == 0 ? '' : 60 * ($scope.hoursByDay.Tuesday % 1) + ' minutos'));
            $('#wednesdayText').html(Math.floor($scope.hoursByDay.Wednesday) + ' Horas ' + ($scope.hoursByDay.Wednesday % 1 == 0 ? '' : 60 * ($scope.hoursByDay.Wednesday % 1) + ' minutos'));
            $('#thursdayText').html(Math.floor($scope.hoursByDay.Thursday) + ' Horas ' + ($scope.hoursByDay.Thursday % 1 == 0 ? '' : 60 * ($scope.hoursByDay.Thursday % 1) + ' minutos'));
            $('#fridayText').html(Math.floor($scope.hoursByDay.Friday) + ' Horas ' + ($scope.hoursByDay.Friday % 1 == 0 ? '' : 60 * ($scope.hoursByDay.Friday % 1) + ' minutos'));
            $('#saturdayText').html(Math.floor($scope.hoursByDay.Saturday) + ' Horas ' + ($scope.hoursByDay.Saturday % 1 == 0 ? '' : 60 * ($scope.hoursByDay.Saturday % 1) + ' minutos'));

            console.log($scope.hoursByDay);
        });
    }

    // se suman las horas del horario para compararlas con las del contrato
    // return true si son iguales
    function setNewTotalDuration(start, end, eventId) {
        console.log($scope.events);
        var totalDuration = start ? (new Date(end.value).getTime() - new Date(start.value).getTime()) / (3600 * 1000) : 0;

        $scope.events.forEach(function(e) {
            if (e.id !== eventId) {
                totalDuration += (new Date(e.end).getTime() - new Date(e.start).getTime()) / (3600 * 1000);
            }
        });

        console.log(totalDuration, $scope.maxDuration);
        if (totalDuration > $scope.maxDuration) {
            return false;
        }

        $scope.totalDuration = totalDuration;
        console.log('------>', $scope.totalDuration);
        $scope.totalDurationText = getTotalDurationInText();
        return true;
    }

    function collideEvents(start, end, eventId) {
        var collideEvents = _.find($scope.events, function(e) {
            return e.id != eventId &&
                (
                    moment(start.value).isBetween(e.start.value, e.end.value) ||
                    moment(end.value).isBetween(e.start.value, e.end.value) ||
                    moment(e.start.value).isBetween(start.value, end.value) ||
                    moment(e.end.value).isBetween(start.value, end.value)
                );
        })
        return !!collideEvents;
    }

    // cargo desde el backend el horario dado un operador
    function getEvents() {
        // using $timeout to make sure all changes are applied before reading visibleStart() and visibleEnd()
        if (getParam('code') != '' && getParam('op_id') != '') {
            $timeout(function() {
                $http.get("/mantenedor/getHorarioSemanaOperador?op_id=" + getParam('op_id')).success(function(data) {
                    console.log(data);
                    var style = {
                        backColor: '#4897D0',
                        fontColor: '#ffffff',
                        cssClass: 'text-bold'
                    }
                    $scope.events = data.calendario;
                    $scope.maxDuration = data.dataOperador.contrato_horas || 0;
                    console.log($scope.events);
                    if ($scope.events.length == 0) {
                        $scope.editionAllowed = true;
                        $('#btnGuardar').show();
                        $('#btnGuardar').attr('disabled', 'true');
                    } else {
                        $('#btnPermitirEditar').show();
                    }
                    $scope.events = _.map($scope.events, function(e) {
                        return _.merge(e, style);
                    });
                    setHoursOfWeek();
                    setNewTotalDuration(null, null, null);
                    $scope.totalDurationText = getTotalDurationInText();
                    $scope.opeName = _.startCase(data.dataOperador.full_name.toLowerCase().trim());


                });
            });
        } else {
            $timeout(function() {
                $scope.events = [];
                alert('Parametros Faltantes')
            });
        }
    }

    function generateBackup(events) {
        events = _.map(events, function(event) {
            return {
                start: event.start.value,
                end: event.end.value
            }
        })
        return _.sortBy(events,'start','desc');
    }

    // NOTA: descomentar estas lines para eliminar bloques de la base de datos
    // function deleteEvent(eventId) {
    //     var params = {
    //         id: eventId
    //     };
    //
    //     $http.post("/mantenedor/eliminarHorarioOperador", params)
    //         .success(function(data) {
    //             console.log(data);
    //         });
    // }

    // se obtiene el valor de un parametro query de la url si existe
    function getParam(needle) {
        if (location.href.indexOf(needle + "=") != -1) {
            var result = location.href.substring(location.href.indexOf(needle + "=") + needle.length + 1);
            return result.substring(0, (result.indexOf("&") != -1 ? result.indexOf("&") : result.length));
        }
        return '';
    }

    $scope.cambios = [];
    $scope.dataTableCambio = "";
    $scope.mostrarCambios = function(operador){
        $("#modalCambio").modal();
        $http.get("/mantenedor/getCambiosHorarios?user="+getParam('code'))
        .then(function(result){
            if($scope.dataTableCambio != "")
                $scope.dataTableCambio.destroy(true);
            $scope.cambios = result.data;
            setTimeout($scope.iniciarDatatableCambios,500);
        });
    }

    $scope.iniciarDatatableCambios = function(){
        $scope.dataTableCambio = $('#tablaCambio').DataTable({
                dom: 'Bfrtip',
                buttons: [
                   'copy', 'csv', 'excel', 'pdf', 'print'
                ],
                scrollX:true,
                scrollY:"500px",
                scrollCollapse:true,
                paging:false,
                destroy: true,
                bFilter: false,
                bInfo: false,
                language: {
                        "sZeroRecords": "No se encontraron resultados",
                        "sEmptyTable": "Ningún dato disponible en esta tabla",
                        "sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ ",
                        "sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0",
                        "sInfoFiltered": "(filtrado de un total de _MAX_ )",
                        "sInfoPostFix": "",
                        "sSearch": "Buscar:",
                        "sUrl": "",
                        "sInfoThousands": ",",
                        "sLoadingRecords": "Cargando...",
                        "oPaginate": {
                                "sFirst": "Primero",
                                "sLast": "Ultimo",
                                "sNext": "Siguiente",
                                "sPrevious": "Anterior"
                        },
                        "oAria": {
                                "sSortAscending": ": Activar para ordenar la columna de manera ascendente",
                                "sSortDescending": ": Activar para ordenar la columna de manera descendente"
                        }
                }
            });
    }

    getEvents();

    $('.datepicker').datepicker({
        language: "es",
        startDate: moment().subtract(1, 'years').format('DD/MM/YYYY'),
        endDate: moment().add(1, 'years').format('DD/MM/YYYY'),
        daysOfWeekHighlighted: "0,6",
        todayHighlight: true
    });

    $scope.cambioRango = function(){
        $cookies.p_calendar = ($cookies.p_calendar==15)?5:15;
        window.location.reload(); 
    }
});
