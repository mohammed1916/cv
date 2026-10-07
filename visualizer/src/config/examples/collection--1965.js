// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Missing names and salaries appear on opposite sides",
    "input": "{\"employees\":[{\"employee_id\":101,\"name\":\"Mira\"},{\"employee_id\":108,\"name\":\"Theo\"},{\"employee_id\":112,\"name\":\"Ravi\"},{\"employee_id\":125,\"name\":\"Nora\"},{\"employee_id\":131,\"name\":\"Omar\"}],\"salaries\":[{\"employee_id\":108,\"salary\":42000},{\"employee_id\":112,\"salary\":39000},{\"employee_id\":119,\"salary\":51000},{\"employee_id\":131,\"salary\":48000},{\"employee_id\":144,\"salary\":37000}]}"
  },
  {
    "label": "Every employee has both records",
    "input": "{\"employees\":[{\"employee_id\":7,\"name\":\"Iris\"},{\"employee_id\":9,\"name\":\"Leon\"}],\"salaries\":[{\"employee_id\":9,\"salary\":36000},{\"employee_id\":7,\"salary\":41000}]}"
  },
  {
    "label": "An empty name table leaves every salary incomplete",
    "input": "{\"employees\":[],\"salaries\":[{\"employee_id\":31,\"salary\":28000},{\"employee_id\":17,\"salary\":45000}]}"
  },
  {
    "label": "Both source tables are empty",
    "input": "{\"employees\":[],\"salaries\":[]}"
  }
];
