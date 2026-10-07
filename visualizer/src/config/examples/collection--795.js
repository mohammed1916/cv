// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Allowed maxima and oversized barriers split valid start ranges",
    "input": "{\"nums\":[1,4,2,6,3,8,2,5,1,7,4,2],\"left\":3,\"right\":6}"
  },
  {
    "label": "Values below the lower bound never qualify alone",
    "input": "{\"nums\":[1,2,1,0],\"left\":3,\"right\":5}"
  },
  {
    "label": "A single allowed value extends across small neighbors",
    "input": "{\"nums\":[1,1,4,1,1],\"left\":4,\"right\":4}"
  },
  {
    "label": "Every value above the upper bound yields zero",
    "input": "{\"nums\":[9,8,10],\"left\":2,\"right\":6}"
  }
];
