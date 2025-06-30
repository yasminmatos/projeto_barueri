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
document.addEventListener("DOMContentLoaded", function () {
  // Chama a função principal que vai montar a página de notícia
  renderizarPaginaDeNoticia();
});
async function renderizarPaginaDeNoticia() {
  try {
    const response = await fetch("/api/noticias-detalhe.json");
    if (!response.ok) {
      throw new Error(
        "Não foi possível encontrar o arquivo de dados da notícia."
      );
    }
    const noticia = await response.json();

    // Encontra e preenche cada elemento pelo ID
    document.getElementById("noticia-titulo").textContent = noticia.titulo;
    document.getElementById("noticia-data").textContent =
      noticia.dataPublicacao;
    document.getElementById("noticia-resumo").textContent = noticia.resumo;

    const imgPrincipal = document.getElementById("noticia-imagem-principal");
    imgPrincipal.src = noticia.imagemPrincipalUrl;
    imgPrincipal.alt = noticia.titulo;

    // cria o HTML para cada bloco de conteúdo
    const corpoContainer = document.getElementById("noticia-corpo");
    corpoContainer.innerHTML = ""; // Limpa o container antes de adicionar

    noticia.corpo.forEach((bloco) => {
      let elementoHTML = "";
      switch (bloco.tipo) {
        case "paragrafo":
          elementoHTML = `<p>${bloco.conteudo}</p>`;
          break;
        case "subtitulo":
          elementoHTML = `<p class="article-subtitle">${bloco.conteudo}</p>`;
          break;
        case "imagem":
          elementoHTML = `
            <figure class="article-inline-image text-center">
              <img src="${bloco.url}" alt="${bloco.legenda}" class=" img-article">
              <figcaption>${bloco.legenda}</figcaption>
            </figure>
          `;
          break;
      }
      corpoContainer.innerHTML += elementoHTML;
    });
  } catch (error) {
    console.error("Erro ao renderizar a página de notícia:", error);
    document.getElementById("noticia-titulo").textContent =
      "Erro ao carregar a notícia.";
  }
}
