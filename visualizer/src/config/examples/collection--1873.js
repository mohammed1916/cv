// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Odd IDs and initial letters produce independent eligibility checks",
    "input": "{\"rows\":[{\"employee_id\":13,\"name\":\"Nila\",\"salary\":4200},{\"employee_id\":8,\"name\":\"Arun\",\"salary\":5300},{\"employee_id\":17,\"name\":\"Mira\",\"salary\":6100},{\"employee_id\":3,\"name\":\"Dev\",\"salary\":3700},{\"employee_id\":22,\"name\":\"Mohan\",\"salary\":7200},{\"employee_id\":9,\"name\":\"Elena\",\"salary\":4800}]}"
  },
  {
    "label": "Name comparison targets uppercase M",
    "input": "{\"rows\":[{\"employee_id\":1,\"name\":\"Moss\",\"salary\":700},{\"employee_id\":3,\"name\":\"moss\",\"salary\":900}]}"
  },
  {
    "label": "Qualified zero salary still returns zero",
    "input": "{\"rows\":[{\"employee_id\":7,\"name\":\"Ravi\",\"salary\":0}]}"
  },
  {
    "label": "Empty employee table",
    "input": "{\"rows\":[]}"
  }
];
