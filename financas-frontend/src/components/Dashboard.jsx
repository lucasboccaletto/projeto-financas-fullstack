import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Formulario from './Formulario';
import ListaTransacoes from './ListaTransacoes';
import Resumo from './Resumo';
import Grafico from './Grafico';

function Dashboard() {
  const [recarregar, setRecarregar] = useState(0);

  const atualizarTabela = () => {
    setRecarregar(recarregar + 1); 
  };

  return (
    <div className="app-layout">
      {/* Menu Lateral Fixo */}
      <Sidebar />

      {/* Conteúdo Dinâmico (Lado Direito) */}
      <div className="main-content">
        <header style={{ marginBottom: '20px', padding: '0' }}>
          <h1 style={{ textAlign: 'left', paddingBottom: '10px' }}>Meu Gerenciador de Finanças</h1>
        </header>
        
        <Routes>
          {/* Rota 1: Tela Inicial (Dashboard + Formulário) */}
          <Route path="/" element={
            <>
              <Resumo gatilho={recarregar} />
              <Formulario aoSalvar={atualizarTabela} />
            </>
          } />

          {/* Rota 2: Tela de Histórico */}
          <Route path="/historico" element={
            <ListaTransacoes gatilho={recarregar} aoDeletar={atualizarTabela} />
          } />

          {/* Rota 3: Tela de Gráficos */}
          <Route path="/graficos" element={
            <Grafico gatilho={recarregar} />
          } />
        </Routes>
      </div>
    </div>
  );
}

export default Dashboard;