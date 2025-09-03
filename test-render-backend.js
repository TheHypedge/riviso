const fetch = require('node-fetch');

const BACKEND_URL = 'https://riviso.onrender.com';

async function testBackend() {
    try {
        console.log('Testing Render backend...');
        
        // Test health endpoint
        console.log('\n1. Testing health endpoint...');
        const healthResponse = await fetch(`${BACKEND_URL}/health`);
        const healthData = await healthResponse.json();
        console.log('Health Response:', healthData);
        
        // Test root endpoint
        console.log('\n2. Testing root endpoint...');
        const rootResponse = await fetch(`${BACKEND_URL}/`);
        const rootData = await rootResponse.json();
        console.log('Root Response:', rootData);
        
        // Test list audits
        console.log('\n3. Testing list audits...');
        const listResponse = await fetch(`${BACKEND_URL}/audits/`);
        const listData = await listResponse.json();
        console.log('List Audits Response:', listData);
        
        // Test create audit
        console.log('\n4. Testing create audit...');
        const createResponse = await fetch(`${BACKEND_URL}/audits/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: 'https://example.com' }),
        });
        const createData = await createResponse.json();
        console.log('Create Audit Response:', createData);
        
        // Test get specific audit
        if (createData.id) {
            console.log('\n5. Testing get specific audit...');
            const getResponse = await fetch(`${BACKEND_URL}/audits/${createData.id}`);
            const getData = await getResponse.json();
            console.log('Get Audit Response:', getData);
        }
        
    } catch (error) {
        console.error('Error testing backend:', error);
    }
}

testBackend();
