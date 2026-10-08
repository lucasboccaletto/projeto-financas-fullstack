import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const TIPOS = ['CORRENTE', 'POUPANCA', 'DINHEIRO', 'CARTAO_CREDITO', 'INVESTIMENTO'];
const TIPO_LABEL = { CORRENTE: '💳 Conta Corrente', POUPANCA: '🐷 Poupança', DINHEIRO: '💵 Dinheiro', CARTAO_CREDITO: '💳 Cartão de Crédito', INVESTIMENTO: '📈 Investimento' };
const CORES_PADRAO = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#6f42c1', '#fd7e14', '#20c997'];
const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

function ModalConta({ conta, onSalvar, onFechar }) {
  const [nome, setNome] = useState(conta?.nome || '');
  const [tipo, setTipo] = useState(conta?.tipo || 'CORRENTE');
  const [saldoInicial, setSaldoInicial] = useState(conta?.saldoInicial ?? 0);
  const [cor, setCor] = useState(conta?.cor || '#007bff');
  const [icone, setIcone] = useState(conta?.icone || '🏦');
  const [limite, setLimite] = useState(conta?.limite || '');
  const [diaFechamento, setDiaFechamento] = useState(conta?.diaFechamento || '');
  const [diaVencimento, setDiaVencimento] = useState(conta?.diaVencimento || '');
  const [loading, setLoading] = useState(false);

  const salvar = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        nome, tipo, saldoInicial: parseFloat(saldoInicial) || 0, cor, icone,
        limite: tipo === 'CARTAO_CREDITO' ? parseFloat(limite) || null : null,
        diaFechamento: tipo === 'CARTAO_CREDITO' ? parseInt(diaFechamento) || null : null,
        diaVencimento: tipo === 'CARTAO_CREDITO' ? parseInt(diaVencimento) || null : null,
      };
      const res = conta
        ? await api.put(`/api/contas/${conta.id}`, body)
        : await api.post('/api/contas', body);
      if (res.ok) { onSalvar(); onFechar(); }
      else { const msg = await res.text(); alert('Erro: ' + msg); }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: '12px', width: '440px', maxWidth: '95vw' }}>
        <h3 style={{ marginBottom: '20px' }}>{conta ? '✏️ Editar Conta' : '➕ Nova Conta'}</h3>
        <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input placeholder="Nome da conta" value={nome} onChange={e => setNome(e.target.value)} required />
          <select value={tipo} onChange={e => setTipo(e.target.value)}>
            {TIPOS.map(t => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}
          </select>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Saldo Inicial (R$)</label>
              <input type="number" step="0.01" value={saldoInicial} onChange={e => setSaldoInicial(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ícone</label>
              <input value={icone} onChange={e => setIcone(e.target.value)} placeholder="🏦" maxLength={2} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Cor</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {CORES_PADRAO.map(c => (
                <div key={c} onClick={() => setCor(c)} style={{
                  width: '28px', height: '28px', borderRadius: '50%', background: c, cursor: 'pointer',
                  border: cor === c ? '3px solid var(--text-primary)' : '2px solid transparent'
                }} />
              ))}
              <input type="color" value={cor} onChange={e => setCor(e.target.value)} style={{ width: '28px', height: '28px', padding: 0, border: 'none', cursor: 'pointer' }} />
            </div>
          </div>
          {tipo === 'CARTAO_CREDITO' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Limite</label>
                <input type="number" step="0.01" value={limite} onChange={e => setLimite(e.target.value)} placeholder="5000" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dia fechamento</label>
                <input type="number" min="1" max="31" value={diaFechamento} onChange={e => setDiaFechamento(e.target.value)} placeholder="25" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dia vencimento</label>
                <input type="number" min="1" max="31" value={diaVencimento} onChange={e => setDiaVencimento(e.target.value)} placeholder="5" />
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="submit" disabled={loading} style={{ flex: 1 }}>{loading ? 'Salvando...' : 'Salvar'}</button>
            <button type="button" onClick={onFechar} style={{ padding: '12px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Contas() {
  const [contas, setContas] = useState([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);

  const carregar = async () => {
    const res = await api.get('/api/contas');
    if (res.ok) setContas(await res.json());
  };

  useEffect(() => { carregar(); }, []);

  const deletar = async (id) => {
    if (!confirm('Desativar esta conta?')) return;
    await api.delete(`/api/contas/${id}`);
    carregar();
  };

  const total = contas.filter(c => c.ativa).reduce((s, c) => s + (c.saldo || 0), 0);

  return (
    <div>
      {(modal || editando) && (
        <ModalConta
          conta={editando}
          onSalvar={carregar}
          onFechar={() => { setModal(false); setEditando(null); }}
        />
      )}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <div>
            <h2>🏦 Minhas Contas</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              Patrimônio total: <strong style={{ color: total >= 0 ? '#28a745' : '#dc3545' }}>{fmt(total)}</strong>
            </p>
          </div>
          <button onClick={() => setModal(true)}
            style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            ➕ Nova Conta
          </button>
        </div>

        {contas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🏦</div>
            <p>Nenhuma conta cadastrada ainda.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '5px' }}>Crie uma conta para começar a organizar suas finanças!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {contas.map(c => (
              <div key={c.id} style={{
                padding: '20px', borderRadius: '12px',
                border: `2px solid ${c.cor || '#007bff'}`,
                background: 'var(--bg-secondary)',
                opacity: c.ativa ? 1 : 0.5,
                position: 'relative',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '2rem' }}>{c.icone || '🏦'}</div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => setEditando(c)}
                      style={{ padding: '4px 8px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>✏️</button>
                    {c.ativa && <button onClick={() => deletar(c.id)}
                      style={{ padding: '4px 8px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>🗑️</button>}
                  </div>
                </div>
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{c.nome}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{TIPO_LABEL[c.tipo] || c.tipo}</div>
                  <div style={{
                    marginTop: '10px', fontSize: '1.4rem', fontWeight: 'bold',
                    color: c.saldo >= 0 ? '#28a745' : '#dc3545'
                  }}>
                    {fmt(c.saldo)}
                  </div>
                  {c.limite && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                      Limite: {fmt(c.limite)} | Fecha dia {c.diaFechamento} | Vence dia {c.diaVencimento}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Contas;
