// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Schools choose among tied cumulative exam counts",
    "input": "{\"schools\":[{\"school_id\":201,\"capacity\":80},{\"school_id\":205,\"capacity\":15},{\"school_id\":209,\"capacity\":200},{\"school_id\":211,\"capacity\":75}],\"exam\":[{\"score\":430,\"student_count\":145},{\"score\":520,\"student_count\":110},{\"score\":610,\"student_count\":75},{\"score\":670,\"student_count\":75},{\"score\":810,\"student_count\":18}]}"
  },
  {
    "label": "Equal student counts choose the smaller score",
    "input": "{\"schools\":[{\"school_id\":17,\"capacity\":30}],\"exam\":[{\"score\":620,\"student_count\":30},{\"score\":700,\"student_count\":30},{\"score\":790,\"student_count\":12}]}"
  },
  {
    "label": "No threshold fits a small school",
    "input": "{\"schools\":[{\"school_id\":23,\"capacity\":4}],\"exam\":[{\"score\":400,\"student_count\":90},{\"score\":800,\"student_count\":12}]}"
  },
  {
    "label": "An empty exam table cannot determine a cutoff",
    "input": "{\"schools\":[{\"school_id\":37,\"capacity\":60},{\"school_id\":41,\"capacity\":120}],\"exam\":[]}"
  }
];
