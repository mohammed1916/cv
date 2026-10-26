// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Scrambled and reversed adjacency pairs form one path",
    "input": "{\"adjacentPairs\":[[9,-2],[17,4],[6,12],[4,9],[-2,6],[12,23],[31,23]]}"
  },
  {
    "label": "Single pair can be restored either way",
    "input": "{\"adjacentPairs\":[[7,-4]]}"
  },
  {
    "label": "Negative and zero values",
    "input": "{\"adjacentPairs\":[[-5,0],[8,-2],[0,8]]}"
  },
  {
    "label": "Pairs arrive in reverse path order",
    "input": "{\"adjacentPairs\":[[10,8],[8,6],[6,4],[4,2]]}"
  }
];
