// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Sharing different windows removes different final occurrences",
    "input": "{\"candies\":[4,8,4,2,9,8,6,2,7,4,9,3],\"k\":5}"
  },
  {
    "label": "Sharing none preserves every flavor",
    "input": "{\"candies\":[5,2,5,8,2],\"k\":0}"
  },
  {
    "label": "Sharing the full array leaves no flavors",
    "input": "{\"candies\":[3,7,3,9],\"k\":4}"
  },
  {
    "label": "One repeated flavor survives any proper block",
    "input": "{\"candies\":[6,6,6,6,6],\"k\":3}"
  }
];
