"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureIsAdmin,
  ensureIsAdminOrSpecifiedUser
} = require("./auth");


const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");

function next(err) {
  if (err) throw new Error("Got error from middleware");
}


describe("authenticateJWT", function () {
  test("works: via header", function () {
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        isAdmin: false,
      },
    });
  });

  test("works: no header", function () {
    const req = {};
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});


describe("ensureLoggedIn", function () {
  test("works", function () {
    const req = {};
    const res = { locals: { user: { username: "test" } } };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function () {
    const req = {};
    const res = { locals: {} };
    expect(() => ensureLoggedIn(req, res, next))
      .toThrow(UnauthorizedError);
  });

  test("unauth if no valid login", function () {
    const req = {};
    const res = { locals: { user: {} } };
    expect(() => ensureLoggedIn(req, res, next))
      .toThrow(UnauthorizedError);
  });
});


describe("ensureIsAdmin", function () {
  test("works for admins", function () {
    const req = {};
    const res = { locals: { user: { username: "test", isAdmin: true } } };
    ensureIsAdmin(req, res, next);
  });

  test("works for non-admins", function () {
    const req = {};
    const res = { locals: { user: { username: "test", isAdmin: false } } };
    expect(() => ensureIsAdmin(req, res, next)).toThrow(UnauthorizedError);
  });

  test("works for anon", function () {
    const req = {};
    const res = { locals: {} };
    expect(() => ensureIsAdmin(req, res, next)).toThrow(UnauthorizedError);
  });
});


describe("ensureIsAdminOrUser", function () {
  test("works for admins", function () {
    const req = { params: { username: "test" } };
    const res = { locals: { user: { username: "testAdmin", isAdmin: true } } };
    ensureIsAdminOrSpecifiedUser(req, res, next);
  });

  test("works for user specified in params", function () {
    const req = { params: { username: "test" } };
    const res = { locals: { user: { username: "test", isAdmin: false } } };
    ensureIsAdminOrSpecifiedUser(req, res, next);
  });

  test("works for user not specified in params", function () {
    const req = { params: { username: "test" } };
    const res = { locals: { user: { username: "test2", isAdmin: false } } };
    expect(() =>
      ensureIsAdminOrSpecifiedUser(req, res, next)).toThrow(UnauthorizedError);
  });

  test("works for anon", function () {
    const req = { params: { username: "test" } };
    const res = { locals: {} };
    expect(() =>
      ensureIsAdminOrSpecifiedUser(req, res, next)).toThrow(UnauthorizedError);
  });
});