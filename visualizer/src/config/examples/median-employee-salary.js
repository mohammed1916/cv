// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Odd and even company groups",
    "employees": [
      {
        "id": 11,
        "name": "Mira",
        "salary": 7200,
        "managerId": null,
        "departmentId": 1,
        "company": "North"
      },
      {
        "id": 12,
        "name": "Oren",
        "salary": 8600,
        "managerId": 11,
        "departmentId": 1,
        "company": "North"
      },
      {
        "id": 13,
        "name": "Tara",
        "salary": 7200,
        "managerId": 11,
        "departmentId": 1,
        "company": "North"
      },
      {
        "id": 14,
        "name": "Ivo",
        "salary": 6400,
        "managerId": 11,
        "departmentId": 1,
        "company": "North"
      },
      {
        "id": 15,
        "name": "Nila",
        "salary": 8100,
        "managerId": 11,
        "departmentId": 2,
        "company": "North"
      },
      {
        "id": 16,
        "name": "Soren",
        "salary": 9300,
        "managerId": 11,
        "departmentId": 2,
        "company": "South"
      },
      {
        "id": 17,
        "name": "Eli",
        "salary": 8100,
        "managerId": 15,
        "departmentId": 2,
        "company": "South"
      },
      {
        "id": 18,
        "name": "Uma",
        "salary": 5900,
        "managerId": 15,
        "departmentId": 2,
        "company": "South"
      }
    ],
    "table": "11,North,7200\n12,North,8600\n13,North,7200\n14,North,6400\n15,North,8100\n16,South,9300\n17,South,8100\n18,South,5900"
  },
  {
    "label": "Tied salaries",
    "employees": [
      {
        "id": 11,
        "name": "Mira",
        "salary": 7000,
        "managerId": null,
        "departmentId": 1,
        "company": "West"
      },
      {
        "id": 12,
        "name": "Oren",
        "salary": 7000,
        "managerId": 11,
        "departmentId": 1,
        "company": "West"
      },
      {
        "id": 13,
        "name": "Tara",
        "salary": 7000,
        "managerId": 11,
        "departmentId": 1,
        "company": "West"
      },
      {
        "id": 14,
        "name": "Ivo",
        "salary": 7000,
        "managerId": 11,
        "departmentId": 1,
        "company": "West"
      }
    ],
    "table": "11,West,7000\n12,West,7000\n13,West,7000\n14,West,7000"
  },
  {
    "label": "Singleton company",
    "employees": [
      {
        "id": 21,
        "name": "Arin",
        "company": "East",
        "salary": 8300
      }
    ],
    "table": "21,East,8300"
  }
];
