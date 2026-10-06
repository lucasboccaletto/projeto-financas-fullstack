import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Cadastro() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();

    // Validação básica no front-end
    if (password !== confirmPassword) {
      alert('As senhas não conferem!');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/auth/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        alert('Cadastro realizado com sucesso! Agora você pode fazer o login.');
        navigate('/login'); // Manda o usuário para a tela de login
      } else {
        const mensagemErro = await response.text();
        alert(mensagemErro); // Exibe o erro vindo do Java (ex: "Usuário já existe")
      }
    } catch (error) {
      alert('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '300px', margin: 'auto', textAlign: 'center' }}>
      <h2>Criar Conta</h2>
      <form onSubmit={handleCadastro} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input 
          placeholder="Nome de Usuário" 
          onChange={(e) => setUsername(e.target.value)} 
          required 
          style={{ padding: '8px' }}
        />
        <input 
          type="password" 
          placeholder="Senha" 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          style={{ padding: '8px' }}
        />
        <input 
          type="password" 
          placeholder="Confirme a Senha" 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          required 
          style={{ padding: '8px' }}
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
          Cadastrar
        </button>
      </form>
      <p style={{ marginTop: '20px' }}>
        Já tem uma conta? <Link to="/login">Faça Login</Link>
      </p>
    </div>
  );
}

export default Cadastro;