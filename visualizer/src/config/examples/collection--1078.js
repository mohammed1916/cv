// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "The phrase recurs with different following words",
    "input": "{\"text\":\"soft rain falls near soft rain pools while soft rain feeds roots\",\"first\":\"soft\",\"second\":\"rain\"}"
  },
  {
    "label": "Overlapping equal-word phrase",
    "input": "{\"text\":\"moss moss moss moss fern\",\"first\":\"moss\",\"second\":\"moss\"}"
  },
  {
    "label": "Phrase at the end has no following word",
    "input": "{\"text\":\"quiet paths soft rain\",\"first\":\"soft\",\"second\":\"rain\"}"
  },
  {
    "label": "No matching phrase",
    "input": "{\"text\":\"cedar leaves drift slowly\",\"first\":\"pine\",\"second\":\"leaves\"}"
  }
];
