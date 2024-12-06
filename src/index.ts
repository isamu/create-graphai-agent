#!/usr/bin/env node

import * as fs from "node:fs";
import * as path from "node:path";

import yargs from "yargs";

import prompts from "prompts";

const defaultProjectName = "graphai-agent";

const textArgs = [
  {
    name: "agentName",
    alias: "n",
    description: "agent name",
    default: defaultProjectName,
  }, {
    name: "description",
    description: "",
    default: "this is agent",
  }, {
    name: "author",
    description: "your name",
    default: "ai",
  }, {
    name: "license",
    description: "license",
    default: "MIT",
  }, {
    name: "category",
    description: "agent cagtegory",
    default: "general",
  }, {
    name: "repository",
    description: "git repository url",
    default: "https://github.com/receptron/graphai/",
  }];
//
export const args = (() => {
  const ret = yargs
        .scriptName("npm create graphai-agent")
        .option("noninteractive", {
          alias: "c",
          description: "non interactive",
          default: false,
          type: "boolean",
        });
  textArgs.forEach(opt => {
    ret.option(opt.name, {
      description: opt.description,
      default: opt.default,
      type: "string",
    })
  });
  return ret.parseSync()
})();
//

const copyFile = (root: string, file: string) => {
  const templateDir = path.resolve(__dirname, "..", "template");
  fs.copyFileSync(path.resolve(templateDir, file), path.resolve(root, file));
};

const convertToLowerCamelCaseAndSnakeCase = (input: string) => {
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
      if (index === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join("");

  const snakeCase = normalized.replace(/\s+/g, "_");
  const kebabCase = normalized.replace(/\s+/g, "-");

  return { lowerCamelCase, snakeCase, kebabCase, normalized };
};

const mkdir = (path: string) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
};

const npmLatestVersion = async (name: string) => {
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
    if (args.noninteractive) {
      return args;
      /*
      textArgs.forEach(opt => {
        console.log(opt.name);
        console.log(args[opt.name])
      });
      console.log(args.agentName);
      */
    } else {
      const promptsArg = textArgs.map((opt) => {
        return {
          name: opt.name,
          type: "text" as const,
          message: opt.description,
          initial: opt.default,
        };
      });
      return await prompts(promptsArg);
    }
  })();
  /*
  cacheType
  environmentVariables
  stream
  apiKeys
*/

  const cwd = process.cwd();

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
  fs.writeFileSync(
    path.resolve(root, "src", snakeCase + ".ts"),
    src
      .replaceAll("templateAgent", lowerCamelCase)
      .replaceAll("AgentDescription", description)
      .replaceAll("AgentCategory", category)
      .replaceAll("AgentAuthor", author)
      .replaceAll("AgentRepository", repository)
      .replaceAll("LICENSE", license),
  );

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
  fs.writeFileSync(
    path.resolve(root, "src/index.ts"),
    [`import ${lowerCamelCase} from "./${snakeCase}";`, "", "export { " + lowerCamelCase + " };"].join("\n"),
  );

  fs.writeFileSync(path.resolve(root, "README.md"), ["# GraphAI Agent", agentName].join("\n"));
};

main();
