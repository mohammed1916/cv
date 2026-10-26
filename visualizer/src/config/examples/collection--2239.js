// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Signed candidates improve distance and later resolve a tie",
    "input": "{\"nums\":[-18,9,-7,12,-3,8,3,-11,6]}"
  },
  {
    "label": "Zero wins over every nonzero candidate",
    "input": "{\"nums\":[-4,7,0,2]}"
  },
  {
    "label": "Only negative values favor the least negative magnitude",
    "input": "{\"nums\":[-15,-2,-9,-6]}"
  },
  {
    "label": "A positive value wins an equal-distance tie",
    "input": "{\"nums\":[-5,5]}"
  }
];
