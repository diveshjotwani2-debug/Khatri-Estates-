/* Khatri Estates site script. No dependencies. */
(function(){
  var C=window.KE_CONFIG||{whatsapp:'',instagram:'khatriestates'};
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wa=(C.whatsapp||'').replace(/\D/g,'');

  /* header menu */
  var hdr=$('.hdr'),bg=$('.burger');
  if(bg){
    bg.addEventListener('click',function(){var o=!hdr.classList.contains('open');hdr.classList.toggle('open',o);bg.setAttribute('aria-expanded',o);document.body.style.overflow=o?'hidden':''});
    $$('.nav a').forEach(function(a){a.addEventListener('click',function(){hdr.classList.remove('open');bg.setAttribute('aria-expanded','false');document.body.style.overflow=''})});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&hdr.classList.contains('open'))bg.click()});
  }

  /* contact channel links: WhatsApp when a number is configured, Instagram DM otherwise */
  function channelUrl(msg){
    return wa?('https://wa.me/'+wa+'?text='+encodeURIComponent(msg||'Hello Khatri Estates, I would like to enquire.')):('https://ig.me/m/'+C.instagram);
  }
  $$('[data-channel]').forEach(function(a){
    a.href=channelUrl(a.getAttribute('data-msg'));
    a.target='_blank';a.rel='noopener';
    a.textContent=wa?(a.getAttribute('data-wa')||'Message on WhatsApp'):(a.getAttribute('data-ig')||'Message on Instagram');
  });

  /* reveal on scroll: IntersectionObserver plus a scroll check so nothing stays hidden */
  var pend=$$('.rv');
  function reveal(){
    var h=window.innerHeight*0.94;
    pend=pend.filter(function(el){
      var r=el.getBoundingClientRect();
      if(r.top<h&&r.bottom>0){el.classList.add('in');return false}
      return true;
    });
    if(!pend.length){window.removeEventListener('scroll',reveal);window.removeEventListener('resize',reveal)}
  }
  window.addEventListener('scroll',reveal,{passive:true});window.addEventListener('resize',reveal);
  reveal();window.addEventListener('load',reveal);

  /* hero slides */
  var slides=$$('.slide');
  if(slides.length>1){
    var cap=$('.hero-cap'),dots=$$('.dots button'),cur=0,timer;
    function show(i){
      cur=(i+slides.length)%slides.length;
      slides.forEach(function(s,k){s.classList.toggle('on',k===cur)});
      dots.forEach(function(d,k){d.setAttribute('aria-current',k===cur)});
      var s=slides[cur];
      $('.k',cap).textContent=s.getAttribute('data-k');
      $('.n',cap).textContent=s.getAttribute('data-n');
      $('.p',cap).textContent=s.getAttribute('data-p');
      $('a',cap).href=s.getAttribute('data-href');
    }
    function play(){if(RM)return;clearInterval(timer);timer=setInterval(function(){show(cur+1)},7000)}
    dots.forEach(function(d,k){d.addEventListener('click',function(){show(k);play()})});
    show(0);play();
  }

  /* carousel arrows */
  var rail=$('.rail');
  if(rail){
    var prev=$('[data-rail="prev"]'),next=$('[data-rail="next"]');
    function step(){var c=rail.firstElementChild;return c?c.getBoundingClientRect().width+24:320}
    function upd(){prev.disabled=rail.scrollLeft<4;next.disabled=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-4}
    prev.addEventListener('click',function(){rail.scrollBy({left:-step(),behavior:RM?'auto':'smooth'})});
    next.addEventListener('click',function(){rail.scrollBy({left:step(),behavior:RM?'auto':'smooth'})});
    rail.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd);upd();
  }

  /* property filters */
  var grid=$('#pgrid');
  if(grid){
    var cards=$$('.pcard',grid),state={kind:'all',loc:'all',price:'all'};
    var q=new URLSearchParams(location.search);
    if(q.get('type'))state.kind=q.get('type');
    if(q.get('loc'))state.loc=q.get('loc');
    var segs=$$('.seg button'),ls=$('#f-loc'),ps=$('#f-price'),cnt=$('#count'),em=$('#empty');
    function match(c){
      var cr=parseFloat(c.getAttribute('data-cr'));
      return (state.kind==='all'||c.getAttribute('data-kind')===state.kind)&&
        (state.loc==='all'||c.getAttribute('data-id')===state.loc)&&
        (state.price==='all'||(state.price==='a'&&cr<=1)||(state.price==='b'&&cr>1&&cr<=2)||(state.price==='c'&&cr>2));
    }
    function apply(){
      var n=0;
      cards.forEach(function(c){var m=match(c);c.hidden=!m;if(m)n++});
      cnt.textContent='Showing '+n+' of '+cards.length;
      em.hidden=n>0;
      segs.forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-kind')===state.kind)});
      ls.value=state.loc;ps.value=state.price;
    }
    segs.forEach(function(b){b.addEventListener('click',function(){state.kind=b.getAttribute('data-kind');apply()})});
    ls.addEventListener('change',function(){state.loc=ls.value;apply()});
    ps.addEventListener('change',function(){state.price=ps.value;apply()});
    $$('[data-reset]').forEach(function(b){b.addEventListener('click',function(){state={kind:'all',loc:'all',price:'all'};apply()})});
    apply();
  }

  /* lightbox */
  var lb=$('dialog.lb');
  if(lb){
    var imgs=$$('[data-lb]'),li=0,lim=$('img',lb);
    function lbShow(i){li=(i+imgs.length)%imgs.length;lim.src=imgs[li].getAttribute('data-lb');lim.alt=imgs[li].getAttribute('data-alt')||''}
    imgs.forEach(function(b,i){b.addEventListener('click',function(){lbShow(i);lb.showModal()})});
    $('.x',lb).addEventListener('click',function(){lb.close()});
    $('.pv',lb).addEventListener('click',function(){lbShow(li-1)});
    $('.nx',lb).addEventListener('click',function(){lbShow(li+1)});
    lb.addEventListener('click',function(e){if(e.target===lb||e.target.classList.contains('box'))lb.close()});
    lb.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')lbShow(li-1);if(e.key==='ArrowRight')lbShow(li+1)});
  }

  /* video: load only on request */
  $$('[data-video]').forEach(function(b){
    b.addEventListener('click',function(){
      var v=document.createElement('video');v.src=b.getAttribute('data-video');v.controls=true;v.autoplay=true;v.playsInline=true;v.setAttribute('aria-label','Property video');
      b.replaceWith(v);v.play&&v.play().catch(function(){});
    });
  });

  /* enquiry form: prepares the message and opens WhatsApp or Instagram. Nothing is sent from this page. */
  var form=$('form.enq');
  if(form){
    var pre=new URLSearchParams(location.search).get('property');
    var sel=$('#e-prop');if(sel&&pre){for(var i=0;i<sel.options.length;i++){if(sel.options[i].value===pre)sel.selectedIndex=i}}
    if(new URLSearchParams(location.search).get('visit')==='1'){var v=$('#e-visit');if(v)v.checked=true}
    var st=$('.status',form);
    function build(){
      var d=$('#e-date').value,vis=$('#e-visit').checked;
      var L=['Hello Khatri Estates, I would like to enquire.',
        'Name: '+$('#e-name').value.trim(),
        'Phone: '+$('#e-phone').value.trim(),
        'Property: '+$('#e-prop').value];
      if(vis)L.push('Site visit: Yes'+(d?', preferred date '+d:''));
      var m=$('#e-msg').value.trim();if(m)L.push('Message: '+m);
      return L.join('\n');
    }
    function setErr(id,t){$('#'+id+'-err').textContent=t}
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var ok=true,name=$('#e-name').value.trim(),ph=$('#e-phone').value.replace(/[^\d+]/g,'');
      setErr('e-name',name?'':'Please enter your name.');if(!name)ok=false;
      var bad=ph.replace(/\D/g,'').length<10;setErr('e-phone',bad?'Please enter a phone number with at least 10 digits.':'');if(bad)ok=false;
      if(!ok){(name?$('#e-phone'):$('#e-name')).focus();return}
      var msg=build(),url=channelUrl(msg),dest=wa?'WhatsApp':'Instagram';
      var copied=false;
      if(!wa&&navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(msg).then(function(){}).catch(function(){})}
      var w=window.open(url,'_blank');if(w){try{w.opener=null}catch(err){}}
      st.hidden=false;
      st.innerHTML=wa
        ?(w?'WhatsApp has opened with your message ready. Press send there to reach us.':'Your message is ready. <a href="'+url+'" target="_blank" rel="noopener">Open WhatsApp</a> and press send.')
        :(w?'Instagram has opened in a new tab. Your enquiry is copied, so paste it into the chat and press send.':'<a href="'+url+'" target="_blank" rel="noopener">Open Instagram</a> and paste your enquiry, which has been copied.');
      if(!wa){st.innerHTML+='<br><button type="button" class="reset" id="recopy" style="margin-top:10px">Copy enquiry again</button>';
        $('#recopy').addEventListener('click',function(){var t=$('#recopy');var done=function(){t.textContent='Copied'};if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(msg).then(done).catch(function(){})}});}
      st.focus&&st.setAttribute('tabindex','-1');st.focus&&st.focus();
    });
  }
})();
