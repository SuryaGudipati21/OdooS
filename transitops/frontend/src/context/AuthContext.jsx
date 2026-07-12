// frontend/src/context/AuthContext.jsx

import {
    createContext,
    useContext,
    useState,
    useEffect,
} from "react";

import { loginUser } from "../api/authApi";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);

    const [token, setToken] = useState(
        localStorage.getItem("token") || ""
    );

    const [loading, setLoading] = useState(true);

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {

        const savedUser = localStorage.getItem("user");

        const savedToken = localStorage.getItem("token");

        if (savedUser && savedToken) {

            setUser(JSON.parse(savedUser));

            setToken(savedToken);

            setIsAuthenticated(true);

        }

        setLoading(false);

    }, []);

    const login = async (email, password) => {

        try {

            const response = await loginUser({
                email,
                password,
            });

            const accessToken =
                response.data.access_token ||
                response.data.token;

            const loggedUser =
                response.data.user;

            localStorage.setItem(
                "token",
                accessToken
            );

            localStorage.setItem(
                "user",
                JSON.stringify(loggedUser)
            );

            setToken(accessToken);

            setUser(loggedUser);

            setIsAuthenticated(true);

            return {
                success: true,
            };

        } catch (error) {

            return {

                success: false,

                message:
                    error.response?.data?.detail ||
                    "Invalid Credentials",

            };

        }

    };

    const logout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        setToken("");

        setUser(null);

        setIsAuthenticated(false);

    };

    const value = {

        user,

        token,

        loading,

        login,

        logout,

        isAuthenticated,

        role: user?.role || null,

    };

    return (

        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>

    );

};

export default AuthContext;