// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Long prefix enters interior cycle",
    "nodeCount": 9,
    "tail": 4,
    "input": "[4,7,10,13,16,19,22,25,28] | pos=4"
  },
  {
    "label": "Cycle enters at head",
    "nodeCount": 7,
    "tail": 0,
    "input": "[4,7,10,13,16,19,22] | pos=0"
  },
  {
    "label": "No cycle",
    "nodeCount": 8,
    "tail": -1,
    "input": "[4,7,10,13,16,19,22,25] | pos=-1"
  },
  {
    "label": "Self-loop",
    "nodeCount": 1,
    "tail": 0,
    "input": "[4] | pos=0"
  },
  {
    "label": "One acyclic node",
    "nodeCount": 1,
    "tail": -1,
    "input": "[4] | pos=-1"
  }
];
