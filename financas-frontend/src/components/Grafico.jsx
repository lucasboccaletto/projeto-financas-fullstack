import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts';
import { api } from '../utils/api';

const CORES = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#6f42c1', '#fd7e14', '#20c997', '#e83e8c'];

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

function Grafico({ gatilho }) {
  const [porCategoria, setPorCategoria] = useState([]);
  const [evolucao, setEvolucao] = useState([]);
  const [fluxo, setFluxo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      try {
        const [resC, resE, resF] = await Promise.all([
          api.get('/api/dashboard/por-categoria'),
          api.get('/api/dashboard/evolucao?meses=6'),
          api.get('/api/dashboard/fluxo-caixa?dias=90'),
        ]);
        if (resC.ok) setPorCategoria(await resC.json());
        if (resE.ok) setEvolucao(await resE.json());
        if (resF.ok) setFluxo(await resF.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [gatilho]);

  if (loading) return <div className="card"><p>Carregando análises...</p></div>;

  return (
    <div>
      {/* Evolução mensal */}
      <div className="card">
        <h2>📈 Evolução Mensal (6 meses)</h2>
        {evolucao.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Sem dados suficientes.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={evolucao} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fill: 'var(--text-primary)', fontSize: 12 }} />
              <YAxis tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} tick={{ fill: 'var(--text-primary)', fontSize: 11 }} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Legend />
              <Bar dataKey="receitas" name="Receitas" fill="#28a745" radius={[4,4,0,0]} />
              <Bar dataKey="despesas" name="Despesas" fill="#dc3545" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
        {/* Distribuição por categoria */}
        <div className="card">
          <h2>🥧 Despesas por Categoria</h2>
          {porCategoria.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Nenhuma despesa este mês.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={porCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {porCategoria.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Fluxo de caixa */}
        <div className="card">
          <h2>🔮 Fluxo de Caixa Projetado (90 dias)</h2>
          {fluxo && (
            <>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Saldo Atual</div>
                  <div style={{ fontWeight: 'bold', color: fluxo.saldoAtual >= 0 ? '#28a745' : '#dc3545' }}>{fmt(fluxo.saldoAtual)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Projetado em 90 dias</div>
                  <div style={{ fontWeight: 'bold', color: fluxo.saldoProjetado >= 0 ? '#28a745' : '#dc3545' }}>{fmt(fluxo.saldoProjetado)}</div>
                </div>
              </div>
              {fluxo.projecao.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={fluxo.projecao}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="data" tick={{ fontSize: 10, fill: 'var(--text-primary)' }} />
                    <YAxis tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: 'var(--text-primary)' }} />
                    <Tooltip formatter={(v) => fmt(v)} />
                    <Line type="monotone" dataKey="saldo" stroke="#007bff" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nenhuma transação pendente nos próximos 90 dias.</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tabela por categoria */}
      {porCategoria.length > 0 && (
        <div className="card">
          <h2>📊 Detalhamento por Categoria</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-primary)' }}>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Categoria</th>
                <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid var(--border)' }}>Valor</th>
                <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid var(--border)' }}>% do Total</th>
              </tr>
            </thead>
            <tbody>
              {porCategoria.map((item, i) => {
                const total = porCategoria.reduce((s, x) => s + (x.value || 0), 0);
                const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
                return (
                  <tr key={i}>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: CORES[i % CORES.length], marginRight: '8px' }}></span>
                      {item.name}
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)', textAlign: 'right', fontWeight: 'bold' }}>{fmt(item.value)}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <div style={{ width: '80px', height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: CORES[i % CORES.length] }}></div>
                        </div>
                        {pct}%
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Grafico;
