#!/usr/bin/env node

import * as fs from 'node:fs'
import * as path from 'node:path'

import prompts from 'prompts';

const copyFile = (root: string, file: string) => {
  const templateDir = path.resolve(__dirname, "..", "template")
  fs.copyFileSync(path.resolve(templateDir, file), path.resolve(root, file))
  
}
const mkdir = (path: string) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
  }
};
const main = async () => {
  const defaultProjectName = "graphai-agent"
  const result = await prompts(
    [
      {
        name: 'agentName',
        type: 'text',
        message: 'agent name',
        initial: defaultProjectName,
        // onState: (state) => (targetDir = String(state.value).trim() || defaultProjectName),
      },
    ]
  )
  const agentName = result["agentName"].trim();
  
  const cwd = process.cwd()
  const targetDir = agentName;
  const root = path.join(cwd, targetDir)

  mkdir(root);
  mkdir(path.resolve(root, "src"))
  mkdir(path.resolve(root, "tests"))

  copyFile(root, "eslint.config.mjs");
  copyFile(root, "tests/test_agent_runner.ts");
  
  fs.writeFileSync(
    path.resolve(root, 'README.md'),
    [
      "# GraphAI Agent",
      agentName,
    ].join("\n")
  )
};

main();
