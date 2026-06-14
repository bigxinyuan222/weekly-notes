const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 格式化日期为 YYYY-MM-DD 字符串
function formatDate(date) {
  if (!date) return '';
  
  // 如果是字符串，直接提取 YYYY-MM-DD 部分
  if (typeof date === 'string') {
    // 匹配 YYYY-MM-DD 格式（处理 ISO 格式和普通日期格式）
    const match = date.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) {
      return match[0];
    }
    return date;
  }
  
  // Date 对象转 YYYY-MM-DD
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 获取所有周刊
router.get('/', async (req, res) => {
  try {
    // 使用 DATE_FORMAT 直接在 SQL 中格式化日期，避免时区问题
    const [reports] = await pool.query(`
      SELECT id, issue, title, date, color, pin_color, rotate, 
             DATE_FORMAT(created_at, '%Y-%m-%d') as created_at, 
             updated_at
      FROM weekly_reports
      ORDER BY issue ASC
    `);

    // 为每个报告获取摘要和详细内容
    const result = await Promise.all(reports.map(async (report) => {
      // 获取摘要
      const [summaries] = await pool.query(`
        SELECT content, sort_order
        FROM weekly_summaries
        WHERE report_id = ?
        ORDER BY sort_order ASC
      `, [report.id]);

      // 获取详细板块
      const [sections] = await pool.query(`
        SELECT id, title, sort_order
        FROM weekly_sections
        WHERE report_id = ?
        ORDER BY sort_order ASC
      `, [report.id]);

      // 为每个板块获取内容条目
      const sectionsWithItems = await Promise.all(sections.map(async (section) => {
        const [items] = await pool.query(`
          SELECT content, sort_order
          FROM weekly_section_items
          WHERE section_id = ?
          ORDER BY sort_order ASC
        `, [section.id]);

        return {
          title: section.title,
          items: items.map(item => item.content)
        };
      }));

      return {
        issue: report.issue,
        title: report.title,
        date: formatDate(report.created_at),
        summary: summaries.map(s => s.content),
        detail: {
          sections: sectionsWithItems
        },
        color: report.color,
        pinColor: report.pin_color,
        rotate: report.rotate
      };
    }));

    res.json(result);
  } catch (error) {
    console.error('获取周刊列表失败:', error);
    res.status(500).json({ error: '获取周刊列表失败' });
  }
});

// 获取单个周刊
router.get('/:issue', async (req, res) => {
  try {
    const { issue } = req.params;

    const [reports] = await pool.query(`
      SELECT id, issue, title, date, color, pin_color, rotate, created_at, updated_at
      FROM weekly_reports
      WHERE issue = ?
    `, [issue]);

    if (reports.length === 0) {
      return res.status(404).json({ error: '周刊不存在' });
    }

    const report = reports[0];

    // 获取摘要
    const [summaries] = await pool.query(`
      SELECT content, sort_order
      FROM weekly_summaries
      WHERE report_id = ?
      ORDER BY sort_order ASC
    `, [report.id]);

    // 获取详细板块
    const [sections] = await pool.query(`
      SELECT id, title, sort_order
      FROM weekly_sections
      WHERE report_id = ?
      ORDER BY sort_order ASC
    `, [report.id]);

    // 为每个板块获取内容条目
    const sectionsWithItems = await Promise.all(sections.map(async (section) => {
      const [items] = await pool.query(`
        SELECT content, sort_order
        FROM weekly_section_items
        WHERE section_id = ?
        ORDER BY sort_order ASC
      `, [section.id]);

      return {
        title: section.title,
        items: items.map(item => item.content)
      };
    }));

    const result = {
      issue: report.issue,
      title: report.title,
      date: formatDate(report.date),
      summary: summaries.map(s => s.content),
      detail: {
        sections: sectionsWithItems
      },
      color: report.color,
      pinColor: report.pin_color,
      rotate: report.rotate
    };

    res.json(result);
  } catch (error) {
    console.error('获取周刊详情失败:', error);
    res.status(500).json({ error: '获取周刊详情失败' });
  }
});

// 创建新周刊
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { issue, title, date, summary, detail, color, pinColor, rotate } = req.body;

    // 插入主报告
    const [result] = await connection.query(`
      INSERT INTO weekly_reports (issue, title, date, color, pin_color, rotate)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [issue, title, date, color || 'yellow', pinColor || 'red', rotate || 0]);

    const reportId = result.insertId;

    // 插入摘要
    if (summary && Array.isArray(summary)) {
      for (let i = 0; i < summary.length; i++) {
        await connection.query(`
          INSERT INTO weekly_summaries (report_id, content, sort_order)
          VALUES (?, ?, ?)
        `, [reportId, summary[i], i]);
      }
    }

    // 插入详细板块和内容
    if (detail && detail.sections && Array.isArray(detail.sections)) {
      for (let i = 0; i < detail.sections.length; i++) {
        const section = detail.sections[i];
        
        const [sectionResult] = await connection.query(`
          INSERT INTO weekly_sections (report_id, title, sort_order)
          VALUES (?, ?, ?)
        `, [reportId, section.title, i]);

        const sectionId = sectionResult.insertId;

        // 插入板块内容
        if (section.items && Array.isArray(section.items)) {
          for (let j = 0; j < section.items.length; j++) {
            await connection.query(`
              INSERT INTO weekly_section_items (section_id, content, sort_order)
              VALUES (?, ?, ?)
            `, [sectionId, section.items[j], j]);
          }
        }
      }
    }

    await connection.commit();
    res.status(201).json({ 
      success: true, 
      message: '周刊创建成功',
      id: reportId 
    });
  } catch (error) {
    await connection.rollback();
    console.error('创建周刊失败:', error);
    res.status(500).json({ error: '创建周刊失败' });
  } finally {
    connection.release();
  }
});

// 更新周刊
router.put('/:issue', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { issue } = req.params;
    const { title, date, summary, detail, color, pinColor, rotate } = req.body;

    // 检查周刊是否存在
    const [existing] = await connection.query(`
      SELECT id FROM weekly_reports WHERE issue = ?
    `, [issue]);

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: '周刊不存在' });
    }

    const reportId = existing[0].id;

    // 更新主报告
    await connection.query(`
      UPDATE weekly_reports
      SET title = ?, date = ?, color = ?, pin_color = ?, rotate = ?
      WHERE id = ?
    `, [title, date, color || 'yellow', pinColor || 'red', rotate || 0, reportId]);

    // 删除旧的摘要和详细内容
    await connection.query(`DELETE FROM weekly_summaries WHERE report_id = ?`, [reportId]);
    await connection.query(`DELETE FROM weekly_section_items WHERE section_id IN (
      SELECT id FROM weekly_sections WHERE report_id = ?
    )`, [reportId]);
    await connection.query(`DELETE FROM weekly_sections WHERE report_id = ?`, [reportId]);

    // 插入新的摘要
    if (summary && Array.isArray(summary)) {
      for (let i = 0; i < summary.length; i++) {
        await connection.query(`
          INSERT INTO weekly_summaries (report_id, content, sort_order)
          VALUES (?, ?, ?)
        `, [reportId, summary[i], i]);
      }
    }

    // 插入新的详细板块和内容
    if (detail && detail.sections && Array.isArray(detail.sections)) {
      for (let i = 0; i < detail.sections.length; i++) {
        const section = detail.sections[i];
        
        const [sectionResult] = await connection.query(`
          INSERT INTO weekly_sections (report_id, title, sort_order)
          VALUES (?, ?, ?)
        `, [reportId, section.title, i]);

        const sectionId = sectionResult.insertId;

        // 插入板块内容
        if (section.items && Array.isArray(section.items)) {
          for (let j = 0; j < section.items.length; j++) {
            await connection.query(`
              INSERT INTO weekly_section_items (section_id, content, sort_order)
              VALUES (?, ?, ?)
            `, [sectionId, section.items[j], j]);
          }
        }
      }
    }

    await connection.commit();
    res.json({ 
      success: true, 
      message: '周刊更新成功' 
    });
  } catch (error) {
    await connection.rollback();
    console.error('更新周刊失败:', error);
    res.status(500).json({ error: '更新周刊失败' });
  } finally {
    connection.release();
  }
});

// 删除周刊
router.delete('/:issue', async (req, res) => {
  try {
    const { issue } = req.params;

    const [result] = await pool.query(`
      DELETE FROM weekly_reports WHERE issue = ?
    `, [issue]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '周刊不存在' });
    }

    res.json({ 
      success: true, 
      message: '周刊删除成功' 
    });
  } catch (error) {
    console.error('删除周刊失败:', error);
    res.status(500).json({ error: '删除周刊失败' });
  }
});

module.exports = router;