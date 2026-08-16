import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/auth.service";

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!formData.name.trim()) {
            setError("Please enter your name");
            return;
        }

        if (!formData.email.trim()) {
            setError("Please enter your email");
            return;
        }

        if (!formData.password) {
            setError("Please enter a password");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        try {
            setLoading(true);

            await registerUser({
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password
            });

            navigate("/login");
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to create account"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-white">
            <div className="flex min-h-screen">

                {/* Left */}
                <div className="hidden w-1/2 flex-col justify-center bg-slate-900 px-16 text-white lg:flex dark:bg-slate-950">
                    <div className="max-w-md">
                        <p className="text-sm font-medium uppercase tracking-wider text-slate-400">
                            SplitSmart
                        </p>

                        <h1 className="mt-4 text-4xl font-semibold leading-tight">
                            Start splitting expenses together.
                        </h1>

                        <p className="mt-5 text-base leading-7 text-slate-400">
                            Create your account and start organizing
                            group expenses without keeping track of
                            everything manually.
                        </p>
                    </div>
                </div>

                {/* Right */}
                <div className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2">
                    <div className="w-full max-w-md">

                        <div className="mb-8">
                            <Link
                                to="/"
                                className="text-2xl font-semibold tracking-tight"
                            >
                                SplitSmart
                            </Link>

                            <h2 className="mt-8 text-2xl font-semibold">
                                Create your account
                            </h2>

                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Set up your account to start using SplitSmart.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/30">
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    {error}
                                </p>
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Full name
                                </label>

                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Test Rout"
                                    autoComplete="name"
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-slate-500 dark:focus:ring-slate-800"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Email
                                </label>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-slate-500 dark:focus:ring-slate-800"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Password
                                </label>

                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="At least 6 characters"
                                    autoComplete="new-password"
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-slate-500 dark:focus:ring-slate-800"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                            >
                                {loading
                                    ? "Creating account..."
                                    : "Create account"}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="font-medium text-slate-900 hover:underline dark:text-white"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;