import React from 'react';
import { BaseNode } from './BaseNode';
import { nodeConfigs } from './nodeConfigs';

export const InputNode = ({ id, data }) => <BaseNode id={id} data={data} config={nodeConfigs.customInput} />;
export const OutputNode = ({ id, data }) => <BaseNode id={id} data={data} config={nodeConfigs.customOutput} />;
export const LLMNode = ({ id, data }) => <BaseNode id={id} data={data} config={nodeConfigs.llm} />;
export const APIRequestNode = ({ id, data }) => <BaseNode id={id} data={data} config={nodeConfigs.apiRequest} />;
export const ConditionalNode = ({ id, data }) => <BaseNode id={id} data={data} config={nodeConfigs.conditional} />;
export const MergeNode = ({ id, data }) => <BaseNode id={id} data={data} config={nodeConfigs.merge} />;
export const NoteNode = ({ id, data }) => <BaseNode id={id} data={data} config={nodeConfigs.note} />;
export const TimerNode = ({ id, data }) => <BaseNode id={id} data={data} config={nodeConfigs.timer} />;
export const RAGNode = ({ id, data }) => <BaseNode id={id} data={data} config={nodeConfigs.ragQuery} />;
export const AgentNode = ({ id, data }) => <BaseNode id={id} data={data} config={nodeConfigs.agent} />;
export const WebSearchNode = ({ id, data }) => <BaseNode id={id} data={data} config={nodeConfigs.webSearch} />;
export const MCPToolNode = ({ id, data }) => <BaseNode id={id} data={data} config={nodeConfigs.mcpTool} />;
export const WebhookNode = ({ id, data }) => <BaseNode id={id} data={data} config={nodeConfigs.webhook} />;
export const CodeRunnerNode = ({ id, data }) => <BaseNode id={id} data={data} config={nodeConfigs.codeRunner} />;
