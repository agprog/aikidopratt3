/*! classe FormDatas, qui permet de recuperer les donnees d'un formulaire ou d'une div et de les 
 * renvoyer sous forme de tableau ou de les serialiser */
function Datas(jqObj){
		this.target=jqObj;
		this.content_text=document.querySelectorAll(jqObj+" input");
		function parametre(name,type,value){
			this.name=name;
			this.type=type;
			this.value=value;
		}
		var parametres=[];
		// traite le cas des textes
			for (var i=0;i<this.content_text.length;i++){
				var valeur="";
				switch (this.content_text[i].getAttribute("type")){
					case "checkbox":
						if (!this.content_text[i].checked){
							valeur="";
						}else{
							valeur=true;
						}
						break;
					case "text":
					case "hidden" :
							valeur=this.content_text[i].value;
						break;
					default :
						break;
				}
				if(valeur){
					parametres.push(new parametre(this.content_text[i].getAttribute("name"),'input',valeur));
				}
					
			}
			//traite le cas des select
			this.content_select=document.querySelectorAll(jqObj+" select");
			for (var i=0;i<this.content_select.length;i++){
				var select=document.getElementById(this.content_select[i].id)
				for(var j=0;j<select.options.length;j++){
					if(select.options[j].selected){
						valeur=select.options[j].value;
						if (valeur){
							parametres.push(new parametre(this.content_select[i].getAttribute("name"),'select',valeur));
						}
					}
				}
			}
			//traite le cas des textareas
			this.content_textarea=document.querySelectorAll(jqObj+" textarea");
			for (var i=0;i<this.content_textarea.length;i++){
				if(this.content_textarea[i].value){
					parametres.push(new parametre(this.content_textarea[i].getAttribute("name"),'textarea',this.content_textarea[i].value));
				}
			}
			this.parametres=parametres;
			return this;
	}
	Datas.prototype={
		serialize:function(){
						var parametres=this.parametres;
						var s_="";
						for(var i=0;i<parametres.length;i++){
								s_+="&"+parametres[i].name+"="+parametres[i].value;
						}
						s_=s_.substring(1,s_.length);
						return s_;
					},
		jsonize:function(){
						var parametres=this.parametres;
						var j_={};
						for(var i=0;i<parametres.length;i++){
							j_[parametres[i].name]=parametres[i].value;
						}
						return j_;
		},
		clear:function(){
						/*!-- supression des erreurs */
						var erreurs=document.querySelectorAll('.errorlist');
						for(var i=0;i<erreurs.length;i++){
							erreurs[i].parentNode.removeChild(erreurs[i]);
						}
						/*!-- remise a zero des textes --*/
						for(var i=0;i<this.content_text.length;i++){
							if(this.content_text[i].type!="submit" && this.content_text[i].name != "csrfmiddlewaretoken"){
								this.content_text[i].value="";
							}
						}
						/*!-- remise a zero des textaeras*/
						for(var i=0;i<this.content_textarea.length;i++){
							this.content_textarea[i].innerHTML="";
						}
						/*!-- remise a zero des select --*/
						for(var i=0;i<this.content_select.length;i++){
							for(var j=0;j<this.content_select[i].options.length;j++){
								if(this.content_select[i].options[j].selected){
									this.content_select[i].options[j].selected=false;
								}
							}
						}
		}, //fin clear
		/*! remplissage auto du formulaire */
		fill:function(jdatas){
			var elt;
			for(var index in this.parametres){
				try{
					elt=document.querySelector("#"+this.parametres[index].name);
					switch(this.parametres[index].type){
						case 'input':
							elt.setAttribute('value',jdatas[this.parametres[index].name]);
							break;
						case 'textarea':
							elt.innerHTML=jdatas[this.parametres[index].name];
							break;
						default:
							break;
					}
				}catch(err){
					console.log(err);
				}
			}
		}
}
