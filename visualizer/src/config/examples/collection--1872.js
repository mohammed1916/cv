// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Positive and negative prefixes change the best first merge",
    "input": "{\"stones\":[6,-9,4,7,-3,8,-5,2,11]}"
  },
  {
    "label": "Only two stones force the total",
    "input": "{\"stones\":[-4,9]}"
  },
  {
    "label": "All negative values",
    "input": "{\"stones\":[-3,-7,-2,-6]}"
  },
  {
    "label": "All zeros tie",
    "input": "{\"stones\":[0,0,0,0]}"
  }
];
