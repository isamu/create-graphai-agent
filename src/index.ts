#!/usr/bin/env node

import * as fs from "node:fs";
import * as path from "node:path";

import prompts from "prompts";

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

  const defaultProjectName = "graphai-agent";
  const result = await prompts([
    {
      name: "agentName",
      type: "text",
      message: "agent name",
      initial: defaultProjectName,
    },
    {
      name: "description",
      type: "text",
      message: "agent description",
      initial: "",
    },
    {
      name: "author",
      type: "text",
      message: "author name",
      initial: "YOU", // TODO
    },
    {
      name: "license",
      type: "text",
      message: "license",
      initial: "MIT",
    },
    {
      name: "category",
      type: "text",
      message: "agent category",
      initial: "",
    },
    {
      name: "repository",
      type: "text",
      message: "repository",
      initial: "https://github.com/receptron/graphai/",
    },
  ]);
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
