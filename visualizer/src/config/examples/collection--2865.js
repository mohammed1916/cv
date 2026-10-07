// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different peak choices flatten different surrounding caps",
    "input": "{\"maxHeights\":[7,3,9,8,5,11,4,6]}"
  },
  {
    "label": "A flat plateau can be kept entirely",
    "input": "{\"maxHeights\":[5,5,5,5]}"
  },
  {
    "label": "A rising profile can peak at the right boundary",
    "input": "{\"maxHeights\":[2,4,7,10]}"
  },
  {
    "label": "One tower is already a mountain",
    "input": "{\"maxHeights\":[13]}"
  }
];
