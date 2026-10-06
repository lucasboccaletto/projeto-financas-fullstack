import { useState, useEffect } from 'react';

function ListaTransacoes({ gatilho, aoDeletar }) {
  const [transacoes, setTransacoes] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');

  // Dicionário de Emojis por Categoria
  const categoriaEmojis = {
    'Alimentação': '🍔',
    'Transporte': '🚗',
    'Moradia': '🏠',
    'Lazer': '🎉',
    'Educação': '📚',
    'Saúde': '💊',
    'Outros': '📦'
  };

  const carregarTransacoes = async () => {
    try {
      const token = localStorage.getItem('token');

      const resposta = await fetch('http://localhost:8080/api/transacoes', {
        headers: {
          'Authorization': `Bearer ${token}` // Envia o crachá para o Java
        }
      });
      const dados = await resposta.json();
      setTransacoes(dados);
    } catch (erro) {
      console.error("Erro ao buscar transações:", erro);
    }
  };

  useEffect(() => {
    carregarTransacoes();
  }, [gatilho]);

  const deletarTransacao = async (id) => {
    const confirmar = window.confirm("Tem certeza que deseja apagar esta transação?");
    if (!confirmar) return;
    try {
      const token = localStorage.getItem('token');

      const resposta = await fetch(`http://localhost:8080/api/transacoes/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}` // Envia o crachá para o Java
        }
      });
      if (resposta.ok) aoDeletar();
    } catch (erro) { 
      console.error("Erro:", erro); 
    }
  };

  const transacoesFiltradas = transacoes.filter((t) => {
    const buscaMatch = t.descricao.toLowerCase().includes(termoBusca.toLowerCase());
    const categoriaMatch = categoriaFiltro === 'Todas' || t.categoria === categoriaFiltro;
    return buscaMatch && categoriaMatch;
  });

  const formatarData = (dataOriginal) => {
    if (!dataOriginal) return '';
    const [ano, mes, dia] = dataOriginal.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className="card">
      <div style={{ marginBottom: '20px' }}>
        <h2>Histórico de Transações</h2>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <input 
            type="text" 
            placeholder="🔍 Buscar por descrição..." 
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
          />
          <select 
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="Todas">Todas as categorias</option>
            <option value="Alimentação">Alimentação</option>
            <option value="Transporte">Transporte</option>
            <option value="Moradia">Moradia</option>
            <option value="Lazer">Lazer</option>
            <option value="Educação">Educação</option>
            <option value="Saúde">Saúde</option>
            <option value="Outros">Outros</option>
          </select>
        </div>
      </div>
      
      {transacoesFiltradas.length === 0 ? (
        <p style={{ marginTop: '15px' }}>Nenhuma transação encontrada.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f9', textAlign: 'left' }}>
              <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Data</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Descrição</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Categoria</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Valor</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Tipo</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {transacoesFiltradas.map((transacao) => (
              <tr key={transacao.id}>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{formatarData(transacao.dataTransacao)}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{transacao.descricao}</td>
                
                {/* Aqui está a alteração! O React lê a categoria e injeta o emoji correspondente */}
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                  {categoriaEmojis[transacao.categoria] || '🏷️'} {transacao.categoria}
                </td>
                
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>R$ {transacao.valor.toFixed(2)}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd', color: transacao.tipo === 'RECEITA' ? 'green' : 'red', fontWeight: 'bold' }}>{transacao.tipo}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                  <button onClick={() => deletarTransacao(transacao.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ListaTransacoes;