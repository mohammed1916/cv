// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different face limits require separate run-length states",
    "input": "{\"n\":9,\"rollMax\":[1,3,2,4,2,3]}"
  },
  {
    "label": "A single roll always offers all six faces",
    "input": "{\"n\":1,\"rollMax\":[1,2,3,4,5,6]}"
  },
  {
    "label": "No face may repeat immediately",
    "input": "{\"n\":6,\"rollMax\":[1,1,1,1,1,1]}"
  },
  {
    "label": "Limits longer than the sequence impose no restriction",
    "input": "{\"n\":4,\"rollMax\":[5,5,5,5,5,5]}"
  }
];
