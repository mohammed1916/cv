// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Separate visits merge only within the same employee and day",
    "input": "{\"rows\":[{\"emp_id\":7,\"event_day\":\"2021-05-03\",\"in_time\":480,\"out_time\":620},{\"emp_id\":4,\"event_day\":\"2021-05-03\",\"in_time\":510,\"out_time\":690},{\"emp_id\":7,\"event_day\":\"2021-05-03\",\"in_time\":700,\"out_time\":840},{\"emp_id\":7,\"event_day\":\"2021-05-04\",\"in_time\":490,\"out_time\":730},{\"emp_id\":4,\"event_day\":\"2021-05-03\",\"in_time\":760,\"out_time\":900}]}"
  },
  {
    "label": "Adjacent visits share a boundary without overlap",
    "input": "{\"rows\":[{\"emp_id\":2,\"event_day\":\"2022-01-10\",\"in_time\":60,\"out_time\":90},{\"emp_id\":2,\"event_day\":\"2022-01-10\",\"in_time\":90,\"out_time\":120}]}"
  },
  {
    "label": "One-minute visit",
    "input": "{\"rows\":[{\"emp_id\":11,\"event_day\":\"2020-02-29\",\"in_time\":100,\"out_time\":101}]}"
  },
  {
    "label": "No visit records",
    "input": "{\"rows\":[]}"
  }
];
