const dns=require("dns").promises,tls=require("tls"),https=require("https"),http=require("http"),net=require("net");
const out=(res,s,b)=>{res.statusCode=s;res.setHeader("Content-Type","application/json");res.setHeader("Cache-Control","no-store");res.setHeader("X-Content-Type-Options","nosniff");res.end(JSON.stringify(b))};
function url(v){try{let u=new URL(v);if(!["http:","https:"].includes(u.protocol)||u.hostname.length>253)return null;if(u.username||u.password)throw Error("Credentials in URLs are not allowed");if(u.port&&!["80","443"].includes(u.port))throw Error("Only standard web ports are allowed");return u}catch{return null}}
function priv4(ip){let p=ip.split(".").map(Number);return p.length!==4||p.some(n=>!Number.isInteger(n)||n<0||n>255)||p[0]===10||p[0]===127||(p[0]===172&&p[1]>=16&&p[1]<=31)||(p[0]===192&&p[1]===168)||(p[0]===169&&p[1]===254)||p[0]===0||p[0]>=224}
function priv6(ip){ip=ip.toLowerCase();return ip==="::"||ip==="::1"||ip.startsWith("fc")||ip.startsWith("fd")||/^fe[89ab]/.test(ip)}
async function publicHost(h){if(net.isIP(h)===4&&priv4(h))throw Error("Private IP targets are not allowed");if(net.isIP(h)===6&&priv6(h))throw Error("Private IPv6 targets are not allowed");if(net.isIP(h))return;let a=await dns.lookup(h,{all:true});if(!a.length)throw Error("Host has no address");for(let x of a)if((x.family===4&&priv4(x.address))||(x.family===6&&priv6(x.address)))throw Error("Host resolves to a private or reserved address")}
function fetchPage(start,max=5){return new Promise(resolve=>{let cur=start,red=[];const go=async()=>{if(red.length>max)return resolve({ok:false,error:"Too many redirects",red});let u=new URL(cur);try{await publicHost(u.hostname)}catch(e){return resolve({ok:false,error:e.message,red})}let lib=u.protocol==="https:"?https:http,req=lib.request(u,{method:"GET",timeout:4000,headers:{"User-Agent":"VerigrityBot/1.0 (+https://verigrity.com/about.html)","Accept":"text/html,application/xhtml+xml"}},r=>{let l=r.headers.location;if(l&&[301,302,303,307,308].includes(r.statusCode)){let n=new URL(l,u).toString();red.push({status:r.statusCode,from:u.toString(),to:n});r.resume();cur=n;return go()}let c=[],size=0;r.on("data",x=>{size+=x.length;if(size<=300000)c.push(x)});r.on("end",()=>resolve({ok:true,status:r.statusCode,headers:r.headers,finalUrl:u.toString(),body:Buffer.concat(c).toString(),red}))});req.on("timeout",()=>req.destroy());req.on("error",e=>resolve({ok:false,error:e.message,red}));req.end()};go()})}
async function dnsInfo(h){let o={A:[],AAAA:[],MX:[],NS:[]};try{o.A=await dns.resolve4(h)}catch{}try{o.AAAA=await dns.resolve6(h)}catch{}try{o.MX=(await dns.resolveMx(h)).map(x=>x.exchange)}catch{}try{o.NS=await dns.resolveNs(h)}catch{}return o}
function tlsInfo(h){return new Promise(resolve=>{let s=tls.connect({host:h,port:443,servername:h,rejectUnauthorized:false,timeout:3000},()=>{let c=s.getPeerCertificate();resolve({authorized:s.authorized,subject:c.subject?.CN||"",issuer:c.issuer?.O||c.issuer?.CN||"",validFrom:c.valid_from||"",validTo:c.valid_to||""});s.end()});s.on("error",()=>resolve({error:"TLS details unavailable"}));s.on("timeout",()=>{s.destroy();resolve({error:"TLS timeout"})})})}
function content(b){let low=b.toLowerCase(),keys=["privacy","terms","refund","contact","about"],links=[...b.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)].map(m=>m[1]).slice(0,250),policy=Object.fromEntries(keys.map(k=>[k,links.some(x=>x.toLowerCase().includes(k))||low.includes(k)])),title=(b.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]?.replace(/\s+/g," ").trim()||"",words=b.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim().split(/\s+/).filter(Boolean).length;return{policy,title,words,links:links.length}}
function score(u,p,c){let s=35;if(u.protocol==="https:")s+=20;if(p.ok&&p.status>=200&&p.status<400)s+=8;if((p.red||[]).length<=2)s+=5;if((p.red||[]).length>4)s-=8;let hs=["strict-transport-security","content-security-policy","x-content-type-options","x-frame-options","referrer-policy","permissions-policy"],sh=Object.fromEntries(hs.map(k=>[k,!!p.headers?.[k]]));s+=Math.min(Object.values(sh).filter(Boolean).length*3,15);if(c.policy.privacy)s+=3;if(c.policy.terms)s+=2;if(c.policy.contact)s+=2;if(!c.title)s-=3;if(u.hostname.includes("xn--"))s-=5;return{score:Math.max(0,Math.min(100,s)),sh}}
module.exports=async(req,res)=>{
  if(req.method!=="GET")return out(res,405,{error:"GET only"});
  let u=url(req.query?.url||"");
  if(!u)return out(res,400,{error:"Invalid http/https URL"});
  try{
    await publicHost(u.hostname);
    let [p,d,t]=await Promise.all([
      fetchPage(u.toString()),
      dnsInfo(u.hostname),
      u.protocol==="https:"?tlsInfo(u.hostname):Promise.resolve({error:"TLS details apply to HTTPS"})
    ]);
    let c=p.ok?content(p.body):{policy:{},title:"",words:0,links:0};
    let s=score(u,p,c);
    return out(res,200,{
      url:u.toString(),
      generatedAt:new Date().toISOString(),
      source:"server",
      label:"Verigrity Score · Server-assisted trust report",
      score:s.score,
      securityHeaders:s.sh,
      connection:{protocol:u.protocol,status:p.status||null,finalUrl:p.finalUrl||null},
      redirects:p.red||[],
      tls:t,
      dns:d,
      page:{title:c.title,wordCount:c.words,linksChecked:c.links},
      policyPresence:c.policy,
      limitations:[
        "Automated evidence is not a guarantee of legitimacy or safety.",
        "Websites can block scanners or change content.",
        "DNS, TLS and page signals do not establish business ownership.",
        "Response time can vary because external websites control their own availability."
      ]
    });
  }catch(e){
    return out(res,400,{error:e.message||"Unable to inspect target"});
  }
};
