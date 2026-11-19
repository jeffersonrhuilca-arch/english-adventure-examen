(function(){
var T=window.TOPICS,EXAM=window.EXAM,FB=window.FB,app=document.getElementById('app'),backBtn=document.getElementById('back');
var player=new Audio();player.preload='auto';var seqId=0;window.__played=[];var cache={};
function url(k){return 'audio/'+k+'.mp3'}
function preload(keys){keys.forEach(function(k){if(!k||cache[k])return;var a=new Audio();a.preload='auto';a.src=url(k);cache[k]=a;});}
var TEXT={};T.forEach(function(t){t.items.forEach(function(i){TEXT[i.aEn]=[i.sayEn,'en-US'];TEXT[i.aEs]=[i.sayEs,'es-MX'];})});
EXAM.forEach(function(q){if(q.aL)TEXT[q.aL]=[q.listen,'en-US']});
function tts(k,done){var t=TEXT[k];if(!t||!window.speechSynthesis){done();return}try{var u=new SpeechSynthesisUtterance(t[0]);u.lang=t[1];u.rate=.85;u.onend=done;u.onerror=done;speechSynthesis.cancel();speechSynthesis.speak(u);}catch(e){done()}}
function play(keys){var my=++seqId;var i=0;try{player.pause()}catch(e){}
  function next(){if(my!==seqId||i>=keys.length)return;var k=keys[i++];if(!k){next();return}
    window.__played.push(k);player.onended=function(){setTimeout(next,250)};player.onerror=function(){tts(k,next)};
    player.src=url(k);var p=player.play();if(p&&p.catch)p.catch(function(e){if(e&&e.name==='AbortError')return;tts(k,next)});}
  next();}
function stop(){seqId++;try{player.pause()}catch(e){}}
function h(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function pic(o){if(o.sw)return '<div class="sw" style="background:'+o.sw+'"></div>';if(o.text)return '<div class="letter">'+esc(o.text)+'</div>';
  if(o.pic)return '<div class="pic'+(o.pic.length>2?' many':'')+'">'+o.pic.join('')+'</div>';return ''}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
var view='home';
function go(fn,arg){stop();window.scrollTo(0,0);app.innerHTML='';fn(arg);backBtn.classList.toggle('hidden',fn===home);view=fn.name+(arg&&arg.id?':'+arg.id:'');document.body.dataset.view=view;}
backBtn.onclick=function(){go(home)};
function home(){
  app.appendChild(h('h1',null,'¡Hola, explorador! 👋'));
  app.appendChild(h('div','sub','Toca un tema. Escucha en <b>inglés</b> 🇺🇸 y en <b>español</b> 🇪🇨'));
  var g=h('div','grid');
  T.forEach(function(t){var b=h('button','tile','<span class="e">'+t.icon+'</span>'+esc(t.es));b.style.background=t.color;b.dataset.topic=t.id;b.onclick=function(){go(topic,t)};g.appendChild(b)});
  var l=h('button','tile wide','<span class="e">🎧</span>Juego: Escucha y elige');l.style.background='#2ec4b6';l.id='go-listen';l.onclick=function(){go(listen,T[4])};g.appendChild(l);
  var x=h('button','tile wide','<span class="e">🏆</span>Mini examen (20)');x.style.background='#8338ec';x.id='go-exam';x.onclick=function(){go(exam)};g.appendChild(x);
  app.appendChild(g);
  app.appendChild(h('div','foot','Examen con Teacher Elizabeth · jueves 19 · 🔊 Sube el volumen del celular'));
}
function topic(t){
  preload(t.items.map(function(i){return i.aEn}));
  app.appendChild(h('h2',null,t.icon+' '+esc(t.es)));
  app.appendChild(h('div','sub','Toca una tarjeta: primero inglés, luego español'));
  var g=h('div','grid');
  t.items.forEach(function(it){var c=h('button','card',pic(it)+'<div class="en">'+esc(it.en)+'</div><div class="es hide">'+esc(it.es)+'</div>');
    c.onclick=function(){g.querySelectorAll('.card.on').forEach(function(o){o.classList.remove('on')});c.classList.add('on');c.querySelector('.es').classList.remove('hide');play([it.aEn,it.aEs])};g.appendChild(c)});
  app.appendChild(g);
  var b=h('button','big','🎧 Jugar: Escucha y elige');b.style.background='#2ec4b6';b.id='topic-listen';b.onclick=function(){go(listen,t)};app.appendChild(b);
  setTimeout(function(){preload(t.items.map(function(i){return i.aEs}))},800);
}
function listen(t){
  var ok=0,tot=0;
  app.appendChild(h('h2',null,'🎧 Escucha y elige'));
  var chips=h('div','chips');T.forEach(function(x){var c=h('button','chip'+(x===t?' on':''),x.icon+' '+esc(x.es));c.onclick=function(){go(listen,x)};chips.appendChild(c)});app.appendChild(chips);
  var sc=h('div','score');app.appendChild(sc);
  var again=h('button','big','🔊 Escuchar otra vez');again.style.background='#ff6b6b';again.id='again';app.appendChild(again);
  var opts=h('div','opts');app.appendChild(opts);
  preload(t.items.map(function(i){return i.aEn}).concat([FB.ok_en,FB.ok_es,FB.bad_en]));
  function round(){sc.textContent='⭐ '+ok+' / '+tot;var o=shuffle(t.items).slice(0,4);var tg=o[Math.floor(Math.random()*o.length)];opts.innerHTML='';var done=false;
    again.onclick=function(){play([tg.aEn])};
    o.forEach(function(it){var b=h('button','opt',it.sw||it.pic||it.text?pic(it):esc(it.en));b.dataset.ok=it===tg?'1':'0';
      b.onclick=function(){if(done)return;if(it===tg){done=true;ok++;tot++;b.classList.add('good');sc.textContent='⭐ '+ok+' / '+tot;play([FB.ok_en,tg.aEs]);setTimeout(round,1900)}else{b.classList.add('badc');tot++;sc.textContent='⭐ '+ok+' / '+tot;play([FB.bad_en,tg.aEn])}};opts.appendChild(b)});
    setTimeout(function(){play([tg.aEn])},300);}
  round();
}
function exam(){
  var qi=0,ok=0;
  var keys=[];EXAM.forEach(function(q){if(q.aL)keys.push(q.aL)});preload(keys.concat([FB.ok_en,FB.ok_es,FB.bad_en]));
  function show(){app.innerHTML='';
    if(qi>=EXAM.length){var stars=ok>=18?'🌟🌟🌟':ok>=13?'🌟🌟':ok>=8?'🌟':'💪';
      app.appendChild(h('h2',null,'🏆 ¡Terminaste!'));app.appendChild(h('div','qbox','<div class="letter" id="final">'+ok+' / '+EXAM.length+'</div><div class="qtext">'+stars+'</div><div class="sub">'+(ok>=16?'¡Excelente! Estás listo para el examen.':'¡Bien! Practica los temas otra vez y vuelve a intentarlo.')+'</div>'));
      var r=h('button','big','🔁 Repetir examen');r.style.background='#8338ec';r.onclick=function(){go(exam)};app.appendChild(r);
      var hm=h('button','big','🏠 Inicio');hm.style.background='#ff9f1c';hm.onclick=function(){go(home)};app.appendChild(hm);play([FB.ok_en,FB.ok_es]);return}
    var q=EXAM[qi];var picked=false;
    app.appendChild(h('div','score','Pregunta '+(qi+1)+' de '+EXAM.length+' · ⭐ '+ok));
    var bar=h('div','bar','<i style="width:'+(qi/EXAM.length*100)+'%"></i>');app.appendChild(bar);
    var box=h('div','qbox','<div class="qtext">'+esc(q.q)+'</div>'+pic(q));app.appendChild(box);
    if(q.aL){var l=h('button','big','🔊 Escuchar');l.style.background='#2ec4b6';l.id='qlisten';l.onclick=function(){play([q.aL])};box.appendChild(l);setTimeout(function(){play([q.aL])},300)}
    var opts=h('div','opts');app.appendChild(opts);
    var nx=h('button','big hidden',qi+1<EXAM.length?'Siguiente ➜':'Ver resultado 🏆');nx.style.background='#8338ec';nx.id='next';nx.onclick=function(){qi++;show()};
    q.options.forEach(function(o){var b=h('button','opt'+(q.emo?' emo':''),esc(o));b.dataset.ok=o===q.answer?'1':'0';
      b.onclick=function(){if(picked)return;picked=true;var right=o===q.answer;if(right){ok++;b.classList.add('good');play([FB.ok_en,FB.ok_es])}else{b.classList.add('badc');opts.querySelectorAll('.opt').forEach(function(x){if(x.dataset.ok==='1')x.classList.add('good')});play([FB.bad_en])}nx.classList.remove('hidden')};opts.appendChild(b)});
    app.appendChild(nx);
  }
  show();
}
go(home);
})();
