"use strict";
const Generator = require("yeoman-generator");
const path = require("path");
const chalk = require("chalk");
const yosay = require("yosay");
const _ = require("lodash");
const extend = _.merge;
const validatePackageName = require("validate-npm-package-name");
const commandExists = require("command-exists").sync;
const filter = require("gulp-filter");
const replace = require("gulp-replace");
const pkgJson = require("../../package.json");

module.exports = class extends Generator {
  constructor(args, options) {
    super(args, options);

    this.argument("appname", { type: String, required: false });

    this.option("skip-license", {
      type: Boolean,
      required: false,
      default: false,
      desc: "Skip Generating License",
    });

    this.option("skip-jest", {
      type: Boolean,
      required: false,
      default: false,
      desc: "Skip adding Jest unit tests",
    });

    this.option("yarn", {
      type: Boolean,
      required: false,
      default: false,
      desc: "Use Yarn package manager",
    });

    this.option("npm", {
      type: Boolean,
      required: false,
      default: false,
      desc: "Use NPM even, if Yarn exists globally",
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

    if (!this.options["skip-jest"]) {
      this.composeWith(require.resolve("../jest"));
    }

    this.props = {
      applicationId:
        this.args.appname || path.basename(process.cwd()).toLowerCase(),
      npmCmd: this.options.yarn ? "yarn" : "npm",
      npxCmd: this.options.yarn ? "yarn run" : "npx",
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
          validate: (value) => {
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
          },
        },
        {
          type: "input",
          name: "applicationName",
          message: "What is the display name of your application?",
          default: ({ applicationId }) => _.startCase(applicationId),
        },
        {
          type: "input",
          name: "provisionerPackageName",
          message: "What is the provisioners NPM package name?",
          default: ({ applicationId }) => `${applicationId}-provisioner`,
          validate: function (value) {
            const validity = validatePackageName(value);
            if (validity.validForNewPackages) {
              return true;
            }

            return _.get(
              validity,
              "errors.0",
              "The name is not a valid npm package name."
            );
          },
        },
        {
          type: "input",
          name: "containerImage",
          message:
            "What is the name of the docker hub image for your application?",
          default: ({ applicationId }) => applicationId,
          validate: (value) => (value ? true : "Cannot be left empty."),
        },
        {
          type: "input",
          name: "tag",
          message:
            "What is the container image version/tag you would like to use?",
          default: "latest",
        },
        {
          type: "list",
          name: "serviceType",
          choices: ["none", "http", "tcp"],
          message: "What type of service does your application expose?",
          default: "http",
        },
        {
          when: ({ serviceType }) => serviceType !== "none",
          type: "input",
          name: "containerPort",
          message:
            "What port is the application listening on inside the container?",
          default: 80,
        },
        {
          when: ({ serviceType }) => serviceType === "tcp",
          type: "input",
          name: "servicePort",
          message:
            "What should be the external port to access your TCP service?",
          default: ({ containerPort }) => containerPort,
        },
        {
          type: "confirm",
          name: "persistentVolumeEnabled",
          message: "Does your application need a persistent volume?",
          default: true,
        },
        {
          when: ({ persistentVolumeEnabled }) => persistentVolumeEnabled,
          type: "input",
          name: "volumeMountPath",
          message: "Where should the persistence volume be mounted?",
          default: "/var/data",
        },
      ])
    );
  }

  default() {
    if (!this.options["skip-license"]) {
      this.composeWith(require.resolve("generator-license/app"), {
        name: this.props.authorName,
        email: "",
        website: "",
      });
    }
  }

  writing() {
    // Filter empty lines from yaml files
    const yamlFilter = filter(["**/*.yaml"], { restore: true });
    this.registerTransformStream([
      yamlFilter,
      // Remove all empty lines or lines with a single "#" and nothing else
      replace(/\n([^\n\S]*#?[^\n\S]*(\r?\n|$))+/gm, "\n"),
      yamlFilter.restore,
    ]);

    // Filter empty lines from yaml files
    const tsFilter = filter(["**/*.ts"], { restore: true });
    this.registerTransformStream([
      tsFilter,
      // Remove all lines with a single "//" and nothing else
      replace(/\n([^\n\S]*\/\/[^\n\S]*(\r?\n|$))+/gm, "\n"),
      tsFilter.restore,
    ]);

    // Copy all template files
    const currentPkg = this.fs.readJSON(
      this.destinationPath("package.json"),
      {}
    );

    const pkg = extend(
      {
        name: this.props.provisionerPackageName,
        main: "lib/index.js",
        description: `CodeZero Provisioner for ${this.props.applicationName}`,
        scripts: {
          clean: "del lib/",
          bundle: `parcel build ./src/ui/index.ts --no-cache --out-dir ./lib/ui`,
          build: `tsc --pretty && ${this.props.npmCmd} run bundle`,
          provision: `${this.props.npmCmd} run build && czctl provision app.yaml --package ./`,
          format: 'prettier --write "{src,__tests__}/**/*.ts"',
          lint: 'tslint --force --format verbose "src/**/*.ts"',
          prebuild:
            "npm run clean && npm run format && npm run lint && echo Using TypeScript && tsc --version",
          develop: "npm run build -- --watch",
          test: 'echo "Error: no test specified" && exit 1',
        },
        files: ["lib/", "k8s/"],
        keywords: [
          "codezero",
          "provisioner",
          "kubernetes",
          this.props.applicationId,
          this.props.applicationName,
          this.props.containerImage,
        ],
        jest: {
          preset: "ts-jest",
        },
        dependencies: {
          "@c6o/kubeclient": pkgJson.dependencies["@c6o/kubeclient"],
          "@provisioner/common": pkgJson.dependencies["@provisioner/common"],
          "lit-element": pkgJson.dependencies["lit-element"],
          mixwith: pkgJson.dependencies.mixwith,
        },
        devDependencies: {
          "@types/node": pkgJson.devDependencies["@types/node"],
          "parcel-bundler": pkgJson.devDependencies["parcel-bundler"],
          prettier: pkgJson.devDependencies.prettier,
          typescript: pkgJson.devDependencies.typescript,
          "ts-node": pkgJson.devDependencies["ts-node"],
          tslint: pkgJson.devDependencies.tslint,
          "tslint-config-prettier":
            pkgJson.devDependencies["tslint-config-prettier"],
        },
        engines: {
          node: ">=10.0.0",
        },
      },
      currentPkg
    );

    // Preserve existing files and keywords
    if (currentPkg.files)
      pkg.files = _.uniq(_.concat(pkg.files, currentPkg.files));
    if (currentPkg.keywords)
      pkg.keywords = _.uniq(_.concat(pkg.keywords, currentPkg.keywords));

    this.fs.writeJSON(this.destinationPath("package.json"), pkg);

    this.fs.copyTpl(
      this.templatePath("**"),
      this.destinationPath(""),
      this.props
    );

    this.fs.move(
      this.destinationPath("_.editorconfig"),
      this.destinationPath(".editorconfig")
    );
    this.fs.move(
      this.destinationPath("_.gitignore"),
      this.destinationPath(".gitignore")
    );

    if (!this.props.persistentVolumeEnabled) {
      // Remove pvc.yaml if not in use
      this.fs.delete(this.destinationPath("k8s/pvc.yaml"));
    }

    if (this.props.serviceType === "none") {
      // Remove service.yaml if not in use
      this.fs.delete(this.destinationPath("k8s/service.yaml"));
    }
  }

  install() {
    this.installDependencies({
      npm: !this.options.yarn,
      yarn: this.options.yarn,
      bower: false,
    });

    this.spawnCommand(this.props.npmCmd, ["run", "prebuild"]);
  }
};
