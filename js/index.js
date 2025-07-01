// Ouve o evento accessibilityReady
document.addEventListener("accessibilityReady", () => {
  const htmlElement = document.documentElement;
  const bodyElement = document.body;

  const FONT_SIZE_KEY = "accessibility_font_size";
  const CONTRAST_KEY = "accessibility_contrast";

  // --- aplica classes de alto contraste ---
  const contrastToggle = document.getElementById("contrast-toggle");

  const applyContrast = (isHighContrast) => {
    bodyElement.classList.toggle("high-contrast", isHighContrast);
  };

  const savedContrast = localStorage.getItem(CONTRAST_KEY) === "true";
  applyContrast(savedContrast);

  if (contrastToggle) {
    contrastToggle.addEventListener("click", () => {
      const isHighContrast = !bodyElement.classList.contains("high-contrast");
      applyContrast(isHighContrast);
      localStorage.setItem(CONTRAST_KEY, isHighContrast);
    });
  }

  // --- tamanho da fonte ---
  const fontIncrease = document.getElementById("font-increase");
  const fontDecrease = document.getElementById("font-decrease");
  const fontReset = document.getElementById("font-reset");
  const baseFontSize = 1; // 1rem = tamanho base

  const applyFontSize = (size) => {
    htmlElement.style.fontSize = `${size}rem`;
  };

  // Carrega o tamanho da fonte salvo quando a página é aberta
  const savedFontSize = parseFloat(localStorage.getItem(FONT_SIZE_KEY));
  if (!isNaN(savedFontSize)) {
    applyFontSize(savedFontSize);
  }

  // --- Aumentar a Fonte  ---
  if (fontIncrease) {
    fontIncrease.addEventListener("click", () => {
      let currentSize =
        parseFloat(window.getComputedStyle(htmlElement).fontSize) / 16;
      if (currentSize < baseFontSize * 1.5) {
        // até 150% do tamanho original
        let newSize = currentSize + 0.1;
        applyFontSize(newSize);
        localStorage.setItem(FONT_SIZE_KEY, newSize);
      }
    });
  }

  // --- Diminuir a Fonte---
  if (fontDecrease) {
    fontDecrease.addEventListener("click", () => {
      let currentSize =
        parseFloat(window.getComputedStyle(htmlElement).fontSize) / 16;
      // limite para não diminuir infinitamente e o texto sumir
      if (currentSize > baseFontSize * 0.7) {
        // até 70% do tamanho original
        let newSize = currentSize - 0.1;
        applyFontSize(newSize);
        localStorage.setItem(FONT_SIZE_KEY, newSize);
      }
    });
  }

  // --- Resetar a Fonte ---
  if (fontReset) {
    fontReset.addEventListener("click", () => {
      // Aplica o tamanho base
      applyFontSize(baseFontSize);
      // remove a preferência salva para que a página continue resetada
      localStorage.removeItem(FONT_SIZE_KEY);
    });
  }
});
async function initPesquisaHome() {
  let allSearchableItems = []; // Array para guardar dados

  // Seleciona os elementos do HTML
  const searchInput = document.getElementById("hero-search-input");
  const suggestionsList = document.getElementById("suggestions-list");
  const suggestionsContainer = document.querySelector(
    ".search-suggestions-container"
  );

  if (!searchInput || !suggestionsList) {
    console.error("Elementos de busca não encontrados.");
    return;
  }

  // 1. Busca os dados da api
  try {
    const response = await fetch("/api/search-data.json");
    allSearchableItems = await response.json();
  } catch (error) {
    console.error("Falha ao carregar dados para a busca:", error);
  }

  //Ouve o que o usuário digita no campo de busca
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();

    // Se o campo estiver vazio, limpa e esconde as sugestões
    if (query.length === 0) {
      suggestionsList.innerHTML = "";
      suggestionsContainer.style.display = "none";
      return;
    }

    // Filtra os dados com base no que foi digitado
    const filteredItems = allSearchableItems.filter((item) =>
      item.title.toLowerCase().includes(query)
    );

    // Se houver resultados, mostra; senão, esconde.
    if (filteredItems.length > 0) {
      // Gera o HTML para as sugestões e insere na página
      suggestionsList.innerHTML = filteredItems
        .map(
          (item) => `
        <li class="list-group-item">
          <a href="${item.url}">
            <strong>${item.title}</strong>
            <small class="text-muted d-block">${item.category}</small>
          </a>
        </li>
      `
        )
        .join("");
      suggestionsContainer.style.display = "block";
    } else {
      suggestionsContainer.style.display = "none";
    }
  });

  // esconde as sugestões se o usuário clicar fora
  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target)) {
      suggestionsContainer.style.display = "none";
    }
  });
}

async function renderBannersHome() {
  const response = await fetch("/api/banners.json");

  if (!response.ok) {
    throw new Error("Falha");
  }
  const data = await response.json();

  const mainSwiperWrappers = document.querySelectorAll(
    ".main-swiper .swiper-wrapper"
  );

  if (data.carouselBanners) {
    const bannersHTML = data.carouselBanners
      .map(
        (banner) => `
          <div class="swiper-slide">
            <img src="${banner.imageUrl}" alt="${banner.altText}">
          </div>
        `
      )
      .join("");
    mainSwiperWrappers.forEach((wrapper) => (wrapper.innerHTML = bannersHTML));
  }

  new Swiper(".d-lg-block .main-swiper", {
    loop: true,
    autoplay: { delay: 5000, disableOnInteraction: false },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: { el: ".swiper-pagination", clickable: true },
  });

  new Swiper(".d-lg-none .main-swiper", {
    loop: true,
    autoplay: { delay: 5000, disableOnInteraction: false },
    pagination: { el: ".swiper-pagination", clickable: true },
  });
}

async function renderServicosCarrossel() {
  try {
    const response = await fetch("/api/servicos.json");
    const servicos = await response.json();
    const swiperWrapper = document.querySelector(
      ".services-swiper .swiper-wrapper"
    );

    if (!swiperWrapper) return;

    // Gera o HTML para cada card/slide
    const slidesHTML = servicos
      .map(
        (servico) => `
      <div class="swiper-slide">
        <a href="${servico.linkUrl}" class="service-card">
          <img src="${servico.imageUrl}" alt="${servico.title}"/>
          <span>${servico.title}</span>
        </a>
      </div>
    `
      )
      .join("");

    // Insere todo o HTML gerado no wrapper
    swiperWrapper.innerHTML = slidesHTML;

    // INICIALIZA O SWIPER
    new Swiper(".services-swiper", {
      slidesPerView: 2,
      grid: {
        rows: 2,
        fill: "row",
      },
      spaceBetween: 10,

      navigation: {
        nextEl: ".services-swiper .swiper-button-next",
        prevEl: ".services-swiper .swiper-button-prev",
      },
      breakpoints: {
        576: { slidesPerView: 3, spaceBetween: 15 },
        768: { slidesPerView: 4, spaceBetween: 20 },
        992: { slidesPerView: 6, spaceBetween: 20 },
      },
    });
  } catch (error) {
    console.error("Erro ao renderizar o slider de serviços:", error);
  }
}
async function renderGridNoticiasHome() {
  try {
    const response = await fetch("/api/noticias.json");
    let noticias = await response.json();
    const gridRow = document.querySelector(".news-grid-section .row");

    if (!gridRow) return;
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      noticias = noticias.slice(0, 3);
    }

    const newsHTML = noticias
      .map((noticia) => {
        const colClasses = noticia.isLarge
          ? "col-12 col-lg-6"
          : "col-12 col-md-6 col-lg-3";
        const cardClass = noticia.isLarge ? "news-card-large" : "";

        return `
        <div class="${colClasses}">
          <a href="${noticia.linkUrl}" class="news-card ${cardClass}">
            <img src="${noticia.imageUrl}" class="news-card-image" alt="${noticia.title}" loading="lazy">
            <div class="news-card-body">
              <h3 class="news-card-title">${noticia.title}</h3>
            </div>
          </a>
        </div>
      `;
      })
      .join("");

    gridRow.innerHTML = newsHTML;
  } catch (error) {
    console.error("Erro ao renderizar a grade de notícias:", error);
  }
}

async function renderizarPaginaDeNoticia() {
  try {
    const response = await fetch("/api/noticias-detalhe.json");
    if (!response.ok) {
      throw new Error("Não foi possível encontrar o arquivo de dados da notícia.");
    }
    const noticia = await response.json();
    //atualizando metatags
    const dadosParaMetaTags = {
      title: noticia.titulo,
      description: noticia.resumo,
      imageUrl: noticia.imagemPrincipalUrl
    };
    atualizarMetaTags(dadosParaMetaTags);

    // preenche o título da aba do navegador
    document.title = `${noticia.titulo} - Prefeitura de Barueri`;

    // preenche o dom
    document.getElementById("noticia-titulo").textContent = noticia.titulo;
    document.getElementById("noticia-data").textContent = noticia.dataPublicacao;
    document.getElementById("noticia-resumo").textContent = noticia.resumo;

    const imgPrincipal = document.getElementById("noticia-imagem-principal");
    imgPrincipal.src = noticia.imagemPrincipalUrl;
    imgPrincipal.alt = noticia.titulo;

    // corpo do artigo
    const corpoContainer = document.getElementById("noticia-corpo");
    let corpoHTML = "";

    noticia.corpo.forEach((bloco) => {
      switch (bloco.tipo) {
        case "paragrafo":
          corpoHTML += `<p>${bloco.conteudo}</p>`;
          break;
        case "subtitulo":
          corpoHTML += `<h1 class="article-subtitle">${bloco.conteudo}</h1>`;
          break;
        case "imagem":
          corpoHTML += `
            <figure class="article-inline-image text-center">
              <img src="${bloco.url}" alt="${bloco.legenda}" class="img-article img-fluid rounded">
              <figcaption>${bloco.legenda}</figcaption>
            </figure>
          `;
          break;
      }
    });

    // insere todo o conteudo de uma vez
    corpoContainer.innerHTML = corpoHTML;

    const relatedListContainer = document.getElementById('related-news-list-container');

    // Verifica se o container existe e se há notícias relacionadas nos dados
    if (relatedListContainer && noticia.noticiasRelacionadas && noticia.noticiasRelacionadas.length > 0) {

      // Abre a lista usando classes do Bootstrap
      let relatedHTML = '<ul class="list-group list-group-flush">';

      // Cria um item de lista para cada notícia relacionada
      noticia.noticiasRelacionadas.forEach(relacionada => {
        relatedHTML += `
          <li class="news-tag">
            <a href="${relacionada.url}">${relacionada.titulo}</a>
          </li>
        `;
      });

      // Fecha a lista
      relatedHTML += '</ul>';

      // Insere todo o HTML gerado no container específico
      relatedListContainer.innerHTML = relatedHTML;
    }

  } catch (error) {
    console.error("Erro ao renderizar a página de notícia:", error);
    document.getElementById("noticia-titulo").textContent = "Erro ao carregar a notícia.";
  }
}

async function renderizarPaginaDeServicos() {
  try {
    const response = await fetch('/api/servicos-interna.json');
    if (!response.ok) throw new Error("Falha ao carregar o banco de dados.");
    const database = await response.json();
    const todosOsServicos = database.servicos;

    // pega os parâmetros da url
    const params = new URLSearchParams(window.location.search);
    const servicoId = params.get('id');

    if (servicoId) {
      // se tem um id na url a página é a de detalhe
      const idNumerico = parseInt(servicoId);
      const servico = todosOsServicos.find(s => s.id === idNumerico);

      if (servico) {
        renderizarDetalhe(servico);
      } else {
        throw new Error(`Serviço com ID ${servicoId} não encontrado.`);
      }
    } else {
      // se nao tem id, é a grid de cards servicos
      renderizarGrid(todosOsServicos);
    }
  } catch (error) {
    console.error("Erro ao renderizar a página de serviços:", error);
  }
}
/**
 * atualiza as metatags
 * essa função pode ser usada em qualquer página (notícias, serviços, etc)
 * @param {object} metaData - um objeto contendo as informações para as tags
 * @param {string} metaData.title - o título para a tag og:title
 * @param {string} metaData.description - a descrição para a tag og:description
 * @param {string} metaData.imageUrl -  url da imagem para a tag og:image
 */
function atualizarMetaTags(metaData) {
  // função auxiliar para encontrar e definir o atributo content
  const setMetaTag = (property, content) => {
    const el = document.querySelector(`meta[property='${property}']`);
    if (el) el.setAttribute('content', content || ''); // usa o conteúdo ou uma string vazia
  };

  // função para a meta tag de description padrão
  const setMetaDescription = (content) => {
    const el = document.querySelector('meta[name="description"]');
    if (el) el.setAttribute('content', content || '');
  }

  // atualiza as tags com os dados padronizados recebidos
  setMetaDescription(metaData.description);
  setMetaTag('og:title', metaData.title);
  setMetaTag('og:description', metaData.description);
  setMetaTag('og:url', window.location.href);

  // verifica se uma imagem foi fornecida
  if (metaData.imageUrl) {
    // garante que a url da imagem seja absoluta com https
    const urlAbsolutaDaImagem = new URL(metaData.imageUrl, window.location.origin).href;
    setMetaTag('og:image', urlAbsolutaDaImagem);
  } else {
    // se não houver imagem específica usa uma imagem padrão
    setMetaTag('og:image', new URL('/images/logo-padrao-redes.jpg', window.location.origin).href);
  }

  // atualiza a tag canonical
  const canonicalLink = document.querySelector("link[rel='canonical']");
  if (canonicalLink) {
    canonicalLink.href = window.location.href;
  }

  //console.log("Meta tags atualizadas com sucesso:", metaData.title);
}
/**
 * função auxiliar que renderiza a grid de servicos
 * @param {Array} servicos - lista completa de serviços
 */
function renderizarGrid(servicos) {
  const container = document.getElementById('servicos-grid-container');
  if (!container) return; // se não for a página grid

  const cardsHTML = servicos.map(servico => `
    <div class="col-md-6">
      <a href="/pages/servico-interna.html?id=${servico.id}" class="grid-card">
        <div class="grid-card__icon"><i class="${servico.icone}"></i></div>
        <div class="grid-card__content">
          <h3 class="grid-card__category">${servico.categoria.toUpperCase()}</h3>
          <p class="grid-card__description">${servico.descricaoResumida}</p>
          <span class="grid-card__count">${String(servico.totalServicos).padStart(2, '0')} SERVIÇOS</span>
        </div>
      </a>
    </div>
  `).join('');

  container.innerHTML = cardsHTML;
}

/**
 * Função auxiliar que apenas renderiza a página de detalhe
 * @param {object} servico - objeto do serviço específico 
 */
function renderizarDetalhe(servico) {
  // verifica página de detalhe 
  if (!document.getElementById('service-title')) return;

  // preenche o conteudo da página no title
  document.title = `${servico.nome || servico.categoria} - Prefeitura de Barueri`;

  const setContent = (id, content) => {
    const el = document.getElementById(id);
    if (el) el.textContent = content;
  };

  setContent('breadcrumb-service-name', servico.nome || servico.categoria);
  setContent('service-title', servico.nome || servico.categoria);
  setContent('service-description', servico.descricaoCompleta);
  setContent('service-atendimento', servico.contato.atendimento);
  setContent('service-telefones', servico.contato.telefones);
  setContent('service-email', servico.contato.email);
  setContent('service-endereco', servico.contato.endereco);

  const digitalAccessLink = document.getElementById('digital-access-link');
  if (digitalAccessLink) {
    if (servico.linkServicoDigital) {
      digitalAccessLink.href = servico.linkServicoDigital;
      digitalAccessLink.classList.remove('disabled');
      digitalAccessLink.innerHTML = 'ACESSE <i class="bi bi-cursor-fill"></i>';
    } else {
      digitalAccessLink.removeAttribute('href');
      digitalAccessLink.classList.add('disabled');
      digitalAccessLink.innerHTML = 'Acesso Digital Indisponível';
    }
  }

  const accordionContainer = document.getElementById('serviceAccordion');
  if (accordionContainer) {
    accordionContainer.innerHTML = servico.informacoesDetalhadas.map((item, index) => {
      const isFirst = index === 0;
      return `<div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button ${isFirst ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="${isFirst}">${item.titulo}</button></h2><div id="collapse${index}" class="accordion-collapse collapse ${isFirst ? 'show' : ''}" data-bs-parent="#serviceAccordion"><div class="accordion-body">${item.conteudo}</div></div></div>`;
    }).join('');
  }

  // prepara os dados para enviar para as metatags
  const dadosParaMetaTags = {
    title: servico.nome || servico.categoria,
    description: servico.descricaoCompleta,
    imageUrl: servico.icone
  };

  // chama função que atualiza as tags 
  atualizarMetaTags(dadosParaMetaTags);
}

document.addEventListener("DOMContentLoaded", function () {
  //paginas
  renderizarPaginaDeNoticia();
  renderizarPaginaDeServicos();
});