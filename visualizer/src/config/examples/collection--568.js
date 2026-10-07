// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A connected itinerary trades early rewards for better later cities",
    "input": "{\"flights\":[[0,1,0,0],[0,0,1,0],[1,0,0,1],[0,1,0,0]],\"days\":[[3,2,6,1,4,2],[6,1,2,5,1,4],[1,7,1,3,7,2],[2,2,7,1,2,7]]}"
  },
  {
    "label": "Rich unreachable cities cannot contribute vacation days",
    "input": "{\"flights\":[[0,0,0],[0,0,1],[0,1,0]],\"days\":[[1,2,3,2],[7,7,7,7],[6,6,6,6]]}"
  },
  {
    "label": "One city means staying every week",
    "input": "{\"flights\":[[0]],\"days\":[[2,0,7,4,1,6]]}"
  },
  {
    "label": "A two-flight chain cannot be completed in a single week",
    "input": "{\"flights\":[[0,1,0],[0,0,1],[0,0,0]],\"days\":[[2],[4],[7]]}"
  }
];
