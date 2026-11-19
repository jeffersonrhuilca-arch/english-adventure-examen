(function(){
var BASE=window.TOPICS,EXAM=window.EXAM,FB=window.FB,app=document.getElementById('app'),backBtn=document.getElementById('back');
var LS='ea_custom_v1',PINK='ea_pin';
function loadCustom(){try{return JSON.parse(localStorage.getItem(LS))||{topics:[],words:[]}}catch(e){return{topics:[],words:[]}}}
function saveCustom(c){try{localStorage.setItem(LS,JSON.stringify(c));return true}catch(e){alert('No hay espacio suficiente en este celular. Prueba con una foto más pequeña o sin grabación.');return false}}
function getPin(){return localStorage.getItem(PINK)||'1234'}
var T=[];
function rebuild(){var c=loadCustom();T=BASE.map(function(t){return Object.assign({},t,{items:t.items.slice()})});
  c.topics.forEach(function(t){T.push({id:t.id,icon:t.icon||'⭐',es:t.es,color:t.color||'#ff006e',custom:true,items:[]})});
  c.words.forEach(function(w){var t=T.filter(function(x){return x.id===w.topic})[0];if(!t)return;
    t.items.push({en:w.en,es:w.es,sayEn:w.en,sayEs:w.es,img:w.img||null,emoji:w.emoji||null,audEn:w.audEn||null,audEs:w.audEs||null,custom:w.id})});}
rebuild();
// ---------- audio ----------
var player=new Audio();player.preload='auto';var seqId=0;window.__played=[];var cache={};
function src(s){return s.key?'audio/'+s.key+'.mp3':s.data}
function preload(keys){keys.forEach(function(k){if(!k||cache[k])return;var a=new Audio();a.preload='auto';a.src='audio/'+k+'.mp3';cache[k]=a})}
function tts(s,done){if(!window.speechSynthesis||!s.text){done();return}try{var u=new SpeechSynthesisUtterance(s.text);u.lang=s.lang;u.rate=.85;u.onend=done;u.onerror=done;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){done()}}
function play(list){var my=++seqId,i=0;try{player.pause()}catch(e){}try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}
  function next(){if(my!==seqId||i>=list.length)return;var s=list[i++];if(!s){next();return}window.__played.push(s.key||s.data&&'data'||'tts:'+s.text);
    if(!s.key&&!s.data){tts(s,function(){setTimeout(next,250)});return}
    player.onended=function(){setTimeout(next,250)};player.onerror=function(){tts(s,next)};player.src=src(s);
    var p=player.play();if(p&&p.catch)p.catch(function(e){if(e&&e.name==='AbortError')return;tts(s,next)})}
  next()}
function stop(){seqId++;try{player.pause()}catch(e){}}
function en(it){return{key:it.aEn,data:it.audEn,text:it.sayEn||it.en,lang:'en-US'}}
function es(it){return{key:it.aEs,data:it.audEs,text:it.sayEs||it.es,lang:'es-MX'}}
function fb(k,txt,lang){return{key:FB[k],text:txt,lang:lang}}
// ---------- helpers ----------
function h(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function pic(o){if(o.sw)return '<div class="sw" style="background:'+o.sw+'"></div>';if(o.text)return '<div class="letter">'+esc(o.text)+'</div>';
  var n=o.n||1;if(o.img){var s='';for(var i=0;i<n;i++)s+='<img alt="" src="'+o.img+'">';return '<div class="pic n'+n+'">'+s+'</div>'}
  if(o.emoji){var e='';for(var j=0;j<n;j++)e+=o.emoji;return '<div class="pic">'+esc(e)+'</div>'}return '<div class="pic">❓</div>'}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
function go(fn,arg){stop();window.scrollTo(0,0);app.innerHTML='';fn(arg);backBtn.classList.toggle('hidden',fn===home);document.body.dataset.view=fn.name+(arg&&arg.id?':'+arg.id:'')}
backBtn.onclick=function(){go(home)};
// ---------- screens ----------
function home(){
  app.appendChild(h('h1',null,'¡Hola, explorador! 👋'));
  app.appendChild(h('div','sub','Toca un tema. Escucha en <b>inglés</b> 🇺🇸 y en <b>español</b> 🇪🇨'));
  var g=h('div','grid');
  T.forEach(function(t){var b=h('button','tile','<span class="e">'+esc(t.icon)+'</span>'+esc(t.es));b.style.background=t.color;b.dataset.topic=t.id;b.onclick=function(){go(topic,t)};g.appendChild(b)});
  var l=h('button','tile wide','<span class="e">🎧</span>Juego: Escucha y elige');l.style.background='#2ec4b6';l.id='go-listen';l.onclick=function(){go(listen,T.filter(function(x){return x.id==='toys'})[0])};g.appendChild(l);
  var x=h('button','tile wide','<span class="e">🏆</span>Mini examen (20)');x.style.background='#8338ec';x.id='go-exam';x.onclick=function(){go(exam)};g.appendChild(x);
  app.appendChild(g);
  app.appendChild(h('div','foot','Examen con Teacher Elizabeth · jueves 19 · 🔊 Sube el volumen del celular'));
  var a=h('button','adminlink','⚙️ Admin (papá/mamá)');a.id='go-admin';a.onclick=function(){go(pinScreen)};app.appendChild(a);
}
function topic(t){
  preload(t.items.map(function(i){return i.aEn}));
  app.appendChild(h('h2',null,esc(t.icon)+' '+esc(t.es)));
  if(!t.items.length){app.appendChild(h('div','sub','Este tema aún no tiene palabras. Agrégalas en ⚙️ Admin.'));return}
  app.appendChild(h('div','sub','Toca una tarjeta: primero inglés, luego español'));
  var g=h('div','grid');
  t.items.forEach(function(it){var c=h('button','card',pic(it)+'<div class="en">'+esc(it.en)+'</div><div class="es hide">'+esc(it.es)+'</div>');
    c.onclick=function(){g.querySelectorAll('.card.on').forEach(function(o){o.classList.remove('on')});c.classList.add('on');c.querySelector('.es').classList.remove('hide');play([en(it),es(it)])};g.appendChild(c)});
  app.appendChild(g);
  if(t.items.length>=2){var b=h('button','big','🎧 Jugar: Escucha y elige');b.style.background='#2ec4b6';b.id='topic-listen';b.onclick=function(){go(listen,t)};app.appendChild(b)}
  setTimeout(function(){preload(t.items.map(function(i){return i.aEs}))},800);
}
function listen(t){
  var ok=0,tot=0;
  app.appendChild(h('h2',null,'🎧 Escucha y elige'));
  var chips=h('div','chips');T.forEach(function(x){if(x.items.length<2)return;var c=h('button','chip'+(x.id===t.id?' on':''),esc(x.icon)+' '+esc(x.es));c.onclick=function(){go(listen,x)};chips.appendChild(c)});app.appendChild(chips);
  var sc=h('div','score');app.appendChild(sc);
  var again=h('button','big','🔊 Escuchar otra vez');again.style.background='#ff6b6b';again.id='again';app.appendChild(again);
  var opts=h('div','opts');app.appendChild(opts);
  preload(t.items.map(function(i){return i.aEn}).concat([FB.ok_en,FB.ok_es,FB.bad_en]));
  function round(){sc.textContent='⭐ '+ok+' / '+tot;var o=shuffle(t.items).slice(0,4);var tg=o[Math.floor(Math.random()*o.length)];opts.innerHTML='';var done=false;
    again.onclick=function(){play([en(tg)])};
    o.forEach(function(it){var b=h('button','opt',pic(it));b.dataset.ok=it===tg?'1':'0';
      b.onclick=function(){if(done)return;tot++;if(it===tg){done=true;ok++;b.classList.add('good');sc.textContent='⭐ '+ok+' / '+tot;play([fb('ok_en','Great job!','en-US'),es(tg)]);setTimeout(round,1900)}else{b.classList.add('badc');sc.textContent='⭐ '+ok+' / '+tot;play([fb('bad_en','Oops! Try again.','en-US'),en(tg)])}};opts.appendChild(b)});
    setTimeout(function(){play([en(tg)])},300)}
  round();
}
function exam(){
  var qi=0,ok=0;preload(EXAM.map(function(q){return q.aL}).filter(Boolean).concat([FB.ok_en,FB.ok_es,FB.bad_en]));
  function show(){app.innerHTML='';
    if(qi>=EXAM.length){var stars=ok>=18?'🌟🌟🌟':ok>=13?'🌟🌟':ok>=8?'🌟':'💪';
      app.appendChild(h('h2',null,'🏆 ¡Terminaste!'));app.appendChild(h('div','qbox','<div class="letter" id="final">'+ok+' / '+EXAM.length+'</div><div class="qtext">'+stars+'</div><div class="sub">'+(ok>=16?'¡Excelente! Estás listo para el examen.':'¡Bien! Practica los temas otra vez y vuelve a intentarlo.')+'</div>'));
      var r=h('button','big','🔁 Repetir examen');r.style.background='#8338ec';r.onclick=function(){go(exam)};app.appendChild(r);
      var hm=h('button','big','🏠 Inicio');hm.style.background='#ff9f1c';hm.onclick=function(){go(home)};app.appendChild(hm);play([fb('ok_en','Great job!','en-US'),fb('ok_es','¡Muy bien!','es-MX')]);return}
    var q=EXAM[qi],picked=false;
    app.appendChild(h('div','score','Pregunta '+(qi+1)+' de '+EXAM.length+' · ⭐ '+ok));
    app.appendChild(h('div','bar','<i style="width:'+(qi/EXAM.length*100)+'%"></i>'));
    var box=h('div','qbox','<div class="qtext">'+esc(q.q)+'</div>'+((q.img||q.sw||q.text)?pic(q):''));app.appendChild(box);
    if(q.aL){var l=h('button','big','🔊 Escuchar');l.style.background='#2ec4b6';l.id='qlisten';l.onclick=function(){play([{key:q.aL,text:q.listen,lang:'en-US'}])};box.appendChild(l);setTimeout(function(){play([{key:q.aL,text:q.listen,lang:'en-US'}])},300)}
    var opts=h('div','opts');app.appendChild(opts);
    var nx=h('button','big hidden',qi+1<EXAM.length?'Siguiente ➜':'Ver resultado 🏆');nx.style.background='#8338ec';nx.id='next';nx.onclick=function(){qi++;show()};
    q.options.forEach(function(o){var b=h('button','opt',q.imgOpts?'<img alt="" src="img/'+o+'.webp">':esc(o));b.dataset.ok=o===q.answer?'1':'0';
      b.onclick=function(){if(picked)return;picked=true;if(o===q.answer){ok++;b.classList.add('good');play([fb('ok_en','Great job!','en-US'),fb('ok_es','¡Muy bien!','es-MX')])}else{b.classList.add('badc');opts.querySelectorAll('.opt').forEach(function(x){if(x.dataset.ok==='1')x.classList.add('good')});play([fb('bad_en','Oops! Try again.','en-US')])}nx.classList.remove('hidden')};opts.appendChild(b)});
    app.appendChild(nx);
  }
  show();
}
// ---------- admin ----------
var adminOK=false;
function pinScreen(){if(adminOK){admin();return}
  app.appendChild(h('h2',null,'⚙️ Admin'));var p=h('div','panel','<label>Escribe el PIN</label><input id="pin" type="password" inputmode="numeric" autocomplete="off"><div class="row" style="margin-top:10px"><button class="sbtn pri" id="pinok">Entrar</button></div><div id="pinmsg" style="color:#e63946;margin-top:6px"></div>');app.appendChild(p);
  p.querySelector('#pinok').onclick=function(){if(p.querySelector('#pin').value===getPin()){adminOK=true;go(admin)}else p.querySelector('#pinmsg').textContent='PIN incorrecto'}}
function resizeImg(file,cb){var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var m=300,s=Math.min(1,m/Math.max(im.width,im.height));var c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',.8))};im.onerror=function(){alert('No se pudo leer la imagen')};im.src=r.result};r.readAsDataURL(file)}
function admin(){
  var c=loadCustom(),edit=null,form={img:null,audEn:null,audEs:null};
  app.appendChild(h('h2',null,'⚙️ Admin'));
  app.appendChild(h('div','note','📱 Las palabras que agregues se guardan <b>solo en este celular (este navegador)</b>. Para pasarlas a otro teléfono usa <b>Exportar</b> aquí y luego <b>Importar</b> en el otro.'));
  var opts=T.map(function(t){return '<option value="'+esc(t.id)+'">'+esc(t.icon+' '+t.es)+'</option>'}).join('')+'<option value="__new">➕ Nuevo tema…</option>';
  var f=h('div','panel','<h3 id="ftitle">➕ Agregar palabra</h3>'+
    '<label>Tema</label><select id="ftopic">'+opts+'</select>'+
    '<div id="newt" class="hidden"><label>Nombre del tema (español)</label><input type="text" id="ntname" placeholder="Ej: Los animales"><label>Emoji del tema</label><input type="text" id="nticon" placeholder="🐶"></div>'+
    '<label>Palabra en inglés</label><input type="text" id="fen" placeholder="Ej: ruler" autocapitalize="off">'+
    '<label>Palabra en español</label><input type="text" id="fes" placeholder="Ej: regla">'+
    '<label>Dibujo o foto</label><div class="row"><button class="sbtn" id="bcam">📷 Tomar foto</button><button class="sbtn" id="bgal">🖼️ Galería</button><input type="text" id="femo" placeholder="o un emoji" style="width:130px"></div>'+
    '<input type="file" id="icam" accept="image/*" capture="environment" class="hidden"><input type="file" id="igal" accept="image/*" class="hidden"><div id="prev" style="margin-top:8px"></div>'+
    '<label>Voz (opcional)</label><div class="row"><button class="sbtn rec" id="ren">🎙️ Grabar inglés</button><button class="sbtn rec" id="res">🎙️ Grabar español</button></div><div id="recmsg" style="font-size:15px;color:#555;margin-top:4px">Si no grabas, el celular leerá la palabra con su voz.</div>'+
    '<div class="row" style="margin-top:12px"><button class="sbtn pri" id="fsave">💾 Guardar</button><button class="sbtn hidden" id="fcancel">Cancelar</button></div><div id="fmsg" style="margin-top:6px;font-weight:700"></div>');
  app.appendChild(f);
  var $=function(id){return f.querySelector('#'+id)};
  $('ftopic').onchange=function(){$('newt').classList.toggle('hidden',this.value!=='__new')};
  $('bcam').onclick=function(){$('icam').click()};$('bgal').onclick=function(){$('igal').click()};
  function onFile(e){var file=e.target.files[0];if(!file)return;resizeImg(file,function(d){form.img=d;$('prev').innerHTML='<img src="'+d+'">'})}
  $('icam').onchange=onFile;$('igal').onchange=onFile;
  function recBtn(btn,field,label){var rec=null,chunks=[];btn.onclick=function(){
      if(rec){rec.stop();return}
      if(!navigator.mediaDevices||!window.MediaRecorder){alert('Este navegador no permite grabar. Se usará la voz del celular.');return}
      navigator.mediaDevices.getUserMedia({audio:true}).then(function(st){chunks=[];rec=new MediaRecorder(st);rec.ondataavailable=function(ev){chunks.push(ev.data)};
        rec.onstop=function(){st.getTracks().forEach(function(t){t.stop()});var b=new Blob(chunks,{type:rec.mimeType||'audio/webm'});var r=new FileReader();r.onload=function(){form[field]=r.result;btn.textContent='✅ '+label+' (grabado) – tocar para regrabar';new Audio(r.result).play()};r.readAsDataURL(b);rec=null};
        rec.start();btn.textContent='⏹️ Detener grabación';setTimeout(function(){if(rec&&rec.state==='recording')rec.stop()},6000)}).catch(function(){alert('No se pudo usar el micrófono.')})}}
  recBtn($('ren'),'audEn','Inglés');recBtn($('res'),'audEs','Español');
  $('fcancel').onclick=function(){go(admin)};
  $('fsave').onclick=function(){var en_=$('fen').value.trim(),es_=$('fes').value.trim(),tp=$('ftopic').value;
    if(!en_||!es_){$('fmsg').textContent='Escribe la palabra en inglés y en español.';return}
    if(tp==='__new'){var nm=$('ntname').value.trim();if(!nm){$('fmsg').textContent='Escribe el nombre del nuevo tema.';return}
      tp='c'+Date.now();var cols=['#ff006e','#3a86ff','#8ac926','#ffbe0b','#fb5607','#6a4c93'];c.topics.push({id:tp,es:nm,icon:$('nticon').value.trim()||'⭐',color:cols[c.topics.length%cols.length]})}
    var w={id:edit?edit.id:'w'+Date.now(),topic:tp,en:en_,es:es_,img:form.img,emoji:$('femo').value.trim()||null,audEn:form.audEn,audEs:form.audEs};
    if(edit){c.words=c.words.map(function(x){return x.id===edit.id?w:x})}else c.words.push(w);
    if(saveCustom(c)){rebuild();go(admin);var m=document.getElementById('fmsg');if(m){m.style.color='#06a77d';m.textContent='✅ Guardado: '+en_+' = '+es_}}};
  // list
  var list=h('div','panel','<h3>📝 Mis palabras agregadas ('+c.words.length+')</h3>');app.appendChild(list);
  if(!c.words.length)list.appendChild(h('div',null,'Todavía no agregaste palabras.'));
  c.words.forEach(function(w){var t=T.filter(function(x){return x.id===w.topic})[0];var r=h('div','wl',pic({img:w.img,emoji:w.emoji})+'<div class="t"><b>'+esc(w.en)+'</b> = '+esc(w.es)+'<br><small>'+esc(t?t.icon+' '+t.es:'')+'</small></div>');
    var e=h('button','sbtn','✏️');e.onclick=function(){edit=w;form={img:w.img,audEn:w.audEn,audEs:w.audEs};$('ftitle').textContent='✏️ Editar palabra';$('ftopic').value=w.topic;$('fen').value=w.en;$('fes').value=w.es;$('femo').value=w.emoji||'';$('prev').innerHTML=w.img?'<img src="'+w.img+'">':'';if(w.audEn)$('ren').textContent='✅ Inglés (grabado) – tocar para regrabar';if(w.audEs)$('res').textContent='✅ Español (grabado) – tocar para regrabar';$('fcancel').classList.remove('hidden');window.scrollTo(0,0)};
    var d=h('button','sbtn red','🗑️');d.onclick=function(){if(!confirm('¿Borrar "'+w.en+'"?'))return;c.words=c.words.filter(function(x){return x.id!==w.id});saveCustom(c);rebuild();go(admin)};
    r.appendChild(e);r.appendChild(d);list.appendChild(r)});
  if(c.topics.length){var tl=h('div','panel','<h3>📂 Mis temas</h3>');c.topics.forEach(function(t){var r=h('div','wl','<div class="t">'+esc(t.icon+' '+t.es)+'</div>');var d=h('button','sbtn red','🗑️ Borrar tema');d.onclick=function(){if(!confirm('¿Borrar el tema "'+t.es+'" y sus palabras?'))return;c.topics=c.topics.filter(function(x){return x.id!==t.id});c.words=c.words.filter(function(x){return x.topic!==t.id});saveCustom(c);rebuild();go(admin)};r.appendChild(d);tl.appendChild(r)});app.appendChild(tl)}
  // export/import/pin
  var ex=h('div','panel','<h3>🔁 Pasar a otro celular</h3><div class="row"><button class="sbtn pri" id="bexp">⬇️ Exportar</button><button class="sbtn" id="bimp">⬆️ Importar</button><input type="file" id="fimp" accept="application/json,.json" class="hidden"></div>'+
    '<h3 style="margin-top:16px">🔒 Cambiar PIN</h3><div class="row"><input type="password" id="npin" inputmode="numeric" placeholder="Nuevo PIN" style="flex:1"><button class="sbtn pri" id="bpin">Cambiar</button></div><div id="pmsg"></div>');app.appendChild(ex);
  ex.querySelector('#bexp').onclick=function(){var b=new Blob([JSON.stringify(loadCustom())],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='english-adventure-palabras.json';document.body.appendChild(a);a.click();a.remove()};
  ex.querySelector('#bimp').onclick=function(){ex.querySelector('#fimp').click()};
  ex.querySelector('#fimp').onchange=function(e){var file=e.target.files[0];if(!file)return;var r=new FileReader();r.onload=function(){try{var d=JSON.parse(r.result);if(!d.words||!d.topics)throw 0;var cur=loadCustom();
      var tids=cur.topics.map(function(x){return x.id}),wids=cur.words.map(function(x){return x.id});d.topics.forEach(function(t){if(tids.indexOf(t.id)<0)cur.topics.push(t)});d.words.forEach(function(w){if(wids.indexOf(w.id)<0)cur.words.push(w)});
      if(saveCustom(cur)){rebuild();alert('✅ Importadas '+d.words.length+' palabras');go(admin)}}catch(x){alert('Ese archivo no es válido.')}};r.readAsText(file)};
  ex.querySelector('#bpin').onclick=function(){var v=ex.querySelector('#npin').value.trim();if(v.length<4){ex.querySelector('#pmsg').textContent='El PIN debe tener al menos 4 números.';return}localStorage.setItem(PINK,v);ex.querySelector('#pmsg').textContent='✅ PIN cambiado'};
}
go(home);
})();
