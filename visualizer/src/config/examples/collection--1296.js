// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated starts require several parallel consecutive groups",
    "input": "{\"nums\":[4,5,6,5,6,7,8,9,10,4,5,6],\"k\":3}"
  },
  {
    "label": "Length cannot split evenly",
    "input": "{\"nums\":[1,2,3,4,5],\"k\":3}"
  },
  {
    "label": "A missing internal value breaks a group",
    "input": "{\"nums\":[2,3,5,6],\"k\":4}"
  },
  {
    "label": "Singleton groups always fit",
    "input": "{\"nums\":[8,2,8,5],\"k\":1}"
  }
];
