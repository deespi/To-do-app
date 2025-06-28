require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection setup
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'todoapp',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

// Database initizalization
const initializeDatabase = async () => {
    try {
        console.log('🔄 Inicjalizacja bazy danych...');
        console.log(`📡 Łączenie z bazą: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
        console.log(`👤 Użytkownik: ${process.env.DB_USER}`);
        
        const initSQL = fs.readFileSync(
            path.join(__dirname, 'init.sql'), 
            'utf8'
        );
        
        await pool.query(initSQL);
        console.log('✅ Baza danych została zainicjalizowana pomyślnie!');
    } catch (error) {
        console.error('❌ Błąd podczas inicjalizacji bazy danych:', error.message);
        console.log('\n🔧 Sprawdź:');
        console.log('1. Czy PostgreSQL jest uruchomiony');
        console.log('2. Czy hasło w pliku .env jest prawidłowe');
        console.log('3. Czy baza "todoapp" istnieje');
        throw error;
    }
};

// Connection test
const testConnection = async () => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        console.log('✅ Połączenie z bazą danych działa!', result.rows[0]);
        return true;
    } catch (error) {
        console.error('❌ Błąd połączenia z bazą danych:', error.message);
        return false;
    }
};

// Shutdown
process.on('SIGINT', () => {
    console.log('🔄 Zamykanie połączenia z bazą danych...');
    pool.end(() => {
        console.log('✅ Połączenie z bazą danych zamknięte.');
        process.exit(0);
    });
});

module.exports = {
    pool,
    initializeDatabase,
    testConnection
};