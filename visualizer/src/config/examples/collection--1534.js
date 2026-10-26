// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Three independent distance limits filter triples",
    "input": "{\"arr\":[6,2,8,5,3,7,4,9],\"a\":4,\"b\":3,\"c\":2}"
  },
  {
    "label": "Equal values satisfy zero bounds",
    "input": "{\"arr\":[5,5,5,5],\"a\":0,\"b\":0,\"c\":0}"
  },
  {
    "label": "No triple fits",
    "input": "{\"arr\":[1,8,15],\"a\":2,\"b\":2,\"c\":2}"
  },
  {
    "label": "Every triple fits",
    "input": "{\"arr\":[2,4,3,5],\"a\":9,\"b\":9,\"c\":9}"
  }
];
