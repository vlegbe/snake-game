Game = function(game) {}


//board
var blockSize = 25;
var rows = 20;
var cols = 20;
var board;
var context;

//snake head
var snakeX = blockSize * 5;
var snakeY = blockSize * 5;

var velocityX = 0;
var velocityY = 0;

var snakeBody = [];

//food
var foodX;
var foodY;

var gameOver = false;

window.onload = function() {
    board = document.getElementById("board");
    board.height = rows * blockSize;
    board.width = cols * blockSize;
    context = board.getContext("2d"); //used for drawing on the board

    placeFood();
    document.addEventListener("keyup", changeDirection);
    // update();
    setInterval(update, 1000 / 10); //100 milliseconds
}

Game.prototype = {
    preload: function() {

        //load assets
        this.game.load.image('circle', 'asset/circle.png');
        this.game.load.image('shadow', 'asset/white-shadow.png');
        this.game.load.image('background', 'asset/tile.png');

        this.game.load.image('eye-white', 'asset/eye-white.png');
        this.game.load.image('eye-black', 'asset/eye-black.png');

        this.game.load.image('food', 'asset/hex.png');
    },
    create: function() {
        var width = this.game.width;
        var height = this.game.height;

        this.game.world.setBounds(-width, -height, width * 2, height * 2);
        this.game.stage.backgroundColor = '#444';

        //add tilesprite background
        var background = this.game.add.tileSprite(-width, -height,
            this.game.world.width, this.game.world.height, 'background');

        //initialize physics and groups
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.foodGroup = this.game.add.group();
        this.snakeHeadCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.foodCollisionGroup = this.game.physics.p2.createCollisionGroup();

        //add food randomly
        for (var i = 0; i < 100; i++) {
            this.initFood(Util.randomInt(-width, width), Util.randomInt(-height, height));
        }

        this.game.snakes = [];

        //create player
        var snake = new PlayerSnake(this.game, 'circle', 0, 0);
        this.game.camera.follow(snake.head);

        //create bots
        new BotSnake(this.game, 'circle', -200, 0);
        new BotSnake(this.game, 'circle', 200, 0);

        //initialize snake groups and collision
        for (var i = 0; i < this.game.snakes.length; i++) {
            var snake = this.game.snakes[i];
            snake.head.body.setCollisionGroup(this.snakeHeadCollisionGroup);
            snake.head.body.collides([this.foodCollisionGroup]);
            //callback for when a snake is destroyed
            snake.addDestroyedCallback(this.snakeDestroyed, this);
        }
    },
    /**
     * Main update loop
     */
    update: function() {
        //update game components
        for (var i = this.game.snakes.length - 1; i >= 0; i--) {
            this.game.snakes[i].update();
        }
        for (var i = this.foodGroup.children.length - 1; i >= 0; i--) {
            var f = this.foodGroup.children[i];
            f.food.update();
        }
        if (gameOver) {
            return;
        }

        context.fillStyle = "black";
        context.fillRect(0, 0, board.width, board.height);

        context.fillStyle = "red";
        context.fillRect(foodX, foodY, blockSize, blockSize);

        if (snakeX == foodX && snakeY == foodY) {
            snakeBody.push([foodX, foodY]);
            placeFood();
        }

        for (let i = snakeBody.length - 1; i > 0; i--) {
            snakeBody[i] = snakeBody[i - 1];
        }
        if (snakeBody.length) {
            snakeBody[0] = [snakeX, snakeY];
        }

        context.fillStyle = "lime";
        snakeX += velocityX * blockSize;
        snakeY += velocityY * blockSize;
        context.fillRect(snakeX, snakeY, blockSize, blockSize);
        for (let i = 0; i < snakeBody.length; i++) {
            context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize);
        }

        //game over conditions
        if (snakeX < 0 || snakeX > cols * blockSize || snakeY < 0 || snakeY > rows * blockSize) {
            gameOver = true;
            alert("Game Over");
        }

        for (let i = 0; i < snakeBody.length; i++) {
            if (snakeX == snakeBody[i][0] && snakeY == snakeBody[i][1]) {
                gameOver = true;
                alert("Game Over");
            }
        };
        /**
         * Create a piece of food at a point
         * @param  {number} x x-coordinate
         * @param  {number} y y-coordinate
         * @return {Food}   food object created
         */
        function initFood(x, y) {
            var f = new Food(this.game, x, y);
            f.sprite.body.setCollisionGroup(this.foodCollisionGroup);
            this.foodGroup.add(f.sprite);
            f.sprite.body.collides([this.snakeHeadCollisionGroup]);
            return f;
        };

        function snakeDestroyed(snake) {
            //place food where snake was destroyed
            for (var i = 0; i < snake.headPath.length; i += Math.round(snake.headPath.length / snake.snakeLength) * 2) {
                this.initFood(
                    snake.headPath[i].x + Util.randomInt(-10, 10),
                    snake.headPath[i].y + Util.randomInt(-10, 10)
                );
            }
        }
    }
}