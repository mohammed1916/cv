// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated sides and several valid ranges",
    "input": "{\"nums\":[9,4,7,2,8,4,6,11,5,3]}"
  },
  {
    "label": "Zeros cannot be sides",
    "input": "{\"nums\":[0,0,3,3,4]}"
  },
  {
    "label": "Equality is not a triangle",
    "input": "{\"nums\":[2,4,6]}"
  },
  {
    "label": "Fewer than three sides",
    "input": "{\"nums\":[5,8]}"
  },
  {
    "label": "Single side gives no triangle",
    "input": "{\"nums\":[4]}"
  },
  {
    "label": "Equal sides form equilateral triangles",
    "input": "{\"nums\":[5,5,5,5]}"
  },
  {
    "label": "Boundary side values at the limit",
    "input": "{\"nums\":[1000,1000,1000,999,1]}"
  },
  {
    "label": "Long run: 60 sides",
    "input": "{\"nums\":[29,9,2,20,42,23,46,45,43,20,29,29,15,20,49,8,4,43,9,39,28,9,45,13,46,4,17,26,4,46,17,36,5,17,45,26,5,12,32,30,42,37,39,17,10,35,41,18,4,7,42,8,36,22,3,2,21,15,15,25]}"
  }
];
