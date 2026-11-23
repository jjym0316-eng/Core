'use strict';
// ================= 상태 & 유틸 =================
const S={f:{},busy:{},tab:'home',sub:{},user:null,role:null,since:0,ver:0,members:{},settings:{},bookings:[],bookingMap:{},blocks:{},notices:[],videos:[],formvids:[],exlib:{},foods:[],activity:[],_md:{},cal:null,bk:{},wlDate:null,dietDate:null,selMember:null,libCat:'전체',memFilter:'active',modal:null,ai:false,blobCache:{}};
const A={},PART={},DB={};
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const pad=n=>String(n).padStart(2,'0');
const ds=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const today=()=>ds(new Date());
const parseD=s=>{const [y,m,d]=String(s).split('-').map(Number);return new Date(y,(m||1)-1,d||1)};
const addDays=(s,n)=>{const d=parseD(s);d.setDate(d.getDate()+n);return ds(d)};
const DOW=['일','월','화','수','목','금','토'];
const fmtD=s=>{if(!s)return'';const d=parseD(s);return `${d.getMonth()+1}월 ${d.getDate()}일 (${DOW[d.getDay()]})`};
const slotDT=(date,time)=>{const d=parseD(date);const [h,m]=String(time||'0:0').split(':').map(Number);d.setHours(h,m,0,0);return d};
const sid=(date,time)=>`${date}_${String(time).replace(':','')}`;
const byDT=(a,b)=>(a.date+a.time).localeCompare(b.date+b.time);
const n1=v=>Math.round((+v||0)*10)/10;
const ago=t=>{if(!t)return'';const s=(Date.now()-t)/1000;if(s<60)return'방금';if(s<3600)return Math.floor(s/60)+'분 전';if(s<86400)return Math.floor(s/3600)+'시간 전';if(s<604800)return Math.floor(s/86400)+'일 전';const d=new Date(t);return `${d.getMonth()+1}/${d.getDate()}`};
const ls={get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
const API=String(window.CORE_API||'').replace(/\/$/,'');
let TOK=ls.get('core_tok')||'';
const fv=(k,d='')=>(k in S.f)?S.f[k]:d;
const fk=(mid,k)=>`${k}@${mid}`;
const clearF=pre=>{for(const k of Object.keys(S.f))if(k.startsWith(pre))delete S.f[k]};
const fileUrl=id=>API+'/f/'+id+'?t='+encodeURIComponent(TOK);
const epley=(w,r)=>r<=1?w:Math.round(w*(1+r/30)*2)/2;
const SLOTS=[['breakfast','아침','🌅'],['lunch','점심','🌤️'],['dinner','저녁','🌙'],['snack','간식','🍓']];
const VC={exercise:'운동',diet:'식단',health:'건강',stretch:'스트레칭'};
const VCOL={exercise:'linear-gradient(135deg,#4F5BFF,#8B5CFF)',diet:'linear-gradient(135deg,#FFB547,#FF6B8B)',health:'linear-gradient(135deg,#21D4A8,#4F8BFF)',stretch:'linear-gradient(135deg,#B78CFF,#FF8FC8)'};
const typeName=t=>t==='consult'?'PT 상담':'PT 수업';
const admin=()=>S.role==='admin'&&!S.viewAs;
const isAdminAcct=()=>S.role==='admin';

// ================= 아이콘 & 로고 =================
const IC={home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',work:'<path d="M6 7v10M3 9.5v5M18 7v10M21 9.5v5M6 12h12"/>',diet:'<path d="M3 12h18a9 9 0 0 1-18 0zM9 8c0-2 2-2 2-4M14 8c0-2 2-2 2-4"/>',cal:'<rect x="3" y="5" width="18" height="16" rx="4"/><path d="M3 10h18M8 3v4M16 3v4"/>',play:'<rect x="3" y="5" width="18" height="14" rx="4"/><path d="M10 9l5 3-5 3z"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',users:'<circle cx="9" cy="8" r="3.5"/><path d="M2 20c.8-3.5 3.5-5 7-5s6.2 1.5 7 5M16 4.5a3.5 3.5 0 0 1 0 7M18 15c2 .6 3.4 2.2 4 5"/>',grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',moon:'<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>',left:'<path d="M15 18l-6-6 6-6"/>',right:'<path d="M9 18l6-6-6-6"/>',plus:'<path d="M12 5v14M5 12h14"/>',x:'<path d="M18 6L6 18M6 6l12 12"/>',cam:'<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0"/>',out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',up:'<path d="M12 19V5M5 12l7-7 7 7"/>',search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',check:'<path d="M5 12l5 5 9-10"/>',file:'<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/>',flame:'<path d="M12 22c4 0 7-3 7-7 0-5-4-7-5-11-2 3-3 4-3 6-1-1-2-2-2-4-2 2-4 5-4 9 0 4 3 7 7 7z"/>',copy:'<rect x="8" y="8" width="13" height="13" rx="3"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>'};
const ic=(n,s=20)=>`<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[n]||''}</svg>`;
const LOGO=(s=36)=>`<svg width="${s}" height="${s}" viewBox="0 0 64 64" aria-label="Core"><defs><linearGradient id="lg${s}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4F5BFF"/><stop offset=".55" stop-color="#8B5CFF"/><stop offset="1" stop-color="#FF7A93"/></linearGradient></defs><rect width="64" height="64" rx="20" fill="url(#lg${s})"/><path d="M43.5 21.5 A15 15 0 1 0 43.5 42.5" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/><circle cx="32" cy="32" r="5.2" fill="#fff"/><circle cx="46.5" cy="32" r="3" fill="#FFD9E1"/></svg>`;
const WORD=`<span class="word">Core</span>`;

// ================= 렌더 엔진 =================
let rq=0,pendingR=false;
const isEditing=()=>{const a=document.activeElement;return a&&a.matches&&a.matches('input:not([type=file]):not([type=checkbox]):not([type=radio]):not([type=date]):not([type=time]),textarea')};
const isPlaying=()=>[...document.querySelectorAll('video')].some(v=>!v.paused&&!v.ended)||!!document.querySelector('iframe.yt');
function schedule(){if(rq)return;rq=requestAnimationFrame(()=>{rq=0;if(isEditing()||isPlaying()){pendingR=true;return}render();renderModalLive()})}
const flush=()=>{if(!pendingR)return;setTimeout(()=>{if(!isEditing()&&!isPlaying()){pendingR=false;render();renderModalLive()}},80)};
document.addEventListener('focusout',flush);['pause','ended'].forEach(ev=>document.addEventListener(ev,flush,true));
function toast(m){const t=$('#toast');t.innerHTML=`<div>${esc(m)}</div>`;clearTimeout(toast.t);toast.t=setTimeout(()=>t.innerHTML='',2800)}
function openModal(fn,full){S.modal=fn;S.modalFull=!!full;renderModal()}
function closeModal(){S.modal=null;$('#modal').innerHTML='';render()}
function renderModal(){const el=$('#modal');if(!S.modal){el.innerHTML='';return}const sc=el.querySelector('.modal')?.scrollTop||0;el.innerHTML=`<div class="modalbg" data-a="bgClose"><div class="modal ${S.modalFull?'full':''}" role="dialog">${S.modal()}</div></div>`;const m=el.querySelector('.modal');if(m)m.scrollTop=sc}
function renderModalLive(){if(S.modal&&S.modal.live&&!isEditing()&&!isPlaying())renderModal()}
const mh=t=>`<div class="mh"><h2>${t}</h2><button class="ib sm" data-a="closeModal">${ic('x')}</button></div>`;
let askRes=null;
function ask(title,msg,ok='확인',danger=false){return new Promise(r=>{askRes=r;$('#dlg').innerHTML=`<div class="modalbg" style="z-index:80;align-items:center"><div class="modal" style="max-width:360px;border-radius:24px;margin:16px"><h2>${esc(title)}</h2>${msg?`<p class="muted sm">${esc(msg)}</p>`:''}<div class="row" style="justify-content:flex-end"><button class="btn" data-a="askNo">취소</button><button class="btn ${danger?'dng':'pri'}" data-a="askYes">${esc(ok)}</button></div></div></div>`})}
A.askYes=()=>{$('#dlg').innerHTML='';askRes&&askRes(true)};A.askNo=()=>{$('#dlg').innerHTML='';askRes&&askRes(false)};
A.closeModal=()=>closeModal();A.bgClose=(d,el,e)=>{if(e.target===el)closeModal()};
async function busy(k,fn){if(S.busy[k])return;S.busy[k]=1;render();renderModal();try{return await fn()}finally{delete S.busy[k];render();renderModal()}}
const bz=(k,label,lb='처리 중…')=>S.busy[k]?`<span class="spin"></span> ${lb}`:label;
const dis=k=>S.busy[k]?'disabled':'';
document.addEventListener('click',e=>{const el=e.target.closest('[data-a]');if(!el)return;const fn=A[el.dataset.a];if(!fn)return;const ae=document.activeElement;if(ae&&ae!==el&&ae.blur&&el.tagName==='BUTTON')ae.blur();pendingR=false;Promise.resolve(fn(el.dataset,el,e)).catch(err=>{console.error(err);toast(err?.message||String(err))})});
document.addEventListener('input',e=>{const el=e.target;if(!el.dataset||el.dataset.f===undefined)return;S.f[el.dataset.f]=el.type==='checkbox'?el.checked:el.value;const p=el.dataset.live;if(p&&PART[p]){const t=$('#p-'+p);if(t)t.innerHTML=PART[p]()}});
document.addEventListener('change',e=>{const el=e.target;if(el.dataset.f!==undefined){S.f[el.dataset.f]=el.type==='checkbox'?el.checked:el.value;if(el.dataset.rr!==undefined){render();renderModal()}}
 if(el.type==='file'&&el.dataset.file){const fn=A[el.dataset.file];const files=[...el.files];el.value='';if(fn&&files.length)Promise.resolve(fn(el.dataset,files)).catch(err=>{console.error(err);toast(err?.message||String(err))})}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.closest('.auth')&&e.target.matches('input')){e.preventDefault();e.target.blur();const b=$('.auth .btn.pri, .auth .btn.grad');b&&b.click()}});

// ================= 테마 =================
function applyTheme(){let t=ls.get('core_theme');if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';S.theme=t;document.documentElement.dataset.theme=t;const m=$('meta[name=theme-color]');if(m)m.content=t==='dark'?'#0B0D1A':'#F4F6FC'}
A.theme=()=>{ls.set('core_theme',S.theme==='dark'?'light':'dark');applyTheme();render()};
const themeBtn=()=>`<button class="ib" data-a="theme" title="화면 모드">${ic(S.theme==='dark'?'sun':'moon',18)}</button>`;

// ================= 서버 통신 =================
async function api(method,url,body){if(S.viewAs&&method!=='GET'&&!url.includes('/api/logout')&&!url.includes('/api/wiki'))throw new Error('회원 화면 미리보기에서는 저장되지 않아요. 관리자로 돌아가서 해주세요.');const o={method,headers:{}};if(TOK)o.headers['x-core-token']=TOK;if(body){o.headers['content-type']='application/json';o.body=JSON.stringify(body)}
 let r;try{r=await fetch(API+url,o)}catch(e){throw new Error('인터넷 연결을 확인해주세요.')}let j=null;try{j=await r.json()}catch(e){}
 if(r.status===401&&TOK&&!url.includes('/api/login')){doLogout(j?.error||'다시 로그인해주세요.');throw new Error(j?.error||'로그인이 필요해요')}
 if(!r.ok)throw new Error(j?.error||'요청을 처리하지 못했어요.');return j}
const C=c=>DB[c]||(DB[c]=new Map());
const list=c=>[...C(c).values()];
let syncing=null;
async function sync(){if(!S.user)return;if(syncing)return syncing;syncing=(async()=>{try{const r=await api('GET','/api/sync?since='+S.since);for(const d of r.docs){if(d.deleted)C(d.col).delete(d.id);else C(d.col).set(d.id,{...d.data,id:d.id})}S.since=r.now;derive();if(r.docs.length)schedule();if(r.more)setTimeout(()=>sync().catch(()=>{}),50)}finally{syncing=null}})();return syncing}
function derive(){S.ver++;S.members=Object.fromEntries(list('members').map(m=>[m.id,m]));S.settings=C('settings').get('main')||{};S.bookings=list('bookings').filter(b=>b.date);S.bookingMap=Object.fromEntries(S.bookings.map(b=>[b.id,b]));S.blocks=Object.fromEntries(list('blocks').map(b=>[b.id,b]));
 S.notices=list('notices').sort((a,b)=>(!!b.pinned-!!a.pinned)||(b.createdAt-a.createdAt));S.videos=list('videos').sort((a,b)=>b.createdAt-a.createdAt);S.formvids=list('formvids').sort((a,b)=>(b.lastAt||b.createdAt)-(a.lastAt||a.createdAt));S.exlib=Object.fromEntries(list('exlib').map(x=>[x.id,x]));S.foods=list('foods');S.activity=list('activity').sort((a,b)=>b.at-a.at);if(S.user&&S.members[S.user.id])S.user=S.members[S.user.id]}
function md(mid){const c=S._md[mid];if(c&&c.v===S.ver)return c;const o={v:S.ver,wlogs:list('wlogs').filter(x=>x.memberId===mid).sort((a,b)=>b.date.localeCompare(a.date)),meals:{},inbody:list('inbody').filter(x=>x.memberId===mid).sort((a,b)=>(b.date||'').localeCompare(a.date||'')||b.createdAt-a.createdAt),routine:C('routines').get(mid)||null,diet:C('diets').get(mid)||null};list('meals').forEach(m=>{if(m.memberId===mid)o.meals[m.date]=m});S._md[mid]=o;return o}
const strip=o=>{const r={...(o||{})};delete r.id;delete r.updatedAt;delete r.updatedBy;return r};
async function put(col,id,data,log){await api('POST','/api/doc',{col,id,data:strip(data),log});await sync();render()}
async function delDoc(col,id){await api('POST','/api/doc',{col,id,del:true});C(col).delete(id);derive();await sync();render()}
async function act(path,body){const r=await api('POST','/api/'+path,body);await sync();render();return r}
const logo=(k,t)=>({kind:k,text:t});

// ================= 파일 =================
const scripts={};
function loadScript(src){return scripts[src]||(scripts[src]=new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>{delete scripts[src];rej(new Error('라이브러리를 불러오지 못했어요.'))};document.head.appendChild(s)}))}
async function toJpeg(file,max=1600,q=.85){try{const bmp=await createImageBitmap(file);const sc=Math.min(1,max/Math.max(bmp.width,bmp.height));const c=document.createElement('canvas');c.width=Math.round(bmp.width*sc);c.height=Math.round(bmp.height*sc);c.getContext('2d').drawImage(bmp,0,0,c.width,c.height);return (await new Promise(r=>c.toBlob(r,'image/jpeg',q)))||file}catch(e){return file}}
async function upload(file,max=1600){const n=(file.name||'').toLowerCase();let t=file.type||'';let blob=file;
 if(t.startsWith('image/')&&t!=='image/gif'){blob=await toJpeg(file,max);t=blob.type||'image/jpeg'}
 else if(t.startsWith('video/')||/\.(mp4|mov|m4v|webm)$/.test(n))t=t==='video/webm'||n.endsWith('.webm')?'video/webm':t==='video/quicktime'||n.endsWith('.mov')?'video/quicktime':'video/mp4';
 else if(n.endsWith('.pdf'))t='application/pdf';
 const u=await api('POST','/api/upload-url',{name:file.name||'',type:t,size:blob.size});let r;try{r=await fetch(u.uploadUrl,{method:'PUT',headers:{'content-type':u.type,'x-upsert':'false'},body:blob})}catch(e){throw new Error('인터넷 연결을 확인해주세요.')}if(!r.ok)throw new Error('업로드에 실패했어요. 다시 시도해주세요.');S.blobCache[u.id]=blob;return {id:u.id,type:u.type}}
async function docxText(file){await loadScript('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js');const z=await window.JSZip.loadAsync(file);const f=z.file('word/document.xml');if(!f)throw new Error('Word 문서를 읽지 못했어요.');const xml=await f.async('string');return xml.replace(/<w:tab\/>/g,'\t').replace(/<w:br[^>]*\/>/g,'\n').replace(/<\/w:p>/g,'\n').replace(/<\/w:tc>/g,' | ').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/\n{3,}/g,'\n\n').trim()}
async function ai(prompt,{files,tier,kind}={}){try{const r=await api('POST','/api/ai',{prompt,files,tier,kind});return r.result}finally{if(kind)loadAiLeft()}}
async function loadAiLeft(){if(!S.user||S.role==='admin'){S.aiLeft=null;return}try{S.aiLeft=await api('GET','/api/ai/usage');schedule()}catch(e){}}
const aiLeftTxt=k=>S.aiLeft&&!S.viewAs?` <span class="xs" style="opacity:.85">(총 ${S.aiLeft[k]}/${S.aiLeft.limit}회 남음)</span>`:'';
const wikiC={};
async function wiki(t){if(t in wikiC)return wikiC[t];wikiC[t]=null;try{const r=await api('GET','/api/wiki?t='+encodeURIComponent(t));wikiC[t]=r.result}catch(e){}return wikiC[t]}

// ================= 회원 상태 =================
const me=()=>(S.viewAs&&S.members[S.viewAs])||S.user||{};
const nm=mid=>S.members[mid]?.name||'회원';
const remaining=m=>Math.max(0,(+m.total||0)-(+m.used||0));
const isExpired=m=>m.role!=='admin'&&(((+m.total||0)>0&&(+m.used||0)>=(+m.total||0))||(m.endDate&&m.endDate<today()));
function mstate(m){if(m.role==='admin')return'admin';if(m.blocked)return'blocked';if(isExpired(m))return'expired';return'active'}
const stChip=m=>({active:'<span class="chip g">이용중</span>',expired:'<span class="chip y">만료</span>',blocked:'<span class="chip r">차단</span>',admin:'<span class="chip p">관리자</span>'})[mstate(m)];
function futureOf(mid){const now=new Date();return S.bookings.filter(b=>b.memberId===mid&&b.status==='booked'&&slotDT(b.date,b.time)>now).sort(byDT)}
const reservable=m=>remaining(m)-futureOf(m.id).filter(b=>b.type==='lesson').length;
function doLogout(msg){TOK='';ls.del('core_tok');S.user=null;S.role=null;S.since=0;for(const k in DB)delete DB[k];S._md={};S.selMember=null;S.f={};S.tab='home';S.sub={};S.modal=null;$('#modal').innerHTML='';if(msg)S.loginMsg=msg;render()}
A.logout=async()=>{if(!await ask('로그아웃할까요?','','로그아웃'))return;await api('POST','/api/logout').catch(()=>{});doLogout()};
const setTok=r=>{TOK=r.token||'';ls.set('core_tok',TOK)};

// ================= 진입 =================
function render(){const app=$('#app');const keep=[...app.querySelectorAll('.pills,.seg')].map(e=>e.scrollLeft);let h;if(S.boot)h=vSplash();else if(S.needSetup)h=vSetup();else if(!S.user)h=vLogin();else h=admin()?vAdmin():vMember();app.innerHTML=h;if(keep.some(x=>x))app.querySelectorAll('.pills,.seg').forEach((e,i)=>{if(keep[i])e.scrollLeft=keep[i]})}
const vSplash=()=>`<div class="splash"><div class="col" style="align-items:center"><div class="pulse">${LOGO(76)}</div>${WORD}</div></div>`;
function vSetup(){const i=(k,l,t='text',ph='')=>`<div><label class="fl">${l}</label><input class="inp" type="${t}" data-f="${k}" value="${esc(fv(k))}" placeholder="${ph}" autocomplete="off" autocapitalize="off"></div>`;
 return `<div class="auth"><div class="brand">${LOGO(80)}${WORD}<p class="muted">처음 오셨네요! 관리자 계정과 전용코드를 만들어주세요.</p></div><div class="card col">
 <h2>초기 설정</h2>${i('su_name','트레이너 이름','text','예: 김코치')}${i('su_id','관리자 아이디','text','영문/숫자 3자 이상')}${i('su_pw','비밀번호','password')}${i('su_pw2','비밀번호 확인','password')}<div class="hr"></div>${i('su_ac','관리자 전용코드','text','예: ADMIN2026')}${i('su_mc','회원 전용코드','text','예: CORE1234')}
 <p class="xs muted">회원은 '회원 전용코드', 트레이너는 '관리자 전용코드'로 로그인해요. 두 코드는 설정에서 언제든 바꿀 수 있어요.</p><div class="err">${esc(S.err||'')}</div><button class="btn grad lg full" data-a="setup" ${dis('setup')}>${bz('setup','시작하기')}</button></div></div>`}
A.setup=()=>busy('setup',async()=>{const f=k=>(S.f[k]||'').trim();S.err='';if(f('su_pw')!==f('su_pw2')){S.err='비밀번호가 서로 달라요.';return}
 try{setTok(await api('POST','/api/setup',{name:f('su_name'),loginId:f('su_id'),pw:f('su_pw'),adminCode:f('su_ac'),memberCode:f('su_mc')}));S.needSetup=false;S.f={};await loadMe();toast('설정 완료! 이제 회원을 등록해보세요.')}catch(e){S.err=e.message}});
function vLogin(){return `<div class="auth"><div style="position:absolute;top:calc(env(safe-area-inset-top) + 14px);right:16px">${themeBtn()}</div><div class="brand">${LOGO(84)}${WORD}<p class="muted sm">운동 · 식단 · 예약을 한 곳에서</p></div>
 <div class="card col"><div><label class="fl">아이디</label><input class="inp" data-f="lg_id" value="${esc(fv('lg_id'))}" autocomplete="username" autocapitalize="off"></div>
 <div><label class="fl">비밀번호</label><input class="inp" type="password" data-f="lg_pw" value="${esc(fv('lg_pw'))}" autocomplete="current-password"></div>
 <div><label class="fl">전용코드</label><input class="inp" data-f="lg_code" value="${esc(fv('lg_code'))}" autocomplete="off" autocapitalize="off" placeholder="센터에서 받은 코드"></div>
 <div class="err">${esc(S.err||S.loginMsg||'')}</div><button class="btn grad lg full" data-a="login" ${dis('login')}>${bz('login','로그인')}</button>
 <p class="xs muted" style="text-align:center">계정이 없으신가요? 트레이너에게 등록을 요청해주세요.</p></div></div>`}
A.login=()=>busy('login',async()=>{S.err='';S.loginMsg='';try{setTok(await api('POST','/api/login',{id:S.f.lg_id,pw:S.f.lg_pw,code:S.f.lg_code}));S.f={};S.tab='home';await loadMe()}catch(e){S.err=e.message}});
async function loadMe(){if(!TOK){S.user=null;render();return}try{const r=await api('GET','/api/me');S.user=r.user;S.role=r.role;S.ai=r.ai;S.since=0;await sync();loadAiLeft()}catch(e){S.user=null}render()}

// ================= 레이아웃 =================
function previewBar(){if(!S.viewAs)return '';const m=S.members[S.viewAs];return `<div class="pvbar"><span>👀 <b>${esc(m?.name||'회원')}</b>님이 보는 화면 (미리보기)</span><span class="row nw" style="gap:6px">${members().length>1?`<button class="btn sm" data-a="viewAsPick">회원 바꾸기</button>`:''}<button class="btn sm pri" data-a="viewAsExit">관리자로</button></span></div>`}
A.viewAs=({id})=>{const ms=members().filter(m=>m.role!=='admin');if(!ms.length)return toast('먼저 회원을 등록해주세요');if(id&&S.members[id])return startView(id);if(ms.length===1)return startView(ms[0].id);A.viewAsPick()};
A.viewAsPick=()=>{const ms=members().sort((a,b)=>(a.name||'').localeCompare(b.name||''));openModal(()=>`${mh('어떤 회원 화면으로 볼까요?')}<div class="list">${ms.map(m=>`<div class="li tap" data-a="viewAsGo" data-id="${m.id}"><b class="grow">${esc(m.name)}</b>${stChip(m)}${ic('right',16)}</div>`).join('')}</div>`)};
A.viewAsGo=({id})=>{closeModal();startView(id)};
function startView(id){if(!S.viewAs)S.adminState={tab:S.tab,sub:{...S.sub},sel:S.selMember};S.viewAs=id;S.tab='home';S.sub={};S.selMember=null;S.bk={};S.wlDate=null;S.dietDate=null;window.scrollTo(0,0);render();toast(`${S.members[id]?.name||'회원'}님 화면으로 전환했어요`)}
A.viewAsExit=()=>{const st=S.adminState||{};S.viewAs=null;S.tab=st.tab||'home';S.sub=st.sub||{};S.selMember=st.sel||null;S.bk={};S.wlDate=null;S.dietDate=null;window.scrollTo(0,0);render()};
function shell(nav,body){const tabs=nav.map(([k,l,i])=>`<button class="${S.tab===k?'on':''}" data-a="go" data-t="${k}">${ic(i,22)}<span>${l}</span></button>`).join('');
 return `<header class="top ${S.viewAs?'pv':''}">${previewBar()}<div class="topin">${LOGO(34)}${WORD}${admin()?'<span class="role">관리자</span>':''}<span class="sp"></span>${admin()?`<button class="vabtn" data-a="viewAs">${ic('users',16)}<span>회원 화면</span></button>`:''}${themeBtn()}<button class="ib" data-a="logout" title="로그아웃">${ic('out',18)}</button></div></header><main class="shell" id="view">${body}</main><nav class="bot">${tabs}</nav>`}
A.go=d=>{S.tab=d.t;if(d.s)S.sub[d.t]=d.s;if(d.t!=='members'&&S.selMember&&!d.keep)S.selMember=null;window.scrollTo(0,0);render()};
A.sub=d=>{S.sub[d.k]=d.v;render();renderModal()};
const seg=(k,opts,def)=>{const cur=S.sub[k]||def||opts[0][0];return `<div class="seg">${opts.map(([v,l])=>`<button class="${cur===v?'on':''}" data-a="sub" data-k="${k}" data-v="${v}">${l}</button>`).join('')}</div>`};
const subOf=(k,def)=>S.sub[k]||def;
function ring(p,sz=64,label,col='var(--pri)',bg='var(--card2)',tc='var(--tx)'){p=Math.max(0,Math.min(1,p||0));const r=26,c=2*Math.PI*r;return `<svg width="${sz}" height="${sz}" viewBox="0 0 64 64"><circle cx="32" cy="32" r="${r}" fill="none" stroke="${bg}" stroke-width="7"/><circle cx="32" cy="32" r="${r}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${c*p} ${c}" transform="rotate(-90 32 32)"/><text x="32" y="37" text-anchor="middle" font-weight="800" font-size="14" fill="${tc}">${label??Math.round(p*100)+'%'}</text></svg>`}
function spark(vals,labels,h=120){if(vals.length<2)return '<p class="muted sm">기록이 2개 이상 쌓이면 그래프가 보여요.</p>';const W=320,P=26;const mn=Math.min(...vals),mx=Math.max(...vals);const rg=mx-mn||1;const x=i=>P+i*(W-P*2)/(vals.length-1),y=v=>h-22-((v-mn)/rg)*(h-46);const pts=vals.map((v,i)=>`${x(i)},${y(v)}`).join(' ');
 return `<div class="chart"><svg viewBox="0 0 ${W} ${h}"><defs><linearGradient id="sg" x1="0" x2="1"><stop offset="0" stop-color="#4F5BFF"/><stop offset="1" stop-color="#FF7A93"/></linearGradient></defs><polyline points="${pts}" fill="none" stroke="url(#sg)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>${vals.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="var(--card)" stroke="var(--pri)" stroke-width="2.5"/><text x="${x(i)}" y="${y(v)-9}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--tx)">${v}</text>${labels?`<text x="${x(i)}" y="${h-5}" text-anchor="middle" font-size="9" fill="var(--mu)">${esc(labels[i])}</text>`:''}`).join('')}</svg></div>`}
const ul=a=>Array.isArray(a)&&a.length?`<ul>${a.map(x=>`<li>${esc(typeof x==='string'?x:JSON.stringify(x))}</li>`).join('')}</ul>`:'';
function confetti(){const c=document.createElement('canvas');c.id='confetti';c.width=innerWidth;c.height=innerHeight;document.body.appendChild(c);const x=c.getContext('2d');const cols=['#4F5BFF','#8B5CFF','#FF7A93','#FFB547','#21D4A8'];const ps=[...Array(140)].map(()=>({x:innerWidth/2,y:innerHeight*.35,vx:(Math.random()-.5)*14,vy:Math.random()*-14-4,s:Math.random()*7+4,c:cols[Math.random()*5|0],r:Math.random()*6}));let f=0;(function t(){x.clearRect(0,0,c.width,c.height);ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.45;p.r+=.2;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6);x.restore()});if(++f<110)requestAnimationFrame(t);else c.remove()})()}

// ================= 해부학 바디맵 =================
const MSH={chest:[['e',43.5,45,7.5,6],['e',56.5,45,7.5,6]],delts:[['e',35,37,6,5.5],['e',65,37,6,5.5],['e',135,37,6,5.5],['e',165,37,6,5.5]],biceps:[['e',30,51,3.8,8.5],['e',70,51,3.8,8.5]],triceps:[['e',130,51,3.8,8.5],['e',170,51,3.8,8.5]],forearms:[['e',26,76,3.5,10],['e',74,76,3.5,10],['e',126,76,3.5,10],['e',174,76,3.5,10]],abs:[['r',45,53,10,27,4]],obliques:[['e',39.6,66,3,10],['e',60.4,66,3,10]],traps:[['p','M140 31 L150 27 L160 31 L157 42 L150 54 L143 42 Z']],lats:[['p','M139 44 Q135 56 141 72 L148 66 L147 45 Z'],['p','M161 44 Q165 56 159 72 L152 66 L153 45 Z']],lowerback:[['r',146,62,8,18,3]],glutes:[['e',144.5,88,6,6.5],['e',155.5,88,6,6.5]],quads:[['e',44.3,103,5.6,15],['e',55.7,103,5.6,15]],adductors:[['e',48.7,96,1.6,8],['e',51.3,96,1.6,8]],hamstrings:[['e',144.3,108,5,13],['e',155.7,108,5,13]],calves:[['e',43.6,140,3.6,11],['e',56.4,140,3.6,11],['e',144,138,4.3,11],['e',156,138,4.3,11]]};
function bodyMap(p=[],s=[]){const col=k=>p.includes(k)?'url(#bmg)':s.includes(k)?'var(--mus2)':'var(--mus)';const sil=o=>`<circle cx="${o+50}" cy="15" r="8" fill="var(--body)"/><rect x="${o+46.5}" y="21" width="7" height="9" fill="var(--body)"/><path d="M${o+35} 32 Q${o+50} 28 ${o+65} 32 L${o+62} 84 Q${o+50} 88 ${o+38} 84 Z" fill="var(--body)"/><g stroke="var(--body)" stroke-linecap="round" stroke-linejoin="round" fill="none"><polyline points="${o+34},35 ${o+28},62 ${o+24.5},90" stroke-width="9"/><polyline points="${o+66},35 ${o+72},62 ${o+75.5},90" stroke-width="9"/><polyline points="${o+44.5},84 ${o+44},122 ${o+44},158" stroke-width="12"/><polyline points="${o+55.5},84 ${o+56},122 ${o+56},158" stroke-width="12"/></g>`;
 const sh=(x,k)=>x[0]==='e'?`<ellipse cx="${x[1]}" cy="${x[2]}" rx="${x[3]}" ry="${x[4]}" fill="${col(k)}"/>`:x[0]==='r'?`<rect x="${x[1]}" y="${x[2]}" width="${x[3]}" height="${x[4]}" rx="${x[5]}" fill="${col(k)}"/>`:`<path d="${x[1]}" fill="${col(k)}"/>`;
 return `<svg viewBox="0 0 200 172" role="img" aria-label="근육 지도"><defs><linearGradient id="bmg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF7A93"/><stop offset="1" stop-color="#FF4D6D"/></linearGradient></defs>${sil(0)}${sil(100)}${Object.entries(MSH).map(([k,a])=>a.map(x=>sh(x,k)).join('')).join('')}<text x="50" y="170" text-anchor="middle" font-size="9" fill="var(--mu)" font-weight="700">앞</text><text x="150" y="170" text-anchor="middle" font-size="9" fill="var(--mu)" font-weight="700">뒤</text></svg>`}

// ================= 회원 앱 =================
function vMember(){const nav=[['home','홈','home'],['work','운동','work'],['diet','식단','diet'],['book','예약','cal'],['video','영상','play'],['me','내 정보','user']];
 const b={home:vMHome,work:()=>vWorkout(me().id,false),diet:()=>vDiet(me().id,false),book:vMBook,video:vMVideo,me:vMe}[S.tab]||vMHome;return shell(nav,b())}
function noticeStrip(){const n=S.notices[0];if(!n)return'';return `<div class="notice" data-a="notices"><span class="chip p xs">${n.pinned?'📌 ':''}공지</span><span class="nt b">${esc(n.title)}</span>${S.notices.length>1?`<span class="xs muted">+${S.notices.length-1}</span>`:''}${ic('right',16)}</div>`}
A.notices=()=>openModal(()=>`${mh('공지사항')}${S.notices.length?S.notices.map(n=>`<div class="card"><div class="row sb"><b>${n.pinned?'📌 ':''}${esc(n.title)}</b><span class="xs muted">${ago(n.createdAt)}</span></div><p class="sm" style="white-space:pre-wrap">${esc(n.body)}</p></div>`).join(''):'<p class="empty">공지가 없어요.</p>'}`);
function greet(){const h=new Date().getHours();return h<5?'늦은 밤이에요':h<11?'좋은 아침이에요':h<17?'좋은 오후예요':h<21?'오늘도 수고했어요':'편안한 밤 되세요'}
function todayPlan(mid){const r=md(mid).routine?.plan;const dw=DOW[new Date().getDay()];return r?.days?.find(x=>String(x.day||'').startsWith(dw))}
function missions(mid){const d=md(mid);const meal=d.meals[today()];const td=todayPlan(mid);const wl=d.wlogs.find(w=>w.date===today());const l=[];
 if(td)l.push(['💪',`오늘 운동 · ${td.focus||'루틴'}`,!!(wl&&(wl.entries||[]).length),'work']);else l.push(['🧘','휴식일 · 스트레칭 10분',!!(wl&&(wl.entries||[]).length)||!!ls.get('core_rest_'+today()),'rest']);
 l.push(['🍽️',`식단 기록 (${['breakfast','lunch','dinner'].filter(k=>slotFilled(meal,k)).length}/3끼)`,['breakfast','lunch','dinner'].every(k=>slotFilled(meal,k)),'diet']);
 l.push(['🍓','간식도 기록하기',slotFilled(meal,'snack'),'diet']);return l}
function vMHome(){const m=me();const d=md(m.id);const nb=futureOf(m.id)[0];const td=todayPlan(m.id);const st=mealStats(d);const ms=missions(m.id);const done=ms.filter(x=>x[2]).length;const q=QUOTES[(new Date().getDate()+m.id.length)%QUOTES.length];
 if(done===ms.length&&!ls.get('core_cf_'+today())){ls.set('core_cf_'+today(),1);setTimeout(()=>{confetti();toast('오늘의 미션 완료! 정말 멋져요 🎉')},300)}
 const dd=nb?Math.round((parseD(nb.date)-parseD(today()))/864e5):null;const week=[...Array(7)].map((_,i)=>addDays(today(),i-6));
 return `<div class="card hero"><div class="row sb" style="position:relative;z-index:1"><div><div class="muted sm">${fmtD(today())}</div><h1 style="color:#fff">${greet()}, ${esc(m.name)}님</h1></div><div style="text-align:center">${ring(done/ms.length,62,`${done}/${ms.length}`,'#fff','rgba(255,255,255,.25)','#fff')}</div></div>
 <div style="position:relative;z-index:1;font-size:13.5px;opacity:.95">“${esc(q)}”</div><div style="position:relative;z-index:1">${ms.map(([e,t,ok,go])=>`<div class="mission ${ok?'':'dim'} tap" data-a="${go==='rest'?'restDone':'go'}" data-t="${go}"><span class="ck ${ok?'on':''}">${ok?ic('check',16):''}</span><span class="grow b">${e} ${esc(t)}</span>${ic('right',16)}</div>`).join('')}</div></div>
 ${noticeStrip()}
 <div class="g2"><div class="card tap tint1" data-a="go" data-t="book">${nb?`<div class="row sb"><span class="muted xs b">다음 예약</span><span class="dday">${dd===0?'D-DAY':'D-'+dd}</span></div><div class="big num">${nb.time}</div><div class="sm b">${fmtD(nb.date)}</div><span class="tag ${nb.type==='consult'?'c':''}">${typeName(nb.type)}</span>`:`<div class="muted xs b">다음 예약</div><div class="b" style="margin-top:8px">아직 예약이 없어요</div><div class="sm pc b">예약하러 가기 →</div>`}</div>
 <div class="card tap tint2" data-a="go" data-t="me"><div class="muted xs b">잔여 수업</div><div class="ringw">${ring((+m.used||0)/Math.max(1,+m.total||0),54,remaining(m),'var(--mint)')}<div><div class="big num" style="font-size:26px">${remaining(m)}<small>회</small></div><div class="xs muted">${m.used||0}/${m.total||0}회 진행</div></div></div></div></div>
 <div class="card"><div class="row sb"><h3>오늘의 운동</h3>${td?`<span class="chip p">${esc(td.focus||'')}</span>`:''}</div>
 ${td?`<div class="list">${(td.exercises||[]).slice(0,6).map(e=>`<div class="li"><span class="exn grow" data-a="exOpen" data-n="${esc(e.name)}">${esc(e.name)}</span><span class="sm muted num">${esc(e.weight||'')} · ${esc(e.sets||'')}×${esc(e.reps||'')}</span></div>`).join('')}</div><button class="btn grad lg full" data-a="sesStart" data-m="${m.id}" data-day="${esc(td.day)}">${ic('timer',18)} 운동 시작하기</button>`:`<p class="muted sm">${md(m.id).routine?.plan?'오늘은 휴식일이에요. 가벼운 스트레칭을 추천해요.':'아직 루틴이 없어요. 운동 탭에서 AI 루틴을 만들어보세요.'}</p><button class="btn soft full" data-a="go" data-t="work">${md(m.id).routine?.plan?'루틴 보기':'AI 루틴 만들기'}</button>`}</div>
 <div class="card"><div class="row sb"><h3>오늘의 식단</h3><span class="chip r">${ic('flame',13)} ${st.streak}일 연속</span></div>
 <div class="g4">${SLOTS.map(([k,l,e])=>{const s=d.meals[today()]?.slots?.[k];return s?.photo?`<div class="tap" data-a="go" data-t="diet" style="text-align:center"><img src="${fileUrl(s.photo)}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:16px"><div class="xs b">${l} ✓</div></div>`:`<label class="tap" style="text-align:center;display:block;cursor:pointer"><div style="aspect-ratio:1;border-radius:16px;background:var(--card2);display:grid;place-items:center;font-size:24px">${S.busy[`ml_${m.id}_${today()}_${k}`]?'<span class="spin"></span>':slotFilled(d.meals[today()],k)?'✅':e}</div><div class="xs b muted">${l}</div><input type="file" accept="image/*" hidden data-file="mealPhoto" data-m="${m.id}" data-d="${today()}" data-s="${k}"></label>`}).join('')}</div>
 <div class="row sb xs muted"><span>사진을 탭해서 바로 기록해요</span><span>Lv.${st.lv} ${st.title} · ${st.pts}P</span></div></div>
 <div class="card"><h3>이번 주 기록</h3><div class="wk7">${week.map(w=>{const wl=d.wlogs.find(x=>x.date===w);const mc=SLOTS.filter(s=>slotFilled(d.meals[w],s[0])).length;return `<div><div class="xs b muted">${DOW[parseD(w).getDay()]}</div><div class="c ${wl||mc>=3?'on':''} ${w===today()?'td':''}">${wl?'💪':mc>=3?'🥗':mc?mc:''}</div></div>`}).join('')}</div><p class="xs muted">💪 운동 기록 · 🥗 3끼 이상 식단 기록</p></div>
 ${installCard()}`}
A.restDone=()=>{ls.set('core_rest_'+today(),1);toast('스트레칭 완료! 잘 쉬는 것도 실력이에요');render()};
function installCard(){if(ls.get('core_inst')||matchMedia('(display-mode: standalone)').matches)return'';const ios=/iphone|ipad/i.test(navigator.userAgent);return `<div class="card flat"><div class="install">${LOGO(44)}<div class="grow"><b>홈 화면에 Core 추가하기</b><div class="xs muted">${ios?'Safari 공유 버튼 → "홈 화면에 추가"':'브라우저 메뉴(⋮) → "홈 화면에 추가" 또는 "앱 설치"'}로 앱처럼 바로 열 수 있어요.</div></div><button class="x" data-a="instHide">×</button></div></div>`}
A.instHide=()=>{ls.set('core_inst',1);render()};

// ================= 운동 =================
function allEx(){const custom=Object.values(S.exlib).filter(x=>x.custom).map(x=>({id:x.id,n:x.n,en:x.en||'',cat:x.cat||'기타',p:x.p||[],s:x.s||[],eq:x.eq||'',a:x.a||'',u:x.u||'',st:x.st||[],c:x.c||[],custom:true}));return [...EX,...custom]}
function findEx(name){const q=String(name||'').replace(/\s/g,'').toLowerCase();if(!q)return null;const all=allEx();const k=e=>e.n.replace(/\s/g,'').replace(/\(.*\)/,'').toLowerCase();return all.find(e=>e.n.replace(/\s/g,'').toLowerCase()===q)||all.find(e=>q.includes(k(e))||k(e).includes(q))}
function vWorkout(mid,adm){const opts=adm?[['routine','AI 루틴'],['log','운동 기록']]:[['routine','AI 루틴'],['log','운동 기록'],['lib','운동 사전']];const k=adm?'awork':'work';const cur=subOf(k,'routine');
 return `${seg(k,opts,'routine')}${cur==='log'?logSec(mid,adm):cur==='lib'?libSec(false):routineSec(mid,adm)}`}
const DAYS7=['월','화','수','목','금','토','일'];
function routineSec(mid,adm){const R=md(mid).routine||{};const base=R.baseline||[];const P=R.prefs||{};const plan=R.plan;const sel=(k,l,arr,def)=>`<div><label class="fl">${l}</label><select class="inp" data-f="${fk(mid,k)}">${arr.map(o=>`<option ${fv(fk(mid,k),P[k]||def)===o?'selected':''}>${o}</option>`).join('')}</select></div>`;const dw=DOW[new Date().getDay()];
 return `<div class="card"><div class="row sb"><h3>기본 운동 정보</h3><span class="xs muted">${adm?'회원의 현재 수행 능력':'트레이너가 입력한 내 기록'}</span></div>
 ${base.length?`<table class="tbl"><tr><th>종목</th><th>무게</th><th>횟수</th><th>세트</th><th>1RM</th>${adm?'<th></th>':''}</tr>${base.map((b,i)=>`<tr><td><span class="exn" data-a="exOpen" data-n="${esc(b.name)}">${esc(b.name)}</span>${b.memo?`<div class="xs muted">${esc(b.memo)}</div>`:''}</td><td class="num">${esc(b.w)}kg</td><td class="num">${esc(b.r)}</td><td class="num">${esc(b.s||'-')}</td><td class="num muted">${b.w&&b.r?epley(+b.w,+b.r):'-'}</td>${adm?`<td class="right"><button class="x" data-a="blDel" data-m="${mid}" data-i="${i}">×</button></td>`:''}</tr>`).join('')}</table>`:`<p class="muted sm">${adm?'예: 랫풀다운 60kg 10회 3세트 — 다양한 종목을 입력할수록 AI 루틴이 정확해져요.':'아직 입력된 정보가 없어요.'}</p>`}
 ${adm?`<div class="fg4"><input class="inp" list="exlist" placeholder="종목" data-f="bl_n" value="${esc(fv('bl_n'))}"><input class="inp" type="number" inputmode="decimal" placeholder="kg" data-f="bl_w" value="${esc(fv('bl_w'))}"><input class="inp" type="number" inputmode="numeric" placeholder="회" data-f="bl_r" value="${esc(fv('bl_r'))}"><input class="inp" type="number" inputmode="numeric" placeholder="세트" data-f="bl_s" value="${esc(fv('bl_s'))}"></div><input class="inp" placeholder="메모 (예: 그립 넓게, 어깨 통증 주의)" data-f="bl_m" value="${esc(fv('bl_m'))}"><button class="btn soft full" data-a="blAdd" data-m="${mid}">${ic('plus',16)} 운동 정보 추가</button>${exDatalist()}`:''}</div>
 <div class="card"><h3>나에게 맞춘 루틴 조건</h3><p class="xs muted">${adm?'회원과 상의해 조건을 정하고 AI 루틴을 만들어주세요.':'내 일정과 컨디션에 맞게 자유롭게 바꿔서 다시 만들 수 있어요.'}</p>
 <div><label class="fl">운동 가능 요일</label><div class="daychk">${DAYS7.map(x=>`<label><input type="checkbox" data-f="${fk(mid,'d_'+x)}" ${fv(fk(mid,'d_'+x),(P.days||[]).includes(x))?'checked':''}><span>${x}</span></label>`).join('')}</div></div>
 <div class="fg">${sel('split','루틴(분할)',['AI 추천','무분할(전신)','상·하체 2분할','3분할(밀기/당기기/하체)','4분할','5분할'],'AI 추천')}${sel('intensity','강도',['낮음(입문)','보통','높음','매우 높음'],'보통')}${sel('time','1회 운동시간',['30분','45분','60분','75분','90분'],'60분')}${sel('cardio','유산소',['없음','웨이트 후 20분','웨이트 후 30분','웨이트 전 10분 워밍업','별도 유산소 데이'],'웨이트 후 20분')}${sel('goal','목표',['체지방 감량','근육량 증가','근력 향상','체력·건강','체형 교정','재활·통증 관리'],'체지방 감량')}${sel('level','운동 경력',['입문(3개월 미만)','초급(1년 미만)','중급(1~3년)','상급(3년 이상)'],'초급(1년 미만)')}</div>
 <div><label class="fl">추가 요청 (통증 부위, 집중 부위, 피하고 싶은 운동 등)</label><textarea class="inp" data-f="${fk(mid,'memo')}" placeholder="예: 오른쪽 어깨가 불편해요. 하체 위주로 해주세요.">${esc(fv(fk(mid,'memo'),P.memo||''))}</textarea></div>
 <button class="btn grad lg full" data-a="genRoutine" data-m="${mid}" ${dis('gen'+mid)}>${bz('gen'+mid,ic('spark',18)+' AI 루틴 생성'+(adm?'':aiLeftTxt('routine')),'AI가 루틴을 설계 중… (최대 1분)')}</button></div>
 ${plan?`<div class="card"><div class="row sb"><h2>${esc(plan.title||'나의 주간 루틴')}</h2><span class="xs muted">${ago(R.generatedAt)} · ${R.generatedBy==='admin'?'트레이너':'회원'} 생성</span></div><p class="sm">${esc(plan.summary||'')}</p>
 ${(plan.days||[]).map(day=>{const isT=String(day.day||'').startsWith(dw);return `<div class="day ${isT?'today':''}"><div class="row sb"><div class="row"><b style="font-size:19px">${esc(day.day)}</b><span class="chip p">${esc(day.focus||'')}</span>${isT?'<span class="chip r">오늘</span>':''}</div><span class="xs muted">${esc(day.minutes?day.minutes+'분':'')}</span></div>
 ${day.warmup?`<div class="xs muted">🔥 워밍업 · ${esc(day.warmup)}</div>`:''}
 <table class="tbl"><tr><th>운동</th><th>세트×횟수</th><th>무게</th><th>휴식</th></tr>${(day.exercises||[]).map(e=>`<tr><td><span class="exn" data-a="exOpen" data-n="${esc(e.name)}">${esc(e.name)}</span>${e.tip?`<div class="xs muted">${esc(e.tip)}</div>`:''}</td><td class="num">${esc(e.sets)}×${esc(e.reps)}</td><td class="num">${esc(e.weight||'-')}</td><td class="xs">${esc(e.rest||'')}</td></tr>`).join('')}</table>
 ${day.cardio?`<div class="note">🏃 유산소 · ${esc(day.cardio)}</div>`:''}${day.cooldown?`<div class="xs muted">🧘 마무리 · ${esc(day.cooldown)}</div>`:''}
 <button class="btn ${isT?'grad':'soft'} full" data-a="sesStart" data-m="${mid}" data-day="${esc(day.day)}">${ic('timer',16)} 이 루틴으로 운동 시작</button></div>`}).join('')}
 ${plan.progression?`<div class="sec"><h4>점진적 과부하 계획</h4><p class="sm">${esc(plan.progression)}</p></div>`:''}${plan.cautions?.length?`<div class="sec"><h4>주의사항</h4>${ul(plan.cautions)}</div>`:''}</div>`:''}`}
function exDatalist(){return `<datalist id="exlist">${allEx().map(e=>`<option value="${esc(e.n)}">`).join('')}</datalist>`}
A.blAdd=async({m:mid})=>{const n=(S.f.bl_n||'').trim();if(!n)return toast('종목을 입력해주세요');const R=md(mid).routine||{};await put('routines',mid,{...R,memberId:mid,baseline:[...(R.baseline||[]),{name:n,w:+S.f.bl_w||0,r:+S.f.bl_r||0,s:+S.f.bl_s||0,memo:S.f.bl_m||''}]},logo('workout',`${nm(mid)} 기본 운동 정보: ${n} ${S.f.bl_w||0}kg×${S.f.bl_r||0}`));clearF('bl_');render()};
A.blDel=async({m:mid,i})=>{const R=md(mid).routine||{};const baseline=[...(R.baseline||[])];baseline.splice(+i,1);await put('routines',mid,{...R,memberId:mid,baseline})};
function readPrefs(mid){const P=md(mid).routine?.prefs||{};const g=(k,d)=>fv(fk(mid,k),P[k]||d);return {days:DAYS7.filter(x=>fv(fk(mid,'d_'+x),(P.days||[]).includes(x))),split:g('split','AI 추천'),intensity:g('intensity','보통'),time:g('time','60분'),cardio:g('cardio','웨이트 후 20분'),goal:g('goal','체지방 감량'),level:g('level','초급(1년 미만)'),memo:g('memo','')}}
A.genRoutine=({m:mid})=>busy('gen'+mid,async()=>{const prefs=readPrefs(mid);if(!prefs.days.length)throw new Error('운동 가능 요일을 1개 이상 골라주세요.');const d=md(mid);const R=d.routine||{};const pf=S.members[mid]?.profile||{};
 const recent=d.wlogs.slice(0,8).flatMap(w=>(w.entries||[]).map(e=>`${w.date} ${e.name} ${e.w}kg×${e.r}회×${e.s}세트 (1RM≈${e.rm})`)).slice(0,25);
 const plan=await ai(`너는 대한민국의 숙련된 퍼스널 트레이너다. 아래 회원 정보로 1주일 웨이트 트레이닝 루틴을 설계하라.
[트레이너가 입력한 기본 운동 수행 기록]
${(R.baseline||[]).map(b=>`- ${b.name} ${b.w}kg ${b.r}회 ${b.s||''}세트 ${b.memo||''}`).join('\n')||'- 없음'}
[최근 운동 기록]
${recent.join('\n')||'- 없음'}
[신체 정보] 성별:${pf.sex||'미입력'} 나이:${pf.age||'-'} 키:${pf.h||'-'}cm 체중:${pf.w||'-'}kg 체지방률:${pf.fat||'-'}% 골격근량:${pf.mus||'-'}kg 질환/부상:${pf.disease||'없음'}
[조건] 운동 가능 요일:${prefs.days.join(',')} / 분할:${prefs.split} / 강도:${prefs.intensity} / 1회 운동시간:${prefs.time} / 유산소:${prefs.cardio} / 목표:${prefs.goal} / 경력:${prefs.level}
[추가 요청] ${prefs.memo||'없음'}
규칙: 운동 가능 요일에만 운동일 배치(요일은 "월" 같은 한 글자). 기존 기록의 무게를 기준으로 강도에 맞는 구체적 무게(kg) 제시, 기록 없는 종목은 "가볍게 시작(RPE 6)". 운동 이름은 한국 헬스장 통용 이름(랫풀다운, 벤치프레스, 레그프레스 등). 1회 운동시간 안에 끝나도록 종목 수 조절, 유산소 조건 반영, 부상 부위는 피하거나 대체. 한국어로 짧게.
JSON: {"title":string,"summary":string,"days":[{"day":"월","focus":string,"minutes":number,"warmup":string,"exercises":[{"name":string,"sets":number,"reps":string,"weight":string,"rest":string,"tip":string}],"cardio":string,"cooldown":string}],"progression":string,"cautions":[string]}`,{kind:'routine'});
 if(!plan||!Array.isArray(plan.days))throw new Error('루틴 결과를 읽지 못했어요. 다시 시도해주세요.');
 await put('routines',mid,{...md(mid).routine,memberId:mid,prefs,plan,generatedAt:Date.now(),generatedBy:S.role},logo('routine',`${nm(mid)} AI 루틴 생성 (${prefs.days.join('')} · ${prefs.goal})`));toast('새 루틴이 만들어졌어요!')});
// ---- 운동 진행 모드 ----
A.sesStart=({m:mid,day})=>{const pd=(md(mid).routine?.plan?.days||[]).find(x=>x.day===day);if(!pd)return;const cur=ls.get('core_ses');if(cur&&cur.mid===mid&&cur.date===today()&&cur.day===day){S.ses=cur}else{S.ses={mid,day,date:today(),start:Date.now(),items:(pd.exercises||[]).map(e=>{const w=parseFloat(String(e.weight||'').replace(/[^\d.]/g,''))||'';const r=parseInt(String(e.reps||'').replace(/[^\d]/g,''))||'';return {name:e.name,tip:e.tip||'',rest:e.rest||'',sets:[...Array(Math.max(1,+e.sets||3))].map(()=>({w,r,done:false}))}})}}ls.set('core_ses',S.ses);const f=()=>sesView();openModal(f,true)};
function sesView(){const s=S.ses;if(!s)return'';const tot=s.items.reduce((a,i)=>a+i.sets.length,0),dn=s.items.reduce((a,i)=>a+i.sets.filter(x=>x.done).length,0);const min=Math.floor((Date.now()-s.start)/60000);
 return `${mh(`${esc(s.day)}요일 운동`)}<div class="card hero"><div class="row sb" style="position:relative;z-index:1"><div><div class="muted xs b">진행 ${min}분째</div><div class="big num" style="color:#fff">${dn}<small style="color:rgba(255,255,255,.8)">/${tot} 세트</small></div></div>${ring(dn/tot,60,null,'#fff','rgba(255,255,255,.25)','#fff')}</div></div>
 ${s.items.map((it,i)=>`<div class="card"><div class="row sb"><span class="exn" data-a="exOpen" data-n="${esc(it.name)}" style="font-size:16px">${esc(it.name)}</span><span class="xs muted">${esc(it.rest?'휴식 '+it.rest:'')}</span></div>${it.tip?`<div class="xs muted">${esc(it.tip)}</div>`:''}
 <div class="setrow xs muted b"><span>세트</span><span>무게(kg)</span><span>횟수</span><span></span></div>
 ${it.sets.map((x,j)=>`<div class="setrow ${x.done?'done':''}"><b class="num">${j+1}</b><input class="inp num" type="number" inputmode="decimal" value="${esc(x.w)}" data-ses="${i}.${j}.w"><input class="inp num" type="number" inputmode="numeric" value="${esc(x.r)}" data-ses="${i}.${j}.r"><button class="ck ${x.done?'on':''}" data-a="sesTick" data-i="${i}" data-j="${j}">${ic('check',20)}</button></div>`).join('')}
 <div class="row"><button class="btn sm" data-a="sesSet" data-i="${i}" data-v="1">${ic('plus',14)} 세트</button>${it.sets.length>1?`<button class="btn sm ghost" data-a="sesSet" data-i="${i}" data-v="-1">세트 삭제</button>`:''}</div></div>`).join('')}
 <button class="btn grad lg full" data-a="sesFinish" ${dis('ses')}>${bz('ses','운동 완료 & 기록 저장')}</button><button class="btn ghost full" data-a="sesQuit">기록하지 않고 닫기</button>`}
document.addEventListener('input',e=>{const k=e.target.dataset?.ses;if(!k||!S.ses)return;const [i,j,f]=k.split('.');S.ses.items[i].sets[j][f]=e.target.value;ls.set('core_ses',S.ses)});
A.sesTick=({i,j})=>{const x=S.ses.items[i].sets[j];x.done=!x.done;ls.set('core_ses',S.ses);if(x.done&&navigator.vibrate)navigator.vibrate(30);renderModal()};
A.sesSet=({i,v})=>{const it=S.ses.items[i];if(+v>0){const l=it.sets[it.sets.length-1]||{};it.sets.push({w:l.w,r:l.r,done:false})}else it.sets.pop();ls.set('core_ses',S.ses);renderModal()};
A.sesQuit=async()=>{if(!await ask('운동을 그만할까요?','진행 내용은 저장되지 않아요.','닫기',true))return;S.ses=null;ls.del('core_ses');closeModal()};
A.sesFinish=()=>busy('ses',async()=>{const s=S.ses;const mid=s.mid;const doc=md(mid).wlogs.find(x=>x.date===s.date);const entries=[...(doc?.entries||[])];let cnt=0,sets=0;
 for(const it of s.items){const dn=it.sets.filter(x=>x.done&&(+x.w||+x.r));if(!dn.length)continue;cnt++;sets+=dn.length;const top=dn.reduce((a,b)=>epley(+b.w||0,+b.r||0)>epley(+a.w||0,+a.r||0)?b:a);const e={id:uid(),name:it.name,w:+top.w||0,r:+top.r||0,s:dn.length,rm:Math.max(...dn.map(x=>epley(+x.w||0,+x.r||0))),sets:dn.map(x=>({w:+x.w||0,r:+x.r||0})),memo:'운동 진행 모드 기록',at:Date.now()};const k=entries.findIndex(x=>x.name===it.name);if(k>=0)entries[k]=e;else entries.push(e)}
 if(!cnt)throw new Error('완료(체크)한 세트가 없어요.');
 await put('wlogs',`${mid}_${s.date}`,{memberId:mid,date:s.date,entries,duration:Math.round((Date.now()-s.start)/60000)},logo('workout',`${nm(mid)} 운동 완료: ${cnt}종목 ${sets}세트 (${Math.round((Date.now()-s.start)/60000)}분)`));
 S.ses=null;ls.del('core_ses');closeModal();confetti();toast(`수고했어요! ${cnt}종목 ${sets}세트 기록 완료 💪`)});
function logSec(mid,adm){const d=md(mid);const date=S.wlDate||today();const doc=d.wlogs.find(x=>x.date===date);const entries=doc?.entries||[];const ed=S.f.wl_edit;
 const names=[...new Set(d.wlogs.flatMap(w=>(w.entries||[]).map(e=>e.name)))];const tn=fv('wl_trend',names[0]||'');
 const tr=d.wlogs.filter(w=>(w.entries||[]).some(e=>e.name===tn)).map(w=>({d:w.date,v:Math.max(...w.entries.filter(e=>e.name===tn).map(e=>+e.rm||epley(+e.w,+e.r)))})).sort((a,b)=>a.d.localeCompare(b.d)).slice(-10);
 return `<div class="card"><div class="row sb nw"><button class="ib sm" data-a="wlDay" data-v="-1">${ic('left')}</button><div style="text-align:center"><b>${fmtD(date)}</b>${date===today()?'<div class="xs pc b">오늘</div>':''}</div><button class="ib sm" data-a="wlDay" data-v="1">${ic('right')}</button></div>
 ${entries.length?`<div class="list">${entries.map(e=>`<div class="li"><div class="grow"><span class="exn" data-a="exOpen" data-n="${esc(e.name)}">${esc(e.name)}</span><div class="sm num">${n1(e.w)}kg × ${e.r}회 × ${e.s||'-'}세트 <span class="muted">· 1RM ${n1(e.rm)}kg</span></div>${e.sets?.length?`<div class="xs muted num">${e.sets.map(x=>`${x.w}×${x.r}`).join(' / ')}</div>`:''}${e.memo?`<div class="xs muted">${esc(e.memo)}</div>`:''}</div><button class="ib sm" data-a="wlEdit" data-i="${e.id}" data-m="${mid}">${ic('edit',16)}</button><button class="ib sm" data-a="wlDel" data-i="${e.id}" data-m="${mid}">${ic('trash',16)}</button></div>`).join('')}</div>${doc?.updatedAt?`<div class="xs muted">마지막 수정 ${ago(doc.updatedAt)} · ${doc.updatedBy==='admin'?'트레이너':'회원'}${doc.duration?` · ${doc.duration}분 운동`:''}</div>`:''}`:'<p class="empty">이 날의 운동 기록이 없어요.</p>'}</div>
 <div class="card"><h3>${ed?'기록 수정':'운동 기록 추가'}</h3>
 <div><label class="fl">운동 종목</label><input class="inp" list="exlist" data-f="wl_name" value="${esc(fv('wl_name'))}" placeholder="예: 랫풀다운"></div>
 <div class="fg"><div><label class="fl">무게(kg)</label><input class="inp num" type="number" inputmode="decimal" data-f="wl_w" data-live="rm" value="${esc(fv('wl_w'))}"></div><div><label class="fl">반복 횟수</label><input class="inp num" type="number" inputmode="numeric" data-f="wl_r" data-live="rm" value="${esc(fv('wl_r'))}"></div><div><label class="fl">세트</label><input class="inp num" type="number" inputmode="numeric" data-f="wl_s" value="${esc(fv('wl_s'))}"></div><div><label class="fl">1RM(kg) <span id="p-rm" class="pc">${PART.rm()}</span></label><input class="inp num" type="number" inputmode="decimal" data-f="wl_rm" value="${esc(fv('wl_rm'))}" placeholder="비우면 자동 계산"></div></div>
 <div><label class="fl">메모</label><input class="inp" data-f="wl_memo" value="${esc(fv('wl_memo'))}" placeholder="컨디션, 자세 느낌 등"></div>
 <div class="row">${ed?'<button class="btn" data-a="wlCancel">취소</button>':''}<button class="btn pri" style="flex:1" data-a="wlSave" data-m="${mid}">${ed?'수정 저장':'기록 저장'}</button></div>${exDatalist()}</div>
 ${names.length?`<div class="card"><div class="row sb"><h3>1RM 변화</h3><select class="inp" style="width:auto" data-f="wl_trend" data-rr>${names.map(n=>`<option ${n===tn?'selected':''}>${esc(n)}</option>`).join('')}</select></div>${spark(tr.map(x=>x.v),tr.map(x=>x.d.slice(5)))}</div>`:''}
 <div class="card"><h3>업데이트 내역</h3>${d.wlogs.length?`<div class="list">${d.wlogs.slice(0,14).map(w=>`<div class="li tap" data-a="wlGo" data-d="${w.date}"><div class="grow"><b>${fmtD(w.date)}</b><div class="xs muted ell">${(w.entries||[]).map(e=>`${e.name} ${n1(e.w)}kg×${e.r}`).join(', ')}</div></div><span class="xs muted right">${w.updatedBy==='admin'?'트레이너':'회원'}<br>${ago(w.updatedAt)}</span></div>`).join('')}</div>`:'<p class="muted sm">아직 기록이 없어요.</p>'}</div>`}
PART.rm=()=>{const w=+S.f.wl_w||0,r=+S.f.wl_r||0;return w&&r?`예상 ${epley(w,r)}kg`:''};
A.wlDay=({v})=>{S.wlDate=addDays(S.wlDate||today(),+v);render()};A.wlGo=({d})=>{S.wlDate=d;window.scrollTo(0,0);render()};
A.wlEdit=({i,m:mid})=>{const date=S.wlDate||today();const e=(md(mid).wlogs.find(x=>x.date===date)?.entries||[]).find(x=>x.id===i);if(!e)return;Object.assign(S.f,{wl_edit:i,wl_name:e.name,wl_w:e.w,wl_r:e.r,wl_s:e.s,wl_rm:e.rm,wl_memo:e.memo||''});render()};
A.wlCancel=()=>{clearF('wl_');render()};
A.wlSave=async({m:mid})=>{const date=S.wlDate||today();const doc=md(mid).wlogs.find(x=>x.date===date);const entries=[...(doc?.entries||[])];const name=(S.f.wl_name||'').trim();if(!name)return toast('운동 종목을 입력해주세요');const w=+S.f.wl_w||0,r=+S.f.wl_r||0;let rm=+S.f.wl_rm||0;if(!rm&&w&&r)rm=epley(w,r);
 const old=entries.find(x=>x.id===S.f.wl_edit);const e={id:S.f.wl_edit||uid(),name,w,r,s:+S.f.wl_s||0,rm,memo:S.f.wl_memo||'',at:Date.now()};const i=entries.findIndex(x=>x.id===e.id);if(i>=0)entries[i]=e;else entries.push(e);
 await put('wlogs',`${mid}_${date}`,{...doc,memberId:mid,date,entries},logo('workout',`${nm(mid)} 운동 기록 ${old?'수정':'추가'}: ${name} ${old?`${old.w}kg×${old.r} → `:''}${w}kg×${r}회 (1RM ${rm})`));clearF('wl_');toast('저장했어요')};
A.wlDel=async({i,m:mid})=>{if(!await ask('이 기록을 삭제할까요?','','삭제',true))return;const date=S.wlDate||today();const doc=md(mid).wlogs.find(x=>x.date===date);const e=(doc?.entries||[]).find(x=>x.id===i);await put('wlogs',`${mid}_${date}`,{...doc,memberId:mid,date,entries:(doc?.entries||[]).filter(x=>x.id!==i)},logo('workout',`${nm(mid)} 운동 기록 삭제: ${e?.name||''}`))};

// ---- 운동 사전 ----
function libSec(adm){return `<div class="row nw"><input class="inp" placeholder="운동 이름 검색 (예: 랫풀다운)" data-f="libQ" data-live="lib" value="${esc(fv('libQ'))}">${adm?`<button class="btn pri" data-a="exNew">${ic('plus',16)}추가</button>`:''}</div>
 <div class="pills">${['전체',...EXCATS,'기타'].map(c=>`<button class="pill ${S.libCat===c?'on':''}" data-a="libCat" data-v="${c}">${c}</button>`).join('')}</div><div id="p-lib">${PART.lib()}</div>`}
// 대표 그림: 트레이너가 올린 사진 → Core 3D 해부학 애니메이션(시작↔마무리 반복, 쓰는 근육 빨간색) → 근육 지도
const EXIMG=new Set(EX.map(e=>e.id));
function exPhoto(e){const L=S.exlib[e.id];if(L?.photo)return {u:fileUrl(L.photo),own:1};if(EXIMG.has(e.id))return {u:'ex/'+e.id+'.webp?v='+(window.CORE_V||''),art:1};if(L?.art?.id)return {u:fileUrl(L.art.id),art:1,sprite:L.art.frames||9};return null}
const imgFail="this.closest('.exph').classList.add('noimg')";
function exThumb(e,big){const p=exPhoto(e);return `<div class="exph ${big?'big':''} ${p?'':'noimg'} ${p&&p.art?'art':''}">${p?(p.sprite?`<div class="spr" style="${sprStyle(p.u,p.sprite)}"></div>`:`<img src="${esc(p.u)}" alt="${esc(e.n)} 그림" loading="lazy" onerror="${imgFail}">`):''}<div class="bmf">${bodyMap(e.p,e.s)}</div><span class="excat">${esc(e.cat)}</span></div>`}
PART.lib=()=>{const q=(S.f.libQ||'').trim().toLowerCase();const l=allEx().filter(e=>(S.libCat==='전체'||e.cat===S.libCat||(S.libCat==='기타'&&!EXCATS.includes(e.cat)))&&(!q||e.n.toLowerCase().includes(q)||(e.en||'').toLowerCase().includes(q)));
 return l.length?`<div class="lib">${l.map(e=>`<div class="exc" data-a="exOpen" data-id="${e.id}">${exThumb(e)}<div class="exb"><b>${esc(e.n)}</b><div class="xs muted">${esc(e.en||'')}</div><div class="xs pc b">${(e.p||[]).map(k=>MN[k]?.split('(')[0]).filter(Boolean).join(' · ')}</div>${S.exlib[e.id]?.notes||S.exlib[e.id]?.media?.length?'<span class="chip p xs">트레이너 자료</span>':''}</div></div>`).join('')}</div>`:'<p class="empty">찾는 운동이 없어요.</p>'};
A.libCat=({v},el)=>{S.libCat=v;const row=el.closest('.pills');if(row&&$('#p-lib')){row.querySelectorAll('.pill').forEach(b=>b.classList.toggle('on',b.dataset.v===v));$('#p-lib').innerHTML=PART.lib();el.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'})}else render()};
A.exOpen=({id,n})=>{const e=id?allEx().find(x=>x.id===id):findEx(n);if(!e){openModal(()=>`${mh(esc(n))}<p class="muted">운동 사전에 아직 없는 운동이에요.</p><a class="btn full" href="https://www.youtube.com/results?search_query=${encodeURIComponent(n+' 운동 방법')}" target="_blank" rel="noopener">${ic('play',16)} 유튜브에서 방법 보기</a>${admin()?`<button class="btn pri full" data-a="exNew" data-n="${esc(n)}">운동 사전에 추가</button>`:''}`);return}
 S.exTab='how';const f=()=>exDetail(allEx().find(x=>x.id===e.id)||e);f.live=true;openModal(f);loadWiki(e)};
async function loadWiki(e){const ks=[...new Set([...(e.p||[]),...(e.s||[])])];const m={};S.wikiFor={id:e.id,m,done:false};for(const k of ks){if(!WIKI_M[k])continue;const r=await wiki(WIKI_M[k]);if(r)m[k]=r;if(S.modal)renderModal()}S.wikiFor.done=true;if(S.modal)renderModal()}
function ytId(u){const m=String(u||'').match(/(?:youtu\.be\/|v=|shorts\/|embed\/|live\/)([\w-]{11})/);return m?m[1]:null}
const ytEmbed=id=>`<div class="ytw"><iframe class="yt" src="https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1" allow="accelerometer;encrypted-media;gyroscope;picture-in-picture;fullscreen" allowfullscreen loading="lazy"></iframe></div>`;
// 용어 풀이: 설명 글 속 해부학 용어에 밑줄 + 아래에 뜻 정리
function termsIn(txt){return TERMS.filter(([t])=>txt.includes(t))}
let termRe=null;function markTerms(txt){if(!termRe)termRe=new RegExp([...TERMS].map(x=>x[0]).sort((a,b)=>b.length-a.length).map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');return esc(txt).replace(termRe,m=>`<u class="term">${m}</u>`)}
function musCard(k,role,w){const M=MUS[k]||{};const wi=w&&w.m[k];return `<div class="mus"><div class="row nw" style="align-items:flex-start">${wi?`<a href="${esc(wi.page)}" target="_blank" rel="noopener" class="musimg"><img src="${esc(wi.img)}" alt="${esc(M.en||k)}" loading="lazy"></a>`:`<div class="musimg ph">${w&&!w.done?'<span class="spin"></span>':'🦴'}</div>`}
 <div class="grow"><div class="row" style="gap:6px"><b>${esc(M.t||MN[k]||k)}</b><span class="chip ${role==='p'?'r':''} xs">${role==='p'?'주동근':'보조근'}</span></div><div class="xs muted">${esc([M.h,M.en].filter(Boolean).join(' · '))}</div>
 ${M.loc?`<div class="sm"><b class="xs pc">위치</b> ${esc(M.loc)}</div>`:''}${M.fn?`<div class="sm"><b class="xs pc">하는 일</b> ${markTerms(M.fn)}</div>`:''}</div></div></div>`}
function exDetail(e){const L=S.exlib[e.id]||{};const adm=admin();const media=L.media||[];const links=L.links||[];const w=S.wikiFor?.id===e.id?S.wikiFor:null;const p=exPhoto(e);const tab=S.exTab||'how';
 const allTxt=[e.a,...(e.p||[]).concat(e.s||[]).map(k=>MUS[k]?.fn||''),...(e.st||[]),...(e.c||[]),L.notes||''].join(' ');const terms=termsIn(allTxt);
 return `${mh(esc(e.n))}${exThumb(e,true)}
 <div class="row sb"><div class="row" style="gap:6px"><span class="chip p">${esc(e.cat)}</span>${e.eq?`<span class="chip">${esc(e.eq)}</span>`:''}<span class="xs muted">${esc(e.en||'')}</span></div>${p&&p.art?'<span class="xs muted">빨간색 = 주로 쓰는 근육</span>':''}</div>
 ${adm?`<div class="row"><label class="btn sm soft">${S.busy['exp'+e.id]?'<span class="spin"></span> 올리는 중…':ic('cam',14)+' 대표 사진 바꾸기'}<input type="file" hidden accept="image/*" data-file="exPhotoUp" data-id="${e.id}"></label>${L.photo?`<button class="btn sm ghost" data-a="exPhotoReset" data-id="${e.id}">기본 그림으로</button>`:''}</div>`:''}
 <div class="seg"><button class="${tab==='how'?'on':''}" data-a="exTab" data-v="how">동작 방법</button><button class="${tab==='ana'?'on':''}" data-a="exTab" data-v="ana">🧬 해부학</button><button class="${tab==='term'?'on':''}" data-a="exTab" data-v="term">📖 용어 ${terms.length||''}</button></div>
 ${tab==='ana'?`<div class="card flat" style="padding:10px">${bodyMap(e.p,e.s)}<div class="row" style="justify-content:center;margin-top:6px"><span class="chip xs"><i style="width:10px;height:10px;border-radius:3px;background:#FF5A78;display:inline-block"></i>주동근</span><span class="chip xs"><i style="width:10px;height:10px;border-radius:3px;background:var(--mus2);display:inline-block"></i>보조근</span></div></div>
 ${e.a?`<div class="sec"><h4>이 운동은 이렇게 작동해요</h4><p class="sm">${markTerms(e.a)}</p><p class="xs muted">밑줄 친 말은 '용어' 탭에서 뜻을 볼 수 있어요.</p></div>`:''}
 <div class="sec"><h4>쓰이는 근육</h4>${(e.p||[]).map(k=>musCard(k,'p',w)).join('')}${(e.s||[]).map(k=>musCard(k,'s',w)).join('')}<p class="xs muted">근육 그림 출처: Wikipedia / Wikimedia Commons (그림을 누르면 원문과 라이선스를 볼 수 있어요)</p></div>
 ${e.u?`<div class="sec"><h4>실생활에서 이렇게 쓰여요</h4><p class="sm">${esc(e.u)}</p></div>`:''}`
 :tab==='term'?`<div class="sec"><h4>이 운동에 나오는 용어</h4>${terms.length?`<div class="list">${terms.map(([t,d,x])=>`<div class="li" style="align-items:flex-start"><div class="grow"><b>${t}</b>${x?` <span class="xs muted">${esc(x)}</span>`:''}<div class="sm">${esc(d)}</div></div></div>`).join('')}</div>`:'<p class="muted sm">따로 풀이할 용어가 없어요.</p>'}</div>
 <details><summary class="sm muted">전체 운동 용어 사전 보기 (${TERMS.length}개)</summary><div class="list">${TERMS.map(([t,d,x])=>`<div class="li" style="align-items:flex-start"><div class="grow"><b>${t}</b>${x?` <span class="xs muted">${esc(x)}</span>`:''}<div class="sm">${esc(d)}</div></div></div>`).join('')}</div></details>`
 :`${e.st?.length?`<div class="sec"><h4>동작 방법</h4><ol class="sm">${e.st.map(x=>`<li>${markTerms(x)}</li>`).join('')}</ol></div>`:''}${e.c?.length?`<div class="sec"><h4>주의사항</h4><ul class="sm">${e.c.map(x=>`<li>${markTerms(x)}</li>`).join('')}</ul></div>`:''}`}
 <div class="card"><div class="row sb"><h3>🧑‍🏫 트레이너 노트</h3>${L.notesAt?`<span class="xs muted">${ago(L.notesAt)}</span>`:''}</div>
 ${adm?`<textarea class="inp" data-f="exnote_${e.id}" placeholder="회원에게 알려줄 세부 방법, 자주 하는 실수, 큐잉 등을 자세히 적어주세요">${esc(fv('exnote_'+e.id,L.notes||''))}</textarea><button class="btn pri full" data-a="exNoteSave" data-id="${e.id}">노트 저장</button>`:L.notes?`<p class="sm" style="white-space:pre-wrap">${esc(L.notes)}</p>`:'<p class="muted sm">아직 트레이너 노트가 없어요.</p>'}</div>
 <div class="card"><div class="row sb"><h3>트레이너 사진·영상</h3>${adm?`<label class="btn sm soft">${ic('up',14)} 업로드<input type="file" hidden accept="image/*,video/*" data-file="exMedia" data-id="${e.id}"></label>`:''}</div>
 ${S.busy['exm'+e.id]?'<p class="sm"><span class="spin"></span> 업로드 중…</p>':''}
 ${links.map((l,i)=>`${ytId(l.url)?ytEmbed(ytId(l.url)):`<a class="btn sm full" href="${esc(l.url)}" target="_blank" rel="noopener">${ic('play',14)} ${esc(l.title||'참고 자료')}</a>`}${adm?`<button class="btn sm ghost dng" data-a="exLinkDel" data-id="${e.id}" data-i="${i}">링크 삭제</button>`:''}`).join('')}
 ${media.map((m,i)=>`<div class="media">${m.type?.startsWith('video')?`<video src="${fileUrl(m.id)}" controls playsinline preload="metadata"></video>`:`<img src="${fileUrl(m.id)}" alt="">`}${adm?`<button class="btn sm ghost dng" data-a="exMediaDel" data-id="${e.id}" data-i="${i}">삭제</button>`:''}</div>`).join('')}
 ${!media.length&&!links.length?'<p class="muted sm">트레이너가 올린 자료가 없어요.</p>':''}
 ${adm?`<div class="row nw"><input class="inp" placeholder="유튜브 링크 붙여넣기 → 바로 재생돼요" data-f="exlink_${e.id}" value="${esc(fv('exlink_'+e.id))}"><button class="btn" data-a="exLinkAdd" data-id="${e.id}">추가</button></div>`:''}
 <a class="btn full ghost" href="https://www.youtube.com/results?search_query=${encodeURIComponent(e.n+' 해부학 운동 원리')}" target="_blank" rel="noopener">${ic('search',16)} 유튜브에서 해부학 영상 더 찾기</a></div>
 ${adm&&e.custom&&!L.art?`<button class="btn grad full" data-a="exEdit" data-id="${e.id}">${ic('spark',16)} AI로 3D 움직이는 그림 만들기</button>`:''}${adm&&e.custom?`<div class="row"><button class="btn ghost" data-a="exEdit" data-id="${e.id}">${ic('edit',14)} 수정${L.art?' · 그림 다시 만들기':''}</button><button class="btn ghost dng" data-a="exDel" data-id="${e.id}">삭제</button></div>`:''}`}
const exDoc=id=>({...(S.exlib[id]||{})});
A.exTab=({v})=>{S.exTab=v;renderModal()};
A.exPhotoUp=(d,files)=>busy('exp'+d.id,async()=>{const r=await upload(files[0],1400);if(!r.type.startsWith('image'))throw new Error('사진 파일을 올려주세요.');await put('exlib',d.id,{...exDoc(d.id),photo:r.id});toast('대표 사진을 바꿨어요')});
A.exPhotoReset=async({id})=>{const L=exDoc(id);delete L.photo;await put('exlib',id,{...L,photo:null});renderModal()};
A.exNoteSave=async({id})=>{await put('exlib',id,{...exDoc(id),notes:S.f['exnote_'+id]??S.exlib[id]?.notes??'',notesAt:Date.now()});toast('노트를 저장했어요');renderModal()};
A.exMedia=(d,files)=>busy('exm'+d.id,async()=>{const r=await upload(files[0],2000);const L=exDoc(d.id);await put('exlib',d.id,{...L,media:[...(L.media||[]),{id:r.id,type:r.type,at:Date.now()}]});toast('자료를 올렸어요')});
A.exMediaDel=async({id,i})=>{if(!await ask('이 자료를 삭제할까요?','','삭제',true))return;const L=exDoc(id);const media=[...(L.media||[])];media.splice(+i,1);await put('exlib',id,{...L,media});renderModal()};
A.exLinkAdd=async({id})=>{const url=(S.f['exlink_'+id]||'').trim();if(!/^https?:\/\//.test(url))return toast('올바른 링크를 입력해주세요');const L=exDoc(id);await put('exlib',id,{...L,links:[...(L.links||[]),{url,title:'참고 영상'}]});delete S.f['exlink_'+id];renderModal()};
A.exLinkDel=async({id,i})=>{const L=exDoc(id);const links=[...(L.links||[])];links.splice(+i,1);await put('exlib',id,{...L,links});renderModal()};
const MKEYS=Object.keys(MN);
function exForm(e){return `<div><label class="fl">운동 이름</label><input class="inp" data-f="ex_n" value="${esc(fv('ex_n',e.n||''))}" placeholder="예: 케이블 풀스루"></div>${gen3dBox()}<div class="fg"><div><label class="fl">부위</label><select class="inp" data-f="ex_cat">${[...EXCATS,'기타'].map(c=>`<option ${fv('ex_cat',e.cat||'기타')===c?'selected':''}>${c}</option>`).join('')}</select></div><div><label class="fl">장비</label><input class="inp" data-f="ex_eq" value="${esc(fv('ex_eq',e.eq||''))}"></div></div>
 ${['p','s'].map(t=>`<div><label class="fl">${t==='p'?'주동근':'보조근'}</label><div class="pills" style="flex-wrap:wrap">${MKEYS.map(k=>{const on=fv(`ex_${t}_${k}`,(e[t]||[]).includes(k));return `<label class="pill ${on?'on':''}"><input type="checkbox" hidden data-f="ex_${t}_${k}" data-rr ${on?'checked':''}>${MN[k].split('(')[0]}</label>`}).join('')}</div></div>`).join('')}
 <div><label class="fl">운동 원리 (해부학)</label><textarea class="inp" data-f="ex_a">${esc(fv('ex_a',e.a||''))}</textarea></div><div><label class="fl">실생활 활용</label><textarea class="inp" data-f="ex_u">${esc(fv('ex_u',e.u||''))}</textarea></div>
 <div><label class="fl">동작 방법 (한 줄에 하나)</label><textarea class="inp" data-f="ex_st">${esc(fv('ex_st',(e.st||[]).join('\n')))}</textarea></div><div><label class="fl">주의사항 (한 줄에 하나)</label><textarea class="inp" data-f="ex_c">${esc(fv('ex_c',(e.c||[]).join('\n')))}</textarea></div>
 <button class="btn soft full" data-a="exAI" ${dis('exai')}>${bz('exai',ic('spark',16)+' AI로 해부학 설명 채우기','AI 작성 중…')}</button><button class="btn pri lg full" data-a="exSave" data-id="${e.id||''}">저장</button>`}
A.exNew=({n})=>{clearF('ex_');S.gen=null;if(n)S.f.ex_n=n;openModal(()=>`${mh('운동 추가')}${exForm({})}`)};
A.exEdit=({id})=>{clearF('ex_');S.gen=null;const e=allEx().find(x=>x.id===id);openModal(()=>`${mh('운동 수정')}${exForm(e)}`)};
A.exAI=()=>busy('exai',async()=>{const n=(S.f.ex_n||'').trim();if(!n)throw new Error('운동 이름을 먼저 입력해주세요.');const r=await ai(`헬스 운동 "${n}"을 회원에게 해부학적으로 설명하라. 한국어, 간결하게. 근육 키는 다음 중에서만: ${MKEYS.join(', ')}
JSON: {"cat":"${EXCATS.join('|')}|기타","eq":string,"p":[근육키],"s":[근육키],"a":"주동근·보조근이 어떤 관절 움직임으로 일하는지 2~3문장","u":"일상·스포츠에서 쓰이는 곳 1~2문장","st":[동작 순서 4~6개],"c":[주의사항 2~3개]}`,{tier:'quick'});
 Object.assign(S.f,{ex_cat:r.cat||'기타',ex_eq:r.eq||'',ex_a:r.a||'',ex_u:r.u||'',ex_st:(r.st||[]).join('\n'),ex_c:(r.c||[]).join('\n')});MKEYS.forEach(k=>{S.f['ex_p_'+k]=(r.p||[]).includes(k);S.f['ex_s_'+k]=(r.s||[]).includes(k)})});
A.exSave=async({id})=>{const n=(S.f.ex_n||'').trim();if(!n)return toast('운동 이름을 입력해주세요');const e=id?allEx().find(x=>x.id===id):{};const g=(k,d)=>fv(k,d);const lines=s=>String(s||'').split('\n').map(x=>x.trim()).filter(Boolean);const nid=id||'c_'+uid();if(S.busy.g3d)return toast('그림을 만드는 중이에요. 잠시만 기다려주세요');let art=null;if(S.gen?.canvas){toast('3D 그림을 저장하는 중…');art=await gen3dUpload()}const extra=art?{art,pose:{A:S.gen.X.A,B:S.gen.X.B,gear:S.gen.X.gear,cam:S.gen.X.cam}}:{};
 await put('exlib',nid,{...exDoc(nid),...extra,custom:true,n,en:fv('ex_en',e.en||''),cat:g('ex_cat',e.cat||'기타'),eq:g('ex_eq',e.eq||''),p:MKEYS.filter(k=>g('ex_p_'+k,(e.p||[]).includes(k))),s:MKEYS.filter(k=>g('ex_s_'+k,(e.s||[]).includes(k))),a:g('ex_a',e.a||''),u:g('ex_u',e.u||''),st:lines(g('ex_st',(e.st||[]).join('\n'))),c:lines(g('ex_c',(e.c||[]).join('\n')))});clearF('ex_');S.gen=null;toast('운동 사전에 저장했어요');closeModal()};
A.exDel=async({id})=>{if(!await ask('이 운동을 사전에서 삭제할까요?','','삭제',true))return;await delDoc('exlib',id);closeModal()};

