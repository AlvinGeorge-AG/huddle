import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";
import CreateActivityModal from "./CreateActivityModal";
import ActivityCard from "./ActivityCard";

function Dashboard({ user }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const displayName = user?.displayName?.split(" ")[0] || 'Student';

    // 📡 Real-time Listener for Activities
    useEffect(() => {
        const q = query(
            collection(db, "activities"),
            orderBy("createdAt", "desc") // Newest first
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const activitiesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setActivities(activitiesData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="min-h-screen bg-[#0f172a] p-4 sm:p-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* 1. Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{displayName}</span>
                        </h1>
                        <p className="text-slate-400">See what's happening on campus right now.</p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex-1 md:flex-none btn-primary flex justify-center items-center gap-2"
                        >
                            <span>+ Create Activity</span>
                        </button>
                        <button
                            onClick={() => signOut(auth)}
                            className="px-5 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition font-medium"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* 2. Activities Grid */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                        Live on Campus
                    </h2>

                    {loading ? (
                        <div className="text-center text-slate-500 py-20">Loading feeds...</div>
                    ) : activities.length === 0 ? (
                        <div className="text-center py-20 glass-panel rounded-2xl">
                            <div className="text-6xl mb-4">😴</div>
                            <h3 className="text-xl text-white font-bold">It's quiet... too quiet.</h3>
                            <p className="text-slate-400">Be the first to start an activity!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activities.map(activity => (
                                <ActivityCard key={activity.id} activity={activity} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Modal Injection */}
            <CreateActivityModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={user}
            />
        </div>
    );
}

export default Dashboard;