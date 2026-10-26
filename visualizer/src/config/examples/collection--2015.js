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
  }
];
