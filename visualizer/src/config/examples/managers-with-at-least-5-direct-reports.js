// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Exactly five direct reports",
    "employees": [
      {
        "id": 11,
        "name": "Mira",
        "salary": 7200,
        "managerId": null,
        "departmentId": 1
      },
      {
        "id": 12,
        "name": "Oren",
        "salary": 8600,
        "managerId": 11,
        "departmentId": 1
      },
      {
        "id": 13,
        "name": "Tara",
        "salary": 7200,
        "managerId": 11,
        "departmentId": 1
      },
      {
        "id": 14,
        "name": "Ivo",
        "salary": 6400,
        "managerId": 11,
        "departmentId": 1
      },
      {
        "id": 15,
        "name": "Nila",
        "salary": 8100,
        "managerId": 11,
        "departmentId": 2
      },
      {
        "id": 16,
        "name": "Soren",
        "salary": 9300,
        "managerId": 11,
        "departmentId": 2
      },
      {
        "id": 17,
        "name": "Eli",
        "salary": 8100,
        "managerId": 15,
        "departmentId": 2
      },
      {
        "id": 18,
        "name": "Uma",
        "salary": 5900,
        "managerId": 15,
        "departmentId": 2
      }
    ],
    "table": "11,Mira,null\n12,Oren,11\n13,Tara,11\n14,Ivo,11\n15,Nila,11\n16,Soren,11\n17,Eli,15\n18,Uma,15"
  },
  {
    "label": "Below the threshold",
    "employees": [
      {
        "id": 11,
        "name": "Mira",
        "salary": 7200,
        "managerId": null,
        "departmentId": 1
      },
      {
        "id": 12,
        "name": "Oren",
        "salary": 8600,
        "managerId": 11,
        "departmentId": 1
      },
      {
        "id": 13,
        "name": "Tara",
        "salary": 7200,
        "managerId": 11,
        "departmentId": 1
      },
      {
        "id": 14,
        "name": "Ivo",
        "salary": 6400,
        "managerId": 11,
        "departmentId": 1
      },
      {
        "id": 15,
        "name": "Nila",
        "salary": 8100,
        "managerId": 11,
        "departmentId": 2
      },
      {
        "id": 17,
        "name": "Eli",
        "salary": 8100,
        "managerId": 15,
        "departmentId": 2
      },
      {
        "id": 18,
        "name": "Uma",
        "salary": 5900,
        "managerId": 15,
        "departmentId": 2
      }
    ],
    "table": "11,Mira,null\n12,Oren,11\n13,Tara,11\n14,Ivo,11\n15,Nila,11\n17,Eli,15\n18,Uma,15"
  },
  {
    "label": "No manager relationships",
    "employees": [
      {
        "id": 11,
        "name": "Mira",
        "salary": 7200,
        "managerId": null,
        "departmentId": 1
      },
      {
        "id": 12,
        "name": "Oren",
        "salary": 8600,
        "managerId": null,
        "departmentId": 1
      },
      {
        "id": 13,
        "name": "Tara",
        "salary": 7200,
        "managerId": null,
        "departmentId": 1
      },
      {
        "id": 14,
        "name": "Ivo",
        "salary": 6400,
        "managerId": null,
        "departmentId": 1
      },
      {
        "id": 15,
        "name": "Nila",
        "salary": 8100,
        "managerId": null,
        "departmentId": 2
      },
      {
        "id": 16,
        "name": "Soren",
        "salary": 9300,
        "managerId": null,
        "departmentId": 2
      },
      {
        "id": 17,
        "name": "Eli",
        "salary": 8100,
        "managerId": null,
        "departmentId": 2
      },
      {
        "id": 18,
        "name": "Uma",
        "salary": 5900,
        "managerId": null,
        "departmentId": 2
      }
    ],
    "table": "11,Mira,null\n12,Oren,null\n13,Tara,null\n14,Ivo,null\n15,Nila,null\n16,Soren,null\n17,Eli,null\n18,Uma,null"
  }
];
