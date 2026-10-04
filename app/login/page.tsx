'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .verify-wrapper {
    min-height: 100vh;
    background: #f4f4f0;
    font-family: 'DM Sans', sans-serif;
    color: #1a1a1a;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .verify-card {
    width: 100%;
    max-width: 400px;
    padding: 48px 40px;
    border: 1.5px solid #e0e0da;
    border-radius: 8px;
    background: #fff;
  }

  .verify-card h1 {
    font-size: 22px;
    font-weight: 600;
    letter-spacing: -0.3px;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .verify-card p.subtitle {
    font-size: 13px;
    color: #777;
    font-family: 'DM Mono', monospace;
    margin-bottom: 32px;
  }

  .input-wrapper {
    position: relative;
    margin-bottom: 16px;
  }

  .input-wrapper input {
    width: 100%;
    padding: 10px 40px 10px 14px;
    border: 1.5px solid #ccc;
    border-radius: 6px;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    background: #f4f4f0;
    color: #1a1a1a;
    outline: none;
    transition: border-color 0.15s;
  }

  .input-wrapper input:focus {
    border-color: #1a1a1a;
  }

  .toggle-visibility {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    color: #999;
    transition: color 0.15s;
  }

  .toggle-visibility:hover {
    color: #1a1a1a;
  }

  .verify-card button.submit-btn {
    width: 100%;
    padding: 11px 22px;
    background: #1a1a1a;
    color: #f4f4f0;
    border: 1.5px solid #1a1a1a;
    border-radius: 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.3px;
    transition: background 0.15s, color 0.15s;
  }

  .verify-card button.submit-btn:hover:not(:disabled) {
    background: #f4f4f0;
    color: #1a1a1a;
  }

  .verify-card button.submit-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .error-msg {
    margin-top: 14px;
    font-size: 12px;
    font-family: 'DM Mono', monospace;
    color: #c0392b;
  }
`

const EyeOpen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const EyeClosed = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

export default function AdminVerify() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/verifyadmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.status === "success") {
        router.push("/admin");
        router.refresh();
      } else {
        setError("You have entered the wrong password");
      }
    } catch (err) {
      setError("Couldn't reach the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="verify-wrapper">
        <form className="verify-card" onSubmit={handleSubmit}>
          <h1>Welcome Admin</h1>
          <p className="subtitle">Enter your password to continue</p>
          <div className="input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="toggle-visibility"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeClosed /> : <EyeOpen />}
            </button>
          </div>
          <button className="submit-btn" type="submit" disabled={!password || loading}>
            {loading ? "Checking..." : "Submit"}
          </button>
          {error && <p className="error-msg">{error}</p>}
        </form>
      </div>
    </>
  );
}