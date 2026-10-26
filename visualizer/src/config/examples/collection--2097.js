// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several excursions must be spliced into one trail",
    "input": "{\"pairs\":[[10,20],[20,30],[30,10],[10,40],[40,50],[50,10],[10,60],[60,70]]}"
  },
  {
    "label": "A balanced directed cycle can start at any origin",
    "input": "{\"pairs\":[[4,9],[9,13],[13,4]]}"
  },
  {
    "label": "One pair is already a complete arrangement",
    "input": "{\"pairs\":[[21,34]]}"
  },
  {
    "label": "Input order does not identify the required first edge",
    "input": "{\"pairs\":[[8,12],[3,8],[12,19],[1,3]]}"
  }
];
