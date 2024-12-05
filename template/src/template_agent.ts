import { AgentFunction, AgentFunctionInfo } from "graphai";

export const templateAgent: AgentFunction = async ({ params, namedInputs }) => {
  return { params, namedInputs };
};

const templateAgentInfo: AgentFunctionInfo = {
  name: "templateAgent",
  agent: templateAgent,
  mock: templateAgent,

  samples: [{
    params: {a: "1"},
    inputs: {b: "2"},
    result: {
      params: {a: "1"},
      namedInputs: {b: "2"},
    },
  }],
  description: "AgentDescription",
  category: ["AgentCategory"],
  author: "AgentAuthor",
  repository: "AgentRepository",
  license: "LICENSE",
};

export default templateAgentInfo;
