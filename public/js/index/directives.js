'use strict';

/* Directives */


angular.module('index.directives', []).
	directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
	}]).
	directive('calendar',['$filter','calendarSrv','getSrv',function($filter,calendarSrv,getSrv){
		return {
			scope:{'instance':'@',
				'dates':'='
					},
			restrict:'A,E',
			replace:true,
			transclude:true,
			templateUrl:'/static/js/index/templates/calendar.html',
			controller:function($scope){
				var date=new Date();
				var markers=[];
				$scope.currentmonth=date.getMonth();
				$scope.currentyear=date.getFullYear();
				$scope.refresh=function(){
					$scope.months=calendarSrv.months($scope.currentyear,$scope.currentmonth);
					$scope.days=calendarSrv.days($scope.currentyear,$scope.currentmonth);
					$scope.days=$filter('setActuMarkersFlt')($scope.dates,$scope.days,$scope.currentyear,$scope.currentmonth);
				}
				$scope.markerlink=function(){
					angular.element(document.querySelectorAll('.marker')).on('click',function(event){
								var date=event.target.getAttribute('data-date');
								getSrv('/actualites/'+date).success(function(response){
									var actualite=window.location.href='/actualites/#'+response.id;
									/*!--- recuperer la position de l'ancre ---*/
								});
								
					});
				}
				
			},	
			link:function(scope,element,attrs,controller){
				var timer;
				function isLoaded(){
					var elt=element.find('#lessone-m-'+scope.instance);
					if(elt != null && scope.dates){
						clearInterval(timer);
						scope.refresh();
						scope.$digest();
						scope.markerlink();
						/*--- liste des evenements ---*/
						element.find(elt).on('click',function(event){
							event.preventDefault();
							if(scope.currentmonth-1<0){
								scope.currentmonth=11;
								scope.currentyear-=1;
							}else{
								scope.currentmonth-=1;
							}
							scope.refresh();
							scope.$digest();
							scope.markerlink();
							
						});
						element.find('#moreone-m-'+scope.instance).on('click',function(event){
							event.preventDefault();
							if(scope.currentmonth+1>11){
								scope.currentmonth=0;
								scope.currentyear+=1;
							}else{
								scope.currentmonth+=1;
							}
							scope.refresh();
							scope.$digest();
							scope.markerlink();
						});
						element.find('#select-m-'+scope.instance).on('change',function(event){
							scope.days=calendarSrv.days(scope.currentyear,scope.currentmonth);
							scope.$digest();
						});
						element.find('#lessone-y-'+scope.instance).on('click',function(event){
							if(scope.currentyear-1 >1900){
								scope.currentyear-=1;
							}
							scope.currentyear=parseInt(scope.currentyear)-1;
							scope.refresh();
							scope.$digest();
							scope.markerlink();
						});
						element.find('#year-'+scope.instance).on('blur',function(event){
							scope.refresh();
							scope.$digest();
							scope.markerlink();
						});
						element.find('#moreone-y-'+scope.instance).on('click',function(event){
							scope.currentyear=parseInt(scope.currentyear)+1;
							scope.refresh();
							scope.$digest();
							scope.markerlink();
						});
					}
				}
				timer=setInterval(isLoaded,10);
			}
		}//end of return
		
	}]).
	directive('panel',function(){
		return {
			scope:{items:'=',
					instance:'@',
					template:'@'
					},
			restrict:'A,E',
			templateUrl:'/static/js/index/templates/panel.html',
			link:function(scope,element,attrs){
				var onload=false;
				var timer;
				var labels;
				scope.isSelected=0;
				function isLoaded(){
					labels=document.querySelectorAll('.label-panel,.label-active');
					if(labels.length > 0){
						clearInterval(timer);
						angular.element(labels).bind('click',function(event){
							scope.isSelected=event.target.getAttribute('data-index');
							console.log(scope.isSelected);
							scope.$digest();
						});
					}
				}//end of isloaded
				timer=setInterval(isLoaded,10);
			}
				
		}//end of return
	}).
	directive('googlemaps',function(){
		return{
			scope:{
				id:'@',
				coordonnees:'=',
				lieu:'=',
			},
			restrict:'E',
			link:function(scope,element,attrs){
				var timer;
				function init(){
					
					/*!--- on cree le marqueur --*/
					try{
						var target=document.getElementById(scope.id);
						clearInterval(timer);
						var x=scope.coordonnees.split(',')[0];
						var y=scope.coordonnees.split(',')[1];
						var coordonates=new google.maps.LatLng(x,y);
						/*center:coordonates,*/
						var mapOptions={
							center:coordonates,
							mapTypeId:google.maps.MapTypeId.ROADMAP,
							zoom:12
						};
						new google.maps.Marker({
							position: coordonates,
							map:new google.maps.Map(target,mapOptions), 
							title:scope.lieu
						});
						
					}catch(error){
						console.log('map is pending');
					}
					 }//end of init
				timer=setInterval(init,10);
			}//end of link
		};
	}).
	directive('carousel',function(){
		return{
			scope:{'slides':'=',
				'sens':'@',
				'defilement':'@',
				'instance':'@',
				'template':'@'},
			restrict:'A,E',
			transclude:true,
			replace:true,
			templateUrl:'/static/js/index/templates/carousel.html',
			link:function(scope,element,attrs){
					var prefixs=['-o-','-moz-','-webkit-'];
					scope.current=0;
					try{scope.sens}catch(err){scope.sens=1;}
					try{scope.defilement}catch(err){scope.defilement='v';}
					try{scope.instance}catch(err){scope.instance=0;}
					scope.ecart=270;
					element.on('mouseover',hover);
					element.on('mouseleave',leave);
					element.find('.commands-first').on('click',first);
					element.find('.commands-less-one').on('click',less_one);
					element.find('.commands-play').on('click',play);
					element.find('.commands-plus-one').on('click',plus_one);
					element.find('.commands-last').on('click',last);
					scope.interval=setInterval(change,3000);
					
					function hover(){
						try{
							document.querySelector(["#container",scope.defilement,scope.instance].join('-')).setAttribute("id",["container",scope.defilement,scope.instance,"hover"].join('-'));
							document.querySelector(["#screen",scope.defilement,scope.instance].join('-')).setAttribute("id",["screen",scope.defilement,scope.instance,"hover"].join('-'));
							/*document.querySelector(["#less-command",scope.defilement,scope.instance].join('-')).setAttribute("id",["less-command",scope.defilement,scope.instance,"hover"].join('-'));
							document.querySelector(["#plus-command",scope.defilement,scope.instance].join('-')).setAttribute("id",["plus-command",scope.defilement,scope.instance,"hover"].join('-'));*/
							document.querySelector(["#carousel-commands",scope.defilement,scope.instance].join('-')).setAttribute("id",["carousel-commands",scope.defilement,scope.instance,"hover"].join('-'));
						}catch(error){
							console.log("pending hover");
						}
					};//end of hover
					function leave(){
						try{
							document.querySelector(["#container",scope.defilement,scope.instance,"hover"].join('-')).setAttribute("id",["container",scope.defilement,scope.instance].join('-'));
							document.querySelector(["#screen",scope.defilement,scope.instance,"hover"].join('-')).setAttribute("id",["screen",scope.defilement,scope.instance].join('-'));
							/*document.querySelector(["#less-command",scope.defilement,scope.instance,"hover"].join('-')).setAttribute("id",["less-command",scope.defilement,scope.instance].join('-'));
							document.querySelector(["#plus-command",scope.defilement,scope.instance,"hover"].join('-')).setAttribute("id",["plus-command",scope.defilement,scope.instance].join('-'));*/
							document.querySelector(["#carousel-commands",scope.defilement,scope.instance,"hover"].join('-')).setAttribute("id",["carousel-commands",scope.defilement,scope.instance].join('-'));
						}catch(error){
							console.log("pending leave");
						}
					};//end of leave
					function change(){
						if(scope.current<0){scope.current=scope.slides.length-1}
						if(scope.current>scope.slides.length-1){scope.current=0}
						/*clearInterval(this.interval);*/
						var styleTab=Array();
						if(scope.defilement == 'h'){
							for(var prefix in prefixs){
								styleTab.push(prefixs[prefix]+"transform:translateX("+scope.current*-scope.ecart+"px)");
							}
						}else{
							for(var prefix in prefixs){
								styleTab.push(prefixs[prefix]+"transform:translateY("+scope.current*-scope.ecart+"px)");
							}
						}
						var liste_slides_id=["#list-slides",scope.defilement,scope.instance].join("-");
						document.querySelectorAll(liste_slides_id)[0].setAttribute('style',styleTab.join(';'));
						if(scope.interval != null){
							scope.current+=parseInt(scope.sens);
						}
					};//end of change
					function less_one(){
						(scope.current-1<0)?scope.current=scope.slides.length-1:scope.current-=1;
						clearInterval(scope.interval);
						scope.interval=null;
						change();
					};//end of less one
					function plus_one(){
						(scope.current+1<scope.slides.length)?scope.current+=1:scope.current=0;
						clearInterval(scope.interval);
						scope.interval=null;
						change();
					};//end of plus_one
					function last(){
						scope.current=scope.slides.length-1;
						clearInterval(scope.interval);
						scope.interval=null;
						change();
					};//end of last
					function first(){
						scope.current=0;
						clearInterval(scope.interval);
						scope.interval=null;
						change();
					};//end of first
					function play(){
						if(scope.interval != null){
							clearInterval(scope.interval);
							scope.interval=null;
						}else{
							scope.interval=setInterval(change,3000);
							
						}
					};//end of play
			}//end of link
		}//end of return
	}).
directive('flexbox',function(){
		return{
			scope:{'slides':'=',
				'instance':'@',
				'template':'@'},
			restrict:'A,E',
			transclude:true,
			replace:true,
			templateUrl:'/static/js/index/templates/flexbox.html',
			link:function(scope,element,attrs){
					var animating = false;
					var active=0;
					var container,items,properties,boxOrdinalGroup;
					function move(e){
						// prevent the click action
				        e.preventDefault();
				        // check if the carousel is mid-animation
				        if (!animating) {
							console.log('move');
				            // get the event's source element
				            var target = e.target || e.srcElement;
				            // find out if we are moving next or previous based on class
				            var next = target.classList.contains( 'next' );
				            var margin = 0;//= parseInt(items.style.marginLeft) || 0;
				            // allow our carousel to animate
				            container.classList.add( 'animate' );
				            animating = true;
				            if (next) {
				                margin = -( ( properties.width*2 )+ properties.marginRight );
				                if ( active < items.children.length - 1 ) {
				                    active++;
				                } else {
				                    active = 0;
				                }
				            } else {
				
				                margin = properties.marginRight;
				
				                if ( active > 0 ) {
				                    active--;
				                } else {
				                    active = items.children.length - 1;
				                }
				            }
				
				            items.style.marginLeft = margin + 'px';
				        }
						    }//end of move
						
						    function complete() {
						        if ( animating ) {
									console.log('complete');
						            animating = false;
						            // this needs to be removed so animation does not occur when the ordinal is changed and the carousel reshuffled
						            container.classList.remove( 'animate' );
						            // change the ordinal
						            changeOrdinal();
						            // change the margin now there are a different number of items off screen
						            items.style.marginLeft = -( properties.width ) + 'px';
						        }
						    }// end of complete
						
						
						    function changeOrdinal() {
						        var length = items.children.length, 
						            ordinal = 0; 
						        // start at the item BEFORE the active one.
						        var index = active-1;
						
						        /* if the active item was 0, we're now at -1 so
						            set to the last item */
						        if (index < 0) {
						            index = length-1;
						        }
						        // now run through adding the ordinals
						        while ( ordinal < length ) {
						            // add 1 to the ordinal - ordinal cannot be 0.
						            ordinal++;
						
						            // check the item definetely exists :)
						            var item = items.children[index];
						            if ( item && item.style ) {
						                // new ordinal value
						                item.style[boxOrdinalGroup] = ordinal;
						            }
						
						            /* as we are working from active we need to go back to
						               the start if we reach the end of the item list */
						            if ( index < length-1 ) {
						                index++;
						            } else {
						                index = 0;
						            }
						        }
						    }//end of ordinal
					function init(){
						try{
							container = document.getElementById('flexbox');
							items = document.getElementById('flexbox-ul');
							clearInterval(interval);
							active = 0; // the active item (sits far left)
							properties = {}; // used to calculate scroll distance
								 // whether the carousel is currently animating
								// use Modernizr.prefixed to get the prefixed version of boxOrdinalGroup
							boxOrdinalGroup = Modernizr.prefixed( 'boxOrdinalGroup' );
							var transEndEventNames = {
													'WebkitTransition' : 'webkitTransitionEnd',
													'MozTransition'    : 'transitionend',
													'OTransition'      : 'oTransitionEnd',
													'msTransition'     : 'MsTransitionEnd',
													'transition'       : 'transitionend'
													};
								// use Modernizr.prefixed to work out which one we need
							var transitionEnd = transEndEventNames[ Modernizr.prefixed('transition') ];
							// get initial width and margin
				            if (items.children.length > 0) {     
				                var itemStyle = window.getComputedStyle( items.children[0], null ) || items.children[0].currentStyle;
				                properties = {
				                    width: parseInt( itemStyle.getPropertyValue( 'width' ), 10 ),
				                    marginRight: parseInt( itemStyle.getPropertyValue( 'margin-right' ), 10 )
				                };
				            }
				            // set the initial ordinal values
				            
							element.find('a.navigation').bind('click',move);
							element.find('ul').bind(transitionEnd,complete);
							changeOrdinal();
							
						}catch(error){
							console.log('pending init');
						}
						
					}//end of _init_
			var interval=setInterval(init,50);
		}//end of link
	};//end of return
});//end directive
