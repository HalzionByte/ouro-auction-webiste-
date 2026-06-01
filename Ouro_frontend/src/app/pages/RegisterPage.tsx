import { useState } from 'react';

export function RegisterPage() {
    // [ADDED BY ANTIGRAVITY] Local state variables including the custom name and role selection inputs
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('USER'); // default to USER (Buyer/Bidder)

    const handleRegister = async () => {
        if (!name || !email || !password) {
            alert("All fields are required");
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role
                })
            });

            if (!response.ok) {
                throw new Error("Registration failed");
            }

            const data = await response.json();
            console.log(data);
            alert("Registered Successfully! You can now log in.");
            window.location.href = "/login";
        } catch (error) {
            console.error(error);
            alert("Failed to register. Please try again.");
        }
    };

    return (
        <div className="p-10 flex flex-col gap-4 max-w-md mx-auto bg-card shadow-lg rounded-xl my-10 border border-border">
            <h1 className="text-3xl font-bold text-foreground">
                Register
            </h1>
            <p className="text-sm text-muted-foreground">
                Create an account to start bidding or listing items.
            </p>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <input
                    className="border border-border p-2.5 rounded bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="John Doe"
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-foreground">Email</label>
                <input
                    className="border border-border p-2.5 rounded bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="john@example.com"
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-foreground">Password</label>
                <input
                    className="border border-border p-2.5 rounded bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                    type="password"
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-foreground">Role</label>
                <select
                    className="border border-border p-2.5 rounded bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                >
                    <option value="USER">Buyer / Bidder</option>
                    <option value="SELLER">Seller</option>
                </select>
            </div>

            <button
                className="bg-primary text-primary-foreground p-3 rounded-lg font-medium hover:bg-primary/95 transition-all shadow-md mt-2 cursor-pointer"
                onClick={handleRegister}
            >
                Create Account
            </button>
            
            <p className="text-center text-xs text-muted-foreground mt-2">
                Already have an account? <a href="/login" className="text-primary hover:underline">Log in</a>
            </p>
        </div>
    );
}