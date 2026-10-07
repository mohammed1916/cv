// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Rotation reveals a chain of compatible bases",
    "input": "{\"cuboids\":[[9,4,6],[3,5,8],[12,7,10],[2,4,6],[11,15,8],[5,7,9]]}"
  },
  {
    "label": "Single cuboid chooses tallest dimension",
    "input": "{\"cuboids\":[[3,11,7]]}"
  },
  {
    "label": "Equal cuboids can stack",
    "input": "{\"cuboids\":[[4,6,8],[8,4,6],[6,8,4]]}"
  },
  {
    "label": "Incomparable normalized dimensions",
    "input": "{\"cuboids\":[[2,9,10],[5,6,7],[1,11,12]]}"
  }
];
