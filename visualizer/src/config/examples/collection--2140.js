// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Large rewards compete with long forced skips",
    "input": "{\"questions\":[[7,2],[4,0],[13,3],[6,1],[9,0],[18,2],[5,1],[12,0],[8,0]]}"
  },
  {
    "label": "Zero cooldown permits every positive reward",
    "input": "{\"questions\":[[3,0],[8,0],[2,0],[7,0]]}"
  },
  {
    "label": "A cooldown extending beyond the input still earns its points",
    "input": "{\"questions\":[[20,10],[3,0],[4,0]]}"
  },
  {
    "label": "One question is answered once",
    "input": "{\"questions\":[[11,5]]}"
  }
];
