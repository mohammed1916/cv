// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Targets scattered through a long word",
    "input": "{\"s\":\"abracadabradabra\",\"c\":\"r\"}"
  },
  {
    "label": "Target only at left",
    "input": "{\"s\":\"xyyyyy\",\"c\":\"x\"}"
  },
  {
    "label": "Target only at right",
    "input": "{\"s\":\"yyyyyx\",\"c\":\"x\"}"
  },
  {
    "label": "Every character is a target",
    "input": "{\"s\":\"kkkkk\",\"c\":\"k\"}"
  }
];
