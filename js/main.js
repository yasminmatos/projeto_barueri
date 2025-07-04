const CSS_URLS = [
  "/css/styles.css", 
  "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" 
];
const MENU_LINKS = [
  { texto: "Início", url: "/index.html" },
  { texto: "Serviços", url: "/servico.html" },
  { texto: "Notícias", url: "/noticia.html" },
];

/**
 * carrega o componente na url
 * @param {string} url - a url do componente
 * @param {string} elementId - o id 
 */
const loadComponent = async (url, elementId) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro na rede (status ${response.status})`);
    }
    const data = await response.text();
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = data;
    } else {
      console.warn(`Elemento com ID '${elementId}' não encontrado.`);
    }
  } catch (error) {
    console.error(`Falha ao carregar o componente de ${url}:`, error);
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `<p class="text-danger text-center">Erro ao carregar componente.</p>`;
    }
  }
};

/**
 * carrega de forma dinamica a folha de estilo
 * @param {string} url - url da folha de estilo
 * @returns {Promise<HTMLLinkElement>}
 */
function loadStyle(url) {
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    link.onload = () => resolve(link);
    link.onerror = () =>
      reject(new Error(`Falha ao carregar folha de estilo: ${url}`));
    document.head.appendChild(link);
  });
}

function gerarHeadPadrao() {
  const baseUrl = window.location.origin;
  const headContent = `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="author" content="Prefeitura de Barueri" />
    <link rel="icon" href="${baseUrl}/images/favicon.ico" type="image/x-icon" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Montserrat:wght@700&display=swap" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
    <meta name="description" content="Site oficial da Prefeitura de Barueri">
    <meta property="og:title" content="Prefeitura de Barueri" />
    <meta property="og:description" content="Site oficial da Prefeitura de Barueri" />
    <meta property="og:image" content="${baseUrl}/images/logo-padrao-redes.jpg" />
    <meta property="og:url" content="${window.location.href}" />
  `;
  document.head.innerHTML += headContent;
}

/**
 * inicializa o widget do VLibras
 */
function inicializarVlibras() {
  const divVlibras = document.createElement("div");
  divVlibras.setAttribute("vw", "");
  divVlibras.classList.add("enabled");
  divVlibras.innerHTML = `
    <div vw-access-button class="active"></div>
    <div vw-plugin-wrapper>
      <div class="vw-plugin-top-wrapper"></div>
    </div>`;
  document.body.appendChild(divVlibras);

  const scriptPlugin = document.createElement("script");
  scriptPlugin.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
  scriptPlugin.onload = () => {
    const scriptInit = document.createElement("script");
    scriptInit.textContent = `new window.VLibras.Widget('https://vlibras.gov.br/app')`;
    document.body.appendChild(scriptInit);
  };
  scriptPlugin.onerror = () => {
    console.error("Falha ao carregar o script do plugin VLibras.");
  };
  document.body.appendChild(scriptPlugin);
}

//configura o menu lateral
function setupMenuLateral() {
  const listaPlaceholder = document.getElementById("sidenav-list-placeholder");
  if (listaPlaceholder) {
    listaPlaceholder.innerHTML = MENU_LINKS.map(link => `<li><a href="${link.url}">${link.texto}</a></li>`).join('');
  }

  const titlePlaceholder = document.getElementById("page-title-placeholder");
  if (titlePlaceholder) {
    try {
      const pageTitle = document.title.split("-")[1].trim();
      titlePlaceholder.textContent = pageTitle;
    } catch (e) {
      console.warn("Não foi possível extrair o título da página do document.title.");
    }
  }

  // adiciona eventos aos botões
  const openMenuBtn = document.getElementById("open-menu-btn");
  const closeMenuBtn = document.getElementById("close-menu-btn");
  const sideMenu = document.getElementById("side-menu");
  const overlay = document.getElementById("overlay");

  if (openMenuBtn && closeMenuBtn && sideMenu && overlay) {
    const openMenu = () => {
      sideMenu.classList.add("is-open");
      overlay.classList.add("is-active");
    };
    const closeMenu = () => {
      sideMenu.classList.remove("is-open");
      overlay.classList.remove("is-active");
    };

    openMenuBtn.addEventListener("click", openMenu);
    closeMenuBtn.addEventListener("click", closeMenu);
    overlay.addEventListener("click", closeMenu);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sideMenu.classList.contains("is-open")) {
        closeMenu();
      }
    });
  }
}

function setupBotaoVoltarAoTopo() {
  const btnTop = document.getElementById("btn-top-component");
  if (!btnTop) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      btnTop.classList.remove("d-none");
    } else {
      btnTop.classList.add("d-none");
    }
  });
}

/**
 * configura o rodapé, atualizando o ano atual
 */
function setupFooter() {
  const yearSpan = document.getElementById("current-year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
  if (typeof renderizaFooter === "function") {
    renderizaFooter();
  }
}

/**
 * configura o botão de compartilhamento
 */
async function setupBotaoCompartilhar() {
  const botao = document.getElementById("botao-compartilhar");
  if (!botao) return;

  botao.addEventListener("click", async () => {
    const shareData = {
      title: document.title,
      text: "Confira esta notícia:",
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copiado para a área de transferência!");
      } else {
        throw new Error("Navegador não suporta as APIs de Compartilhamento ou Clipboard.");
      }
    } catch (err) {
      console.error("Erro ao compartilhar ou copiar:", err);
      alert("Não foi possível compartilhar ou copiar o link.");
    }
  });
}

function setupCollapseIcon() {
  const collapseSummary = document.getElementById("collapseSummary");
  const icon = document.querySelector(".collapse-rotate-icon");

  if (collapseSummary && icon) {
    collapseSummary.addEventListener("show.bs.collapse", () => {
      icon.classList.add("rotated");
    });
    collapseSummary.addEventListener("hide.bs.collapse", () => {
      icon.classList.remove("rotated");
    });
  }
}

async function inicializarPagina() {
  try {
    gerarHeadPadrao();

    // carrega todos os CSS em paralelo e aguarda a conclusão
    await Promise.all(CSS_URLS.map(loadStyle));
    console.log("Folhas de estilo carregadas com sucesso.");

    // inicializa VLibras
    inicializarVlibras();

    await loadComponent("/components/_banners.html", "banners");
    if (typeof renderBannersHome === 'function') {
      renderBannersHome();
    }

    await loadComponent("/components/_servicos-carrossel.html", "servicos-carrossel");
    if (typeof renderServicosCarrossel === 'function') {
      renderServicosCarrossel();
    }

    await loadComponent("/components/_noticias-grid.html", "noticias-grid");
    if (typeof renderGridNoticiasHome === 'function') {
      renderGridNoticiasHome();
    }

    await loadComponent("/components/_pesquisa-home.html", "pesquisa-home");
    if (typeof initPesquisaHome === 'function') {
      initPesquisaHome();
    }

    // carrega os componentes restantes 
    await Promise.all([
      loadComponent("/components/_acessibilidade.html", "acessibilidade").then(() => {
        // dispara o evento de acessibilidade assim que o componente estiver pronto
        document.dispatchEvent(new Event("accessibilityReady"));
      }),
      loadComponent("/components/_header.html", "header"),
      loadComponent("/components/_btn-top.html", "btn-top"),
      loadComponent("/components/_page-header.html", "sidenav"),
      loadComponent("/components/_footer.html", "footer"),
    ]);

    // executa as funções de setup restantes
    setupBotaoVoltarAoTopo();
    setupFooter();
    setupMenuLateral();
    setupCollapseIcon();
    setupBotaoCompartilhar();

    console.log("Todos os componentes e scripts foram inicializados com sucesso.");

  } catch (error) {
    console.error("Ocorreu um erro fatal durante a inicialização da página:", error);
  }
}

document.addEventListener("DOMContentLoaded", inicializarPagina);

