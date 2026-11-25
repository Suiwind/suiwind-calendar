/* 苏伊温德日历 · 图文矩阵全屏挂载 + 一键版本倒退与无损清壳模块 */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const REPO_STORAGE_KEY = 'zx_github_repo_url';
  let loaded = false;

  function syncBodyScroll() {
    const anyOpen =
      $('matrixPage')?.classList.contains('matrix-open') ||
      $('baziPage')?.classList.contains('bazi-open') ||
      $('xlrPage')?.classList.contains('xlr-open');
    document.body.style.overflow = anyOpen ? 'hidden' : '';
  }

  function ensureLoaded() {
    if (loaded) return;
    const frame = $('matrixFrame');
    if (!frame) return;
    frame.src = './matrix-workbench.html?embed=1&v=414';
    loaded = true;
  }

  function openMatrix() {
    const page = $('matrixPage');
    if (!page) return;
    ensureLoaded();
    page.classList.add('matrix-open');
    page.setAttribute('aria-hidden', 'false');
    syncBodyScroll();
  }

  function closeMatrix() {
    const page = $('matrixPage');
    if (!page) return;
    page.classList.remove('matrix-open');
    page.setAttribute('aria-hidden', 'true');
    syncBodyScroll();
    if (location.hash === '#matrix') {
      history.replaceState(null, '', location.pathname + location.search);
    }
    $('matrixBtn')?.focus();
  }

  function inferGithubRepoUrl() {
    try {
      const saved = (localStorage.getItem(REPO_STORAGE_KEY) || '').trim();
      if (saved) return saved;
    } catch {}

    const host = (location.hostname || '').toLowerCase();
    if (host.endsWith('.github.io')) {
      const owner = host.replace(/\.github\.io$/i, '');
      const parts = (location.pathname || '').split('/').filter(Boolean);
      const first = parts[0] || '';
      if (first && !/\.html?$/i.test(first)) {
        return `https://github.com/${owner}/${first}`;
      }
      if (owner) {
        return `https://github.com/${owner}/${owner}.github.io`;
      }
    }
    return '';
  }

  function normalizeRepoUrl(raw) {
    const trimmed = String(raw || '').trim().replace(/\/+$/, '');
    if (!trimmed) return '';
    const fullMatch = trimmed.match(/^https?:\/\/github\.com\/([^/\s]+)\/([^/\s#?]+)/i);
    if (fullMatch) {
      return `https://github.com/${fullMatch[1]}/${fullMatch[2].replace(/\.git$/i, '')}`;
    }
    const shortMatch = trimmed.match(/^([^/\s]+)\/([^/\s#?]+)$/);
    if (shortMatch) {
      return `https://github.com/${shortMatch[1]}/${shortMatch[2].replace(/\.git$/i, '')}`;
    }
    return '';
  }

  function closeMoreDropdown() {
    $('moreMenuDropdown')?.classList.remove('open');
    $('moreMenuBtn')?.setAttribute('aria-expanded', 'false');
  }

  function openRollbackModal() {
    closeMoreDropdown();
    const input = $('rollbackRepoInput');
    const hint = $('rollbackStatusHint');
    if (input) input.value = inferGithubRepoUrl();
    if (hint) {
      hint.textContent =
        '提示：上传部署包时请把里面的 .github 文件夹一并拖入仓库（传过一次即永久生效）。';
      hint.style.color = '';
    }
    $('rollbackModal')?.classList.add('show');
  }

  function closeRollbackModal() {
    $('rollbackModal')?.classList.remove('show');
  }

  async function refreshShellPreservingData() {
    const btn = $('refreshShellOnlyBtn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '正在重刷界面外壳…';
    }
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister().catch(() => {})));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k).catch(() => {})));
      }
    } catch {}
    const cleanUrl = `${location.pathname}?rb=${Date.now()}${location.hash || ''}`;
    location.replace(cleanUrl);
  }

  document.addEventListener('DOMContentLoaded', () => {
    $('matrixBtn')?.addEventListener('click', openMatrix);
    $('matrixClose')?.addEventListener('click', closeMatrix);
    $('matrixNewTabBtn')?.addEventListener('click', () => {
      window.open('./matrix-workbench.html', '_blank', 'noopener');
    });

    $('rollbackMenuBtn')?.addEventListener('click', openRollbackModal);
    $('closeRollbackModal')?.addEventListener('click', closeRollbackModal);
    $('rollbackModal')?.addEventListener('click', (e) => {
      if (e.target === $('rollbackModal')) closeRollbackModal();
    });

    $('openGithubRollbackBtn')?.addEventListener('click', () => {
      const input = $('rollbackRepoInput');
      const hint = $('rollbackStatusHint');
      const repoUrl = normalizeRepoUrl(input?.value || '');
      if (!repoUrl) {
        if (hint) {
          hint.textContent =
            '请先填入您的 GitHub 仓库地址（格式如 https://github.com/用户名/仓库名），在 GitHub Pages 线上打开时会自动识别。';
          hint.style.color = 'var(--danger, #b42318)';
        }
        input?.focus();
        return;
      }
      try {
        localStorage.setItem(REPO_STORAGE_KEY, repoUrl);
      } catch {}
      if (input) input.value = repoUrl;
      window.open(`${repoUrl}/actions/workflows/rollback.yml`, '_blank', 'noopener');
    });

    $('refreshShellOnlyBtn')?.addEventListener('click', refreshShellPreservingData);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if ($('rollbackModal')?.classList.contains('show')) {
          closeRollbackModal();
        } else if ($('matrixPage')?.classList.contains('matrix-open')) {
          closeMatrix();
        }
      }
    });

    if (location.hash === '#matrix') {
      openMatrix();
    }
  });
})();
