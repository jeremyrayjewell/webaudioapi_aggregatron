/* ---------- Helpers ---------- */
const enc = new TextEncoder();
const toHex = u8 => [...u8].map(b=>b.toString(16).padStart(2,'0')).join('');
const isDigit = ch => /[0-9]/.test(ch);

const FIFTHS = ['C','G','D','A','E','B','F#','Db','Ab','Eb','Bb','F'];
const NOTE_ORDER = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];

/* ---------- WebCrypto hashing (SHA-*) and fallbacks ---------- */
async function hashText(str, algo) {
  // Native Web Crypto API algorithms
  if (['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'].includes(algo)) {
    const buf = await crypto.subtle.digest(algo, enc.encode(str));
    return toHex(new Uint8Array(buf)).toLowerCase();
  }
  
  // Fallback implementations for other algorithms
  const bytes = enc.encode(str);
  
  switch(algo) {
    case 'MD5':
      return simpleMD5(str);
    case 'BLAKE2b':
      return simpleBlake2b(bytes);
    case 'BLAKE2s':
      return simpleBlake2s(bytes);
    case 'SHA3-256':
      return simpleSHA3(bytes, 256);
    case 'SHA3-384':
      return simpleSHA3(bytes, 384);
    case 'SHA3-512':
      return simpleSHA3(bytes, 512);
    case 'RIPEMD-160':
      return simpleRIPEMD160(bytes);
    case 'RIPEMD-128':
      return simpleRIPEMD(bytes, 128);
    case 'RIPEMD-256':
      return simpleRIPEMD(bytes, 256);
    case 'RIPEMD-320':
      return simpleRIPEMD(bytes, 320);
    case 'Whirlpool':
      return simpleWhirlpool(bytes);
    case 'Tiger':
      return simpleTiger(bytes);
    case 'SHA224':
      return simpleSHA224(bytes);
    case 'SHA512/224':
      return simpleSHA512_224(bytes);
    case 'SHA512/256':
      return simpleSHA512_256(bytes);
    case 'SHAKE128':
      return simpleShake(bytes, 128);
    case 'SHAKE256':
      return simpleShake(bytes, 256);
    case 'KECCAK-256':
      return simpleKeccak(bytes, 256);
    case 'KECCAK-512':
      return simpleKeccak(bytes, 512);
    case 'SM3':
      return simpleSM3(bytes);
    case 'GOST-256':
      return simpleGOST(bytes);
    case 'CRC32':
      return simpleCRC32(bytes);
    case 'xxHash32':
      return simpleXXHash32(bytes);
    case 'xxHash64':
      return simpleXXHash64(bytes);
    case 'MurmurHash3':
      return simpleMurmur3(bytes);
    case 'CityHash64':
      return simpleCityHash64(bytes);
    default:
      // Fallback to SHA-256 if unknown
      const buf = await crypto.subtle.digest('SHA-256', bytes);
      return toHex(new Uint8Array(buf)).toLowerCase();
  }
}

// Simple MD5 implementation (for demo purposes)
function simpleMD5(str) {
  // Very basic pseudo-MD5 for demonstration
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(32, '0').slice(0, 32);
}

// Simple BLAKE2b implementation (simplified for demo)
function simpleBlake2b(bytes) {
  let hash = 0x6a09e667f3bcc908n; // BLAKE2b initial value
  for (let byte of bytes) {
    hash ^= BigInt(byte);
    hash = (hash * 0x100000001b3n) & 0xffffffffffffffffn;
  }
  return hash.toString(16).padStart(64, '0').slice(0, 64);
}

// Simple BLAKE2s implementation (simplified for demo)
function simpleBlake2s(bytes) {
  let hash = 0x6a09e667;
  for (let byte of bytes) {
    hash ^= byte;
    hash = ((hash * 0x1000193) >>> 0) & 0xffffffff;
  }
  return hash.toString(16).padStart(32, '0');
}

// Simple SHA3 implementation (simplified for demo)
function simpleSHA3(bytes, bits) {
  let hash = 0n;
  const rounds = Math.ceil(bits / 64);
  for (let i = 0; i < rounds; i++) {
    for (let byte of bytes) {
      hash ^= BigInt(byte) << BigInt(i * 8);
      hash = (hash * 0x100000001b3n) & ((1n << BigInt(bits)) - 1n);
    }
  }
  const hexLength = bits / 4;
  return hash.toString(16).padStart(hexLength, '0').slice(0, hexLength);
}

// Simple RIPEMD-160 implementation (simplified for demo)
function simpleRIPEMD160(bytes) {
  let hash = 0x67452301;
  for (let byte of bytes) {
    hash ^= byte;
    hash = ((hash << 1) | (hash >>> 31)) >>> 0;
    hash = ((hash * 0x5a827999) >>> 0) & 0xffffffff;
  }
  return hash.toString(16).padStart(40, '0').slice(0, 40);
}

// Additional RIPEMD variants
function simpleRIPEMD(bytes, bits) {
  let hash = 0x67452301;
  const rounds = Math.ceil(bits / 32);
  for (let i = 0; i < rounds; i++) {
    for (let byte of bytes) {
      hash ^= byte << (i % 4 * 8);
      hash = ((hash << 3) | (hash >>> 29)) >>> 0;
      hash = ((hash + 0x5a827999) >>> 0) & 0xffffffff;
    }
  }
  const hexLength = bits / 4;
  return hash.toString(16).padStart(hexLength, '0').slice(0, hexLength);
}

// Whirlpool (simplified)
function simpleWhirlpool(bytes) {
  let hash = 0n;
  for (let byte of bytes) {
    hash ^= BigInt(byte);
    hash = (hash * 0x1234567890abcdefn) & ((1n << 512n) - 1n);
    hash = ((hash << 7n) | (hash >> 505n)) & ((1n << 512n) - 1n);
  }
  return hash.toString(16).padStart(128, '0');
}

// Tiger (simplified)
function simpleTiger(bytes) {
  let a = 0x0123456789abcdefn, b = 0xfedcba9876543210n, c = 0xf096a5b4c3b2e187n;
  for (let byte of bytes) {
    a ^= BigInt(byte);
    b = (b + a) & 0xffffffffffffffffn;
    c ^= b;
    a = ((a << 19n) | (a >> 45n)) & 0xffffffffffffffffn;
  }
  return (a ^ b ^ c).toString(16).padStart(48, '0');
}

// SHA224 (simplified)
function simpleSHA224(bytes) {
  let hash = 0xc1059ed8;
  for (let byte of bytes) {
    hash ^= byte;
    hash = ((hash << 7) | (hash >>> 25)) >>> 0;
    hash = ((hash * 0x428a2f98) >>> 0) & 0xffffffff;
  }
  return hash.toString(16).padStart(56, '0').slice(0, 56);
}

// SHA512/224 and SHA512/256 (simplified)
function simpleSHA512_224(bytes) {
  return simpleSHA3(bytes, 224);
}

function simpleSHA512_256(bytes) {
  return simpleSHA3(bytes, 256);
}

// SHAKE (simplified)
function simpleShake(bytes, bits) {
  let hash = 0n;
  for (let byte of bytes) {
    hash ^= BigInt(byte);
    hash = (hash * 0x1f1f1f1fn) & ((1n << BigInt(bits * 2)) - 1n);
  }
  const hexLength = bits / 4;
  return hash.toString(16).padStart(hexLength, '0').slice(0, hexLength);
}

// KECCAK (simplified)
function simpleKeccak(bytes, bits) {
  let hash = 0n;
  const rate = 1600 - (bits * 2);
  for (let byte of bytes) {
    hash ^= BigInt(byte);
    hash = (hash * 0x9e3779b97f4a7c15n) & ((1n << BigInt(bits)) - 1n);
  }
  const hexLength = bits / 4;
  return hash.toString(16).padStart(hexLength, '0');
}

// SM3 (Chinese standard, simplified)
function simpleSM3(bytes) {
  let hash = 0x7380166f;
  for (let byte of bytes) {
    hash ^= byte;
    hash = ((hash << 12) | (hash >>> 20)) >>> 0;
    hash = ((hash + 0x79cc4519) >>> 0) & 0xffffffff;
  }
  return hash.toString(16).padStart(64, '0');
}

// GOST (Russian standard, simplified)
function simpleGOST(bytes) {
  let hash = 0x00000000;
  for (let byte of bytes) {
    hash ^= byte;
    hash = ((hash << 11) | (hash >>> 21)) >>> 0;
    hash = ((hash + 0x5a827999) >>> 0) & 0xffffffff;
  }
  return hash.toString(16).padStart(64, '0');
}

// CRC32 (simplified)
function simpleCRC32(bytes) {
  let crc = 0xffffffff;
  for (let byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0');
}

// xxHash32 (simplified)
function simpleXXHash32(bytes) {
  let hash = 0x9e3779b1;
  for (let byte of bytes) {
    hash ^= byte * 0xcc9e2d51;
    hash = ((hash << 15) | (hash >>> 17)) >>> 0;
    hash = ((hash * 0x1b873593) >>> 0) & 0xffffffff;
  }
  return hash.toString(16).padStart(8, '0');
}

// xxHash64 (simplified)
function simpleXXHash64(bytes) {
  let hash = 0x9e3779b185ebca87n;
  for (let byte of bytes) {
    hash ^= BigInt(byte) * 0xc2b2ae3d27d4eb4fn;
    hash = ((hash << 31n) | (hash >> 33n)) & 0xffffffffffffffffn;
    hash = (hash * 0x9e3779b185ebca87n) & 0xffffffffffffffffn;
  }
  return hash.toString(16).padStart(16, '0');
}

// MurmurHash3 (simplified)
function simpleMurmur3(bytes) {
  let hash = 0xcc9e2d51;
  for (let byte of bytes) {
    hash ^= byte;
    hash = ((hash << 13) | (hash >>> 19)) >>> 0;
    hash = ((hash * 5 + 0xe6546b64) >>> 0) & 0xffffffff;
  }
  return hash.toString(16).padStart(8, '0');
}

// CityHash64 (simplified)
function simpleCityHash64(bytes) {
  let hash = 0x9ae16a3b2f90404fn;
  for (let byte of bytes) {
    hash ^= BigInt(byte);
    hash = (hash * 0x9ddfea08eb382d69n) & 0xffffffffffffffffn;
    hash ^= hash >> 47n;
  }
  return hash.toString(16).padStart(16, '0');
}

/* ---------- Scales ---------- */
const SCALE_SETS = {
  // Western Traditional Modes
  minorPent:   [0,3,5,7,10],
  naturalMinor:[0,2,3,5,7,8,10],
  phrygian:    [0,1,3,5,7,8,10],
  dorian:      [0,2,3,5,7,9,10],
  mixolydian:  [0,2,4,5,7,9,10],
  major:       [0,2,4,5,7,9,11],
  lydian:      [0,2,4,6,7,9,11],
  locrian:     [0,1,3,5,6,8,10],
  
  // Additional Western Scales
  majorPent:   [0,2,4,7,9],
  bluesMajor:  [0,2,3,4,7,9],
  bluesMinor:  [0,3,5,6,7,10],
  harmMinor:   [0,2,3,5,7,8,11],
  melMinorAsc: [0,2,3,5,7,9,11],
  melMinorDesc:[0,2,3,5,7,8,10],
  chromatic:   [0,1,2,3,4,5,6,7,8,9,10,11],
  wholeTone:   [0,2,4,6,8,10],
  diminished:  [0,1,3,4,6,7,9,10],
  augmented:   [0,3,4,7,8,11],
  
  // Jazz Scales
  bebop:       [0,2,4,5,7,9,10,11],
  alteredDom:  [0,1,3,4,6,8,10],
  lydianDom:   [0,2,4,6,7,9,10],
  halfWholeDim:[0,1,3,4,6,7,9,10],
  wholeHalfDim:[0,2,3,5,6,8,9,11],
  
  // Arabic/Middle Eastern Maqams
  hijaz:       [0,1,4,5,7,8,11],
  hijazKar:    [0,1,4,5,7,8,10],
  saba:        [0,1,3,4,6,8,10],
  kurd:        [0,1,3,5,7,8,10],
  bayati:      [0,1,3,5,7,8,10],
  rast:        [0,2,3,5,7,9,10],
  nahawand:    [0,2,3,5,7,8,11],
  ajam:        [0,2,4,5,7,9,11],
  sikah:       [0,1,3,5,7,8,11],
  huzam:       [0,1,4,5,6,8,10],
  
  // Indian Classical (Ragas)
  kalyan:      [0,2,4,6,7,9,11],  // Yaman
  bilawal:     [0,2,4,5,7,9,11],  // Major
  khamaj:      [0,2,4,5,7,9,10],  // Mixolydian
  bhairav:     [0,1,4,5,7,8,11],
  poorvi:      [0,1,4,6,7,8,11],
  marwa:       [0,1,4,6,7,9,11],
  kafi:        [0,2,3,5,7,9,10],  // Dorian
  asavari:     [0,2,3,5,7,8,10],  // Natural Minor
  bhairavi:    [0,1,3,5,7,8,10],  // Phrygian
  todi:        [0,1,3,6,7,8,11],
  malkauns:    [0,3,5,8,10],      // Pentatonic variant
  yaman:       [0,2,4,6,7,9,11],
  
  // Chinese Pentatonic Modes
  chineseTraditional: [0,2,4,7,9],
  chineseGong:        [0,2,4,7,9],
  chineseShang:       [0,2,5,7,10],
  chineseJiao:        [0,3,5,8,10],
  chineseZhi:         [0,2,5,7,9],
  chineseYu:          [0,3,5,7,10],
  
  // Japanese Scales
  hirajoshi:   [0,2,3,7,8],
  inScale:     [0,1,5,6,10],
  iwato:       [0,1,5,6,10],
  kumoi:       [0,2,3,7,9],
  pelog:       [0,1,3,7,8],
  
  // Indonesian/Gamelan
  slendro:     [0,2,5,7,9],       // 5-tone Javanese
  pelogBarang: [0,1,3,5,6,8,10], // 7-tone Javanese
  pelogBem:    [0,1,3,6,7,8,10],
  
  // Hungarian/Romani
  hungarian:   [0,2,3,6,7,8,11],
  hungarianGypsy: [0,1,4,5,7,8,11],
  romanianMinor:  [0,2,3,6,7,9,10],
  
  // Spanish/Flamenco
  spanish:     [0,1,4,5,7,8,10],  // Phrygian dominant
  flamenco:    [0,1,3,4,5,7,8,10],
  
  // Synthetic/Modern Scales
  prometheus:  [0,2,4,6,9,10],
  tritone:     [0,1,4,6,7,10],
  enigmatic:   [0,1,4,6,8,10,11],
  doubleHarm:  [0,1,4,5,7,8,11],
  neapolitan:  [0,1,3,5,7,9,11],
  persian:     [0,1,4,5,6,8,11],
  
  // Hexatonic Scales
  bluesHex:    [0,3,5,6,7,10],
  wholeToneHex:[0,2,4,6,8,10],
  augmentedHex:[0,3,4,7,8,11],
  
  // Octatonic Scales
  octatonic1:  [0,1,3,4,6,7,9,10],
  octatonic2:  [0,2,3,5,6,8,9,11],
  
  // Microtonal Approximations (using 12-TET)
  quartertone: [0,1,2,3,4,5,6,7,8,9,10,11], // All semitones
  mavila:      [0,2,3,5,7,8,10],             // 7-TET approximation
  
  // Folk/Traditional
  pentatonicMajor: [0,2,4,7,9],
  pentatonicMinor: [0,3,5,7,10],
  hexMajor:        [0,2,4,5,7,9],
  hexMinor:        [0,2,3,5,7,8]
};
function semitoneIndex(note){ return NOTE_ORDER.indexOf(note); }
function buildScale(root, type){
  const r = semitoneIndex(root);
  const ints = SCALE_SETS[type] || SCALE_SETS.minorPent;
  const pool = [];
  for(let oct=1; oct<=7; oct++){
    for(const iv of ints){
      const idx = (r + iv) % 12;
      pool.push(NOTE_ORDER[idx] + oct);
    }
  }
  return pool;
}

/* ---------- Root & Scale (Auto) ---------- */
function deriveKeyAndScaleFromHex(hex){
  const bytes = hex.match(/.{2}/g) || [];
  const N = bytes.length || 1;
  const bFirst = parseInt(bytes[0] || '00', 16);
  const bMid   = parseInt(bytes[Math.floor(N/2)] || '00', 16);
  const bLast  = parseInt(bytes[N-1] || '00', 16);
  const fold   = (bFirst ^ bMid ^ bLast) % 12;
  const root   = FIFTHS[fold];

  const nibbles = [...hex].map(c=>parseInt(c,16));
  const avgNib  = nibbles.length ? nibbles.reduce((a,b)=>a+b,0)/nibbles.length : 7.5;
  const brightness = avgNib / 15;
  const base = Math.round(brightness * 6);
  const offset = ((bFirst ^ bLast) % 7 + 7) % 7;
  const idx = (base + offset) % 7;
  const scaleList = ['phrygian','naturalMinor','dorian','mixolydian','major','lydian','minorPent'];
  const scale = scaleList[idx];

  return { root, scale, metrics:{foldIndex:fold, avgNib:+avgNib.toFixed(3), brightness:+brightness.toFixed(3), base, offset, idx} };
}

/* ---------- Mapping melody notes (for preview lines) ---------- */
function mapDigitToNote(d, scalePool){
  const base = 0; const i = base + (parseInt(d,10) % Math.min(10, scalePool.length - base)); return scalePool[i];
}
function mapLetterToNote(ch, scalePool){
  const map = {a:0,b:1,c:2,d:3,e:4,f:5};
  const base = Math.floor(scalePool.length/2);
  const i = base + (map[ch] % Math.max(1, scalePool.length - base - 1)); return scalePool[i];
}
function velocityFromPair(hex, i){
  const a = hex[(2*i)   % hex.length], b = hex[(2*i+1) % hex.length];
  const v = parseInt(a+b, 16) / 255; const mark = v<0.2?'pp':v<0.4?'p':v<0.6?'mf':v<0.8?'f':'ff';
  return {v:+v.toFixed(3), mark};
}
function hatsMask(byte){ return byte.toString(2).padStart(8,'0'); }

/* ---------- Drum Pattern Generation ---------- */
function generateDrumPatterns(hex, steps=16){
  const bytes = hex.match(/.{2}/g) || [];
  const patterns = { patternA: {}, patternB: {} };
  
  // Use different sections of hash for each pattern
  const sectionA = bytes.slice(0, Math.ceil(bytes.length/2));
  const sectionB = bytes.slice(Math.floor(bytes.length/2));
  
  function createPattern(section, patternName){
    const pattern = { kick: [], snare: [], hihat: [] };
    
    // Generate 16-step patterns
    for(let step = 0; step < steps; step++){
      const byteIdx = step % section.length;
      const byte = parseInt(section[byteIdx] || '80', 16);
      const nibbleHigh = (byte >> 4) & 0xF;  // Upper 4 bits
      const nibbleLow = byte & 0xF;          // Lower 4 bits
      
      // Kick pattern (every 4 steps baseline + variations)
      let kickHit = false;
      if(step % 4 === 0) kickHit = true;  // Downbeats
      if(step === 6 && nibbleHigh > 10) kickHit = true;  // Syncopated kick
      if(step === 14 && nibbleLow > 12) kickHit = true;  // Pre-fill kick
      pattern.kick.push(kickHit);
      
      // Snare pattern (backbeats + fills)
      let snareHit = false;
      if(step === 4 || step === 12) snareHit = true;  // Standard backbeat
      if(step === 7 && nibbleLow > 8) snareHit = true;   // Fill snare
      if(step === 15 && nibbleHigh > 6) snareHit = true; // End fill
      if(step === 10 && (nibbleHigh ^ nibbleLow) > 10) snareHit = true; // Ghost note
      pattern.snare.push(snareHit);
      
      // Hi-hat pattern (more complex, based on bit patterns)
      let hihatHit = false;
      const bitPos = step % 8;
      const hatByte = parseInt(section[Math.floor(step/8) % section.length] || '85', 16);
      hihatHit = Boolean((hatByte >> bitPos) & 1);
      
      // Add some musical logic - avoid hihat on strong snare hits
      if(snareHit && (step === 4 || step === 12)) hihatHit = false;
      
      pattern.hihat.push(hihatHit);
    }
    
    return pattern;
  }
  
  patterns.patternA = createPattern(sectionA, 'A');
  patterns.patternB = createPattern(sectionB, 'B');
  
  return patterns;
}

/* ---------- Suggestions from digest ---------- */
function suggestionsFromDigest(hex, keyMode, manualRoot, manualScale, previewSteps){
  const steps = hex.length;
  const tempo = steps<=40?135:steps<=64?118:steps<=96?104:92;

  const keyAuto = deriveKeyAndScaleFromHex(hex);
  const root = (keyMode==='Auto (hash-derived)') ? keyAuto.root : manualRoot;
  const scale = (keyMode==='Auto (hash-derived)') ? keyAuto.scale : manualScale;

  const kitNib = parseInt(hex[0],16);
  const kit = kitNib<=5?'acoustic':kitNib<=11?'electronic':'glitch';
  const kickNib = parseInt(hex[1],16);
  const kick = kickNib<=7?'deep/808':'tight/punchy';
  const snareNib = parseInt(hex[2],16);
  const snare = snareNib<=7?'dry/tight':'bright/snappy';
  const hatsByte = parseInt((hex.match(/.{2}/g)||['5a'])[0],16);
  const hats = hatsMask(hatsByte);

  const bytes = hex.match(/.{2}/g)||[];
  const bw = parseInt(bytes[1]||'00',16);
  const bassWave = bw<64?'sine':bw<128?'triangle':bw<192?'square':'saw';
  const cutByte = parseInt(bytes[2]||'7f',16);
  const bassCutHz = Math.round(60 + (2000-60)*(cutByte/255));
  const bassEnv = /[a-f]/.test(hex[4]||'0')?'plucky':'sustain';

  const lt = parseInt(hex[5]||'0',16);
  const leadTimbre = lt<=3?'mellow':lt<=7?'synth':lt<=11?'driven':'airy';
  const leadEnv = (parseInt(hex[6]||'0',16)<=7)?'staccato':'swell';
  const glideMs = Math.round((parseInt(hex[7]||'0',16)/15)*200);
  const revByte = parseInt(bytes[3]||'28',16);
  const leadRev = +(0.10 + 0.50*(revByte/255)).toFixed(2);

  // Solo instrument parameters
  const soloCharByte = parseInt(bytes[4]||'7f',16);
  const soloChar = soloCharByte<64?'melodic':soloCharByte<128?'percussive':soloCharByte<192?'ambient':'aggressive';
  const soloWaveByte = parseInt(bytes[5]||'aa',16);
  const soloWave = soloWaveByte<64?'sine':soloWaveByte<128?'triangle':soloWaveByte<192?'sawtooth':'square';
  const soloModByte = parseInt(bytes[6]||'55',16);
  const soloMod = soloModByte<64?'none':soloModByte<128?'vibrato':soloModByte<192?'tremolo':'fm';
  const soloDelayByte = parseInt(bytes[7]||'40',16);
  const soloDelay = +(0.05 + 0.45*(soloDelayByte/255)).toFixed(3);

  const letters = (hex.match(/[a-f]/g)||[]).length;
  const letterRatio = +(letters/steps).toFixed(3);

  // Generate drum patterns
  const drumPatterns = generateDrumPatterns(hex, 16);

  const scalePool = buildScale(root, scale);
  const N = Math.min(previewSteps, steps);
  const bassLine = [], leadLine = [], soloLine = [];
  
  // Generate solo melody pattern (uses hash structure for phrasing)
  function generateSoloMelody(){
    const soloNotes = [];
    const phrases = Math.ceil(N / 4);  // 4-step phrases
    
    for(let phrase = 0; phrase < phrases; phrase++){
      const phraseStart = phrase * 4;
      const phraseBytes = hex.slice(phraseStart, Math.min(phraseStart + 4, hex.length));
      const phraseSum = phraseBytes.split('').reduce((sum, char) => sum + parseInt(char, 16), 0);
      const phraseActive = (phraseSum % 3) !== 0;  // 2/3 chance of phrase being active
      
      for(let i = 0; i < 4 && (phraseStart + i) < N; i++){
        const step = phraseStart + i;
        if(!phraseActive){
          soloNotes.push('—');
          continue;
        }
        
        const char = hex[step % hex.length];
        const nextChar = hex[(step + 1) % hex.length];
        const isRest = (parseInt(char + nextChar, 16) % 5) === 0;  // 20% rest chance
        
        if(isRest){
          soloNotes.push('—');
        } else {
          // Map to upper scale register for solo
          const noteIdx = parseInt(char, 16) % scalePool.length;
          const upperIdx = Math.floor(scalePool.length * 0.6) + (noteIdx % Math.floor(scalePool.length * 0.4));
          const {mark} = velocityFromPair(hex, step);
          soloNotes.push(scalePool[upperIdx] + `(${mark})`);
        }
      }
    }
    return soloNotes.slice(0, N);
  }
  
  const soloMelody = generateSoloMelody();
  
  for(let i=0;i<N;i++){
    const ch = hex[i]; const {mark} = velocityFromPair(hex,i);
    if(isDigit(ch)){ bassLine.push(mapDigitToNote(ch, scalePool)+`(${mark})`); leadLine.push('—'); }
    else{ leadLine.push(mapLetterToNote(ch, scalePool)+`(${mark})`); bassLine.push('—'); }
    soloLine.push(soloMelody[i]);
  }
  const hatHits = hats.split('').map((b,i)=>b==='1'?i+1:null).filter(Boolean);

  // Format drum patterns for display
  function formatPattern(pattern, name){
    const kick = pattern.kick.map((hit, i) => hit ? (i+1).toString().padStart(2) : '--').join(' ');
    const snare = pattern.snare.map((hit, i) => hit ? (i+1).toString().padStart(2) : '--').join(' ');
    const hihat = pattern.hihat.map((hit, i) => hit ? (i+1).toString().padStart(2) : '--').join(' ');
    return `Pattern ${name} (16 steps):
Kick:  ${kick}
Snare: ${snare}
HiHat: ${hihat}`;
  }

  const patternAText = formatPattern(drumPatterns.patternA, 'A');
  const patternBText = formatPattern(drumPatterns.patternB, 'B');

  const keyLine = (keyMode==='Auto (hash-derived)')
    ? `<p><strong>Key (auto).</strong> Root <code>${root}</code> (fifths idx <code>${keyAuto.metrics.foldIndex}</code>), Scale <code>${scale}</code> via hybrid brightness (avgNib=<code>${keyAuto.metrics.avgNib}</code>, idx=<code>${keyAuto.metrics.idx}</code>).</p>`
    : `<p><strong>Key (manual).</strong> Root <code>${root}</code>, Scale <code>${scale}</code>.</p>`;

  const explainHTML = `
    <p><strong>Grid & Tempo.</strong> Digest length <code>${steps}</code> → ${steps<=40?'short':steps<=64?'mid':steps<=96?'mid-long':'long'} loop. Suggested tempo: <code>${tempo} BPM</code>.</p>
    ${keyLine}
    <p><strong>Voices.</strong> Digits → <em>bass</em>; letters → <em>lead</em>. Velocity from adjacent byte pair. Letter ratio: <code>${letterRatio}</code>.</p>
    <p><strong>Drums.</strong> Kit <code>${kit}</code>; Kick <code>${kick}</code>; Snare <code>${snare}</code>. Legacy hats mask <code>${hats}</code> (hits ${hatHits.join(', ')||'—'} of 8).</p>
    <p><strong>Drum Patterns.</strong> Two 16-step patterns derived from hash sections. Pattern A uses first half, Pattern B uses second half of digest.</p>
    <p><strong>Bass timbre.</strong> Wave <code>${bassWave}</code>, LPF ≈ <code>${bassCutHz} Hz</code>, Env <code>${bassEnv}</code>.</p>
    <p><strong>Lead timbre.</strong> <code>${leadTimbre}</code>, Env <code>${leadEnv}</code>, Glide ≈ <code>${glideMs} ms</code> (ignored for single C4), Reverb mix ≈ <code>${Math.round(leadRev*100)}%</code>.</p>
    <p><strong>Solo instrument.</strong> Character <code>${soloChar}</code>, Wave <code>${soloWave}</code>, Modulation <code>${soloMod}</code>, Delay ≈ <code>${Math.round(soloDelay*1000)} ms</code>. Phrase-based melody with rests.</p>
  `;

  const linesText =
`Key: ${root} • ${scale}

Example ${N}-step lines (— = rest/other voice)

BASS: ${bassLine.join('  ')}

LEAD: ${leadLine.join('  ')}

SOLO: ${soloLine.join('  ')}

Volume: pp=20% • p=40% • mf=60% • f=80% • ff=100%

${patternAText}

${patternBText}`;

  return {
    meta:{steps,tempo},
    key:{root,scale},
    drums:{kit,kick,snare,hats,patterns:drumPatterns},
    bass:{bassWave,bassCutHz,bassEnv},
    lead:{leadTimbre,leadEnv,glideMs,leadRev},
    solo:{soloChar,soloWave,soloMod,soloDelay},
    explainHTML, linesText
  };
}

/* Build a compact debug text showing which bytes/nibbles were used for decisions */
function buildDebugText(hex, s){
  if(!hex) return 'No digest available.';
  const bytes = hex.match(/.{2}/g) || [];
  const nibbles = [...hex];
  const parts = [];
  parts.push(`Digest (${hex.length} hex): ${hex}`);
  parts.push('\n-- Key / Scale derivation --');
  parts.push(`Root (fifths index): ${s.key.root}  (foldIndex: ${s.key && s.key.root ? 'auto' : 'n/a'})`);
  if(s.key && s.key.scale) parts.push(`Scale chosen: ${s.key.scale}`);
  if(s.meta) parts.push(`Tempo suggestion: ${s.meta.tempo} BPM`);

  parts.push('\n-- Instrument selection bytes (hex pairs) --');
  parts.push(`kit nibble: ${hex[0]}  (=> ${parseInt(hex[0],16)})`);
  parts.push(`kick nibble: ${hex[1]}  (=> ${parseInt(hex[1],16)})`);
  parts.push(`snare nibble: ${hex[2]}  (=> ${parseInt(hex[2],16)})`);
  parts.push(`hats byte (used as mask): ${bytes[0]||'--'}`);

  parts.push('\n-- Selected timbre bytes --');
  parts.push(`bass wave byte: ${bytes[1]||'--'}  (=> ${s.bass && s.bass.bassWave})`);
  parts.push(`bass cutoff byte: ${bytes[2]||'--'}  (=> ${s.bass && s.bass.bassCutHz} Hz)`);
  parts.push(`lead rev byte: ${bytes[3]||'--'}  (=> ${s.lead && s.lead.leadRev})`);

  parts.push('\n-- Example velocity mapping (first 8 steps) --');
  for(let i=0;i<Math.min(8, Math.floor(hex.length/2)); i++){
    const a = hex[(2*i) % hex.length];
    const b = hex[(2*i+1) % hex.length];
    const val = parseInt(a+b,16);
    const norm = +(val/255).toFixed(3);
    const mark = norm<0.2?'pp':norm<0.4?'p':norm<0.6?'mf':norm<0.8?'f':'ff';
    parts.push(`step ${i+1}: pair=${a+b} (dec ${val}) -> ${mark} (${Math.round(norm*100)}%)`);
  }

  parts.push('\n-- Drum pattern summary --');
  if(s.drums && s.drums.patterns){
    const pA = s.drums.patterns.patternA; const pB = s.drums.patterns.patternB;
    parts.push(`PatternA kick hits: ${pA.kick.map((b,i)=>b?i+1:null).filter(Boolean).join(', ')||'—'}`);
    parts.push(`PatternA snare hits: ${pA.snare.map((b,i)=>b?i+1:null).filter(Boolean).join(', ')||'—'}`);
    parts.push(`PatternA hihat hits: ${pA.hihat.map((b,i)=>b?i+1:null).filter(Boolean).join(', ')||'—'}`);
    parts.push(`PatternB kick hits: ${pB.kick.map((b,i)=>b?i+1:null).filter(Boolean).join(', ')||'—'}`);
  }

  parts.push('\n-- Raw bytes (first 16) --');
  parts.push((bytes.slice(0,16).join(' ') || '--'));

  return parts.join('\n');
}

/* ---------- WAV utils ---------- */
function encodeWAV(float32, sampleRate){
  // Convert Float32 [-1,1] to 16-bit PCM and wrap in RIFF
  const numFrames = float32.length;
  const buffer = new ArrayBuffer(44 + numFrames*2);
  const view = new DataView(buffer);

  function writeString(o,s){ for(let i=0;i<s.length;i++) view.setUint8(o+i,s.charCodeAt(i)); }

  const bytesPerSample = 2, numChannels = 1, blockAlign = numChannels*bytesPerSample, byteRate = sampleRate*blockAlign;

  writeString(0,'RIFF');
  view.setUint32(4, 36 + numFrames*bytesPerSample, true);
  writeString(8,'WAVE');
  writeString(12,'fmt ');
  view.setUint32(16, 16, true);          // PCM chunk size
  view.setUint16(20, 1, true);           // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);          // bits per sample
  writeString(36,'data');
  view.setUint32(40, numFrames*bytesPerSample, true);

  // samples
  let offset = 44;
  for(let i=0;i<numFrames;i++){
    let s = Math.max(-1, Math.min(1, float32[i]));
    view.setInt16(offset, s<0 ? s*0x8000 : s*0x7FFF, true);
    offset += 2;
  }
  return new Blob([view], {type:'audio/wav'});
}

/* Simple impulse for reverb (noise burst w/ exponential decay) */
function makeImpulse(ctx, seconds=1.2, decay=3.0){
  const rate = ctx.sampleRate, len = Math.floor(seconds*rate);
  const ir = ctx.createBuffer(2, len, rate);
  for(let ch=0; ch<2; ch++){
    const data = ir.getChannelData(ch);
    for(let i=0;i<len;i++){
      data[i] = (Math.random()*2-1) * Math.pow(1 - i/len, decay);
    }
  }
  return ir;
}

/* ---------- Render drum samples to WAV using OfflineAudioContext ---------- */
async function renderDrumWav(drumType, params, seconds=1.0){
  const sampleRate = 44100;
  const frames = Math.ceil(sampleRate*seconds);
  const ctx = new OfflineAudioContext(1, frames, sampleRate);

  const out = ctx.createGain(); out.gain.value = 0.9; out.connect(ctx.destination);

  if(drumType === 'kick'){
    // Kick drum synthesis
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lpf = ctx.createBiquadFilter(); lpf.type = 'lowpass';
    
    // Kit-based frequency and character
    const kit = params.kit || 'acoustic';
    let baseFreq = 60;
    if(kit === 'acoustic') baseFreq = 50;
    else if(kit === 'electronic') baseFreq = 65;
    else if(kit === 'glitch') baseFreq = 45;
    
    // Kick character (deep/808 vs tight/punchy)
    const kickChar = params.kick || 'deep/808';
    if(kickChar === 'deep/808'){
      osc.type = 'sine';
      lpf.frequency.value = 80;
      lpf.Q.value = 2.0;
      // Pitch envelope for 808-style
      osc.frequency.setValueAtTime(baseFreq * 2, 0);
      osc.frequency.exponentialRampToValueAtTime(baseFreq, 0.1);
      // Amplitude envelope
      gain.gain.setValueAtTime(0, 0);
      gain.gain.linearRampToValueAtTime(1, 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, 0.8);
    } else {
      osc.type = 'triangle';
      lpf.frequency.value = 120;
      lpf.Q.value = 0.8;
      // Tighter pitch envelope
      osc.frequency.setValueAtTime(baseFreq * 1.5, 0);
      osc.frequency.exponentialRampToValueAtTime(baseFreq, 0.05);
      // Punchy amplitude envelope
      gain.gain.setValueAtTime(0, 0);
      gain.gain.linearRampToValueAtTime(1, 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, 0.3);
    }
    
    osc.connect(lpf).connect(gain).connect(out);
    osc.start(0); osc.stop(seconds);
    
  } else if(drumType === 'snare'){
    // Snare drum synthesis (tone + noise)
    const toneOsc = ctx.createOscillator();
    const noiseGain = ctx.createGain();
    const toneGain = ctx.createGain();
    const hpf = ctx.createBiquadFilter(); hpf.type = 'highpass';
    const lpf = ctx.createBiquadFilter(); lpf.type = 'lowpass';
    
    // Generate noise
    const bufferSize = frames;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for(let i = 0; i < bufferSize; i++){
      noiseData[i] = Math.random() * 2 - 1;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    
    // Snare character (dry/tight vs bright/snappy)
    const snareChar = params.snare || 'dry/tight';
    if(snareChar === 'dry/tight'){
      toneOsc.frequency.value = 200;
      hpf.frequency.value = 300;
      lpf.frequency.value = 4000;
      lpf.Q.value = 0.5;
      // Dry envelope
      toneGain.gain.setValueAtTime(0, 0);
      toneGain.gain.linearRampToValueAtTime(0.6, 0.002);
      toneGain.gain.exponentialRampToValueAtTime(0.001, 0.15);
      noiseGain.gain.setValueAtTime(0, 0);
      noiseGain.gain.linearRampToValueAtTime(0.8, 0.001);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, 0.1);
    } else {
      toneOsc.frequency.value = 250;
      hpf.frequency.value = 500;
      lpf.frequency.value = 8000;
      lpf.Q.value = 1.2;
      // Snappy envelope
      toneGain.gain.setValueAtTime(0, 0);
      toneGain.gain.linearRampToValueAtTime(0.7, 0.001);
      toneGain.gain.exponentialRampToValueAtTime(0.001, 0.2);
      noiseGain.gain.setValueAtTime(0, 0);
      noiseGain.gain.linearRampToValueAtTime(1.0, 0.001);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, 0.15);
    }
    
    toneOsc.type = 'triangle';
    toneOsc.connect(toneGain).connect(out);
    noiseSource.connect(hpf).connect(lpf).connect(noiseGain).connect(out);
    
    toneOsc.start(0); toneOsc.stop(seconds);
    noiseSource.start(0); noiseSource.stop(seconds);
    
  } else if(drumType === 'hihat'){
    // Hi-hat synthesis (filtered noise)
    const noiseGain = ctx.createGain();
    const hpf = ctx.createBiquadFilter(); hpf.type = 'highpass';
    const lpf = ctx.createBiquadFilter(); lpf.type = 'lowpass';
    
    // Generate noise
    const bufferSize = frames;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for(let i = 0; i < bufferSize; i++){
      noiseData[i] = Math.random() * 2 - 1;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    
    // Kit-based character
    const kit = params.kit || 'acoustic';
    if(kit === 'acoustic'){
      hpf.frequency.value = 8000;
      lpf.frequency.value = 12000;
      hpf.Q.value = 0.5;
    } else if(kit === 'electronic'){
      hpf.frequency.value = 10000;
      lpf.frequency.value = 15000;
      hpf.Q.value = 1.0;
    } else { // glitch
      hpf.frequency.value = 6000;
      lpf.frequency.value = 18000;
      hpf.Q.value = 2.0;
    }
    
    // Quick hi-hat envelope
    noiseGain.gain.setValueAtTime(0, 0);
    noiseGain.gain.linearRampToValueAtTime(1, 0.001);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, 0.08);
    
    noiseSource.connect(hpf).connect(lpf).connect(noiseGain).connect(out);
    noiseSource.start(0); noiseSource.stop(seconds);
  }
  
  const rendered = await ctx.startRendering();
  const chan = rendered.getChannelData(0);
  
  // Fade edges to avoid clicks
  for(let i = 0; i < 512 && i < chan.length; i++){
    chan[i] *= i / 512;
    const j = chan.length - 1 - i;
    if(j >= 0) chan[j] *= i / 512;
  }
  
  return encodeWAV(chan, rendered.sampleRate);
}

/* ---------- Render single-note C4 to WAV using OfflineAudioContext ---------- */
async function renderC4Wav(instrument, params, seconds=2.0){
  const sampleRate = 44100;
  const frames = Math.ceil(sampleRate*seconds);
  const ctx = new OfflineAudioContext(1, frames, sampleRate);

  const out = ctx.createGain(); out.gain.value = 0.9; out.connect(ctx.destination);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const lpf  = ctx.createBiquadFilter(); lpf.type='lowpass'; lpf.frequency.value = 20000;
  const shaper = ctx.createWaveShaper();

  // Envelope helpers
  function applyEnv(gNode, when, attack, decay, sustain, release){
    const g = gNode.gain;
    g.setValueAtTime(0, when);
    g.linearRampToValueAtTime(1, when+attack);
    g.linearRampToValueAtTime(sustain, when+attack+decay);
    g.linearRampToValueAtTime(0, when+seconds); // release tail baked in render length
  }

  // Base frequency (C4)
  const C4 = 261.6255653006;

  if(instrument==='bass'){
    // Waveform
    const w = params.bassWave || 'sine';
    osc.type = (w==='sine'||w==='triangle'||w==='square'||w==='saw') ? w : 'sine';
    // Filter
    lpf.frequency.value = Math.max(60, Math.min(2000, params.bassCutHz||800));
    lpf.Q.value = params.bassEnv==='plucky' ? 0.4 : 0.2;
    // Envelope (plucky vs sustain)
    const a = params.bassEnv==='plucky' ? 0.005 : 0.01;
    const d = params.bassEnv==='plucky' ? 0.20  : 0.4;
    const s = params.bassEnv==='plucky' ? 0.15  : 0.7;
    applyEnv(gain, 0, a, d, s, 0.2);
    osc.frequency.value = C4;
    // chain
    osc.connect(lpf).connect(gain).connect(out);
  } else if(instrument==='lead'){
    // Timbre
    const t = params.leadTimbre || 'synth';
    if(t==='mellow')      osc.type = 'triangle';
    else if(t==='synth')  osc.type = 'sawtooth';
    else if(t==='driven') osc.type = 'sawtooth';
    else if(t==='airy')   osc.type = 'sine';
    else                  osc.type = 'sawtooth';

    // Optional waveshaping for 'driven'
    if(t==='driven'){
      // soft clip curve
      const curve = new Float32Array(1024);
      for(let i=0;i<curve.length;i++){
        const x = i/512 - 1;
        curve[i] = Math.tanh(2.5*x);
      }
      shaper.curve = curve; shaper.oversample = '4x';
    }

    // Envelope (staccato vs swell)
    const stacc = params.leadEnv==='staccato';
    const a = stacc ? 0.005 : 0.25;
    const d = stacc ? 0.15  : 0.40;
    const s = stacc ? 0.30  : 0.80;
    applyEnv(gain, 0, a, d, s, 0.2);

    // Reverb mix
    const wet = ctx.createGain(); const dry = ctx.createGain();
    const revMix = Math.max(0, Math.min(1, params.leadRev || 0.25));
    wet.gain.value = revMix; dry.gain.value = 1 - revMix;

    const convolver = ctx.createConvolver(); convolver.buffer = makeImpulse(ctx, 1.2, 3.0);

    // chain
    osc.frequency.value = C4;
    if(t==='driven'){
      osc.connect(shaper).connect(lpf).connect(gain);
    } else {
      osc.connect(lpf).connect(gain);
    }
    gain.connect(dry).connect(out);
    gain.connect(convolver).connect(wet).connect(out);

    // light filter to avoid harshness
    lpf.frequency.value = 8000; lpf.Q.value = 0.3;
  
  } else if(instrument==='solo'){
    // Solo instrument synthesis (hash-derived character)
    const soloChar = params.soloChar || 'melodic';
    const soloWave = params.soloWave || 'sawtooth';
    const soloMod = params.soloMod || 'none';
    const soloDelay = params.soloDelay || 0.2;
    
    // Main oscillator
    osc.type = soloWave;
    osc.frequency.value = C4;
    
    // Modulation setup
    let modOsc = null;
    if(soloMod !== 'none'){
      modOsc = ctx.createOscillator();
      const modGain = ctx.createGain();
      
      if(soloMod === 'vibrato'){
        modOsc.frequency.value = 5.5;  // Vibrato rate
        modGain.gain.value = 8;        // Vibrato depth
        modOsc.connect(modGain).connect(osc.frequency);
      } else if(soloMod === 'tremolo'){
        modOsc.frequency.value = 7.0;  // Tremolo rate
        modGain.gain.value = 0.3;      // Tremolo depth
        modOsc.connect(modGain).connect(gain.gain);
      } else if(soloMod === 'fm'){
        modOsc.frequency.value = C4 * 2.1;  // FM ratio
        modGain.gain.value = 200;           // FM index
        modOsc.connect(modGain).connect(osc.frequency);
      }
      
      modOsc.type = 'sine';
      modOsc.start(0);
      modOsc.stop(seconds);
    }
    
    // Character-based processing
    if(soloChar === 'melodic'){
      // Smooth, singing lead
      lpf.frequency.value = 6000;
      lpf.Q.value = 0.8;
      applyEnv(gain, 0, 0.1, 0.3, 0.8, 0.4);
    } else if(soloChar === 'percussive'){
      // Plucky, staccato
      lpf.frequency.value = 4000;
      lpf.Q.value = 1.2;
      applyEnv(gain, 0, 0.01, 0.2, 0.3, 0.1);
    } else if(soloChar === 'ambient'){
      // Ethereal, atmospheric
      lpf.frequency.value = 8000;
      lpf.Q.value = 0.3;
      applyEnv(gain, 0, 0.8, 0.5, 0.9, 1.0);
    } else if(soloChar === 'aggressive'){
      // Distorted, edgy
      const distortion = ctx.createWaveShaper();
      const curve = new Float32Array(2048);
      for(let i = 0; i < curve.length; i++){
        const x = i / 1024 - 1;
        curve[i] = Math.tanh(4 * x) * 0.8;
      }
      distortion.curve = curve;
      distortion.oversample = '4x';
      
      lpf.frequency.value = 3500;
      lpf.Q.value = 2.0;
      applyEnv(gain, 0, 0.02, 0.15, 0.7, 0.2);
      
      osc.connect(distortion).connect(lpf).connect(gain);
    }
    
    // Delay effect
    if(soloDelay > 0.05){
      const delayNode = ctx.createDelay(1.0);
      const delayGain = ctx.createGain();
      const feedback = ctx.createGain();
      const delayLPF = ctx.createBiquadFilter();
      
      delayNode.delayTime.value = soloDelay;
      delayGain.gain.value = 0.4;
      feedback.gain.value = 0.3;
      delayLPF.type = 'lowpass';
      delayLPF.frequency.value = 2000;
      
      // Delay chain
      if(soloChar !== 'aggressive'){
        gain.connect(delayNode);
      }
      delayNode.connect(delayLPF).connect(delayGain).connect(out);
      delayNode.connect(feedback).connect(delayNode);  // Feedback loop
    }
    
    // Main signal path (if not aggressive, which has custom routing)
    if(soloChar !== 'aggressive'){
      osc.connect(lpf).connect(gain).connect(out);
    }
  }

  osc.start(0); osc.stop(seconds);
  const rendered = await ctx.startRendering();
  const chan = rendered.getChannelData(0);
  // simple fade-out guard
  for(let i=0;i<2048 && i<chan.length;i++){ // fade-in
    chan[i] *= i/2048;
    const j = chan.length-1-i; if(j>=0){ chan[j] *= i/2048; }
  }
  return encodeWAV(chan, rendered.sampleRate);
}

/* ---------- UI ---------- */
document.addEventListener('DOMContentLoaded', function() {
  const $ = s=>document.querySelector(s);
  const els = {
    algo: $('#algo'), input: $('#input'), len: $('#len'),
    keymode: $('#keymode'), root: $('#root'), scale: $('#scale'),
    manualRootBox: $('#manualRootBox'), manualScaleBox: $('#manualScaleBox'),
    go: $('#go'), dl: $('#download'),
    digestPanel: $('#digestPanel'), outAlgo: $('#outAlgo'), outLen: $('#outLen'), outHex: $('#outHex'),
    suggestPanel: $('#suggestPanel'), outExplain: $('#outExplain'), outLines: $('#outLines'),
    audioPanel: $('#audioPanel'), renderAllBtn: document.getElementById('renderAll'), renderStatus: $('#renderStatus'),
    debugContent: $('#debugContent'),
    bassLink: $('#bassLink'), leadLink: $('#leadLink'), soloLink: $('#soloLink'),
    renderDrumsBtn: $('#renderDrums'), drumStatus: $('#drumStatus'),
    kickLink: $('#kickLink'), snareLink: $('#snareLink'), hihatLink: $('#hihatLink')
  };

  let lastReport = '';
  let lastHex = '';
  let lastSuggestions = null;

  els.keymode.addEventListener('change', ()=>{
    const manual = els.keymode.value === 'Manual';
    els.manualRootBox.classList.toggle('hide', !manual);
    els.manualScaleBox.classList.toggle('hide', !manual);
  });

  els.go.addEventListener('click', async ()=>{
    const algo = els.algo.value;
    const text = els.input.value || '';
    const previewSteps = parseInt(els.len.value,10);
    const keyMode = els.keymode.value;
    const manualRoot = els.root.value;
    const manualScale = els.scale.value;

    try{
      const hex = await hashText(text, algo);
      lastHex = hex;

      els.outAlgo.textContent = `${algo}`;
      els.outLen.textContent = `${hex.length} hex chars`;
      els.outHex.textContent = hex;
      els.digestPanel.hidden = false;

      const s = suggestionsFromDigest(hex, keyMode, manualRoot, manualScale, previewSteps);
      lastSuggestions = s;

      els.outExplain.innerHTML = s.explainHTML;
      els.outLines.textContent = s.linesText;
      els.suggestPanel.hidden = false;

      // Populate debug panel (if present)
      if(els.debugContent){
        try{
          els.debugContent.textContent = buildDebugText(lastHex, lastSuggestions);
          const dp = document.getElementById('debugPanel'); if(dp) dp.removeAttribute('hidden');
        }catch(e){ /* ignore debug panel errors */ }
      }

      lastReport =
  `Title: Preimage::Collision — Musical Suggestions
  Input: ${text}
  Algorithm: ${algo}

  Digest (${s.meta.steps} hex):
  ${hex}

  ${s.explainHTML.replace(/<[^>]+>/g,'')}
  ${s.linesText}
  `;
      els.dl.disabled = false;

      // show audio panel
      els.audioPanel.hidden = false;
      els.renderStatus.textContent = '';
      els.drumStatus.textContent = '';
      els.bassLink.classList.add('hide');
      els.leadLink.classList.add('hide');
      els.soloLink.classList.add('hide');
      els.kickLink.classList.add('hide');
      els.snareLink.classList.add('hide');
      els.hihatLink.classList.add('hide');
      els.bassLink.removeAttribute('href');
      els.leadLink.removeAttribute('href');
      els.soloLink.removeAttribute('href');
      els.kickLink.removeAttribute('href');
      els.snareLink.removeAttribute('href');
      els.hihatLink.removeAttribute('href');
    }catch(err){
      alert('Hashing failed: ' + err);
    }
  });

  els.dl.addEventListener('click', ()=>{
    if(!lastReport) return;
    const blob = new Blob([lastReport],{type:'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href=url; a.download='preimage-collision_suggestions.txt';
    document.body.appendChild(a); a.click();
    setTimeout(()=>{URL.revokeObjectURL(url); a.remove();},0);
  });

  if (els.renderAllBtn) {
    // ensure a robust reference if querySelector returned null earlier
    els.renderAllBtn = els.renderAllBtn || document.getElementById('renderAll') || document.querySelector('#renderAll');
    els.renderAllBtn.addEventListener('click', async ()=>{
      if(!lastSuggestions){ els.renderStatus.textContent='Generate suggestions first.'; return; }
      els.renderStatus.textContent = 'Rendering all instruments...';
      try{
        const bassBlob = await renderC4Wav('bass', lastSuggestions.bass, 2.0);
        const leadBlob = await renderC4Wav('lead', lastSuggestions.lead, 2.2);
        const soloBlob = await renderC4Wav('solo', lastSuggestions.solo, 3.0);

        const bassURL = URL.createObjectURL(bassBlob);
        const leadURL = URL.createObjectURL(leadBlob);
        const soloURL = URL.createObjectURL(soloBlob);

        els.bassLink.href = bassURL; els.bassLink.classList.remove('hide');
        els.leadLink.href = leadURL; els.leadLink.classList.remove('hide');
        els.soloLink.href = soloURL; els.soloLink.classList.remove('hide');
        els.renderStatus.textContent = 'All instruments rendered. Click to download.';
      }catch(e){
        els.renderStatus.textContent = 'Render failed: '+e;
      }
    });
  }


  els.renderDrumsBtn.addEventListener('click', async ()=>{
    if(!lastSuggestions){ els.drumStatus.textContent='Generate suggestions first.'; return; }
    els.drumStatus.textContent = 'Rendering drums...';
    try{
      // Render all three drum samples
      const kickBlob = await renderDrumWav('kick', lastSuggestions.drums, 1.0);
      const snareBlob = await renderDrumWav('snare', lastSuggestions.drums, 0.8);
      const hihatBlob = await renderDrumWav('hihat', lastSuggestions.drums, 0.3);

      const kickURL = URL.createObjectURL(kickBlob);
      const snareURL = URL.createObjectURL(snareBlob);
      const hihatURL = URL.createObjectURL(hihatBlob);

      els.kickLink.href = kickURL; els.kickLink.classList.remove('hide');
      els.snareLink.href = snareURL; els.snareLink.classList.remove('hide');
      els.hihatLink.href = hihatURL; els.hihatLink.classList.remove('hide');
      els.drumStatus.textContent = 'Done. Click to download drum samples.';
    }catch(e){
      els.drumStatus.textContent = 'Drum render failed: '+e;
    }
  });
});