import { PlanCard } from "./PlanCard";


interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  dataQuota: number;
}

export function RecommendedPlan({ plan }: { plan: Plan }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-center text-blue-800 mb-4">
        Our Top Pick For You ✨
      </h2>
      <div className="max-w-md mx-auto">
         <PlanCard plan={plan} isRecommended={true} />
      </div>
    </div>
  );
}
