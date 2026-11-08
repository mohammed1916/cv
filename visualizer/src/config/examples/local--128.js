// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Runs merge out of order",
    "input": "[14,3,8,5,12,4,13,7,6,8,15]"
  },
  {
    "label": "Negatives cross zero",
    "input": "[-3,2,-1,0,-2,1]"
  },
  {
    "label": "Only duplicates",
    "input": "[9,9,9,9]"
  },
  {
    "label": "Separated values",
    "input": "[2,6,10,14]"
  },
  {
    "label": "Empty",
    "input": "[]"
  },
  {
    "label": "Single value",
    "input": "[5]"
  },
  {
    "label": "Duplicates form one run",
    "input": "[1,1,1,2,2,3]"
  },
  {
    "label": "Boundary values at the limit",
    "input": "[-1000000000,-999999999,1000000000,999999999]"
  },
  {
    "label": "Long run: 40 values",
    "input": "[-470,-185,77,113,60,-115,-434,-423,419,-133,-375,-198,34,-81,-143,-144,266,360,-106,-262,-208,56,-216,492,246,-447,-211,206,-3,-435,123,-379,212,-377,369,285,-410,-31,-371,458]"
  }
];
