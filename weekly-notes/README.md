# 创新组周刊 - MySQL数据库集成部署指南

## 项目概述

创新组周刊项目已成功集成MySQL数据库存储功能。系统现在可以将周刊数据持久化存储到MySQL数据库中，实现数据的可靠存储和跨设备访问。

## 系统架构

- **前端**: HTML + CSS + JavaScript (原生)
- **后端**: Node.js + Express
- **数据库**: MySQL (数据库名: sys)
- **API**: RESTful API

## 数据库设计

### 表结构

1. **weekly_reports** - 周刊主表
   - 存储周刊基本信息（期数、标题、日期、颜色等）
   
2. **weekly_summaries** - 周刊摘要表
   - 存储每个周刊的摘要要点
   
3. **weekly_sections** - 周刊详细板块表
   - 存储周刊的详细内容板块
   
4. **weekly_section_items** - 周刊详细内容表
   - 存储每个板块的具体内容条目

## 部署步骤

### 1. 数据库准备

#### 1.1 创建数据库
```sql
CREATE DATABASE sys CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 1.2 执行表结构脚本
```bash
mysql -u root -p sys < database/schema.sql
```

或者直接在MySQL客户端中执行 `database/schema.sql` 文件中的SQL语句。

### 2. 后端服务部署

#### 2.1 安装依赖
```bash
cd backend
npm install
```

#### 2.2 配置环境变量
复制 `.env.example` 文件为 `.env` 并修改数据库配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=sys
DB_PORT=3306

PORT=3000
```

#### 2.3 启动后端服务
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

后端服务将在 `http://localhost:3000` 启动。

### 3. 前端部署

#### 3.1 直接使用
直接在浏览器中打开 `index.html` 文件即可使用。

#### 3.2 使用本地服务器（推荐）
```bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js http-server
npx http-server -p 8000
```

然后在浏览器中访问 `http://localhost:8000`

## API 接口文档

### 基础URL
```
http://localhost:3000/api/weekly
```

### 接口列表

#### 1. 获取所有周刊
```
GET /api/weekly
```

**响应示例：**
```json
[
  {
    "issue": 1,
    "title": "第1期 · 启航",
    "date": "2026-06-01",
    "summary": ["团队组建完成，确定分工"],
    "detail": {
      "sections": [
        {
          "title": "🚀 本周进展",
          "items": ["团队组建完成，确定分工与职责"]
        }
      ]
    },
    "color": "yellow",
    "pinColor": "red",
    "rotate": -2
  }
]
```

#### 2. 获取单个周刊
```
GET /api/weekly/:issue
```

#### 3. 创建周刊
```
POST /api/weekly
Content-Type: application/json

{
  "issue": 7,
  "title": "第7期 · 新篇章",
  "date": "2026-07-13",
  "summary": ["摘要1", "摘要2"],
  "detail": {
    "sections": [
      {
        "title": "🚀 本周进展",
        "items": ["进展1", "进展2"]
      }
    ]
  },
  "color": "blue",
  "pinColor": "green",
  "rotate": 1.5
}
```

#### 4. 更新周刊
```
PUT /api/weekly/:issue
Content-Type: application/json

{
  "title": "第1期 · 启航（更新）",
  "date": "2026-06-01",
  "summary": ["更新后的摘要"],
  "detail": {
    "sections": [
      {
        "title": "🚀 本周进展",
        "items": ["更新后的进展"]
      }
    ]
  },
  "color": "green",
  "pinColor": "blue",
  "rotate": 0
}
```

#### 5. 删除周刊
```
DELETE /api/weekly/:issue
```

## 数据同步机制

### 工作原理

1. **加载数据**: 
   - 优先从API获取数据
   - 如果API失败，从localStorage读取
   - 如果localStorage也没有数据，使用默认数据

2. **保存数据**:
   - 同时保存到localStorage和数据库
   - localStorage作为备份，确保数据不丢失
   - 数据库作为主要存储，支持跨设备访问

3. **错误处理**:
   - 网络错误时自动降级到本地存储
   - 提供用户友好的错误提示

## 功能特性

### 已实现功能

✅ 周刊数据的增删改查
✅ MySQL数据库持久化存储
✅ RESTful API接口
✅ 数据库表结构设计
✅ 前后端数据同步
✅ 错误处理和降级机制
✅ localStorage备份机制

### 数据完整性

- 使用数据库事务确保数据一致性
- 外键约束保证数据关联完整性
- 级联删除确保数据清理

## 故障排查

### 常见问题

#### 1. 数据库连接失败
**症状**: 后端启动时报错 "数据库连接失败"

**解决方案**:
- 检查MySQL服务是否启动
- 验证 `.env` 文件中的数据库配置
- 确认数据库用户权限

#### 2. API请求失败
**症状**: 前端无法加载数据

**解决方案**:
- 确认后端服务正在运行
- 检查浏览器控制台的网络请求
- 验证API地址配置是否正确

#### 3. 跨域问题
**症状**: 浏览器控制台显示CORS错误

**解决方案**:
- 后端已配置CORS中间件
- 确保前端和后端使用相同的协议（http/https）

## 性能优化

### 数据库优化

- 为常用查询字段添加索引
- 使用连接池管理数据库连接
- 批量操作减少数据库往返

### 前端优化

- 异步数据加载
- 本地缓存机制
- 错误降级处理

## 安全建议

1. **数据库安全**
   - 使用强密码
   - 限制数据库用户权限
   - 定期备份数据

2. **API安全**
   - 添加身份验证
   - 实现请求限流
   - 输入数据验证

3. **数据传输**
   - 使用HTTPS协议
   - 敏感数据加密

## 扩展建议

### 功能扩展

- 添加用户认证和权限管理
- 实现数据导出功能（PDF、Excel）
- 添加搜索和筛选功能
- 支持图片和附件上传
- 添加评论和协作功能

### 技术升级

- 前端框架升级（React/Vue）
- 数据库优化（Redis缓存）
- 容器化部署（Docker）
- CI/CD自动化部署

## 维护指南

### 日常维护

- 定期检查数据库连接状态
- 监控API服务性能
- 备份重要数据
- 更新依赖包版本

### 数据备份

```bash
# 备份数据库
mysqldump -u root -p sys > backup_$(date +%Y%m%d).sql

# 恢复数据库
mysql -u root -p sys < backup_20260612.sql
```

## 技术支持

如有问题，请检查：

1. 浏览器控制台错误信息
2. 后端服务日志
3. 数据库连接状态
4. 网络连接情况

## 更新日志

### v1.0.0 (2026-06-12)
- ✅ 完成MySQL数据库集成
- ✅ 实现RESTful API接口
- ✅ 前后端数据同步
- ✅ 错误处理和降级机制
- ✅ 数据库表结构设计
- ✅ 初始数据迁移