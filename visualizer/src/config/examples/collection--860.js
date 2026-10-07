// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Conserve fives across several customers",
    "input": "{\"bills\":[5,5,10,5,20,5,10,5,5,20]}"
  },
  {
    "label": "First customer needs unavailable change",
    "input": "{\"bills\":[10]}"
  },
  {
    "label": "Three fives make change",
    "input": "{\"bills\":[5,5,5,20]}"
  },
  {
    "label": "Too few fives after earlier sale",
    "input": "{\"bills\":[5,10,20]}"
  }
];
