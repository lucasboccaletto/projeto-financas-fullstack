import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
  const { logout, tema, alternarTema } = useAuth();

  return (
    <nav className="sidebar-dark">
      <div className="sidebar-header">
        <h2>Finance<span className="logo-bold">Pro</span></h2>
        <p style={{ fontSize: '0.7rem', color: '#8a909d', marginTop: '4px' }}>Gerenciador Financeiro</p>
      </div>

      <div className="sidebar-menu">
        <p className="menu-label">Principal</p>
        <ul>
          <li><NavLink to="/" end><span>🏠</span> Dashboard</NavLink></li>
          <li><NavLink to="/historico"><span>📋</span> Histórico</NavLink></li>
          <li><NavLink to="/graficos"><span>📊</span> Análises</NavLink></li>
        </ul>

        <p className="menu-label" style={{ marginTop: '20px' }}>Gestão</p>
        <ul>
          <li><NavLink to="/contas"><span>🏦</span> Contas</NavLink></li>
          <li><NavLink to="/categorias"><span>🏷️</span> Categorias</NavLink></li>
          <li><NavLink to="/orcamento"><span>📉</span> Orçamento</NavLink></li>
          <li><NavLink to="/metas"><span>🎯</span> Metas</NavLink></li>
        </ul>

        <p className="menu-label" style={{ marginTop: '20px' }}>Sistema</p>
        <ul>
          <li><NavLink to="/configuracoes"><span>⚙️</span> Configurações</NavLink></li>
        </ul>
      </div>

      <div className="sidebar-footer">
        <button
          onClick={alternarTema}
          className="logout-btn"
          style={{ marginBottom: '8px' }}
          title={tema === 'light' ? 'Modo escuro' : 'Modo claro'}
        >
          {tema === 'light' ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
        </button>
        <button onClick={logout} className="logout-btn" title="Sair">
          🚪 Sair
        </button>
      </div>
    </nav>
  );
}

export default Sidebar;
