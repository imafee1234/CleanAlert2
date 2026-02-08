import { Platform } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
export const BASE_URL = "http://192.168.185.236:5000";

export const registerUser = async (data) => {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const loginUser = async (data) => {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    
    // This parses the response so your Login.tsx can read 'res.success'
    const result = await res.json();
    
    if (result.success) {
      await AsyncStorage.setItem('user', JSON.stringify(result.user));
    }
    
    return result; 
  } catch (error) {
    return { success: false, message: "Network Error" };
  }
};

export const getReports = async (userId) => {
  try {
    const res = await fetch(`${BASE_URL}/api/reports?userId=${userId}`);
    const json = await res.json();
    return json; // This returns { success: true, data: [...] }
  } catch (error) {
    console.error("Fetch error:", error);
    return { success: false, data: [] };
  }
};

export const createReport = async (data) => {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("location", data.location);
  formData.append("user_id", data.userId);

  if (data.image) {
    const filename = data.image.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '');
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append("image", {
      uri: Platform.OS === "android" ? data.image : data.image.replace("file://", ""),
      name: filename || "upload.jpg",
      type: type,
    });
  }

  const res = await fetch(`${BASE_URL}/api/reports`, {
    method: "POST",
    body: formData,
    headers: {
      "Accept": "application/json",
    },
  });
  return res.json();
};

export const getUserReports = async (userId) => {
  try {
    const res = await fetch(`${BASE_URL}/api/reports/user/${userId}`);
    return await res.json();
  } catch (error) {
    return { success: false, data: [] };
  }
};

export const getLeaderboard = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/reports/leaderboard`);
    return await res.json();
  } catch (error) {
    return { success: false, data: [] };
  }
};

export const toggleLike = async (userId, reportId) => {
  const res = await fetch(`${BASE_URL}/api/reports/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, report_id: reportId }),
  });
  return res.json();
};