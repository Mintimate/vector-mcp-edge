# 架构全景图

本项目核心是：**以 CNB 知识库为统一检索底座**，向上提供两种消费方式。

## 总体架构

```mermaid
flowchart TB
    %% 强制放大字体与节点间距，防止缩放导致字太小
    classDef default fontSize:16px,padding:16px;

    subgraph Base ["🗄️ 知识底座"]
        A["📄 VitePress Markdown"] -->|文档 push| B["🔄 CNB 流水线<br/>分块 & 向量化"]
        B --> C["🗄️ CNB 知识库 API"]
    end

    subgraph PlanA ["⚡ 方案一：MCP 工具链"]
        D["EdgeOne MCP Server"] --> F["🤖 外部 AI 工具<br/>Cursor / Claude 等"]
    end

    subgraph PlanB ["🔧 方案二：RAG 编排链"]
        E["Go RAG 服务"] --> G["💬 VitePress 前端<br/>AI 助手组件"]
    end

    C -->|MCP 协议| D
    C -->|API 调用| E

    %% 泳道/分组样式
    style Base fill:#f8f9fa,stroke:#cfd8dc,stroke-width:2px,stroke-dasharray: 5 5
    style PlanA fill:#f3e5f5,stroke:#ce93d8,stroke-width:2px,stroke-dasharray: 5 5
    style PlanB fill:#fce4ec,stroke:#f48fb1,stroke-width:2px,stroke-dasharray: 5 5

    %% 节点样式
    style A fill:#e1f5fe,stroke:#0288d1,stroke-width:2px
    style B fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style C fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    style D fill:#ffffff,stroke:#7b1fa2,stroke-width:2px
    style F fill:#ffffff,stroke:#5e35b1,stroke-width:2px
    style E fill:#ffffff,stroke:#c62828,stroke-width:2px
    style G fill:#ffffff,stroke:#ad1457,stroke-width:2px
```

## 数据流说明

1. 文档更新后推送到仓库
2. CNB 流水线自动将 Markdown 分块并向量化
3. 两套方案都通过 CNB 知识库 API 检索语义片段
4. 方案一由外部 AI 客户端完成对话与推理
5. 方案二由 Go 服务编排 LLM + Tool Calling

## 边界与职责

- **CNB**：文档向量化、知识库存储、查询 API
- **EdgeOne MCP Server**：对外暴露标准 MCP 工具协议
- **Go RAG 服务**：对话编排、模型调用、流式输出
- **前端组件**：交互体验、流式渲染、历史记录

## 设计原则

- 单一数据源：只维护一份文档知识库
- 协议标准化：优先使用 MCP，降低工具接入成本
- 渐进式建设：先方案一快速上线，再按需演进方案二
