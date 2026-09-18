import { useState } from "react";
import "./App.css";
import Game from "./Game";

import bgImage from "./img/bg.png";
import lenImage from "./img/len.png";
import darwishImage from "./img/darwish.png";
import jellImage from "./img/jell.png";
import yuanImage from "./img/yuan.png";
import teyaImage from "./img/teya.png";
import euniceImage from "./img/eunice.png";

function App() {
  const [screen, setScreen] = useState("start");
  const [currentCharacter, setCurrentCharacter] = useState(0);

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
      name: "BOJell Joy",
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

  // START button
  const handleStart = () => {
    setScreen("selection");
  };

  // Previous character
  const handlePrevious = () => {
    setCurrentCharacter((previous) => {
      if (previous === 0) {
        return characters.length - 1;
      }

      return previous - 1;
    });
  };

  // Next character
  const handleNext = () => {
    setCurrentCharacter((previous) => {
      if (previous === characters.length - 1) {
        return 0;
      }

      return previous + 1;
    });
  };

  // Select character
  const handleSelect = () => {
    setScreen("game");
  };

  // Get 3 characters to display
  const getVisibleCharacters = () => {
    let start = currentCharacter - 1;

    if (start < 0) {
      start = 0;
    }

    if (start > characters.length - 3) {
      start = characters.length - 3;
    }

    return characters.slice(start, start + 3).map((character, index) => ({
      ...character,
      originalIndex: start + index,
    }));
  };

  return (
    <div className="app">


      {screen === "start" && (
        <div
          className="start-screen"
          style={{
            backgroundImage: `url(${bgImage})`,
          }}
        >
          <div className="intro">
            <p className="barangay">
              Welcome to Barangay Pitipiwpiwiw
            </p>

            <h1>RENEdflag Tsiker</h1>

            <p className="player">
              Welcome, Player!
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
        <Game character={characters[currentCharacter]}
        onPlayAgain={() => setScreen("start")}/>
)}

    </div>
  );
}

export default App;