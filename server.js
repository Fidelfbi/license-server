const express = require('express');
const app = express();
app.use(express.json());

// !!! IMPORTANT: Change this secret to something random and keep it safe !!!
const SECRET_SALT = "FridkAi_UATB_V4.0_DREAMFIT_2026_427AM";

// Function to generate a license key
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
    
    return (hashHex.substring(0,4) + "-" + 
            hashHex.substring(4,8) + "-" + 
            hashHex.substring(8,12)).toUpperCase();
}

// API endpoint to generate a new license (for you to use)
app.post('/api/generate', (req, res) => {
    const { account, email } = req.body;
    if (!account) {
        return res.status(400).json({ error: 'Account number required' });
    }
    const licenseKey = generateLicenseKey(account);
    res.json({ 
        license_key: licenseKey,
        account: account,
        email: email || ''
    });
});

// API endpoint to verify a license (called by your MT5 indicator)
app.get('/api/verify', (req, res) => {
    const { license, account } = req.query;
    if (!license || !account) {
        return res.json({ valid: false, message: 'Missing license or account' });
    }
    
    const expectedKey = generateLicenseKey(account);
    if (license.toUpperCase() === expectedKey.toUpperCase()) {
        res.json({ valid: true, message: 'License is valid' });
    } else {
        res.json({ valid: false, message: 'Invalid license for this account' });
    }
});

// Home page
app.get('/', (req, res) => {
    res.send(`
        <h1>UATB License Server</h1>
        <p>Server is running correctly!</p>
        <h2>API Endpoints:</h2>
        <ul>
            <li><b>GET /api/verify?license=XXXX-XXXX-XXXX&account=12345678</b> - Verify a license</li>
            <li><b>POST /api/generate</b> - Generate a new license</li>
        </ul>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`License server running on port ${PORT}`);
});
