// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Competing rides and exact endpoint handoffs",
    "input": "{\"n\":18,\"rides\":[[1,5,6],[3,9,12],[5,10,8],[9,14,7],[10,18,10],[1,18,16],[14,18,9],[6,12,14]]}"
  },
  {
    "label": "Two rides can meet at one position",
    "input": "{\"n\":9,\"rides\":[[1,5,3],[5,9,4]]}"
  },
  {
    "label": "A profitable long ride beats short alternatives",
    "input": "{\"n\":12,\"rides\":[[1,12,40],[1,4,2],[4,8,3],[8,12,2]]}"
  },
  {
    "label": "A ride need not start at position one",
    "input": "{\"n\":10,\"rides\":[[6,9,8]]}"
  }
];
