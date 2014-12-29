'use strict';

/* Services */

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('index.services', [])
	.value('version', '0.1')
	.factory('calendarSrv',function(){
		var cal={
			start_year:1900,
			month:function(name,number){
					return {'name':name,
							'number':number
							};
			},
			day:function(year,month,day,inmonth){
				return {'year':year,
						'month':month,
						'day':day,
						'inmonth':inmonth,
						};
			},
			months:function(year){
						var tab_months=[this.month('Jan',31),this.month('Fev',28),this.month('Mar',31),this.month('Avr',30),
										this.month('Mai',31),this.month('Jui',30),this.month('Juil',31),this.month('Aou',31),
										this.month('Sep',30),this.month('Oct',31),this.month('Nov',30),this.month('Dec',31)];
										(this.__is_biss(year))?tab_months[1].number=29:tab_months[1].number=28;
							return tab_months;
								},
			days:["lun","mar","mer","jeu","ven","sam","dim"],
			__decalage:function(days_total){
							return Math.round(((days_total/7)-(Math.floor(days_total/7)))*7);
						},//end of decalage
			__is_biss:function(year){
					if (year%4==0 && year%100!=0){
						return true;
					}else if (year%400==0){
						return true;
					}else if (year%100==0){
						return false;
					}else{
						return false;
					}  
				},// end of is_biss
			__days_in_current_year:function(year,month,day){
					var days=0;
					if(this.__is_biss(year)){
						this.months(year)[1].number=29;
					}
					for (var i=0;i<month;i++){
				       days+=this.months(year)[i].number;
					}
					return days+=day-1;
				},//end of days in current year
			__total_days : function(year,month,day){
					var days;
					var years=year-this.start_year;
					/*-------------calcul jusqu'au 1 janvier de l'annee en cours---*/
					var nb_biss=Math.floor((years-1)/4);
					days=365*years+nb_biss;
					
					/*-----------calcul jusqu'au mois en cours---------------*/
					days+=this.__days_in_current_year(year,month,day);
					return days;
				}
				
			}//end of calendar object
						
		return {months:function(year){return cal.months(year)},
				total_days  :function(year,month,day){return cal.__total_days(year,month,day);},
				weeks_number:function(year,month,fday){
							var day;
							(fday)?day=fday:day=1;
							var nb_thursday=cal.__total_days(year,month,day);
							var nb_4_janvier=cal.__total_days(year,0,4);
							var position_4_janvier=cal.__decalage(nb_4_janvier);
							var nb_jour_premier_lundi_et_4_janvier=nb_4_janvier-position_4_janvier;
							var difference_jours=(nb_thursday-nb_jour_premier_lundi_et_4_janvier);
							var first=Math.ceil(difference_jours/7);
							var tab_weeks=[];
							for(var i=0;i<6;i++){
								if((first+i)<53){
									tab_weeks.push((first+i).toString());
									var last=i;
								}else{
									tab_weeks.push((i-last).toString());
								}
							}
							return tab_weeks;
					},
				first_index:function(year,month){
					return cal.__decalage(this.total_days(year,month,1));
				},
				days:function(year,month){
							/*! --- booleens de controle ---*/
							var lessyear=false;
							var plusyear=false;
							var lessmonth=month-1;
							var plusmonth=month+1;
							/*!-- initialisation mois --*/
							var months=this.months(year);
							/*! --- verifie position mois-1,mois+1, annee-1 et annee+1 ---*/
							if(month == 0){
								lessmonth=11;
								lessyear=true;
							}else if(month == 11){
								plusmonth=0;
								plusyear=true;
							}
							/*! --- calcul du nombre de jours du mois precedent à afficher ---*/
							var days_last_month=cal.__decalage(this.total_days(year,month,1));
							var tab_days=[];
							var i=0;
							/*! --- jours avant jours du mois --- */
							for(var j=months[lessmonth].number-days_last_month+1;j<months[lessmonth].number+1;j++){
								(lessyear==true)?tab_days.push(cal.day(year-1,lessmonth,j,false)):tab_days.push(cal.day(year,lessmonth,j,false));
								i++;
							}
							for(var j=1;j<months[month].number+1;j++){
								
								tab_days.push(cal.day(year,month,j,true));
								i++
							}
							for(var j=1;j<(43-months[month].number-days_last_month);j++){
								(plusyear=true)?tab_days.push(cal.day(year+1,plusmonth,j,false)):tab_days.push(cal.day(year,plusmonth,j,false));
								i++;
							}
							return tab_days;
				}
				};
	});
    
