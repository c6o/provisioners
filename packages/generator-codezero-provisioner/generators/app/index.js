"use strict";
const Generator = require("yeoman-generator");
const path = require("path");
const mkdirp = require("mkdirp");
const chalk = require("chalk");
const yosay = require("yosay");
const _ = require("lodash");

module.exports = class extends Generator {
  async prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(
        `Welcome to the stupendous ${chalk.red(
          "CodeZero Provisioner"
        )} generator!`
      )
    );

    this.props = await this.prompt([
      {
        type: "input",
        name: "applicationName",
        message: "What is the name of your application?"
      },
      {
        type: "input",
        name: "applicationId",
        message: "What is the name of your application?",
        default: ({ applicationName }) => _.kebabCase(applicationName),
        filter: value => value.replace(/[^a-zA-Z0-9-_.]/g, "")
      },
      {
        type: "input",
        name: "provisionerPackageName",
        message: "What is the provisioners NPM package name?",
        default: ({ applicationId }) => `${applicationId}-provisioner`,
        filter: function(value) {
          return value.replace(/[^a-zA-Z0-9-_.//@]/g, "");
        }
      },
      {
        type: "input",
        name: "containerImage",
        message:
          "What is the name of the docker hub image for your application?",
        default: ({ applicationId }) => applicationId
      },
      {
        type: "input",
        name: "tag",
        message: "What is the container image version tag?",
        default: "latest"
      },
      {
        type: "list",
        name: "serviceType",
        choices: ["none", "http", "tcp"],
        message: "What type of service does your application expose?",
        default: "http"
      },
      {
        when: ({ serviceType }) => serviceType !== "none",
        type: "input",
        name: "containerPort",
        message: "What port is the application listening on in the container?",
        default: 80
      },
      {
        when: ({ serviceType }) => serviceType === "tcp",
        type: "input",
        name: "servicePort",
        message: "What is the external port to access your service?",
        default: ({ containerPort }) => containerPort
      },
      {
        type: "confirm",
        name: "pvcEnabled",
        message: "Does your application need a persistent volume?",
        default: true
      },
      {
        when: ({ pvcEnabled }) => pvcEnabled,
        type: "input",
        name: "pvcMountPath",
        message: "Where should the persistence volume be mounted?",
        default: "/var/data"
      }
    ]);
  }

  default() {
    if (path.basename(this.destinationPath()) !== this.props.applicationId) {
      this.log(
        `Your generator must be inside a folder named ${this.props.applicationId}\nI"ll automatically create this folder.`
      );
      mkdirp(this.props.applicationId);
      this.destinationRoot(this.destinationPath(this.props.applicationId));
    }

    const readmeTpl = _.template(this.fs.read(this.templatePath("README.md")));

    this.composeWith(require.resolve("generator-node/generators/app"), {
      boilerplate: false,
      name: this.props.provisionerPackageName,
      projectRoot: "lib",
      skipInstall: true,
      travis: false,
      coveralls: false,
      editorconfig: false,
      description: `${this.props.applicationName} provisioner for CodeZero.`,
      readme: readmeTpl({
        applicationName: this.props.applicationName
      })
    });
  }

  writing() {
    const pkg = this.fs.readJSON(this.destinationPath("package.json"))

    this.fs.extendJSON(this.destinationPath("package.json"), {
      dependencies: {
        "@c6o/kubeclient": "0.0.6",
        "@provisioner/common": "0.0.8",
        "lit-element": "^2.4.0"
      },
      devDependencies: {
        "@c6o/cli": "0.0.6",
        typescript: "^4.0.2"
      },
      jest: {
        testPathIgnorePatterns: ["templates"]
      },
      keywords: ["codezero", "provisioner", ...pkg.keywords],
      files: ["k8s", ...pkg.files],
      scripts: {
        provision: "npx tsc -b && npx czctl provision app.yaml --package ./"
      }
    });

    // Update gitignore
    this.fs.append(this.destinationPath(".gitignore"), "lib/");
    this.fs.append(this.destinationPath(".gitignore"), "tsconfig.tsbuildinfo");

    // Copy all template files
    this.fs.copyTpl(
      this.templatePath("**"),
      this.destinationPath(""),
      this.props
    );

    if (!this.props.pvcEnabled) {
      // Remove pvc.yaml if not in use
      this.deleteDestination("k8s/pvc.yaml");
    }

    if (this.props.serviceType === "none") {
      // Remove service.yaml if not in use
      this.fs.deleteDestination("k8s/service.yaml");
    }
  }

  install() {
    this.npmInstall();

    // Initialize typescript commands
    this.spawnCommand("tsc", [
      "--init", 
      "--esModuleInterop", 
      "--moduleResolution", "node", 
      "--target", "es6",
      "--outDir", "./lib/",
      "--rootDir", "./src/",
      "--strictPropertyInitialization", "false",
      "--noImplicitAny", false
    ]);
  }
};
