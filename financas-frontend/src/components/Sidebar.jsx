import { NavLink } from 'react-router-dom';

function Sidebar() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <nav className="sidebar-dark">
      
      {/* Cabeçalho com o Logotipo */}
      <div className="sidebar-header">
        <h2>Finance<span className="logo-bold">Pro</span></h2>
      </div>

      {/* Menu de Navegação */}
      <div className="sidebar-menu">
        <p className="menu-label">Menu Geral</p>
        <ul>
          <li>
            <NavLink to="/" end>
              <span>🏠</span> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/historico">
              <span>📋</span> Histórico
            </NavLink>
          </li>
          <li>
            <NavLink to="/graficos">
              <span>📊</span> Análises
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Rodapé com Botão de Sair Minimalista */}
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn" title="Sair do Sistema">
          🚪 Sair do Sistema
        </button>
      </div>

    </nav>
  );
}

export default Sidebar;