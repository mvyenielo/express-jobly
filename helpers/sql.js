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

module.exports = { sqlForPartialUpdate };
