// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Overlapping intervals and unsorted repeated queries",
    "input": "{\"intervals\":[[2,13],[5,8],[7,19],[11,11],[16,22],[1,4]],\"queries\":[11,6,18,3,25,6,14]}"
  },
  {
    "label": "Inclusive singleton interval",
    "input": "{\"intervals\":[[9,9]],\"queries\":[8,9,10]}"
  },
  {
    "label": "No interval reaches any query",
    "input": "{\"intervals\":[[2,4],[8,10]],\"queries\":[1,6,12]}"
  },
  {
    "label": "Equal-length intervals overlap",
    "input": "{\"intervals\":[[1,5],[3,7],[6,10]],\"queries\":[4,6,9]}"
  }
];
