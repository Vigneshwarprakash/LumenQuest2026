import { gql, useQuery } from '@apollo/client';
import { PlanCard } from './PlanCard';
import { RecommendedPlan } from './RecommendedPlan';
import { Spinner } from './Spinner';
import { Plan } from '../types'; // <-- UPDATED: Import the shared Plan type

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

// --- UPDATED: Define the expected shape of the API data ---
interface PlanData {
  getAllPlans: Plan[];
}

const recommendedPlanId = 'uuid-for-fibernet-pro'; 

export function PlanListPage() {
  // Add the PlanData type to useQuery for better type safety
  const { loading, error, data } = useQuery<PlanData>(GET_ALL_PLANS);

  if (loading) return <Spinner />;
  if (error) return <p className="text-center text-red-500">Error: {error.message}</p>;

  // Check if data and getAllPlans exist before trying to access them
  const plans = data?.getAllPlans || [];
  const recommendedPlan = plans.find(plan => plan.id === recommendedPlanId);
  const otherPlans = plans.filter(plan => plan.id !== recommendedPlanId);

  return (
    <div>
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">
        Choose Your Plan
      </h1>
      <p className="text-center text-gray-500 mb-10">
        Find the perfect broadband plan tailored to your needs.
      </p>

      {recommendedPlan && <RecommendedPlan plan={recommendedPlan} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {otherPlans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} showAiFeature={true} />
        ))}
      </div>
    </div>
  );
}
