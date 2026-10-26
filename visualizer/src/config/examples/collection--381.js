// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Duplicate occurrences and swapped removals change selection weights",
    "input": "{\"operations\":[[\"insert\",7],[\"insert\",4],[\"insert\",7],[\"insert\",9],[\"getRandom\",0.62],[\"remove\",7],[\"getRandom\",0.1],[\"insert\",4],[\"remove\",9],[\"getRandom\",0.95],[\"remove\",12]]}"
  },
  {
    "label": "Removing one duplicate does not erase the remaining occurrence",
    "input": "{\"operations\":[[\"insert\",5],[\"insert\",5],[\"remove\",5],[\"getRandom\",0.7],[\"remove\",5],[\"remove\",5]]}"
  },
  {
    "label": "Removing the last array slot requires no swap",
    "input": "{\"operations\":[[\"insert\",2],[\"insert\",8],[\"remove\",8],[\"getRandom\",0.4]]}"
  },
  {
    "label": "An absent removal leaves the collection unchanged",
    "input": "{\"operations\":[[\"remove\",13],[\"insert\",13],[\"getRandom\",0],[\"remove\",21],[\"getRandom\",0.999]]}"
  }
];
