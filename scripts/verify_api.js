const app = require("../app");
const http = require("http");
const axios = require("axios");
const User = require("../models/User");

const PORT = 3333;
const TEST_PHONE = "0712345678";
const TEST_PASS = "TestPass123";
const API_URL = `http://localhost:${PORT}/api/v1`;

// Set env vars for local connection to docker postgres
process.env.DB_HOST = "127.0.0.1";
process.env.DB_USER = "root";
process.env.DB_PASSWORD = "root";
process.env.DB_NAME = "sacco";
process.env.JWT_SECRET = "test_secret";

async function verifyAPI() {
  let server;
  try {
    console.log("Starting verification server...");
    server = http.createServer(app);

    await new Promise((resolve) => server.listen(PORT, resolve));
    console.log(`Server running on port ${PORT}`);

    // 1. Ensure test user exists
    let user;
    try {
      user = await User.findByPhoneNumber(TEST_PHONE);
      if (!user) {
        console.log("Creating test user...");
        user = await User.create({
          full_name: "Test Mobile User",
          email: "testmobile@example.com",
          phone_number: TEST_PHONE,
          password: TEST_PASS,
          role: "member",
        });
        await User.markRegistrationPaid(user.id);
        await User.activate(user.id);
        console.log("Test user created and activated.");
      } else {
        // ensure active
        await User.activate(user.id);
        console.log("Test user already exists.");
      }
    } catch (dbErr) {
      console.error("Database connection failed:", dbErr.message);
      // Print hint about DB credentials
      console.log(
        "HINT: Check if credentials root/root are correct for the running Postgres container."
      );
      process.exit(1);
    }

    // 2. Test Login
    console.log("\n--- Testing POST /auth/login ---");
    try {
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        phone_number: TEST_PHONE,
        password: TEST_PASS,
      });
      console.log("✅ Login Successful");
      const token = loginRes.data.token;
      console.log("Token received:", token.substring(0, 20) + "...");

      // 3. Test Dashboard
      console.log("\n--- Testing GET /members/dashboard ---");
      try {
        const dashRes = await axios.get(`${API_URL}/members/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("✅ Dashboard Data Received");
        if (
          dashRes.data.success &&
          dashRes.data.data.user.phone_number === TEST_PHONE
        ) {
          console.log("✅ Data validation successful: Phone number matches");
        } else {
          console.error("❌ Data validation failed:", dashRes.data);
        }
      } catch (dashErr) {
        console.error(
          "❌ Dashboard request failed:",
          dashErr.response ? dashErr.response.data : dashErr.message
        );
      }
    } catch (loginErr) {
      console.error(
        "❌ Login failed:",
        loginErr.response ? loginErr.response.data : loginErr.message
      );
    }
  } catch (error) {
    console.error("Verification script error:", error);
  } finally {
    if (server) {
      server.close();
      console.log("\nServer closed.");
    }
    process.exit(0);
  }
}

verifyAPI();
