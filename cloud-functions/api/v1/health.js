export function onRequestGet() {
  return Response.json({ status: 'ok', message: 'MCP service is running' })
}
