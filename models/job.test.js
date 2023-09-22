"use strict";



const db = require('../db');
const { NotFoundError, BadRequestError } = require('../expressError');
const Job = require('./job');
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  createdJobId
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
      equity: "0.005",
      company_handle: 'c1'
    };
    const job = await Job.create(jobData);

    expect(job).toEqual({
      id: expect.any(Number),
      title: 'newJob',
      salary: 50000,
      equity: "0.005",
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
      equity: "0.005",
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
        id: expect.any(Number),
        title: 'J1',
        salary: 60000,
        equity: null,
        companyHandle: 'c1'
      },
      {
        id: expect.any(Number),
        title: 'J2',
        salary: 70000,
        equity: "0.03",
        companyHandle: 'c2'
      },
      {
        id: createdJobId[0],
        title: 'createdJob',
        salary: 60000,
        equity: null,
        companyHandle: 'c1'
      }
    ]);
  });

  test("works: filtering for one param", async function () {
    const filterParams = { hasEquity: true };
    const jobs = await Job.findAll(filterParams);

    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: 'J2',
        salary: 70000,
        equity: "0.03",
        companyHandle: 'c2'
      }
    ]);
  });

  test("works: filtering for multiple params", async function () {
    const filterParams = { hasEquity: true, minSalary: 65000 };
    const jobs = await Job.findAll(filterParams);

    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: 'J2',
        salary: 70000,
        equity: "0.03",
        companyHandle: 'c2'
      }
    ]);
  });

  test("works: case-insensitive when filtering title", async function () {
    const filterParams = { title: 'j1' };
    const jobs = await Job.findAll(filterParams);

    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: 'J1',
        salary: 60000,
        equity: null,
        companyHandle: 'c1'
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
    const job = await Job.get(createdJobId[0]);

    expect(job).toEqual({
      id: createdJobId[0],
      title: 'createdJob',
      salary: 60000,
      equity: null,
      companyHandle: 'c1'
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
    equity: "0.005"
  };

  test("works with valid data", async function () {
    const job = await Job.update(createdJobId[0], updateData);

    expect(job).toEqual({
      id: createdJobId[0],
      ...updateData,
      companyHandle: 'c1'
    });

    const result = await db.query(`
    SELECT id, title, salary, equity, company_handle
      FROM jobs
      WHERE id = ${createdJobId[0]}`);

    expect(result.rows[0]).toEqual({
      id: createdJobId[0],
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

    const job = await Job.update(createdJobId[0], updateDataSetNulls);

    expect(job).toEqual({
      id: createdJobId[0],
      ...updateDataSetNulls,
      companyHandle: 'c1'
    });

    const result = await db.query(`
    SELECT id, title, salary, equity, company_handle
      FROM jobs
      WHERE id = ${createdJobId[0]}`);

    expect(result.rows[0]).toEqual({
      id: createdJobId[0],
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
      await Job.update(createdJobId[0], {})).rejects.toThrow(BadRequestError);
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    const removedJob = await Job.remove(createdJobId[0]);

    expect(removedJob).toEqual({ id: createdJobId[0] });

    const result = await db.query(`
      SELECT id FROM jobs WHERE id = 1;
    `);

    expect(result.rows.length).toEqual(0);
  });

  test("not found error if no such job", async function () {
    await expect(async () =>
      await Job.remove(0)).rejects.toThrow(NotFoundError);
  });
});