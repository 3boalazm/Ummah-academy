/**
 * Site search. Uses the Pagefind index produced after `astro build`.
 * On `astro dev` the index is absent — the dialog says so instead of failing.
 */
import { track } from './analytics';

const dialog = document.querySelector<HTMLDialogElement>('[data-search]');
const input = document.querySelector<HTMLInputElement>('[data-search-input]');
const results = document.querySelector<HTMLElement>('[data-search-results]');
const hint = document.querySelector<HTMLElement>('[data-search-hint]');
const empty = document.querySelector<HTMLElement>('[data-search-empty]');
const off = document.querySelector<HTMLElement>('[data-search-off]');
if (!dialog || !input || !results) {
  /* layout without search */
} else {
  type Pf = {
    init: () => Promise<void>;
    search: (q: string) => Promise<{ results: { data: () => Promise<{ url: string; meta: { title?: string }; excerpt?: string }> }[] }>;
  };
  let pf: Pf | null | undefined;
  let timer = 0;

  const load = async () => {
    if (pf !== undefined) return pf;
    try {
      const url = new URL('/pagefind/pagefind.js', window.location.origin).href;
      const mod = (await import(/* @vite-ignore */ url)) as Pf;
      await mod.init();
      pf = mod;
    } catch {
      pf = null;
    }
    return pf;
  };

  const open = () => {
    dialog.showModal();
    input.focus();
    track('search_open');
  };
  const close = () => dialog.close();

  document.querySelectorAll('[data-search-open]').forEach((b) => b.addEventListener('click', open));
  document.querySelectorAll('[data-search-close]').forEach((b) => b.addEventListener('click', close));
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) close();
  });
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      dialog.open ? close() : open();
    }
  });

  const render = async (q: string) => {
    results.replaceChildren();
    if (empty) empty.hidden = true;
    if (off) off.hidden = true;
    if (hint) hint.hidden = q.trim().length >= 2;
    if (q.trim().length < 2) return;
    const engine = await load();
    if (!engine) {
      if (off) off.hidden = false;
      if (hint) hint.hidden = true;
      return;
    }
    const found = await engine.search(q.trim());
    const top = found.results.slice(0, 8);
    if (!top.length) {
      if (empty) empty.hidden = false;
      return;
    }
    const items = await Promise.all(top.map((r) => r.data()));
    const frag = document.createDocumentFragment();
    for (const item of items) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.url;
      const title = document.createElement('strong');
      title.textContent = item.meta.title || item.url;
      a.append(title);
      if (item.excerpt) {
        const ex = document.createElement('small');
        ex.innerHTML = item.excerpt;
        a.append(ex);
      }
      li.append(a);
      frag.append(li);
    }
    results.append(frag);
    track('search_query', { q: q.trim().slice(0, 40) });
  };

  input.addEventListener('input', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => render(input.value), 180);
  });
}
