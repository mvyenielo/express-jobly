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

    for (const job in jobRes.rows) {
      job.equity = Number(job.equity);
    }

    return jobRes.rows;
  }
}

module.exports = Job;