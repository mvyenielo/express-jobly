"use strict";

const db = require('../db');
const Job = require('./job');

describe("create", function () {
  test("works with valid input", async function () {
    const jobData = {
      title: 'newJob',
      salary: 50000,
      equity: 0.005,
      company_handle: 'c1'
    }
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


})