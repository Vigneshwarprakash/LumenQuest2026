import { useState, useEffect, useRef } from 'react';
import { Plan } from '../types';
import { PlanCard } from './PlanCard'; // <-- NEW: Import PlanCard to use for highlighting

// --- TYPE DEFINITIONS ---
interface Message {
  role: 'user' | 'model';
  text: string;
  recommendedPlan?: Plan; // <-- NEW: A message can now contain a plan object to highlight
}

interface RecommendedPlanProps {
  allPlans: Plan[];
}

// --- STATE MANAGEMENT FOR THE CONVERSATION FLOW ---
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
    nextStep: 'give_recommendation',
  },
};

export function RecommendedPlan({ allPlans }: RecommendedPlanProps) {
  // --- STATE HOOKS ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationStep, setConversationStep] = useState('start');
  const [userData, setUserData] = useState({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- EFFECTS ---
  useEffect(() => {
    setMessages([{ role: 'model', text: conversationFlow.start.question }]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- CORE LOGIC ---
  const handleOptionClick = async (optionText: string) => {
    if (isLoading) return;

    const userMessage: Message = { role: 'user', text: optionText };
    const updatedUserData = { ...userData, [conversationStep]: optionText };
    setUserData(updatedUserData);
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const currentStepConfig = conversationFlow[conversationStep];
    const nextStepKey = currentStepConfig.nextStep?.[optionText] || currentStepConfig.nextStep;

    if (nextStepKey && conversationFlow[nextStepKey]) {
      const nextQuestion = conversationFlow[nextStepKey].question;
      setMessages((prev) => [...prev, { role: 'model', text: nextQuestion }]);
      setConversationStep(nextStepKey);
      setIsLoading(false);
    } else if (nextStepKey === 'give_recommendation') {
      await getAiRecommendation(updatedUserData);
      setConversationStep('done');
    } else if (nextStepKey === 'show_renewal_info') {
      const renewalMessage = { role: 'model', text: "For renewal dates and account details, please log in to your customer portal. As a general update, your current plan is set to renew on October 1st, 2025." };
      setMessages(prev => [...prev, renewalMessage]);
      setConversationStep('done');
      setIsLoading(false);
    }
  };
  
  const getAiRecommendation = async (finalUserData) => {
    const plansString = allPlans.map(p => `Plan Name: "${p.name}", Price: $${p.price}, Data: ${p.dataQuota}GB`).join('; ');
    // --- NEW: Updated prompt to ask for a specific output format ---
    const prompt = `
      You are an expert AI broadband advisor. A user provided these details:
      - Usage: "${finalUserData.ask_usage}"
      - Age: "${finalUserData.ask_age}"
      - Devices: "${finalUserData.ask_devices}"

      Available plans: ${plansString}.
      Insight: The "Fibernet Pro" plan is the most purchased.

      Analyze all info and recommend the single best plan.
      IMPORTANT: Your response MUST start with the exact name of the recommended plan enclosed in double asterisks. Example: **Fibernet Pro**.
      Then, provide a friendly, personalized explanation for your choice, referencing the user's details.
    `;

    try {
      const response = await fetch('http://localhost:8000/api/generateSummary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      const aiResponseText = data.summary;

      // --- NEW: Logic to find the highlighted plan from the AI's response ---
      const recommendedPlanNameMatch = aiResponseText.match(/\*\*(.*?)\*\*/);
      const recommendedPlanName = recommendedPlanNameMatch ? recommendedPlanNameMatch[1] : null;
      const recommendedPlanObject = recommendedPlanName ? allPlans.find(p => p.name.toLowerCase() === recommendedPlanName.toLowerCase()) : null;

      const modelMessage: Message = { 
        role: 'model', 
        text: aiResponseText.replace(/\*\*(.*?)\*\*/, '').trim(), // Show text without the bolded name
        recommendedPlan: recommendedPlanObject, // Attach the plan object to the message
      };
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
      
      <div className="h-96 overflow-y-auto bg-slate-50 p-4 rounded-lg border flex flex-col space-y-2">
        {messages.map((msg, index) => (
          <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
              {msg.text}
            </div>
            
            {/* --- NEW: If the message has a recommended plan, render the highlighted card --- */}
            {msg.recommendedPlan && (
              <div className="mt-3 w-full max-w-sm animate-fade-in">
                <PlanCard 
                  plan={msg.recommendedPlan} 
                  isRecommended={true} 
                  showAiFeature={false} 
                />
              </div>
            )}
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
