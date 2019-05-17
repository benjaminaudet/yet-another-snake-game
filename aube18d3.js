let frameRateValue = 8;
const canvasSize = 640;
const panelSize = 250;
const gridSize = 32;
const mapSize = 20;
let points = 0;
let mapBackground;
let foodImg;
let eatSound;
let endSound;
let snakeHeadImg = [];
let snakeBodyImg = [];
let pauseBool = false;
let panelButton = {
    x: 650,
    y: 92 + 30,
    height: 50,
    width: 150
}
let gameOverOverlay = {
    x: 320,
    y: 320,
    height: 320,
    width: 320
}
let gameOverBool = false;

class Snake {
    constructor() {
        this.x = canvasSize / 2;
        this.y = canvasSize / 2;
        this.length = 3;

        // direction: 0 = North, 1 = East, 2 = South, 3 = West
        this.direction = 0;
        this.logPositions = [
            { x: canvasSize / 2, y: canvasSize / 2 + gridSize, direction: 0 },
            { x: canvasSize / 2, y: canvasSize / 2 + gridSize * 2, direction: 0 }
        ];
    }

    addLogPositions(x, y, direction) {
        this.logPositions.push({ x: x, y: y, direction: direction });
        if (this.logPositions.length > this.length) {
            this.logPositions.shift();
        }
    }

    cutTail() {
        this.length = 0;
        this.logPositions = [];
        points = 0;
    }
};

class Food {
    constructor() {
        this.x = parseInt(Math.random() * mapSize) * gridSize;
        this.y = parseInt(Math.random() * mapSize) * gridSize;
    }
};

let snake = new Snake();
let food = new Food();

function resetGame() {
    snake = new Snake();
    points = 0;
    endSound.play();
    gameOverBool = false;
    pauseBool = false;
}

function gameOver() {
    gameOverBool = true;
    pause();
}

function computeDirectionsSensitivesValues() {
    switch (snake.direction) {
        case 0:
            return {
                x: 0,
                y: -gridSize
            };
        case 1:
            return {
                x: +gridSize,
                y: 0
            };
        case 2:
            return {
                x: 0,
                y: +gridSize
            };
        case 3:
            return {
                x: -gridSize,
                y: 0
            };
        default:
            break;
    }
}

function drawSnakeTail() {
    for (let i = 0; i < snake.length; i++) {
        if (!snake.logPositions[i]) {
            return;
        }
        image(snakeBodyImg[snake.logPositions[i].direction % 2], snake.logPositions[i].x, snake.logPositions[i].y);
    }
}

function drawSnake() {
    let op = computeDirectionsSensitivesValues();
    image(snakeHeadImg[snake.direction], snake.x, snake.y);
    drawSnakeTail();
    snake.addLogPositions(snake.x, snake.y, snake.direction);
    snake.x += op.x;
    snake.y += op.y;
}

function checkLimit() {
    if (snake.x < 0) {
        return false;
    }
    if (snake.x > 608) {
        return false;
    }
    if (snake.y < 0) {
        return false;
    }
    if (snake.y > 608) {
        return false;
    }
    return true;
}

function drawFood() {
    image(foodImg, food.x, food.y);
}

function drawTitle() {
    text('Snake Game', 650, 30);
}

function drawGameOver() {
    textSize(80);
    fill(255, 255, 255);
    text('GAME OVER', 80, 317);
}

function drawPoints() {
    text(`Points: ${points}`, 650, 30 + 32 + 30);
}

function drawControllers() {
    let label = gameOverBool ? 'Reset' : 'Pause'; 
    rect(panelButton.x, panelButton.y, panelButton.width, panelButton.height);
    fill(0, 0, 0);
    text(label, panelButton.x + 30, panelButton.y + 38);
}

function drawPanel() {
    if (gameOverBool) {
        drawGameOver();
    }
    textSize(32);
    fill(255, 255, 255);
    drawTitle();
    drawPoints();
    drawControllers();
}

function checkEat() {
    if (snake.x == food.x && snake.y == food.y) {
        eatSound.play();
        food = new Food();
        points++;
        snake.length++;
        if (points % 3 == 0) {
            frameRateValue += 1;
            frameRate(frameRateValue);
        }
    }
}

function checkAutoEat() {
    let autoEat = false;
    snake.logPositions.forEach(logPos => {
        if (logPos.x == snake.x && logPos.y == snake.y) {
            autoEat = true;
        }
    });
    return autoEat;
}

function setup() {
    createCanvas(canvasSize + panelSize, canvasSize);
    frameRate(frameRateValue);
    eatSound = loadSound('eat.mp3');
    endSound = loadSound('crash.mp3');
    mapBackground = loadImage('bg.png');
    foodImg = loadImage('food.png');
    snakeHeadImg.push(loadImage('snake-head-N.png'));
    snakeHeadImg.push(loadImage('snake-head-E.png'));
    snakeHeadImg.push(loadImage('snake-head-S.png'));
    snakeHeadImg.push(loadImage('snake-head-W.png'));
    snakeBodyImg.push(loadImage('snake-body-ver.png'));
    snakeBodyImg.push(loadImage('snake-body-hor.png'));
    background(mapBackground, 0, 0);
}

function keyPressed() {
    if (keyCode == UP_ARROW) {
        if (snake.direction == 2) {
            snake.cutTail();
        }
        snake.direction = 0;
    } else if (keyCode == RIGHT_ARROW) {
        if (snake.direction == 3) {
            snake.cutTail();
        }
        snake.direction = 1;
    } else if (keyCode == DOWN_ARROW) {
        if (snake.direction == 0) {
            snake.cutTail();
        }
        snake.direction = 2;
    } else if (keyCode == LEFT_ARROW) {
        if (snake.direction == 1) {
            snake.cutTail();
        }
        snake.direction = 3;
        return false;
    }
}

function mouseClicked() {
    if (mouseX > panelButton.x && mouseY > panelButton.y && mouseX < (panelButton.x + panelButton.width) && mouseY < (panelButton.y + panelButton.height)) {
        gameOverBool ? resetGame() : pause();
    }
}

function pause() {
    pauseBool = !pauseBool;
}

function draw() {
    clear();
    drawPanel();
    if (pauseBool) {
        return;
    }
    checkEat();
    if (checkAutoEat() || !checkLimit()) {
        gameOver();
    }
    drawSnake();
    drawFood();
}