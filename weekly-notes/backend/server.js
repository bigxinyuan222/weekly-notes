const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const weeklyRoutes = require('./routes/weekly');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 提供前端静态文件服务
app.use(express.static(path.join(__dirname, '..')));

// 处理favicon.ico请求
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// 路由
app.use('/api/weekly', weeklyRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`创新组周刊API服务运行在 http://localhost:${PORT}`);
  console.log(`局域网访问地址: http://192.168.21.7:${PORT}`);
  console.log(`前端页面: http://192.168.21.7:${PORT}/index.html`);
});