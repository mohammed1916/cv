// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Walls redirect the robot through a larger room",
    "input": "{\"room\":[[0,0,0,1,0],[0,1,0,0,0],[0,0,0,1,0],[1,0,0,0,0]]}"
  },
  {
    "label": "One open cell repeats four facing directions",
    "input": "{\"room\":[[0]]}"
  },
  {
    "label": "Walls box the start into one cell",
    "input": "{\"room\":[[0,1],[1,0]]}"
  },
  {
    "label": "An open rectangle repeats its perimeter route",
    "input": "{\"room\":[[0,0,0,0],[0,0,0,0],[0,0,0,0]]}"
  }
];
