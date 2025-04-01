const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'junction.proxy.rlwy.net',
  port: process.env.DB_PORT || 45593,
  database: process.env.DB_NAME || 'railway',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'wAQlvkvDZLBByYBiAJuumeFFXllzURiX',
  ssl: false
});

async function addMissingColumns() {
  try {
    console.log('Iniciando migração para adicionar colunas faltantes...');
    
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
    
    console.log('Migração concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao executar migração:', error);
  } finally {
    await pool.end();
  }
}

// Executar migração
addMissingColumns();
