// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several values can be roots and ordered child factors",
    "input": "{\"arr\":[2,3,6,9,12,18,36,54]}"
  },
  {
    "label": "Prime values only produce leaf trees",
    "input": "{\"arr\":[5,11,17,23]}"
  },
  {
    "label": "Repeated powers permit nested factor trees",
    "input": "{\"arr\":[2,4,8,16,32]}"
  },
  {
    "label": "A singleton value is one leaf tree",
    "input": "{\"arr\":[13]}"
  }
];
