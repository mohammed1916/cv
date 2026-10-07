// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Occurrence positions answer overlapping ranges",
    "input": "{\"arr\":[7,3,7,11,5,3,7,9,11,3,5,7,3,9,11,7],\"queries\":[[0,15,7],[3,10,3],[4,12,5],[6,6,7],[0,5,13],[8,15,11]]}"
  },
  {
    "label": "An absent value has an empty position list",
    "input": "{\"arr\":[2,4,6,8],\"queries\":[[0,3,5],[1,2,9]]}"
  },
  {
    "label": "Equal inclusive endpoints inspect one position",
    "input": "{\"arr\":[12,8,12],\"queries\":[[0,0,12],[1,1,12],[2,2,12]]}"
  },
  {
    "label": "All values equal create a dense occurrence list",
    "input": "{\"arr\":[6,6,6,6,6],\"queries\":[[0,4,6],[1,3,6],[2,2,6]]}"
  }
];
