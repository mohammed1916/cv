// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Matching endpoint colors require an interior different color",
    "input": "{\"colors\":[4,4,2,7,4,1,4,4,4]}"
  },
  {
    "label": "Different endpoint colors give the full span",
    "input": "{\"colors\":[3,5,5,8,9]}"
  },
  {
    "label": "Only one interior house differs",
    "input": "{\"colors\":[6,6,6,2,6,6]}"
  },
  {
    "label": "Two different houses form the smallest input",
    "input": "{\"colors\":[8,1]}"
  }
];
