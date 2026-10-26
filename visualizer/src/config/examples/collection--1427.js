// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Left and right rotations partially cancel",
    "input": "{\"s\":\"cedarforest\",\"shift\":[[1,4],[0,7],[1,9],[0,2],[1,3]]}"
  },
  {
    "label": "Opposite shifts cancel exactly",
    "input": "{\"s\":\"garden\",\"shift\":[[0,5],[1,5]]}"
  },
  {
    "label": "Whole-length rotation changes nothing",
    "input": "{\"s\":\"moss\",\"shift\":[[1,12]]}"
  },
  {
    "label": "Single-character string remains fixed",
    "input": "{\"s\":\"q\",\"shift\":[[0,99],[1,17]]}"
  }
];
