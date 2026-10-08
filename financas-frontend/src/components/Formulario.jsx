import { useState, useEffect } from 'react';
import { api } from '../utils/api';

function Formulario({ aoSalvar, transacaoEditar, aoFechar }) {
  const editando = !!transacaoEditar;

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('DESPESA');
  const [categoriaTexto, setCategoriaTexto] = useState('Alimentação');
  const [categoriaId, setCategoriaId] = useState('');
  const [contaId, setContaId] = useState('');
  const [dataTransacao, setDataTransacao] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [status, setStatus] = useState('PAGO');
  const [recorrencia, setRecorrencia] = useState('UNICA');
  const [totalParcelas, setTotalParcelas] = useState('');
  const [observacao, setObservacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [contas, setContas] = useState([]);
  const [expandido, setExpandido] = useState(false);

  useEffect(() => {
    const carregarOpcoes = async () => {
      try {
        const [resC, resCo] = await Promise.all([
          api.get('/api/categorias'),
          api.get('/api/contas'),
        ]);
        if (resC.ok) setCategorias(await resC.json());
        if (resCo.ok) setContas(await resCo.json());
      } catch (e) { console.error(e); }
    };
    carregarOpcoes();
  }, []);

  useEffect(() => {
    if (transacaoEditar) {
      setDescricao(transacaoEditar.descricao || '');
      setValor(transacaoEditar.valor || '');
      setTipo(transacaoEditar.tipo || 'DESPESA');
      setCategoriaTexto(transacaoEditar.categoria || '');
      setCategoriaId(transacaoEditar.categoriaEntidade?.id || '');
      setContaId(transacaoEditar.conta?.id || '');
      setDataTransacao(transacaoEditar.dataTransacao || '');
      setDataVencimento(transacaoEditar.dataVencimento || '');
      setStatus(transacaoEditar.status || 'PAGO');
      setObservacao(transacaoEditar.observacao || '');
      setExpandido(true);
    }
  }, [transacaoEditar]);

  const limpar = () => {
    setDescricao(''); setValor(''); setTipo('DESPESA');
    setCategoriaTexto('Alimentação'); setCategoriaId(''); setContaId('');
    setDataTransacao(''); setDataVencimento(''); setStatus('PAGO');
    setRecorrencia('UNICA'); setTotalParcelas(''); setObservacao('');
  };

  const salvar = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        descricao, valor: parseFloat(valor), tipo,
        categoria: categoriaTexto || null,
        categoriaId: categoriaId ? parseInt(categoriaId) : null,
        contaId: contaId ? parseInt(contaId) : null,
        dataTransacao, status, recorrencia, observacao: observacao || null,
        dataVencimento: dataVencimento || null,
        totalParcelas: totalParcelas ? parseInt(totalParcelas) : null,
      };

      const res = editando
        ? await api.put(`/api/transacoes/${transacaoEditar.id}`, body)
        : await api.post('/api/transacoes', body);

      if (res.ok) {
        limpar();
        aoSalvar();
        if (aoFechar) aoFechar();
        if (!editando) alert('Transação salva com sucesso!');
      } else {
        const msg = await res.text();
        alert('Erro: ' + msg);
      }
    } catch (e) {
      console.error(e);
      alert('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>{editando ? '✏️ Editar Transação' : '➕ Nova Transação'}</h2>
      <form onSubmit={salvar}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <input
            placeholder="Descrição"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            disabled={loading} required
            style={{ gridColumn: '1 / -1' }}
          />
          <input
            type="number" placeholder="Valor (R$)" step="0.01" min="0.01"
            value={valor} onChange={e => setValor(e.target.value)}
            disabled={loading} required
          />
          <input
            type="date" value={dataTransacao}
            onChange={e => setDataTransacao(e.target.value)}
            disabled={loading} required
          />
          <select value={tipo} onChange={e => setTipo(e.target.value)} disabled={loading}>
            <option value="RECEITA">💰 Receita</option>
            <option value="DESPESA">💸 Despesa</option>
            <option value="TRANSFERENCIA">🔄 Transferência</option>
          </select>
          <select value={status} onChange={e => setStatus(e.target.value)} disabled={loading}>
            <option value="PAGO">✅ Pago</option>
            <option value="PENDENTE">⏳ Pendente</option>
          </select>
        </div>

        {/* Categoria e Conta */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
          {categorias.length > 0 ? (
            <select value={categoriaId} onChange={e => setCategoriaId(e.target.value)} disabled={loading}>
              <option value="">🏷️ Categoria (opcional)</option>
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.icone} {c.nome}</option>
              ))}
            </select>
          ) : (
            <select value={categoriaTexto} onChange={e => setCategoriaTexto(e.target.value)} disabled={loading}>
              <option value="Alimentação">🍔 Alimentação</option>
              <option value="Transporte">🚗 Transporte</option>
              <option value="Moradia">🏠 Moradia</option>
              <option value="Lazer">🎉 Lazer</option>
              <option value="Educação">📚 Educação</option>
              <option value="Saúde">💊 Saúde</option>
              <option value="Salário">💼 Salário</option>
              <option value="Investimento">📈 Investimento</option>
              <option value="Outros">📦 Outros</option>
            </select>
          )}
          <select value={contaId} onChange={e => setContaId(e.target.value)} disabled={loading}>
            <option value="">🏦 Conta (opcional)</option>
            {contas.map(c => (
              <option key={c.id} value={c.id}>{c.icone} {c.nome}</option>
            ))}
          </select>
        </div>

        {/* Campos avançados */}
        <button
          type="button"
          onClick={() => setExpandido(!expandido)}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.9rem', marginTop: '8px', padding: '0' }}
        >
          {expandido ? '▲ Menos opções' : '▼ Mais opções (vencimento, parcelas, recorrência)'}
        </button>

        {expandido && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Data de Vencimento</label>
              <input type="date" value={dataVencimento} onChange={e => setDataVencimento(e.target.value)} disabled={loading} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Recorrência</label>
              <select value={recorrencia} onChange={e => setRecorrencia(e.target.value)} disabled={loading}>
                <option value="UNICA">Única</option>
                <option value="DIARIA">Diária</option>
                <option value="SEMANAL">Semanal</option>
                <option value="MENSAL">Mensal</option>
                <option value="ANUAL">Anual</option>
              </select>
            </div>
            {!editando && (
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Parcelar em (nº parcelas)</label>
                <input
                  type="number" min="2" max="60" placeholder="Ex: 12"
                  value={totalParcelas} onChange={e => setTotalParcelas(e.target.value)} disabled={loading}
                />
              </div>
            )}
            <div style={{ gridColumn: editando ? '1 / -1' : 'auto' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Observação</label>
              <input
                type="text" placeholder="Observação opcional"
                value={observacao} onChange={e => setObservacao(e.target.value)} disabled={loading}
              />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button type="submit" disabled={loading} style={{ flex: 1 }}>
            {loading ? 'Salvando...' : editando ? '💾 Salvar Alterações' : '💾 Salvar Transação'}
          </button>
          {editando && (
            <button type="button" onClick={aoFechar}
              style={{ padding: '12px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default Formulario;
