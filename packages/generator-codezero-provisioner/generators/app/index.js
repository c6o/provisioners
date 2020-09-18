"use strict";
const Generator = require("yeoman-generator");
const path = require("path");
const chalk = require("chalk");
const yosay = require("yosay");
const _ = require("lodash");
const extend = _.merge;
const validatePackageName = require("validate-npm-package-name");
const commandExists = require("command-exists").sync;

module.exports = class extends Generator {
  constructor(args, options) {
    super(args, options);

    this.argument("appname", { type: String, required: false });

    this.option("skip-license", {
      type: Boolean,
      required: false,
      default: false,
      desc: "Skip Generating License"
    });

    this.option("yarn", {
      type: Boolean,
      required: false,
      default: false,
      desc: "Use Yarn package manager"
    });

    this.option("npm", {
      type: Boolean,
      required: false,
      default: false,
      desc: "Use NPM even, if Yarn exists globally"
    });
  }

  initializing() {
    if (!this.options.npm && !this.options.yarn) {
      this.options.yarn = commandExists("yarn");
    } else if (this.options.npm && this.options.yarn) {
      this.emit(
        "error",
        new Error(
          "Cannot specify both --npm and --yarn, please choose only one package manager."
        )
      );
    }

    this.props = {
      applicationId:
        this.args.appname || path.basename(process.cwd()).toLowerCase(),
      npmCmd: this.options.yarn ? "yarn" : "npm",
      npxCmd: this.options.yarn ? "yarn run" : "npx"
    };
  }

  async prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(
        `Welcome to the stupendous ${chalk.red(
          "CodeZero Provisioner"
        )} generator!`
      )
    );

    this.props = extend(
      this.props,
      await this.prompt([
        {
          type: "input",
          name: "applicationId",
          message: "What is the name of your application?",
          default: path.basename(process.cwd()).toLowerCase(),
          validate: value => {
            if (value.match(/[^a-zA-Z0-9-]/) !== null) {
              return "Name can only contain letters, numbers and dashes.";
            }

            if (value.match(/^[a-zA-Z].*[a-zA-Z]$/ === null)) {
              return "Name must start and end with a letter (a-z).";
            }

            if (value.length < 4) {
              return "Name must be 4 characters or longer.";
            }

            return true;
          }
        },
        {
          type: "input",
          name: "applicationName",
          message: "What is the display name of your application?",
          default: ({ applicationId }) => _.startCase(applicationId)
        },
        {
          type: "input",
          name: "provisionerPackageName",
          message: "What is the provisioners NPM package name?",
          default: ({ applicationId }) => `${applicationId}-provisioner`,
          validate: function(value) {
            const validity = validatePackageName(value);
            if (validity.validForNewPackages) {
              return true;
            }

            return _.get(
              validity,
              "errors.0",
              "The name is not a valid npm package name."
            );
          }
        },
        {
          type: "input",
          name: "containerImage",
          message:
            "What is the name of the docker hub image for your application?",
          default: ({ applicationId }) => applicationId,
          validate: value => (value ? true : "Cannot be left empty.")
        },
        {
          type: "input",
          name: "tag",
          message:
            "What is the container image version/tag you would like to use?",
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
          message:
            "What port is the application listening on inside the container?",
          default: 80
        },
        {
          when: ({ serviceType }) => serviceType === "tcp",
          type: "input",
          name: "servicePort",
          message:
            "What should be the external port to access your TCP service?",
          default: ({ containerPort }) => containerPort
        },
        {
          type: "confirm",
          name: "persistentVolumeEnabled",
          message: "Does your application need a persistent volume?",
          default: true
        },
        {
          when: ({ persistentVolumeEnabled }) => persistentVolumeEnabled,
          type: "input",
          name: "volumeMountPath",
          message: "Where should the persistence volume be mounted?",
          default: "/var/data"
        }
      ])
    );
  }

  default() {
    if (!this.options["skip-license"]) {
      this.composeWith(require.resolve("generator-license/app"), {
        name: this.props.authorName,
        email: this.props.authorEmail,
        website: this.props.authorUrl
      });
    }
  }

  writing() {
    // Copy all template files
    this.fs.copyTpl(
      this.templatePath("**"),
      this.destinationPath(""),
      this.props
    );

    if (!this.props.persistentVolumeEnabled) {
      // Remove pvc.yaml if not in use
      this.deleteDestination("k8s/pvc.yaml");
    }

    if (this.props.serviceType === "none") {
      // Remove service.yaml if not in use
      this.fs.deleteDestination("k8s/service.yaml");
    }
  }

  install() {
    const pkgs = [
      "@c6o/kubeclient",
      "@provisioner/common",
      "mixwith",
      "lit-element"
    ];
    const devPkgs = ["typescript", "parcel-bundler"];

    if (this.options.yarn) {
      this.yarnInstall(pkgs);
      this.yarnInstall(devPkgs, { dev: true });
      this.yarnInstall();
    } else {
      this.npmInstall(pkgs);
      this.npmInstall(devPkgs, { dev: true });
      this.npmInstall();
    }

    // Initialize typescript commands
    this.spawnCommand(`npx`, [
      "tsc",
      "--init",
      "--esModuleInterop",
      "--moduleResolution",
      "node",
      "--target",
      "es6",
      "--outDir",
      "./lib/",
      "--rootDir",
      "./src/",
      "--strictPropertyInitialization",
      "false",
      "--noImplicitAny",
      "false",
      "--experimentalDecorators"
    ]);
  }
};
