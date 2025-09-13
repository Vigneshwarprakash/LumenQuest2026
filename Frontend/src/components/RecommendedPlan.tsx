import { useState, useEffect, useRef } from 'react';
import { Plan } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface RecommendedPlanProps {
  allPlans: Plan[]; // <-- UPDATED: Receives all plans
}

// Define the conversation steps and button options
const conversationSteps = {
  initial: {
    question: "To personalize your recommendation, how do you primarily use your internet?",
    options: ["Streaming & Gaming", "Work from Home", "General Browsing"],
  },
};

export function RecommendedPlan({ allPlans }: RecommendedPlanProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Track if the recommendation has been given to hide the buttons
  const [recommendationGiven, setRecommendationGiven] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize the chat with the first question
  useEffect(() => {
    setMessages([
      { role: 'model', text: conversationSteps.initial.question },
    ]);
  }, []);

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle the user clicking an option button
  const handleOptionClick = async (optionText: string) => {
    if (isLoading) return;

    // 1. Add user's choice to the chat
    const userMessage: Message = { role: 'user', text: optionText };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setRecommendationGiven(true); // Hide buttons after a choice is made

    try {
      // 2. Create a detailed prompt for the Gemini API
      // We serialize the plan data so the AI can analyze it
      const plansString = allPlans.map(p => 
        `Plan Name: "${p.name}", Price: $${p.price}, Data: ${p.dataQuota}GB, Description: "${p.description}"`
      ).join('; ');

      const prompt = `
        You are an expert broadband plan recommender.
        A user has indicated their primary internet usage is: "${optionText}".
        
        Here is a list of available plans: ${plansString}.

        Based on the user's usage, analyze the plans and recommend the single best one.
        Respond in a friendly, personalized, and conversational tone. Start by acknowledging their choice. 
        Explain *why* the recommended plan is a good fit for their usage (e.g., "For streaming and gaming, you need high data and reliability, which is why the Fibernet Pro is perfect...").
        Keep the entire response to 2-3 sentences.
      `;

      // 3. Call your secure backend endpoint
      const response = await fetch('http://localhost:8000/api/generateSummary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();

      // 4. Add the AI's personalized recommendation to the chat
      const modelMessage: Message = { role: 'model', text: data.summary };
      setMessages((prev) => [...prev, modelMessage]);

    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = { role: 'model', text: "I'm sorry, I'm having trouble connecting right now." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8">
      <h2 className="text-2xl font-bold text-center text-blue-800 mb-4">
        Find Your Perfect Plan ✨
      </h2>
      
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

      {/* --- UPDATED: Conditionally render option buttons --- */}
      {!isLoading && !recommendationGiven && (
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {conversationSteps.initial.options.map((option) => (
            <button
              key={option}
              onClick={() => handleOptionClick(option)}
              className="bg-blue-50 text-blue-700 font-semibold px-4 py-2 rounded-lg hover:bg-blue-100"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
