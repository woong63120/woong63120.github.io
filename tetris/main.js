const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-piece');
const nextCtx = nextCanvas.getContext('2d');

ctx.scale(20, 20); // Scale grid to be 20x the size (12x20 blocks -> 240x400 pixels)
nextCtx.scale(20, 20);

// Tetromino definitions
const PIECES = 'ILJOTSZ';
const COLORS = [
    null,
    '#FF0D72', // T - Magenta/Purple
    '#0DC2FF', // I - Cyan
    '#0DFF72', // S - Green
    '#F538FF', // Z - Pinkish (adjusted to match image better)
    '#FF8E0D', // L - Orange
    '#FFE138', // J - Yellow
    '#3877FF', // O - Blue
];

// Adjusting colors to match standard slightly better or the reference image
// The reference has purple, blue, red/pink, green, yellow, orange.
// Let's use vibrant neon colors.
const SHAPES = [
    [],
    [ // T
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    [ // I
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
    ],
    [ // L
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1],
    ],
    [ // J
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0],
    ],
    [ // O
        [1, 1],
        [1, 1],
    ],
    [ // Z
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
    ],
    [ // S
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
    ],
];

// Colors mapped to shape indices
const PIECE_COLORS = [
    null,
    '#9C27B0', // T (Purple)
    '#03A9F4', // I (Cyan/Blue)
    '#FF9800', // L (Orange)
    '#2196F3', // J (Blue)
    '#FFEB3B', // O (Yellow)
    '#F44336', // Z (Red)
    '#4CAF50', // S (Green)
];


const ARENA_WIDTH = 12;
const ARENA_HEIGHT = 20;

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {
    let piece = null;
    if (type === 'I') piece = SHAPES[2];
    else if (type === 'L') piece = SHAPES[3];
    else if (type === 'J') piece = SHAPES[4];
    else if (type === 'O') piece = SHAPES[5];
    else if (type === 'Z') piece = SHAPES[6];
    else if (type === 'S') piece = SHAPES[7];
    else if (type === 'T') piece = SHAPES[1];
    else return SHAPES[0]; // Fallback

    // Return Deep Copy
    return piece.map(row => [...row]);
}

function getPieceColor(type) {
    if (type === 'I') return PIECE_COLORS[2];
    if (type === 'L') return PIECE_COLORS[3];
    if (type === 'J') return PIECE_COLORS[4];
    if (type === 'O') return PIECE_COLORS[5];
    if (type === 'Z') return PIECE_COLORS[6];
    if (type === 'S') return PIECE_COLORS[7];
    if (type === 'T') return PIECE_COLORS[1];
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

const particles = [];

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        // Random velocity
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.alpha = 1;
        this.life = 1.0; // Life decreases
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.02; // Fade out speed
        this.alpha = this.life;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        // Draw small square or circle
        ctx.fillRect(this.x, this.y, 0.4, 0.4);
        ctx.restore();
    }
}

function createExplosion(yVal, colorArr) {
    // yVal is the row index. Spawn particles across the row.
    for (let x = 0; x < ARENA_WIDTH; x++) {
        // Skip empty blocks if we want, or just explode everything?
        // We can explode based on the color of the block that was there, 
        // but arenaSweep clears it before we can check easily unless we pass checks.
        // For simplicity, let's spawn a bunch of particles.

        const color = colorArr[x] ? PIECE_COLORS[colorArr[x]] : '#fff';
        if (!colorArr[x]) continue;

        for (let i = 0; i < 5; i++) { // 5 particles per block
            particles.push(new Particle(x + 0.5, yVal + 0.5, color));
        }
    }
}

const arena = createMatrix(12, 20);

const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
    level: 1,
    next: null,
};

function drawMatrix(matrix, offset, context = ctx) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                // Beveled effect manually
                context.fillStyle = PIECE_COLORS[value];
                // Base block
                context.fillRect(x + offset.x, y + offset.y, 1, 1);

                // Inner highlight (top-left)
                context.fillStyle = 'rgba(255, 255, 255, 0.4)';
                context.fillRect(x + offset.x, y + offset.y, 1, 0.1); // Top
                context.fillRect(x + offset.x, y + offset.y, 0.1, 1); // Left

                // Inner shadow (bottom-right)
                context.fillStyle = 'rgba(0, 0, 0, 0.4)';
                context.fillRect(x + offset.x + 0.9, y + offset.y, 0.1, 1); // Right
                context.fillRect(x + offset.x, y + offset.y + 0.9, 1, 0.1); // Bottom

                // Center glow
                /*
                context.shadowColor = PIECE_COLORS[value];
                context.shadowBlur = 10;
                context.fillStyle = PIECE_COLORS[value];
                context.fillRect(x + offset.x + 0.1, y + offset.y + 0.1, 0.8, 0.8);
                context.shadowBlur = 0; 
                */
            }
        });
    });
}

function drawBackground() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.05;
    for (let x = 0; x < ARENA_WIDTH; x++) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ARENA_HEIGHT);
        ctx.stroke();
    }
    for (let y = 0; y < ARENA_HEIGHT; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(ARENA_WIDTH, y);
        ctx.stroke();
    }
}

function draw() {
    drawBackground();
    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);

    // Draw particles
    particles.forEach(p => p.draw(ctx));
}

function drawNext() {
    nextCtx.fillStyle = '#16213e'; // Match panel bg
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    if (player.next) {
        // Center the piece in 5x5 box
        const xOffset = (5 - player.next.length) / 2;
        const yOffset = (5 - player.next.length) / 2;
        drawMatrix(player.next, { x: xOffset, y: yOffset }, nextCtx);
    }
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                    matrix[y][x],
                    matrix[x][y],
                ];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function playerReset() {
    const piecesStr = 'ILJOTSZ';

    // Better spawn logic
    if (!player.next) {
        const type = piecesStr[piecesStr.length * Math.random() | 0];
        player.matrix = createPiece(type);
        setPieceColor(player.matrix, piecesStr.indexOf(type) + 1);

        const nextType = piecesStr[piecesStr.length * Math.random() | 0];
        player.next = createPiece(nextType);
        setPieceColor(player.next, piecesStr.indexOf(nextType) + 1);
    } else {
        player.matrix = player.next;
        const nextType = piecesStr[piecesStr.length * Math.random() | 0];
        player.next = createPiece(nextType);
        setPieceColor(player.next, piecesStr.indexOf(nextType) + 1);
    }

    drawNext();

    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        // Game Over
        document.getElementById('game-over-overlay').classList.remove('hidden');
        document.getElementById('final-score').innerText = 'Score: ' + player.score;
        isPaused = true;
    }
}

function setPieceColor(matrix, id) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                matrix[y][x] = id;
            }
        });
    });
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                    arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function arenaSweep() {
    let rowCount = 0;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0]; // Keep row data to get colors
        createExplosion(y, row); // Trigger explosion
        arena.unshift(row.fill(0));
        ++y;

        rowCount++;
    }

    if (rowCount > 0) {
        player.score += rowCount * 10 * rowCount; // Bonus for multi-line
        player.score += 100 * rowCount; // Base score
        // Speed up
        dropInterval = Math.max(100, 1000 - (player.score / 500) * 50);
        player.level = Math.floor(player.score / 1000) + 1;
        updateScore();
    }
}

function updateScore() {
    document.getElementById('score').innerText = player.score;
    document.getElementById('level').innerText = player.level;
}

let isPaused = true;

function update(time = 0) {
    if (isPaused) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }

    draw();
    requestAnimationFrame(update);
}

function resetGame() {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    player.level = 1;
    dropInterval = 1000;
    updateScore();
    document.getElementById('game-over-overlay').classList.add('hidden');

    player.next = null; // Force new next
    playerReset();

    isPaused = false;
    update();
}

function startGame() {
    if (isPaused) {
        isPaused = false;
        document.getElementById('start-overlay').classList.add('hidden');
        playerReset();
        updateScore();
        update();
    }
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 13) { // Enter
        if (document.getElementById('game-over-overlay').classList.contains('hidden')) {
            startGame();
        }
    }

    if (isPaused) return;

    if (event.keyCode === 37) { // Left
        playerMove(-1);
    } else if (event.keyCode === 39) { // Right
        playerMove(1);
    } else if (event.keyCode === 40) { // Down
        playerDrop();
    } else if (event.keyCode === 38) { // Up (Rotate)
        playerRotate(1);
    } else if (event.keyCode === 32) { // Space (Hard Drop)
        // Hard drop implementation
        while (!collide(arena, player)) {
            player.pos.y++;
        }
        player.pos.y--; // Back up one step
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
        dropCounter = 0;
    } else if (event.keyCode === 80) { // P (Pause)
        isPaused = !isPaused;
        if (!isPaused) {
            lastTime = performance.now(); // Reset time to prevent huge jump
            update();
        } else {
            // Optional: Draw pause text
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#fff';
            ctx.font = '1px Arial';
            ctx.fillText('PAUSED', 4, 10);
        }
    }
});

// Initial draw (blank)
drawBackground();
drawNext();
