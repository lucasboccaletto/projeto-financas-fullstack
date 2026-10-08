import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) { setError('Informe o nome de usuário'); return; }
    if (password.length < 6) { setError('Senha deve ter no mínimo 6 caracteres'); return; }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const token = await res.text();
        login(token);
        navigate('/');
      } else {
        setError('Usuário ou senha incorretos');
      }
    } catch {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>💰</div>
          <h2>Finance<span style={{ color: '#667eea', fontWeight: 900 }}>Pro</span></h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '5px' }}>Gerenciador de Finanças Pessoais</p>
        </div>

        {error && (
          <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Usuário</label>
            <input
              placeholder="Seu nome de usuário"
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={loading} required autoFocus
            />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Senha</label>
            <input
              type="password" placeholder="Sua senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading} required
            />
          </div>
          <button type="submit" disabled={loading} style={{ marginTop: '8px', width: '100%', padding: '13px', fontSize: '16px' }}>
            {loading ? '⏳ Entrando...' : '🔐 Entrar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Não tem conta?{' '}
          <Link to="/cadastro" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>
            Criar conta grátis
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
