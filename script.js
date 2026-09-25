/* =========================================================
   OPTIMUS THE RESCUIER - script.js
   Beginner-friendly game logic.

   THIS VERSION ADDS:
   - Mission intro sequence: briefing card -> START MISSION -> 3..2..1..GO
   - Real rescue mechanic: walk onto a survivor, then press E (or tap
     the on-screen Rescue button) and wait out a short rescue timer.
     The robot visually "carries" rescued survivors until you reach
     the safe zone.
   - A minimap in the corner of the board (player / survivors / danger / gold)
   - Low-time warning (HUD timer flashes + beeps under 10s)
   - Rank titles (Rookie Rescuer -> Master Rescuer) + a small badge set
   - A "buy health with gold" popup offered on failure, letting you
     continue the same run instead of restarting
   - Gold shop upgrades that change gameplay (Rescue Tool, Battery,
     Fire Shield) alongside the earlier ones (extra heart, shield
     charm, vision boost, coin magnet) + robot skins
   - Hunter enemy, patrolling cars, spreading fire, instant-fail
     skulls, fog-of-war -- all still level/mechanic driven
   - 50 themed missions with real names + briefings
========================================================= */

/* ---------- 1. GRAB ALL THE HTML ELEMENTS WE NEED ---------- */
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const shopButtonStart = document.getElementById('shop-button-start');
const profileButtonStart = document.getElementById('profile-button-start');
const startRankValueEl = document.getElementById('start-rank-value');

const levelSelectScreen = document.getElementById('level-select-screen');
const backToStartButton = document.getElementById('back-to-start-button');
const levelsGridBeginner = document.getElementById('levels-grid-beginner');
const levelsGridIntermediate = document.getElementById('levels-grid-intermediate');
const levelsGridExpert = document.getElementById('levels-grid-expert');

const shopScreen = document.getElementById('shop-screen');
const shopGoldValueEl = document.getElementById('shop-gold-value');
const shopUpgradesGrid = document.getElementById('shop-upgrades-grid');
const shopSkinsGrid = document.getElementById('shop-skins-grid');
const backToStartButtonShop = document.getElementById('back-to-start-button-shop');

const profileScreen = document.getElementById('profile-screen');
const profileRankValueEl = document.getElementById('profile-rank-value');
const profileStatsEl = document.getElementById('profile-stats');
const badgesGrid = document.getElementById('badges-grid');
const backToStartButtonProfile = document.getElementById('back-to-start-button-profile');

const gameBoardWrapper = document.getElementById('game-board-wrapper');
const gameBoard = document.getElementById('game-board');
const robotEl = document.getElementById('robot');
const robotFaceEl = document.getElementById('robot-face');
const robotCarryBadgeEl = document.getElementById('robot-carry-badge');
const fogOverlay = document.getElementById('fog-overlay');
const minimapGrid = document.getElementById('minimap-grid');

const missionBriefingEl = document.getElementById('mission-briefing');
const missionBriefingTitleEl = document.getElementById('mission-briefing-title');
const missionBriefingTextEl = document.getElementById('mission-briefing-text');

const rescuePromptEl = document.getElementById('rescue-prompt');
const rescuePromptTextEl = document.getElementById('rescue-prompt-text');
const rescueActionButton = document.getElementById('rescue-action-button');
const rescueProgressEl = document.getElementById('rescue-progress');
const rescueProgressFillEl = document.getElementById('rescue-progress-fill');

const missionIntroPopup = document.getElementById('mission-intro-popup');
const introMissionTitleEl = document.getElementById('intro-mission-title');
const introLocationValueEl = document.getElementById('intro-location-value');
const introObjectiveValueEl = document.getElementById('intro-objective-value');
const introTimeValueEl = document.getElementById('intro-time-value');
const introDangerValueEl = document.getElementById('intro-danger-value');
const introRewardValueEl = document.getElementById('intro-reward-value');
const introStartButton = document.getElementById('intro-start-button');

const countdownPopup = document.getElementById('countdown-popup');
const countdownNumberEl = document.getElementById('countdown-number');

const winScreen = document.getElementById('win-screen');
const winDebriefTextEl = document.getElementById('win-debrief-text');
const winScoreEl = document.getElementById('win-score');
const winGoldEl = document.getElementById('win-gold');
const nextLevelButton = document.getElementById('next-level-button');
const levelSelectButtonWin = document.getElementById('level-select-button-win');

const gameOverScreen = document.getElementById('gameover-screen');
const gameOverDebriefTextEl = document.getElementById('gameover-debrief-text');
const gameOverScoreEl = document.getElementById('gameover-score');
const retryLevelButton = document.getElementById('retry-level-button');
const levelSelectButtonGameOver = document.getElementById('level-select-button-gameover');

const revivePopupEl = document.getElementById('revive-popup');
const reviveReasonTextEl = document.getElementById('revive-reason-text');
const reviveCostValueEl = document.getElementById('revive-cost-value');
const reviveGoldAvailableEl = document.getElementById('revive-gold-available');
const reviveYesButton = document.getElementById('revive-yes-button');
const reviveNoButton = document.getElementById('revive-no-button');

const levelValueEl = document.getElementById('level-value');
const rankValueEl = document.getElementById('rank-value');
const scoreValueEl = document.getElementById('score-value');
const timerValueEl = document.getElementById('timer-value');
const timerDisplayEl = document.getElementById('timer-display');
const healthValueEl = document.getElementById('health-value');
const survivorsValueEl = document.getElementById('survivors-value');
const goldBankValueEl = document.getElementById('gold-bank-value');
const goldRunValueEl = document.getElementById('gold-run-value');

const btnUp = document.getElementById('btn-up');
const btnDown = document.getElementById('btn-down');
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');


/* ---------- 2. GAME SETTINGS ---------- */
const GRID_SIZE = 10;
const CELL_PERCENT = 100 / GRID_SIZE;
const STARTING_HEALTH = 3;
const TOTAL_LEVELS = 50;
const GOLD_PER_COIN = 10;
const HAZARD_TICK_MS = 550;
const RESCUE_BASE_DURATION_MS = 1500;
const LOW_TIME_THRESHOLD = 10;

const STORAGE_KEY_UNLOCKED = 'rescuebot_unlocked_level';
const STORAGE_KEY_GOLD_BANK = 'rescuebot_total_gold';
const STORAGE_KEY_GOLD_CLAIMED = 'rescuebot_gold_claimed_missions';
const STORAGE_KEY_UPGRADES = 'rescuebot_upgrades';
const STORAGE_KEY_STATS = 'rescuebot_lifetime_stats';

const ROBOT_START = { x: 0, y: 0 };
const SAFE_ZONE_POS = { x: GRID_SIZE - 1, y: GRID_SIZE - 1 };

const SKIN_SETS = {
  classic: { label: 'Classic', cost: 0, idle: '🤖', walk: '🚶', rescue: '🎉', damage: '💥', victory: '🏆' },
  cyborg: { label: 'Cyborg', cost: 150, idle: '🦾', walk: '🏃', rescue: '🎊', damage: '⚠️', victory: '👑' },
  alien: { label: 'Alien Scout', cost: 250, idle: '👽', walk: '🛸', rescue: '✨', damage: '💫', victory: '🌟' },
  wolf: { label: 'Rescue Wolf', cost: 350, idle: '🐺', walk: '🐾', rescue: '🐕', damage: '💢', victory: '🦴' },
};

// Shop upgrades now actually change gameplay, not just stats on paper.
const UPGRADE_DEFS = {
  extraHeart: { label: 'Armor Plating', cost: 150, maxLevel: 2, description: '+1 max health per level (stacks twice).' },
  shieldCharm: { label: 'Shield Charm', cost: 200, maxLevel: 1, description: 'Absorbs the first hit each mission for free.' },
  visionBoost: { label: 'Vision Boost', cost: 150, maxLevel: 1, description: 'Widens the fog radius on low-visibility missions.' },
  coinMagnet: { label: 'Coin Magnet', cost: 250, maxLevel: 1, description: 'Auto-collects gold coins one tile away.' },
  rescueTool: { label: 'Rescue Tool', cost: 220, maxLevel: 1, description: 'Cuts the rescue timer roughly in half.' },
  battery: { label: 'Battery Pack', cost: 180, maxLevel: 2, description: '+10 seconds of mission time per level.' },
  fireShield: { label: 'Fire Shield', cost: 260, maxLevel: 1, description: 'Fire hazards deal no damage while it holds (one save per mission).' },
};

// Rank titles based on how far the player has unlocked.
const RANKS = [
  { minLevel: 1, title: 'Rookie Rescuer', icon: '🟢' },
  { minLevel: 5, title: 'Field Rescuer', icon: '🟢' },
  { minLevel: 10, title: 'Emergency Specialist', icon: '🟡' },
  { minLevel: 25, title: 'Elite Rescuer', icon: '🔴' },
  { minLevel: 50, title: 'Master Rescuer', icon: '🏆' },
];

// Simple badge set, evaluated against lifetime stats each time they change.
const BADGE_DEFS = [
  { key: 'firstRescue', icon: '🏅', label: 'First Rescue', description: 'Rescue your first survivor.', test: (s) => s.totalRescued >= 1 },
  { key: 'tenSurvivors', icon: '🏅', label: '10 Survivors Saved', description: 'Rescue 10 survivors in total.', test: (s) => s.totalRescued >= 10 },
  { key: 'hundredSurvivors', icon: '🏅', label: '100 Survivors Saved', description: 'Rescue 100 survivors in total.', test: (s) => s.totalRescued >= 100 },
  { key: 'noDamage', icon: '🏅', label: 'Perfect Mission', description: 'Complete a mission without losing any health.', test: (s) => s.noDamageWins >= 1 },
  { key: 'speedRunner', icon: '🏅', label: 'Speed Runner', description: 'Finish a mission with 20+ seconds left on the clock.', test: (s) => s.fastWins >= 1 },
  { key: 'thousandGold', icon: '🏅', label: '1000 Gold Earned', description: 'Earn 1000 gold in total.', test: (s) => s.totalGoldEarned >= 1000 },
  { key: 'missionsCleared10', icon: '🏅', label: '10 Missions Cleared', description: 'Complete 10 missions.', test: (s) => s.missionsCompleted >= 10 },
  { key: 'allClear', icon: '🏆', label: 'Master Rescuer', description: 'Unlock every mission.', test: (s) => s.highestUnlocked >= TOTAL_LEVELS },
];


/* ---------- 3. GAME STATE ---------- */
let robotPos = { ...ROBOT_START };
let obstacles = [];
let survivors = [];
let hazards = [];
let movingObstacles = [];
let hunters = [];
let goldCoins = [];
let score = 0;
let health = STARTING_HEALTH;
let maxHealth = STARTING_HEALTH;
let shieldActive = false;
let fireShieldActive = false;
let tookDamageThisRun = false;
let timeLeft = 60;
let rescuedCount = 0;
let sessionGold = 0;
let goldAvailableThisRun = 0;
let timerInterval = null;
let hazardInterval = null;
let gameActive = false;
let robotAnimTimeout = null;
let audioCtx = null;

let isRescuing = false;
let rescueTargetIndex = -1;
let rescueTimeoutId = null;
let rescueIntervalId = null;

let currentLevel = 1;
let numSurvivorsNeeded = 3;
let currentConfig = null;
let reviveUsedThisMission = false;
let pendingFailureReason = '';

let unlockedLevel = loadUnlockedLevel();
let goldBank = loadGoldBank();
let goldClaimedMissions = loadGoldClaimedMissions();
let upgrades = loadUpgrades();
let lifetimeStats = loadStats();


/* ---------- 4. MISSION THEMES (names, briefings, mechanics) ---------- */
const HAND_MISSIONS = {
  1: { name: 'Training', briefing: 'A calm first run to learn the controls.', mechanics: {} },
  2: { name: 'Forest Rescue', briefing: 'Watch your step — obstacles block the direct path.', mechanics: {} },
  3: { name: 'Fire Zone', briefing: 'Fire spreads across the grid the longer you take.', mechanics: { fireSpread: true } },
  4: { name: 'Night Rescue', briefing: 'Visibility is limited — stay close to see your surroundings.', mechanics: { nightVision: true } },
  5: { name: 'Time Attack', briefing: 'Only 30 seconds on the clock. Move with purpose.', mechanics: { timeAttack: true }, timeOverride: 30 },
  6: { name: 'Highway Crossing', briefing: 'Patrolling vehicles cross the grid. Time your moves.', mechanics: { movingCars: true } },
  7: { name: 'Blackout', briefing: 'The grid flickers in darkness. Trust your instincts.', mechanics: { nightVision: true } },
  8: { name: 'Inferno', briefing: 'Fire spreads fast here. Move quickly and carefully.', mechanics: { fireSpread: true } },
  9: { name: 'Gridlock', briefing: 'Cars patrol every lane. Timing is everything.', mechanics: { movingCars: true } },
  10: { name: 'Mass Rescue', briefing: 'High survivor count, full hazards. This is the real test.', mechanics: { movingCars: true, fireSpread: true } },
  14: { name: 'Shadow Tracker', briefing: 'Something is hunting you. Keep moving, keep watching.', mechanics: { hunter: true } },
};

const NAME_POOLS = {
  beginner: ['Search Party', 'Quiet Streets', 'First Response', 'Local Rescue', 'Backyard Rescue', 'Neighborhood Watch', 'Morning Patrol', 'Rooftop Rescue'],
  intermediate: ['Storm Warning', 'Collapsed Bridge', 'Wildfire Front', 'Midnight Shift', 'Traffic Chaos', 'Flooded District', 'Power Outage', 'Chemical Spill', 'Urban Maze', 'Rescue Convoy', 'Evac Route', 'Smoke Signal', 'Rising Tide', 'Broken Grid', 'Last Transmission', 'Danger Zone', 'Rapid Response', 'Sector Seven', 'Overwatch', 'Perimeter Breach'],
  expert: ['Apocalypse Protocol', 'Zero Hour', 'Final Stand', 'Blackout Protocol', 'Inferno Core', 'Ghost Sector', "No Man's Land", 'Critical Mass', 'Endgame', 'Last Light', 'Point of No Return', 'Meltdown Alert', 'Siege', 'The Long Night', 'Extraction'],
};

const LOCATION_POOLS = {
  beginner: ['Suburban Block', 'Riverside Path', 'Community Park', 'Old Town Square', 'Quiet Cul-de-sac'],
  intermediate: ['Industrial District', 'Downtown Core', 'Flooded Underpass', 'Abandoned Warehouse', 'Collapsed Overpass', 'Storm-Hit Harbor'],
  expert: ['Reactor Complex', 'Burning Skyline', 'Toxic Wastelands', 'Blackout City', 'Quarantine Zone', 'Ground Zero'],
};

function tierForLevel(level) {
  if (level > 35) return 'expert';
  if (level > 15) return 'intermediate';
  return 'beginner';
}

function getMissionMechanics(level, tier) {
  return {
    movingCars: level >= 6,
    fireSpread: level % 4 === 3,
    nightVision: level % 5 === 4,
    instaFailHazards: tier === 'expert' && level % 6 === 0,
    timeAttack: level % 7 === 0,
    hunter: level >= 14 && level % 8 === 0,
  };
}

function getMissionMeta(level) {
  const tier = tierForLevel(level);

  if (HAND_MISSIONS[level]) {
    const hand = HAND_MISSIONS[level];
    return {
      tier, name: hand.name, briefing: hand.briefing,
      mechanics: { movingCars: false, fireSpread: false, nightVision: false, instaFailHazards: false, timeAttack: false, hunter: false, ...hand.mechanics },
      timeOverride: hand.timeOverride || null,
    };
  }

  const pool = NAME_POOLS[tier];
  const name = pool[(level * 7) % pool.length];
  const mechanics = getMissionMechanics(level, tier);

  const parts = [];
  if (mechanics.hunter) parts.push('A hunter is tracking you.');
  if (mechanics.instaFailHazards) parts.push('Danger: skulls end the mission instantly.');
  if (mechanics.fireSpread) parts.push('Fire will spread across the grid.');
  if (mechanics.nightVision) parts.push('Visibility is limited — stay close to see.');
  if (mechanics.movingCars) parts.push('Watch for patrolling vehicles.');
  if (mechanics.timeAttack) parts.push('The clock is tight — move fast.');

  const briefing = parts.length ? parts.join(' ') : 'A steady rescue run — nothing unusual to report.';
  return { tier, name, briefing, mechanics, timeOverride: null };
}

function getMissionLocation(level, tier) {
  const pool = LOCATION_POOLS[tier];
  return pool[(level * 5) % pool.length];
}


/* ---------- 5. MISSION DIFFICULTY (numbers scale with level) ---------- */
function getSurvivorCount(level, tier) {
  const tierBonus = tier === 'expert' ? 6 : tier === 'intermediate' ? 3 : 0;
  const base = 3 + Math.floor(level * 0.55) + tierBonus;
  return Math.min(base, 30);
}

function getLevelConfig(level) {
  const meta = getMissionMeta(level);
  const tier = meta.tier;

  const survivorsCount = getSurvivorCount(level, tier);
  const obstaclesCount = Math.min(4 + Math.floor(level / 3), 16);
  const electricHazards = Math.min(1 + Math.floor(level / 9), 5);
  const goldCount = Math.min(3 + Math.floor(level / 10), 6);

  const fireHazards = meta.mechanics.fireSpread
    ? Math.min(2 + Math.floor(level / 10), 4)
    : Math.min(1 + Math.floor(level / 18), 2);

  const carsCount = meta.mechanics.movingCars ? Math.min(1 + Math.floor(level / 12), 4) : 0;
  const skullCount = meta.mechanics.instaFailHazards ? Math.min(1 + Math.floor(level / 20), 2) : 0;
  const huntersCount = meta.mechanics.hunter ? 1 : 0;

  let time = Math.max(25, 95 - level) + (upgrades.battery || 0) * 10;
  if (meta.timeOverride) time = meta.timeOverride + (upgrades.battery || 0) * 10;
  else if (meta.mechanics.timeAttack) time = Math.max(20, time - 20);

  const rescueLine = `Rescue ${survivorsCount} survivor${survivorsCount === 1 ? '' : 's'} and reach the safe zone.`;
  const fullBriefing = `${rescueLine} ${meta.briefing}`;
  const rewardEstimate = survivorsCount * 100 + goldCount * GOLD_PER_COIN;

  return {
    tier, name: meta.name, briefing: fullBriefing, mechanics: meta.mechanics,
    location: getMissionLocation(level, tier),
    survivors: survivorsCount, obstacles: obstaclesCount,
    fireHazards, electricHazards, cars: carsCount, skulls: skullCount,
    huntersCount, time, goldCount, rewardEstimate,
  };
}


/* ---------- 6. SAVING / LOADING PROGRESS ---------- */
function loadUnlockedLevel() {
  const saved = localStorage.getItem(STORAGE_KEY_UNLOCKED);
  const parsed = saved ? parseInt(saved, 10) : 1;
  return isNaN(parsed) ? 1 : parsed;
}
function saveUnlockedLevel(level) { localStorage.setItem(STORAGE_KEY_UNLOCKED, level); }

function loadGoldBank() {
  const saved = localStorage.getItem(STORAGE_KEY_GOLD_BANK);
  const parsed = saved ? parseInt(saved, 10) : 0;
  return isNaN(parsed) ? 0 : parsed;
}
function saveGoldBank(amount) { localStorage.setItem(STORAGE_KEY_GOLD_BANK, amount); }

function loadGoldClaimedMissions() {
  const saved = localStorage.getItem(STORAGE_KEY_GOLD_CLAIMED);
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) { return []; }
}
function saveGoldClaimedMissions(list) { localStorage.setItem(STORAGE_KEY_GOLD_CLAIMED, JSON.stringify(list)); }

function loadUpgrades() {
  const saved = localStorage.getItem(STORAGE_KEY_UPGRADES);
  const defaults = {
    extraHeart: 0, shieldCharm: 0, visionBoost: 0, coinMagnet: 0,
    rescueTool: 0, battery: 0, fireShield: 0,
    skin: 'classic', unlockedSkins: ['classic'],
  };
  try {
    const parsed = JSON.parse(saved);
    return parsed ? { ...defaults, ...parsed } : defaults;
  } catch (err) { return defaults; }
}
function saveUpgrades() { localStorage.setItem(STORAGE_KEY_UPGRADES, JSON.stringify(upgrades)); }

function loadStats() {
  const saved = localStorage.getItem(STORAGE_KEY_STATS);
  const defaults = {
    totalRescued: 0, totalGoldEarned: 0, missionsCompleted: 0,
    noDamageWins: 0, fastWins: 0, highestUnlocked: unlockedLevel || 1,
    unlockedBadges: [],
  };
  try {
    const parsed = JSON.parse(saved);
    return parsed ? { ...defaults, ...parsed } : defaults;
  } catch (err) { return defaults; }
}
function saveStats() { localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(lifetimeStats)); }


/* ---------- 7. RANKS + BADGES ---------- */
function getRankForLevel(level) {
  let rank = RANKS[0];
  for (const r of RANKS) { if (level >= r.minLevel) rank = r; }
  return rank;
}

function refreshRankDisplays() {
  const rank = getRankForLevel(unlockedLevel);
  const text = `${rank.icon} ${rank.title}`;
  rankValueEl.textContent = text;
  startRankValueEl.textContent = text;
}

function checkForNewBadges() {
  let changed = false;
  BADGE_DEFS.forEach((badge) => {
    if (!lifetimeStats.unlockedBadges.includes(badge.key) && badge.test(lifetimeStats)) {
      lifetimeStats.unlockedBadges.push(badge.key);
      changed = true;
    }
  });
  if (changed) saveStats();
}


/* ---------- 8. NAVIGATION BETWEEN SCREENS ---------- */
function hideAllScreens() {
  startScreen.hidden = true;
  levelSelectScreen.hidden = true;
  shopScreen.hidden = true;
  profileScreen.hidden = true;
  gameBoardWrapper.hidden = true;
  winScreen.hidden = true;
  gameOverScreen.hidden = true;
  revivePopupEl.hidden = true;
  missionIntroPopup.hidden = true;
  countdownPopup.hidden = true;
}

startButton.addEventListener('click', showLevelSelect);
backToStartButton.addEventListener('click', () => { hideAllScreens(); startScreen.hidden = false; });
backToStartButtonShop.addEventListener('click', () => { hideAllScreens(); startScreen.hidden = false; });
backToStartButtonProfile.addEventListener('click', () => { hideAllScreens(); startScreen.hidden = false; });
levelSelectButtonWin.addEventListener('click', showLevelSelect);
levelSelectButtonGameOver.addEventListener('click', showLevelSelect);
shopButtonStart.addEventListener('click', showShop);
profileButtonStart.addEventListener('click', showProfile);

function showLevelSelect() {
  buildLevelGrid();
  hideAllScreens();
  levelSelectScreen.hidden = false;
}

function buildLevelGrid() {
  levelsGridBeginner.innerHTML = '';
  levelsGridIntermediate.innerHTML = '';
  levelsGridExpert.innerHTML = '';

  for (let level = 1; level <= TOTAL_LEVELS; level++) {
    const meta = getMissionMeta(level);
    const button = document.createElement('button');
    button.classList.add('level-btn');

    const numberSpan = document.createElement('span');
    numberSpan.classList.add('level-num');
    numberSpan.textContent = level;
    button.appendChild(numberSpan);

    const icons = [];
    if (meta.mechanics.hunter) icons.push('🕵️');
    if (meta.mechanics.fireSpread) icons.push('🔥');
    if (meta.mechanics.nightVision) icons.push('🌙');
    if (meta.mechanics.movingCars) icons.push('🚗');
    if (meta.mechanics.instaFailHazards) icons.push('☠️');
    if (meta.mechanics.timeAttack) icons.push('⏱️');

    if (icons.length) {
      const iconSpan = document.createElement('span');
      iconSpan.classList.add('level-icons');
      iconSpan.textContent = icons.join('');
      button.appendChild(iconSpan);
    }

    button.title = `Mission ${level}: ${meta.name} — ${meta.briefing}`;

    if (level < unlockedLevel) button.classList.add('completed');
    else if (level > unlockedLevel) { button.classList.add('locked'); button.disabled = true; }

    button.addEventListener('click', () => { if (level <= unlockedLevel) beginMissionSequence(level); });

    if (level <= 15) levelsGridBeginner.appendChild(button);
    else if (level <= 35) levelsGridIntermediate.appendChild(button);
    else levelsGridExpert.appendChild(button);
  }
}


/* ---------- 9. SHOP ---------- */
function showShop() {
  buildShop();
  hideAllScreens();
  shopScreen.hidden = false;
}

function buildShop() {
  shopGoldValueEl.textContent = goldBank;
  shopUpgradesGrid.innerHTML = '';
  shopSkinsGrid.innerHTML = '';

  Object.entries(UPGRADE_DEFS).forEach(([key, def]) => {
    const currentLevelOwned = upgrades[key] || 0;
    const maxed = currentLevelOwned >= def.maxLevel;
    const cost = def.cost * (currentLevelOwned + 1);
    const canAfford = goldBank >= cost;

    const card = document.createElement('div');
    card.classList.add('shop-card');
    if (maxed) card.classList.add('owned');

    card.innerHTML = `
      <h4>${def.label}${def.maxLevel > 1 ? ` (${currentLevelOwned}/${def.maxLevel})` : ''}</h4>
      <p>${def.description}</p>
      <button class="game-button shop-buy-btn" ${maxed || !canAfford ? 'disabled' : ''}>
        ${maxed ? '✅ Maxed' : `Buy — ${cost}g`}
      </button>
    `;

    const buyBtn = card.querySelector('.shop-buy-btn');
    if (!maxed) buyBtn.addEventListener('click', () => purchaseUpgrade(key, def, cost));
    shopUpgradesGrid.appendChild(card);
  });

  Object.entries(SKIN_SETS).forEach(([key, skin]) => {
    const owned = upgrades.unlockedSkins.includes(key);
    const equipped = upgrades.skin === key;
    const canAfford = goldBank >= skin.cost;

    const card = document.createElement('div');
    card.classList.add('shop-card');
    if (equipped) card.classList.add('owned');

    let buttonHtml;
    if (equipped) buttonHtml = `<button class="game-button shop-buy-btn" disabled>✅ Equipped</button>`;
    else if (owned) buttonHtml = `<button class="game-button shop-buy-btn">Equip</button>`;
    else buttonHtml = `<button class="game-button shop-buy-btn" ${canAfford ? '' : 'disabled'}>Buy — ${skin.cost}g</button>`;

    card.innerHTML = `
      <h4>${skin.idle} ${skin.label}</h4>
      <p>Idle ${skin.idle} &middot; Walk ${skin.walk} &middot; Rescue ${skin.rescue} &middot; Victory ${skin.victory}</p>
      ${buttonHtml}
    `;

    const btn = card.querySelector('.shop-buy-btn');
    if (!equipped) btn.addEventListener('click', () => { if (owned) equipSkin(key); else purchaseSkin(key, skin); });
    shopSkinsGrid.appendChild(card);
  });
}

function purchaseUpgrade(key, def, cost) {
  if (goldBank < cost) return;
  goldBank -= cost;
  upgrades[key] = (upgrades[key] || 0) + 1;
  saveGoldBank(goldBank);
  saveUpgrades();
  playSound('upgrade');
  buildShop();
}

function purchaseSkin(key, skin) {
  if (goldBank < skin.cost) return;
  goldBank -= skin.cost;
  upgrades.unlockedSkins.push(key);
  upgrades.skin = key;
  saveGoldBank(goldBank);
  saveUpgrades();
  playSound('upgrade');
  buildShop();
}

function equipSkin(key) { upgrades.skin = key; saveUpgrades(); buildShop(); }
function currentSkin() { return SKIN_SETS[upgrades.skin] || SKIN_SETS.classic; }


/* ---------- 10. PROFILE (rank + badges) ---------- */
function showProfile() {
  buildProfile();
  hideAllScreens();
  profileScreen.hidden = false;
}

function buildProfile() {
  const rank = getRankForLevel(unlockedLevel);
  profileRankValueEl.textContent = `${rank.icon} ${rank.title}`;

  profileStatsEl.innerHTML = `
    <div class="profile-stat"><strong>${lifetimeStats.missionsCompleted}</strong>Missions Cleared</div>
    <div class="profile-stat"><strong>${lifetimeStats.totalRescued}</strong>Survivors Saved</div>
    <div class="profile-stat"><strong>${lifetimeStats.totalGoldEarned}</strong>Gold Earned</div>
  `;

  badgesGrid.innerHTML = '';
  BADGE_DEFS.forEach((badge) => {
    const earned = lifetimeStats.unlockedBadges.includes(badge.key);
    const card = document.createElement('div');
    card.classList.add('shop-card');
    if (!earned) card.classList.add('badge-locked');
    card.innerHTML = `<h4>${badge.icon} ${badge.label}</h4><p>${badge.description}</p><p style="color:${earned ? '#4dff88' : '#9fb3bd'};font-weight:700;">${earned ? '✅ Earned' : '🔒 Locked'}</p>`;
    badgesGrid.appendChild(card);
  });
}


/* ---------- 11. MISSION START SEQUENCE (intro card -> countdown -> go) ---------- */
function beginMissionSequence(level) {
  currentLevel = level;
  const config = getLevelConfig(level);
  currentConfig = config;

  introMissionTitleEl.textContent = `MISSION ${String(level).padStart(2, '0')}: ${config.name.toUpperCase()}`;
  introLocationValueEl.textContent = config.location;
  introObjectiveValueEl.textContent = `Rescue ${config.survivors} survivor${config.survivors === 1 ? '' : 's'}`;
  introTimeValueEl.textContent = `${config.time} seconds`;

  const dangerIcons = [];
  if (config.mechanics.fireSpread || config.fireHazards > 0) dangerIcons.push('🔥 Fire');
  if (config.mechanics.movingCars) dangerIcons.push('🚗 Traffic');
  if (config.mechanics.nightVision) dangerIcons.push('🌙 Low Visibility');
  if (config.mechanics.instaFailHazards) dangerIcons.push('☠️ Instant-Fail Zones');
  if (config.mechanics.hunter) dangerIcons.push('🕵️ Hunter');
  if (config.electricHazards > 0) dangerIcons.push('⚡ Electric');
  introDangerValueEl.textContent = dangerIcons.length ? dangerIcons.join(' · ') : 'Standard hazards only';

  introRewardValueEl.textContent = `~${config.rewardEstimate} gold`;

  hideAllScreens();
  missionIntroPopup.hidden = false;
}

introStartButton.addEventListener('click', () => {
  missionIntroPopup.hidden = true;
  runCountdown(() => startGame(currentLevel));
});

function runCountdown(onComplete) {
  countdownPopup.hidden = false;
  const steps = ['3', '2', '1', 'GO!'];
  let i = 0;

  function showNext() {
    countdownNumberEl.textContent = steps[i];
    countdownNumberEl.style.animation = 'none';
    void countdownNumberEl.offsetWidth;
    countdownNumberEl.style.animation = '';
    playSound(i === steps.length - 1 ? 'go' : 'countdown');
    i++;
    if (i < steps.length) {
      setTimeout(showNext, 550);
    } else {
      setTimeout(() => {
        countdownPopup.hidden = true;
        onComplete();
      }, 500);
    }
  }
  showNext();
}


/* ---------- 12. PART 1: START A MISSION ---------- */
nextLevelButton.addEventListener('click', () => beginMissionSequence(currentLevel + 1));
retryLevelButton.addEventListener('click', () => beginMissionSequence(currentLevel));

function startGame(level) {
  currentLevel = level;
  const config = getLevelConfig(level);
  currentConfig = config;
  numSurvivorsNeeded = config.survivors;

  robotPos = { ...ROBOT_START };
  score = 0;
  maxHealth = STARTING_HEALTH + (upgrades.extraHeart || 0);
  health = maxHealth;
  shieldActive = !!upgrades.shieldCharm;
  fireShieldActive = !!upgrades.fireShield;
  tookDamageThisRun = false;
  timeLeft = config.time;
  rescuedCount = 0;
  sessionGold = 0;
  gameActive = true;
  reviveUsedThisMission = false;
  isRescuing = false;
  rescueTargetIndex = -1;

  clearBoardEntities();
  generateMap(config);

  levelValueEl.textContent = `${level} — ${config.name}`;
  updateScoreDisplay();
  updateHealthDisplay();
  updateTimerDisplay();
  updateSurvivorsDisplay();
  updateGoldDisplays();
  updateCarryBadge();
  placeRobotOnBoard();
  setRobotState('idle');
  hideRescuePrompt();
  hideRescueProgress();

  setupFog(config);
  renderMinimap();
  showMissionBriefing(level, config);

  hideAllScreens();
  gameBoardWrapper.hidden = false;

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(tickTimer, 1000);

  if (hazardInterval) clearInterval(hazardInterval);
  if (config.mechanics.movingCars || config.mechanics.hunter) {
    hazardInterval = setInterval(hazardTick, HAZARD_TICK_MS);
  }
}

function showMissionBriefing(level, config) {
  missionBriefingTitleEl.textContent = `Mission ${level}: ${config.name}`;
  missionBriefingTextEl.textContent = config.briefing;
  missionBriefingEl.hidden = false;
  missionBriefingEl.classList.remove('fade-out');

  clearTimeout(showMissionBriefing._timeout);
  showMissionBriefing._timeout = setTimeout(() => {
    missionBriefingEl.classList.add('fade-out');
    setTimeout(() => { missionBriefingEl.hidden = true; }, 450);
  }, 2600);
}


/* ---------- 13. PART 2: MOVE ROBOT (Keyboard + Mobile Buttons) ---------- */
document.addEventListener('keydown', (event) => {
  if (!gameActive || isRescuing) {
    if ((event.key === 'e' || event.key === 'E') && rescueTargetIndex !== -1 && !isRescuing) {
      startRescue();
    }
    return;
  }
  switch (event.key) {
    case 'w': case 'W': case 'ArrowUp': moveRobot(0, -1); break;
    case 's': case 'S': case 'ArrowDown': moveRobot(0, 1); break;
    case 'a': case 'A': case 'ArrowLeft': moveRobot(-1, 0); break;
    case 'd': case 'D': case 'ArrowRight': moveRobot(1, 0); break;
    case 'e': case 'E': if (rescueTargetIndex !== -1) startRescue(); break;
  }
});

btnUp.addEventListener('click', () => moveRobot(0, -1));
btnDown.addEventListener('click', () => moveRobot(0, 1));
btnLeft.addEventListener('click', () => moveRobot(-1, 0));
btnRight.addEventListener('click', () => moveRobot(1, 0));
rescueActionButton.addEventListener('click', () => startRescue());

function moveRobot(dx, dy) {
  if (!gameActive || isRescuing) return;
  const newX = robotPos.x + dx;
  const newY = robotPos.y + dy;
  if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) return;

  const blocked = obstacles.some((o) => o.x === newX && o.y === newY);
  if (blocked) return;

  robotPos.x = newX;
  robotPos.y = newY;
  placeRobotOnBoard();
  setRobotState('walk');
  updateFogPosition();
  renderMinimap();

  checkSurvivorAtFeet();
  checkHazardHit();
  checkCarCollision();
  checkHunterCollision();
  checkGoldPickup();
  applyCoinMagnet();
  checkSafeZoneReached();
}

function placeRobotOnBoard() {
  robotEl.style.left = robotPos.x * CELL_PERCENT + '%';
  robotEl.style.top = robotPos.y * CELL_PERCENT + '%';
}


/* ---------- 14. ROBOT ANIMATION STATES ---------- */
function setRobotState(state, duration = 350) {
  const skin = currentSkin();
  const emoji = skin[state] || skin.idle;
  robotFaceEl.textContent = emoji;

  robotEl.classList.remove('anim-idle', 'anim-walk', 'anim-rescue', 'anim-damage', 'anim-victory');
  robotEl.classList.add('anim-' + state);

  if (robotAnimTimeout) clearTimeout(robotAnimTimeout);

  if (state !== 'idle' && state !== 'victory') {
    robotAnimTimeout = setTimeout(() => {
      robotFaceEl.textContent = skin.idle;
      robotEl.classList.remove('anim-' + state);
      robotEl.classList.add('anim-idle');
    }, duration);
  }
}

function updateCarryBadge() {
  if (rescuedCount > 0) {
    robotCarryBadgeEl.hidden = false;
    robotCarryBadgeEl.textContent = `🧍×${rescuedCount}`;
  } else {
    robotCarryBadgeEl.hidden = true;
  }
}


/* ---------- 15. RESCUE MECHANIC: find -> approach -> [E] -> carry ---------- */
function checkSurvivorAtFeet() {
  const foundIndex = survivors.findIndex((s) => s.x === robotPos.x && s.y === robotPos.y);
  if (foundIndex !== -1 && !isRescuing) {
    rescueTargetIndex = foundIndex;
    showRescuePrompt();
    playSound('located');
  } else if (foundIndex === -1) {
    rescueTargetIndex = -1;
    hideRescuePrompt();
  }
}

function showRescuePrompt() {
  rescuePromptEl.hidden = false;
}
function hideRescuePrompt() {
  rescuePromptEl.hidden = true;
}

function startRescue() {
  if (isRescuing || rescueTargetIndex === -1 || !gameActive) return;
  const survivor = survivors[rescueTargetIndex];
  if (!survivor) return;

  isRescuing = true;
  hideRescuePrompt();
  rescueProgressEl.hidden = false;
  rescueProgressFillEl.style.width = '0%';

  const duration = upgrades.rescueTool ? Math.round(RESCUE_BASE_DURATION_MS * 0.55) : RESCUE_BASE_DURATION_MS;
  const startTime = performance.now();

  rescueIntervalId = setInterval(() => {
    const elapsed = performance.now() - startTime;
    const pct = Math.min(100, (elapsed / duration) * 100);
    rescueProgressFillEl.style.width = pct + '%';
  }, 50);

  rescueTimeoutId = setTimeout(() => completeRescue(rescueTargetIndex), duration);
}

function completeRescue(index) {
  clearInterval(rescueIntervalId);
  isRescuing = false;
  hideRescueProgress();

  const survivor = survivors[index];
  if (!survivor) return;

  spawnParticles(survivor.x, survivor.y, '✨', 6);
  survivor.el.remove();
  survivors.splice(index, 1);
  rescueTargetIndex = -1;

  score += 100;
  rescuedCount += 1;
  lifetimeStats.totalRescued += 1;
  saveStats();
  checkForNewBadges();

  setRobotState('rescue', 450);
  playSound('rescueComplete');
  updateScoreDisplay();
  updateSurvivorsDisplay();
  updateCarryBadge();
  renderMinimap();

  // Standing on another survivor's tile right after this one still works.
  checkSurvivorAtFeet();
}

function hideRescueProgress() {
  rescueProgressEl.hidden = true;
}


/* ---------- 16. ROBOT TOUCHES HAZARDS / ENEMIES ---------- */
function checkHazardHit() {
  const hazard = hazards.find((h) => h.x === robotPos.x && h.y === robotPos.y);
  if (!hazard) return;

  if (hazard.type === 'skull') {
    setRobotState('damage', 600);
    endGame(false, 'You hit a critical hazard. The mission ends instantly here.');
    return;
  }

  if (hazard.type === 'fire' && fireShieldActive) {
    fireShieldActive = false;
    spawnParticles(robotPos.x, robotPos.y, '🧯', 5);
    playSound('shield');
    shakeBoard();
    updateHealthDisplay();
    return;
  }

  triggerDamage();
}

function checkCarCollision() {
  const hit = movingObstacles.find((c) => c.x === robotPos.x && c.y === robotPos.y);
  if (hit) triggerDamage();
}

function checkHunterCollision() {
  const hit = hunters.find((h) => h.x === robotPos.x && h.y === robotPos.y);
  if (hit) triggerDamage();
}

function triggerDamage() {
  tookDamageThisRun = true;

  if (shieldActive) {
    shieldActive = false;
    setRobotState('damage', 250);
    spawnParticles(robotPos.x, robotPos.y, '🛡️', 5);
    playSound('shield');
    shakeBoard();
    return;
  }

  health -= 1;
  updateHealthDisplay();
  setRobotState('damage', 300);
  spawnParticles(robotPos.x, robotPos.y, '💢', 5);
  playSound('damage');
  shakeBoard();

  robotEl.classList.add('hit-flash');
  setTimeout(() => robotEl.classList.remove('hit-flash'), 300);

  if (health <= 0) {
    endGame(false, 'Your health reached zero out in the field.');
  }
}


/* ---------- 17. GOLD COLLECTION (this run only, banked on win) ---------- */
function checkGoldPickup() {
  const foundIndex = goldCoins.findIndex((g) => g.x === robotPos.x && g.y === robotPos.y);
  if (foundIndex === -1) return;
  collectGoldAt(foundIndex);
}

function collectGoldAt(index) {
  const coin = goldCoins[index];
  spawnParticles(coin.x, coin.y, '💰', 4);
  coin.el.remove();
  goldCoins.splice(index, 1);
  sessionGold += 1;
  playSound('coin');
  updateGoldDisplays();
  renderMinimap();
}

function applyCoinMagnet() {
  if (!upgrades.coinMagnet) return;
  for (let i = goldCoins.length - 1; i >= 0; i--) {
    const g = goldCoins[i];
    const dist = Math.max(Math.abs(g.x - robotPos.x), Math.abs(g.y - robotPos.y));
    if (dist <= 1 && dist > 0) collectGoldAt(i);
  }
}


/* ---------- 18. SAFE ZONE CHECK (win condition) ---------- */
function checkSafeZoneReached() {
  const onSafeZone = robotPos.x === SAFE_ZONE_POS.x && robotPos.y === SAFE_ZONE_POS.y;
  if (onSafeZone && rescuedCount === numSurvivorsNeeded) {
    endGame(true, 'All survivors rescued and returned home safely!');
  }
}


/* ---------- 19. TIMER COUNTDOWN + FIRE SPREAD + LOW-TIME WARNING ---------- */
function tickTimer() {
  timeLeft -= 1;
  updateTimerDisplay();

  if (timeLeft <= LOW_TIME_THRESHOLD && timeLeft > 0) {
    timerDisplayEl.classList.add('timer-warning');
    playSound('tick');
  } else {
    timerDisplayEl.classList.remove('timer-warning');
  }

  if (currentConfig && currentConfig.mechanics.fireSpread) fireSpreadTick();
  if (timeLeft <= 0) endGame(false, 'The mission clock hit zero before the job was done.', { reviveEligible: false });
}

function fireSpreadTick() {
  const fires = hazards.filter((h) => h.type === 'fire');
  const maxFires = Math.max(currentConfig.fireHazards * 3, 6);
  if (fires.length >= maxFires) return;

  fires.forEach((f) => {
    if (fires.length >= maxFires) return;
    if (Math.random() > 0.22) return;

    const neighbors = [
      { x: f.x + 1, y: f.y }, { x: f.x - 1, y: f.y },
      { x: f.x, y: f.y + 1 }, { x: f.x, y: f.y - 1 },
    ].filter((n) => n.x >= 0 && n.x < GRID_SIZE && n.y >= 0 && n.y < GRID_SIZE && isCellFree(n));

    if (neighbors.length) {
      const pos = neighbors[Math.floor(Math.random() * neighbors.length)];
      const el = createEntityElement(pos, '🔥', 'hazard-fire');
      const newFire = { ...pos, el, type: 'fire' };
      hazards.push(newFire);
      fires.push(newFire);
      if (robotPos.x === pos.x && robotPos.y === pos.y) checkHazardHit();
    }
  });
}

function isCellFree(pos) {
  if (robotPos.x === pos.x && robotPos.y === pos.y) return false;
  if (SAFE_ZONE_POS.x === pos.x && SAFE_ZONE_POS.y === pos.y) return false;
  if (obstacles.some((o) => o.x === pos.x && o.y === pos.y)) return false;
  if (survivors.some((s) => s.x === pos.x && s.y === pos.y)) return false;
  if (hazards.some((h) => h.x === pos.x && h.y === pos.y)) return false;
  if (goldCoins.some((g) => g.x === pos.x && g.y === pos.y)) return false;
  if (movingObstacles.some((c) => c.x === pos.x && c.y === pos.y)) return false;
  if (hunters.some((h) => h.x === pos.x && h.y === pos.y)) return false;
  return true;
}


/* ---------- 20. PATROLLING CARS + HUNTER ENEMY ---------- */
function hazardTick() {
  if (!gameActive) return;
  moveCars();
  moveHunters();
  renderMinimap();
}

function moveCars() {
  movingObstacles.forEach((car) => {
    let nextX = car.x + car.dir;
    if (nextX > car.maxX || nextX < car.minX) { car.dir *= -1; nextX = car.x + car.dir; }

    const blockedByWall = obstacles.some((o) => o.x === nextX && o.y === car.y);
    const blockedBySafeZone = SAFE_ZONE_POS.x === nextX && SAFE_ZONE_POS.y === car.y;
    if (blockedByWall || blockedBySafeZone) { car.dir *= -1; return; }

    car.x = nextX;
    car.el.style.left = car.x * CELL_PERCENT + '%';
  });
  checkCarCollision();
}

function moveHunters() {
  hunters.forEach((hunter) => {
    const dxRaw = robotPos.x - hunter.x;
    const dyRaw = robotPos.y - hunter.y;
    const stepX = Math.sign(dxRaw);
    const stepY = Math.sign(dyRaw);

    const tryMoves = Math.abs(dxRaw) >= Math.abs(dyRaw)
      ? [{ x: hunter.x + stepX, y: hunter.y }, { x: hunter.x, y: hunter.y + stepY }]
      : [{ x: hunter.x, y: hunter.y + stepY }, { x: hunter.x + stepX, y: hunter.y }];

    for (const next of tryMoves) {
      if (next.x === hunter.x && next.y === hunter.y) continue;
      if (next.x < 0 || next.x >= GRID_SIZE || next.y < 0 || next.y >= GRID_SIZE) continue;
      const blocked = obstacles.some((o) => o.x === next.x && o.y === next.y);
      if (blocked) continue;

      hunter.x = next.x;
      hunter.y = next.y;
      hunter.el.style.left = hunter.x * CELL_PERCENT + '%';
      hunter.el.style.top = hunter.y * CELL_PERCENT + '%';
      break;
    }
  });
  checkHunterCollision();
}


/* ---------- 21. FOG OF WAR (limited visibility) ---------- */
function setupFog(config) {
  if (config.mechanics.nightVision) {
    fogOverlay.style.display = 'block';
    updateFogPosition();
  } else {
    fogOverlay.style.display = 'none';
  }
}

function updateFogPosition() {
  if (!currentConfig || !currentConfig.mechanics.nightVision) return;
  const cx = (robotPos.x + 0.5) * CELL_PERCENT;
  const cy = (robotPos.y + 0.5) * CELL_PERCENT;
  const baseRadius = upgrades.visionBoost ? 18 : 13;
  const midRadius = baseRadius + 13;
  const outerRadius = baseRadius + 25;
  fogOverlay.style.background =
    `radial-gradient(circle at ${cx}% ${cy}%, transparent 0%, transparent ${baseRadius}%, rgba(3,8,16,0.65) ${midRadius}%, rgba(3,8,16,0.97) ${outerRadius}%)`;
}


/* ---------- 22. MINIMAP ---------- */
function renderMinimap() {
  minimapGrid.innerHTML = '';

  const addDot = (x, y, cls) => {
    const dot = document.createElement('div');
    dot.classList.add('minimap-dot', cls);
    dot.style.left = ((x + 0.5) * CELL_PERCENT) + '%';
    dot.style.top = ((y + 0.5) * CELL_PERCENT) + '%';
    minimapGrid.appendChild(dot);
  };

  survivors.forEach((s) => addDot(s.x, s.y, 'dot-survivor'));
  hazards.forEach((h) => addDot(h.x, h.y, 'dot-danger'));
  movingObstacles.forEach((c) => addDot(c.x, c.y, 'dot-danger'));
  hunters.forEach((h) => addDot(h.x, h.y, 'dot-danger'));
  goldCoins.forEach((g) => addDot(g.x, g.y, 'dot-gold'));
  addDot(robotPos.x, robotPos.y, 'dot-player');
}


/* ---------- 23. SCREEN SHAKE + PARTICLES ---------- */
function shakeBoard() {
  gameBoard.classList.remove('shake');
  void gameBoard.offsetWidth;
  gameBoard.classList.add('shake');
  setTimeout(() => gameBoard.classList.remove('shake'), 350);
}

function spawnParticles(cellX, cellY, emoji, count = 5) {
  const originLeft = (cellX + 0.5) * CELL_PERCENT;
  const originTop = (cellY + 0.5) * CELL_PERCENT;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    particle.textContent = emoji;
    particle.style.left = originLeft + '%';
    particle.style.top = originTop + '%';

    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6;
    const distance = 24 + Math.random() * 18;
    particle.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
    particle.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);

    gameBoard.appendChild(particle);
    setTimeout(() => particle.remove(), 650);
  }
}


/* ---------- 24. SOUND EFFECTS (Web Audio, no files needed) ---------- */
function getAudioCtx() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (err) { return null; }
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playTone(freq, startTime, duration, type = 'sine', volume = 0.15) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + startTime);
  osc.stop(ctx.currentTime + startTime + duration);
}

function playSound(name) {
  switch (name) {
    case 'coin': playTone(1050, 0, 0.08, 'square', 0.08); break;
    case 'damage': playTone(140, 0, 0.2, 'sawtooth', 0.18); break;
    case 'shield': playTone(500, 0, 0.1, 'sine'); playTone(700, 0.08, 0.1, 'sine'); break;
    case 'upgrade': playTone(700, 0, 0.08, 'square', 0.1); playTone(1000, 0.08, 0.12, 'square', 0.1); break;
    case 'located': playTone(880, 0, 0.1, 'triangle', 0.1); break;
    case 'rescueComplete': playTone(660, 0, 0.12, 'triangle'); playTone(880, 0.1, 0.15, 'triangle'); break;
    case 'tick': playTone(1000, 0, 0.06, 'square', 0.06); break;
    case 'countdown': playTone(440, 0, 0.15, 'square', 0.12); break;
    case 'go': playTone(880, 0, 0.25, 'square', 0.15); break;
    case 'unlock': playTone(600, 0, 0.1, 'triangle', 0.12); playTone(900, 0.1, 0.2, 'triangle', 0.12); break;
    case 'missionComplete':
      playTone(523, 0, 0.16, 'triangle', 0.16);
      playTone(659, 0.16, 0.16, 'triangle', 0.16);
      playTone(784, 0.32, 0.16, 'triangle', 0.16);
      playTone(1047, 0.48, 0.4, 'triangle', 0.18);
      break;
    case 'missionFailed':
      playTone(392, 0, 0.2, 'sawtooth', 0.16);
      playTone(330, 0.2, 0.2, 'sawtooth', 0.16);
      playTone(261, 0.4, 0.5, 'sawtooth', 0.18);
      break;
    default: break;
  }
}


/* ---------- 25. REVIVE: BUY HEALTH WITH GOLD ON FAILURE ---------- */
function getReviveCost() {
  return Math.round(80 + currentLevel * 3);
}

function showRevivePopup(reasonText) {
  pendingFailureReason = reasonText;
  const cost = getReviveCost();

  reviveReasonTextEl.textContent = reasonText;
  reviveCostValueEl.textContent = cost;
  reviveGoldAvailableEl.textContent = goldBank;
  reviveYesButton.disabled = goldBank < cost;

  revivePopupEl.hidden = false;
}

reviveYesButton.addEventListener('click', () => {
  const cost = getReviveCost();
  if (goldBank < cost) return;

  goldBank -= cost;
  saveGoldBank(goldBank);
  reviveUsedThisMission = true;

  health = maxHealth;
  updateHealthDisplay();
  updateGoldDisplays();

  revivePopupEl.hidden = true;
  gameActive = true;
  gameBoardWrapper.hidden = false;
  setRobotState('idle');
  playSound('shield');

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(tickTimer, 1000);

  if (hazardInterval) clearInterval(hazardInterval);
  if (currentConfig.mechanics.movingCars || currentConfig.mechanics.hunter) {
    hazardInterval = setInterval(hazardTick, HAZARD_TICK_MS);
  }
});

reviveNoButton.addEventListener('click', () => {
  revivePopupEl.hidden = true;
  finalizeMissionResult(false, pendingFailureReason);
});


/* ---------- 26. END OF MISSION HANDLING ---------- */
function endGame(didWin, reasonText, options = {}) {
  gameActive = false;
  clearInterval(timerInterval);
  clearInterval(hazardInterval);
  clearTimeout(rescueTimeoutId);
  clearInterval(rescueIntervalId);
  isRescuing = false;
  hideRescueProgress();
  hideRescuePrompt();
  gameBoardWrapper.hidden = true;

  const reviveEligible = options.reviveEligible !== false;

  if (!didWin && reviveEligible && !reviveUsedThisMission && goldBank >= getReviveCost()) {
    showRevivePopup(reasonText);
    return;
  }

  finalizeMissionResult(didWin, reasonText);
}

function finalizeMissionResult(didWin, reasonText) {
  const missionLabel = currentConfig ? currentConfig.name : '';

  if (didWin) {
    setRobotState('victory');
    playSound('missionComplete');

    const wasHighestUnlock = currentLevel === unlockedLevel && currentLevel < TOTAL_LEVELS;
    if (wasHighestUnlock) {
      unlockedLevel = currentLevel + 1;
      saveUnlockedLevel(unlockedLevel);
    }

    let goldMessage;
    const alreadyClaimed = goldClaimedMissions.includes(currentLevel);
    let goldEarnedThisRun = 0;

    if (!alreadyClaimed) {
      goldEarnedThisRun = sessionGold * GOLD_PER_COIN;
      goldBank += goldEarnedThisRun;
      saveGoldBank(goldBank);
      goldClaimedMissions.push(currentLevel);
      saveGoldClaimedMissions(goldClaimedMissions);
      goldMessage = sessionGold > 0 ? `You banked ${goldEarnedThisRun} gold on this run!` : 'No gold was collected on this run.';
    } else {
      goldMessage = "This mission's gold was already claimed on an earlier run.";
    }

    updateGoldDisplays();

    // Lifetime stats + badges
    lifetimeStats.missionsCompleted += 1;
    lifetimeStats.totalGoldEarned += goldEarnedThisRun;
    lifetimeStats.highestUnlocked = Math.max(lifetimeStats.highestUnlocked, unlockedLevel);
    if (!tookDamageThisRun) lifetimeStats.noDamageWins += 1;
    if (timeLeft >= 20) lifetimeStats.fastWins += 1;
    saveStats();
    checkForNewBadges();
    refreshRankDisplays();
    if (wasHighestUnlock) playSound('unlock');

    const nextLine = currentLevel < TOTAL_LEVELS
      ? `Mission ${currentLevel + 1} is now unlocked.`
      : "You've cleared every mission Optimus The Rescuier has! 🏆";

    winDebriefTextEl.textContent =
      `Mission ${currentLevel}: ${missionLabel} — complete. You rescued all ` +
      `${numSurvivorsNeeded} survivor(s) and reached the safe zone. ${goldMessage} ${nextLine}`;

    winScoreEl.textContent = score;
    winGoldEl.textContent = alreadyClaimed ? 0 : goldEarnedThisRun;
    nextLevelButton.hidden = currentLevel >= TOTAL_LEVELS;

    winScreen.hidden = false;
  } else {
    setRobotState('damage', 800);
    playSound('missionFailed');
    sessionGold = 0;

    gameOverDebriefTextEl.textContent =
      `Mission ${currentLevel}: ${missionLabel} — failed. ${reasonText} ` +
      `No gold was recovered this attempt — retry to complete the mission and bank it.`;
    gameOverScoreEl.textContent = score;

    gameOverScreen.hidden = false;
  }
}


/* ---------- 27. MAP GENERATION (difficulty + mechanic aware) ---------- */
function generateMap(config) {
  obstacles = [];
  survivors = [];
  hazards = [];
  goldCoins = [];
  movingObstacles = [];
  hunters = [];

  const occupied = [
    { x: ROBOT_START.x, y: ROBOT_START.y },
    { x: SAFE_ZONE_POS.x, y: SAFE_ZONE_POS.y },
  ];

  for (let i = 0; i < config.obstacles; i++) {
    const pos = randomEmptyCell(occupied);
    occupied.push(pos);
    obstacles.push(pos);
    createEntityElement(pos, '🧱', 'obstacle');
  }

  for (let i = 0; i < config.fireHazards; i++) {
    const pos = randomEmptyCell(occupied);
    occupied.push(pos);
    const el = createEntityElement(pos, '🔥', 'hazard-fire');
    hazards.push({ ...pos, el, type: 'fire' });
  }

  for (let i = 0; i < config.electricHazards; i++) {
    const pos = randomEmptyCell(occupied);
    occupied.push(pos);
    const el = createEntityElement(pos, '⚡', 'hazard-electric');
    hazards.push({ ...pos, el, type: 'electric' });
  }

  for (let i = 0; i < config.skulls; i++) {
    const pos = randomEmptyCell(occupied);
    occupied.push(pos);
    const el = createEntityElement(pos, '☠️', 'hazard-skull');
    hazards.push({ ...pos, el, type: 'skull' });
  }

  for (let i = 0; i < config.survivors; i++) {
    const pos = randomEmptyCell(occupied);
    occupied.push(pos);
    const el = createEntityElement(pos, '🧍', 'survivor');
    survivors.push({ ...pos, el });
  }

  for (let i = 0; i < config.cars; i++) spawnCar(occupied);
  for (let i = 0; i < config.huntersCount; i++) spawnHunter(occupied);

  const alreadyClaimed = goldClaimedMissions.includes(currentLevel);
  goldAvailableThisRun = alreadyClaimed ? 0 : config.goldCount;

  if (!alreadyClaimed) {
    for (let i = 0; i < config.goldCount; i++) {
      const pos = randomEmptyCell(occupied);
      occupied.push(pos);
      const el = createEntityElement(pos, '🪙', 'gold-coin');
      goldCoins.push({ ...pos, el });
    }
  }

  createEntityElement(SAFE_ZONE_POS, '🏠', 'safe-zone');
}

function spawnCar(occupied) {
  const y = Math.floor(Math.random() * GRID_SIZE);
  const range = 3 + Math.floor(Math.random() * 4);
  const minX = Math.floor(Math.random() * Math.max(1, GRID_SIZE - range));
  const maxX = Math.min(GRID_SIZE - 1, minX + range);
  const x = minX + Math.floor(Math.random() * (maxX - minX + 1));

  const el = createEntityElement({ x, y }, '🚗', 'hazard-car');
  movingObstacles.push({ x, y, el, minX, maxX, dir: Math.random() < 0.5 ? 1 : -1 });
  occupied.push({ x, y });
}

function spawnHunter(occupied) {
  let pos;
  let attempts = 0;
  do {
    pos = randomEmptyCell(occupied);
    attempts++;
  } while (attempts < 30 && (Math.abs(pos.x - ROBOT_START.x) + Math.abs(pos.y - ROBOT_START.y)) < 5);

  occupied.push(pos);
  const el = createEntityElement(pos, '🕵️', 'hazard-hunter');
  hunters.push({ ...pos, el });
}

function randomEmptyCell(occupiedList) {
  let pos;
  let attempts = 0;
  do {
    pos = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
    attempts++;
  } while (occupiedList.some((o) => o.x === pos.x && o.y === pos.y) && attempts < 500);
  return pos;
}

function createEntityElement(pos, emoji, className) {
  const el = document.createElement('div');
  el.classList.add(className);
  el.textContent = emoji;
  el.style.left = pos.x * CELL_PERCENT + '%';
  el.style.top = pos.y * CELL_PERCENT + '%';
  el.style.width = CELL_PERCENT + '%';
  el.style.height = CELL_PERCENT + '%';
  gameBoard.appendChild(el);
  return el;
}

function clearBoardEntities() {
  [...gameBoard.children].forEach((child) => {
    if (child !== robotEl && child !== fogOverlay) child.remove();
  });
}


/* ---------- 28. HUD UPDATE HELPERS ---------- */
function updateScoreDisplay() { scoreValueEl.textContent = score; }
function updateTimerDisplay() { timerValueEl.textContent = timeLeft; }
function updateHealthDisplay() {
  healthValueEl.textContent = '❤️'.repeat(Math.max(health, 0)) + (shieldActive ? ' 🛡️' : '') + (fireShieldActive ? ' 🧯' : '');
}
function updateSurvivorsDisplay() { survivorsValueEl.textContent = `${rescuedCount} / ${numSurvivorsNeeded}`; }
function updateGoldDisplays() {
  goldBankValueEl.textContent = goldBank;
  goldRunValueEl.textContent = goldAvailableThisRun === 0 ? 'Claimed' : `${sessionGold}/${goldAvailableThisRun}`;
}


/* ---------- 29. INITIAL PAGE STATE ---------- */
refreshRankDisplays();