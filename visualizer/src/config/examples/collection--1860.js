// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Banks alternate as larger requests consume capacity",
    "input": "{\"memory1\":47,\"memory2\":36}"
  },
  {
    "label": "No first allocation is possible",
    "input": "{\"memory1\":0,\"memory2\":0}"
  },
  {
    "label": "Equal banks favor the first",
    "input": "{\"memory1\":8,\"memory2\":8}"
  },
  {
    "label": "Only one bank has space",
    "input": "{\"memory1\":0,\"memory2\":19}"
  }
];
