// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Long binary prefixes preserve only their remainder",
    "input": "{\"nums\":[1,0,1,1,0,0,1,0,1,0,0,1,1,1,0,1]}"
  },
  {
    "label": "Leading zero prefixes are divisible",
    "input": "{\"nums\":[0,0,0,1]}"
  },
  {
    "label": "Repeated ones cycle through remainders",
    "input": "{\"nums\":[1,1,1,1,1,1,1,1]}"
  },
  {
    "label": "One zero bit",
    "input": "{\"nums\":[0]}"
  }
];
