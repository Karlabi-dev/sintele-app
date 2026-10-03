function Home({ onRegister, onLogin }) {
    return (
        <div>
            <h1>SINTELE</h1>

            <p>
                Sua identidade profissional em um só lugar.
            </p>

            <button onClick={onLogin}>
                Entrar
            </button>

            <button onClick={onRegister}>
                Criar conta
            </button>
        </div>
    );
}

export default Home;