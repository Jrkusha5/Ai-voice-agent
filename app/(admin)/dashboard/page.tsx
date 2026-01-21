import { getCurrentUser } from "@/lib/actions/auth.action";

const AdminDashboard = async () => {
  const user = await getCurrentUser();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card-border p-6">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-primary-200">--</p>
          <p className="text-sm text-gray-400 mt-2">Coming soon</p>
        </div>
        
        <div className="card-border p-6">
          <h3 className="text-lg font-semibold mb-2">Total Interviews</h3>
          <p className="text-3xl font-bold text-primary-200">--</p>
          <p className="text-sm text-gray-400 mt-2">Coming soon</p>
        </div>
        
        <div className="card-border p-6">
          <h3 className="text-lg font-semibold mb-2">Average Score</h3>
          <p className="text-3xl font-bold text-primary-200">--</p>
          <p className="text-sm text-gray-400 mt-2">Coming soon</p>
        </div>
      </div>

      <div className="card-border p-6">
        <h2 className="text-2xl font-semibold mb-4">Welcome, {user?.name}!</h2>
        <p className="text-gray-400">
          You are logged in as an <span className="font-bold text-primary-200">ADMIN</span>.
          Use the navigation above to manage users and interviews.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;

