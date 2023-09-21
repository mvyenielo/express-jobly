"use strict";

const db = require('../db');
const { NotFoundError } = require('../expressError');
const Job = require('./job');
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

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
      id: expect.any(Number),
      title: 'newJob',
      salary: 50000,
      equity: 0.005,
      companyHandle: 'c1'
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
        FROM jobs
        WHERE title = 'newJob'
      `
    );

    expect(result.rows[0]).toEqual({
      id: expect.any(Number),
      title: 'newJob',
      salary: 50000,
      equity: 0.005,
      companyHandle: 'c1'
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

    expect(result).toEqual({
      whereClause: "WHERE title ILIKE $1 AND equity > 0",
      values: ["%j2%"]
    });
  });

  test(`Returns object with whereClause key set to empty string and values key set
  to empty array `,
    function () {
      const filterParams = {};

      const result = Job.sqlForWhereClause(filterParams);

      expect(result).toEqual({
        whereClause: "",
        values: []
      });

    });
});

/************************************** get */

describe("get", function () {
  test("works with id", async function () {
    const job = await Job.get(1);

    expect(job).toEqual({
      id: 1,
      title: 'J1',
      salary: 60000,
      equity: null,
      company_handle: 'c1'
    });
  });

  test("not found error if no such job", async function () {
    await expect(async () =>
      await Job.get(100)).rejects.toThrow(NotFoundError);
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: 'newTitle',
    salary: 100000,
    equity: .005
  };

  test("works with valid data", async function () {
    const job = await Job.update(1, updateData);

    expect(job).toEqual({
      id: 1,
      ...updateData,
      company_handle: 'c1'
    });

    const result = await db.query(`
    SELECT id, title, salary, equity, company_handle
      FROM jobs
      WHERE id = 1`);

    expect(result.rows[0]).toEqual({
      id: 1,
      ...updateData,
      company_handle: 'c1'
    });
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: 'newTitle',
      salary: null,
      equity: null
    };

    const job = await Job.update(1, updateDataSetNulls);

    expect(job).toEqual({
      id: 1,
      ...updateDataSetNulls
    });

    const result = await db.query(`
    SELECT id, title, salary, equity, company_handle
      FROM jobs
      WHERE id = 1`);

    expect(result.rows[0]).toEqual({
      id: 1,
      ...updateDataSetNulls,
      company_handle: 'c1'
    });
  });

  test("not found if no such job", async function () {
    await expect(async () =>
      await Job.update(100, updateData)).rejects.toThrow(NotFoundError);
  });

  test("bad request with no data", async function () {
    await expect(async () =>
      await Job.update(1, {})), rehects.toThrow(NotFoundError);
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    const removedJob = await Job.remove(1);

    expect(removedJob).toEqual({ id: 1 });

    const result = await db.query(`
      SELECT id FROM jobs WHERE id = 1;
    `);

    expect(result.rows.length).toEqual(0);
  });

  test("not found error if no such job", async function () {
    await expect(async () =>
      await Job.remove(1)).rejects.toThrow(NotFoundError);
  });
});