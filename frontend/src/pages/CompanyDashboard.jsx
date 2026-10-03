function CompanyDashboard({ account, onLogout }) {
    return (
        <div>
            <h1>SINTELE</h1>

            <h2>Olá, empresa! 👋</h2>

            <p>E-mail: {account.email}</p>

            <p>Painel da empresa.</p>

            <button onClick={onLogout}>
                Sair
            </button>
        </div>
    );
}

export default CompanyDashboard;