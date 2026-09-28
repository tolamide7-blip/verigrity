// --- VERIGRITY GOOGLE ANALYTICS - G-NJRW4ZRBDK ---
// Loads Google Analytics 4 on every page
(function() {
  var gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-NJRW4ZRBDK';
  document.head.appendChild(gtagScript);
 
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', 'G-NJRW4ZRBDK');
})();
// --- END GOOGLE ANALYTICS ---
 
const form=document.getElementById("checkForm");
const results=document.getElementById("results");
const resultActions=document.getElementById("result-actions");
const shareScore=document.getElementById("shareScore");
const pinChecklist=document.getElementById("pinChecklist");
let lastCheckedUrl="";
 
function normalizeUrl(value){
  value=value.trim();
  if(!/^https?:\/\//i.test(value)) value="https://"+value;
  const parsed=new URL(value); if(!["http:","https:"].includes(parsed.protocol)) throw new Error("Enter http or https URL"); return parsed;
}
function esc(s){
  return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}
function item(label,value,cls=""){
  return `<div class="result-item"><small>${esc(label)}</small><b class="${cls}">${esc(value)}</b></div>`;
}
function verdict(score){
  if(score>=80)return["Strong visible signals","pass-text"];
  if(score>=60)return["Mixed signals — review further","warning-text"];
  return["Several signals need review","warning-text"];
}
function renderReport(data){
  const isUrlOnly = data.source === "url-only";
  const s = data.securityHeaders || {};
  const headerCount = Object.values(s).filter(Boolean).length;
  const tls = data.tls || {};
  const p = data.policyPresence || {};
  const hasHeaders = Object.keys(s).length > 0;
  const hasDns = (data.dns?.A?.length || 0) + (data.dns?.MX?.length || 0) + (data.dns?.NS?.length || 0) + (data.dns?.AAAA?.length || 0) > 0;

  // --- URL-only branch: no trust score, no verdict tier, no fake sections ---
  if(isUrlOnly){
    let hostname = "";
    try { hostname = new URL(data.url).hostname; } catch { hostname = data.url || "—"; }
    results.innerHTML = `
    <div class="result-head">
      <div>
        <div class="result-url">${esc(data.url)}</div>
        <small>${esc(data.label || "URL-only heuristic — server not reached")}</small>
      </div>
      <div class="result-score pattern-score">
        <span class="score-label">URL Pattern Score</span>${data.patternScore}<small>/${data.patternMax}</small>
      </div>
    </div>
    <p class="warning-text"><strong>Limited assessment.</strong> The server-side trust check could not be reached. This number reflects only the URL string — it does not inspect the website, its certificate, headers, DNS, or content.</p>
    <div class="result-grid">
      ${item("Protocol", data.connection?.protocol === "https:" ? "HTTPS" : "HTTP", data.connection?.protocol === "https:" ? "pass-text" : "warning-text")}
      ${item("Hostname", hostname)}
      ${item("Server report", "Unavailable", "warning-text")}
    </div>
    <h3>What to investigate next</h3>
    <ul class="report-list">
      <li>Confirm the organization independently.</li>
      <li>Verify payment details and refund conditions before paying.</li>
      <li>Check claims against independent sources.</li>
      <li>Do not enter credentials after an unexpected request.</li>
    </ul>
    <div class="disclosure-box"><strong>Important:</strong> This is a URL-pattern heuristic, not a website trust check. It is not comparable to a Verigrity Score. Reload and try again later for a full server-assisted report.</div>`;
    if(resultActions) resultActions.classList.add("hidden");
    return;
  }

  // --- Server branch: normal trust report ---
  const [vtext,vclass]=verdict(data.score);
  results.innerHTML=`
  <div class="result-head">
    <div><div class="result-url">${esc(data.url)}</div><small>${esc(data.label || "Verigrity Score · Server-assisted trust report")}</small></div>
    <div class="result-score"><span class="score-label">Verigrity Score</span>${data.score}<small>/100</small></div>
  </div>
  <p class="${vclass}"><strong>${vtext}</strong></p>
  <div class="result-grid">
    ${item("HTTPS",data.connection?.protocol==="https:"?"Present":"Not present",data.connection?.protocol==="https:"?"pass-text":"warning-text")}
    ${item("HTTP response",data.connection?.status||"Unavailable")}
    ${item("Redirects",(data.redirects||[]).length)}
    ${hasHeaders ? item("Security headers",`${headerCount} detected`,headerCount>=3?"pass-text":"") : ""}
    ${item("TLS certificate",tls.authorized?"Valid for this connection":"Review / unavailable",tls.authorized?"pass-text":"warning-text")}
    ${item("Page title",data.page?.title?"Present":"Missing",data.page?.title?"pass-text":"warning-text")}
    ${p.privacy?item("Privacy page signal","Found","pass-text"):""}
    ${p.terms?item("Terms signal","Found","pass-text"):""}
    ${p.contact?item("Contact signal","Found","pass-text"):""}
    ${hasDns?item("DNS A records",(data.dns?.A||[]).length):""}
    ${hasDns?item("MX records",(data.dns?.MX||[]).length):""}
    ${data.page?.wordCount?item("Content word count",data.page.wordCount):""}
  </div>
  ${hasHeaders?`
  <h3>Security header results</h3>
  <div class="result-grid">
    ${Object.entries(s).map(([k,v])=>item(k.replaceAll("-"," "),v?"Detected":"Not detected",v?"pass-text":"")).join("")}
  </div>`:""}
  <h3>What to investigate next</h3>
  <ul class="report-list">
    <li>Verify the organization independently rather than relying on this score.</li>
    <li>Confirm payment details and refund conditions before paying.</li>
    <li>Check important claims using independent sources.</li>
    <li>Do not enter passwords or sensitive information after an unexpected request.</li>
  </ul>
  <div class="disclosure-box"><strong>Important:</strong> This report combines technical and visible website signals. It is not a malware scan, identity verification, fraud determination, business registration check, or safety certification.</div>`;
  if(resultActions){
    resultActions.classList.remove("hidden");
    if(pinChecklist){
      const pinUrl=encodeURIComponent(window.location.href.split("#")[0]);
      const media=encodeURIComponent(new URL("assets/verigrity-website-trust-guide.png", window.location.href).href);
      const desc=encodeURIComponent("Verigrity website trust checklist — review observable signals before you trust a website.");
      pinChecklist.href=`https://www.pinterest.com/pin/create/button/?url=${pinUrl}&media=${media}&description=${desc}`;
    }
  }
}
async function browserFallback(u){
  const host=u.hostname.toLowerCase(), https=u.protocol==="https:";
  const suspicious=/(@|%40|xn--)/i.test(host);
  const ip=/^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  // URL-pattern score, 0-50 scale. NOT comparable to the server Trust Score.
  let pattern=0;
  if(https)pattern+=20;
  if(!suspicious)pattern+=10;
  if(!ip)pattern+=10;
  if(u.hostname.length>=5)pattern+=5;
  if(u.hostname.includes("."))pattern+=5;
  pattern=Math.max(0,Math.min(pattern,50));
  return {
    url:u.toString(),
    source:"url-only",
    label:"URL-only heuristic — server not reached",
    patternScore:pattern,
    patternMax:50,
    connection:{protocol:u.protocol},
    securityHeaders:{},
    dns:{A:[],MX:[]},
    tls:{},
    page:{title:"",wordCount:0},
    policyPresence:{privacy:false,terms:false,contact:false}
  };
}
form?.addEventListener("submit",async e=>{
  e.preventDefault();
  const button=form.querySelector("button");
  let u;
  try{u=normalizeUrl(document.getElementById("url").value)}catch{
    results.classList.remove("hidden");
    results.innerHTML=`<p class="warning-text"><strong>Enter a valid website address.</strong></p>`;return;
  }
  lastCheckedUrl=u.toString();
  results.classList.remove("hidden");
  if(resultActions) resultActions.classList.add("hidden");
  button.disabled=true;button.textContent="Analyzing…";
  results.innerHTML=`<div class="loading"><strong>Getting your Verigrity Score…</strong><p>Checking website, DNS, TLS and visible trust signals. Target response time: about 5 seconds.</p></div>`;
  try{
    if(!navigator.onLine || location.protocol==="file:"){
      results.innerHTML=`<div class="disclosure-box"><strong>Offline assessment.</strong> No server request was made. Verigrity is using its limited browser-only signals and will not present them as a security verdict.</div>`;
      renderReport(await browserFallback(u));
    }else{
      const controller=new AbortController();
      const timer=setTimeout(()=>controller.abort(),5500);
      const r=await fetch(`/api/trust?url=${encodeURIComponent(u.toString())}`,{signal:controller.signal});
      clearTimeout(timer);
      if(!r.ok)throw new Error("API unavailable");
      renderReport(await r.json());
    }
  }catch(err){
    results.innerHTML=`<div class="disclosure-box"><strong>Server check unavailable.</strong> Verigrity has not treated this as a failed website. Showing the limited browser-based assessment instead.</div>`;
    renderReport(await browserFallback(u));
  }
  button.disabled=false;button.textContent="Check another website";
  document.getElementById("url").value="";
});
 
function buildScoreCardBlob(){
  return new Promise(resolve=>{
    const scoreEl=document.querySelector("#results .result-score");
    const raw=scoreEl?.innerText || "";
    const match=raw.match(/(\d{1,3})/);
    const score=match? Math.max(0,Math.min(100,Number(match[1]))) : null;
    const isUrlOnly = !!document.querySelector("#results .result-score.pattern-score");
    const site=lastCheckedUrl || document.getElementById("url")?.value?.trim() || "Website";
    const canvas=document.createElement("canvas");
    canvas.width=1200; canvas.height=675;
    const ctx=canvas.getContext("2d");
    ctx.fillStyle="#f7f9fc"; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="#0f4c81"; ctx.fillRect(0,0,canvas.width,18);
    ctx.beginPath(); ctx.arc(130,135,58,0,Math.PI*2); ctx.fillStyle="#0f4c81"; ctx.fill();
    ctx.fillStyle="#fff"; ctx.font="bold 54px Arial"; ctx.textAlign="center"; ctx.fillText("V",130,153);
    ctx.fillStyle="#1e3042"; ctx.textAlign="left"; ctx.font="bold 48px Arial"; ctx.fillText("Verigrity",220,150);
    ctx.font="24px Arial"; ctx.fillStyle="#536779"; ctx.fillText("Truth with Integrity",220,190);
    ctx.fillStyle="#fff"; ctx.strokeStyle="#dfe7ef"; ctx.lineWidth=3;
    roundRect(ctx,70,245,1060,270,24); ctx.fill(); ctx.stroke();
    ctx.fillStyle="#1e3042"; ctx.font="bold 34px Arial";
    ctx.fillText(isUrlOnly ? "URL Pattern Score" : "Verigrity Score",110,310);
    ctx.fillStyle="#0f4c81"; ctx.font="bold 110px Arial";
    ctx.fillText(score===null? "—" : (isUrlOnly ? `${score}/50` : `${score}/100`),110,435);
    ctx.fillStyle="#536779"; ctx.font="22px Arial";
    const safeSite=site.length>62? site.slice(0,59)+"…" : site;
    ctx.fillText(safeSite,110,475);
    ctx.fillText(isUrlOnly ? "URL-only heuristic — not a website trust check." : "Informational trust-signal summary — not proof of safety or fraud.",110,550);
    canvas.toBlob(resolve,"image/png");
  });
}
function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
}
async function shareScoreImage(){
  const blob=await buildScoreCardBlob();
  if(!blob) return;
  const file=new File([blob],"verigrity-score.png",{type:"image/png"});
  if(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))){
    try{await navigator.share({title:"Verigrity Score",text:"Verigrity Score — Truth with Integrity",files:[file]});return}catch(e){}
  }
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a"); a.href=url; a.download="verigrity-score.png"; a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function currentShareData(){
  const scoreEl=document.querySelector("#results .result-score");
  const scoreText=scoreEl?.innerText?.replace(/\s+/g," ").trim() || "Verigrity Score";
  const checkedUrl=lastCheckedUrl || document.getElementById("url")?.value?.trim() || "";
  const page=window.location.href.split("#")[0];
  const text=`${scoreText} — checked with Verigrity. Truth with Integrity.`;
  return {title:"Verigrity Score",text,url:page,checkedUrl};
}
async function shareScoreAnywhere(){
  const d=currentShareData();
  try{
    if(navigator.share){
      await navigator.share({title:d.title,text:`${d.text}\nWebsite: ${d.checkedUrl}`,url:d.url});
      return;
    }
    if(navigator.clipboard){
      await navigator.clipboard.writeText(`${d.text}\nWebsite: ${d.checkedUrl}\n${d.url}`);
      alert("Score copied. Paste it into WhatsApp, Facebook, X, Telegram, email, or any social app.");
    }
  }catch(e){}
}
function openSocial(network){
  const d=currentShareData();
  const shareText=encodeURIComponent(`${d.text} Website: ${d.checkedUrl}`);
  const page=encodeURIComponent(d.url);
  const targets={
    whatsapp:`https://wa.me/?text=${shareText}%20${page}`,
    x:`https://twitter.com/intent/tweet?text=${shareText}&url=${page}`,
    facebook:`https://www.facebook.com/sharer/sharer.php?u=${page}`,
    linkedin:`https://www.linkedin.com/sharing/share-offsite/?url=${page}`,
    telegram:`https://t.me/share/url?url=${page}&text=${shareText}`
  };
  if(targets[network]) window.open(targets[network],"_blank","noopener,noreferrer,width=720,height=640");
}
shareScore?.addEventListener("click", shareScoreAnywhere);
document.querySelectorAll("[data-share]").forEach(btn=>{
  btn.addEventListener("click",()=>openSocial(btn.dataset.share));
});
const alertForm=document.getElementById("alertForm");
const alertMessage=document.getElementById("alertMessage");
alertForm?.addEventListener("submit",e=>{
  e.preventDefault();
  const email=document.getElementById("alertEmail")?.value.trim();
  if(!email) return;
  try{localStorage.setItem("verigrity_alert_email",email);}catch(e){}
  if(alertMessage) alertMessage.textContent="Thanks. Your email is saved on this device for the alert signup. Connect a verified email provider before production email delivery is enabled.";
});
document.getElementById("shareScoreImage")?.addEventListener("click", shareScoreImage);
