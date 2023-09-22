"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlForPartialCreate } = require("../helpers/sql");


/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns {  id, title, salary, equity, company_handle }
   *
   * */

  static async create(data) {
    const { setCols, values } = sqlForPartialCreate(data, {
      companyHandle: "company_handle"
    });

    const valIdxs = values.map((param, idx) => `$${idx + 1}`).join(", ");

    const result = await db.query(`
                INSERT INTO jobs (${setCols})
                VALUES (${valIdxs})
                RETURNING
                    id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle" `,
      values
    );
    const job = result.rows[0];

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

    const whereClause = [];
    const values = [];

    for (const filterParam of keys) {
      if (filterParam === "title") {
        values.push(`%${filterParams[filterParam]}%`);

        whereClause.push(`title ILIKE $${values.length}`);
      }
      if (filterParam === "minSalary") {
        values.push(filterParams[filterParam]);
        whereClause.push(`salary >= $${values.length}`);
      }
      if (filterParam === "hasEquity" && filterParams?.hasEquity === true) {
        whereClause.push(`equity > 0`);
      }
    }

    return {
      whereClause: whereClause.length !== 0 ? "WHERE " +
        whereClause.join(" AND ") : "",
      values: values
    };
  }


  /** Given a job id, return data about job.
  *
  * Returns { id, title, salary, equity, companyHandle}
  *
  * Throws NotFoundError if not found.
  **/

  static async get(id) {
    const companyRes = await db.query(`
          SELECT id,
                 title,
                 salary,
                 equity,
                 company_handle AS "companyHandle"
          FROM jobs
          WHERE id = $1`, [id]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${id}`);

    return company;
  }


  /** Update job data with `updateData`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */
  static async update(id, updateData) {
    const { setCols, values } = sqlForPartialUpdate(updateData, {});
    const idVarIdx = "$" + (values.length + 1);

    const sqlQuery = `
      UPDATE jobs
        SET ${setCols}
        WHERE id = ${idVarIdx}
        RETURNING
          id,
          title,
          salary,
          equity,
          company_handle AS "companyHandle"`;

    const result = await db.query(sqlQuery, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No such job: id: ${id}`);

    return job;
  }


  static async remove(id) {
    const result = await db.query(`
    DELETE
      FROM jobs
      WHERE id = $1
      RETURNING id`, [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(` No job found: id ${id}`);

    return job;
  }


}

module.exports = Job;