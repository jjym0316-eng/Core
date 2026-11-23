// ===== Core 운동 해부학 일러스트 (직접 그린 원본 SVG) =====
const ART=(()=>{
const R=Math.PI/180,L={t:90,ua:52,fa:48,hd:16,th:80,sh:76,ft:24,neck:13,head:15};
const dirA=a=>[Math.sin(a*R),Math.cos(a*R)];             // 0=아래, 90=앞(+x), 180=위
const add=(p,d,l)=>[p[0]+d[0]*l,p[1]+d[1]*l];
const W={t:[[0,21],[.25,18],[.55,19],[.8,23],[1,21]],ua:[[0,10],[.45,9.5],[1,6.5]],fa:[[0,7.5],[.4,7.2],[1,4.8]],th:[[0,15],[.4,13.5],[1,8.5]],sh:[[0,8.5],[.35,9],[1,5]]};
const wAt=(prof,t)=>{for(let i=1;i<prof.length;i++){if(t<=prof[i][0]){const [a,wa]=prof[i-1],[b,wb]=prof[i];return wa+(wb-wa)*(t-a)/(b-a)}}return prof[prof.length-1][1]};
const f1=v=>Math.round(v*10)/10;
function seg(A,B,prof){const d=[B[0]-A[0],B[1]-A[1]],l=Math.hypot(...d)||1,u=[d[0]/l,d[1]/l],n=[-u[1],u[0]];const L1=[],R1=[];
 for(let i=0;i<=10;i++){const t=i/10,w=wAt(prof,t),c=[A[0]+d[0]*t,A[1]+d[1]*t];L1.push([c[0]+n[0]*w,c[1]+n[1]*w]);R1.push([c[0]-n[0]*w,c[1]-n[1]*w])}
 return 'M'+L1.concat(R1.reverse()).map(p=>f1(p[0])+' '+f1(p[1])).join('L')+'Z'}
function fib(A,B,prof,side,t0,t1,inner=.05,bulge=1.08){const d=[B[0]-A[0],B[1]-A[1]],l=Math.hypot(...d)||1,u=[d[0]/l,d[1]/l],n=[-u[1]*side,u[0]*side];let r='';
 for(const k of [.3,.55,.8]){const pts=[];for(let i=2;i<=10;i++){const t=t0+(t1-t0)*i/12,s=Math.sin(Math.PI*i/12),w=wAt(prof,Math.max(0,Math.min(1,t))),c=[A[0]+d[0]*t,A[1]+d[1]*t];const oo=w*(.55+.45*s)*bulge,ii=w*(inner+(1-s)*.5),m=ii+(oo-ii)*k;pts.push(f1(c[0]+n[0]*m)+' '+f1(c[1]+n[1]*m))}r+='M'+pts.join('L')}return r}
// side: +1/-1 = 법선 방향(앞/뒤), 근육 모양(렌즈)
function mus(A,B,prof,side,t0,t1,inner=.05,bulge=1.08){const d=[B[0]-A[0],B[1]-A[1]],l=Math.hypot(...d)||1,u=[d[0]/l,d[1]/l],n=[-u[1]*side,u[0]*side];const o=[],q=[];
 for(let i=0;i<=12;i++){const t=t0+(t1-t0)*i/12,s=Math.sin(Math.PI*i/12),w=wAt(prof,Math.max(0,Math.min(1,t))),c=[A[0]+d[0]*t,A[1]+d[1]*t];
  o.push([c[0]+n[0]*w*(.55+.45*s)*bulge,c[1]+n[1]*w*(.55+.45*s)*bulge]);q.push([c[0]+n[0]*w*(inner+(1-s)*.5),c[1]+n[1]*w*(inner+(1-s)*.5)])}
 return 'M'+o.concat(q.reverse()).map(p=>f1(p[0])+' '+f1(p[1])).join('L')+'Z'}
const deg=Math.PI/180;
function ik(A,T,la,lb,bend){const dx=T[0]-A[0],dy=T[1]-A[1];let D=Math.hypot(dx,dy);D=Math.min(D,la+lb-.01);const base=Math.atan2(dx,dy)/deg;const c=Math.max(-1,Math.min(1,(la*la+D*D-lb*lb)/(2*la*D)));const a1=base+bend*Math.acos(c)/deg;const E=add(A,dirA(a1),la);const a2=Math.atan2(T[0]-E[0],T[1]-E[1])/deg;return [a1,a2]}
function fig(P,on,dx=0,far=false){
 const H=[P.H[0]+dx,P.H[1]];const S=add(H,dirA(180-P.t),L.t);            // 몸통: t=0 직립, +앞으로 숙임
 const tor=dirA(180-P.t);const tn=[-tor[1],tor[0]];                     // 몸통 앞쪽 법선
 const front=tn[0]*1>=0?1:-1;
 const N=add(S,tor,L.neck),Hd=add(N,tor,L.head-2);
 const arm=(ua,fa)=>{const E=add(S,dirA(ua),L.ua),Wr=add(E,dirA(fa),L.fa),Hn=add(Wr,dirA(fa),10);return {E,Wr,Hn}};
 const leg=(th,sh,ft)=>{const K=add(H,dirA(th),L.th),An=add(K,dirA(sh),L.sh),T=add(An,dirA(ft??90),L.ft);return {K,An,T}};
 let ua=P.ua,fa=P.fa,th=P.th,sh=P.sh;
 if(P.hand){const h0=typeof P.hand==='function'?P.hand(S,H,P.t):P.hand;const T=typeof P.hand==='function'?h0:[h0[0]+dx,h0[1]];[ua,fa]=ik(S,T,L.ua,L.fa+6,P.eb??-1)}
 if(P.ank){const T=[P.ank[0]+dx,P.ank[1]];[th,sh]=ik(H,T,L.th,L.sh,P.kb??1)}
 if(far&&P.ank2){const T=[P.ank2[0]+dx,P.ank2[1]];[th,sh]=ik(H,T,L.th,L.sh,P.kb2??P.kb??1)}
 else if(far&&P.th2!=null){th=P.th2;sh=P.sh2}
 if(far&&P.ua2!=null){ua=P.ua2;fa=P.fa2}
 const a=arm(ua,fa),g=leg(th,sh,far&&P.ft2!=null?P.ft2:P.ft);
 const sk=far?'#CFC8C2':'#ECE6E1',ln=far?'#B4ACA6':'#A79E98',m1=far?'#D97B72':'#E0473C',m2=far?'#E8B5AE':'#F3A79D';
 const col=k=>on.p.includes(k)?m1:on.s.includes(k)?m2:null;
 // 앞/뒤 판정: 팔·다리는 아래로 늘어뜨렸을 때 몸 앞(+x)이 앞쪽
 const sideOf=(A,B)=>{const d=[B[0]-A[0],B[1]-A[1]];return 1};
 let o='';const sp=(d,c)=>`<path d="${d}" fill="${c}" stroke="${ln}" stroke-width="1.2" stroke-linejoin="round"/>`;
 const mp=(d,c)=>c?`<path d="${d}" fill="${c}" opacity=".95"/>`:'';
 const mpf=(A,B,pr,sd,t0,t1,inn,bl,c)=>c?`<path d="${mus(A,B,pr,sd,t0,t1,inn,bl)}" fill="${c}" stroke="${far?'none':'#B8352C'}" stroke-width=".6" opacity=".96"/>`+(far?'':`<path d="${fib(A,B,pr,sd,t0,t1,inn,bl)}" fill="none" stroke="#B8352C" stroke-width=".7" opacity=".45"/>`):'';
 const limbF=1; // 사지: seg 법선 n=(-u.y,u.x); 아래로 늘어뜨린 팔 u=(0,1) → n=(-1,0)=뒤 → 앞쪽 side=-1
 const LF=-1,LB=1,TF=1,TB=-1;
 // 다리(뒤 → 앞 순)
 o+=sp(seg(H,g.K,W.th),sk)+sp(seg(g.K,g.An,W.sh),sk)+sp(seg(g.An,g.T,[[0,6],[1,4]]),sk);
 o+=mpf(H,g.K,W.th,LF,.12,.92,.05,1.08,col('quads'))+mpf(H,g.K,W.th,LB,.18,.9,.05,1.08,col('hamstrings'))+mpf(H,g.K,W.th,LB,.05,.55,-.35,.55,col('adductors'));
 o+=mpf(g.K,g.An,W.sh,LB,.06,.62,0,1.12,col('calves'));
 o+=`<circle cx="${f1(g.K[0])}" cy="${f1(g.K[1])}" r="9" fill="${sk}" stroke="${ln}" stroke-width="1.2"/>`;
 // 몸통
 o+=sp(seg(H,S,W.t),sk);
 o+=mpf(H,S,W.t,TF,.62,.95,.05,1.02,col('chest'))+mpf(H,S,W.t,TF,.1,.6,.05,1,col('abs'))+mpf(H,S,W.t,TF,.12,.55,-.45,.5,col('obliques'));
 o+=mpf(H,S,W.t,TB,.42,.9,.05,1.05,col('lats'))+mpf(H,S,W.t,TB,.78,1.12,0,1.05,col('traps'))+mpf(H,S,W.t,TB,.02,.45,0,1,col('lowerback'));
 const G=add(H,tn.map(v=>-v),9);if(col('glutes'))o+=`<ellipse cx="${f1(G[0])}" cy="${f1(G[1])}" rx="15" ry="15" fill="${col('glutes')}" opacity=".95"/>`;
 // 목·머리
 o+=sp(seg(S,N,[[0,8],[1,7]]),sk)+`<circle cx="${f1(Hd[0])}" cy="${f1(Hd[1])}" r="${L.head}" fill="${sk}" stroke="${ln}" stroke-width="1.2"/>`;
 if(!far){const ey=add(Hd,tn,9);o+=`<circle cx="${f1(ey[0])}" cy="${f1(ey[1])}" r="1.8" fill="${ln}"/>`}
 // 팔
 o+=sp(seg(S,a.E,W.ua),sk)+sp(seg(a.E,a.Wr,W.fa),sk)+`<circle cx="${f1(a.Hn[0])}" cy="${f1(a.Hn[1])}" r="6.5" fill="${sk}" stroke="${ln}" stroke-width="1.2"/>`;
 o+=mpf(S,a.E,W.ua,LF,.18,.9,.05,1.08,col('biceps'))+mpf(S,a.E,W.ua,LB,.1,.86,.05,1.08,col('triceps'))+mpf(a.E,a.Wr,W.fa,LF,.05,.7,0,1.1,col('forearms'));
 if(col('delts'))o+=`<circle cx="${f1(S[0])}" cy="${f1(S[1])}" r="12" fill="${col('delts')}" stroke="${ln}" stroke-width="1"/>`;
 else o+=`<circle cx="${f1(S[0])}" cy="${f1(S[1])}" r="11" fill="${sk}" stroke="${ln}" stroke-width="1.2"/>`;
 return {svg:o,S,a,g,H}}
// ---- 정면 그림 (레터럴 레이즈·플라이) ----
function front(P,on){const cx=P.cx||200,hy=P.hy||118,sk='#ECE6E1',ln='#A79E98',m1='#E0473C',m2='#F3A79D';const col=k=>on.p.includes(k)?m1:on.s.includes(k)?m2:null;
 const sp=(d,c)=>`<path d="${d}" fill="${c}" stroke="${ln}" stroke-width="1.2" stroke-linejoin="round"/>`,mp=(d,c)=>c?`<path d="${d}" fill="${c}" opacity=".95"/>`:'';
 const far=false,mpf=(A,B,pr,sd,t0,t1,inn,bl,c)=>c?`<path d="${mus(A,B,pr,sd,t0,t1,inn,bl)}" fill="${c}" stroke="#B8352C" stroke-width=".6" opacity=".96"/><path d="${fib(A,B,pr,sd,t0,t1,inn,bl)}" fill="none" stroke="#B8352C" stroke-width=".7" opacity=".45"/>`:'';
 let o='';const sy=hy-86;
 for(const sd of [-1,1]){const Hp=[cx+sd*12,hy+4];const K=[cx+sd*15,hy+82],An=[cx+sd*15,hy+156];o+=sp(seg(Hp,K,W.th),sk)+sp(seg(K,An,W.sh),sk)+mpf(Hp,K,W.th,-sd,.12,.9,-.6,.7,col('quads'))+mpf(Hp,K,W.th,sd,.1,.85,-.2,.8,col('quads'))+mpf(Hp,K,W.th,sd,.05,.5,-.3,.6,col('adductors'));o+=`<ellipse cx="${An[0]+sd*3}" cy="${An[1]+6}" rx="9" ry="5" fill="${sk}" stroke="${ln}"/>`}
 const tp=`M${cx-28} ${sy}Q${cx-33} ${sy+30} ${cx-21} ${hy-22}L${cx-23} ${hy+10}L${cx+23} ${hy+10}L${cx+21} ${hy-22}Q${cx+33} ${sy+30} ${cx+28} ${sy}Q${cx} ${sy-8} ${cx-28} ${sy}Z`;o+=sp(tp,sk);
 if(col('chest'))o+=`<path d="M${cx-2} ${sy+6}Q${cx-26} ${sy+2} ${cx-28} ${sy+14}Q${cx-24} ${sy+34} ${cx-2} ${sy+30}Z M${cx+2} ${sy+6}Q${cx+26} ${sy+2} ${cx+28} ${sy+14}Q${cx+24} ${sy+34} ${cx+2} ${sy+30}Z" fill="${col('chest')}"/>`;
 if(col('abs'))o+=`<rect x="${cx-11}" y="${sy+36}" width="22" height="46" rx="7" fill="${col('abs')}"/>`;
 if(col('obliques'))o+=`<path d="M${cx-24} ${sy+40}L${cx-14} ${sy+40}L${cx-14} ${sy+80}L${cx-22} ${sy+86}Z M${cx+24} ${sy+40}L${cx+14} ${sy+40}L${cx+14} ${sy+80}L${cx+22} ${sy+86}Z" fill="${col('obliques')}"/>`;
 if(col('traps'))o+=`<path d="M${cx-8} ${sy-16}L${cx-26} ${sy-1}L${cx+26} ${sy-1}L${cx+8} ${sy-16}Z" fill="${col('traps')}"/>`;
 o+=sp(seg([cx,sy-2],[cx,sy-14],[[0,8],[1,7]]),sk)+`<circle cx="${cx}" cy="${sy-28}" r="15" fill="${sk}" stroke="${ln}" stroke-width="1.2"/>`;
 const hands=[];
 for(const sd of [-1,1]){const S=[cx+sd*30,sy+2];const ab=sd<0?P.abL??P.ab:P.abR??P.ab;const ex=P.ex||0;const E=add(S,dirA(sd*ab),L.ua);const Wr=add(E,dirA(sd*(ab+ex)),L.fa);const Hn=add(Wr,dirA(sd*(ab+ex)),10);hands.push(Hn);
  o+=sp(seg(S,E,W.ua),sk)+sp(seg(E,Wr,W.fa),sk)+`<circle cx="${f1(Hn[0])}" cy="${f1(Hn[1])}" r="6.5" fill="${sk}" stroke="${ln}"/>`+mpf(S,E,W.ua,-sd,.2,.9,-.5,.7,col('biceps'))+mpf(E,Wr,W.fa,-sd,.05,.7,-.4,.8,col('forearms'));
  o+=`<circle cx="${S[0]}" cy="${S[1]}" r="13" fill="${col('delts')||sk}" stroke="${ln}" stroke-width="1"/>`}
 return {svg:o,hands,sy}}
// ---- 기구 ----
const gr='#3A3F4B',gl='#C9CDD6',gm='#8B92A3';
const EQ={
 bench:(x1,x2,y,lg=1)=>`<rect x="${x1}" y="${y}" width="${x2-x1}" height="12" rx="4" fill="${gr}"/>`+(lg?`<rect x="${x1+12}" y="${y+12}" width="8" height="${268-y}" fill="${gm}"/><rect x="${x2-20}" y="${y+12}" width="8" height="${268-y}" fill="${gm}"/>`:''),
 bar:p=>`<line x1="${p[0]}" y1="${p[1]}" x2="${p[0]}" y2="${p[1]}" /><circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="24" fill="${gr}" opacity=".92"/><circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="16" fill="#4C5263"/><circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="5" fill="${gl}"/>`,
 db:p=>`<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="13" fill="${gr}"/><circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="5" fill="${gm}"/>`,
 handle:p=>`<rect x="${f1(p[0]-9)}" y="${f1(p[1]-4)}" width="18" height="8" rx="4" fill="${gr}"/>`,
 tower:(x,top=30)=>`<rect x="${x}" y="${top}" width="22" height="${270-top}" rx="3" fill="${gl}"/><rect x="${x+3}" y="${top+70}" width="16" height="70" rx="2" fill="${gr}"/>`,
 cable:(a,b)=>`<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="#2B2F38" stroke-width="2"/><circle cx="${f1(a[0])}" cy="${f1(a[1])}" r="6" fill="${gm}"/>`,
 pbar:(x1,x2,y)=>`<rect x="${x1}" y="${y-4}" width="${x2-x1}" height="8" rx="4" fill="${gr}"/><rect x="${x1}" y="${y}" width="7" height="${270-y}" fill="${gl}"/><rect x="${x2-7}" y="${y}" width="7" height="${270-y}" fill="${gl}"/>`,
 mat:(x1,x2)=>`<rect x="${x1}" y="266" width="${x2-x1}" height="6" rx="3" fill="#9AA4C7"/>`,
 seat:(x,y,w=60)=>`<rect x="${x}" y="${y}" width="${w}" height="12" rx="5" fill="${gr}"/><rect x="${x+w/2-5}" y="${y+12}" width="10" height="${258-y}" fill="${gm}"/><rect x="${x+w/2-30}" y="262" width="60" height="8" rx="3" fill="${gm}"/>`,
 pad:(x,y,w,h,r=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${gr}" transform="rotate(${r} ${x+w/2} ${y+h/2})"/>`,
 step:(x,w,h)=>`<rect x="${x}" y="${270-h}" width="${w}" height="${h}" rx="3" fill="${gm}"/>`,
 backrest:(c,off=27,ext=22)=>{const d=[c.S[0]-c.H[0],c.S[1]-c.H[1]],l=Math.hypot(...d),u=[d[0]/l,d[1]/l],b=[u[1],-u[0]];const a=[c.H[0]-u[0]*12+b[0]*off,c.H[1]-u[1]*12+b[1]*off],e=[c.S[0]+u[0]*ext+b[0]*off,c.S[1]+u[1]*ext+b[1]*off];return `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(e[0])}" y2="${f1(e[1])}" stroke="${gr}" stroke-width="16" stroke-linecap="round"/>`},
 sled:(x,y,r)=>`<rect x="${x}" y="${y}" width="16" height="70" rx="4" fill="${gr}" transform="rotate(${r} ${x+8} ${y+35})"/>`};
return {fig,EQ,L,dirA,add,ik,front}})();

function exArtPanel(P,on){const n=ART.fig(P,on,0,false),fa=ART.fig(P,on,-7,true);
 const ctx={S:n.S,E:n.a.E,W:n.a.Wr,Hn:n.a.Hn,K:n.g.K,An:n.g.An,T:n.g.T,H:n.H};
 const back=(P.bg||(()=>''))(ctx,ART.EQ),front=(P.fg||(()=>''))(ctx,ART.EQ);
 return `${back}<g>${fa.svg}</g>${P.mid?P.mid(ctx,ART.EQ):''}<g>${n.svg}</g>${front}`}
// 각 운동: A=시작 자세, B=끝 자세 (옆모습, 오른쪽을 봄). 좌표: 패널 400×300, 바닥 y=270
const POSE=(()=>{const {EQ:Q}=ART;const up=(x,y)=>({H:[x,y],t:0,th:0,sh:0,ft:90});
const towerR=(x=330)=>c=>Q.tower(x,8);
return {
bench:{A:{H:[245,182],t:-90,ua:180,fa:180,th:68,sh:-38,ft:90,bg:c=>Q.bench(95,300,203),fg:c=>Q.bar(c.Hn)},
       B:{H:[245,182],t:-90,ua:55,fa:184,th:68,sh:-38,ft:90,bg:c=>Q.bench(95,300,203),fg:c=>Q.bar(c.Hn)}},
incdb:{A:{H:[215,182],t:-38,hand:[175,40],eb:1,ank:[290,262],bg:c=>Q.backrest(c)+Q.seat(175,198,80),fg:c=>Q.db(c.Hn)},
       B:{H:[215,182],t:-38,hand:[200,95],eb:1,ank:[290,262],bg:c=>Q.backrest(c)+Q.seat(175,198,80),fg:c=>Q.db(c.Hn)}},
pushup:{A:{H:[175,180],t:66,th:-66,sh:-66,ft:10,hand:[262,258],eb:1,bg:()=>Q.mat(40,330)},
        B:{H:[172,212],t:79,th:-79,sh:-79,ft:12,hand:[262,258],eb:1,bg:()=>Q.mat(40,330)}},
cablefly:{front:1,sc:.86,A:{ab:104,ex:-12,bg:()=>Q.tower(28,8)+Q.tower(350,8),cab:[[39,30],[361,30]]},B:{abL:28,abR:28,ex:-14,bg:()=>Q.tower(28,8)+Q.tower(350,8),cab:[[39,30],[361,30]]}},
latpull:{A:{H:[175,192],t:-6,hand:[200,48],eb:1,ank:[250,262],bg:c=>Q.tower(268,8)+Q.seat(140,202,70)+Q.pad(205,152,40,12),fg:c=>Q.cable([279,22],c.Hn)+Q.handle(c.Hn)},
         B:{H:[175,192],t:-14,hand:[178,104],eb:-1,ank:[250,262],bg:c=>Q.tower(268,8)+Q.seat(140,202,70)+Q.pad(205,152,40,12),fg:c=>Q.cable([279,22],c.Hn)+Q.handle(c.Hn)}},
cablerow:{A:{H:[130,226],t:20,hand:[262,212],eb:1,ank:[268,252],kb:1,bg:c=>Q.tower(330,8)+Q.bench(60,190,236,1)+Q.step(270,30,22),fg:c=>Q.cable([336,248],c.Hn)+Q.handle(c.Hn)},
          B:{H:[130,226],t:-6,hand:[178,206],eb:-1,ank:[268,252],kb:1,bg:c=>Q.tower(330,8)+Q.bench(60,190,236,1)+Q.step(270,30,22),fg:c=>Q.cable([336,248],c.Hn)+Q.handle(c.Hn)}},
bbrow:{A:{H:[170,135],t:62,ank:[205,262],kb:1,ua:0,fa:0,fg:c=>Q.bar(c.Hn)},
       B:{H:[170,135],t:62,ank:[205,262],kb:1,hand:[200,170],eb:-1,fg:c=>Q.bar(c.Hn)}},
pullup:{sc:.72,A:{H:[200,196],t:-4,hand:[210,38],eb:1,th:30,sh:-62,ft:40,bg:()=>Q.pbar(60,340,38)},
        B:{H:[205,138],t:-10,hand:[210,38],eb:-1,th:25,sh:-50,ft:40,bg:()=>Q.pbar(60,340,38)}},
deadlift:{sc:.78,A:{H:[160,168],t:58,ank:[205,262],kb:1,hand:[222,236],eb:1,fg:c=>Q.bar([c.Hn[0],240])},
          B:{H:[198,110],t:2,ank:[205,262],kb:1,ua:4,fa:4,fg:c=>Q.bar(c.Hn)}},
ohp:{sc:.7,A:{...up(200,110),hand:S=>[S[0]+14,S[1]-16],eb:-1,fg:c=>Q.bar(c.Hn)},
     B:{...up(200,110),hand:[208,-80],eb:1,fg:c=>Q.bar(c.Hn)}},
lateral:{front:1,sc:.86,A:{ab:8,ex:4,db:1},B:{ab:88,ex:6,db:1}},
facepull:{sc:.78,A:{...up(170,110),t:-4,hand:[290,20],eb:1,bg:()=>Q.tower(330,8),fg:c=>Q.cable([336,24],c.Hn)+Q.handle(c.Hn)},
          B:{...up(170,110),t:-6,hand:[205,10],eb:-1,ua:null,bg:()=>Q.tower(330,8),fg:c=>Q.cable([336,24],c.Hn)+Q.handle(c.Hn)}},
curl:{sc:.78,A:{...up(200,110),ua:5,fa:5,fg:c=>Q.bar(c.Hn)},B:{...up(200,110),ua:12,fa:160,fg:c=>Q.bar(c.Hn)}},
pushdown:{sc:.78,A:{...up(190,110),t:10,ua:-6,fa:135,bg:()=>Q.tower(320,8),fg:c=>Q.cable([326,24],c.Hn)+Q.handle(c.Hn)},
          B:{...up(190,110),t:10,ua:-6,fa:6,bg:()=>Q.tower(320,8),fg:c=>Q.cable([326,24],c.Hn)+Q.handle(c.Hn)}},
squat:{sc:.78,A:{...up(200,110),hand:S=>[S[0]-4,S[1]-12],eb:1,fg:c=>Q.bar([c.S[0]-10,c.S[1]-14])},
       B:{H:[150,190],t:42,ank:[205,262],kb:1,hand:S=>[S[0]-4,S[1]-12],eb:1,fg:c=>Q.bar([c.S[0]-10,c.S[1]-14])}},
legpress:{A:{H:[150,215],t:-62,ua:30,fa:60,ank:[300,92],kb:-1,ft:150,bg:c=>Q.backrest(c)+Q.seat(120,230,70),fg:c=>Q.sled(c.An[0]+4,c.An[1]-52,-45)},
          B:{H:[150,215],t:-62,ua:30,fa:60,ank:[232,152],kb:-1,ft:150,bg:c=>Q.backrest(c)+Q.seat(120,230,70),fg:c=>Q.sled(c.An[0]+4,c.An[1]-52,-45)}},
rdl:{sc:.78,A:{H:[198,110],t:2,ank:[205,262],kb:1,ua:4,fa:4,fg:c=>Q.bar(c.Hn)},
     B:{H:[150,128],t:78,ank:[205,262],kb:1,ua:0,fa:0,fg:c=>Q.bar(c.Hn)}},
lunge:{sc:.8,A:{...up(200,110),ua:2,fa:2,fg:c=>Q.db(c.Hn)},
       B:{H:[190,170],t:4,ank:[262,262],kb:1,ank2:[105,262],kb2:1,ft2:60,ua:2,fa:2,fg:c=>Q.db(c.Hn)}},
legext:{A:{H:[170,196],t:-8,ua:15,fa:60,th:88,sh:2,ft:90,bg:c=>Q.backrest(c)+Q.seat(120,208,90),fg:c=>Q.pad(c.An[0]-6,c.An[1]-14,22,14)},
        B:{H:[170,196],t:-8,ua:15,fa:60,th:84,sh:82,ft:170,bg:c=>Q.backrest(c)+Q.seat(120,208,90),fg:c=>Q.pad(c.An[0]-6,c.An[1]-14,22,14)}},
legcurl:{A:{H:[170,170],t:90,ua:-10,fa:-10,th:-90,sh:-90,ft:0,bg:()=>Q.bench(40,330,190),fg:c=>Q.pad(c.An[0]-8,c.An[1]-24,16,16)},
         B:{H:[170,170],t:90,ua:-10,fa:-10,th:-90,sh:172,ft:110,bg:()=>Q.bench(40,330,190),fg:c=>Q.pad(c.An[0]-8,c.An[1]-24,16,16)}},
hipthrust:{A:{H:[196,228],t:-56.5,ank:[285,262],kb:1,hand:[205,205],eb:1,bg:()=>Q.bench(40,130,176),fg:c=>Q.bar([c.H[0]+4,c.H[1]-28])},
           B:{H:[210,174],t:-90,ank:[285,262],kb:1,hand:[212,152],eb:1,bg:()=>Q.bench(40,130,176),fg:c=>Q.bar([c.H[0]+4,c.H[1]-28])}},
calf:{sc:.78,A:{H:[206,86],t:0,th:0,sh:0,ft:95,ua:0,fa:0,bg:()=>Q.step(170,80,28),fg:c=>Q.db(c.Hn)},
      B:{H:[220,62],t:0,th:0,sh:0,ft:25,ua:0,fa:0,bg:()=>Q.step(170,80,28),fg:c=>Q.db(c.Hn)}},
plank:{A:{H:[175,220],t:78,th:-78,sh:-78,ft:12,ua:0,fa:90,bg:()=>Q.mat(30,330)}},
cablecrunch:{A:{H:[190,190],t:18,th:2,sh:-90,ft:0,hand:(S,H,t)=>{const d=ART.dirA(180-t);return [S[0]+d[0]*16+d[1]*-10,S[1]+d[1]*16+d[0]*10]},eb:-1,bg:()=>Q.tower(330,8),fg:c=>Q.cable([336,24],c.Hn)},
             B:{H:[190,190],t:100,th:2,sh:-90,ft:0,hand:(S,H,t)=>{const d=ART.dirA(180-t);return [S[0]+d[0]*16+d[1]*-10,S[1]+d[1]*16+d[0]*10]},eb:-1,bg:()=>Q.tower(330,8),fg:c=>Q.cable([336,24],c.Hn)}}
}})();
function exArtOne(P,on){if(P.front){const f=ART.front(P,on);let o=(P.bg?P.bg({},ART.EQ):'');if(P.cab)o+=P.cab.map((a,i)=>ART.EQ.cable(a,f.hands[i])).join('');o+=f.svg;if(P.db)o+=f.hands.map(h=>ART.EQ.db(h)).join('');return o}return exArtPanel(P,on)}
function exArt(id,on){const X=POSE[id];if(!X)return null;const two=!!X.B;const sc=X.sc||1;
 const pan=(P,ox)=>`<g transform="translate(${ox} 0)"><g transform="translate(${200*(1-sc)} ${270*(1-sc)}) scale(${sc})">${exArtOne(X.front?{...P,front:1}:P,on)}</g></g>`;
 const W=two?800:400;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 300" preserveAspectRatio="xMidYMid meet"><rect width="${W}" height="300" fill="#F6F7FB"/><rect y="270" width="${W}" height="30" fill="#E8EBF3"/>`+
 (two?`<line x1="400" y1="20" x2="400" y2="280" stroke="#E1E4EE" stroke-width="2" stroke-dasharray="4 6"/>`:'')+
 pan(X.A,0)+(two?pan(X.B,400):'')+
 (two?`<g font-family="Pretendard,sans-serif" font-size="15" font-weight="800" fill="#8A90A8"><text x="16" y="290">1 시작</text><text x="416" y="290">2 마무리</text></g>`:'')+`</svg>`}
