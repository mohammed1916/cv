// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several input and target bit patterns disagree",
    "input": "{\"a\":173,\"b\":92,\"c\":118}"
  },
  {
    "label": "Already equal OR result",
    "input": "{\"a\":12,\"b\":5,\"c\":13}"
  },
  {
    "label": "Target zero clears both sources",
    "input": "{\"a\":15,\"b\":9,\"c\":0}"
  },
  {
    "label": "Both sources zero need target bits",
    "input": "{\"a\":0,\"b\":0,\"c\":21}"
  }
];
