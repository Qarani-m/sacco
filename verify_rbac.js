const request = require('supertest');
const app = require('./src/app');
const User = require('./src/models/User');
const db = require('./src/models/db');
const Role = require('./src/models/Role');

async function runVerification() {
    try {
        console.log("🚀 Starting RBAC Verification...");

        // Wait for DB init
        await new Promise(r => setTimeout(r, 2000));

        // Helper to clean up
        const cleanup = async (email) => {
            await db.query("DELETE FROM users WHERE email = $1", [email]);
        };

        // Helper to create user with role
        const createRoleUser = async (name, email, roleNameSnake, roleNameDb) => {
            console.log(`\nCreating ${name}...`);
            await cleanup(email);

            // Get role ID
            const role = await Role.findByName(roleNameDb);
            if (!role) throw new Error(`Role ${roleNameDb} not found`);

            const user = await User.create({
                full_name: name,
                email: email,
                password: 'Password123!',
                phone_number: '0700000000',
                role: roleNameSnake
            });
            await User.assignRole(user.id, role.id);
            await User.activate(user.id); // Ensure active
            return user;
        };

        const roles = [
            { name: 'Finance User', email: 'finance@test.com', role: 'finance', dbRole: 'Finance', url: '/staff/finance/dashboard' },
            { name: 'Risk User', email: 'risk@test.com', role: 'risk', dbRole: 'Risk', url: '/staff/risk/dashboard' },
            { name: 'CS User', email: 'cs@test.com', role: 'customer_service', dbRole: 'Customer Service', url: '/staff/customer-service/dashboard' },
            { name: 'Disbursement User', email: 'disburse@test.com', role: 'disbursement_officer', dbRole: 'Disbursement Officer', url: '/staff/disbursement/dashboard' }
        ];

        for (const r of roles) {
            const user = await createRoleUser(r.name, r.email, r.role, r.dbRole);

            console.log(`Testing Login for ${r.name}...`);

            // 1. Get Login Page for CSRF
            const loginPageRes = await request(app).get('/auth/login');
            const csrfTokenEntry = loginPageRes.text.match(/name="_csrf" value="(.*?)"/);
            const csrfToken = csrfTokenEntry ? csrfTokenEntry[1] : null;

            if (!csrfToken) {
                console.log("⚠️ Could not find CSRF token");
                // Proceed anyway, might fail
            } else {
                // console.log("Got CSRF:", csrfToken);
            }

            // Get cookies from GET request to maintain session/csrf secret
            const initialCookies = loginPageRes.headers['set-cookie'];
            const cookieStr = initialCookies.map(c => c.split(';')[0]).join('; ');

            const loginRes = await request(app)
                .post('/auth/login')
                .set('Cookie', cookieStr)
                .send({
                    email: r.email,
                    password: 'Password123!',
                    _csrf: csrfToken
                });

            // Extract session/token
            const cookies = loginRes.headers['set-cookie'];
            if (!cookies) {
                console.log("❌ Login Failed - No Cookies");
                console.log(loginRes.text);
                throw new Error("Login failed");
            }
            const tokenCookie = cookies.find(c => c.startsWith('token='));
            if (!tokenCookie) {
                console.log("❌ Login Failed - No Token Cookie");
                // Maybe it failed?
                // console.log(loginRes.text);
            }

            // Allow token to be extracted from either initial or new cookies depending on implementation
            // The jwt token is set on login response.
            const token = tokenCookie ? tokenCookie.split(';')[0].split('=')[1] : null;

            // Check Redirection
            if (loginRes.status === 302 && loginRes.header.location.includes(r.url)) {
                console.log(`✅ Redirected correctly to ${r.url}`);
            } else {
                console.log(`❌ Failed redirection. Location: ${loginRes.header.location}`);
            }

            if (!token) continue;

            // Check Access to OWN dashboard
            console.log(`Testing Access to OWN dashboard (${r.url})...`);
            const dashRes = await request(app)
                .get(r.url)
                .set('Cookie', [`token=${token}`]); // CSRF not needed for GET

            if (dashRes.status === 200) {
                console.log(`✅ Access Granted`);
            } else {
                console.log(`❌ Access Failed: ${dashRes.status}`);
            }

            // Check Access to OTHER dashboard (Forbidden)
            const other = roles.find(o => o.role !== r.role);
            console.log(`Testing Access to OTHER dashboard (${other.url})...`);
            const otherRes = await request(app)
                .get(other.url)
                .set('Cookie', [`token=${token}`]);

            if (otherRes.status === 403) {
                console.log(`✅ Access Denied (Correct)`);
            } else if (otherRes.status === 302) {
                console.log(`⚠️ Redirected (Maybe to 403 page or login?) -> ${otherRes.header.location}`);
            } else {
                console.log(`❌ Access NOT Denied: ${otherRes.status}`);
            }
        }

        console.log("\n✅ Verification Complete");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

runVerification();
