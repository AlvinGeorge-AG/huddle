import { useNavigate } from "react-router-dom";

export default function ActivityCard({ activity }) {
    const navigate = useNavigate();

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return "No time set";
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between h-full group hover:border-blue-500/30 transition-all">
            <div>
                <div className="flex justify-between items-start mb-3">
                    <span className="bg-blue-600/20 text-blue-300 text-xs font-bold px-2 py-1 rounded-md border border-blue-500/20">
                        OPEN
                    </span>
                    <span className="text-slate-500 text-xs">
                        Ends at {formatDate(activity.endTime)}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {activity.title}
                </h3>

                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {activity.description}
                </p>

                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span>{activity.location}</span>
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white">
                        {activity.creatorName?.charAt(0)}
                    </div>
                    <span className="text-xs text-slate-400">by {activity.creatorName}</span>
                </div>

                <button
                    onClick={() => alert("Chat feature coming next!")} // Placeholder for future logic
                    className="bg-slate-700 hover:bg-slate-600 text-white text-sm py-2 px-4 rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                    Join
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
            </div>
        </div>
    );
}