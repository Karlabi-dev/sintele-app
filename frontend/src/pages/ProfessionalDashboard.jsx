function ProfessionalDashboard({ account, onLogout }) {
    return (
        <div>
            <h1>SINTELE</h1>

            <h2>Olá, profissional! 👋</h2>

            <p>E-mail: {account.email}</p>

            <p>Seu painel profissional.</p>

            <button onClick={onLogout}>
                Sair
            </button>
        </div>
    );
}

export default ProfessionalDashboard;