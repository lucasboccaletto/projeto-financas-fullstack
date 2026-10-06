import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Grafico({ gatilho }) {
  const [dadosGrafico, setDadosGrafico] = useState([]);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const token = localStorage.getItem('token');

        const resposta = await fetch('http://localhost:8080/api/transacoes', {
          headers: {
            'Authorization': `Bearer ${token}` // Envia o crachá para o Java
          }
        });
        const transacoes = await resposta.json();

        const resumo = transacoes.reduce((acc, t) => {
          if (t.tipo === 'DESPESA') {
            acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
          }
          return acc;
        }, {});

        const formatoGrafico = Object.keys(resumo).map(key => ({
          name: key,
          value: resumo[key]
        }));

        setDadosGrafico(formatoGrafico);
      } catch (erro) {
        console.error("Erro ao carregar dados do gráfico:", erro);
      }
    };

    carregarDados();
  }, [gatilho]);

  const CORES = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff4d4d'];

  return (
    <div className="card" style={{ height: '400px' }}>
      <h2>Distribuição de Despesas</h2>
      {dadosGrafico.length === 0 ? (
        <p>Nenhuma despesa para exibir.</p>
      ) : (
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie data={dadosGrafico} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {dadosGrafico.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default Grafico;