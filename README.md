# 💰 FinancePro — Gerenciador de Finanças Pessoais Full-Stack

Aplicação completa de gestão financeira pessoal, desenvolvida com **Spring Boot 4 + React 19**, cobrindo desde o controle de transações até orçamentos, metas, análises gráficas e exportação de dados.

> Desenvolvido em co-criação com IA (Claude Code / Anthropic) como projeto de aprofundamento técnico full-stack.

---

## 🚀 Funcionalidades

### 💳 Contas
- Cadastro de contas: Corrente, Poupança, Dinheiro, Cartão de Crédito, Investimento
- Saldo calculado automaticamente com base nas transações
- Campos extras para cartão de crédito (limite, dia de fechamento/vencimento)
- Soft delete (desativar sem perder histórico)

### 🏷️ Categorias
- Categorias personalizadas por usuário (receita / despesa / ambas)
- Ícone e cor personalizáveis
- Categorias padrão do sistema (compartilhadas entre todos os usuários)

### 💸 Transações
- Tipos: Receita, Despesa, Transferência entre contas
- Status: Pago / Pendente / Cancelado
- Data de vencimento para contas a pagar
- **Parcelamento automático** (divide em N parcelas mensais)
- **Recorrência** (única, diária, semanal, mensal, anual)
- Observação por transação
- Vinculação com conta e categoria
- Campo `categoria` legado mantido para retrocompatibilidade

### 🔍 Histórico e Filtros
- Paginação server-side
- Filtros por: tipo, status, conta, categoria, período (data início/fim), texto
- Busca por descrição (case-insensitive)
- Edição e exclusão individual ou **em lote** (checkboxes)
- Alternância de status direto na lista (Pago ↔ Pendente)

### 📊 Dashboard
- Cards mensais: Receitas, Despesas, Saldo, Pendentes
- Saldo por conta com patrimônio total
- Próximos vencimentos (30 dias)

### 📈 Análises e Gráficos
- Evolução mensal: gráfico de barras (6 meses)
- Despesas por categoria: gráfico de pizza
- Fluxo de caixa projetado: gráfico de linha (30/60/90 dias)
- Tabela detalhada por categoria com total

### 📉 Orçamento por Categoria
- Limite mensal por categoria
- Barra de progresso com alertas (amarelo ≥80%, vermelho ≥100%)
- Filtro por mês/ano

### 🎯 Metas e Objetivos
- Valor objetivo e valor atual
- Depósito de valores com modal dedicado
- Progresso em barra e percentual
- Status: Ativa / Concluída / Cancelada (automático ao atingir 100%)
- Data objetivo e vinculação a conta

### 📥 Exportação
- Exportação de todas as transações em **CSV** (UTF-8)
- Disponível em Configurações e na tela de histórico

### 🌙 Modo Escuro
- Alternância light/dark via CSS variables (`data-theme`)
- Preferência salva no `localStorage`
- Botão no sidebar e na tela de Configurações

### 🐳 Docker
- `Dockerfile` multi-stage para o backend (build + runtime JRE alpine)
- `docker-compose.yml` com PostgreSQL, backend e frontend

---

## 🛠️ Stack Tecnológica

### Backend
| Tecnologia | Versão |
|---|---|
| Java | 17 |
| Spring Boot | 4.1.1-SNAPSHOT |
| Spring Security + JWT | JJWT 0.12 |
| Spring Data JPA / Hibernate 7 | — |
| PostgreSQL | 15+ |
| Lombok | — |
| Bean Validation (Jakarta) | — |

### Frontend
| Tecnologia | Versão |
|---|---|
| React | 19.x |
| Vite | 6.x |
| React Router DOM | 7.x |
| Recharts | 2.x |
| CSS Variables (theming) | — |

---

## 🗂️ Estrutura do Projeto

```
projeto-financas-fullstack/
├── docker-compose.yml
├── financas-backend/
│   └── financas-backend/
│       ├── Dockerfile
│       ├── .env.example
│       ├── pom.xml
│       └── src/main/java/com/projeto/financas_backend/
│           ├── controller/          # AuthController, TransacaoController, ContaController,
│           │                        # CategoriaController, OrcamentoController, MetaController,
│           │                        # DashboardController
│           ├── model/               # Entidades JPA + enums top-level
│           │   ├── Usuario, Transacao, Conta, Categoria, Orcamento, Meta
│           │   └── TipoTransacao, StatusTransacao, Recorrencia,
│           │       TipoConta, TipoCategoria, StatusMeta
│           ├── model/dto/           # TransacaoRequest, TransferenciaRequest
│           ├── repository/          # JpaRepository + JpaSpecificationExecutor
│           │   └── TransacaoSpec    # Filtros dinâmicos com Specification
│           ├── security/            # JwtService, JwtFilter, SecurityConfig,
│           │                        # CustomUserDetailsService
│           └── exception/           # GlobalExceptionHandler
└── financas-frontend/
    └── src/
        ├── App.jsx                  # Rotas + AuthProvider
        ├── context/AuthContext.jsx  # Login, logout, tema global
        ├── utils/api.js             # Fetch wrapper com Authorization header
        └── components/
            ├── Dashboard.jsx        # Layout principal com subrotas
            ├── Sidebar.jsx          # Navegação + dark mode toggle
            ├── Resumo.jsx           # Cards do mês + saldos por conta
            ├── Formulario.jsx       # Nova/editar transação
            ├── ListaTransacoes.jsx  # Histórico com filtros e paginação
            ├── Grafico.jsx          # Análises com Recharts
            ├── Contas.jsx           # Gestão de contas
            ├── Categorias.jsx       # Gestão de categorias
            ├── Orcamento.jsx        # Orçamento por categoria
            ├── Metas.jsx            # Metas e objetivos
            ├── Configuracoes.jsx    # Tema, exportação, sessão
            ├── Login.jsx
            └── Cadastro.jsx
```

---

## ⚙️ Executando Localmente

### Pré-requisitos
- Java 17+
- Node.js 18+ (LTS)
- PostgreSQL 14+

### 1. Banco de Dados

Crie o banco no PostgreSQL:
```sql
CREATE DATABASE financas_db;
```

### 2. Backend

```bash
cd financas-backend/financas-backend
```

Crie o arquivo `.env` (ou configure as variáveis de ambiente):
```env
DB_URL=jdbc:postgresql://localhost:5432/financas_db
DB_USER=postgres
DB_PASSWORD=sua_senha
JWT_SECRET=sua_chave_secreta_muito_longa
```

Execute:
```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

A API sobe na porta **8080**. O Hibernate cria as tabelas automaticamente (`ddl-auto=update`).

### 3. Frontend

```bash
cd financas-frontend
npm install
npm run dev
```

Acesse: **http://localhost:5173**

---

## 🐳 Docker Compose

Sobe tudo (banco + backend + frontend) com um único comando:

```bash
docker-compose up --build
```

| Serviço | Porta |
|---|---|
| PostgreSQL | 5432 |
| Backend (API) | 8080 |
| Frontend | 5173 |

---

## 🔐 API — Endpoints Principais

### Autenticação
```
POST /auth/registrar   → Cadastrar usuário
POST /auth/login       → Login (retorna JWT)
```

### Transações
```
GET    /api/transacoes              → Listar (filtros + paginação)
POST   /api/transacoes              → Criar (suporta parcelamento)
PUT    /api/transacoes/{id}         → Editar
PATCH  /api/transacoes/{id}/status  → Alterar status
DELETE /api/transacoes/{id}         → Excluir
DELETE /api/transacoes/lote         → Excluir em lote
POST   /api/transacoes/transferencia → Transferência entre contas
GET    /api/transacoes/exportar/csv → Exportar CSV
```

### Contas
```
GET    /api/contas       → Listar contas ativas
POST   /api/contas       → Criar
PUT    /api/contas/{id}  → Editar
DELETE /api/contas/{id}  → Desativar (soft delete)
```

### Categorias, Orçamento, Metas
```
GET/POST/PUT/DELETE /api/categorias
GET/POST/PUT/DELETE /api/orcamentos
GET/POST/PUT/DELETE /api/metas
PATCH /api/metas/{id}/deposito
```

### Dashboard
```
GET /api/dashboard/resumo         → Resumo mensal + saldos
GET /api/dashboard/evolucao       → Evolução mensal (últimos N meses)
GET /api/dashboard/por-categoria  → Despesas por categoria
GET /api/dashboard/fluxo-caixa    → Projeção de fluxo (30/60/90 dias)
```

> Todos os endpoints (exceto `/auth/**`) exigem header `Authorization: Bearer <token>`.

---

## 🔒 Segurança

- Senhas armazenadas com **BCrypt**
- JWT com expiração configurável via `application.properties`
- Cada endpoint valida que o recurso pertence ao usuário autenticado (sem vazamento entre contas)
- Spring Security com `OncePerRequestFilter` para interceptação stateless

---

## 🤖 Metodologia de Desenvolvimento

Este projeto foi desenvolvido em regime de **pair programming com IA** (Claude Code — Anthropic), utilizando o agente como:

- Arquitetura e design de entidades JPA
- Implementação de filtros dinâmicos com `JpaSpecificationExecutor`
- Configuração de segurança Spring Security + JWT
- Componentização React com Context API
- Debugging e refatoração (ex: extração de inner enums para resolver `ClassNotFoundException` no Hibernate 7)
- Docker multi-stage build

---

## 📄 Licença

MIT — livre para uso, estudo e modificação.
