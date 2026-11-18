/* SHYENIX storefront analytics — anonymous, no customer contact details. */
(function (w) {
  "use strict";
  var cfg=w.SHYENIX_ANALYTICS_CONFIG||{};
  var url=String(cfg.url||"").replace(/\/$/,""), key=String(cfg.anonKey||"");
  var enabled=/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)&&key.length>20;
  function uuid() {
    if (w.crypto && w.crypto.randomUUID) return w.crypto.randomUUID();
    var a=new Uint8Array(16); if(w.crypto&&w.crypto.getRandomValues)w.crypto.getRandomValues(a);
    else for(var i=0;i<16;i++)a[i]=Math.floor(Math.random()*256);
    a[6]=(a[6]&15)|64;a[8]=(a[8]&63)|128;
    var s=Array.from(a,function(x){return x.toString(16).padStart(2,"0")}).join("");
    return s.slice(0,8)+"-"+s.slice(8,12)+"-"+s.slice(12,16)+"-"+s.slice(16,20)+"-"+s.slice(20);
  }
  function get(store,k){try{return store.getItem(k)}catch(e){return null}}
  function put(store,k,v){try{store.setItem(k,v)}catch(e){}}
  var visitor=get(localStorage,"shx_visitor_id");
  if(!visitor){visitor=uuid();put(localStorage,"shx_visitor_id",visitor)}
  var now=Date.now(),previous={};
  try{previous=JSON.parse(get(sessionStorage,"shx_visit_session")||"{}")}catch(e){}
  var session=previous.id&&now-Number(previous.at)<1800000?previous.id:uuid();
  put(sessionStorage,"shx_visit_session",JSON.stringify({id:session,at:now}));
  var seen={};var observer=null;
  var optedOut=get(localStorage,"shx_analytics_optout")==="1";
  function post(table,row){
    if(!enabled||optedOut)return Promise.resolve(false);
    put(sessionStorage,"shx_visit_session",JSON.stringify({id:session,at:Date.now()}));
    return fetch(url+"/rest/v1/"+table,{
      method:"POST",mode:"cors",keepalive:true,
      headers:{"apikey":key,"Authorization":"Bearer "+key,"Content-Type":"application/json","Prefer":"return=minimal"},
      body:JSON.stringify(row)
    }).then(function(r){if(!r.ok)console.warn("SHYENIX analytics write failed",r.status);return r.ok})
      .catch(function(){return false});
  }
  function track(type,productId){
    if(["page_view","product_view","add_to_cart"].indexOf(type)<0)return Promise.resolve(false);
    return post("shx_events",{visitor_id:visitor,session_id:session,event_type:type,product_id:productId==null?null:String(productId).slice(0,100),path:location.pathname.slice(0,200)});
  }
  function productView(id){
    id=String(id);
    if(seen[id])return;
    seen[id]=true;
    track("product_view",id);
  }
  function observe(element,id){
    if(!element)return;
    if(!("IntersectionObserver" in w)){productView(id);return}
    if(!observer)observer=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){productView(entry.target.getAttribute("data-shx-id"));observer.unobserve(entry.target)}
      });
    },{threshold:0.35});
    element.setAttribute("data-shx-id",String(id));observer.observe(element);
  }
  function orderRequest(o){
    var items=Array.isArray(o.items)?o.items.slice(0,30).map(function(i){return {
      product_id:String(i.product_id||"").slice(0,100),
      size:String(i.size||"").slice(0,30),
      quantity:Math.min(99,Math.max(1,Number(i.quantity)||1))
    }}):[];
    if(!items.length)return Promise.resolve(false);
    return post("shx_order_requests",{id:o.id||uuid(),visitor_id:visitor,session_id:session,amount:Math.max(0,Number(o.amount)||0),items:items});
  }
  w.shxAnalytics={enabled:enabled,track:track,productView:productView,observe:observe,orderRequest:orderRequest,newOrderId:uuid,
    optOut:function(){put(localStorage,"shx_analytics_optout","1");optedOut=true},
    optIn:function(){try{localStorage.removeItem("shx_analytics_optout")}catch(e){}optedOut=false}};
  track("page_view");
})(window);
