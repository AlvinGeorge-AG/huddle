import { useNavigate } from "react-router-dom";

export default function ActivityCard({ activity, user, onJoinOrLeave }) {
  const navigate = useNavigate();

  const participants = activity.participants || {};
  const hasJoined = !!participants[user.uid];
  const participantCount = Object.keys(participants).length;
  const max = activity.maxParticipants || Infinity;
  const isFull = participantCount >= max;

  const formatTime = (value) => {
    if (!value) return "--";
    const d = value.toDate ? value.toDate() : new Date(value);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-4 hover:border-blue-500/30 transition">
      
      {/* TOP */}
      <div className="flex justify-between items-start">
        <span className={`text-xs px-2 py-1 rounded-md font-bold 
          ${isFull ? "bg-red-600/20 text-red-300" : "bg-blue-600/20 text-blue-300"}`}>
          {isFull ? "FULL" : "OPEN"}
        </span>

        <span className="text-slate-500 text-xs">
          Ends at {formatTime(activity.endTime)}
        </span>
      </div>

      {/* BODY */}
      <div>
        <h3 className="text-xl font-bold text-white">{activity.title}</h3>
        <p className="text-slate-400 text-sm mt-1 line-clamp-2">
          {activity.description}
        </p>
      </div>

      <div className="text-xs text-slate-400">
        👥 {participantCount} / {max} joined
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center border-t border-white/5 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500
                          flex items-center justify-center text-[10px] font-bold text-white">
            {activity.creatorName?.charAt(0)}
          </div>

          <span className="text-xs text-slate-400">
            {activity.creatorName}
          </span>

          <span className="text-[10px] px-2 py-0.5 rounded-full
                           bg-yellow-500/20 text-yellow-300 border border-yellow-400/20">
            Creator
          </span>
        </div>

        {/* ACTIONS */}
        {hasJoined ? (
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/chat/${activity.id}`)}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-2 rounded-lg"
            >
              Chat
            </button>

            <button
              onClick={() => onJoinOrLeave(activity.id, "leave")}
              className="bg-red-600 hover:bg-red-500 text-white text-sm px-3 py-2 rounded-lg"
            >
              Leave
            </button>
          </div>
        ) : (
          <button
            disabled={isFull}
            onClick={() => onJoinOrLeave(activity.id, "join")}
            className={`text-white text-sm px-4 py-2 rounded-lg
              ${isFull ? "bg-gray-600 cursor-not-allowed" : "bg-slate-700 hover:bg-slate-600"}`}
          >
            {isFull ? "Full" : "Join"}
          </button>
        )}
      </div>
    </div>
  );
}
