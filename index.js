const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Log de inicialização
console.log('Iniciando servidor simplificado...');
console.log('Variáveis de ambiente:', {
  PORT,
  DB_HOST: process.env.DB_HOST || '(não definido)',
  DB_NAME: process.env.DB_NAME || '(não definido)',
  NODE_ENV: process.env.NODE_ENV || 'development'
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do banco de dados
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production'
});

// Verificar conexão com o banco de dados
pool.connect((err, client, release) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conectado ao banco de dados PostgreSQL');
    release();
  }
});

// Função para adicionar colunas faltantes na tabela
async function addMissingColumns() {
  try {
    console.log('Verificando e adicionando colunas faltantes...');
    
    // Verificar quais colunas já existem
    const checkColumnsQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tabela_viagem'
    `;
    const result = await pool.query(checkColumnsQuery);
    
    const existingColumns = result.rows.map(row => row.column_name);
    console.log('Colunas existentes:', existingColumns);
    
    // Novas colunas a serem adicionadas se não existirem
    const columnsToAdd = [
      { name: 'sponsor_nome', type: 'TEXT' },
      { name: 'sponsor_email', type: 'TEXT' },
      { name: 'sponsor_estado_civil', type: 'TEXT' },
      { name: 'sponsor_telefone', type: 'TEXT' },
      { name: 'sponsor_parentesco', type: 'TEXT' },
      { name: 'sponsor_data_nascimento', type: 'TEXT' },
      { name: 'contato_eua_nome', type: 'TEXT' },
      { name: 'contato_eua_email', type: 'TEXT' },
      { name: 'contato_eua_estado_civil', type: 'TEXT' },
      { name: 'contato_eua_telefone', type: 'TEXT' },
      { name: 'contato_eua_parentesco', type: 'TEXT' },
      { name: 'contato_eua_data_nascimento', type: 'TEXT' },
      { name: 'outros_paises_visitados', type: 'TEXT' }
    ];
    
    // Adicionar colunas que não existem
    for (const column of columnsToAdd) {
      if (!existingColumns.includes(column.name)) {
        console.log(`Adicionando coluna: ${column.name} (${column.type})`);
        await pool.query(`
          ALTER TABLE tabela_viagem 
          ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}
        `);
      } else {
        console.log(`Coluna ${column.name} já existe.`);
      }
    }
    
    console.log('Verificação de colunas concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao verificar/adicionar colunas:', error);
  }
}

// Executar a verificação de colunas na inicialização
addMissingColumns();

// Rota de healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Função para formatar data no formato YYYY-MM-DD
function formatarData(dataString) {
  if (!dataString) return null;
  
  // Se já estiver no formato YYYY-MM-DD, retorna a string
  if (/^\d{4}-\d{2}-\d{2}$/.test(dataString)) {
    return dataString;
  }
  
  // Se estiver no formato DD/MM/AAAA, converte para YYYY-MM-DD
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataString)) {
    const [dia, mes, ano] = dataString.split('/');
    return `${ano}-${mes}-${dia}`;
  }
  
  // Se não conseguir converter, retorna null
  return null;
}

// Rota para enviar os dados do formulário
app.post('/api/submit-form', async (req, res) => {
  const formData = req.body;
  
  try {
    console.log('Dados recebidos:', formData);
    
    // Mapeamento dos campos do formulário para as colunas do banco de dados
    const dadosParaInserir = {
      nome: formData.fullName || `${formData.firstName || ''} ${formData.lastName || ''}`.trim(),
      email: formData.email,
      cidade_entrevista: formData.preferredInterviewCity || 'São Paulo',
      data_nascimento: formatarData(formData.birthDate),
      cidade_nascimento: formData.birthPlace ? formData.birthPlace.split(',')[0]?.trim() : null,
      estado_nascimento: formData.birthPlace ? formData.birthPlace.split(',')[1]?.trim() : null,
      data_viagem: formatarData(formData.arrivalDate),
      dias_viagem: formData.stayDuration,
      local_estadia: formData.hotel || formData.contactAddress,
      custo_viagem: formData.travelPayment === 'Outra pessoa' ? 'outra pessoa' : 'eu',
      outros_viajantes: formData.otherTravelers || 'não',
      visitou_eua: formData.previousVisit === 'Sim' ? 'sim' : 'nao',
      visto_emitido: formData.previousVisa === 'Sim' ? 'sim' : 'nao',
      visto_negado: formData.visaDenied === 'Sim' ? 'sim' : 'nao',
      endereco_atual: formData.address,
      bairro: formData.neighborhood || '',
      cep: formData.zipCode,
      cidade: formData.city,
      telefone_celular: formData.primaryPhone,
      rede_social: formData.socialMedia || '',
      numero_passaporte: formData.passportNumber,
      cidade_emissao_passaporte: formData.passportIssuePlace,
      data_emissao: formatarData(formData.passportIssueDate),
      data_vencimento: formatarData(formData.passportExpiryDate),
      cidade_destino_eua: formData.cityToVisit,
      nome_pai: formData.fatherName,
      data_nascimento_pai: formatarData(formData.fatherBirthDate),
      nome_mae: formData.motherName,
      data_nascimento_mae: formatarData(formData.motherBirthDate),
      tem_parente_eua: formData.relativesInUS === 'Sim' ? 'sim' : 'nao',
      estado_civil: formData.maritalStatus || 'Solteiro',
      detalhes_estado_civil: '',
      profissao: formData.currentOccupation,
      empresa_atual: formData.companyName,
      endereco_empresa: formData.companyAddress,
      telefone_empresa: formData.companyPhone,
      data_inicio_trabalho: formatarData(formData.jobStartDate),
      renda_bruta_mensal: formData.monthlyIncome || '',
      descricao_funcoes: formData.jobDescription,
      escola_faculdade: formData.lastSchool,
      endereco_escola_faculdade: formData.schoolAddress,
      curso: formData.course,
      data_inicio_curso: formatarData(formData.courseStartDate),
      data_termino_curso: formatarData(formData.courseEndDate),
      fala_outra_lingua: formData.languages || 'não',
      outros_paises_visitados: formData.countriesVisited5Years || '',
      servico_militar: formData.militaryService || 'nunca',
      ultima_formacao: formData.highestEducation || '',
      sexo: formData.gender || 'M',
      // Novos campos adicionados
      sponsor_nome: formData.sponsorName || '',
      sponsor_email: formData.sponsorEmail || '',
      sponsor_estado_civil: formData.sponsorMaritalStatus || '',
      sponsor_telefone: formData.sponsorPhone || '',
      sponsor_parentesco: formData.sponsorRelationship || '',
      sponsor_data_nascimento: formatarData(formData.sponsorBirthDate),
      contato_eua_nome: formData.usContactName || '',
      contato_eua_email: formData.usContactEmail || '',
      contato_eua_estado_civil: formData.usContactMaritalStatus || '',
      contato_eua_telefone: formData.usContactPhone || '',
      contato_eua_parentesco: formData.usContactRelationship || '',
      contato_eua_data_nascimento: formatarData(formData.usContactBirthDate)
    };
    
    // Filtrar apenas os valores não undefined
    const colunas = Object.keys(dadosParaInserir).filter(key => dadosParaInserir[key] !== undefined);
    const valores = colunas.map(coluna => dadosParaInserir[coluna]);
    const placeholders = colunas.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO tabela_viagem (${colunas.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    // Executar a query
    const result = await pool.query(query, valores);
    
    res.status(201).json({
      success: true,
      message: 'Dados salvos com sucesso!',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao salvar os dados no banco.',
      error: error.message
    });
  }
});

// Rota catch-all para servir o index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// Tratamento de encerramento
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido, encerrando...');
  pool.end();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT recebido, encerrando...');
  pool.end();
  process.exit(0);
});
