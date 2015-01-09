'use strict';

/* Filters */

angular.module('index.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }])
  .filter('monthActuFlt',function(){
		return function(values,year,month){
			var temp_tab=[];
			angular.forEach(values,function(value,key){
				var re=new RegExp('^'+ year + '-' + month);
				try{
					if(value.date.match(re)){
						temp_tab.push([year,month,value.date.split('-')[2].slice(0,2)].join('-'));
					}
				}catch(error){
					console.log("l'information %s n'a pas de date de rdv",value._id);
				}
			});
			return temp_tab;
		}
	})
	.filter('setActuMarkersFlt',['calendarSrv',function(calendarSrv){
		return function(values,days,year,month){
			var first_index=calendarSrv.first_index(year,month);
			angular.forEach(values,function(value,key){
				var re=new RegExp('^'+year+'-'+('00'+(parseInt(month)+1)).slice(-2));
				try{
					console.log(year+'-'+('00'+month+1).slice(-2));
					if(value.date.match(re)){
						var date_tab=value.date.split('-');
						var actudate=[date_tab[0],date_tab[1],date_tab[2].slice(0,2)].join('-');
						console.log(actudate);
						var duration=parseInt(value.duration);
						var location=value.location;
						var day=0;
						var durate=0;
						while(day < 42){
							if([days[day].year,('00'+(days[day].month+1)).slice(-2),('00'+(days[day].day)).slice(-2)].join('-') == actudate){
								while(durate < duration && day<42){
									days[day].marker=true;
									days[day].search=days[day].year+"-"+parseInt(days[day].month)+1+"-"+(parseInt(days[day].day)-durate).toString();
									durate+=1;
									day+=1
								}
							}
							day+=1;
						}
					}
				}catch(error){
					console.log("l'information %s n'a pas de date de rdv");
				}
			
			});
			return days;
		}//end of return
		
	}]);
