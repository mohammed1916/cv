// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Multiple parent streams fill a deeper interior glass",
    "input": "{\"poured\":17,\"query_row\":5,\"query_glass\":2}"
  },
  {
    "label": "No poured champagne leaves every glass empty",
    "input": "{\"poured\":0,\"query_row\":4,\"query_glass\":1}"
  },
  {
    "label": "Exactly one unit fills the top without overflow",
    "input": "{\"poured\":1,\"query_row\":1,\"query_glass\":0}"
  },
  {
    "label": "A heavily supplied queried glass caps at one",
    "input": "{\"poured\":100,\"query_row\":3,\"query_glass\":1}"
  }
];
