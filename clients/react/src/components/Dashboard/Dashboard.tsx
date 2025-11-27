import { useEffect, useState } from "react";
import getUserInfo from "../../services/getuserinfo";
import { logout } from "../../services/session";
import { useNavigate } from "react-router-dom";

type User = { fullName?: string };

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [greeting, setGreeting] = useState("Hi");
  const navigate = useNavigate(); // ✅ Correct navigation hook

  useEffect(() => {
    let mounted = true;

    getUserInfo()
      .then((u: User) => {
        if (mounted) setUser(u);
      })
      .catch(() => {
        console.error("Failed to fetch user info");
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <main style={{ padding: "2rem" }}>
      <h1>
        {greeting}, {user?.fullName ?? "User"} 👋
      </h1>

      <div style={{display: "flex", flexDirection: "row", gap: "12px"}}>
        <button onClick={() => logout()}>LogOut</button>

        <button onClick={() => navigate("/streaming")}>Streaming</button>
      </div>
    </main>
  );
}
