// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Extreme values are separated inside a longer array",
    "input": "{\"nums\":[14,8,2,19,11,6,25,4,17,9]}"
  },
  {
    "label": "Extremes already occupy opposite ends",
    "input": "{\"nums\":[1,5,8,12,20]}"
  },
  {
    "label": "Adjacent interior extremes favor deleting one prefix or suffix",
    "input": "{\"nums\":[8,11,2,19,6,9]}"
  },
  {
    "label": "One value is both minimum and maximum",
    "input": "{\"nums\":[13]}"
  }
];
