
interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  dataQuota: number;
}

interface PlanCardProps {
  plan: Plan;
  isRecommended?: boolean;
}

export function PlanCard({ plan, isRecommended = false }: PlanCardProps) {
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

      <ul className="space-y-3 text-gray-600 mb-8">
        <li className="flex items-center">
          <span className="text-blue-500 mr-2">✔</span>
          {plan.dataQuota} GB Monthly Data
        </li>
        {/* Add more features here */}
      </ul>
      
      <button className={`
        w-full mt-auto font-semibold py-3 rounded-lg
        ${isRecommended 
          ? 'bg-blue-600 text-white hover:bg-blue-700' 
          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}
      `}>
        Select Plan
      </button>
    </div>
  );
}
