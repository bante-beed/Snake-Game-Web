/**
 * 贪吃蛇游戏 - JavaScript实现
 * 使用HTML5 Canvas和现代JavaScript特性
 */

class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 游戏设置
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        this.tileCountY = this.canvas.height / this.gridSize;
        
        // 游戏状态
        this.snake = [
            { x: 10, y: 10 }
        ];
        this.food = {};
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameStarted = false;
        
        // DOM元素
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.gameOverlay = document.getElementById('gameOverlay');
        this.gameStart = document.getElementById('gameStart');
        this.overlayTitle = document.getElementById('overlayTitle');
        this.overlayMessage = document.getElementById('overlayMessage');
        
        // 颜色配置
        this.colors = {
            snake: '#00ff00',
            snakeHead: '#00ff88',
            food: '#ff4444',
            background: '#000000',
            grid: '#333333'
        };
        
        this.init();
    }
    
    init() {
        this.updateHighScore();
        this.generateFood();
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (!this.gameStarted) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    if (this.dy !== 1) {
                        this.dx = 0;
                        this.dy = -1;
                    }
                    break;
                case 'ArrowDown':
                    if (this.dy !== -1) {
                        this.dx = 0;
                        this.dy = 1;
                    }
                    break;
                case 'ArrowLeft':
                    if (this.dx !== 1) {
                        this.dx = -1;
                        this.dy = 0;
                    }
                    break;
                case 'ArrowRight':
                    if (this.dx !== -1) {
                        this.dx = 1;
                        this.dy = 0;
                    }
                    break;
                case ' ':
                    e.preventDefault();
                    this.togglePause();
                    break;
                case 'r':
                case 'R':
                    this.restart();
                    break;
                case 'Escape':
                    this.quit();
                    break;
            }
        });
        
        // 按钮事件
        document.getElementById('startGameBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('resumeBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restart();
        });
        
        document.getElementById('quitBtn').addEventListener('click', () => {
            this.quit();
        });
        
        // 手机控制按钮
        document.querySelectorAll('.mobile-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const direction = btn.dataset.direction;
                this.handleMobileControl(direction);
            });
        });
        
        // 防止页面滚动
        document.addEventListener('keydown', (e) => {
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
    }
    
    handleMobileControl(direction) {
        if (!this.gameStarted || this.gamePaused) return;
        
        switch(direction) {
            case 'up':
                if (this.dy !== 1) {
                    this.dx = 0;
                    this.dy = -1;
                }
                break;
            case 'down':
                if (this.dy !== -1) {
                    this.dx = 0;
                    this.dy = 1;
                }
                break;
            case 'left':
                if (this.dx !== 1) {
                    this.dx = -1;
                    this.dy = 0;
                }
                break;
            case 'right':
                if (this.dx !== -1) {
                    this.dx = 1;
                    this.dy = 0;
                }
                break;
        }
    }
    
    startGame() {
        this.gameStarted = true;
        this.gameRunning = true;
        this.gameStart.classList.add('hidden');
        this.gameOverlay.classList.add('hidden');
        this.dx = 1;
        this.dy = 0;
    }
    
    togglePause() {
        if (!this.gameStarted) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            this.showOverlay('游戏暂停', '按空格键继续游戏');
        } else {
            this.hideOverlay();
        }
    }
    
    restart() {
        this.snake = [{ x: 10, y: 10 }];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gamePaused = false;
        this.gameRunning = true;
        this.generateFood();
        this.updateScore();
        this.hideOverlay();
        
        if (!this.gameStarted) {
            this.startGame();
        }
    }
    
    quit() {
        this.gameStarted = false;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameStart.classList.remove('hidden');
        this.hideOverlay();
    }
    
    showOverlay(title, message) {
        this.overlayTitle.textContent = title;
        this.overlayMessage.textContent = message;
        this.gameOverlay.classList.remove('hidden');
        
        // 显示/隐藏按钮
        const resumeBtn = document.getElementById('resumeBtn');
        const restartBtn = document.getElementById('restartBtn');
        const quitBtn = document.getElementById('quitBtn');
        
        if (title === '游戏结束!') {
            resumeBtn.style.display = 'none';
            restartBtn.textContent = '重新开始';
        } else {
            resumeBtn.style.display = 'inline-block';
            restartBtn.textContent = '重新开始';
        }
    }
    
    hideOverlay() {
        this.gameOverlay.classList.add('hidden');
    }
    
    generateFood() {
        do {
            this.food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCountY)
            };
        } while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y));
    }
    
    update() {
        if (!this.gameRunning || this.gamePaused) return;
        
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        
        // 检查边界碰撞
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCountY) {
            this.gameOver();
            return;
        }
        
        // 检查自身碰撞
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.generateFood();
            
            // 添加吃食物的特效
            this.showEatEffect();
        } else {
            this.snake.pop();
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        this.updateHighScore();
        this.showOverlay('游戏结束!', `最终分数: ${this.score}`);
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
    }
    
    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
        }
        this.highScoreElement.textContent = this.highScore;
    }
    
    showEatEffect() {
        // 简单的吃食物特效
        const effect = document.createElement('div');
        effect.style.position = 'absolute';
        effect.style.left = (this.food.x * this.gridSize + 10) + 'px';
        effect.style.top = (this.food.y * this.gridSize + 10) + 'px';
        effect.style.color = '#00ff00';
        effect.style.fontSize = '20px';
        effect.style.fontWeight = 'bold';
        effect.style.pointerEvents = 'none';
        effect.style.zIndex = '1000';
        effect.textContent = '+10';
        effect.style.animation = 'fadeIn 0.5s ease-out forwards';
        
        document.body.appendChild(effect);
        
        setTimeout(() => {
            document.body.removeChild(effect);
        }, 500);
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格
        this.drawGrid();
        
        // 绘制蛇
        this.drawSnake();
        
        // 绘制食物
        this.drawFood();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let i = 0; i <= this.tileCountY; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            // 蛇头使用不同颜色
            const color = index === 0 ? this.colors.snakeHead : this.colors.snake;
            
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
            
            // 添加边框
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
            
            // 蛇头添加眼睛
            if (index === 0) {
                this.ctx.fillStyle = '#ffffff';
                const eyeSize = 3;
                const eyeOffset = 4;
                
                // 根据方向确定眼睛位置
                let eye1X, eye1Y, eye2X, eye2Y;
                
                if (this.dx === 1) { // 向右
                    eye1X = x + this.gridSize - eyeOffset;
                    eye1Y = y + eyeOffset;
                    eye2X = x + this.gridSize - eyeOffset;
                    eye2Y = y + this.gridSize - eyeOffset;
                } else if (this.dx === -1) { // 向左
                    eye1X = x + eyeOffset;
                    eye1Y = y + eyeOffset;
                    eye2X = x + eyeOffset;
                    eye2Y = y + this.gridSize - eyeOffset;
                } else if (this.dy === -1) { // 向上
                    eye1X = x + eyeOffset;
                    eye1Y = y + eyeOffset;
                    eye2X = x + this.gridSize - eyeOffset;
                    eye2Y = y + eyeOffset;
                } else { // 向下
                    eye1X = x + eyeOffset;
                    eye1Y = y + this.gridSize - eyeOffset;
                    eye2X = x + this.gridSize - eyeOffset;
                    eye2Y = y + this.gridSize - eyeOffset;
                }
                
                this.ctx.fillRect(eye1X, eye1Y, eyeSize, eyeSize);
                this.ctx.fillRect(eye2X, eye2Y, eyeSize, eyeSize);
            }
        });
    }
    
    drawFood() {
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        
        // 绘制食物（苹果形状）
        this.ctx.fillStyle = this.colors.food;
        this.ctx.beginPath();
        this.ctx.arc(x + this.gridSize/2, y + this.gridSize/2, this.gridSize/2 - 2, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // 添加边框
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // 添加高光
        this.ctx.fillStyle = '#ffaaaa';
        this.ctx.beginPath();
        this.ctx.arc(x + this.gridSize/2 - 3, y + this.gridSize/2 - 3, 3, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    gameLoop() {
        this.update();
        this.draw();
        
        // 控制游戏速度
        const speed = Math.max(100, 200 - Math.floor(this.score / 50) * 10);
        setTimeout(() => {
            requestAnimationFrame(() => this.gameLoop());
        }, speed);
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});

// 添加一些CSS动画到页面
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { 
            opacity: 0; 
            transform: translateY(-10px); 
        }
        to { 
            opacity: 1; 
            transform: translateY(0); 
        }
    }
`;
document.head.appendChild(style);
