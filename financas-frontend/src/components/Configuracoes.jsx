import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

function Configuracoes() {
  const { logout, tema, alternarTema } = useAuth();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgTipo, setMsgTipo] = useState('');

  const mostrarMsg = (texto, tipo = 'success') => {
    setMsg(texto); setMsgTipo(tipo);
    setTimeout(() => setMsg(''), 4000);
  };

  const exportarDados = async () => {
    try {
      const res = await api.download('/api/transacoes/exportar/csv');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `financas-${new Date().toISOString().slice(0,10)}.csv`; a.click();
      URL.revokeObjectURL(url);
      mostrarMsg('Dados exportados com sucesso!');
    } catch (e) {
      mostrarMsg('Erro ao exportar dados.', 'error');
    }
  };

  return (
    <div>
      <div className="card">
        <h2>⚙️ Configurações</h2>

        {msg && (
          <div style={{
            padding: '12px', borderRadius: '6px', marginTop: '15px',
            background: msgTipo === 'error' ? '#f8d7da' : '#d4edda',
            color: msgTipo === 'error' ? '#721c24' : '#155724',
          }}>
            {msg}
          </div>
        )}

        {/* Aparência */}
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>🎨 Aparência</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderRadius: '8px', background: 'var(--bg-primary)' }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>Modo Escuro</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Alterna entre tema claro e escuro</div>
            </div>
            <button
              onClick={alternarTema}
              style={{
                padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                background: tema === 'dark' ? '#6f42c1' : '#007bff', color: 'white', fontWeight: 'bold',
              }}>
              {tema === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
            </button>
          </div>
        </div>

        {/* Dados */}
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>📊 Meus Dados</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderRadius: '8px', background: 'var(--bg-primary)' }}>
              <div>
                <div style={{ fontWeight: 'bold' }}>Exportar Transações</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Baixar todas as transações em formato CSV</div>
              </div>
              <button onClick={exportarDados}
                style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                📥 Exportar CSV
              </button>
            </div>
          </div>
        </div>

        {/* Informações do sistema */}
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>ℹ️ Sobre</h3>
          <div style={{ padding: '15px', borderRadius: '8px', background: 'var(--bg-primary)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <div><strong>FinancePro</strong> — Gerenciador de Finanças Pessoais</div>
            <div style={{ marginTop: '5px' }}>Versão 2.0 · Desenvolvido com Spring Boot + React</div>
            <div style={{ marginTop: '5px' }}>Backend: Java 17 + Spring Boot · Frontend: React 19 + Vite</div>
          </div>
        </div>

        {/* Sessão */}
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>🔐 Sessão</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderRadius: '8px', background: 'var(--bg-primary)' }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>Sair da Conta</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Encerrar a sessão atual</div>
            </div>
            <button onClick={logout}
              style={{ padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              🚪 Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Configuracoes;
