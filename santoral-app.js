'use strict';
// Mis oraciones v3.1 (28): Santoral (aprobado en preview-santoral). Un santo cada día del año según el calendario litúrgico de España,
// con frescos y pinturas de dominio público (o un medallón dibujado), ficha, calendario por meses y buscador. ES/EN según la app.
// · Tarjeta «Santo del día» debajo del panel de arriba (no dentro), y entrada «Santoral» en el menú ☰.
// · Las oraciones enlazadas se abren en la app. Créditos en Ajustes › Créditos.
// · No guarda nada: ninguna clave nueva en localStorage; no renombra ni borra ninguna existente.
(()=>{
if(document.getElementById('santoralView')||!window.SANTORAL||!window.SANTORAL_FRESCOS)return;
const $=id=>document.getElementById(id);
const S=window.SANTORAL,F=window.SANTORAL_FRESCOS;
const st={lang:window.MO_LANG==='en'?'en':'es',date:null,sel:null,month:null,q:''};
const pad=n=>String(n).padStart(2,'0');
const key=d=>pad(d.getMonth()+1)+'-'+pad(d.getDate());
st.date=new Date();st.date.setHours(12,0,0,0);st.sel=key(st.date);st.month=+st.sel.slice(0,2);

/* ---------- textos ---------- */
const T={
es:{pvTitle:'Prueba · Santoral',pvSub:'Página sin enlazar: no cambia la app ni tus datos.',dbgSum:'Opciones de prueba',dbgDate:'Fecha',dbgToday:'Volver a hoy',
 ctx:'Así se verían la tarjeta «Santo del día», la ficha y el calendario.',today:'Santo del día',see:'Ver ficha',calH:'Santoral',q:'Buscar un santo o patronazgo…',
 months:['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
 rank:{S:'Solemnidad',F:'Fiesta',M:'Memoria obligatoria',m:'Memoria libre',C:'Conmemoración','':''},
 cal:{R:'Calendario romano general',E:'Calendario propio de España',M:'Martirologio romano · sin celebración en el calendario de España'},
 also:'Hoy también (calendario de España)',loc:'Devoción local',
 pat:'Patrón de',patF:'Patronazgo',pray:'Para rezar en la app',prev:'Día anterior',next:'Día siguiente',fresco:'Fresco',paint:'Pintura',rep:'Imagen representativa',repNote:'Imagen representativa: santos juntos en un fresco o pintura; no es un retrato de este santo en concreto.',pd:'Dominio público',icon:'Dibujo',
 leap:'solo en años bisiestos',noRes:'Sin resultados.',res:n=>n+' resultado'+(n===1?'':'s'),
 mov:'Hoy, además',credSum:'Créditos y fuentes',
 note:'Si coincide con domingo, Semana Santa u otra celebración mayor, la liturgia de ese día puede cambiar.',
 info:(d,k)=>`Fecha de prueba: ${d}. Día del santoral: ${k}.`},
en:{pvTitle:'Preview · Saints',pvSub:'Unlinked page: it does not change the app or your data.',dbgSum:'Test options',dbgDate:'Date',dbgToday:'Back to today',
 ctx:'This is how the "Saint of the day" card, the saint page and the calendar would look.',today:'Saint of the day',see:'Open',calH:'Saints',q:'Search a saint or patronage…',
 months:['January','February','March','April','May','June','July','August','September','October','November','December'],
 rank:{S:'Solemnity',F:'Feast',M:'Obligatory memorial',m:'Optional memorial',C:'Commemoration','':''},
 cal:{R:'General Roman Calendar',E:'Proper calendar of Spain',M:'Roman Martyrology · no celebration in the Spanish calendar'},
 also:'Also today (calendar of Spain)',loc:'Local devotion',
 pat:'Patron of',patF:'Patronage',pray:'To pray in the app',prev:'Previous day',next:'Next day',fresco:'Fresco',paint:'Painting',rep:'Representative image',repNote:'Representative image: saints together in a fresco or painting; it is not a portrait of this particular saint.',pd:'Public domain',icon:'Drawing',
 leap:'leap years only',noRes:'No results.',res:n=>n+' result'+(n===1?'':'s'),
 mov:'Also today',credSum:'Credits and sources',
 note:'If it falls on a Sunday, in Holy Week or on a greater celebration, that day’s liturgy may change.',
 info:(d,k)=>`Test date: ${d}. Saint’s day: ${k}.`}};
const PR={es:{'oracion-3':'Oración a Santa Cecilia','oracion-4':'Oración a San Judas Tadeo','san-judas-tadeo-28':'San Judas Tadeo · Día 28','oracion-7':'Oración de Santa Gertrudis','oracion-8':'Por las almas del purgatorio','oracion-9':'Por los fieles difuntos','oracion-12':'Oración al Sagrado Corazón','oracion-13':'Alabanza al Sagrado Corazón','oracion-14':'Oración a San Pancracio','oracion-15':'Oración al Santo Ángel de la Guarda','oracion-16':'Ángel de mi guarda','oracion-17':'Oración a los ángeles','oracion-18':'Consagración a la Virgen María','oracion-19':'Oración a San José','oracion-20':'Oración a San José · Miércoles','oracion-22':'Oración a San Miguel Arcángel','angelus':'Ángelus','magnificat':'Magníficat','rosario-completo':'Santo Rosario','coronilla-misericordia':'Coronilla de la Divina Misericordia','salve':'Salve','letanias':'Letanías de la Virgen'},
en:{'oracion-3':'Prayer to Saint Cecilia','oracion-4':'Prayer to Saint Jude Thaddeus','san-judas-tadeo-28':'Saint Jude Thaddeus · The 28th','oracion-7':'Prayer of Saint Gertrude','oracion-8':'For the Souls in Purgatory','oracion-9':'For the Faithful Departed','oracion-12':'Prayer to the Sacred Heart','oracion-13':'Praise to the Sacred Heart','oracion-14':'Prayer to Saint Pancras','oracion-15':'Prayer to the Holy Guardian Angel','oracion-16':'Guardian Angel, Sweet Companion','oracion-17':'Prayer to the Angels','oracion-18':'Consecration to the Virgin Mary','oracion-19':'Prayer to Saint Joseph','oracion-20':'Prayer to Saint Joseph · Wednesday','oracion-22':'Prayer to Saint Michael the Archangel','angelus':'The Angelus','magnificat':'Magnificat','rosario-completo':'Complete Holy Rosary','coronilla-misericordia':'Chaplet of Divine Mercy','salve':'Hail, Holy Queen','letanias':'Litany of Loreto'}};

/* ---------- fiestas móviles (solo una nota) ---------- */
function easter(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;return new Date(y,mo-1,da,12)}
const addD=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const same=(a,b)=>a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
function movable(d){const y=d.getFullYear(),E=easter(y),L=[];
 const add=(dt,es,en)=>{if(same(dt,d))L.push([es,en])};
 add(addD(E,-46),'Miércoles de Ceniza','Ash Wednesday');add(addD(E,-7),'Domingo de Ramos','Palm Sunday');
 add(addD(E,-3),'Jueves Santo','Holy Thursday');add(addD(E,-2),'Viernes Santo','Good Friday');add(addD(E,-1),'Sábado Santo','Holy Saturday');
 add(E,'Domingo de Resurrección','Easter Sunday');add(addD(E,7),'Domingo de la Divina Misericordia','Divine Mercy Sunday');
 add(addD(E,42),'Ascensión del Señor (en España, en domingo)','Ascension of the Lord (Sunday in Spain)');
 add(addD(E,49),'Pentecostés','Pentecost');add(addD(E,50),'Santa María, Madre de la Iglesia','Mary, Mother of the Church');
 add(addD(E,53),'Jesucristo, Sumo y Eterno Sacerdote','Our Lord Jesus Christ, the Eternal High Priest');
 add(addD(E,56),'Santísima Trinidad','Holy Trinity');add(addD(E,63),'Corpus Christi (en España, en domingo)','Corpus Christi (Sunday in Spain)');
 add(addD(E,68),'Sagrado Corazón de Jesús','Sacred Heart of Jesus');add(addD(E,69),'Inmaculado Corazón de María','Immaculate Heart of Mary');
 const ck=new Date(y,10,26,12);ck.setDate(26-ck.getDay());add(ck,'Jesucristo, Rey del universo','Christ the King');
 const adv=addD(ck,7);add(adv,'Primer domingo de Adviento','First Sunday of Advent');
 let sf=null;for(let i=26;i<=31;i++){const x=new Date(y,11,i,12);if(x.getDay()===0){sf=x;break}}add(sf||new Date(y,11,30,12),'Sagrada Familia','The Holy Family');
 for(let i=7;i<=13;i++){const x=new Date(y,0,i,12);if(x.getDay()===0){add(x,'Bautismo del Señor','Baptism of the Lord');break}}
 return L}


/* ---------- precedencia en el año elegido (Normas universales del año litúrgico) ---------- */
const LORD=new Set(['02-02','08-06','09-14','11-09','01-06','12-25','03-25']);
const fmtD=d=>d.toLocaleDateString(st.lang==='en'?'en-GB':'es-ES',{day:'numeric',month:'long'});
function transfers(y){const E=easter(y),palm=addD(E,-7),dm=addD(E,7),ash=addD(E,-46),T={};
 const j=new Date(y,2,19,12);if(j>=palm&&j<=E)T['03-19']=addD(palm,-1);else if(j.getDay()===0)T['03-19']=addD(j,1);
 const a=new Date(y,2,25,12);if(a>=palm&&a<=dm)T['03-25']=addD(dm,1);else if(a.getDay()===0)T['03-25']=addD(a,1);
 return T}
function yearNote(k,y){const e=S[k];if(!e.r||e.c==='M')return '';const es=st.lang==='es';
 const [m,dd]=k.split('-').map(Number);if(k==='02-29'&&!(y%4===0&&(y%100!==0||y%400===0)))return '';
 const d=new Date(y,m-1,dd,12),E=easter(y),ash=addD(E,-46),palm=addD(E,-7),oct=addD(E,7),T=transfers(y);
 if(T[k])return es?`En ${y} se traslada al ${fmtD(T[k])}.`:`In ${y} it is moved to ${fmtD(T[k])}.`;
 if(e.r==='S')return '';
 const sun=d.getDay()===0,holy=d>=palm&&d<=oct,lent=d>=ash&&d<palm,adv17=m===12&&dd>=17&&dd<=24,xoct=m===12&&dd>=29;
 if(e.r==='F'){if(holy)return es?`En ${y} cae en Semana Santa u octava de Pascua: ese año no se celebra.`:`In ${y} it falls in Holy Week or the Easter octave: not celebrated that year.`;
  if(sun&&!LORD.has(k))return es?`En ${y} cae en domingo: prevalece el domingo.`:`In ${y} it falls on a Sunday: the Sunday takes precedence.`;return ''}
 if(sun||holy)return es?`En ${y} ${sun?'cae en domingo':'cae en Semana Santa u octava de Pascua'}: ese año no se celebra.`:`In ${y} it falls ${sun?'on a Sunday':'in Holy Week or the Easter octave'}: not celebrated that year.`;
 if(lent||adv17||xoct)return es?`En ${y} cae en ${lent?'Cuaresma':adv17?'las ferias mayores de Adviento':'la octava de Navidad'}: se hace solo conmemoración.`:`In ${y} it falls ${lent?'in Lent':adv17?'in the last days of Advent':'in the Christmas octave'}: only a commemoration.`;
 return ''}

/* ---------- biblioteca de atributos (dibujo de línea, 100×100) ---------- */
const P=(d,w)=>`<path d="${d}"${w?` stroke-width="${w}"`:''}/>`,C=(x,y,r,f)=>`<circle cx="${x}" cy="${y}" r="${r}"${f?' fill="currentColor" stroke="none"':''}/>`;
const ring=(cx,cy,r1,r2,n,o=0)=>{let s='';for(let i=0;i<n;i++){const a=(i/n+o)*2*Math.PI;s+=`M${(cx+r1*Math.cos(a)).toFixed(1)} ${(cy+r1*Math.sin(a)).toFixed(1)}L${(cx+r2*Math.cos(a)).toFixed(1)} ${(cy+r2*Math.sin(a)).toFixed(1)}`}return P(s)};
const starP=(cx,cy,R,r,n)=>{let s='';for(let i=0;i<2*n;i++){const a=-Math.PI/2+i*Math.PI/n,q=i%2?r:R;s+=(i?'L':'M')+(cx+q*Math.cos(a)).toFixed(1)+' '+(cy+q*Math.sin(a)).toFixed(1)}return P(s+'Z')};
const arrow=(x1,y1,x2,y2)=>{const a=Math.atan2(y2-y1,x2-x1),h=8,f=(t,d)=>[x2-h*Math.cos(a-t),y2-h*Math.sin(a-t)];const [ax,ay]=f(.5),[bx,by]=f(-.5);
 const g=(t)=>[x1+8*Math.cos(a+t),y1+8*Math.sin(a+t)];const [cx,cy]=g(2.6),[dx,dy]=g(-2.6);
 return P(`M${x1} ${y1}L${x2} ${y2}M${ax.toFixed(1)} ${ay.toFixed(1)}L${x2} ${y2}L${bx.toFixed(1)} ${by.toFixed(1)}M${x1} ${y1}L${cx.toFixed(1)} ${cy.toFixed(1)}M${x1} ${y1}L${dx.toFixed(1)} ${dy.toFixed(1)}`)};
let wheatS='';for(let y=26;y<=62;y+=10)wheatS+=`M50 ${y+8}C43 ${y+5} 41 ${y} 42 ${y-5}C47 ${y-2} 50 ${y+3} 50 ${y+8}M50 ${y+8}C57 ${y+5} 59 ${y} 58 ${y-5}C53 ${y-2} 50 ${y+3} 50 ${y+8}`;
let ladderS='M36 10L31 90M64 10L69 90';for(let y=20;y<=82;y+=12){const k=(y-10)/80;ladderS+=`M${(36-5*k).toFixed(1)} ${y}H${(64+5*k).toFixed(1)}`}
let organS='M18 80H82V90H18Z';[46,56,64,70,64,56,46].forEach((h,i)=>{const x=22+i*9;organS+=`M${x} 80V${80-h}A3.5 3.5 0 0 1 ${x+7} ${80-h}V80`});
let rosS='';for(let i=0;i<16;i++){const a=i/16*2*Math.PI-Math.PI/2;rosS+=C((50+22*Math.cos(a)).toFixed(1),(38+22*Math.sin(a)).toFixed(1),2.6,1)}
const SYM={
book:P('M50 30C40 24 26 24 16 28V74C26 70 40 70 50 76C60 70 74 70 84 74V28C74 24 60 24 50 30ZM50 30V76M24 38H42M24 46H42M24 54H40M58 38H76M58 46H76M60 54H76'),
palm:P('M44 92C48 70 52 42 64 10M47 78C38 74 30 74 22 76M47 78C52 70 58 66 66 64M49 66C40 60 33 58 25 60M49 66C55 58 61 54 70 52M52 54C44 47 38 44 30 45M52 54C58 46 64 42 73 40M55 42C49 35 43 32 36 32M55 42C61 34 66 30 74 28M59 30C55 24 50 21 44 20M59 30C64 24 68 21 74 18'),
mitre:P('M30 86V48C30 34 40 22 50 12C60 22 70 34 70 48V86ZM30 72H70M44 46H56M50 38V56M38 86L36 96M62 86L64 96'),
heart:P('M50 84C20 64 14 46 24 36C32 28 44 30 50 40C56 30 68 28 76 36C86 46 80 64 50 84ZM50 30C45 24 49 17 50 10C53 17 56 24 50 30ZM50 50V68M42 58H58'),
cross:P('M50 10V90M28 32H72',6),
tiara:P('M32 84H68M34 84C34 60 38 40 50 24C62 40 66 60 66 84M35 72H65M37 58H63M41 44H59M50 24V12M45 17H55'),
marian:P('M32 32L36 18L43 27L50 14L57 27L64 18L68 32Z')+'<text x="50" y="82" text-anchor="middle" font-family="Georgia,serif" font-size="52" fill="currentColor" stroke="none">M</text>',
crozier:P('M50 94V38C50 22 64 14 72 22C78 29 73 39 65 37C59 35 59 29 63 27M45 44H55M45 50H55'),
lily:P('M50 92V40M50 40C44 30 44 20 50 10C56 20 56 30 50 40M50 40C40 38 32 30 30 22C38 24 46 30 50 40M50 40C60 38 68 30 70 22C62 24 54 30 50 40M50 72C42 68 37 62 35 54M50 62C58 58 63 52 65 46'),
crown:P('M24 70L20 34L36 50L50 26L64 50L80 34L76 70ZM24 80H76M36 60H64')+C(20,32,3,1)+C(50,24,3,1)+C(80,32,3,1),
star:starP(50,48,36,15,8)+C(50,48,6),
rose:C(50,40,7)+C(50,22,10)+C(67,34,10)+C(61,54,10)+C(39,54,10)+C(33,34,10)+P('M50 64V92M50 80C58 76 62 72 64 66'),
monstrance:C(50,38,11)+C(50,38,17)+ring(50,38,21,34,16)+P('M50 55V80M44 64H56M36 90H64L58 80H42Z'),
wings:P('M48 62C38 40 26 30 10 28C16 44 22 56 34 64C40 66 44 65 48 62ZM52 62C62 40 74 30 90 28C84 44 78 56 66 64C60 66 56 65 52 62ZM20 38C26 44 32 50 38 58M80 38C74 44 68 50 62 58'),
chirho:'<text x="50" y="70" text-anchor="middle" font-family="Georgia,serif" font-size="34" letter-spacing="1" fill="currentColor" stroke="none">IHS</text>'+P('M50 14V36M43 22H57')+ring(50,52,36,40,24),
sword:P('M50 8L56 18V64H44V18ZM32 64H68M50 64V82')+C(50,88,6),
church:P('M14 88V54L38 36L62 54V88ZM62 88V32L72 20L82 32V88M72 20V6M67 11H77M32 88V72A6 6 0 0 1 44 72V88M14 88H82'),
arrows:arrow(18,84,80,22)+arrow(50,92,50,14)+arrow(82,84,20,22),
lamb:P('M28 62C22 62 20 54 26 50C26 42 36 40 40 44C44 38 56 38 58 44C64 40 72 46 68 52C74 56 70 64 64 64ZM34 64V78M44 64V78M56 64V78M64 64V78M68 50C72 44 80 44 82 50C83 56 78 58 74 56M30 50V16M30 16L48 21L30 28'),
candle:P('M42 40H58V86H42ZM34 86H66M50 34C44 27 48 19 50 12C52 19 56 27 50 34Z'),
dove:P('M18 52C32 42 42 44 50 50C56 36 66 22 86 18C78 30 72 42 66 50C74 52 80 56 86 62C72 64 60 62 50 58C42 64 32 66 24 62L14 66ZM70 56L64 66'),
staff:P('M44 94L58 8M52 24C60 25 64 28 62 34')+C(62,40,7),
tau:P('M22 22H78M50 22V90',9),
grill:P('M20 34H80V70H20ZM20 43H80M20 52H80M20 61H80M26 70V86M74 70V86M80 52H92'),
xcross:P('M22 16L78 88M78 16L22 88',8),
keys:'<g>'+P('M28 82L66 32M66 32L72 26M28 82L34 88M33 76L39 82')+C(76,22,8)+'</g><g transform="translate(100 0) scale(-1 1)">'+P('M28 82L66 32M66 32L72 26M28 82L34 88M33 76L39 82')+C(76,22,8)+'</g>',
rosary:rosS+P('M50 60V72M50 72V92M42 80H58'),
hammer:P('M26 18H70V34H26ZM48 34V92M70 26H80'),
harp:P('M30 90V18C48 18 72 40 78 72L30 90M38 87V22M46 84V25M54 81V31M62 78V40M70 75V54'),
jar:P('M38 36H62M40 36C30 46 30 74 40 86H60C70 74 70 46 60 36M44 36V28H56V36M42 22H58C58 15 42 15 42 22M36 56H64'),
lamp:P('M14 62C26 74 62 74 76 62C70 52 40 50 14 62ZM76 62L88 54M42 52C42 44 56 44 56 52M30 74H62M88 50C84 44 88 38 90 32C93 38 95 45 88 50Z'),
beehive:P('M24 82C24 46 37 24 50 24C63 24 76 46 76 82ZM26 70H74M29 58H71M35 46H65M42 35H58M45 82V75A5 5 0 0 1 55 75V82'),
skull:P('M30 54C30 32 70 32 70 54C70 64 64 66 62 72H38C36 66 30 64 30 54ZM42 72V80M50 72V80M58 72V80M38 80H62M50 10V28M43 16H57')+C(41,53,5)+C(59,53,5),
flame:P('M50 90C30 82 24 62 36 44C38 54 44 58 46 58C44 42 50 28 60 12C60 30 76 40 76 60C76 78 64 88 50 90ZM50 82C42 78 40 68 46 60C48 66 52 66 54 64C58 70 58 78 50 82Z'),
shamrock:C(50,32,12)+C(35,51,12)+C(65,51,12)+P('M50 58C50 72 46 82 38 92'),
ladder:P(ladderS),
ship:P('M14 62H86L74 80H26ZM50 62V12M50 16L76 56H50M50 20L28 56H50M50 12L60 16L50 20'),
axe:P('M34 90L62 20M56 28C64 16 80 18 86 32C76 38 66 40 60 36ZM62 20L56 34'),
wheat:P('M50 92V18'+wheatS+'M50 18L48 8M50 18L52 8'),
spear:P('M50 92V32M50 8L57 26L50 34L43 26ZM44 40H56'),
shell:P('M50 84L20 46C22 22 78 22 80 46ZM50 84L30 30M50 84L40 25M50 84L50 24M50 84L60 25M50 84L70 30M50 84L24 38M50 84L76 38M42 84H58L55 92H45Z'),
knife:P('M30 76L72 20C80 30 72 44 60 54L42 72M30 76L22 86M34 70L40 76'),
pillar:P('M34 18H66V26H34ZM40 26V78M60 26V78M47 28V76M53 28V76M32 78H68V86H32ZM28 86H72V92H28Z')+C(50,10,5),
quill:P('M26 90C40 62 60 36 86 12C82 34 68 54 46 66M36 70L26 90M50 58C58 50 66 40 72 30'),
medal:'<ellipse cx="50" cy="56" rx="25" ry="32"/>'+C(50,50,15)+C(50,50,8)+P('M50 35V42M35 50H42M58 50H65M33 86C35 72 65 72 67 86M50 21C45 14 49 8 50 2C53 8 56 14 50 21Z'),
broom:P('M70 8L44 64M44 64L22 90H52L50 66ZM30 88L44 66M40 89L47 67'),
cloak:P('M24 22C40 30 60 30 76 22L86 86C66 80 34 80 14 86ZM50 30V82M42 34L36 80M58 34L64 80'),
organ:P(organS),
anchor:P('M50 22V86M36 34H64M20 60C22 77 36 88 50 88C64 88 78 77 80 60M20 60L14 67M20 60L27 66M80 60L73 66M80 60L86 67')+C(50,15,7),
wheel:C(50,50,30)+C(50,50,6)+ring(50,50,6,30,8)+ring(50,50,30,38,12,.04),
gift:C(34,38,11)+C(66,38,11)+C(50,60,11)+P('M22 80H78V90H22Z'),
chains:'<g fill="none">'+[[30,26],[42,40],[54,54],[66,68]].map(([x,y],i)=>`<ellipse cx="${x}" cy="${y}" rx="${i%2?6:11}" ry="${i%2?11:6}" transform="rotate(45 ${x} ${y})"/>`).join('')+'</g>'+P('M74 76L84 88M70 82L76 90'),
stones:C(34,72,11)+C(60,74,13)+C(48,52,9)+C(70,50,8)+C(28,50,7)+P('M50 8V30M40 16C46 20 54 20 60 16'),
shield:P('M26 16H74V46C74 70 62 82 50 92C38 82 26 70 26 46ZM50 20V86M30 44H70',4),
wingbook:P('M50 40C40 22 26 16 12 18C18 30 28 38 42 42M50 40C60 22 74 16 88 18C82 30 72 38 58 42M30 48H70V90H30ZM36 48V90M50 58V80M42 66H58'),
};
SYM.eagle=SYM.wingbook;SYM.ox=SYM.book;
const PAL={az:['#2c5577','#517ea0'],ro:['#7e3426','#a75740'],oc:['#94672f','#c09457'],sa:['#55613f','#7f8b5f']};
function defs(){let s=`<defs><filter id="stTex" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 .96  0 0 0 0 .9  0 0 0 0 .78  0 0 0 .55 -.08"/></filter>
<radialGradient id="stHalo" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#f4dc98" stop-opacity=".55"/><stop offset=".75" stop-color="#d4af5a" stop-opacity=".28"/><stop offset="1" stop-color="#b8913e" stop-opacity=".5"/></radialGradient>
<radialGradient id="stLight" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="#fff6df" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></radialGradient>`;
 for(const k in PAL)s+=`<linearGradient id="stG-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${PAL[k][1]}"/><stop offset="1" stop-color="${PAL[k][0]}"/></linearGradient>`;
 for(const k in SYM)s+=`<symbol id="at-${k}" viewBox="0 0 100 100"><g fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">${SYM[k]}</g></symbol>`;
 $('stDefs').innerHTML=s+'</defs>'}
const PREF=/^(nuestra señora (de la |del |de los |de )?|santa maría virgen,? |santa maría,? |santos |santas |santo |santa |san |our lady (of the |of )?|saints |saint |the most holy |the holy |the |mary,? )/i;
function initial(n){let s=n.replace(PREF,'');s=s.replace(PREF,'');return (s.trim()[0]||n[0]).toUpperCase()}
function iconSVG(k,small){const e=S[k],n=e.n[st.lang==='en'?1:0];
 return `<svg class="stIcon" viewBox="${small?'64 66 272 340':'0 0 400 500'}" role="img" aria-label="${n.replace(/"/g,'')}" preserveAspectRatio="xMidYMid slice">
<rect width="400" height="500" fill="url(#stG-${e.pl})"/><rect width="400" height="500" fill="url(#stLight)"/>${small?'':'<rect width="400" height="500" filter="url(#stTex)" opacity=".5"/>'}
<circle cx="200" cy="214" r="132" fill="url(#stHalo)" stroke="#d9b45e" stroke-width="6"/>
<circle cx="200" cy="214" r="121" fill="none" stroke="#f3dfa6" stroke-width="2" stroke-dasharray="1.5 9" stroke-linecap="round" opacity=".9"/>
<use href="#at-${SYM[e.a]?e.a:'cross'}" x="108" y="122" width="184" height="184" style="color:#fbf3dc"/>
${small?'':`<path d="M92 404H170M230 404H308" stroke="#d9b45e" stroke-width="2.5"/><path d="M200 392l7 12-7 12-7-12z" fill="#d9b45e"/>
<text x="200" y="476" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="58" fill="#f3e3b8" opacity=".95">${initial(n)}</text>`}
</svg>`}
function kindL(k){const f=F[k];return !f?'':f.k==='g'?L().rep:f.k==='p'?L().paint:L().fresco}
function credTx(f){const w=f.w[ix()];return `${f.t[ix()]} · ${f.ar}${f.dt?', '+f.dt:''}${w?' · '+w:''}`}
function art(k,small){const e=S[k];if(e.f){const f=F[k];return `<img src="santoral/img/${f&&f.img?f.img:k}.webp" alt="${(f?f.t[st.lang==='en'?1:0]:'').replace(/"/g,'')}" loading="lazy" decoding="async">`}return iconSVG(k,small)}


/* ---------- app ---------- */
const AN=!!window.Android;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* En el APK los enlaces externos van como texto (no hay navegador dentro de la app). */
const unlink=h=>AN?h.replace(/<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g,(m,u,t)=>`${t} <span class="stUrl">(${esc(u.replace(/^https?:\/\//,''))})</span>`):h;
const X={es:{home:'Inicio',menu:'Santoral',pray:'Rezar'},en:{home:'Home',menu:'Saints',pray:'Pray'}};
const L=()=>T[st.lang],ix=()=>st.lang==='en'?1:0;
function today(){const d=new Date();d.setHours(12,0,0,0);return d}
function dayLabel(k){const [m,d]=k.split('-').map(Number);return st.lang==='en'?`${L().months[m-1]} ${d}`:`${d} de ${L().months[m-1]}`}
function rankLine(e){const r=L().rank[e.r];return [r,L().cal[e.c]].filter(Boolean).join(' · ')}
function patron(e){return e.p?`<p class="stPat"><b>${L().patF}:</b> ${e.p[ix()]}</p>`:''}
function others(e){return e.o?`<div class="stAlso"><span>${L().also}</span><ul>${e.o.map(o=>`<li>${o[ix()+2]} <small>· ${L().rank[o[0]]}${o[1]==='E'?(st.lang==='en'?' (Spain)':' (España)'):''}</small></li>`).join('')}</ul></div>`:''}
/* Oraciones enlazadas: se abren en la app (solo las que existen en esta instalación). */
const PID={angelus:'__angelus'};
function prOk(p){try{return !!(window.MO&&MO.resolve&&MO.resolve(PID[p]||p))}catch(e){return false}}
function prayers(e){const ps=(e.pr||[]).filter(prOk);return ps.length?`<div class="stPray"><span>${L().pray}</span>${ps.map(p=>`<button type="button" class="stChip" data-pr="${p}">✠ ${PR[st.lang][p]||p}</button>`).join('')}</div>`:''}
function openPr(p){leave(true);try{MO.openPrayer(PID[p]||p)}catch(e){}}
function tile(){const t=$('stTile');if(!t)return;st.date=today();const k=key(st.date),e=S[k];if(!e)return;const mv=movable(st.date);const TR=transfers(st.date.getFullYear());for(const x in TR)if(same(TR[x],st.date))mv.unshift([S[x].n[0]+' (celebración trasladada)',S[x].n[1]+' (transferred celebration)']);
 t.innerHTML=`<span class="stFr stFrS">${art(k,false)}</span><span class="stTileTx"><small class="stKick">${L().today} · ${dayLabel(k)}</small><strong>${e.n[ix()]}</strong><small class="stRank">${rankLine(e)}</small>${mv.length?`<small class="stMov">✦ ${L().mov}: ${mv.map(x=>x[ix()]).join(' · ')}</small>`:''}<span class="stGo">${L().see} ›</span></span>`;
 t.setAttribute('aria-label',L().today+': '+e.n[ix()]);t.dataset.k=k}
function view(){const k=st.sel,e=S[k],f=e.f&&F[k],yn=yearNote(k,st.date.getFullYear());
 const credit=f?(AN?`<span class="stCredit">${credTx(f)} · ${L().pd}</span>`:`<a class="stCredit" href="${f.url}" target="_blank" rel="noopener">${credTx(f)} · ${L().pd}</a>`)+(f.k==='g'?`<span class="stRep">${L().repNote}</span>`:''):`<span class="stCredit">${L().icon} · ${st.lang==='en'?'Mis Oraciones, generated':'Mis Oraciones, generado'}</span>`;
 $('stView').innerHTML=`<div class="stHero"><span class="stFr stFrL">${art(k,false)}</span>${credit}</div>
<p class="stDate">${dayLabel(k)}${k==='02-29'?` · <i>${L().leap}</i>`:''}</p><h2 class="stName">${e.n[ix()]}</h2><p class="stRank">${rankLine(e)}</p>
<p class="stBio">${e.b[ix()]}</p>${patron(e)}${others(e)}${e.loc?`<p class="stLoc"><b>${L().loc}:</b> ${e.loc[ix()]}</p>`:''}${prayers(e)}${yn?`<p class="stYear">✦ ${yn}</p>`:''}
<div class="stNav"><button type="button" class="secondary" id="stVPrev">‹ ${L().prev}</button><button type="button" class="secondary" id="stVNext">${L().next} ›</button></div>`;
 const ks=Object.keys(S).sort(),i=ks.indexOf(k);
 $('stVPrev').onclick=()=>select(ks[(i+365)%366]);$('stVNext').onclick=()=>select(ks[(i+1)%366]);
 $('stView').querySelectorAll('button[data-pr]').forEach(b=>b.onclick=()=>openPr(b.dataset.pr))}
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function row(k){const e=S[k],[m,d]=k.split('-');const td=k===key(st.date);
 return `<li><button type="button" data-k="${k}" class="${k===st.sel?'sel':''}${td?' today':''}"><span class="stDay">${st.q?dayLabel(k):+d}</span><span class="stFr stFrXS">${art(k,true)}</span><span class="stRowTx"><b>${e.n[ix()]}</b><small>${rankLine(e)}${e.o?' · +'+e.o.length:''}${e.f?' · '+kindL(k):''}</small></span></button></li>`}
function list(){const q=norm(st.q.trim());let ks=Object.keys(S).sort();
 $('stMonthBar').hidden=!!q;
 if(q){ks=ks.filter(k=>{const e=S[k];return norm(e.n.join(' ')+' '+(e.p?e.p.join(' '):'')+' '+(e.o?e.o.map(o=>o[2]+' '+o[3]).join(' '):'')).includes(q)});$('stList').innerHTML=(ks.length?`<li class="stRes">${L().res(ks.length)}</li>`:`<li class="stRes">${L().noRes}</li>`)+ks.slice(0,60).map(row).join('')}
 else{$('stMName').textContent=L().months[st.month-1].replace(/^./,c=>c.toUpperCase());ks=ks.filter(k=>+k.slice(0,2)===st.month);$('stList').innerHTML=ks.map(row).join('')}
 $('stList').querySelectorAll('button[data-k]').forEach(b=>b.onclick=()=>select(b.dataset.k,true))}
function select(k,scroll){st.sel=k;st.month=+k.slice(0,2);view();list();if(scroll)scrollTo({top:0,behavior:'smooth'})}
function credits(){const es=st.lang==='es';const ks=Object.keys(F).sort();
 const fr={fresco:ks.filter(k=>F[k].k==='f'),paint:ks.filter(k=>F[k].k==='p'),group:ks.filter(k=>F[k].k==='g')};
 const li=k=>{const f=F[k];return `<li><b>${dayLabel(k)}</b> · ${credTx(f)}. <a href="${f.url}" target="_blank" rel="noopener">${f.file}</a> · ${es?'Dominio público':'Public domain'}</li>`};
 const gm={};fr.group.forEach(k=>{(gm[F[k].file]=gm[F[k].file]||{f:F[k],days:[]}).days.push(k)});const grp=Object.values(gm);
 return unlink(`<h3>${es?'Calendario':'Calendar'}</h3><ul>
<li>${es?'Todas las solemnidades, fiestas y memorias (obligatorias y libres) siguen el calendario litúrgico vigente en España, con sus fechas propias:':'All solemnities, feasts and memorials (obligatory and optional) follow the liturgical calendar in force in Spain, with its own dates:'} <a href="https://www.conferenciaepiscopal.es/wp-content/uploads/2026/01/Calendario-Liturgico-CEE-2026.pdf" target="_blank" rel="noopener">${es?'Conferencia Episcopal Española, Calendario Litúrgico-Pastoral 2025-2026':'Spanish Bishops’ Conference, Liturgical-Pastoral Calendar 2025-2026'}</a> ${es?'(elaborado según el <i>Calendarium Romanum</i> y el Calendario propio de España), contrastado año a año con':'(prepared according to the <i>Calendarium Romanum</i> and the Proper Calendar of Spain), checked year by year against'} <a href="https://gcatholic.org/calendar/2026/ES-es" target="_blank" rel="noopener">GCatholic · ${es?'calendario de España':'calendar of Spain'} 2025-2028</a>.</li>
<li>${es?'Rangos y precedencias: <i>Missale Romanum</i> (editio typica tertia) y Misal Romano en español (3.ª ed., CEE), con las Normas universales sobre el año litúrgico y el calendario. La ficha avisa cuando, en el año elegido, la celebración cae en domingo, Cuaresma o Semana Santa, o se traslada (San José, la Anunciación).':'Ranks and precedence: <i>Missale Romanum</i> (editio typica tertia) and the Spanish Roman Missal (3rd ed., CEE), with the Universal Norms on the Liturgical Year and the Calendar. The page warns when, in the chosen year, a celebration falls on a Sunday, in Lent or Holy Week, or is transferred (Saint Joseph, the Annunciation).'}</li>
<li>${es?'Solo los días sin ninguna celebración en el calendario de España llevan un santo del <i>Martyrologium Romanum</i> (ed. 2004), marcado como tal y comprobado con las páginas de cada día de':'Only days with no celebration at all in the Spanish calendar carry a saint from the <i>Martyrologium Romanum</i> (2004 ed.), marked as such and checked against each day’s page on'} <a href="https://es.wikipedia.org/wiki/1_de_enero" target="_blank" rel="noopener">Wikipedia</a>.</li>
<li>${es?'Las devociones locales (San Fermín en Navarra, la Medalla Milagrosa, la Virgen de la Esperanza) aparecen solo como nota, no como celebración del calendario.':'Local devotions (Saint Fermin in Navarre, the Miraculous Medal, Our Lady of Hope) appear only as a note, not as a calendar celebration.'}</li>
<li>${es?'Las fiestas móviles (Pascua, Pentecostés, Corpus…) se calculan cada año y se indican como nota.':'Movable feasts (Easter, Pentecost, Corpus Christi…) are computed each year and shown as a note.'}</li>
<li>${es?'Las biografías son textos breves redactados para esta app a partir de datos históricos comunes; no son citas de ninguna obra. Las oraciones enlazadas son las que ya tiene la app, con sus propias fuentes.':'The biographies are short texts written for this app from common historical facts; they are not quotations from any work. The linked prayers are the app’s own, with their own sources.'}</li></ul>
<h3>${es?'Frescos':'Frescoes'} (${fr.fresco.length}) · ${es?'dominio público, vía Wikimedia Commons':'public domain, via Wikimedia Commons'}</h3><ul class="stCredList">${fr.fresco.map(li).join('')}</ul>
<h3>${es?'Pinturas':'Paintings'} (${fr.paint.length}) · ${es?'dominio público, vía Wikimedia Commons':'public domain, via Wikimedia Commons'}</h3><ul class="stCredList">${fr.paint.map(li).join('')}</ul>
<h3>${es?'Imágenes representativas':'Representative images'} (${fr.group.length} ${es?'días':'days'}) · ${es?'dominio público, vía Wikimedia Commons':'public domain, via Wikimedia Commons'}</h3>
<p class="stCredNote">${es?'Cuando no hay una imagen antigua de ese santo en concreto, se muestra un detalle de santos juntos en un fresco o una pintura. Es una imagen representativa, no un retrato:':'When there is no old image of that particular saint, a detail of saints together in a fresco or painting is shown. It is a representative image, not a portrait:'}</p>
<ul class="stCredList">${grp.map(g=>`<li>${credTx(g.f)}. <a href="${g.f.url}" target="_blank" rel="noopener">${g.f.file}</a> · ${es?'Dominio público':'Public domain'}<br><small>${es?'Se usa en':'Used on'}: ${g.days.map(dayLabel).join(' · ')}</small></li>`).join('')}</ul>
<h3>${es?'Dibujos':'Drawings'} (${366-Object.keys(F).length})</h3><ul><li>${es?'Medallones generados para esta app (SVG): fondo en tonos de fresco, nimbo dorado y el atributo tradicional del santo. Sin imágenes de terceros. Solo se usan donde no hay una imagen adecuada.':'Medallions generated for this app (SVG): fresco-toned background, golden halo and the saint’s traditional attribute. No third-party images. Used only where no suitable image exists.'}</li></ul>`)}

/* ---------- vista a pantalla completa (como la Biblia) ---------- */
const v=document.createElement('main');v.id='santoralView';v.hidden=true;v.dataset.noi18n='1';
v.innerHTML=`<div class="stTop"><button type="button" class="stBack" id="stBack">‹  ${X[st.lang].home}</button><strong class="stTopT">${L().calH}</strong></div>
<section class="stView" id="stView" aria-live="polite"></section>
<section class="stCal" id="stCal"><h2 class="stH">${L().calH}</h2><div class="stSearch"><input type="search" id="stQ" autocomplete="off" placeholder="${esc(L().q)}" aria-label="${esc(L().q)}"></div>
<div class="stMonth" id="stMonthBar"><button type="button" id="stMPrev" aria-label="‹">‹</button><strong id="stMName"></strong><button type="button" id="stMNext" aria-label="›">›</button></div>
<ol class="stList" id="stList"></ol></section>
<details class="stNotes" id="stCredits"><summary>${L().credSum}</summary><div id="stCredBody"></div></details>`;
const player=$('player');document.body.insertBefore(v,player||null);
const dfs=document.createElementNS('http://www.w3.org/2000/svg','svg');dfs.id='stDefs';dfs.setAttribute('width','0');dfs.setAttribute('height','0');dfs.setAttribute('aria-hidden','true');dfs.style.cssText='position:absolute;width:0;height:0;overflow:hidden';document.body.append(dfs);
defs();
const others_=['home','reader','timerView','bibliaView','palabraView'];
let hid=[];
function enter(){if(!v.hidden)return;hid=[];others_.forEach(id=>{const e=$(id);if(e&&!e.hidden){e.hidden=true;hid.push(id)}});if(player){player.hidden=true}document.body.classList.remove('hasPlayer');v.hidden=false;document.body.classList.add('santoralOn')}
function playerBack(){try{if(typeof state!=='undefined'&&(state.playing||state.paused)&&player){player.hidden=false;document.body.classList.add('hasPlayer')}}catch(e){}}
function leave(toPrayer){if(v.hidden)return;v.hidden=true;document.body.classList.remove('santoralOn');
 if(!toPrayer){const back=hid.filter(id=>id!=='home');if(back.length)back.forEach(id=>{const e=$(id);if(e)e.hidden=false});else{const h=$('home');if(h)h.hidden=false}playerBack();tile();scrollTo(0,0)}}
function open(k){st.date=today();st.q='';$('stQ').value='';select(k||key(st.date));if(!$('stCredBody').innerHTML)$('stCredBody').innerHTML=credits();enter();scrollTo(0,0)}
$('stBack').onclick=()=>leave();
$('stMPrev').onclick=()=>{st.month=st.month===1?12:st.month-1;list()};$('stMNext').onclick=()=>{st.month=st.month===12?1:st.month+1;list()};
$('stQ').oninput=e=>{st.q=e.target.value;list()};
$('stCredits').ontoggle=()=>{if(!$('stCredBody').innerHTML)$('stCredBody').innerHTML=credits()};

/* ---------- tarjeta «Santo del día»: debajo del panel de arriba, sin entrar en él ---------- */
const tc=$('todayCards');
if(tc){const w=document.createElement('div');w.className='tiles stTiles';w.dataset.noi18n='1';
 w.innerHTML='<article class="tile stTile" id="stTile" tabindex="0" role="button"></article>';
 const bc=$('bibliaCard');if(bc&&bc.parentNode)bc.after(w);else tc.append(w);
 const t=$('stTile');t.onclick=()=>open(t.dataset.k);t.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();open(t.dataset.k)}};
 tile();
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)tile()})}

/* ---------- menú ☰ ---------- */
(function menu(){const ul=document.querySelector('#drawer ul');if(!ul)return;
 const li=document.createElement('li'),b=document.createElement('button');b.type='button';b.dataset.noi18n='1';b.id='stMenu';
 b.innerHTML='<span class="dIcon" aria-hidden="true">✧</span><span></span>';b.lastChild.textContent=X[st.lang].menu;
 b.onclick=()=>{try{$('drawer').classList.remove('open');$('drawer').setAttribute('aria-hidden','true');$('drawerShade').hidden=true;$('menuButton')&&$('menuButton').setAttribute('aria-expanded','false')}catch(e){}open()};
 li.append(b);const ref=[...ul.querySelectorAll('li button')].find(x=>/¿Qué tiene Dios|What does God have/.test(x.textContent));
 if(ref)ref.closest('li').after(li);else ul.append(li)})();

/* ---------- atrás (Android) ---------- */
const baseHome=window.goHome;
if(typeof baseHome==='function')window.goHome=function(){if(!v.hidden)return leave();return baseHome.apply(this,arguments)};
/* abrir otra pantalla desde fuera cierra el santoral */
try{new MutationObserver(()=>{if(!v.hidden&&others_.some(id=>{const e=$(id);return e&&!e.hidden}))leave(true)}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['hidden']})}catch(e){}

/* ---------- Ajustes › Créditos ---------- */
const cr=document.querySelector('.v8credits');
if(cr&&!$('stAppCredits')){const d=document.createElement('div');d.className='raCredits stNotes stAppCredits';d.id='stAppCredits';d.dataset.noi18n='1';
 d.innerHTML=`<h4>${st.lang==='en'?'Saints (calendar of Spain)':'Santoral (calendario de España)'}</h4>`+credits();cr.append(d)}

window.MO=Object.assign(window.MO||{},{openSantoral:open});
})();
