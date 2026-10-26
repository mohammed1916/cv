// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Mixed tokens with consecutive empty pairs",
    "input": "{\"command\":\"G(al)()G()()(al)GG(al)()\"}"
  },
  {
    "label": "Only G tokens",
    "input": "{\"command\":\"GGGG\"}"
  },
  {
    "label": "Only empty-pair tokens",
    "input": "{\"command\":\"()()()\"}"
  },
  {
    "label": "Single al token",
    "input": "{\"command\":\"(al)\"}"
  }
];
