import { useState, useEffect, useRef } from 'react';
import { Plan } from '../types';

// --- TYPE DEFINITIONS ---
interface Message {
  role: 'user' | 'model';
  text: string;
}

interface RecommendedPlanProps {
  allPlans: Plan[];
}

// --- STATE MANAGEMENT FOR THE CONVERSATION FLOW ---
// This object defines the entire conversation structure, making it easy to add more steps
const conversationFlow = {
  start: {
    question: "Hello! I'm here to help. Are you a new or an existing customer?",
    options: ["I'm a new customer", "I'm an existing customer"],
    nextStep: {
      "I'm a new customer": 'ask_usage',
      "I'm an existing customer": 'show_renewal_info',
    },
  },
  ask_usage: {
    question: "Great! To find your perfect plan, how do you primarily use your internet?",
    options: ["Streaming & Gaming", "Work from Home", "General Browsing"],
    nextStep: 'ask_age',
  },
  ask_age: {
    question: "Thanks. Which age group do you fall into?",
    options: ["Under 25", "25-40", "41-60", "Over 60"],
    nextStep: 'ask_devices',
  },
  ask_devices: {
    question: "And roughly how many devices will be connected to the internet at the same time?",
    options: ["1-2 devices", "3-5 devices", "More than 5 devices"],
    nextStep: 'give_recommendation', // Final step before AI analysis
  },
};

export function RecommendedPlan({ allPlans }: RecommendedPlanProps) {
  // --- STATE HOOKS ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationStep, setConversationStep] = useState('start');
  const [userData, setUserData] = useState({}); // Stores user's answers
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- EFFECTS ---
  // Initialize the chat
  useEffect(() => {
    setMessages([{ role: 'model', text: conversationFlow.start.question }]);
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- CORE LOGIC ---
  const handleOptionClick = async (optionText: string) => {
    if (isLoading) return;

    // 1. Update messages and user data
    const userMessage: Message = { role: 'user', text: optionText };
    const updatedUserData = { ...userData, [conversationStep]: optionText };
    setUserData(updatedUserData);
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // 2. Determine the next step in the conversation
    const currentStepConfig = conversationFlow[conversationStep];
    const nextStepKey = currentStepConfig.nextStep?.[optionText] || currentStepConfig.nextStep;

    if (nextStepKey && conversationFlow[nextStepKey]) {
      // 3a. If there's another question, ask it
      const nextQuestion = conversationFlow[nextStepKey].question;
      setMessages((prev) => [...prev, { role: 'model', text: nextQuestion }]);
      setConversationStep(nextStepKey);
      setIsLoading(false);
    } else if (nextStepKey === 'give_recommendation') {
      // 3b. If it's time for a recommendation, call the AI
      await getAiRecommendation(updatedUserData);
      setConversationStep('done');
    } else if (nextStepKey === 'show_renewal_info') {
        // 3c. If user is an existing customer, show renewal info
        const renewalMessage = { role: 'model', text: "For renewal dates and account details, please log in to your customer portal. As a general update, your current plan is set to renew on October 1st, 2025." };
        setMessages(prev => [...prev, renewalMessage]);
        setConversationStep('done');
        setIsLoading(false);
    }
  };
  
  const getAiRecommendation = async (finalUserData) => {
    // 4. Create a highly detailed prompt with all collected data
    const plansString = allPlans.map(p => `Plan Name: "${p.name}", Price: $${p.price}, Data: ${p.dataQuota}GB`).join('; ');
    const prompt = `
      You are an expert AI broadband advisor providing a powerful, personalized recommendation.
      A user has provided the following details:
      - Primary Use: "${finalUserData.ask_usage}"
      - Age Group: "${finalUserData.ask_age}"
      - Connected Devices: "${finalUserData.ask_devices}"

      Here is a list of available plans: ${plansString}.
      Insight: The "Fibernet Pro" plan is the most purchased plan across all age groups.

      Analyze all this information, including the insight about the most popular plan. Recommend the single best plan for this specific user.
      Your response must be friendly and personalized. Explain *why* it's the right choice by directly referencing the user's details (e.g., "Since you have over 5 devices and work from home, you need a plan with high data and zero slowdowns...").
    `;

    // 5. Call the secure backend
    try {
      const response = await fetch('http://localhost:8000/api/generateSummary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      const modelMessage: Message = { role: 'model', text: data.summary };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = { role: 'model', text: "I'm sorry, I encountered an error while generating your recommendation." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  // --- RENDER ---
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8">
      <h2 className="text-2xl font-bold text-center text-blue-800 mb-4">
        Your Personal Plan Advisor 🤖
      </h2>
      
      <div className="h-80 overflow-y-auto bg-slate-50 p-4 rounded-lg border flex flex-col space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-2 rounded-2xl bg-gray-200 text-gray-800"><span className="animate-pulse">...</span></div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {!isLoading && conversationFlow[conversationStep]?.options.map((option) => (
          <button
            key={option}
            onClick={() => handleOptionClick(option)}
            className="bg-blue-50 text-blue-700 font-semibold px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
