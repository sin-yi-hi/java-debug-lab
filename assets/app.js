'use strict';

// All pages read the same data source. When adding lessons, update only data/articles.json.
const DATA_PATH = './data/articles.json';

async function loadArticles() {
  const response = await fetch(DATA_PATH, { cache: 'no-store' });
  if (!response.ok) throw new Error(`無法讀取文章資料（HTTP ${response.status}）`);
  const data = await response.json();
  if (!Array.isArray(data.articles) || !Array.isArray(data.categories)) {
    throw new Error('文章資料結構不正確');
  }
  return data;
}

function el(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
}

function articleHref(id) {
  return `./article.html?id=${encodeURIComponent(id)}`;
}

function renderHome({ articles, categories }) {
  const search = document.querySelector('#search-input');
  const filterRoot = document.querySelector('#category-filters');
  const grid = document.querySelector('#article-grid');
  const status = document.querySelector('#results-status');
  const empty = document.querySelector('#empty-state');
  const count = document.querySelector('#article-count');
  count.textContent = String(articles.length);
  let currentCategory = '全部';

  function createCard(article, index) {
    const card = el('article', 'article-card');
    const top = el('div', 'card-top');
    top.append(el('span', 'category-badge', article.category), el('span', 'card-type', article.errorType));
    const title = el('h3', '', article.title);
    const summary = el('p', '', article.summary);
    const footer = el('div', 'card-footer');
    const link = el('a', '', '閱讀教學 ↗');
    link.href = articleHref(article.id);
    link.setAttribute('aria-label', `閱讀「${article.title}」`);
    footer.append(el('span', '', `NO. ${String(index + 1).padStart(2, '0')} · 約 ${article.minutes} 分鐘`), link);
    card.append(top, title, summary, footer);
    return card;
  }

  function render() {
    const query = search.value.trim().toLocaleLowerCase('zh-Hant');
    const matches = articles.filter((a) => {
      const categoryMatches = currentCategory === '全部' || a.category === currentCategory;
      const searchable = [a.title, a.category, a.summary, a.errorType, ...(a.tags || [])]
        .join(' ').toLocaleLowerCase('zh-Hant');
      return categoryMatches && searchable.includes(query);
    });
    grid.replaceChildren(...matches.map(createCard));
    empty.hidden = matches.length !== 0;
    status.textContent = `顯示 ${matches.length} 篇教學${currentCategory === '全部' ? '' : ` · ${currentCategory}`}`;
    filterRoot.querySelectorAll('button').forEach((button) => {
      const selected = button.dataset.category === currentCategory;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  for (const category of ['全部', ...categories]) {
    const button = el('button', 'filter-btn', category);
    button.type = 'button';
    button.dataset.category = category;
    button.addEventListener('click', () => { currentCategory = category; render(); });
    filterRoot.append(button);
  }
  search.addEventListener('input', render);
  document.querySelector('#reset-filters').addEventListener('click', () => {
    currentCategory = '全部';
    search.value = '';
    render();
    search.focus();
  });
  render();
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => { toast.hidden = true; }, 2200);
}

function renderArticle({ articles }) {
  const id = new URLSearchParams(window.location.search).get('id');
  const article = articles.find((item) => item.id === id);
  document.querySelector('#article-loading').hidden = true;
  if (!article) {
    document.querySelector('#article-error').hidden = false;
    return;
  }
  document.title = `${article.title}｜Java Debug Lab`;
  document.querySelector('#article-content').hidden = false;
  document.querySelector('#detail-title').textContent = article.title;
  document.querySelector('#detail-summary').textContent = article.summary;
  document.querySelector('#detail-symptom').textContent = article.symptom;
  document.querySelector('#detail-wrong').textContent = article.wrongCode;
  document.querySelector('#detail-correct').textContent = article.correctCode;
  const meta = document.querySelector('#detail-meta');
  for (const item of [article.category, article.errorType, `約 ${article.minutes} 分鐘`]) {
    meta.append(el('span', 'meta-chip', item));
  }
  document.querySelector('#detail-explanation').replaceChildren(...article.explanation.map((p) => el('p', '', p)));
  document.querySelector('#detail-takeaways').replaceChildren(...article.takeaways.map((p) => el('li', '', p)));
  const nextIndex = (articles.indexOf(article) + 1) % articles.length;
  const next = articles[nextIndex];
  if (next && next.id !== article.id) {
    const root = document.querySelector('#detail-next');
    const info = el('div');
    info.append(el('small', '', '接下來可以學習'), el('strong', '', next.title));
    const link = el('a', '', '閱讀下一篇 →');
    link.href = articleHref(next.id);
    root.append(info, link);
  }
  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const content = button.dataset.copy === 'wrong' ? article.wrongCode : article.correctCode;
      try {
        await navigator.clipboard.writeText(content);
        showToast('程式碼已複製！');
      } catch {
        showToast('無法複製，請手動選取程式碼。');
      }
    });
  });
}

async function start() {
  const page = document.body.dataset.page;
  try {
    const data = await loadArticles();
    if (page === 'home') renderHome(data);
    if (page === 'article') renderArticle(data);
  } catch (error) {
    console.error(error);
    const message = '載入失敗：請使用本機伺服器預覽，並確認 data/articles.json 存在。';
    if (page === 'home') {
      document.querySelector('#results-status').textContent = message;
    } else {
      document.querySelector('#article-loading').textContent = message;
    }
  }
}

start();
