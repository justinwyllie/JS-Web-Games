/**
 * nb. the sizes of the images should be in the ratio 4:5 (width:height)
 */

document.addEventListener("DOMContentLoaded", function(event) { 
    
    //Set up some global variables which are used in all functions.
    const gameBoard = document.getElementById("game");
    const cactus = document.getElementById("cactus1");
    const dino = document.getElementById("dino1");
    let startPos;
    let gameBoardWidth;
    let cactusTimer, collisionTimer, jumpUpTimer, jumpDownTimer, jumpPauseTimer;
    let screenMode; //mobile or desktop. 576

    /**
     * This function sets the sizes and positions of game elements dependent on viewport width
     * It starts by clearing all timers so we reset the game
     */
    function init()
    {
        
        if (cactusTimer != undefined)
        {
            clearInterval(cactusTimer);
        }

        if (collisionTimer != undefined)
        {
            clearInterval(collisionTimer);
        }

        if (jumpUpTimer != undefined)
        {
            clearInterval(jumpUpTimer);
        }

        if (jumpDownTimer != undefined)
        {
            clearInterval(jumpDownTimer);
        }

        if (window.innerWidth >= 576)
        {
            screenMode = "desktop";
        }
        else
        {
            screenMode = "mobile";
        }
      
        //set sizes of elements.
        let cactusWidth;
        let cactusHeight;
        let dinoWidth;
        let dinoHeight;
        let gameBoardHeight;
        if (screenMode == "desktop")
        {
            cactusHeight = 150;
            cactusWidth = 120;
            dinoHeight = 150;
            dinoWidth = 120;
            gameBoardHeight = 400;
        }
        else
        {
            cactusHeight = 75;
            cactusWidth = 60;
            dinoHeight = 75;
            dinoWidth = 60;
            gameBoardHeight = 200;
        }
        cactus.style.height = cactusHeight + "px";
        cactus.style.width =  cactusWidth + "px";
        dino.style.height = dinoHeight + "px";
        dino.style.width = dinoWidth + "px";
        gameBoard.style.height = gameBoardHeight + "px";

        //set up position of cactus
        gameBoardWidth = gameBoard.offsetWidth;
        startPos = parseInt(gameBoardWidth - cactusWidth);
        cactus.style.left = startPos + "px";

        //set position of dino (in case it was jumping)
        dino.style.bottom = "0px";

    }


    /**
     * This function gets the position of the cactus. Subtracts 20 from that number. 
     * Then resets the position so it moves 20px to the left.
     * If the cactus is already off the screen at the left it resets it to the right.
     * The function is called repeatedly with a timer - see start()
     */
    function moveCactus()
    {
        let leftPos = cactus.style.left;
        //remove the 'px'
        leftPosNumber = parseInt(leftPos);
        let newLeftPosNumber;
    
        if (leftPosNumber > - 120)
        {
            newLeftPosNumber = leftPosNumber - 20;
        }
        else 
        {
            newLeftPosNumber = startPos;
        }
    
        cactus.style.left = newLeftPosNumber + "px";
    }

    /**
     * Handle key presses
     * @param {*} e keypress event
     */
    function keyHandler(e)
    {
        if (e.code == "ArrowUp" || e.code == "KeyJ")
        {
            jump();
        }

        if (e.code == "Space")
        {
            start();
        }
    }


    /**
     * 
     * This function handles the jump of the dinosaur.
     * It makes the dino jump up and when the jump up is completed
     * it makes it jump down.
     * To make the movement smooth we use a timer function to move in 10 little steps (like animation)
     */
    function jump()
    {   
  
        //if the dino is currently jumping don't do anything
        if (dino.style.bottom != "0px")
        {
            return;
        }

        //the jump takes less time on mobile because the cactus is smaller
        let jumpInterval;
        let clearanceSpace;
        if (screenMode == "mobile")
        {
            jumpInterval = 2000;
            clearanceSpace = 25;
        }
        else
        {
            jumpInterval = 4000;
            clearanceSpace = 50;
        }

        //get actual top of cactus so we know how high to jump
        const cactusTop = cactus.offsetTop;
       
        //make dino jump higher than the cactus
        //we do this in increments to make motion smooth
        let targetBottom = (gameBoard.offsetHeight - cactusTop + clearanceSpace);
        const jumpIncrements = parseInt(targetBottom / 10);

        function jumpUp()
        {
            let counter = 1;

            jumpUpTimer = setInterval(function() {
      
                dino.style.bottom = (jumpIncrements * counter) + "px";  
   
                counter++;  
                if (counter > 10)
                {
                    clearInterval(jumpUpTimer);
                    jumpPauseTimer = setTimeout(function() {
                        jumpDown();
                    }, 600);
                }
            }, (jumpInterval / 10));

        }
        jumpUp();

        function jumpDown()
        {
            let counter = 10;
            jumpDownTimer = setInterval(function() {

            dino.style.bottom = (jumpIncrements * counter) + "px";  
            counter--;  
            if (counter < 0)
            {
                clearInterval(jumpDownTimer);
            }
            }, (jumpInterval / 10));
        }

    
    }

    /**
     * This function is repeatedly run (see start()).
     * It continually monitors the position of the dino and the cactus
     * Whenever there is a collision it puts up the Game Over message and starts again
     * It checks for collisions using the positions and widths of the dino and cactus
     *  which it uses to check for overlap.
     */
    function collisionDetection()
    {

        //it is easier to assume collison and then check for no collision
        let collision = true;

        const cactusLeft = cactus.offsetLeft;
        const cactusWidth = cactus.offsetWidth;
        const cactusTop = cactus.offsetTop;
        const cactusRight = cactusLeft + cactusWidth;

        let dinoLeft = dino.offsetLeft;
        const dinoWidth = dino.offsetWidth;
        const dinoHeight = dino.offsetHeight;
        const dinoTop = dino.offsetTop;
        let dinoRight = dinoLeft + dinoWidth;
        const dinoBottom = dinoTop + dinoHeight;

        //some modifications here because our dino has space to left and right of image
        //adjust to suit your image
        //and test!
        dinoRight = dinoRight - 10;
        dinoLeft = dinoLeft - 10;

        //the logic of the following is it needs to be clear both left-right
        //and top-bottom for there to be no collision
        if ((cactusLeft > dinoRight) || (cactusRight < dinoLeft)) 
        {
            collision = false;
        }
        else //there is horizontal overlap: is there vertical overlap as well?
        {
            if (dinoBottom < cactusTop)
            {
                collision = false;
            }
        }

        if (collision)
        {
            displayGameOver();
            init();
        }
         
    }

    /**
     * Display a game over message
     */
    function displayGameOver()
    {
        alert("Game Over!")
    }

    /**
     * Call init() again to reset positons to start positions
     * Start the cactus moving
     * Start the collision detection routine
     */
    function start()
    {
        init();
        
        collisionTimer = setInterval(function() {
            collisionDetection();
        }, 150); //important. this needs to be less than the smallest jump interval in jump()

        cactusTimer = setInterval(function() {
            moveCactus();      
        }, 250);
    }
  
    //bind start() to button click.
    document.getElementById("start").addEventListener('click', start);
    
    //If the user resizes the browser window start again. 
    window.addEventListener('resize', function(event){
        init();
    });

    //capture the keyboard event
    document.addEventListener('keydown', keyHandler);

    //initialize 
    init();


});