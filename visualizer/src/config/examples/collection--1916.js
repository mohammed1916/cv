// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several child subtrees admit interleaved construction orders",
    "input": "{\"prevRoom\":[-1,0,0,1,1,2,2,3,5,5]}"
  },
  {
    "label": "One chain forces a single order",
    "input": "{\"prevRoom\":[-1,0,1,2,3,4]}"
  },
  {
    "label": "Every nonroot room is independent after root",
    "input": "{\"prevRoom\":[-1,0,0,0,0,0]}"
  },
  {
    "label": "Parent indices need not precede child indices",
    "input": "{\"prevRoom\":[-1,3,0,2,3]}"
  }
];
