// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Many expensive-item counts leave different cheaper-item ranges",
    "input": "{\"total\":1234,\"cost1\":19,\"cost2\":31}"
  },
  {
    "label": "A zero budget still permits buying nothing",
    "input": "{\"total\":0,\"cost1\":7,\"cost2\":11}"
  },
  {
    "label": "Both items cost more than the budget",
    "input": "{\"total\":5,\"cost1\":8,\"cost2\":13}"
  },
  {
    "label": "Equal prices still represent distinct item-count combinations",
    "input": "{\"total\":24,\"cost1\":6,\"cost2\":6}"
  }
];
