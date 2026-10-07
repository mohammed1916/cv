// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Deep valuable coins compete with cheaper accessible prefixes",
    "input": "{\"piles\":[[4,3,40,2],[15,1,2,18],[7,20,5],[9,6]],\"k\":7}"
  },
  {
    "label": "One pile requires taking its exact top prefix",
    "input": "{\"piles\":[[8,2,19,4,11]],\"k\":3}"
  },
  {
    "label": "Taking every coin removes all choice",
    "input": "{\"piles\":[[3,7],[11],[2,5]],\"k\":5}"
  },
  {
    "label": "A high buried coin is inaccessible with a one-coin budget",
    "input": "{\"piles\":[[1,100],[9,2],[7]],\"k\":1}"
  }
];
