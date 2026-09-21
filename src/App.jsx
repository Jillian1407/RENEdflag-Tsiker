
import { useState, useEffect, useRef } from "react";
import "./App.css";

import Game from "./Game";

import bgImage from "./img/bg.jpg";
import lenImage from "./img/len.png";
import darwishImage from "./img/darwish.png";
import jellImage from "./img/jell.png";
import yuanImage from "./img/yuan.png";
import teyaImage from "./img/teya.png";
import euniceImage from "./img/eunice.png";

import bgmusic from "./assets/bgmusic.mp3";

function App() {
  const [screen, setScreen] = useState("start");
  const [currentCharacter, setCurrentCharacter] = useState(0);

  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);

  const playerWords = [
    "second option",
    "backburner",
    "pinaglaruan",
    "rebound",
    "pinaasa",
    "sa una lang pinasaya",
    "di pinili",
    "hindi sineryoso",
    "backup plan",
    "pampalipas oras",
    "pang character development",
    "trial card",
  ];

  const [playerWord, setPlayerWord] = useState(0);

  const characters = [
    {
      name: "LENe Butterboni",
      image: lenImage,
    },
    {
      name: "Darwishes",
      image: darwishImage,
    },
    {
      name: "Jell D. Makausad",
      image: jellImage,
    },
    {
      name: "Yuanikels",
      image: yuanImage,
    },
    {
      name: "Teya Batumbakal",
      image: teyaImage,
    },
    {
      name: "Yonnaise Dimagiba",
      image: euniceImage,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlayerWord((previous) => {
        return (previous + 1) % playerWords.length;
      });
    }, 1500);

    return () => {
      clearInterval(interval);

      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, []);

  const handleStart = () => {
    setScreen("selection");
  };

  const handlePrevious = () => {
    setCurrentCharacter((previous) => {
      if (previous === 0) {
        return characters.length - 1;
      }

      return previous - 1;
    });
  };

  const handleNext = () => {
    setCurrentCharacter((previous) => {
      if (previous === characters.length - 1) {
        return 0;
      }

      return previous + 1;
    });
  };

  const fadeOutMusic = () => {
    const audio = audioRef.current;

    // Show the game immediately
    setScreen("game");

    if (!audio) {
      return;
    }

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    fadeIntervalRef.current = setInterval(() => {
      if (audio.volume > 0.05) {
        audio.volume = Math.max(0, audio.volume - 0.05);
      } else {
        audio.volume = 0;
        audio.pause();

        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }
    }, 100);
  };

  const handleSelect = () => {
    fadeOutMusic();
  };

  const handlePlayAgain = () => {
    const audio = audioRef.current;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.5;

      audio.play().catch(() => {
        console.log("Music could not play.");
      });
    }

    setCurrentCharacter(0);
    setScreen("start");
  };

  const getVisibleCharacters = () => {
    let start = currentCharacter - 1;

    if (start < 0) {
      start = 0;
    }

    if (start > characters.length - 3) {
      start = characters.length - 3;
    }

    return characters
      .slice(start, start + 3)
      .map((character, index) => ({
        ...character,
        originalIndex: start + index,
      }));
  };

  return (
    <div className="app">
      <audio
        ref={audioRef}
        src={bgmusic}
        loop
        autoPlay
        onCanPlay={() => {
          const audio = audioRef.current;

          if (audio) {
            audio.volume = 0.5;

            audio.play().catch(() => {
              console.log("Autoplay was blocked by the browser.");
            });
          }
        }}
      />

      {screen === "start" && (
        <div
          className="start-screen"
          style={{
            backgroundImage: `url(${bgImage})`,
          }}
        >
          <div className="intro">
            <p className="barangay">
              Welcome to Barangay Pitipiwpiwiwiw
            </p>

            <h1>RENEdflag Tsiker</h1>

            <p className="player">
              Welcome {playerWords[playerWord]}!
            </p>

            <button
              id="startButton"
              onClick={handleStart}
            >
              START
            </button>
          </div>
        </div>
      )}

      {screen === "selection" && (
        <div className="game">
          <h1>CHOOSE YOUR CHARACTER</h1>

          <div className="selection-box">
            <div className="character-selector">
              <button
                type="button"
                className="arrow"
                id="previousButton"
                onClick={handlePrevious}
              >
                ◀
              </button>

              <div className="characters">
                {getVisibleCharacters().map((character) => (
                  <div
                    key={character.originalIndex}
                    className={`character-option ${
                      character.originalIndex === currentCharacter
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setCurrentCharacter(character.originalIndex)
                    }
                  >
                    <img
                      src={character.image}
                      alt={character.name}
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="arrow"
                id="nextButton"
                onClick={handleNext}
              >
                ▶
              </button>
            </div>

            <div className="character-name">
              {characters[currentCharacter].name}
            </div>

            <button
              type="button"
              className="select-button"
              id="selectButton"
              onClick={handleSelect}
            >
              SELECT
            </button>
          </div>
        </div>
      )}

      {screen === "game" && (
        <Game
          character={characters[currentCharacter]}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}

export default App;

