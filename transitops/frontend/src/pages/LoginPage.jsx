import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Truck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError("Please fill all fields.");
            return;
        }

        setLoading(true);

        const result = await login(
            formData.email,
            formData.password
        );

        setLoading(false);

        if (result.success) {
            navigate("/dashboard");
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-100">

            {/* Left Side */}

            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-purple-700 to-indigo-700 text-white justify-center items-center">

                <div className="text-center px-10">

                    <Truck size={80} className="mx-auto mb-6"/>

                    <h1 className="text-5xl font-bold mb-6">
                        TransitOps
                    </h1>

                    <p className="text-lg opacity-90">
                        Smart Transport Operations Platform
                    </p>

                </div>

            </div>

            {/* Right Side */}

            <div className="flex flex-1 justify-center items-center">

                <div className="bg-white shadow-xl rounded-xl w-full max-w-md p-8">

                    <h2 className="text-3xl font-bold text-center mb-2">
                        Welcome Back
                    </h2>

                    <p className="text-center text-gray-500 mb-6">
                        Sign in to continue
                    </p>

                    {error && (

                        <div className="bg-red-100 border border-red-300 text-red-600 p-3 rounded mb-5">

                            {error}

                        </div>

                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        <div>

                            <label className="block mb-2 font-medium">

                                Email

                            </label>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
                                placeholder="john@example.com"
                            />

                        </div>

                        <div>

                            <label className="block mb-2 font-medium">

                                Password

                            </label>

                            <div className="relative">

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="********"
                                />

                                <button
                                    type="button"
                                    className="absolute right-4 top-4"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                >

                                    {showPassword ? (
                                        <EyeOff size={20}/>
                                    ) : (
                                        <Eye size={20}/>
                                    )}

                                </button>

                            </div>

                        </div>

                        <button
                            disabled={loading}
                            className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 rounded-lg font-semibold transition"
                        >

                            {loading
                                ? "Signing In..."
                                : "Login"}

                        </button>

                    </form>

                    <div className="mt-6 text-center">

                        <span className="text-gray-500">

                            Don't have an account?

                        </span>

                        <Link
                            to="/signup"
                            className="ml-2 text-purple-700 font-semibold"
                        >

                            Sign Up

                        </Link>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default LoginPage;