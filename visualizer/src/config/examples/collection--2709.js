// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several prime bridges connect every index",
    "input": "{\"nums\":[6,35,10,77,143,26]}"
  },
  {
    "label": "One in a larger array has no usable gcd link",
    "input": "{\"nums\":[6,10,1,15]}"
  },
  {
    "label": "A singleton one is trivially connected to itself",
    "input": "{\"nums\":[1]}"
  },
  {
    "label": "Repeated values connect indices but a coprime value stays separate",
    "input": "{\"nums\":[14,14,21,25]}"
  }
];
