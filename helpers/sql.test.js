"use strict";

const { BadRequestError } = require('../expressError');
// const request = require("supertest");
const { sqlForPartialUpdate } = require('./sql');

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