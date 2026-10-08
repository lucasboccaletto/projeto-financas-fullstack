import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

function Metas() {
  const [metas, setMetas] = useState([]);
  const [modal, setModal] = useState(false);
  const [depositModal, setDepositModal] = useState(null);
  const [contas, setContas] = useState([]);
  const [form, setForm] = useState({ nome: '', descricao: '', valorObjetivo: '', valorAtual: '0', dataObjetivo: '', cor: '#28a745', icone: '🎯', contaId: '' });
  const [depositValor, setDepositValor] = useState('');
  const [loading, setLoading] = useState(false);

  const carregar = async () => {
    const [resM, resC] = await Promise.all([api.get('/api/metas'), api.get('/api/contas')]);
    if (resM.ok) setMetas(await resM.json());
    if (resC.ok) setContas(await resC.json());
  };

  useEffect(() => { carregar(); }, []);

  const salvar = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        nome: form.nome, descricao: form.descricao,
        valorObjetivo: parseFloat(form.valorObjetivo),
        valorAtual: parseFloat(form.valorAtual) || 0,
        dataObjetivo: form.dataObjetivo || null,
        cor: form.cor, icone: form.icone,
        conta: form.contaId ? { id: parseInt(form.contaId) } : null,
      };
      const res = await api.post('/api/metas', body);
      if (res.ok) { carregar(); setModal(false); setForm({ nome: '', descricao: '', valorObjetivo: '', valorAtual: '0', dataObjetivo: '', cor: '#28a745', icone: '🎯', contaId: '' }); }
      else { const msg = await res.text(); alert('Erro: ' + msg); }
    } finally {
      setLoading(false);
    }
  };

  const depositar = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.patch(`/api/metas/${depositModal.id}/deposito`, { valor: parseFloat(depositValor) });
      if (res.ok) { carregar(); setDepositModal(null); setDepositValor(''); }
      else { const msg = await res.text(); alert('Erro: ' + msg); }
    } finally {
      setLoading(false);
    }
  };

  const deletar = async (id) => {
    if (!confirm('Excluir esta meta?')) return;
    await api.delete(`/api/metas/${id}`);
    carregar();
  };

  const STATUS_LABEL = { ATIVA: '🟢 Ativa', CONCLUIDA: '✅ Concluída', CANCELADA: '❌ Cancelada' };

  return (
    <div>
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: '12px', width: '440px', maxWidth: '95vw' }}>
            <h3 style={{ marginBottom: '20px' }}>🎯 Nova Meta</h3>
            <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input placeholder="Nome da meta (ex: Viagem para Europa)" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} required />
              <input placeholder="Descrição (opcional)" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Valor Objetivo (R$)</label>
                  <input type="number" step="0.01" value={form.valorObjetivo} onChange={e => setForm(f => ({ ...f, valorObjetivo: e.target.value }))} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Já tenho (R$)</label>
                  <input type="number" step="0.01" value={form.valorAtual} onChange={e => setForm(f => ({ ...f, valorAtual: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Data objetivo</label>
                  <input type="date" value={form.dataObjetivo} onChange={e => setForm(f => ({ ...f, dataObjetivo: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ícone</label>
                  <input value={form.icone} onChange={e => setForm(f => ({ ...f, icone: e.target.value }))} maxLength={2} style={{ textAlign: 'center', fontSize: '1.4rem' }} />
                </div>
              </div>
              <select value={form.contaId} onChange={e => setForm(f => ({ ...f, contaId: e.target.value }))}>
                <option value="">Conta vinculada (opcional)</option>
                {contas.map(c => <option key={c.id} value={c.id}>{c.icone} {c.nome}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="submit" disabled={loading} style={{ flex: 1 }}>{loading ? 'Salvando...' : 'Criar Meta'}</button>
                <button type="button" onClick={() => setModal(false)} style={{ padding: '12px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {depositModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: '12px', width: '340px', maxWidth: '95vw' }}>
            <h3 style={{ marginBottom: '5px' }}>💰 Adicionar ao {depositModal.icone} {depositModal.nome}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '15px' }}>
              Progresso atual: {fmt(depositModal.valorAtual)} / {fmt(depositModal.valorObjetivo)}
            </p>
            <form onSubmit={depositar} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="number" step="0.01" placeholder="Valor a depositar" value={depositValor} onChange={e => setDepositValor(e.target.value)} required autoFocus />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={loading} style={{ flex: 1 }}>{loading ? 'Salvando...' : 'Depositar'}</button>
                <button type="button" onClick={() => setDepositModal(null)} style={{ padding: '12px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2>🎯 Metas e Objetivos</h2>
          <button onClick={() => setModal(true)}
            style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            ➕ Nova Meta
          </button>
        </div>

        {metas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎯</div>
            <p>Nenhuma meta definida ainda.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {metas.map(m => {
              const pct = m.valorObjetivo > 0 ? Math.min(100, (m.valorAtual / m.valorObjetivo) * 100) : 0;
              const restante = m.valorObjetivo - m.valorAtual;
              return (
                <div key={m.id} style={{ padding: '20px', borderRadius: '12px', border: `2px solid ${m.cor || '#28a745'}`, background: 'var(--bg-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '2rem' }}>{m.icone || '🎯'}</div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {m.status === 'ATIVA' && (
                        <button onClick={() => setDepositModal(m)}
                          style={{ padding: '4px 8px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>💰</button>
                      )}
                      <button onClick={() => deletar(m.id)}
                        style={{ padding: '4px 8px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>🗑️</button>
                    </div>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{m.nome}</div>
                    {m.descricao && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '3px' }}>{m.descricao}</div>}
                    <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>{STATUS_LABEL[m.status]}</div>
                    {m.dataObjetivo && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Meta: {new Date(m.dataObjetivo).toLocaleDateString('pt-BR')}</div>}
                  </div>
                  <div style={{ marginTop: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 'bold', color: m.cor }}>{fmt(m.valorAtual)}</span>
                      <span style={{ color: 'var(--text-muted)' }}>de {fmt(m.valorObjetivo)}</span>
                    </div>
                    <div style={{ height: '10px', background: 'var(--bg-primary)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: m.cor || '#28a745', borderRadius: '5px', transition: 'width 0.3s ease' }} />
                    </div>
                    <div style={{ fontSize: '0.8rem', marginTop: '5px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{pct.toFixed(1)}% concluído</span>
                      {restante > 0 && <span style={{ color: 'var(--text-muted)' }}>Faltam {fmt(restante)}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Metas;
