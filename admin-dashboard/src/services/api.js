// 1. Keep the BASE_URL clean (Server only)
const BASE_URL = "http://192.168.185.236:5000";

export const getReports = async () => {
  // 2. Point to the specific route
  const response = await fetch(`${BASE_URL}/api/reports?t=${new Date().getTime()}`);
  return response.json();
};

export const getAdminStats = async () => {
  // 3. Point to the admin stats route we just fixed in the backend
  const response = await fetch(`${BASE_URL}/api/reports/admin/stats`);
  return response.json();
};

export const resolveReport = async (id, message) => {
  // 4. Point to the resolution route and include the message body
  const response = await fetch(`${BASE_URL}/api/reports/resolve/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ admin_message: message }),
  });
  return response.json();
};