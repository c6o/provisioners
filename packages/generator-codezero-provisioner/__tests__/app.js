"use strict";
const path = require("path");
const helpers = require("yeoman-test");

describe("generator-codezero-provisioner:app", () => {
  beforeAll(() => {
    return helpers
      .run(path.join(__dirname, "../generators/app"))
      .withPrompts({ license: "Apache-2.0" });
  });

  it("creates files", () => {
    // Put code here to add tests
  });
});
