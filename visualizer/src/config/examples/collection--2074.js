// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A shortened final group is even despite its requested odd size",
    "input": "{\"head\":[8,3,14,6,11,2,19,7,5,16,4,12,9,20]}"
  },
  {
    "label": "The final actual length is two rather than requested three",
    "input": "{\"head\":[4,9,2,7,13]}"
  },
  {
    "label": "A final singleton remains unchanged",
    "input": "{\"head\":[6,1,8,3]}"
  },
  {
    "label": "One node forms only the first group",
    "input": "{\"head\":[21]}"
  }
];
