
# MCP Server entry point (if we were running standalone)
from mcp.server.fastmcp import FastMCP
from mcp.tools import tool

# Since we are importing tools directly into the agent in the same process,
# we might not strictly need FastMCP server running, but it's good practice
# to structure it as an MCP server.

mcp = FastMCP("TodoMCP")

# We can register the tools here if we want to run it as a server.
# For now, the Agent will import functions from tools.py directly.
