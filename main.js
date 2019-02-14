// Main snake file

// 8x5 grid

const UP = {x: 0, y: -1};
const DOWN = {x: 0, y: 1};
const LEFT = {x: -1, y: 0};
const RIGHT = {x: 1, y: 0};
const SIZE = 3;
const BUFFER = 1;
const GAMESIZE = {x: 22, y: 40};
const Neat = neataptic.Neat;

const NUM_GAMES = 40;
const ELETISM = Math.round(0.2 * NUM_GAMES);
const MUTATION_RATE = 0.5;
const MUTATION_AMOUNT = 5;
const GENERATIONS = 50;
const TURNS = 5000;
const FOOD_SCORE = 2;
const POINTS_PER_TURN = 0;
const INCREASED_DISTANCE = -1.5;
const DECREASED_DISTANCE = 1;
const DIED_EARLY = -2;
const LOWEST_SCORE = -50

var gamesRunning = NUM_GAMES;
var currentGeneration = 0;
var highScore = 0;


function randint(min, max) {
    return min + Math.floor(Math.random() * max-min);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


class BodyPart {
    constructor(nextPart) {
        this.next = nextPart;
        this.position = {x: 10, y: 10};
    }

    addPart(part) {
        if (this.next == null) {
            this.next = part;
        }
        else {
            this.next.addPart(part);
        }
    }

    get gridIndex() {
        const out = [this.position.y*GAMESIZE.x + this.position.x,]
        if (this.nextPart == null) {
            return out;
        }
        else {
            return out.concat(this.nextPart.gridIndex);
        }
    }

    update(position) {
        var prevPos = this.position;
        this.position = position;
        if (this.next != null) {
            this.next.update(prevPos);
        }
    }

    draw(context, offset) {
        context.fillStyle = 'white';
        context.strokeStyle = 'red';
        context.fillRect(this.position.x*SIZE+offset.x, this.position.y*SIZE+offset.y, SIZE, SIZE);
        context.strokeRect(this.position.x*SIZE+offset.x, this.position.y*SIZE+offset.y, SIZE, SIZE);
        if (this.next != null) {
            this.next.draw(context, offset);
        }
    }

    isColliding(pos=null) {
        if (pos == null) {
            if (this.next == null) {
                return false;
            }
            return this.next.isColliding(this.position);
        }
        if (pos.x === this.position.x && pos.y === this.position.y) {
            return true;
        }
        if (this.next == null) {
            return false;
        }
        return this.next.isColliding(pos);
    }
}


class Snake {
    constructor(game) {
        this.game = game;
        this.reset();
    }

    reset() {
        this.head = new BodyPart(null);
        this.lastPosition = this.head.position;
        this.lastDirection = {x:0, y:0};
        this.addPart();
        this.addPart();
    }

    addPart() {
        this.head.addPart(new BodyPart(null));
    }

    isColliding(pos) {
        return this.head.isColliding(pos);
    }

    get gridIndeces() {
        return this.head.gridIndex;
    }

    update(direction) {
        var newPos = {
            x: this.head.position.x+direction.x,
            y: this.head.position.y+direction.y
        }
        // If we're going back to the last position we were in
        if (newPos.x === this.lastPosition.x && newPos.y === this.lastPosition.y) {
            // Just continue moving in whichever direction we were moving before
            newPos = {
                x: this.head.position.x + this.lastDirection.x,
                y: this.head.position.y + this.lastDirection.y
            }
        }
        else {
            this.lastDirection = direction;
        }
        this.lastPosition = this.head.position;
        this.head.update(newPos);

        if (this.head.position.x < 0 || this.head.position.x >= this.game.size.x ||
            this.head.position.y < 0 || this.head.position.y >= this.game.size.y ||
            this.head.isColliding()) {
            this.game.gameOver();
        }
    }

    draw() {
        this.head.draw(this.game.context, this.game.position);
    }
}


class Food {
    constructor(game) {
        this.game = game;
        this.position = {x: randint(0, GAMESIZE.x), y: randint(0, GAMESIZE.y)};
        this.respawn();
    }

    respawn() {
        var needsPosition = true;
        while (needsPosition) {
            if (this.game.isColliding(this.position)) {
                this.position = {x: randint(0, GAMESIZE.x), y: randint(0, GAMESIZE.y)};
            }
            else {
                needsPosition = false;
            }
        }
    }

    get gridIndex() {
        return this.position.y*GAMESIZE.x + this.position.x;
    }

    draw() {
        this.game.context.fillStyle = 'green';
        var adjx = this.position.x*SIZE + this.game.position.x;
        var adjy = this.position.y*SIZE + this.game.position.y;
        this.game.context.fillRect(adjx, adjy, SIZE, SIZE);
    }
}


class Game {
    constructor(context, x, y, width, height, brain) {
        this.context = context;
        this.position = {x: x, y: y};
        this.size = {x: width, y: height};
        this.brain = brain;
        this.brain.score = 0;
        this.grid = [];
        for (var i = 0; i < width*height; i++) {
            this.grid.push(0.0);
        }
        this.running = true;
        this.snake = new Snake(this);
        this.food = new Food(this);
        this.lastDistance = 46;
        this.draw();
    }

    reset() {
        this.snake.reset();
        this.food.respawn();
        this.running = true;
    }

    isColliding(pos) {
        return this.snake.isColliding(pos);
    }

    gameOver() {
        this.brain.score += DIED_EARLY;
        this.running = false;
        gamesRunning -= 1;
    }

    update() {
        if (this.running) {
            var input = [
                0,  // 0: Forward available
                0,  // 1: Food forward
                0,  // 2: Snake forward

                0,  // 3: Left available
                0,  // 4: Food left
                0,  // 5: Snake left

                0,  // 6: Right available
                0,  // 7: Food right
                0,  // 8: Snake right
            ]
            // forward test
            let fw = {x: this.snake.head.position.x+this.snake.lastDirection.x,
                      y: this.snake.head.position.y+this.snake.lastDirection.y};
            if (fw.x >= 0 && fw.x <= this.size.x &&
                fw.y >= 0 && fw.y <= this.size.y) {
                input[0] = 1;
            }
            if (fw.x === this.food.position.x && fw.y === this.food.position.y) {
                input[1] = 1;
            }
            if (this.snake.isColliding(fw)) {
                input[2] = 1;
            }
            let lf = {x:this.snake.head.position.x+(this.snake.lastDirection.y-this.snake.head.position.y),
                      y:this.snake.head.position.y-(this.snake.lastDirection.x-this.snake.head.position.x)};
            if (lf.x >= 0 && lf.x <= this.size.x &&
                lf.y >= 0 && lf.y <= this.size.y) {
                input[3] = 1;
            }
            if (lf.x === this.food.position.x && lf.y === this.food.position.y) {
                input[4] = 1;
            }
            if (this.snake.isColliding(lf)) {
                input[5] = 1;
            }
            let rf = {x:this.snake.head.position.x-(this.snake.lastDirection.y-this.snake.head.position.y),
                      y:this.snake.head.position.y+(this.snake.lastDirection.x-this.snake.head.position.x)};
            if (rf.x >= 0 && rf.x <= this.size.x &&
                rf.y >= 0 && rf.y <= this.size.y) {
                input[6] = 1;
            }
            if (rf.x === this.food.position.x && rf.y === this.food.position.y) {
                input[7] = 1;
            }
            if (this.snake.isColliding(rf)) {
                input[8] = 1;
            }

            const o = this.brain.activate(input);
            const output = o.indexOf(Math.max(...o));
            if (output === 0) {
                this.snake.update(UP);
            }
            else if (output === 1) {
                this.snake.update(DOWN);
            }
            else if (output === 2) {
                this.snake.update(LEFT);
            }
            else if (output === 3) {
                this.snake.update(RIGHT);
            }

            let distanceToFood = Math.sqrt(
                Math.pow(this.food.position.x - this.snake.head.position.x, 2) +
                Math.pow(this.food.position.y - this.snake.head.position.x, 2));
            this.brain.score += distanceToFood < this.lastDistance ? DECREASED_DISTANCE : INCREASED_DISTANCE;
            this.lastDistance = distanceToFood;

            if (this.snake.head.position.x === this.food.position.x &&
                this.snake.head.position.y === this.food.position.y) {
                    this.snake.addPart();
                    this.brain.score += FOOD_SCORE;
                    this.food.respawn();
            }

            this.brain.score += POINTS_PER_TURN;

            if (this.brain.score <= LOWEST_SCORE) {
                this.gameOver();
            }
        }
    }

    draw() {
        if (this.running) {
            this.context.fillStyle = 'black';
            this.context.fillRect(this.position.x, this.position.y,
                                  this.size.x*SIZE, this.size.y*SIZE);
            this.snake.draw();
            this.food.draw();
        }
        else {
            this.context.fillStyle = 'red';
            this.context.fillRect(this.position.x, this.position.y,
                                  this.size.x*SIZE, this.size.y*SIZE);
            this.context.fillStyle = 'black';
            ctx.font = "20px Arial";
            ctx.fillText(`${this.brain.score}`, this.position.x + 3,
                         this.position.y+GAMESIZE.y*SIZE/2);

        }
    }

    paintGreen() {
        this.context.fillStyle = 'green';
        this.context.fillRect(this.position.x, this.position.y,
                              this.size.x*SIZE, this.size.y*SIZE);
        this.context.fillStyle = 'black';
        ctx.font = "20px Arial";
        ctx.fillText(`${this.brain.score}`, this.position.x + 3,
                     this.position.y+GAMESIZE.y*SIZE/2);
    }
}


var generationCounter = document.getElementById("generation");
var highscore = document.getElementById("highscore");
function setGenerationText(text) {
    generationCounter.innerHTML = "Generation: " + text;
}
function setHighscoreText(text) {
    highscore.innerHTML = "High Score: " + text;
}
setGenerationText(`${currentGeneration}`);
setHighscoreText(`${highScore}`);


var gc = document.getElementById("gameCanvas");
var ctx = gameCanvas.getContext("2d");

ctx.fillStyle = 'grey';
ctx.fillRect(0, 0, gc.width, gc.height);

const neat = new Neat(9, 4, null, {
    popsize: NUM_GAMES,
    elitism: ELETISM,
    mutationRate: MUTATION_RATE,
    mutationAmount: MUTATION_AMOUNT
});

var games = [];

var numvert = Math.floor(gc.height/(GAMESIZE.y*SIZE + BUFFER));
var numhori = Math.floor(gc.width/(GAMESIZE.x*SIZE + BUFFER));

function createGames() {
    var k = 0;
    for (var i = 0; i < numvert; i++) {
        for (var j = 0; j < numhori; j++) {
            let g = new Game(ctx, j*(GAMESIZE.x*SIZE+BUFFER), i*(GAMESIZE.y*SIZE+BUFFER),
                                GAMESIZE.x, GAMESIZE.y, neat.population[k++]);
            games.push(g );
        }
    }
}

async function main() {
    for (var i = 0; i < TURNS; i++) {
        await sleep(50);
        for (var g in games) {
            games[g].update();
            games[g].draw();
        }
        if (gamesRunning <= 0) break;
    }
}

async function generation() {
    neat.sort();

    highScore = neat.getFittest().score;
    let fi = games.filter(g => g.brain.score === highScore);
    for (var i in fi){
        fi[i].paintGreen();
    }

    await sleep(3000);

    var newGeneration = [];
    for (let i = 0; i < neat.elitism; i++) {
        newGeneration.push(neat.population[i]);
    }
    for (let i = 0; i < neat.popsize - neat.elitism; i++) {
      newGeneration.push(neat.getOffspring());
    }
    neat.population = newGeneration;
    neat.mutate();
    neat.generation++;

    ctx.fillStyle = 'grey';
    ctx.fillRect(0, 0, gc.width, gc.height);

    gamesRunning = NUM_GAMES;

    for (var i in games) {
        games[i].brain = neat.population[i];
        games[i].brain.score = 0;
        games[i].reset();
    }
    currentGeneration += 1;
    setGenerationText(`${currentGeneration}`);
    setHighscoreText(`${highScore}`);
}

async function run() {
    createGames();
    for (var i = 0; i < GENERATIONS; i++) {
        await main();
        await generation();
    }
}

run();
