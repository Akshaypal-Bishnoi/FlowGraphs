import asyncio
import os
import httpx
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from langchain_community.tools.tavily_search import TavilySearchResults
from .mcp_manager import mcp_manager

async def execute_llm(node: dict, inputs: dict) -> dict:
    """Execute an LLM node using LangChain's ChatOpenAI."""
    system_prompt = inputs.get("system", node.get("data", {}).get("system", "You are a helpful AI assistant."))
    prompt = inputs.get("prompt", node.get("data", {}).get("prompt", ""))
    
    # Instantiate the model. We can allow temperature and model selection in the future.
    llm = ChatOpenAI(
        api_key=os.environ.get("OPENAI_API_KEY"),
        model="gpt-4o-mini", 
        temperature=0.7
    )
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=prompt)
    ]
    
    response = await llm.ainvoke(messages)
    return {"response": response.content}

async def execute_webhook(node: dict, inputs: dict) -> dict:
    """Execute a Webhook node."""
    url = inputs.get("url", node.get("data", {}).get("url", ""))
    payload = inputs.get("payload", node.get("data", {}).get("payload", {}))
    
    if not url:
        return {"error": "No URL provided for webhook."}
        
    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(url, json=payload)
            return {"status": res.status_code, "body": res.text}
        except Exception as e:
            return {"error": str(e)}

async def execute_timer(node: dict, inputs: dict) -> dict:
    """Execute a Timer node (Wait)."""
    duration_str = inputs.get("duration", node.get("data", {}).get("duration", "1"))
    try:
        duration = float(duration_str)
    except:
        duration = 1.0
        
    await asyncio.sleep(duration)
    return {"done": True}

async def execute_custom(node: dict, inputs: dict) -> dict:
    """Generic fallback for custom inputs/outputs."""
    # Just pass through the data or inputs
    val = inputs.get("value", node.get("data", {}).get("value", ""))
    return {"value": val}

# BUILT-IN TOOLS FOR AGENT
@tool
def get_weather(location: str) -> str:
    """Call this tool to get the current weather for a specific location."""
    loc = location.lower()
    if "tokyo" in loc or "japan" in loc:
        return "It's 65 degrees and rainy."
    if "san francisco" in loc or "california" in loc:
        return "It's 55 degrees and foggy."
    return "It's 72 degrees and sunny."

@tool
def calculator(expression: str) -> str:
    """Call this tool to evaluate a simple math expression (e.g., '2 + 2', '100 / 4')."""
    try:
        # In a real app, use a safer eval or a real math API
        result = eval(expression, {"__builtins__": {}}, {})
        return str(result)
    except Exception as e:
        return f"Error calculating: {e}"

@tool
def query_knowledge_base(query: str) -> str:
    """Call this tool to search the internal company Knowledge Base for documents. Always use this first before searching the web for company-related queries."""
    query = query.lower()
    if "vacation" in query or "pto" in query:
        return "Company Policy: Employees get 20 days of PTO per year. Carryover is limited to 5 days."
    if "wifi" in query or "password" in query or "network" in query:
        return "The guest Wi-Fi password is 'Welcome2024'. For internal networks, use SSO. To reset a password, use the IT portal."
    if "onboarding" in query:
        return "New hires should complete the HR portal training by day 3."
    return "No internal documents found matching your query."

# Instantiate the Tavily search tool (will error gracefully if TAVILY_API_KEY is not set)
tavily_search = TavilySearchResults(max_results=3)

BUILTIN_TOOLS = [get_weather, calculator, tavily_search, query_knowledge_base]

async def execute_agent(node: dict, inputs: dict) -> dict:
    """Execute an autonomous LangGraph ReAct Agent."""
    prompt = inputs.get("prompt", node.get("data", {}).get("prompt", ""))
    
    if not prompt:
        return {"error": "Agent requires a prompt input."}
        
    llm = ChatOpenAI(
        api_key=os.environ.get("OPENAI_API_KEY"),
        model="gpt-4o-mini", 
        temperature=0
    )
    
    agent = create_react_agent(llm, tools=BUILTIN_TOOLS + mcp_manager.tools)
    
    response = await agent.ainvoke({"messages": [("user", prompt)]})
    
    # Extract the final message content
    final_message = response["messages"][-1].content
    return {"response": final_message}

# Registry mapping node types to their execution functions
NODE_REGISTRY = {
    "llm": execute_llm,
    "agent": execute_agent,
    "webhook": execute_webhook,
    "timer": execute_timer,
    "customInput": execute_custom,
    "customOutput": execute_custom,
}
