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
    pvpScore: 0, pvpRank: 0, pvpWins: 0, pvpLosses: 0, pvpLastFight: 0,
    dungeonFloor: 0, dungeonBuffs: [], dungeonBest: 0, dungeonDaily: 0,
    riftUsed: '', riftReward: 0,
    territories: [], alchemyEssence: 0, artifacts: [],
    _totalCrits: 0, _totalCombos: 0, _bestDungeonTime: 0, _totalExchanges: 0,
    _maxComboEver: 0, _totalPrestigeGems: 0, _skinsOwned: 0, _totalShopSpent: 0,
    _totalMerges: 0, _cipherSolved: 0, _wheelSpins: 0, _totalBoosts: 0,
    _xpFromCrits: 0, _totalDungeonRuns: 0, _bossMaxDmg: 0,
    bossPoints: 0, bossUpgrades: [], bossAbilityActive: '', bossAbilityTimer: 0,
    _boss10xTap: false, _bossAutoStart: false, _bossDmgMult: 1, _bossTimeBonus: 0,
    bossPlayerHp: 100, bossPlayerMaxHp: 100,
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
  /* NEW CARDS v2 */
  { id: 'sonicdrill', name: 'Sonic Matkap', icon: '🔊', cat: 'miners', b: 1200, baseSec: 30, rarity: 'rare', desc: 'Ses dalgasıyla deler' },
  { id: 'gravitymine', name: 'Yerçekimi Madeni', icon: '🌍', cat: 'miners', b: 2500, baseSec: 55, rarity: 'rare', desc: 'Yerçekimi alanı oluşturur' },
  { id: 'antimatter', name: 'Antimadde', icon: '⚛️', cat: 'miners', b: 6000, baseSec: 120, rarity: 'epic', desc: 'Anti-parçacık enerjisi' },
  { id: 'spacetime', name: 'Uzayzaman Kırıcı', icon: '🌌', cat: 'miners', b: 15000, baseSec: 200, rarity: 'epic', desc: 'Uzay-zamanı bükerek maden' },
  { id: 'singularity', name: 'Tekillik Delici', icon: '🕳️', cat: 'miners', b: 40000, baseSec: 500, rarity: 'legendary', desc: 'Kara delik enerjisi toplar' },
  { id: 'nebula', name: 'Nebula Toplayıcı', icon: '🌟', cat: 'miners', b: 80000, baseSec: 900, rarity: 'legendary', desc: 'Yıldız bulutlarından enerji' },
  { id: 'cosmos', name: 'Kozmik Matkap', icon: '☄️', cat: 'miners', b: 150000, baseSec: 2000, rarity: 'legendary', desc: 'Evren ötesi madencilik' },
  { id: 'infinity_drill', name: 'Sonsuzluk Matkabı', icon: '♾️', cat: 'miners', b: 300000, baseSec: 5000, rarity: 'legendary', desc: 'Sonsuz derinliklerde kazar' },
  { id: 'nightvision', name: 'Gece Görüşü', icon: '🥽', cat: 'items', b: 200, baseCrit: 0.02, rarity: 'rare', desc: '+%2 kritik' },
  { id: 'speedboots', name: 'Hız Botları', icon: '👢', cat: 'items', b: 150, baseClick: 1, rarity: 'rare', desc: '+1/tık' },
  { id: 'energyring', name: 'Enerji Yüzüğü', icon: '💍', cat: 'items', b: 300, bonusMaxEnergy: 100, rarity: 'epic', desc: '+100 max enerji' },
  { id: 'amulet', name: 'Koruma Muskası', icon: '📿', cat: 'items', b: 500, baseCombo: 0.05, rarity: 'epic', desc: '+0.05x combo çarpanı' },
  { id: 'shadowcloak', name: 'Gölge Pelerini', icon: '🌑', cat: 'items', b: 1000, baseCrit: 0.04, rarity: 'epic', desc: '+%4 kritik' },
  { id: 'crown', name: 'Kraliyet Tacı', icon: '👑', cat: 'items', b: 3000, baseClick: 3, baseSec: 100, rarity: 'legendary', desc: '+3/tık +100/s' },
  { id: 'wings', name: 'Işık Kanatları', icon: '🕊️', cat: 'items', b: 5000, bonusMaxEnergy: 500, rarity: 'legendary', desc: '+500 max enerji' },
  { id: 'scepter', name: 'Büyü Asası', icon: '🔮', cat: 'items', b: 10000, baseSec: 500, baseClick: 5, rarity: 'legendary', desc: '+5/tık +500/s' },
  { id: 'nuclear', name: 'Nükleer Batarya', icon: '☢️', cat: 'boosts', b: 500, bonusEnergy: 2000, rarity: 'rare', desc: '+2000 Enerji' },
  { id: 'darkenergy', name: 'Karanlık Enerji', icon: '🌑', cat: 'boosts', b: 1200, bonusEnergy: 3000, rarity: 'rare', desc: '+3000 Enerji' },
  { id: 'zeropoint', name: 'Sıfır Noktası', icon: '✨', cat: 'boosts', b: 2500, bonusEnergy: 5000, rarity: 'epic', desc: '+5000 Enerji' },
  { id: 'quantumcell', name: 'Kuantum Hücre', icon: '🧬', cat: 'boosts', b: 5000, bonusEnergy: 8000, rarity: 'epic', desc: '+8000 Enerji' },
  { id: 'suncore', name: 'Güneş Çekirdeği', icon: '☀️', cat: 'boosts', b: 12000, bonusEnergy: 15000, rarity: 'legendary', desc: '+15000 Enerji' },
  { id: 'voidenergy', name: 'Boşluk Enerjisi', icon: '🌀', cat: 'boosts', b: 25000, bonusEnergy: 25000, rarity: 'legendary', desc: '+25000 Enerji' },
  { id: 'cosmicboost', name: 'Kozmik Güç', icon: '🌠', cat: 'boosts', b: 50000, bonusEnergy: 50000, rarity: 'legendary', desc: '+50000 Enerji' },
  { id: 'godmode', name: 'Tanrı Modu', icon: '🗿', cat: 'boosts', b: 100000, bonusEnergy: 100000, rarity: 'legendary', desc: '+100000 Enerji' },
  { id: 'floppy', name: 'Disket', icon: '💾', cat: 'retro', b: 120000, baseSec: 200, rarity: 'legendary', desc: '+200/s', levelReq: 250 },
  { id: 'tetris_brick', name: 'Tetris Taşı', icon: '🔲', cat: 'retro', b: 180000, baseClick: 4, rarity: 'legendary', desc: '+4/tık', levelReq: 250 },
  { id: 'gameboy', name: 'Game Boy', icon: '🎮', cat: 'retro', b: 220000, bonusMaxEnergy: 300, rarity: 'legendary', desc: '+300 max enerji', levelReq: 250 },
  { id: 'sega_cart', name: 'Sega Kartuşu', icon: '🎰', cat: 'retro', b: 300000, baseSec: 300, baseClick: 2, rarity: 'legendary', desc: '+2/tık +300/s', levelReq: 250 },
  { id: 'nintendo', name: 'Nintendo', icon: '🕹️', cat: 'retro', b: 400000, baseCombo: 0.5, rarity: 'legendary', desc: '+0.5x combo', levelReq: 250 },
  { id: 'playstation', name: 'PlayStation', icon: '📀', cat: 'retro', b: 500000, baseCrit: 0.1, rarity: 'legendary', desc: '+%10 kritik', levelReq: 250 },
  /* NEW WAVE 3 */
  { id: 'titan_drill', name: 'Titan Matkabı', icon: '🏋️', cat: 'miners', b: 500000, baseSec: 10000, rarity: 'legendary', desc: 'Dev titan gücüyle kazar' },
  { id: 'galaxy_rig', name: 'Galaksi Tesisi', icon: '🌌', cat: 'miners', b: 1000000, baseSec: 25000, rarity: 'legendary', desc: 'Galaktik madencilik ünitesi' },
  { id: 'multiverse', name: 'Çoklu Evren', icon: '🌀', cat: 'miners', b: 5000000, baseSec: 100000, rarity: 'legendary', desc: 'Paralel evrenlerden enerji' },
  { id: 'goggles', name: 'Gelişmiş Gözlük', icon: '👓', cat: 'items', b: 20000, baseCrit: 0.08, rarity: 'legendary', desc: '+%8 kritik' },
  { id: 'thunder_boots', name: 'Yıldırım Botu', icon: '⚡', cat: 'items', b: 30000, baseClick: 8, rarity: 'legendary', desc: '+8/tık' },
  { id: 'divine_shield', name: 'İlahi Kalkan', icon: '🛡️', cat: 'items', b: 50000, bonusMaxEnergy: 2000, rarity: 'legendary', desc: '+2000 max enerji' },
  { id: 'wormhole', name: 'Solucan Deliği', icon: '🕳️', cat: 'boosts', b: 200000, bonusEnergy: 200000, rarity: 'legendary', desc: '+200000 Enerji' },
  { id: 'bigbang', name: 'Büyük Patlama', icon: '💥', cat: 'boosts', b: 500000, bonusEnergy: 500000, rarity: 'legendary', desc: '+500000 Enerji' },
  { id: 'dreamcast', name: 'Dreamcast', icon: '🎮', cat: 'retro', b: 600000, baseClick: 5, baseSec: 500, rarity: 'legendary', desc: '+5/tık +500/s', levelReq: 250 },
  { id: 'atari2600', name: 'Atari 2600', icon: '🕹️', cat: 'retro', b: 700000, baseCombo: 0.8, rarity: 'legendary', desc: '+0.8x combo', levelReq: 250 },
  /* WAVE 4 - ULTRA */
  { id: 'mega_drill', name: 'Mega Matkap', icon: '⚙️', cat: 'miners', b: 2000000, baseSec: 50000, rarity: 'legendary', desc: 'Süper iletken matkap' },
  { id: 'hyper_rig', name: 'Hiper Tesis', icon: '🔬', cat: 'miners', b: 5000000, baseSec: 150000, rarity: 'legendary', desc: 'Hiper uzay madenciliği' },
  { id: 'omni_drill', name: 'Omni Delici', icon: '💠', cat: 'miners', b: 10000000, baseSec: 500000, rarity: 'legendary', desc: 'Her boyutta deler' },
  { id: 'prism_shard', name: 'Prizma Parçası', icon: '🔷', cat: 'miners', b: 25000000, baseSec: 1000000, rarity: 'legendary', desc: 'Işık hızında kazar' },
  { id: 'tesseract', name: 'Tesseract', icon: '🧊', cat: 'miners', b: 50000000, baseSec: 2500000, rarity: 'legendary', desc: '4-boyutlu madencilik' },
  { id: 'photon_drill', name: 'Foton Matkabı', icon: '💡', cat: 'miners', b: 100000000, baseSec: 5000000, rarity: 'legendary', desc: 'Foton ışınıyla deler' },
  { id: 'antigravity', name: 'Anti-Yerçekimi', icon: '🪐', cat: 'miners', b: 250000000, baseSec: 10000000, rarity: 'legendary', desc: 'Yerçekimine meydan okur' },
  { id: 'reality_bender', name: 'Gerçeklik Büken', icon: '🌀', cat: 'miners', b: 500000000, baseSec: 25000000, rarity: 'legendary', desc: 'Gerçekliği bükerek maden' },
  { id: 'bat_belt', name: 'Yarasa Kemeri', icon: '🦇', cat: 'items', b: 80000, baseClick: 10, rarity: 'legendary', desc: '+10/tık' },
  { id: 'dragon_eye', name: 'Ejderha Gözü', icon: '🐉', cat: 'items', b: 100000, baseCrit: 0.12, rarity: 'legendary', desc: '+%12 kritik' },
  { id: 'phoenix_feather', name: 'Anka Tüyü', icon: '🪶', cat: 'items', b: 150000, baseCombo: 0.6, rarity: 'legendary', desc: '+0.6x combo' },
  { id: 'titan_armor', name: 'Titan Zırhı', icon: '🛡️', cat: 'items', b: 200000, bonusMaxEnergy: 5000, rarity: 'legendary', desc: '+5000 max enerji' },
  { id: 'cosmic_ring', name: 'Kozmik Yüzük', icon: '💍', cat: 'items', b: 300000, baseSec: 1000, baseClick: 8, rarity: 'legendary', desc: '+8/tık +1000/s' },
  { id: 'god_crown', name: 'Tanrı Tacı', icon: '👑', cat: 'items', b: 500000, baseClick: 20, baseSec: 5000, rarity: 'legendary', desc: '+20/tık +5000/s' },
  { id: 'infinite_battery', name: 'Sonsuz Batarya', icon: '🔋', cat: 'boosts', b: 200000, bonusEnergy: 1000000, rarity: 'legendary', desc: '+1M Enerji' },
  { id: 'quantum_battery', name: 'Kuantum Batarya', icon: '⚛️', cat: 'boosts', b: 500000, bonusEnergy: 5000000, rarity: 'legendary', desc: '+5M Enerji' },
  { id: 'stellar_cell', name: 'Yıldız Hücresi', icon: '⭐', cat: 'boosts', b: 1000000, bonusEnergy: 10000000, rarity: 'legendary', desc: '+10M Enerji' },
  { id: 'galaxy_core', name: 'Galaksi Çekirdeği', icon: '🌌', cat: 'boosts', b: 2000000, bonusEnergy: 50000000, rarity: 'legendary', desc: '+50M Enerji' },
  { id: 'universal_boost', name: 'Evrensel Güç', icon: '🌠', cat: 'boosts', b: 5000000, bonusEnergy: 100000000, rarity: 'legendary', desc: '+100M Enerji' },
  { id: 'xbox_classic', name: 'Xbox Klasik', icon: '🎮', cat: 'retro', b: 800000, baseClick: 7, baseSec: 800, rarity: 'legendary', desc: '+7/tık +800/s', levelReq: 250 },
  { id: 'wii_remote', name: 'Wii Kumanda', icon: '🕹️', cat: 'retro', b: 900000, baseCombo: 1, rarity: 'legendary', desc: '+1.0x combo', levelReq: 250 },
  { id: 'psp', name: 'PSP', icon: '📱', cat: 'retro', b: 1000000, baseCrit: 0.15, rarity: 'legendary', desc: '+%15 kritik', levelReq: 250 },
  { id: 'gamegear', name: 'Game Gear', icon: '🎰', cat: 'retro', b: 1200000, bonusMaxEnergy: 5000, rarity: 'legendary', desc: '+5000 max enerji', levelReq: 250 },
  { id: 'neogeo', name: 'Neo Geo', icon: '🕹️', cat: 'retro', b: 1500000, baseSec: 2000, baseClick: 10, rarity: 'legendary', desc: '+10/tık +2000/s', levelReq: 250 },
  { id: 'commodore', name: 'Commodore', icon: '💻', cat: 'retro', b: 2000000, baseCombo: 1.5, rarity: 'legendary', desc: '+1.5x combo', levelReq: 250 },
  { id: 'spectrum', name: 'ZX Spectrum', icon: '📺', cat: 'retro', b: 2500000, baseCrit: 0.2, rarity: 'legendary', desc: '+%20 kritik', levelReq: 250 },
  { id: 'dos_pc', name: 'MS-DOS PC', icon: '🖥️', cat: 'retro', b: 3000000, baseClick: 15, baseSec: 5000, rarity: 'legendary', desc: '+15/tık +5000/s', levelReq: 250 },
  { id: 'windows95', name: 'Windows 95', icon: '🪟', cat: 'retro', b: 4000000, bonusMaxEnergy: 10000, rarity: 'legendary', desc: '+10000 max enerji', levelReq: 250 },
  { id: 'mythic_orb', name: 'Mitik Küre', icon: '🔮', cat: 'miners', b: 1000000000, baseSec: 50000000, rarity: 'legendary', desc: 'Efsanevi madencilik küresi' },
  { id: 'ultimate_drill', name: 'Nihai Matkap', icon: '🗡️', cat: 'miners', b: 5000000000, baseSec: 100000000, rarity: 'legendary', desc: 'Var olan en güçlü matkap' },
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

function cardCost(card, overrideLvl) {
  const lvl = (overrideLvl !== undefined ? overrideLvl : getItemLevel(card.id)) + 1;
  return Math.floor(card.b * Math.pow(1.25, lvl));
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
  { id: 'tap1m', icon: '👆', name: '1M Tık', desc: 'Toplam 1.000.000 tık yap', check: s => s.totalTaps >= 1000000, gem: 1000 },
  { id: 'tap10m', icon: '⚡', name: '10M Tık', desc: 'Toplam 10.000.000 tık yap', check: s => s.totalTaps >= 10000000, gem: 5000 },
  { id: 'earn10b', icon: '🏦', name: '10B Coin', desc: 'Toplam 10.000.000.000 Coin kazan', check: s => s.totalEarned >= 1e10, gem: 2000 },
  { id: 'earn1t', icon: '🌌', name: '1T Coin', desc: 'Toplam 1.000.000.000.000 Coin kazan', check: s => s.totalEarned >= 1e12, gem: 10000 },
  { id: 'lvl150', icon: '💎', name: 'Level 150', desc: 'Level 150 ol', check: s => s.lvl >= 150, gem: 2000 },
  { id: 'lvl200', icon: '👑', name: 'Level 200', desc: 'Level 200 ol', check: s => s.lvl >= 200, gem: 3000 },
  { id: 'lvl300', icon: '👿', name: 'Level 300', desc: 'Level 300 ol', check: s => s.lvl >= 300, gem: 5000 },
  { id: 'lvl400', icon: '🌈', name: 'Level 400', desc: 'Level 400 ol', check: s => s.lvl >= 400, gem: 10000 },
  { id: 'combo200', icon: '🔥', name: '200 Combo', desc: '200 combo ya ulaş', check: s => s.bestCombo >= 200, gem: 500 },
  { id: 'combo500', icon: '💥', name: '500 Combo', desc: '500 combo ya ulaş', check: s => s.bestCombo >= 500, gem: 1000 },
  { id: 'prestige3', icon: '🔄', name: '3. Prestige', desc: '3 kere prestige yap', check: s => (s.prestige || 0) >= 3, gem: 2000 },
  { id: 'prestige5', icon: '🔄', name: '5. Prestige', desc: '5 kere prestige yap', check: s => (s.prestige || 0) >= 5, gem: 5000 },
  { id: 'friends50', icon: '👥', name: 'Sosyal Medya Fenomeni', desc: '50 arkadaş davet et', check: s => s.friends >= 50, gem: 500 },
  { id: 'boss50', icon: '⚔️', name: 'Boss Efsanesi', desc: 'Boss 50 kere yen', check: s => s.bossWins >= 50, gem: 1000 },
  { id: 'boss100', icon: '🏆', name: 'Boss Tanrısı', desc: 'Boss 100 kere yen', check: s => s.bossWins >= 100, gem: 2000 },
  { id: 'gem1000', icon: '💎', name: 'Elmas Koleksiyoncusu', desc: 'Toplam 1000 elmas kazan', check: s => ACH.filter(a => (S.achieved || []).includes(a.id)).reduce((sum, a) => sum + (a.gem || 0), 0) >= 1000, gem: 500 },
  { id: 'allminers', icon: '⛏️', name: 'Maden İmparatoru', desc: 'Tüm madenci kartlarına sahip ol', check: s => CARDS.filter(c => c.cat === 'miners').every(c => getItemLevel(c.id) > 0), gem: 3000 },
  { id: 'allboosts', icon: '⚡', name: 'Boost Ustası', desc: 'Tüm boost kartlarına sahip ol', check: s => CARDS.filter(c => c.cat === 'boosts').every(c => getItemLevel(c.id) > 0), gem: 3000 },
  { id: 'allitems', icon: '🎒', name: 'Ekipman Koleksiyoncusu', desc: 'Tüm ekipman kartlarına sahip ol', check: s => CARDS.filter(c => c.cat === 'items').every(c => getItemLevel(c.id) > 0), gem: 3000 },
  { id: 'tap100m', icon: '🏅', name: '100M Tık', desc: '100 milyon tık yap', check: s => s.totalTaps >= 100000000, gem: 10000 },
  { id: 'earn100t', icon: '🌌', name: '100T Coin', desc: '100 trilyon coin kazan', check: s => s.totalEarned >= 1e14, gem: 50000 },
  { id: 'earn1q', icon: '🪐', name: '1 Katrilyon', desc: '1 katrilyon coin kazan', check: s => s.totalEarned >= 1e15, gem: 100000 },
  { id: 'lvl500', icon: '🔥', name: 'Level 500', desc: 'Level 500 ol', check: s => s.lvl >= 500, gem: 25000 },
  { id: 'lvl600', icon: '💥', name: 'Level 600', desc: 'Level 600 ol', check: s => s.lvl >= 600, gem: 50000 },
  { id: 'lvl700', icon: '👁️', name: 'Level 700', desc: 'Level 700 ol', check: s => s.lvl >= 700, gem: 100000 },
  { id: 'lvl800', icon: '🌋', name: 'Level 800', desc: 'Level 800 ol', check: s => s.lvl >= 800, gem: 200000 },
  { id: 'lvl900', icon: '☄️', name: 'Level 900', desc: 'Level 900 ol', check: s => s.lvl >= 900, gem: 500000 },
  { id: 'lvl1000', icon: '👑', name: 'Level 1000', desc: 'Efsanevi Level 1000', check: s => s.lvl >= 1000, gem: 1000000 },
  { id: 'combo1000', icon: '🌪️', name: '1000 Combo', desc: '1000 combo ya ulaş', check: s => s.bestCombo >= 1000, gem: 5000 },
  { id: 'combo2500', icon: '⚡', name: '2500 Combo', desc: '2500 combo ya ulaş', check: s => s.bestCombo >= 2500, gem: 15000 },
  { id: 'combo5000', icon: '💫', name: '5000 Combo', desc: '5000 combo ya ulaş', check: s => s.bestCombo >= 5000, gem: 50000 },
  { id: 'prestige10', icon: '🔄', name: '10. Prestige', desc: '10 kere prestige yap', check: s => (s.prestige || 0) >= 10, gem: 25000 },
  { id: 'prestige25', icon: '🔄', name: '25. Prestige', desc: '25 kere prestige yap', check: s => (s.prestige || 0) >= 25, gem: 100000 },
  { id: 'pvp10', icon: '⚔️', name: 'PVP Savaşçısı', desc: '10 PVP savaşı kazan', check: s => (s.pvpWins || 0) >= 10, gem: 200 },
  { id: 'pvp50', icon: '⚔️', name: 'PVP Ustası', desc: '50 PVP savaşı kazan', check: s => (s.pvpWins || 0) >= 50, gem: 1000 },
  { id: 'pvp200', icon: '🏆', name: 'PVP Efsanesi', desc: '200 PVP savaşı kazan', check: s => (s.pvpWins || 0) >= 200, gem: 5000 },
  { id: 'dungeon10', icon: '🏰', name: 'Zindan Fatihi', desc: '10 zindan tamamla', check: s => (s.dungeonBest || 0) >= 10, gem: 500 },
  { id: 'dungeon50', icon: '🏰', name: 'Zindan Efsanesi', desc: '50 zindan tamamla', check: s => (s.dungeonDaily || 0) >= 50, gem: 2000 },
  { id: 'rift10', icon: '🌀', name: 'Zaman Yolcusu', desc: '10 zaman yarığı kullan', check: s => s.riftUsed ? true : false, gem: 1000 },
  { id: 'world5', icon: '🌍', name: 'Kaşif', desc: '5 bölge ele geçir', check: s => (s.territories || []).length >= 5, gem: 200 },
  { id: 'world10', icon: '🌍', name: 'Kâşif', desc: '10 bölge ele geçir', check: s => (s.territories || []).length >= 10, gem: 500 },
  { id: 'world20', icon: '🌍', name: 'Dünya Hakimi', desc: 'Tüm bölgeleri ele geçir', check: s => (s.territories || []).length >= 20, gem: 2000 },
  { id: 'alchemy5', icon: '🧪', name: 'Simyacı', desc: '5 eser yap', check: s => (s.artifacts || []).length >= 5, gem: 300 },
  { id: 'alchemy15', icon: '🧪', name: 'Simya Ustası', desc: '15 eser yap', check: s => (s.artifacts || []).length >= 15, gem: 1500 },
  { id: 'boss500', icon: '💀', name: 'Boss Katili', desc: 'Boss 500 kere yen', check: s => s.bossWins >= 500, gem: 10000 },
  { id: 'gem5000', icon: '💎', name: 'Elmas Zengini', desc: 'Toplam 5000 elmas topla', check: s => ACH.filter(a => (S.achieved || []).includes(a.id)).reduce((sum, a) => sum + (a.gem || 0), 0) >= 5000, gem: 2000 },
  { id: 'gem10000', icon: '💎', name: 'Elmas Kralı', desc: 'Toplam 10000 elmas topla', check: s => ACH.filter(a => (S.achieved || []).includes(a.id)).reduce((sum, a) => sum + (a.gem || 0), 0) >= 10000, gem: 5000 },
  { id: 'friend100', icon: '👥', name: 'Süper Sosyal', desc: '100 arkadaş davet et', check: s => s.friends >= 100, gem: 2000 },
  { id: 'friend500', icon: '👥', name: 'Influencer', desc: '500 arkadaş davet et', check: s => s.friends >= 500, gem: 10000 },
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
  if (a.id === 'allretro') {
    const retroCards = CARDS.filter(c => c.cat === 'retro');
    const owned = retroCards.filter(c => getItemLevel(c.id) > 0).length;
    return Math.min(100, (owned / retroCards.length) * 100);
  }
  if (a.id === 'allminers') {
    const miners = CARDS.filter(c => c.cat === 'miners');
    const owned = miners.filter(c => getItemLevel(c.id) > 0).length;
    return Math.min(100, (owned / miners.length) * 100);
  }
  if (a.id === 'tap1m') return Math.min(100, ((S.totalTaps||0) / 1000000) * 100);
  if (a.id === 'tap10m') return Math.min(100, ((S.totalTaps||0) / 10000000) * 100);
  if (a.id === 'earn10b') return Math.min(100, ((S.totalEarned||0) / 1e10) * 100);
  if (a.id === 'earn1t') return Math.min(100, ((S.totalEarned||0) / 1e12) * 100);
  if (a.id === 'lvl150') return Math.min(100, (S.lvl / 150) * 100);
  if (a.id === 'lvl200') return Math.min(100, (S.lvl / 200) * 100);
  if (a.id === 'lvl300') return Math.min(100, (S.lvl / 300) * 100);
  if (a.id === 'lvl400') return Math.min(100, (S.lvl / 400) * 100);
  if (a.id === 'combo200') return Math.min(100, ((S.bestCombo||0) / 200) * 100);
  if (a.id === 'combo500') return Math.min(100, ((S.bestCombo||0) / 500) * 100);
  if (a.id === 'prestige3') return Math.min(100, ((S.prestige||0) / 3) * 100);
  if (a.id === 'prestige5') return Math.min(100, ((S.prestige||0) / 5) * 100);
  if (a.id === 'friends50') return Math.min(100, ((S.friends||0) / 50) * 100);
  if (a.id === 'boss50') return Math.min(100, ((S.bossWins||0) / 50) * 100);
  if (a.id === 'boss100') return Math.min(100, ((S.bossWins||0) / 100) * 100);
  if (a.id === 'gem1000') return Math.min(100, (ACH.filter(ax => (S.achieved || []).includes(ax.id)).reduce((sum, a) => sum + (a.gem || 0), 0) / 1000) * 100);
  if (a.id === 'allboosts') return Math.min(100, (CARDS.filter(c => c.cat === 'boosts').filter(c => getItemLevel(c.id) > 0).length / Math.max(1, CARDS.filter(c => c.cat === 'boosts').length)) * 100);
  if (a.id === 'allitems') return Math.min(100, (CARDS.filter(c => c.cat === 'items').filter(c => getItemLevel(c.id) > 0).length / Math.max(1, CARDS.filter(c => c.cat === 'items').length)) * 100);
  if (a.id === 'tap100m') return Math.min(100, ((S.totalTaps||0) / 100000000) * 100);
  if (a.id === 'earn100t') return Math.min(100, ((S.totalEarned||0) / 1e14) * 100);
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

/* ===== OPTIMIZED SOUND ENGINE v2 ===== */
let audioCtx = null;
let _sfxCount = 0;
let _sfxLastReset = 0;

function initAudio() {
  if (!audioCtx) audioCtx = new(window.AudioContext || window.webkitAudioContext)();
  const now = Date.now();
  if (now - _sfxLastReset > 1000) { _sfxCount = 0; _sfxLastReset = now; }
}

function canPlaySfx() {
  if (!S.settings.sfxOn) return false;
  _sfxCount++;
  return _sfxCount < 40;
}

function playTone(freq, duration, type, vol) {
  try {
    initAudio();
    if (!canPlaySfx()) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, audioCtx.currentTime);
    const v = (vol || S.settings.sfxVol || 0.5) * 0.12;
    g.gain.setValueAtTime(v, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (duration || 0.15));
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + (duration || 0.15));
  } catch (_) {}
}

let _sfxTimer = null;
function sfxTap() { if (_sfxCount > 30) return; playTone(800 + Math.random() * 200, 0.04, 'sine', 0.2); }
function sfxCrit() { if (_sfxCount > 25) return;
  playTone(1200, 0.08, 'square', 0.3);
  playTone(1600, 0.06, 'sine', 0.2); }
function sfxCombo() { if (_sfxCount > 20) return;
  playTone(500, 0.05, 'triangle', 0.2);
  if (!_sfxTimer) _sfxTimer = setTimeout(() => { playTone(700, 0.05, 'triangle', 0.2); _sfxTimer = null; }, 50); }
function sfxLevelUp() {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.1, 'sine', 0.3), i * 50)); }
function sfxBuy() { playTone(660, 0.06, 'sine', 0.25);
  setTimeout(() => playTone(880, 0.06, 'sine', 0.25), 60); }
function sfxCardBuy() { playTone(440, 0.08, 'square', 0.15);
  setTimeout(() => playTone(660, 0.08, 'square', 0.15), 80);
  setTimeout(() => playTone(880, 0.1, 'square', 0.15), 160); }
function sfxGem() { if (_sfxCount > 35) return;
  playTone(1400, 0.06, 'sine', 0.25); }
function sfxSkin() { playTone(800, 0.08, 'sine', 0.25);
  setTimeout(() => playTone(1000, 0.08, 'sine', 0.25), 80); }
function sfxBossHit() { if (_sfxCount > 30) return;
  playTone(200, 0.1, 'sawtooth', 0.2); }
function sfxBossKill() {
  [200, 300, 400].forEach((f, i) => setTimeout(() => playTone(f, 0.1, 'square', 0.25), i * 50)); }
function sfxMultitap() { if (_sfxCount > 40) return;
  playTone(1800, 0.02, 'sine', 0.1); }
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
    const stepSize = Math.max(1, Math.floor(Math.abs(diff) * 0.15));
    coinDisplayCurrent += diff > 0 ? stepSize : -stepSize;
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
  const territoryPerSec = (S.territories || []).reduce((sum, i) => sum + (TERRITORIES[i]?.bonus?.type === 'perSec' ? TERRITORIES[i].bonus.val : 0), 0);
  S.perSec += territoryPerSec;
  const setEnergyBonus = getSetEnergyBonus();
  S.maxEnergy = 2500 + setEnergyBonus * 2500;
  const maxEngBonus = S.items.reduce((sum, it) => {
    const c = CARDS.find(x => x.id === it.id);
    return c && c.bonusMaxEnergy ? sum + c.bonusMaxEnergy * it.lvl : sum;
  }, 0);
  S.maxEnergy += maxEngBonus;
  const territoryMaxEnergy = (S.territories || []).reduce((sum, i) => sum + (TERRITORIES[i]?.bonus?.type === 'maxEnergy' ? TERRITORIES[i].bonus.val : 0), 0);
  S.maxEnergy += territoryMaxEnergy;
  S._territoryRegen = (S.territories || []).reduce((sum, i) => sum + (TERRITORIES[i]?.bonus?.type === 'energyRegenBonus' ? TERRITORIES[i].bonus.val : 0), 0);
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
  const territoryPerClick = (S.territories || []).reduce((sum, i) => sum + (TERRITORIES[i]?.bonus?.type === 'perClick' ? TERRITORIES[i].bonus.val : 0), 0);
  S.perClick += territoryPerClick;
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
  if (xpEl) {
    const ps = S.perSec || 1;
    const xpRemain = S.xpNext - S.xp;
    const timeToLvl = xpRemain > 0 && ps > 0 ? Math.ceil(xpRemain / ps) : 0;
    xpEl.textContent = `${Math.floor(S.xp)}/${S.xpNext} XP${timeToLvl > 0 && timeToLvl < 3600 ? ` ⏱️${timeToLvl}s` : ''}`;
  }
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
  const bossAttempts = $('bossAttempts');
  if (bossAttempts) bossAttempts.textContent = `⚔️ ${S.bossWins || 0} galibiyet · Seviye ${getBossLevel()}`;
  const dailyTaskCount = $('dailyTaskCount');
  if (dailyTaskCount && S.dailyTasks) {
    const done = Object.values(S.dailyTasks).filter(v => v).length;
    dailyTaskCount.textContent = `${done}/${DAILY_TASKS.length} görev tamam`;
  }
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
  if (autoInd) {
    if (autoTapInterval) { autoInd.style.display = 'inline'; autoInd.textContent = '🤖 Otomatik Tık AKTİF'; }
    else autoInd.style.display = 'none';
  }
  const autoTimer = $('autoTapTimer');
  if (autoTimer && autoTapInterval) {
    const remaining = Math.max(0, 3600 - (tapsDone || 0));
    autoTimer.textContent = `⏱️ ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`;
  } else if (autoTimer) autoTimer.textContent = '';
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
    const allMilestones = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
  const nextMs = allMilestones.find(m => !S.comboMilestones?.includes(m));
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

/* ===== DOM POOL ===== */
const _pool = { particle: [], float: [], toast: [], rain: [] };
function _poolGet(type) { return _pool[type].pop() || null; }
function _poolRecycle(type, el) { if (_pool[type].length < 30) { el.remove(); _pool[type].push(el); } else el.remove(); }

/* ===== PARTICLES (DOM Pool + Cap) ===== */
let _particleTotal = 0;
function spawnParticles(x, y, color) {
  const density = (S._particleDensity || 70) / 100;
  const maxCount = Math.floor((color && color !== '#ff4757' ? 10 : 6) * density);
  if (_particleTotal > 20) return;
  const colors = color ? [color] : ['#f3ba2f', '#ff9f43', '#ff4757', '#2ed573', '#3498db', '#9b59b6', '#fff'];
  const count = Math.min(maxCount, 12);
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      if (_particleTotal > 25) return;
      _particleTotal++;
      let p = _poolGet('particle');
      if (!p) { p = document.createElement('div'); p.className = 'particle'; }
      else { p.style.animation = 'none'; void p.offsetWidth; p.style.display = ''; }
      const angle = Math.random() * 360;
      const dist = 30 + Math.random() * 80;
      p.style.setProperty('--px', Math.cos(angle * Math.PI / 180) * dist + 'px');
      p.style.setProperty('--py', Math.sin(angle * Math.PI / 180) * dist + 'px');
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = (x || innerWidth / 2) + 'px';
      p.style.top = (y || innerHeight / 2) + 'px';
      p.style.width = (2 + Math.random() * 5) + 'px';
      p.style.height = p.style.width;
      p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      p.style.animation = 'none';
      void p.offsetWidth;
      if (!p.parentNode) document.body.appendChild(p);
      p.style.animation = `particleFly ${0.5 + Math.random()*0.2}s ease-out forwards`;
      setTimeout(() => { _particleTotal = Math.max(0, _particleTotal - 1); _poolRecycle('particle', p); }, 600);
    }, i * 12);
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
  if (S._shakeOn === false) return;
  const gs = document.querySelector('.gold-section');
  if (!gs) return;
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
      if (ring) ring.classList.add('active');
      if (ring) {
        const intensity = Math.min(combo / 20, 1);
        const hue = 30 + combo * 5;
        ring.style.setProperty('--r-color', `hsl(${hue},100%,60%)`);
        ring.style.opacity = 0.2 + intensity * 0.6;
      }
      if (glow) {
        glow.classList.add('active');
        glow.style.setProperty('--r-color', `hsla(${hue},100%,60%,.15)`);
        glow.style.setProperty('--glow-op', Math.min(0.15 + intensity * 0.25, 0.4));
      }
    } else {
      if (ring) ring.classList.remove('active');
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
    if (gain > 100000) coinRain(Math.min(Math.floor(gain / 50000), 20));
    S.totalTaps += taps;
    S.totalEarned += gain;
    S.totalEnergySpent = (S.totalEnergySpent || 0) + taps;
    if (taps > (S.bestTapSpeed || 0)) S.bestTapSpeed = taps;
    addXp(gain);
    if (riftActive) { const bonus = gain * 9; S.coins += bonus; riftEarned += bonus; }
    giveEssence();
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
    if (combo >= 25) spawnParticles(cx + (Math.random()-0.5)*30, cy + (Math.random()-0.5)*30, '#ff9f43');
    if (combo >= 50) { spawnParticles(cx + (Math.random()-0.5)*60, cy + (Math.random()-0.5)*60, '#ff4757'); spawnParticles(cx + (Math.random()-0.5)*60, cy + (Math.random()-0.5)*60, '#f3ba2f'); }
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

let _floatCount = 0;
function spawnFloat(x, y, text, isCrit, color) {
  if (_floatCount > 8) return;
  _floatCount++;
  let el = _poolGet('float');
  if (!el) { el = document.createElement('div'); el.className = 'floating-num'; }
  else { el.style.animation = 'none'; void el.offsetWidth; el.style.display = ''; }
  el.className = 'floating-num' + (isCrit ? ' crit' : '');
  el.textContent = typeof text === 'string' ? text.substring(0, 30) : text;
  el.style.left = Math.min(Math.max(x - 50, 0), innerWidth - 80) + 'px';
  el.style.top = Math.min(Math.max(y - 50, 0), innerHeight - 60) + 'px';
  if (color) el.style.color = color;
  else el.style.color = isCrit ? '#ff4757' : '#f3ba2f';
  if (!el.parentNode) document.body.appendChild(el);
  el.style.animation = `floatDrift ${0.5 + Math.random() * 0.2}s ease-out forwards`;
  setTimeout(() => { _floatCount--; _poolRecycle('float', el); }, 700);
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
  else if (pct > 90) fill.style.animation = 'glowPulse 2s ease-in-out infinite';
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

/* ===== MINI-GAMES ===== */

/* SLOT MACHINE */
const SLOT_SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣', '⭐', '🔔'];
const SLOT_PAYOUTS = {
  '🍒🍒🍒': 5000, '🍋🍋🍋': 10000, '🍊🍊🍊': 15000, '🍇🍇🍇': 25000,
  '💎💎💎': 100000, '7️⃣7️⃣7️⃣': 500000, '⭐⭐⭐': 1000000, '🔔🔔🔔': 200000,
  '7️⃣7️⃣🍒': 50000, '💎💎7️⃣': 250000, '⭐⭐7️⃣': 500000,
};
let slotReels = ['🍒', '🍋', '🍊'];
let slotSpinning = false;

function openSlotMachine() {
  $('slotModal').classList.remove('hidden');
  renderSlotReels();
  $('slotResult').textContent = '🎰 Çevir ve kazan!';
  $('slotResult').style.color = '#8e9cb5';
}

function renderSlotReels() {
  const el = $('slotReels');
  if (!el) return;
  el.innerHTML = slotReels.map((s, i) =>
    `<span style="font-size:48px;display:inline-block;animation:${slotSpinning ? `slotSpin${i} .1s linear infinite` : 'none'}">${s}</span>`
  ).join(' | ');
}

function spinSlot() {
  if (slotSpinning) return;
  if ((S.gems || 0) < 5) { toast('❌ 5💎 gerekli!'); return; }
  S.gems -= 5;
  slotSpinning = true;
  const resultEl = $('slotResult');
  resultEl.textContent = '🎰 Çevriliyor...';
  resultEl.style.color = '#f3ba2f';
  const spins = 10 + Math.floor(Math.random() * 10);
  let count = 0;
  const iv = setInterval(() => {
    slotReels = [
      SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
      SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
      SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]
    ];
    renderSlotReels();
    sfxMultitap();
    count++;
    if (count >= spins) {
      clearInterval(iv);
      slotSpinning = false;
      const key = slotReels.join('');
      const payout = SLOT_PAYOUTS[key] || 0;
      if (payout > 0) {
        S.coins += payout;
        resultEl.textContent = `🎉 KAZANDIN! ${key} = +${fmt(payout)} Coin!`;
        resultEl.style.color = '#2ed573';
        if (payout >= 100000) { fireworkCelebration(); coinRain(20); flashOverlay('rainbow'); }
        else { coinRain(8); flashOverlay('gold'); }
      } else {
        resultEl.textContent = `😢 ${slotReels.join(' ')} - Kaybettin!`;
        resultEl.style.color = '#ff4757';
      }
      update();
      S.gemsSpent = (S.gemsSpent || 0) + 5;
      save();
    }
  }, 80);
}
$('slotSpinBtn')?.addEventListener('click', spinSlot);
$('closeSlotModal')?.addEventListener('click', () => $('slotModal').classList.add('hidden'));

/* COIN FLIP */
function openCoinFlip() {
  $('coinFlipModal').classList.remove('hidden');
  $('coinFlipResult').textContent = '🪙 Yazı mı tura mı?';
  $('coinFlipResult').style.color = '#8e9cb5';
}

function doCoinFlip(choice) {
  const bet = 10000;
  if (S.coins < bet) { toast(`❌ ${fmt(bet)} Coin gerekli!`); return; }
  S.coins -= bet;
  const result = Math.random() < 0.5 ? 'yazi' : 'tura';
  const resultEmoji = result === 'yazi' ? '👑 Yazı' : '🦅 Tura';
  const el = $('coinFlipResult');
  if (choice === result) {
    const win = bet * 2;
    S.coins += win;
    el.textContent = `🎉 ${resultEmoji}! ${fmt(win)} Coin kazandın!`;
    el.style.color = '#2ed573';
    coinRain(6);
    sfxBuy();
  } else {
    el.textContent = `😢 ${resultEmoji}! ${fmt(bet)} Coin kaybettin!`;
    el.style.color = '#ff4757';
  }
  update();
}
$('coinFlipYazi')?.addEventListener('click', () => doCoinFlip('yazi'));
$('coinFlipTura')?.addEventListener('click', () => doCoinFlip('tura'));
$('closeCoinFlipModal')?.addEventListener('click', () => $('coinFlipModal').classList.add('hidden'));

/* NUMBER GUESSER */
function openNumberGuess() {
  $('numberGuessModal').classList.remove('hidden');
  $('numberGuessResult').textContent = '🔢 1-10 arası tahmin et';
  $('numberGuessResult').style.color = '#8e9cb5';
  S._numGuessTarget = Math.floor(Math.random() * 10) + 1;
}

function guessNumber(n) {
  const cost = 5000;
  if (S.coins < cost) { toast(`❌ ${fmt(cost)} Coin gerekli!`); return; }
  S.coins -= cost;
  const target = S._numGuessTarget || Math.floor(Math.random() * 10) + 1;
  const el = $('numberGuessResult');
  if (n === target) {
    const mult = 2 + Math.floor(Math.random() * 9);
    const win = cost * mult;
    S.coins += win;
    el.textContent = `🎉 BİLDİN! Sayı ${target} idi! ${mult}x = ${fmt(win)} Coin!`;
    el.style.color = '#2ed573';
    fireworkCelebration();
    coinRain(15);
    sfxLevelUp();
  } else {
    el.textContent = `😢 ${n} değildi! Sayı ${target} idi. ${fmt(cost)} Coin kaybettin.`;
    el.style.color = '#ff4757';
  }
  S._numGuessTarget = Math.floor(Math.random() * 10) + 1;
  update();
}
document.querySelectorAll('.num-guess-btn').forEach(btn => {
  btn.addEventListener('click', () => guessNumber(parseInt(btn.dataset.num)));
});
$('closeNumberGuessModal')?.addEventListener('click', () => $('numberGuessModal').classList.add('hidden'));

/* REACTION GAME */
let reactionTimeout = null;
let reactionStart = 0;
let reactionActive = false;

function openReactionGame() {
  $('reactionModal').classList.remove('hidden');
  $('reactionStatus').textContent = '🟡 Hazır ol...';
  $('reactionStatus').style.color = '#f39c12';
  $('reactionBtn').classList.add('hidden');
  $('reactionBtn').textContent = '👆 TIKLA!';
  $('reactionBtn').style.background = '#2ed573';
  reactionActive = false;
  setTimeout(() => {
    $('reactionStatus').textContent = '🟢 TIKLA!';
    $('reactionStatus').style.color = '#2ed573';
    $('reactionBtn').classList.remove('hidden');
    reactionStart = Date.now();
    reactionActive = true;
  }, 1000 + Math.random() * 3000);
}

function hitReaction() {
  if (!reactionActive) return;
  reactionActive = false;
  const ms = Date.now() - reactionStart;
  const el = $('reactionResult');
  const reward = Math.max(1000, Math.floor(50000 / ms));
  S.coins += reward;
  el.textContent = `⚡ ${ms}ms! +${fmt(reward)} Coin!`;
  el.style.color = ms < 200 ? '#2ed573' : ms < 400 ? '#f3ba2f' : '#ff9f43';
  if (ms < 150) { fireworkCelebration(); coinRain(20); }
  else coinRain(5);
  sfxBuy();
  update();
  $('reactionStatus').textContent = '✅ Tamamlandı!';
  $('reactionStatus').style.color = '#8e9cb5';
}
$('reactionBtn')?.addEventListener('click', hitReaction);
$('closeReactionModal')?.addEventListener('click', () => { clearTimeout(reactionTimeout); $('reactionModal').classList.add('hidden'); });

/* ===== QUICK ELMAS SHOP OPEN ===== */
$('gemCount')?.addEventListener('dblclick', () => { $('shopModal').classList.remove('hidden'); toast('💎 Elmas Dükkanı açıldı'); });

/* ===== QUICK SESSION STATS ===== */
$('coinDisplay')?.addEventListener('dblclick', () => {
  toast(`⏱️ ${getSessionTime()} | 👆${fmt(S.totalTaps||0)} | 💰${fmt(S.totalEarned||0)} | 🔥${S.bestCombo||0}x`);
});
function getEnergyRestoreTime() {
  if (S.energy >= S.maxEnergy) return '';
  const regen = 2 + (S.energyRegenBonus || 0) + (S._territoryRegen || 0);
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

/* ===== SECRET EASTER EGG ===== */
$('secretEasterEgg')?.addEventListener('click', () => {
  const easterMsgs = ['🐹 Hamster gücü!', '⚡ +1000 Enerji!', '💰 +1M Coin!', '💎 +100 Elmas!', '🔥 COMBO BOOST!', '🎮 RETRO gücü!'];
  const msg = easterMsgs[Math.floor(Math.random() * easterMsgs.length)];
  if (Math.random() < 0.2) {
    S.coins += 1000000; S.gems += 100; S.energy = S.maxEnergy;
    fireworkCelebration(); coinRain(30); flashOverlay('rainbow');
    toast(`🎉 JACKPOT! ${msg} +1M Coin +100💎`);
  } else {
    S.coins += 5000; S.gems += 2;
    toast(`🎁 ${msg} +5K Coin +2💎`);
    spawnFloat(innerWidth/2, innerHeight/2, msg, false, '#f3ba2f');
  }
  sfxGem();
  update();
});

/* ===== ENERGY REGEN ===== */
let lastEnergyFullNotif = 0;
let energySaverActive = false;
setInterval(() => {
  if (S.energy < S.maxEnergy * 1.1) {
    let regen = 2 + (S.energyRegenBonus || 0) + (S._territoryRegen || 0);
    const isLow = S.energy < S.maxEnergy * 0.1;
    if (isLow) { regen *= 2; if (!energySaverActive) { energySaverActive = true; toast('⚡ Tasarruf modu: çift yenilenme!'); } }
    else energySaverActive = false;
    S.energy = Math.min(S.maxEnergy * 1.1, S.energy + regen);
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
/* ===== CARD MERGE ===== */
function openCardMerge() {
  const el = $('mergeCardList');
  if (!el) return;
  const owned = CARDS.filter(c => getItemLevel(c.id) > 0 && getItemLevel(c.id) >= 2 && getItemLevel(c.id) < 9999);
  if (owned.length === 0) { toast('❌ Birleştirilecek kart yok (en az seviye 2 gerekli)'); return; }
  $('mergeModal').classList.remove('hidden');
  el.innerHTML = owned.map(c => {
    const lvl = getItemLevel(c.id);
    return `<div class="merge-card" data-id="${c.id}" style="display:flex;align-items:center;gap:8px;padding:8px;border-radius:8px;background:rgba(255,255,255,.04);cursor:pointer;border:1px solid transparent;">
      <span style="font-size:24px;">${c.icon}</span>
      <span style="flex:1;font-weight:600;">${c.name} Lv.${lvl}</span>
      <span style="font-size:10px;color:#8e9cb5;">→ Lv.${lvl+1}</span>
    </div>`;
  }).join('');
  el.querySelectorAll('.merge-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const c = CARDS.find(x => x.id === id);
      if (!c) return;
      const lvl = getItemLevel(id);
      if (lvl < 2) { toast('❌ En az seviye 2 gerekli'); return; }
      const cost = Math.floor(cardCost(c) * 0.3);
      if (S.coins < cost) { toast(`❌ ${fmt(cost)} Coin gerekli`); return; }
      S.coins -= cost;
      setItemLevel(id, lvl + 1);
      sfxLevelUp();
      toast(`🔄 ${c.icon} ${c.name} birleşti! Lv.${lvl} → Lv.${lvl+1} (💰${fmt(cost)})`);
      spawnParticles(innerWidth/2, innerHeight/2, '#9b59b6');
      update();
      openCardMerge();
    });
    card.addEventListener('mouseenter', () => { card.style.borderColor = '#9b59b6'; card.style.background = 'rgba(155,89,182,.1)'; });
    card.addEventListener('mouseleave', () => { card.style.borderColor = 'transparent'; card.style.background = 'rgba(255,255,255,.04)'; });
  });
}
$('closeMergeModal')?.addEventListener('click', () => $('mergeModal').classList.add('hidden'));

/* ===== ENERGY CONVERTER ===== */
$('energyConvertBtn')?.addEventListener('click', () => {
  const rate = S.perClick || 2;
  const maxConvert = Math.floor(S.energy * 0.5);
  if (maxConvert < 10) { toast('⚡ Yeterli enerji yok'); return; }
  const convert = Math.floor(maxConvert / 10) * 10;
  if (convert < 10) return;
  S.energy -= convert;
  const coins = convert * rate;
  S.coins += coins;
  toast(`⚡ ${convert} enerji → ${fmt(coins)} Coin dönüştü!`);
  spawnFloat(innerWidth/2, innerHeight/2, `⚡→💰 +${fmt(coins)}`, false, '#f3ba2f');
  sfxBuy();
  update();
});

/* ===== PRESTIGE SHOP ===== */
function openPrestigeShop() {
  const prestigePoints = S.prestige || 0;
  if (prestigePoints < 1) { toast('❌ En az 1 prestige gerekli!'); return; }
  $('prestigeShopModal').classList.remove('hidden');
  const el = $('prestigeShopList');
  const upgrades = [
    { id: 'multStart', name: 'Başlangıç Çoklu Tık +2', cost: 1, desc: 'Prestige sonrası +2 multiTap ile başla', apply: () => { S.prestigeMultStart = (S.prestigeMultStart || 0) + 2; } },
    { id: 'regenStart', name: 'Başlangıç Regen +2/s', cost: 1, desc: 'Prestige sonrası +2/s regen ile başla', apply: () => { S.prestigeRegenStart = (S.prestigeRegenStart || 0) + 2; } },
    { id: 'coinStart', name: 'Başlangıç Coin x2', cost: 2, desc: 'Prestige sonrası 2x coin ile başla', apply: () => { S.prestigeCoinMult = (S.prestigeCoinMult || 1) * 2; } },
    { id: 'energyStart', name: 'Başlangıç Enerji +1000', cost: 2, desc: 'Prestige sonrası +1000 max enerji', apply: () => { S.prestigeEnergyBonus = (S.prestigeEnergyBonus || 0) + 1000; } },
    { id: 'diamondBonus', name: 'Prestige 💎 Bonus x2', cost: 3, desc: 'Prestige ödül elmasları 2 kat', apply: () => { S.prestigeGemMult = (S.prestigeGemMult || 1) * 2; } },
    { id: 'autoPrestige', name: 'Otomatik Prestige Lv.500', cost: 5, desc: 'Level 500\'de otomatik prestige', apply: () => { S.autoPrestige = true; }, special: true },
  ];
  const purchased = S.prestigeUpgrades || [];
  el.innerHTML = upgrades.map(u => {
    const bought = purchased.includes(u.id);
    return `<div class="task" style="opacity:${bought ? '.4' : '1'};${bought ? 'pointer-events:none;' : ''}">
      <span style="font-size:16px;">${bought ? '✅' : '🔄'}</span>
      <span style="flex:1;"><strong>${u.name}</strong><br><span style="font-size:10px;color:#8e9cb5;">${u.desc}</span></span>
      <span style="color:${prestigePoints >= u.cost ? '#f3ba2f' : '#ff4757'};font-weight:700;">${u.cost} PP</span>
    </div>`;
  }).join('');
  el.querySelectorAll('.task').forEach((task, i) => {
    task.addEventListener('click', () => {
      const u = upgrades[i];
      const purchased2 = S.prestigeUpgrades || [];
      if (purchased2.includes(u.id)) { toast('✅ Zaten satın alındı'); return; }
      if ((S.prestige||0) < u.cost) { toast(`❌ ${u.cost} prestige puanı gerekli`); return; }
      S.prestige = (S.prestige||0) - u.cost;
      if (!S.prestigeUpgrades) S.prestigeUpgrades = [];
      S.prestigeUpgrades.push(u.id);
      u.apply();
      toast(`🔄 ${u.name} satın alındı!`);
      sfxLevelUp();
      save();
      openPrestigeShop();
    });
  });
}
$('closePrestigeShopModal')?.addEventListener('click', () => $('prestigeShopModal').classList.add('hidden'));

$('prestigeShopTask')?.addEventListener('click', openPrestigeShop);

/* ===== CRATE TIERS (Enhanced) ===== */
const CRATE_TIERS = [
  { name: 'Tahta Kasa', icon: '🪵', color: '#85827d', min: 2000, max: 8000, gemMin: 3, gemMax: 8, energy: 300, weight: 60 },
  { name: 'Gümüş Kasa', icon: '🥈', color: '#c0c0c0', min: 10000, max: 40000, gemMin: 8, gemMax: 20, energy: 600, weight: 30 },
  { name: 'Altın Kasa', icon: '🥇', color: '#f3ba2f', min: 50000, max: 200000, gemMin: 20, gemMax: 50, energy: 1000, weight: 9 },
  { name: 'Platin Kasa', icon: '🏆', color: '#e5e4e2', min: 200000, max: 800000, gemMin: 40, gemMax: 100, energy: 2000, weight: 3 },
  { name: 'Elmas Kasa', icon: '💎', color: '#3498db', min: 500000, max: 2000000, gemMin: 80, gemMax: 200, energy: 3500, weight: 1 },
  { name: 'Mistik Kasa', icon: '🔮', color: '#9b59b6', min: 2000000, max: 10000000, gemMin: 200, gemMax: 500, energy: 5000, weight: 0.3 },
];

/* ===== QUICK COIN BREAKDOWN ===== */
$('coinBigIcon')?.addEventListener('click', () => {
  const breakdown = [
    `💰 ${fmt(S.coins)} toplam`,
    `👆 ${fmt(S.perClick)}/tık (${S.multiTap||1}x = ${fmt(S.perClick * (S.multiTap||1))}/dokunuş)`,
    `⚡ ${fmt(S.perSec)}/s (${fmt(S.perSec*3600)}/saat)${isX2() ? ' 🔥x2' : ''}`,
    `🔥 ${combo}x combo (${combo > 0 ? `${Math.min(1 + combo*0.08, 5).toFixed(1)}x çarpan` : 'beklemede'})`,
    `🏆 ${S.bossWins} boss | ⭐${S.lvl} | ${S.rank}`,
  ].join('<br>');
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:#1e2028;border:1px solid #f3ba2f44;border-radius:12px;padding:14px;z-index:9999;font-size:11px;color:#fff;text-align:center;line-height:1.6;box-shadow:0 10px 30px rgba(0,0,0,.5);animation:modalSlide .2s ease-out;pointer-events:none;';
  el.innerHTML = breakdown;
  document.body.appendChild(el);
  setTimeout(() => { el.style.transition = 'opacity .3s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3000);
  sfxGem();
});

$('quickBoostBtn').addEventListener('click', () => {
  const now = Date.now();
  if (S.boostCD > now) {
    const sec = Math.ceil((S.boostCD - now) / 1000);
    toast(`⏳ ${sec}s bekle`);
    return;
  }
  S.boostCD = now + 10000;
  S.energy = S.maxEnergy * 1.1;
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
  const searchInput = $('cardSearch');
  if (searchInput && !searchInput._listener) {
    searchInput._listener = true;
    searchInput.addEventListener('input', () => {
      S._cardSearch = searchInput.value;
      save();
      renderGrid(document.querySelector('.chip.active')?.dataset?.f || 'all');
    });
  }
  if (searchInput && S._cardSearch) searchInput.value = S._cardSearch;
  const searchVal = (searchInput?.value || '').toLowerCase().trim();
  if (searchVal) arr = arr.filter(c => c.name.toLowerCase().includes(searchVal) || c.icon.includes(searchVal));
  arr = sortCards(arr);
  const ownedCount = arr.filter(c => getItemLevel(c.id) > 0).length;
  const totalCards = $('totalCards');
  if (totalCards) totalCards.textContent = `📊 ${ownedCount}/${arr.length} kart sahibi`;
  const totalLevels = CARDS.reduce((s, c) => s + getItemLevel(c.id), 0);
  const completionEl = $('mineCompletion');
  if (completionEl) completionEl.textContent = `📊 ${ownedCount}/${arr.length} kart · ${fmt(totalLevels)} toplam seviye`;
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
  if (!S._dailyUpgradeCount) S._dailyUpgradeCount = 0;
  S._dailyUpgradeCount++;
  if (c.bonusEnergy) {
    S.energy = Math.min(S.maxEnergy * 1.1, S.energy + c.bonusEnergy);
    toast(`⚡ +${c.bonusEnergy} Enerji!`);
  } else {
    const refill = 50 + lvl * 10;
    S.energy = Math.min(S.maxEnergy * 1.1, S.energy + refill);
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
  { day: 8, coin: 75000, gem: 50, label: '75K', icon: '🔥' },
  { day: 9, coin: 100000, gem: 65, label: '100K', icon: '💎' },
  { day: 10, coin: 200000, gem: 80, label: '200K', icon: '👑' },
  { day: 11, coin: 350000, gem: 100, label: '350K', icon: '⭐' },
  { day: 12, coin: 500000, gem: 125, label: '500K', icon: '🌟' },
  { day: 13, coin: 750000, gem: 150, label: '750K', icon: '💫' },
  { day: 14, coin: 1000000, gem: 200, label: '1M', icon: '🏆' },
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
    const isToday = S.dailyStreak % 14 === i;
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
  const day = S.dailyStreak % 14;
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
  { lvl: 150, coin: 3000000, gem: 1000, label: 'Seviye 150 Ödülü' },
  { lvl: 200, coin: 6000000, gem: 1500, label: 'Seviye 200 Ödülü' },
  { lvl: 250, coin: 10000000, gem: 2000, label: 'Seviye 250 Ödülü (RETRO!)' },
  { lvl: 300, coin: 20000000, gem: 3000, label: 'Seviye 300 Ödülü (Efsanevi!)' },
  { lvl: 350, coin: 35000000, gem: 4000, label: 'Seviye 350 Ödülü' },
  { lvl: 400, coin: 50000000, gem: 5000, label: 'Seviye 400 Ödülü (Mistik!)' },
  { lvl: 450, coin: 75000000, gem: 7000, label: 'Seviye 450 Ödülü' },
  { lvl: 500, coin: 100000000, gem: 10000, label: '🎉 Seviye 500 Ödülü (Yarı Tanrı!)' },
  { lvl: 600, coin: 250000000, gem: 20000, label: 'Seviye 600 Ödülü' },
  { lvl: 700, coin: 500000000, gem: 35000, label: 'Seviye 700 Ödülü' },
  { lvl: 800, coin: 1000000000, gem: 50000, label: 'Seviye 800 Ödülü' },
  { lvl: 900, coin: 2000000000, gem: 75000, label: 'Seviye 900 Ödülü' },
  { lvl: 1000, coin: 5000000000, gem: 100000, label: '👑 Seviye 1000 Ödülü (TANRI!)' },
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
  { id: 'fire', name: 'Ateş Hamster', icon: '🔥', lvlReq: 50, svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><circle cx='100' cy='90' r='70' fill='%23ff4500' stroke='%23ff0000' stroke-width='2'/><ellipse cx='100' cy='160' rx='42' ry='18' fill='%23ff4500' stroke='%23ff0000' stroke-width='2'/><circle cx='100' cy='80' r='38' fill='%23ff6347' stroke='%23ff0000' stroke-width='2'/><ellipse cx='86' cy='68' rx='12' ry='18' fill='%23ff6347' stroke='%23ff0000' stroke-width='2'/><ellipse cx='114' cy='68' rx='12' ry='18' fill='%23ff6347' stroke='%23ff0000' stroke-width='2'/><circle cx='100' cy='56' r='6' fill='%23ffff00'/><circle cx='88' cy='82' r='4' fill='%23333'/><circle cx='112' cy='82' r='4' fill='%23333'/></svg>`, desc: 'Alev alev yanan hamster' },
  { id: 'ice', name: 'Buz Hamster', icon: '❄️', lvlReq: 75, svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><circle cx='100' cy='90' r='70' fill='%23b0e0e6' stroke='%2300bfff' stroke-width='2'/><ellipse cx='100' cy='160' rx='42' ry='18' fill='%23b0e0e6' stroke='%2300bfff' stroke-width='2'/><circle cx='100' cy='80' r='38' fill='%23e0ffff' stroke='%2300bfff' stroke-width='2'/><ellipse cx='86' cy='68' rx='12' ry='18' fill='%23e0ffff' stroke='%2300bfff' stroke-width='2'/><ellipse cx='114' cy='68' rx='12' ry='18' fill='%23e0ffff' stroke='%2300bfff' stroke-width='2'/><circle cx='100' cy='56' r='6' fill='%23ffffff'/><circle cx='88' cy='82' r='4' fill='%2300bfff'/><circle cx='112' cy='82' r='4' fill='%2300bfff'/></svg>`, desc: 'Buz gibi soğuk hamster' },
  { id: 'nature', name: 'Doğa Hamster', icon: '🌿', lvlReq: 125, svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><circle cx='100' cy='90' r='70' fill='%232ed573' stroke='%231b8a3d' stroke-width='2'/><ellipse cx='100' cy='160' rx='42' ry='18' fill='%232ed573' stroke='%231b8a3d' stroke-width='2'/><circle cx='100' cy='80' r='38' fill='%2333a85e' stroke='%231b8a3d' stroke-width='2'/><ellipse cx='86' cy='68' rx='12' ry='18' fill='%2333a85e' stroke='%231b8a3d' stroke-width='2'/><ellipse cx='114' cy='68' rx='12' ry='18' fill='%2333a85e' stroke='%231b8a3d' stroke-width='2'/><circle cx='100' cy='56' r='6' fill='%23ffd700'/><circle cx='88' cy='82' r='4' fill='%231b5e20'/><circle cx='112' cy='82' r='4' fill='%231b5e20'/></svg>`, desc: 'Doğayla iç içe hamster' },
  { id: 'ocean', name: 'Okyanus Hamster', icon: '🌊', lvlReq: 175, svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><circle cx='100' cy='90' r='70' fill='%231e90ff' stroke='%230064b0' stroke-width='2'/><ellipse cx='100' cy='160' rx='42' ry='18' fill='%231e90ff' stroke='%230064b0' stroke-width='2'/><circle cx='100' cy='80' r='38' fill='%234169e1' stroke='%230064b0' stroke-width='2'/><ellipse cx='86' cy='68' rx='12' ry='18' fill='%234169e1' stroke='%230064b0' stroke-width='2'/><ellipse cx='114' cy='68' rx='12' ry='18' fill='%234169e1' stroke='%230064b0' stroke-width='2'/><circle cx='100' cy='56' r='6' fill='%23ffffff'/><circle cx='88' cy='82' r='4' fill='%23003366'/><circle cx='112' cy='82' r='4' fill='%23003366'/></svg>`, desc: 'Derin denizlerin hakimi' },
  { id: 'cosmic_skin', name: 'Kozmik Hamster', icon: '🌌', lvlReq: 225, svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><circle cx='100' cy='90' r='70' fill='%236a0dad' stroke='%234a0080' stroke-width='2'/><ellipse cx='100' cy='160' rx='42' ry='18' fill='%236a0dad' stroke='%234a0080' stroke-width='2'/><circle cx='100' cy='80' r='38' fill='%238b5cf6' stroke='%234a0080' stroke-width='2'/><ellipse cx='86' cy='68' rx='12' ry='18' fill='%238b5cf6' stroke='%234a0080' stroke-width='2'/><ellipse cx='114' cy='68' rx='12' ry='18' fill='%238b5cf6' stroke='%234a0080' stroke-width='2'/><circle cx='100' cy='56' r='6' fill='%23ffffff'/><circle cx='88' cy='82' r='4' fill='%23ffffff'/><circle cx='112' cy='82' r='4' fill='%23ffffff'/></svg>`, desc: 'Yıldızlararası varlık' },
  { id: 'magic_skin', name: 'Sihirli Hamster', icon: '✨', lvlReq: 275, svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><circle cx='100' cy='90' r='70' fill='%23ff69b4' stroke='%23d43b8a' stroke-width='2'/><ellipse cx='100' cy='160' rx='42' ry='18' fill='%23ff69b4' stroke='%23d43b8a' stroke-width='2'/><circle cx='100' cy='80' r='38' fill='%23ff85c8' stroke='%23d43b8a' stroke-width='2'/><ellipse cx='86' cy='68' rx='12' ry='18' fill='%23ff85c8' stroke='%23d43b8a' stroke-width='2'/><ellipse cx='114' cy='68' rx='12' ry='18' fill='%23ff85c8' stroke='%23d43b8a' stroke-width='2'/><circle cx='100' cy='56' r='6' fill='%23ffff00'/><circle cx='88' cy='82' r='4' fill='%238a2e8a'/><circle cx='112' cy='82' r='4' fill='%238a2e8a'/></svg>`, desc: 'Büyülü güçlere sahip' },
  { id: 'phantom', name: 'Hayalet Hamster', icon: '👻', lvlReq: 325, svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><circle cx='100' cy='90' r='70' fill='%23e0e0e0' stroke='%23808080' stroke-width='2'/><ellipse cx='100' cy='160' rx='42' ry='18' fill='%23e0e0e0' stroke='%23808080' stroke-width='2'/><circle cx='100' cy='80' r='38' fill='%23f0f0f0' stroke='%23808080' stroke-width='2'/><ellipse cx='86' cy='68' rx='12' ry='18' fill='%23f0f0f0' stroke='%23808080' stroke-width='2'/><ellipse cx='114' cy='68' rx='12' ry='18' fill='%23f0f0f0' stroke='%23808080' stroke-width='2'/><circle cx='100' cy='56' r='6' fill='%23ffffff'/><circle cx='88' cy='82' r='4' fill='%23666666'/><circle cx='112' cy='82' r='4' fill='%23666666'/></svg>`, desc: 'Gölgeler arasında süzülen' },
  { id: 'dragon_skin', name: 'Ejderha Hamster', icon: '🐉', lvlReq: 350, svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><circle cx='100' cy='90' r='70' fill='%23ff6347' stroke='%238b0000' stroke-width='3'/><ellipse cx='100' cy='160' rx='42' ry='18' fill='%23ff6347' stroke='%238b0000' stroke-width='2'/><circle cx='100' cy='80' r='38' fill='%23dc143c' stroke='%238b0000' stroke-width='2'/><ellipse cx='86' cy='68' rx='12' ry='18' fill='%23dc143c' stroke='%238b0000' stroke-width='2'/><ellipse cx='114' cy='68' rx='12' ry='18' fill='%23dc143c' stroke='%238b0000' stroke-width='2'/><circle cx='100' cy='56' r='6' fill='%23ffd700'/><circle cx='88' cy='82' r='4' fill='%23ffd700'/><circle cx='112' cy='82' r='4' fill='%23ffd700'/></svg>`, desc: 'Ateş püskürten efsane' },
  { id: 'angel', name: 'Melek Hamster', icon: '👼', lvlReq: 375, svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><circle cx='100' cy='90' r='70' fill='%23ffffff' stroke='%23ffd700' stroke-width='2'/><ellipse cx='100' cy='160' rx='42' ry='18' fill='%23ffffff' stroke='%23ffd700' stroke-width='2'/><circle cx='100' cy='80' r='38' fill='%23f8f8ff' stroke='%23ffd700' stroke-width='2'/><ellipse cx='86' cy='68' rx='12' ry='18' fill='%23f8f8ff' stroke='%23ffd700' stroke-width='2'/><ellipse cx='114' cy='68' rx='12' ry='18' fill='%23f8f8ff' stroke='%23ffd700' stroke-width='2'/><circle cx='100' cy='56' r='6' fill='%23ffd700'/><circle cx='88' cy='82' r='4' fill='%23b8860b'/><circle cx='112' cy='82' r='4' fill='%23b8860b'/></svg>`, desc: 'Kutsal hamster' },
  { id: 'phoenix', name: 'Anka Kuşu', icon: '🦅', lvlReq: 425, svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><circle cx='100' cy='90' r='70' fill='%23ff4500' stroke='%23ff8c00' stroke-width='2'/><ellipse cx='100' cy='160' rx='42' ry='18' fill='%23ff4500' stroke='%23ff8c00' stroke-width='2'/><circle cx='100' cy='80' r='38' fill='%23ff6347' stroke='%23ff8c00' stroke-width='2'/><ellipse cx='86' cy='68' rx='12' ry='18' fill='%23ff6347' stroke='%23ff8c00' stroke-width='2'/><ellipse cx='114' cy='68' rx='12' ry='18' fill='%23ff6347' stroke='%23ff8c00' stroke-width='2'/><circle cx='100' cy='56' r='6' fill='%23ffd700'/><circle cx='88' cy='82' r='4' fill='%23ffd700'/><circle cx='112' cy='82' r='4' fill='%23ffd700'/></svg>`, desc: 'Küllerinden doğan efsane' },
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
  const tapInner = document.querySelector('.tap-inner');
  if (tapInner) tapInner.style.background = '';
  const img = document.querySelector('.tap-inner img');
  if (!img) return;
  if (skin.svg) {
    img.src = 'data:image/svg+xml;utf8,' + skin.svg;
  } else if (skin.id === 'rainbow') {
    if (tapInner) tapInner.style.background = 'linear-gradient(145deg, #ff000044, #ff880044, #ffff0044, #00ff0044, #0088ff44, #8800ff44, #ff008844)';
  } else {
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
  const milestones = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 7500, 10000, 15000, 25000, 50000, 100000];
  milestones.forEach(m => {
    if (comboCount >= m && !S.comboMilestones?.includes(m)) {
      if (!S.comboMilestones) S.comboMilestones = [];
      S.comboMilestones.push(m);
      const bonus = m * 200;
      S.coins += bonus;
      flashOverlay('gold');
      screenShake();
      fireworkCelebration();
      spawnFloat(innerWidth / 2, innerHeight / 2 - 60, `🔥 ${m} COMBO MILESTONE!`, false, '#ff9f43');
      toast(`🔥 ${m} COMBO! +${fmt(bonus)} Coin bonus!`);
      coinRain(Math.min(m / 50, 50));
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
  { id: 'spins', icon: '🎡', name: 'Çarkı Çevir', check: s => (s.wheelFreeDate === new Date().toDateString() || s._spunPaid === true), reward: 15000, gem: 15 },
  { id: 'bossDaily', icon: '⚔️', name: 'Boss Yen', check: s => s._bossWonToday === true, reward: 25000, gem: 20 },
  { id: 'earn200k', icon: '💰', name: '200K Coin Kazan', check: s => s.totalEarned >= 200000, reward: 40000, gem: 25 },
  { id: 'upgrade10', icon: '⬆️', name: '10 Kart Yükselt', check: s => {
    if (!S._dailyUpgradeCount) S._dailyUpgradeCount = 0;
    return S._dailyUpgradeCount >= 10;
  }, reward: 30000, gem: 20 },
  { id: 'dailyPvp', icon: '⚔️', name: 'PVP Savaşı Kazan', check: s => (s.pvpWins || 0) >= 1, reward: 25000, gem: 20 },
  { id: 'dailyDungeon', icon: '🏰', name: 'Zindana Gir', check: s => (s.dungeonDaily || 0) >= 1, reward: 20000, gem: 15 },
  { id: 'dailyRift', icon: '🌀', name: 'Zaman Yarığı', check: s => s.riftUsed === new Date().toDateString(), reward: 30000, gem: 25 },
  { id: 'dailyTerritory', icon: '🌍', name: 'Bölge Ele Geçir', check: s => (s.territories || []).length >= 1, reward: 15000, gem: 10 },
  { id: 'dailyArtifact', icon: '🧪', name: 'Eser Yap', check: s => (s.artifacts || []).length >= 1, reward: 15000, gem: 10 },
  { id: 'dailyCrit', icon: '💥', name: 'Kritik Vuruş Yap', check: s => s.lastCrit === true, reward: 5000, gem: 5 },
  { id: 'dailyEnergy', icon: '⚡', name: 'Enerji Harca (500)', check: s => (s.totalEnergySpent || 0) >= 500, reward: 10000, gem: 10 },
  { id: 'dailyTaps2k', icon: '👆', name: '2000 Tık At', check: s => s.totalTaps >= 2000, reward: 15000, gem: 12 },
  { id: 'dailyEarn500k', icon: '💰', name: '500K Coin Kazan', check: s => s.totalEarned >= 500000, reward: 50000, gem: 30 },
];

function renderDailyTasks() {
  const el = $('dailyTasks');
  if (!el) return;
  const today = new Date().toDateString();
  if (!S.dailyTasks) S.dailyTasks = {};
  if (S.dailyTasksDate !== today) { S.dailyTasks = {}; S.dailyTasksDate = today; S._dailyUpgradeCount = 0; S._bossWonToday = false; S._spunPaid = false; save(); }
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
  if (S.dailyTasksDate !== today) { S.dailyTasks = {}; S.dailyTasksDate = today; S._dailyUpgradeCount = 0; S._bossWonToday = false; S._spunPaid = false; save(); }
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

/* ===== DAILY CIPHER v2 (Touch-Friendly) ===== */
const MORSE = {'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---','K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.'};
const CIPHER_WORDS = ["BTC","SOL","TON","RAT","GEM","CEO","HAMSTER","MOON","FISH","PUMP","DUMP","COIN","MINE","BOSS","GOLD","PIXEL","HAM","LUCK","TAP","HODL","NFT","DAO","WALLET","STAKE","SWAP","BULL","BEAR","MINT","DROP","VAULT"];
let cipherState = { word: '', currentLetter: 0, inputBuffer: '', completed: false };

function getTodayCipher() {
  const day = Math.floor(Date.now() / 86400000);
  return CIPHER_WORDS[day % CIPHER_WORDS.length];
}

function openCipher() {
  cipherState.word = getTodayCipher();
  cipherState.currentLetter = 0; cipherState.inputBuffer = ''; cipherState.completed = false;
  renderCipher();
  $('dailyCipherModal').classList.remove('hidden');
}

function renderCipher() {
  const w = cipherState.word;
  $('cipherWordDisplay').innerHTML = w.split('').map((l, i) => i < cipherState.currentLetter ? `<span style="color:#2ed573;">${l}</span>` : `<span style="color:#8e9cb5;">${l}</span>`).join(' ');
  $('cipherLetters').innerHTML = w.split('').map((l, i) => {
    const m = MORSE[l] || '';
    if (i < cipherState.currentLetter) return `<div style="background:rgba(46,213,115,.2);border:1px solid #2ed573;border-radius:8px;padding:4px 8px;font-size:10px;color:#2ed573;font-family:monospace;">${l}<br>${m}</div>`;
    if (i === cipherState.currentLetter) return `<div style="background:rgba(243,186,47,.15);border:1px solid #f3ba2f;border-radius:8px;padding:4px 8px;font-size:10px;color:#f3ba2f;font-family:monospace;">${l}<br>${m}</div>`;
    return `<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:4px 8px;font-size:10px;color:#8e9cb5;font-family:monospace;">${l}<br>${m}</div>`;
  }).join('');
  const buf = cipherState.inputBuffer;
  $('cipherInputDisplay').innerHTML = buf ? buf.split('').map(ch => ch === '.' ? '<span style="color:#2ed573;font-size:28px;">•</span>' : '<span style="color:#f3ba2f;font-size:28px;">−</span>').join(' ') : '<span style="color:#8e9cb5;">⏎ bas ve bırak</span>';
  $('cipherCharIndex').textContent = cipherState.currentLetter + 1;
  $('cipherTotalChars').textContent = w.length;
  $('cipherInputCount').textContent = cipherState.inputBuffer.length;
  const expected = MORSE[w[cipherState.currentLetter]] || '';
  const hintEl = $('cipherMorseHint');
  if (hintEl) hintEl.innerHTML = expected ? `Hedef: ${expected.split('').map(ch => ch === '.' ? '<b style="color:#2ed573;">•</b>' : '<b style="color:#f3ba2f;">−</b>').join(' ')} (${expected.length} vuruş)` : '';
}

function submitCipherChar() {
  const buf = cipherState.inputBuffer;
  const w = cipherState.word;
  const expected = MORSE[w[cipherState.currentLetter]] || '';
  if (buf === expected) {
    cipherState.currentLetter++; cipherState.inputBuffer = '';
    sfxGem();
    if (cipherState.currentLetter >= w.length) {
      cipherState.completed = true;
      const reward = 500000 + S.lvl * 2000;
      S.coins += reward; S.gems += 50;
      toast(`🎉 ŞİFRE: +${fmt(reward)}💰 +50💎`);
      fireworkCelebration(); coinRain(20); flashOverlay('rainbow');
      save(); update();
      $('cipherInputDisplay').innerHTML = '🎉 TEBRİKLER!';
      return;
    }
    renderCipher();
  } else {
    S.energy = Math.max(0, S.energy - 30);
    toast(`❌ "${buf}" yanlış -30⚡`);
    cipherState.inputBuffer = '';
    renderCipher();
  }
}

/* Touch-Friendly Cipher Input */
const cipherInputArea = $('cipherTapBtn');
let cipherPressStart = 0;
let cipherTouchId = null;
function handleCipherPress() { cipherPressStart = Date.now(); if (cipherInputArea) { cipherInputArea.style.transform = 'scale(.95)'; cipherInputArea.style.background = 'rgba(243,186,47,.2)'; } }
function handleCipherRelease() {
  if (cipherInputArea) { cipherInputArea.style.transform = ''; cipherInputArea.style.background = ''; }
  if (cipherState.completed || cipherState.currentLetter >= (cipherState.word || '').length) return;
  const dur = Date.now() - cipherPressStart; if (dur < 50) return;
  cipherState.inputBuffer += dur >= 250 ? '-' : '.';
  renderCipher(); sfxMultitap();
  const word = cipherState.word;
  if (MORSE[word[cipherState.currentLetter]] && cipherState.inputBuffer.length >= MORSE[word[cipherState.currentLetter]].length) submitCipherChar();
}
if (cipherInputArea) {
  cipherInputArea.addEventListener('mousedown', handleCipherPress);
  cipherInputArea.addEventListener('mouseup', handleCipherRelease);
  cipherInputArea.addEventListener('mouseleave', () => { if (cipherPressStart) handleCipherRelease(); });
  cipherInputArea.addEventListener('touchstart', e => { e.preventDefault(); handleCipherPress(); }, {passive:false});
  cipherInputArea.addEventListener('touchend', e => { e.preventDefault(); handleCipherRelease(); }, {passive:false});
  cipherInputArea.addEventListener('touchcancel', () => handleCipherRelease());
}
$('cipherResetBtn')?.addEventListener('click', () => { cipherState.currentLetter = 0; cipherState.inputBuffer = ''; renderCipher(); });
$('cipherDeleteBtn')?.addEventListener('click', () => { cipherState.inputBuffer = cipherState.inputBuffer.slice(0,-1); renderCipher(); });
$('closeCipherModal')?.addEventListener('click', () => $('dailyCipherModal').classList.add('hidden'));

/* ===== LUCKY SPIN WHEEL ===== */
const WHEEL_SLICES = [
  { label: '50K 💰', coins: 50000, gems: 0, color: '#2ed573' },
  { label: '10💎', coins: 0, gems: 10, color: '#3498db' },
  { label: '100K 💰', coins: 100000, gems: 0, color: '#1dd1a1' },
  { label: '🔥 2x', coins: 0, gems: 0, boost: true, color: '#ff9f43' },
  { label: '250K 💰', coins: 250000, gems: 0, color: '#9b59b6' },
  { label: '15💎', coins: 0, gems: 15, color: '#f3ba2f' },
  { label: '🍀 Şans', coins: 0, gems: 0, reroll: true, color: '#e84393' },
  { label: '500K 💰', coins: 500000, gems: 0, color: '#00cec9' },
  { label: '⚡ Full', coins: 0, gems: 0, refill: true, color: '#ff4757' },
  { label: '30💎', coins: 0, gems: 30, color: '#6c5ce7' },
  { label: '🔥 2x', coins: 0, gems: 0, boost: true, color: '#fd79a8' },
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
        if (prize.refill) S.energy = Math.min(S.maxEnergy * 1.1, S.energy + S.maxEnergy);
        if (prize.reroll) { toast('🍀 Şans! Tekrar çeviriyorsun!'); setTimeout(() => spinWheel(paid), 500); return; }
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
  S.gems -= 20; S._spunPaid = true;
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
  { id: 'gemPouch5', icon: '💎', name: 'Mini Elmas Paketi', cost: 1, desc: '1💎 → 5💎 dönüşüm', special: true },
  { id: 'gemPouch25', icon: '💎', name: 'Mega Elmas Paketi', cost: 5, desc: '5💎 → 25💎 dönüşüm', special: true },
  { id: 'coinMine', icon: '⛏️', name: 'Coin Madeni (1s)', cost: 100, desc: '1 saatte +500K Coin üretir', special: true },
  { id: 'superCrate', icon: '📦', name: 'Süper Kasa', cost: 500, desc: 'En iyi kasa ödülleri!', special: true },
  { id: 'energyMaxPerm', icon: '⚡', name: 'Max Enerji +500', cost: 200, desc: 'Kalıcı +500 max enerji', special: true },
  { id: 'permaMultiTap', icon: '👆', name: 'Kalıcı +2 Çoklu Tık', cost: 1000, desc: 'Her tıkta +2 ek vuruş', special: true },
  { id: 'megaBoost5', icon: '🚀', name: 'Mega Boost 5dk', cost: 50, desc: '5dk boyunca 2x regen', special: true },
  { id: 'rainbowCrate', icon: '🌈', name: 'Gökkuşağı Kasası', cost: 1000, desc: 'Tüm ödüller birden!', special: true },
  { id: 'skipBoss', icon: '⚔️', name: 'Boss Atla', cost: 30, desc: 'Boss bekleme süresini atla', special: true },
  { id: 'timeSkip2h', icon: '⏰', name: '2s Offline', cost: 75, desc: '2 saat offline kazanç simüle et', special: true },
  { id: 'lottery', icon: '🎰', name: 'Piyango', cost: 10, desc: '%50 ihtimalle büyük ödül!', special: true },
  { id: 'cardProtect', icon: '🛡️', name: 'Kart Koruması', cost: 150, desc: '+%20 satış değeri (kalıcı)', special: true },
  { id: 'gemMine', icon: '💎', name: 'Elmas Madeni (24s)', cost: 500, desc: '24 saatte 10💎 üretir', special: true },
  { id: 'prestigeBoost', icon: '🔄', name: 'Prestige+ Bonus', cost: 2000, desc: 'Prestige bonus %50 daha fazla', special: true },
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
let tapsDone = 0;
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
      tapsDone = 0;
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
      currentCrate = CRATE_TIERS[4];
      const reward = Math.floor(Math.random() * (CRATE_TIERS[4].max - CRATE_TIERS[4].min)) + CRATE_TIERS[4].min;
      const gemReward = Math.floor(Math.random() * (CRATE_TIERS[4].gemMax - CRATE_TIERS[4].gemMin)) + CRATE_TIERS[4].gemMin;
      S.coins += reward;
      S.gems += gemReward;
      S.energy = Math.min(S.maxEnergy, S.energy + CRATE_TIERS[4].energy);
      flashOverlay('#3498db');
      coinRain(30);
      toast(`💎 ELMAS KASA! +${fmt(reward)} Coin +${gemReward}💎!`);
      break;
    case 'gemPouch5':
      S.gems += 4;
      toast('💎 +5 Elmas! (1 yatır, 5 al)');
      break;
    case 'gemPouch25':
      S.gems += 20;
      toast('💎 +25 Elmas! (5 yatır, 25 al)');
      break;
    case 'coinMine':
      const cmReward = 500000;
      S.coins += cmReward;
      toast(`⛏️ Coin Madeni +${fmt(cmReward)} Coin!`);
      break;
    case 'superCrate':
      currentCrate = CRATE_TIERS[5];
      const scReward = Math.floor(Math.random() * (CRATE_TIERS[5].max - CRATE_TIERS[5].min)) + CRATE_TIERS[5].min;
      const scGem = Math.floor(Math.random() * (CRATE_TIERS[5].gemMax - CRATE_TIERS[5].gemMin)) + CRATE_TIERS[5].gemMin;
      S.coins += scReward;
      S.gems += scGem;
      S.energy = Math.min(S.maxEnergy, S.energy + CRATE_TIERS[5].energy);
      flashOverlay('rainbow');
      toast(`📦 SÜPER KASA! +${fmt(scReward)} Coin +${scGem}💎`);
      coinRain(30);
      fireworkCelebration();
      break;
    case 'energyMaxPerm':
      S.maxEnergy += 500;
      S.energy += 500;
      toast('⚡ Kalıcı +500 Max Enerji!');
      break;
    case 'permaMultiTap':
      S.multiTap = (S.multiTap || 1) + 2;
      toast(`👆 Kalıcı +2 Çoklu Tık! Toplam ${S.multiTap}x`);
      break;
    case 'megaBoost5':
      S.energy = Math.min(S.maxEnergy, S.energy + 5000);
      S.boostCD = Date.now() + 300000;
      toast('🚀 Mega Boost! +5000 Enerji +5dk hızlı regen!');
      break;
    case 'rainbowCrate':
      [CRATE_TIERS[0], CRATE_TIERS[1], CRATE_TIERS[2], CRATE_TIERS[3], CRATE_TIERS[4], CRATE_TIERS[5]].forEach(t => {
        const r = Math.floor(Math.random() * (t.max - t.min)) + t.min;
        const g = Math.floor(Math.random() * (t.gemMax - t.gemMin)) + t.gemMin;
        S.coins += r;
        S.gems += g;
      });
      S.energy = S.maxEnergy;
      flashOverlay('rainbow');
      fireworkCelebration();
      coinRain(40);
      toast('🌈 GÖKKUŞAĞI KASASI! Tüm ödüller sende!');
      break;
    case 'skipBoss':
      S.bossTimer = 0;
      toast('⚔️ Boss beklemesi atlandı!');
      break;
    case 'timeSkip2h':
      const tsEarned = Math.floor(7200 * (S.perSec || 1) * getX2Mult());
      S.coins += tsEarned;
      S.totalEarned += tsEarned;
      S.totalOffline = (S.totalOffline || 0) + tsEarned;
      toast(`⏰ 2s offline: +${fmt(tsEarned)} Coin simüle edildi!`);
      break;
    case 'lottery':
      const win = Math.random() < 0.5;
      if (win) {
        const winnings = 100000 + Math.floor(Math.random() * 400000);
        S.coins += winnings;
        toast(`🎰 PİYANGO KAZANDIN! +${fmt(winnings)} Coin!`);
        fireworkCelebration();
        coinRain(20);
      } else {
        toast('😢 Piyango bileti kaybetti...');
      }
      break;
    case 'cardProtect':
      S.cardProtectBonus = (S.cardProtectBonus || 0) + 0.2;
      toast('🛡️ Kart koruması aktif! Satış değeri +%20');
      break;
    case 'gemMine':
      const dailyGem = 10;
      S.gems += dailyGem;
      toast('💎 Elmas Madeni +10💎 (günlük)');
      break;
    case 'prestigeBoost':
      S.prestigeBoost = (S.prestigeBoost || 0) + 0.5;
      toast('🔄 Prestige bonus %50 arttı!');
      break;
  }
  S.gemsSpent = (S.gemsSpent || 0) + item.cost;
  update();
  renderShop();
}

/* ===== MUSIC & SETTINGS ===== */
const bgm = $('bgm');
bgm.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
bgm.volume = S.settings.musicVol || 0.5;

$('quickWheelBtn')?.addEventListener('click', () => {
  initWheel();
  const free = S.wheelFreeDate === new Date().toDateString() ? '0 bedava' : '1 bedava';
  const fc = $('wheelFreeCountSmall');
  if (fc) fc.textContent = `(${free})`;
  if ($('wheelFreeCount')) $('wheelFreeCount').textContent = S.wheelFreeDate === new Date().toDateString() ? '0' : '1';
  $('wheelModal').classList.remove('hidden');
});
$('quickCipherBtn')?.addEventListener('click', openCipher);
$('quickAirdropBtn')?.addEventListener('click', openAirdrop);
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
    ['🔄 Prestige', (S.prestige || 0) + 'x'],
    ['⏱️ Session', getSessionTime()],
    ['💾 Auto Save', 'Aktif (15sn)'],
    ['📦 Kasa Sayısı', fmt(S.crates || 0)],
    ['🎮 Sürüm', 'v2.0 (100+ yenilik)'],
    ['⚡ Harcanan Enerji', fmt(S.totalEnergySpent || 0)],
    ['🚀 En Hızlı Tık', (S.bestTapSpeed || 0) + 'x/tık'],
    ['📅 İlk Oynanış', S._firstPlayDate || 'Bugün'],
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

document.querySelector('.settings-icon')?.addEventListener('dblclick', () => {
  toast(`⚡ ${S.energy.toFixed(0)}/${S.maxEnergy} · 👆${S.perClick}/tık · 💰${fmt(S.perSec)}/s`);
});
document.querySelector('.settings-icon')?.addEventListener('click', () => {
  $('settingsModal').classList.remove('hidden');
  initSettingsUI();
});
$('closeSettingsModal').addEventListener('click', () => { $('settingsModal').classList.add('hidden'); });

function initSettingsUI() {
  const mb = $('musicToggleBtn');
  mb.textContent = S.settings.musicOn ? 'Açık 🎵' : 'Kapalı 🔇';
  mb.style.background = S.settings.musicOn ? '' : 'rgba(255,255,255,.08)';
  mb.style.color = S.settings.musicOn ? '' : '#8e9cb5';
  const sb = $('sfxToggleBtn');
  sb.textContent = S.settings.sfxOn ? 'Açık 🔊' : 'Kapalı 🔇';
  sb.style.background = S.settings.sfxOn ? '' : 'rgba(255,255,255,.08)';
  sb.style.color = S.settings.sfxOn ? '' : '#8e9cb5';
  $('volumeSlider').value = (S.settings.musicVol || 0.5) * 100;
  $('sfxSlider').value = (S.settings.sfxVol || 0.5) * 100;
  const verEl = $('gameVersionDisplay');
  if (verEl) verEl.textContent = '🚀 v4.0.0 - 231+ özellik!';
  const shakeToggle = $('shakeToggle');
  if (shakeToggle) { shakeToggle.textContent = S._shakeOn === false ? 'Kapalı' : 'Açık'; shakeToggle.style.background = S._shakeOn === false ? 'rgba(255,255,255,.08)' : ''; }
  const partDensity = $('particleDensity');
  if (partDensity) partDensity.value = (S._particleDensity || 100);
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

$('shakeToggle')?.addEventListener('click', () => {
  S._shakeOn = S._shakeOn === false ? true : false;
  save();
  initSettingsUI();
  toast(S._shakeOn === false ? '📳 Sarsıntı kapalı' : '📳 Sarsıntı açık');
});

$('particleDensity')?.addEventListener('input', e => {
  S._particleDensity = parseInt(e.target.value) || 100;
  const valEl = $('partDensityVal');
  if (valEl) valEl.textContent = S._particleDensity;
  save();
});

/* ===== FEEDBACK ===== */
$('feedbackSendBtn')?.addEventListener('click', () => {
  const inp = $('feedbackInput');
  const msg = (inp?.value || '').trim();
  if (!msg) { $('feedbackStatus').textContent = '❌ Boş mesaj gönderilemez'; return; }
  const full = `💬 *Geri Bildirim* (${S.username || 'İsimsiz'})\n${msg}`;
  try { if (window.Telegram?.WebApp) Telegram.WebApp.sendData(full); }
  catch (_) {}
  S._lastFeedback = msg;
  S._feedbackDate = Date.now();
  save();
  inp.value = '';
  $('feedbackStatus').textContent = '✅ Gönderildi! Teşekkürler 🎉';
  setTimeout(() => { $('feedbackStatus').textContent = ''; }, 3000);
});
$('feedbackCopyBtn')?.addEventListener('click', () => {
  const inp = $('feedbackInput');
  const msg = (inp?.value || '').trim();
  if (!msg) { $('feedbackStatus').textContent = '❌ Önce mesaj yaz'; return; }
  const full = `💬 Geri Bildirim: ${msg}`;
      try { navigator.clipboard.writeText(full); $('feedbackStatus').textContent = "📋 Panoya kopyalandı! Bot'a yapıştır: @Rat_combatbot"; }
  catch (_) { $('feedbackStatus').textContent = '❌ Kopyalanamadı'; }
  setTimeout(() => { $('feedbackStatus').textContent = ''; }, 4000);
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
/* ===== BOSS OVERHAUL v2 ===== */
const BOSS_TIERS = [
  { name: 'Karanlık CEO', icon: '💼', color: '#8e9cb5', hpBase: 15000, hpScale: 5000, time: 30, ability: null, desc: 'Standart boss' },
  { name: 'Maden Canavarı', icon: '👹', color: '#2ed573', hpBase: 30000, hpScale: 8000, time: 30, ability: 'regen', desc: 'Her 5s\'de can yeniler', abilityDesc: '🔄 Can yeniliyor!' },
  { name: 'Kripto Kraken', icon: '🐙', color: '#3498db', hpBase: 60000, hpScale: 12000, time: 25, ability: 'weaken', desc: 'Vuruşlarını zayıflatır', abilityDesc: '💫 Vuruşların zayıfladı!' },
  { name: 'Shadow CEO', icon: '👤', color: '#9b59b6', hpBase: 100000, hpScale: 20000, time: 25, ability: 'steal', desc: 'Coin çalar', abilityDesc: '💰 Coinlerin çalınıyor!' },
  { name: 'Efsanevi Hamster', icon: '🐹', color: '#ff4757', hpBase: 200000, hpScale: 35000, time: 20, ability: 'enrage', desc: 'Zamanla güçlenir', abilityDesc: '🔥 Öfkelendi! Hasarlıyor!' },
  { name: 'Alev İblisi', icon: '🔥', color: '#ff6348', hpBase: 400000, hpScale: 50000, time: 20, ability: 'burn', desc: 'Enerji yakarak can alır', abilityDesc: '🔥 Enerjin yanıyor!' },
  { name: 'Buz Devi', icon: '🧊', color: '#00d2d3', hpBase: 700000, hpScale: 80000, time: 25, ability: 'freeze', desc: 'Tıklamalarını yavaşlatır', abilityDesc: '❄️ Donuyorsun!' },
  { name: 'Yıldırım Lordu', icon: '⚡', color: '#ffd32a', hpBase: 1200000, hpScale: 150000, time: 18, ability: 'lightning', desc: 'Ani yüksek hasar', abilityDesc: '⚡ Yıldırım çarptı!' },
  { name: 'Kara Delik', icon: '🕳️', color: '#2d3436', hpBase: 2000000, hpScale: 250000, time: 20, ability: 'vortex', desc: 'Canını emer', abilityDesc: '🌀 Canın emiliyor!' },
  { name: 'Tanrı Hamster', icon: '🗿', color: '#ffd700', hpBase: 5000000, hpScale: 500000, time: 15, ability: 'godmode', desc: 'Tüm yetenekler!', abilityDesc: '☠️ TANRI GÜCÜ!' },
];
const BOSS_SHOP = [
  { id: '10xTap', icon: '👆', name: '10x Tık Modu', desc: 'Savaşta 10x tıkla (30sn)', cost: 50, apply: () => { S._boss10xTap = true; } },
  { id: 'bossAuto', icon: '🤖', name: 'Oto-Başlat', desc: 'Boss otomatik başlasın', cost: 100, apply: () => { S._bossAutoStart = true; } },
  { id: 'bossDmg50', icon: '💥', name: '+50% Hasar', desc: 'Boss vuruş hasarı +%50', cost: 75, apply: () => { S._bossDmgMult = (S._bossDmgMult || 1) + 0.5; } },
  { id: 'bossTime', icon: '⏱️', name: '+10sn Süre', desc: 'Boss süresi +10sn', cost: 60, apply: () => { S._bossTimeBonus = (S._bossTimeBonus || 0) + 10; } },
  { id: 'bossShield', icon: '🛡️', name: 'Kalkan', desc: 'İlk hiti emer', cost: 80, apply: () => { S._bossShield = true; } },
  { id: 'bossGem', icon: '💎', name: '+5💎/kill', desc: 'Her boss için +5 elmas', cost: 120, apply: () => { S._bossGemBonus = (S._bossGemBonus || 0) + 5; } },
  { id: 'bossBp50', icon: '🪙', name: '+50% BP', desc: 'Kazanılan BP +%50', cost: 90, apply: () => { S._bossBpMult = (S._bossBpMult || 1) + 0.5; } },
  { id: 'bossHeal', icon: '❤️', name: 'Can Doldurma', desc: 'Her vuruşta +1 can', cost: 150, apply: () => { S._bossLifeSteal = (S._bossLifeSteal || 0) + 1; } },
];

function getBossTier() { return Math.min(Math.floor((S.bossWins || 0) / 5), BOSS_TIERS.length - 1); }
function getBossLevel() { return 1 + getBossTier(); }
function getBossData() { return BOSS_TIERS[getBossTier()]; }
function getBossHp() { const d = getBossData(); return d.hpBase + getBossTier() * d.hpScale; }

$('startBossBtn').addEventListener('click', startBoss);

function startBoss() {
  if (S.lvl < 15) { toast('❌ Level 15 gerekli'); return; }
  if (S.bossActive) { toast('⚔️ Boss zaten aktif!'); return; }
  S.bossActive = true;
  S.bossAbilityActive = '';
  S.bossAbilityTimer = 0;
  S._bossShieldUsed = false;
  const tier = getBossTier();
  const bData = getBossData();
  const bLvl = getBossLevel();
  S.bossMaxHp = getBossHp();
  S.bossHp = S.bossMaxHp;
  const tierScale = 1 + tier * 0.5;
  S.bossPlayerMaxHp = Math.floor(100 * tierScale);
  S.bossPlayerHp = S.bossPlayerMaxHp;
  S.bossTimer = bData.time + (S._bossTimeBonus || 0);
  updateBossUI();
  $('startBossBtn').textContent = `⚔️ ${bData.icon} Savaş Sürüyor (Seviye ${bLvl})`;
  $('startBossBtn').disabled = true;
  const bossLevelTag = $('bossLevelTag');
  if (bossLevelTag) bossLevelTag.textContent = `Seviye ${bLvl} · ${bData.name}`;
  const bossH3 = document.querySelector('.b-head h3');
  bossH3.textContent = `${bData.icon} ${bData.name}`;
  bossH3.style.color = bData.color;
  bossH3.style.textShadow = `0 0 20px ${bData.color}66`;
  const bossDesc = $('bossDesc');
  if (bossDesc) bossDesc.textContent = bData.desc;
  if (bData.ability) {
    const abilEl = $('bossAbilityIndicator');
    if (abilEl) { abilEl.textContent = `⚠️ ${bData.abilityDesc}`; abilEl.style.color = bData.color; abilEl.classList.remove('hidden'); }
  }
  let abilityTick = 0;
  let regenUsed = false;
  let bossAtkTick = 0;
  const iv = setInterval(() => {
    S.bossTimer -= 0.1;
    abilityTick += 0.1;
    bossAtkTick += 0.1;
    if (bData.ability === 'regen' && abilityTick >= 5 && !regenUsed) {
      if (S.bossHp > 0 && S.bossHp < S.bossMaxHp) { S.bossHp = Math.min(S.bossMaxHp, S.bossHp + S.bossMaxHp * 0.1); toast(`🔄 ${bData.name} can yeniledi!`); }
      regenUsed = true;
    }
    if (bData.ability === 'enrage' && abilityTick >= 3) {
      const dmg = Math.floor(S.maxEnergy * 0.02 * (abilityTick / 3));
      S.energy = Math.max(0, S.energy - dmg);
      if (abilityTick % 3 < 0.2) toast(`🔥 ${bData.name} öfkelendi! -${dmg}⚡`);
    }
    if (bData.ability === 'burn' && abilityTick >= 2) {
      const dmg = Math.floor(S.energy * 0.05);
      S.energy = Math.max(0, S.energy - dmg);
      if (abilityTick % 2 < 0.2) toast(`🔥 ${bData.name} enerjini yakıyor! -${dmg}⚡`);
    }
    if (bData.ability === 'lightning' && abilityTick >= 4) {
      const ldmg = Math.floor(S.bossMaxHp * 0.03);
      S.bossHp = Math.max(0, S.bossHp - ldmg);
      flashOverlay('blue');
      abilityTick = 0;
    }
    if (bData.ability === 'vortex' && abilityTick >= 3) {
      const sdmg = Math.floor(S.bossHp * 0.02);
      S.bossHp = Math.min(S.bossMaxHp, S.bossHp + sdmg);
      S.energy = Math.max(0, S.energy - sdmg);
      if (abilityTick % 3 < 0.2) toast(`🌀 Kara delik canını emiyor! -${sdmg}⚡`);
    }
    /* Boss attacks player */
    const atkInterval = Math.max(1.5, 4 - tier * 0.3);
    if (bossAtkTick >= atkInterval) {
      const baseDmg = Math.floor((10 + tier * 8) * (1 + S.bossWins * 0.02));
      let bossAtk = Math.floor(baseDmg * (0.8 + Math.random() * 0.4));
      if (S._bossShield && !S._bossShieldUsed) {
        S._bossShieldUsed = true;
        bossAtk = 0;
        toast('🛡️ Kalkan ilk hasarı emdi!');
      }
      S.bossPlayerHp = Math.max(0, S.bossPlayerHp - bossAtk);
      flashOverlay('red');
      spawnFloat(innerWidth / 2, innerHeight / 3, '💢 ' + bossAtk, true, '#ff4757');
      bossAtkTick = 0;
    }
    if (S.bossPlayerHp <= 0) {
      clearInterval(iv);
      S.bossActive = false; S.bossAbilityActive = '';
      const abilEl = $('bossAbilityIndicator');
      if (abilEl) abilEl.classList.add('hidden');
      $('startBossBtn').textContent = '⚔️ Başlat';
      $('startBossBtn').disabled = false;
      toast(`💀 ${bData.icon} seni yendi! Bir dahakine.`);
      spawnParticles(innerWidth / 2, innerHeight / 2, '#ff4757');
      updateBossUI(); update();
      return;
    }
    if (S.bossTimer <= 0 || S.bossHp <= 0) {
      clearInterval(iv);
      S.bossActive = false; S.bossAbilityActive = '';
      const abilEl = $('bossAbilityIndicator');
      if (abilEl) abilEl.classList.add('hidden');
      $('startBossBtn').textContent = '⚔️ Başlat';
      $('startBossBtn').disabled = false;
      if (S.bossHp <= 0) {
        S.bossWins++; S._bossWonToday = true;
        const reward = S.lvl * 1000 + S.bossWins * 500;
        const gemReward = 15 + S.bossWins * 3 + (S._bossGemBonus || 0);
        const bpGain = Math.floor(10 + tier * 5 * (S._bossBpMult || 1));
        S.coins += reward; S.gems += gemReward;
        S.bossPoints = (S.bossPoints || 0) + bpGain;
        S.maxEnergy += 10;
        if (tier >= 3) { S.perClick += 1; toast('👆 Kalıcı +1/tık!'); }
        if (tier >= 6) { S.perSec += 50; }
        sfxBossKill(); fireworkCelebration();
        flashOverlay('rainbow'); coinRain(30);
        spawnParticles(innerWidth / 2, innerHeight / 2, '#f3ba2f');
        toast(`🏆 ${bData.icon} ${bData.name} YENİLDİ! +${fmt(reward)}💰 +${gemReward}💎 +${bpGain}BP`);
        update();
        if (S._bossAutoStart) setTimeout(startBoss, 500);
      } else {
        toast(`💀 ${bData.icon} ${bData.name} kaçtı! Bir dahakine.`);
        S.bossHp = S.bossMaxHp;
      }
      updateBossUI(); update();
    }
    updateBossUI();
  }, 100);
}

$('bossTapTarget').addEventListener('click', e => {
  if (!S.bossActive) { toast('⚔️ Boss başlat!'); return; }
  const tier = getBossTier();
  const bData = getBossData();
  const isCrit = Math.random() < 0.25;
  let dmgMult = S._bossDmgMult || 1;
  if (bData.ability === 'weaken' && Math.random() < 0.3) dmgMult *= 0.5;
  if (S._boss10xTap) dmgMult *= 10;
  const taps = S.multiTap || 1;
  const dmg = Math.floor((S.perClick * 3 + Math.floor(S.perSec * 0.1)) * (isCrit ? 3 : 1) * dmgMult * taps);
  S.bossHp = Math.max(0, S.bossHp - dmg);
  if (S._bossLifeSteal) S.energy = Math.min(S.maxEnergy * 1.1, S.energy + (S._bossLifeSteal || 0) * dmg);
  sfxBossHit();
  spawnParticles(e.clientX || innerWidth / 2, e.clientY || innerHeight / 2, bData.color || '#ff4757');
  spawnFloat((e.clientX || innerWidth / 2) - 40, (e.clientY || innerHeight / 2) - 40, (isCrit ? '💥 ' : '') + '-' + dmg, isCrit);
  if (dmg > 100) {
    const a = document.querySelector('.arena');
    if (a) { a.classList.remove('shake'); void a.offsetWidth; a.classList.add('shake'); setTimeout(() => a.classList.remove('shake'), 250); }
  }
  try { navigator.vibrate(15); } catch (_) { }
  if (bData.ability === 'freeze') {
    const freezeChance = Math.random();
    if (freezeChance < 0.15) { toast('❄️ Dondu! Tık kaçtı!'); return; }
  }
  if (bData.ability === 'steal' && Math.random() < 0.1) {
    const stolen = Math.floor(S.coins * 0.01);
    S.coins = Math.max(0, S.coins - stolen);
    toast(`💰 ${bData.name} ${fmt(stolen)} coin çaldı!`);
  }
  updateBossUI();
});

/* ===== BOSS SHOP ===== */
$('bossShopBtn')?.addEventListener('click', openBossShop);
$('closeBossShopModal')?.addEventListener('click', () => $('bossShopModal').classList.add('hidden'));

function openBossShop() {
  if (!S.bossPoints) S.bossPoints = 0;
  if (!S.bossUpgrades) S.bossUpgrades = [];
  $('bossShopBp').textContent = S.bossPoints;
  const el = $('bossShopList'); el.innerHTML = '';
  BOSS_SHOP.forEach((item) => {
    const owned = S.bossUpgrades.includes(item.id);
    const d = document.createElement('div');
    d.style.cssText = `display:flex;align-items:center;gap:8px;padding:8px;border-radius:10px;background:${owned ? 'rgba(46,213,115,.1)' : 'rgba(255,255,255,.04)'};border:1px solid ${owned ? '#2ed573' : 'transparent'};margin:2px 0;opacity:${owned ? '.6' : '1'};`;
    d.innerHTML = `<span style="font-size:20px;">${item.icon}</span>
      <div style="flex:1;"><div style="font-weight:700;font-size:12px;">${item.name}</div>
      <div style="font-size:10px;color:#8e9cb5;">${item.desc}</div></div>
      <div style="text-align:right;"><div style="font-size:10px;color:#f3ba2f;">${item.cost}BP</div>
      <button class="btn btn-gold btn-xs" ${owned||S.bossPoints<item.cost?'disabled':''}>${owned?'✓':(S.bossPoints<item.cost?'❌':'Al')}</button></div>`;
    if (!owned) d.querySelector('button').addEventListener('click', () => {
      if (S.bossPoints < item.cost) return toast('❌ Yetersiz BP');
      S.bossPoints -= item.cost;
      if (!S.bossUpgrades) S.bossUpgrades = [];
      S.bossUpgrades.push(item.id);
      item.apply();
      save(); update();
      toast(`✅ ${item.name} satın alındı!`);
      openBossShop();
    });
    el.appendChild(d);
  });
  $('bossShopModal').classList.remove('hidden');
}

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
  const bpEl = $('bossPointsDisplay');
  if (bpEl) bpEl.textContent = `🪙 ${S.bossPoints || 0} BP`;
  const ph = $('playerHpDisplay');
  const pf = $('playerHpFill');
  const pp = document.querySelector('.b-player-hp');
  if (ph && pf && pp) {
    if (S.bossActive) {
      pp.classList.remove('hidden');
      ph.textContent = `${S.bossPlayerHp}/${S.bossPlayerMaxHp}`;
      const pct = S.bossPlayerMaxHp > 0 ? (S.bossPlayerHp / S.bossPlayerMaxHp) * 100 : 0;
      pf.style.width = Math.max(0, pct) + '%';
      pf.style.background = pct < 25 ? '#ff4757' : pct < 50 ? '#ff9f43' : '#2ed573';
    } else { pp.classList.add('hidden'); }
  }
}

/* ===== OFFLINE EARNINGS ===== */
function checkOffline() {
  const stamp = S.offlineStamp || S.lastSave;
  const diff = Date.now() - stamp;
  if (diff < 30000) return;
  const sec = Math.min(Math.floor(diff / 1000), 10800);
  const earned = Math.floor(sec * S.perSec * getX2Mult());
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
let lastSaveBlink = 0;
setInterval(() => {
  save();
  const el = $('saveIndicator');
  if (el) { el.textContent = '💾'; el.style.opacity = '1'; setTimeout(() => el.style.opacity = '0', 600); }
}, 15000);

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

/* ===== QUICK SFX TOGGLE ===== */
$('sfxToggleQuick')?.addEventListener('click', () => {
  S.settings.sfxOn = !S.settings.sfxOn;
  save();
  toast(S.settings.sfxOn ? '🔊 Ses açık' : '🔇 Ses kapalı');
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
        save();
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
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
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
  if (e.key === 'm' || e.key === 'M') switchTab('tab-mine');
  if (e.key === 'f' || e.key === 'F') switchTab('tab-friends');
  if (e.key === 'e' || e.key === 'E') switchTab('tab-earn');
  if (e.key === 'x' || e.key === 'X') switchTab('tab-boss');
  if (e.key === 'q' || e.key === 'Q') quickUpgrade(10);
  if (e.key === '1') switchTab('tab-borsa');
  if (e.key === '2') switchTab('tab-mine');
  if (e.key === '3') switchTab('tab-friends');
  if (e.key === '4') switchTab('tab-earn');
  if (e.key === '5') switchTab('tab-boss');
  if (e.key === 'r' || e.key === 'R') openRift();
  if (e.key === 'p' || e.key === 'P') openPvpArena();
  if (e.key === 'd' || e.key === 'D') openDungeon();
  if (e.key === 'w' || e.key === 'W') openWorldMap();
  if (e.key === 'a' || e.key === 'A') openAlchemy();
  if (e.key === 'c' || e.key === 'C') openCipher();
  if (e.key === 'z' || e.key === 'Z') openWheel();
  if (e.key === 's' || e.key === 'S') {$('settingsModal')?.classList.remove('hidden'); initSettingsUI();}
  if (e.key === 'o' || e.key === 'O') openAirdrop();
  if (e.key === 'h' || e.key === 'H') openShop();
  if (e.key === 't' || e.key === 'T') startTutorial();
  if (e.key === 'n' || e.key === 'N') openNamePicker();
  if (e.key === 'l' || e.key === 'L') toggleAutoBuy();
  if (e.key === 'k' || e.key === 'K') openCardMerge();
  if (e.key === 'u' || e.key === 'U') openPrestigeShop();
  if (e.key === 'i' || e.key === 'I') {$('statModal')?.classList.remove('hidden');}
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
  const savedPrestige = S.prestige || 0;
  const savedUsername = S.username || '';
  const savedSettings = { ...S.settings };
  const oldLvl = S.lvl;
  Object.assign(S, defState());
  S.gems = (S.gems || 0) + gainGems;
  S.prestige = savedPrestige + 1;
  S.username = savedUsername;
  S.settings = savedSettings;
  sessionStart = Date.now();
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

/* ===== PVP ARENA ===== */
const PVP_TIERS = ['Bronz','Gümüş','Altın','Platin','Elmas','Siber','Efsanevi','Gökkuşağı'];
const PVP_ICONS = ['🥉','🥈','🥇','💎','🔥','⚡','👑','🌈'];
function getPvpRank() {
  const idx = Math.min(Math.floor(S.pvpScore / 100), PVP_TIERS.length - 1);
  return { title: PVP_TIERS[idx], icon: PVP_ICONS[idx], idx };
}
function genOpponents() {
  const rank = getPvpRank();
  const base = 1 + rank.idx * 5 + Math.floor(S.lvl / 10);
  const list = [];
  for (let i = 0; i < 4; i++) {
    const lvl = Math.max(10, base + Math.floor(Math.random() * 10) - 5);
    const pwr = Math.floor(base * (0.8 + Math.random() * 0.4));
    list.push({
      name: ['KaraKorsan','ShadowKing','CryptoLord','TapMaster','CoinHunter','MegaCEO','DarkNinja','StarDust'][Math.floor(Math.random()*8)],
      lvl, power: pwr, reward: Math.floor((pwr * 100) * (1 + S.prestige * 0.1)),
      icon: ['⚔️','🗡️','🛡️','👹','🤖','👾','🐉','💀'][Math.floor(Math.random()*8)]
    });
  }
  return list;
}
function openPvpArena() {
  const rank = getPvpRank();
  $('pvpRankDisplay').textContent = `${rank.icon} ${rank.title} · ${S.pvpScore} Puan`;
  const cont = $('pvpOpponents'); cont.innerHTML = '';
  $('pvpBattleArea').classList.add('hidden');
  const opps = genOpponents();
  opps.forEach((o,i) => {
    const d = document.createElement('div'); d.className = 'pvp-opponent';
    const canFight = Date.now() - (S.pvpLastFight || 0) > 5000;
    d.innerHTML = `<div class="pvp-icon" style="background:rgba(255,255,255,.06);">${o.icon}</div>
      <div style="flex:1;"><div style="font-weight:700;font-size:13px;">${o.name}</div>
      <div style="font-size:10px;color:#8e9cb5;">Level ${o.lvl} · ⚡${o.power}</div></div>
      <div style="text-align:right;"><div style="font-weight:700;color:#f3ba2f;font-size:11px;">💰${fmt(o.reward)}</div>
      <button class="btn btn-gold btn-xs" ${canFight?'':'disabled'}>${canFight?'Savaş ⚔️':'⏳'}</button></div>`;
    if (canFight) d.querySelector('button').addEventListener('click', () => startPvpBattle(i));
    cont.appendChild(d);
  });
  $('pvpModal').classList.remove('hidden');
}
function startPvpBattle(idx) {
  const opps = genOpponents();
  const opp = opps[idx % opps.length];
  S.pvpLastFight = Date.now();
  const area = $('pvpBattleArea'); area.classList.remove('hidden');
  $('pvpBattleIcon').textContent = opp.icon;
  $('pvpBattleStatus').textContent = `⚔️ ${opp.name}'a karşı savaşıyor...`;
  $('pvpBattleResult').textContent = '';
  const playerPower = S.lvl + Math.floor(S.totalEarned / 1e6) + S.prestige * 10 + S.perClick;
  const total = playerPower + opp.power;
  const winChance = playerPower / total;
  const btn = $('pvpOpponents').querySelectorAll('button')[idx];
  if (btn) { btn.textContent = '⚔️'; btn.style.background = 'rgba(255,71,87,.3)'; }
  let ticks = 0;
  const bInt = setInterval(() => {
    ticks++;
    $('pvpBattleIcon').textContent = ['⚔️','💥','🔥','⚡','🗡️'][ticks % 5];
    if (btn) btn.style.transform = `scale(${1 - ticks * 0.02})`;
    if (ticks >= 6) {
      clearInterval(bInt);
      const won = Math.random() < winChance;
      if (won) {
        const reward = opp.reward;
        S.coins += reward; S.pvpScore += 10 + Math.floor(Math.random() * 5);
        S.pvpWins = (S.pvpWins || 0) + 1;
        $('pvpBattleResult').textContent = `🏆 KAZANDIN! +${fmt(reward)}💰`;
        $('pvpBattleResult').style.color = '#2ed573';
        spawnParticles(null,null,'#f3ba2f');
        area.style.background = 'rgba(46,213,115,.1)';
        save();
      } else {
        S.pvpLosses = (S.pvpLosses || 0) + 1;
        $('pvpBattleResult').textContent = '💀 Kaybettin!';
        $('pvpBattleResult').style.color = '#ff4757';
        area.style.background = 'rgba(255,71,87,.08)';
      }
      $('pvpBattleStatus').textContent = won ? '💰 Ödülü kaptın!' : '😤 Bir dahakine!';
      update(); openPvpArena();
    }
  }, 300);
}

/* ===== AUTO-BATTLE DUNGEON ===== */
const DUNGEON_ROOMS = [
  { icon: '🕷️', desc: 'Dev örümceklerle dolu bir oda!', monster: 'Örümcek Sürüsü' },
  { icon: '🦇', desc: 'Karanlık mağara, yarasalar saldırıyor!', monster: 'Yarasa Sürüsü' },
  { icon: '🪦', desc: 'Antik mezar, zombiler uyanıyor!', monster: 'Zombi' },
  { icon: '🔥', desc: 'Lav dolu bir koridor!', monster: 'Lav Şeytanı' },
  { icon: '🧊', desc: 'Buz mağarası, donmuş devler!', monster: 'Buz Devi' },
  { icon: '⚡', desc: 'Büyülü oda, statik enerji akıyor!', monster: 'Büyücü' },
  { icon: '🐉', desc: 'Ejderha yuvasına girdin!', monster: 'Ejderha' },
  { icon: '👹', desc: 'Cehennem kapısı, iblisler çıkıyor!', monster: 'İblis Lord' },
];
const DUNGEON_BUFFS = [
  { icon: '⚔️', name: 'Güç', bonus: '2x hasar', stat: 'dmg' },
  { icon: '💰', name: 'Zenginlik', bonus: '2x ödül', stat: 'coin' },
  { icon: '⚡', name: 'Enerji', bonus: '+100 enerji', stat: 'energy' },
  { icon: '🛡️', name: 'Savunma', bonus: '%25 can', stat: 'shield' },
  { icon: '💎', name: 'Elmas', bonus: '+5 elmas', stat: 'gem' },
];
function openDungeon() {
  const dBest = $('dunBest'); if (dBest) dBest.textContent = S.dungeonBest || 0;
  $('dunFloor').textContent = '0';
  $('dunIcon').textContent = '🏰'; $('dunTitle').textContent = 'Zindana girmeye hazır mısın?';
  $('dunDesc').textContent = '50 ⚡ karşılığında maceraya atıl!';
  $('dunBuffs').classList.add('hidden'); $('dunBuffs').innerHTML = '';
  $('dunChoices').classList.add('hidden'); $('dunChoices').innerHTML = '';
  $('dunEnterBtn').classList.remove('hidden');
  $('dunExitBtn').classList.add('hidden');
  $('dungeonModal').classList.remove('hidden');
}
function closeDungeon() { $('dungeonModal').classList.add('hidden'); S.dungeonFloor = 0; S.dungeonBuffs = []; }
function enterDungeon() {
  if (S.energy < 50) return toast('❌ Yetersiz enerji!');
  S.energy -= 50; S.dungeonFloor = 1; S.dungeonBuffs = [];
  $('dunEnterBtn').classList.add('hidden');
  processDungeonRoom();
}
function processDungeonRoom() {
  if (S.dungeonFloor > 10) { dungeonComplete(); return; }
  $('dunFloor').textContent = S.dungeonFloor;
  if (S.dungeonFloor === 10) {
    $('dunIcon').textContent = '🐉'; $('dunTitle').textContent = '🐉 SON PATRON! Ejderha Kral!';
    $('dunDesc').textContent = 'Tüm gücünle saldır! Bu son savaş!';
    $('dunBuffs').classList.add('hidden');
    $('dunChoices').classList.remove('hidden'); $('dunChoices').innerHTML = '';
    const btn = document.createElement('div'); btn.className = 'dun-choice dun-boss';
    btn.innerHTML = '<span class="dun-c-icon">⚔️</span><span>SALDIR! (Patron Canı: 1000)</span>';
    btn.addEventListener('click', dungeonBoss);
    $('dunChoices').appendChild(btn);
  } else {
    const room = DUNGEON_ROOMS[(S.dungeonFloor - 1) % DUNGEON_ROOMS.length];
    $('dunIcon').textContent = room.icon;
    $('dunTitle').textContent = `🏛️ Oda ${S.dungeonFloor}: ${room.monster}`;
    $('dunDesc').textContent = room.desc;
    $('dunBuffs').classList.add('hidden'); $('dunBuffs').innerHTML = '';
    $('dunChoices').classList.remove('hidden'); $('dunChoices').innerHTML = '';
    const buffOptions = [...DUNGEON_BUFFS].sort(() => Math.random() - 0.5).slice(0, 3);
    buffOptions.forEach((b, i) => {
      const d = document.createElement('div'); d.className = 'dun-choice';
      d.innerHTML = `<span class="dun-c-icon">${b.icon}</span><span>${b.name}: ${b.bonus}</span>`;
      d.addEventListener('click', () => chooseDungeonBuff(i, buffOptions));
      $('dunChoices').appendChild(d);
    });
  }
}
function chooseDungeonBuff(idx, options) {
  const b = options[idx];
  S.dungeonBuffs.push(b);
  const buffsEl = $('dunBuffs'); buffsEl.classList.remove('hidden');
  const tag = document.createElement('span'); tag.className = 'dun-buff';
  tag.textContent = `${b.icon}${b.name}`;
  buffsEl.appendChild(tag);
  S.dungeonFloor++;
  $('dunChoices').classList.add('hidden');
  setTimeout(processDungeonRoom, 400);
}
function dungeonBoss() {
  $('dunChoices').classList.add('hidden');
  $('dunTitle').textContent = '⚔️ Patron savaşı!';
  $('dunDesc').textContent = 'Saldırıyorsun...';
  let hp = 1000;
  const dmg = S.perClick * (S.dungeonBuffs.filter(b => b.stat === 'dmg').length * 2 || 1);
  const coinMult = S.dungeonBuffs.filter(b => b.stat === 'coin').length * 2 || 1;
  const iv = setInterval(() => {
    hp -= dmg;
    $('dunDesc').textContent = `⚔️ ${Math.max(0, hp)} can kaldı`;
    if (hp <= 0) {
      clearInterval(iv);
      const reward = Math.floor((5000 + S.lvl * 200) * coinMult);
      const gemReward = 3 + Math.floor(Math.random() * 5);
      S.coins += reward; S.gems += gemReward;
      if ((S.dungeonBest || 0) < S.dungeonFloor) S.dungeonBest = S.dungeonFloor;
      $('dunIcon').textContent = '🏆';
      $('dunTitle').textContent = `🎉 Zindan Tamamlandı! Kat ${S.dungeonFloor}`;
      $('dunDesc').textContent = `💰+${fmt(reward)} · 💎+${gemReward}`;
      $('dunExitBtn').classList.remove('hidden');
      S.dungeonFloor++;
      S.dungeonDaily = (S.dungeonDaily||0) + 1;
      save(); update();
      sfxLevelUp();
      spawnParticles(null,null,'#f3ba2f');
    }
  }, 500);
}
function dungeonComplete() {
  $('dunIcon').textContent = '🏆';
  $('dunTitle').textContent = '🎉 MÜKEMMEL! Tüm zindan temizlendi!';
  const bonus = Math.floor(20000 * (1 + S.prestige * 0.2));
  S.coins += bonus; S.gems += 10;
  $('dunDesc').textContent = `🏆 Bonus: +${fmt(bonus)}💰 +10💎`;
  $('dunExitBtn').classList.remove('hidden');
  if ((S.dungeonBest || 0) < 10) S.dungeonBest = 10;
  save(); update();
  sfxLevelUp();
}

/* ===== TIME RIFT ===== */
let riftInterval = null;
let riftTimeLeft = 0;
let riftEarned = 0;
let riftActive = false;
function openRift() {
  const today = new Date().toDateString();
  const used = S.riftUsed === today;
  riftActive = false;
  if (riftInterval) { clearInterval(riftInterval); riftInterval = null; }
  $('riftStatus').textContent = used ? '✅ Bugün kullandın! Yarın tekrar gel.' : '🌀 60sn boyunca 10x kazanç!';
  $('riftTimer').textContent = used ? '--:--' : '60sn';
  $('riftRewardText').textContent = '0 coin';
  $('riftIcon').textContent = used ? '✅' : '⏳';
  $('riftActivateBtn').textContent = used ? '⏰ Yarın Açılır' : '🌀 Yarığı Aç';
  $('riftActivateBtn').disabled = used;
  $('riftModal').classList.remove('hidden');
}
function activateRift() {
  const today = new Date().toDateString();
  if (S.riftUsed === today) return toast('❌ Bugün zaten kullandın!');
  S.riftUsed = today;
  riftActive = true; riftTimeLeft = 60; riftEarned = 0;
  S.riftReward = 0;
  $('riftActivateBtn').disabled = true;
  $('riftActivateBtn').textContent = '🌀 AKTİF!';
  document.querySelector('.app').classList.add('rift-active');
  riftInterval = setInterval(() => {
    riftTimeLeft--;
    $('riftTimer').textContent = `${riftTimeLeft}sn`;
    $('riftTimer').classList.add('rift-countdown');
    if (riftTimeLeft <= 10) $('riftTimer').style.color = '#ff4757';
    if (riftTimeLeft <= 0) {
      clearInterval(riftInterval); riftInterval = null;
      endRift();
    }
  }, 1000);
  toast('🌀 ZAMAN YARIĞI AKTİF! 60sn 10x kazanç!');
  sfxLevelUp();
}
function endRift() {
  riftActive = false;
  document.querySelector('.app').classList.remove('rift-active');
  S.riftReward = riftEarned;
  const bonus = Math.floor(riftEarned * 0.5);
  S.coins += bonus;
  $('riftIcon').textContent = '🎉';
  $('riftStatus').textContent = `🌀 Yarık kapandı! Ekstra bonus: +${fmt(bonus)}💰`;
  $('riftRewardText').textContent = `+${fmt(riftEarned + bonus)}💰`;
  $('riftActivateBtn').textContent = '✅ Kullanıldı';
  $('riftTimer').textContent = '🎉';
  save(); update();
  spawnParticles(null,null,'#9b59b6');
  toast(`🌀 Zaman yarığı bitti! +${fmt(bonus)} bonus!`);
}

/* ===== WORLD CONQUEST ===== */
const TERRITORIES = [
  { name: 'Türkiye', icon: '🇹🇷', cost: 5000, bonus: { type: 'perClick', val: 1 }, region: 'Avrasya' },
  { name: 'Almanya', icon: '🇩🇪', cost: 12000, bonus: { type: 'perSec', val: 50 }, region: 'Avrupa' },
  { name: 'Japonya', icon: '🇯🇵', cost: 25000, bonus: { type: 'maxEnergy', val: 500 }, region: 'Asya' },
  { name: 'ABD', icon: '🇺🇸', cost: 50000, bonus: { type: 'perClick', val: 3 }, region: 'Amerika' },
  { name: 'Brezilya', icon: '🇧🇷', cost: 40000, bonus: { type: 'perSec', val: 200 }, region: 'Amerika' },
  { name: 'Rusya', icon: '🇷🇺', cost: 35000, bonus: { type: 'maxEnergy', val: 1000 }, region: 'Avrasya' },
  { name: 'Hindistan', icon: '🇮🇳', cost: 45000, bonus: { type: 'perClick', val: 4 }, region: 'Asya' },
  { name: 'Çin', icon: '🇨🇳', cost: 60000, bonus: { type: 'perSec', val: 500 }, region: 'Asya' },
  { name: 'Fransa', icon: '🇫🇷', cost: 30000, bonus: { type: 'energyRegenBonus', val: 1 }, region: 'Avrupa' },
  { name: 'İngiltere', icon: '🇬🇧', cost: 28000, bonus: { type: 'perClick', val: 2 }, region: 'Avrupa' },
  { name: 'Mısır', icon: '🇪🇬', cost: 15000, bonus: { type: 'perSec', val: 80 }, region: 'Afrika' },
  { name: 'Avustralya', icon: '🇦🇺', cost: 22000, bonus: { type: 'maxEnergy', val: 300 }, region: 'Okyanusya' },
  { name: 'Kanada', icon: '🇨🇦', cost: 32000, bonus: { type: 'perSec', val: 150 }, region: 'Amerika' },
  { name: 'Güney Kore', icon: '🇰🇷', cost: 38000, bonus: { type: 'perClick', val: 3 }, region: 'Asya' },
  { name: 'İtalya', icon: '🇮🇹', cost: 20000, bonus: { type: 'energyRegenBonus', val: 1 }, region: 'Avrupa' },
  { name: 'İspanya', icon: '🇪🇸', cost: 18000, bonus: { type: 'perSec', val: 100 }, region: 'Avrupa' },
  { name: 'Endonezya', icon: '🇮🇩', cost: 26000, bonus: { type: 'maxEnergy', val: 400 }, region: 'Asya' },
  { name: 'Suudi Arabistan', icon: '🇸🇦', cost: 55000, bonus: { type: 'perClick', val: 5 }, region: 'Avrasya' },
  { name: 'Meksika', icon: '🇲🇽', cost: 16000, bonus: { type: 'perSec', val: 60 }, region: 'Amerika' },
  { name: 'Nijerya', icon: '🇳🇬', cost: 10000, bonus: { type: 'maxEnergy', val: 200 }, region: 'Afrika' },
];
function openWorldMap() {
  const owned = S.territories || [];
  $('worldProgress').textContent = `🌍 ${owned.length}/${TERRITORIES.length} bölge`;
  const cont = $('worldList'); cont.innerHTML = '';
  TERRITORIES.forEach((t, i) => {
    const isOwned = owned.includes(i);
    const d = document.createElement('div'); d.className = 'world-territory' + (isOwned ? ' owned' : '');
    const bVal = t.bonus.val + (isOwned ? 0 : 0);
    d.innerHTML = `<span class="w-icon">${t.icon}</span>
      <span class="w-name">${t.name} ${isOwned ? '✅' : ''}</span>
      <div style="text-align:right;">
        <div class="w-bonus">${isOwned ? '✔️' : ''} +${bVal} ${t.bonus.type}</div>
        ${!isOwned ? `<div class="w-cost">💰${fmt(t.cost)}</div>` : ''}
      </div>`;
    if (!isOwned) {
      d.style.cursor = 'pointer';
      d.addEventListener('click', () => conquerTerritory(i));
    }
    cont.appendChild(d);
  });
  $('worldModal').classList.remove('hidden');
}
function conquerTerritory(idx) {
  const t = TERRITORIES[idx];
  if ((S.territories || []).includes(idx)) return toast('❌ Zaten ele geçirdin!');
  if (S.coins < t.cost) return toast(`❌ ${fmt(t.cost)} coin lazım!`);
  S.coins -= t.cost;
  if (!S.territories) S.territories = [];
  S.territories.push(idx);
  applyTerritoryBonus(t.bonus);
  save(); update();
  openWorldMap();
  toast(`🌍 ${t.name} ele geçirildi! +${t.bonus.val} ${t.bonus.type}`);
  sfxBuy();
}
function applyTerritoryBonus(bonus) {
  if (bonus.type === 'energyRegenBonus') S.energyRegenBonus = (S.energyRegenBonus || 0) + bonus.val;
}

/* ===== ALCHEMY ===== */
const ARTIFACTS = [
  { icon: '⚗️', name: 'Bilgelik İksiri', bonus: '+2 perClick', apply: () => { S.perClick += 2; } },
  { icon: '🔮', name: 'Kristal Küre', bonus: '+50 perSec', apply: () => { S.perSec += 50; } },
  { icon: '💫', name: 'Yıldız Tozu', bonus: '+200 maxEnergy', apply: () => { S.maxEnergy += 200; } },
  { icon: '🪄', name: 'Sihirli Asa', bonus: '+5 perClick', apply: () => { S.perClick += 5; } },
  { icon: '🏺', name: 'Antik Vazo', bonus: '+150 perSec', apply: () => { S.perSec += 150; } },
  { icon: '💎', name: 'Büyülü Elmas', bonus: '+500 maxEnergy', apply: () => { S.maxEnergy += 500; } },
  { icon: '👑', name: 'Kral Tacı', bonus: '+10 perClick', apply: () => { S.perClick += 10; } },
  { icon: '⚡', name: 'Yıldırım Taşı', bonus: '+300 perSec', apply: () => { S.perSec += 300; } },
];
let alchemyTimer = null;
function openAlchemy() {
  if (!S.alchemyEssence && S.alchemyEssence !== 0) S.alchemyEssence = 0;
  if (!S.artifacts) S.artifacts = [];
  $('alchemyEssence').textContent = S.alchemyEssence;
  $('alchemyArtifacts').textContent = S.artifacts.length;
  $('alchemyResult').classList.add('hidden');
  const list = $('alchemyArtifactList'); list.innerHTML = '';
  if (S.artifacts.length === 0) { list.innerHTML = '<div style="font-size:11px;color:#8e9cb5;text-align:center;">Henüz eserin yok</div>'; }
  else {
    S.artifacts.forEach((a, i) => {
      const d = document.createElement('div'); d.className = 'artifact-item';
      d.innerHTML = `<span class="a-icon">${a.icon}</span><span class="a-name">${a.name}</span><span class="a-bonus">${a.bonus}</span>`;
      list.appendChild(d);
    });
  }
  $('alchemyModal').classList.remove('hidden');
}
function craftArtifact() {
  if (!S.alchemyEssence) S.alchemyEssence = 0;
  if (S.alchemyEssence < 3) return toast('❌ 3✨ öz lazım! Tıkladıkça öz kazanırsın.');
  S.alchemyEssence -= 3;
  if (!S.artifacts) S.artifacts = [];
  const artifact = ARTIFACTS[Math.floor(Math.random() * ARTIFACTS.length)];
  S.artifacts.push(artifact);
  artifact.apply();
  const result = $('alchemyResult'); result.classList.remove('hidden');
  result.innerHTML = `<div style="font-size:32px;animation:dunAniam .5s;">${artifact.icon}</div>
    <div style="font-weight:700;">🧪 ${artifact.name} üretildi!</div>
    <div style="color:#f3ba2f;font-size:12px;">${artifact.bonus}</div>`;
  save(); update(); openAlchemy();
  sfxLevelUp();
}
$('craftBtn').addEventListener('click', craftArtifact);

/* ===== ESSENCE ON TAP ===== */
function giveEssence() {
  if (Math.random() < 0.08) {
    S.alchemyEssence = (S.alchemyEssence || 0) + 1;
    spawnFloat(innerWidth/2 + Math.random()*100-50, innerHeight/2, '✨+1', false, '#9b59b6');
  }
}

/* ===== MODAL CLOSE ===== */
function wireClose(id) {
  const el = $(id);
  if (el) el.addEventListener('click', (e) => { if (e.target === el) el.classList.add('hidden'); });
}
['pvpModal','dungeonModal','riftModal','worldModal','alchemyModal'].forEach(id => wireClose(id));
$('closePvpModal').addEventListener('click', () => $('pvpModal').classList.add('hidden'));
$('closeDungeonModal').addEventListener('click', () => { $('dungeonModal').classList.add('hidden'); S.dungeonFloor = 0; });
$('closeRiftModal').addEventListener('click', () => { $('riftModal').classList.add('hidden'); if (riftInterval) { clearInterval(riftInterval); riftInterval = null; riftActive = false; document.querySelector('.app').classList.remove('rift-active'); } });
$('closeWorldModal').addEventListener('click', () => $('worldModal').classList.add('hidden'));
$('closeAlchemyModal').addEventListener('click', () => $('alchemyModal').classList.add('hidden'));
$('riftActivateBtn').addEventListener('click', activateRift);

update();
if (!S._firstPlayDate) S._firstPlayDate = new Date().toLocaleDateString('tr-TR');
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