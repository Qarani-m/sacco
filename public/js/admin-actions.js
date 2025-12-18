// Admin Pending Actions Handling

function getCsrfToken() {
  // Try to get token from meta tag
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute("content") : "";
}

async function verifyAction(actionId, decision) {
  if (!confirm(`Are you sure you want to ${decision} this action?`)) {
    return;
  }

  try {
    // Construct URL correctly - ensure it matches route definition
    // Route: /admin/action/verify/:actionId
    const url = `/admin/action/verify/${actionId}`;

    // Add CSRF token to query string as fallback or for safety
    const token = getCsrfToken();
    const urlWithToken = token
      ? `${url}?_csrf=${encodeURIComponent(token)}`
      : url;

    const response = await fetch(urlWithToken, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Also add to header if possible, though meta tag might be missing
        "CSRF-Token": token,
      },
      body: JSON.stringify({ decision }),
    });

    const data = await response.json();

    if (data.success) {
      alert(data.message);
      window.location.reload();
    } else {
      alert("Error: " + (data.error || "Failed to verify action"));
    }
  } catch (error) {
    console.error("Verify action error:", error);
    alert("Failed to process request. Please check console for details.");
  }
}
