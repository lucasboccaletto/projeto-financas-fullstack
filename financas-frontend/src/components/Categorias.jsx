import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const CORES_PADRAO = ['#007bff','#28a745','#dc3545','#ffc107','#6f42c1','#fd7e14','#20c997','#e83e8c','#17a2b8','#6c757d'];

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState('#007bff');
  const [icone, setIcone] = useState('🏷️');
  const [tipo, setTipo] = useState('AMBOS');
  const [loading, setLoading] = useState(false);

  const carregar = async () => {
    const res = await api.get('/api/categorias');
    if (res.ok) setCategorias(await res.json());
  };

  useEffect(() => { carregar(); }, []);

  const abrirModal = (c = null) => {
    setEditando(c);
    setNome(c?.nome || '');
    setCor(c?.cor || '#007bff');
    setIcone(c?.icone || '🏷️');
    setTipo(c?.tipo || 'AMBOS');
    setModal(true);
  };

  const salvar = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = { nome, cor, icone, tipo };
      const res = editando
        ? await api.put(`/api/categorias/${editando.id}`, body)
        : await api.post('/api/categorias', body);
      if (res.ok) { carregar(); setModal(false); }
      else { const msg = await res.text(); alert('Erro: ' + msg); }
    } finally {
      setLoading(false);
    }
  };

  const deletar = async (id) => {
    if (!confirm('Excluir esta categoria?')) return;
    const res = await api.delete(`/api/categorias/${id}`);
    if (res.ok) carregar();
    else { const msg = await res.text(); alert(msg); }
  };

  const sistema = categorias.filter(c => !c.usuario);
  // Note: sistema categories don't expose "usuario" due to @JsonIgnore,
  // but we can check if it's present in a different way.
  // Actually we need to determine this differently - the API only returns categorias
  // We'll use a flag from the API or check if deletion gives 403.
  // For display, show all categorias but only allow edit/delete on non-system ones.
  // Since we @JsonIgnore usuario, we can't tell. Let's try delete and show error.

  return (
    <div>
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: '12px', width: '380px', maxWidth: '95vw' }}>
            <h3 style={{ marginBottom: '20px' }}>{editando ? '✏️ Editar Categoria' : '➕ Nova Categoria'}</h3>
            <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input placeholder="Nome da categoria" value={nome} onChange={e => setNome(e.target.value)} required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ícone (emoji)</label>
                  <input value={icone} onChange={e => setIcone(e.target.value)} maxLength={2} style={{ textAlign: 'center', fontSize: '1.4rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tipo</label>
                  <select value={tipo} onChange={e => setTipo(e.target.value)}>
                    <option value="AMBOS">Ambos</option>
                    <option value="RECEITA">Receita</option>
                    <option value="DESPESA">Despesa</option>
                  </select>
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
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="submit" disabled={loading} style={{ flex: 1 }}>{loading ? 'Salvando...' : 'Salvar'}</button>
                <button type="button" onClick={() => setModal(false)} style={{ padding: '12px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2>🏷️ Categorias</h2>
          <button onClick={() => abrirModal()}
            style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            ➕ Nova Categoria
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
          {categorias.map(c => (
            <div key={c.id} style={{
              padding: '15px', borderRadius: '10px',
              border: `2px solid ${c.cor || '#6c757d'}`,
              background: 'var(--bg-secondary)',
              display: 'flex', flexDirection: 'column', gap: '8px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.8rem' }}>{c.icone || '🏷️'}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => abrirModal(c)}
                    style={{ padding: '3px 7px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>✏️</button>
                  <button onClick={() => deletar(c.id)}
                    style={{ padding: '3px 7px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>🗑️</button>
                </div>
              </div>
              <div style={{ fontWeight: 'bold' }}>{c.nome}</div>
              <span style={{
                padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem',
                background: c.tipo === 'RECEITA' ? '#d4edda' : c.tipo === 'DESPESA' ? '#f8d7da' : '#e2e3e5',
                color: c.tipo === 'RECEITA' ? '#155724' : c.tipo === 'DESPESA' ? '#721c24' : '#383d41',
                alignSelf: 'flex-start',
              }}>
                {c.tipo === 'RECEITA' ? '💰 Receita' : c.tipo === 'DESPESA' ? '💸 Despesa' : '↕️ Ambos'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Categorias;
