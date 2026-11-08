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
  },
  {
    "label": "Single employee without a manager",
    "input": "{\"employees\":[[1,\"Ada\",null,50000]]}"
  },
  {
    "label": "Equal salaries under one manager",
    "input": "{\"employees\":[[10,\"Bea\",99,40000],[11,\"Cal\",99,40000],[99,\"Dev\",null,90000]]}"
  },
  {
    "label": "Manager id that is not in the table",
    "input": "{\"employees\":[[20,\"Eve\",777,25000]]}"
  },
  {
    "label": "Long run: 10 employees in a tree",
    "input": "{\"employees\":[[1,\"Root\",null,100000],[2,\"E2\",1,49078],[3,\"E3\",1,53628],[4,\"E4\",2,37904],[5,\"E5\",4,36463],[6,\"E6\",4,68861],[7,\"E7\",6,23384],[8,\"E8\",3,73147],[9,\"E9\",8,23442],[10,\"E10\",1,89107]]}"
  }
];
