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
  }
];
