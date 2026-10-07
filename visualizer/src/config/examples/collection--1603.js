// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Each category fills independently",
    "input": "{\"big\":3,\"medium\":2,\"small\":1,\"carTypes\":[2,1,3,2,3,1,2,1,1,3]}"
  },
  {
    "label": "No available slots",
    "input": "{\"big\":0,\"medium\":0,\"small\":0,\"carTypes\":[1,2,3]}"
  },
  {
    "label": "Unused large capacity cannot hold a different type",
    "input": "{\"big\":4,\"medium\":0,\"small\":0,\"carTypes\":[2,3,1]}"
  },
  {
    "label": "Exact small capacity",
    "input": "{\"big\":0,\"medium\":0,\"small\":2,\"carTypes\":[3,3,3]}"
  }
];
