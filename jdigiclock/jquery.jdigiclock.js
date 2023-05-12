/*
 * jDigiClock plugin 3.2
 *
 * http://www.radoslavdimov.com/jquery-plugins/jquery-plugin-digiclock/
 *
 * Copyright (c) 2009 Radoslav Dimov
 *
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * 17-NOV-2013:  2.1.1 Modified by Andrew Mercer to use offset from Server Time. Allows display of other timezones.
 * 08-FEB-2015:  2.1.2 Adapted to use Yahoo weather (AccuWeather not working) and JSONP (No proxy)
 * 21-MAR-2015:  2.1.3 Added .promise().done(function () {}) reference for compatibility with later jquery versions
 *                     Avoids repeated sliding panels on left/right clicks. Based on update by s4ty at
 *                     http://www.jquery-board.de/threads/3458-jDigiClock/page4
 *                     Doc here : http://www.baldwhiteguy.co.nz/jdigiclock/
 * 31-MAY-2016:  2.1.4 Adapted to have only 1 single view page, added French language
 * 13-JAN-2017:  2.1.5 Fixed Yahoo API connection issues 
 * 5-JAN-2019:   3.0.0 Migrated to undocumented MeteoFrance API
 * 7-AUG-2020:   3.0.1 Change of API for sunrise / sunset
 * 11-APR-2021   3.0.2 Fix MeteoFrance API
 * 5-MAY-2021    3.1 Add seasonal average
 * 24-FEB-2022   3.2 Add rainfall and wind gust
 *                
 *
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 
 */


(function($) {
    $.fn.extend({

        jdigiclock: function(options) {

            var defaults = {
                imagesPath: 'images/',
                lang: 'fr',
                am_pm: false,
                weatherLocationCode: '751170', // Meteofrance city code
                weatherUpdate: 59,
                svrOffset: 0   
            };

            var regional = [];
            regional['fr'] = {
                monthNames: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'],
                dayNames: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
                lang: 'fr'
            }
            regional['en'] = {
                monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                lang: 'en'
            }


            var options = $.extend(defaults, options);

            return this.each(function() {
                
                var $this = $(this);
                var o = options;
                $this.imagesPath = o.imagesPath;
                $this.lang = regional[o.lang] == undefined ? regional['en'] : regional[o.lang];
                $this.am_pm = o.am_pm;
                $this.weatherLocationCode = o.weatherLocationCode;
                $this.weatherUpdate = o.weatherUpdate;
                $this.svrOffset = o.svrOffset;
                $this.clockImagesPath = o.imagesPath + 'clock/';
                $this.weatherImagesPath = o.imagesPath + 'picto/';
                $this.currDate = '';
                $this.timeUpdate = '';


                var html = '<div id="plugin_container">';
                html    += '<div id="clock"></div>';
                html    += '<div id="weather"></div>';
                html    += '</div>';

                $this.html(html);

                $this.find('#weather').html('<p class="loading">Update Weather ...<br><span style="font-size:16px;"><img src="' + $this.imagesPath + 'refresh_grey.png" alt="reload" title="reload" id="reload" /> Reload</span></p>');

                $this.displayClock($this);

                $this.displayWeather($this);               

            });
        }
    });
   



    $.fn.displayClock = function(el) {
        $.fn.getTime(el);
        setTimeout(function() {$.fn.displayClock(el)}, $.fn.delay());
    }

    $.fn.displayWeather = function(el) {
        $.fn.getWeather(el);
        if (el.weatherUpdate > 0) {
            setTimeout(function() {$.fn.displayWeather(el)}, (el.weatherUpdate * 60 * 1000));
        }
    }

    $.fn.delay = function() {
        var now = new Date();
        var delay = (60 - now.getSeconds()) * 1000;
        
        return delay;
    }

    $.fn.getTime = function(el) {
        var localtime = new Date();
        var now = new Date(localtime.getTime() - el.svrOffset);
        var old = new Date();
        old.setTime(now.getTime() - 60000);
        
        var now_hours, now_minutes, old_hours, old_minutes, timeOld = '';
        now_hours =  now.getHours();
        now_minutes = now.getMinutes();
        old_hours =  old.getHours();
        old_minutes = old.getMinutes();

        if (el.am_pm) {
            var am_pm = now_hours > 11 ? 'pm' : 'am';
            now_hours = ((now_hours > 12) ? now_hours - 12 : now_hours);
            old_hours = ((old_hours > 12) ? old_hours - 12 : old_hours);
        } 

        now_hours   = ((now_hours <  10) ? "0" : "") + now_hours;
        now_minutes = ((now_minutes <  10) ? "0" : "") + now_minutes;
        old_hours   = ((old_hours <  10) ? "0" : "") + old_hours;
        old_minutes = ((old_minutes <  10) ? "0" : "") + old_minutes;
        // date
        el.currDate = el.lang.dayNames[now.getDay()] + '&nbsp;' + now.getDate() + '&nbsp;' + el.lang.monthNames[now.getMonth()];
        // time update
        el.timeUpdate = now_hours + ':' + now_minutes;

        var firstHourDigit = old_hours.substr(0,1);
        var secondHourDigit = old_hours.substr(1,1);
        var firstMinuteDigit = old_minutes.substr(0,1);
        var secondMinuteDigit = old_minutes.substr(1,1);
        
        timeOld += '<div id="hours"><div class="line"></div>';
        timeOld += '<div id="hours_bg"><img src="' + el.clockImagesPath + 'clockbg1.png" /></div>';
        timeOld += '<img src="' + el.clockImagesPath + firstHourDigit + '.png" id="fhd" class="first_digit" />';
        timeOld += '<img src="' + el.clockImagesPath + secondHourDigit + '.png" id="shd" class="second_digit" />';
        timeOld += '</div>';
        timeOld += '<div id="minutes"><div class="line"></div>';
        if (el.am_pm) {
            timeOld += '<div id="am_pm"><img src="' + el.clockImagesPath + am_pm + '.png" /></div>';
        }
        timeOld += '<div id="minutes_bg"><img src="' + el.clockImagesPath + 'clockbg1.png" /></div>';
        timeOld += '<img src="' + el.clockImagesPath + firstMinuteDigit + '.png" id="fmd" class="first_digit" />';
        timeOld += '<img src="' + el.clockImagesPath + secondMinuteDigit + '.png" id="smd" class="second_digit" />';
        timeOld += '</div>';

        el.find('#clock').html(timeOld);

        // set minutes
        if (secondMinuteDigit != '9') {
            firstMinuteDigit = firstMinuteDigit + '1';
        }

        if (old_minutes == '59') {
            firstMinuteDigit = '511';
        }

        setTimeout(function() {
            $('#fmd').attr('src', el.clockImagesPath + firstMinuteDigit + '-1.png');
            $('#minutes_bg img').attr('src', el.clockImagesPath + 'clockbg2.png');
        },200);
        setTimeout(function() { $('#minutes_bg img').attr('src', el.clockImagesPath + 'clockbg3.png')},250);
        setTimeout(function() {
            $('#fmd').attr('src', el.clockImagesPath + firstMinuteDigit + '-2.png');
            $('#minutes_bg img').attr('src', el.clockImagesPath + 'clockbg4.png');
        },400);
        setTimeout(function() { $('#minutes_bg img').attr('src', el.clockImagesPath + 'clockbg5.png')},450);
        setTimeout(function() {
            $('#fmd').attr('src', el.clockImagesPath + firstMinuteDigit + '-3.png');
            $('#minutes_bg img').attr('src', el.clockImagesPath + 'clockbg6.png');
        },600);

        setTimeout(function() {
            $('#smd').attr('src', el.clockImagesPath + secondMinuteDigit + '-1.png');
            $('#minutes_bg img').attr('src', el.clockImagesPath + 'clockbg2.png');
        },200);
        setTimeout(function() { $('#minutes_bg img').attr('src', el.clockImagesPath + 'clockbg3.png')},250);
        setTimeout(function() {
            $('#smd').attr('src', el.clockImagesPath + secondMinuteDigit + '-2.png');
            $('#minutes_bg img').attr('src', el.clockImagesPath + 'clockbg4.png');
        },400);
        setTimeout(function() { $('#minutes_bg img').attr('src', el.clockImagesPath + 'clockbg5.png')},450);
        setTimeout(function() {
            $('#smd').attr('src', el.clockImagesPath + secondMinuteDigit + '-3.png');
            $('#minutes_bg img').attr('src', el.clockImagesPath + 'clockbg6.png');
        },600);

        setTimeout(function() {$('#fmd').attr('src', el.clockImagesPath + now_minutes.substr(0,1) + '.png')},800);
        setTimeout(function() {$('#smd').attr('src', el.clockImagesPath + now_minutes.substr(1,1) + '.png')},800);
        setTimeout(function() { $('#minutes_bg img').attr('src', el.clockImagesPath + 'clockbg1.png')},850);

        // set hours
        if (now_minutes == '00') {
           
            if (el.am_pm) {
                if (now_hours == '00') {                   
                    firstHourDigit = firstHourDigit + '1';
                    now_hours = '12';
                } else if (now_hours == '01') {
                    firstHourDigit = '001';
                    secondHourDigit = '111';
                } else {
                    firstHourDigit = firstHourDigit + '1';
                }
            } else {
                if (now_hours != '10') {
                    firstHourDigit = firstHourDigit + '1';
                }

                if (now_hours == '20') {
                    firstHourDigit = '1';
                }

                if (now_hours == '00') {
                    firstHourDigit = firstHourDigit + '1';
                    secondHourDigit = secondHourDigit + '11';
                }
            }

            setTimeout(function() {
                $('#fhd').attr('src', el.clockImagesPath + firstHourDigit + '-1.png');
                $('#hours_bg img').attr('src', el.clockImagesPath + 'clockbg2.png');
            },200);
            setTimeout(function() { $('#hours_bg img').attr('src', el.clockImagesPath + 'clockbg3.png')},250);
            setTimeout(function() {
                $('#fhd').attr('src', el.clockImagesPath + firstHourDigit + '-2.png');
                $('#hours_bg img').attr('src', el.clockImagesPath + 'clockbg4.png');
            },400);
            setTimeout(function() { $('#hours_bg img').attr('src', el.clockImagesPath + 'clockbg5.png')},450);
            setTimeout(function() {
                $('#fhd').attr('src', el.clockImagesPath + firstHourDigit + '-3.png');
                $('#hours_bg img').attr('src', el.clockImagesPath + 'clockbg6.png');
            },600);

            setTimeout(function() {
            $('#shd').attr('src', el.clockImagesPath + secondHourDigit + '-1.png');
            $('#hours_bg img').attr('src', el.clockImagesPath + 'clockbg2.png');
            },200);
            setTimeout(function() { $('#hours_bg img').attr('src', el.clockImagesPath + 'clockbg3.png')},250);
            setTimeout(function() {
                $('#shd').attr('src', el.clockImagesPath + secondHourDigit + '-2.png');
                $('#hours_bg img').attr('src', el.clockImagesPath + 'clockbg4.png');
            },400);
            setTimeout(function() { $('#hours_bg img').attr('src', el.clockImagesPath + 'clockbg5.png')},450);
            setTimeout(function() {
                $('#shd').attr('src', el.clockImagesPath + secondHourDigit + '-3.png');
                $('#hours_bg img').attr('src', el.clockImagesPath + 'clockbg6.png');
            },600);

            setTimeout(function() {$('#fhd').attr('src', el.clockImagesPath + now_hours.substr(0,1) + '.png')},800);
            setTimeout(function() {$('#shd').attr('src', el.clockImagesPath + now_hours.substr(1,1) + '.png')},800);
            setTimeout(function() { $('#hours_bg img').attr('src', el.clockImagesPath + 'clockbg1.png')},850);
        }
    }

 $.fn.getWeather = function(el) {
    
    // On récupère les prévisions journalières
    $.getJSON('https://rpcache-aa.meteofrance.com/internet2018client/2.0/forecast?id=' + el.weatherLocationCode + '&instants=&day=5&token=__Wj7dVSTjV9YGu1guveLyDq0g7S7TfTjaHBTPTpO0kj8__' // http://ws.meteofrance.com/ws/getDetail/france/'+ el.weatherLocationCode + '.json'
        , function (data) {

            // On met à jour les data que si l'API a retourné des données
            if (typeof data !== 'undefined' && data != null) {
 
                // 1er élèment du forecast 48h. On fait la moyenne entre Min et Max (déprécié)
                //var temp_now = Math.round(( parseFloat(data.result.previsions48h[Object.keys(data.result.previsions48h)[0]].temperatureMin) + parseFloat(data.result.previsions48h[Object.keys(data.result.previsions48h)[0]].temperatureMax)) / 2) 
                
                // 1er forecast après l'heure actuelle
                var temp_now_utc = new Date();
                temp_now_utc.setMinutes(0);
                temp_now_utc.setSeconds(0);
                temp_now_utc.setMilliseconds(0)
                temp_now_utc = temp_now_utc.toISOString();

                // On récupère le forecast de la bonne heure (heure suivante)
                i = 0;
                while (i + 1 < data.properties.forecast.length) {
                    var forecast_time = new Date(data.properties.forecast[i].time).toISOString(); // UTC
                    i=i+1;
                    if (forecast_time >= temp_now_utc) {
                        break;
                    }
                }

                // On récupère le max des vents rafales pour chaque jour (max de toutes les heures)
                var vents_rafales_array = [];
                for (j=0; j< data.properties.forecast.length; j++) {
                    date_vent = data.properties.forecast[j].time.substring(0, 10);
                    if (typeof vents_rafales_array[date_vent]  == 'undefined'  ||  data.properties.forecast[j].wind_speed_gust > vents_rafales_array[date_vent]) {
                        vents_rafales_array[date_vent] = data.properties.forecast[j].wind_speed_gust;
                    }
                }

                var forecast_now = data.properties.forecast[i].T;
                var curr_temp = '<p class="temp">' + String(forecast_now) 
                               + '&deg;<span class="metric">'
                               + 'C' + '</span></p>';

                 el.find('#weather').css('background','url(' + el.weatherImagesPath + data.properties.forecast[i].weather_icon  + '.svg) ');
                 el.find('#weather').css('background-repeat','no-repeat');
                 el.find('#weather').css('background-position','50% -35%');
                 el.find('#weather').css('background-size','50%');
                                     
                day_min = data.properties.daily_forecast[0].T_min;
                day_max = data.properties.daily_forecast[0].T_max;

                var pluieprevision = "";
                if (typeof data.properties.daily_forecast[0].total_precipitation_24h !== 'undefined' && data.properties.daily_forecast[0].total_precipitation_24h > 0 )
                    pluieprevision = '<p style="color:#83C5E0;font-size:11pt;position:absolute;margin:15px 0px 0 -9px;"><img width="14px" src="' + el.imagesPath + 'rain_forecast.png">&nbsp;' + data.properties.daily_forecast[0].total_precipitation_24h + '<span style="font-size:70%">&nbsp;mm</span></p>';
                         
                var rafales = "";
                var jour_rafales = data.properties.daily_forecast[0].time.substring(0, 10);
                if (typeof vents_rafales_array[jour_rafales] !== 'undefined' && vents_rafales_array[jour_rafales] > 0) {
                    var rafales_kmh = Math.ceil(vents_rafales_array[jour_rafales] * 3.6 / 5) * 5;
                    rafales = '<p style="color:#ffffff;background-color:#ED1C2388;font-size:10pt;line-height:13px;position:absolute;margin:39px 0px 0 -5px;">&nbsp;' + rafales_kmh + ' <span style="font-size:80%">km/h</span>&nbsp;</p>';
                }

                var weather = '<div id="local"><p class="city">' 
                             + data.properties.name
                             + '</p>' 
                             + pluieprevision
                             + rafales
                             + '<p class="high_low">' 
                             + Math.round(day_min)
                             + '&deg;&nbsp;/&nbsp;' 
                             + Math.round(day_max)
                             + '&deg;</p>'
                             + '<p id="normales"></p>' 
                             + '</div>';

                 weather += '<div id="temp"><p id="date">' 
                         + el.currDate 
                         + '</p>' 
                         + curr_temp + '</div>';

                 el.find('#weather').html(weather);


                 el.find('#weather').append('<ul id="forecast"></ul>');
                 for (i = 1; i <= 4; i++) {
                    
                    var rafales = "";
                    var jour_rafales = data.properties.daily_forecast[i].time.substring(0, 10);
                    if (typeof vents_rafales_array[jour_rafales] !== 'undefined' && vents_rafales_array[jour_rafales] > 0) {
                        var rafales_kmh = Math.ceil(vents_rafales_array[jour_rafales] * 3.6 / 5) * 5;
                        rafales = '<div class="rafalesprevisionjour"><span style="background-color: #ED1C2388;text-align:right;margin-right:3px;">&nbsp;' + rafales_kmh + ' <span style="font-size:80%">km/h</span>&nbsp;</span></div>';
                    }

                     var d_date = new Date(data.properties.daily_forecast[i].time);
                     var forecast = '<li>'
                                  +  '<div class="pluieprevisionjour">';

                    if (typeof data.properties.daily_forecast[i].total_precipitation_24h !== 'undefined' && data.properties.daily_forecast[i].total_precipitation_24h > 0 )
                        forecast +=  '<span style="background-color: #2B2B32CC;text-align:left;margin-left:4px;"><img style="width:10px;" src="' + el.imagesPath + 'rain_forecast.png">&nbsp;' + data.properties.daily_forecast[i].total_precipitation_24h + ' <span style="font-size:80%">mm</span>&nbsp;</span>';
                        

                    forecast    += '</div>'
                                  + rafales
                                  +   '<p class="dayname">' + el.lang.dayNames[d_date.getDay()] + '&nbsp;' + d_date.getDate() + '</p>'
                                  + '<img style="position: relative; top: -20px;" src="' 
                                  + el.weatherImagesPath 
                                  + data.properties.daily_forecast[i].daily_weather_icon
                                  + '.svg" alt="' 
                                  + data.properties.daily_forecast[i].daily_weather_description
                                  + '" title="' 
                                  + data.properties.daily_forecast[i].daily_weather_description 
                                  + '" />'
                                  + '<div class="daytemp">' 
                                  + Math.round(data.properties.daily_forecast[i].T_min)
                                  + '&deg;&nbsp;/&nbsp;' 
                                  + Math.round(data.properties.daily_forecast[i].T_max)
                                  + '&deg;</div>';
                               
                     forecast    += '</li>';
                     el.find('#forecast').append(forecast);

                 }
                

                el.find('#weather').append('<div id="bottom"><div id="soleil"></div><div id="update"><img src="' + el.imagesPath + 'refresh_grey.png" alt="reload" title="reload" id="reload" />' + el.timeUpdate + '</div></div>');
                
                sunrise = new Date( data.properties.daily_forecast[0].sunrise_time );
                sunrise_formatted = sunrise.getHours() + "h" + (sunrise.getMinutes()<10?'0':'') + sunrise.getMinutes();
                sunset = new Date( data.properties.daily_forecast[0].sunset_time );
                sunset_formatted = sunset.getHours() + "h" + (sunset.getMinutes()<10?'0':'') + sunset.getMinutes();

                soleil = '<font color="yellow">☀</font> ▲&nbsp;' + sunrise_formatted + '&nbsp;&nbsp;&nbsp;▼&nbsp;' + sunset_formatted;                
                el.find('#soleil').append(soleil);


                // On récupère les normales saisnonières
                $.getJSON('https://rpcache-aa.meteofrance.com/internet2018client/2.0/normals?id=' + el.weatherLocationCode + '&token=__Wj7dVSTjV9YGu1guveLyDq0g7S7TfTjaHBTPTpO0kj8__' // http://ws.meteofrance.com/ws/getDetail/france/'+ el.weatherLocationCode + '.json'
                    , function (data) {

                        // On met à jour les data que si l'API a retourné des données
                        if (typeof data !== 'undefined' && data != null) {
             
                            var today = new Date();
                            const monthNames = ["january", "february", "march", "april", "may", "june","july", "august", "september", "october", "november", "december"];
                            var period = monthNames[today.getMonth()];
                            // On récupère les normales du bon mois
                            var normale_min;
                            var normale_max;
                            i = 0;
                            while (i + 1 < data.properties.stats.length) {
                                if (period == data.properties.stats[i]['period']) {
                                    normale_min = data.properties.stats[i]['T_min'];
                                    normale_max = data.properties.stats[i]['T_max'];
                                    break;
                                }
                                i=i+1;
                            }
                            diff_min = Math.round(day_min- normale_min);
                            if (diff_min > 0) 
                                diff_min_display = "+" + String(diff_min) + "°"; 
                            else if (diff_min < 0) 
                                diff_min_display = String(diff_min) + "°";
                            else
                                diff_min_display = "≈";
                            diff_max = Math.round(day_max- normale_max);
                            if (diff_max > 0) 
                                diff_max_display = "+" + String(diff_max) + "°";
                            else if (diff_max < 0) 
                                diff_max_display =  String(diff_max) + "°";
                            else
                                diff_max_display = "≈";

                            normales = "<span class='normalediff normale_min'>" + diff_min_display + "</span>&nbsp;&nbsp;vs ñ&nbsp;&nbsp;<span class='normalediff normale_max'>" + diff_max_display + "</span>&nbsp;&nbsp;";
                            el.find('#normales').html(normales);

                            if (diff_min < -1) 
                                 el.find('.normale_min').css('color','#1B9BD3');
                            else if (diff_min > 1)
                                el.find('.normale_min').css('color','#ED1C24');
                            else 
                                el.find('.normale_min').css('color','#FFFFFF');

                            if (diff_max < -1) 
                                 el.find('.normale_max').css('color','#1B9BD3');
                            else if (diff_max > 1)
                                el.find('.normale_max').css('color','#ED1C24');
                            else 
                                el.find('.normale_max').css('color','#FFFFFF');
                        }

                    });

            }

            else { // Si pb de connexion à l'API
                // On change la couleur du bouton refresh en rouge
                $('#reload').attr('src', el.imagesPath + 'refresh_red.png');  
            }


            $('#reload').click(function() {
                 $.fn.getWeather(el);
            });
             
        });



    }
})(jQuery);
