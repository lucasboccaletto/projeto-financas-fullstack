import { useState, useEffect } from 'react';
import { api } from '../utils/api';

function Resumo({ gatilho }) {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/dashboard/resumo');
        if (res.ok) setDados(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [gatilho]);

  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  if (loading) return <div className="resumo-container"><p>Carregando...</p></div>;
  if (!dados) return null;

  return (
    <>
      {/* Cards principais */}
      <div className="resumo-container">
        <div className="resumo-card receita">
          <h3>💰 Receitas do Mês</h3>
          <p>{fmt(dados.receitas)}</p>
        </div>
        <div className="resumo-card despesa">
          <h3>💸 Despesas do Mês</h3>
          <p>{fmt(dados.despesas)}</p>
        </div>
        <div className="resumo-card saldo">
          <h3>📊 Saldo do Mês</h3>
          <p style={{ color: dados.saldo >= 0 ? '#28a745' : '#dc3545' }}>{fmt(dados.saldo)}</p>
        </div>
        <div className="resumo-card" style={{ borderTopColor: '#f39c12' }}>
          <h3>⏳ Pendentes</h3>
          <p style={{ color: '#f39c12' }}>{fmt(dados.pendentes)}</p>
        </div>
      </div>

      {/* Saldo por conta */}
      {dados.contas && dados.contas.length > 0 && (
        <div className="card" style={{ marginBottom: '25px' }}>
          <h2>🏦 Saldo por Conta</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {dados.contas.map(c => (
              <div key={c.id} style={{
                padding: '15px',
                borderRadius: '8px',
                border: `2px solid ${c.cor || '#007bff'}`,
                background: 'var(--bg-primary)',
              }}>
                <div style={{ fontSize: '1.5rem' }}>{c.icone || '🏦'}</div>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginTop: '5px' }}>{c.nome}</div>
                <div style={{ color: c.tipo === 'CARTAO_CREDITO' ? '#dc3545' : (c.saldo >= 0 ? '#28a745' : '#dc3545'), fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {fmt(c.saldo)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>{c.tipo?.replace('_', ' ')}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '15px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem' }}>
            Patrimônio Total: <span style={{ color: dados.saldoTotal >= 0 ? '#28a745' : '#dc3545' }}>{fmt(dados.saldoTotal)}</span>
          </div>
        </div>
      )}

      {/* Próximos vencimentos */}
      {dados.vencimentos && dados.vencimentos.length > 0 && (
        <div className="card" style={{ marginBottom: '25px' }}>
          <h2>⚠️ Vencimentos nos Próximos 30 Dias</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            {dados.vencimentos.slice(0, 5).map(t => (
              <div key={t.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 15px', borderRadius: '6px',
                background: 'var(--bg-primary)', borderLeft: '4px solid #f39c12'
              }}>
                <div>
                  <strong>{t.descricao}</strong>
                  <span style={{ marginLeft: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    vence {new Date(t.dataVencimento).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <span style={{ color: '#dc3545', fontWeight: 'bold' }}>{fmt(t.valor)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default Resumo;
