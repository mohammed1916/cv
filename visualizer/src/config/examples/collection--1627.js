// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Divisor chains can connect cities without a direct qualifying gcd",
    "input": "{\"n\":18,\"threshold\":2,\"queries\":[[6,15],[4,18],[5,14],[7,14],[1,18],[11,11]]}"
  },
  {
    "label": "Threshold zero makes every city share divisor one",
    "input": "{\"n\":9,\"threshold\":0,\"queries\":[[1,9],[2,7],[4,6]]}"
  },
  {
    "label": "Threshold n permits only self connectivity",
    "input": "{\"n\":7,\"threshold\":7,\"queries\":[[2,2],[2,4],[1,7]]}"
  },
  {
    "label": "A common divisor equal to the threshold does not qualify",
    "input": "{\"n\":8,\"threshold\":4,\"queries\":[[4,8],[5,5],[6,8]]}"
  }
];
