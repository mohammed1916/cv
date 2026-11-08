// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Overlapping buildings and uncovered gaps form several spans",
    "input": "{\"buildings\":[[1,7,8],[3,10,15],[6,12,5],[15,20,11],[18,24,17]]}"
  },
  {
    "label": "Changing building membership can preserve the floored average",
    "input": "{\"buildings\":[[2,6,10],[6,11,9],[6,11,11]]}"
  },
  {
    "label": "A gap prevents merging equal averages",
    "input": "{\"buildings\":[[1,4,7],[8,12,7]]}"
  },
  {
    "label": "One building supplies one segment",
    "input": "{\"buildings\":[[5,14,13]]}"
  },
  {
    "label": "Single building",
    "input": "[[1,2,1]]"
  },
  {
    "label": "Identical overlapping buildings",
    "input": "[[2,5,3],[2,5,3],[2,5,3]]"
  },
  {
    "label": "Full width with a tall building",
    "input": "[[1,30,30],[1,30,1]]"
  },
  {
    "label": "Long run: 10 buildings",
    "input": "[[26,30,18],[5,20,8],[21,22,19],[6,9,10],[1,5,3],[22,25,4],[24,28,12],[3,16,25],[28,29,13],[9,24,22]]"
  }
];
