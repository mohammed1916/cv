// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Whitespace sign digits and suffix",
    "value": "   -00043821river",
    "s": "   -00043821river"
  },
  {
    "label": "Positive overflow",
    "value": "934567891234",
    "s": "934567891234"
  },
  {
    "label": "Negative overflow",
    "value": "-934567891234",
    "s": "-934567891234"
  },
  {
    "label": "No leading digits",
    "value": "river438",
    "s": "river438"
  },
  {
    "label": "Conflicting signs",
    "value": "+-72",
    "s": "+-72"
  },
  {
    "label": "Only whitespace",
    "value": "   ",
    "s": "   "
  }
];
