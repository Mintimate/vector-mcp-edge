# 知识库向量化

CNB 平台提供了开箱即用的知识库能力，可以自动将仓库中的 Markdown 文件进行向量化处理，生成语义索引。

## 配置 `.cnb.yml`

在项目根目录创建 `.cnb.yml`，配置流水线：

```yaml
main:
  push:
    - name: "向量化数据"
      stages:
        - name: build knowledge base
          image: cnbcool/knowledge-base
          settings:
            include: "**/**.md"

    - name: "构建并部署"
      docker:
        image: node:22
      stages:
        - name: "部署到 EdgeOne Pages"
          image: tencentcom/deploy-eopages:latest
          script:
            - npm install
            - npm run build
            - edgeone pages deploy -n my-docs
```

::: tip CNB 独有能力
传统方案中，要实现文档的语义搜索，你需要自行搭建向量数据库、编写文档分块逻辑、调用 Embedding 模型。而在 CNB 上，**你只需要在 `.cnb.yml` 中加一个 stage**，平台会自动完成全部工作。
:::

## 知识库 API

向量化完成后，CNB 会提供一个知识库查询 API：

```
POST https://api.cnb.cool/<用户名>/<仓库组>/<仓库名>/-/knowledge/base/query
```

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `query` | string | ✅ | 语义搜索的自然语言查询 |
| `keyword` | string | ❌ | 关键词过滤，多个用分号分隔 |
| `top_k` | number | ❌ | 返回结果数量，默认 5 |

### 请求示例

```bash
curl -X POST "https://api.cnb.cool/<用户名>/<仓库组>/<仓库名>/-/knowledge/base/query" \
  -H "Authorization: <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"query": "如何安装", "top_k": 5}'
```

::: info 零配置鉴权
CNB 平台会在流水线和 Edge Function 运行时自动注入 `CNB_TOKEN` 环境变量，你无需手动创建 API Key 或配置 Secret，开箱即用。
:::

## 下一步

- [编写 MCP Server](./mcp-server.md)
