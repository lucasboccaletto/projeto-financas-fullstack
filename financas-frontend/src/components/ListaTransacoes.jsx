import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import Formulario from './Formulario';

function ListaTransacoes({ gatilho, aoDeletar }) {
  const [dados, setDados] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState(null);
  const [selecionados, setSelecionados] = useState([]);

  // Filtros
  const [busca, setBusca] = useState('');
  const [tipo, setTipo] = useState('');
  const [status, setStatus] = useState('');
  const [contaId, setContaId] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 15;

  const [contas, setContas] = useState([]);

  useEffect(() => {
    api.get('/api/contas').then(r => r.ok && r.json().then(setContas));
  }, []);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, size: pageSize,
        ...(busca && { descricao: busca }),
        ...(tipo && { tipo }),
        ...(status && { status }),
        ...(contaId && { contaId }),
        ...(dataInicio && { dataInicio }),
        ...(dataFim && { dataFim }),
      });
      const res = await api.get(`/api/transacoes?${params}`);
      if (res.ok) setDados(await res.json());
    } finally {
      setLoading(false);
    }
  }, [gatilho, busca, tipo, status, contaId, dataInicio, dataFim, page]);

  useEffect(() => { carregar(); }, [carregar]);

  const deletar = async (id) => {
    if (!confirm('Excluir esta transação?')) return;
    const res = await api.delete(`/api/transacoes/${id}`);
    if (res.ok) { aoDeletar(); setSelecionados(s => s.filter(x => x !== id)); }
  };

  const deletarLote = async () => {
    if (!confirm(`Excluir ${selecionados.length} transações?`)) return;
    const res = await api.delete('/api/transacoes/lote', selecionados);
    if (res.ok) { aoDeletar(); setSelecionados([]); }
  };

  const alternarStatus = async (t) => {
    const novoStatus = t.status === 'PAGO' ? 'PENDENTE' : 'PAGO';
    await api.patch(`/api/transacoes/${t.id}/status`, { status: novoStatus });
    carregar();
  };

  const exportarCsv = async () => {
    const res = await api.download('/api/transacoes/exportar/csv');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'transacoes.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSelecionado = (id) => setSelecionados(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  const fmtData = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '-';

  const transacoes = dados.content || [];

  return (
    <div>
      {editando && (
        <Formulario
          transacaoEditar={editando}
          aoSalvar={() => { carregar(); aoDeletar(); }}
          aoFechar={() => setEditando(null)}
        />
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h2>📋 Histórico de Transações</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {selecionados.length > 0 && (
              <button onClick={deletarLote}
                style={{ padding: '8px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                🗑️ Excluir {selecionados.length} selecionados
              </button>
            )}
            <button onClick={exportarCsv}
              style={{ padding: '8px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              📥 Exportar CSV
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '20px' }}>
          <input placeholder="🔍 Buscar..." value={busca} onChange={e => { setBusca(e.target.value); setPage(0); }} />
          <select value={tipo} onChange={e => { setTipo(e.target.value); setPage(0); }}>
            <option value="">Todos os tipos</option>
            <option value="RECEITA">💰 Receita</option>
            <option value="DESPESA">💸 Despesa</option>
            <option value="TRANSFERENCIA">🔄 Transferência</option>
          </select>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(0); }}>
            <option value="">Todos os status</option>
            <option value="PAGO">✅ Pago</option>
            <option value="PENDENTE">⏳ Pendente</option>
          </select>
          <select value={contaId} onChange={e => { setContaId(e.target.value); setPage(0); }}>
            <option value="">Todas as contas</option>
            {contas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <input type="date" value={dataInicio} onChange={e => { setDataInicio(e.target.value); setPage(0); }} title="Data início" />
          <input type="date" value={dataFim} onChange={e => { setDataFim(e.target.value); setPage(0); }} title="Data fim" />
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
          {dados.totalElements || 0} transações encontradas
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px' }}>Carregando...</p>
        ) : transacoes.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Nenhuma transação encontrada.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-primary)' }}>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
                    <input type="checkbox"
                      checked={selecionados.length === transacoes.length && transacoes.length > 0}
                      onChange={e => setSelecionados(e.target.checked ? transacoes.map(t => t.id) : [])}
                    />
                  </th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Data</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Descrição</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Categoria</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Conta</th>
                  <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid var(--border)' }}>Valor</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid var(--border)' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid var(--border)' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {transacoes.map(t => (
                  <tr key={t.id} style={{ background: selecionados.includes(t.id) ? 'rgba(0,123,255,0.05)' : 'transparent' }}>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)' }}>
                      <input type="checkbox" checked={selecionados.includes(t.id)} onChange={() => toggleSelecionado(t.id)} />
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>{fmtData(t.dataTransacao)}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: '500' }}>{t.descricao}</div>
                      {t.numeroParcela && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Parcela {t.numeroParcela}/{t.totalParcelas}</div>}
                      {t.observacao && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.observacao}</div>}
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                      {t.categoriaEntidade ? `${t.categoriaEntidade.icone} ${t.categoriaEntidade.nome}` : (t.categoria || '-')}
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                      {t.conta ? `${t.conta.icone || '🏦'} ${t.conta.nome}` : '-'}
                    </td>
                    <td style={{
                      padding: '10px', borderBottom: '1px solid var(--border)',
                      textAlign: 'right', fontWeight: 'bold',
                      color: t.tipo === 'RECEITA' ? '#28a745' : t.tipo === 'DESPESA' ? '#dc3545' : '#6c757d'
                    }}>
                      {t.tipo === 'RECEITA' ? '+' : t.tipo === 'DESPESA' ? '-' : '↔'} {fmt(t.valor)}
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                      <button onClick={() => alternarStatus(t)}
                        style={{
                          padding: '3px 8px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '0.8rem',
                          background: t.status === 'PAGO' ? '#d4edda' : '#fff3cd',
                          color: t.status === 'PAGO' ? '#155724' : '#856404',
                        }}>
                        {t.status === 'PAGO' ? '✅ Pago' : '⏳ Pendente'}
                      </button>
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                        <button onClick={() => setEditando(t)}
                          style={{ padding: '5px 10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                          ✏️
                        </button>
                        <button onClick={() => deletar(t.id)}
                          style={{ padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        {dados.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px', alignItems: 'center' }}>
            <button onClick={() => setPage(0)} disabled={page === 0} className="btn-page">««</button>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-page">‹</button>
            <span style={{ padding: '0 15px', fontSize: '0.9rem' }}>Página {page + 1} de {dados.totalPages}</span>
            <button onClick={() => setPage(p => Math.min(dados.totalPages - 1, p + 1))} disabled={page >= dados.totalPages - 1} className="btn-page">›</button>
            <button onClick={() => setPage(dados.totalPages - 1)} disabled={page >= dados.totalPages - 1} className="btn-page">»»</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListaTransacoes;
