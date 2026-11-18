// 肌肉定義 + 正/背面人體 SVG（風格化示意圖，非精確解剖圖）
// 每個形狀只畫左半邊，右半邊以鏡像產生。
window.MUSCLES = {
  chest_upper: { zh: "胸大肌上部（鎖骨部）", en: "upper pectoralis major (clavicular head)" },
  chest:       { zh: "胸大肌中下部（胸肋部）", en: "pectoralis major (sternal head)" },
  front_delt:  { zh: "三角肌前束", en: "anterior deltoid" },
  side_delt:   { zh: "三角肌中束", en: "lateral deltoid" },
  rear_delt:   { zh: "三角肌後束", en: "posterior deltoid" },
  traps:       { zh: "斜方肌上部", en: "upper trapezius" },
  midback:     { zh: "斜方肌中下部／菱形肌", en: "middle and lower trapezius, rhomboids" },
  lats:        { zh: "背闊肌／大圓肌", en: "latissimus dorsi and teres major" },
  lower_back:  { zh: "豎脊肌（下背）", en: "erector spinae" },
  biceps:      { zh: "肱二頭肌／肱肌", en: "biceps brachii and brachialis" },
  triceps:     { zh: "肱三頭肌", en: "triceps brachii" },
  forearms:    { zh: "前臂肌群（含肱橈肌）", en: "forearm muscles and brachioradialis" },
  abs:         { zh: "腹直肌", en: "rectus abdominis" },
  obliques:    { zh: "腹內外斜肌", en: "internal and external obliques" },
  glutes:      { zh: "臀大肌", en: "gluteus maximus" },
  glute_med:   { zh: "臀中肌", en: "gluteus medius" },
  quads:       { zh: "股四頭肌", en: "quadriceps" },
  hamstrings:  { zh: "膕繩肌（大腿後側）", en: "hamstrings" },
  adductors:   { zh: "內收肌群", en: "hip adductors" },
  calves:      { zh: "小腿三頭肌（腓腸肌／比目魚肌）", en: "gastrocnemius and soleus" },
};

// [muscleId, pathData]；muscleId 為 null 表示非肌肉部位（頭、手、膝等）
const FRONT_SHAPES = [
  [null, "M100,10 C88,10 82,20 82,32 C82,46 90,54 100,54 Z"],          // 頭
  [null, "M100,54 L92,54 L92,68 L100,70 Z"],                             // 頸
  ["traps", "M92,60 L92,70 L80,74 C84,68 88,64 92,60 Z"],
  ["side_delt", "M78,74 C66,74 58,82 56,98 L62,102 C64,90 68,82 76,78 Z"],
  ["front_delt", "M80,74 L84,78 C76,84 70,94 66,106 L62,102 C64,90 70,80 80,74 Z"],
  ["chest_upper", "M99,74 L86,76 C80,80 74,88 72,96 L99,96 Z"],
  ["chest", "M99,96 L72,96 C70,104 72,114 78,120 C86,124 94,124 99,122 Z"],
  ["biceps", "M62,106 C56,118 54,134 56,148 L66,148 C68,134 70,120 68,108 Z"],
  ["forearms", "M56,152 C50,168 48,184 48,200 L56,202 C60,188 64,172 66,152 Z"],
  [null, "M48,204 C44,212 44,222 50,226 C56,224 58,214 56,204 Z"],      // 手
  ["obliques", "M86,126 L76,122 C72,142 72,166 80,190 L90,194 C86,172 85,148 86,126 Z"],
  ["abs", "M99,126 L88,126 C87,150 88,172 92,196 L99,200 Z"],
  [null, "M99,202 L92,198 L80,192 L76,200 L94,214 L99,212 Z"],          // 骨盆
  ["quads", "M92,212 L76,202 C70,228 70,260 76,290 L92,292 C94,264 94,236 92,212 Z"],
  ["adductors", "M99,214 L94,214 C95,240 95,262 93,280 C97,266 99,246 99,230 Z"],
  [null, "M76,294 C76,302 80,308 86,308 C92,308 94,302 93,294 Z"],      // 膝
  ["calves", "M78,312 C72,332 74,356 80,380 L92,380 C94,356 94,334 92,312 Z"],
  [null, "M80,384 L92,384 L94,396 L74,396 Z"],                          // 腳
];

const BACK_SHAPES = [
  [null, "M100,10 C88,10 82,20 82,32 C82,46 90,54 100,54 Z"],
  [null, "M100,54 L92,54 L92,62 L100,62 Z"],
  ["traps", "M100,58 L92,62 L76,74 L90,80 L100,80 Z"],
  ["rear_delt", "M76,76 C64,76 58,84 56,100 L64,104 C66,94 70,86 80,82 Z"],
  ["midback", "M100,82 L90,82 L84,90 L88,106 L100,124 Z"],
  ["lats", "M82,86 C72,94 68,112 72,130 C78,146 88,158 98,164 L98,130 L86,108 Z"],
  ["lower_back", "M99,130 L91,134 C89,152 89,172 91,192 L99,196 Z"],
  ["triceps", "M62,106 C56,118 54,134 56,148 L66,148 C68,134 70,120 68,108 Z"],
  ["forearms", "M56,152 C50,168 48,184 48,200 L56,202 C60,188 64,172 66,152 Z"],
  [null, "M48,204 C44,212 44,222 50,226 C56,224 58,214 56,204 Z"],
  ["glute_med", "M84,194 L76,190 C70,198 70,210 74,216 L80,206 Z"],
  ["glutes", "M99,198 L84,196 C74,206 72,224 80,236 C88,242 96,240 99,236 Z"],
  ["hamstrings", "M96,242 L78,238 C72,258 74,280 80,296 L94,296 C96,278 97,260 96,242 Z"],
  ["adductors", "M99,240 L97,242 C98,256 97,270 95,282 C98,268 99,254 99,240 Z"],
  [null, "M80,298 C80,304 84,308 88,308 C92,308 94,304 94,298 Z"],
  ["calves", "M80,310 C72,326 74,346 82,360 L94,360 C96,342 96,324 92,310 Z"],
  [null, "M84,362 L92,362 L92,384 L86,384 Z"],                          // 跟腱
  [null, "M80,386 L94,386 L94,396 L76,396 Z"],
];

/**
 * 產生人體肌肉圖 SVG 字串
 * @param {"front"|"back"} side
 * @param {{primary?:string[], secondary?:string[], stabilizers?:string[]}} hl
 * @param {{interactive?:boolean, selected?:string}} opts
 */
window.bodySVG = function (side, hl = {}, opts = {}) {
  const shapes = side === "front" ? FRONT_SHAPES : BACK_SHAPES;
  const roleOf = (id) => {
    if (!id) return "bone";
    if ((hl.primary || []).includes(id)) return "primary";
    if ((hl.secondary || []).includes(id)) return "secondary";
    if ((hl.stabilizers || []).includes(id)) return "stabilizer";
    return "idle";
  };
  const one = (id, d, mirror) => {
    const role = roleOf(id);
    const sel = opts.selected && opts.selected === id ? " is-selected" : "";
    const attrs = id
      ? ` data-muscle="${id}" class="m m-${role}${sel}"${opts.interactive ? ' tabindex="0" role="button"' : ""}`
      : ' class="m m-bone"';
    const t = mirror ? ' transform="matrix(-1 0 0 1 200 0)"' : "";
    const title = id ? `<title>${MUSCLES[id].zh}</title>` : "";
    return `<path d="${d}"${attrs}${t}>${title}</path>`;
  };
  const paths = shapes.map(([id, d]) => one(id, d, false) + one(id, d, true)).join("");
  const label = side === "front" ? "正面" : "背面";
  return `<svg class="body ${opts.interactive ? "body-interactive" : ""}" viewBox="40 4 120 412" role="img" aria-label="${label}肌肉圖">${paths}<text x="100" y="410" class="body-label">${label}</text></svg>`;
};
