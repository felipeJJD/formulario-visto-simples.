# Formulário de Visto Simplificado

Aplicação web para coleta de dados de formulário de visto, com uma interface simplificada e otimizada para ser facilmente implantada no Railway.

## Tecnologias Utilizadas

- **Backend**: Node.js + Express
- **Frontend**: HTML, CSS, JavaScript simples e Bootstrap
- **Banco de Dados**: PostgreSQL

## Estrutura do Projeto

```
├── public/              # Arquivos estáticos (HTML, CSS, JavaScript)
│   ├── index.html       # Formulário principal
│   ├── styles.css       # Estilos personalizados
│   └── main.js          # Lógica do formulário
├── .env.example         # Exemplo de configuração de variáveis de ambiente
├── .gitignore           # Arquivos ignorados pelo Git
├── Dockerfile           # Configurações para deploy em container
├── index.js             # Arquivo principal do servidor Express
├── package.json         # Dependências e scripts
└── README.md            # Este arquivo
```

## Como Executar Localmente

1. Instalar dependências:
   ```
   npm install
   ```

2. Configurar variáveis de ambiente:
   ```
   cp .env.example .env
   ```
   Edite o arquivo `.env` com suas configurações do banco de dados PostgreSQL.

3. Iniciar o servidor:
   ```
   npm start
   ```

4. Acesse o formulário em: http://localhost:3000

## Deploy no Railway

1. Crie um projeto no Railway e conecte-o ao seu repositório GitHub

2. Configure as variáveis de ambiente no Railway:
   - `DB_HOST`: Host do banco de dados PostgreSQL
   - `DB_PORT`: Porta do banco de dados (geralmente 5432)
   - `DB_NAME`: Nome do banco de dados
   - `DB_USER`: Usuário do banco de dados
   - `DB_PASSWORD`: Senha do banco de dados
   - `NODE_ENV`: production

3. O Railway detectará automaticamente o Dockerfile e realizará o deploy.

## Estrutura da Tabela do Banco de Dados

A aplicação espera que exista uma tabela chamada `tabela_viagem` no banco de dados, com as colunas necessárias para armazenar os dados do formulário.
