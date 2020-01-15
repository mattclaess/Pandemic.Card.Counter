import { CITY_CARDS_IN_INFECTION_DECK } from "./cities.js";

const infection_deck_key = "drawn_infection_cards_dict";
const current_round_key = "current_round_drawn_cards";
const all_rounds_key = "all_rounds_drawn_cards";

export default class CardCounter {
    constructor() {
        // this of cards in current discard pile
        // cityname : {
        //   currentRound: number of cards drawn in current round
        //   inDeck: number of cards that exist in the deck (constant unless you remove any)
        // }
        this.drawnInfectionCards = {};
        this.currentRound = [];
        this.isEpidemic = false;
        this.isReset = false;
        this.allRounds = [];
        this.resilPopCount = 0;
        this.resilPopCity = "";
        this.getStorage();
        
        let cities = Object.keys(CITY_CARDS_IN_INFECTION_DECK).sort();
        let hasExistingGame = this.drawnInfectionCards && Object.keys(this.drawnInfectionCards).length > 0;
        cities.forEach(city => {
            if (!hasExistingGame) {
              this.drawnInfectionCards[city] = {
                currentRound: 0,
                inDeck: CITY_CARDS_IN_INFECTION_DECK[city].total,
                color: CITY_CARDS_IN_INFECTION_DECK[city].color
              }
            }
        });
    }

    setStorage() {
        localStorage.setItem(infection_deck_key, JSON.stringify(this.drawnInfectionCards));
        localStorage.setItem(current_round_key, JSON.stringify(this.currentRound));
        localStorage.setItem(all_rounds_key, JSON.stringify(this.allRounds));
    }

    getStorage() {
        this.drawnInfectionCards = JSON.parse(localStorage.getItem(infection_deck_key)) || {};
        this.currentRound = JSON.parse(localStorage.getItem(current_round_key)) || [];
        this.allRounds = JSON.parse(localStorage.getItem(all_rounds_key)) || [];
    }

    validateState(cityName, storedCity) {
        if (!storedCity) {
          throw new Error("City does not exist!");
        }
        if (!this.isEpidemic && this.allRounds.length !== 0 && !this.allRounds[this.allRounds.length - 1].includes(cityName))
        {
          throw new Error("City is not in draw pile!");
        }
        if (storedCity.currentRound + 1 > storedCity.inDeck) {
          throw new Error("There should not be any more cards for that city in the draw pile!");
        }
    }

    updateOlderRounds(cityName) {
      this.allRounds.forEach(round => {
        let index = round.indexOf(cityName);
        if (index > -1) {
          round.splice(index, 1);
        }
      });
      if (this.allRounds.length !== 0 && this.allRounds[this.allRounds.length - 1].length === 0) {
        this.allRounds.pop();
      }
    }

    clearRound() {
      this.isEpidemic = false;
      this.allRounds.push(this.currentRound);
      this.currentRound = [];
    
      Object.keys(this.drawnInfectionCards).forEach(cityName => {
        let storedCity = this.drawnInfectionCards[cityName];
        storedCity.currentRound = 0;
      });
    }

    drawCard(cityName) {
        let storedCity = this.drawnInfectionCards[cityName];
        
        this.validateState(cityName, storedCity);
        
        if (!this.resilPopCount) {
          this.currentRound.push(cityName);
          this.currentRound.sort();
        }

        if (this.isEpidemic) {
            this.clearRound();
        } else {
            if (!!this.resilPopCount) {
              if (!this.resilPopCity) {
                this.resilPopCity = cityName;
              } else {
                if (cityName !== this.resilPopCity) {
                  alert("You have to select two of the same city for resilient population");
                  return;
                }
              }
  
              if (storedCity.inDeck - 1 < 0) {
                alert("You don't have another card to remove");
                return;
              }
              storedCity.inDeck -= 1;
              this.resilPopCount++;
              this.resilientPopulation();
            } else {
              storedCity.currentRound += 1;
            }
            this.updateOlderRounds(cityName);
        }
        
        this.setStorage();
    }

    startEndResilPop() {
      if (!this.resilPopCount) {
        this.resilPopCount ++;
        document.getElementById("resilpop").textContent = "Select city to remove (1/2)";
      } else {
        this.resilPopCount = 0;
        this.resilPopCity = "";
        document.getElementById("resilpop").textContent = "Start resilient population";
      }
    }

    resilientPopulation() {
      if (this.resilPopCount === 2) {
        document.getElementById("resilpop").textContent = "Select city to remove (2/2)";
      } else {
        this.startEndResilPop();
      }
    }
}