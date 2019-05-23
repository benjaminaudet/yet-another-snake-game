const defaultFrameRateValue = 8;
let frameRateValue = defaultFrameRateValue;
const canvasSize = 640;
const panelSize = 250;
const gridSize = 32;
const mapSize = 20;
const defaultSnakeLength = 3;
let backgroundMusic;
let points = 0;
let mapBackground;
let foodImg;
let eatSound;
let endSound;
let snakeHeadImg = [];
let snakeBodyImg = [];
let pauseBool = false;
let gameStart = false;
const direction = {
    NORTH: 0,
    EAST: 1,
    SOUTH: 2,
    WEST: 3
};
const turnImgIndex = {
    SE: 2,
    NE: 3,
    SW: 4,
    NW: 5

}

let buttons = {};

let gameOverOverlay = {
    x: 320,
    y: 320,
    height: 320,
    width: 320
}
let gameOverBool = false;
let snakeBodyTurnImg = [
    {
        second: direction.NORTH,
        first: direction.EAST,
        index: turnImgIndex.SE
    },
    {
        second: direction.NORTH,
        first: direction.WEST,
        index: turnImgIndex.SW
    },
    {
        second: direction.SOUTH,
        first: direction.EAST,
        index: turnImgIndex.NE
    },
    {
        second: direction.SOUTH,
        first: direction.WEST,
        index: turnImgIndex.NW
    },
    {
        second: direction.EAST,
        first: direction.NORTH,
        index: turnImgIndex.NW
    },
    {
        second: direction.WEST,
        first: direction.NORTH,
        index: turnImgIndex.NE
    },
    {
        second: direction.EAST,
        first: direction.SOUTH,
        index: turnImgIndex.SW
    },
    {
        second: direction.WEST,
        first: direction.SOUTH,
        index: turnImgIndex.SE
    },
];

class Snake {
    constructor() {
        const middlePointCoordinate = canvasSize / 2;
        this.x = middlePointCoordinate;
        this.y = middlePointCoordinate;
        this.length = defaultSnakeLength;

        // direction: 0 = North, 1 = East, 2 = South, 3 = West
        this.direction = direction.NORTH;
        this.logPositions = [
            { x: middlePointCoordinate, y: middlePointCoordinate + gridSize, direction: 0 },
            { x: middlePointCoordinate, y: middlePointCoordinate + gridSize * 2, direction: 0 }
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

    forward() {
        let {x, y} = computeIncrementValues();
        snake.x += x;
        snake.y += y;
    }
};

function generateRandomCoordinate() {
    return parseInt(Math.random() * mapSize) * gridSize
};

class Button {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.label = config.label;
        this.width = textWidth(this.label());
        this.textSize = config.textSize || 32;
        this.height = config.height || this.textSize + 5;
        this.backgroundColor = config.backgroundColor || [0, 0, 0];
        this.textColor = config.textColor || [255, 255, 255];
        this.onClick = config.onClick || (() => {});
        this.margin = config.margin || {hori: 20, verti: 20};
    }

    draw() {
        textSize(this.textSize);
        fill(...this.backgroundColor);
        rect(this.x, this.y, this.width + this.margin.hori, this.height + this.margin.verti);
        fill(...this.textColor);
        text(this.label(), this.x + this.width / 2 + this.margin.hori / 2, this.y + this.textSize / 2 + this.margin.verti / 2);
    }

    declareOnClick() {
        if (mouseX > this.x && mouseY > this.y && mouseX < (this.x + this.width) && mouseY < (this.y + this.height)) {
            this.onClick();
        }
    }
}

class Food {
    constructor() {
        var x = generateRandomCoordinate();
        var y = generateRandomCoordinate();
        this.x = x;
        this.y = y;
    }
};

let snake = new Snake();
let food = new Food();

function resetGame() {
    snake = new Snake();
    points = 0;
    gameOverBool = false;
    pauseBool = false;
    resetFrameRate();
    frameRate(frameRateValue);
}

function gameOver() {
    gameOverBool = true;
    endSound.play();
    pause();
}

function computeIncrementValues() {
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
        const currentLogPos = snake.logPositions[i];
        const nextLogPos = snake.logPositions[i - 1];

        if (!currentLogPos) {
            return;
        }
        if (nextLogPos && currentLogPos.direction != nextLogPos.direction) {
            let turnImage = snakeBodyTurnImg.find(el => {
                return (currentLogPos.direction == el.first && nextLogPos.direction == el.second)
            })
            image(snakeBodyImg[turnImage.index], currentLogPos.x, currentLogPos.y);
        } else {
            image(snakeBodyImg[currentLogPos.direction % 2], currentLogPos.x, currentLogPos.y);
        }
    }
}

function drawSnake() {
    image(snakeHeadImg[snake.direction], snake.x, snake.y);
    drawSnakeTail();
    snake.addLogPositions(snake.x, snake.y, snake.direction);
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

function drawGameOver() {
    textSize(80);
    fill(255, 255, 255);
    text('GAME OVER', canvasSize / 2, 317);
}

function drawPoints() {
    text(`Points: ${points}`, canvasSize + panelSize / 2, 32);
}

function drawControllers() {
    buttons.panelButton = new Button({
        x: canvasSize + panelSize / 2,
        y: 92 + 30,
        height: 50,
        label: () => gameOverBool ? 'Reset' : pauseBool ? 'Resume' : 'Pause',
        onClick: () => gameOverBool ? resetGame() : pause()
    });
    buttons.panelButton.draw();
}

function drawStartWindow() {
    fill(33, 33, 33);
    rect(50, 50, canvasSize + panelSize - 100, canvasSize - 100, 20, 20, 20, 20);
    textSize(50);
    fill(255, 255, 255);
    text('Yet Another Snake Game', (canvasSize + panelSize) / 2, canvasSize - (canvasSize - 100));
    buttons.startButton = new Button({
        textSize: 50,
        backgroundColor: [255, 255, 255],
        textColor: [0, 0, 0],
        x: ((canvasSize + panelSize) - textWidth('START')) / 2 - 20,
        y: (canvasSize - 100 - 45),
        height: 50,
        label: () => 'START',
        onClick: () => gameStart = true
    });
    buttons.startButton.draw();
}

function drawPanel() {
    if (gameOverBool) {
        drawGameOver();
    }
    textSize(32);
    fill(255, 255, 255);
    drawPoints();
    drawControllers();
}

function resetFrameRate() {
    frameRateValue = defaultFrameRateValue;
}

function increaseFrameRate() {
    if (points % 3 == 0) {
        frameRateValue += 1;
        frameRate(frameRateValue);
    }
}

function checkEat() {
    if (snake.x == food.x && snake.y == food.y) {
        eatSound.play();
        food = new Food();
        points++;
        snake.length++;
        increaseFrameRate();
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

function loadAssets() {
    eatSound = loadSound('eat.mp3');
    endSound = loadSound('crash.mp3');
    backgroundMusic = loadSound('endless_nights.mp3');
    mapBackground = loadImage('bg.png');
    foodImg = loadImage('food.png');
    snakeHeadImg.push(loadImage('snake-head-N.png'));
    snakeHeadImg.push(loadImage('snake-head-E.png'));
    snakeHeadImg.push(loadImage('snake-head-S.png'));
    snakeHeadImg.push(loadImage('snake-head-W.png'));
    snakeBodyImg.push(loadImage('snake-body-ver.png'));
    snakeBodyImg.push(loadImage('snake-body-hor.png'));
    snakeBodyImg.push(loadImage('snake-body-turn-SE.png'));
    snakeBodyImg.push(loadImage('snake-body-turn-NE.png'));
    snakeBodyImg.push(loadImage('snake-body-turn-SW.png'));
    snakeBodyImg.push(loadImage('snake-body-turn-NW.png'));
}

function preload() {
    loadAssets();
}

function setup() {
    createCanvas(canvasSize + panelSize, canvasSize);
    frameRate(frameRateValue);
    textAlign(CENTER, CENTER);
    background(mapBackground, 0, 0);
    backgroundMusic.loop();
}

function keyPressed() {
    if (keyCode == UP_ARROW) {
        if (snake.direction == 2) {
            snake.cutTail();
        }
        snake.direction = direction.NORTH;
    } else if (keyCode == RIGHT_ARROW) {
        if (snake.direction == 3) {
            snake.cutTail();
        }
        snake.direction = direction.EAST;
    } else if (keyCode == DOWN_ARROW) {
        if (snake.direction == 0) {
            snake.cutTail();
        }
        snake.direction = direction.SOUTH;
    } else if (keyCode == LEFT_ARROW) {
        if (snake.direction == 1) {
            snake.cutTail();
        }
        snake.direction = direction.WEST;
        return false;
    }
}

function mouseClicked() {
    Object.keys(buttons).forEach(key => {
        if (buttons[key]) {
            buttons[key].declareOnClick()
        }
    })
}

function pause() {
    pauseBool = !pauseBool;
}

function touchStarted() {
    if (getAudioContext().state !== 'running') {
      getAudioContext().resume();
    }
  }

function draw() {
    clear();
    if (!gameStart) {
        drawStartWindow();
        return;
    }
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
    snake.forward();
}