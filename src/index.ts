#!/usr/bin/env node

import * as fs from 'node:fs'
import * as path from 'node:path'

const main = () => {
  const cwd = process.cwd()
  const targetDir = "graphai-agent";
  const root = path.join(cwd, targetDir)

  if (!fs.existsSync(root)) {
    fs.mkdirSync(root)
  }
  fs.writeFileSync(
    path.resolve(root, 'README.md'),
    "# GraphAI Agent"
  )
};

main();
