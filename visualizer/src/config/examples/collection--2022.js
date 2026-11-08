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
  },
  {
    "label": "Single element",
    "input": "{\"original\":[9],\"m\":1,\"n\":1}"
  },
  {
    "label": "Equal values in a 2 by 2 grid",
    "input": "{\"original\":[5,5,5,5],\"m\":2,\"n\":2}"
  },
  {
    "label": "Largest value and one row",
    "input": "{\"original\":[100000,1],\"m\":1,\"n\":2}"
  },
  {
    "label": "Long run: 40 values in 8 by 5",
    "input": "{\"original\":[68504,87564,78032,78269,86058,48753,92132,83011,14304,7031,25059,4352,76123,77195,82334,28348,86685,84850,99788,75606,58686,68848,56881,25727,15177,56843,43324,15395,48174,44620,7313,99715,9081,11402,15057,42717,54966,99889,63013,21921],\"m\":8,\"n\":5}"
  }
];
