import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Formulario from './Formulario';
import ListaTransacoes from './ListaTransacoes';
import Resumo from './Resumo';
import Grafico from './Grafico';
import Contas from './Contas';
import Categorias from './Categorias';
import Orcamento from './Orcamento';
import Metas from './Metas';
import Configuracoes from './Configuracoes';

function Dashboard() {
  const [recarregar, setRecarregar] = useState(0);
  const atualizar = () => setRecarregar(r => r + 1);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={
            <>
              <Resumo gatilho={recarregar} />
              <Formulario aoSalvar={atualizar} />
            </>
          } />
          <Route path="/historico" element={
            <ListaTransacoes gatilho={recarregar} aoDeletar={atualizar} />
          } />
          <Route path="/graficos" element={<Grafico gatilho={recarregar} />} />
          <Route path="/contas" element={<Contas gatilho={recarregar} />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/orcamento" element={<Orcamento gatilho={recarregar} />} />
          <Route path="/metas" element={<Metas />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Routes>
      </div>
    </div>
  );
}

export default Dashboard;
