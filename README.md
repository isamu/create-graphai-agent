# create-graphai-agent


Create a GraphAI agent using a generator.

```
npm create graphai-agent@latest
```

When you run it, it will look like this.

```
$ npm create graphai-agent@latest
Need to install the following packages:
create-graphai-agent@0.0.9
Ok to proceed? (y) 

> npx
> create-graphai-agent

✔ agent name … zenn-agent
✔ agent description … read zenn from web
✔ author name … isamu
✔ license … MIT
✔ agent category … zenn
✔ repository … https://github.com/receptron/graphai/
```

zenn-agent will be created

```
cd graphai-agent
yarn install
yarn run test
```

The unit test will be executed.


The unit test uses the samples value of `src/zenn_agent.ts` and verifies whether the result matches the result with the input values ​​of inputs and params.

```
  samples: [{
    params: {a: "1"},
    inputs: {b: "2"},
    result: {
      params: {a: "1"},
      namedInputs: {b: "2"},
    },
  }],
```

You can unit test by implementing the functions required for the agent in `src/zenn_agent.ts` and changing the samples.

Since samples is an array, multiple test cases can be specified.

Once implemented and tested, build.

```
yarn run build
```

Automatically generate documents based on samples etc.

```
yarn run doc
```

Change the name of package.json and npm publish

```
npm publish  --access=public
```

Then, you will be able to use the agent from graphai with the npm package.

## options

### -f filename

Generate a single TypeScript file for the agent instead of a package.

### -s (simple mode)

Make the package.json file simple, primarily for use in a monorepo.
