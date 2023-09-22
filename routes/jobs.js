"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureIsAdmin } = require("../middleware/auth");
const Job = require("../models/job");

//SCHEMA FOR JOBS
const jobNewSchema = require('../schemas/jobNew.json');

const router = new express.Router();





/** POST / { job } =>  { job }
 * data should be { title, salary, equity, companyHandle }
 *
 * Returns {  id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */

router.post('/', ensureIsAdmin, async function (req, res, next) {
  const bodyData = req.body;

  if (bodyData.equity) {
    bodyData.equity = Number(bodyData.equity);
  }

  const validator = jsonschema.validate(
    req.body,
    jobNewSchema,
    { required: true }
  );

  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.create(bodyData);
  return res.status(201).json({ job });
})

module.exports = router;