// ===== Core 3D 운동 애니메이션 렌더러 (브라우저용, r3d.py 이식) =====
// 좌표: x=앞, y=위, z=인물 왼쪽(카메라 쪽). 단위 cm.
const ART3D=(()=>{
const D=Math.PI/180;
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const len=a=>Math.hypot(a[0],a[1],a[2]),nrm=a=>{const l=len(a);return l>1e-9?mul(a,1/l):a};
const V=(x,y,z)=>[x,y,z];
const sag=(phi,ab=0,side=1)=>{const p=phi*D,a=ab*D;return nrm([Math.sin(p)*Math.cos(a),-Math.cos(p)*Math.cos(a),side*Math.sin(a)])};
function ik(A,T,la,lb,pole){const d=sub(T,A);let L=len(d);L=Math.min(Math.max(L,1e-3),la+lb-1e-3);const u=nrm(d);let pv=sub(pole,mul(u,dot(pole,u)));pv=len(pv)>1e-6?nrm(pv):nrm(cross(u,[0,0,1]));let ca=(la*la+L*L-lb*lb)/(2*la*L);ca=Math.max(-1,Math.min(1,ca));const sa=Math.sqrt(1-ca*ca);return add(A,mul(add(mul(u,ca),mul(pv,sa)),la))}
// ---- 도형 ----
function Ell(c,axes,radii,col,mat='skin'){const M=axes.map((a,i)=>mul(a,1/radii[i]));return {k:0,c,M,col,mat,rb:Math.max(...radii)}}
function Box(c,axes,h,col,mat='metal'){return {k:1,c,R:axes,h,col,mat,rb:len(h)}}
function frameFrom(u,ref){u=nrm(u);let v=sub(ref,mul(u,dot(ref,u)));if(len(v)<1e-6)v=Math.abs(u[2])<.9?cross(u,[0,0,1]):cross(u,[1,0,0]);v=nrm(v);return [u,v,cross(u,v)]}
const segEll=(A,B,r1,r2,col,ref=[1,0,0],ext=1.06,mat='skin')=>{const L=len(sub(B,A));return Ell(mul(add(A,B),.5),frameFrom(sub(B,A),ref),[L/2*ext,r1,r2],col,mat)};
const sph=(c,r,col,mat='skin')=>Ell(c,[[1,0,0],[0,1,0],[0,0,1]],[r,r,r],col,mat);
const box=(c,half,col,rotz=0,mat='metal')=>{const a=rotz*D;return Box(c,[[Math.cos(a),Math.sin(a),0],[-Math.sin(a),Math.cos(a),0],[0,0,1]],half,col,mat)};
const boxA=(c,axes,half,col,mat='metal')=>Box(c,axes.map(nrm),half,col,mat);
// ---- 색 ----
const SKIN=[.86,.84,.82],SKIN2=[.80,.78,.76],RED=[.84,.22,.17],PINK=[.93,.55,.48],DARK=[.20,.22,.27],METAL=[.62,.65,.70],FRAME=[.80,.82,.86],PAD=[.16,.17,.21],CABLE=[.10,.10,.12],MAT=[.55,.62,.82];
const LEN={t:50,ua:30,fa:27,th:44,sh:42,ft:19};
// ---- 인체 ----
function body(P,on){const pr=on.p||[],sc=on.s||[];const mcol=k=>pr.includes(k)?RED:sc.includes(k)?PINK:SKIN2;
 const H=[P.H[0],P.H[1],0];const t=(P.t||0)*D;const up=[Math.sin(t),Math.cos(t),0],fw=[Math.cos(t),-Math.sin(t),0],zz=[0,0,1];
 const Sc=add(H,mul(up,LEN.t));const J={H,Sc};const out=[];const at=(...v)=>v.reduce((a,b)=>add(a,b));
 out.push(Ell(add(H,mul(up,33)),[up,fw,zz],[17,11.5,16.5],SKIN),Ell(add(H,mul(up,15)),[up,fw,zz],[14,10,13.5],SKIN),Ell(add(H,mul(up,2)),[up,fw,zz],[10,10.5,15],SKIN));
 for(const s of [-1,1]){
  out.push(Ell(at(H,mul(up,38),mul(fw,7),mul(zz,s*7.5)),[up,fw,zz],[8,5.2,9],mcol('chest')));
  out.push(Ell(at(H,mul(up,25),mul(fw,-6),mul(zz,s*11)),[up,fw,zz],[16,6.5,6],mcol('lats')));
  out.push(Ell(at(H,mul(up,12),mul(fw,-7.5),mul(zz,s*4.5)),[up,fw,zz],[11,4.5,4],mcol('lowerback')));
  out.push(Ell(at(H,mul(up,13),mul(zz,s*11.5),mul(fw,1)),[up,fw,zz],[10,6.5,4.5],mcol('obliques')));
  out.push(Ell(at(H,mul(up,-1),mul(fw,-8),mul(zz,s*7)),[up,fw,zz],[9,6.5,8],mcol('glutes')));}
 out.push(Ell(at(H,mul(up,17),mul(fw,8)),[up,fw,zz],[14,4,7.5],mcol('abs')));
 out.push(Ell(sub(Sc,mul(fw,5)),[up,fw,zz],[9,5.5,15],mcol('traps')));
 const nk=add(Sc,mul(up,6));const hdUp=nrm(add(up,mul(fw,P.head||0)));
 out.push(segEll(Sc,add(nk,mul(up,3)),5.2,5.2,SKIN,fw));const hc=add(nk,mul(hdUp,11));out.push(Ell(hc,[hdUp,nrm(fw),zz],[11.5,9.8,9],SKIN));J.head=hc;
 for(const s of [-1,1]){const sfx=s>0?'L':'R';const g=(k,d)=>P[k+sfx]!==undefined?P[k+sfx]:P[k]!==undefined?P[k]:d;
  const S=at(Sc,mul(zz,s*17.5),mul(fw,-1),mul(up,P.shr||0));let E,W;const hand=g('hand',null);
  if(hand){const T=hand.length===3?[hand[0],hand[1],hand[2]]:[hand[0],hand[1],s*g('hz',22)];const pl=g('epole',[-1,-.3,.5]);E=ik(S,T,LEN.ua,LEN.fa+3,[pl[0],pl[1],pl[2]*s]);W=add(E,mul(nrm(sub(T,E)),LEN.fa))}
  else{E=add(S,mul(sag(g('ua',0),g('uab',8),s),LEN.ua));W=add(E,mul(sag(g('fa',0),g('fab',g('uab',8)),s),LEN.fa))}
  const uua=nrm(sub(E,S));const cr=cross([0,0,1],uua);const refU=len(cr)>.2?nrm(cr):[1,0,0];const an=nrm(sub(refU,mul(uua,dot(refU,uua))));
  out.push(segEll(S,E,5.4,5.6,SKIN,refU));
  out.push(Ell(at(S,mul(uua,14),mul(an,3.2)),frameFrom(uua,refU),[10,3.6,3.8],mcol('biceps')));
  out.push(Ell(at(S,mul(uua,13),mul(an,-3.4)),frameFrom(uua,refU),[12,3.8,4.2],mcol('triceps')));
  out.push(Ell(add(S,mul(uua,2.5)),frameFrom(uua,refU),[9,8,8.2],mcol('delts')));
  const ufa=nrm(sub(W,E));out.push(segEll(E,W,4.4,3.4,mcol('forearms'),refU));
  const wr=g('wr',0)*D;let afa=cross([0,0,1],ufa);afa=len(afa)>.2?nrm(afa):[1,0,0];const hd=nrm(add(mul(ufa,Math.cos(wr)),mul(afa,Math.sin(wr))));
  out.push(sph(add(W,mul(hd,4.5)),4.4,SKIN));J['E'+sfx]=E;J['W'+sfx]=W;J['Hn'+sfx]=add(W,mul(hd,5.5));
  const Hp=add(H,mul(zz,s*9));let K,A;const ank=g('ank',null);
  if(ank){const T=[ank[0],ank[1],s*g('az',11)];const kp=g('kpole',[1,.2,.1]);K=ik(Hp,T,LEN.th,LEN.sh,[kp[0],kp[1],kp[2]*s]);A=add(K,mul(nrm(sub(T,K)),LEN.sh))}
  else{K=add(Hp,mul(sag(g('th',0),g('tab',3),s),LEN.th));A=add(K,mul(sag(g('sh',0),g('sab',0),s),LEN.sh))}
  const uth=nrm(sub(K,Hp));const c2=cross([0,0,1],uth);const refL=len(c2)>.2?nrm(c2):[0,1,0];const al=nrm(sub(refL,mul(uth,dot(refL,uth))));
  out.push(segEll(Hp,K,8.2,8.6,SKIN,refL));
  out.push(Ell(at(Hp,mul(uth,22),mul(al,3.6)),frameFrom(uth,refL),[18,5.6,6.6],mcol('quads')));
  out.push(Ell(at(Hp,mul(uth,22),mul(al,-3.8)),frameFrom(uth,refL),[17,5.2,6.2],mcol('hamstrings')));
  out.push(Ell(at(Hp,mul(uth,14),mul(zz,-s*4.2)),frameFrom(uth,refL),[12,4.6,4],mcol('adductors')));
  out.push(sph(K,6.2,SKIN));
  const ush=nrm(sub(A,K));const c3=cross([0,0,1],ush);const refS=len(c3)>.2?nrm(c3):[0,1,0];const cs=nrm(sub(refS,mul(ush,dot(refS,ush))));
  out.push(segEll(K,A,5.3,4.6,SKIN,refS));out.push(Ell(at(K,mul(ush,13),mul(cs,-3)),frameFrom(ush,refS),[11,4.6,4.8],mcol('calves')));
  const fd=sag(g('ft',90),0,s);out.push(Ell(at(A,mul(fd,8),[0,-2.5,0]),frameFrom(fd,[0,1,0]),[11,3.6,4.4],SKIN));
  J['K'+sfx]=K;J['A'+sfx]=A;J['T'+sfx]=add(A,mul(fd,17))}
 return [out,J]}
// ---- 기구 ----
const barbell=(c,half=60,plates=true)=>{const o=[Ell(c,[[0,0,1],[1,0,0],[0,1,0]],[half,1.3,1.3],METAL,'metal')];if(plates)for(const s of [-1,1]){o.push(Ell(add(c,[0,0,s*(half-14)]),[[0,0,1],[1,0,0],[0,1,0]],[2.6,22,22],DARK,'plate'),Ell(add(c,[0,0,s*(half-19)]),[[0,0,1],[1,0,0],[0,1,0]],[2.2,16,16],DARK,'plate'))}return o};
const dumbbell=(c,axis=[0,0,1])=>{const a=nrm(axis),F=frameFrom(a,[0,1,0]);return [Ell(c,F,[9,1.4,1.4],METAL,'metal'),Ell(add(c,mul(a,8)),F,[3.2,6.5,6.5],DARK,'plate'),Ell(sub(c,mul(a,8)),F,[3.2,6.5,6.5],DARK,'plate')]};
const kettlebell=c=>[sph(add(c,[0,-8,0]),9,DARK,'plate'),Ell(c,[[0,0,1],[1,0,0],[0,1,0]],[5,3,1.2],DARK,'plate')];
const bench=(x0,x1,y,z=0,w=15,legs=true)=>{const o=[box([(x0+x1)/2,y-4,z],[Math.abs(x1-x0)/2,4,w],PAD,0,'pad')];if(legs)for(const x of [x0+8,x1-8])o.push(box([x,(y-8)/2,z],[2.5,(y-8)/2,w*.7],METAL));return o};
function incline(H,tdeg,yseat,back=55){const t=tdeg*D,up=[Math.sin(t),Math.cos(t),0],fw=[Math.cos(t),-Math.sin(t),0];const c=sub(add([H[0],H[1],0],mul(up,back/2)),mul(fw,14));
 return [Box(c,[up,fw,[0,0,1]],[back/2,3.5,15],PAD,'pad'),...bench(H[0]-12,H[0]+26,yseat,0,15,false),box([H[0]+5,yseat/2-3,0],[3,yseat/2-3,10],METAL),box([H[0]+5,2,0],[30,2,18],METAL)]}
const tower=(x,z=0,h=210,w=14)=>[box([x,h/2,z],[w/2,h/2,w/2],FRAME),box([x-w/2-1,h*.45,z],[1.5,26,w/2-2],DARK,0,'plate'),sph([x-w/2-3,h-8,z],3.5,METAL,'metal')];
const cable=(a,b,r=.55)=>[segEll(a,b,r,r,CABLE,[0,1,0],1.0,'metal'),sph(a,2.6,METAL,'metal')];
const handle=(c,axis=[0,0,1],half=6)=>[Ell(c,frameFrom(nrm(axis),[0,1,0]),[half,1.6,1.6],DARK,'metal')];
const floorMat=(x0,x1,w=40)=>[box([(x0+x1)/2,.6,0],[(x1-x0)/2,.6,w],MAT,0,'pad')];
const pullbar=(y,half=70)=>[Ell([0,y,0],[[0,0,1],[1,0,0],[0,1,0]],[half,1.6,1.6],METAL,'metal'),box([0,y/2,half],[3,y/2,3],FRAME),box([0,y/2,-half],[3,y/2,3],FRAME)];
const COL={pad:PAD,metal:METAL,frame:FRAME,dark:DARK,mat:MAT};
// 선언형 기구 목록 → 도형
function gearObjs(list,J,P){const o=[];const mid=add(mul(add(J.HnL,J.HnR),.5),[0,0,0]);const mid0=[mid[0],mid[1],0];
 const pt=w=>w==='hands'?mid:w==='handL'?J.HnL:w==='handR'?J.HnR:w==='ankles'?mul(add(J.AL,J.AR),.5):w==='ankleL'?J.AL:w==='ankleR'?J.AR:w==='knees'?mul(add(J.KL,J.KR),.5):w==='hips'?J.H:w==='shoulders'?J.Sc:Array.isArray(w)?w:mid;
 for(const g of list||[]){try{const ty=g.t||g.type;
  if(ty==='barbell'){const c=g.at?pt(g.at):mid0;o.push(...barbell([c[0]+(g.dx||0),c[1]+(g.dy||0),0],g.half||60,g.plates!==false))}
  else if(ty==='dumbbells'){o.push(...dumbbell(J.HnL,g.axis||[0,0,1]),...dumbbell(J.HnR,g.axis||[0,0,1]))}
  else if(ty==='dumbbell')o.push(...dumbbell(g.at?pt(g.at):mid,g.axis||[0,1,0]));
  else if(ty==='kettlebell')o.push(...kettlebell(add(mid,[0,-2,0])));
  else if(ty==='ball')o.push(sph(mid,g.r||10,DARK,'plate'));
  else if(ty==='bench')o.push(...bench(g.x0??-85,g.x1??30,g.y??44,g.z||0,15,g.legs!==false));
  else if(ty==='incline')o.push(...incline(P.H,P.t,g.seat??48,g.back||55));
  else if(ty==='backrest'){const t=(P.t||0)*D,up=[Math.sin(t),Math.cos(t),0],fw=[Math.cos(t),-Math.sin(t),0];o.push(Box(sub(add([P.H[0],P.H[1],0],mul(up,27)),mul(fw,14)),[up,fw,[0,0,1]],[27,3.5,15],PAD,'pad'))}
  else if(ty==='seat')o.push(...bench(g.x0??-14,g.x1??26,g.y??46,0,15,g.legs!==false));
  else if(ty==='tower')o.push(...tower(g.x??100,g.z||0,g.h||210));
  else if(ty==='cable'){const a=g.from||[90,200,0];const b=pt(g.to||'hands');o.push(...cable(a,b));if(g.handle!==false&&(g.to||'hands')==='hands')o.push(...handle(b,g.axis||[0,0,1],g.half||12))}
  else if(ty==='handle')o.push(...handle(pt(g.at||'hands'),g.axis||[0,0,1],g.half||12));
  else if(ty==='pullbar')o.push(...pullbar(g.y||218,g.half||70));
  else if(ty==='bars'){for(const s of [-1,1]){o.push(Ell([g.x??8,g.y??110,s*30],[[1,0,0],[0,1,0],[0,0,1]],[40,2,2],METAL,'metal'));for(const x of [(g.x??8)-36,(g.x??8)+36])o.push(box([x,(g.y??110)/2,s*30],[2.5,(g.y??110)/2,2.5],FRAME))}}
  else if(ty==='mat')o.push(...floorMat(g.x0??-100,g.x1??70));
  else if(ty==='step')o.push(box([g.x??10,(g.h??10)/2,0],[g.w??12,(g.h??10)/2,30],FRAME));
  else if(ty==='roller'){const c=pt(g.at||'ankles');o.push(Ell([c[0]+(g.dx||0),c[1]+(g.dy||0),0],[[0,0,1],[1,0,0],[0,1,0]],[20,4.5,4.5],PAD,'pad'))}
  else if(ty==='plate'){const c=pt(g.at||'ankles');const a=(g.angle??45)*D;o.push(Box([c[0]+(g.dx||6),c[1]+(g.dy||2),0],[[Math.cos(a),Math.sin(a),0],[-Math.sin(a),Math.cos(a),0],[0,0,1]],[2.5,22,32],DARK,'plate'))}
  else if(ty==='box'){const a=(g.rot||0)*D;o.push(Box(g.c||[0,20,0],[[Math.cos(a),Math.sin(a),0],[-Math.sin(a),Math.cos(a),0],[0,0,1]],g.half||[10,10,10],COL[g.color]||FRAME,g.color==='pad'?'pad':'metal'))}
  else if(ty==='posts'){for(const s of [-1,1])o.push(box([g.x??0,(g.h??210)/2,s*(g.z??62)],[3,(g.h??210)/2,3],FRAME))}
 }catch(e){}}return o}
// ---- 레이트레이싱 ----
function hitObj(o,ro,rd){if(o.k===0){const M=o.M;const ox=ro[0]-o.c[0],oy=ro[1]-o.c[1],oz=ro[2]-o.c[2];
  const a0=M[0][0]*ox+M[0][1]*oy+M[0][2]*oz,a1=M[1][0]*ox+M[1][1]*oy+M[1][2]*oz,a2=M[2][0]*ox+M[2][1]*oy+M[2][2]*oz;
  const d0=M[0][0]*rd[0]+M[0][1]*rd[1]+M[0][2]*rd[2],d1=M[1][0]*rd[0]+M[1][1]*rd[1]+M[1][2]*rd[2],d2=M[2][0]*rd[0]+M[2][1]*rd[1]+M[2][2]*rd[2];
  const a=d0*d0+d1*d1+d2*d2,b=a0*d0+a1*d1+a2*d2,c=a0*a0+a1*a1+a2*a2-1;const h=b*b-a*c;if(h<=0)return -1;const sq=Math.sqrt(h);let t=(-b-sq)/a;if(t<=1e-3)t=(-b+sq)/a;if(t<=1e-3)return -1;
  o._p=[a0+d0*t,a1+d1*t,a2+d2*t];return t}
 const R=o.R;const ox=ro[0]-o.c[0],oy=ro[1]-o.c[1],oz=ro[2]-o.c[2];let tn=-1e9,tf=1e9;const p=[0,0,0],d=[0,0,0];
 for(let i=0;i<3;i++){p[i]=R[i][0]*ox+R[i][1]*oy+R[i][2]*oz;d[i]=R[i][0]*rd[0]+R[i][1]*rd[1]+R[i][2]*rd[2];const inv=1/(Math.abs(d[i])<1e-9?1e-9:d[i]);const t1=(-o.h[i]-p[i])*inv,t2=(o.h[i]-p[i])*inv;tn=Math.max(tn,Math.min(t1,t2));tf=Math.min(tf,Math.max(t1,t2))}
 if(!(tn<tf&&tf>1e-3))return -1;const t=tn>1e-3?tn:tf;o._p=[p[0]+d[0]*t,p[1]+d[1]*t,p[2]+d[2]*t];return t}
function normalOf(o){const p=o._p;if(o.k===0){const M=o.M;return nrm([p[0]*M[0][0]+p[1]*M[1][0]+p[2]*M[2][0],p[0]*M[0][1]+p[1]*M[1][1]+p[2]*M[2][1],p[0]*M[0][2]+p[1]*M[1][2]+p[2]*M[2][2]])}
 const q=[Math.abs(p[0])/o.h[0],Math.abs(p[1])/o.h[1],Math.abs(p[2])/o.h[2]];const ax=q[0]>q[1]?(q[0]>q[2]?0:2):(q[1]>q[2]?1:2);const s=Math.sign(p[ax])||1;return mul(o.R[ax],s)}
function sphereMiss(o,ro,rd){const ox=o.c[0]-ro[0],oy=o.c[1]-ro[1],oz=o.c[2]-ro[2];const tc=ox*rd[0]+oy*rd[1]+oz*rd[2];const d2=ox*ox+oy*oy+oz*oz-tc*tc;return d2>o.rb*o.rb||(tc<-o.rb)}
function shadowed(objs,p,L){for(const o of objs){if(sphereMiss(o,p,L))continue;if(hitObj(o,p,L)>.05)return true}return false}
const LIGHT=nrm([.45,.9,.55]),FILL=nrm([-.6,.3,-.4]),BG_TOP=[.972,.975,.99],BG_BOT=[.925,.932,.955];
const MATP={skin:[25,.12],metal:[60,.55],pad:[12,.08],plate:[30,.25]};
function render(objs,cam,W=320,H=240,ss=2){const [eye,tgt,fov]=cam;const w2=W*ss,h2=H*ss;const fwd=nrm(sub(tgt,eye)),right=nrm(cross(fwd,[0,1,0])),upv=cross(right,fwd);const th=Math.tan(fov*D/2);
 const buf=new Float32Array(w2*h2*3);
 for(let y=0;y<h2;y++){const py=(1-(y+.5)/h2*2)*th;for(let x=0;x<w2;x++){const px=((x+.5)/w2*2-1)*th*(w2/h2);
  const rd=nrm([fwd[0]+px*right[0]+py*upv[0],fwd[1]+px*right[1]+py*upv[1],fwd[2]+px*right[2]+py*upv[2]]);
  let best=1e9,bo=null;for(const o of objs){if(sphereMiss(o,eye,rd))continue;const t=hitObj(o,eye,rd);if(t>0&&t<best){best=t;bo=o;o._hp=o._p}}
  const g=Math.min(1,Math.max(0,(py/th+1)/2));let col=[BG_BOT[0]*(1-g)+BG_TOP[0]*g,BG_BOT[1]*(1-g)+BG_TOP[1]*g,BG_BOT[2]*(1-g)+BG_TOP[2]*g];
  const tfl=rd[1]<-1e-6?-eye[1]/rd[1]:1e9;
  if(tfl<best&&tfl<1e8){const p=add(eye,mul(rd,tfl));const dist=Math.hypot(p[0],p[2]);const sh=shadowed(objs,add(p,[0,.1,0]),LIGHT)?.82:1;const fade=Math.min(1,Math.max(0,1-(dist-150)/450));
   col=[ .925*sh*fade+col[0]*(1-fade), .932*sh*fade+col[1]*(1-fade), .955*sh*fade+col[2]*(1-fade)]}
  else if(bo){bo._p=bo._hp;const n=normalOf(bo);const p=add(eye,mul(rd,best));let ndl=Math.max(0,dot(n,LIGHT));const sh=shadowed(objs,add(p,mul(n,.15)),LIGHT);if(sh)ndl*=.35;
   const fil=Math.max(0,dot(n,FILL));const vd=mul(rd,-1);const rim=Math.pow(Math.max(0,1-dot(n,vd)),3);const hv=nrm(add(LIGHT,vd));const [sp,sk]=MATP[bo.mat]||MATP.skin;const spec=Math.pow(Math.max(0,dot(n,hv)),sp)*sk*(sh?.2:1);
   const amb=.34+.10*n[1];const k=amb+.62*ndl+.16*fil;col=[0,1,2].map(i=>Math.min(1,Math.max(0,bo.col[i]*k+spec+rim*.1)))}
  const i=(y*w2+x)*3;buf[i]=col[0];buf[i+1]=col[1];buf[i+2]=col[2]}}
 const outp=new Uint8ClampedArray(W*H*4);for(let y=0;y<H;y++)for(let x=0;x<W;x++){let r=0,g=0,b=0;for(let j=0;j<ss;j++)for(let i=0;i<ss;i++){const k=((y*ss+j)*w2+(x*ss+i))*3;r+=buf[k];g+=buf[k+1];b+=buf[k+2]}const n=ss*ss,o=(y*W+x)*4;outp[o]=r/n*255;outp[o+1]=g/n*255;outp[o+2]=b/n*255;outp[o+3]=255}
 return outp}
// ---- 자세 보간·카메라 ----
function interp(A,B,k){if(!B)return A;const o={};for(const key of new Set([...Object.keys(A),...Object.keys(B)])){const a=A[key],b=B[key];
 if(a==null||b==null)o[key]=(k<.5&&a!=null)||b==null?a:b;else if(typeof a==='number'&&typeof b==='number')o[key]=a+(b-a)*k;
 else if(Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&typeof a[0]==='number')o[key]=a.map((x,i)=>x+(b[i]-x)*k);else o[key]=k<.5?a:b}return o}
function scene(X,k){const P=interp(X.A,X.B,k);const [objs,J]=body(P,{p:X.p,s:X.s});return objs.concat(gearObjs(X.gear,J,P))}
function bounds(objs){const lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9];for(const o of objs){let r;if(o.k===0){r=[0,1,2].map(j=>{let s=0;for(let i=0;i<3;i++){const ri=1/len(o.M[i]);s+=Math.pow(o.M[i][j]*ri*ri,2)}return Math.sqrt(s)})}else r=[0,1,2].map(j=>Math.abs(o.R[0][j])*o.h[0]+Math.abs(o.R[1][j])*o.h[1]+Math.abs(o.R[2][j])*o.h[2]);for(let j=0;j<3;j++){lo[j]=Math.min(lo[j],o.c[j]-r[j]);hi[j]=Math.max(hi[j],o.c[j]+r[j])}}return [lo,hi]}
function camera(X,W,H){const p=X.p||[];let rear=p.some(m=>['lats','traps','lowerback','hamstrings','glutes','triceps','calves'].includes(m))&&!p.some(m=>['chest','quads','abs','biceps'].includes(m));
 const c=X.cam||{};const az=c.az??(rear?140:40),el=c.el??(rear?15:13),fov=30;let lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9];for(const k of [0,.5,1]){const [l,h]=bounds(scene(X,k));for(let j=0;j<3;j++){lo[j]=Math.min(lo[j],l[j]);hi[j]=Math.max(hi[j],h[j])}}
 lo[1]=Math.max(lo[1],0);lo[2]=Math.max(lo[2],-75);hi[2]=Math.min(hi[2],75);const ctr=mul(add(lo,hi),.5);const a=az*D,e=el*D;const dv=[Math.cos(e)*Math.cos(a),Math.sin(e),Math.cos(e)*Math.sin(a)];
 const fwd=mul(dv,-1),right=nrm(cross(fwd,[0,1,0])),upv=cross(right,fwd);const th=Math.tan(fov*D/2),asp=W/H;let best=900;
 const pts=[];for(let i=0;i<8;i++)pts.push([i&1?lo[0]:hi[0],i&2?lo[1]:hi[1],i&4?lo[2]:hi[2]]);
 for(let dist=120;dist<=900;dist+=10){const eye=add(ctr,mul(dv,dist));let ok=true;for(const q0 of pts){const q=sub(q0,eye);const z=dot(q,fwd);if(z<=1||Math.abs(dot(q,right)/z)>th*asp*.9||Math.abs(dot(q,upv)/z)>th*.86){ok=false;break}}if(ok){best=dist;break}}
 return [add(ctr,mul(dv,best)),add(ctr,[0,-2,0]),fov]}
const ease=k=>.5-.5*Math.cos(Math.PI*k);
// 프레임 렌더 → 스프라이트(가로로 이어 붙인 한 장) 캔버스
async function renderSprite(X,{W=320,H=240,n=9,ss=2,onProgress}={}){const cam=camera(X,W,H);const N=X.B?n:1;const cv=document.createElement('canvas');cv.width=W*N;cv.height=H;const ctx=cv.getContext('2d');
 for(let i=0;i<N;i++){const px=render(scene(X,N>1?ease(i/(N-1)):0),cam,W,H,ss);ctx.putImageData(new ImageData(px,W,H),i*W,0);onProgress&&onProgress((i+1)/N);await new Promise(r=>setTimeout(r,0))}
 return {canvas:cv,frames:N,W,H}}
return {render,scene,camera,renderSprite,interp,body,gearObjs}})();
