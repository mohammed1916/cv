// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "One price resolves several earlier pending discounts",
    "input": "{\"prices\":[14,9,12,7,11,6,8,5,13,4]}"
  },
  {
    "label": "Increasing prices never receive a discount",
    "input": "{\"prices\":[3,6,9,12]}"
  },
  {
    "label": "Equal next price is a valid discount",
    "input": "{\"prices\":[8,8,8,8]}"
  },
  {
    "label": "One final undiscounted item",
    "input": "{\"prices\":[17]}"
  }
];
