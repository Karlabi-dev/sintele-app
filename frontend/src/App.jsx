import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth } from "./firebase";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import EditProfessionalProfile from "./pages/EditProfessionalProfile";
import ProfessionalDashboard from "./pages/ProfessionalDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";

function App() {
    const [page, setPage] = useState("home");
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(
            auth,
            async (user) => {
                if (!user) {
                    setAccount(null);
                    setPage("home");
                    setLoading(false);
                    return;
                }

                try {
                    const token = await user.getIdToken();

                    const response = await fetch(
                        "http://localhost:3000/api/accounts/me",
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(
                            data.error || "Erro ao buscar conta."
                        );
                    }

                    setAccount(data.account);

                    if (data.account.type === "professional") {
                        setPage("professional");
                    } else if (data.account.type === "company") {
                        setPage("company");
                    }

                } catch (error) {
                    console.error(
                        "Erro ao recuperar sessão:",
                        error
                    );

                    await signOut(auth);

                    setAccount(null);
                    setPage("home");

                } finally {
                    setLoading(false);
                }
            }
        );

        return () => unsubscribe();
    }, []);

    async function handleLogout() {
        try {
            await signOut(auth);

            setAccount(null);
            setPage("home");

        } catch (error) {
            console.error("Erro ao sair:", error);
        }
    }

    function handleLoginSuccess(accountData) {
        setAccount(accountData);

        if (accountData.type === "professional") {
            setPage("professional");
        } else if (accountData.type === "company") {
            setPage("company");
        }
    }

    if (loading) {
        return <p>Carregando...</p>;
    }

    if (page === "register") {
        return (
            <Register
                onBack={() => setPage("home")}
            />
        );
    }

    if (page === "login") {
        return (
            <Login
                onBack={() => setPage("home")}
                onLoginSuccess={handleLoginSuccess}
            />
        );
    }

    if (page === "professional") {
    return (
        <ProfessionalDashboard
    account={account}
    onLogout={handleLogout}
    onEditProfile={() => setPage("edit-professional")}
/>
    );
}

if (page === "edit-professional") {
    return (
        <EditProfessionalProfile
            onBack={() => setPage("professional")}
            onProfileUpdated={() => setPage("professional")}
        />
    );
}

    if (page === "company") {
        return (
            <CompanyDashboard
                account={account}
                onLogout={handleLogout}
            />
        );
    }


    return (
        <Home
            onRegister={() => setPage("register")}
            onLogin={() => setPage("login")}

        />
    );
}

export default App;