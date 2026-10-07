// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Competing routes reward saving a discount for an expensive edge",
    "input": "{\"n\":7,\"highways\":[[0,1,3],[1,2,17],[2,6,8],[0,3,9],[3,4,4],[4,6,19],[1,4,6],[3,5,12],[5,6,2]],\"discounts\":2}"
  },
  {
    "label": "No discount reduces to ordinary shortest paths",
    "input": "{\"n\":4,\"highways\":[[0,1,7],[1,3,4],[0,2,3],[2,3,12]],\"discounts\":0}"
  },
  {
    "label": "An odd toll is halved with integer rounding",
    "input": "{\"n\":2,\"highways\":[[0,1,15]],\"discounts\":3}"
  },
  {
    "label": "Disconnected destination cannot be reached",
    "input": "{\"n\":5,\"highways\":[[0,1,4],[1,2,6],[3,4,2]],\"discounts\":1}"
  }
];
