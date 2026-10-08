import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

function Orcamento({ gatilho }) {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());
  const [orcamentos, setOrcamentos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [modal, setModal] = useState(false);
  const [categoriaId, setCategoriaId] = useState('');
  const [valorLimite, setValorLimite] = useState('');
  const [loading, setLoading] = useState(false);

  const carregar = async () => {
    const [resO, resC] = await Promise.all([
      api.get(`/api/orcamentos?mes=${mes}&ano=${ano}`),
      api.get('/api/categorias'),
    ]);
    if (resO.ok) setOrcamentos(await resO.json());
    if (resC.ok) setCategorias(await resC.json());
  };

  useEffect(() => { carregar(); }, [mes, ano, gatilho]);

  const salvar = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        valorLimite: parseFloat(valorLimite),
        mes, ano,
        categoria: categoriaId ? { id: parseInt(categoriaId) } : null,
      };
      const res = await api.post('/api/orcamentos', body);
      if (res.ok) { carregar(); setModal(false); setCategoriaId(''); setValorLimite(''); }
      else { const msg = await res.text(); alert('Erro: ' + msg); }
    } finally {
      setLoading(false);
    }
  };

  const deletar = async (id) => {
    if (!confirm('Excluir orçamento?')) return;
    await api.delete(`/api/orcamentos/${id}`);
    carregar();
  };

  const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  return (
    <div>
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: '12px', width: '380px', maxWidth: '95vw' }}>
            <h3 style={{ marginBottom: '20px' }}>➕ Definir Orçamento</h3>
            <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <select value={categoriaId} onChange={e => setCategoriaId(e.target.value)} required>
                <option value="">Selecionar categoria</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.icone} {c.nome}</option>)}
              </select>
              <input type="number" step="0.01" placeholder="Limite (R$)" value={valorLimite} onChange={e => setValorLimite(e.target.value)} required />
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="submit" disabled={loading} style={{ flex: 1 }}>{loading ? 'Salvando...' : 'Salvar'}</button>
                <button type="button" onClick={() => setModal(false)} style={{ padding: '12px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2>📉 Orçamento por Categoria</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>{MESES[mes - 1]} / {ano}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select value={mes} onChange={e => setMes(parseInt(e.target.value))}>
              {MESES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
            <input type="number" min="2020" max="2030" value={ano} onChange={e => setAno(parseInt(e.target.value))} style={{ width: '80px' }} />
            <button onClick={() => setModal(true)}
              style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              ➕ Novo
            </button>
          </div>
        </div>

        {orcamentos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📉</div>
            <p>Nenhum orçamento definido para {MESES[mes - 1]} / {ano}.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {orcamentos.map(o => {
              const pct = Math.min(100, (o.gastoAtual / o.valorLimite) * 100);
              const cor = pct >= 100 ? '#dc3545' : pct >= 80 ? '#ffc107' : '#28a745';
              return (
                <div key={o.id} style={{ padding: '15px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontWeight: 'bold' }}>
                        {o.categoria ? `${o.categoria.icone} ${o.categoria.nome}` : 'Sem categoria'}
                      </span>
                      {o.alertaEstourado && <span style={{ marginLeft: '8px', color: '#dc3545', fontSize: '0.85rem' }}>⚠️ Limite estourado!</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem' }}>
                        <strong style={{ color: cor }}>{fmt(o.gastoAtual)}</strong>
                        <span style={{ color: 'var(--text-muted)' }}> / {fmt(o.valorLimite)}</span>
                      </span>
                      <button onClick={() => deletar(o.id)}
                        style={{ padding: '3px 7px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>🗑️</button>
                    </div>
                  </div>
                  <div style={{ height: '10px', background: 'var(--bg-primary)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: cor, borderRadius: '5px', transition: 'width 0.3s ease' }} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'right' }}>
                    {pct.toFixed(1)}% utilizado · Restante: {fmt(o.valorLimite - o.gastoAtual)}
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

export default Orcamento;
