// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Extra playlist positions allow constrained reuse",
    "input": "{\"n\":5,\"goal\":9,\"k\":2}"
  },
  {
    "label": "A playlist of n positions uses each song once",
    "input": "{\"n\":4,\"goal\":4,\"k\":1}"
  },
  {
    "label": "One song can repeat when the gap is zero",
    "input": "{\"n\":1,\"goal\":8,\"k\":0}"
  },
  {
    "label": "A gap of n minus one forces cyclic reuse after the first order",
    "input": "{\"n\":4,\"goal\":10,\"k\":3}"
  }
];
