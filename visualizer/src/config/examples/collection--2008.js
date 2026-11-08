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
  },
  {
    "label": "One ride with zero tip",
    "input": "{\"n\":2,\"rides\":[[1,2,0]]}"
  },
  {
    "label": "Duplicate rides",
    "input": "{\"n\":3,\"rides\":[[1,3,5],[1,3,5],[2,3,5]]}"
  },
  {
    "label": "Whole street with a large tip",
    "input": "{\"n\":20,\"rides\":[[1,20,1000],[19,20,1]]}"
  },
  {
    "label": "Long run: 20 points, 12 rides",
    "input": "{\"n\":20,\"rides\":[[6,20,50],[15,17,4],[19,20,27],[11,18,29],[13,19,37],[11,12,31],[16,19,0],[5,20,22],[17,19,46],[7,20,18],[12,20,42],[8,11,44]]}"
  }
];
