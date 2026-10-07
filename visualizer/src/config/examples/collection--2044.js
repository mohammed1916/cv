// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Overlapping bit patterns produce many equivalent OR states",
    "input": "{\"nums\":[5,10,3,12,6,9,7,8]}"
  },
  {
    "label": "Repeated values still represent distinct subset choices",
    "input": "{\"nums\":[11,11,11,11]}"
  },
  {
    "label": "Every independent bit is required",
    "input": "{\"nums\":[1,2,4,8,16]}"
  },
  {
    "label": "A single value has one nonempty subset",
    "input": "{\"nums\":[19]}"
  }
];
