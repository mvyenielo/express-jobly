"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns {  id, title, salary, equity, company_handle }
   *
   * */

  static async create({ title, salary, equity, company_handle }) {
    const result = await db.query(`
                INSERT INTO jobs (title,
                                  salary,
                                  equity,
                                  company_handle)
                VALUES ($1, $2, $3, $4)
                RETURNING
                    id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle" `,
      [title, salary, equity, company_handle]
    );

    const job = result.rows[0];
    job.equity = Number(job.equity);

    return job;
  }

  static async findAll(filterParams = {}) {
    const { whereClause, values } = Job.sqlForWhereClause(filterParams);

    const sqlQuery = `
    SELECT id,
    title,
    salary,
    equity,
    company_handle AS "companyHandle"
    FROM jobs
    ${whereClause}
    ORDER BY title`;

    const jobRes = await db.query(sqlQuery,
      values);

    for (const job of jobRes.rows) {
      job.equity = Number(job.equity);
    }

    return jobRes.rows;
  }

  /**
 * sqlForWhereClause: Takes in an object with key/value pairs that are search
 * parameters and values. Returns an object containing a string formatted to
 * be placed in a WHERE clause, as well an array of corresponding values
 *
 *
 * filterParams: { title: "bob", hasEquity: tru }
 *
 * returns: {
 *   whereClause: "title ILIKE $1 AND equity > 0",
 *   values: ["%bob%"]
 * }
 *
 * @param {object} filterParams
 * @returns object
 */

  static sqlForWhereClause(filterParams) {
    const keys = Object.keys(filterParams);

    let whereClause = keys.map((filterParam, idx) => {
      if (filterParam === "title") {
        filterParams[filterParam] = `%${filterParams[filterParam]}%`;
        return (`title ILIKE $${idx + 1}`);
      }
      if (filterParam === "minSalary") {
        return (`salary >= $${idx + 1}`);
      }
      if (filterParam === "hasEquity" && filterParams?.hasEquity === true) {
        return (`equity > 0`);
      }
    });

    return {
      whereClause: whereClause.length !== 0 ? "WHERE " +
        whereClause.join(" AND ") : "",
      values: Object.values(filterParams).filter(value =>
        typeof value !== "boolean"),
    };
  }

}

module.exports = Job;