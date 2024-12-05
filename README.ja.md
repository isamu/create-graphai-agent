# create-graphai-agent

GraphAIのagentをgeneratorを使って作ります。

コマンドは以下。
```
npm create graphai-agent@latest
```

実行するとこのようになります。

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

zenn-agent作成されます

```
cd graphai-agent
yarn install
yarn run test
```

でunit testが実行されます。

unit testは`src/zenn_agent.ts`のsamplesの値を使い、inputs, paramsの入力値で結果がresultに一致するか検証しています。

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

`src/zenn_agent.ts` にエージェントに必要な機能を実装し、samplesを変更すればunit testできます。

samplesはarrayなので、テストケースは複数指定できます。

一通り実装し、テストが終わったらビルド。
```
yarn run build
```

samplesなどを元にdocument を自動生成
```
yarn run doc
```

package.jsonのnameなどを決めて、npm publish

```
npm publish  --access=public
```

すると、npm packageで、graphaiからagentが使えるようになります。

