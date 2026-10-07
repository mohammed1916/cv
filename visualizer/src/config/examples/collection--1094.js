// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Overlapping trips reuse seats at shared locations",
    "input": "{\"trips\":[[3,1,5],[2,2,7],[4,5,9],[1,7,12],[2,9,13]],\"capacity\":6}"
  },
  {
    "label": "Drop-off and pickup at the same stop",
    "input": "{\"trips\":[[5,2,6],[5,6,10]],\"capacity\":5}"
  },
  {
    "label": "Overlapping load exceeds capacity",
    "input": "{\"trips\":[[4,1,8],[3,4,9]],\"capacity\":6}"
  },
  {
    "label": "Single trip exactly fills the car",
    "input": "{\"trips\":[[7,3,11]],\"capacity\":7}"
  }
];
