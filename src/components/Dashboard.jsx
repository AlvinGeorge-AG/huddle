import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function Dashboard(user) {
    return (
        <div style={{ padding: "40px" }}>
            <h1>Hi {user.name}</h1>
            <h1>Welcome to Huddle 👋</h1>
            <p>You are logged in.</p>

            <button onClick={() => signOut(auth)}>
                Logout
            </button>
            <p></p>
            <button onClick={() => { window.location.href = "/chat" }}>
                Chat
            </button>
        </div>
    );
}

export default Dashboard;
