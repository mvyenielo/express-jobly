"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureIsAdmin } = require("../middleware/auth");
const Job = require("../models/job");

//SCHEMA FOR JOBS

const router = new express.Router();





/** POST / { job } =>  { job }
 * data should be { title, salary, equity, companyHandle }
 *
 * Returns {  id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */

module.exports = router;