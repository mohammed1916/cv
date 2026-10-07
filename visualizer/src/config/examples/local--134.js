// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Failures before a feasible start",
    "values": {
      "gas": "[2,7,1,6,3,9,2,5]",
      "cost": "[5,3,4,5,6,2,4,3]"
    }
  },
  {
    "label": "Total fuel too small",
    "values": {
      "gas": "[2,3,1,4]",
      "cost": "[3,4,2,5]"
    }
  },
  {
    "label": "Exactly balanced",
    "values": {
      "gas": "[4,1,7,2]",
      "cost": "[2,5,3,4]"
    }
  },
  {
    "label": "One feasible station",
    "values": {
      "gas": "[6]",
      "cost": "[4]"
    }
  },
  {
    "label": "One impossible station",
    "values": {
      "gas": "[2]",
      "cost": "[3]"
    }
  }
];
