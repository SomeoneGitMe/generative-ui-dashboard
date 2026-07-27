'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  toolCall?: any;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // We only send the role and content to the API, stripping out old toolCalls
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });
      
      const data = await res.json();
      
      if (data.toolCall) {
        setMessages([...newMessages, { role: 'assistant', content: "Here is the chart you requested:", toolCall: data.toolCall }]);
      } else if (data.text) {
        setMessages([...newMessages, { role: 'assistant', content: data.text }]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center p-4">
      <div className="w-full max-w-3xl flex flex-col h-[90vh] bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800 overflow-hidden">
        
        <div className="bg-zinc-950 p-6 border-b border-zinc-800">
          <h1 className="text-2xl font-bold text-indigo-400">Generative UI Dashboard</h1>
          <p className="text-sm text-zinc-500">Ask for sales data. The AI will generate a live chart.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-950">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-100'}`}>
                
                {/* Render Text */}
                {m.content && <p className="leading-relaxed text-sm">{m.content}</p>}
                
                {/* Render Generative UI Chart */}
                {m.toolCall && m.toolCall.name === 'generate_sales_chart' && (
                  <div className="mt-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800 w-[400px]">
                    <h3 className="text-indigo-400 font-bold mb-4 text-sm">{m.toolCall.args.title}</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={m.toolCall.args.data}>
                        <XAxis dataKey="name" stroke="#8884d8" fontSize={12} />
                        <YAxis stroke="#8884d8" fontSize={12} />
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} />
                        <Bar dataKey="value" fill="#818cf8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-zinc-900 border border-zinc-800 text-zinc-400 p-4 rounded-2xl animate-pulse text-sm">Thinking...</div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800 flex gap-3 bg-zinc-950">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask: 'Show me Q3 sales data'"
            className="flex-1 bg-zinc-900 text-white px-4 py-3 rounded-xl outline-none border border-zinc-800 focus:border-indigo-500 text-sm"
          />
          <button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-xl font-semibold text-white disabled:opacity-50 text-sm">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}