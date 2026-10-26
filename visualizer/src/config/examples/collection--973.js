// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Quadrants and unequal distances",
    "input": "{\"points\":[[7,2],[-3,4],[1,-2],[6,-5],[-4,-1],[0,8],[2,2],[-1,-1]],\"k\":4}"
  },
  {
    "label": "Equal distances are valid alternatives",
    "input": "{\"points\":[[2,0],[0,2],[-2,0]],\"k\":2}"
  },
  {
    "label": "Include origin",
    "input": "{\"points\":[[0,0],[5,1],[-2,3]],\"k\":1}"
  },
  {
    "label": "Keep every point",
    "input": "{\"points\":[[3,4],[-1,2]],\"k\":2}"
  }
];
