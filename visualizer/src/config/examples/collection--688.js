// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A central knight spreads over several moves before probability escapes",
    "input": "{\"n\":7,\"k\":5,\"row\":3,\"column\":3}"
  },
  {
    "label": "Zero moves preserves the starting probability",
    "input": "{\"n\":5,\"k\":0,\"row\":1,\"column\":4}"
  },
  {
    "label": "A one-square board loses all probability on the first move",
    "input": "{\"n\":1,\"k\":1,\"row\":0,\"column\":0}"
  },
  {
    "label": "A corner starts with fewer on-board moves",
    "input": "{\"n\":6,\"k\":3,\"row\":0,\"column\":0}"
  }
];
