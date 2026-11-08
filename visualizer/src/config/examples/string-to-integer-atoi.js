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
  },
  {
    "label": "Smallest digit",
    "value": "7",
    "s": "7"
  },
  {
    "label": "Positive limit",
    "value": "2147483647",
    "s": "2147483647"
  },
  {
    "label": "Zero result",
    "value": "+0",
    "s": "+0"
  },
  {
    "label": "Long run: 194 characters",
    "value": "   4549347191044778970887814461831291261219481568277254718724496733520217284948890651940197164238526949126688811729947835467453725358146680377352158716477923135681385136684885059360406157879671x",
    "s": "   4549347191044778970887814461831291261219481568277254718724496733520217284948890651940197164238526949126688811729947835467453725358146680377352158716477923135681385136684885059360406157879671x"
  }
];
