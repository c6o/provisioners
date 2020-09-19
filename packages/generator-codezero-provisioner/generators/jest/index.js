"use strict";
const Generator = require("yeoman-generator");
const _ = require("lodash");
const extend = _.merge;
const pkgJson = require("../../package.json");

module.exports = class extends Generator {
  writing() {
    // Copy all template files
    const currentPkg = this.fs.readJSON(
      this.destinationPath("package.json"),
      {}
    );

    const pkg = extend(currentPkg, {
      scripts: {
        test: "jest",
        coverage: "jest --coverage",
      },
      jest: {
        preset: "ts-jest",
      },
      devDependencies: {
        "@types/jest": pkgJson.devDependencies["@types/jest"],
        coveralls: pkgJson.devDependencies.coveralls,
        jest: pkgJson.devDependencies.jest,
        "ts-jest": pkgJson.devDependencies["ts-jest"],
      },
    });

    this.fs.writeJSON(this.destinationPath("package.json"), pkg);

    this.fs.copy(
      this.templatePath("tests/**"),
      this.destinationPath("__tests__/")
    );

    this.fs.copy(
      this.templatePath("_.travis.yml"),
      this.destinationPath(".travis.yml")
    );
  }
};
