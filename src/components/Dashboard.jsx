import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function Dashboard({ user }) {
    const navigate = useNavigate();
    const displayName = user?.displayName?.split(" ")[0] || 'Student';

    return (
        <div className="min-h-screen bg-[#0f172a] p-4 sm:p-8 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{displayName}</span>
                        </h1>
                        <p className="text-slate-400 text-lg">Welcome to your student hub.</p>
                    </div>

                    <button
                        onClick={() => signOut(auth)}
                        className="px-5 py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition text-sm font-medium"
                    >
                        Sign Out
                    </button>
                </div>

                {/* Main Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Hero Card */}
                    <div className="lg:col-span-2 glass-panel rounded-3xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-600/20 to-violet-600/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>

                        <div className="relative z-10">
                            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-4 border border-blue-500/20">
                                LIVE NOW
                            </span>
                            <h2 className="text-3xl font-bold text-white mb-4">The Student Chat Room</h2>
                            <p className="text-slate-300 text-lg mb-8 max-w-xl leading-relaxed">
                                Connect with peers, share resources, and hang out in the exclusive MEC real-time lounge.
                            </p>
                            <button
                                onClick={() => navigate("/chat")}
                                className="btn-primary flex items-center gap-3"
                            >
                                <span>Enter Chat Room</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="glass-panel rounded-3xl p-8 flex flex-col justify-center">
                        <h3 className="text-slate-400 font-medium mb-6 uppercase tracking-wider text-xs">Your Status</h3>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                                </div>
                                <div>
                                    <div className="text-white font-bold text-lg">Online</div>
                                    <div className="text-slate-500 text-sm">System Operational</div>
                                </div>
                            </div>

                            <div className="h-px bg-slate-700/50"></div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <div className="text-white font-bold text-lg">Verified</div>
                                    <div className="text-slate-500 text-sm">MEC Account</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: "💬", title: "Real-time", desc: "Instant messaging with zero latency" },
                        { icon: "🎨", title: "Expressive", desc: "Share GIFs, Emojis and reactions" },
                        { icon: "🔒", title: "Secure", desc: "Encrypted & private campus network" }
                    ].map((item, idx) => (
                        <div key={idx} className="glass-card rounded-2xl p-6 hover:-translate-y-1 transition-transform">
                            <div className="text-4xl mb-4 bg-slate-800/50 w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner">
                                {item.icon}
                            </div>
                            <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                            <p className="text-slate-400">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;