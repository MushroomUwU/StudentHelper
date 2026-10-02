// ==========================================================================
// Высшая Математика — Интерактивный учебный портал
// Основной скрипт приложения (app.js)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  const modules = window.MATH_MODULES || [];
  let currentModuleIndex = 0;
  let currentTopicIndex = 0;
  let activeTab = "theory"; // "theory" | "examples" | "cheat" | "tools"

  // Elements
  const sidebarNav = document.getElementById("module-nav-list");
  const topicContainer = document.getElementById("topic-content-container");
  const searchInput = document.getElementById("search-input");
  const searchModal = document.getElementById("search-modal");
  const searchResultsList = document.getElementById("search-results-list");
  const closeModalBtn = document.getElementById("btn-close-modal");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const menuToggleBtn = document.getElementById("menu-toggle-btn");
  const appSidebar = document.getElementById("app-sidebar");
  const sidebarOverlay = document.getElementById("sidebar-overlay");
  const mobileSearchBtn = document.getElementById("mobile-search-btn");
  const modalSearchInput = document.getElementById("modal-search-input");

  function closeSidebarMobile() {
    if (appSidebar) appSidebar.classList.remove("open");
    if (sidebarOverlay) sidebarOverlay.classList.remove("visible");
  }

  // State in localStorage
  const savedTheme = localStorage.getItem("matan_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  // Render Sidebar
  function renderSidebar() {
    sidebarNav.innerHTML = "";
    modules.forEach((mod, mIdx) => {
      const li = document.createElement("li");
      li.className = `nav-module-item ${mIdx === currentModuleIndex ? "open" : ""}`;

      const btn = document.createElement("button");
      btn.className = `nav-module-btn ${mIdx === currentModuleIndex ? "active" : ""}`;
      btn.innerHTML = `
        <span class="nav-module-title">
          <span class="nav-icon">${mod.icon}</span>
          <span>${mod.title}</span>
        </span>
        <span class="chevron-icon">▶</span>
      `;

      btn.addEventListener("click", () => {
        const isOpen = li.classList.contains("open");
        document.querySelectorAll(".nav-module-item").forEach(item => item.classList.remove("open"));
        if (!isOpen) {
          li.classList.add("open");
        }
        selectTopic(mIdx, 0);
        if (window.innerWidth <= 768) {
          closeSidebarMobile();
        }
      });

      const sublist = document.createElement("ul");
      sublist.className = "nav-topics-sublist";

      mod.topics.forEach((t, tIdx) => {
        const subLi = document.createElement("li");
        const a = document.createElement("a");
        a.href = "#";
        a.className = `nav-topic-link ${mIdx === currentModuleIndex && tIdx === currentTopicIndex ? "active" : ""}`;
        a.textContent = t.title;

        a.addEventListener("click", (e) => {
          e.preventDefault();
          selectTopic(mIdx, tIdx);
          closeSidebarMobile();
        });

        subLi.appendChild(a);
        sublist.appendChild(subLi);
      });

      li.appendChild(btn);
      li.appendChild(sublist);
      sidebarNav.appendChild(li);
    });
  }

  // Select and Render Topic
  function selectTopic(mIdx, tIdx) {
    currentModuleIndex = mIdx;
    currentTopicIndex = tIdx;
    activeTab = "theory"; // Always open chapter from the beginning (theory tab)
    renderSidebar();
    renderContent();
    
    // Always scroll content container to the very top
    const appMain = document.querySelector(".app-main");
    if (appMain) {
      appMain.scrollTop = 0;
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    requestAnimationFrame(() => {
      if (appMain) appMain.scrollTop = 0;
      window.scrollTo(0, 0);
    });
  }

  // Render Main Content
  function renderContent() {
    const mod = modules[currentModuleIndex];
    if (!mod) return;
    const topic = mod.topics[currentTopicIndex];
    if (!topic) return;

    let html = `
      <div class="topic-header">
        <div class="topic-breadcrumbs">
          <span class="crumb-module">${mod.icon} ${mod.title}</span>
          <span class="crumb-sep">/</span>
          <span class="crumb-topic">${topic.title}</span>
        </div>
        <h2 class="topic-title">${topic.title}</h2>
        <div class="topic-source-tag">
          <span>📄 Источник: ${mod.source}</span>
        </div>
      </div>

      <div class="topic-tabs">
        <button class="tab-btn ${activeTab === "theory" ? "active" : ""}" data-tab="theory">
          <span>💡 Теория и объяснение</span>
        </button>
        <button class="tab-btn ${activeTab === "examples" ? "active" : ""}" data-tab="examples">
          <span>📝 Примеры с решениями (${topic.examples ? topic.examples.length : 0})</span>
        </button>
        <button class="tab-btn ${activeTab === "cheat" ? "active" : ""}" data-tab="cheat">
          <span>📌 Шпаргалка</span>
        </button>
        <button class="tab-btn ${activeTab === "tools" ? "active" : ""}" data-tab="tools">
          <span>🧮 Интерактивный расчет</span>
        </button>
      </div>

      <div class="tab-content-area">
    `;

    if (activeTab === "theory") {
      html += renderTheoryTab(topic);
    } else if (activeTab === "examples") {
      html += renderExamplesTab(topic);
    } else if (activeTab === "cheat") {
      html += renderCheatTab(topic);
    } else if (activeTab === "tools") {
      html += renderToolsTab(topic);
    }

    html += `</div>`;
    topicContainer.innerHTML = html;

    // Attach Tab Events
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        activeTab = btn.dataset.tab;
        renderContent();
        const appMain = document.querySelector(".app-main");
        if (appMain) {
          appMain.scrollTop = 0;
        }
      });
    });

    // Attach Calculator Tool Handlers if in tools tab
    if (activeTab === "tools") {
      initToolHandlers();
    }

    // Auto-render KaTeX math formulas
    renderMath();
  }

  // Theory Tab HTML
  function renderTheoryTab(topic) {
    let rulesHtml = "";
    if (topic.rules && topic.rules.length > 0) {
      rulesHtml = `
        <div class="card-algorithm">
          <div class="card-algo-title">
            <span>⚡ Ключевые правила и логика темы</span>
          </div>
          <ul class="algo-steps">
            ${topic.rules.map(r => `<li class="algo-step">${formatMathText(r)}</li>`).join("")}
          </ul>
        </div>
      `;
    }

    return `
      <!-- ELI5 Simple Language Box -->
      <div class="card-eli5">
        <div class="card-eli5-header">
          <span class="card-eli5-badge">Простыми словами</span>
          <h3 class="card-eli5-title">Интуиция и наглядная суть</h3>
        </div>
        <div class="card-eli5-body">
          <p>${formatMathText(topic.eli5)}</p>
        </div>
      </div>

      <!-- Rigorous University Academic Formulation Box -->
      <div class="card-academic">
        <div class="card-academic-header">
          <h3 class="card-academic-title">
            <span>📚 Строгая университетская формулировка</span>
          </h3>
          <span class="academic-badge">Материалы лекций</span>
        </div>
        <div class="card-academic-body">
          ${formatMathText(topic.academic).replace(/\n/g, "<br>")}
        </div>
      </div>

      ${rulesHtml}
    `;
  }

  // Examples Tab HTML
  function renderExamplesTab(topic) {
    if (!topic.examples || topic.examples.length === 0) {
      return `<p style="color: var(--text-muted); padding: 20px;">Для данной темы примеры оформлены внутри теоретического блока.</p>`;
    }

    return topic.examples.map((ex, idx) => `
      <div class="card-example">
        <div class="card-example-header">
          <div class="card-example-title">
            <span>🔍 ${ex.title}</span>
          </div>
        </div>
        <div class="example-task">
          <strong>Условие:</strong> ${formatMathText(ex.task)}
        </div>
        <div class="example-solution">
          <div class="example-step-desc">Пошаговое решение из университетских материалов:</div>
          ${ex.steps.map(step => `
            <div class="example-solution-step">
              ${formatMathText(step)}
            </div>
          `).join("")}
        </div>
        <div class="example-answer">
          <strong>Ответ:</strong> ${formatMathText(ex.answer)}
        </div>
      </div>
    `).join("");
  }

  // Cheat Sheet Tab HTML
  function renderCheatTab(topic) {
    if (!topic.cheat_sheet || topic.cheat_sheet.length === 0) {
      return `<p style="color: var(--text-muted); padding: 20px;">Шпаргалка формируется по материалам темы.</p>`;
    }

    return `
      <div class="card-academic">
        <h3 class="card-academic-title" style="margin-bottom: 16px;">
          <span>📌 Шпаргалка и экспресс-сводка к зачету / экзамену</span>
        </h3>
        <table class="cheat-table">
          <thead>
            <tr>
              <th style="width: 35%;">Понятие / Формула</th>
              <th>Что это значит / Формулировка</th>
            </tr>
          </thead>
          <tbody>
            ${topic.cheat_sheet.map(item => `
              <tr>
                <td><strong>${formatMathText(item.term)}</strong></td>
                <td>${formatMathText(item.meaning)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  // Tools Tab HTML
  function renderToolsTab(topic) {
    return `
      <!-- Tool 1: Determinant Calculator -->
      <div class="card-tool">
        <div class="card-tool-title">
          <span>🧮 Определитель матрицы 2×2 и 3×3</span>
        </div>
        <p class="card-tool-desc">
          Вычисляет определитель по правилам из Главы 2 (разность крест-накрест и схема треугольников) с пошаговыми пояснениями.
        </p>
        <div class="tool-inputs">
          <div class="tool-input-group">
            <label>Строка 1 (через пробел):</label>
            <input type="text" id="det-r1" class="tool-input" value="1 -5 6" placeholder="например: 1 -5 6">
          </div>
          <div class="tool-input-group">
            <label>Строка 2 (через пробел):</label>
            <input type="text" id="det-r2" class="tool-input" value="2 4 7" placeholder="например: 2 4 7">
          </div>
          <div class="tool-input-group">
            <label>Строка 3 (через пробел, оставьте пустым для 2×2):</label>
            <input type="text" id="det-r3" class="tool-input" value="3 2 8" placeholder="например: 3 2 8">
          </div>
        </div>
        <button id="btn-calc-det" class="btn-tool">Вычислить определитель</button>
        <div id="det-result" class="tool-output"></div>
      </div>

      <!-- Tool 2: Vectors Dot & Cross Product -->
      <div class="card-tool" style="border-left-color: var(--accent-emerald);">
        <div class="card-tool-title" style="color: var(--accent-emerald);">
          <span>🏹 Скалярное и векторное произведение в $\\mathbb{R}^3$</span>
        </div>
        <p class="card-tool-desc">
          Вычисляет $(\\vec{a}, \\vec{b})$, длину $|\\vec{a}|$, $|\\vec{b}|$, угол $\\varphi$ и векторное произведение $[\\vec{a}, \\vec{b}]$ по формулам Главы 3.
        </p>
        <div class="tool-inputs">
          <div class="tool-input-group">
            <label>Вектор $\\vec{a} = (x, y, z)$:</label>
            <input type="text" id="vec-a" class="tool-input" value="2, -3, 1" placeholder="2, -3, 1">
          </div>
          <div class="tool-input-group">
            <label>Вектор $\\vec{b} = (x, y, z)$:</label>
            <input type="text" id="vec-b" class="tool-input" value="3, -2, 4" placeholder="3, -2, 4">
          </div>
        </div>
        <button id="btn-calc-vec" class="btn-tool" style="background: var(--accent-emerald);">Вычислить произведения</button>
        <div id="vec-result" class="tool-output"></div>
      </div>

      <!-- Tool 3: Complex Numbers Arithmetic -->
      <div class="card-tool" style="border-left-color: var(--accent-secondary);">
        <div class="card-tool-title" style="color: var(--accent-secondary);">
          <span>⚡ Калькулятор комплексных чисел</span>
        </div>
        <p class="card-tool-desc">
          Сложение, вычитание, умножение, деление и переход к тригонометрической форме по Главе 1.
        </p>
        <div class="tool-inputs">
          <div class="tool-input-group">
            <label>Число $z_1 = x_1 + i y_1$ (через запятую x, y):</label>
            <input type="text" id="cplx-z1" class="tool-input" value="2, -2" placeholder="например 2, -2">
          </div>
          <div class="tool-input-group">
            <label>Число $z_2 = x_2 + i y_2$ (через запятую x, y):</label>
            <input type="text" id="cplx-z2" class="tool-input" value="-1, 1.732" placeholder="например -1, 1.732">
          </div>
        </div>
        <button id="btn-calc-cplx" class="btn-tool" style="background: var(--accent-secondary);">Посчитать $z_1, z_2$</button>
        <div id="cplx-result" class="tool-output"></div>
      </div>
    `;
  }

  // Calculator Event Listeners
  function initToolHandlers() {
    // 1. Determinant
    const btnDet = document.getElementById("btn-calc-det");
    if (btnDet) {
      btnDet.addEventListener("click", () => {
        const r1 = document.getElementById("det-r1").value.trim().split(/\s+/).map(Number);
        const r2 = document.getElementById("det-r2").value.trim().split(/\s+/).map(Number);
        const r3Str = document.getElementById("det-r3").value.trim();
        const out = document.getElementById("det-result");

        if (r3Str === "" && r1.length >= 2 && r2.length >= 2) {
          // 2x2
          const d = r1[0] * r2[1] - r1[1] * r2[0];
          out.innerHTML = `Матрица 2×2:\n$$\\det \\begin{pmatrix} ${r1[0]} & ${r1[1]} \\\\ ${r2[0]} & ${r2[1]} \\end{pmatrix} = (${r1[0]})\\cdot(${r2[1]}) - (${r1[1]})\\cdot(${r2[0]}) = ${d}$$\nОтвет: det A = ${d}`;
          out.classList.add("visible");
          renderMath();
        } else {
          const r3 = r3Str.split(/\s+/).map(Number);
          if (r1.length >= 3 && r2.length >= 3 && r3.length >= 3) {
            // 3x3
            const p1 = r1[0] * r2[1] * r3[2];
            const p2 = r1[1] * r2[2] * r3[0];
            const p3 = r1[2] * r2[0] * r3[1];
            const m1 = r1[2] * r2[1] * r3[0];
            const m2 = r1[1] * r2[0] * r3[2];
            const m3 = r1[0] * r2[2] * r3[1];
            const det = p1 + p2 + p3 - m1 - m2 - m3;

            out.innerHTML = `По формуле схемы треугольников (Глава 2.3):\n` +
              `$$\\det = (${p1}) + (${p2}) + (${p3}) - (${m1}) - (${m2}) - (${m3}) = ${det}$$\n` +
              `Ответ: det A = ${det}`;
            out.classList.add("visible");
            renderMath();
          } else {
            out.textContent = "Ошибка ввода: укажите числа через пробел (2 строки по 2 числа или 3 строки по 3 числа).";
            out.classList.add("visible");
          }
        }
      });
    }

    // 2. Vectors
    const btnVec = document.getElementById("btn-calc-vec");
    if (btnVec) {
      btnVec.addEventListener("click", () => {
        const a = document.getElementById("vec-a").value.split(/[, ]+/).filter(Boolean).map(Number);
        const b = document.getElementById("vec-b").value.split(/[, ]+/).filter(Boolean).map(Number);
        const out = document.getElementById("vec-result");

        if (a.length === 3 && b.length === 3) {
          const dot = a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
          const lenA = Math.sqrt(a[0]**2 + a[1]**2 + a[2]**2);
          const lenB = Math.sqrt(b[0]**2 + b[1]**2 + b[2]**2);
          const cosPhi = (lenA * lenB > 0) ? (dot / (lenA * lenB)) : 0;
          const deg = (Math.acos(Math.max(-1, Math.min(1, cosPhi))) * 180 / Math.PI).toFixed(2);

          const cx = a[1]*b[2] - a[2]*b[1];
          const cy = -(a[0]*b[2] - a[2]*b[0]);
          const cz = a[0]*b[1] - a[1]*b[0];
          const lenC = Math.sqrt(cx**2 + cy**2 + cz**2).toFixed(3);

          out.innerHTML = `1. Скалярное произведение: $(\\vec{a}, \\vec{b}) = ${a[0]}\\cdot${b[0]} + ${a[1]}\\cdot${b[1]} + ${a[2]}\\cdot${b[2]} = ${dot}$\n` +
            `2. Длины: $|\\vec{a}| = ${lenA.toFixed(3)}$, $|\\vec{b}| = ${lenB.toFixed(3)}$\n` +
            `3. Угол: $\\cos\\varphi = ${cosPhi.toFixed(4)} \\implies \\varphi \\approx ${deg}^\\circ$\n` +
            `4. Векторное произведение: $[\\vec{a}, \\vec{b}] = (${cx}, ${cy}, ${cz})$\n` +
            `5. Площадь параллелограмма: $S = |[\\vec{a}, \\vec{b}]| = ${lenC}$`;
          out.classList.add("visible");
          renderMath();
        } else {
          out.textContent = "Укажите по 3 координаты для каждого вектора через запятую.";
          out.classList.add("visible");
        }
      });
    }

    // 3. Complex Numbers
    const btnCplx = document.getElementById("btn-calc-cplx");
    if (btnCplx) {
      btnCplx.addEventListener("click", () => {
        const z1 = document.getElementById("cplx-z1").value.split(/[, ]+/).filter(Boolean).map(Number);
        const z2 = document.getElementById("cplx-z2").value.split(/[, ]+/).filter(Boolean).map(Number);
        const out = document.getElementById("cplx-result");

        if (z1.length >= 2 && z2.length >= 2) {
          const x1 = z1[0], y1 = z1[1];
          const x2 = z2[0], y2 = z2[1];

          const sumR = x1 + x2, sumI = y1 + y2;
          const diffR = x1 - x2, diffI = y1 - y2;
          const prodR = x1*x2 - y1*y2, prodI = x1*y2 + x2*y1;
          const denom = x2**2 + y2**2;
          const divR = (x1*x2 + y1*y2) / denom;
          const divI = (x2*y1 - x1*y2) / denom;

          const mod1 = Math.sqrt(x1**2 + y1**2).toFixed(3);
          const arg1 = (Math.atan2(y1, x1) * 180 / Math.PI).toFixed(1);

          out.innerHTML = `Сумма $z_1 + z_2 = ${sumR} + (${sumI})i$\n` +
            `Разность $z_1 - z_2 = ${diffR} + (${diffI})i$\n` +
            `Произведение $z_1 z_2 = ${prodR} + (${prodI})i$\n` +
            `Частное $z_1 / z_2 = ${divR.toFixed(3)} + (${divI.toFixed(3)})i$\n` +
            `Модуль $|z_1| = ${mod1}$, угол $\\arg z_1 \\approx ${arg1}^\\circ$`;
          out.classList.add("visible");
          renderMath();
        } else {
          out.textContent = "Укажите вещественную и мнимую часть через запятую (например 2, -2).";
          out.classList.add("visible");
        }
      });
    }
  }

  // Math formatting helper
  function formatMathText(txt) {
    if (!txt) return "";
    return txt;
  }

  // KaTeX rendering
  function renderMath() {
    if (window.renderMathInElement) {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ],
        throwOnError: false
      });
    }
  }

  // Search Engine
  function performSearch(query) {
    if (!query || query.trim().length < 2) {
      searchModal.style.display = "none";
      return;
    }

    const q = query.toLowerCase();
    const results = [];

    modules.forEach((mod, mIdx) => {
      mod.topics.forEach((t, tIdx) => {
        let score = 0;
        let snippet = "";

        if (t.title.toLowerCase().includes(q)) {
          score += 10;
          snippet = t.simple_summary;
        } else if (t.simple_summary.toLowerCase().includes(q)) {
          score += 5;
          snippet = t.simple_summary;
        } else if (t.eli5.toLowerCase().includes(q)) {
          score += 3;
          snippet = t.eli5.slice(0, 160) + "...";
        } else if (t.academic.toLowerCase().includes(q)) {
          score += 2;
          snippet = t.academic.slice(0, 160) + "...";
        }

        if (score > 0) {
          results.push({ mIdx, tIdx, modTitle: mod.title, title: t.title, snippet, score });
        }
      });
    });

    results.sort((a, b) => b.score - a.score);

    if (results.length === 0) {
      searchResultsList.innerHTML = `<li style="padding: 16px; color: var(--text-muted);">Ничего не найдено в материалах курса по запросу "${query}".</li>`;
    } else {
      searchResultsList.innerHTML = results.map(r => `
        <li class="search-result-item" data-m="${r.mIdx}" data-t="${r.tIdx}">
          <div class="search-result-module">${r.modTitle}</div>
          <div class="search-result-title">${highlightQuery(r.title, query)}</div>
          <div class="search-result-snippet">${highlightQuery(r.snippet, query)}</div>
        </li>
      `).join("");

      document.querySelectorAll(".search-result-item").forEach(item => {
        item.addEventListener("click", () => {
          const m = parseInt(item.dataset.m, 10);
          const t = parseInt(item.dataset.t, 10);
          searchModal.style.display = "none";
          if (searchInput) searchInput.value = "";
          if (modalSearchInput) modalSearchInput.value = "";
          closeSidebarMobile();
          selectTopic(m, t);
        });
      });
    }

    searchModal.style.display = "flex";
  }

  function highlightQuery(text, query) {
    if (!text) return "";
    const reg = new RegExp(`(${escapeRegExp(query)})`, "gi");
    return text.replace(reg, `<span class="highlight">$1</span>`);
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Search input events
  let searchTimeout = null;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      performSearch(e.target.value.trim());
    }, 200);
  });

  closeModalBtn.addEventListener("click", () => {
    searchModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === searchModal) {
      searchModal.style.display = "none";
    }
  });

  // Mobile search trigger
  if (mobileSearchBtn) {
    mobileSearchBtn.addEventListener("click", () => {
      searchModal.style.display = "flex";
      if (modalSearchInput) {
        modalSearchInput.value = searchInput ? searchInput.value : "";
        modalSearchInput.focus();
      }
    });
  }

  // Modal search input
  if (modalSearchInput) {
    modalSearchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      const val = e.target.value.trim();
      if (searchInput) searchInput.value = val;
      searchTimeout = setTimeout(() => {
        performSearch(val);
      }, 200);
    });
  }

  // Sidebar overlay
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", () => {
      closeSidebarMobile();
    });
  }

  // Mobile menu toggle
  menuToggleBtn.addEventListener("click", () => {
    const isOpen = appSidebar.classList.toggle("open");
    if (sidebarOverlay) {
      sidebarOverlay.classList.toggle("visible", isOpen);
    }
  });

  // Theme Toggle
  themeToggleBtn.addEventListener("click", () => {
    const curTheme = document.documentElement.getAttribute("data-theme") || "dark";
    const newTheme = curTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("matan_theme", newTheme);
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    themeToggleBtn.textContent = theme === "dark" ? "🌙" : "☀️";
  }

  // Prevent rubber-banding and overscroll when dragging on header / mobile subbar
  const appHeader = document.querySelector(".app-header");
  const mobileSubbar = document.querySelector(".mobile-subbar");
  [appHeader, mobileSubbar].forEach(el => {
    if (el) {
      el.addEventListener("touchmove", (e) => {
        // Prevent outer viewport scroll when touching header
        e.preventDefault();
      }, { passive: false });
    }
  });

  // Initial Run
  renderSidebar();
  renderContent();
});
