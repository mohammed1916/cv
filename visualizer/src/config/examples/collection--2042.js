// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Words separate a longer increasing sequence",
    "input": "{\"s\":\"harbor has 4 boats and 11 cranes beside 23 warehouses serving 58 ships\"}"
  },
  {
    "label": "An equal number breaks strict ordering",
    "input": "{\"s\":\"we packed 7 boxes then 7 crates\"}"
  },
  {
    "label": "A later smaller number is invalid",
    "input": "{\"s\":\"teams scored 12 points before 9 penalties\"}"
  },
  {
    "label": "Only one number needs no comparison",
    "input": "{\"s\":\"the observatory has 36 lenses\"}"
  }
];
