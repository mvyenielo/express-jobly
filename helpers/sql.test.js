"use strict"

// const request = require("supertest");
const { sqlForPartialUpdate } = require('./sql');

describe("sqlForPartialUpdate", function() {
  it("updates the correct column when given one column to update",
      function() {
        const data = { numEmployees: 796 };
        const jsToSql = {
          numEmployees: "num_employees",
          logoUrl: "logo_url"
        };

        const result = sqlForPartialUpdate(data, jsToSql);

        expect(result).toEqual({
          setCols: '"num_employees"=$1',
          values: [ 796 ]
          }
        )
  });

  // it("Throws correct error when no columns provided")
})