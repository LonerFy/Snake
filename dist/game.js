"use strict";
const COLS = 25;
const ROWS = 25;
const CELL = 20;
const BEST_SCORE_KEY = "neon-snake-best-score";
const START_SPEED_MS = 150;
const MIN_SPEED_MS = 65;
const SPEED_STEP_MS = 4;
const POINTS_PER_FOOD = 10;
const OPPOSITE = {
    UP: "DOWN",
    DOWN: "UP",
    LEFT: "RIGHT",
    RIGHT: "LEFT",
};
class SnakeGame {
    constructor(canvas) {
        var _a;
        this.snake = [];
        this.direction = "RIGHT";
        this.pendingDirection = "RIGHT";
        this.food = { x: 0, y: 0 };
        this.score = 0;
        this.bestScore = 0;
        this.foodEaten = 0;
        this.speed = START_SPEED_MS;
        this.running = false;
        this.paused = false;
        this.gameOver = false;
        this.canvas = canvas;
        const ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("Impossible d'initialiser le contexte 2D du canvas.");
        this.ctx = ctx;
        this.scoreEl = this.requireEl("score");
        this.bestEl = this.requireEl("best-score");
        this.overlayEl = this.requireEl("overlay");
        this.overlayTitleEl = this.requireEl("overlay-title");
        this.overlayMessageEl = this.requireEl("overlay-message");
        this.overlayButton = this.requireEl("overlay-button");
        this.bestScore = Number((_a = localStorage.getItem(BEST_SCORE_KEY)) !== null && _a !== void 0 ? _a : "0") || 0;
        this.bestEl.textContent = String(this.bestScore);
        this.bindInput();
        this.reset();
        this.showStartOverlay();
    }
    requireEl(id) {
        const el = document.getElementById(id);
        if (!el)
            throw new Error(`Élément #${id} introuvable dans le DOM.`);
        return el;
    }
    reset() {
        const midX = Math.floor(COLS / 2);
        const midY = Math.floor(ROWS / 2);
        this.snake = [
            { x: midX - 1, y: midY },
            { x: midX - 2, y: midY },
            { x: midX - 3, y: midY },
        ];
        this.direction = "RIGHT";
        this.pendingDirection = "RIGHT";
        this.score = 0;
        this.foodEaten = 0;
        this.speed = START_SPEED_MS;
        this.gameOver = false;
        this.paused = false;
        this.scoreEl.textContent = "0";
        this.spawnFood();
        this.render();
    }
    spawnFood() {
        let candidate;
        do {
            candidate = {
                x: Math.floor(Math.random() * COLS),
                y: Math.floor(Math.random() * ROWS),
            };
        } while (this.snake.some((s) => s.x === candidate.x && s.y === candidate.y));
        this.food = candidate;
    }
    bindInput() {
        window.addEventListener("keydown", (e) => this.handleKey(e));
        document.querySelectorAll("[data-dir]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const dir = btn.dataset.dir;
                this.queueDirection(dir);
            });
        });
        this.overlayButton.addEventListener("click", () => this.handleOverlayAction());
        let touchStartX = 0;
        let touchStartY = 0;
        this.canvas.addEventListener("touchstart", (e) => {
            const t = e.changedTouches[0];
            touchStartX = t.clientX;
            touchStartY = t.clientY;
        }, { passive: true });
        this.canvas.addEventListener("touchend", (e) => {
            const t = e.changedTouches[0];
            const dx = t.clientX - touchStartX;
            const dy = t.clientY - touchStartY;
            if (Math.max(Math.abs(dx), Math.abs(dy)) < 20)
                return;
            if (Math.abs(dx) > Math.abs(dy)) {
                this.queueDirection(dx > 0 ? "RIGHT" : "LEFT");
            }
            else {
                this.queueDirection(dy > 0 ? "DOWN" : "UP");
            }
        }, { passive: true });
    }
    handleKey(e) {
        const map = {
            ArrowUp: "UP",
            ArrowDown: "DOWN",
            ArrowLeft: "LEFT",
            ArrowRight: "RIGHT",
            w: "UP",
            s: "DOWN",
            a: "LEFT",
            d: "RIGHT",
            W: "UP",
            S: "DOWN",
            A: "LEFT",
            D: "RIGHT",
        };
        const dir = map[e.key];
        if (dir) {
            e.preventDefault();
            this.queueDirection(dir);
            return;
        }
        if (e.key === " ") {
            e.preventDefault();
            this.togglePause();
        }
        if (e.key === "Enter" && (this.gameOver || !this.running)) {
            this.handleOverlayAction();
        }
    }
    queueDirection(dir) {
        if (!this.running || this.paused)
            return;
        if (OPPOSITE[dir] === this.direction)
            return;
        this.pendingDirection = dir;
    }
    togglePause() {
        if (!this.running || this.gameOver)
            return;
        this.paused = !this.paused;
        if (this.paused) {
            this.stopTimer();
            this.showOverlay("Pause", "Appuie sur espace pour reprendre.", "Reprendre");
        }
        else {
            this.hideOverlay();
            this.scheduleNextTick();
        }
    }
    showStartOverlay() {
        this.showOverlay("Neon Snake", "Flèches ou WASD pour bouger. Espace pour la pause.", "Jouer");
    }
    showOverlay(title, message, buttonLabel) {
        this.overlayTitleEl.textContent = title;
        this.overlayMessageEl.textContent = message;
        this.overlayButton.textContent = buttonLabel;
        this.overlayEl.classList.remove("hidden");
    }
    hideOverlay() {
        this.overlayEl.classList.add("hidden");
    }
    handleOverlayAction() {
        if (this.paused) {
            this.togglePause();
            return;
        }
        this.reset();
        this.hideOverlay();
        this.running = true;
        this.scheduleNextTick();
    }
    scheduleNextTick() {
        this.stopTimer();
        this.timerId = window.setTimeout(() => this.tick(), this.speed);
    }
    stopTimer() {
        if (this.timerId !== undefined) {
            window.clearTimeout(this.timerId);
            this.timerId = undefined;
        }
    }
    tick() {
        this.update();
        this.render();
        if (this.running && !this.gameOver) {
            this.scheduleNextTick();
        }
    }
    update() {
        this.direction = this.pendingDirection;
        const head = this.snake[0];
        let newHead = Object.assign({}, head);
        switch (this.direction) {
            case "UP":
                newHead.y -= 1;
                break;
            case "DOWN":
                newHead.y += 1;
                break;
            case "LEFT":
                newHead.x -= 1;
                break;
            case "RIGHT":
                newHead.x += 1;
                break;
        }
        if (newHead.x < 0)
            newHead.x = COLS - 1;
        if (newHead.x >= COLS)
            newHead.x = 0;
        if (newHead.y < 0)
            newHead.y = ROWS - 1;
        if (newHead.y >= ROWS)
            newHead.y = 0;
        if (this.snake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
            this.endGame();
            return;
        }
        this.snake.unshift(newHead);
        const ateFood = newHead.x === this.food.x && newHead.y === this.food.y;
        if (ateFood) {
            this.score += POINTS_PER_FOOD;
            this.foodEaten += 1;
            this.scoreEl.textContent = String(this.score);
            this.speed = Math.max(MIN_SPEED_MS, START_SPEED_MS - this.foodEaten * SPEED_STEP_MS);
            this.spawnFood();
        }
        else {
            this.snake.pop();
        }
    }
    endGame() {
        this.gameOver = true;
        this.running = false;
        this.stopTimer();
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem(BEST_SCORE_KEY, String(this.bestScore));
            this.bestEl.textContent = String(this.bestScore);
            this.showOverlay("Nouveau record !", `Score : ${this.score} points.`, "Rejouer");
        }
        else {
            this.showOverlay("Perdu", `Score : ${this.score} points.`, "Rejouer");
        }
    }
    render() {
        const { ctx } = this;
        const w = this.canvas.width;
        const h = this.canvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "#0a0118";
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "rgba(139, 47, 255, 0.12)";
        ctx.lineWidth = 1;
        for (let x = 0; x <= COLS; x++) {
            ctx.beginPath();
            ctx.moveTo(x * CELL + 0.5, 0);
            ctx.lineTo(x * CELL + 0.5, h);
            ctx.stroke();
        }
        for (let y = 0; y <= ROWS; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * CELL + 0.5);
            ctx.lineTo(w, y * CELL + 0.5);
            ctx.stroke();
        }
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const pulse = reduceMotion ? 0.5 : 0.5 + 0.5 * Math.sin(performance.now() / 180);
        const foodRadius = CELL / 2 - 2 + pulse * 2;
        const fx = this.food.x * CELL + CELL / 2;
        const fy = this.food.y * CELL + CELL / 2;
        ctx.save();
        ctx.shadowColor = "#ff2ec4";
        ctx.shadowBlur = 16 + pulse * 10;
        ctx.fillStyle = "#ff2ec4";
        ctx.beginPath();
        ctx.arc(fx, fy, foodRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        this.snake.forEach((segment, i) => {
            const isHead = i === 0;
            const t = i / Math.max(this.snake.length - 1, 1);
            const r = Math.round(0 + t * 90);
            const g = Math.round(255 - t * 120);
            const b = Math.round(242 - t * 30);
            const color = `rgb(${r}, ${g}, ${b})`;
            ctx.save();
            ctx.shadowColor = isHead ? "#00fff2" : color;
            ctx.shadowBlur = isHead ? 18 : 8;
            ctx.fillStyle = color;
            const pad = isHead ? 1 : 2;
            ctx.fillRect(segment.x * CELL + pad, segment.y * CELL + pad, CELL - pad * 2, CELL - pad * 2);
            ctx.restore();
        });
    }
}
window.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("game-canvas");
    if (canvas instanceof HTMLCanvasElement) {
        new SnakeGame(canvas);
    }
});
