// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Long-growth seeds should start before short-growth seeds",
    "input": "{\"plantTime\":[3,1,5,2,4,2],\"growTime\":[7,12,3,9,4,6]}"
  },
  {
    "label": "One seed finishes after planting plus growth",
    "input": "{\"plantTime\":[6],\"growTime\":[8]}"
  },
  {
    "label": "Equal growth durations permit any planting order",
    "input": "{\"plantTime\":[2,5,1,4],\"growTime\":[7,7,7,7]}"
  },
  {
    "label": "A short planting task can have the longest growth",
    "input": "{\"plantTime\":[9,1,7],\"growTime\":[2,20,4]}"
  }
];
