"use strict";
const path = require("path");
const assert = require("yeoman-assert");
const helpers = require("yeoman-test");

const defaultAnswers = {
  applicationId: "test",
  applicationName: "Test",
  provisionerPackageName: "test-provisioner",
  containerImage: "test-image",
  tag: "latest",
  serviceType: "http",
  containerPort: 80,
  servicePort: 1234,
  persistentVolumeEnabled: true,
  volumeMountPath: "/var/data",
  license: "Apache-2.0",
};

describe("generator-codezero-provisioner:app", () => {
  describe("create full project", () => {
    beforeAll(() => {
      return helpers
        .run(path.join(__dirname, "../generators/app"))
        .withOptions({ skipInstall: true })
        .withPrompts(defaultAnswers);
    });

    it("scaffolds a full project", () => {
      // Ensure files exist
      assert.file([
        ".gitignore",
        ".editorconfig",
        "tsconfig.json",
        "tslint.json",
        "README.md",
        "LICENSE",
        "app.yaml",
        "k8s/deployment.yaml",
        "src/index.ts",
      ]);
    });

    it("the project builds", () => {
      assert.file([
        ".gitignore",
        ".editorconfig",
        "tsconfig.json",
        "tslint.json",
        "README.md",
        "LICENSE",
        "app.yaml",
        "k8s/deployment.yaml",
        "src/index.ts",
      ]);
    });
  });

  describe("package managers", () => {
    it("--npm only references npm/npx", () => {
      return helpers
        .run(path.join(__dirname, "../generators/app"))
        .withOptions({
          npm: true,
        })
        .withPrompts(defaultAnswers)
        .then(() => {
          assert.file("README.md");
          assert.fileContent("README.md", "npm install");

          assert.file("package.json");
          assert.noFileContent("package.json", "yarn ");
        });
    });

    it("--yarn always uses yarn", () => {
      return helpers
        .run(path.join(__dirname, "../generators/app"))
        .withOptions({
          yarn: true,
        })
        .withPrompts(defaultAnswers)
        .then(() => {
          assert.file("README.md");
          assert.fileContent("README.md", "yarn install");

          assert.file("package.json");
          assert.noFileContent("package.json", "npm ");
        });
    });

    it("fails if both --npm and --yarn are selected", () => {
      return expect(
        helpers
          .run(path.join(__dirname, "../generators/app"))
          .withOptions({
            yarn: true,
            npm: true,
          })
          .withPrompts(defaultAnswers)
      ).rejects.toMatchInlineSnapshot(
        `[Error: Both '--npm' and '--yarn' were specified, please select one package manager.]`
      );
    });
  });
});
