import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const token = await response.text(); 
        localStorage.setItem('token', token); 
        alert('Login realizado com sucesso!');
        window.location.href = '/'; // Redireciona para o Dashboard e força recarregamento
      } else {
        alert('Usuário ou senha inválidos!');
      }
    } catch (error) {
      alert('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '300px', margin: 'auto', textAlign: 'center' }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input 
          placeholder="Usuário" 
          onChange={(e) => setUsername(e.target.value)} 
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input 
          type="password" 
          placeholder="Senha" 
          onChange={(e) => setPassword(e.target.value)} 
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Entrar
        </button>
      </form>
      
      {/* Aqui está o link que leva para a nova tela de cadastro */}
      <p style={{ marginTop: '20px' }}>
        Não tem uma conta? <Link to="/cadastro" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Cadastre-se</Link>
      </p>
    </div>
  );
}

export default Login;