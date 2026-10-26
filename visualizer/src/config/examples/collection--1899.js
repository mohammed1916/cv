// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different compatible triplets supply target coordinates",
    "input": "{\"triplets\":[[4,2,7],[2,6,3],[5,1,2],[6,6,7],[3,4,6],[1,5,7]],\"target\":[5,6,7]}"
  },
  {
    "label": "Overshooting coordinate makes a tempting triplet unusable",
    "input": "{\"triplets\":[[5,9,3],[2,4,8]],\"target\":[5,4,8]}"
  },
  {
    "label": "Target already present",
    "input": "{\"triplets\":[[3,7,5],[1,2,3]],\"target\":[3,7,5]}"
  },
  {
    "label": "One target coordinate never reached",
    "input": "{\"triplets\":[[2,3,4],[4,2,5]],\"target\":[4,3,6]}"
  }
];
