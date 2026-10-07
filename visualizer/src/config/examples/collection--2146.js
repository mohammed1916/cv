// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Walls and price ties require every ranking field",
    "input": "{\"grid\":[[1,4,0,8,2],[3,1,1,1,7],[0,5,0,6,1],[9,1,4,1,2]],\"pricing\":[2,7],\"start\":[1,1],\"k\":6}"
  },
  {
    "label": "The starting cell itself can be the first ranked item",
    "input": "{\"grid\":[[6,1],[3,5]],\"pricing\":[3,6],\"start\":[0,0],\"k\":3}"
  },
  {
    "label": "Unreachable items do not enter the ranking",
    "input": "{\"grid\":[[1,0,4],[1,0,3],[2,0,5]],\"pricing\":[2,5],\"start\":[0,0],\"k\":5}"
  },
  {
    "label": "No reachable item lies inside the requested price range",
    "input": "{\"grid\":[[1,2],[3,1]],\"pricing\":[7,9],\"start\":[0,0],\"k\":2}"
  }
];
