"use strict";

const { BadRequestError } = require('../expressError');
// const request = require("supertest");
const { sqlForPartialUpdate, sqlForWhereClause } = require('./sql');

describe("sqlForPartialUpdate", function () {
  it(`Returns the correct column string and value
      array when given one column to update`,
    function () {
      const data = { count: 796 };
      const jsToSql = {};

      const result = sqlForPartialUpdate(data, jsToSql);

      expect(result).toEqual({
        setCols: '"count"=$1',
        values: [796]
      }
      );

    });

  it("Throws correct error when no columns provided",
    function () {
      const data = {};
      const jsToSql = {
        numEmployees: "num_employees",
        logoUrl: "logo_url"
      };

      expect(() => sqlForPartialUpdate(data, jsToSql)).toThrow(BadRequestError);
    });

  it("Formats column names correctly, camelCase => snake_case",
    function () {
      const data = { numEmployees: 796 };
      const jsToSql = {
        numEmployees: "num_employees",
      };

      const result = sqlForPartialUpdate(data, jsToSql);

      expect(result.setCols).toContain("num_employees");

    });
});

describe("sqlForWhereClause", function () {
  it(`Returns correct WHERE clause and value array`,
    function () {
      const filterParams = { nameLike: "bob", minEmployees: 5 };

      const result = sqlForWhereClause(filterParams);

      expect(result).toEqual({
        whereClause: "name ILIKE $1 AND num_employees >= $2",
        values: ["%bob%", 5]
      });
    });

  it(`Returns object with whereClause key set to empty string and values key set
  to empty array `,
    function () {
      const filterParams = {};

      const result = sqlForWhereClause(filterParams);

      expect(result).toEqual({
        whereClause: "",
        values: []
      });
    });
});