// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Pair complementary buckets without reusing positions",
    "input": "{\"nums\":[4,9,6,7,4,9,2,11,8,5,6,7,3],\"k\":13}"
  },
  {
    "label": "Self-complement requires two copies",
    "input": "{\"nums\":[5,5,5,5,5],\"k\":10}"
  },
  {
    "label": "No possible complement",
    "input": "{\"nums\":[2,4,6],\"k\":15}"
  },
  {
    "label": "Single unused value",
    "input": "{\"nums\":[7],\"k\":14}"
  }
];
