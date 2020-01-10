// this of cards in current discard pile
// cityname : {
//   currentRound: number of cards drawn in current round
//   inDeck: number of cards that exist in the deck (constant unless you remove any)
// }
let drawnInfectionCards = {};
const infection_deck_key = "drawn_infection_cards_dict";
const current_round_key = "current_round_drawn_cards";
const all_rounds_key = "all_rounds_drawn_cards";

let isEpidemic = false;
let isReset = false;
let allRounds = [];
let currentRound = [];

function setStorage() {
  localStorage.setItem(infection_deck_key, JSON.stringify(drawnInfectionCards));
  localStorage.setItem(current_round_key, JSON.stringify(currentRound));
  localStorage.setItem(all_rounds_key, JSON.stringify(allRounds));
}

function getStorage() {
  drawnInfectionCards = JSON.parse(localStorage.getItem(infection_deck_key)) || {};
  currentRound = JSON.parse(localStorage.getItem(current_round_key)) || [];
  allRounds = JSON.parse(localStorage.getItem(all_rounds_key)) || [];
}

// order cities by color, insert buttons, add click events
function setup() {
    getStorage();
    let hasExistingGame = drawnInfectionCards && Object.keys(drawnInfectionCards).length > 0;

    let cities = Object.keys(CITY_CARDS_IN_INFECTION_DECK).sort();
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

    cities.forEach(city => {
      if (!hasExistingGame) {
        drawnInfectionCards[city] = {
          currentRound: 0,
          inDeck: CITY_CARDS_IN_INFECTION_DECK[city].total,
          color: CITY_CARDS_IN_INFECTION_DECK[city].color
        }
      }

      let cityButton = document.createElement("button");
      cityButton.id = city;
      cityButton.textContent = city;
      cityButton.onclick = (e) => {
        let cityName = e.currentTarget.id;
        let storedCity = drawnInfectionCards[cityName];

        if (!validateState(storedCity)) {
          return;
        }

        currentRound.push(cityName);
        updateOlderRounds(cityName);

        if (isEpidemic) {
          clearRound();
        } else {
          storedCity.currentRound += 1;
        }

        setStorage();
        render();
        console.log(drawnInfectionCards);
      };

      appendToContainer(CITY_CARDS_IN_INFECTION_DECK[city].color, cityButton);
    });
    setStorage();

    buttonContainer.appendChild(blueContainer);
    buttonContainer.appendChild(yellowContainer);
    buttonContainer.appendChild(blackContainer);
    document.getElementById("infect").appendChild(buttonContainer);
}
setup();

function updateOlderRounds(cityName) {
  allRounds.forEach(round => {
    let index = round.indexOf(cityName);
    if (index > -1) {
      round.splice(index, 1);
    }
  });
}

function render() {
  if (isReset) {
    isReset = false;
    document.getElementById("reset").textContent = "Reset game";
  }

  // show infected cities
  let infectedCities = "";
  currentRound.forEach(cityName => {
    let cityObj = drawnInfectionCards[cityName];
    infectedCities += `<div class="infected-city ${cityObj.color}">${cityName}</div>`;
  });
  document.getElementById("infected-cities-list").innerHTML = infectedCities;

  let previousRound;

  // calculate odds of infection
  for (let i = allRounds.length - 1; i >= 0; i--) {
    if (allRounds[i].length > 0) {
      previousRound = allRounds[i];
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
        possibleCardsCity ++;
      }
    });

    Object.keys(drawnInfectionCards).forEach(cityName => {
      let cityObj = drawnInfectionCards[cityName];
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
    Object.keys(drawnInfectionCards).forEach(cityName => {
      total += drawnInfectionCards[cityName].inDeck;
    });

    Object.keys(drawnInfectionCards).forEach(cityName => {
      let cityObj = drawnInfectionCards[cityName];
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

function validateState(storedCity) {
  if (storedCity.currentRound + 1 > storedCity.inDeck) {
    alert("Impossible!");
    return false;
  }
  return true;
}

function epidemic() {
  isEpidemic = true;
  document.getElementById("epidemic").textContent = "Pick the bottom card";
}

function clearRound() {
  isEpidemic = false;
  document.getElementById("epidemic").textContent = "Epidemic";
  allRounds.push(currentRound);
  currentRound = [];

  Object.keys(drawnInfectionCards).forEach(cityName => {
    let storedCity = drawnInfectionCards[cityName];
    storedCity.currentRound = 0;
  });
}

// If you manually edited local storage, update UI with this
function recalculate() {
  getStorage();
  render();
}

function reset() {
  if (!isReset) {
    isReset = true;
    document.getElementById("reset").textContent = "Click again to wipe localstorage and reload";
    return;
  }

  localStorage.clear();
  window.location.reload();
}