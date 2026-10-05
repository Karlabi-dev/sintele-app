import { useEffect } from "react";
import "./Home.css";
import logo from "../../assets/logo.png";
function Home({ onLogin }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onLogin();
        }, 10000);
        return () => clearTimeout(timer);
    }, [onLogin]);
    return (
        <div className="splash-screen">
            <div className="splash-content">
                <img
                    src={logo}
                    alt="SINTELE"
                    className="splash-logo"
                />
                <p>
                    Sua identidade profissional em um só lugar.
                </p>
            </div>
        </div>
    );
}
export default Home;