<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-grid">
        <!-- About Section -->
        <div>
          <h3 class="footer-heading">SACCO PORTAL</h3>
          <p class="footer-text">
            Empowering members through savings, shares, and mutual support. Building financial futures together.
          </p>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="footer-heading">Quick Links</h3>
          <ul class="footer-links">
            <li><router-link to="/dashboard" class="footer-link">Dashboard</router-link></li>
            <li><router-link to="/shares" class="footer-link">My Shares</router-link></li>
            <li><router-link to="/loans" class="footer-link">My Loans</router-link></li>
            <li><router-link to="/welfare" class="footer-link">Welfare</router-link></li>
            <li><router-link to="/guarantors/requests" class="footer-link">Guarantor Requests</router-link></li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <h3 class="footer-heading">Support</h3>
          <ul class="footer-links">
            <li><router-link to="/messages" class="footer-link">Contact Admin</router-link></li>
            <li><router-link to="/media/profile" class="footer-link">My Profile</router-link></li>
            <li><router-link to="/notifications" class="footer-link">Notifications</router-link></li>
            <li><router-link to="/savings" class="footer-link">Savings Report</router-link></li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div>
          <h3 class="footer-heading">Contact</h3>
          <ul class="footer-links">
            <li>
              <p class="footer-text">
                <strong>Email:</strong><br>
                support@sacco.com
              </p>
            </li>
            <li>
              <p class="footer-text">
                <strong>Phone:</strong><br>
                +254 700 000 000
              </p>
            </li>
            <li>
              <p class="footer-text">
                <strong>Hours:</strong><br>
                Mon-Fri: 8AM - 5PM
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: 4rem;
  border-top: 1px solid #E5E5E5;
  background: #FAFAFA;
}

.footer-container {
  max-width: 1536px;
  margin: 0 auto;
  padding: 3rem 2rem 2rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
}

@media (max-width: 1024px) {
  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .footer-grid {
    grid-template-columns: 1fr;
  }
}

.footer-heading {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1rem;
  color: #000000;
}

.footer-text {
  color: #6B7280;
  font-size: 0.875rem;
  line-height: 1.6;
  margin: 0;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.5rem;
}

.footer-link {
  color: #6B7280;
  font-size: 0.875rem;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #000000;
}
</style>
