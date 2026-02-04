const { Client } = require('pg');

async function createDatabase() {
    const connectionString = 'postgresql://postgres:postgres@localhost:5432/postgres';
    const client = new Client({
        connectionString,
    });

    try {
        await client.connect();
        console.log('Connected to postgres database');

        const dbName = 'riviso';
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);

        if (res.rowCount === 0) {
            console.log(`Database ${dbName} does not exist, creating...`);
            await client.query(`CREATE DATABASE ${dbName}`);
            console.log(`Database ${dbName} created successfully`);
        } else {
            console.log(`Database ${dbName} already exists`);
        }
    } catch (err) {
        console.error('Error creating database:', err.message);
        if (err.message.includes('authentication failed')) {
            console.log('Trying without password...');
            const clientNoPass = new Client({
                host: 'localhost',
                user: 'postgres',
                database: 'postgres'
            });
            try {
                await clientNoPass.connect();
                const res = await clientNoPass.query(`SELECT 1 FROM pg_database WHERE datname = 'riviso'`);
                if (res.rowCount === 0) {
                    await clientNoPass.query(`CREATE DATABASE riviso`);
                    console.log('Database riviso created successfully');
                } else {
                    console.log('Database riviso already exists');
                }
                await clientNoPass.end();
            } catch (err2) {
                console.error('Final attempt failed:', err2.message);
            }
        }
    } finally {
        try {
            await client.end();
        } catch (e) { }
    }
}

createDatabase();
