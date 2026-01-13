import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
    const navigate = useNavigate();

    const loginWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            const user = result.user;
            const email = user.email;

            // 🚫 College restriction
            if (!email.endsWith("@mec.ac.in")) {
                alert("Only MEC students allowed 🚫");
                await auth.signOut();
                return;
            }

            // ✅ Save user to Firestore
            await setDoc(
                doc(db, "users", user.uid),
                {
                    name: user.displayName,
                    email: user.email,
                    role: "user",
                    createdAt: serverTimestamp(),
                },
                { merge: true }
            );

            // ✅ Redirect after login
            navigate("/", { replace: true });

        } catch (err) {
            console.error(err);
            alert("Login failed. Try again.");
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h1>Huddle</h1>
                <p>MEC students only. One login. No chaos.</p>

                <button onClick={loginWithGoogle} className="google-btn">
                    <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="Google"
                    />
                    Sign in with Google
                </button>

                <span className="note">@mec.ac.in email required</span>
            </div>
        </div>
    );
}

export default Login;
