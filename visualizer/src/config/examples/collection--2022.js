// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Twelve values fill three rows in their original order",
    "input": "{\"original\":[8,3,14,6,11,2,19,7,5,16,4,12],\"m\":3,\"n\":4}"
  },
  {
    "label": "The element count does not fit",
    "input": "{\"original\":[2,7,9,4,6],\"m\":2,\"n\":3}"
  },
  {
    "label": "A single row keeps the flat order",
    "input": "{\"original\":[13,5,8,21],\"m\":1,\"n\":4}"
  },
  {
    "label": "A single column places one value per row",
    "input": "{\"original\":[6,17,3,10],\"m\":4,\"n\":1}"
  }
];
