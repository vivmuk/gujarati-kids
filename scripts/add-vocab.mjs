import { readFileSync, writeFileSync } from 'fs';

const filePath = 'src/data/gujarati.ts';
let content = readFileSync(filePath, 'utf-8');

// Build a Gujarati string from Unicode codepoints
function g(...cps) { return cps.map(n => String.fromCodePoint(n)).join(''); }

// Common codepoints
const AA = 0x0ABE, I  = 0x0ABF, II = 0x0AC0, U  = 0x0AC1, UU = 0x0AC2;
const E  = 0x0AC7, AI = 0x0AC8, O  = 0x0ACB, AU = 0x0ACC, AN = 0x0A82;
const V  = 0x0ACD; // virama / halant

// Consonants
const KA = 0x0A95, KHA= 0x0A96, GA = 0x0A97, GHA= 0x0A98, NGA= 0x0A99;
const CA = 0x0A9A, CHA= 0x0A9B, JA = 0x0A9C, JHA= 0x0A9D;
const TA = 0x0A9F, THA= 0x0AA0, DA = 0x0AA1, DHA= 0x0AA2, NA2= 0x0AA3;
const ta = 0x0AA4, tha= 0x0AA5, da = 0x0AA6, dha= 0x0AA7, na = 0x0AA8;
const PA = 0x0AAA, PHA= 0x0AAB, BA = 0x0AAC, BHA= 0x0AAD, MA = 0x0AAE;
const YA = 0x0AAF, RA = 0x0AB0, LA = 0x0AB2, VA = 0x0AB5;
const SHA= 0x0AB6, SS = 0x0AB7, SA = 0x0AB8, HA = 0x0AB9, LLA= 0x0ABB;
// Vowels (independent)
const A = 0x0A85, AA_V= 0x0A86, I_V= 0x0A87, II_V= 0x0A88, U_V= 0x0A89;
const E_V= 0x0A8F, O_V= 0x0A93;
// Aliases for readability
const NA = na, TA2 = TA, DA2 = DA;

// Build word entries as JS objects
const entries = [
  // ── FRUIT extra ──────────────────────────────────────────────────────────
  { guj: g(KA,E,RA,II),                roman:'keri',        eng:'Mango',             cat:'fruit', lv:1 },
  { guj: g(JA,AA,MA,PHA,LA,A),         roman:'jaamfal',     eng:'Guava',             cat:'fruit', lv:1 },
  { guj: g(ta,RA,BHA,UU,CA),           roman:'tarbooch',    eng:'Watermelon',        cat:'fruit', lv:2 },
  { guj: g(KHA,RA,BA,UU,JA),           roman:'kharbuj',     eng:'Muskmelon',         cat:'fruit', lv:2 },
  { guj: g(KHA,AA,RA,E,KA),            roman:'kharek',      eng:'Dates',             cat:'fruit', lv:2 },
  { guj: g(A,AN,JA,II,RA),             roman:'anjir',       eng:'Fig',               cat:'fruit', lv:2 },
  { guj: g(JA,AA,AN,BA,UU),            roman:'jaambu',      eng:'Java Plum',         cat:'fruit', lv:2 },
  { guj: g(CA,II,KA,U),                roman:'chiku',       eng:'Sapodilla',         cat:'fruit', lv:2 },
  { guj: g(SA,II,ta,AA,PHA,LA,A),      roman:'sitafal',     eng:'Custard Apple',     cat:'fruit', lv:3 },
  { guj: g(PHA,NA2,SA),                roman:'fanas',       eng:'Jackfruit',         cat:'fruit', lv:3 },
  { guj: g(A,NA,AA,NA,SA),             roman:'ananas',      eng:'Pineapple',         cat:'fruit', lv:2 },
  { guj: g(LA,I,AN,BA,U),              roman:'limbu',       eng:'Lemon',             cat:'fruit', lv:1 },
  { guj: g(AA_V,AN,BA,LA,AA),          roman:'aamla',       eng:'Indian Gooseberry', cat:'fruit', lv:3 },
  { guj: g(AA_V,RA,U),                 roman:'aroo',        eng:'Peach',             cat:'fruit', lv:3 },
  { guj: g(KA,I,VA,II),                roman:'kivi',        eng:'Kiwi',              cat:'fruit', lv:2 },
  { guj: g(CA,E,RA,II),                roman:'cheri',       eng:'Cherry',            cat:'fruit', lv:2 },
  { guj: g(NA,AA,SHA,PA,ta,II),        roman:'nashpati',    eng:'Pear',              cat:'fruit', lv:2 },
  { guj: g(LA,II,CA,II),               roman:'lichi',       eng:'Lychee',            cat:'fruit', lv:2 },
  { guj: g(PA,PA,AI,YA,U),             roman:'papaiyu',     eng:'Papaya',            cat:'fruit', lv:2 },
  { guj: g(A,LA,U,BA,U,KHA,AA,RA,AA),  roman:'alubukhara',  eng:'Plum',              cat:'fruit', lv:3 },
  { guj: g(JA,RA,da,AA,LA,U),          roman:'jardalu',     eng:'Apricot',           cat:'fruit', lv:3 },
  { guj: g(SA,TA,RA,MA,AA,BA,E,RA,II), roman:'strambairi',  eng:'Strawberry',        cat:'fruit', lv:3 },
  // ── COLOR extra ──────────────────────────────────────────────────────────
  { guj: g(GA,U,LA,AA,BA,II),          roman:'gulabi',      eng:'Pink',              cat:'color', lv:1 },
  { guj: g(BHA,UU,RA,O),               roman:'bhooro',      eng:'Brown',             cat:'color', lv:1 },
  { guj: g(RA,AA,KHA,O,DA,II),         roman:'rakhodi',     eng:'Gray',              cat:'color', lv:2 },
  { guj: g(SA,O,NA,E,RA,II),           roman:'soneri',      eng:'Golden',            cat:'color', lv:2 },
  { guj: g(RA,UU,PA,E,RA,II),          roman:'ruperi',      eng:'Silver',            cat:'color', lv:2 },
  { guj: g(MA,RA,UU,NA),               roman:'marun',       eng:'Maroon',            cat:'color', lv:2 },
  { guj: g(KA,E,SA,RA,II),             roman:'kesari',      eng:'Saffron',           cat:'color', lv:2 },
  { guj: g(AA_V,SA,MA,AA,NA,II),       roman:'aasmani',     eng:'Sky Blue',          cat:'color', lv:2 },
  { guj: g(JA,AA,AN,BA,U,JA,O),        roman:'jaambudo',    eng:'Purple',            cat:'color', lv:2 },
  { guj: g(PHA,E,RA,O,JA,II),          roman:'feroji',      eng:'Turquoise',         cat:'color', lv:3 },
  { guj: g(CA,O,KA,LA,E,TA,II),        roman:'chokleti',    eng:'Chocolate Brown',   cat:'color', lv:3 },
  { guj: g(SHA,II,VA,AA,LA,II),        roman:'shivali',     eng:'Indigo',            cat:'color', lv:3 },
  // ── BODY extra ───────────────────────────────────────────────────────────
  { guj: g(MA,AA,tha,U),               roman:'maathu',      eng:'Head',              cat:'body',  lv:1 },
  { guj: g(GA,AA,LA),                  roman:'gaal',        eng:'Cheek',             cat:'body',  lv:1 },
  { guj: g(KA,PA,AA,LA,A),             roman:'kapaal',      eng:'Forehead',          cat:'body',  lv:2 },
  { guj: g(GA,LA,O),                   roman:'galo',        eng:'Throat',            cat:'body',  lv:2 },
  { guj: g(KHA,BHA,O),                 roman:'khabo',       eng:'Shoulder',          cat:'body',  lv:2 },
  { guj: g(BA,AA,HA,U),                roman:'baahu',       eng:'Arm',               cat:'body',  lv:2 },
  { guj: g(KA,O,NA2,II),               roman:'koeni',       eng:'Elbow',             cat:'body',  lv:3 },
  { guj: g(NA,AA,DA,II),               roman:'naadi',       eng:'Wrist',             cat:'body',  lv:3 },
  { guj: g(AA_V,GA,LA,II),             roman:'aagali',      eng:'Finger',            cat:'body',  lv:1 },
  { guj: g(A,AN,GA,UU,TA,O),           roman:'angutha',     eng:'Thumb',             cat:'body',  lv:2 },
  { guj: g(CHA,AA,ta,II),              roman:'chhati',      eng:'Chest',             cat:'body',  lv:2 },
  { guj: g(PA,E,TA),                   roman:'pet',         eng:'Stomach',           cat:'body',  lv:1 },
  { guj: g(PA,I,tha),                  roman:'pith',        eng:'Back',              cat:'body',  lv:2 },
  { guj: g(GHA,U,TA,NA),               roman:'ghutna',      eng:'Knee',              cat:'body',  lv:2 },
  { guj: g(VA,AA,LA),                  roman:'vaal',        eng:'Hair',              cat:'body',  lv:1 },
  { guj: g(HA,O,tha),                  roman:'hoth',        eng:'Lips',              cat:'body',  lv:1 },
  { guj: g(da,AA,AN,ta),               roman:'daant',       eng:'Teeth',             cat:'body',  lv:1 },
  { guj: g(JA,II,BHA),                 roman:'jibh',        eng:'Tongue',            cat:'body',  lv:2 },
  { guj: g(TA,O,DA,II),                roman:'thodi',       eng:'Chin',              cat:'body',  lv:2 },
  { guj: g(BHA,V,RA,U,KA,TA,II),       roman:'bhrukuti',    eng:'Eyebrow',           cat:'body',  lv:3 },
  { guj: g(HA,U,da,AA,YA),             roman:'hudaya',      eng:'Heart',             cat:'body',  lv:3 },
  { guj: g(da,I,MA,AA,GA),             roman:'dimaag',      eng:'Brain',             cat:'body',  lv:3 },
  { guj: g(HA,tha,E,LA,II),            roman:'hatheli',     eng:'Palm',              cat:'body',  lv:2 },
  { guj: g(JA,AA,AN,GA),               roman:'jaangh',      eng:'Thigh',             cat:'body',  lv:3 },
  { guj: g(E_V,DA,II),                 roman:'edhi',        eng:'Heel',              cat:'body',  lv:3 },
  // ── FAMILY extra ─────────────────────────────────────────────────────────
  { guj: g(KA,AA,KA,AA),               roman:'kaka',        eng:'Paternal Uncle',    cat:'family',lv:2 },
  { guj: g(KA,AA,KA,II),               roman:'kaki',        eng:'Paternal Aunt',     cat:'family',lv:2 },
  { guj: g(MA,AA,MA,AA),               roman:'mama',        eng:'Maternal Uncle',    cat:'family',lv:2 },
  { guj: g(MA,AA,MA,II),               roman:'mami',        eng:'Maternal Aunt',     cat:'family',lv:2 },
  { guj: g(PHA,O,I_V),                 roman:'foi',         eng:"Father's Sister",   cat:'family',lv:3 },
  { guj: g(NA,AA,NA,AA),               roman:'nana',        eng:'Maternal Grandfather',cat:'family',lv:2 },
  { guj: g(NA,AA,NA,II),               roman:'nani',        eng:'Maternal Grandmother',cat:'family',lv:2 },
  { guj: g(da,I,KA,RA,O),              roman:'dikro',       eng:'Son',               cat:'family',lv:1 },
  { guj: g(da,I,KA,RA,II),             roman:'dikri',       eng:'Daughter',          cat:'family',lv:1 },
  { guj: g(PA,ta,I),                   roman:'pati',        eng:'Husband',           cat:'family',lv:2 },
  { guj: g(PA,ta,V,NA,II),             roman:'patni',       eng:'Wife',              cat:'family',lv:2 },
  { guj: g(CHA,O,KA,RA,O),             roman:'chhokro',     eng:'Boy',               cat:'family',lv:1 },
  { guj: g(CHA,O,KA,RA,II),            roman:'chhokri',     eng:'Girl',              cat:'family',lv:1 },
  { guj: g(PA,AA,DA,O,SHA,II),         roman:'padoshi',     eng:'Neighbor',          cat:'family',lv:2 },
  { guj: g(SHA,I,KA,V,SA,KA),          roman:'shikshak',    eng:'Teacher',           cat:'family',lv:2 },
  { guj: g(DA,O,KA,V,TA,RA),           roman:'daktar',      eng:'Doctor',            cat:'family',lv:1 },
  { guj: g(RA,AA,JA,AA),               roman:'raja',        eng:'King',              cat:'family',lv:2 },
  { guj: g(RA,AA,NA2,II),              roman:'rani',        eng:'Queen',             cat:'family',lv:2 },
  { guj: g(MA,O,TA,O,0x20,BHA,AA,I_V), roman:'moto bhai',  eng:'Elder Brother',     cat:'family',lv:2 },
  { guj: g(MA,O,TA,II,0x20,BA,HA,E,NA),roman:'moti bahen', eng:'Elder Sister',      cat:'family',lv:2 },
  { guj: g(BHA,ta,II,JA,O),            roman:'bhatijo',     eng:'Nephew',            cat:'family',lv:3 },
  { guj: g(BHA,ta,II,JA,II),           roman:'bhatiji',     eng:'Niece',             cat:'family',lv:3 },
  { guj: g(PA,O,ta,RA,O),              roman:'potro',       eng:'Grandson',          cat:'family',lv:3 },
  { guj: g(SA,AA,SA,U),                roman:'saasu',       eng:'Mother-in-law',     cat:'family',lv:3 },
  { guj: g(SA,AA,SA,RA,O),             roman:'sasaro',      eng:'Father-in-law',     cat:'family',lv:3 },
  // ── FOOD extra ───────────────────────────────────────────────────────────
  { guj: g(DHA,O,KA,LA,O),             roman:'dhoklo',      eng:'Dhokla',            cat:'food',  lv:1 },
  { guj: g(tha,E,PA,LA,AA),            roman:'thepla',      eng:'Thepla',            cat:'food',  lv:1 },
  { guj: g(KHA,I,CA,DA,II),            roman:'khichdi',     eng:'Khichdi',           cat:'food',  lv:1 },
  { guj: g(SHA,AA,KA),                 roman:'shaak',       eng:'Vegetable Curry',   cat:'food',  lv:1 },
  { guj: g(RA,O,TA,LA,O),              roman:'rotlo',       eng:'Millet Bread',      cat:'food',  lv:2 },
  { guj: g(CHA,AA,SHA),                roman:'chhash',      eng:'Buttermilk',        cat:'food',  lv:1 },
  { guj: g(MA,I,tha,AA,I_V),           roman:'mithai',      eng:'Sweets',            cat:'food',  lv:1 },
  { guj: g(LA,DA,U),                   roman:'ladoo',       eng:'Ladoo',             cat:'food',  lv:1 },
  { guj: g(HA,AA,LA,VA,O),             roman:'halvo',       eng:'Halwa',             cat:'food',  lv:2 },
  { guj: g(PA,UU,RA,II),               roman:'puri',        eng:'Puri',              cat:'food',  lv:1 },
  { guj: g(GA,AA,TA,I,YA,AA),          roman:'gathiya',     eng:'Gathiya',           cat:'food',  lv:1 },
  { guj: g(SA,E,VA),                   roman:'sev',         eng:'Sev',               cat:'food',  lv:1 },
  { guj: g(PA,AA,PA,DA),               roman:'papad',       eng:'Papad',             cat:'food',  lv:2 },
  { guj: g(KHA,MA,NA),                 roman:'khaman',      eng:'Khaman',            cat:'food',  lv:1 },
  { guj: g(U_V,AN,dha,I,YA,U),         roman:'undhiyu',     eng:'Undhiyu',           cat:'food',  lv:2 },
  { guj: g(PHA,AA,PHA,DA,AA),          roman:'fafda',       eng:'Fafda',             cat:'food',  lv:1 },
  { guj: g(SA,AA,KA,RA),               roman:'sakhar',      eng:'Sugar',             cat:'food',  lv:1 },
  { guj: g(NA,MA,KA),                  roman:'namak',       eng:'Salt',              cat:'food',  lv:1 },
  { guj: g(ta,E,LA),                   roman:'tel',         eng:'Oil',               cat:'food',  lv:2 },
  { guj: g(JA,II,RA,U),                roman:'jeeru',       eng:'Cumin',             cat:'food',  lv:2 },
  { guj: g(LA,SA,NA),                  roman:'lasan',       eng:'Garlic',            cat:'food',  lv:2 },
  { guj: g(DA,U,AN,GA,LA,II),          roman:'dungli',      eng:'Onion',             cat:'food',  lv:1 },
  { guj: g(ta,MA,E,ta,AA),             roman:'tameta',      eng:'Tomato',            cat:'food',  lv:1 },
  { guj: g(BA,TA,AA,TA,AA),            roman:'batata',      eng:'Potato',            cat:'food',  lv:1 },
  { guj: g(MA,RA,CA,U),                roman:'marchu',      eng:'Chilli',            cat:'food',  lv:2 },
  { guj: g(AA_V,da,U),                 roman:'aadu',        eng:'Ginger',            cat:'food',  lv:2 },
  { guj: g(KA,O,tha,MA,II,RA),         roman:'kothmir',     eng:'Coriander',         cat:'food',  lv:2 },
  { guj: g(HA,LA,da,RA),               roman:'haldar',      eng:'Turmeric',          cat:'food',  lv:2 },
  { guj: g(MA,AA,KHA,NA),              roman:'makhan',      eng:'Butter',            cat:'food',  lv:1 },
  { guj: g(MA,dha),                    roman:'madh',        eng:'Honey',             cat:'food',  lv:2 },
  { guj: g(A,tha,AA,NA,U),             roman:'athanu',      eng:'Pickle',            cat:'food',  lv:2 },
  { guj: g(JA,V,YA,UU,SA),             roman:'jyus',        eng:'Juice',             cat:'food',  lv:1 },
  // ── NATURE extra ─────────────────────────────────────────────────────────
  { guj: g(PA,VA,NA),                  roman:'pavan',       eng:'Wind',              cat:'nature',lv:1 },
  { guj: g(MA,AA,TA,II),               roman:'maati',       eng:'Soil',              cat:'nature',lv:1 },
  { guj: g(PHA,UU,LA),                 roman:'phool',       eng:'Flower',            cat:'nature',lv:1 },
  { guj: g(PA,AA,AN),                  roman:'paan',        eng:'Leaf',              cat:'nature',lv:1 },
  { guj: g(VA,V,RA,U,KA,V,SA),         roman:'vruksh',      eng:'Tree',              cat:'nature',lv:2 },
  { guj: g(SA,MA,U,da,V,RA),           roman:'samudra',     eng:'Ocean',             cat:'nature',lv:2 },
  { guj: g(NA,da,II),                  roman:'nadi',        eng:'River',             cat:'nature',lv:1 },
  { guj: g(PA,HA,AA,DA),               roman:'pahad',       eng:'Mountain',          cat:'nature',lv:2 },
  { guj: g(JA,AN,GA,LA),               roman:'jangal',      eng:'Forest',            cat:'nature',lv:2 },
  { guj: g(RA,E,ta,AA,LA),             roman:'retaal',      eng:'Desert',            cat:'nature',lv:3 },
  { guj: g(BA,RA,PHA),                 roman:'baraf',       eng:'Snow',              cat:'nature',lv:2 },
  { guj: g(VA,I,JA,LA,II),             roman:'vijali',      eng:'Lightning',         cat:'nature',lv:2 },
  { guj: g(ta,U,PHA,AA,NA),            roman:'tufaan',      eng:'Storm',             cat:'nature',lv:2 },
  { guj: g(BA,II,JA),                  roman:'beej',        eng:'Seed',              cat:'nature',lv:2 },
  { guj: g(SHA,AA,KHA,AA),             roman:'shakha',      eng:'Branch',            cat:'nature',lv:2 },
  { guj: g(KA,MA,LA),                  roman:'kamal',       eng:'Lotus',             cat:'nature',lv:2 },
  { guj: g(GA,U,LA,AA,BA),             roman:'gulab',       eng:'Rose',              cat:'nature',lv:1 },
  { guj: g(CA,MA,E,LA,II),             roman:'chameli',     eng:'Jasmine',           cat:'nature',lv:2 },
  { guj: g(GA,E,RA,U,0x20,PHA,UU,LA),  roman:'geru phool',  eng:'Marigold',          cat:'nature',lv:2 },
  { guj: g(SA,UU,RA,JA,MA,U,KHA,II),   roman:'surajmukhi',  eng:'Sunflower',         cat:'nature',lv:2 },
  { guj: g(I_V,AN,da,V,RA,dha,NA,U,SA),roman:'indradhanush',eng:'Rainbow',           cat:'nature',lv:2 },
  { guj: g(ta,LA,AA,VA),               roman:'taalaav',     eng:'Lake',              cat:'nature',lv:2 },
  { guj: g(KA,UU,VA,O),                roman:'kuvo',        eng:'Well',              cat:'nature',lv:2 },
  { guj: g(dha,O,DA),                  roman:'dhod',        eng:'Waterfall',         cat:'nature',lv:2 },
  { guj: g(RA,E,ta,O),                 roman:'reto',        eng:'Sand',              cat:'nature',lv:1 },
  { guj: g(PA,tha,V,tha,RA),           roman:'paththar',    eng:'Rock',              cat:'nature',lv:2 },
  { guj: g(GHA,AA,SA),                 roman:'ghaas',       eng:'Grass',             cat:'nature',lv:1 },
  { guj: g(dha,U,AN,dha),              roman:'dhundh',      eng:'Fog',               cat:'nature',lv:2 },
  { guj: g(GA,U,PHA,AA),               roman:'gupha',       eng:'Cave',              cat:'nature',lv:3 },
  { guj: g(BHA,UU,KA,AN,PA),           roman:'bhookamp',    eng:'Earthquake',        cat:'nature',lv:3 },
  // ── SURAT CITY ───────────────────────────────────────────────────────────
  { guj: g(HA,II,RA,O),                roman:'hiro',        eng:'Diamond',           cat:'surat', lv:1 },
  { guj: g(KA,AA,PA,DA),               roman:'kapad',       eng:'Textile / Fabric',  cat:'surat', lv:1 },
  { guj: g(LA,O,CA,O),                 roman:'locho',       eng:'Locho (Surati snack)',cat:'surat',lv:1 },
  { guj: g(GHA,U,GHA,RA,AA),           roman:'ghughra',     eng:'Ghughra (sweet dumpling)',cat:'surat',lv:1 },
  { guj: g(ta,AA,PA,II),               roman:'tapi',        eng:'Tapi River',        cat:'surat', lv:1 },
];

// Print a sample for verification
console.log('Sample check:');
console.log(' Mango (keri):', entries[0].guj, '  codepoints:', [...entries[0].guj].map(c=>c.codePointAt(0).toString(16)).join(' '));
console.log(' Pink (gulabi):', entries[22].guj);
console.log(' Head (maathu):', entries[34].guj);
console.log(' Dhokla:', entries.find(e=>e.roman==='dhoklo')?.guj);
console.log(' Wind (pavan):', entries.find(e=>e.roman==='pavan')?.guj);
console.log(' Diamond (hiro):', entries.find(e=>e.roman==='hiro')?.guj);

// Serialize to TS word entry lines
const lines = entries.map(e =>
  `  { gujarati: '${e.guj}', roman: '${e.roman}', english: '${e.eng}', category: '${e.cat}', level: ${e.lv} },`
).join('\n');

const block = `\n${lines}\n`;

// Find insertion point: last ]; before PHRASES
const phraseSection = '// ===== PHRASES =====';
const phraseIdx = content.indexOf(phraseSection);
if (phraseIdx === -1) { console.error('Cannot find PHRASES section'); process.exit(1); }
const beforePhrase = content.substring(0, phraseIdx);
const lastBracket = beforePhrase.lastIndexOf('];');
if (lastBracket === -1) { console.error('Cannot find ] before phrases'); process.exit(1); }

console.log('\nInsertion point at char', lastBracket);
const newContent = content.substring(0, lastBracket) + block + '];\n' + content.substring(lastBracket + 2);
writeFileSync(filePath, newContent, 'utf-8');
console.log('SUCCESS: Vocabulary written to', filePath);

const countMatches = (str, cat) => (str.match(new RegExp(`category: '${cat}'`, 'g')) || []).length;
console.log('\nCategory counts:');
for (const cat of ['animal','fruit','color','body','family','food','nature','surat']) {
  console.log(` ${cat}: ${countMatches(newContent, cat)}`);
}
