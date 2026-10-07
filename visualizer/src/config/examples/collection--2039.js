// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Branches have different distances and resend periods",
    "input": "{\"edges\":[[0,1],[0,2],[1,3],[1,4],[2,5],[5,6],[4,7],[6,7]],\"patience\":[0,2,1,3,7,2,4,5]}"
  },
  {
    "label": "Reply exactly at a resend boundary prevents that send",
    "input": "{\"edges\":[[0,1],[1,2]],\"patience\":[0,2,4]}"
  },
  {
    "label": "Large patience values require no resends",
    "input": "{\"edges\":[[0,1],[1,2],[2,3]],\"patience\":[0,10,10,10]}"
  },
  {
    "label": "One nearby impatient server",
    "input": "{\"edges\":[[0,1]],\"patience\":[0,1]}"
  }
];
