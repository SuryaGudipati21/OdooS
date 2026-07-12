import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus, Truck } from "lucide-react";
import { signupUser } from "../api/authApi";

const SignupPage = () => {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "Fleet Manager",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        setError("");
    };

    const validate = () => {

        if (
            !formData.name ||
            !formData.email ||
            !formData.password ||
            !formData.confirmPassword
        ) {
            return "Please fill all fields.";
        }

        if (
            formData.password !==
            formData.confirmPassword
        ) {
            return "Passwords do not match.";
        }

        if (formData.password.length < 8) {
            return "Password must be at least 8 characters.";
        }

        return "";
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        const validation = validate();

        if (validation) {
            setError(validation);
            return;
        }

        try {

            setLoading(true);

            await signupUser({
                name: formData.name,
                email: formData.email,
                role: formData.role,
                password: formData.password,
            });

            setSuccess(
                "Registration Successful."
            );

            setTimeout(() => {
                navigate("/");
            }, 1500);

        } catch (err) {

            setError(
                err.response?.data?.detail ||
                "Registration Failed"
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="min-h-screen flex bg-gray-100">

            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-purple-700 to-indigo-700 justify-center items-center text-white">

                <div className="text-center">

                    <Truck
                        size={80}
                        className="mx-auto mb-6"
                    />

                    <h1 className="text-5xl font-bold">

                        TransitOps

                    </h1>

                    <p className="mt-4 text-lg">

                        Smart Transport Platform

                    </p>

                </div>

            </div>

            <div className="flex-1 flex justify-center items-center">

                <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-8">

                    <div className="flex justify-center mb-4">

                        <UserPlus
                            className="text-purple-700"
                            size={45}
                        />

                    </div>

                    <h2 className="text-3xl font-bold text-center">

                        Create Account

                    </h2>

                    <p className="text-gray-500 text-center mb-6">

                        Register to TransitOps

                    </p>

                    {error && (

                        <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded mb-4">

                            {error}

                        </div>

                    )}

                    {success && (

                        <div className="bg-green-100 border border-green-300 text-green-700 p-3 rounded mb-4">

                            {success}

                        </div>

                    )}

                    <form
                        className="space-y-5"
                        onSubmit={handleSubmit}
                    >

                        <div>

                            <label>Name</label>

                            <input
                                name="name"
                                type="text"
                                className="w-full border rounded-lg p-3 mt-2"
                                value={formData.name}
                                onChange={handleChange}
                            />

                        </div>

                        <div>

                            <label>Email</label>

                            <input
                                name="email"
                                type="email"
                                className="w-full border rounded-lg p-3 mt-2"
                                value={formData.email}
                                onChange={handleChange}
                            />

                        </div>

                        <div>

                            <label>Role</label>

                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-3 mt-2"
                            >

                                <option>
                                    Fleet Manager
                                </option>

                                <option>
                                    Driver
                                </option>

                                <option>
                                    Safety Officer
                                </option>

                                <option>
                                    Financial Analyst
                                </option>

                            </select>

                        </div>

                        <div>

                            <label>Password</label>

                            <div className="relative">

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    className="w-full border rounded-lg p-3 mt-2"
                                    value={formData.password}
                                    onChange={handleChange}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    className="absolute right-4 top-6"
                                >

                                    {showPassword ? (
                                        <EyeOff size={20}/>
                                    ) : (
                                        <Eye size={20}/>
                                    )}

                                </button>

                            </div>

                        </div>

                        <div>

                            <label>

                                Confirm Password

                            </label>

                            <div className="relative">

                                <input
                                    type={
                                        showConfirm
                                            ? "text"
                                            : "password"
                                    }
                                    name="confirmPassword"
                                    className="w-full border rounded-lg p-3 mt-2"
                                    value={
                                        formData.confirmPassword
                                    }
                                    onChange={handleChange}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirm(
                                            !showConfirm
                                        )
                                    }
                                    className="absolute right-4 top-6"
                                >

                                    {showConfirm ? (
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
                                ? "Creating Account..."
                                : "Register"}

                        </button>

                    </form>

                    <div className="text-center mt-6">

                        Already have an account?

                        <Link
                            to="/"
                            className="ml-2 text-purple-700 font-semibold"
                        >

                            Login

                        </Link>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default SignupPage;