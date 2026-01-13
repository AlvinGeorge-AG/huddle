import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const loginWithGoogle = async () => {
        setLoading(true);
        setError("");
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // 🚫 Restriction Logic
            if (!user.email.endsWith("@mec.ac.in")) {
                setError("🚫 Access Restricted: @mec.ac.in email required");
                await auth.signOut();
                setLoading(false);
                return;
            }

            // ✅ Save User
            await setDoc(doc(db, "users", user.uid), {
                name: user.displayName,
                email: user.email,
                photo: user.photoURL,
                lastLogin: serverTimestamp(),
            }, { merge: true });

            navigate("/", { replace: true });
        } catch (err) {
            console.error(err);
            setError("Login failed. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-blue-600/30 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-violet-600/30 rounded-full blur-[100px] animate-pulse"></div>

            <div className="relative w-full max-w-md glass-panel rounded-3xl p-8 sm:p-10 animate-slideUp">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400 mb-2 tracking-tight">
                        Huddle
                    </h1>
                    <p className="text-slate-400 font-medium">MEC Student Community</p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-200 text-sm">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                )}

                {/* Login Button */}
                <div className="space-y-6">
                    <button
                        onClick={loginWithGoogle}
                        disabled={loading}
                        className="w-full group bg-white hover:bg-slate-50 text-slate-900 font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg disabled:opacity-70 disabled:cursor-wait"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
                        ) : (
                            <img className="w-6 h-6" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" />
                        )}
                        <span className="text-lg">Sign in with Google</span>
                    </button>

                    <div className="text-center">
                        <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Exclusive Access</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-700 text-xs text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            @mec.ac.in required
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 text-slate-500 text-sm">
                &copy; {new Date().getFullYear()} MEC Huddle
            </div>
        </div>
    );
}

export default Login;