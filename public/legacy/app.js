/* ===== 1. CONFIG AND DATA ===== */
var CATS=[["all","All"],["shop","Shop"],["property","Property"],["cars","Cars"],["services","Services"],["stays","Stays"],["taxi","Taxi"]];
var SOON={stays:1,taxi:1};
var ZONES={"Town/CBD":100,"Milimani":150,"Section 58":150,"Lanet":200,"Free Area":200,"Outside Nakuru (e.g. Eldoret)":0};
var ITEMS=[
{id:1,c:"shop",e:"👗",t:"Ankara dress",s:"Mama Fashions",p:2500,v:1},
{id:2,c:"shop",e:"📱",t:"Smartphone 64GB",s:"Rift Electro",p:14500,v:0},
{id:3,c:"shop",e:"🥬",t:"Fresh veg basket",s:"Gilani Fresh",p:600,v:1},
{id:4,c:"shop",e:"👟",t:"Running sneakers",s:"Kicks254",p:3200,v:0},
{id:13,c:"shop",e:"📺",t:"Smart TV 32 inch",s:"Rift Electro",p:11599,v:0},
{id:14,c:"shop",e:"🍳",t:"Kitchen cookware set",s:"Gilani Home",p:4200,v:1},
{id:15,c:"shop",e:"⌚",t:"Men’s steel watch",s:"Time Hub",p:2800,v:0},
{id:5,c:"property",e:"🏠",t:"2 bedroom, Milimani",s:"Rent per month · Zawadi Agents",p:35000,v:1},
{id:6,c:"property",e:"🏢",t:"Bedsitter, Section 58",s:"Rent per month · Kamau Homes",p:8000,v:0},
{id:7,c:"property",e:"🌄",t:"¼ acre plot, Lanet",s:"For sale · Rift Land Ltd",p:2800000,v:1},
{id:8,c:"cars",e:"🚗",t:"Toyota Axio 2015",s:"68,000 km · Nakuru Motors",p:1250000,v:1},
{id:9,c:"cars",e:"🚙",t:"Subaru Forester 2013",s:"92,000 km · Private seller",p:1650000,v:0},
{id:10,c:"services",e:"⚡",t:"John, electrician",s:"Wiring and repairs · from",p:800,v:1},
{id:11,c:"services",e:"🧼",t:"Wanjiru Cleaners",s:"Home and office · from",p:1500,v:0},
{id:12,c:"services",e:"🔧",t:"Peter, plumber",s:"Leaks and fittings · from",p:700,v:1}];
var ACT={shop:"Add to cart",property:"Request viewing",cars:"Request viewing",services:"Request quote"};
var TOPC=[["📱","Smart phones","shop","phone"],["📺","Televisions","shop","tv"],["🍳","Kitchen supplies","shop","kitchen"],["👗","Fashion","shop","dress"],["👟","Shoes","shop","sneaker"],["🥬","Groceries","shop","veg"],["⌚","Watches","shop","watch"],["🏠","Homes to rent","property","rent"],["🏡","Homes for sale","property","sale"],["🌄","Land","property","plot"],["🚗","Toyota","cars","toyota"],["🚙","Subaru","cars","subaru"],["🚘","All cars","cars",""],["⚡","Electricians","services","electric"],["🧼","Cleaning","services","clean"],["🔧","Plumbers","services","plumb"]];
var FEAT=[0,1,2,7,10,13,3,9,14];
var SIDE=[["feat","Featured","👍"],["shop","Shop","🛍️"],["property","Property","🏠"],["cars","Cars","🚗"],["services","Services","🔧"],["stays","Stays","🛏️"],["taxi","Taxi","🚕"]];
var RANK=[[3,"Most popular","14.6k+ heats"],[2,"New this week","280+ views"],[8,"Trending","63% up"],[5,"Top rated","4.8 stars"]];
var SLIDES=[["linear-gradient(135deg,#073b39,#0d6f69)","Free delivery on your first order","Pay on delivery · Nakuru only","🛵"],["linear-gradient(135deg,#e8506d,#f59a6b)","List your home or car free","Free for your first 3 months","🏠"],["linear-gradient(135deg,#6b4300,#c98a10)","Get Verified, get paid upfront","M-Pesa for trusted vendors","✅"]];
var MSGS=[["🛍️","Mama Fashions","Your dress is ready for pickup","2m"],["🏠","Zawadi Agents","Viewing confirmed for Saturday 10am","1h"],["🛵","Rider James","I’m at the gate, code please","Yesterday"],["🦩","NakuruHub Support","Welcome! Tap here if you need help","Mon"]];
var STAT=["Placed","Accepted","Ready for pickup","Out for delivery","Delivered (cash collected)"];
var TOOLS={shop:["Add product","Stock","Orders","Earnings"],property:["Add listing","Viewing requests","Mark rented/sold"],cars:["Add vehicle","Inquiries","Upload logbook"],services:["Service profile","Quote requests","Job history"]};
/* ===== 2. STATE ===== */
var S={tab:"home",cat:"all",q:"",side:"feat",acc:null,cart:{},pay:"cod",orders:[],area:"Town/CBD",
apps:[{n:"Zawadi Agents",cats:["property"],st:"Pending",ver:0},{n:"Kicks254",cats:["shop"],st:"Pending",ver:0}],me:null,vc:["shop"],vn:"",vp:"",photo:""};
/* ===== 3. HELPERS ===== */
var $=function(s){return document.querySelector(s)};
var esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
var RM=!!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches),ci=0,carTimer=0,searchTimer=0;
var PHONE=/^(?:\+?254|0)[17]\d{8}$/,MAXQ=99,MAXIMG=5*1024*1024;
var KES=function(n){return "KES "+n.toLocaleString("en-KE")};
var by=function(id){return ITEMS.filter(function(x){return x.id==id})[0]};
var cname=function(c){return CATS.filter(function(x){return x[0]==c})[0][1]};
var out=function(){return S.area.indexOf("Outside")==0};
function toast(m){var t=$("#toast");t.textContent=m;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(function(){t.hidden=true},2800)}
/* ===== 4. VIEWS (each returns an HTML string; user text is always escaped) ===== */
function pc(i){return '<div class="pc"><div class="pim">'+i.e+'</div><div class="t">'+i.t+'</div><div class="m">'+i.s+'</div><div class="pr">'+KES(i.p)+'</div><div><span class="badge '+(i.v?'':'u')+'">'+(i.v?'✓ Verified':'Unverified')+'</span></div><button class="btn s" data-a="act" data-id="'+i.id+'">'+ACT[i.c]+'</button></div>'}
function tiles(a){return a.map(function(k){var t=TOPC[k];return '<div class="ct" data-a="tile" data-id="'+k+'"><div>'+t[0]+'</div>'+t[1]+'</div>'}).join("")}
function home(){
if(out())return '<div class="err">We’re not in your area yet. NakuruHub serves Nakuru only. Join the waitlist and we’ll tell you when we expand.</div><button class="btn full" data-a="wait">Join the waitlist</button>';
if(SOON[S.cat])return '<div class="card"><div class="t">'+(S.cat=="stays"?"BnB and stays":"Taxi")+' is coming soon</div><div class="m">'+(S.cat=="stays"?"Book verified apartments and BnBs in Nakuru.":"Ride-hailing with live tracking and safety features.")+'</div><button class="btn s" style="margin-top:8px" data-a="wait">Notify me</button></div>';
var q=S.q.toLowerCase(),L=ITEMS.filter(function(i){return(S.cat=="all"||i.c==S.cat)&&(i.t+i.s).toLowerCase().indexOf(q)>-1});
if(S.cat!="all"||q){var h=(S.cat=="property"||S.cat=="cars")?'<div class="warn">Safety: view first. Never pay before you inspect and verify ownership.</div>':'';
return h+(L.length?'<div class="g2">'+L.map(pc).join("")+'</div>':'<div class="m">No results. Try a different search.</div>')}
var h='<div class="trust"><div>🛡️<b>Verified vendors</b>ID and shop checked</div><div>💵<b>Pay on delivery</b>Pay when it arrives</div></div>';
h+='<div class="hs"><div class="tile" data-a="tab" data-id="cat">🗂️ Categories</div><div class="tile" data-a="quote">🎯 Request a quote</div><div class="tile" data-a="signin">🏪 Sell with us</div><div class="tile" data-a="guide">💡 New user guide</div></div>';
h+='<div class="car" id="car">'+SLIDES.map(function(s,k){return '<div class="sl" style="background:'+s[0]+'" data-a="slide" data-id="'+k+'"><div><b>'+s[1]+'</b><span>'+s[2]+'</span></div><i>'+s[3]+'</i></div>'}).join("")+'</div><div class="dots"><i class="on"></i><i></i><i></i></div>';
h+='<div class="rank"><h3>Top rankings</h3><div class="m">Make shopping efficient</div><div class="hs">'+RANK.map(function(r){var i=by(r[0]);return '<div class="rc" data-a="act" data-id="'+i.id+'"><div class="rim">'+i.e+'<u>'+r[1]+'</u></div><div class="pr">'+KES(i.p)+'</div><div class="m">'+r[2]+'</div></div>'}).join("")+'</div></div>';
h+='<h2>Top categories</h2><div class="card"><div class="g3">'+tiles(FEAT)+'</div></div><h2>Picked for you</h2><div class="g2">'+ITEMS.slice(0,8).map(pc).join("")+'</div>';
return h}
function catv(){
var s=S.side,h='<div class="cl"><div class="sd">'+SIDE.map(function(x){return '<button class="'+(s==x[0]?'on':'')+'" data-a="side" data-id="'+x[0]+'"><b>'+x[2]+'</b>'+x[1]+'</button>'}).join("")+'</div><div class="rp">';
if(SOON[s])return h+'<div class="card"><div class="t">Coming soon</div><div class="m">We’ll open this category soon. Join the waitlist.</div><button class="btn s" style="margin-top:8px" data-a="wait">Notify me</button></div></div></div>';
var ks=[];TOPC.forEach(function(t,k){if(s=="feat"?FEAT.indexOf(k)>-1:t[2]==s)ks.push(k)});
h+='<div class="sl" style="background:'+SLIDES[s=="feat"?0:1][0]+';border-radius:14px;min-height:96px" data-a="slide" data-id="0"><div><b style="font-size:17px">'+(s=="feat"?"Free first delivery":cname(s))+'</b><span>'+(s=="feat"?"Pay on delivery":"Browse verified sellers")+'</span></div></div><div class="card" style="margin-top:10px"><div class="row sp"><b>Top categories</b><span class="m" data-a="cat" data-id="'+(s=="feat"?"all":s)+'">All ›</span></div><div class="g3" style="margin-top:10px">'+tiles(ks)+'</div></div></div></div>';
return h}
function msgv(){return '<h2 style="margin-top:0">Messages</h2>'+MSGS.map(function(m){return '<div class="card li" data-a="chatm"><div class="av">'+m[0]+'</div><div style="flex:1"><div class="t">'+m[1]+'</div><div class="m">'+m[2]+'</div></div><span class="m">'+m[3]+'</span></div>'}).join("")}
function cartView(){
var ids=Object.keys(S.cart),sub=0,allV=true,h='<h2 style="margin-top:0">Your cart</h2>';
if(!ids.length)h+='<div class="m">Your cart is empty. Add something from Shop.</div>';
else{ids.forEach(function(id){var i=by(id),n=S.cart[id];sub+=i.p*n;if(!i.v)allV=false;
h+='<div class="card row sp"><div><div class="t">'+i.e+' '+i.t+'</div><div class="m">'+i.s+'</div><div class="pr">'+KES(i.p*n)+'</div></div><div class="row"><button class="btn s o" data-a="dec" data-id="'+id+'">−</button><b>'+n+'</b><button class="btn s o" data-a="inc" data-id="'+id+'">+</button></div></div>'});
var fee=ZONES[S.area]||0;if(!allV&&S.pay=="mpesa")S.pay="cod";
h+='<div class="card"><div class="row sp"><span>Subtotal</span><span>'+KES(sub)+'</span></div><div class="row sp"><span>Delivery to '+S.area+'</span><span>'+KES(fee)+'</span></div><div class="row sp pr"><span>Total</span><span>'+KES(sub+fee)+'</span></div></div>';
h+='<h2>Payment</h2><div class="pay'+(S.pay=="cod"?' on':'')+'" data-a="pay" data-id="cod"><div><div class="t">Pay on delivery</div><div class="m">Cash or M-Pesa to the rider</div></div></div><div class="pay'+(S.pay=="mpesa"?' on':'')+(allV?'':' off')+'" data-a="pay" data-id="mpesa"><div><div class="t">M-Pesa now</div><div class="m">'+(allV?'Available: all vendors are verified':'Only for verified vendors')+'</div></div></div>';
if(out())h+='<div class="err">We deliver within Nakuru only. Change your area at the top.</div>';
h+='<button class="btn a full" data-a="place"'+(out()?' disabled':'')+'>Place order · '+KES(sub+fee)+'</button>'}
h+='<h2>Your orders</h2>';if(!S.orders.length)h+='<div class="m">No orders yet.</div>';
S.orders.slice().reverse().forEach(function(o){h+='<div class="card"><div class="row sp"><span class="t">Order #'+o.id+'</span><span class="pr">'+KES(o.total)+'</span></div><div class="m">'+o.pay+' · '+STAT[o.s]+'</div><div class="steps">'+STAT.map(function(x,k){return '<i class="'+(k<=o.s?'d':'')+'"></i>'}).join("")+'</div>'+(o.s<4?'<div class="m">Delivery code: <b>'+o.code+'</b> (give it to the rider)</div><button class="btn s o" style="margin-top:8px" data-a="adv" data-id="'+o.id+'">Next status (demo)</button>':'<div class="m">Completed. Rate your vendor.</div>')+'</div>'});
return h}
function acc(){
if(S.acc){var b='<button class="btn s o" data-a="back">‹ Back</button>';return b+(S.acc=="vendor"?vendor():admin())}
var rows=[["📦","My orders","tab:cart"],["🏪","Sell on NakuruHub","acc:vendor"],["🛠️","Admin panel (demo)","acc:admin"],["❤️","Saved items","toast"],["❓","Help and support","toast"]];
return '<div class="card row"><div class="av" data-a="pick" style="cursor:pointer">'+avatar()+'</div><div><div class="t">'+(S.me?esc(S.me.n):"Guest")+'</div><div class="m">'+(S.me?"Vendor account · "+S.me.st:"Free to join. Sign in to sell.")+'</div></div></div>'+rows.map(function(r){return '<div class="card li" data-a="row" data-id="'+r[2]+'"><div class="av">'+r[0]+'</div><div class="t" style="flex:1">'+r[1]+'</div><span class="m">›</span></div>'}).join("")}
function avatar(){return S.photo?'<img src="'+S.photo+'" alt="Profile photo">':'👤'}
function pfp(){return '<div class="pfp" data-a="pick" role="button" aria-label="Upload profile picture">'+avatar()+'<b>📷</b></div>'}
function vendor(){
var me=S.me,h='<h2>Sell on NakuruHub</h2>';
if(!me){h+='<div class="m">Free to join. Add a profile picture, then choose the categories you sell in. Each is approved separately.</div><div class="row" style="margin-top:12px">'+pfp()+'<div class="m">Tap to upload a profile picture or shop logo</div></div><label for="vn">Your name or business</label><input id="vn" maxlength="60" autocomplete="organization" placeholder="e.g. Mama Fashions" value="'+esc(S.vn)+'"><label for="vp">Phone (OTP verified)</label><input id="vp" maxlength="16" autocomplete="tel" inputmode="tel" placeholder="07XX XXX XXX" value="'+esc(S.vp)+'"><label>Categories (tap to add or remove)</label><div>';
CATS.slice(1).forEach(function(c){var on=S.vc.indexOf(c[0])>-1;h+='<button class="chip'+(on?' on':'')+'" data-a="vc" data-id="'+c[0]+'">'+c[1]+(SOON[c[0]]?' (waitlist)':'')+'</button>'});
return h+'</div><div class="warn">Next: upload your ID and category documents. Unverified vendors take cash on delivery only.</div><button class="btn full" data-a="reg">Submit for approval</button>'}
var ok=me.st=="Approved";
h+='<div class="card row">'+pfp()+'<div><div class="t">'+esc(me.n)+'</div><div class="m">Status: '+me.st+' · '+(me.ver?'✓ Verified (M-Pesa upfront enabled)':'Basic (cash on delivery only)')+'</div>'+(ok?'':'<div class="warn" style="margin-top:8px">Waiting for approval. Open Admin panel in this demo to approve it.</div>')+'</div></div>';
if(ok)me.cats.forEach(function(c){h+=TOOLS[c]?'<div class="card"><div class="t">'+cname(c)+' dashboard</div>'+TOOLS[c].map(function(x){return '<span class="tool">'+x+'</span>'}).join("")+'</div>':'<div class="card"><div class="t">'+cname(c)+'</div><div class="m">On the waitlist. We’ll open it soon.</div></div>'});
return h}
function admin(){
var cod=S.orders.reduce(function(a,o){return a+(o.pay=="Pay on delivery"&&o.s<4?o.total:0)},0);
var h='<h2>Admin panel</h2><div class="warn">Demo only. A real admin area needs staff login and server-side role checks.</div><div class="card row"><div class="stat"><b>'+(ITEMS.length+S.apps.length)+'</b><span class="m">Listings + vendors</span></div><div class="stat"><b>'+S.orders.length+'</b><span class="m">Orders</span></div><div class="stat"><b>'+KES(cod)+'</b><span class="m">COD pending</span></div></div><h2>Vendor applications</h2>';
S.apps.forEach(function(a,k){h+='<div class="card"><div class="t">'+esc(a.n)+'</div><div class="m">'+a.cats.join(", ")+' · '+a.st+(a.ver?' · Verified':'')+'</div><div class="row" style="margin-top:8px">'+(a.st=="Pending"?'<button class="btn s" data-a="app" data-id="'+k+'">Approve</button>':'')+(!a.ver&&a.st=="Approved"?'<button class="btn s o" data-a="ver" data-id="'+k+'">Give Verified badge</button>':'')+'</div></div>'});
return h+'<div class="m">Also managed here: zones and fees, commissions, riders, cash reconciliation, payouts, reports.</div>'}
/* ===== 5. RENDER AND CAROUSEL ===== */
function renderMain(){$("#v").innerHTML=({home:home,cat:catv,msg:msgv,cart:cartView,acc:acc})[S.tab]();document.querySelectorAll("#v [data-a]:not(button)").forEach(function(el){el.setAttribute("role","button");el.tabIndex=0});if(S.tab=="home")startCar();else stopCar()}
function chrome(){
var n=Object.keys(S.cart).reduce(function(a,k){return a+S.cart[k]},0);
$("#hd").className="t-"+S.tab;
$("#tabs").innerHTML=CATS.map(function(c){return '<button class="tb'+(S.cat==c[0]?' on':'')+'" data-a="cat" data-id="'+c[0]+'">'+c[1]+(SOON[c[0]]?' (soon)':'')+'</button>'}).join("");
$("#nav").innerHTML=[["home","🏠","Home"],["cat","🗂️","Category"],["msg","💬","Message"],["cart","🛒","Cart"],["acc","👤","Account"]].map(function(t){return '<button class="'+(S.tab==t[0]?'on':'')+'" data-a="tab" data-id="'+t[0]+'"><b>'+t[1]+'</b>'+t[2]+(t[0]=="cart"&&n?'<em>'+n+'</em>':'')+'</button>'}).join("");
$("#sb").hidden=!(S.tab=="home"&&!S.me);$("#fab").hidden=S.tab=="msg";
if($("#q").value!=S.q)$("#q").value=S.q}
function render(){chrome();renderMain()}
function stopCar(){clearInterval(carTimer);carTimer=0}
function startCar(){var c=$("#car");stopCar();ci=0;if(!c)return;c.addEventListener("scroll",function(){ci=Math.round(c.scrollLeft/c.clientWidth);document.querySelectorAll(".dots i").forEach(function(d,k){d.className=k==ci?"on":""})},{passive:true});if(RM)return;carTimer=setInterval(function(){if(document.hidden)return;ci=(ci+1)%SLIDES.length;c.scrollTo({left:ci*c.clientWidth,behavior:"smooth"})},4500)}
/* ===== 6. EVENTS ===== */
$("#area").innerHTML=Object.keys(ZONES).map(function(z){return '<option>'+z+'</option>'}).join("");
$("#area").onchange=function(e){S.area=e.target.value;render()};
$("#q").oninput=function(e){S.q=e.target.value.slice(0,80);if(SOON[S.cat])S.cat="all";S.tab="home";clearTimeout(searchTimer);searchTimer=setTimeout(render,120)};
$("#go").onclick=function(){S.tab="home";render()};
$("#cam").onclick=function(){toast("Search by photo is coming soon")};


document.addEventListener("click",function(e){var b=e.target.closest("[data-a]");if(!b)return;var a=b.dataset.a,id=b.dataset.id;
if(a=="tab"){S.tab=id;if(id=="acc")S.acc=null}
else if(a=="cat"){S.cat=id;S.q="";S.tab="home"}
else if(a=="side")S.side=id;
else if(a=="tile"){var t=TOPC[id];S.cat=t[2];S.q=t[3];S.tab="home"}
else if(a=="quote"){S.cat="services";S.q="";S.tab="home";toast("Pick a service to request a quote")}
else if(a=="guide")toast("1 Browse · 2 Order · 3 Pay when it arrives")
else if(a=="slide"){if(id=="0"){S.cat="shop";S.q="";S.tab="home"}else{S.tab="acc";S.acc="vendor"}}
else if(a=="signin"){S.tab="acc";S.acc="vendor"}
else if(a=="chatm")toast("Chat opens here (in-app or WhatsApp)");
else if(a=="row"){if(id=="toast")toast("Coming soon");else{var p=id.split(":");if(p[0]=="tab"){S.tab=p[1]}else S.acc=p[1]}}
else if(a=="back")S.acc=null;
else if(a=="wait")toast("You’re on the waitlist. We’ll message you.");
else if(a=="act"){var i=by(id);if(i.c=="shop"){S.cart[id]=Math.min(MAXQ,(S.cart[id]||0)+1);toast("Added to cart");chrome()}else if(i.c=="services")toast("Quote request sent to "+i.t);else toast("Viewing request sent. Remember: view first, pay later.");return}
else if(a=="inc"){if(S.cart[id]<MAXQ)S.cart[id]++}
else if(a=="dec"){S.cart[id]--;if(!S.cart[id])delete S.cart[id]}
else if(a=="pay"){if(id=="mpesa"&&b.classList.contains("off")){toast("M-Pesa upfront needs verified vendors only");return}S.pay=id}
else if(a=="place"){var ks=Object.keys(S.cart);if(!ks.length||out())return;var tt=0,allV=true;ks.forEach(function(k){var it=by(k);tt+=it.p*S.cart[k];if(!it.v)allV=false});S.orders.push({id:1001+S.orders.length,total:tt+(ZONES[S.area]||0),pay:(S.pay=="mpesa"&&allV)?"Paid by M-Pesa":"Pay on delivery",s:0,code:String(1000+crypto.getRandomValues(new Uint32Array(1))[0]%9000)});S.cart={};toast("Order placed. Track it below.")}
else if(a=="adv"){S.orders.forEach(function(o){if(o.id==id&&o.s<4)o.s++})}
else if(a=="vc"){var x=S.vc.indexOf(id);if(x>-1)S.vc.splice(x,1);else S.vc.push(id)}
else if(a=="reg"){var nm=$("#vn").value.trim().slice(0,60),ph=$("#vp").value.replace(/[\s-]/g,"");if(!nm){toast("Enter your name or business name");return}if(!PHONE.test(ph)){toast("Enter a valid Kenyan phone, e.g. 0712 345 678");return}if(!S.vc.length){toast("Choose at least one category");return}S.me={n:nm,cats:S.vc.slice(),st:"Pending",ver:0};S.apps.unshift(S.me);toast("Submitted. Admin will review it.")}
else if(a=="app")S.apps[id].st="Approved";
else if(a=="ver")S.apps[id].ver=1;
else if(a=="pick"){$("#pf").click();return}
render()});
document.addEventListener("input",function(e){if(e.target.id=="vn")S.vn=e.target.value;if(e.target.id=="vp")S.vp=e.target.value});
document.addEventListener("keydown",function(e){if((e.key=="Enter"||e.key==" ")&&e.target.matches&&e.target.matches('[role="button"][data-a]')){e.preventDefault();e.target.click()}});
$("#pf").onchange=function(e){var f=e.target.files[0];e.target.value="";if(!f)return;if(["image/jpeg","image/png","image/webp"].indexOf(f.type)<0){toast("Choose a JPG, PNG or WebP image");return}if(f.size>MAXIMG){toast("Image is too large. Max 5 MB");return}var u=URL.createObjectURL(f),im=new Image();im.onload=function(){var c=document.createElement("canvas"),z=256,m=Math.min(im.width,im.height);c.width=c.height=z;c.getContext("2d").drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,z,z);URL.revokeObjectURL(u);S.photo=c.toDataURL("image/jpeg",.85);toast("Profile picture updated");render()};im.onerror=function(){URL.revokeObjectURL(u);toast("Couldn’t read that image. Try another.")};im.src=u};
(function(){var q=location.search;if(!q)return;var p=new URLSearchParams(q);if(p.get("start")==="vendor"||p.has("vendor")){S.tab="acc";S.acc="vendor"}})();
render();
/* Next.js Phase 2 bridge: re-bind chrome when React remounts the shell */
function nakuruBindChromeInputs(){
$("#area").innerHTML=Object.keys(ZONES).map(function(z){return '<option>'+z+'</option>'}).join("");
$("#area").onchange=function(e){S.area=e.target.value;render()};
$("#q").oninput=function(e){S.q=e.target.value.slice(0,80);if(SOON[S.cat])S.cat="all";S.tab="home";clearTimeout(searchTimer);searchTimer=setTimeout(render,120)};
$("#go").onclick=function(){S.tab="home";render()};
$("#cam").onclick=function(){toast("Search by photo is coming soon")};
$("#pf").onchange=function(e){var f=e.target.files[0];e.target.value="";if(!f)return;if(["image/jpeg","image/png","image/webp"].indexOf(f.type)<0){toast("Choose a JPG, PNG or WebP image");return}if(f.size>MAXIMG){toast("Image is too large. Max 5 MB");return}var u=URL.createObjectURL(f),im=new Image();im.onload=function(){var c=document.createElement("canvas"),z=256,m=Math.min(im.width,im.height);c.width=c.height=z;c.getContext("2d").drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,z,z);URL.revokeObjectURL(u);S.photo=c.toDataURL("image/jpeg",.85);toast("Profile picture updated");render()};im.onerror=function(){URL.revokeObjectURL(u);toast("Couldn’t read that image. Try another.")};im.src=u};
}
function nakuruApplyVendorEntry(){var q=location.search;if(!q)return;var p=new URLSearchParams(q);if(p.get("start")==="vendor"||p.has("vendor")){S.tab="acc";S.acc="vendor"}}
window.__nakuruHubLegacy={remount:function(){nakuruBindChromeInputs();nakuruApplyVendorEntry();render()}};
