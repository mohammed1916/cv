// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A merge can trigger several earlier stack merges",
    "input": "{\"nums\":[6,35,10,9,14,25,11,22,13]}"
  },
  {
    "label": "Pairwise coprime neighbors remain unchanged",
    "input": "{\"nums\":[5,7,11,13]}"
  },
  {
    "label": "Ones never merge with any neighbor",
    "input": "{\"nums\":[1,6,1,10,1]}"
  },
  {
    "label": "Repeated values collapse to the same least common multiple",
    "input": "{\"nums\":[12,12,12,12]}"
  }
];
