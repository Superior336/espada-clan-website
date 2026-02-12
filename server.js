require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'applications.json');
const RANKS_FILE = path.join(__dirname, 'ranks.json');
const SERVICES_FILE = path.join(__dirname, 'services.json');

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
};

// Active admin sessions (token -> expiry timestamp)
const activeSessions = new Map();

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Function to send email notification
async function sendEmailNotification(formData) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: `🔥 New Espada Application - ${formData.name}`,
        html: `
            <div style="background: #0f0f0f; color: #fff; padding: 20px; font-family: Arial, sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; background: #1a0000; padding: 30px; border-radius: 10px; border: 2px solid #DC143C;">
                    <h2 style="color: #DC143C; text-align: center;">🔥 New Espada Application</h2>
                    <div style="margin: 15px 0; padding: 10px; background: #050000; border-left: 3px solid #DC143C;">
                        <div style="color: #DC143C; font-weight: bold;">Applicant:</div>
                        <div style="color: #d1d1d1; margin-top: 5px;">${formData.name}</div>
                    </div>
                    <div style="margin: 15px 0; padding: 10px; background: #050000; border-left: 3px solid #DC143C;">
                        <div style="color: #DC143C; font-weight: bold;">Age:</div>
                        <div style="color: #d1d1d1; margin-top: 5px;">${formData.age}</div>
                    </div>
                    <div style="margin: 15px 0; padding: 10px; background: #050000; border-left: 3px solid #DC143C;">
                        <div style="color: #DC143C; font-weight: bold;">Discord ID:</div>
                        <div style="color: #d1d1d1; margin-top: 5px;">${formData.discord}</div>
                    </div>
                    <div style="margin: 15px 0; padding: 10px; background: #050000; border-left: 3px solid #DC143C;">
                        <div style="color: #DC143C; font-weight: bold;">Experience:</div>
                        <div style="color: #d1d1d1; margin-top: 5px;">${formData.experience}</div>
                    </div>
                    <div style="margin: 15px 0; padding: 10px; background: #050000; border-left: 3px solid #DC143C;">
                        <div style="color: #DC143C; font-weight: bold;">Reason:</div>
                        <div style="color: #d1d1d1; margin-top: 5px;">${formData.reason}</div>
                    </div>
                    <hr style="border-color: #333; margin: 20px 0;">
                    <div style="background: #DC143C; color: #000; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold;">
                        📍 IP Address: ${formData.ip}
                    </div>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${process.env.EMAIL_USER} for applicant ${formData.name}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

// Helper: read JSON body from request
function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try { resolve(JSON.parse(body)); }
            catch (e) { reject(e); }
        });
        req.on('error', reject);
    });
}

// Helper: send JSON response
function sendJSON(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

// Helper: validate admin token from request
function isAuthenticated(req) {
    const auth = req.headers['authorization'] || '';
    const token = auth.replace('Bearer ', '');
    if (!token) return false;
    const session = activeSessions.get(token);
    if (!session) return false;
    if (Date.now() > session.expiry) {
        activeSessions.delete(token);
        return false;
    }
    return true;
}

// Helper: read JSON file safely
function readJSONFile(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        return [];
    }
}

const server = http.createServer(async (req, res) => {
    console.log(`${req.method} ${req.url}`);

    // --- API ROUTES ---

    // Login
    if (req.method === 'POST' && req.url === '/api/login') {
        try {
            const data = await readBody(req);
            if (data.password === process.env.ADMIN_PASSWORD) {
                const token = crypto.randomBytes(32).toString('hex');
                activeSessions.set(token, { expiry: Date.now() + 24 * 60 * 60 * 1000 }); // 24h
                sendJSON(res, 200, { success: true, token });
            } else {
                sendJSON(res, 401, { success: false, message: 'Invalid password' });
            }
        } catch (e) {
            sendJSON(res, 400, { success: false, message: 'Invalid request' });
        }
        return;
    }

    // Logout
    if (req.method === 'POST' && req.url === '/api/logout') {
        const auth = req.headers['authorization'] || '';
        const token = auth.replace('Bearer ', '');
        activeSessions.delete(token);
        sendJSON(res, 200, { success: true });
        return;
    }

    // GET ranks (public)
    if (req.method === 'GET' && req.url === '/api/ranks') {
        const ranks = readJSONFile(RANKS_FILE);
        sendJSON(res, 200, ranks);
        return;
    }

    // GET services (public)
    if (req.method === 'GET' && req.url === '/api/services') {
        const services = readJSONFile(SERVICES_FILE);
        sendJSON(res, 200, services);
        return;
    }

    // POST ranks (admin only)
    if (req.method === 'POST' && req.url === '/api/ranks') {
        if (!isAuthenticated(req)) {
            sendJSON(res, 401, { success: false, message: 'Unauthorized' });
            return;
        }
        try {
            const data = await readBody(req);
            fs.writeFileSync(RANKS_FILE, JSON.stringify(data, null, 2), 'utf8');
            console.log('Ranks updated by admin');
            sendJSON(res, 200, { success: true, message: 'Ranks updated' });
        } catch (e) {
            sendJSON(res, 400, { success: false, message: 'Invalid data' });
        }
        return;
    }

    // POST services (admin only)
    if (req.method === 'POST' && req.url === '/api/services') {
        if (!isAuthenticated(req)) {
            sendJSON(res, 401, { success: false, message: 'Unauthorized' });
            return;
        }
        try {
            const data = await readBody(req);
            fs.writeFileSync(SERVICES_FILE, JSON.stringify(data, null, 2), 'utf8');
            console.log('Services updated by admin');
            sendJSON(res, 200, { success: true, message: 'Services updated' });
        } catch (e) {
            sendJSON(res, 400, { success: false, message: 'Invalid data' });
        }
        return;
    }

    // Submit application
    if (req.method === 'POST' && req.url === '/submit-application') {
        try {
            const data = await readBody(req);
            data.timestamp = new Date().toISOString();

            let applications = [];
            if (fs.existsSync(DATA_FILE)) {
                try {
                    applications = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
                } catch (e) { applications = []; }
            }
            applications.push(data);
            fs.writeFileSync(DATA_FILE, JSON.stringify(applications, null, 2));

            const emailSent = await sendEmailNotification(data);

            if (emailSent) {
                sendJSON(res, 200, { success: true, message: 'Application submitted!' });
            } else {
                sendJSON(res, 500, { success: false, message: 'Email failed to send.' });
            }
        } catch (error) {
            console.error("Error processing submission:", error);
            sendJSON(res, 500, { success: false, message: 'Internal Server Error' });
        }
        return;
    }

    // --- STATIC FILE SERVING ---
    let filePath = '.' + req.url;
    if (filePath === './' || filePath === './index.html') {
        filePath = './main.html';
    }

    const extname = path.extname(filePath);
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end('500 Internal Server Error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Admin password: ${process.env.ADMIN_PASSWORD}`);
});
