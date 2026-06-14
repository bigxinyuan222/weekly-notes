// ===== 数据管理 =====
const STORAGE_KEY = 'innovation_weekly_data';
const API_BASE_URL = 'http://192.168.21.7:3000/api/weekly';

async function loadData() {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error('获取数据失败');
    }
    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      // 更新 localStorage 缓存为最新数据
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }

    // API 返回空数组时，检查 localStorage 是否有备份数据
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.warn('数据库为空，从本地存储恢复数据');
          return parsed;
        }
      } catch (e) {
        console.warn('本地数据解析失败');
      }
    }
    // 数据库和本地都没有数据，返回空数组
    return [];
  } catch (error) {
    console.warn('从API获取数据失败，使用本地存储:', error);
    // 如果API失败，尝试从localStorage读取
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); }
      catch (e) { console.warn('本地数据解析失败'); }
    }
    return [];
  }
}

async function saveData(data) {
  // 保存到localStorage作为备份
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  
  // 同步到数据库，每个item独立处理，单个失败不影响其他
  let allSuccess = true;
  for (const item of data) {
    try {
      await saveWeeklyToDatabase(item);
    } catch (error) {
      console.error(`保存周刊 ${item.issue} 失败:`, error);
      allSuccess = false;
      // 继续处理下一个，不中断循环
    }
  }
  
  if (!allSuccess) {
    console.error('部分周刊保存失败');
  }
}

async function saveWeeklyToDatabase(item) {
  try {
    const response = await fetch(`${API_BASE_URL}/${item.issue}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(item)
    });
    
    if (!response.ok) {
      // 如果更新失败，尝试创建
      const createResponse = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      });
      
      if (!createResponse.ok) {
        throw new Error('保存周刊到数据库失败');
      }
    }
  } catch (error) {
    console.error('保存单个周刊失败:', error);
    throw error;
  }
}

async function deleteWeeklyFromDatabase(issue) {
  try {
    const response = await fetch(`${API_BASE_URL}/${issue}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('删除周刊失败');
    }
  } catch (error) {
    console.error('删除周刊失败:', error);
    throw error;
  }
}

let weeklyData = [];

// 初始化数据
async function initializeData() {
  weeklyData = await loadData();
  renderCards();
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
        <button class="btn-delete-card" data-index="${index}" title="删除">️</button>
      </div>
      <div class="card-header">
        <span class="card-issue">${escapeHTML(item.title)}</span>
        <span class="card-date">${escapeHTML(item.date)}</span>
      </div>
      <ul class="card-body">
        ${item.summary.map(s => `<li>${escapeHTML(s)}</li>`).join('')}
      </ul>
      <div class="card-footer">点击查看详情 →</div>
    `;

    // 点击卡片主体 → 查看详情
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-actions')) return;
      openDetailModal(item);
    });

    board.appendChild(card);
  });

  // 绑定操作按钮事件
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
  if (!dateStr) return '';
  // 处理 ISO 格式字符串，提取 YYYY-MM-DD 部分
  if (dateStr.includes('T')) {
    dateStr = dateStr.split('T')[0];
  }
  // 支持 YYYY-MM-DD 和 YYYY.MM.DD 两种格式
  return dateStr.replace(/-/g, '.');
}

// ===== 详情模态框（只读查看） =====
function openDetailModal(item) {
  const overlay = document.getElementById('modalOverlay');
  document.getElementById('modalTitle').textContent = item.title;
  document.getElementById('modalDate').textContent = `📅 ${item.date}`;

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

  // 填充表单
  document.getElementById('formTitle').value = item ? item.title : '';
  document.getElementById('formDate').value = item ? item.date : '';
  document.getElementById('formRotate').value = item ? item.rotate : 0;
  document.getElementById('rotateValue').textContent = item ? item.rotate : 0;

  // 摘要
  const summaryList = document.getElementById('summaryList');
  summaryList.innerHTML = '';
  if (item && item.summary.length) {
    item.summary.forEach(s => addSummaryRow(s));
  } else {
    addSummaryRow('');
    addSummaryRow('');
    addSummaryRow('');
  }

  // 详细板块
  const sectionList = document.getElementById('sectionList');
  sectionList.innerHTML = '';
  if (item && item.detail && item.detail.sections) {
    item.detail.sections.forEach(sec => addSectionBlock(sec.title, sec.items));
  }

  // 颜色选择
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

  // 删除板块
  block.querySelector('.section-header .btn-remove').addEventListener('click', () => block.remove());

  // 添加条目
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

  // 删除条目（已有条目的删除按钮）
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

  // 摘要
  const summary = [];
  document.getElementById('summaryList').querySelectorAll('input').forEach(input => {
    const val = input.value.trim();
    if (val) summary.push(val);
  });

  // 板块
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
let isSaving = false; // 防止重复提交的锁

async function handleSave(e) {
  e.preventDefault();

  // 防止重复提交
  if (isSaving) {
    alert('正在保存中，请稍候...');
    return;
  }

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

  isSaving = true;

  try {
    if (currentEditIndex >= 0) {
      // 编辑 — 保留 issue 编号，只更新这一个
      item.issue = weeklyData[currentEditIndex].issue;
      weeklyData[currentEditIndex] = item;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(weeklyData));
      await saveWeeklyToDatabase(item);
    } else {
      // 新建 — 先保存到数据库获取正确的 issue
      const maxIssue = weeklyData.reduce((max, w) => Math.max(max, w.issue || 0), 0);
      item.issue = maxIssue + 1;
      
      // 先尝试保存到数据库
      await saveWeeklyToDatabase(item);
      
      // 数据库保存成功后才加入本地数组
      weeklyData.push(item);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(weeklyData));
    }
    
    renderCards();
    closeEditModal();
  } catch (error) {
    console.error('保存失败:', error);
    alert('保存失败，请检查网络连接');
    // 保存失败时从数组中移除（如果是新建）
    if (currentEditIndex < 0 && weeklyData.includes(item)) {
      weeklyData.pop();
    }
  } finally {
    isSaving = false;
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
    const item = weeklyData[deleteIndex];
    try {
      await deleteWeeklyFromDatabase(item.issue);
      weeklyData.splice(deleteIndex, 1);
      // 更新 localStorage 备份，不需要重新同步到数据库
      localStorage.setItem(STORAGE_KEY, JSON.stringify(weeklyData));
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

// 颜色选择器点击
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
