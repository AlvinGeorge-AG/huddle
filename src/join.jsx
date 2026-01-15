import { useNavigate } from "react-router-dom";

export default function JoinChat({ activity }) {
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!activity) return;

    const now = new Date();
    const endTime = new Date(activity.endTime);
    if (now > endTime) {
      alert("This activity chat is closed.");
      return;
    }

    navigate(`/chat/${activity.id}`);
  };

  return (
    <button
      onClick={handleJoin}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
    >
      Join
    </button>
  );
}
