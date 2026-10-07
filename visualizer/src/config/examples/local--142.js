// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Long prefix before entry",
    "values": {
      "nodes": "[4,8,12,16,20,24,28,32,36]",
      "pos": 4
    }
  },
  {
    "label": "Entry at head",
    "values": {
      "nodes": "[3,7,11,15,19]",
      "pos": 0
    }
  },
  {
    "label": "No cycle",
    "values": {
      "nodes": "[5,9,13,17]",
      "pos": -1
    }
  },
  {
    "label": "Self-loop",
    "values": {
      "nodes": "[23]",
      "pos": 0
    }
  },
  {
    "label": "Empty",
    "values": {
      "nodes": "[]",
      "pos": -1
    }
  }
];
