import { useState } from 'react';

export function LoginPage() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {

        const response = await fetch('http://localhost:8080/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.text();

        alert(data);

        if (data === "Login successful") {

            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("email", email);

            window.location.href = "/";
        }
    };

    return (
        <div className="p-10 flex flex-col gap-4 max-w-md mx-auto">

            <h1 className="text-3xl font-bold">
                Login
            </h1>

            <input
                className="border p-2 rounded"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                className="border p-2 rounded"
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
            />

            <button
                className="bg-black text-white p-2 rounded"
                onClick={handleLogin}
            >
                Login
            </button>

        </div>
    );
}