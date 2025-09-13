import { gql, useQuery } from '@apollo/client';
import { PlanCard } from './PlanCard';
import { RecommendedPlan } from './RecommendedPlan';
import { Spinner } from './Spinner';
import { Plan } from '../types';

const GET_ALL_PLANS = gql`
  query GetAllPlans {
    getAllPlans {
      id
      name
      description
      price
      dataQuota
    }
  }
`;

interface PlanData {
  getAllPlans: Plan[];
}

export function PlanListPage() {
  const { loading, error, data } = useQuery<PlanData>(GET_ALL_PLANS);

  if (loading) return <Spinner />;
  if (error) return <p className="text-center text-red-500">Error: {error.message}</p>;

  const plans = data?.getAllPlans || [];
  
  // We no longer need to find a specific recommended plan here
  const otherPlans = plans;

  return (
    <div>
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">
        Choose Your Plan
      </h1>
      <p className="text-center text-gray-500 mb-10">
        Or let us help you find the perfect fit!
      </p>

      {/* --- UPDATED: Pass the entire 'plans' array to the chatbot --- */}
      {plans.length > 0 && <RecommendedPlan allPlans={plans} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {otherPlans.map((plan) => (
          // The AI feature is now in the chatbot, so we can set this to false
          <PlanCard key={plan.id} plan={plan} showAiFeature={false} />
        ))}
      </div>
    </div>
  );
}
