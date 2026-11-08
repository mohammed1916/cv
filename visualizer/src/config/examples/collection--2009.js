// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Duplicate values and a distant cluster reduce retained entries",
    "input": "{\"nums\":[14,8,11,8,10,29,12,15,10]}"
  },
  {
    "label": "Already continuous despite input order",
    "input": "{\"nums\":[7,4,6,5]}"
  },
  {
    "label": "All entries are equal",
    "input": "{\"nums\":[13,13,13,13,13]}"
  },
  {
    "label": "A singleton is already continuous",
    "input": "{\"nums\":[42]}"
  },
  {
    "label": "Single value",
    "input": "[50]"
  },
  {
    "label": "Equal values",
    "input": "[9,9,9,9]"
  },
  {
    "label": "Maximum values with a dip",
    "input": "[100,100,1,1,100]"
  },
  {
    "label": "Long run: 30 values",
    "input": "[19,49,75,47,75,9,33,35,75,12,39,18,32,81,92,6,10,37,27,37,59,17,90,81,11,33,69,91,85,4]"
  }
];
