import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    updateDoc,
    doc,
    deleteDoc,
    deleteField
} from "firebase/firestore";
import { auth, db } from "../firebase";
import CreateActivityModal from "./CreateActivityModal";
import ActivityCard from "./ActivityCard";
import { useNavigate, useParams } from "react-router-dom";


function Dashboard({ user }) {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const displayName = user?.displayName?.split(" ")[0] || "Student";

    const onJoinOrLeave = async (activityId, action) => {
        const ref = doc(db, "activities", activityId);
        const userId = user.uid;

        if (action === "join") {
            await updateDoc(ref, { [`participants.${userId}`]: true });
        } else if (action === "leave") {
            await updateDoc(ref, { [`participants.${userId}`]: deleteField() });
        }
    };

    const handleLogout = async () => {
        try {
            console.log("hi");
            await signOut(auth); // Wait for Firebase to finish logging out
            navigate("/");       // THEN navigate to the home page
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    useEffect(() => {
        const q = query(collection(db, "activities"), orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const now = new Date();
            const valid = [];

            for (const docSnap of snapshot.docs) {
                const data = docSnap.data();
                let endTime =
                    data.endTime?.toDate ? data.endTime.toDate() : new Date(data.endTime);

                if (endTime < now) {
                    await deleteDoc(doc(db, "activities", docSnap.id));
                    continue;
                }
                valid.push({ id: docSnap.id, ...data });
            }

            setActivities(valid);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="min-h-screen bg-background p-4 sm:p-8 relative overflow-hidden text-foreground">

            {/* Soft background glow effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] 
                    bg-primary/10 rounded-full blur-[160px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] 
                    bg-muted/20 rounded-full blur-[160px]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">
                            Welcome,{" "}
                            <span className="bg-clip-text text-transparent 
                                bg-gradient-to-r from-primary to-accent">
                                {displayName}
                            </span>
                        </h1>
                        <p className="text-muted-foreground">
                            See what’s happening on campus right now.
                        </p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex-1 md:flex-none bg-primary text-primary-foreground
                                hover:bg-primary/90 px-6 py-3 rounded-xl font-medium transition"
                        >
                            + Create Activity
                        </button>

                        <button
                            onClick={() => { handleLogout() }}
                            className="px-5 py-3 rounded-xl border border-red-500/30 
                                text-red-400 hover:bg-red-500/10 transition font-medium"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Live Activities */}
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-3 h-3 bg-primary rounded-full animate-pulse"></span>
                    Live on Campus
                </h2>

                {loading ? (
                    <div className="text-center text-muted-foreground py-20">
                        Loading feeds...
                    </div>
                ) : activities.length === 0 ? (
                    <div className="text-center py-20 bg-card rounded-2xl border border-border">
                        <div className="text-5xl mb-4">No activities</div>
                        <h3 className="text-xl font-bold">It's quiet... too quiet.</h3>
                        <p className="text-muted-foreground">Be the first to start an activity!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activities.map((activity) => (
                            <ActivityCard
                                key={activity.id}
                                activity={activity}
                                user={user}
                                onJoinOrLeave={onJoinOrLeave}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            <CreateActivityModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={user}
            />
        </div>
    );
}

export default Dashboard;
