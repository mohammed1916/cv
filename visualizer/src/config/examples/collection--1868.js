// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Unequal run boundaries split and merge output products",
    "input": "{\"encoded1\":[[2,3],[4,2],[3,4],[6,1]],\"encoded2\":[[5,2],[2,4],[4,3],[2,1]]}"
  },
  {
    "label": "Products merge across both input boundaries",
    "input": "{\"encoded1\":[[2,2],[4,2]],\"encoded2\":[[6,2],[3,2]]}"
  },
  {
    "label": "One long run spans many other runs",
    "input": "{\"encoded1\":[[3,6]],\"encoded2\":[[2,1],[5,3],[7,2]]}"
  },
  {
    "label": "Single pair of runs",
    "input": "{\"encoded1\":[[4,5]],\"encoded2\":[[9,5]]}"
  }
];
