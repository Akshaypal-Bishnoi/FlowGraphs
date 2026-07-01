export const templates = [
  {
    id: "tpl-1",
    name: "Automated Lead Generation",
    description: "Research a prospect and draft a personalized cold email.",
    icon: "Users",
    color: "bg-blue-500",
    nodes: [
      {
        id: "input-1",
        type: "customInput",
        position: { x: 100, y: 150 },
        data: { inputName: "lead_info", value: "Sarah Jenkins, VP Marketing at TechCorp" },
      },
      {
        id: "agent-1",
        type: "agent",
        position: { x: 450, y: 120 },
        data: { 
          systemPrompt: "You are an expert SDR. Use tools to research the prospect's company and draft a highly personalized cold email that focuses on their recent news.",
          tools: ["mcp_web_search", "mcp_linkedin"]
        },
      },
      {
        id: "output-1",
        type: "customOutput",
        position: { x: 800, y: 150 },
        data: { outputName: "email_draft" },
      }
    ],
    edges: [
      { id: "e1", source: "input-1", sourceHandle: "input-1-value", target: "agent-1", targetHandle: "agent-1-prompt", type: "custom", animated: true, markerEnd: { type: 'arrow', height: '20px', width: '20px' } },
      { id: "e2", source: "agent-1", sourceHandle: "agent-1-response", target: "output-1", targetHandle: "output-1-value", type: "custom", animated: true, markerEnd: { type: 'arrow', height: '20px', width: '20px' } }
    ],
    nodeIDs: { customInput: 1, agent: 1, customOutput: 1 }
  },
  {
    id: "tpl-2",
    name: "Customer Support Auto-Router",
    description: "Categorize incoming tickets and draft initial responses using a Knowledge Base.",
    icon: "Headset",
    color: "bg-green-500",
    nodes: [
      {
        id: "input-1",
        type: "customInput",
        position: { x: 100, y: 200 },
        data: { inputName: "ticket_text", value: "I can't seem to reset my password. The link in the email is expired." },
      },
      {
        id: "agent-1",
        type: "agent",
        position: { x: 400, y: 150 },
        data: { 
          systemPrompt: "You are a Level 1 Support Agent. Read the ticket, query the Knowledge Base to draft a helpful response, and categorize the ticket (Billing, Tech, Sales).",
          tools: ["mcp_knowledge_base"]
        },
      },
      {
        id: "output-1",
        type: "customOutput",
        position: { x: 700, y: 100 },
        data: { outputName: "draft_response" },
      },
      {
        id: "output-2",
        type: "customOutput",
        position: { x: 700, y: 250 },
        data: { outputName: "category" },
      }
    ],
    edges: [
      { id: "e1", source: "input-1", sourceHandle: "input-1-value", target: "agent-1", targetHandle: "agent-1-prompt", type: "custom", animated: true, markerEnd: { type: 'arrow', height: '20px', width: '20px' } },
      { id: "e2", source: "agent-1", sourceHandle: "agent-1-response", target: "output-1", targetHandle: "output-1-value", type: "custom", animated: true, markerEnd: { type: 'arrow', height: '20px', width: '20px' } },
      { id: "e3", source: "agent-1", sourceHandle: "agent-1-response", target: "output-2", targetHandle: "output-2-value", type: "custom", animated: true, markerEnd: { type: 'arrow', height: '20px', width: '20px' } }
    ],
    nodeIDs: { customInput: 1, agent: 1, customOutput: 2 }
  },
  {
    id: "tpl-3",
    name: "Competitor Price Monitor",
    description: "Scrape competitor pricing and alert if they drop below our margins.",
    icon: "TrendingUp",
    color: "bg-purple-500",
    nodes: [
      {
        id: "input-1",
        type: "customInput",
        position: { x: 100, y: 150 },
        data: { inputName: "competitor_url", value: "https://example.com/product-page" },
      },
      {
        id: "agent-1",
        type: "agent",
        position: { x: 400, y: 150 },
        data: { 
          systemPrompt: "You are a Pricing Analyst. Use the web scraper tool to read the competitor page, extract the exact price, and compare it to our baseline of $99.",
          tools: ["mcp_web_scraper"]
        },
      },
      {
        id: "output-1",
        type: "customOutput",
        position: { x: 750, y: 150 },
        data: { outputName: "price_analysis_report" },
      }
    ],
    edges: [
      { id: "e1", source: "input-1", sourceHandle: "input-1-value", target: "agent-1", targetHandle: "agent-1-prompt", type: "custom", animated: true, markerEnd: { type: 'arrow', height: '20px', width: '20px' } },
      { id: "e2", source: "agent-1", sourceHandle: "agent-1-response", target: "output-1", targetHandle: "output-1-value", type: "custom", animated: true, markerEnd: { type: 'arrow', height: '20px', width: '20px' } }
    ],
    nodeIDs: { customInput: 1, agent: 1, customOutput: 1 }
  },
  {
    id: "tpl-4",
    name: "Corrective RAG (C-RAG)",
    description: "Search internal Knowledge Base, grade relevance, and fallback to Web Search if needed.",
    icon: "Database",
    color: "bg-teal-500",
    nodes: [
      {
        id: "input-1",
        type: "customInput",
        position: { x: 50, y: 150 },
        data: { inputName: "user_query", value: "What is the guest Wi-Fi password?" },
      },
      {
        id: "agent-1",
        type: "agent",
        position: { x: 400, y: 120 },
        data: { 
          systemPrompt: "You are a Corrective RAG Agent. ALWAYS follow this process:\n1. Use the query_knowledge_base tool to search for internal documents.\n2. Grade the retrieved documents for relevance to the user query.\n3. If irrelevant or no documents found, use the tavily_search tool to search the web.\n4. Generate the final answer.",
          tools: ["query_knowledge_base", "tavily_search"]
        },
      },
      {
        id: "output-1",
        type: "customOutput",
        position: { x: 800, y: 150 },
        data: { outputName: "final_answer" },
      }
    ],
    edges: [
      { id: "e1", source: "input-1", sourceHandle: "input-1-value", target: "agent-1", targetHandle: "agent-1-prompt", type: "custom", animated: true, markerEnd: { type: 'arrow', height: '20px', width: '20px' } },
      { id: "e2", source: "agent-1", sourceHandle: "agent-1-response", target: "output-1", targetHandle: "output-1-value", type: "custom", animated: true, markerEnd: { type: 'arrow', height: '20px', width: '20px' } }
    ],
    nodeIDs: { customInput: 1, agent: 1, customOutput: 1 }
  }
];
