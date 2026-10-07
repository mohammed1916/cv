// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Independent dishes feed several layers of dependent recipes",
    "input": "{\"recipes\":[\"dough\",\"sauce\",\"flatbread\",\"meal\",\"feast\"],\"ingredients\":[[\"flour\",\"water\"],[\"tomato\",\"salt\"],[\"dough\",\"sauce\"],[\"flatbread\",\"herbs\"],[\"meal\",\"fruit\"]],\"supplies\":[\"flour\",\"water\",\"tomato\",\"salt\",\"herbs\",\"fruit\"]}"
  },
  {
    "label": "A dependency cycle cannot create its own starting ingredient",
    "input": "{\"recipes\":[\"stew\",\"broth\"],\"ingredients\":[[\"broth\",\"salt\"],[\"stew\",\"water\"]],\"supplies\":[\"salt\",\"water\"]}"
  },
  {
    "label": "A missing raw ingredient blocks only its dependent branch",
    "input": "{\"recipes\":[\"tea\",\"toast\",\"snack\"],\"ingredients\":[[\"water\",\"leaf\"],[\"bread\"],[\"tea\",\"toast\"]],\"supplies\":[\"water\",\"leaf\"]}"
  },
  {
    "label": "One supplied ingredient unlocks several recipes",
    "input": "{\"recipes\":[\"crunch\",\"crumb\",\"mix\"],\"ingredients\":[[\"grain\"],[\"grain\"],[\"crunch\",\"crumb\"]],\"supplies\":[\"grain\"]}"
  }
];
