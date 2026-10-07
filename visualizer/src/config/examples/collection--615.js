// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Unequal departments and two months need separate weighted comparisons",
    "input": "{\"employee\":[{\"employee_id\":1,\"department_id\":10},{\"employee_id\":2,\"department_id\":10},{\"employee_id\":3,\"department_id\":20},{\"employee_id\":4,\"department_id\":30}],\"salary\":[{\"id\":1,\"employee_id\":1,\"amount\":4000,\"pay_date\":\"2025-01-05\"},{\"id\":2,\"employee_id\":2,\"amount\":6000,\"pay_date\":\"2025-01-05\"},{\"id\":3,\"employee_id\":3,\"amount\":9000,\"pay_date\":\"2025-01-05\"},{\"id\":4,\"employee_id\":4,\"amount\":1000,\"pay_date\":\"2025-01-05\"},{\"id\":5,\"employee_id\":1,\"amount\":7000,\"pay_date\":\"2025-02-05\"},{\"id\":6,\"employee_id\":2,\"amount\":7000,\"pay_date\":\"2025-02-05\"},{\"id\":7,\"employee_id\":3,\"amount\":7000,\"pay_date\":\"2025-02-05\"},{\"id\":8,\"employee_id\":4,\"amount\":7000,\"pay_date\":\"2025-02-05\"}]}"
  },
  {
    "label": "One department always matches its company month",
    "input": "{\"employee\":[{\"employee_id\":4,\"department_id\":8},{\"employee_id\":9,\"department_id\":8}],\"salary\":[{\"id\":1,\"employee_id\":4,\"amount\":3500,\"pay_date\":\"2025-03-01\"},{\"id\":2,\"employee_id\":9,\"amount\":7500,\"pay_date\":\"2025-03-01\"}]}"
  },
  {
    "label": "A department with no payment in a month has no group",
    "input": "{\"employee\":[{\"employee_id\":1,\"department_id\":2},{\"employee_id\":2,\"department_id\":3}],\"salary\":[{\"id\":1,\"employee_id\":1,\"amount\":4000,\"pay_date\":\"2025-04-01\"},{\"id\":2,\"employee_id\":2,\"amount\":8000,\"pay_date\":\"2025-05-01\"}]}"
  },
  {
    "label": "No payment records produce no comparisons",
    "input": "{\"employee\":[{\"employee_id\":1,\"department_id\":1}],\"salary\":[]}"
  }
];
