import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function CreateActivityModal({ isOpen, onClose, user }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        endTime: ""
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await addDoc(collection(db, "activities"), {
                ...formData,
                createdBy: user.uid,
                creatorName: user.displayName || "Student",
                createdAt: serverTimestamp(),
                participants: [user.uid] // Creator automatically joins
            });
            onClose(); // Close modal on success
            setFormData({ title: "", description: "", location: "", endTime: "" }); // Reset
        } catch (error) {
            console.error("Error creating activity:", error);
            alert("Failed to create activity");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-lg glass-panel rounded-2xl p-6 sm:p-8 animate-slideUp">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-bold text-white mb-6">🚀 Create New Activity</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Title</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Hackathon Brainstorming"
                            className="input-modern"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Location</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Library / Room 304"
                                className="input-modern"
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">End Time</label>
                            <input
                                required
                                type="datetime-local"
                                className="input-modern text-slate-400" 
                                // Note: text-slate-400 fixes dark mode calendar icon visibility in some browsers
                                value={formData.endTime}
                                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Description</label>
                        <textarea
                            required
                            rows="3"
                            placeholder="What's the plan?"
                            className="input-modern resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary mt-4 flex justify-center items-center gap-2"
                    >
                        {loading ? "Posting..." : "Launch Activity"}
                    </button>
                </form>
            </div>
        </div>
    );
}