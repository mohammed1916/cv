// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different split positions retain different best thirds",
    "input": "{\"nums\":[18,4,12,7,25,3,16,9,22,6,14,20]}"
  },
  {
    "label": "The smallest input keeps one value on each side",
    "input": "{\"nums\":[9,2,11]}"
  },
  {
    "label": "Equal values give zero difference at every split",
    "input": "{\"nums\":[5,5,5,5,5,5]}"
  },
  {
    "label": "Ascending values favor small left and large right values",
    "input": "{\"nums\":[1,3,5,7,9,11,13,15,17]}"
  }
];
