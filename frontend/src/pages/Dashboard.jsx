import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div className="dashboard-page">
            <h1>Welcome to SplitSmart</h1>

            {user && (
                <p>
                    Welcome, <strong>{user.name}</strong>
                </p>
            )}

            <p>Your group expenses and settlements will appear here.</p>
        </div>
    );
};

export default Dashboard;