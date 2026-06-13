-- 创新组周刊数据库表结构设计
-- 数据库名称: sys

-- 1. 周刊主表
CREATE TABLE IF NOT EXISTS weekly_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    issue INT NOT NULL UNIQUE COMMENT '期数',
    title VARCHAR(255) NOT NULL COMMENT '标题',
    date DATE NOT NULL COMMENT '日期',
    color VARCHAR(20) DEFAULT 'yellow' COMMENT '卡片颜色',
    pin_color VARCHAR(20) DEFAULT 'red' COMMENT '图钉颜色',
    rotate DECIMAL(3,1) DEFAULT 0 COMMENT '旋转角度',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_issue (issue),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='周刊主表';

-- 2. 周刊摘要表
CREATE TABLE IF NOT EXISTS weekly_summaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL COMMENT '关联的周刊ID',
    content TEXT NOT NULL COMMENT '摘要内容',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES weekly_reports(id) ON DELETE CASCADE,
    INDEX idx_report_id (report_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='周刊摘要表';

-- 3. 周刊详细板块表
CREATE TABLE IF NOT EXISTS weekly_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL COMMENT '关联的周刊ID',
    title VARCHAR(255) NOT NULL COMMENT '板块标题',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES weekly_reports(id) ON DELETE CASCADE,
    INDEX idx_report_id (report_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='周刊详细板块表';

-- 4. 周刊详细内容表
CREATE TABLE IF NOT EXISTS weekly_section_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_id INT NOT NULL COMMENT '关联的板块ID',
    content TEXT NOT NULL COMMENT '内容条目',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES weekly_sections(id) ON DELETE CASCADE,
    INDEX idx_section_id (section_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='周刊详细内容表';

-- 插入初始数据（从默认数据迁移）
INSERT INTO weekly_reports (issue, title, date, color, pin_color, rotate) VALUES
(1, '第1期 · 启航', '2026-06-01', 'yellow', 'red', -2.0),
(2, '第2期 · 筑基', '2026-06-08', 'blue', 'blue', 1.5),
(3, '第3期 · 破土', '2026-06-15', 'green', 'green', -1.0),
(4, '第4期 · 生长', '2026-06-22', 'pink', 'yellow', 2.0),
(5, '第5期 · 绽放', '2026-06-29', 'orange', 'white', -1.5),
(6, '第6期 · 远航', '2026-07-06', 'purple', 'red', 1.0);

-- 插入第1期摘要
INSERT INTO weekly_summaries (report_id, content, sort_order) VALUES
(1, '团队组建完成，确定分工', 0),
(1, '完成项目选题与需求分析', 1),
(1, '制定第一阶段开发计划', 2);

-- 插入第2期摘要
INSERT INTO weekly_summaries (report_id, content, sort_order) VALUES
(2, '完成技术栈选型：React + Node.js', 0),
(2, '搭建项目基础架构', 1),
(2, 'UI 原型设计评审通过', 2);

-- 插入第3期摘要
INSERT INTO weekly_summaries (report_id, content, sort_order) VALUES
(3, '首页与导航组件开发完成', 0),
(3, '用户登录/注册功能上线', 1),
(3, 'API 接口设计文档发布', 2);

-- 插入第4期摘要
INSERT INTO weekly_summaries (report_id, content, sort_order) VALUES
(4, '核心业务模块开发进度 70%', 0),
(4, '完成数据库性能优化', 1),
(4, '引入代码审查流程', 2);

-- 插入第5期摘要
INSERT INTO weekly_summaries (report_id, content, sort_order) VALUES
(5, '全部功能模块开发完成', 0),
(5, '内部演示获得积极反馈', 1),
(5, '启动性能优化与 Bug 修复', 2);

-- 插入第6期摘要
INSERT INTO weekly_summaries (report_id, content, sort_order) VALUES
(6, '用户体验优化完成', 0),
(6, '安全审计通过', 1),
(6, '中期答辩准备就绪', 2);

-- 插入第1期详细板块和内容
INSERT INTO weekly_sections (report_id, title, sort_order) VALUES
(1, '🚀 本周进展', 0),
(1, '💡 灵感碰撞', 1),
(1, '📋 下周计划', 2);

INSERT INTO weekly_section_items (section_id, content, sort_order) VALUES
(1, '团队组建完成，确定分工与职责', 0),
(1, '完成项目选题与需求分析文档', 1),
(1, '制定第一阶段开发计划与里程碑', 2),
(2, '头脑风暴收集了 12 个创意方向', 0),
(2, '确定以"智能协作"为核心理念', 1),
(3, '完成技术选型调研', 0),
(3, '搭建项目基础框架', 1),
(3, '设计 UI 原型初稿', 2);

-- 插入第2期详细板块和内容
INSERT INTO weekly_sections (report_id, title, sort_order) VALUES
(2, '🚀 本周进展', 0),
(2, '🔧 技术决策', 1),
(2, '📋 下周计划', 2);

INSERT INTO weekly_section_items (section_id, content, sort_order) VALUES
(4, '完成技术栈选型：前端 React，后端 Node.js', 0),
(4, '搭建项目基础架构与 CI/CD 流程', 1),
(4, 'UI 原型设计评审通过，开始视觉细化', 2),
(5, '选用 TypeScript 提升代码质量', 0),
(5, '采用 Tailwind CSS 加速样式开发', 1),
(5, '数据库选用 PostgreSQL', 2),
(6, '核心页面组件开发', 0),
(6, '用户认证模块实现', 1),
(6, 'API 接口设计与文档', 2);

-- 插入第3期详细板块和内容
INSERT INTO weekly_sections (report_id, title, sort_order) VALUES
(3, '🚀 本周进展', 0),
(3, '🐛 踩坑记录', 1),
(3, '📋 下周计划', 2);

INSERT INTO weekly_section_items (section_id, content, sort_order) VALUES
(7, '首页与导航组件开发完成', 0),
(7, '用户登录/注册功能上线并通过测试', 1),
(7, 'API 接口设计文档发布', 2),
(8, '路由守卫逻辑重构了两次才理清', 0),
(8, '跨域问题折腾了半天，最终用 proxy 解决', 1),
(8, '表单验证库选型踩坑，换用了 Zod', 2),
(9, '核心业务模块开发', 0),
(9, '数据库表结构优化', 1),
(9, '编写单元测试', 2);

-- 插入第4期详细板块和内容
INSERT INTO weekly_sections (report_id, title, sort_order) VALUES
(4, '🚀 本周进展', 0),
(4, '📊 数据亮点', 1),
(4, '📋 下周计划', 2);

INSERT INTO weekly_section_items (section_id, content, sort_order) VALUES
(10, '核心业务模块开发进度 70%', 0),
(10, '完成数据库查询性能优化，响应速度提升 40%', 1),
(10, '引入 PR 代码审查流程，提升代码质量', 2),
(11, '页面加载时间从 3.2s 降至 1.8s', 0),
(11, '测试覆盖率从 45% 提升到 72%', 1),
(11, '合并了 23 个 PR，关闭了 15 个 Issue', 2),
(12, '完成剩余业务模块', 0),
(12, '集成第三方服务', 1),
(12, '准备第一轮内部演示', 2);

-- 插入第5期详细板块和内容
INSERT INTO weekly_sections (report_id, title, sort_order) VALUES
(5, '🚀 本周进展', 0),
(5, '🎉 里程碑', 1),
(5, '📋 下周计划', 2);

INSERT INTO weekly_section_items (section_id, content, sort_order) VALUES
(13, '全部功能模块开发完成', 0),
(13, '内部演示获得导师和同学的积极反馈', 1),
(13, '收集到 8 条改进建议并开始落实', 2),
(14, '项目 Alpha 版本正式发布', 0),
(14, '团队协作效率显著提升', 1),
(14, '文档体系基本完善', 2),
(15, '根据反馈优化用户体验', 0),
(15, '性能调优与安全加固', 1),
(15, '准备中期答辩材料', 2);

-- 插入第6期详细板块和内容
INSERT INTO weekly_sections (report_id, title, sort_order) VALUES
(6, '🚀 本周进展', 0),
(6, '💪 团队感悟', 1),
(6, '🔮 未来展望', 2);

INSERT INTO weekly_section_items (section_id, content, sort_order) VALUES
(16, '根据反馈完成 12 项用户体验优化', 0),
(16, '安全审计通过，修复 3 个潜在漏洞', 1),
(16, '中期答辩 PPT 与演示环境准备就绪', 2),
(17, '六周磨合，团队默契度大幅提升', 0),
(17, '从零到一的过程虽然艰辛但充满成就感', 1),
(17, '感谢每位成员的付出与坚持', 2),
(18, '继续完善产品细节', 0),
(18, '探索更多创新功能可能性', 1),
(18, '为最终答辩做好充分准备', 2);