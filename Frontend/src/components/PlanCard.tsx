import { useState } from 'react';
import { Plan } from '../types'; // <-- UPDATED: Import the shared Plan type

interface PlanCardProps {
  plan: Plan;
  isRecommended?: boolean;
  showAiFeature?: boolean;
}

export function PlanCard({ plan, isRecommended = false, showAiFeature = false }: PlanCardProps) {
  const [aiSummary, setAiSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    setAiSummary('');

    try {
      const prompt = `You are a helpful sales assistant. Briefly explain in a friendly tone why the '${plan.name}' broadband plan, which costs $${plan.price}/month with ${plan.dataQuota}GB of data, would be a great choice for a potential customer. Keep it to 2 sentences.`;

      const response = await fetch('http://localhost:8000/api/generateSummary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setAiSummary(data.summary);

    } catch (error) {
      console.error("Error fetching summary from backend:", error);
      setAiSummary('Sorry, we couldn\'t generate a summary right now.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`
      border rounded-xl p-6 flex flex-col transition-all duration-300
      ${isRecommended 
        ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500' 
        : 'bg-white border-gray-200 hover:shadow-xl hover:-translate-y-1'}
    `}>
      {isRecommended && (
        <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full -mt-9 self-center">
          RECOMMENDED
        </div>
      )}
      
      <h3 className="text-2xl font-semibold text-gray-900 mt-4">{plan.name}</h3>
      <p className="text-gray-500 mt-2 h-12">{plan.description}</p>

      <div className="my-6">
        <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
        <span className="text-gray-500">/month</span>
      </div>

      <ul className="space-y-3 text-gray-600 mb-6">
        <li className="flex items-center">
          <span className="text-blue-500 mr-2">✔</span>
          {plan.dataQuota} GB Monthly Data
        </li>
      </ul>
      
      {showAiFeature && (
        <div className="border-t border-gray-200 pt-4 mt-4 text-center">
          {aiSummary && <p className="text-sm text-gray-700 p-3 bg-slate-100 rounded-md">{aiSummary}</p>}
          {isGenerating && <p className="text-sm text-blue-600">Generating summary...</p>}
          {!aiSummary && !isGenerating && (
            <button 
              onClick={handleGenerateSummary}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              Personalize with AI ✨
            </button>
          )}
        </div>
      )}

      <button className={`
        w-full mt-6 font-semibold py-3 rounded-lg
        ${isRecommended 
          ? 'bg-blue-600 text-white hover:bg-blue-700' 
          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}
      `}>
        Select Plan
      </button>
    </div>
  );
}
