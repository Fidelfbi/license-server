const express = require('express');
const app = express();
app.use(express.json());

// Your secret salt (MUST match your indicator)
const SECRET_SALT = "UATB_V4_SECURE_SALT_2024";

// Generate license key for a customer account
function generateLicenseKey(accountNumber) {
    const combined = accountNumber + SECRET_SALT;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        hash += combined.charCodeAt(i);
        hash = hash * 31;
    }
    let hashHex = Math.abs(hash).toString(16);
    while (hashHex.length < 12) hashHex = "0" + hashHex;
    if (hashHex.length > 12) hashHex = hashHex.substring(0, 12);
    
    return hashHex.substring(0,4) + "-" + 
           hashHex.substring(4,8) + "-" + 
           hashHex.substring(8,12);
}

// API endpoint to generate license (POST)
app.post('/api/generate', (req, res) => {
    const { account, email } = req.body;
    if (!account) {
        return res.status(400).json({ error: 'Account number required' });
    }
    const licenseKey = generateLicenseKey(account);
    res.json({ 
        license_key: licenseKey.toUpperCase(),
        account: account,
        email: email || '',
        message: 'License generated successfully'
    });
});

// API endpoint to verify license (GET - called by MT5)
app.get('/api/verify', (req, res) => {
    const { license, account } = req.query;
    if (!license || !account) {
        return res.json({ valid: false, message: 'Missing parameters' });
    }
    
    const expectedKey = generateLicenseKey(account);
    if (license.toUpperCase() === expectedKey.toUpperCase()) {
        res.json({ valid: true, message: 'License valid' });
    } else {
        res.json({ valid: false, message: 'Invalid license for this account' });
    }
});

// Home page
app.get('/', (req, res) => {
    res.send(`
        <h1>UATB License Server</h1>
        <p>Server is running!</p>
        <h2>API Endpoints:</h2>
        <ul>
            <li><b>POST /api/generate</b> - Generate license key</li>
            <li><b>GET /api/verify?license=XXXX-XXXX-XXXX&account=12345678</b> - Verify license</li>
        </ul>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`License server running on port ${PORT}`);
});
