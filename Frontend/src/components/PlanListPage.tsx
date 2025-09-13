import { gql, useQuery } from '@apollo/client';
import { PlanCard } from './PlanCard';
import { RecommendedPlan } from './RecommendedPlan';
import { Spinner } from './Spinner';


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

// A mock recommended plan ID from the AI engine
const recommendedPlanId = 'uuid-for-fibernet-pro'; 

export function PlanListPage() {
  const { loading, error, data } = useQuery(GET_ALL_PLANS);

  if (loading) return <Spinner />;
  if (error) return <p className="text-center text-red-500">Error: {error.message}</p>;

  // Filter out the recommended plan to display it separately
  const recommendedPlan = data.getAllPlans.find(plan => plan.id === recommendedPlanId);
  const otherPlans = data.getAllPlans.filter(plan => plan.id !== recommendedPlanId);

  return (
    <div>
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">
        Choose Your Plan
      </h1>
      <p className="text-center text-gray-500 mb-10">
        Find the perfect broadband plan tailored to your needs.
      </p>

      {/* AI Recommendation Section */}
      {recommendedPlan && <RecommendedPlan plan={recommendedPlan} />}

      {/* Grid for other available plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {otherPlans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
}
