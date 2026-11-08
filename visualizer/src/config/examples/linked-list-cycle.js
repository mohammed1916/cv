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
  },
  {
    "label": "Equal values, distinct nodes",
    "nodeCount": 4,
    "tail": 1,
    "input": "[2,2,2,2] | pos=1"
  },
  {
    "label": "Boundary values at the limit",
    "nodeCount": 2,
    "tail": 0,
    "input": "[-100000,100000] | pos=0"
  },
  {
    "label": "Long run: 30 nodes",
    "nodeCount": 30,
    "tail": 12,
    "input": "[-372,-799,886,980,-797,316,-204,-836,639,-231,178,704,692,540,224,-602,-645,-747,-178,503,-245,224,-284,727,360,673,-875,-742,-576,-70] | pos=12"
  }
];
