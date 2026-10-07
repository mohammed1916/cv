// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Zero values and repeated complements form many pairs",
    "input": "{\"deliciousness\":[0,1,3,5,7,9,1,15,17,3,0,8]}"
  },
  {
    "label": "Zero plus zero is not a power of two",
    "input": "{\"deliciousness\":[0,0,0]}"
  },
  {
    "label": "Repeated self-complements",
    "input": "{\"deliciousness\":[4,4,4,4]}"
  },
  {
    "label": "No valid pair",
    "input": "{\"deliciousness\":[5,6,9]}"
  }
];
