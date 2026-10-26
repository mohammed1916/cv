// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Busy periods alternate with idle gaps",
    "input": "{\"customers\":[[2,5],[3,4],[9,2],[10,7],[25,3],[26,6],[40,2]]}"
  },
  {
    "label": "Customers arrive together",
    "input": "{\"customers\":[[5,2],[5,4],[5,3]]}"
  },
  {
    "label": "Cook is always idle on arrival",
    "input": "{\"customers\":[[2,3],[10,2],[20,4]]}"
  },
  {
    "label": "Single customer",
    "input": "{\"customers\":[[7,9]]}"
  }
];
