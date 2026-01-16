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
                alert("🚫 Access Restricted: @mec.ac.in email required") ;
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
        <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-background">
            {/* 
                UPDATED BACKGROUND ANIMATIONS:
                - Increased opacity to /50 and /40 so they glow brighter.
                - Kept the blur high for the 'light source' effect.
            */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/50 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/40 rounded-full blur-[120px] animate-pulse"></div>

            <div className="relative w-full max-w-md glass-panel rounded-3xl p-8 sm:p-10 animate-slide-up border border-border/50 shadow-2xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-bold text-primary mb-2 tracking-tight">
                        Huddle
                    </h1>
                    <p className="text-muted-foreground font-medium">MEC Student Community</p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-6 p-4 bg-destructive/10 border border-destructive/50 rounded-xl flex items-center gap-3 text-destructive text-sm">
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
                        className="w-full group bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-4 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3 shadow-xl disabled:opacity-70 disabled:cursor-wait"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                        ) : (
                            <div className="bg-white p-1 rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                                <img className="w-4 h-4" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" />
                            </div>
                        )}
                        <span className="text-lg">Sign in with Google</span>
                    </button>

                    <div className="text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Exclusive Access</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/80 border border-border text-xs text-foreground/90 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft"></span>
                            @mec.ac.in required
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 text-muted-foreground/60 text-sm">
                &copy; {new Date().getFullYear()} MEC Huddle
            </div>
        </div>
    );
}

export default Login;