import CardCounter from '../cardCounter.js'

QUnit.module("Card counter tests", {
  beforeEach: () => {
    localStorage.clear();
  }, afterEach: () => {
    localStorage.clear();
  }
});
QUnit.test("Draw card test", function( assert ) {
  let cardCounter = new CardCounter();
  let cityName = "chicago";
  cardCounter.drawCard(cityName);
  assert.ok(cardCounter.currentRound[0] === cityName, "City should be in current round list");
  assert.ok(cardCounter.drawnInfectionCards[cityName].currentRound === 1, "City should be in drawn cards like");
});
QUnit.test("Epidemic test", function( assert ) {
  let cardCounter = new CardCounter();
  cardCounter.drawCard("chicago");
  cardCounter.drawCard("lima");
  cardCounter.drawCard("london");
  cardCounter.isEpidemic = true;
  cardCounter.drawCard("washington");
  assert.ok(!cardCounter.isEpidemic, "isEpidemic should be reset");
  assert.ok(cardCounter.currentRound.length === 0, "No cards in current round");
  assert.ok(cardCounter.allRounds.length === 1, "All rounds should store previous round");
  assert.ok(cardCounter.allRounds[0].length === 4, "4 Cards in previous round");

  // try and draw a card that is not in the top of discard pile
  assert.throws(() => cardCounter.drawCard("denver"), "Throws exception for card that cannot be drawn");
});
QUnit.test("Draw too many of one card test", function( assert ) {
  let cardCounter = new CardCounter();
  let cityName = "chicago";
  cardCounter.drawCard(cityName);
  cardCounter.drawCard(cityName);
  cardCounter.drawCard(cityName);
  assert.throws(() => cardCounter.drawCard(cityName));
});
QUnit.test("City name does not exist", function( assert ) {
  let cardCounter = new CardCounter();
  assert.throws(() => cardCounter.drawCard("asdf"));
});