// ===== Firebase 配置 =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCpQ7UbA_rR8otz69qnJx8M77GF1oEpKY",
  authDomain: "weekly-notes-8b3e1.firebaseapp.com",
  databaseURL: "https://weekly-notes-8b3e1-default-rtdb.firebaseio.com",
  projectId: "weekly-notes-8b3e1",
  storageBucket: "weekly-notes-8b3e1.firebasestorage.app",
  messagingSenderId: "922396372987",
  appId: "1:922396372987:web:4d7c64547a5991598fa55e",
  measurementId: "G-FFVP0JC146"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const weeklyRef = ref(db, 'weekly');

// ===== 默认数据（首次加载时使用） =====
const DEFAULT_DATA = [
  {
    issue: 1, date: '2026-06-01', title: '第1期 · 启航',
    summary: ['团队组建完成，确定分工', '完成项目选题与需求分析', '制定第一阶段开发计划'],
    detail: { sections: [
      { title: '🚀 本周进展', items: ['团队组建完成，确定分工与职责', '完成项目选题与需求分析文档', '制定第一阶段开发计划与里程碑'] },
      { title: '💡 灵感碰撞', items: ['头脑风暴收集了 12 个创意方向', '确定以"智能协作"为核心理念'] },
      { title: '📋 下周计划', items: ['完成技术选型调研', '搭建项目基础框架', '设计 UI 原型初稿'] },
    ]},
    color: 'yellow', pinColor: 'red', rotate: -2,
  },
  {
    issue: 2, date: '2026-06-08', title: '第2期 · 筑基',
    summary: ['完成技术栈选型：React + Node.js', '搭建项目基础架构', 'UI 原型设计评审通过'],
    detail: { sections: [
      { title: '🚀 本周进展', items: ['完成技术栈选型：前端 React，后端 Node.js', '搭建项目基础架构与 CI/CD 流程', 'UI 原型设计评审通过，开始视觉细化'] },
      { title: '🔧 技术决策', items: ['选用 TypeScript 提升代码质量', '采用 Tailwind CSS 加速样式开发', '数据库选用 PostgreSQL'] },
      { title: '📋 下周计划', items: ['核心页面组件开发', '用户认证模块实现', 'API 接口设计与文档'] },
    ]},
    color: 'blue', pinColor: 'blue', rotate: 1.5,
  },
  {
    issue: 3, date: '2026-06-15', title: '第3期 · 破土',
    summary: ['首页与导航组件开发完成', '用户登录/注册功能上线', 'API 接口设计文档发布'],
    detail: { sections: [
      { title: '🚀 本周进展', items: ['首页与导航组件开发完成', '用户登录/注册功能上线并通过测试', 'API 接口设计文档发布'] },
      { title: '🐛 踩坑记录', items: ['路由守卫逻辑重构了两次才理清', '跨域问题折腾了半天，最终用 proxy 解决', '表单验证库选型踩坑，换用了 Zod'] },
      { title: '📋 下周计划', items: ['核心业务模块开发', '数据库表结构优化', '编写单元测试'] },
    ]},
    color: 'green', pinColor: 'green', rotate: -1,
  },
  {
    issue: 4, date: '2026-06-22', title: '第4期 · 生长',
    summary: ['核心业务模块开发进度 70%', '完成数据库性能优化', '引入代码审查流程'],
    detail: { sections: [
      { title: '🚀 本周进展', items: ['核心业务模块开发进度 70%', '完成数据库查询性能优化，响应速度提升 40%', '引入 PR 代码审查流程，提升代码质量'] },
      { title: '📊 数据亮点', items: ['页面加载时间从 3.2s 降至 1.8s', '测试覆盖率从 45% 提升到 72%', '合并了 23 个 PR，关闭了 15 个 Issue'] },
      { title: '📋 下周计划', items: ['完成剩余业务模块', '集成第三方服务', '准备第一轮内部演示'] },
    ]},
    color: 'pink', pinColor: 'yellow', rotate: 2,
  },
  {
    issue: 5, date: '2026-06-29', title: '第5期 · 绽放',
    summary: ['全部功能模块开发完成', '内部演示获得积极反馈', '启动性能优化与 Bug 修复'],
    detail: { sections: [
      { title: '🚀 本周进展', items: ['全部功能模块开发完成', '内部演示获得导师和同学的积极反馈', '收集到 8 条改进建议并开始落实'] },
      { title: '🎉 里程碑', items: ['项目 Alpha 版本正式发布', '团队协作效率显著提升', '文档体系基本完善'] },
      { title: '📋 下周计划', items: ['根据反馈优化用户体验', '性能调优与安全加固', '准备中期答辩材料'] },
    ]},
    color: 'orange', pinColor: 'white', rotate: -1.5,
  },
  {
    issue: 6, date: '2026-07-06', title: '第6期 · 远航',
    summary: ['用户体验优化完成', '安全审计通过', '中期答辩准备就绪'],
    detail: { sections: [
      { title: '🚀 本周进展', items: ['根据反馈完成 12 项用户体验优化', '安全审计通过，修复 3 个潜在漏洞', '中期答辩 PPT 与演示环境准备就绪'] },
      { title: '💪 团队感悟', items: ['六周磨合，团队默契度大幅提升', '从零到一的过程虽然艰辛但充满成就感', '感谢每位成员的付出与坚持'] },
      { title: '🔮 未来展望', items: ['继续完善产品细节', '探索更多创新功能可能性', '为最终答辩做好充分准备'] },
    ]},
    color: 'purple', pinColor: 'red', rotate: 1,
  },
];

// ===== 数据管理 =====
const STORAGE_KEY = 'innovation_weekly_data';

let weeklyData = [];

// 从 Firebase 加载数据
async function loadData() {
  try {
    const snapshot = await get(weeklyRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (Array.isArray(data)) {
        return data;
      } else if (typeof data === 'object') {
        return Object.values(data);
      }
    }
    await saveData(DEFAULT_DATA);
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  } catch (error) {
    console.warn('从Firebase获取数据失败:', error);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('本地数据解析失败');
      }
    }
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

// 保存数据到 Firebase
async function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    await set(weeklyRef, data);
    console.log('数据已同步到 Firebase');
  } catch (error) {
    console.error('保存数据失败:', error);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

// 初始化数据
async function initializeData() {
  weeklyData = await loadData();
  renderCards();
  
  onValue(weeklyRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const newData = Array.isArray(data) ? data : Object.values(data);
      const oldJson = JSON.stringify(weeklyData);
      const newJson = JSON.stringify(newData);
      if (oldJson !== newJson) {
        weeklyData = newData;
        renderCards();
        console.log('检测到远程数据更新，已自动同步');
      }
    }
  });
}

// ===== 渲染卡片 =====
function renderCards() {
  const board = document.getElementById('corkBoard');
  board.innerHTML = '';

  weeklyData.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = `note-card ${item.color}`;
    card.style.setProperty('--rotate', `${item.rotate}deg`);
    card.style.transform = `rotate(${item.rotate}deg)`;
    card.style.animationDelay = `${index * 0.08}s`;

    card.innerHTML = `
      <div class="pin ${item.pinColor}"></div>
      <div class="card-actions">
        <button class="btn-edit" data-index="${index}" title="编辑">✏️</button>
        <button class="btn-delete-card" data-index="${index}" title="删除">🗑️</button>
      </div>
      <div class="card-header">
        <span class="card-issue">${escapeHTML(item.title)}</span>
        <span class="card-date">${formatDate(item.date)}</span>
      </div>
      <ul class="card-body">
        ${item.summary.map(s => `<li>${escapeHTML(s)}</li>`).join('')}
      </ul>
      <div class="card-footer">点击查看详情 →</div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-actions')) return;
      openDetailModal(item);
    });

    board.appendChild(card);
  });

  board.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditModal(parseInt(btn.dataset.index));
    });
  });

  board.querySelectorAll('.btn-delete-card').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      confirmDelete(parseInt(btn.dataset.index));
    });
  });
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(dateStr) {
  return dateStr.replace(/-/g, '.');
}

// ===== 详情模态框 =====
function openDetailModal(item) {
  const overlay = document.getElementById('modalOverlay');
  document.getElementById('modalTitle').textContent = item.title;
  document.getElementById('modalDate').textContent = `📅 ${formatDate(item.date)}`;

  let html = '';
  if (item.detail && item.detail.sections) {
    item.detail.sections.forEach(section => {
      html += `<h3>${escapeHTML(section.title)}</h3>`;
      html += '<ul>';
      section.items.forEach(text => {
        html += `<li>${escapeHTML(text)}</li>`;
      });
      html += '</ul>';
    });
  }
  document.getElementById('modalContent').innerHTML = html;

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDetailModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

// ===== 编辑/新建模态框 =====
let currentEditIndex = -1;

function openEditModal(index) {
  currentEditIndex = index;
  const isEdit = index >= 0;
  const item = isEdit ? weeklyData[index] : null;

  document.getElementById('editTitle').textContent = isEdit ? '编辑周刊' : '新建周刊';
  document.getElementById('formIndex').value = index;

  document.getElementById('formTitle').value = item ? item.title : '';
  document.getElementById('formDate').value = item ? item.date : '';
  document.getElementById('formRotate').value = item ? item.rotate : 0;
  document.getElementById('rotateValue').textContent = item ? item.rotate : 0;

  const summaryList = document.getElementById('summaryList');
  summaryList.innerHTML = '';
  if (item && item.summary.length) {
    item.summary.forEach(s => addSummaryRow(s));
  } else {
    addSummaryRow('');
    addSummaryRow('');
    addSummaryRow('');
  }

  const sectionList = document.getElementById('sectionList');
  sectionList.innerHTML = '';
  if (item && item.detail && item.detail.sections) {
    item.detail.sections.forEach(sec => addSectionBlock(sec.title, sec.items));
  }

  selectColor('cardColorPicker', item ? item.color : 'yellow');
  selectColor('pinColorPicker', item ? item.pinColor : 'red');

  document.getElementById('editOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeEditModal() {
  document.getElementById('editOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

function selectColor(pickerId, color) {
  const picker = document.getElementById(pickerId);
  picker.querySelectorAll('.color-dot').forEach(dot => {
    dot.classList.toggle('selected', dot.dataset.color === color);
  });
}

function getSelectedColor(pickerId) {
  const selected = document.querySelector(`#${pickerId} .color-dot.selected`);
  return selected ? selected.dataset.color : 'yellow';
}

// ===== 动态表单行 =====
function addSummaryRow(value = '') {
  const list = document.getElementById('summaryList');
  const row = document.createElement('div');
  row.className = 'list-item';
  row.innerHTML = `
    <input type="text" value="${escapeHTML(value)}" placeholder="输入要点...">
    <button type="button" class="btn-remove" title="删除">×</button>
  `;
  row.querySelector('.btn-remove').addEventListener('click', () => row.remove());
  list.appendChild(row);
}

function addSectionBlock(title = '', items = ['']) {
  const container = document.getElementById('sectionList');
  const block = document.createElement('div');
  block.className = 'section-block';

  block.innerHTML = `
    <div class="section-header">
      <input type="text" value="${escapeHTML(title)}" placeholder="板块标题，如：🚀 本周进展">
      <button type="button" class="btn-remove" title="删除板块">×</button>
    </div>
    <div class="section-items">
      ${items.map(item => `
        <div class="list-item">
          <input type="text" value="${escapeHTML(item)}" placeholder="输入内容...">
          <button type="button" class="btn-remove" title="删除">×</button>
        </div>
      `).join('')}
    </div>
    <button type="button" class="btn-add-item">+ 添加条目</button>
  `;

  block.querySelector('.section-header .btn-remove').addEventListener('click', () => block.remove());

  block.querySelector('.btn-add-item').addEventListener('click', () => {
    const itemsDiv = block.querySelector('.section-items');
    const row = document.createElement('div');
    row.className = 'list-item';
    row.innerHTML = `
      <input type="text" value="" placeholder="输入内容...">
      <button type="button" class="btn-remove" title="删除">×</button>
    `;
    row.querySelector('.btn-remove').addEventListener('click', () => row.remove());
    itemsDiv.appendChild(row);
  });

  block.querySelectorAll('.section-items .btn-remove').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.list-item').remove());
  });

  container.appendChild(block);
}

// ===== 收集表单数据 =====
function collectFormData() {
  const title = document.getElementById('formTitle').value.trim();
  const date = document.getElementById('formDate').value;
  const rotate = parseFloat(document.getElementById('formRotate').value) || 0;
  const color = getSelectedColor('cardColorPicker');
  const pinColor = getSelectedColor('pinColorPicker');

  const summary = [];
  document.getElementById('summaryList').querySelectorAll('input').forEach(input => {
    const val = input.value.trim();
    if (val) summary.push(val);
  });

  const sections = [];
  document.getElementById('sectionList').querySelectorAll('.section-block').forEach(block => {
    const secTitle = block.querySelector('.section-header input').value.trim();
    const items = [];
    block.querySelectorAll('.section-items input').forEach(input => {
      const val = input.value.trim();
      if (val) items.push(val);
    });
    if (secTitle && items.length) {
      sections.push({ title: secTitle, items });
    }
  });

  return { title, date, rotate, color, pinColor, summary, sections };
}

// ===== 保存（新建/编辑） =====
async function handleSave(e) {
  e.preventDefault();

  const data = collectFormData();

  if (!data.title) { alert('请输入标题'); return; }
  if (!data.date) { alert('请选择日期'); return; }
  if (data.summary.length === 0) { alert('请至少输入一个摘要要点'); return; }

  const item = {
    title: data.title,
    date: data.date,
    summary: data.summary,
    detail: { sections: data.sections },
    color: data.color,
    pinColor: data.pinColor,
    rotate: data.rotate,
  };

  if (currentEditIndex >= 0) {
    item.issue = weeklyData[currentEditIndex].issue;
    weeklyData[currentEditIndex] = item;
  } else {
    const maxIssue = weeklyData.reduce((max, w) => Math.max(max, w.issue || 0), 0);
    item.issue = maxIssue + 1;
    weeklyData.push(item);
  }

  try {
    await saveData(weeklyData);
    renderCards();
    closeEditModal();
  } catch (error) {
    console.error('保存失败:', error);
    alert('保存失败，请检查网络连接');
  }
}

// ===== 删除 =====
let deleteIndex = -1;

function confirmDelete(index) {
  deleteIndex = index;
  document.getElementById('confirmName').textContent = weeklyData[index].title;
  document.getElementById('confirmOverlay').classList.add('active');
}

function closeConfirm() {
  document.getElementById('confirmOverlay').classList.remove('active');
  deleteIndex = -1;
}

async function doDelete() {
  if (deleteIndex >= 0) {
    weeklyData.splice(deleteIndex, 1);
    try {
      await saveData(weeklyData);
      renderCards();
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请检查网络连接');
    }
  }
  closeConfirm();
}

// ===== 事件绑定 =====
document.getElementById('modalClose').addEventListener('click', closeDetailModal);
document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeDetailModal();
});

document.getElementById('btnAdd').addEventListener('click', () => openEditModal(-1));
document.getElementById('editClose').addEventListener('click', closeEditModal);
document.getElementById('btnCancel').addEventListener('click', closeEditModal);
document.getElementById('editOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeEditModal();
});
document.getElementById('editForm').addEventListener('submit', handleSave);

document.getElementById('addSummary').addEventListener('click', () => addSummaryRow(''));
document.getElementById('addSection').addEventListener('click', () => addSectionBlock());

document.getElementById('formRotate').addEventListener('input', (e) => {
  document.getElementById('rotateValue').textContent = e.target.value;
});

document.querySelectorAll('.color-picker').forEach(picker => {
  picker.addEventListener('click', (e) => {
    const dot = e.target.closest('.color-dot');
    if (!dot) return;
    picker.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
    dot.classList.add('selected');
  });
});

document.getElementById('confirmNo').addEventListener('click', closeConfirm);
document.getElementById('confirmYes').addEventListener('click', doDelete);
document.getElementById('confirmOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeConfirm();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (document.getElementById('confirmOverlay').classList.contains('active')) {
      closeConfirm();
    } else if (document.getElementById('editOverlay').classList.contains('active')) {
      closeEditModal();
    } else if (document.getElementById('modalOverlay').classList.contains('active')) {
      closeDetailModal();
    }
  }
});

// ===== 初始化 =====
initializeData();
