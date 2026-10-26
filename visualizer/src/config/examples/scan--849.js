// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Leading, interior, and trailing gaps compete",
    "input": "{\"seats\":[0,0,1,0,0,0,0,0,1,0,0,0]}"
  },
  {
    "label": "Only leading empty seats",
    "input": "{\"seats\":[0,0,0,0,1]}"
  },
  {
    "label": "Only trailing empty seats",
    "input": "{\"seats\":[1,0,0,0,0]}"
  },
  {
    "label": "One interior choice",
    "input": "{\"seats\":[1,0,1]}"
  }
];
