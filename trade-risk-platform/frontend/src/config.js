// config.js - API地址配置文件

// 判断是开发环境还是生产环境
const isDev = window.location.hostname === 'localhost' || 
              window.location.hostname === '127.0.0.1';

// 开发环境用本地后端，生产环境用 Render 后端
export const API_BASE_URL = isDev 
  ? "http://127.0.0.1:8000" 
  : "https://trade-risk-platform.onrender.com";  // 部署后改成实际地址
