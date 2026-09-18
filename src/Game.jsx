import { useEffect, useRef, useState } from "react";

import redFlag from "./img/redflag.png";
import finishLine from "./img/finish.png";
import platform from "./img/platform.png";
import platformSmallTall from "./img/platformSmallTall.png";
import background from "./img/background.png";
import hills from "./img/hills.png";

function Game({ character, onPlayAgain }) {
  const canvasRef = useRef(null);

  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [resultType, setResultType] = useState("");
  const [resultPercentage, setResultPercentage] = useState(0);
  const [yesCountDisplay, setYesCountDisplay] = useState(0);

  const questionActiveRef = useRef(false);
  const scoreRef = useRef(0);
  const flagsCollectedRef = useRef(0);
  const resultShownRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const c = canvas.getContext("2d");

    canvas.width = 1024;
    canvas.height = 576;

    const gravity = 0.5;

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

    function createImage(imageSrc) {
      const image = new Image();
      image.src = imageSrc;
      return image;
    }

    const playerImage = createImage(character.image);
    const redFlagImage = createImage(redFlag);
    const platformImage = createImage(platform);
    const platformSmallTallImage = createImage(platformSmallTall);
    const backgroundImage = createImage(background);
    const hillsImage = createImage(hills);
    const finishImage = createImage(finishLine);

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
      constructor({ x, y, image }) {
        this.position = {
          x,
          y,
        };

        this.image = image;
        this.width = image.width;
        this.height = image.height;
      }

      draw() {
        c.drawImage(
          this.image,
          this.position.x,
          this.position.y
        );
      }
    }

    class GenericObject {
      constructor({ x, y, image }) {
        this.position = {
          x,
          y,
        };

        this.image = image;
        this.width = image.width;
        this.height = image.height;
      }

      draw() {
        c.drawImage(
          this.image,
          this.position.x,
          this.position.y
        );
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

    class RedFlag {
      constructor({
        platform,
        image,
        question,
        x,
        y,
      }) {
        this.platform = platform || null;
        this.image = image;
        this.question = question;

        this.width = 70;
        this.height = 90;

        this.triggered = false;

        this.position = {
          x: x ?? 0,
          y: y ?? 0,
        };

        if (this.platform) {
          this.updatePosition();
        }
      }

      updatePosition() {
        if (this.platform) {
          this.position.x =
            this.platform.position.x +
            this.platform.width / 2 -
            this.width / 2;

          this.position.y =
            this.platform.position.y -
            this.height;
        }
      }

      draw() {
        if (this.platform) {
          this.updatePosition();
        }

        if (!this.triggered) {
          c.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
          );
        }
      }
    }

    const player = new Player();

    let platforms = [];
    let genericObjects = [];
    let finish;
    let flags = [];
    let scrollOffset = 0;
    let animationId;

    const keys = {
      right: {
        pressed: false,
      },
      left: {
        pressed: false,
      },
      up: {
        pressed: false,
      },
    };

    function getRandomQuestions() {
      const shuffled = [...questions];

      for (let i = shuffled.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(
          Math.random() * (i + 1)
        );

        [shuffled[i], shuffled[randomIndex]] = [
          shuffled[randomIndex],
          shuffled[i],
        ];
      }

      return shuffled.slice(0, 10);
    }

    function init() {
      player.position = {
        x: 100,
        y: 100,
      };

      player.velocity = {
        x: 0,
        y: 0,
      };

      player.isJumping = false;

      questionActiveRef.current = false;
      scoreRef.current = 0;
      flagsCollectedRef.current = 0;
      resultShownRef.current = false;

      setShowQuestion(false);
      setCurrentQuestion("");
      setShowResult(false);
      setResultType("");
      setResultPercentage(0);
      setYesCountDisplay(0);

      platforms = [
        new Platform({
          x: -1,
          y: 470,
          image: platformImage,
        }),

        new Platform({
          x: platformImage.width - 3,
          y: 470,
          image: platformImage,
        }),

        new Platform({
          x: platformImage.width * 2 + 100,
          y: 470,
          image: platformImage,
        }),

        new Platform({
          x: platformImage.width * 3 + 50,
          y: 370,
          image: platformSmallTallImage,
        }),

        new Platform({
          x: platformImage.width * 3 + 400,
          y: 470,
          image: platformImage,
        }),

        new Platform({
          x: platformImage.width * 4 + 100,
          y: 350,
          image: platformSmallTallImage,
        }),

        new Platform({
          x: platformImage.width * 4 + 450,
          y: 470,
          image: platformImage,
        }),

        new Platform({
          x: platformImage.width * 5 + 150,
          y: 320,
          image: platformSmallTallImage,
        }),

        new Platform({
          x: platformImage.width * 5 + 500,
          y: 470,
          image: platformImage,
        }),

        new Platform({
          x: platformImage.width * 6 + 100,
          y: 390,
          image: platformSmallTallImage,
        }),

        new Platform({
          x: platformImage.width * 6 + 450,
          y: 300,
          image: platformSmallTallImage,
        }),

        new Platform({
          x: platformImage.width * 6 + 800,
          y: 470,
          image: platformImage,
        }),

        new Platform({
          x: platformImage.width * 7 + 250,
          y: 350,
          image: platformSmallTallImage,
        }),

        new Platform({
          x: platformImage.width * 7 + 600,
          y: 280,
          image: platformSmallTallImage,
        }),

        new Platform({
          x: platformImage.width * 8 + 100,
          y: 470,
          image: platformImage,
        }),

        new Platform({
          x: platformImage.width * 9 + 100,
          y: 470,
          image: platformImage,
        }),
      ];

      genericObjects = [
        new GenericObject({
          x: -1,
          y: -1,
          image: backgroundImage,
        }),

        new GenericObject({
          x: -1,
          y: -1,
          image: hillsImage,
        }),
      ];

      finish = new Finish({
        x: platformImage.width * 9 + 500,
        y: 350,
        image: finishImage,
      });

      const selectedQuestions = getRandomQuestions();

      flags = [
        new RedFlag({
          platform: platforms[0],
          image: redFlagImage,
          question: selectedQuestions[0],
        }),

        new RedFlag({
          x: platformImage.width * 2 + 170,
          y: 270,
          image: redFlagImage,
          question: selectedQuestions[1],
        }),

        new RedFlag({
          platform: platforms[3],
          image: redFlagImage,
          question: selectedQuestions[2],
        }),

        new RedFlag({
          x: platformImage.width * 3 + 180,
          y: 240,
          image: redFlagImage,
          question: selectedQuestions[3],
        }),

        new RedFlag({
          platform: platforms[5],
          image: redFlagImage,
          question: selectedQuestions[4],
        }),

        new RedFlag({
          x: platformImage.width * 5 + 20,
          y: 220,
          image: redFlagImage,
          question: selectedQuestions[5],
        }),

        new RedFlag({
          platform: platforms[10],
          image: redFlagImage,
          question: selectedQuestions[6],
        }),

        new RedFlag({
          x: platformImage.width * 7 + 40,
          y: 210,
          image: redFlagImage,
          question: selectedQuestions[7],
        }),

        new RedFlag({
          platform: platforms[13],
          image: redFlagImage,
          question: selectedQuestions[8],
        }),

        new RedFlag({
          x: platformImage.width * 8 + 300,
          y: 250,
          image: redFlagImage,
          question: selectedQuestions[9],
        }),
      ];

      scrollOffset = 0;
    }

    function animate() {
      animationId = requestAnimationFrame(animate);

      c.fillStyle = "white";
      c.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      genericObjects.forEach((genericObject) => {
        genericObject.draw();
      });

      platforms.forEach((platform) => {
        platform.draw();
      });

      flags.forEach((flag) => {
        flag.draw();
      });

      if (!questionActiveRef.current) {
        player.update();
      } else {
        player.draw();
      }

      platforms.forEach((platform) => {
        if (
          player.position.x + player.width >
            platform.position.x &&
          player.position.x <
            platform.position.x + platform.width &&
          player.position.y + player.height <=
            platform.position.y &&
          player.position.y +
            player.height +
            player.velocity.y >=
            platform.position.y
        ) {
          player.velocity.y = 0;

          player.position.y =
            platform.position.y -
            player.height;

          player.isJumping = false;
        }

        if (
          player.position.x + player.width >
            platform.position.x &&
          player.position.x <
            platform.position.x &&
          player.position.y + player.height >
            platform.position.y &&
          player.position.y <
            platform.position.y +
              platform.height
        ) {
          player.position.x =
            platform.position.x -
            player.width;

          player.velocity.x = 0;
        }

        if (
          player.position.x <
            platform.position.x +
              platform.width &&
          player.position.x + player.width >
            platform.position.x +
              platform.width &&
          player.position.y + player.height >
            platform.position.y &&
          player.position.y <
            platform.position.y +
              platform.height
        ) {
          player.position.x =
            platform.position.x +
            platform.width;

          player.velocity.x = 0;
        }
      });

      flags.forEach((flag) => {
        if (flag.triggered) {
          return;
        }

        flag.updatePosition();

        const playerLeft = player.position.x;
        const playerRight =
          player.position.x + player.width;
        const playerTop = player.position.y;
        const playerBottom =
          player.position.y + player.height;

        const flagLeft = flag.position.x;
        const flagRight =
          flag.position.x + flag.width;
        const flagTop = flag.position.y;
        const flagBottom =
          flag.position.y + flag.height;

        if (
          playerRight > flagLeft &&
          playerLeft < flagRight &&
          playerBottom > flagTop &&
          playerTop < flagBottom
        ) {
          flag.triggered = true;

          questionActiveRef.current = true;

          player.velocity.x = 0;
          player.velocity.y = 0;

          flagsCollectedRef.current += 1;

          setCurrentQuestion(flag.question);
          setShowQuestion(true);
        }
      });

      finish.draw();

      if (
        flagsCollectedRef.current === 10 &&
        !resultShownRef.current &&
        player.position.x + player.width >=
          finish.position.x &&
        player.position.x <=
          finish.position.x + finish.width &&
        player.position.y + player.height >=
          finish.position.y &&
        player.position.y <=
          finish.position.y + finish.height
      ) {
        resultShownRef.current = true;

        questionActiveRef.current = true;

        player.velocity.x = 0;
        player.velocity.y = 0;

        const percentage =
          scoreRef.current * 10;

        let type = "";

        if (percentage <= 30) {
          type = "GREEN FLAG";
        } else if (percentage <= 60) {
          type = "ORANGE FLAG";
        } else {
          type = "RED FLAG";
        }

        setResultPercentage(percentage);
        setYesCountDisplay(scoreRef.current);
        setResultType(type);
        setShowResult(true);
      }

      if (player.position.y > canvas.height) {
        init();
      }

      if (!questionActiveRef.current) {
        if (
          keys.right.pressed &&
          player.position.x < 400
        ) {
          player.velocity.x = player.speed;
        } else if (
          keys.left.pressed &&
          player.position.x > 100
        ) {
          player.velocity.x = -player.speed;
        } else {
          player.velocity.x = 0;

          if (keys.right.pressed) {
            scrollOffset += player.speed;

            platforms.forEach((platform) => {
              platform.position.x -= player.speed;
            });

            flags.forEach((flag) => {
              if (!flag.platform) {
                flag.position.x -= player.speed;
              }
            });

            genericObjects.forEach(
              (genericObject) => {
                genericObject.position.x -=
                  player.speed * 0.66;
              }
            );

            finish.position.x -= player.speed;
          } else if (keys.left.pressed) {
            scrollOffset -= player.speed;

            platforms.forEach((platform) => {
              platform.position.x += player.speed;
            });

            flags.forEach((flag) => {
              if (!flag.platform) {
                flag.position.x += player.speed;
              }
            });

            genericObjects.forEach(
              (genericObject) => {
                genericObject.position.x +=
                  player.speed * 0.66;
              }
            );

            finish.position.x += player.speed;
          }
        }
      }
    }

    function handleKeyDown(event) {
      if (questionActiveRef.current) {
        return;
      }

      switch (event.code) {
        case "KeyA":
          keys.left.pressed = true;
          break;

        case "KeyD":
          keys.right.pressed = true;
          break;

        case "KeyW":
          if (
            !keys.up.pressed &&
            !player.isJumping
          ) {
            player.velocity.y = -18;
            player.isJumping = true;
          }

          keys.up.pressed = true;
          break;

        default:
          break;
      }
    }

    function handleKeyUp(event) {
      switch (event.code) {
        case "KeyA":
          keys.left.pressed = false;
          break;

        case "KeyD":
          keys.right.pressed = false;
          break;

        case "KeyW":
          keys.up.pressed = false;
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

    init();
    animate();

    return () => {
      cancelAnimationFrame(animationId);

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      window.removeEventListener(
        "keyup",
        handleKeyUp
      );
    };
  }, [character]);

  const handleAnswer = (answer) => {
    if (answer === "YES") {
      scoreRef.current += 1;
    }

    questionActiveRef.current = false;

    setShowQuestion(false);
    setCurrentQuestion("");
  };

  const handleRestart = () => {
    questionActiveRef.current = true;

    if (onPlayAgain) {
      onPlayAgain();
    }
  };

  return (
    <div className="game-container">
      <canvas ref={canvasRef}></canvas>

      <div className="game-character">
        Playing as: {character.name}
      </div>

      {showQuestion && (
        <div className="question-overlay">
          <div className="question-banner">
            <h2>{currentQuestion}</h2>

            <div className="question-buttons">
              <button
                onClick={() =>
                  handleAnswer("YES")
                }
              >
                YES
              </button>

              <button
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

      {showResult && (
        <div className="result-overlay">
          <div className="result-banner">
            <div className="result-title">
              YOUR RESULT
            </div>

            <div
              className={`result-flag ${
                resultType === "GREEN FLAG"
                  ? "green"
                  : resultType === "ORANGE FLAG"
                  ? "orange"
                  : "red"
              }`}
            >
              {resultType}
            </div>

            <div className="result-percentage">
              {resultPercentage}%
            </div>

            <p className="result-score">
              You answered YES to{" "}
              <strong>
                {yesCountDisplay} out of 10
              </strong>{" "}
              red flag questions.
            </p>

            <p className="result-description">
              {resultType === "GREEN FLAG" &&
                "Most of your answers did not identify the behaviors as red flags."}

              {resultType === "ORANGE FLAG" &&
                "Some behaviors may need more attention and awareness."}

              {resultType === "RED FLAG" &&
                "Many of the behaviors were identified as red flags."}
            </p>

            <button type="button" className="restart-button" onClick={handleRestart}>PLAY AGAIN </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;