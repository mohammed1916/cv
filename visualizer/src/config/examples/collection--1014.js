// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "The strongest left contribution changes during the scan",
    "input": "{\"values\":[6,2,9,4,11,3,8,5,13,2]}"
  },
  {
    "label": "Two spots are the only possible pair",
    "input": "{\"values\":[3,8]}"
  },
  {
    "label": "Equal values favor adjacent spots",
    "input": "{\"values\":[7,7,7,7,7]}"
  },
  {
    "label": "A large early value remains useful",
    "input": "{\"values\":[30,2,3,4,5,6]}"
  },
  {
    "label": "Two equal values",
    "input": "{\"values\":[1,1]}"
  },
  {
    "label": "Equal values all round",
    "input": "{\"values\":[5,5,5,5]}"
  },
  {
    "label": "Largest and smallest values",
    "input": "{\"values\":[1000,1,1000,1,1000,1,1000,1,1000,1,1000,1]}"
  },
  {
    "label": "Long run: 12 values",
    "input": "{\"values\":[643,959,938,748,374,288,187,427,855,762,228,253]}"
  },
];
