📊 Generative UI Dashboard (The Shape-Shifting App)
A next-generation AI dashboard that utilizes Generative UI. Instead of just returning text, the AI dynamically generates interactive UI components (like charts) directly in the chat window based on the user's natural language request.

🧠 How It Works
- Tool Calling (Function Calling): The backend defines a generate_sales_chart tool with a strict JSON schema (title, data array).
- LLM Reasoning: When the user asks for data, Groq (Llama-3.3-70b) recognizes the intent and calls the tool instead of replying with text.
- Generative UI Rendering: The backend parses the tool call and sends the structured data back to the frontend. The frontend dynamically spawns a <BarChart> component (via Recharts) directly inside the chat bubble.

🛠 Tech Stack
- Frontend: Next.js 14 (App Router), React, Tailwind CSS, Recharts
- Backend: Next.js Serverless API Routes (Node.js Runtime)
- AI/LLM: Groq (Llama-3.3-70b-versatile) with native Tool Calling

💻 Engineering Highlights
- Raw API Tool Calling: Architected a custom tool-calling pipeline using standard fetch and the raw Groq API, bypassing the need for heavy AI SDK wrappers like Vercel AI SDK. Handled JSON schema validation and execution manually.
- Dynamic Component Rendering: Utilized React state to dynamically render different UI components (Charts vs. Text) based on the API response type, creating a seamless Generative UI experience.
- Strict TypeScript Bypass: Implemented safe type-casting (as any) to bypass TypeScript's strict tool-call definitions without breaking the production build, ensuring rapid feature shipping.

🚀 Live Demo URL:(https://generative-ui-dashboard-five.vercel.app/)
