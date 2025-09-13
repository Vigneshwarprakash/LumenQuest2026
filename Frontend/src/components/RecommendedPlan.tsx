import { useState, useEffect, useRef } from 'react';
import { Plan } from '../types';

// Define the structure for a chat message
interface Message {
  role: 'user' | 'model';
  text: string;
}

// Define the props for our component
interface RecommendedPlanProps {
  plan: Plan;
}

export function RecommendedPlan({ plan }: RecommendedPlanProps) {
  // --- STATE MANAGEMENT FOR THE CHATBOT ---
  // Store the history of the conversation
  const [messages, setMessages] = useState<Message[]>([]);
  // Store the user's current input
  const [userInput, setUserInput] = useState('');
  // Track loading state while waiting for the API
  const [isLoading, setIsLoading] = useState(false);
  // Ref to auto-scroll to the latest message
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- INITIALIZE THE CHAT ---
  // Set the initial greeting from the AI when the component loads
  useEffect(() => {
    setMessages([
      {
        role: 'model',
        text: `Hello! Based on your needs, I recommend the "${plan.name}" plan. What would you like to know about it?`,
      },
    ]);
  }, [plan]);

  // --- AUTO-SCROLLING ---
  // Automatically scroll down when a new message is added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- HANDLE FORM SUBMISSION ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    // 1. Add user's message to the chat history
    const userMessage: Message = { role: 'user', text: userInput };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    setUserInput('');

    try {
      // 2. Create a contextual prompt for the Gemini API
      const prompt = `
        You are a friendly and helpful chatbot for a broadband company. 
        A user has been recommended the "${plan.name}" plan.
        Plan Details:
        - Price: $${plan.price}/month
        - Data Quota: ${plan.dataQuota}GB
        The user has the following question: "${userInput}"
        Please answer the user's question concisely based ONLY on the plan details provided.
      `;

      // 3. Call your secure backend endpoint
      const response = await fetch('http://localhost:8000/api/generateSummary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();

      // 4. Add the AI's response to the chat history
      const modelMessage: Message = { role: 'model', text: data.summary };
      setMessages((prevMessages) => [...prevMessages, modelMessage]);

    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = { role: 'model', text: "I'm sorry, I'm having trouble connecting right now." };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER THE CHATBOT UI ---
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-center text-blue-800 mb-4">
        Chat About Your Recommended Plan ✨
      </h2>
      
      {/* Chat Messages Window */}
      <div className="h-64 overflow-y-auto bg-slate-50 p-4 rounded-lg border flex flex-col space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-2 rounded-2xl bg-gray-200 text-gray-800">
              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-grow p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300"
          disabled={isLoading}
        >
          Send
        </button>
      </form>
    </div>
  );
}
