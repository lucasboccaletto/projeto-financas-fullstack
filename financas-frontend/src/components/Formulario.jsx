import { useState } from 'react';

function Formulario({ aoSalvar }) {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('DESPESA');
  const [categoria, setCategoria] = useState('Alimentação');
  const [dataTransacao, setDataTransacao] = useState('');

  const salvarTransacao = async (e) => {
    e.preventDefault();

    const novaTransacao = {
      descricao: descricao,
      valor: parseFloat(valor),
      tipo: tipo,
      categoria: categoria,
      dataTransacao: dataTransacao
    };

    try {
      // Recupera o token salvo no localStorage
      const token = localStorage.getItem('token');

      const resposta = await fetch('http://localhost:8080/api/transacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Envia o crachá para o Java
        },
        body: JSON.stringify(novaTransacao)
      });

      if (resposta.ok) {
        alert('Sucesso! Transação salva no banco de dados.');
        setDescricao('');
        setValor('');
        setCategoria('Alimentação');
        setDataTransacao('');

        aoSalvar();
      } else {
        alert('Aconteceu um erro ao tentar salvar no back-end.');
      }
    } catch (erro) {
      console.error("Erro:", erro);
      alert('Erro de conexão. O back-end em Java está rodando?');
    }
  };

  return (
    <div className="card">
      <h2>Nova Transação</h2>
      <form onSubmit={salvarTransacao}>
        <input type="text" placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
        <input type="number" placeholder="Valor" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} required />
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="RECEITA">Receita (Entrada)</option>
          <option value="DESPESA">Despesa (Saída)</option>
        </select>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="Alimentação">Alimentação</option>
          <option value="Transporte">Transporte</option>
          <option value="Moradia">Moradia</option>
          <option value="Lazer">Lazer</option>
          <option value="Educação">Educação</option>
          <option value="Saúde">Saúde</option>
          <option value="Outros">Outros</option>
        </select>
        <input type="date" value={dataTransacao} onChange={(e) => setDataTransacao(e.target.value)} required />
        <button type="submit">Salvar</button>
      </form>
    </div>
  );
}

export default Formulario;