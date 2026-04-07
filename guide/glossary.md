# 术语表

## CNB

Cloud Native Build，集代码托管、流水线、知识库、部署能力于一体的平台。

## EdgeOne Pages

腾讯云的边缘静态托管与函数能力平台，可部署站点和边缘函数。

## Edge Function

运行在边缘节点的函数计算能力，用于构建低延迟 API（本项目用于 MCP Server）。

## Go Cloud Function

EdgeOne Pages 支持的 Go 语言边缘函数能力（2026 年 4 月新增）。本项目基于此实现了一体化的 Go 后端，将 MCP Server、RAG 问答、Tool Use 全部整合在边缘函数中运行。

## MCP

Model Context Protocol，AI 与外部工具/资源交互的标准协议。

## Tool Calling

模型在对话中发起工具调用，再将工具结果返回给模型进行二次生成的流程。

## RAG

Retrieval-Augmented Generation，先检索再生成的问答模式。

## 向量化

将文本转为向量表示，以支持语义检索。

## Embedding

把文本映射为向量的模型过程，常用于语义相似度计算。

## `top_k`

检索返回条数上限，值越大召回越多，但噪声可能增多。

## `keyword`

关键词过滤参数，常与语义查询组合以提升精确度。

## Streamable HTTP

MCP 常用的传输方式之一，支持增量/流式数据返回。
