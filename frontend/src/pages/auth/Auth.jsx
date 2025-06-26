import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async e => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.access_token);
        navigate("/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const handleRegister = async e => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActiveTab("login");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="h-full">
      <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-extrabold">Welcome</h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab("login")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex-1 text-center ${
                  activeTab === "login"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab("register")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex-1 text-center ${
                  activeTab === "register"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Create account
              </button>
            </div>

            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

            {activeTab === "login" ? (
              <form className="space-y-6" onSubmit={handleLogin}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium">Email</label>
                  <input type="email" name="email" required onChange={handleChange}
                    className="mt-1 w-full border rounded px-3 py-2 shadow-sm" />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium">Password</label>
                  <input type="password" name="password" required onChange={handleChange}
                    className="mt-1 w-full border rounded px-3 py-2 shadow-sm" />
                </div>
                <button type="submit" className="w-full bg-black text-white py-2 rounded shadow hover:bg-gray-800">
                  Sign In
                </button>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handleRegister}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium">Name</label>
                  <input type="text" name="name" required onChange={handleChange}
                    className="mt-1 w-full border rounded px-3 py-2 shadow-sm" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium">Email</label>
                  <input type="email" name="email" required onChange={handleChange}
                    className="mt-1 w-full border rounded px-3 py-2 shadow-sm" />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium">Password</label>
                  <input type="password" name="password" required onChange={handleChange}
                    className="mt-1 w-full border rounded px-3 py-2 shadow-sm" />
                </div>
                <div>
                  <label htmlFor="confirm" className="block text-sm font-medium">Confirm Password</label>
                  <input type="password" name="confirm" required onChange={handleChange}
                    className="mt-1 w-full border rounded px-3 py-2 shadow-sm" />
                </div>
                <button type="submit" className="w-full bg-black text-white py-2 rounded shadow hover:bg-gray-800">
                  Register
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
