function Loading() {
    return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
            {/* Background orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-soft"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-soft" style={{ animationDelay: "1s" }}></div>

            <div className="relative z-10 text-center">
                {/* Animated spinner */}
                <div className="mb-6 flex justify-center">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 border-4 border-transparent border-t-blue-400 border-r-blue-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-2 border-4 border-transparent border-b-indigo-400 rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}></div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2 animate-pulse">
                    Loading Huddle
                </h2>
                <p className="text-gray-400 text-sm">Setting things up for you...</p>

                {/* Dots animation */}
                <div className="mt-4 flex justify-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></span>
                </div>
            </div>
        </div>
    );
}

export default Loading;
