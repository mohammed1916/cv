// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated large values lose to a smaller singleton",
    "input": "{\"numbers\":[{\"num\":40},{\"num\":17},{\"num\":40},{\"num\":9},{\"num\":23},{\"num\":17},{\"num\":31},{\"num\":23},{\"num\":6}]}"
  },
  {
    "label": "Every value repeated returns one null row",
    "input": "{\"numbers\":[{\"num\":8},{\"num\":8},{\"num\":12},{\"num\":12},{\"num\":12}]}"
  },
  {
    "label": "Negative singletons still have a numeric maximum",
    "input": "{\"numbers\":[{\"num\":-9},{\"num\":-3},{\"num\":-7},{\"num\":-3}]}"
  },
  {
    "label": "An empty table still returns null",
    "input": "{\"numbers\":[]}"
  }
];
