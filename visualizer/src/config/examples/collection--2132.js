// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Overlapping stamps cover two open regions beside obstacles",
    "input": "{\"grid\":[[0,0,0,1,0,0],[0,0,0,1,0,0],[0,0,0,1,0,0],[0,0,0,1,0,0]],\"stampHeight\":2,\"stampWidth\":2}"
  },
  {
    "label": "An isolated empty cell cannot fit the requested stamp",
    "input": "{\"grid\":[[1,1,1],[1,0,1],[1,1,1]],\"stampHeight\":2,\"stampWidth\":2}"
  },
  {
    "label": "All obstacles need no covering even with an oversized stamp",
    "input": "{\"grid\":[[1,1],[1,1]],\"stampHeight\":4,\"stampWidth\":3}"
  },
  {
    "label": "A unit stamp covers every empty cell independently",
    "input": "{\"grid\":[[0,1,0],[1,0,1],[0,0,0]],\"stampHeight\":1,\"stampWidth\":1}"
  }
];
