// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Threshold and manager presence are separate conditions",
    "input": "{\"employees\":[{\"employee_id\":100,\"name\":\"Mira\",\"manager_id\":null,\"salary\":54000},{\"employee_id\":101,\"name\":\"Theo\",\"manager_id\":100,\"salary\":28000},{\"employee_id\":102,\"name\":\"Ravi\",\"manager_id\":900,\"salary\":29999},{\"employee_id\":103,\"name\":\"Nora\",\"manager_id\":900,\"salary\":30000},{\"employee_id\":104,\"name\":\"Omar\",\"manager_id\":null,\"salary\":29000},{\"employee_id\":105,\"name\":\"Iris\",\"manager_id\":901,\"salary\":12000}]}"
  },
  {
    "label": "Exactly the salary threshold is excluded",
    "input": "{\"employees\":[{\"employee_id\":21,\"name\":\"Ada\",\"manager_id\":88,\"salary\":30000},{\"employee_id\":22,\"name\":\"Ben\",\"manager_id\":88,\"salary\":29999}]}"
  },
  {
    "label": "A null manager is not a departed manager",
    "input": "{\"employees\":[{\"employee_id\":31,\"name\":\"Cleo\",\"manager_id\":null,\"salary\":17000}]}"
  },
  {
    "label": "No employees means no result",
    "input": "{\"employees\":[]}"
  }
];
