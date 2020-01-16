import { CITY_CARDS_IN_INFECTION_DECK } from "./cities.js";

const infection_deck_key = "drawn_infection_cards_dict";
const current_round_key = "current_round_drawn_cards";
const all_rounds_key = "all_rounds_drawn_cards";
const resil_pop_city_key = "resil_pop_city_key";

const prompt_text_id = "prompt-text";
const epidemic_button_id = "epidemic";
const resilpop_button_id = "resilpop";
const default_prompt_text = "Infect a city!";

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

    setResilPopCity(city) {
        this.resilPopCity = city;
        localStorage.setItem(resil_pop_city_key, city);
    }

    setStorage() {
        localStorage.setItem(infection_deck_key, JSON.stringify(this.drawnInfectionCards));
        localStorage.setItem(current_round_key, JSON.stringify(this.currentRound));
        localStorage.setItem(all_rounds_key, JSON.stringify(this.allRounds));
    }

    getStorage() {
        this.resilPopCity = localStorage.getItem(resil_pop_city_key) || "";
        this.drawnInfectionCards = JSON.parse(localStorage.getItem(infection_deck_key)) || {};
        this.currentRound = JSON.parse(localStorage.getItem(current_round_key)) || [];
        this.allRounds = JSON.parse(localStorage.getItem(all_rounds_key)) || [];
    }

    getPreviousRound() {
      return this.allRounds.length > 0 ? this.allRounds[this.allRounds.length - 1] : null;
    }

    validateState(cityName, storedCity) {
        if (!storedCity) {
          throw new Error("City does not exist!");
        }
        if (!this.isEpidemic && this.allRounds.length !== 0 && !this.allRounds[this.allRounds.length - 1].includes(cityName))
        {
          throw new Error("City is not in draw pile!");
        }
        if (storedCity.currentRound + 1 > storedCity.inDeck && !this.resilPopCount) {
          throw new Error("There should not be any more cards for that city in the draw pile!");
        }
    }

    updateOlderRounds(cityName) {
      let previousRound = this.getPreviousRound();

      if (!!previousRound) {
        if (previousRound.length > 0) {
          let index = previousRound.indexOf(cityName);
          if (index > -1) {
            previousRound.splice(index, 1);
          }
        }

        if (previousRound.length === 0) {
          this.allRounds.pop();
        }
      }
    }

    clearRound() {
      this.resetEpidemic();
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
                this.setResilPopCity(cityName);
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

              let previousRound = this.getPreviousRound();
              let index = previousRound.indexOf(cityName);
              previousRound.splice(index, 1);

              let newIndex = previousRound.indexOf(cityName);
              if (newIndex > -1) {
                this.resilPopCount++;
              } else {
                this.resilPopCount = 3;
              }

              this.resilientPopulation();
            } else {
              storedCity.currentRound += 1;
              this.updateOlderRounds(cityName);
              document.getElementById("theList").scrollIntoView();
            }
        }
        
        this.setStorage();
    }

    updateSelectorTextAndScroll(selector, text, scroll = true) {
      let promptTextElement = document.getElementById(selector);
      promptTextElement.textContent = text;
      scroll && promptTextElement.scrollIntoView();
    }

    resilientPopulation() {
      if (!this.resilPopCount) {
        this.resilPopCount ++;
        this.updateSelectorTextAndScroll(prompt_text_id, "Select from available cities to remove (1/2)");
        this.updateSelectorTextAndScroll(resilpop_button_id, "End resilient population", false);
      } else if (this.resilPopCount > 2) {
        this.resetResilPop();
      } else {
        this.updateSelectorTextAndScroll(prompt_text_id, "Select from available cities to remove (2/2)")
      }
    }

    resetEpidemic(shouldScroll = true) {
      this.isEpidemic = false;
      this.updateSelectorTextAndScroll(prompt_text_id, default_prompt_text, shouldScroll);
      this.updateSelectorTextAndScroll(epidemic_button_id, "Epidemic", false);
    }

    resetResilPop(shouldScroll = true) {
      this.resilPopCount = 0;
      this.updateSelectorTextAndScroll(prompt_text_id, default_prompt_text, shouldScroll);
      this.updateSelectorTextAndScroll(resilpop_button_id, "Start resilient population", false);
    }
}