#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.args = void 0;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const yargs_1 = __importDefault(require("yargs"));
const prompts_1 = __importDefault(require("prompts"));
const defaultProjectName = "graphai-agent";
const textArgs = [
    {
        name: "agentName",
        alias: "n",
        description: "agent name",
        default: defaultProjectName,
    },
    {
        name: "description",
        description: "",
        default: "this is agent",
    },
    {
        name: "author",
        description: "your name",
        default: "ai",
    },
    {
        name: "license",
        description: "license",
        default: "MIT",
    },
    {
        name: "category",
        description: "agent cagtegory",
        default: "general",
    },
    {
        name: "repository",
        description: "git repository url",
        default: "https://github.com/receptron/graphai/",
    },
];
//
exports.args = (() => {
    const ret = yargs_1.default.scriptName("npm create graphai-agent").option("noninteractive", {
        alias: "c",
        description: "non interactive",
        default: false,
        type: "boolean",
    });
    textArgs.forEach((opt) => {
        ret.option(opt.name, {
            description: opt.description,
            default: opt.default,
            type: "string",
        });
    });
    ret.option("outdir", {
        description: "output_dir",
        demandOption: false,
        type: "string",
    });
    return ret.parseSync();
})();
//
const copyFile = (root, file) => {
    const templateDir = path.resolve(__dirname, "..", "template");
    fs.copyFileSync(path.resolve(templateDir, file), path.resolve(root, file));
};
const convertToLowerCamelCaseAndSnakeCase = (input) => {
    const __normalized = input
        .trim()
        .replace(/[\s-_]+/g, " ")
        .toLowerCase()
        .split(" ");
    if (__normalized[__normalized.length - 1] !== "agent") {
        __normalized.push("agent");
    }
    const normalized = __normalized.join(" ");
    const lowerCamelCase = __normalized
        .map((word, index) => {
        if (index === 0)
            return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
    })
        .join("");
    const snakeCase = normalized.replace(/\s+/g, "_");
    const kebabCase = normalized.replace(/\s+/g, "-");
    return { lowerCamelCase, snakeCase, kebabCase, normalized };
};
const mkdir = (path) => {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
};
const npmLatestVersion = async (name) => {
    const res = await fetch("https://registry.npmjs.org/" + name);
    const body = await res.json();
    return body["dist-tags"]["latest"];
    return res;
};
const main = async () => {
    const [graphAI_latest, vanilla_latest, test_utils_latest, agentdoc_latest] = await Promise.all([
        npmLatestVersion("graphai"),
        npmLatestVersion("@graphai/vanilla"),
        npmLatestVersion("@receptron/test_utils"),
        npmLatestVersion("@receptron/agentdoc"),
    ]);
    const result = await (async () => {
        if (exports.args.noninteractive) {
            return exports.args;
            /*
            textArgs.forEach(opt => {
              console.log(opt.name);
              console.log(args[opt.name])
            });
            console.log(args.agentName);
            */
        }
        else {
            const promptsArg = textArgs.map((opt) => {
                return {
                    name: opt.name,
                    type: "text",
                    message: opt.description,
                    initial: opt.default,
                };
            });
            return await (0, prompts_1.default)(promptsArg);
        }
    })();
    /*
    cacheType
    environmentVariables
    stream
    apiKeys
  */
    const cwd = result["outdir"] ? result["outdir"] : process.cwd();
    const agentName = result["agentName"].trim();
    const description = result["description"];
    const author = result["author"];
    const license = result["license"];
    const category = result["category"];
    const repository = result["repository"];
    console.log(result);
    // agentName, file_name, agent-name
    const { lowerCamelCase, snakeCase, kebabCase } = convertToLowerCamelCaseAndSnakeCase(agentName);
    const root = path.join(cwd, kebabCase);
    mkdir(root);
    mkdir(path.resolve(root, "src"));
    mkdir(path.resolve(root, "tests"));
    copyFile(root, "eslint.config.mjs");
    copyFile(root, "tsconfig.json");
    copyFile(root, "tests/test_agent_runner.ts");
    // source
    const src = fs.readFileSync(path.resolve(__dirname, "..", "template", "src", "template_agent.ts"), "utf8");
    fs.writeFileSync(path.resolve(root, "src", snakeCase + ".ts"), src
        .replaceAll("templateAgent", lowerCamelCase)
        .replaceAll("AgentDescription", description)
        .replaceAll("AgentCategory", category)
        .replaceAll("AgentAuthor", author)
        .replaceAll("AgentRepository", repository)
        .replaceAll("LICENSE", license));
    // packages
    const packageFile = fs.readFileSync(path.resolve(__dirname, "..", "template", "package.json"), "utf8");
    const packageJson = JSON.parse(packageFile);
    packageJson.name = snakeCase;
    packageJson.description = description;
    packageJson.author = author;
    packageJson.license = license;
    packageJson.devDependencies["@graphai/vanilla"] = "^" + vanilla_latest;
    packageJson.devDependencies["@receptron/agentdoc"] = "^" + agentdoc_latest;
    packageJson.devDependencies["@receptron/test_utils"] = "^" + test_utils_latest;
    packageJson.devDependencies["graphai"] = "^" + graphAI_latest;
    fs.writeFileSync(path.resolve(root, "package.json"), JSON.stringify(packageJson, null, 2));
    // index
    fs.writeFileSync(path.resolve(root, "src/index.ts"), [`import ${lowerCamelCase} from "./${snakeCase}";`, "", "export { " + lowerCamelCase + " };"].join("\n"));
    fs.writeFileSync(path.resolve(root, "README.md"), ["# GraphAI Agent", agentName].join("\n"));
};
main();
