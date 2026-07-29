/* ===== STATE ===== */
let S = load();

function defState() {
  return {
    coins: 0, energy: 2500, maxEnergy: 2500, perClick: 2, perSec: 0,
    lvl: 1, xp: 0, xpNext: 100, boostCD: 0, bossHp: 0, bossMaxHp: 15000,
    bossTimer: 0, bossActive: false, friends: 0, dailyClaimed: 0,
    lastDailyCheck: '', crates: 0, inventory: [], items: [],
    rank: 'Bronz', league: 'Bronz', leagueScore: 0, lastSave: Date.now(),
    totalTaps: 0, totalEarned: 0, bestCombo: 0, bossWins: 0, gems: 0,
    username: '', settings: { musicOn: true, musicVol: 0.5, sfxOn: true, sfxVol: 0.5, botUsername: 'Rat_combatbot' },
    comboGuess: [], comboGuessedToday: '', tutorialDone: false, dailyInvites: 0, inviteDate: '', refCode: '',
    multiTap: 1, energyRegenBonus: 0, offlineStamp: 0, dailyStreak: 0, dailyLastClaim: '',
    totalOffline: 0, comboMilestones: [], lvlMilestones: [], prestige: 0, autoBuyOn: false, favorites: [],
    wheelFreeDate: '', dailyTasks: {}, gemsSpent: 0, achieved: [],
  };
}

function load() {
  try {
    const r = JSON.parse(localStorage.getItem('hk_state'));
    if (r && r.coins !== undefined) return r;
  } catch (_) { }
  return defState();
}

function save() {
  S.lastSave = Date.now();
  localStorage.setItem('hk_state', JSON.stringify(S));
}

function initVars() {
  const d = defState();
  Object.keys(d).forEach(k => {
    if (k === 'settings') {
      if (!S.settings) S.settings = { ...d.settings };
      else Object.keys(d.settings).forEach(sk => { if (S.settings[sk] === undefined) S.settings[sk] = d.settings[sk]; });
    } else if (S[k] === undefined) S[k] = d[k];
  });
  if (S.energy < 1 || S.energy <= 0) S.energy = S.maxEnergy;
  if (!S.refCode) S.refCode = Math.random().toString(36).substring(2, 10).toUpperCase();
}
initVars();

/* ===== CARD DATA ===== */
const RARITY = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
const RARITY_COLORS = ['#85827d', '#2ed573', '#3498db', '#9b59b6', '#f39c12'];

const CARDS = [
  { id: 'pickaxe', name: 'Kazma', icon: '⛏️', cat: 'miners', b: 25, baseSec: 1, rarity: 'common', desc: 'Taş kırmak için basit kazma' },
  { id: 'drill', name: 'Matkap', icon: '🛠️', cat: 'miners', b: 60, baseSec: 2, rarity: 'common', desc: 'Daha hızlı deler' },
  { id: 'shovel', name: 'Kürek', icon: '🪣', cat: 'miners', b: 100, baseSec: 3, rarity: 'uncommon', desc: 'Geniş ağızlı verimli kürek' },
  { id: 'pick', name: 'Elmas Kazma', icon: '🔨', cat: 'miners', b: 200, baseSec: 6, rarity: 'uncommon', desc: 'Ucu elmas kaplı kazma' },
  { id: 'jackhammer', name: 'Kırıcı', icon: '⚡', cat: 'miners', b: 500, baseSec: 12, rarity: 'rare', desc: 'Pnömatik kırıcı makina' },
  { id: 'laserdrill', name: 'Lazer Matkap', icon: '💥', cat: 'miners', b: 1200, baseSec: 25, rarity: 'rare', desc: 'Yüksek enerjili lazer delici' },
  { id: 'excavator', name: 'Ekskavatör', icon: '🚜', cat: 'miners', b: 3000, baseSec: 50, rarity: 'epic', desc: 'Dev hidrolik ekskavatör' },
  { id: 'nucleardrill', name: 'Nükleer Delici', icon: '☢️', cat: 'miners', b: 8000, baseSec: 100, rarity: 'epic', desc: 'Nükleer enerjiyle çalışan delici' },
  { id: 'quantumrig', name: 'Kuantum Tesisi', icon: '🪐', cat: 'miners', b: 20000, baseSec: 250, rarity: 'legendary', desc: 'Kuantum madencilik ünitesi' },
  { id: 'voidcore', name: 'Boşluk Çekirdeği', icon: '🌀', cat: 'miners', b: 50000, baseSec: 600, rarity: 'legendary', desc: 'Boyutlararası enerji toplayıcı' },
  { id: 'helmet', name: 'Çelik Kask', icon: '🪖', cat: 'items', b: 30, rarity: 'common', desc: 'Temel koruma' },
  { id: 'shoe', name: 'Yerçekimsiz Bot', icon: '👟', cat: 'items', b: 60, rarity: 'common', desc: 'Daha hızlı hareket' },
  { id: 'glove', name: 'Şok Eldiven', icon: '🧤', cat: 'items', b: 100, rarity: 'uncommon', desc: 'Titreşimli güç eldiveni' },
  { id: 'lantern', name: 'Karanlık Feneri', icon: '🏮', cat: 'items', b: 150, rarity: 'uncommon', desc: 'Derin madenleri aydınlatır' },
  { id: 'armor', name: 'Titanyum Zırh', icon: '🛡️', cat: 'items', b: 400, rarity: 'rare', desc: 'Hafif ama dayanıklı zırh' },
  { id: 'jetpack', name: 'Jetpack', icon: '🚀', cat: 'items', b: 800, rarity: 'rare', desc: 'Uçmanı sağlar' },
  { id: 'forcefield', name: 'Güç Alanı', icon: '🔮', cat: 'items', b: 2000, rarity: 'epic', desc: 'Enerji kalkanı' },
  { id: 'cloak', name: 'Görünmezlik Pelerini', icon: '👻', cat: 'items', b: 5000, rarity: 'epic', desc: 'Işığı büker' },
  { id: 'timewatch', name: 'Zaman Saati', icon: '⌛', cat: 'items', b: 15000, rarity: 'legendary', desc: 'Zamanı yavaşlatır' },
  { id: 'coffee', name: 'Kahve', icon: '☕', cat: 'boosts', b: 40, rarity: 'common', desc: '+100 Enerji', bonusEnergy: 100 },
  { id: 'energyDrink', name: 'Enerji İçeceği', icon: '🧃', cat: 'boosts', b: 90, rarity: 'common', desc: '+250 Enerji', bonusEnergy: 250 },
  { id: 'battery', name: 'Batarya', icon: '🔋', cat: 'boosts', b: 200, rarity: 'uncommon', desc: '+500 Enerji', bonusEnergy: 500 },
  { id: 'solarpanel', name: 'Güneş Paneli', icon: '☀️', cat: 'boosts', b: 600, rarity: 'rare', desc: '+1000 Enerji', bonusEnergy: 1000 },
  { id: 'fusion', name: 'Füzyon Reaktörü', icon: '⚛️', cat: 'boosts', b: 2000, rarity: 'epic', desc: '+2500 Enerji', bonusEnergy: 2500 },
  { id: 'infinity', name: 'Sonsuzluk Çekirdeği', icon: '♾️', cat: 'boosts', b: 8000, rarity: 'legendary', desc: '+5000 Enerji', bonusEnergy: 5000 },
  // retro (level 250+)
  { id: '8bit_sword', name: '8-Bit Kılıç', icon: '🗡️', cat: 'retro', b: 100000, baseClick: 5, rarity: 'legendary', desc: 'Retro güç +5/tık', levelReq: 250 },
  { id: 'pixel_shield', name: 'Pixel Kalkan', icon: '🛡️', cat: 'retro', b: 80000, bonusMaxEnergy: 200, rarity: 'legendary', desc: '+200 max enerji', levelReq: 250 },
  { id: 'retro_crown', name: 'Retro Taç', icon: '👑', cat: 'retro', b: 150000, baseSec: 500, rarity: 'legendary', desc: '+500/s pasif', levelReq: 250 },
  { id: 'game_cart', name: 'Oyun Kartuşu', icon: '📼', cat: 'retro', b: 200000, baseCombo: 0.3, rarity: 'legendary', desc: '+0.3x combo çarpanı', levelReq: 250 },
  { id: 'arcade', name: 'Atari Makinesi', icon: '🕹️', cat: 'retro', b: 250000, baseCrit: 0.05, rarity: 'legendary', desc: '+%5 kritik şansı', levelReq: 250 },
  { id: 'gold_joystick', name: 'Altın Joystick', icon: '🎮', cat: 'retro', b: 500000, baseClick: 3, baseSec: 100, rarity: 'legendary', desc: '+3/tık +100/s', levelReq: 250 },
];

function getItemLevel(cardId) {
  const it = S.items.find(x => x.id === cardId);
  return it ? it.lvl : 0;
}

function setItemLevel(cardId, lvl) {
  const it = S.items.find(x => x.id === cardId);
  if (it) it.lvl = lvl;
  else S.items.push({ id: cardId, lvl });
}

function cardCost(card) {
  return Math.floor(card.b * Math.pow(1.25, getItemLevel(card.id) + 1));
}

/* ===== ACHIEVEMENTS ===== */
const ACH = [
  { id: 'tap100', icon: '👆', name: '100 Tık', desc: 'Toplam 100 tık yap', check: s => s.totalTaps >= 100, gem: 5 },
  { id: 'tap1k', icon: '💪', name: '1.000 Tık', desc: 'Toplam 1.000 tık yap', check: s => s.totalTaps >= 1000, gem: 15 },
  { id: 'tap10k', icon: '🦾', name: '10.000 Tık', desc: 'Toplam 10.000 tık yap', check: s => s.totalTaps >= 10000, gem: 50 },
  { id: 'tap100k', icon: '🤖', name: '100.000 Tık', desc: 'Toplam 100.000 tık yap', check: s => s.totalTaps >= 100000, gem: 200 },
  { id: 'earn10k', icon: '💰', name: '10K Coin', desc: 'Toplam 10.000 Coin kazan', check: s => s.totalEarned >= 10000, gem: 10 },
  { id: 'earn1m', icon: '🤑', name: '1M Coin', desc: 'Toplam 1.000.000 Coin kazan', check: s => s.totalEarned >= 1e6, gem: 50 },
  { id: 'earn100m', icon: '💵', name: '100M Coin', desc: 'Toplam 100.000.000 Coin kazan', check: s => s.totalEarned >= 1e8, gem: 300 },
  { id: 'earn1b', icon: '🏦', name: '1B Coin', desc: 'Toplam 1.000.000.000 Coin kazan', check: s => s.totalEarned >= 1e9, gem: 1000 },
  { id: 'lvl5', icon: '⭐', name: 'Level 5', desc: 'Level 5 ol', check: s => s.lvl >= 5, gem: 10 },
  { id: 'lvl10', icon: '🌟', name: 'Level 10', desc: 'Level 10 ol', check: s => s.lvl >= 10, gem: 25 },
  { id: 'lvl25', icon: '🏅', name: 'Level 25', desc: 'Level 25 ol', check: s => s.lvl >= 25, gem: 100 },
  { id: 'lvl50', icon: '👑', name: 'Level 50', desc: 'Level 50 ol', check: s => s.lvl >= 50, gem: 300 },
  { id: 'master100', icon: '💎', name: 'Level 100', desc: 'Level 100 ol', check: s => s.lvl >= 100, gem: 1000 },
  { id: 'boss', icon: '🏆', name: 'Boss Avcısı', desc: 'Boss\'u 1 kere yen', check: s => s.bossWins >= 1, gem: 30 },
  { id: 'boss10', icon: '⚔️', name: 'Boss Ustası', desc: 'Boss\'u 10 kere yen', check: s => s.bossWins >= 10, gem: 150 },
  { id: 'combo10', icon: '🔥', name: '10 Combo', desc: '10 combo\'ya ulaş', check: s => s.bestCombo >= 10, gem: 10 },
  { id: 'combo50', icon: '💥', name: '50 Combo', desc: '50 combo\'ya ulaş', check: s => s.bestCombo >= 50, gem: 40 },
  { id: 'combo100', icon: '🌋', name: '100 Combo', desc: '100 combo\'ya ulaş', check: s => s.bestCombo >= 100, gem: 150 },
  { id: 'friend5', icon: '👥', name: 'Popüler', desc: '5 arkadaş davet et', check: s => s.friends >= 5, gem: 20 },
  { id: 'friend20', icon: '👨‍👩‍👧‍👧', name: 'Sosyal Kelebek', desc: '20 arkadaş davet et', check: s => s.friends >= 20, gem: 100 },
  { id: 'crate', icon: '📦', name: 'Kasa Koleksiyoncusu', desc: '10 kasa aç', check: s => s.crates >= 10, gem: 35 },
  { id: 'crate100', icon: '🗃️', name: 'Kasa Bağımlısı', desc: '100 kasa aç', check: s => s.crates >= 100, gem: 500 },
  { id: 'lvl250', icon: '👑', name: 'Level 250', desc: 'Level 250 ol', check: s => s.lvl >= 250, gem: 5000 },
  { id: 'offline', icon: '😴', name: 'Uyuyan CEO', desc: 'Offline kazanç topla', check: s => (s.totalOffline || 0) >= 100000, gem: 30 },
  { id: 'streak7', icon: '📅', name: 'Haftalık', desc: '7 gün üst üste giriş', check: s => (s.dailyStreak || 0) >= 7, gem: 80 },
  { id: 'streak30', icon: '🔥', name: 'Azimli', desc: '30 gün üst üste giriş', check: s => (s.dailyStreak || 0) >= 30, gem: 500 },
  { id: 'multitap5', icon: '👆', name: 'Hızlı Parmak', desc: 'Çoklu tık seviye 5', check: s => (s.multiTap || 1) >= 5, gem: 100 },
  { id: 'multitap10', icon: '🤯', name: 'Sonic Parmak', desc: 'Çoklu tık seviye 10', check: s => (s.multiTap || 1) >= 10, gem: 500 },
  { id: 'regen5', icon: '⚡', name: 'Sonsuz Enerji', desc: 'Enerji yenilenme +5/s', check: s => (s.energyRegenBonus || 0) >= 5, gem: 200 },
  { id: 'regen10', icon: '🔋', name: 'Nükleer Enerji', desc: 'Enerji yenilenme +10/s', check: s => (s.energyRegenBonus || 0) >= 10, gem: 1000 },
  { id: 'prestige', icon: '🔄', name: 'Yeniden Doğuş', desc: 'Prestige yap', check: s => (s.prestige || 0) >= 1, gem: 500 },
  { id: 'allcards', icon: '🃏', name: 'Kart Koleksiyoncusu', desc: 'Tüm kartlara sahip ol', check: s => CARDS.every(c => getItemLevel(c.id) > 0), gem: 1000 },
  { id: 'maxcard', icon: '💫', name: 'Maksimum Kart', desc: 'Bir kartı max seviye (9999) yap', check: s => CARDS.some(c => getItemLevel(c.id) >= 9999), gem: 5000 },
  { id: 'earn10m', icon: '💎', name: '10M Coin', desc: 'Toplam 10.000.000 Coin kazan', check: s => s.totalEarned >= 1e7, gem: 150 },
  { id: 'allretro', icon: '🕹️', name: 'Retro Koleksiyon', desc: 'Tüm retro kartlara sahip ol', check: s => CARDS.filter(c => c.cat === 'retro').every(c => getItemLevel(c.id) > 0), gem: 2000 },
];

function checkAch() {
  if (!S.achieved) S.achieved = [];
  ACH.forEach(a => {
    if (S.achieved.includes(a.id)) return;
    if (a.check(S)) {
      S.achieved.push(a.id);
      if (a.gem) { S.gems += a.gem; sfxGem(); }
      const notif = document.createElement('div');
      notif.className = 'ach-notif';
      notif.innerHTML = `<span style="font-size:32px;">${a.icon}</span><div><div style="font-weight:700;">🏅 Başarım!</div><div style="font-size:11px;color:#f3ba2f;">${a.name}</div><div style="font-size:11px;">+${a.gem}💎</div></div>`;
      document.body.appendChild(notif);
      setTimeout(() => { notif.style.opacity = '0'; notif.style.transform = 'translateX(80px)'; setTimeout(() => notif.remove(), 400); }, 3000);
      toast(`🏅 ${a.name}! +${a.gem}💎`);
      coinRain(12);
      sfxGem();
    }
  });
}

function getAchProgress(a) {
  if (a.id === 'tap10k' || a.id === 'tap100k') {
    const targets = {tap10k:10000,tap100k:100000};
    return Math.min(100, ((S.totalTaps||0) / targets[a.id]) * 100);
  }
  if (a.id === 'earn1m' || a.id === 'earn100m' || a.id === 'earn1b') {
    const targets = {earn1m:1e6,earn100m:1e8,earn1b:1e9};
    return Math.min(100, ((S.totalEarned||0) / targets[a.id]) * 100);
  }
  if (a.id === 'lvl50' || a.id === 'master100' || a.id === 'lvl250') {
    const targets = {lvl50:50,master100:100,lvl250:250};
    return Math.min(100, (S.lvl / targets[a.id]) * 100);
  }
  if (a.id === 'boss10') {
    return Math.min(100, ((S.bossWins||0) / 10) * 100);
  }
  if (a.id === 'combo10' || a.id === 'combo50' || a.id === 'combo100') {
    const targets = {combo10:10,combo50:50,combo100:100};
    return Math.min(100, ((S.bestCombo||0) / targets[a.id]) * 100);
  }
  if (a.id === 'crate' || a.id === 'crate100') {
    const targets = {crate:10,crate100:100};
    return Math.min(100, ((S.crates||0) / targets[a.id]) * 100);
  }
  if (a.id === 'friend5') return Math.min(100, ((S.friends||0) / 5) * 100);
  if (a.id === 'friend20') return Math.min(100, ((S.friends||0) / 20) * 100);
  if (a.id === 'streak7') return Math.min(100, ((S.dailyStreak||0) / 7) * 100);
  if (a.id === 'streak30') return Math.min(100, ((S.dailyStreak||0) / 30) * 100);
  if (a.id === 'multitap5') return Math.min(100, ((S.multiTap||1) / 5) * 100);
  if (a.id === 'multitap10') return Math.min(100, ((S.multiTap||1) / 10) * 100);
  if (a.id === 'regen5') return Math.min(100, ((S.energyRegenBonus||0) / 5) * 100);
  if (a.id === 'regen10') return Math.min(100, ((S.energyRegenBonus||0) / 10) * 100);
  if (a.id === 'offline') return Math.min(100, ((S.totalOffline||0) / 100000) * 100);
  if (a.id === 'allcards') {
    const owned = CARDS.filter(c => getItemLevel(c.id) > 0).length;
    return Math.min(100, (owned / CARDS.length) * 100);
  }
  return 0;
}

function renderAch() {
  const el = $('achievementList');
  if (!el) return;
  if (!S.achieved) S.achieved = [];
  el.className = 'ach-grid';
  el.innerHTML = ACH.map(a => {
    const done = S.achieved.includes(a.id);
    const prog = getAchProgress(a);
    return `<div class="ach-item${done ? ' ach-done' : ''}">
      <span class="ach-icon">${a.icon}</span>
      <div class="ach-body">
        <div class="ach-name">${a.name}</div>
        <div class="ach-desc">${a.desc}</div>
        ${!done && prog > 0 ? `<div style="width:100%;height:3px;background:rgba(255,255,255,.08);border-radius:2px;margin-top:3px;"><div style="width:${prog}%;height:100%;background:linear-gradient(90deg,#f3ba2f,#ff9f43);border-radius:2px;transition:width .5s;"></div></div>` : ''}
      </div>
      <span class="ach-prog">${done ? '✓' : a.gem ? `${a.gem}💎` : '🔒'}</span>
    </div>`;
  }).join('');
}

/* ===== DOM REFS ===== */
const $ = id => document.getElementById(id);

/* ===== SOUND ENGINE ===== */
let audioCtx = null;

function initAudio() {
  if (!audioCtx) audioCtx = new(window.AudioContext || window.webkitAudioContext)();
}

function playTone(freq, duration, type, vol) {
  try {
    initAudio();
    if (!S.settings.sfxOn) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, audioCtx.currentTime);
    g.gain.setValueAtTime((vol || S.settings.sfxVol || 0.5) * 0.15, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (duration || 0.15));
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + (duration || 0.15));
  } catch (_) {}
}

function sfxTap() { playTone(800 + Math.random() * 200, 0.05, 'sine', 0.25); }

function sfxCrit() { playTone(1200, 0.1, 'square', 0.4);
  playTone(1600, 0.08, 'sine', 0.3);
  playTone(2000, 0.06, 'sine', 0.2); }

function sfxCombo() { playTone(500, 0.06, 'triangle', 0.25);
  setTimeout(() => playTone(700, 0.06, 'triangle', 0.25), 50);
  setTimeout(() => playTone(900, 0.06, 'triangle', 0.25), 100); }

function sfxLevelUp() {
  [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => playTone(f, 0.15, 'sine', 0.4), i * 80)); }

function sfxBuy() { playTone(660, 0.08, 'sine', 0.3);
  setTimeout(() => playTone(880, 0.08, 'sine', 0.3), 60);
  setTimeout(() => playTone(1100, 0.08, 'sine', 0.3), 120); }
function sfxCardBuy() { playTone(440, 0.1, 'square', 0.2);
  setTimeout(() => playTone(660, 0.1, 'square', 0.2), 80);
  setTimeout(() => playTone(880, 0.1, 'square', 0.2), 160);
  setTimeout(() => playTone(1100, 0.15, 'square', 0.2), 240); }

function sfxGem() { playTone(1400, 0.08, 'sine', 0.3);
  setTimeout(() => playTone(1800, 0.08, 'sine', 0.3), 60); }

function sfxSkin() { playTone(800, 0.1, 'sine', 0.3);
  setTimeout(() => playTone(1000, 0.1, 'sine', 0.3), 80);
  setTimeout(() => playTone(1200, 0.1, 'sine', 0.3), 160); }

function sfxBossHit() { playTone(200, 0.12, 'sawtooth', 0.25); }

function sfxBossKill() {
  [200, 300, 400, 500].forEach((f, i) => setTimeout(() => playTone(f, 0.12, 'square', 0.3), i * 60)); }
function sfxMultitap() { playTone(1800, 0.03, 'sine', 0.15); }
/* ===== NOTIFICATION SYSTEM ===== */
function updateBadge() {
  const earnBtn = document.querySelector('.nav-btn[data-tab="tab-earn"] .nav-icon');
  if (!earnBtn) return;
  const today = new Date().toDateString();
  const hasDaily = S.dailyLastClaim !== today;
  const hasTasks = DAILY_TASKS.some(t => !S.dailyTasks?.[t.id] && t.check(S));
  const hasAch = ACH.some(a => !S.achieved?.includes(a.id) && a.check(S));
  const hasReward = hasDaily || hasTasks || hasAch;
  earnBtn.style.position = 'relative';
  let dot = earnBtn.querySelector('.notif-dot');
  if (hasReward) {
    if (!dot) { dot = document.createElement('span'); dot.className = 'notif-dot'; dot.style.cssText = 'position:absolute;top:-2px;right:-6px;width:10px;height:10px;background:#ff4757;border-radius:50%;border:2px solid #000;'; earnBtn.appendChild(dot); }
  } else if (dot) dot.remove();
}

/* ===== UPDATE UI ===== */
let coinAnimId = null;
let coinDisplayTarget = 0;
let coinDisplayCurrent = 0;

function animateCoin() {
  if (coinAnimId) cancelAnimationFrame(coinAnimId);
  const step = () => {
    const diff = coinDisplayTarget - coinDisplayCurrent;
    if (Math.abs(diff) < 1) { coinDisplayCurrent = coinDisplayTarget; $('coinDisplay').textContent = fmt(coinDisplayTarget); return; }
    coinDisplayCurrent += Math.max(1, Math.floor(diff * 0.15));
    $('coinDisplay').textContent = fmt(Math.floor(coinDisplayCurrent));
    coinAnimId = requestAnimationFrame(step);
  };
  step();
}

function update() {
  coinDisplayTarget = S.coins;
  animateCoin();
  const pct = S.maxEnergy > 0 ? (S.energy / S.maxEnergy) * 100 : 0;
  $('energyDisplay').textContent = `${Math.floor(S.energy)}/${S.maxEnergy}`;
  let pctEl = $('energyPct');
  if (!pctEl) { pctEl = document.createElement('span'); pctEl.id = 'energyPct'; pctEl.style.cssText = 'font-size:9px;color:#8e9cb5;margin-left:4px;'; $('energyDisplay').after(pctEl); }
  pctEl.textContent = `(${Math.round(pct)}%)`;
  let restoreEl = $('energyRestore');
  if (!restoreEl) { restoreEl = document.createElement('span'); restoreEl.id = 'energyRestore'; restoreEl.style.cssText = 'font-size:9px;color:#8e9cb5;margin-left:6px;'; $('energyPct').after(restoreEl); }
  restoreEl.textContent = pct < 100 ? `⏳${getEnergyRestoreTime()}` : '';
  $('energyFill').style.width = pct + '%';
  const segEl = $('energySegments');
  if (segEl) {
    const segs = Math.floor(pct / 10);
    segEl.innerHTML = '<div style="display:flex;gap:1px;height:4px;margin-top:2px;">' + Array.from({length: 10}, (_, i) => 
      `<div style="flex:1;background:${i < segs ? (pct > 50 ? '#2ed573' : pct > 25 ? '#f39c12' : '#ff4757') : 'rgba(255,255,255,.1)'};border-radius:2px;transition:background .3s;"></div>`
    ).join('') + '</div>';
  }
  $('energyFill').style.transition = pct < 25 ? 'width 0.1s' : 'width 0.3s cubic-bezier(.34,1.56,.64,1)';
  if (pct > 50) { $('energyFill').style.background = '#2ed573'; $('energyFill').style.boxShadow = pct > 90 ? '0 0 18px rgba(46,213,115,.5)' : '0 0 8px rgba(46,213,115,.2)'; }
  else if (pct > 25) { $('energyFill').style.background = '#f39c12'; $('energyFill').style.boxShadow = '0 0 8px rgba(243,156,18,.2)'; }
  else { $('energyFill').style.background = '#ff4757'; $('energyFill').style.boxShadow = '0 0 12px rgba(255,71,87,.4)'; $('energyFill').style.animation = 'energyLow 1s ease-in-out infinite'; }
  const pph = S.items.reduce((sum, it) => {
    const c = CARDS.find(x => x.id === it.id);
    return c ? sum + (c.baseSec || 0) * it.lvl : sum;
  }, 0);
  const setMult = getSetBonusMult();
  S.perSec = Math.floor(pph * setMult);
  const setEnergyBonus = getSetEnergyBonus();
  S.maxEnergy = 2500 + setEnergyBonus * 2500;
  const maxEngBonus = S.items.reduce((sum, it) => {
    const c = CARDS.find(x => x.id === it.id);
    return c && c.bonusMaxEnergy ? sum + c.bonusMaxEnergy * it.lvl : sum;
  }, 0);
  S.maxEnergy += maxEngBonus;
  const perSecDisplay = S.perSec * getX2Mult();
  $('perSecText').textContent = '+' + fmt(perSecDisplay) + (isX2() ? ' x2' : '');
  const perHrEl = $('perHourText');
  if (perHrEl) perHrEl.textContent = `(${fmt(perSecDisplay * 3600)}/saat)`;
  const perHourShort = $('phShort');
  if (perHourShort) perHourShort.textContent = fmt(perSecDisplay * 3600) + '/saat';
  updateEnergyBar();
  const userDisp = $('userDisplay');
  if (userDisp) userDisp.textContent = S.username && S.username.trim() ? S.username.trim() : 'Misafir';
  updateLastActive();
  const setClickMult = calcSetBonuses().some(s => s.bonus >= 1) ? 2 : 1;
  const clickBonus = S.items.reduce((sum, it) => {
    const c = CARDS.find(x => x.id === it.id);
    let b = (c && c.cat !== 'boosts') ? it.lvl * 0.1 : 0;
    if (c && c.baseClick) b += c.baseClick * it.lvl;
    return sum + b;
  }, 0);
  S.perClick = Math.floor((2 + clickBonus) * setClickMult);
  const tapValEl = $('perTapText');
  if (tapValEl) tapValEl.textContent = '/tık: ' + fmt(Math.floor(S.perClick)) + (isX2() ? ' 🔥x2' : '');
  const x2Indicator = $('x2Indicator');
  if (x2Indicator) {
    if (isX2()) {
      const rem = Math.max(0, Math.ceil((x2End - Date.now()) / 1000));
      x2Indicator.textContent = `🔥 2x ${rem}s`;
      x2Indicator.style.display = 'inline';
      x2Indicator.style.animation = 'x2Pulse .8s ease-in-out infinite';
      x2Indicator.style.color = rem < 10 ? '#ff4757' : '#f3ba2f';
    } else {
      x2Indicator.style.display = 'none';
    }
  }
  updateTapStyle();
  const xpPct = Math.min(100, (S.xp / S.xpNext) * 100);
  $('lvlProgressFill').style.width = xpPct + '%';
  const xpEl = $('xpText');
  if (xpEl) xpEl.textContent = `${Math.floor(S.xp)}/${S.xpNext} XP`;
  const rnk = rankTitle(S.lvl);
  S.rank = rnk;
  $('rankTitle').textContent = rnk;
  $('lvlText').textContent = S.lvl;
  $('bossLvlText').textContent = `Seviye: ${S.lvl}/15`;
  $('bossLvlFill').style.width = Math.min(100, (S.lvl / 15) * 100) + '%';
  if (S.lvl >= 15) {
    $('bossLocked').classList.add('hidden');
    $('bossUnlocked').classList.remove('hidden');
  } else {
    $('bossLocked').classList.remove('hidden');
    $('bossUnlocked').classList.add('hidden');
  }
  $('friendCount').textContent = S.friends;
  $('gemCount').textContent = S.gems || 0;
  $('gemCount').title = '💎 Toplam kazanılan: ' + fmt(getTotalGemsEarned());
  const inviteCountEl = $('dailyInviteCount');
  if (inviteCountEl) inviteCountEl.textContent = S.dailyInvites || 0;
  const refInput = $('refInput');
  if (refInput) refInput.value = `https://t.me/Rat_combatbot?start=${S.refCode}`;

  /* Stats */
  $('statTaps').textContent = fmt(S.totalTaps || 0);
  $('statEarned').textContent = fmt(S.totalEarned || 0);
  $('statCombo').textContent = S.bestCombo || 0;
  $('statRegen').textContent = (2 + (S.energyRegenBonus || 0)).toFixed(1) + '/s';
  $('statMulti').textContent = (S.multiTap || 1) + 'x';
  $('statBoss').textContent = S.bossWins || 0;
  $('multiTapDesc').textContent = S.multiTap || 1;
  $('multiTapCostBtn').textContent = '💎 ' + fmt(getMultiTapCost());
  $('regenDesc').textContent = (2 + (S.energyRegenBonus || 0)).toFixed(1);
  $('regenCostBtn').textContent = '💎 ' + fmt(getRegenCost());
  const streakBadge = $('dailyStreakBadge');
  if (streakBadge) streakBadge.textContent = `🔥 ${S.dailyStreak || 0} gün`;

  renderSetBonuses();
  renderDailyTasks();
  checkDailyTasks();
  const autoInd = $('autoTapIndicator');
  if (autoInd) autoInd.style.display = autoTapInterval ? 'inline' : 'none';
  updateBadge();
  const mineBtn = document.querySelector('.nav-btn[data-tab="tab-mine"] .nav-icon');
  if (mineBtn) {
    const owned = CARDS.filter(c => getItemLevel(c.id) > 0).length;
    let badge = mineBtn.querySelector('.mine-count');
    if (owned > 0) {
      if (!badge) { badge = document.createElement('span'); badge.className = 'mine-count'; badge.style.cssText = 'position:absolute;top:-4px;right:-8px;background:#2ed573;color:#000;border-radius:8px;padding:1px 5px;font-size:9px;font-weight:800;line-height:1.4;'; mineBtn.style.position = 'relative'; mineBtn.appendChild(badge); }
      badge.textContent = owned;
    } else if (badge) badge.remove();
  }

  const retroChip = $('retroChip');
  if (retroChip) {
    if (S.lvl >= 250) retroChip.classList.remove('hidden');
    else retroChip.classList.add('hidden');
  }
  checkAch();
  save();
}

function fmt(n) {
  if (n >= 1e15) return (n / 1e15).toFixed(1) + 'Q';
  if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.floor(n).toLocaleString();
}

function rankTitle(lvl) {
  if (lvl >= 400) return '🌈 Gökkuşağı';
  if (lvl >= 300) return '👿 Karanlık Lord';
  if (lvl >= 250) return '🎮 Retro Efsane';
  if (lvl >= 200) return '💎 Elmas';
  if (lvl >= 150) return '🤖 Siber';
  if (lvl >= 100) return '⭐ Altın';
  if (lvl >= 50) return '🥇 Platin';
  if (lvl >= 25) return '🥈 Gümüş';
  return '🥉 Bronz';
}

function updateTapStyle() {
  let tier, filter, bg1, bg2, badge;
  const lvl = S.lvl;
  if (lvl >= 250) { tier = 'RETRO'; filter = 'contrast(1.8) brightness(.9) saturate(1.5)'; bg1 = '#ff00ff44'; bg2 = '#80008044'; badge = '🎮 RETRO'; }
  else if (lvl >= 100) { tier = 'ELMAS'; filter = 'hue-rotate(180deg) brightness(1.4) saturate(1.5)'; bg1 = '#b9f2ff44'; bg2 = '#00bfff44'; badge = '💎 ELMAS'; }
  else if (lvl >= 75) { tier = 'PLATİN'; filter = 'brightness(1.3) saturate(.5)'; bg1 = '#e5e4e244'; bg2 = '#7b7b7b44'; badge = '🏆 PLATİN'; }
  else if (lvl >= 50) { tier = 'ALTIN'; filter = 'sepia(1) brightness(1.2) hue-rotate(-10deg)'; bg1 = '#f3ba2f44'; bg2 = '#b8860b44'; badge = '⭐ ALTIN'; }
  else if (lvl >= 25) { tier = 'GÜMÜŞ'; filter = 'grayscale(1) brightness(1.5)'; bg1 = '#c0c0c044'; bg2 = '#80808044'; badge = '🔩 GÜMÜŞ'; }
  else { tier = 'BRONZ'; filter = 'none'; bg1 = '#5a4a3a44'; bg2 = '#3d2e1e44'; badge = ''; }
  const tapInner = document.querySelector('.tap-inner');
  if (tapInner) {
    tapInner.style.background = `linear-gradient(145deg, ${bg1}, ${bg2})`;
    const borderColors = { 'BRONZ': '#8b7355', 'GÜMÜŞ': '#c0c0c0', 'ALTIN': '#f3ba2f', 'PLATİN': '#e5e4e2', 'ELMAS': '#00bfff', 'RETRO': '#ff00ff' };
    tapInner.style.border = `2px solid ${borderColors[tier] || '#8b7355'}44`;
    const img = tapInner.querySelector('img');
    if (img) {
      img.style.filter = filter;
      if (tier === 'RETRO') img.style.imageRendering = 'pixelated';
      else img.style.imageRendering = '';
    }
  }
  const tapOuter = document.querySelector('.tap-outer');
  if (tapOuter) {
    const outerColors = { 'BRONZ': 'rgba(139,115,85,.15)', 'GÜMÜŞ': 'rgba(192,192,192,.15)', 'ALTIN': 'rgba(243,186,47,.2)', 'PLATİN': 'rgba(229,228,226,.15)', 'ELMAS': 'rgba(0,191,255,.2)', 'RETRO': 'rgba(255,0,255,.2)' };
    tapOuter.style.background = `radial-gradient(circle, ${outerColors[tier] || outerColors['BRONZ']} 0%, transparent 70%)`;
    tapOuter.style.boxShadow = tier === 'RETRO' ? '0 0 30px rgba(255,0,255,.15)' : tier === 'ELMAS' ? '0 0 30px rgba(0,191,255,.1)' : 'none';
  }
  const glowEl = $('comboGlow');
  if (glowEl) {
    const glowColors = { 'BRONZ': '#8b7355', 'GÜMÜŞ': '#c0c0c0', 'ALTIN': '#f3ba2f', 'PLATİN': '#e5e4e2', 'ELMAS': '#00bfff', 'RETRO': '#ff00ff' };
    glowEl.style.background = `radial-gradient(circle, ${glowColors[tier] || '#8b7355'}22 0%, transparent 60%)`;
  }
  const badgeEl = $('tierBadge');
  if (badgeEl) {
    badgeEl.textContent = badge;
    badgeEl.style.display = badge ? 'block' : 'none';
  }
}

/* ===== TAB NAV ===== */
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if ($(btn.dataset.tab).classList.contains('active')) return;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab').forEach(t => { t.classList.remove('active'); t.style.opacity = '0'; t.style.transform = 'translateY(10px)'; });
    $(btn.dataset.tab).classList.add('active');
    requestAnimationFrame(() => { $(btn.dataset.tab).style.transition = 'opacity .2s, transform .2s'; $(btn.dataset.tab).style.opacity = '1'; $(btn.dataset.tab).style.transform = 'translateY(0)'; });
    if (btn.dataset.tab === 'tab-earn') renderAch();
  });
});

function switchTab(id) {
  const btn = document.querySelector(`.nav-btn[data-tab="${id}"]`);
  if (btn) btn.click();
}

/* ===== COMBO STREAK ===== */
let combo = 0;
let comboTimer = null;
let lastCrit = false;
let lastComboNotify = 0;

function resetCombo() {
  if (combo >= 5) {
    sfxTap();
    toast(`💔 Combo kırıldı! ${combo} combo`);
    spawnFloat(innerWidth / 2, innerHeight / 2 - 60, '💔 COMBO KIRILDI', false, '#ff4757');
  }
  combo = 0;
  $('comboWrap').classList.add('hidden');
  $('comboRing').classList.remove('active');
  $('comboGlow').classList.remove('active');
}

function updateCombo() {
  if (combo > 0) {
    $('comboWrap').classList.remove('hidden');
    const displayCombo = Math.min(combo, 99);
    $('comboVal').textContent = 'x' + displayCombo;
    $('comboTaps').textContent = combo + ' tık';
    const intensity = Math.min(combo / 20, 1);
    const hue = 30 + combo * 3;
    $('comboVal').style.color = `hsl(${hue}, 100%, 60%)`;
    $('comboVal').style.textShadow = `0 0 ${10 + intensity * 20}px hsla(${hue},100%,60%,${0.2 + intensity * 0.4})`;
    const ring = $('comboRing');
    if (ring) {
      const fill = Math.min(100, (combo % 10) / 10 * 100);
      ring.style.background = `conic-gradient(hsl(${hue},100%,60%) ${fill}%, transparent ${fill}%)`;
      ring.style.opacity = 0.3 + intensity * 0.7;
    }
    const nextMs = [10, 25, 50, 100, 250, 500].find(m => !S.comboMilestones?.includes(m));
    const progEl = $('comboProg');
    if (nextMs) {
      const pct = Math.min(100, (combo / nextMs) * 100);
      if (!progEl) {
        const wrap = $('comboWrap');
        if (wrap) { const e = document.createElement('div'); e.id = 'comboProg'; e.style.cssText = 'font-size:10px;color:#8e9cb5;text-align:center;margin-top:2px;'; wrap.after(e); }
      }
      const pe = $('comboProg');
      if (pe) pe.textContent = `🎯 ${nextMs} combo: %${Math.floor(pct)}`;
    } else if (progEl) progEl.remove();
  }
}

/* ===== PARTICLES ===== */
function spawnParticles(x, y, color) {
  const colors = color ? [color] : ['#f3ba2f', '#ff9f43', '#ff4757', '#2ed573', '#3498db', '#9b59b6', '#fff'];
  const count = color && color !== '#ff4757' ? 15 : 10;
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const p = document.createElement('div');
      p.className = 'particle';
      const angle = Math.random() * 360;
      const dist = 40 + Math.random() * 120;
      p.style.setProperty('--px', Math.cos(angle * Math.PI / 180) * dist + 'px');
      p.style.setProperty('--py', Math.sin(angle * Math.PI / 180) * dist + 'px');
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = (x || innerWidth / 2) + 'px';
      p.style.top = (y || innerHeight / 2) + 'px';
      p.style.width = (3 + Math.random() * 8) + 'px';
      p.style.height = p.style.width;
      p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 800);
    }, i * 15);
  }
}

/* ===== RIPPLE ===== */
function spawnRipple(x, y) {
  const r = document.createElement('div');
  r.className = 'tap-ripple';
  r.style.left = (x || innerWidth / 2) + 'px';
  r.style.top = (y || innerHeight / 2) + 'px';
  r.style.borderColor = lastCrit ? '#ff4757' : '#f3ba2f';
  r.style.width = lastCrit ? '100px' : '50px';
  r.style.height = lastCrit ? '100px' : '50px';
  r.style.borderWidth = lastCrit ? '5px' : '3px';
  document.body.appendChild(r);
  setTimeout(() => r.remove(), 550);
}

/* ===== FLASH OVERLAY ===== */
function flashOverlay(type) {
  const f = document.createElement('div');
  f.className = 'flash-overlay ' + (type || 'gold');
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 450);
}

/* ===== COIN RAIN ===== */
function coinRain(count) {
  const emojis = ['💰', '🪙', '✨', '⭐', '💎', '🌟'];
  for (let i = 0; i < (count || 8); i++) {
    setTimeout(() => {
      const c = document.createElement('div');
      c.className = 'coin-rain';
      c.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      c.style.left = (Math.random() * 100) + 'vw';
      c.style.fontSize = (14 + Math.random() * 24) + 'px';
      c.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
      c.style.setProperty('--drift', ((Math.random() - 0.5) * 100) + 'px');
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 3500);
    }, i * 50);
  }
}

/* ===== FIREWORK ===== */
function fireworkCelebration() {
  const emojis = ['🎉', '✨', '⭐', '💥', '🌟', '🎊'];
  for (let burst = 0; burst < 3; burst++) {
    setTimeout(() => {
      const cx = (15 + Math.random() * 70) + 'vw';
      const cy = (15 + Math.random() * 50) + 'vh';
      for (let i = 0; i < 25; i++) {
        setTimeout(() => {
          const f = document.createElement('div');
          f.className = 'lvl-firework';
          const colors = ['#f3ba2f', '#ff4757', '#2ed573', '#3498db', '#9b59b6', '#ff9f43'];
          f.style.background = colors[Math.floor(Math.random() * colors.length)];
          const angle = Math.random() * 360;
          const dist = 40 + Math.random() * 120;
          f.style.setProperty('--fx', Math.cos(angle * Math.PI / 180) * dist + 'px');
          f.style.setProperty('--fy', Math.sin(angle * Math.PI / 180) * dist + 'px');
          f.style.left = cx;
          f.style.top = cy;
          f.style.width = (3 + Math.random() * 7) + 'px';
          f.style.height = f.style.width;
          document.body.appendChild(f);
          setTimeout(() => f.remove(), 1400);
        }, i * 20);
      }
      const emojiEl = document.createElement('div');
      emojiEl.className = 'lvl-firework';
      emojiEl.textContent = emojis[burst % emojis.length];
      emojiEl.style.cssText = `position:fixed;left:${cx};top:${cy};font-size:${24 + Math.random() * 16}px;pointer-events:none;z-index:9999;animation:fireworkEmoji 1.5s ease-out forwards;`;
      const a = Math.random() * 360;
      const d = 80 + Math.random() * 80;
      emojiEl.style.setProperty('--fx', Math.cos(a * Math.PI / 180) * d + 'px');
      emojiEl.style.setProperty('--fy', Math.sin(a * Math.PI / 180) * d + 'px');
      document.body.appendChild(emojiEl);
      setTimeout(() => emojiEl.remove(), 1600);
    }, burst * 400);
  }
}

/* ===== SHAKE ===== */
function screenShake() {
  const gs = document.querySelector('.gold-section');
  gs.classList.remove('shake');
  void gs.offsetWidth;
  gs.classList.add('shake');
  setTimeout(() => gs.classList.remove('shake'), 300);
}

/* ===== TAP ===== */
let tapCount = 0;
let tapTimestamps = [];

function processTap(cx, cy) {
  try {
    if (S.energy < 1) {
      if (S.energy > 0) {
        toast(`⚡ Sadece ${Math.floor(S.energy)} enerjin kaldı (${getEnergyRestoreTime()})`);
      } else {
        toast('⚡ Enerjin yok! Boost al veya bekle (' + getEnergyRestoreTime() + ')');
      }
      return;
    }
    const taps = S.multiTap || 1;
    S.energy -= taps;
    tapCount += taps;
    for (let t = 0; t < taps; t++) tapTimestamps.push(Date.now());
    if (tapTimestamps.length > 60) tapTimestamps.shift();
    combo++;
    checkComboMilestones(combo);
    if (combo > S.bestCombo) S.bestCombo = combo;
    clearTimeout(comboTimer);
    comboTimer = setTimeout(resetCombo, 1500);
    updateCombo();
    const ring = $('comboRing');
    const glow = $('comboGlow');
    if (combo >= 3) {
      ring.classList.add('active');
      const intensity = Math.min(combo / 20, 1);
      const hue = 30 + combo * 5;
      ring.style.setProperty('--r-color', `hsl(${hue},100%,60%)`);
      ring.style.opacity = 0.2 + intensity * 0.6;
      if (glow) {
        glow.classList.add('active');
        glow.style.setProperty('--r-color', `hsla(${hue},100%,60%,.15)`);
        glow.style.setProperty('--glow-op', Math.min(0.15 + intensity * 0.25, 0.4));
      }
    } else {
      ring.classList.remove('active');
      if (glow) glow.classList.remove('active');
    }
    const retroComboBonus = S.items.reduce((sum, it) => {
      const c = CARDS.find(x => x.id === it.id);
      return c?.baseCombo ? sum + c.baseCombo * it.lvl : sum;
    }, 0);
    const comboMult = Math.min(1 + combo * (0.08 + retroComboBonus), 5);
    const retroCritBonus = S.items.reduce((sum, it) => {
      const c = CARDS.find(x => x.id === it.id);
      return c?.baseCrit ? sum + c.baseCrit * it.lvl : sum;
    }, 0);
    const isCrit = Math.random() < (0.15 + retroCritBonus);
    lastCrit = isCrit;
    const critMult = isCrit ? 2 + Math.random() : 1;
    const gain = Math.floor((S.perClick + Math.floor(S.perSec * 0.02)) * comboMult * critMult * getX2Mult() * taps);
    S.coins += gain;
    S.totalTaps += taps;
    S.totalEarned += gain;
    addXp(gain);
  spawnParticles(cx, cy, isCrit ? '#ff4757' : null);
  spawnRipple(cx, cy);
  if (combo >= 10) spawnComboTrail(cx, cy, combo);
    const tz = $('tapZone');
    tz.classList.remove('shockwave');
    void tz.offsetWidth;
    tz.classList.add('shockwave');
    const ti = document.querySelector('.tap-inner img');
    if (ti) {
      ti.style.transition = 'transform .08s cubic-bezier(.34,1.56,.64,1)';
      ti.style.transform = 'scale(0.92)';
      setTimeout(() => { if (ti) ti.style.transform = 'scale(1)'; }, 80);
    }
    sfxTap();
    if (isCrit) {
      screenShake();
      flashOverlay('red');
      coinRain(5);
      sfxCrit();
    }
    S.lastTapTime = Date.now();
    const shouldNotify = combo > 0 && combo % 10 === 0 && combo !== lastComboNotify;
    if (shouldNotify) {
      lastComboNotify = combo;
      screenShake();
      flashOverlay('gold');
      coinRain(12);
      toast(`🔥 ${combo} COMBO! x${comboMult.toFixed(1)}`);
      sfxCombo();
    }
    if (tapCount % 50 === 0) coinRain(10);
    const colors = ['#f3ba2f','#2ed573','#3498db','#9b59b6','#ff9f43'];
    const label = isCrit ? '🔥 CRIT! +' + fmt(gain) : '+' + fmt(gain);
    spawnFloat(cx, cy, label, isCrit, isCrit ? '#ff4757' : colors[Math.floor(Math.random() * colors.length)]);
    if (combo >= 5) spawnFloat(cx - 20, cy - 60, '+' + Math.floor(gain * 0.05) + 'XP', false, '#2ed573');
    if (Math.random() < 0.0005) spawnCrate();
    try { navigator.vibrate(isCrit ? 25 : 10); } catch (_) { }
    update();
  } catch (e) {
    console.error('processTap error:', e);
    if (S.energy < S.perClick) return;
    S.coins += S.perClick;
    update();
  }
}

/* ===== TOUCH / MOUSE HANDLING (STABLE) ===== */
let holdInterval = null;
let holdTimeout = null;
let tapLock = false;

function handleTap(x, y) {
  if (tapLock) return;
  tapLock = true;
  setTimeout(() => { tapLock = false; }, 30);
  processTap(x, y);
  createTapRipple(x, y);
}

function createTapRipple(x, y) {
  if (typeof x !== 'number' || typeof y !== 'number') return;
  const el = document.createElement('div');
  el.className = 'tap-ripple';
  el.style.left = (x - 30) + 'px';
  el.style.top = (y - 30) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 600);
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const dot = document.createElement('div');
      dot.className = 'tap-dot';
      const colors = ['#f3ba2f', '#ff9f43', '#2ed573'];
      dot.style.background = colors[i];
      dot.style.left = (x - 4 + (Math.random() - 0.5) * 30) + 'px';
      dot.style.top = (y - 4 + (Math.random() - 0.5) * 30) + 'px';
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), 500);
    }, i * 40);
  }
}

$('tapZone').addEventListener('mousedown', e => {
  if (Date.now() - lastTouchEnd < 300) return;
  handleTap(e.clientX || innerWidth / 2, e.clientY || innerHeight / 2);
  holdTimeout = setTimeout(() => {
    holdInterval = setInterval(() => {
      const x = e.clientX + (Math.random() - 0.5) * 40;
      const y = e.clientY + (Math.random() - 0.5) * 40;
      handleTap(x, y);
    }, 100);
  }, 500);
});
$('tapZone').addEventListener('mouseup', () => { clearTimeout(holdTimeout); clearInterval(holdInterval); });
$('tapZone').addEventListener('mouseleave', () => { clearTimeout(holdTimeout); clearInterval(holdInterval); });

let lastTouchEnd = 0;
let holdX = 0, holdY = 0;
$('tapZone').addEventListener('touchstart', e => {
  e.preventDefault();
  const t = e.touches[0];
  if (!t) return;
  holdX = t.clientX;
  holdY = t.clientY;
  handleTap(holdX, holdY);
  holdTimeout = setTimeout(() => {
    holdInterval = setInterval(() => {
      const x = holdX + (Math.random() - 0.5) * 30;
      const y = holdY + (Math.random() - 0.5) * 30;
      handleTap(x, y);
    }, 100);
  }, 500);
}, {passive: false});
$('tapZone').addEventListener('touchmove', e => {
  const t = e.touches[0];
  if (t) { holdX = t.clientX; holdY = t.clientY; }
}, {passive: true});
$('tapZone').addEventListener('touchend', () => {
  clearTimeout(holdTimeout);
  clearInterval(holdInterval);
  lastTouchEnd = Date.now();
});
$('tapZone').addEventListener('touchcancel', () => { clearTimeout(holdTimeout); clearInterval(holdInterval); });

function spawnFloat(x, y, text, isCrit, color) {
  const el = document.createElement('div');
  el.className = 'floating-num' + (isCrit ? ' crit' : '');
  el.textContent = text;
  el.style.left = Math.min(Math.max(x - 50, 0), innerWidth - 80) + 'px';
  el.style.top = Math.min(Math.max(y - 50, 0), innerHeight - 60) + 'px';
  if (color) el.style.color = color;
  const driftX = (Math.random() - 0.5) * 40;
  const driftY = -30 - Math.random() * 40;
  el.style.setProperty('--dx', driftX + 'px');
  el.style.setProperty('--dy', driftY + 'px');
  el.style.animation = `floatDrift ${0.6 + Math.random() * 0.4}s ease-out forwards`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

/* ===== COMBO TRAIL ===== */
function spawnComboTrail(cx, cy, combo) {
  const colors = ['#ff4757', '#ff9f43', '#f3ba2f', '#2ed573', '#3498db', '#9b59b6'];
  for (let i = 0; i < 2; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `position:fixed;width:${4 + Math.random() * 4}px;height:${4 + Math.random() * 4}px;background:${colors[i % colors.length]};border-radius:50%;pointer-events:none;z-index:9999;left:${cx - 2 + (Math.random() - 0.5) * 20}px;top:${cy - 2 + (Math.random() - 0.5) * 20}px;opacity:1;`;
    document.body.appendChild(dot);
    dot.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${(Math.random() - 0.5) * 40}px, ${-20 - Math.random() * 30}px) scale(0)`, opacity: 0 }], { duration: 400, easing: 'ease-out' }).onfinish = () => dot.remove();
  }
}

/* ===== GEMS EARNED TRACKING ===== */
function getTotalGemsEarned() {
  if (!S.achieved) return 0;
  return ACH.filter(a => S.achieved.includes(a.id)).reduce((sum, a) => sum + (a.gem || 0), 0);
}

/* ===== CARD COLLECTION COMPLETION ===== */
function getCardCompletion() {
  return CARDS.filter(c => getItemLevel(c.id) > 0).length;
}

/* ===== QUICK BUY X LEVELS ===== */
function quickBuyLevels(id, count) {
  let bought = 0;
  for (let i = 0; i < count; i++) {
    const c = CARDS.find(x => x.id === id);
    if (!c || S.coins < cardCost(c) || getItemLevel(id) >= 9999) break;
    buyCard(id);
    bought++;
  }
  if (bought > 0) toast(`⚡ ${bought}x yükseltildi!`);
  renderGrid(document.querySelector('.chip.active')?.dataset?.f || 'all');
  update();
}

/* ===== ENERGY BAR BETTER ===== */
function updateEnergyBar() {
  const pct = S.maxEnergy > 0 ? (S.energy / S.maxEnergy) * 100 : 0;
  const fill = $('energyFill');
  if (!fill) return;
  fill.style.width = pct + '%';
  const hue = pct * 1.2;
  fill.style.background = pct > 50 ? `hsl(${hue}, 80%, 50%)` : pct > 25 ? '#f39c12' : '#ff4757';
  fill.style.boxShadow = pct > 90 ? '0 0 18px rgba(46,213,115,.5)' : pct > 50 ? '0 0 8px rgba(46,213,115,.2)' : pct > 25 ? '0 0 8px rgba(243,156,18,.2)' : '0 0 12px rgba(255,71,87,.4)';
  if (pct < 25) fill.style.animation = 'energyLow 1s ease-in-out infinite';
  else fill.style.animation = 'none';
}

/* ===== BADGE HELPER ===== */
function setBadge(id, text) {
  const el = $(id);
  if (!el) return;
  if (text) { el.textContent = text; el.style.display = 'inline'; }
  else el.style.display = 'none';
}

/* ===== SESSION TIMER ===== */
let sessionStart = Date.now();
function getSessionTime() {
  const sec = Math.floor((Date.now() - sessionStart) / 1000);
  if (sec < 60) return sec + 's';
  if (sec < 3600) return Math.floor(sec / 60) + 'dk';
  return Math.floor(sec / 3600) + 's ' + Math.floor((sec % 3600) / 60) + 'dk';
}

/* ===== QUICK ELMAS SHOP OPEN ===== */
$('gemCount')?.addEventListener('dblclick', () => { $('shopModal').classList.remove('hidden'); toast('💎 Elmas Dükkanı açıldı'); });
function getEnergyRestoreTime() {
  if (S.energy >= S.maxEnergy) return '';
  const regen = 0.5 + (S.energyRegenBonus || 0);
  const need = S.maxEnergy - S.energy;
  let sec = Math.ceil(need / regen);
  if (sec < 60) return sec + 's';
  if (sec < 3600) return Math.floor(sec / 60) + 'dk ' + (sec % 60) + 's';
  return Math.floor(sec / 3600) + 's ' + Math.floor((sec % 3600) / 60) + 'dk';
}

/* ===== MODAL CLOSE ON OVERLAY ===== */
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.add('hidden'); });
});

function addXp(amount) {
  S.xp += amount;
  const xpFill = $('lvlProgressFill');
  const newPct = Math.min(100, (S.xp / S.xpNext) * 100);
  xpFill.style.width = newPct + '%';
  xpFill.classList.remove('xp-pulse');
  void xpFill.offsetWidth;
  xpFill.classList.add('xp-pulse');
  while (S.xp >= S.xpNext) {
    S.xp -= S.xpNext;
    S.lvl++;
    S.xpNext = Math.floor(S.xpNext * 1.5 + 30);
    S.maxEnergy += 25;
    S.energy = S.maxEnergy;
    sfxLevelUp();
    fireworkCelebration();
    flashOverlay('rainbow');
    coinRain(25);
    spawnParticles(innerWidth / 2, innerHeight / 3, '#f3ba2f');
    spawnParticles(innerWidth / 3, innerHeight / 2, '#9b59b6');
    spawnParticles(innerWidth * 0.7, innerHeight / 2, '#2ed573');
    const newRank = rankTitle(S.lvl);
    toast(`🎉 LEVEL ${S.lvl} - ${newRank}! Max enerji ${S.maxEnergy}, enerji fullendi!`);
    const lvlEl = document.createElement('div');
    lvlEl.className = 'ach-notif';
    lvlEl.style.borderColor = '#9b59b6';
    lvlEl.innerHTML = `<span style="font-size:32px;">⭐</span><div><div style="font-weight:700;">🎉 LEVEL ATLA!</div><div style="font-size:11px;color:#f3ba2f;">${newRank}</div><div style="font-size:10px;">⚡${S.maxEnergy} enerji</div></div>`;
    document.body.appendChild(lvlEl);
    setTimeout(() => { lvlEl.style.opacity = '0'; lvlEl.style.transform = 'translateX(80px)'; setTimeout(() => lvlEl.remove(), 400); }, 3500);
    if (S.lvl % 10 === 0) fireworkCelebration();
    checkLevelMilestones();
    checkSkinUnlock();
    try { navigator.vibrate([50, 50, 50]); } catch (_) { }
  }
  update();
}

/* ===== ENERGY REGEN ===== */
let lastEnergyFullNotif = 0;
setInterval(() => {
  if (S.energy < S.maxEnergy) {
    const regen = 2 + (S.energyRegenBonus || 0);
    S.energy = Math.min(S.maxEnergy, S.energy + regen);
    if (S.energy >= S.maxEnergy && Date.now() - lastEnergyFullNotif > 60000) {
      lastEnergyFullNotif = Date.now();
      toast('⚡ Enerji fullendi!');
      spawnFloat(innerWidth / 2, innerHeight / 2 - 60, '⚡ ENERJİ DOLDU!', false, '#2ed573');
      sfxGem();
    }
    update();
  }
}, 1000);

/* ===== ENERGY BOOST ===== */
$('quickBoostBtn').addEventListener('click', () => {
  const now = Date.now();
  if (S.boostCD > now) {
    const sec = Math.ceil((S.boostCD - now) / 1000);
    toast(`⏳ ${sec}s bekle`);
    return;
  }
  S.boostCD = now + 10000;
  S.energy = S.maxEnergy;
  $('energyFill').style.animation = 'none'; void $('energyFill').offsetWidth; $('energyFill').style.animation = 'energyPulse .5s ease-out';
  sfxBuy();
  flashOverlay('gold');
  spawnParticles(innerWidth / 2, innerHeight / 2, '#2ed573');
  toast('🚀 ENERJİ FULLENDİ!');
  update();
  const btn = $('quickBoostBtn');
  btn.style.opacity = '.4';
  btn.style.transform = 'scale(.92)';
  const iv = setInterval(() => {
    const remaining = Math.max(0, S.boostCD - Date.now());
    if (remaining <= 0) {
      clearInterval(iv);
      btn.style.opacity = '1';
      btn.style.transform = 'scale(1)';
    }
  }, 200);
});

/* ===== CARD SELL ===== */
function sellCard(id) {
  const c = CARDS.find(x => x.id === id);
  if (!c) return;
  const lvl = getItemLevel(id);
  if (lvl <= 0) { toast('❌ Bu kart sana ait değil'); return; }
  const refund = Math.floor(cardCost(c) * 0.4 * lvl);
  S.coins += refund;
  setItemLevel(id, 0);
  sfxBuy();
  toast(`🔄 ${c.icon} ${c.name} satıldı! +${fmt(refund)} Coin`);
  renderGrid(document.querySelector('.chip.active')?.dataset?.f || 'all');
  update();
}

/* ===== QUICK UPGRADE ===== */
function quickUpgrade(limit) {
  let upgraded = 0;
  const maxUp = limit || 20;
  const affordable = CARDS.filter(c => {
    if (c.levelReq && S.lvl < c.levelReq) return false;
    return S.coins >= cardCost(c) && getItemLevel(c.id) < 9999;
  }).sort((a, b) => cardCost(a) - cardCost(b));
  for (const c of affordable) {
    if (S.coins < cardCost(c)) break;
    if (upgraded >= maxUp) break;
    S.coins -= cardCost(c);
    const lvl = getItemLevel(c.id);
    setItemLevel(c.id, lvl + 1);
    upgraded++;
  }
  if (upgraded > 0) { if (!limit) toast(`⚡ ${upgraded} kart yükseltildi!`); sfxBuy(); }
  else if (!limit) toast('❌ Yükseltilecek kart yok');
  renderGrid(document.querySelector('.chip.active')?.dataset?.f || 'all');
  update();
}

/* ===== MINE GRID ===== */
let cardSortMode = 'default';

function setCardSort(mode) {
  cardSortMode = mode;
  renderGrid(document.querySelector('.chip.active')?.dataset?.f || 'all');
}

function sortCards(cards) {
  const sorted = [...cards];
  if (cardSortMode === 'level') sorted.sort((a, b) => getItemLevel(b.id) - getItemLevel(a.id));
  else if (cardSortMode === 'price') sorted.sort((a, b) => cardCost(a) - cardCost(b));
  else if (cardSortMode === 'rarity') { const r = {legendary:5,epic:4,rare:3,uncommon:2,common:1}; sorted.sort((a, b) => (r[b.rarity]||0) - (r[a.rarity]||0)); }
  else if (cardSortMode === 'favorites') { const favs = S.favorites || []; sorted.sort((a, b) => { const af = favs.includes(a.id) ? 1 : 0; const bf = favs.includes(b.id) ? 1 : 0; return bf - af || getItemLevel(b.id) - getItemLevel(a.id); }); }
  return sorted;
}

function renderGrid(filter) {
  const g = $('cardGrid');
  g.className = 'ulist';
  g.innerHTML = '';
  let arr = CARDS;
  if (filter === 'all') arr = arr.filter(c => c.cat !== 'retro' || S.lvl >= 250);
  else if (filter === 'retro') { if (S.lvl < 250) { g.innerHTML = '<div class="empty" style="text-align:center;padding:30px;">🔒 Level 250\'de açılır</div>'; return; } else arr = arr.filter(c => c.cat === 'retro'); }
  else arr = arr.filter(c => c.cat === filter);
  const searchVal = ($('cardSearch')?.value || '').toLowerCase().trim();
  if (searchVal) arr = arr.filter(c => c.name.toLowerCase().includes(searchVal) || c.icon.includes(searchVal));
  arr = sortCards(arr);
  const ownedCount = arr.filter(c => getItemLevel(c.id) > 0).length;
  const totalCards = $('totalCards');
  if (totalCards) totalCards.textContent = `📊 ${ownedCount}/${arr.length} kart sahibi`;
  arr.forEach(c => {
    const lvl = getItemLevel(c.id);
    const cost = cardCost(c);
    const pph = c.baseSec ? c.baseSec * lvl : 0;
    const maxLvl = 9999;
    const fillPct = Math.min(100, (lvl / 100) * 100);
    const barHue = Math.min(140, Math.max(0, 140 - lvl * 0.5));
    const isRainbow = lvl >= 1000;
    const isMaxed = lvl >= 9999;
    const isFav = (S.favorites || []).includes(c.id);
    const locked = c.levelReq && S.lvl < c.levelReq;
    const tooExpensive = locked || S.coins < cost;
    const ri = RARITY[c.rarity] || 0;
    const rc = c.cat === 'retro' ? '#ff00ff' : RARITY_COLORS[ri];
    const rarityLabel = c.cat === 'retro' ? 'RETRO' : ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'][ri];
    const extraStats = [];
    if (c.baseClick) extraStats.push(`👆+${c.baseClick * (lvl + 1)}/tık`);
    if (c.bonusMaxEnergy) extraStats.push(`⚡+${c.bonusMaxEnergy * (lvl + 1)}`);
    if (c.baseCombo) extraStats.push(`🔥x${(1 + c.baseCombo * (lvl + 1)).toFixed(1)}`);
    if (c.baseCrit) extraStats.push(`💥+${Math.round(c.baseCrit * (lvl + 1) * 100)}%`);
    const extraStr = extraStats.length ? extraStats.join(' | ') : '';
    const div = document.createElement('div');
    div.className = 'ucard' + (c.cat === 'retro' ? ' retro' : '') + (isMaxed ? ' maxed' : '');
    div.style.setProperty('--r-color', rc);
    div.setAttribute('data-rarity', c.rarity || 'legendary');
    if (isMaxed) div.style.setProperty('--gold-glow', '#f3ba2f');
    div.innerHTML = `
      <div class="ucard-icon" style="background:${rc}22;border-color:${rc}44;">${locked ? '🔒' : c.icon}</div>
      <div class="ucard-body">
        <div class="ucard-top">
          <span class="ucard-name">${locked ? '🔒 ' + c.name : c.name}${c.levelReq ? ' <span style="font-size:9px;color:#ff00ff;">Lv.' + c.levelReq + '</span>' : ''}</span>
          <span class="ucard-level" style="background:${rc}22;color:${rc};">${locked ? '🔒' : 'Lv.' + lvl}</span>
        </div>
        <div class="ucard-pps" style="color:${rc}">${locked ? '🔒 Level ' + c.levelReq + ' gerekli' : (pph > 0 ? '+' + fmt(pph) + '/s' : rarityLabel) + (extraStr ? ' | ' + extraStr : '')}</div>
        <div class="ucard-bar"><div class="ucard-fill" style="width:${locked ? 0 : fillPct}%;background:${locked ? 'transparent' : isRainbow ? 'linear-gradient(90deg,#ff4757,#ff9f43,#2ed573,#3498db,#9b59b6)' : `hsl(${barHue},80%,${50 + lvl * 0.03}%)`}"></div></div>
        <div class="ucard-bot">
          <span class="ucard-cost">💰${fmt(cost)}</span>
          <div style="display:flex;gap:4px;">
            ${lvl > 0 ? `<button class="ucard-btn sell-btn" data-id="${c.id}" style="background:rgba(255,255,255,.1);color:#8e9cb5;font-size:9px;padding:6px 8px;">🔄</button>` : ''}
            <button class="ucard-btn" data-id="${c.id}"${(tooExpensive || locked) ? ' disabled' : ''} style="background:${rc};color:#000;">${locked ? '🔒' : (lvl === 0 ? 'Satın Al' : '↑ Yükselt')}</button>
          </div>
        </div>
      </div>
    `;
    const btn = div.querySelector('.ucard-btn');
    if (!tooExpensive && !locked) {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        buyCard(c.id);
      });
    }
    const sellBtn = div.querySelector('.sell-btn');
    if (sellBtn) {
      sellBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (confirm(`${c.icon} ${c.name} seviye ${lvl} satılsın mı?`)) sellCard(c.id);
      });
    }
    div.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      showCardDetail(c.id);
    });
    g.appendChild(div);
  });
}

function buyCard(id) {
  const c = CARDS.find(x => x.id === id);
  if (!c) return;
  const cost = cardCost(c);
  if (S.coins < cost) { toast('❌ Yetersiz bakiye'); return; }
  S.coins -= cost;
  const lvl = getItemLevel(id);
  setItemLevel(id, lvl + 1);
  if (c.bonusEnergy) {
    S.energy = Math.min(S.maxEnergy, S.energy + c.bonusEnergy);
    toast(`⚡ +${c.bonusEnergy} Enerji!`);
  } else {
    const refill = 50 + lvl * 10;
    S.energy = Math.min(S.maxEnergy, S.energy + refill);
    toast(`⚡ +${refill} Enerji (yükseltme)`);
  }
  const retroBonus = lvl >= 5 && c.cat === 'retro' ? 1 + Math.floor(lvl / 5) : 0;
  if (retroBonus > 0 && c.baseClick) { const extra = c.baseClick * retroBonus; S.coins += extra; toast(`🎮 Retro bonus: +${fmt(extra)} Coin!`); }
  sfxCardBuy();
  if (c.cat === 'retro') {
    flashOverlay('rainbow');
    spawnParticles(innerWidth / 2, innerHeight / 2, '#ff00ff');
    spawnParticles(innerWidth / 3, innerHeight / 3, '#ff1493');
    coinRain(15);
  }
  spawnParticles(innerWidth / 2, innerHeight / 2, RARITY_COLORS[RARITY[c.rarity]] || '#f3ba2f');
  renderGrid(document.querySelector('.chip.active')?.dataset?.f || 'all');
  update();
}

document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(c => { c.classList.remove('active'); c.style.background = ''; c.style.color = ''; });
    chip.classList.add('active');
    if (chip.dataset.f === 'retro') { chip.style.background = '#ff00ff'; chip.style.color = '#fff'; }
    renderGrid(chip.dataset.f);
  });
});
renderGrid('all');

/* ===== DAILY REWARDS (Streak) ===== */
function checkDaily() {
  const today = new Date().toDateString();
  if (S.lastDailyCheck !== today) {
    S.lastDailyCheck = today;
    save();
  }
}
checkDaily();

const DAILY_REWARDS = [
  { day: 1, coin: 1000, gem: 2, label: '1K', icon: '🪙' },
  { day: 2, coin: 2500, gem: 5, label: '2.5K', icon: '💰' },
  { day: 3, coin: 5000, gem: 8, label: '5K', icon: '💎' },
  { day: 4, coin: 10000, gem: 12, label: '10K', icon: '👑' },
  { day: 5, coin: 20000, gem: 18, label: '20K', icon: '⭐' },
  { day: 6, coin: 35000, gem: 25, label: '35K', icon: '🔥' },
  { day: 7, coin: 50000, gem: 40, label: '50K', icon: '🏆' },
];

function renderDaily() {
  const g = $('dailyGrid');
  if (!g) return;
  g.innerHTML = '';
  const today = new Date().toDateString();
  if (S.dailyLastClaim !== today) S.dailyClaimed = 0;
  DAILY_REWARDS.forEach((r, i) => {
    const d = document.createElement('div');
    d.className = 'daily-tile';
    const isToday = S.dailyStreak % 7 === i;
    const claimed = S.dailyLastClaim === today && S.dailyClaimed > i;
    const ready = S.dailyLastClaim !== today && isToday;
    if (claimed) d.classList.add('claimed');
    if (ready) d.classList.add('ready');
    d.innerHTML = `
      <span style="font-size:22px;">${r.icon}</span>
      <span class="d-val">+${r.label}</span>
      <span class="d-label">Gün ${i + 1}${r.gem > 0 ? ' +' + r.gem + '💎' : ''}</span>
      <span class="d-status">${claimed ? '✓' : ready ? 'AL' : '🔒'}</span>
    `;
    if (ready) d.addEventListener('click', claimDaily);
    g.appendChild(d);
  });
  const streakEl = $('dailyStreakText');
  if (streakEl) streakEl.textContent = `🔥 ${S.dailyStreak} gün`;
}
renderDaily();

function claimDaily() {
  const today = new Date().toDateString();
  if (S.dailyLastClaim === today) { toast('❌ Bugün zaten aldın!'); return; }
  const day = S.dailyStreak % 7;
  const r = DAILY_REWARDS[day];
  const streakMult = 1 + Math.min(S.dailyStreak, 30) * 0.05;
  const bonus = Math.floor(r.coin * (streakMult - 1));
  S.coins += r.coin + bonus;
  S.gems += r.gem || 0;
  S.dailyStreak++;
  S.dailyLastClaim = today;
  S.dailyClaimed = day + 1;
  fireworkCelebration();
  flashOverlay('gold');
  screenShake();
  sfxLevelUp();
  const claimMsg = `🎁 ${r.label} Coin${bonus > 0 ? ` +${fmt(bonus)} streak bonus` : ''}${r.gem ? ' +' + r.gem + '💎' : ''}! Streak: ${S.dailyStreak} gün🔥`;
  toast(claimMsg);
  spawnFloat(innerWidth / 2, innerHeight / 2 - 40, '🎁 GÜNLÜK ÖDÜL!', false, '#f3ba2f');
  coinRain(16);
  renderDaily();
  update();
}

$('openDailyBtn').addEventListener('click', () => { $('dailyModal').classList.remove('hidden'); });
$('closeDailyModal').addEventListener('click', () => { $('dailyModal').classList.add('hidden'); });

/* ===== CARD SET BONUSES ===== */
const SET_BONUSES = [
  { cat: 'miners', name: 'Madenci Seti', desc: 'Tüm madenci kartlarına sahip ol +%20 perSec', bonus: 0.2 },
  { cat: 'items', name: 'Ekipman Seti', desc: 'Tüm ekipman kartlarına sahip ol +%15 perSec', bonus: 0.15 },
  { cat: 'boosts', name: 'Boost Seti', desc: 'Tüm boost kartlarına sahip ol +%25 enerji', bonus: 0.25 },
  { cat: 'retro', name: 'Retro Seti', desc: 'Tüm retro kartlara sahip ol +x2 tık gücü', bonus: 1.0 },
];

function calcSetBonuses() {
  const active = [];
  SET_BONUSES.forEach(set => {
    const cards = CARDS.filter(c => c.cat === set.cat);
    const owned = cards.every(c => getItemLevel(c.id) > 0);
    if (owned) active.push(set);
  });
  return active;
}

function getSetBonusMult() {
  const sets = calcSetBonuses();
  let mult = 1;
  sets.forEach(s => { if (s.bonus < 1) mult += s.bonus; });
  return mult;
}

function getSetEnergyBonus() {
  const sets = calcSetBonuses();
  let bonus = 0;
  sets.forEach(s => { if (s.bonus > 0.3) bonus += s.bonus; });
  return bonus;
}

/* ===== MULTI-TAP (Elmas ile yükselt) ===== */
function getMultiTapCost() {
  return 50 + Math.pow(S.multiTap || 1, 2) * 30;
}

function upgradeMultiTap() {
  const cost = getMultiTapCost();
  if ((S.gems || 0) < cost) { toast(`❌ ${fmt(cost)} Elmas gerekli`); return; }
  S.gems -= cost;
  S.multiTap = (S.multiTap || 1) + 1;
  toast(`👆 Çoklu Tık seviye ${S.multiTap}! Her tıkta ${S.multiTap}x vuruş!`);
  save();
  update();
}

/* ===== ENERGY REGEN UPGRADE ===== */
function getRegenCost() {
  return 30 + (S.energyRegenBonus || 0) * 30;
}

function upgradeRegen() {
  const cost = getRegenCost();
  if ((S.gems || 0) < cost) { toast(`❌ ${fmt(cost)} Elmas gerekli`); return; }
  S.gems -= cost;
  S.energyRegenBonus = (S.energyRegenBonus || 0) + 1;
  toast(`⚡ Enerji yenilenme hızı +1/s (toplam ${2 + S.energyRegenBonus}/s)`);
  save();
  update();
}

/* ===== LEVEL MILESTONE REWARDS ===== */
const LEVEL_MILESTONES = [
  { lvl: 5, coin: 5000, gem: 10, label: 'Seviye 5 Ödülü' },
  { lvl: 10, coin: 15000, gem: 25, label: 'Seviye 10 Ödülü' },
  { lvl: 15, coin: 30000, gem: 50, label: 'Seviye 15 Ödülü (Boss Açıldı!)' },
  { lvl: 25, coin: 75000, gem: 100, label: 'Seviye 25 Ödülü (Gümüş!)' },
  { lvl: 50, coin: 200000, gem: 200, label: 'Seviye 50 Ödülü (Altın!)' },
  { lvl: 75, coin: 500000, gem: 350, label: 'Seviye 75 Ödülü (Platin!)' },
  { lvl: 100, coin: 1000000, gem: 500, label: 'Seviye 100 Ödülü (Elmas!)' },
  { lvl: 250, coin: 10000000, gem: 2000, label: 'Seviye 250 Ödülü (RETRO!)' },
];

function checkLevelMilestones() {
  LEVEL_MILESTONES.forEach(m => {
    if (S.lvl >= m.lvl && !S.lvlMilestones?.includes(m.lvl)) {
      if (!S.lvlMilestones) S.lvlMilestones = [];
      S.lvlMilestones.push(m.lvl);
      S.coins += m.coin;
      S.gems += m.gem || 0;
      toast(`🎉 ${m.label}! +${fmt(m.coin)}${m.gem ? ' +' + m.gem + '💎' : ''} kazandın!`);
      coinRain(15);
      flashOverlay('gold');
    }
  });
}

/* ===== COMBO MILESTONE REWARDS ===== */
/* ===== SKIN SYSTEM (100+ Level) ===== */
const SKINS = [
  { id: 'default', name: 'Klasik Hamster', icon: '🐹', lvlReq: 1, svg: null, desc: 'Varsayılan görünüm' },
  { id: 'gold', name: 'Altın Hamster', icon: '⭐', lvlReq: 100, svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><circle cx='100' cy='90' r='70' fill='%23f3ba2f' stroke='%23b8860b' stroke-width='2'/><ellipse cx='100' cy='160' rx='42' ry='18' fill='%23f3ba2f' stroke='%23b8860b' stroke-width='2'/><circle cx='100' cy='80' r='38' fill='%23f3ba2f' stroke='%23b8860b' stroke-width='2'/><ellipse cx='86' cy='68' rx='12' ry='18' fill='%23f3ba2f' stroke='%23b8860b' stroke-width='2'/><ellipse cx='114' cy='68' rx='12' ry='18' fill='%23f3ba2f' stroke='%23b8860b' stroke-width='2'/><ellipse cx='86' cy='66' rx='8' ry='12' fill='%23ffe4e1'/><ellipse cx='114' cy='66' rx='8' ry='12' fill='%23ffe4e1'/><circle cx='100' cy='56' r='6' fill='%23ff9999'/><circle cx='100' cy='59' r='5' fill='%23ffffff'/><circle cx='88' cy='82' r='4' fill='%23333'/><circle cx='112' cy='82' r='4' fill='%23333'/><ellipse cx='100' cy='91' rx='3' ry='2' fill='%23ff9999'/><path d='M60 50 Q45 30 50 60' stroke='%23b8860b' stroke-width='3' fill='none' stroke-linecap='round'/><path d='M140 50 Q155 30 150 60' stroke='%23b8860b' stroke-width='3' fill='none' stroke-linecap='round'/></svg>`, desc: 'Altın kaplama hamster' },
  { id: 'cyber', name: 'Siber Hamster', icon: '🤖', lvlReq: 150, svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><circle cx='100' cy='90' r='70' fill='%233498db' stroke='%2300bfff' stroke-width='2'/><ellipse cx='100' cy='160' rx='42' ry='18' fill='%233498db' stroke='%2300bfff' stroke-width='2'/><circle cx='100' cy='80' r='38' fill='%233498db' stroke='%2300bfff' stroke-width='2'/><ellipse cx='86' cy='68' rx='12' ry='18' fill='%233498db' stroke='%2300bfff' stroke-width='2'/><ellipse cx='114' cy='68' rx='12' ry='18' fill='%233498db' stroke='%2300bfff' stroke-width='2'/><circle cx='100' cy='56' r='6' fill='%2300ff88'/><circle cx='88' cy='82' r='4' fill='%2300bfff'/><circle cx='112' cy='82' r='4' fill='%2300bfff'/><ellipse cx='100' cy='91' rx='3' ry='2' fill='%2300ff88'/><path d='M60 50 L45 30 L50 60' stroke='%2300bfff' stroke-width='2' fill='none'/><path d='M140 50 L155 30 L150 60' stroke='%2300bfff' stroke-width='2' fill='none'/></svg>`, desc: 'Sibernetik zırhlı' },
  { id: 'diamond', name: 'Elmas Hamster', icon: '💎', lvlReq: 200, svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><circle cx='100' cy='90' r='70' fill='%23b9f2ff' stroke='%2300bfff' stroke-width='2'/><ellipse cx='100' cy='160' rx='42' ry='18' fill='%23b9f2ff' stroke='%2300bfff' stroke-width='2'/><circle cx='100' cy='80' r='38' fill='%23b9f2ff' stroke='%2300bfff' stroke-width='2'/><ellipse cx='86' cy='68' rx='12' ry='18' fill='%23b9f2ff' stroke='%2300bfff' stroke-width='2'/><ellipse cx='114' cy='68' rx='12' ry='18' fill='%23b9f2ff' stroke='%2300bfff' stroke-width='2'/><circle cx='100' cy='56' r='6' fill='%2300bfff'/><circle cx='88' cy='82' r='4' fill='%23333'/><circle cx='112' cy='82' r='4' fill='%23333'/><ellipse cx='100' cy='91' rx='3' ry='2' fill='%2300bfff'/><path d='M60 50 Q45 30 50 60' stroke='%2300bfff' stroke-width='2' fill='none'/><path d='M140 50 Q155 30 150 60' stroke='%2300bfff' stroke-width='2' fill='none'/></svg>`, desc: 'Elmas görünümlü' },
  { id: 'retro_skin', name: 'Retro Pixel', icon: '🎮', lvlReq: 250, svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect x='30' y='20' width='140' height='140' rx='10' fill='%23ff00ff' stroke='%23800080' stroke-width='2'/><rect x='60' y='60' width='80' height='60' rx='5' fill='%23ff00ff' stroke='%23800080' stroke-width='2'/><rect x='70' y='70' width='20' height='20' fill='%2300ffff'/><rect x='110' y='70' width='20' height='20' fill='%2300ffff'/><rect x='85' y='95' width='30' height='10' fill='%23ff0000'/></svg>`, desc: '8-bit pixel görünüm' },
  { id: 'dark', name: 'Karanlık Lord', icon: '👿', lvlReq: 300, svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><circle cx='100' cy='90' r='70' fill='%232d2d2d' stroke='%23ff4757' stroke-width='2'/><ellipse cx='100' cy='160' rx='42' ry='18' fill='%232d2d2d' stroke='%23ff4757' stroke-width='2'/><circle cx='100' cy='80' r='38' fill='%232d2d2d' stroke='%23ff4757' stroke-width='2'/><ellipse cx='86' cy='68' rx='12' ry='18' fill='%232d2d2d' stroke='%23ff4757' stroke-width='2'/><ellipse cx='114' cy='68' rx='12' ry='18' fill='%232d2d2d' stroke='%23ff4757' stroke-width='2'/><circle cx='100' cy='56' r='6' fill='%23ff0000'/><circle cx='88' cy='82' r='4' fill='%23ff0000'/><circle cx='112' cy='82' r='4' fill='%23ff0000'/><ellipse cx='100' cy='91' rx='3' ry='2' fill='%23ff0000'/></svg>`, desc: 'Karanlık güçlerin efendisi' },
  { id: 'rainbow', name: 'Gökkuşağı', icon: '🌈', lvlReq: 400, svg: null, desc: 'Renkli gökkuşağı efekti' },
];

function getUnlockedSkins() {
  return SKINS.filter(s => S.lvl >= s.lvlReq);
}

function applySkin(skinId) {
  if (!skinId) skinId = S.activeSkin || 'default';
  const skin = SKINS.find(s => s.id === skinId);
  if (!skin) return;
  if (S.lvl < skin.lvlReq) return;
  S.activeSkin = skinId;
  const img = document.querySelector('.tap-inner img');
  if (!img) return;
  if (skin.svg) {
    img.src = 'data:image/svg+xml;utf8,' + skin.svg;
  } else if (skin.id === 'rainbow') {
    const tapInner = document.querySelector('.tap-inner');
    if (tapInner) tapInner.style.background = 'linear-gradient(145deg, #ff000044, #ff880044, #ffff0044, #00ff0044, #0088ff44, #8800ff44, #ff008844)';
  } else {
    const tapInner = document.querySelector('.tap-inner');
    if (tapInner) tapInner.style.background = '';
    img.src = 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 200 200\'><circle cx=\'100\' cy=\'90\' r=\'70\' fill=\'%23ffffff\' stroke=\'%23d0d0d0\' stroke-width=\'2\'/><ellipse cx=\'100\' cy=\'160\' rx=\'42\' ry=\'18\' fill=\'%23ffffff\' stroke=\'%23d0d0d0\' stroke-width=\'2\'/><circle cx=\'100\' cy=\'80\' r=\'38\' fill=\'%23ffffff\' stroke=\'%23d0d0d0\' stroke-width=\'2\'/><ellipse cx=\'86\' cy=\'68\' rx=\'12\' ry=\'18\' fill=\'%23ffffff\' stroke=\'%23d0d0d0\' stroke-width=\'2\'/><ellipse cx=\'114\' cy=\'68\' rx=\'12\' ry=\'18\' fill=\'%23ffffff\' stroke=\'%23d0d0d0\' stroke-width=\'2\'/><ellipse cx=\'86\' cy=\'66\' rx=\'8\' ry=\'12\' fill=\'%23ffe4e1\'/><ellipse cx=\'114\' cy=\'66\' rx=\'8\' ry=\'12\' fill=\'%23ffe4e1\'/><circle cx=\'100\' cy=\'56\' r=\'6\' fill=\'%23ff9999\'/><circle cx=\'100\' cy=\'59\' r=\'5\' fill=\'%23ffffff\'/><circle cx=\'88\' cy=\'82\' r=\'4\' fill=\'%23333\'/><circle cx=\'112\' cy=\'82\' r=\'4\' fill=\'%23333\'/><ellipse cx=\'100\' cy=\'91\' rx=\'3\' ry=\'2\' fill=\'%23ff9999\'/><path d=\'M60 50 Q45 30 50 60\' stroke=\'%23ffffff\' stroke-width=\'3\' fill=\'none\' stroke-linecap=\'round\'/><path d=\'M140 50 Q155 30 150 60\' stroke=\'%23ffffff\' stroke-width=\'3\' fill=\'none\' stroke-linecap=\'round\'/><path d=\'M72 45 Q30 20 40 60\' stroke=\'%23ffffff\' stroke-width=\'2\' fill=\'none\'/><path d=\'M128 45 Q170 20 160 60\' stroke=\'%23ffffff\' stroke-width=\'2\' fill=\'none\'/><path d=\'M70 140 Q100 155 130 140 L125 152 Q100 168 75 152 Z\' fill=\'%23ff9999\'/></svg>';
  }
  sfxSkin();
  toast(`🎨 ${skin.icon} ${skin.name} aktif!`);
  save();
}

let lastSkinNotifLvl = 0;

function checkSkinUnlock() {
  SKINS.forEach(s => {
    if (S.lvl >= s.lvlReq && lastSkinNotifLvl < s.lvlReq) {
      if (lastSkinNotifLvl > 0) {
        toast(`🎨 ${s.icon} ${s.name} görünümü açıldı!`);
        const notif = document.createElement('div');
        notif.className = 'ach-notif';
        notif.innerHTML = `<span style="font-size:32px;">${s.icon}</span><div><div style="font-weight:700;">🎨 Yeni Görünüm!</div><div style="font-size:11px;color:#f3ba2f;">${s.name}</div><div style="font-size:11px;">Level ${s.lvlReq}</div></div>`;
        document.body.appendChild(notif);
        setTimeout(() => { notif.style.opacity = '0'; notif.style.transform = 'translateX(80px)'; setTimeout(() => notif.remove(), 400); }, 3000);
        sfxSkin();
        coinRain(10);
      }
      lastSkinNotifLvl = Math.max(lastSkinNotifLvl, s.lvlReq);
    }
  });
}

function renderSkinSelector() {
  const el = $('skinList');
  if (!el) return;
  const unlocked = getUnlockedSkins();
  const locked = SKINS.filter(s => S.lvl < s.lvlReq);
  el.innerHTML = '';
  [...unlocked, ...locked].forEach(s => {
    const owned = S.lvl >= s.lvlReq;
    const active = S.activeSkin === s.id || (!S.activeSkin && s.id === 'default');
    const d = document.createElement('div');
    d.style.cssText = `display:flex;align-items:center;gap:8px;padding:8px;border-radius:8px;cursor:${owned ? 'pointer' : 'default'};background:${active ? '#f3ba2f22' : 'rgba(255,255,255,.04)'};border:1px solid ${active ? '#f3ba2f' : owned ? 'rgba(255,255,255,.1)' : 'transparent'};opacity:${owned ? 1 : .4};`;
    d.innerHTML = `<span style="font-size:20px;">${owned ? s.icon : '🔒'}</span><span style="font-size:13px;font-weight:600;color:#fff;">${owned ? s.name : `${s.name} (Level ${s.lvlReq})`}</span>${active ? '<span style="font-size:11px;color:#f3ba2f;">✓</span>' : ''}`;
    if (owned) d.addEventListener('click', () => { applySkin(s.id); renderSkinSelector(); });
    el.appendChild(d);
  });
}

function checkComboMilestones(comboCount) {
  const milestones = [10, 25, 50, 100, 250, 500];
  milestones.forEach(m => {
    if (comboCount >= m && !S.comboMilestones?.includes(m)) {
      if (!S.comboMilestones) S.comboMilestones = [];
      S.comboMilestones.push(m);
      const bonus = m * 100;
      S.coins += bonus;
      flashOverlay('gold');
      screenShake();
      fireworkCelebration();
      spawnFloat(innerWidth / 2, innerHeight / 2 - 60, `🔥 ${m} COMBO MILESTONE!`, false, '#ff9f43');
      toast(`🔥 ${m} COMBO! +${fmt(bonus)} Coin bonus!`);
      coinRain(20);
      sfxCombo();
    }
  });
}

/* ===== DAILY TASKS ===== */
const DAILY_TASKS = [
  { id: 'tap500', icon: '👆', name: '500 Tık At', check: s => s.totalTaps >= 500, reward: 5000, gem: 5 },
  { id: 'earn50k', icon: '💰', name: '50K Coin Kazan', check: s => s.totalEarned >= 50000, reward: 10000, gem: 10 },
  { id: 'combo20', icon: '🔥', name: '20 Combo Yap', check: s => s.bestCombo >= 20, reward: 8000, gem: 8 },
  { id: 'openCrate', icon: '📦', name: 'Kasa Aç', check: s => s.crates >= 1, reward: 5000, gem: 5 },
  { id: 'crate5', icon: '📦', name: 'Kasa Aç (5)', check: s => s.crates >= 5, reward: 20000, gem: 20 },
];

function renderDailyTasks() {
  const el = $('dailyTasks');
  if (!el) return;
  const today = new Date().toDateString();
  if (!S.dailyTasks) S.dailyTasks = {};
  if (S.dailyTasksDate !== today) { S.dailyTasks = {}; S.dailyTasksDate = today; save(); }
  el.innerHTML = DAILY_TASKS.map(t => {
    const done = S.dailyTasks[t.id];
    return `<div class="task" style="opacity:${done ? '.5' : '1'};">
      <span style="font-size:18px;">${done ? '✅' : t.icon}</span>
      <span style="flex:1;font-weight:600;font-size:12px;">${t.name}</span>
      <span style="font-size:11px;color:#f3ba2f;">${done ? '✓' : `${fmt(t.reward)} +${t.gem}💎`}</span>
    </div>`;
  }).join('');
  S._dailyTaskChecked = true;
}

function checkDailyTasks() {
  const today = new Date().toDateString();
  if (!S.dailyTasks) S.dailyTasks = {};
  if (S.dailyTasksDate !== today) { S.dailyTasks = {}; S.dailyTasksDate = today; save(); }
  DAILY_TASKS.forEach(t => {
    if (S.dailyTasks[t.id]) return;
    if (t.check(S)) {
      S.dailyTasks[t.id] = true;
      S.coins += t.reward;
      S.gems += t.gem || 0;
      sfxGem();
      toast(`✅ Görev: ${t.name}! +${fmt(t.reward)} +${t.gem}💎`);
      coinRain(8);
    }
  });
}

/* ===== RENDER SET BONUSES ===== */
function renderSetBonuses() {
  const el = $('setBonusList');
  if (!el) return;
  const active = calcSetBonuses();
  if (!active.length) {
    el.innerHTML = SET_BONUSES.map(s => {
      const cards = CARDS.filter(c => c.cat === s.cat);
      const owned = cards.filter(c => getItemLevel(c.id) > 0).length;
      return `<div class="set-bonus-card" style="opacity:.5;">
        <span class="s-icon">🔒</span>
        <div><div class="s-name">${s.name}</div><div class="s-desc">${owned}/${cards.length} - ${s.desc}</div></div>
      </div>`;
    }).join('');
    return;
  }
  el.innerHTML = active.map(s => `<div class="set-bonus-card">
    <span class="s-icon">✅</span>
    <div><div class="s-name">${s.name} AKTİF</div><div class="s-desc">${s.desc}</div></div>
  </div>`).join('');
}

/* ===== DAILY COMBO GUESS (Dynamic) ===== */
let dailyComboPick = [];
let dailyComboCorrect = [];

function getTodayCombo() {
  const today = new Date().toDateString();
  if (!S.comboGuess || S.comboGuessDate !== today) {
    const pool = CARDS.filter(c => c.cat !== 'retro');
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    S.comboGuess = shuffled.slice(0, 3).map(c => c.id);
    S.comboGuessDate = today;
    save();
  }
  return S.comboGuess || [];
}

function renderComboHint() {
  const el = $('comboHint');
  if (!el) return;
  const ids = getTodayCombo();
  const cards = ids.map(id => CARDS.find(c => c.id === id)).filter(Boolean);
  el.innerHTML = cards.map(c =>
    `<span style="font-size:16px;opacity:.6;filter:blur(3px);cursor:help;" title="Günlük combo kartı">${c.icon}</span>`
  ).join(' ');
}

$('dailyComboTime').addEventListener('click', () => {
  dailyComboCorrect = getTodayCombo();
  $('dailyComboModal').classList.remove('hidden');
  renderComboCards();
});
$('closeComboModal').addEventListener('click', () => { $('dailyComboModal').classList.add('hidden'); });

function renderComboCards() {
  const g = $('comboCards');
  if (!g) return;
  g.innerHTML = '';
  const pool = CARDS.filter(c => c.cat !== 'retro' || S.lvl >= 250);
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 12);
  shuffled.forEach(c => {
    const sel = dailyComboPick.includes(c.id);
    const d = document.createElement('div');
    d.style.cssText = `width:52px;height:52px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;cursor:pointer;background:${sel ? '#f3ba2f' : 'rgba(255,255,255,.06)'};border:2px solid ${sel ? '#f3ba2f' : 'transparent'};`;
    if (sel) d.style.transform = 'scale(1.1)';
    d.textContent = c.icon;
    d.title = c.name;
    d.addEventListener('click', () => {
      const idx = dailyComboPick.indexOf(c.id);
      if (idx >= 0) dailyComboPick.splice(idx, 1);
      else if (dailyComboPick.length < 3) dailyComboPick.push(c.id);
      renderComboCards();
    });
    g.appendChild(d);
  });
  const hintEl = $('comboHint');
  if (hintEl) hintEl.textContent = `${dailyComboPick.length}/3 seçildi`;
}

$('guessComboBtn').addEventListener('click', () => {
  const today = new Date().toDateString();
  if (S.comboGuessedToday === today) { toast('❌ Bugün zaten tahmin ettin!'); return; }
  if (dailyComboPick.length !== 3) { toast('❌ 3 kart seç!'); return; }
  if ((S.gems || 0) < 50) { toast('❌ 50💎 gerekli!'); return; }
  S.gems -= 50;
  S.comboGuessedToday = today;
  const correct = getTodayCombo();
  const matchCount = dailyComboPick.filter(id => correct.includes(id)).length;
  if (matchCount === 3) {
    const bonus = 100000 + S.lvl * 2000;
    S.coins += bonus;
    S.gems += 80;
    toast(`🎯 MÜKEMMEL! +${fmt(bonus)} Coin +80💎`);
    fireworkCelebration();
    coinRain(25);
  } else if (matchCount === 2) {
    S.coins += 25000;
    S.gems += 10;
    toast(`👍 2/3 doğru! +25,000 Coin +10💎`);
    coinRain(12);
  } else if (matchCount === 1) {
    S.coins += 5000;
    toast(`👎 1/3 doğru! +5,000 Coin`);
    coinRain(5);
  } else {
    toast('❌ 0/3 bilemedin. Geçmiş olsun!');
  }
  update();
});

/* ===== DAILY CIPHER (MORSE CODE) ===== */
const MORSE = {'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---','K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.'};
const CIPHER_WORDS = ["BTC","SOL","TON","RAT","GEM","CEO","HAMSTER","MOON","FISH","PUMP","DUMP","COIN","MINE","BOSS","GOLD","PIXEL","HAM","LUCK","TAP","HODL"];

function getTodayCipher() {
  const day = Math.floor(Date.now() / 86400000);
  return CIPHER_WORDS[day % CIPHER_WORDS.length];
}

let cipherState = { word: '', currentLetter: 0, inputBuffer: '', completed: false };

function openCipher() {
  cipherState.word = getTodayCipher();
  cipherState.currentLetter = 0;
  cipherState.inputBuffer = '';
  cipherState.completed = false;
  renderCipher();
  $('dailyCipherModal').classList.remove('hidden');
}

function renderCipher() {
  const w = cipherState.word;
  const targetLetter = w[cipherState.currentLetter] || '';
  const morseTarget = MORSE[targetLetter] || '';
  $('cipherWordDisplay').textContent = w.split('').map((l, i) => i < cipherState.currentLetter ? `<span style="color:#2ed573;">${l}</span>` : `<span style="color:#8e9cb5;">${l}</span>`).join(' ');
  $('cipherLetters').innerHTML = w.split('').map((l, i) => {
    const m = MORSE[l] || '';
    if (i < cipherState.currentLetter) return `<div style="background:rgba(46,213,115,.2);border:1px solid #2ed573;border-radius:8px;padding:4px 8px;font-size:10px;color:#2ed573;font-family:monospace;">${l}<br>${m}</div>`;
    if (i === cipherState.currentLetter) return `<div style="background:rgba(243,186,47,.15);border:1px solid #f3ba2f;border-radius:8px;padding:4px 8px;font-size:10px;color:#f3ba2f;font-family:monospace;">${l}<br>${m}</div>`;
    return `<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:4px 8px;font-size:10px;color:#8e9cb5;font-family:monospace;">${l}<br>${m}</div>`;
  }).join('');
  $('cipherInputDisplay').textContent = cipherState.inputBuffer || '⏎ bekleniyor...';
  $('cipherInputDisplay').style.color = cipherState.inputBuffer ? '#fff' : '#8e9cb5';
  $('cipherCharIndex').textContent = cipherState.currentLetter;
  $('cipherTotalChars').textContent = w.length;
}

function submitCipherChar() {
  const buf = cipherState.inputBuffer;
  const w = cipherState.word;
  const expected = MORSE[w[cipherState.currentLetter]] || '';
  if (buf === expected) {
    cipherState.currentLetter++;
    cipherState.inputBuffer = '';
    sfxGem();
    spawnFloat(innerWidth / 2, innerHeight / 2 - 40, '✅', false, '#2ed573');
    if (cipherState.currentLetter >= w.length) {
      cipherState.completed = true;
      const reward = 1000000;
      S.coins += reward;
      S.gems += 50;
      toast(`🎉 ŞİFRE ÇÖZÜLDÜ! +${fmt(reward)} Coin +50💎`);
      fireworkCelebration();
      coinRain(30);
      flashOverlay('rainbow');
      save();
      update();
      $('cipherInputDisplay').textContent = '🎉 TEBRİKLER!';
      $('cipherInputDisplay').style.color = '#f3ba2f';
      return;
    }
    renderCipher();
  } else {
    S.energy = Math.max(0, S.energy - 50);
    toast(`❌ Yanlış! "${buf}" beklenen "${expected}" değil. -50 Enerji`);
    cipherState.inputBuffer = '';
    renderCipher();
  }
}

/* Cipher Tap Button */
const cipherTapBtn = $('cipherTapBtn');
let cipherTimer = null;
let cipherPressStart = 0;
if (cipherTapBtn) {
  cipherTapBtn.addEventListener('mousedown', () => { cipherPressStart = Date.now(); });
  cipherTapBtn.addEventListener('mouseup', () => {
    if (cipherState.completed || cipherState.currentLetter >= (cipherState.word || '').length) return;
    const dur = Date.now() - cipherPressStart;
    cipherState.inputBuffer += dur >= 300 ? '-' : '.';
    renderCipher();
    sfxMultitap();
    const word = cipherState.word;
    if (MORSE[word[cipherState.currentLetter]] && cipherState.inputBuffer.length >= MORSE[word[cipherState.currentLetter]].length) {
      submitCipherChar();
    }
  });
  cipherTapBtn.addEventListener('touchstart', e => { e.preventDefault(); cipherPressStart = Date.now(); });
  cipherTapBtn.addEventListener('touchend', e => {
    e.preventDefault();
    if (cipherState.completed || cipherState.currentLetter >= (cipherState.word || '').length) return;
    const dur = Date.now() - cipherPressStart;
    cipherState.inputBuffer += dur >= 300 ? '-' : '.';
    renderCipher();
    sfxMultitap();
    const word = cipherState.word;
    if (MORSE[word[cipherState.currentLetter]] && cipherState.inputBuffer.length >= MORSE[word[cipherState.currentLetter]].length) {
      submitCipherChar();
    }
  });
}
$('cipherResetBtn')?.addEventListener('click', () => {
  cipherState.currentLetter = 0;
  cipherState.inputBuffer = '';
  $('cipherInputDisplay').textContent = '⏎ bekleniyor...';
  $('cipherInputDisplay').style.color = '#8e9cb5';
  renderCipher();
});
$('closeCipherModal')?.addEventListener('click', () => $('dailyCipherModal').classList.add('hidden'));

/* ===== LUCKY SPIN WHEEL ===== */
const WHEEL_SLICES = [
  { label: '50K 💰', coins: 50000, gems: 0, color: '#2ed573' },
  { label: '10💎', coins: 0, gems: 10, color: '#3498db' },
  { label: '250K 💰', coins: 250000, gems: 0, color: '#9b59b6' },
  { label: '🔥 2x', coins: 0, gems: 0, boost: true, color: '#ff9f43' },
  { label: '100K 💰', coins: 100000, gems: 0, color: '#1dd1a1' },
  { label: '25💎', coins: 0, gems: 25, color: '#f3ba2f' },
  { label: '⚡ Full', coins: 0, gems: 0, refill: true, color: '#ff4757' },
  { label: '1M 🌟', coins: 1000000, gems: 100, color: '#f368e0' },
];

let wheelAngle = 0;
let wheelSpinning = false;

function drawWheel(ctx, angle) {
  const cx = 140, cy = 140, r = 130;
  const sliceAngle = (2 * Math.PI) / WHEEL_SLICES.length;
  ctx.clearRect(0, 0, 280, 280);
  WHEEL_SLICES.forEach((s, i) => {
    const start = angle + i * sliceAngle;
    const end = start + sliceAngle;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    const mid = start + sliceAngle / 2;
    const tx = cx + Math.cos(mid) * r * 0.6;
    const ty = cy + Math.sin(mid) * r * 0.6;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.label, tx, ty);
  });
  ctx.beginPath();
  ctx.arc(cx, cy - r + 10, 18, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#ff4757';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('▼', cx, cy - r + 6);
}

let wheelCtx = null;

function initWheel() {
  const canvas = $('wheelCanvas');
  if (!canvas) return;
  wheelCtx = canvas.getContext('2d');
  drawWheel(wheelCtx, wheelAngle);
}

function spinWheel(paid) {
  if (wheelSpinning) return;
  const today = new Date().toDateString();
  const isFree = !paid && S.wheelFreeDate !== today;
  if (!isFree && !paid) {
    if ((S.gems || 0) < 20) { toast('❌ 20💎 gerekli!'); return; }
    S.gems -= 20;
  }
  if (isFree) S.wheelFreeDate = today;
  wheelSpinning = true;
  const spins = 5 + Math.floor(Math.random() * 5);
  const targetAngle = wheelAngle + spins * 2 * Math.PI + Math.random() * 2 * Math.PI;
  const startAngle = wheelAngle;
  const duration = 3000;
  const startTime = Date.now();
  save();
  function animate() {
    const elapsed = Date.now() - startTime;
    const p = Math.min(1, elapsed / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    const curr = startAngle + (targetAngle - startAngle) * eased;
    wheelAngle = curr;
    if (wheelCtx) drawWheel(wheelCtx, curr);
    if (elapsed % 200 < 20) sfxMultitap();
    if (p < 1) requestAnimationFrame(animate);
    else {
      wheelSpinning = false;
      wheelAngle = curr;
      const sliceAngle = (2 * Math.PI) / WHEEL_SLICES.length;
      const norm = ((curr % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const idx = Math.floor(norm / sliceAngle);
      const prize = WHEEL_SLICES[idx];
      if (prize) {
        S.coins += prize.coins || 0;
        S.gems += prize.gems || 0;
        if (prize.boost) startX2(120);
        if (prize.refill) S.energy = S.maxEnergy;
        let msg = `🎡 ${prize.label}`;
        if (prize.coins) msg = `🎡 +${fmt(prize.coins)} Coin!`;
        if (prize.gems) msg = `🎡 +${prize.gems}💎!`;
        if (prize.boost) msg = '🎡 🔥 2x Çarpan 2dk!';
        if (prize.refill) msg = '🎡 ⚡ Enerji Fullendi!';
        toast(msg);
        if (prize.gems > 30 || prize.coins >= 500000) { fireworkCelebration(); coinRain(20); flashOverlay('rainbow'); }
      }
      update();
      if ($('wheelFreeCount')) $('wheelFreeCount').textContent = '0';
      save();
    }
  }
  animate();
}

$('spinBtn')?.addEventListener('click', spinWheel);
$('spinExtraBtn')?.addEventListener('click', () => {
  if ((S.gems || 0) < 20) { toast('❌ 20💎 gerekli!'); return; }
  S.gems -= 20;
  spinWheel(true);
});
$('closeWheelModal')?.addEventListener('click', () => $('wheelModal').classList.add('hidden'));

/* ===== AIRDROP DASHBOARD ===== */
function openAirdrop() {
  const pph = S.perSec * 3600;
  const keys = (S.bossWins || 0) + Math.floor((S.crates || 0) / 3);
  const leagues = ['Bronz','Gümüş','Altın','Platin','Elmas'];
  const leagueIdx = Math.min(4, Math.floor(S.lvl / 50));
  const league = leagues[leagueIdx];
  const leagueMult = 1 + leagueIdx * 0.5;
  const tokens = Math.floor(pph * keys * leagueMult / 1000);
  const totalTasks = Object.keys(DAILY_TASKS || {}).length || 5;
  const doneTasks = (S.dailyTasks ? Object.values(S.dailyTasks).filter(v => v).length : 0);
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  $('airdropPph').textContent = fmt(pph);
  $('airdropKeys').textContent = keys;
  $('airdropLeague').textContent = league;
  $('airdropTokens').textContent = fmt(tokens);
  $('airdropProgress').textContent = progress + '%';
  $('airdropModal').classList.remove('hidden');
}

/* Airdrop Countdown Timer */
setInterval(() => {
  const el = $('airdropCountdown');
  if (!el) return;
  const now = Date.now();
  const target = new Date();
  target.setDate(target.getDate() + (7 - target.getDay()) % 7 || 7);
  target.setHours(12, 0, 0, 0);
  const diff = target - now;
  if (diff <= 0) { el.textContent = '🟢 Canlı!'; return; }
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}, 1000);
$('closeAirdropModal')?.addEventListener('click', () => $('airdropModal').classList.add('hidden'));

/* ===== DAILY CARD CLICKS ===== */
document.querySelectorAll('.daily-card').forEach(card => {
  const text = card.textContent.toLowerCase();
  if (text.includes('cipher') || text.includes('şifre')) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', openCipher);
  }
  if (text.includes('reward') || text.includes('ödül')) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => $('dailyModal').classList.remove('hidden'));
  }
});

/* ===== CRATES (Tiered) ===== */
const CRATE_TIERS = [
  { name: 'Tahta Kasa', icon: '🪵', color: '#85827d', min: 2000, max: 8000, gemMin: 3, gemMax: 8, energy: 300, weight: 60 },
  { name: 'Gümüş Kasa', icon: '🥈', color: '#c0c0c0', min: 10000, max: 40000, gemMin: 8, gemMax: 20, energy: 600, weight: 30 },
  { name: 'Altın Kasa', icon: '🥇', color: '#f3ba2f', min: 50000, max: 200000, gemMin: 20, gemMax: 50, energy: 1000, weight: 9 },
  { name: 'Elmas Kasa', icon: '💎', color: '#3498db', min: 200000, max: 1000000, gemMin: 50, gemMax: 150, energy: 2500, weight: 1 },
];

function pickCrateTier() {
  const total = CRATE_TIERS.reduce((s, t) => s + t.weight, 0);
  let r = Math.random() * total;
  for (const t of CRATE_TIERS) { r -= t.weight; if (r <= 0) return t; }
  return CRATE_TIERS[0];
}

let currentCrate = null;

function spawnCrate() {
  S.crates++;
  currentCrate = pickCrateTier();
  $('crateModal').classList.remove('hidden');
  $('crateRewards').classList.add('hidden');
  $('crateRewards').innerHTML = '';
  $('openCrateBtn').classList.remove('hidden');
  $('claimCrateBtn').classList.add('hidden');
  const titleEl = document.querySelector('#crateModal .modal-card h3');
  if (titleEl) titleEl.textContent = `📦 ${currentCrate.name} DÜŞTÜ!`;
  const iconEl = document.querySelector('#crateModal .modal-card .crate-icon');
  if (iconEl) { iconEl.textContent = currentCrate.icon; iconEl.style.animation = 'none'; void iconEl.offsetWidth; iconEl.style.animation = 'crateDrop .8s ease-out'; }
  flashOverlay(currentCrate.color);
  sfxGem();
  const notif = document.createElement('div');
  notif.className = 'ach-notif';
  notif.innerHTML = `<span style="font-size:32px;">${currentCrate.icon}</span><div><div style="font-weight:700;">📦 Kasa Düştü!</div><div style="font-size:11px;color:${currentCrate.color};">${currentCrate.name}</div></div>`;
  document.body.appendChild(notif);
  setTimeout(() => { notif.style.opacity = '0'; notif.style.transform = 'translateX(80px)'; setTimeout(() => notif.remove(), 400); }, 2500);
}

$('openCrateBtn').addEventListener('click', () => {
  $('openCrateBtn').classList.add('hidden');
  const iconEl = document.querySelector('#crateModal .modal-card .crate-icon');
  if (iconEl) { iconEl.style.animation = 'none'; void iconEl.offsetWidth; iconEl.style.animation = 'crateShake .5s ease-in-out'; }
  setTimeout(() => {
    const t = currentCrate || pickCrateTier();
    const reward = Math.floor(Math.random() * (t.max - t.min)) + t.min;
    const gemReward = Math.floor(Math.random() * (t.gemMax - t.gemMin)) + t.gemMin;
    S.coins += reward;
    S.gems += gemReward;
    S.energy = Math.min(S.maxEnergy, S.energy + t.energy);
    flashOverlay(t.color);
    spawnParticles(innerWidth/2, innerHeight/2, t.color);
    screenShake();
    if (t.weight <= 9) coinRain(25);
    else coinRain(10);
    toast(`🎉 ${t.icon} ${t.name}! +${fmt(reward)} Coin +${gemReward}💎 +⚡${t.energy}!`);
    $('crateRewards').classList.remove('hidden');
    $('crateRewards').innerHTML = `
      <div style="font-size:28px;color:${t.color};animation:scaleIn .3s ease-out;">${t.icon}</div>
      <div style="font-size:20px;font-weight:800;">💰 +${fmt(reward)}</div>
      <div style="font-size:14px;">⚡ ${t.energy} | 💎 +${gemReward}</div>
      <div style="font-size:11px;color:${t.color};margin-top:4px;">${t.name}</div>
    `;
    $('claimCrateBtn').classList.remove('hidden');
    if (iconEl) { iconEl.style.animation = ''; }
    update();
  }, 500);
});
$('claimCrateBtn').addEventListener('click', () => { $('crateModal').classList.add('hidden'); });

/* ===== GEM SHOP ===== */
const SHOP_ITEMS = [
  { id: 'refill', icon: '⚡', name: 'Tam Enerji', cost: 50, desc: 'Enerjiyi full doldur' },
  { id: 'boost', icon: '🚀', name: 'Süper Boost', cost: 100, desc: '+1000 anlık enerji + 20s boost' },
  { id: 'coinBonus', icon: '💰', name: 'Coin Patı', cost: 200, desc: '+50.000 Coin' },
  { id: 'xpBoost', icon: '⭐', name: 'XP Güçlendirme', cost: 150, desc: '+500 XP' },
  { id: 'x2_24h', icon: '🔥', name: '24s 2x Çarpan', cost: 500, desc: '24 saat boyunca 2x kazanç!', special: true },
  { id: 'autoTap', icon: '🤖', name: 'Otomatik Tık (1s)', cost: 300, desc: '1 saat boyunca saniyede 1 otomatik tık', special: true },
  { id: 'megaCrate', icon: '💎', name: 'Elmas Kasa', cost: 250, desc: 'Direkt Elmas kasa aç!', special: true },
];

$('gemDisplay').addEventListener('click', () => {
  $('shopModal').classList.remove('hidden');
  renderShop();
});
$('closeShopModal').addEventListener('click', () => { $('shopModal').classList.add('hidden'); });

function renderShop() {
  $('shopGemCount').textContent = S.gems || 0;
  const g = $('shopGrid');
  g.innerHTML = '';
  SHOP_ITEMS.forEach(item => {
    const d = document.createElement('div');
    d.className = 'shop-item';
    d.innerHTML = `
      <span class="s-icon">${item.icon}</span>
      <strong>${item.name}</strong>
      <span style="font-size:10px;color:#8e9cb5;">${item.desc}</span>
      <span class="s-cost">💎${item.cost}</span>
    `;
    d.addEventListener('click', () => buyShopItem(item));
    g.appendChild(d);
  });
}

let autoTapInterval = null;
let x2End = 0;
let x2Interval = null;

function buyShopItem(item) {
  if ((S.gems || 0) < item.cost) { toast('❌ Yetersiz elmas!'); return; }
  S.gems -= item.cost;
  switch (item.id) {
    case 'refill':
      S.energy = S.maxEnergy;
      toast('⚡ Enerji fullendi!');
      break;
    case 'boost':
      S.energy = Math.min(S.maxEnergy, S.energy + 1000);
      S.boostCD = Date.now();
      toast('🚀 +1000 Enerji!');
      break;
    case 'coinBonus':
      S.coins += 50000;
      coinRain(15);
      toast('💰 +50.000 Coin!');
      break;
    case 'xpBoost':
      addXp(500);
      toast('⭐ +500 XP!');
      break;
    case 'x2_24h':
      startX2(86400);
      toast('🔥 24 saat 2x çarpan aktif!');
      break;
    case 'autoTap':
      if (autoTapInterval) { clearInterval(autoTapInterval); }
      S.gems += 1;
      save();
      let tapsDone = 0;
      const maxTaps = 3600;
      autoTapInterval = setInterval(() => {
        if (tapsDone >= maxTaps || S.energy < 1) {
          clearInterval(autoTapInterval);
          autoTapInterval = null;
          toast('🤖 Otomatik tık bitti!');
          return;
        }
        processTap(innerWidth / 2, innerHeight / 2);
        tapsDone++;
      }, 1000);
      toast('🤖 1 saat otomatik tık başladı!');
      break;
    case 'megaCrate':
      currentCrate = CRATE_TIERS[3];
      const reward = Math.floor(Math.random() * (CRATE_TIERS[3].max - CRATE_TIERS[3].min)) + CRATE_TIERS[3].min;
      const gemReward = Math.floor(Math.random() * (CRATE_TIERS[3].gemMax - CRATE_TIERS[3].gemMin)) + CRATE_TIERS[3].gemMin;
      S.coins += reward;
      S.gems += gemReward;
      S.energy = Math.min(S.maxEnergy, S.energy + CRATE_TIERS[3].energy);
      flashOverlay('#3498db');
      coinRain(30);
      toast(`💎 ELMAS KASA! +${fmt(reward)} Coin +${gemReward}💎!`);
      break;
  }
  update();
  renderShop();
}

/* ===== MUSIC & SETTINGS ===== */
const bgm = $('bgm');
bgm.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
bgm.volume = S.settings.musicVol || 0.5;

$('wheelBtn')?.addEventListener('click', () => {
  initWheel();
  if ($('wheelFreeCount')) $('wheelFreeCount').textContent = S.wheelFreeDate === new Date().toDateString() ? '0' : '1';
  $('wheelModal').classList.remove('hidden');
});
$('airdropBtn')?.addEventListener('click', openAirdrop);
$('skinBtn')?.addEventListener('click', () => {
  $('skinModal').classList.remove('hidden');
  renderSkinSelector();
});
$('closeSkinModal')?.addEventListener('click', () => { $('skinModal').classList.add('hidden'); });

$('statBtn')?.addEventListener('click', () => {
  $('statModal').classList.remove('hidden');
  const el = $('statContent');
  if (!el) return;
  const stats = [
    ['👆 Toplam Tık', fmt(S.totalTaps || 0)],
    ['💰 Toplam Kazanç', fmt(S.totalEarned || 0)],
    ['🏆 Boss Galibiyet', fmt(S.bossWins || 0)],
    ['🔥 En İyi Combo', (S.bestCombo || 0) + 'x'],
    ['📦 Açılan Kasa', fmt(S.crates || 0)],
    ['👥 Davet Edilen', fmt(S.friends || 0)],
    ['💎 Harcanan Elmas', fmt((S.gemsSpent || 0))],
    ['📅 Streak', (S.dailyStreak || 0) + ' gün'],
    ['⚡ Max Enerji', fmt(S.maxEnergy)],
    ['👆 Çoklu Tık', (S.multiTap || 1) + 'x'],
    ['⚡ Yenilenme', (2 + (S.energyRegenBonus || 0)).toFixed(1) + '/s'],
    ['🎨 Aktif Skin', SKINS.find(s => s.id === (S.activeSkin || 'default'))?.name || 'Klasik'],
    ['💰 Offline Kazanç', fmt(S.totalOffline || 0)],
  ];
  el.innerHTML = stats.map(([label, val]) =>
    `<div style="display:flex;justify-content:space-between;padding:8px 10px;background:rgba(255,255,255,.04);border-radius:8px;"><span style="color:#8e9cb5;">${label}</span><span style="font-weight:700;">${val}</span></div>`
  ).join('');
});
$('closeStatModal')?.addEventListener('click', () => { $('statModal').classList.add('hidden'); });

/* ===== CARD DETAIL ===== */
function showCardDetail(id) {
  const c = CARDS.find(x => x.id === id);
  if (!c) return;
  const lvl = getItemLevel(c.id);
  const cost = cardCost(c);
  const nextCost = cardCost(c, lvl + 1);
  const el = $('cardDetailContent');
  const perSecHere = (c.baseSec || 0) * lvl;
  const perSecNext = (c.baseSec || 0) * (lvl + 1);
  const perClickHere = (c.baseClick || 0) * lvl;
  const perClickNext = (c.baseClick || 0) * (lvl + 1);
  const rarityColors = {'common':'#8e9cb5','uncommon':'#2ed573','rare':'#3498db','epic':'#9b59b6','legendary':'#f39c12','mythic':'#ff4757'};
  const rc = rarityColors[c.rarity] || '#fff';
  el.innerHTML = `
    <span style="font-size:48px;">${c.icon}</span>
    <h3 style="color:${rc};margin:0;">${c.name}</h3>
    <span style="color:#8e9cb5;font-size:11px;">${c.rarity.toUpperCase()} · Seviye ${lvl}/9999 ${c.cat === 'retro' ? '🎮 RETRO' : ''}</span>
    <span style="color:${rc};font-size:22px;font-weight:800;">💰${fmt(cost)}</span>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;width:100%;margin-top:6px;">
      <div style="background:rgba(255,255,255,.04);padding:8px;border-radius:8px;text-align:center;">
        <div style="color:#8e9cb5;font-size:10px;">Anlık ⏱️</div>
        ${perSecHere > 0 ? `<div style="font-size:14px;font-weight:700;">💰${fmt(perSecHere)}/s</div>` : ''}
        ${perClickHere > 0 ? `<div style="font-size:14px;font-weight:700;">👆${fmt(perClickHere)}/tık</div>` : ''}
        ${lvl === 0 ? `<div style="font-size:12px;color:#8e9cb5;">Henüz sahip değil</div>` : ''}
      </div>
      <div style="background:rgba(255,255,255,.04);padding:8px;border-radius:8px;text-align:center;">
        <div style="color:#8e9cb5;font-size:10px;">Sonraki ⏭️</div>
    ${perSecNext > 0 ? `<div style="font-size:14px;font-weight:700;color:#2ed573;">💰${fmt(perSecNext)}/s</div>` : ''}
    ${perClickNext > 0 ? `<div style="font-size:14px;font-weight:700;color:#2ed573;">👆${fmt(perClickNext)}/tık</div>` : ''}
        <div style="font-size:11px;color:#8e9cb5;">💰${fmt(nextCost)}</div>
      </div>
    </div>
    ${c.desc ? `<div style="color:#8e9cb5;font-size:11px;text-align:center;margin-top:4px;">📖 ${c.desc}</div>` : ''}
    ${lvl > 0 && lvl < 9999 ? `<button class="btn btn-gold btn-block" style="margin-top:6px;font-size:12px;" id="quickBuyDetailBtn">↑ Yükselt (💰${fmt(cost)})</button>` : ''}
    ${lvl > 0 ? `<button class="btn btn-secondary btn-block" style="margin-top:4px;font-size:11px;background:rgba(255,71,87,.15);color:#ff4757;" id="sellDetailBtn">🔄 Sat (💰${fmt(Math.floor(cardCost(c, lvl) * 0.4))})</button>` : ''}
  `;
  $('cardDetailModal').classList.remove('hidden');
  const buyBtn = $('quickBuyDetailBtn');
  if (buyBtn) buyBtn.addEventListener('click', () => { buyCard(id); showCardDetail(id); });
  const sellBtn = $('sellDetailBtn');
  if (sellBtn) sellBtn.addEventListener('click', () => { if (confirm(`${c.icon} ${c.name} seviye ${lvl} satılsın mı?`)) { sellCard(id); $('cardDetailModal').classList.add('hidden'); } });
}
$('closeCardDetail')?.addEventListener('click', () => { $('cardDetailModal').classList.add('hidden'); });

document.querySelector('.settings-icon').addEventListener('click', () => {
  $('settingsModal').classList.remove('hidden');
  initSettingsUI();
});
$('closeSettingsModal').addEventListener('click', () => { $('settingsModal').classList.add('hidden'); });

function initSettingsUI() {
  const mb = $('musicToggleBtn');
  mb.textContent = S.settings.musicOn ? 'Açık' : 'Kapalı';
  mb.style.background = S.settings.musicOn ? '' : 'rgba(255,255,255,.08)';
  mb.style.color = S.settings.musicOn ? '' : '#8e9cb5';
  const sb = $('sfxToggleBtn');
  sb.textContent = S.settings.sfxOn ? 'Açık' : 'Kapalı';
  sb.style.background = S.settings.sfxOn ? '' : 'rgba(255,255,255,.08)';
  sb.style.color = S.settings.sfxOn ? '' : '#8e9cb5';
  $('volumeSlider').value = (S.settings.musicVol || 0.5) * 100;
  $('sfxSlider').value = (S.settings.sfxVol || 0.5) * 100;
}

$('musicToggleBtn').addEventListener('click', () => {
  S.settings.musicOn = !S.settings.musicOn;
  initSettingsUI();
  if (S.settings.musicOn) { bgm.play().catch(() => {}); toast('🎵 Müzik açıldı'); } else { bgm.pause(); toast('🔇 Müzik kapatıldı'); }
  save();
});

$('volumeSlider').addEventListener('input', e => {
  S.settings.musicVol = e.target.value / 100;
  bgm.volume = S.settings.musicVol;
  if (S.settings.musicOn && bgm.paused) bgm.play().catch(() => {});
  save();
});

$('sfxToggleBtn').addEventListener('click', () => {
  S.settings.sfxOn = !S.settings.sfxOn;
  initSettingsUI();
  toast(S.settings.sfxOn ? '🔊 Efekt sesleri açıldı' : '🔇 Efekt sesleri kapatıldı');
  save();
});

$('sfxSlider').addEventListener('input', e => {
  S.settings.sfxVol = e.target.value / 100;
  save();
});

/* ===== NAME PICKER ===== */
const PRESET_NAMES = [
  '🐹 HamsterKing', '⚡ CryptoCEO', '💎 ElmasKral', '🔥 AteşTopu', '🌀 HızlıFare',
  '🎮 PixelHero', '👑 BossHunter', '🚀 RocketTap', '⭐ YıldızFare', '💰 CoinLord',
  '🦾 MegaTap', '🤖 AutoBot', '🥇 GoldHamster', '🏆 ChampTap', '💥 CritMaster',
  '🌪️ ComboKing', '⚡ EnergyLord', '💎 DiamondRat', '🎯 SniperTap', '🔥 BlazeIt',
  '🌀 ChaosTap', '⚔️ BossSlayer', '🛡️ TankHamster', '🎲 LuckyRat', '💫 StarCollector',
  '🌙 NightTap', '☀️ SunHamster', '💧 WaterRat', '🌿 NatureTap', '🎪 ShowMaster',
  '🎭 MaskedTap', '🎪 CircusRat', '🎯 TargetHit', '🎲 DiceRoller', '🎰 JackpotRat'
];

function openNamePicker() {
  const modal = $('namePickerModal');
  modal.classList.remove('hidden');
  rollNames();
}

function rollNames() {
  const list = $('nameList');
  const shuffled = [...PRESET_NAMES].sort(() => Math.random() - 0.5);
  const picks = shuffled.slice(0, 12);
  list.innerHTML = picks.map(n => `<button class="btn name-pick-btn" style="background:rgba(255,255,255,.08);border:1px solid #333;border-radius:8px;padding:6px 10px;cursor:pointer;font-size:12px;transition:.2s;">${n}</button>`).join('');
  list.querySelectorAll('.name-pick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      S.username = btn.textContent;
      $('namePickerModal').classList.add('hidden');
      update();
      save();
      toast(`👤 Hoş geldin, ${btn.textContent}!`);
    });
    btn.addEventListener('mouseenter', () => { btn.style.background = 'rgba(255,255,255,.15)'; btn.style.borderColor = '#f3ba2f'; });
    btn.addEventListener('mouseleave', () => { btn.style.background = 'rgba(255,255,255,.08)'; btn.style.borderColor = '#333'; });
  });
}

$('closeNamePicker')?.addEventListener('click', () => { $('namePickerModal').classList.add('hidden'); });
$('rollNameBtn')?.addEventListener('click', rollNames);
$('skipNameBtn')?.addEventListener('click', () => {
  S.username = 'Misafir';
  $('namePickerModal').classList.add('hidden');
  update();
  save();
  toast('👤 Misafir olarak devam ediyorsun');
});

document.addEventListener('click', () => {
  if (S.settings.musicOn && bgm.paused) bgm.play().catch(() => {});
}, { once: true });

if ($('resetGameBtn')) $('resetGameBtn').addEventListener('click', () => {
  if (confirm('⚠️ TÜM İLERLEME SİLİNECEK!\n\nCoin: ' + fmt(S.coins) + '\nLevel: ' + S.lvl + '\nElmas: ' + S.gems + '\n\nDevam etmek istediğine emin misin?')) {
    if (confirm('🔄 Son kez: Oyunu sıfırla? Bu işlem geri alınamaz!')) {
      localStorage.removeItem('hk_state');
      location.reload();
    }
  }
});

/* ===== ADS ===== */


function quickReward(type) {
  if (type === 'coin') { S.coins += 10000; S.gems += 2; toast('💰 +10,000 Coin +2💎'); }
  else if (type === 'energy') { S.energy = S.maxEnergy; toast('⚡ Enerji dolduruldu!'); }
  else if (type === 'x2') { startX2(60); toast('🔥 2x Çarpan 60sn aktif!'); }
  else if (type === 'gem') { if (S.gems < 25) { toast('❌ Yetersiz elmas'); return; } S.gems -= 25; S.gems += 100; toast('💎 +100 Elmas!'); }
  else if (type === 'boost') { if (S.gems < 10) { toast('❌ Yetersiz elmas'); return; } S.gems -= 10; S.energy = Math.min(S.maxEnergy, S.energy + 1000); toast('🚀 +1000 Enerji!'); }
  update();
}

function exchangeCoins() {
  const cost = 50000;
  if (S.coins < cost) { toast(`❌ ${fmt(cost)} Coin gerekli`); return; }
  S.coins -= cost;
  S.gems += 5;
  toast(`💎 Coin → Elmas: +5💎 (${fmt(cost)} Coin)`);
  update();
}

/* ===== FRIENDS ===== */
function doInvite() {
  const today = new Date().toDateString();
  if (!S.dailyInvites) S.dailyInvites = 0;
  if (!S.inviteDate) S.inviteDate = today;
  if (S.inviteDate !== today) { S.inviteDate = today; S.dailyInvites = 0; }
  if (S.dailyInvites >= 5) { toast('❌ Günlük davet limitin doldu! Yarın tekrar.'); return; }
  if (S.friends >= 50) { toast('❌ Maksimum 50 arkadaş!'); return; }
  S.dailyInvites++;
  S.friends++;
  S.coins += 15000;
  S.gems += 5;
  toast(`👥 +1 davet! (${S.dailyInvites}/5) +15,000 Coin +5💎`);
  update();
  renderFriends();
}

$('copyRefBtn').addEventListener('click', () => {
  const inp = $('refInput');
  inp.select();
  document.execCommand('copy');
  if (navigator.share) {
    navigator.share({ title: 'Hamster Kombat', text: 'Hamster Kombat\'a katıl!', url: inp.value }).then(() => doInvite()).catch(() => {});
  } else {
    doInvite();
  }
});

$('simInviteBtn').addEventListener('click', () => {
  const inp = $('refInput');
  inp.select();
  document.execCommand('copy');
  if (navigator.share) {
    navigator.share({ title: 'Hamster Kombat', text: 'Hamster Kombat\'a katıl!', url: inp.value }).then(() => doInvite()).catch(() => {});
  } else {
    doInvite();
  }
});

function renderFriends() {
  const fl = $('friendList');
  fl.innerHTML = '';
  if (S.friends === 0) {
    fl.innerHTML = '<div class="empty">Henüz davet etmedin</div>';
    return;
  }
  for (let i = 0; i < S.friends; i++) {
    const d = document.createElement('div');
    d.className = 'f-row';
    d.innerHTML = `<span>👤 Arkadaş ${i + 1}</span><span class="gold">+15K | +5💎</span>`;
    fl.appendChild(d);
  }
}
renderFriends();

/* ===== BOSS (Scaling) ===== */
$('startBossBtn').addEventListener('click', startBoss);

function getBossLevel() { return 1 + Math.floor((S.bossWins || 0) / 5); }

function startBoss() {
  if (S.lvl < 15) { toast('❌ Level 15 gerekli'); return; }
  if (S.bossActive) { toast('⚔️ Boss zaten aktif!'); return; }
  S.bossActive = true;
  const bLvl = getBossLevel();
  S.bossMaxHp = 15000 + (bLvl - 1) * 5000;
  S.bossHp = S.bossMaxHp;
  S.bossTimer = 30;
  updateBossUI();
  $('startBossBtn').textContent = `⚔️ Savaş Sürüyor (Seviye ${bLvl})`;
  $('startBossBtn').disabled = true;
  const bossNames = ['Karanlık CEO', 'Maden Canavarı', 'Kripto Kraken', 'Shadow CEO', 'Efsanevi Hamster'];
  const bName = bossNames[Math.min(bLvl - 1, bossNames.length - 1)];
  const bossColors = ['#8e9cb5', '#2ed573', '#3498db', '#9b59b6', '#ff4757'];
  const bColor = bossColors[Math.min(bLvl - 1, bossColors.length - 1)];
  const bossH3 = document.querySelector('.b-head h3');
  bossH3.textContent = bName;
  bossH3.style.color = bColor;
  bossH3.style.textShadow = `0 0 15px ${bColor}44`;
  const iv = setInterval(() => {
    S.bossTimer -= 0.1;
    if (S.bossTimer <= 0 || S.bossHp <= 0) {
      clearInterval(iv);
      S.bossActive = false;
      $('startBossBtn').textContent = '⚔️ Başlat';
      $('startBossBtn').disabled = false;
      if (S.bossHp <= 0) {
        S.bossWins++;
        const bLvlWon = getBossLevel();
        const reward = S.lvl * 1000 + S.bossWins * 500;
        const gemReward = 15 + S.bossWins * 3;
        S.coins += reward;
        S.gems += gemReward;
        S.maxEnergy += 10;
        sfxBossKill();
        fireworkCelebration();
        flashOverlay('rainbow');
        coinRain(30);
        spawnParticles(innerWidth / 2, innerHeight / 2, '#f3ba2f');
        spawnParticles(innerWidth / 3, innerHeight / 3, '#ff4757');
        toast(`🏆 BOSS YENİLDİ! +${fmt(reward)} Coin +${gemReward}💎 +10 max enerji!`);
        checkAch();
        checkLevelMilestones();
      } else {
        toast('💀 Süre doldu! Boss yenilendi.');
        S.bossHp = S.bossMaxHp;
      }
      updateBossUI();
      update();
    }
    updateBossUI();
  }, 100);
}

$('bossTapTarget').addEventListener('click', e => {
  if (!S.bossActive) { toast('⚔️ Boss başlat!'); return; }
  const isCrit = Math.random() < 0.25;
  const dmg = Math.floor((S.perClick * 3 + Math.floor(S.perSec * 0.1)) * (isCrit ? 3 : 1) * (S.multiTap || 1));
  S.bossHp = Math.max(0, S.bossHp - dmg);
  sfxBossHit();
  spawnParticles(e.clientX || innerWidth / 2, e.clientY || innerHeight / 2, '#ff4757');
  spawnFloat((e.clientX || innerWidth / 2) - 40, (e.clientY || innerHeight / 2) - 40, (isCrit ? '💥 ' : '') + '-' + dmg, isCrit);
  if (dmg > 100) {
    const a = document.querySelector('.arena');
    a.classList.remove('shake');
    void a.offsetWidth;
    a.classList.add('shake');
    setTimeout(() => a.classList.remove('shake'), 250);
  }
  try { navigator.vibrate(15); } catch (_) { }
  updateBossUI();
});

function updateBossUI() {
  $('bossHpDisplay').textContent = `${Math.max(0, Math.floor(S.bossHp))}/${S.bossMaxHp}`;
  const hpPct = S.bossMaxHp > 0 ? (S.bossHp / S.bossMaxHp) * 100 : 0;
  $('bossHpFill').style.width = Math.max(0, hpPct) + '%';
  $('bossHpFill').style.background = hpPct < 25 ? '#ff4757' : hpPct < 50 ? '#ff9f43' : '#2ed573';
  const bossTapEl = $('bossTapTarget');
  if (bossTapEl) {
    bossTapEl.style.transform = hpPct < 25 ? 'scale(1.05)' : 'scale(1)';
    bossTapEl.style.filter = hpPct < 25 ? 'hue-rotate(180deg) brightness(1.3)' : 'none';
  }
  $('bossTimerDisplay').textContent = Math.max(0, Math.ceil(S.bossTimer)) + 's';
}

/* ===== OFFLINE EARNINGS ===== */
function checkOffline() {
  const stamp = S.offlineStamp || S.lastSave;
  const diff = Date.now() - stamp;
  if (diff < 30000) return;
  const sec = Math.min(Math.floor(diff / 1000), 10800);
  const earned = Math.floor(sec * (S.perSec / 3600) * getX2Mult());
  const gemBonus = Math.min(Math.floor(sec / 600), 50);
  if (earned < 1 && gemBonus < 1) return;
  S.totalOffline = (S.totalOffline || 0) + earned;
  const hours = (sec / 3600).toFixed(1);
  $('offlineReward').textContent = '+' + fmt(earned) + (gemBonus > 0 ? ` +${gemBonus}💎` : '');
  const extraInfo = $('offlineExtraInfo');
  if (extraInfo) extraInfo.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px;margin-top:4px;color:#8e9cb5;text-align:center;">
      <div>⏱️ ${Math.floor(sec / 60)} dakika</div>
      <div>⚡ ${fmt(S.perSec)}/s hız</div>
      <div>${isX2() ? '🔥 x2 aktif' : ''}</div>
      <div>💎 +${gemBonus}</div>
    </div>
  `;
  $('offlineModal').classList.remove('hidden');
  $('claimOfflineBtn').onclick = () => {
    S.coins += earned;
    S.totalEarned += earned;
    S.gems += gemBonus || 0;
    S.energy = S.maxEnergy;
    S.offlineStamp = Date.now();
    $('offlineModal').classList.add('hidden');
    toast(`💰 Uzaktayken +${fmt(earned)}${gemBonus > 0 ? ' +' + gemBonus + '💎' : ''} kazandın! Enerji fullendi!`);
    update();
  };
}

/* ===== TELEGRAM INIT ===== */
try {
  if (window.Telegram?.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    Telegram.WebApp.enableClosingConfirmation();
    Telegram.WebApp.setHeaderColor('#000000');
    Telegram.WebApp.setBackgroundColor('#000000');
    let expanded = false;
    Telegram.WebApp.onEvent('viewportChanged', () => { if (!expanded) { Telegram.WebApp.expand(); expanded = true; } });
    const u = Telegram.WebApp.initDataUnsafe?.user;
    if (u) {
      if (u.id) S.userId = String(u.id);
      if (u.username) S.userName = u.username;
      else if (u.first_name) S.userName = u.first_name;
    }
  }
} catch (_) {}

/* ===== 2X MULTIPLIER ===== */
function isX2() { return Date.now() < x2End; }

function getX2Mult() { return isX2() ? 2 : 1; }

function startX2(seconds) {
  x2End = Date.now() + seconds * 1000;
  if (!x2Interval) {
    x2Interval = setInterval(() => {
      update();
      if (Date.now() >= x2End) {
        clearInterval(x2Interval);
        x2Interval = null;
        toast('⏰ 2x süresi doldu!');
        update();
      }
    }, 1000);
  }
  toast(`🔥 2x Çarpan AKTİF! ${seconds}s`);
  update();
}

/* ===== AMBIENT PARTICLES ===== */
function spawnAmbientParticles() {
  const colors = ['#f3ba2f', '#3498db', '#9b59b6', '#2ed573', '#ff9f43'];
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    p.className = 'ambient-particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.width = (2 + Math.random() * 4) + 'px';
    p.style.height = p.style.width;
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDuration = (8 + Math.random() * 16) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    document.body.appendChild(p);
  }
}
spawnAmbientParticles();

/* ===== AUTO SAVE ===== */
setInterval(save, 15000);

/* ===== TOAST QUEUE ===== */
let toastQueue = [];
function toast(msg, duration, type) {
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' ' + type : '');
  el.textContent = msg;
  $('toastArea').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(20px)'; setTimeout(() => el.remove(), 300); }, duration || 3000);
}

/* ===== TAP SPEED COUNTER ===== */
setInterval(() => {
  const now = Date.now();
  const recent = tapTimestamps.filter(t => now - t < 60000);
  const tpm = recent.length;
  const tapEl = $('comboTaps');
  if (tapEl && tpm > 0) {
    tapEl.textContent = combo > 0 ? `${combo} tık | ${tpm} TPM` : `${tpm} TPM`;
  }
}, 1000);

/* ===== TUTORIAL ===== */
function startTutorial() {
  if (S.tutorialDone) return;
  S.tutorialDone = true;
  save();
  $('tutorialModal').classList.remove('hidden');
  $('tStep1').classList.remove('hidden');
  $('tStep2').classList.add('hidden');
}

$('tNextBtn').addEventListener('click', () => {
  $('tStep1').classList.add('hidden');
  $('tStep2').classList.remove('hidden');
});

$('tStartBtn').addEventListener('click', () => {
  $('tutorialModal').classList.add('hidden');
  if (!S.username || S.username.trim() === '') {
    openNamePicker();
  }
  toast('🐹 Hoş geldin CEO! Haydi kazanmaya başla!');
});

/* ===== BEFORE UNLOAD ===== */
window.addEventListener('beforeunload', () => { try { S.offlineStamp = Date.now(); save(); } catch(_){} });

/* ===== INIT ===== */
renderAch();
checkAch();
checkOffline();
startTutorial();
applySkin(S.activeSkin || 'default');
/* ===== LAST ACTIVE TIMESTAMP ===== */
function updateLastActive() {
  const el = $('lastActive');
  if (!el) return;
  const now = Date.now();
  const diff = now - (S.lastSave || now);
  if (diff < 60000) el.textContent = '🟢 Çevrimiçi';
  else if (diff < 3600000) el.textContent = `🟡 ${Math.floor(diff / 60000)}dk önce`;
  else el.textContent = `🔴 ${Math.floor(diff / 3600000)}s önce`;
}

/* ===== EXPORT / IMPORT SAVE ===== */
function exportSave() {
  const data = JSON.stringify(S);
  const blob = new Blob([data], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hamster_save_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('💾 Kayıt dışa aktarıldı!');
}

function importSave() {
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = '.json';
  inp.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        Object.assign(S, data);
        saveState();
        location.reload();
      } catch (_) { toast('❌ Geçersiz kayıt dosyası'); }
    };
    reader.readAsText(file);
  };
  inp.click();
}

/* ===== TOTAL CARD LEVELS ===== */
function getTotalCardLevels() {
  return CARDS.reduce((sum, c) => sum + getItemLevel(c.id), 0);
}

/* ===== KEYBOARD SHORTCUTS ===== */
document.addEventListener('keydown', e => {
  const tabs3 = ['tab-borsa', 'tab-mine', 'tab-friends', 'tab-earn', 'tab-boss'];
  const cur3 = document.querySelector('.tab.active');
  const idx3 = cur3 ? tabs3.indexOf(cur3.id) : 0;
  if (e.key === 'ArrowRight' && idx3 < tabs3.length - 1) switchTab(tabs3[idx3 + 1]);
  if (e.key === 'ArrowLeft' && idx3 > 0) switchTab(tabs3[idx3 - 1]);
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    handleTap(innerWidth / 2, innerHeight / 2);
  }
  if (e.key === 'b' || e.key === 'B') quickUpgrade();
  if (e.key === 'r' || e.key === 'R') handleTap(innerWidth / 2, innerHeight / 2);
});

/* ===== SWIPE NAV ===== */
let touchStartX = 0;
let touchStartY = 0;
document.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
}, {passive: true});
document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].screenX - touchStartX;
  const dy = e.changedTouches[0].screenY - touchStartY;
  if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx) * 0.5) return;
  const tabs2 = ['tab-borsa', 'tab-mine', 'tab-friends', 'tab-earn', 'tab-boss'];
  const cur2 = document.querySelector('.tab.active');
  const idx2 = cur2 ? tabs2.indexOf(cur2.id) : 0;
  if (dx > 0 && idx2 > 0) switchTab(tabs2[idx2 - 1]);
  else if (dx < 0 && idx2 < tabs2.length - 1) switchTab(tabs2[idx2 + 1]);
}, {passive: true});

function doPrestige() {
  if (S.lvl < 250) return toast('❌ Prestige için level 250 gerekli!');
  const gainGems = Math.floor(S.lvl / 10) + Math.floor(S.totalEarned / 1e8) * 10;
  S.gems = (S.gems || 0) + gainGems;
  S.prestige = (S.prestige || 0) + 1;
  const oldLvl = S.lvl;
  Object.assign(S, defState());
  S.gems += gainGems;
  S.prestige = (S.prestige || 0) + 1;
  S.refCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  S.username = S.username;
  S.settings = S.settings;
  checkAch();
  save();
  update();
  toast(`🔄 Prestige! +${gainGems}💎 (Level ${oldLvl} → 1)`);
}

/* ===== AUTO-BUY TOGGLE ===== */
let autoBuyInterval = null;
function toggleAutoBuy() {
  S.autoBuyOn = !S.autoBuyOn;
  if (S.autoBuyOn) {
    autoBuyInterval = setInterval(() => { quickUpgrade(1); }, 3000);
    toast('🤖 Otomatik alım açık');
  } else {
    clearInterval(autoBuyInterval);
    autoBuyInterval = null;
    toast('🤖 Otomatik alım kapalı');
  }
  update();
}

update();
if (S.boostCD > Date.now()) {
  const btn = $('quickBoostBtn');
  btn.style.opacity = '.4';
  btn.style.transform = 'scale(.92)';
  const iv = setInterval(() => {
    if (Date.now() >= S.boostCD) {
      clearInterval(iv);
      btn.style.opacity = '1';
      btn.style.transform = 'scale(1)';
    }
  }, 200);
}