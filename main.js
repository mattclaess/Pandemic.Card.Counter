// this of cards in current discard pile
const drawnCards = [];

// what cards we know are in the deck
const deck = [];

function render() {
  var data = {};
  for (var i in deck) {
    var card = deck[i];
    if (!data.hasOwnProperty(card)) {
      data[card] = 1;
    } else {
      data[card] += 1;
    }
  }
  var sortable = [];
  for (var property in data) {
      sortable.push([property, data[property]]);
  }
  sortable.sort(function(a, b) {
      return b[1] - a[1];
  });
  var output = "";
  for (var i in sortable) {
    var s = sortable[i];
    output += s[1] + ":" + s[0] + "\n";
  }
  document.getElementById("theList").value = output;
}

document.getElementById("enterCard").addEventListener("click", () => {
  var country = document.getElementById("theCountry").value;
  if (deck.length != 0) {
    var cardFromDeckIndex = deck.indexOf(country);
    if (cardFromDeckIndex !== -1) {
      deck.splice(cardFromDeckIndex, 1);
    } else {
      alert("Impossible!");
      return;
    }
  }
  
  drawnCards.push(country);
  render();
});
document.getElementById("epidemic").addEventListener("click", () => {
  var country = document.getElementById("theCountry").value;
  drawnCards.push(country);
  while (drawnCards.length != 0) {
    deck.unshift(drawnCards.pop());
  }
  render();
});