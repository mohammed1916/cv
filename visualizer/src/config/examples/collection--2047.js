// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Words, hyphens, digits, and punctuation mix in one sentence",
    "input": "{\"sentence\":\"bright lanterns glow, near well-lit docks! 4boats drift a--b -end end- ok.\"}"
  },
  {
    "label": "Punctuation-only tokens are allowed",
    "input": "{\"sentence\":\"! , .\"}"
  },
  {
    "label": "A hyphen must have letters on both sides",
    "input": "{\"sentence\":\"oak-tree pine- -birch reed--bed elm-leaf\"}"
  },
  {
    "label": "Extra spaces do not create tokens",
    "input": "{\"sentence\":\"  calm   water  rests   \"}"
  }
];
