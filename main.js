import CardCounter from "./cardCounter.js";

let cardCounter = new CardCounter();

// order cities by color, insert buttons, add click events
function setup() {
    let buttonContainer = document.createElement("div");
    buttonContainer.id = "cities-button-container";

    let appendToContainer = (cityColor, buttonObj) => {
      switch(cityColor) {
        case "blue":
          blueContainer.appendChild(buttonObj);
          break;
        case "yellow":
          yellowContainer.appendChild(buttonObj);
          break;
        default:
          blackContainer.appendChild(buttonObj);
          break;
      }
    }

    let blueContainer = document.createElement("div");
    blueContainer.className = "city-color-container";
    blueContainer.id = "blue-city-container";

    let yellowContainer = document.createElement("div");
    yellowContainer.className = "city-color-container";
    yellowContainer.id = "yellow-city-container";

    let blackContainer = document.createElement("div");
    blackContainer.className = "city-color-container";
    blackContainer.id = "black-city-container";

    for (let city in cardCounter.drawnInfectionCards) {
      let cityButton = document.createElement("button");
      cityButton.id = city;
      cityButton.textContent = city;
      cityButton.onclick = (e) => {
        let cityName = e.currentTarget.id;
        if (cardCounter.isEpidemic) {
          document.getElementById("epidemic").textContent = "Epidemic";
        }
        cardCounter.drawCard(cityName);
        render();
      };

      appendToContainer(cardCounter.drawnInfectionCards[city].color, cityButton);
    }

    buttonContainer.appendChild(blueContainer);
    buttonContainer.appendChild(yellowContainer);
    buttonContainer.appendChild(blackContainer);
    document.getElementById("infect").appendChild(buttonContainer);
}
setup();

function render() {
  if (cardCounter.isReset) {
    cardCounter.isReset = false;
    document.getElementById("reset").textContent = "Reset game";
  }

  // show infected cities
  let infectedCities = "";
  cardCounter.currentRound.forEach(cityName => {
    let cityObj = cardCounter.drawnInfectionCards[cityName];
    infectedCities += `<div class="infected-city ${cityObj.color}">${cityName}</div>`;
  });
  document.getElementById("infected-cities-list").innerHTML = infectedCities;

  let previousRound;

  // calculate odds of infection
  for (let i = cardCounter.allRounds.length - 1; i >= 0; i--) {
    if (cardCounter.allRounds[i].length > 0) {
      previousRound = cardCounter.allRounds[i];
      break;
    }
  }

  let oddsList = [];
  if (previousRound) {
    let possibleCards = {};

    // haven't finished previously drawn infection deck, calculate odds using that
    let leftInRound = previousRound.length;
    previousRound.forEach(cityName => {
      let possibleCardsCity = possibleCards[cityName];
      if (!possibleCardsCity) {
        possibleCards[cityName] = 1
      } else {
        possibleCards[cityName] ++;
      }
    });

    Object.keys(cardCounter.drawnInfectionCards).forEach(cityName => {
      let cityObj = cardCounter.drawnInfectionCards[cityName];
      let possibleCardsCity = possibleCards[cityName];
      let odds = !!possibleCardsCity ? possibleCardsCity / leftInRound * 100 : 0;

      let drawn = "";
      if (odds !== 0) {
        drawn = ` (${cityObj.currentRound}/${possibleCardsCity})`;
      }

      oddsList.push({cityName, color: cityObj.color, odds, drawn});
    });
  } else {
    let total = 0;
    Object.keys(cardCounter.drawnInfectionCards).forEach(cityName => {
      total += cardCounter.drawnInfectionCards[cityName].inDeck;
    });

    Object.keys(cardCounter.drawnInfectionCards).forEach(cityName => {
      let cityObj = cardCounter.drawnInfectionCards[cityName];
      let odds = (cityObj.inDeck - cityObj.currentRound) / total * 100;
      let drawn = ` (${cityObj.currentRound}/${cityObj.inDeck})`;
      oddsList.push({cityName, color: cityObj.color, odds, drawn});
    });
  }

  oddsList.sort((a, b) => a.odds === b.odds ? (a.cityName > b.cityName ? 1 : -1) : (a.odds > b.odds ? -1 : 1));
  let oddsHtml = "";
  oddsList.forEach(city => {
    oddsHtml += `<div class="infected-city ${city.color}">${city.cityName}: ${city.odds.toFixed(2)}%${city.drawn}</div>`;
  })
  document.getElementById("infected-cities-odds-list").innerHTML = oddsHtml;
}
render();

document.getElementById("epidemic").addEventListener("click", () => {
  cardCounter.isEpidemic = true;
  document.getElementById("epidemic").textContent = "Pick the bottom card";
});

// If you manually edited local storage, update UI with this
document.getElementById("recalculate").addEventListener("click", () => {
  cardCounter.getStorage();
  render();
});

document.getElementById("reset").addEventListener("click", () => {
  if (!cardCounter.isReset) {
    cardCounter.isReset = true;
    document.getElementById("reset").textContent = "Click again to wipe localstorage and reload";
    return;
  }

  localStorage.clear();
  window.location.reload();
});