import os
from typing import List, Any
import logging

logger = logging.getLogger(__name__)

class MCPManager:
    """Manages MCP server connections."""

    def __init__(self):
        self.tools: List[Any] = []
        self._sessions = {}

    async def connect_all(self):
        try:
            import json
            from contextlib import AsyncExitStack
            from mcp import ClientSession, StdioServerParameters
            from mcp.client.stdio import stdio_client
            from mcp.client.sse import sse_client

            # Get the path to mcp_config.json relative to this file's parent (engine/)
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            config_path = os.path.join(base_dir, "mcp_config.json")
            
            if not os.path.exists(config_path):
                logger.warning(f"MCP Config {config_path} not found.")
                return

            self._exit_stack = AsyncExitStack()

            with open(config_path, "r") as f:
                config = json.load(f)

            for name, details in config.get("mcpServers", {}).items():
                try:
                    import asyncio
                    transport_type = details.get("transport", "stdio")

                    async def _connect():
                        if transport_type == "sse":
                            url = details.get("url")
                            transport = await self._exit_stack.enter_async_context(sse_client(url))
                        else:
                            params = StdioServerParameters(
                                command=details.get("command"),
                                args=details.get("args", []),
                                env=details.get("env", None),
                            )
                            transport = await self._exit_stack.enter_async_context(stdio_client(params))
                            
                        read, write = transport
                        session = await self._exit_stack.enter_async_context(ClientSession(read, write))
                        await session.initialize()
                        return session

                    session = await asyncio.wait_for(_connect(), timeout=15.0)
                    self._sessions[name] = session
                    logger.info(f"✅ MCP Server connected: {name}")
                except Exception as e:
                    logger.error(f"❌ MCP Server {name} failed: {e}")

        except ImportError as e:
            logger.error(f"MCP dependencies not available: {e}")

    async def load_tools(self):
        if not hasattr(self, '_sessions'):
            return self.tools

        try:
            import asyncio
            from langchain_mcp_adapters.tools import load_mcp_tools

            for name, session in self._sessions.items():
                try:
                    mcp_tools = await asyncio.wait_for(load_mcp_tools(session), timeout=15.0)
                    for tool in mcp_tools:
                        tool.name = f"{name}_{tool.name}".replace("-", "_")
                        self.tools.append(tool)
                        logger.info(f"🔧 Loaded MCP tool: {tool.name}")
                except Exception as e:
                    logger.error(f"❌ Failed to load tools from {name}: {e}")
        except ImportError as e:
            logger.error(f"MCP dependencies for tools not available: {e}")

        return self.tools

    async def cleanup(self):
        if hasattr(self, '_exit_stack'):
            await self._exit_stack.aclose()

# Global instance to be used across the application
mcp_manager = MCPManager()
