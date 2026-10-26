// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Interleaved group sizes fill independent buckets",
    "input": "{\"groupSizes\":[3,2,3,1,2,3,2,2,1,3,3,3]}"
  },
  {
    "label": "Everyone forms a singleton",
    "input": "{\"groupSizes\":[1,1,1,1]}"
  },
  {
    "label": "One group contains everybody",
    "input": "{\"groupSizes\":[4,4,4,4]}"
  },
  {
    "label": "Several equal-sized groups",
    "input": "{\"groupSizes\":[2,2,2,2,2,2]}"
  }
];
