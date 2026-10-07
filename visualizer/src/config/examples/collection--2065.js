// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A valuable branch must still leave time to return",
    "input": "{\"values\":[7,18,25,9,31,12],\"edges\":[[0,1,10],[1,2,10],[2,0,20],[1,3,10],[3,4,10],[0,5,15]],\"maxTime\":60}"
  },
  {
    "label": "Repeated visits cannot collect the same value twice",
    "input": "{\"values\":[5,17],\"edges\":[[0,1,10]],\"maxTime\":60}"
  },
  {
    "label": "A distant high value cannot return before the deadline",
    "input": "{\"values\":[4,11,99],\"edges\":[[0,1,10],[1,2,25]],\"maxTime\":40}"
  },
  {
    "label": "No edge can be traversed and returned in time",
    "input": "{\"values\":[13,27],\"edges\":[[0,1,20]],\"maxTime\":10}"
  }
];
