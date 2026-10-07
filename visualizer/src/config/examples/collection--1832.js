// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Shuffled alphabet hidden among repeated letters",
    "input": "{\"sentence\":\"cedarzyxwvutsrqponmlkjihgfedcbagrove\"}"
  },
  {
    "label": "Only one missing letter",
    "input": "{\"sentence\":\"abcdefghijklmnopqrstuvwxy\"}"
  },
  {
    "label": "Many repetitions do not add coverage",
    "input": "{\"sentence\":\"forestforestforest\"}"
  },
  {
    "label": "Alphabet exactly once",
    "input": "{\"sentence\":\"abcdefghijklmnopqrstuvwxyz\"}"
  }
];
