// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A quarter turn aligns an asymmetric pattern",
    "input": "{\"mat\":[[1,0,0],[1,1,0],[0,1,1]],\"target\":[[0,1,1],[1,1,0],[1,0,0]]}"
  },
  {
    "label": "Already equal at zero turns",
    "input": "{\"mat\":[[1,0],[0,1]],\"target\":[[1,0],[0,1]]}"
  },
  {
    "label": "Different counts cannot match",
    "input": "{\"mat\":[[1,0],[0,0]],\"target\":[[1,1],[0,0]]}"
  },
  {
    "label": "Half-turn match",
    "input": "{\"mat\":[[1,1],[0,0]],\"target\":[[0,0],[1,1]]}"
  }
];
