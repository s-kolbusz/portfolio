// GLSL sources of the liquid hero, copied verbatim from cook/ciecz-czastki/index.html
// (the accepted test page). Comments inside the shaders are the original Polish notes.

// Full-screen triangle.
export const VERTEX = `#version 300 es
in vec2 aPos; void main(){ gl_Position = vec4(aPos,0.,1.); }`

// Particles splatted into the density field (half resolution).
export const SPLAT_VERTEX = `#version 300 es
in vec2 aP; uniform float uA, uSize;
void main(){ gl_Position = vec4(aP.x/uA*2.-1., aP.y*2.-1., 0., 1.); gl_PointSize = uSize; }`

export const SPLAT_FRAGMENT = `#version 300 es
precision highp float; uniform float uNorm; uniform vec2 uMask; out vec4 o;
void main(){ vec2 c = gl_PointCoord*2.-1.; float r2 = dot(c,c); if (r2>1.) discard; float w = 1.-r2; w = w*w*w*uNorm; o = vec4(w*uMask.x, w*uMask.y, 0., 1.); }`

// The page behind the liquid, the liquid, the water sheet and the loader board.
export const MAIN_FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D uStatic, uLines, uTer, uDens, uDome, uDist, uHgt;
uniform vec2 uHgtSize;
uniform float uDH;
uniform vec2 uRes, uTerSize, uTerOff;
uniform float uTerSc, uDpr, uTime, uMorph;
uniform vec4 uFade;
uniform vec3 uInk;   // zdania: ile tuszu ma każde (0.28…1)
uniform vec3 uWave;  // zdania: fala w chwili zdarzenia
uniform float uNameOn; // imię na stronie: 0, dopóki pokazuje je loader (inicjały), potem 1
uniform float uBoardT;  // plansza ładowania: <0 pełna, potem sekundy chudnięcia do poziomic, >3 nie ma jej
uniform vec2 uHRange;   // wysokości terenu w kadrze (najniższa, najwyższa): plansza schodzi od dolin w górę
uniform vec2 uDomeSize;
uniform float uBlockRight;
// przejście do stronypodhale: ciecz rozlewa się w taflę, ciemnieje do koloru strony, spod tafli wyłania się zrzut
uniform float uSpread, uDark, uImageIn, uClarity;
uniform vec3 uDarkCol;
uniform vec4 uImgRect;   // x, y (dół), szerokość, wysokość w jednostkach q
uniform float uImgR;
uniform sampler2D uImg;
out vec4 o;

const vec3 BG = vec3(0.984,0.976,0.957);
const vec3 INK = vec3(0.169,0.149,0.125);
const vec3 TINT = vec3(0.03,0.575,0.363);
const float ISO = 0.38;

vec2 suv(vec2 q){ return vec2(q.x*uRes.y/uRes.x, q.y); }

// strona za cieczą: tło, poziomice prawdziwego terenu, cały tekst
vec3 page(vec2 q){
  vec2 px = vec2(q.x, 1.-q.y)*uRes.y;
  // poziomice lekko płyną: wolne, szerokie odkształcenie mapy zależne od scrolla
  px += vec2(sin(px.y/uRes.y*3.1 + uMorph*1.3 + uTime*0.05), cos(px.x/uRes.y*2.7 - uMorph*1.1 + uTime*0.04))*uRes.y*0.014;
  float h = texture(uTer, ((px + uTerOff)/uTerSc)/uTerSize).r;
  float v = h/50.;
  float dist = abs(fract(v+0.5)-0.5)/max(fwidth(v), 1e-5);
  bool major = mod(floor(v+0.5), 5.) < 0.5;
  float line = clamp(1. - dist/(0.8*uDpr), 0., 1.) * (major ? 0.15 : 0.065);
  vec2 fd = max(max(uFade.xy - q, q - uFade.zw), 0.);
  line *= mix(smoothstep(0.0, 0.05, length(fd)), 1., uDark);
  // pod ciemniejącą taflą hero tonie (tekst gaśnie szybciej niż woda ciemnieje),
  // a poziomice z ciemnych robią się jaśniejsze od wody: wytłoczone w zieleni
  float sink = 1. - smoothstep(0., 0.7, uDark);
  vec3 lineCol = mix(INK, BG*3.2, smoothstep(0.35, 0.95, uDark));
  vec3 col = mix(BG, lineCol, line*(1. + 0.6*uDark));
  // stały tekst (R) i imię (G bez R), imię dopiero po przekazaniu z loadera
  vec4 st = texture(uStatic, suv(q));
  col = mix(col, INK, clamp(st.r + max(st.g - st.r, 0.)*uNameOn, 0., 1.)*sink);
  const vec2 iw = vec2(0.); const float ia = 1.;
  // zdania: każde z falą, która przechodzi przez nie w chwili zdarzenia
  vec2 w0 = vec2(sin(q.y*260.+uTime*18.)*0.004*uWave.x, 0.);
  vec2 w1 = vec2(sin(q.y*260.+uTime*18.)*0.004*uWave.y, 0.);
  vec2 w2 = vec2(sin(q.y*260.+uTime*18.)*0.004*uWave.z, 0.);
  float a = (texture(uLines, suv(q+w0+iw)).r*uInk.x + texture(uLines, suv(q+w1+iw)).g*uInk.y + texture(uLines, suv(q+w2+iw)).b*uInk.z)*ia;
  return mix(col, INK, a*sink);
}
float dens(vec2 q){ return texture(uDens, suv(q)).r; }
float boxD(vec2 q);
// to, co leży pod powierzchnią tafli: ciemna woda z wytłoczonymi poziomicami, a w kadrze zrzut (mętny, aż się sklaruje)
vec3 sheetBase(vec2 q){
  vec3 c = page(q)*(uDarkCol/BG);
  if (uImageIn > 0.) {
    vec2 iuv = clamp((q - uImgRect.xy)/uImgRect.zw, 0., 1.);
    float soft = mix(0.0015, 0.06, (1. - uClarity)*(1. - uClarity));
    float inBox = smoothstep(soft, -soft, boxD(q))*uImageIn;
    c = mix(c, mix(texture(uImg, iuv).rgb, c, (1. - uClarity)*0.7), inBox);
  }
  return c;
}
float boxD(vec2 q){ vec2 h = uImgRect.zw*0.5, d = abs(q - uImgRect.xy - h) - h + uImgR; return length(max(d,0.)) + min(max(d.x,d.y),0.) - uImgR; }
// plansza ładowania: ciemne tło chudnie do linii poziomic, najpierw w dolinach, na końcu na grzbietach;
// grube poziomice (co 250 m) zostają ciemne najdłużej. Te same poziomice co na stronie (to samo odkształcenie).
float boardMask(vec2 q){
  if (uBoardT > 3.) return 0.;
  vec2 px = vec2(q.x, 1.-q.y)*uRes.y;
  px += vec2(sin(px.y/uRes.y*3.1 + uMorph*1.3 + uTime*0.05), cos(px.x/uRes.y*2.7 - uMorph*1.1 + uTime*0.04))*uRes.y*0.014;
  float h = texture(uTer, ((px + uTerOff)/uTerSc)/uTerSize).r;
  float v = h/50.;
  float hn = clamp((h - uHRange.x)/max(uHRange.y - uHRange.x, 1.), 0., 1.);
  float p = clamp((uBoardT - hn*1.1)/1.4, 0., 1.); p = p*p*p*(p*(p*6.-15.)+10.);
  bool major = mod(floor(v+0.5), 5.) < 0.5;
  float k = (major ? 0.75 : 0.56)*(1. - p);
  float a = abs(fract(v+0.5)-0.5), aa = fwidth(v)*1.2;
  return (1. - smoothstep(k - aa, k + aa, a))*(1. - smoothstep(0.7, 1., p));
}
// wysokość: brzeg z gęstości (stromy) + kopuła z szerokiego rozmycia (wypukłość całej kropli)
// wysokość tylko z gładkich, szerokich pól: brzeg (miękki próg), średnia kopuła (krople), szeroka kopuła (ciało)
// i kilka łagodnych fal: na całym ciele mieści się ich kilkanaście, nie setki
// szum wartości: nieregularne fale zamiast trzech równych sinusów
float hsh(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);
  return mix(mix(hsh(i), hsh(i+vec2(1,0)), u.x), mix(hsh(i+vec2(0,1)), hsh(i+vec2(1,1)), u.x), u.y); }
float waveField(vec2 q, float t){
  vec2 w = vec2(vnoise(q*3.1 + vec2(t*0.11, -t*0.07)), vnoise(q*3.1 + vec2(5.2 - t*0.09, 1.3 + t*0.1))) - 0.5;
  vec2 p = q*9. + w*2.2;                                   // zawinięcie przestrzeni: fale się wyginają i zmieniają szerokość
  float n = vnoise(p + vec2(t*0.35, -t*0.22))*0.65 + vnoise(p*1.9 - vec2(t*0.28, t*0.31))*0.35;
  float amp = 0.5 + 0.5*vnoise(q*2.3 - vec2(t*0.05));       // w jednych miejscach falują mocniej, w innych prawie wcale
  return (n - 0.5)*amp;
}
// próbkowanie dwusześcienne (4 odczyty): gładkie pochodne, bez „siatki” z interpolacji liniowej
vec4 bicubic(sampler2D t, vec2 uv, vec2 size){
  uv = uv*size - 0.5; vec2 f = fract(uv); uv -= f;
  vec2 f2 = f*f, f3 = f2*f;
  vec2 w0 = (1.-f)*(1.-f)*(1.-f)/6., w1 = (4.-6.*f2+3.*f3)/6., w2 = (1.+3.*f+3.*f2-3.*f3)/6., w3 = f3/6.;
  vec2 s0 = w0+w1, s1 = w2+w3;
  vec2 c0 = (uv - 0.5 + w1/s0)/size, c1 = (uv + 1.5 + w3/s1)/size;
  return (texture(t, vec2(c0.x,c0.y))*s0.x + texture(t, vec2(c1.x,c0.y))*s1.x)*s0.y + (texture(t, vec2(c0.x,c1.y))*s0.x + texture(t, vec2(c1.x,c1.y))*s1.x)*s1.y;
}
// wysokość tylko z gładkich pól (bez osobnego brzegu, który robił „pączka”) + kilka łagodnych fal
// wysokość czytana z tekstury liczonej raz na klatkę (przebieg hgtPass) — wcześniej liczona 5× na piksel, za drogo na iPadzie
float hgt(vec2 q){ return bicubic(uHgt, suv(q), uHgtSize).r; }
float hgtOld(vec2 q){
  vec2 dome = bicubic(uDome, suv(q), uDomeSize).rg;
  float m = smoothstep(0.04, 0.35, dome.r + dome.g);
  float waves = 0.26*waveField(q, uTime);
  // profil czaszy kuli (pierwiastek): płaski wierzch i stromy brzeg, bez wypukłego „sutka” na środku małych kropli
  // małe krople: czasza kuli (bez „sutka”); duże ciało: pół czaszy, pół kopuły, żeby całe łapało światło jak szkło
  float big = clamp(dome.r, 0., 1.2);
  // łagodniejszy brzeg: potęga 0.7 zamiast pierwiastka (mniej stromo przy samej krawędzi)
  // brzeg ma szerokość zależną od wielkości kropli: w dużym ciele średnie pole (stała szerokość ~0.05) wygasa,
  // a kształt brzegu daje szerokie pole, więc nie ma pierścienia o zawsze tej samej grubości
  float small = 1. - smoothstep(0.25, 0.75, big);
  return 0.6*small*pow(clamp(dome.g, 0., 1.2), 0.85) + 1.0*big + waves*m;
}

// otoczenie: kierunek okna lekko „pływa” po powierzchni, więc każda kropla łapie światło inaczej
vec3 env(vec3 r, vec2 q){
  vec3 L = normalize(vec3(-0.55 + 0.12*sin(q.y*7.+uTime*0.21), 0.62 + 0.08*cos(q.x*5.3-uTime*0.17), 0.56));
  vec3 c = mix(vec3(0.70,0.72,0.68), vec3(0.99,0.98,0.95), smoothstep(-0.35,0.45,r.y));
  c += vec3(1.25)*smoothstep(0.8,0.92, dot(r, L)) + vec3(0.25)*smoothstep(0.5,0.9, dot(r, L));
  c += vec3(0.5)*pow(max(dot(r, normalize(vec3(0.7,0.25,0.6))),0.),24.);
  return c;
}

void main(){
  vec2 q = gl_FragCoord.xy/uRes.y;
  // cień i skupione światło za cieczą
  float sd = dens(q - vec2(0.012,-0.018));
  vec3 wall = page(q)*(1. - 0.14*smoothstep(ISO*0.4, ISO*1.4, sd)) + TINT*smoothstep(ISO*1.4, 1.6, sd)*0.25;
  float f = dens(q);
  float fw = fwidth(f);
  // miękki brzeg: przejście na kilka pikseli zamiast jednego
  float cover = smoothstep(ISO - max(fw*2., 0.02), ISO + max(fw*2., 0.02), f);
  float dU = texture(uDist, suv(q)).r / uDH;
  if (uSpread > 0.) cover = max(cover, smoothstep(0.0015, 0.005, dU));
  float rebelF = texture(uDens, suv(q)).g;
  float rebelness = smoothstep(ISO*0.7, ISO*1.3, rebelF);
  if (cover <= 0.) { o = vec4(mix(wall, INK, boardMask(q)),1.); return; }

  // wysokość cieczy z gęstości: przy brzegu stromo, w środku płasko
  float e = 4.0/uRes.y;
  float hC = hgt(q);
  float hx = hgt(q+vec2(e,0.)) - hgt(q-vec2(e,0.));
  float hy = hgt(q+vec2(0.,e)) - hgt(q-vec2(0.,e));
  vec3 n = normalize(vec3(-hx/(2.*e)*0.14, -hy/(2.*e)*0.14, 1.));
  // brzeg podwija się pod spód: w wąskim pasie przy krawędzi powierzchnia schodzi do pionu i dalej,
  // więc odbija otoczenie (jasno od strony światła, ciemniej od cienia) zamiast leżeć płasko.
  // Szerokość pasa lekko się zmienia wzdłuż brzegu, żeby nie był jednolitą obwódką.
  float dE = dU;
  float wE = 0.011*(0.65 + 0.7*vnoise(q*7. + vec2(uTime*0.07, -uTime*0.05)));
  float curl = 1. - smoothstep(0., wE, dE);
  curl *= curl;
  n = normalize(vec3(n.xy*(1. + curl*7.), n.z*(1. - curl*0.92)));
  if (uDark > 0. && rebelness > 0.) {
    // na tafli kropla nie ma własnego brzegu w polu odległości (tafla jest wszędzie), więc kształt bierze z własnego pola
    float eg = 7.0/uRes.y;
    float gx = texture(uDens, suv(q+vec2(eg,0.))).g - texture(uDens, suv(q-vec2(eg,0.))).g;
    float gy = texture(uDens, suv(q+vec2(0.,eg))).g - texture(uDens, suv(q-vec2(0.,eg))).g;
    vec3 nd = normalize(vec3(-gx/(2.*eg)*0.022, -gy/(2.*eg)*0.022, 1.));
    float rim = 1. - smoothstep(ISO, ISO*1.8, rebelF); rim *= rim;
    nd = normalize(vec3(nd.xy*(1. + rim*4.), nd.z*(1. - rim*0.75)));
    n = normalize(mix(n, nd, rebelness*uDark));
    curl = mix(curl, rim*0.6, rebelness*uDark);
  }

  // przesunięcie załamania ograniczone: kropla wygina to, co pod nią, zamiast pokazywać puste tło z daleka
  // + stała część: nawet łagodne fale (małe nachylenie) wyraźnie wyginają poziomice i tekst pod spodem
  float k = min(0.04 + 0.1*pow(1.-max(n.z,0.),1.6), 0.08);
  vec3 refr = vec3(page(q - n.xy*k*0.97).r, page(q - n.xy*k).g, page(q - n.xy*k*1.03).b);
  refr *= 1. - 0.12*smoothstep(0.3,0.0,n.z);
  vec3 tint = mix(mix(TINT, uDarkCol, uDark), TINT, rebelness*uDark);
  vec3 body = refr*(tint/BG) + tint*0.04*(1. - uDark*(1. - rebelness));
  // zrzut strony spod tafli: najpierw mętny, wygięty i bez krawędzi, potem coraz czystszy, na końcu dokładnie taki, jak jest
  if (uImageIn > 0.) {
    vec2 bq = q - n.xy*k*(1. - uClarity*0.98);
    vec2 iuv = clamp((bq - uImgRect.xy)/uImgRect.zw, 0., 1.);
    vec3 seen = texture(uImg, iuv).rgb;
    float soft = mix(0.0015, 0.06, (1. - uClarity)*(1. - uClarity));
    float inBox = smoothstep(soft, -soft, boxD(bq))*uImageIn*(1. - rebelness);
    body = mix(body, mix(seen, body, (1. - uClarity)*0.7), inBox);
  }
  body *= 1. - 0.35*curl;   // przy podwiniętym brzegu mniej światła przechodzi na wprost
  // kropla na tafli to szkło nad wodą: widać przez nią poziomice i zrzut, wygięte i lekko zabarwione na zielono
  if (uDark > 0. && rebelness > 0.) {
    vec3 seen = sheetBase(q - n.xy*0.028);
    vec3 glass = seen*vec3(0.55, 1.0, 0.76) + TINT*0.2;   // zielone szkło: to, co pod spodem, zabarwione jak przez kroplę na hero
    body = mix(body, glass*(1. - 0.25*curl), rebelness*uDark);
  }
  float F = 0.02 + 0.98*pow(1.-max(n.z,0.),5.);
  vec3 rd = vec3(0.,0.,-1.), r = reflect(rd, n);
  // bez cieniowania rozproszonego: to ono robiło z cieczy plastelinę; szkło pokazuje fale załamaniem i odbiciem
  vec3 envC = env(r,q);
  envC = mix(envC, envC*vec3(0.42, 0.8, 0.6), uDark*rebelness);   // na ciemnej wodzie kropla odbija zielono, nie szaro
  vec3 col = body*(1.-F*(1. - 0.55*uDark*rebelness)) + envC*F*0.7*(1. - 0.9*uClarity*(1. - rebelness))*(1. - 0.45*uDark*rebelness);
  vec3 L = normalize(vec3(-0.55 + 0.12*sin(q.y*7.+uTime*0.21), 0.62 + 0.08*cos(q.x*5.3-uTime*0.17), 0.56));
  float sp = max(dot(r, L), 0.);
  col += vec3(1.)*(pow(sp, 5.)*0.07 + pow(sp, 24.)*0.08 + pow(sp, 220.)*0.6)*(1. - 0.85*uClarity*(1. - rebelness));  // szeroki połysk pokazuje fale jako jaśniejsze pasma  // odblask okna: miękka poświata + ostre jądro jak na szkle
  o = vec4(mix(mix(wall, col, cover), INK, boardMask(q)),1.);
}`

// Distance from the liquid edge (jump flooding) at quarter resolution.
export const JFA_INIT_FRAGMENT = `#version 300 es
precision highp float; uniform sampler2D uD; uniform float uIso, uInv; out vec2 o;
uniform vec2 uJ; void main(){ float f = texture(uD, gl_FragCoord.xy/uJ).r; o = (uInv > 0.5 ? f >= uIso : f < uIso) ? gl_FragCoord.xy : vec2(-1.); }`

// The sheet front: floods outward from the liquid outline, unevenly.
export const FLOOD_FRAGMENT = `#version 300 es
precision highp float; uniform sampler2D uIn, uOut; uniform float uR, uTime; uniform vec2 uJ; out vec4 o;
float hsh(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);
  return mix(mix(hsh(i), hsh(i+vec2(1,0)), u.x), mix(hsh(i+vec2(0,1)), hsh(i+vec2(1,1)), u.x), u.y); }
void main(){ vec2 uv = gl_FragCoord.xy/uJ; vec2 q = vec2(uv.x*uJ.x/uJ.y, uv.y);
  float n = vnoise(q*2.3 + vec2(uTime*0.06, -uTime*0.05))*0.65 + vnoise(q*5.7 - vec2(uTime*0.09))*0.35;
  float front = uR*(0.62 + 0.76*n) - texture(uOut, uv).r;
  o = vec4(max(texture(uIn, uv).r, front), 0., 0., 1.); }`

export const JFA_STEP_FRAGMENT = `#version 300 es
precision highp float; uniform sampler2D uS; uniform int uStep; uniform ivec2 uSize; out vec2 o;
void main(){ vec2 p = gl_FragCoord.xy; vec2 best = vec2(-1.); float bd = 1e20;
  for (int y=-1;y<=1;y++) for (int x=-1;x<=1;x++){ ivec2 c = ivec2(p) + ivec2(x,y)*uStep;
    if (c.x<0||c.y<0||c.x>=uSize.x||c.y>=uSize.y) continue;
    vec2 s = texelFetch(uS, c, 0).xy; if (s.x < 0.) continue;
    float d = dot(s-p, s-p); if (d < bd) { bd = d; best = s; } }
  o = best; }`

export const JFA_DIST_FRAGMENT = `#version 300 es
precision highp float; uniform sampler2D uS; out vec4 o;
void main(){ vec2 s = texelFetch(uS, ivec2(gl_FragCoord.xy), 0).xy; o = vec4(s.x < 0. ? 400. : length(s - gl_FragCoord.xy), 0., 0., 1.); }`

export const BLUR_FRAGMENT = `#version 300 es
precision highp float; uniform sampler2D uS; uniform vec2 uDir; out vec4 o;
void main(){ ivec2 p = ivec2(gl_FragCoord.xy); ivec2 sz = textureSize(uS, 0); float a = 0., w = 0.;
  for (int i=-8;i<=8;i++){ float g = exp(-float(i*i)/32.); ivec2 c = clamp(p + ivec2(uDir)*i, ivec2(0), sz-1); a += texelFetch(uS, c, 0).r*g; w += g; }
  o = vec4(a/w, 0., 0., 1.); }`

// Liquid height once per frame, at distance-field resolution.
export const HEIGHT_FRAGMENT = `#version 300 es
precision highp float; uniform sampler2D uDist, uDens; uniform float uDH, uTime, uSpread, uClarity; uniform vec2 uJ, uRes; out vec4 o;
float hsh(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);
  return mix(mix(hsh(i), hsh(i+vec2(1,0)), u.x), mix(hsh(i+vec2(0,1)), hsh(i+vec2(1,1)), u.x), u.y); }
float waveField(vec2 q, float t){
  vec2 w = vec2(vnoise(q*3.1 + vec2(t*0.11, -t*0.07)), vnoise(q*3.1 + vec2(5.2 - t*0.09, 1.3 + t*0.1))) - 0.5;
  vec2 p = q*9. + w*2.2;                                   // zawinięcie przestrzeni: fale się wyginają i zmieniają szerokość
  float n = vnoise(p + vec2(t*0.35, -t*0.22))*0.65 + vnoise(p*1.9 - vec2(t*0.28, t*0.31))*0.35;
  float amp = 0.5 + 0.5*vnoise(q*2.3 - vec2(t*0.05));       // w jednych miejscach falują mocniej, w innych prawie wcale
  return (n - 0.5)*amp;
}
float hgt(vec2 q){
  // wysokość z odległości od brzegu (pole odległości liczone co klatkę): profil bez stałej szerokości,
  // więc brzeg wąskiego ramienia jest wąski, dużego ciała szeroki, i nie powstaje pierścień
  float d = texture(uDist, (gl_FragCoord.xy/uJ)).r / uDH;
  float m = smoothstep(0., 0.03, d);
  float waves = 0.26*waveField(q, uTime);
  // drobniejsze fale dla małych kropli (duże fale są większe niż one same i dawały tylko pochylenie)
  float fine = 0.05*(vnoise(q*26. + vec2(uTime*0.5, -uTime*0.4)) - 0.5)*m*(1. - smoothstep(0.035, 0.09, d));
  float rebel = smoothstep(0.25, 0.6, texture(uDens, gl_FragCoord.xy/uJ).g);
  return (0.5*sqrt(d) + fine)*(1. - uSpread) + waves*m*(1. + 0.7*uSpread)*(1. - uClarity) + 0.06*uSpread*rebel;
}
void main(){ vec2 uv = gl_FragCoord.xy/uJ; vec2 q = vec2(uv.x*uRes.x/uRes.y, uv.y); o = vec4(hgt(q), 0., 0., 1.); }`
