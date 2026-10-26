// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Long high-value blocks compete with earlier optimal partitions",
    "input": "{\"arr\":[3,12,4,7,2,11,5,9],\"k\":3}"
  },
  {
    "label": "Length-one blocks leave the original sum",
    "input": "{\"arr\":[4,8,2,6],\"k\":1}"
  },
  {
    "label": "One whole-array block can use the global maximum",
    "input": "{\"arr\":[2,7,3,5],\"k\":4}"
  },
  {
    "label": "Equal values make every partition score identical",
    "input": "{\"arr\":[6,6,6,6,6],\"k\":2}"
  }
];
