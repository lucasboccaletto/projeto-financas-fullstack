import { useState, useEffect } from 'react';

function Resumo({ gatilho }) {
  const [receitas, setReceitas] = useState(0);
  const [despesas, setDespesas] = useState(0);
  const [saldo, setSaldo] = useState(0);

  useEffect(() => {
    const calcularSaldos = async () => {
      try {
        const token = localStorage.getItem('token');

        const resposta = await fetch('http://localhost:8080/api/transacoes', {
          headers: {
            'Authorization': `Bearer ${token}` // Envia o crachá para o Java
          }
        });
        const dados = await resposta.json();

        let totalReceitas = 0;
        let totalDespesas = 0;

        dados.forEach((transacao) => {
          if (transacao.tipo === 'RECEITA') {
            totalReceitas += transacao.valor;
          } else {
            totalDespesas += transacao.valor;
          }
        });

        setReceitas(totalReceitas);
        setDespesas(totalDespesas);
        setSaldo(totalReceitas - totalDespesas);
      } catch (erro) {
        console.error("Erro ao calcular saldos:", erro);
      }
    };

    calcularSaldos();
  }, [gatilho]);

  return (
    <div className="resumo-container">
      <div className="resumo-card receita">
        <h3>Receitas</h3>
        <p>R$ {receitas.toFixed(2)}</p>
      </div>
      <div className="resumo-card despesa">
        <h3>Despesas</h3>
        <p>R$ {despesas.toFixed(2)}</p>
      </div>
      <div className="resumo-card saldo">
        <h3>Saldo Total</h3>
        <p>R$ {saldo.toFixed(2)}</p>
      </div>
    </div>
  );
}

export default Resumo; 