// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Positive overlap with negative coordinates",
    "input": "{\"rec1\":[-5,-3,7,8],\"rec2\":[2,-6,10,4]}"
  },
  {
    "label": "Touching vertical edge",
    "input": "{\"rec1\":[0,0,4,5],\"rec2\":[4,1,8,3]}"
  },
  {
    "label": "One rectangle contained",
    "input": "{\"rec1\":[-9,-9,9,9],\"rec2\":[-2,-1,3,4]}"
  },
  {
    "label": "Separated on one axis",
    "input": "{\"rec1\":[1,2,4,7],\"rec2\":[6,3,9,8]}"
  }
];
