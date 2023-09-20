"use strict";

const { BadRequestError } = require("../expressError");

/**
 * Takes an object dataToUpdate that defines columns to update and the values
 * to update them with, and returns an object containing a string of
 * corresponding columns to update and an array of the values to update with.
 * Also formats columns from camelCase to snake_case.
 *
 * dataToUpdate : {
 *   "numEmployees": 796,
 * }
 * jsToSql: {
 *   numEmployees: "num_employees",
 *   logoUrl: "logo_url",
 * }
 *
 *
 * returns: { setCols: '"num_employees"=$1', values: [ 796 ] }
 * @param {object} dataToUpdate
 * @param {object} jsToSql
 * @returns object
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

/**
 * sqlForWhereClause: Takes in an object with key/value pairs that are search
 * parameters and values. Returns an object containing a string formatted to
 * be placed in a WHERE clause, as well an array of corresponding values
 *
 *
 * filterParams: { nameLike: "bob", minEmployees: 5 }
 *
 * returns: {
 *   whereClause: "name ILIKE $1 AND num_employees >= $2",
 *   values: ["%bob%", 5]
 * }
 *
 * @param {object} filterParams
 * @returns object
 */

function sqlForWhereClause(filterParams) {
  const keys = Object.keys(filterParams);

  const whereClause = keys.map((filterParam, idx) => {
    if (filterParam === "nameLike") {
      filterParams[filterParam] = `%${filterParams[filterParam]}%`;
      return (`name ILIKE $${idx + 1}`);
    }
    if (filterParam === "minEmployees") {
      return (`num_employees >= $${idx + 1}`);
    }
    if (filterParam === "maxEmployees") {
      return (`num_employees <= $${idx + 1}`);
    }
  });

  return {
    whereClause: whereClause.join(" AND "),
    values: Object.values(filterParams),
  };
}

module.exports = { sqlForPartialUpdate, sqlForWhereClause };
