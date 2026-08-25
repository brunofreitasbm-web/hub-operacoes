(function () {
  'use strict';

  const fmtBRL = (value) =>
    'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ---------------- Nav mobile toggle ---------------- */
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav-toggle');
  if (nav && navToggle) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    nav.querySelectorAll('.nav-links a').forEach((link) => {
      link.addEventListener('click', () => nav.classList.remove('is-open'));
    });
  }

  /* ---------------- Scroll to trial ---------------- */
  document.querySelectorAll('[data-scroll-to-trial]').forEach((el) => {
    el.addEventListener('click', () => {
      document.getElementById('trial')?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---------------- Bipagem simulator ---------------- */
  const SCAN_POOL = [
    { name: 'Trufa Tradicional 30g', code: '78910001', ok: true },
    { name: 'Tablete Castanha 100g', code: '78910002', ok: true },
    { name: 'Caixa de Bombom 200g', code: '78910003', ok: false },
    { name: 'Trufa Coco 30g', code: '78910004', ok: true },
  ];

  const scanBtn = document.getElementById('scan-btn');
  const scanList = document.getElementById('scan-list');
  let scannedItems = [];

  function renderScanList() {
    if (!scanList) return;
    if (scannedItems.length === 0) {
      scanList.innerHTML = '<p class="sim-empty">Nenhum item bipado ainda — clique no botão acima.</p>';
      return;
    }
    scanList.innerHTML = scannedItems
      .map((item) => {
        const toneClass = item.ok ? 'tag-success' : 'tag-danger';
        const bg = item.ok ? 'var(--tone-success-bg)' : 'var(--tone-danger-bg)';
        const color = item.ok ? 'var(--tone-success-text)' : 'var(--tone-danger-text)';
        const status = item.ok ? 'Confere' : 'Divergência';
        return `<div class="sim-scan-item">
          <div>
            <strong>${item.name}</strong><br>
            <span class="ean">EAN ${item.code}</span>
          </div>
          <span class="tag ${toneClass}" style="background:${bg}; color:${color};">${status}</span>
        </div>`;
      })
      .join('');
  }

  if (scanBtn) {
    scanBtn.addEventListener('click', () => {
      const pick = SCAN_POOL[Math.floor(Math.random() * SCAN_POOL.length)];
      scannedItems = [pick, ...scannedItems].slice(0, 4);
      renderScanList();
    });
    renderScanList();
  }

  /* ---------------- Meta hora a hora simulator ---------------- */
  const metaState = { total: 1250, hourValue: 450, hourlyTarget: 500 };
  const metaTotalEl = document.getElementById('meta-total');
  const metaFillEl = document.getElementById('meta-fill');
  const metaPercentEl = document.getElementById('meta-percent');
  const metaAlertEl = document.getElementById('meta-alert');
  const saleInput = document.getElementById('sale-input');
  const registerSaleBtn = document.getElementById('register-sale-btn');

  function renderMeta() {
    const pct = Math.min(100, Math.round((metaState.hourValue / metaState.hourlyTarget) * 100));
    const remaining = metaState.hourlyTarget - metaState.hourValue;
    if (metaTotalEl) metaTotalEl.textContent = fmtBRL(metaState.total);
    if (metaFillEl) metaFillEl.style.width = pct + '%';
    if (metaPercentEl) metaPercentEl.textContent = pct + '% da meta das 11h–12h';
    if (metaAlertEl) {
      if (pct >= 100) {
        metaAlertEl.textContent = '🎉 Meta da hora batida! Equipe motivada rumo ao próximo bloco.';
        metaAlertEl.classList.add('is-success');
      } else {
        metaAlertEl.textContent = `🔥 Faltam ${fmtBRL(remaining)} para bater a meta das 11h–12h.`;
        metaAlertEl.classList.remove('is-success');
      }
    }
  }

  if (registerSaleBtn && saleInput) {
    registerSaleBtn.addEventListener('click', () => {
      const val = parseFloat(saleInput.value.replace(',', '.'));
      if (!val || val <= 0) return;
      metaState.total += val;
      metaState.hourValue += val;
      saleInput.value = '';
      renderMeta();
    });
    saleInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') registerSaleBtn.click();
    });
    renderMeta();
  }

  /* ---------------- DISC selector ---------------- */
  const DISC_DATA = [
    { letter: 'D', name: 'Dominância', label: 'Dominância (D):', text: 'foco em metas e fechamento direto. Ótimo para vendas corporativas e negociação de grandes pedidos.' },
    { letter: 'I', name: 'Influência', label: 'Influência (I):', text: 'comunicador nato, cria conexão rápido. Ideal na recepção e no atendimento de balcão.' },
    { letter: 'S', name: 'Estabilidade', label: 'Estabilidade (S):', text: 'paciente e organizado, sustenta o ritmo da loja. Bom em atendimento consultivo e suporte à equipe.' },
    { letter: 'C', name: 'Conformidade', label: 'Conformidade (C):', text: 'atenção total a detalhes e regras. O perfil certo para conferência de notas e fechamento de caixa.' },
  ];

  const discButtons = document.querySelectorAll('.disc-btn');
  const discResultLabel = document.getElementById('disc-result-label');
  const discResultText = document.getElementById('disc-result-text');

  function setDiscActive(letter) {
    discButtons.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.letter === letter));
    const profile = DISC_DATA.find((d) => d.letter === letter);
    if (profile && discResultLabel && discResultText) {
      discResultLabel.textContent = profile.label;
      discResultText.textContent = ' ' + profile.text;
    }
  }

  discButtons.forEach((btn) => {
    btn.addEventListener('click', () => setDiscActive(btn.dataset.letter));
  });

  /* ---------------- FAQ accordion ---------------- */
  document.querySelectorAll('.faq-item').forEach((item) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');
    if (!question || !answer || !icon) return;
    question.addEventListener('click', () => {
      const isOpen = answer.hidden === false;
      answer.hidden = isOpen;
      icon.textContent = isOpen ? '+' : '−';
      question.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ---------------- Stripe Checkout ---------------- */
  async function startCheckout(plan, email, button) {
    const originalLabel = button ? button.textContent : '';
    if (button) {
      button.disabled = true;
      button.textContent = 'Abrindo checkout…';
    }
    try {
      const res = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, email: email || undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Não foi possível iniciar o checkout.');
      }
      window.location.href = data.url;
    } catch (err) {
      if (button) {
        button.disabled = false;
        button.textContent = originalLabel;
      }
      const errorTarget = document.getElementById(
        button && button.dataset.errorTarget ? button.dataset.errorTarget : ''
      );
      if (errorTarget) {
        errorTarget.textContent = err.message || 'Erro ao abrir o checkout. Tente novamente.';
        errorTarget.hidden = false;
      } else {
        alert(err.message || 'Erro ao abrir o checkout. Tente novamente.');
      }
    }
  }

  document.querySelectorAll('[data-checkout-plan]').forEach((button) => {
    button.addEventListener('click', () => {
      startCheckout(button.dataset.checkoutPlan, null, button);
    });
  });

  const trialForm = document.getElementById('trial-form');
  if (trialForm) {
    trialForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailField = document.getElementById('trial-email');
      const submitBtn = document.getElementById('trial-submit-btn');
      const email = emailField ? emailField.value.trim() : '';
      if (!email) {
        emailField?.focus();
        return;
      }
      startCheckout('rede', email, submitBtn);
    });
  }
})();
