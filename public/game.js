// =========================================================================
// NekoQuest - Aventura Felina: game.js
// =========================================================================

// --- CONFIGURACIÓN INICIAL ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const hud = document.getElementById('hud');
const weaponHud = document.getElementById('weapon-hud');
const facetHud = document.getElementById('facet-hud');

// --- GESTIÓN DE ESTADOS DEL JUEGO ---
let gameState = 'start'; // Posibles estados: 'start', 'characterSelect', 'story', 'playing', 'paused', 'win', 'gameOver', 'inventory', 'facetSelect'
const screens = {
    start: document.getElementById('start-screen'),
    characterSelect: document.getElementById('character-select-screen'),
    pause: document.getElementById('pause-screen'),
    win: document.getElementById('win-screen'),
    gameOver: document.getElementById('game-over-screen'),
    inventory: document.getElementById('inventory-screen'),
    facetSelect: document.getElementById('facet-select-screen'),
    story: document.getElementById('story-screen') // NUEVO: Pantalla de historia
};

function setGameState(newState) {
    gameState = newState;
    for (let key in screens) {
        screens[key].style.display = 'none';
    }
    if (screens[gameState]) {
        screens[gameState].style.display = 'flex';
    }
}

// --- GESTOR DE SONIDO (PLACEHOLDER) ---
const audioManager = {
    play: function(soundName) {
        console.log(`Reproduciendo sonido: ${soundName}`);
    }
};

// --- DEFINICIÓN DE FACETAS ---
const FACETS = {
    'default': { char: "😺", name: "Neko Normal", abilities: { doubleJump: false, breakBlocks: false }, description: "Equilibrado. Sin habilidades especiales." },
    'ninja': { char: "🥷", name: "Neko Ninja", abilities: { doubleJump: true, breakBlocks: false }, description: "Doble salto para alcanzar lugares altos." },
    'strong': { char: "💪", name: "Neko Fuerte", abilities: { doubleJump: false, breakBlocks: true }, description: "Golpea fuerte. Puede romper bloques." }
};

// --- NUEVO: CONTENIDO DE LAS HISTORIAS ---
const introStory = [
    { title: "El Ronroneo Perdido", text: "En un mundo de paz felina, Neko, un gato como cualquier otro, siente un vacío. ¡Ha perdido el preciado Pez Dorado de su abuela!" },
    { title: "El Secreto de las Facetas", text: "Dicen que el Pez Dorado se encuentra al final de un gran viaje, y que para superar los desafíos, Neko debe despertar las 'facetas' ocultas de su ser." },
    { title: "¡La Aventura Comienza!", text: "Con su corazón lleno de coraje y sus nueve vidas intactas, Neko se embarca en una búsqueda para recuperar el tesoro y descubrirse a sí mismo." }
];

const winStory = [
    { title: "¡Tesoro Recuperado!", text: "Después de innumerables saltos, enemigos derrotados y facetas dominadas, Neko finalmente encontró el Pez Dorado. ¡Misión cumplida!" },
    { title: "Nuevas Facetas", text: "Neko no solo recuperó el pez, sino que descubrió nuevas partes de sí mismo. Ya no es solo un gato, ¡es un verdadero NekoQuest!" },
    { title: "El Héroe Felino", text: "Con el Pez Dorado a salvo y nuevas habilidades, Neko regresó a casa, listo para nuevas aventuras... o una siesta muy merecida." }
];

let currentStoryPages = [];
let currentStoryPageIndex = 0;
let afterStoryGameState = ''; // A qué estado ir después de terminar la historia

function displayStoryPage(index) {
    document.getElementById('story-screen-title').innerText = currentStoryPages[index].title;
    document.getElementById('story-screen-text').innerText = currentStoryPages[index].text;
}

function startStory(storyPages, nextState) {
    currentStoryPages = storyPages;
    currentStoryPageIndex = 0;
    afterStoryGameState = nextState;
    displayStoryPage(currentStoryPageIndex);
    setGameState('story');
}

function advanceStory() {
    audioManager.play('menu_select');
    currentStoryPageIndex++;
    if (currentStoryPageIndex < currentStoryPages.length) {
        displayStoryPage(currentStoryPageIndex);
    } else {
        // Historia terminada, pasar al siguiente estado del juego
        if (afterStoryGameState === 'loadLevel') {
            loadLevel(); // Función especial para cargar el nivel
        } else {
            setGameState(afterStoryGameState);
        }
    }
}

// --- GENERADOR DE MAPAS POR LORE ---
function generateLoreMap() {
    const platforms = [];
    const collectibles = [];
    const enemies = [];
    const items = [];
    const breakablePlatforms = [];
    const facetOrbs = [];
    
    let currentX = 0;

    // --- LORE PARTE 1: El Patio Trasero ---
    platforms.push({ x: 0, y: 350, width: 400, height: 50 });
    collectibles.push({ x: 200, y: 320, radius: 10 });
    enemies.push({ x: 300, y: 320, patrolRange: 80 });
    items.push({ x: 350, y: 320, type: 'pickup', char: '🧶', itemId: 'yarn_ball', ammo: 5 });
    currentX = 450;

    // Bloque rompible inicial, y orbe fuerte para romperlo
    breakablePlatforms.push({ x: currentX + 50, y: 320, width: 60, height: 30, char: '🧱' });
    facetOrbs.push({ x: currentX - 50, y: 200, type: 'facet_orb', char: '✨', facetType: 'strong', charges: 2 });
    currentX += 150;

    // --- LORE PARTE 2: El Jardín Peligroso ---
    for (let i = 0; i < 10; i++) {
        const height = 250 + Math.random() * 80;
        const gap = 120 + Math.random() * 80;
        platforms.push({ x: currentX, y: height, width: 150, height: 20 });
        if (i % 2 === 0) {
            collectibles.push({ x: currentX + 75, y: height - 30, radius: 10 });
        }
        if (i === 3 || i === 7) {
            enemies.push({ x: currentX + 75, y: height - 30, patrolRange: 50 });
        }
        currentX += 150 + gap;
    }
    items.push({ x: currentX - 800, y: 200, type: 'pickup', char: '🧶', itemId: 'yarn_ball', ammo: 3 });

    // Plataformas altas para doble salto, y orbe ninja
    facetOrbs.push({ x: currentX - 200, y: 100, type: 'facet_orb', char: '✨', facetType: 'ninja', charges: 2 });
    platforms.push({ x: currentX, y: 200, width: 100, height: 20 });
    platforms.push({ x: currentX + 200, y: 100, width: 100, height: 20 });
    currentX += 350;

    // --- LORE PARTE 3: La Gran Valla ---
    platforms.push({ x: currentX - 100, y: 350, width: 200, height: 50 });
    for (let i = 0; i < 5; i++) {
        platforms.push({ x: currentX + (i * 80), y: 300 - (i * 50), width: 30, height: 150 });
    }
    currentX += 5 * 80 + 150;

    // --- LORE PARTE 4: El Estanque del Pez Dorado ---
    platforms.push({ x: currentX, y: 350, width: 600, height: 50 });
    collectibles.push({ x: currentX + 500, y: 320, radius: 15, isGoal: true, char: '🐠' });
    
    const levelWidth = currentX + 600;
    return { platforms, collectibles, enemies, items, breakablePlatforms, facetOrbs, levelWidth };
}

// --- ESTADO DEL JUEGO ---
let player = {
    x: 50, y: 250, width: 40, height: 40, dx: 0, dy: 0,
    baseChar: "😺", char: "😺",
    jumpPower: -12, gravity: 0.5, speed: 4, onGround: false,
    direction: 1,
    lives: 3, maxLives: 3, isInvincible: false, invincibleTimer: 0,
    canDash: true, isDashing: false, dashTimer: 0, dashCooldown: 0, dashSpeed: 12,
    inventory: [],
    equippedWeapon: null,
    facets: {
        'default': { ...FACETS.default, unlocked: true, charges: Infinity },
        'ninja': { ...FACETS.ninja, unlocked: false, charges: 0 },
        'strong': { ...FACETS.strong, unlocked: false, charges: 0 }
    },
    currentFacet: 'default',
    jumpsAvailable: 1
};
let keys = {};
let score = 0;
let currentLevel = { 
    platforms: [], collectibles: [], enemies: [], items: [], 
    breakablePlatforms: [], facetOrbs: [],
    width: 0 
};
let camera = { x: 0, deadZone: canvas.width / 3 };
let projectiles = [];

// --- INICIALIZACIÓN ---
function resetPlayer() {
    player.x = 100; player.y = 250; player.dx = 0; player.dy = 0;
    player.lives = player.maxLives;
    player.isInvincible = false;
    player.isDashing = false;
    player.canDash = true;
    player.inventory = [];
    player.equippedWeapon = null;
    projectiles = [];
    score = 0;
    camera.x = 0;

    player.facets = {
        'default': { ...FACETS.default, unlocked: true, charges: Infinity },
        'ninja': { ...FACETS.ninja, unlocked: false, charges: 0 },
        'strong': { ...FACETS.strong, unlocked: false, charges: 0 }
    };
    player.currentFacet = 'default';
    player.jumpsAvailable = 1;
    player.char = player.baseChar;
}

function loadLevel() {
    const levelData = generateLoreMap();
    currentLevel.platforms = levelData.platforms;
    currentLevel.collectibles = levelData.collectibles.map(c => ({...c, collected: false}));
    currentLevel.enemies = levelData.enemies.map(e => ({
        ...e, width: 30, height: 30, char: '🐞',
        startX: e.x - e.patrolRange, endX: e.x + e.patrolRange,
        speed: 1, isDefeated: false
    }));
    currentLevel.items = levelData.items.map(i => ({...i, collected: false}));
    currentLevel.breakablePlatforms = levelData.breakablePlatforms.map(p => ({...p, broken: false}));
    currentLevel.facetOrbs = levelData.facetOrbs.map(o => ({...o, collected: false}));
    currentLevel.width = levelData.levelWidth; // Asegura que el ancho del nivel se actualice
    resetPlayer();
    setGameState('playing');
}

// --- LÓGICA DE ACTUALIZACIÓN ---
function updatePlayer() {
    // Movimiento lateral
    if (!player.isDashing) {
        player.dx = 0;
        if (keys["ArrowRight"]) { player.dx = player.speed; player.direction = 1; }
        if (keys["ArrowLeft"]) { player.dx = -player.speed; player.direction = -1; }
    }
    player.x += player.dx;

    // Gravedad y Salto
    player.dy += player.gravity;
    player.y += player.dy;
    
    // Al caer en el suelo, resetear doble salto
    if (player.onGround) {
        player.jumpsAvailable = player.facets[player.currentFacet].abilities.doubleJump ? 2 : 1;
    }

    // Temporizadores de estado (invencibilidad, dash)
    if (player.isInvincible) {
        if (--player.invincibleTimer <= 0) player.isInvincible = false;
    }
    if (player.isDashing) {
        if (--player.dashTimer <= 0) player.isDashing = false;
    } else if (player.dashCooldown > 0) {
        if (--player.dashCooldown <= 0) player.canDash = true;
    }

    // "Animación" del personaje
    if (player.isInvincible && Math.floor(player.invincibleTimer / 6) % 2 === 0) {
        player.char = ' ';
    } else if (player.isDashing) {
        player.char = '💨';
    } else if (!player.onGround) {
        player.char = player.facets[player.currentFacet].char === '🥷' ? '🤸' : '😼';
    } else {
        player.char = player.facets[player.currentFacet].char;
    }
}

function updateEnemies() {
    for (const enemy of currentLevel.enemies) {
        if (enemy.isDefeated) continue;
        enemy.x += enemy.speed;
        if (enemy.x > enemy.endX || enemy.x < enemy.startX) {
            enemy.speed *= -1;
        }
    }
}

function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.x += p.dx;
        p.dy += p.gravity;
        p.y += p.dy;

        for(const enemy of currentLevel.enemies){
            if(!enemy.isDefeated && p.x < enemy.x + enemy.width && p.x + 10 > enemy.x && p.y < enemy.y + enemy.height && p.y + 10 > enemy.y) {
                enemy.isDefeated = true;
                projectiles.splice(i, 1);
                score += 5;
                audioManager.play('enemy_hit');
                continue;
            }
        }
        if (p.x < camera.x || p.x > camera.x + canvas.width || p.y > canvas.height + 50) {
            projectiles.splice(i, 1);
        }
    }
}

function checkCollisions() {
    player.onGround = false;
    // Plataformas normales
    for (let p of currentLevel.platforms) {
        if (player.x < p.x + p.width && player.x + player.width > p.x &&
            player.y < p.y + p.height && player.y + player.height > p.y) {
            if (player.dy > 0 && (player.y - player.dy) + player.height <= p.y) {
                player.y = p.y - player.height;
                player.dy = 0;
                player.onGround = true;
            } else if (player.dy < 0 && player.y <= p.y + p.height && (player.y + player.height > p.y)) {
                player.dy = 0.5;
            }
        }
    }
    // Plataformas rompibles
    for (const bPlat of currentLevel.breakablePlatforms) {
        if (bPlat.broken) continue;
        if (player.x < bPlat.x + bPlat.width && player.x + player.width > bPlat.x &&
            player.y < bPlat.y + bPlat.height && player.y + player.height > bPlat.y) {
            if (player.dy > 0 && (player.y - player.dy) + player.height <= bPlat.y) {
                player.y = bPlat.y - bPlat.height;
                player.dy = 0;
                player.onGround = true;
                if (player.currentFacet === 'strong' && player.facets.strong.abilities.breakBlocks) {
                    bPlat.broken = true;
                    audioManager.play('break_block');
                    if(player.facets.strong.charges !== Infinity) {
                         player.facets.strong.charges--;
                         if(player.facets.strong.charges <= 0) activateFacet('default'); // Si se queda sin cargas, vuelve a default
                    }
                }
            } else if (player.dy < 0 && player.y <= bPlat.y + bPlat.height && (player.y + player.height > bPlat.y)) {
                player.dy = 0.5;
            }
        }
    }

    // Enemigos
    for (const enemy of currentLevel.enemies) {
        if (enemy.isDefeated) continue;
        if (player.x < enemy.x + enemy.width && player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height && player.y + player.height > enemy.y) {
            
            if (player.dy > 0 && (player.y - player.dy) + player.height < enemy.y + 20) {
                enemy.isDefeated = true;
                player.dy = -player.jumpPower * 0.6;
                audioManager.play('stomp');
            } else if (!player.isInvincible && !player.isDashing) {
                player.lives--;
                player.isInvincible = true;
                player.invincibleTimer = 90;
                player.dy = -5;
                player.dx = player.x < enemy.x ? -5 : 5;
                audioManager.play('hurt');
                if (player.lives <= 0) {
                    audioManager.play('gameOver');
                    setGameState('gameOver');
                }
            }
        }
    }
    // Coleccionables
    for (const c of currentLevel.collectibles) {
        if (!c.collected) {
            const dist = Math.sqrt(Math.pow((player.x + player.width / 2) - c.x, 2) + Math.pow((player.y + player.height / 2) - c.y, 2));
            if (dist < player.width / 2 + c.radius) {
                c.collected = true;
                if(c.isGoal) {
                    audioManager.play('win');
                    document.getElementById('win-score').innerText = `Puntuación Final: ${score}`;
                    startStory(winStory, 'start'); // NUEVO: Mostrar historia de victoria
                } else {
                    score += 10;
                    audioManager.play('collect');
                }
            }
        }
    }
    // Items (Ovillo de Lana)
    for(const item of currentLevel.items) {
        if(!item.collected && player.x < item.x + 30 && player.x + player.width > item.x && player.y < item.y + 30 && player.y + player.height > item.y) {
            item.collected = true;
            audioManager.play('pickup');
            
            const existingItem = player.inventory.find(invItem => invItem.itemId === item.itemId);
            if (existingItem) {
                existingItem.ammo += item.ammo;
            } else {
                player.inventory.push({ itemId: item.itemId, name: "Ovillo de Lana", char: '🧶', type: 'weapon', ammo: item.ammo });
            }
        }
    }
    // Orbes de Faceta
    for (const orb of currentLevel.facetOrbs) {
        if (!orb.collected && player.x < orb.x + 30 && player.x + player.width > orb.x && player.y < orb.y + 30 && player.y + player.height > orb.y) {
            orb.collected = true;
            audioManager.play('powerup');
            player.facets[orb.facetType].unlocked = true;
            if (player.facets[orb.facetType].charges !== Infinity) { // No añadir cargas si es infinito
                player.facets[orb.facetType].charges += orb.charges;
            }
            // Si estaba en default o es la primera vez que se desbloquea una faceta, cambiar a ella
            if (player.currentFacet === 'default' && orb.facetType !== 'default') { 
                activateFacet(orb.facetType);
            }
        }
    }
}

function updateCamera() {
    if (player.x > camera.x + camera.deadZone) {
        camera.x = player.x - camera.deadZone;
    }
    camera.x = Math.max(0, Math.min(camera.x, currentLevel.width - canvas.width));
}

function updateLogic() {
    if (gameState !== 'playing') return;
    player.onGround = false;
    updatePlayer();
    updateEnemies();
    updateProjectiles();
    checkCollisions();

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > currentLevel.width) player.x = currentLevel.width - player.width;
    if (player.y > canvas.height + 100) {
        player.x = 100; player.y = 250; player.dy = 0; camera.x = 0;
        player.lives--;
        audioManager.play('hurt');
        if(player.lives <= 0) setGameState('gameOver');
    }
    updateCamera();
}

// --- LÓGICA DE DIBUJADO Y UI ---
function drawHUD() {
    let hearts = '';
    for(let i=0; i < player.maxLives; i++) {
        hearts += i < player.lives ? '❤️' : '🖤';
    }
    hud.innerHTML = hearts;
    
    if (player.equippedWeapon) {
        weaponHud.innerHTML = `${player.equippedWeapon.char} ${player.equippedWeapon.ammo}`;
    } else {
        weaponHud.innerHTML = '';
    }

    facetHud.innerHTML = `<span class="facet-char">${player.facets[player.currentFacet].char}</span> ${player.facets[player.currentFacet].name} <span class="facet-charges">(${player.facets[player.currentFacet].charges === Infinity ? '∞' : player.facets[player.currentFacet].charges})</span>`;
    
    ctx.fillStyle = "white";
    ctx.font = "20px 'Courier New'";
    ctx.textAlign = "right";
    ctx.fillText(`Puntuación: ${score}`, canvas.width - 10, 30);
    ctx.textAlign = "left";
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#4a5061';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-camera.x, 0);

    ctx.fillStyle = "#5a5a5a";
    currentLevel.platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));
    
    currentLevel.breakablePlatforms.forEach(p => {
        if (!p.broken) {
            ctx.font = `30px Arial`;
            ctx.fillText(p.char, p.x, p.y + p.height - 5);
        }
    });

    currentLevel.collectibles.forEach(c => {
        if (!c.collected) {
            ctx.font = `${c.radius * 2}px Arial`;
            if (c.isGoal) ctx.fillText(c.char, c.x - c.radius, c.y + c.radius / 2);
            else { ctx.beginPath(); ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2); ctx.fillStyle = "gold"; ctx.fill(); }
        }
    });
    currentLevel.enemies.forEach(e => {
        if(!e.isDefeated) { ctx.font = `30px Arial`; ctx.fillText(e.char, e.x, e.y); }
    });
    ctx.font = `30px Arial`;
    currentLevel.items.forEach(i => { if(!i.collected) ctx.fillText(i.char, i.x, i.y); });
    currentLevel.facetOrbs.forEach(o => { if(!o.collected) ctx.fillText(o.char, o.x, o.y); });

    projectiles.forEach(p => { ctx.font = `20px Arial`; ctx.fillText('🧶', p.x, p.y); });
    
    ctx.font = "32px Arial";
    ctx.fillText(player.char, player.x, player.y + player.height - 10);
    
    ctx.restore();
    if (gameState === 'playing' || gameState === 'paused' || gameState === 'inventory' || gameState === 'facetSelect' || gameState === 'story') {
        drawHUD();
    }
}

// --- FUNCIONES DE INVENTARIO ---
function renderInventory() {
    const grid = document.getElementById('inventory-grid');
    grid.innerHTML = '';
    if(player.inventory.length === 0) {
        grid.innerHTML = '<p style="color: #777;">Inventario vacío</p>';
        return;
    }
    player.inventory.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-card';
        if(player.equippedWeapon && player.equippedWeapon.itemId === item.itemId) {
            itemDiv.classList.add('equipped');
        }
        itemDiv.innerHTML = `<div class="item-char">${item.char}</div><div class="item-name">${item.name}</div><div class="item-ammo">x${item.ammo}</div>`;
        itemDiv.addEventListener('click', () => equipItem(item));
        grid.appendChild(itemDiv);
    });
}

function equipItem(item) {
    if(player.equippedWeapon && player.equippedWeapon.itemId === item.itemId) {
        player.equippedWeapon = null;
    } else {
        player.equippedWeapon = item;
    }
    audioManager.play('equip');
    renderInventory();
}

function toggleInventory() {
    if (gameState === 'playing') {
        renderInventory();
        setGameState('inventory');
    } else if (gameState === 'inventory') {
        setGameState('playing');
    }
}

// --- FUNCIONES DE FACETA ---
function renderFacetSelect() {
    const grid = document.getElementById('facet-grid');
    grid.innerHTML = '';
    Object.keys(player.facets).forEach(facetKey => {
        const facetData = player.facets[facetKey];
        if (!facetData.unlocked) return;

        const facetDiv = document.createElement('div');
        facetDiv.className = 'facet-card';
        if (player.currentFacet === facetKey) {
            facetDiv.classList.add('active');
        }
        facetDiv.innerHTML = `
            <div class="facet-char">${facetData.char}</div>
            <div class="facet-name">${facetData.name}</div>
            <div class="facet-charges">${facetData.charges === Infinity ? '∞' : facetData.charges} usos</div>
            <div class="facet-description" style="font-size:0.8em; color:#bbb; margin-top:5px;">${facetData.description}</div>
        `;
        facetDiv.addEventListener('click', () => activateFacet(facetKey));
        grid.appendChild(facetDiv);
    });
}

function activateFacet(facetKey) {
    const newFacet = player.facets[facetKey];
    // No activar si ya es la misma o no está disponible/sin cargas
    if (player.currentFacet === facetKey || !newFacet.unlocked || newFacet.charges === 0) {
        audioManager.play('error');
        return;
    }
    
    // Consumir una carga de la faceta ANTERIOR si no era default o infinita
    const oldFacet = player.facets[player.currentFacet];
    if (oldFacet.charges !== Infinity) {
        oldFacet.charges--; 
    }
    
    player.currentFacet = facetKey;
    player.char = newFacet.char;
    player.jumpsAvailable = newFacet.abilities.doubleJump ? 2 : 1;
    audioManager.play('transform');
    renderFacetSelect(); // Para actualizar los contadores en el menú
    setGameState('playing');
}

function toggleFacetSelect() {
    if (gameState === 'playing') {
        renderFacetSelect();
        setGameState('facetSelect');
    } else if (gameState === 'facetSelect') {
        setGameState('playing');
    }
}

// --- BUCLE PRINCIPAL DEL JUEGO ---
function gameLoop() {
    updateLogic();
    draw();
    requestAnimationFrame(gameLoop);
}

// --- EVENT LISTENERS ---
document.addEventListener("keydown", (e) => {
    // Teclas para menús (antes que las de juego para priorizar)
    if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        toggleInventory();
        return;
    }
    if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFacetSelect();
        return;
    }
    if (e.key === 'Escape') {
        e.preventDefault();
        if (gameState === 'inventory') toggleInventory();
        else if (gameState === 'facetSelect') toggleFacetSelect();
        else if (gameState === 'paused') setGameState('playing');
        else if (gameState === 'playing') setGameState('paused');
        return;
    }
    if (e.key.toLowerCase() === 'p') {
        if (gameState === 'playing') setGameState('paused');
        else if (gameState === 'paused') setGameState('playing');
        return;
    }
    // NUEVO: Avanzar historia con la barra espaciadora
    if (gameState === 'story' && e.key === ' ') {
        e.preventDefault(); // Evitar el scroll
        advanceStory();
        return;
    }

    if (gameState !== 'playing') return; // Solo procesar controles de juego si estamos jugando
    keys[e.key] = true;

    if ((e.key === " " || e.key === "ArrowUp") && player.jumpsAvailable > 0) {
        player.dy = player.jumpPower;
        player.jumpsAvailable--;
        player.onGround = false;
        audioManager.play('jump');
    }
    if ((e.key.toLowerCase() === 'x' || e.key === 'Shift') && player.canDash) {
        player.isDashing = true;
        player.canDash = false;
        player.dashTimer = 15;
        player.dashCooldown = 60;
        player.dy = 0;
        player.dx = player.dashSpeed * player.direction;
        audioManager.play('dash');
    }
    if ((e.key.toLowerCase() === 'c' || e.key.toLowerCase() === 'z')) {
        if (player.equippedWeapon && player.equippedWeapon.ammo > 0) {
            player.equippedWeapon.ammo--;
            projectiles.push({
                x: player.x + (player.direction === 1 ? player.width : 0),
                y: player.y + player.height / 2 - 10,
                dx: 12 * player.direction,
                dy: -1,
                gravity: 0.2,
            });
            audioManager.play('shoot');
        }
    }
});

document.addEventListener("keyup", (e) => { keys[e.key] = false; });

// Botones de los menús
document.getElementById('start-button').addEventListener('click', () => setGameState('characterSelect'));
document.getElementById('resume-button').addEventListener('click', () => setGameState('playing'));
document.getElementById('play-again-button').addEventListener('click', () => setGameState('start'));
document.getElementById('retry-button').addEventListener('click', loadLevel);
// NUEVO: Listener para avanzar la historia haciendo clic
document.getElementById('story-screen').addEventListener('click', advanceStory);

document.querySelectorAll(".char-option").forEach(el => {
    el.addEventListener("click", () => {
        player.baseChar = el.dataset.char;
        startStory(introStory, 'loadLevel'); // NUEVO: Iniciar la historia introductoria
    });
});

// --- INICIO DEL JUEGO ---
setGameState('start');
gameLoop();