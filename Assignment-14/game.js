/* ==========================================================================
   1. WEB AUDIO API SYNTHESIZER (ZERO EXTERNAL AUDIO ASSETS)
   ========================================================================== */
class AudioEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported', e);
        }
    }

    ensureContext() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playShoot() {
        if (this.muted || !this.initialized) return;
        this.ensureContext();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    playEnemyShoot() {
        if (this.muted || !this.initialized) return;
        this.ensureContext();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    playExplosion(scale = 1) {
        if (this.muted || !this.initialized) return;
        this.ensureContext();
        const now = this.ctx.currentTime;

        // White noise generator
        const bufferSize = this.ctx.sampleRate * Math.min(0.5, 0.2 * scale);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800 * scale, now);
        filter.frequency.exponentialRampToValueAtTime(50, now + 0.3 * scale);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3 * Math.min(scale, 2), now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3 * scale);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
    }

    playHit() {
        if (this.muted || !this.initialized) return;
        this.ensureContext();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.05);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    playPowerup() {
        if (this.muted || !this.initialized) return;
        this.ensureContext();
        const now = this.ctx.currentTime;
        const notes = [300, 450, 600, 900];

        notes.forEach((freq, index) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + index * 0.05;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.15, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.08);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.08);
        });
    }

    playNuke() {
        if (this.muted || !this.initialized) return;
        this.ensureContext();
        const now = this.ctx.currentTime;

        // Sub bass rumble + sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 1.2);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 1.2);

        this.playExplosion(3);
    }

    playBossSiren() {
        if (this.muted || !this.initialized) return;
        this.ensureContext();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(500, now + 0.3);
        osc.frequency.linearRampToValueAtTime(200, now + 0.6);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.6);
    }
}

const audio = new AudioEngine();

/* ==========================================================================
   2. CANVAS SETUP & GAME ENGINE CORE VARIABLES
   ========================================================================== */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    if (player) {
        player.x = Math.min(player.x, width - 20);
        player.y = Math.min(player.y, height - 20);
    }
});

// Input Management
const keys = {};
const mouse = { x: width / 2, y: height / 2, down: false };

window.addEventListener('keydown', (e) => {
    audio.init();
    keys[e.code] = true;
    if ((e.code === 'KeyP' || e.code === 'Escape') && gameState === 'PLAYING') {
        togglePause();
    }
    if (e.code === 'KeyE' && gameState === 'PLAYING') {
        triggerNuke();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('mousedown', (e) => {
    audio.init();
    if (e.button === 0) mouse.down = true;
    if (e.button === 2 && gameState === 'PLAYING') {
        e.preventDefault();
        triggerNuke();
    }
});

window.addEventListener('mouseup', (e) => {
    if (e.button === 0) mouse.down = false;
});

window.addEventListener('contextmenu', (e) => e.preventDefault());

/* ==========================================================================
   3. GAME STATE & PERSISTENCE
   ========================================================================== */
let gameState = 'MENU'; // 'MENU', 'PLAYING', 'PAUSED', 'GAMEOVER'
let score = 0;
let highScore = parseInt(localStorage.getItem('neon_strike_highscore')) || 0;
let wave = 1;
let kills = 0;
let shotsFired = 0;
let shotsHit = 0;
let nukesUsed = 0;
let combo = 0;
let comboTimer = 0;
let screenShake = 0;

// Camera Shake translate offset
let shakeX = 0;
let shakeY = 0;

/* ==========================================================================
   4. STARFIELD BACKGROUND & PARALLAX
   ========================================================================== */
class Star {
    constructor() {
        this.reset(true);
    }

    reset(randomY = false) {
        this.x = Math.random() * width;
        this.y = randomY ? Math.random() * height : -10;
        this.z = Math.random() * 3 + 1; // Speed multiplier & depth layer
        this.size = Math.random() * 1.5 + (this.z > 3 ? 1.5 : 0.5);
        this.color = ['#00f0ff', '#ff007f', '#ffffff', '#9d00ff'][Math.floor(Math.random() * 4)];
        this.alpha = Math.random() * 0.8 + 0.2;
    }

    update() {
        this.y += this.z * 1.2;
        if (this.y > height + 10) {
            this.reset(false);
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size * (this.z * 0.8));
        ctx.restore();
    }
}

const stars = Array.from({ length: 150 }, () => new Star());

/* ==========================================================================
   5. DYNAMIC PARTICLE SYSTEM
   ========================================================================== */
class Particle {
    constructor(x, y, vx, vy, color, size, life, glow = true) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.maxLife = life;
        this.life = life;
        this.glow = glow;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.96;
        this.vy *= 0.96;
        this.life--;
    }

    draw() {
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        if (this.glow) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
        }
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.1, this.size * (this.life / this.maxLife)), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

let particles = [];

function createExplosion(x, y, color = '#ff007f', count = 25, scale = 1) {
    audio.playExplosion(scale);
    addScreenShake(6 * scale);
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 6 + 2) * scale;
        particles.push(new Particle(
            x, y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            color,
            Math.random() * 4 + 2,
            Math.random() * 30 + 20
        ));
    }
}

function createThrusterSpark(x, y, angle) {
    const spread = angle + (Math.random() - 0.5) * 0.5;
    const speed = Math.random() * 3 + 2;
    particles.push(new Particle(
        x, y,
        -Math.cos(spread) * speed,
        -Math.sin(spread) * speed,
        Math.random() > 0.5 ? '#00f0ff' : '#9d00ff',
        Math.random() * 3 + 1,
        15,
        true
    ));
}

/* ==========================================================================
   6. PLAYER SHIP & WEAPONS
   ========================================================================== */
class Player {
    constructor() {
        this.x = width / 2;
        this.y = height * 0.8;
        this.radius = 18;
        this.speed = 6.5;
        this.health = 100;
        this.maxHealth = 100;
        this.shield = 100;
        this.maxShield = 100;
        this.shieldRegenTimer = 0;
        this.angle = -Math.PI / 2;
        this.shootCooldown = 0;
        this.nukes = 3;
        this.activePowerup = null;
        this.powerupTimer = 0;
        this.invulnerableTimer = 0;
    }

    reset() {
        this.x = width / 2;
        this.y = height * 0.8;
        this.health = 100;
        this.shield = 100;
        this.nukes = 3;
        this.activePowerup = null;
        this.powerupTimer = 0;
        this.invulnerableTimer = 60; // Brief grace period
    }

    update() {
        // Movement Handling
        let dx = 0;
        let dy = 0;
        if (keys['KeyW'] || keys['ArrowUp']) dy -= 1;
        if (keys['KeyS'] || keys['ArrowDown']) dy += 1;
        if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) dx += 1;

        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx *= 0.7071;
            dy *= 0.7071;
        }

        this.x += dx * this.speed;
        this.y += dy * this.speed;

        // Border Constraints
        this.x = Math.max(this.radius, Math.min(width - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(height - this.radius, this.y));

        // Aiming toward mouse cursor
        this.angle = Math.atan2(mouse.y - this.y, mouse.x - this.x);

        // Engine Thruster Particle Effects
        if (dx !== 0 || dy !== 0 || mouse.down) {
            createThrusterSpark(
                this.x - Math.cos(this.angle) * 15,
                this.y - Math.sin(this.angle) * 15,
                this.angle
            );
        }

        // Primary Shooting
        if (this.shootCooldown > 0) this.shootCooldown--;
        if ((mouse.down || keys['Space']) && this.shootCooldown <= 0) {
            this.shoot();
        }

        // Powerup Duration Timer
        if (this.powerupTimer > 0) {
            this.powerupTimer--;
            if (this.powerupTimer <= 0) {
                this.activePowerup = null;
                updatePowerupBadge();
            }
        }

        // Shield Regeneration Logic
        if (this.shieldRegenTimer > 0) {
            this.shieldRegenTimer--;
        } else if (this.shield < this.maxShield) {
            this.shield = Math.min(this.maxShield, this.shield + 0.2);
        }

        if (this.invulnerableTimer > 0) this.invulnerableTimer--;
    }

    shoot() {
        const fireRate = this.activePowerup === 'OVERCHARGE' ? 4 : 10;
        this.shootCooldown = fireRate;
        shotsFired++;

        audio.playShoot();

        if (this.activePowerup === 'TRIPLE_SHOT') {
            // 3-way spread lasers
            const spreadAngles = [-0.25, 0, 0.25];
            spreadAngles.forEach(offset => {
                lasers.push(new Laser(
                    this.x + Math.cos(this.angle) * 20,
                    this.y + Math.sin(this.angle) * 20,
                    this.angle + offset,
                    '#00f0ff',
                    16,
                    25
                ));
            });
        } else {
            // Standard / Overcharge single concentrated dual laser
            const offset = 8;
            const perpX = Math.cos(this.angle + Math.PI / 2) * offset;
            const perpY = Math.sin(this.angle + Math.PI / 2) * offset;

            const laserColor = this.activePowerup === 'OVERCHARGE' ? '#ffe600' : '#00f0ff';
            const dmg = this.activePowerup === 'OVERCHARGE' ? 30 : 22;

            lasers.push(new Laser(this.x + perpX, this.y + perpY, this.angle, laserColor, 18, dmg));
            lasers.push(new Laser(this.x - perpX, this.y - perpY, this.angle, laserColor, 18, dmg));
        }
    }

    takeDamage(amount) {
        if (this.invulnerableTimer > 0) return;

        audio.playHit();
        addScreenShake(8);
        this.shieldRegenTimer = 180; // Delay shield regen 3 sec

        if (this.shield > 0) {
            this.shield -= amount;
            if (this.shield < 0) {
                this.health += this.shield; // Overflow to hull
                this.shield = 0;
            }
        } else {
            this.health -= amount;
        }

        if (this.health <= 0) {
            this.health = 0;
            createExplosion(this.x, this.y, '#ff007f', 50, 2);
            triggerGameOver();
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Invulnerability flicker
        if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 50) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // Glowing Shield Field Outer Ring
        if (this.shield > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 6, 0, Math.PI * 2);
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#00f0ff';
            ctx.globalAlpha = (this.shield / this.maxShield) * 0.7;
            ctx.stroke();
            ctx.restore();
        }

        // Cyber Stealth Fighter Ship Geometry
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.activePowerup ? '#ffe600' : '#00f0ff';
        ctx.fillStyle = '#0a051d';
        ctx.strokeStyle = this.activePowerup ? '#ffe600' : '#00f0ff';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(22, 0);
        ctx.lineTo(-14, -16);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-14, 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cockpit Core
        ctx.fillStyle = '#ff007f';
        ctx.beginPath();
        ctx.arc(2, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

let player = new Player();

/* ==========================================================================
   7. LASER PROJECTILES & EMP SHOCKWAVES
   ========================================================================== */
class Laser {
    constructor(x, y, angle, color = '#00f0ff', speed = 16, damage = 20, isEnemy = false) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.color = color;
        this.damage = damage;
        this.isEnemy = isEnemy;
        this.radius = isEnemy ? 4 : 3;
        this.active = true;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < -20 || this.x > width + 20 || this.y < -20 || this.y > height + 20) {
            this.active = false;
        }
    }

    draw() {
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.isEnemy ? 3 : 2.5;

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 1.5, this.y - this.vy * 1.5);
        ctx.stroke();
        ctx.restore();
    }
}

let lasers = [];

class Shockwave {
    constructor(x, y, maxRadius = width, color = '#00f0ff') {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.maxRadius = maxRadius;
        this.color = color;
        this.active = true;
    }

    update() {
        this.radius += 25;
        if (this.radius > this.maxRadius) {
            this.active = false;
        }
    }

    draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 6 * (1 - this.radius / this.maxRadius);
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.stroke();
        ctx.restore();
    }
}

let shockwaves = [];

function triggerNuke() {
    if (player.nukes > 0 && gameState === 'PLAYING') {
        player.nukes--;
        nukesUsed++;
        audio.playNuke();
        addScreenShake(20);
        shockwaves.push(new Shockwave(player.x, player.y, Math.max(width, height) * 1.2, '#ff007f'));

        // Clear all enemy projectiles
        lasers = lasers.filter(l => !l.isEnemy);

        // Heavy damage to all active enemies
        enemies.forEach(enemy => {
            enemy.takeDamage(250);
        });

        updateNukeHUD();
    }
}

/* ==========================================================================
   8. POWER-UP ITEM SYSTEM
   ========================================================================== */
const POWERUP_TYPES = {
    TRIPLE_SHOT: { name: 'TRIPLE CANNON', color: '#00f0ff', label: '3x' },
    OVERCHARGE: { name: 'OVERCHARGE', color: '#ffe600', label: '⚡' },
    SHIELD_BOOST: { name: 'SHIELD RECHARGE', color: '#0088ff', label: '🛡' },
    REPAIR_KIT: { name: 'HULL REPAIR', color: '#00ff66', label: '🔧' },
    NUKE: { name: 'EMP BOMB', color: '#ff6600', label: '💣' }
};

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.info = POWERUP_TYPES[type];
        this.radius = 14;
        this.vy = 1.2;
        this.floatOffset = Math.random() * Math.PI * 2;
        this.active = true;
    }

    update() {
        this.y += this.vy;
        this.floatOffset += 0.05;
        this.x += Math.sin(this.floatOffset) * 0.8;

        // Magnet effect towards player if close
        const dist = Math.hypot(player.x - this.x, player.y - this.y);
        if (dist < 120) {
            this.x += (player.x - this.x) * 0.08;
            this.y += (player.y - this.y) * 0.08;
        }

        if (dist < player.radius + this.radius) {
            this.collect();
        }

        if (this.y > height + 30) this.active = false;
    }

    collect() {
        this.active = false;
        audio.playPowerup();
        addScore(150);

        if (this.type === 'SHIELD_BOOST') {
            player.shield = player.maxShield;
        } else if (this.type === 'REPAIR_KIT') {
            player.health = Math.min(player.maxHealth, player.health + 40);
        } else if (this.type === 'NUKE') {
            player.nukes = Math.min(5, player.nukes + 1);
            updateNukeHUD();
        } else {
            player.activePowerup = this.type;
            player.powerupTimer = 450; // ~7.5 seconds
            updatePowerupBadge();
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.info.color;

        ctx.strokeStyle = this.info.color;
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(10, 5, 25, 0.8)';

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = this.info.color;
        ctx.font = '12px Orbitron';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.info.label, 0, 1);

        ctx.restore();
    }
}

let powerups = [];

/* ==========================================================================
   9. ENEMY AI VARIETIES & BOSS ENCOUNTERS
   ========================================================================== */
class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'DRONE', 'INTERCEPTOR', 'HEAVY', 'BOSS'
        this.active = true;
        this.angle = Math.PI / 2;
        this.shootTimer = Math.random() * 60;

        this.initStats();
    }

    initStats() {
        if (this.type === 'DRONE') {
            this.hp = 25;
            this.maxHp = 25;
            this.scoreVal = 100;
            this.radius = 16;
            this.speed = 3.2 + Math.random();
            this.color = '#00ff66';
        } else if (this.type === 'INTERCEPTOR') {
            this.hp = 65;
            this.maxHp = 65;
            this.scoreVal = 250;
            this.radius = 20;
            this.speed = 2.4;
            this.color = '#9d00ff';
            this.sineOffset = Math.random() * Math.PI * 2;
        } else if (this.type === 'HEAVY') {
            this.hp = 200;
            this.maxHp = 200;
            this.scoreVal = 600;
            this.radius = 32;
            this.speed = 1.0;
            this.color = '#ff6600';
        } else if (this.type === 'BOSS') {
            this.hp = 2000 + wave * 400;
            this.maxHp = this.hp;
            this.scoreVal = 5000;
            this.radius = 65;
            this.speed = 1.2;
            this.color = '#ff007f';
            this.phase = 1;
            this.targetX = width / 2;
            this.targetY = 150;
            audio.playBossSiren();
            showBossHUD(true);
        }
    }

    update() {
        if (this.type === 'DRONE') {
            // Straight / Chaser trajectory
            this.y += this.speed;
            this.angle = Math.PI / 2;
        } else if (this.type === 'INTERCEPTOR') {
            this.y += this.speed;
            this.sineOffset += 0.04;
            this.x += Math.sin(this.sineOffset) * 2.5;

            // Periodic Aimed Shot
            this.shootTimer++;
            if (this.shootTimer > 80) {
                this.shootTimer = 0;
                const aimAngle = Math.atan2(player.y - this.y, player.x - this.x);
                lasers.push(new Laser(this.x, this.y, aimAngle, '#ff007f', 9, 15, true));
                audio.playEnemyShoot();
            }
        } else if (this.type === 'HEAVY') {
            this.y += this.speed;

            // 3-Way Laser Barrage
            this.shootTimer++;
            if (this.shootTimer > 100) {
                this.shootTimer = 0;
                const baseAngle = Math.atan2(player.y - this.y, player.x - this.x);
                [-0.2, 0, 0.2].forEach(offset => {
                    lasers.push(new Laser(this.x, this.y, baseAngle + offset, '#ff6600', 8, 20, true));
                });
                audio.playEnemyShoot();
            }
        } else if (this.type === 'BOSS') {
            // Boss Movement logic
            if (Math.hypot(this.targetX - this.x, this.targetY - this.y) < 10) {
                this.targetX = Math.random() * (width - 200) + 100;
                this.targetY = Math.random() * 150 + 80;
            }
            this.x += (this.targetX - this.x) * 0.02;
            this.y += (this.targetY - this.y) * 0.02;

            // Phase Shift check
            if (this.hp < this.maxHp * 0.5 && this.phase === 1) {
                this.phase = 2;
                addScreenShake(15);
                audio.playBossSiren();
            }

            // Boss Phase Attacks
            this.shootTimer++;
            if (this.phase === 1 && this.shootTimer > 60) {
                this.shootTimer = 0;
                // Radial Bullet Ring
                const count = 12;
                for (let i = 0; i < count; i++) {
                    const a = (Math.PI * 2 / count) * i;
                    lasers.push(new Laser(this.x, this.y, a, '#ff007f', 6, 15, true));
                }
                audio.playEnemyShoot();
            } else if (this.phase === 2 && this.shootTimer > 40) {
                this.shootTimer = 0;
                // Rapid Double Laser + Spiral
                const a = Math.atan2(player.y - this.y, player.x - this.x);
                lasers.push(new Laser(this.x - 20, this.y, a, '#00f0ff', 10, 18, true));
                lasers.push(new Laser(this.x + 20, this.y, a, '#00f0ff', 10, 18, true));

                // Spawn Drone minion occasionally
                if (Math.random() < 0.3) {
                    enemies.push(new Enemy(this.x, this.y, 'DRONE'));
                }
                audio.playEnemyShoot();
            }

            updateBossHUD(this.hp, this.maxHp, this.phase);
        }

        // Check out of bounds for non-bosses
        if (this.type !== 'BOSS' && this.y > height + 50) {
            this.active = false;
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        audio.playHit();

        if (this.hp <= 0) {
            this.active = false;
            kills++;
            addScore(this.scoreVal);
            incrementCombo();

            createExplosion(this.x, this.y, this.color, this.type === 'BOSS' ? 80 : 25, this.type === 'BOSS' ? 3 : 1);

            // Chance to drop powerup
            const dropChance = this.type === 'BOSS' ? 1.0 : 0.22;
            if (Math.random() < dropChance) {
                const keys = Object.keys(POWERUP_TYPES);
                const pType = keys[Math.floor(Math.random() * keys.length)];
                powerups.push(new PowerUp(this.x, this.y, pType));
            }

            if (this.type === 'BOSS') {
                showBossHUD(false);
            }
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.fillStyle = '#0a051d';

        if (this.type === 'DRONE') {
            // Diamond Hunter Drone
            ctx.beginPath();
            ctx.moveTo(0, 16);
            ctx.lineTo(-12, 0);
            ctx.lineTo(0, -16);
            ctx.lineTo(12, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (this.type === 'INTERCEPTOR') {
            // Winged Stealth Interceptor
            ctx.beginPath();
            ctx.moveTo(0, 20);
            ctx.lineTo(-18, -12);
            ctx.lineTo(0, -4);
            ctx.lineTo(18, -12);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (this.type === 'HEAVY') {
            // Armored Dreadnought
            ctx.beginPath();
            ctx.moveTo(0, 30);
            ctx.lineTo(-28, 10);
            ctx.lineTo(-20, -25);
            ctx.lineTo(20, -25);
            ctx.lineTo(28, 10);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (this.type === 'BOSS') {
            // Giant Cyber Titan Megastructure
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Outer Orbiting Energy Ring
            ctx.rotate(Date.now() * 0.002);
            ctx.strokeStyle = this.phase === 2 ? '#ff007f' : '#00f0ff';
            ctx.strokeRect(-this.radius - 10, -this.radius - 10, (this.radius + 10) * 2, (this.radius + 10) * 2);
        }

        ctx.restore();
    }
}

let enemies = [];

/* ==========================================================================
   10. WAVE MANAGEMENT & DIFFICULTY SCALING
   ========================================================================== */
let waveEnemiesToSpawn = [];
let spawnTimer = 0;

function startNextWave() {
    waveEnemiesToSpawn = [];
    const count = 6 + wave * 4;

    if (wave % 5 === 0) {
        // Boss Wave Milestone!
        waveEnemiesToSpawn.push('BOSS');
    } else {
        for (let i = 0; i < count; i++) {
            const rand = Math.random();
            if (rand < 0.5) waveEnemiesToSpawn.push('DRONE');
            else if (rand < 0.8) waveEnemiesToSpawn.push('INTERCEPTOR');
            else waveEnemiesToSpawn.push('HEAVY');
        }
    }

    document.getElementById('hudWaveNum').innerText = wave < 10 ? `0${wave}` : wave;
}

function updateWaveSystem() {
    if (waveEnemiesToSpawn.length > 0) {
        spawnTimer++;
        if (spawnTimer > 45) { // Spawn interval
            spawnTimer = 0;
            const type = waveEnemiesToSpawn.shift();
            const spawnX = Math.random() * (width - 100) + 50;
            enemies.push(new Enemy(spawnX, -50, type));
        }
    } else if (enemies.length === 0 && gameState === 'PLAYING') {
        // Wave Clear!
        wave++;
        addScore(500 * wave);
        startNextWave();
    }
}

/* ==========================================================================
   11. COLLISION DETECTION & SCORE LOGIC
   ========================================================================== */
function checkCollisions() {
    // Player Lasers vs Enemies
    lasers.forEach(laser => {
        if (laser.isEnemy || !laser.active) return;

        enemies.forEach(enemy => {
            if (!enemy.active) return;
            const dist = Math.hypot(laser.x - enemy.x, laser.y - enemy.y);
            if (dist < enemy.radius + laser.radius) {
                laser.active = false;
                shotsHit++;
                enemy.takeDamage(laser.damage);
                particles.push(new Particle(laser.x, laser.y, 0, 0, laser.color, 3, 10));
            }
        });
    });

    // Enemy Lasers vs Player
    lasers.forEach(laser => {
        if (!laser.isEnemy || !laser.active) return;

        const dist = Math.hypot(laser.x - player.x, laser.y - player.y);
        if (dist < player.radius + laser.radius) {
            laser.active = false;
            player.takeDamage(laser.damage);
        }
    });

    // Enemy Body vs Player Body
    enemies.forEach(enemy => {
        if (!enemy.active) return;
        const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
        if (dist < enemy.radius + player.radius) {
            player.takeDamage(35);
            if (enemy.type !== 'BOSS') {
                enemy.takeDamage(100);
            }
        }
    });
}

function addScore(pts) {
    const multiplier = combo > 1 ? combo : 1;
    score += pts * multiplier;
    document.getElementById('hudScore').innerText = score.toString().padStart(6, '0');
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('neon_strike_highscore', highScore);
        document.getElementById('hudHighScore').innerText = highScore;
    }
}

function incrementCombo() {
    combo++;
    comboTimer = 180; // Reset combo timer (3 sec)
    const comboEl = document.getElementById('hudComboContainer');
    document.getElementById('hudComboText').innerText = `${combo}x COMBO!`;
    comboEl.classList.remove('opacity-0');
}

function updateComboSystem() {
    if (comboTimer > 0) {
        comboTimer--;
        if (comboTimer <= 0) {
            combo = 0;
            document.getElementById('hudComboContainer').classList.add('opacity-0');
        }
    }
}

function addScreenShake(amount) {
    screenShake = Math.max(screenShake, amount);
}

function applyScreenShake() {
    if (screenShake > 0) {
        shakeX = (Math.random() - 0.5) * screenShake;
        shakeY = (Math.random() - 0.5) * screenShake;
        screenShake *= 0.9;
        if (screenShake < 0.5) screenShake = 0;
    } else {
        shakeX = 0;
        shakeY = 0;
    }
}

/* ==========================================================================
   12. HUD & UI MANAGEMENT
   ========================================================================== */
function updateHUD() {
    // Health & Shield Bars
    const shieldPct = Math.max(0, (player.shield / player.maxShield) * 100);
    const healthPct = Math.max(0, (player.health / player.maxHealth) * 100);

    document.getElementById('hudShieldBar').style.width = `${shieldPct}%`;
    document.getElementById('hudShieldText').innerText = `${Math.ceil(shieldPct)}%`;

    document.getElementById('hudHealthBar').style.width = `${healthPct}%`;
    document.getElementById('hudHealthText').innerText = `${Math.ceil(healthPct)}%`;
}

function updateNukeHUD() {
    const container = document.getElementById('hudNukeIcons');
    container.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const active = i < player.nukes;
        const icon = document.createElement('span');
        icon.className = `inline-block w-4 h-4 rounded-full border ${active ? 'bg-orange-500 border-yellow-300 shadow-[0_0_8px_#ff6600]' : 'bg-slate-800 border-slate-600'}`;
        container.appendChild(icon);
    }
}

function updatePowerupBadge() {
    const badge = document.getElementById('hudPowerupBadge');
    const nameEl = document.getElementById('hudPowerupName');
    if (player.activePowerup) {
        badge.classList.remove('hidden');
        nameEl.innerText = POWERUP_TYPES[player.activePowerup].name;
    } else {
        badge.classList.add('hidden');
    }
}

function showBossHUD(show) {
    const el = document.getElementById('hudBossContainer');
    if (show) el.classList.remove('hidden');
    else el.classList.add('hidden');
}

function updateBossHUD(hp, maxHp, phase) {
    const pct = Math.max(0, (hp / maxHp) * 100);
    document.getElementById('hudBossHealthBar').style.width = `${pct}%`;
    document.getElementById('hudBossHealthText').innerText = `${Math.ceil(pct)}%`;
    document.getElementById('hudBossName').innerText = `CYBER TITAN - PHASE ${phase}`;
}

/* ==========================================================================
   13. MAIN GAME LOOP & CONTROLLERS
   ========================================================================== */
function gameLoop() {
    // Apply Screen Shake Camera Transformation
    applyScreenShake();

    ctx.save();
    ctx.translate(shakeX, shakeY);

    // Clear Screen with deep cosmic trail backdrop
    ctx.fillStyle = '#030107';
    ctx.fillRect(-10, -10, width + 20, height + 20);

    // Draw Stars
    stars.forEach(star => {
        star.update();
        star.draw();
    });

    if (gameState === 'PLAYING' || gameState === 'PAUSED') {
        if (gameState === 'PLAYING') {
            // Update Game State & Entities
            player.update();

            lasers.forEach(laser => laser.update());
            lasers = lasers.filter(laser => laser.active);

            shockwaves.forEach(sw => sw.update());
            shockwaves = shockwaves.filter(sw => sw.active);

            powerups.forEach(p => p.update());
            powerups = powerups.filter(p => p.active);

            enemies.forEach(e => e.update());
            enemies = enemies.filter(e => e.active);

            particles.forEach(p => p.update());
            particles = particles.filter(p => p.life > 0);

            updateWaveSystem();
            checkCollisions();
            updateComboSystem();
            updateHUD();
        }

        // Render Entities
        shockwaves.forEach(sw => sw.draw());
        powerups.forEach(p => p.draw());
        lasers.forEach(laser => laser.draw());
        enemies.forEach(enemy => enemy.draw());
        player.draw();
        particles.forEach(p => p.draw());
    }

    ctx.restore();
    requestAnimationFrame(gameLoop);
}

/* ==========================================================================
   14. SCREEN TRANSITIONS & EVENT HANDLERS
   ========================================================================== */
function startGame() {
    audio.init();
    score = 0;
    wave = 1;
    kills = 0;
    shotsFired = 0;
    shotsHit = 0;
    nukesUsed = 0;
    combo = 0;

    lasers = [];
    enemies = [];
    powerups = [];
    particles = [];
    shockwaves = [];

    player.reset();
    startNextWave();
    updateNukeHUD();

    document.getElementById('hudScore').innerText = '000000';
    document.getElementById('hudHighScore').innerText = highScore;

    hideAllScreens();
    document.getElementById('hudOverlay').classList.remove('hidden');
    gameState = 'PLAYING';
}

function togglePause() {
    if (gameState === 'PLAYING') {
        gameState = 'PAUSED';
        document.getElementById('pauseScreen').classList.remove('hidden-screen');
    } else if (gameState === 'PAUSED') {
        gameState = 'PLAYING';
        document.getElementById('pauseScreen').classList.add('hidden-screen');
    }
}

function triggerGameOver() {
    gameState = 'GAMEOVER';
    document.getElementById('hudOverlay').classList.add('hidden');

    const accuracy = shotsFired > 0 ? Math.round((shotsHit / shotsFired) * 100) : 0;

    document.getElementById('goFinalScore').innerText = score;
    document.getElementById('goHighScore').innerText = highScore;
    document.getElementById('goWave').innerText = wave;
    document.getElementById('goKills').innerText = kills;
    document.getElementById('goAccuracy').innerText = `${accuracy}%`;
    document.getElementById('goNukes').innerText = nukesUsed;

    document.getElementById('gameOverScreen').classList.remove('hidden-screen');
}

function hideAllScreens() {
    document.getElementById('menuScreen').classList.add('hidden-screen');
    document.getElementById('helpModal').classList.add('hidden-screen');
    document.getElementById('scoresModal').classList.add('hidden-screen');
    document.getElementById('pauseScreen').classList.add('hidden-screen');
    document.getElementById('gameOverScreen').classList.add('hidden-screen');
}

function showMenu() {
    gameState = 'MENU';
    hideAllScreens();
    document.getElementById('hudOverlay').classList.add('hidden');
    document.getElementById('menuScreen').classList.remove('hidden-screen');
}

// UI Event Listeners
document.getElementById('btnStartGame').addEventListener('click', startGame);
document.getElementById('btnHowToPlay').addEventListener('click', () => {
    document.getElementById('helpModal').classList.remove('hidden-screen');
});
document.getElementById('btnCloseHelp').addEventListener('click', () => {
    document.getElementById('helpModal').classList.add('hidden-screen');
});
document.getElementById('btnHighScores').addEventListener('click', () => {
    const list = document.getElementById('highScoresList');
    list.innerHTML = `<div class="p-3 bg-slate-900/80 border border-cyan-400 text-cyan-300 font-orbitron font-bold text-lg">TOP RECORD: ${highScore} PTS</div>`;
    document.getElementById('scoresModal').classList.remove('hidden-screen');
});
document.getElementById('btnCloseScores').addEventListener('click', () => {
    document.getElementById('scoresModal').classList.add('hidden-screen');
});
document.getElementById('btnPauseGame').addEventListener('click', togglePause);
document.getElementById('btnResume').addEventListener('click', togglePause);
document.getElementById('btnRestart').addEventListener('click', startGame);
document.getElementById('btnQuitToMenu').addEventListener('click', showMenu);
document.getElementById('btnRestartGameOver').addEventListener('click', startGame);
document.getElementById('btnMenuGameOver').addEventListener('click', showMenu);

// Audio Mute Toggle Listener
document.getElementById('btnAudioToggle').addEventListener('click', () => {
    audio.init();
    audio.muted = !audio.muted;
    document.getElementById('audioIcon').innerText = audio.muted ? '🔇' : '🔊';
    document.getElementById('audioStatus').innerText = audio.muted ? 'MUTED' : 'SOUND ON';
});

// Initialize HighScore display on boot
document.getElementById('hudHighScore').innerText = highScore;

// Kickoff Game Engine
requestAnimationFrame(gameLoop);