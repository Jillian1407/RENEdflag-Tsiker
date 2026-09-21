
import { useEffect, useRef, useState } from "react";

import finishLine from "./img/finish.png";
import platform from "./img/platform.png";
import platformSmallTall from "./img/platformSmallTall.png";
import background from "./img/background.png";
import hills from "./img/hills.png";
import car from "./img/car.png";
import redFlag from "./img/redflag.png";

function Game({ character, onPlayAgain }) {
  const canvasRef = useRef(null);
  const characterRef = useRef(character);
  const onPlayAgainRef = useRef(onPlayAgain);
  const showQuestionRef = useRef(false);

  const [flagCount, setFlagCount] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [hearts, setHearts] = useState(5);
  const [yesAnswers, setYesAnswers] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const totalFlags = 10;
  const maxHearts = 5;

  useEffect(() => {
    characterRef.current = character;
  }, [character]);

  useEffect(() => {
    onPlayAgainRef.current = onPlayAgain;
  }, [onPlayAgain]);

  useEffect(() => {
    showQuestionRef.current = showQuestion;
  }, [showQuestion]);

  const handleAnswer = (answer) => {
    if (answer === "YES") {
      setYesAnswers((previous) => previous + 1);
    }

    setShowQuestion(false);
    setCurrentQuestion("");
    showQuestionRef.current = false;
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const c = canvas.getContext("2d");

    if (!c) {
      return;
    }

    canvas.width = 1024;
    canvas.height = 576;

    const gravity = 0.5;

    function createImage(imageSrc) {
      const image = new Image();
      image.src = imageSrc;
      return image;
    }

    const playerImage = createImage(characterRef.current.image);
    const platformImage = createImage(platform);
    const platformSmallTallImage = createImage(platformSmallTall);
    const backgroundImage = createImage(background);
    const hillsImage = createImage(hills);
    const finishImage = createImage(finishLine);
    const carImage = createImage(car);
    const redFlagImage = createImage(redFlag);

    class Player {
      constructor() {
        this.speed = 10;

        this.position = {
          x: 100,
          y: 100,
        };

        this.velocity = {
          x: 0,
          y: 0,
        };

        this.width = 80;
        this.height = 90;
        this.isJumping = false;
      }

      draw() {
        c.drawImage(
          playerImage,
          this.position.x,
          this.position.y,
          this.width,
          this.height
        );
      }

      update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        this.velocity.y += gravity;

        if (this.position.y < 0) {
          this.position.y = 0;
          this.velocity.y = 0;
        }

        this.draw();
      }
    }

    class Platform {
      constructor({ x, y, image, width }) {
        this.position = {
          x,
          y,
        };

        this.image = image;
        this.width = width || image.width;
        this.height = image.height;
      }

      draw() {
        c.drawImage(
          this.image,
          this.position.x,
          this.position.y,
          this.width,
          this.height
        );
      }
    }

    class GenericObject {
      constructor({
        x,
        y,
        image,
        repeat = false,
      }) {
        this.position = {
          x,
          y,
        };

        this.image = image;
        this.width = image.width;
        this.height = image.height;
        this.repeat = repeat;
      }

      draw() {
        if (!this.image.complete) {
          return;
        }

        if (!this.repeat) {
          c.drawImage(
            this.image,
            this.position.x,
            this.position.y
          );

          return;
        }

        const imageWidth = this.image.width;

        if (imageWidth <= 0) {
          return;
        }

        for (
          let x = this.position.x - imageWidth;
          x < canvas.width;
          x += imageWidth
        ) {
          c.drawImage(
            this.image,
            x,
            this.position.y
          );
        }
      }
    }

    class Finish {
      constructor({ x, y, image }) {
        this.position = {
          x,
          y,
        };

        this.image = image;
        this.width = 180;
        this.height = 120;
      }

      draw() {
        c.drawImage(
          this.image,
          this.position.x,
          this.position.y,
          this.width,
          this.height
        );
      }
    }


    class Car {
      constructor({ x, y, platform }) {
        this.position = {
          x,
          y,
        };

        this.platform = platform;

        
        this.width = 160;
        this.height = 80;

        this.speed = 4;
      }

      draw() {
        c.drawImage(
          carImage,
          this.position.x,
          this.position.y,
          this.width,
          this.height
        );
      }

      update() {
        this.position.x -= this.speed;

        const leftLimit =
          this.platform.position.x;

        const rightLimit =
          this.platform.position.x +
          this.platform.width -
          this.width;

        if (this.position.x <= leftLimit) {
          this.position.x = rightLimit;
        }

        this.draw();
      }
    }

    class RedFlag {
      constructor({ x, y, question }) {
        this.position = {
          x,
          y,
        };

        
        this.width = 80;
        this.height = 100;

        this.collected = false;
        this.question = question;
        this.missedAt = null;
      }

      draw() {
        if (this.collected) {
          return;
        }

        c.drawImage(
          redFlagImage,
          this.position.x,
          this.position.y,
          this.width,
          this.height
        );
      }
    }

    const player = new Player();

    let platforms = [];
    let cars = [];
    let redFlags = [];
    let genericObjects = [];

    let finish = null;
    let finishPlatform = null;

    let animationId = null;
    let gameWon = false;

    let flagsCollected = 0;
    let currentHearts = maxHearts;

    let usedQuestions = [];
    let respawnCooldown = false;

    const questions = [
      "Laging binabalewala yung feelings mo kasi “mababaw lang naman yan.”",

      "Ginagawang competition ang relationship.",

      "Kinukumpara ka sa ibang tao para ma-insecure ka.",

      "Ginagamit ang secrets mo laban sa’yo kapag may away.",

      "Nanghihingi ng favors pero never nag-reciprocate.",

      "Feeling entitled sa time, attention, at effort mo.",

      "Ayaw kang suportahan kapag may achievement ka.",

      "Nang-aasar sa insecurities mo kahit alam niyang sensitive ka doon.",

      "Mahilig mangako pero hindi tinutupad.",

      "Nag-iiba ang trato depende sa kung sino ang kasama.",

      "Disrespectful sa service workers, guards, or strangers.",

      "Laging may excuse kapag nahuhuli sa mali.",

      "Ginagawang personal attack ang simpleng disagreement.",

      "Ayaw mag-compromise kahit maliit na bagay.",

      "Ginagamit ang pera o gifts para makuha ang gusto niya.",

      "Mahilig mangialam sa decisions mo kahit hindi naman siya involved.",

      "Pinaparamdam sa’yo na kailangan mong “patunayan” palagi ang worth mo.",

      "Hindi marunong mag-celebrate ng success ng ibang tao.",

      "Nagpaparinig online imbes na ayusin nang maayos ang problema.",

      "Kapag may conflict, biglang nagde-delete ng messages/posts para palabasing ikaw ang may kasalanan.",
    ];

    const platformPatterns = [
      {
        width: 2600,
        platforms: [
          { x: 0, y: 470, type: "ground", width: 900 },
          { x: 1000, y: 400, type: "small", width: 220 },
          { x: 1400, y: 320, type: "small", width: 220 },
          { x: 1800, y: 400, type: "small", width: 240 },
          { x: 2200, y: 470, type: "ground", width: 400 },
        ],
      },

      {
        width: 2800,
        platforms: [
          { x: 0, y: 470, type: "ground", width: 700 },
          { x: 800, y: 470, type: "ground", width: 700 },
          { x: 1600, y: 380, type: "small", width: 240 },
          { x: 2000, y: 300, type: "small", width: 240 },
          { x: 2400, y: 470, type: "ground", width: 400 },
        ],
      },

      {
        width: 2900,
        platforms: [
          { x: 0, y: 470, type: "ground", width: 600 },
          { x: 750, y: 420, type: "small", width: 220 },
          { x: 1100, y: 350, type: "small", width: 240 },
          { x: 1500, y: 470, type: "ground", width: 700 },
          { x: 2300, y: 350, type: "small", width: 240 },
          { x: 2650, y: 470, type: "ground", width: 250 },
        ],
      },

      {
        width: 3000,
        platforms: [
          { x: 0, y: 470, type: "ground", width: 900 },
          { x: 1050, y: 400, type: "small", width: 220 },
          { x: 1400, y: 300, type: "small", width: 240 },
          { x: 1750, y: 200, type: "small", width: 240 },
          { x: 2150, y: 350, type: "small", width: 240 },
          { x: 2500, y: 470, type: "ground", width: 500 },
        ],
      },

      {
        width: 2900,
        platforms: [
          { x: 0, y: 470, type: "ground", width: 650 },
          { x: 800, y: 470, type: "ground", width: 750 },
          { x: 1700, y: 400, type: "small", width: 240 },
          { x: 2050, y: 300, type: "small", width: 240 },
          { x: 2400, y: 470, type: "ground", width: 500 },
        ],
      },

      {
        width: 3100,
        platforms: [
          { x: 0, y: 470, type: "ground", width: 900 },
          { x: 1050, y: 400, type: "small", width: 240 },
          { x: 1400, y: 320, type: "small", width: 240 },
          { x: 1750, y: 240, type: "small", width: 240 },
          { x: 2100, y: 350, type: "small", width: 240 },
          { x: 2450, y: 470, type: "ground", width: 650 },
        ],
      },

      {
        width: 3200,
        platforms: [
          { x: 0, y: 470, type: "ground", width: 700 },
          { x: 850, y: 380, type: "small", width: 240 },
          { x: 1200, y: 470, type: "ground", width: 800 },
          { x: 2100, y: 350, type: "small", width: 240 },
          { x: 2450, y: 280, type: "small", width: 240 },
          { x: 2800, y: 470, type: "ground", width: 400 },
        ],
      },

      {
        width: 3300,
        platforms: [
          { x: 0, y: 470, type: "ground", width: 1000 },
          { x: 1150, y: 420, type: "small", width: 240 },
          { x: 1500, y: 350, type: "small", width: 240 },
          { x: 1850, y: 280, type: "small", width: 240 },
          { x: 2200, y: 400, type: "small", width: 240 },
          { x: 2550, y: 470, type: "ground", width: 750 },
        ],
      },

      {
        width: 3000,
        platforms: [
          { x: 0, y: 470, type: "ground", width: 800 },
          { x: 950, y: 470, type: "ground", width: 850 },
          { x: 1950, y: 400, type: "small", width: 240 },
          { x: 2300, y: 320, type: "small", width: 240 },
          { x: 2650, y: 470, type: "ground", width: 350 },
        ],
      },

      {
        width: 3400,
        platforms: [
          { x: 0, y: 470, type: "ground", width: 1000 },
          { x: 1150, y: 400, type: "small", width: 250 },
          { x: 1500, y: 320, type: "small", width: 250 },
          { x: 1850, y: 240, type: "small", width: 250 },
          { x: 2200, y: 350, type: "small", width: 250 },
          { x: 2550, y: 470, type: "ground", width: 850 },
        ],
      },
    ];

    const keys = {
      right: false,
      left: false,
      up: false,
    };

    const minimumFlagDistance = 1800;

    function generatePlatformSection(startX, pattern) {
      pattern.platforms.forEach((data) => {
        let image;

        if (data.type === "ground") {
          image = platformImage;
        } else {
          image = platformSmallTallImage;
        }

        const newPlatform = new Platform({
          x: startX + data.x,
          y: data.y,
          image,
          width: data.width,
        });

        platforms.push(newPlatform);
      });
    }

    

    function createOneCar() {
      cars = [];

      const longPlatforms = platforms
        .filter(
          (currentPlatform) =>
            currentPlatform.width >= 650 &&
            currentPlatform.position.x > 1500
        )
        .sort(
          (a, b) =>
            a.position.x - b.position.x
        );

      if (longPlatforms.length === 0) {
        return;
      }

      const targetPlatform = longPlatforms[0];

      const carX =
        targetPlatform.position.x +
        targetPlatform.width / 2 -
        80;

      const carY =
        targetPlatform.position.y - 80;

      cars.push(
        new Car({
          x: carX,
          y: carY,
          platform: targetPlatform,
        })
      );
    }

    function getUnusedQuestion() {
      const unusedQuestions =
        questions.filter(
          (question) =>
            !usedQuestions.includes(question)
        );

      if (unusedQuestions.length === 0) {
        return null;
      }

      const randomIndex =
        Math.floor(
          Math.random() *
            unusedQuestions.length
        );

      const question =
        unusedQuestions[randomIndex];

      usedQuestions.push(question);

      return question;
    }

    function isGoodFlagPlatform(
      currentPlatform,
      existingFlags,
      minimumDistance = minimumFlagDistance
    ) {
      if (!currentPlatform) {
        return false;
      }

      if (currentPlatform.width < 100) {
        return false;
      }

      // Center position for 70px wide flag
      const flagX =
        currentPlatform.position.x +
        currentPlatform.width / 2 -
        35;

      for (const flag of existingFlags) {
        if (
          Math.abs(
            flag.position.x - flagX
          ) < minimumDistance
        ) {
          return false;
        }
      }

      return true;
    }

    function createFlagOnPlatform(
      currentPlatform
    ) {
      const question =
        getUnusedQuestion();

      if (!question) {
        return null;
      }

      const flagX =
        currentPlatform.position.x +
        currentPlatform.width / 2 -
        35;

      // 90px tall flag
      const flagY =
        currentPlatform.position.y - 90;

      return new RedFlag({
        x: flagX,
        y: flagY,
        question,
      });
    }

    function generateInitialFlags() {
      redFlags = [];

      const possiblePlatforms = platforms
        .filter(
          (currentPlatform) =>
            currentPlatform.width >= 100 &&
            currentPlatform.position.x > 500
        )
        .sort(
          (a, b) =>
            a.position.x -
            b.position.x
        );

      for (
        const currentPlatform of possiblePlatforms
      ) {
        if (
          redFlags.length >= totalFlags
        ) {
          break;
        }

        if (
          isGoodFlagPlatform(
            currentPlatform,
            redFlags
          )
        ) {
          const flag =
            createFlagOnPlatform(
              currentPlatform
            );

          if (flag) {
            redFlags.push(flag);
          }
        }
      }
    }

    function respawnMissedFlag(oldFlag) {
      const platformsToRight = platforms
        .filter(
          (currentPlatform) =>
            currentPlatform.position.x >
              oldFlag.position.x +
                minimumFlagDistance &&
            currentPlatform.width >= 100
        )
        .sort(
          (a, b) =>
            a.position.x -
            b.position.x
        );

      for (
        const currentPlatform of platformsToRight
      ) {
        if (
          isGoodFlagPlatform(
            currentPlatform,
            redFlags
          )
        ) {
          const newFlag =
            createFlagOnPlatform(
              currentPlatform
            );

          if (newFlag) {
            return newFlag;
          }
        }
      }

      return null;
    }

    function createFinish() {
      if (!finishPlatform) {
        return;
      }

      finish = new Finish({
        x:
          finishPlatform.position.x +
          finishPlatform.width -
          180,

        y:
          finishPlatform.position.y -
          120,

        image: finishImage,
      });
    }

    function findNearestSafePlatform() {
      if (platforms.length === 0) {
        return null;
      }

      const playerCenter =
        player.position.x +
        player.width / 2;

      const playerBottom =
        player.position.y +
        player.height;

      let bestPlatform = null;
      let bestScore = Infinity;

      for (
        const currentPlatform of platforms
      ) {
        if (currentPlatform.width < 150) {
          continue;
        }

        const platformLeft =
          currentPlatform.position.x;

        const platformRight =
          currentPlatform.position.x +
          currentPlatform.width;

        const platformTop =
          currentPlatform.position.y;

        const horizontalOverlap =
          playerCenter >= platformLeft &&
          playerCenter <= platformRight;

        const horizontalDistance =
          playerCenter < platformLeft
            ? platformLeft -
              playerCenter
            : playerCenter > platformRight
              ? playerCenter -
                platformRight
              : 0;

        const verticalDistance =
          Math.abs(
            platformTop -
              playerBottom
          );

        let score =
          horizontalDistance * 3 +
          verticalDistance;

        if (
          horizontalOverlap &&
          platformTop <= canvas.height
        ) {
          score -= 1000;
        }

        if (
          platformTop >=
          canvas.height + 50
        ) {
          score += 10000;
        }

        if (score < bestScore) {
          bestScore = score;
          bestPlatform =
            currentPlatform;
        }
      }

      return bestPlatform;
    }

    function respawnPlayerOnNearestPlatform() {
      const safePlatform =
        findNearestSafePlatform();

      if (!safePlatform) {
        player.position = {
          x: 100,
          y: 100,
        };

        player.velocity = {
          x: 0,
          y: 0,
        };

        return;
      }

      const platformLeft =
        safePlatform.position.x;

      const platformRight =
        safePlatform.position.x +
        safePlatform.width;

      const playerCenter =
        player.position.x +
        player.width / 2;

      let respawnX =
        playerCenter -
        player.width / 2;

      const minimumX =
        platformLeft + 10;

      const maximumX =
        platformRight -
        player.width -
        10;

      if (maximumX >= minimumX) {
        respawnX = Math.max(
          minimumX,
          Math.min(
            respawnX,
            maximumX
          )
        );
      } else {
        respawnX =
          platformLeft +
          (
            safePlatform.width -
            player.width
          ) / 2;
      }

      player.position = {
        x: respawnX,

        y:
          safePlatform.position.y -
          player.height -
          2,
      };

      player.velocity = {
        x: 0,
        y: 0,
      };

      player.isJumping = false;

      keys.left = false;
      keys.right = false;
      keys.up = false;
    }

    function resetPlayerState() {
      showQuestionRef.current = false;

      setShowQuestion(false);
      setCurrentQuestion("");

      respawnPlayerOnNearestPlatform();
    }

    function loseHeart() {
      if (
        respawnCooldown ||
        gameWon
      ) {
        return;
      }

      respawnCooldown = true;

      currentHearts -= 1;

      if (currentHearts <= 0) {
        currentHearts = maxHearts;

        setHearts(maxHearts);

        initLevel();

        setTimeout(() => {
          respawnCooldown = false;
        }, 500);

        return;
      }

      setHearts(currentHearts);

      resetPlayerState();

      setTimeout(() => {
        respawnCooldown = false;
      }, 700);
    }

    function initLevel() {
      player.position = {
        x: 100,
        y: 100,
      };

      player.velocity = {
        x: 0,
        y: 0,
      };

      player.isJumping = false;

      gameWon = false;

      flagsCollected = 0;

      setFlagCount(0);

      setShowQuestion(false);
      setCurrentQuestion("");

      showQuestionRef.current = false;

      keys.left = false;
      keys.right = false;
      keys.up = false;

      platforms = [];
      cars = [];
      redFlags = [];

      finish = null;
      finishPlatform = null;

      usedQuestions = [];

      respawnCooldown = false;

      const numberOfSections = 10;

      let currentX = 0;

      for (
        let i = 0;
        i < numberOfSections;
        i++
      ) {
        const patternIndex =
          Math.floor(
            Math.random() *
              platformPatterns.length
          );

        const pattern =
          platformPatterns[
            patternIndex
          ];

        generatePlatformSection(
          currentX,
          pattern
        );

        currentX += pattern.width;
      }

      /*
       * IMPORTANT:
       * One car only.
       */
      createOneCar();

      generateInitialFlags();

      const finalPlatforms = platforms
        .filter(
          (currentPlatform) =>
            currentPlatform.position.x +
              currentPlatform.width >=
            currentX - 1000
        )
        .sort(
          (a, b) =>
            b.position.x -
            a.position.x
        );

      if (finalPlatforms.length > 0) {
        finishPlatform =
          finalPlatforms.find(
            (currentPlatform) =>
              currentPlatform.width >= 500
          ) ||
          finalPlatforms[0];
      }

      genericObjects = [
        new GenericObject({
          x: -1,
          y: -1,
          image: backgroundImage,
          repeat: true,
        }),

        new GenericObject({
          x: -1,
          y: -1,
          image: hillsImage,
          repeat: true,
        }),
      ];
    }

    function handlePlatformCollisions() {
      platforms.forEach(
        (currentPlatform) => {
          if (
            player.position.x +
              player.width >
              currentPlatform.position.x &&
            player.position.x <
              currentPlatform.position.x +
                currentPlatform.width &&
            player.position.y +
              player.height <=
              currentPlatform.position.y &&
            player.position.y +
              player.height +
              player.velocity.y >=
              currentPlatform.position.y
          ) {
            player.velocity.y = 0;

            player.position.y =
              currentPlatform.position.y -
              player.height;

            player.isJumping = false;
          }

          if (
            player.position.x +
              player.width >
              currentPlatform.position.x &&
            player.position.x <
              currentPlatform.position.x &&
            player.position.y +
              player.height >
              currentPlatform.position.y &&
            player.position.y <
              currentPlatform.position.y +
                currentPlatform.height
          ) {
            player.position.x =
              currentPlatform.position.x -
              player.width;

            player.velocity.x = 0;
          }

          if (
            player.position.x <
              currentPlatform.position.x +
                currentPlatform.width &&
            player.position.x +
              player.width >
              currentPlatform.position.x +
                currentPlatform.width &&
            player.position.y +
              player.height >
              currentPlatform.position.y &&
            player.position.y <
              currentPlatform.position.y +
                currentPlatform.height
          ) {
            player.position.x =
              currentPlatform.position.x +
              currentPlatform.width;

            player.velocity.x = 0;
          }
        }
      );
    }

    function handleCarCollisions() {
      for (
        const currentCar of cars
      ) {
        const playerRight =
          player.position.x +
          player.width;

        const playerBottom =
          player.position.y +
          player.height;

        const carRight =
          currentCar.position.x +
          currentCar.width;

        const carBottom =
          currentCar.position.y +
          currentCar.height;

        const touchingCar =
          player.position.x <
            carRight &&
          playerRight >
            currentCar.position.x &&
          player.position.y <
            carBottom &&
          playerBottom >
            currentCar.position.y;

        if (touchingCar) {
          loseHeart();
          return true;
        }
      }

      return false;
    }

    function handleRedFlagCollection() {
      redFlags.forEach(
        (flag) => {
          if (flag.collected) {
            return;
          }

          const playerRight =
            player.position.x +
            player.width;

          const playerBottom =
            player.position.y +
            player.height;

          const flagRight =
            flag.position.x +
            flag.width;

          const flagBottom =
            flag.position.y +
            flag.height;

          const touchingFlag =
            player.position.x <
              flagRight &&
            playerRight >
              flag.position.x &&
            player.position.y <
              flagBottom &&
            playerBottom >
              flag.position.y;

          if (touchingFlag) {
            flag.collected = true;

            flagsCollected += 1;

            setFlagCount(
              flagsCollected
            );

            setCurrentQuestion(
              flag.question
            );

            setShowQuestion(true);

            showQuestionRef.current = true;

            if (
              flagsCollected ===
              totalFlags
            ) {
              createFinish();
            }
          }
        }
      );
    }

    function handleMissedFlags() {
      redFlags.forEach(
        (flag, index) => {
          if (flag.collected) {
            return;
          }

          if (
            flag.position.x +
              flag.width <
            player.position.x
          ) {
            if (
              flag.missedAt === null
            ) {
              flag.missedAt =
                Date.now();

              return;
            }

            const timePassed =
              Date.now() -
              flag.missedAt;

            if (
              timePassed >= 3000
            ) {
              const newFlag =
                respawnMissedFlag(
                  flag
                );

              if (newFlag) {
                redFlags[index] =
                  newFlag;
              }
            }
          } else {
            flag.missedAt = null;
          }
        }
      );
    }

    function moveWorld(amount) {
      platforms.forEach(
        (currentPlatform) => {
          currentPlatform.position.x +=
            amount;
        }
      );

      cars.forEach(
        (currentCar) => {
          currentCar.position.x +=
            amount;
        }
      );

      redFlags.forEach(
        (flag) => {
          flag.position.x += amount;
        }
      );

      if (finish) {
        finish.position.x += amount;
      }
    }

    function handlePlayerMovement() {
      if (
        keys.right &&
        player.position.x < 400
      ) {
        player.velocity.x =
          player.speed;
      } else if (
        keys.left &&
        player.position.x > 100
      ) {
        player.velocity.x =
          -player.speed;
      } else {
        player.velocity.x = 0;

        if (keys.right) {
          moveWorld(
            -player.speed
          );

          genericObjects.forEach(
            (genericObject) => {
              genericObject.position.x -=
                player.speed * 0.66;

              if (
                genericObject.position.x <=
                -genericObject.width
              ) {
                genericObject.position.x +=
                  genericObject.width;
              }
            }
          );
        } else if (keys.left) {
          moveWorld(
            player.speed
          );

          genericObjects.forEach(
            (genericObject) => {
              genericObject.position.x +=
                player.speed * 0.66;

              if (
                genericObject.position.x >=
                genericObject.width
              ) {
                genericObject.position.x -=
                  genericObject.width;
              }
            }
          );
        }
      }
    }

    function checkWin() {
      if (!finish || gameWon) {
        return;
      }

      if (
        flagsCollected <
        totalFlags
      ) {
        return;
      }

      const playerRight =
        player.position.x +
        player.width;

      const playerBottom =
        player.position.y +
        player.height;

      const finishRight =
        finish.position.x +
        finish.width;

      const finishBottom =
        finish.position.y +
        finish.height;

      const touchingFinish =
        playerRight >=
          finish.position.x &&
        player.position.x <=
          finishRight &&
        playerBottom >=
          finish.position.y &&
        player.position.y <=
          finishBottom;

      if (touchingFinish) {
        gameWon = true;

        player.velocity.x = 0;
        player.velocity.y = 0;

        setShowResults(true);
      }
    }

    function animate() {
      animationId =
        requestAnimationFrame(
          animate
        );

      c.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      genericObjects.forEach(
        (genericObject) => {
          genericObject.draw();
        }
      );

      platforms.forEach(
        (currentPlatform) => {
          currentPlatform.draw();
        }
      );

      redFlags.forEach(
        (flag) => {
          flag.draw();
        }
      );

      cars.forEach(
        (currentCar) => {
          if (!gameWon) {
            currentCar.update();
          } else {
            currentCar.draw();
          }
        }
      );

      player.update();

      handlePlatformCollisions();

      if (
        !gameWon &&
        !showQuestionRef.current &&
        !respawnCooldown
      ) {
        const carHit =
          handleCarCollisions();

        if (carHit) {
          return;
        }

        handleRedFlagCollection();

        handleMissedFlags();

        handlePlayerMovement();
      }

      if (finish) {
        finish.draw();
      }

      checkWin();

      if (
        player.position.y >
        canvas.height + 100
      ) {
        loseHeart();
      }
    }

    function handleKeyDown(event) {
      if (showQuestionRef.current) {
        return;
      }

      switch (event.code) {
        case "KeyA":
        case "ArrowLeft":
          keys.left = true;
          break;

        case "KeyD":
        case "ArrowRight":
          keys.right = true;
          break;

        case "KeyW":
        case "ArrowUp":
        case "Space":
          event.preventDefault();

          if (
            !keys.up &&
            !player.isJumping
          ) {
            player.velocity.y = -18;
            player.isJumping = true;
          }

          keys.up = true;
          break;

        default:
          break;
      }
    }

    function handleKeyUp(event) {
      switch (event.code) {
        case "KeyA":
        case "ArrowLeft":
          keys.left = false;
          break;

        case "KeyD":
        case "ArrowRight":
          keys.right = false;
          break;

        case "KeyW":
        case "ArrowUp":
        case "Space":
          keys.up = false;
          break;

        default:
          break;
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    window.addEventListener(
      "keyup",
      handleKeyUp
    );

    initLevel();
    animate();

    return () => {
      if (animationId !== null) {
        cancelAnimationFrame(
          animationId
        );
      }

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      window.removeEventListener(
        "keyup",
        handleKeyUp
      );
    };
  }, []);


  const percentage = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        (yesAnswers / totalFlags) *
          100
      )
    )
  );

  let resultClass = "green";

  let resultTitle =
    "YOUR PARTNER'S FLAG";

  let resultDescription =
    "You recognized very few of the situations as red flags. Remember that respect, communication, and healthy boundaries matter in every relationship.";

  if (percentage >= 70) {
    resultClass = "red";

    resultTitle =
      "YOUR PARTNER'S FLAG: RED";

    resultDescription =
      "You recognized many situations that may be red flags in a relationship. Pay attention to patterns, respect, communication, and your personal boundaries.";
  } else if (percentage >= 40) {
    resultClass = "orange";

    resultTitle =
      "YOUR PARTNER'S FLAG: CAUTION";

    resultDescription =
      "You recognized some situations that may need attention. Healthy relationships involve respect, honest communication, and boundaries.";
  }

  return (
    <div className="game-container">
      <canvas ref={canvasRef}></canvas>

      <div className="game-character">
        Playing as: {character.name}
      </div>

      <div className="game-character">
        Red Flags: {flagCount}/{totalFlags}
      </div>

      <div className="game-hearts">
        {Array.from(
          { length: maxHearts },
          (_, index) => (
            <span
              key={index}
              className={
                index < hearts
                  ? "heart active"
                  : "heart empty"
              }
            >
              ♥
            </span>
          )
        )}
      </div>

      {showQuestion && (
        <div className="question-overlay">
          <div className="question-banner">
            <h2>
              {currentQuestion}
            </h2>

            <div className="question-buttons">
              <button
                type="button"
                onClick={() =>
                  handleAnswer("YES")
                }
              >
                YES
              </button>

              <button
                type="button"
                onClick={() =>
                  handleAnswer("NO")
                }
              >
                NO
              </button>
            </div>
          </div>
        </div>
      )}

      {showResults && (
        <div className="result-overlay">
          <div className="result-banner">

            <div className="result-title">
              GAME COMPLETE!
            </div>

            <div
              className={`result-flag ${resultClass}`}
            >
              {resultTitle}
            </div>

            <div className="result-percentage">
              {percentage}%
            </div>

            <div className="result-score">
              You identified{" "}
              <strong>
                {yesAnswers}
              </strong>{" "}
              out of{" "}
              <strong>
                {totalFlags}
              </strong>{" "}
              situations as red flags.
            </div>

            <div className="result-description">
              {resultDescription}
            </div>

            <button
              type="button"
              className="restart-button"
              onClick={() => {
                setShowResults(false);

                setYesAnswers(0);

                setHearts(
                  maxHearts
                );

                if (
                  onPlayAgainRef.current
                ) {
                  onPlayAgainRef.current();
                }
              }}
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;

