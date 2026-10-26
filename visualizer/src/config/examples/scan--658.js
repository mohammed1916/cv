// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Target between central entries",
    "input": "{\"arr\":[-12,-7,-3,0,4,6,9,13,17,22],\"k\":5,\"x\":5}"
  },
  {
    "label": "Ties prefer smaller numbers",
    "input": "{\"arr\":[1,3,5,7],\"k\":2,\"x\":4}"
  },
  {
    "label": "Target beyond right end",
    "input": "{\"arr\":[-5,0,8,12],\"k\":2,\"x\":40}"
  },
  {
    "label": "Keep entire array",
    "input": "{\"arr\":[2,2,6,9],\"k\":4,\"x\":3}"
  }
];
