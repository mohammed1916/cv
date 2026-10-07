// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated increments change which factor is smallest",
    "input": "{\"nums\":[2,9,4,1,7,3],\"k\":14}"
  },
  {
    "label": "Zero factors must receive increments before a positive product is possible",
    "input": "{\"nums\":[0,0,5],\"k\":4}"
  },
  {
    "label": "No increment returns the original product modulo the modulus",
    "input": "{\"nums\":[8,11,13],\"k\":0}"
  },
  {
    "label": "A singleton receives every increment",
    "input": "{\"nums\":[6],\"k\":9}"
  }
];
