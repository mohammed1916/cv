// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Ones and repeated square-free values multiply valid choices",
    "input": "{\"nums\":[1,1,2,2,3,5,6,7,10,15,30,4,9]}"
  },
  {
    "label": "Only ones never create a nonempty prime product",
    "input": "{\"nums\":[1,1,1,1,1]}"
  },
  {
    "label": "Squared prime factors disqualify every value",
    "input": "{\"nums\":[4,8,9,12,16,18,20,25,27,28]}"
  },
  {
    "label": "Repeated prime values are alternative choices",
    "input": "{\"nums\":[7,7,7,7]}"
  },
  {
    "label": "Single value",
    "input": "[17]"
  },
  {
    "label": "Two equal ones",
    "input": "[1,1]"
  },
  {
    "label": "Maximum allowed values",
    "input": "[30,30,29,30]"
  },
  {
    "label": "Long run: 50 values",
    "input": "[18,1,6,5,3,23,10,10,25,14,12,20,19,27,30,23,8,16,4,15,14,2,12,19,18,2,10,6,12,21,16,28,3,30,14,7,4,18,15,6,22,5,27,1,1,2,15,23,30,5]"
  }
];
