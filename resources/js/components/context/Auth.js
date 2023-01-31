import * as React from "react";
import axios from '../../services/AxiosApi';

const AuthenticationContext = React.createContext({ status: false });

export function AuthProvider({ children }) {

    const [user, setUser] = React.useState({});
    const isAuthenticated = !!user;

    async function verifyAuthentication() {

        if (!isAuthenticated) logout();

        const response = await axios.get("/api/auth/data");
        setUser(response.data.user);

    }

    async function login(formData) {

        try {

            const response = await axios.post("/api/auth/login", formData);

            setUser(response.data.user);

            setTimeout(() => {
                window.location = "/internal";
            }, [1000]);

        } catch (error) {

            console.log(error);
            throw error;

        }
    }

    async function logout() {

        try {

            await axios.post("/api/auth/logout");

            setTimeout(() => {
                window.location = "/login";
            }, [1000]);

        } catch (error) {

            console.log(error);
            throw error;

        }

    }

    return (

        <AuthenticationContext.Provider value={{ user, login, logout, verifyAuthentication, isAuthenticated }}>
            {children}
        </AuthenticationContext.Provider>
    )
}

export function useAuth() {
    return React.useContext(AuthenticationContext);
}