# 💰 FinancePro - Gerenciador de Finanças Full-Stack

Este é um ecossistema completo de gestão financeira pessoal robusto, escalável e seguro. O projeto foi concebido e implementado como uma iniciativa de **desenvolvimento pessoal e aprofundamento técnico**, com o objetivo de consolidar competências em engenharia de software full-stack, design de arquiteturas seguras e automação de fluxos de dados.

Durante o ciclo de desenvolvimento, foi adotada uma abordagem de vanguarda através do modelo de **Pair Programming com um Agente de Inteligência Artificial (IA)**, atuando ativamente no auxílio da codificação, refatoração arquitetural, mentoria técnica e otimização de segurança da aplicação.

---

## 🚀 Diferenciais e Inovações Técnicas

Diferente de soluções de controle financeiro triviais, o **FinancePro** engloba práticas arquiteturais avançadas exigidas no mercado corporativo atual:

* **Autenticação Stateless com JWT:** Implementação de segurança robusta utilizando Tokens JWT (*JSON Web Tokens*) com tempo de expiração, eliminando o armazenamento de sessões no servidor e garantindo alta escalabilidade.
* **Isolamento de Dados em Nível de Banco (Multi-User):** Arquitetura que garante a rastreabilidade e a privacidade das informações. Cada transação é vinculada de forma relacional (relacionamento `@ManyToOne` via JPA/Hibernate) a um usuário específico. O backend extrai a identidade diretamente do token seguro, impossibilitando o vazamento de dados entre contas distintas.
* **Interface Minimalista e Foco em UX:** Design centralizado na usabilidade (*User Experience*), com uma barra lateral em *Dark Theme* de alto contraste e área de trabalho limpa, minimizando a fadiga visual e organizando o fluxo de informação com o uso semântico de emojis.
* **Segurança Criptográfica Extrema:** Utilização do algoritmo `BCryptPasswordEncoder` do Spring Security, garantindo que as senhas dos usuários jamais sejam salvas em texto puro no banco de dados.

---

## 🛠️ Stack Tecnológica

### **Back-end (API REST)**
* **Java 17** como linguagem principal.
* **Spring Boot 3** para orquestração da aplicação.
* **Spring Security** + **Java JWT (io.jsonwebtoken)** para controle de acesso.
* **Spring Data JPA / Hibernate** para persistência e abstração de dados.
* **PostgreSQL** como sistema de gerenciamento de banco de dados relacional.

### **Front-end (Single Page Application)**
* **React** com ecossistema baseado em componentes reaproveitáveis.
* **Vite** como ferramenta de build e ambiente de desenvolvimento rápido.
* **React Router DOM** para gerenciamento de rotas públicas e leões de chácara de rotas protegidas.
* **Vanilla CSS** para estilização personalizada, flexbox e estruturação responsiva.

---

## ⚙️ Instruções de Uso e Execução Local

### **1. Pré-requisitos Mínimos**
* Java JDK 17 ou superior.
* Node.js instalado (versão LTS).
* Instância ativa do PostgreSQL.
* Git para clonagem.

### **2. Configuração do Banco de Dados**
1.  Acesse o seu gerenciador do PostgreSQL (ex: pgAdmin).
2.  Crie um banco de dados vazio chamado `financas_backend`.
3.  Abra o arquivo do Back-end `src/main/resources/application.properties` e insira as suas credenciais locais do PostgreSQL:
    ```properties
    spring.datasource.username=seu_usuario
    spring.datasource.password=sua_senha
    ```

### **3. Inicialização do Back-end (Java)**
1.  Navegue até o diretório do projeto back-end via terminal:
    ```bash
    cd financas-backend
    ```
2.  Execute o comando para rodar a aplicação através do Maven wrapper:
    * **Windows:** `.\mvnw.cmd spring-boot:run`
    * **Linux/Mac:** `./mvnw spring-boot:run`
3.  A API será inicializada na porta `8080`. O Hibernate executará a criação automática de tabelas e injeção do usuário inicial no primeiro boot.

### **4. Inicialização do Front-end (React)**
1.  Abra um novo terminal e navegue até a pasta do front-end:
    ```bash
    cd financas-frontend
    ```
2.  Instale as dependências listadas no `package.json`:
    ```bash
    npm install
    ```
3.  Inicie o servidor local de desenvolvimento:
    ```bash
    npm run dev
    ```
4.  Abra o seu navegador e acesse a URL gerada pelo Vite (padrão: `http://localhost:5173`).

---

## 🔑 Credenciais de Teste Homologadas

A aplicação conta com um fluxo de cadastro de novos usuários totalmente funcional com validações de senhas na interface, mas para agilizar a primeira avaliação, uma conta administradora é populada de forma automática pelo sistema:

* **Usuário de Teste:** `admin_lucas`
* **Senha de Teste:** `Projeto@2026`

---

## 🤖 Desenvolvimento Orientado por IA

Este repositório destaca-se também pelo método de desenvolvimento. A codificação foi realizada em regime de co-criação com um **Agente de Inteligência Artificial**. A ferramenta foi utilizada de forma estratégica como aceleradora de produtividade, atuando em:
1.  Arquitetura estrutural e configuração dos filtros de interceptação invisível do Spring Security (`OncePerRequestFilter`).
2.  Otimização de rotas protegidas e controle do estado de autenticação global no React através de tokens em `localStorage`.
3.  Apoio em análises de Code Review e correção de falhas de CORS durante a integração ponta a ponta.
