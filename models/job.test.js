"use strict";

const db = require('../db');
const Job = require('./job');

/************************************** create */

describe("create", function () {
  test("works with valid input", async function () {
    const jobData = {
      title: 'newJob',
      salary: 50000,
      equity: 0.005,
      company_handle: 'c1'
    };
    const job = await Job.create(jobData);

    expect(job).toEqual({
      id: 3,
      title: 'newJob',
      salary: 50000,
      equity: 0.005,
      company_handle: 'c1'
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
        FROM jobs
        WHERE title = newJob
      `
    );

    expect(result.rows[0]).toEqual({
      id: 3,
      title: 'newJob',
      salary: 50000,
      equity: 0.005,
      company_handle: 'c1'
    });

  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: 1,
        title: 'J1',
        salary: 60000,
        equity: null,
        company_handle: 'c1'
      },
      {
        id: 2,
        title: 'J2',
        salary: 70000,
        equity: 0.03,
        company_handle: 'c2'
      }
    ]);
  });

  test("works: filtering for one param", async function () {
    const filterParams = { hasEquity: true };
    const jobs = await Job.findAll(filterParams);

    expect(jobs).toEqual([
      {
        id: 2,
        title: 'J2',
        salary: 70000,
        equity: 0.03,
        company_handle: 'c2'
      }
    ]);
  });

  test("works: filtering for multiple params", async function () {
    const filterParams = { hasEquity: true, minSalary: 65000 };
    const jobs = await Job.findAll(filterParams);

    expect(jobs).toEqual([
      {
        id: 2,
        title: 'J2',
        salary: 70000,
        equity: 0.03,
        company_handle: 'c2'
      }
    ]);
  });

  test("works: case-insensitive when filtering title", async function () {
    const filterParams = { title: 'j1' };
    const jobs = await Job.findAll(filterParams);

    expect(jobs).toEqual([
      {
        id: 1,
        title: 'J1',
        salary: 60000,
        equity: null,
        company_handle: 'c1'
      }
    ]);
  });

  test("works: returns empty array when no results found", async function () {
    const filterParams = { title: 'scooby doo' };
    const jobs = await Job.findAll(filterParams);

    expect(jobs).toEqual([]);
  });
});

/************************************** sqlForWhereClause */
describe("sqlForWhereClause", function () {
  test("Returns correct WHERE clause and value array", function () {
    const filterParams = { title: "j2", hasEquity: true };

    const result = Job.sqlForWhereClause(filterParams);
  });
});