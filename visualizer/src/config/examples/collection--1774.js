// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several bases compete with repeated toppings",
    "input": "{\"baseCosts\":[6,11,17],\"toppingCosts\":[2,5,9,13],\"target\":32}"
  },
  {
    "label": "All bases exceed target",
    "input": "{\"baseCosts\":[12,18],\"toppingCosts\":[3,7],\"target\":5}"
  },
  {
    "label": "Equal distance favors lower total",
    "input": "{\"baseCosts\":[8],\"toppingCosts\":[4],\"target\":10}"
  },
  {
    "label": "Exact base needs no topping",
    "input": "{\"baseCosts\":[7,19],\"toppingCosts\":[3,6],\"target\":19}"
  }
];
