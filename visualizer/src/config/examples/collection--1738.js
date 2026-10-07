// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Prefix XOR regions overlap in both dimensions",
    "input": "{\"matrix\":[[6,3,9,4],[2,7,5,8],[11,1,10,12]],\"k\":7}"
  },
  {
    "label": "Single coordinate",
    "input": "{\"matrix\":[[19]],\"k\":1}"
  },
  {
    "label": "Repeated zero results keep ranks",
    "input": "{\"matrix\":[[0,0],[0,0]],\"k\":3}"
  },
  {
    "label": "Choose smallest coordinate XOR",
    "input": "{\"matrix\":[[3,5],[7,9]],\"k\":4}"
  }
];
