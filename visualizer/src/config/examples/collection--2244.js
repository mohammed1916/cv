// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different task counts use triples pairs and remainder repair",
    "input": "{\"tasks\":[4,4,4,4,7,7,7,7,7,9,9,9,12,12]}"
  },
  {
    "label": "A singleton difficulty makes all work impossible",
    "input": "{\"tasks\":[3,3,8,8,8,11]}"
  },
  {
    "label": "Four equal tasks require two pairs",
    "input": "{\"tasks\":[6,6,6,6]}"
  },
  {
    "label": "Six equal tasks use two triples",
    "input": "{\"tasks\":[15,15,15,15,15,15]}"
  }
];
