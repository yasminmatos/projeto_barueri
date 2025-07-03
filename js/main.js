const loadComponent = (url, elementId) => {
  // Retorna o fetch para poder usar .then() depois de chamar a função
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erro na rede ao tentar carregar ${url}`);
      }
      return response.text();
    })
    .then((data) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = data;
      }
    })
    .catch((error) => {
      console.error(`Falha ao carregar o componente de ${url}:`, error);
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = `<p class="text-danger text-center">Erro ao carregar componente.</p>`;
      }
    });
};

function gerarHeadPadrao() {
  // Pega a URL base do site para construir caminhos absolutos
  const baseUrl = window.location.origin;

  // Injeta o HTML padrão dentro da tag <head>
  document.head.innerHTML += `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="author" content="Prefeitura de Barueri" />

    <link rel="icon" href="${baseUrl}/images/favicon.ico" type="image/x-icon" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Montserrat:wght@700&display=swap" rel="stylesheet" />

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />

    <meta name="description" content="Site oficial da Prefeitura de Barueri">
    <meta property="og:title" content="Prefeitura de Barueri" />
    <meta property="og:description" content="Site oficial da Prefeitura de Barueri" />
    <meta property="og:image" content="${baseUrl}/images/logo-padrao-redes.jpg" />
    <meta property="og:url" content="${window.location.href}" />
    <link rel="canonical" href="${window.location.href}" />
  `;
}
//espera o dom carregar para chamar a função que carrega os componentes
document.addEventListener("DOMContentLoaded", function () {
  loadComponent("/components/_acessibilidade.html", "acessibilidade").then(
    () => {
      document.dispatchEvent(new Event("accessibilityReady")); //chama o evento de acessibilidade no index.js
    }
  );

  //chamada dos componentes
  loadComponent("/components/_header.html", "header");

  loadComponent("/components/_pesquisa-home.html", "pesquisa-home").then(
    initPesquisaHome
  );

  loadComponent("/components/_banners.html", "banners").then(renderBannersHome);

  loadComponent(
    "/components/_servicos-carrossel.html",
    "servicos-carrossel"
  ).then(renderServicosCarrossel);

  loadComponent("/components/_noticias-grid.html", "noticias-grid").then(
    renderGridNoticiasHome
  );

  loadComponent("/components/_footer.html", "footer")
    .then(() => {
      // Este código agora SÓ executa DEPOIS que o HTML do footer foi carregado.
      const yearSpan = document.getElementById("current-year");
      if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
      }
      console.log("HTML do footer carregado. Agora, tentando renderizar o conteúdo dinâmico...");
      renderizaFooter(); // Chamamos a função AQUI DENTRO.
    });

  // --- FONTE DE DADOS DO MENU ---
  const menuLinks = [
    { texto: "Início", url: "/pages/index.html" },
    { texto: "Serviços", url: "/pages/servico.html" },
    { texto: "Notícias", url: "/pages/noticia.html" },
  ];

  // --- FUNÇÃO PARA RENDERIZAR O MENU ---
  function renderizarMenu() {
    const listaPlaceholder = document.getElementById(
      "sidenav-list-placeholder"
    );
    if (!listaPlaceholder) return;

    // Limpa a lista para garantir que não haja duplicatas
    listaPlaceholder.innerHTML = "";

    // Itera sobre os dados e cria o HTML para cada link
    menuLinks.forEach((link) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.textContent = link.texto;
      a.href = link.url;
      li.appendChild(a);
      listaPlaceholder.appendChild(li);
    });
  }

  // --- RENDERIZAR O HEADER ---
  function renderizarHeader() {
    const pageTitle = document.title.split("-")[1].trim(); //pega o titulo depois do traço -
    const titlePlaceholder = document.getElementById("page-title-placeholder");
    if (titlePlaceholder) {
      titlePlaceholder.textContent = pageTitle;
    }
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
        if (e.key === "Escape" && sideMenu.classList.contains("is-open"))
          closeMenu();
      });
    }
  }

  loadComponent("/components/_page-header.html", "sidenav").then(() => {
    renderizarMenu();
    renderizarHeader();
  });

  const collapseSummary = document.getElementById("collapseSummary");
  const icon = document.querySelector(".collapse-rotate-icon");
  collapseSummary.addEventListener("show.bs.collapse", () => {
    icon.classList.add("rotated");
  });
  collapseSummary.addEventListener("hide.bs.collapse", () => {
    icon.classList.remove("rotated");
  });

  document
    .getElementById("botao-compartilhar")
    .addEventListener("click", async () => {
      const shareData = {
        title: document.title,
        text: "Confira essa notícia:",
        url: window.location.href,
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          console.error("Erro ao compartilhar:", err);
        }
      } else {
        try {
          await navigator.clipboard.writeText(shareData.url);
          alert("Link copiado para a área de transferência!");
        } catch (err) {
          console.error("Erro ao copiar:", err);
          alert("Seu navegador não permite compartilhar nem copiar o link.");
        }
      }
    });
});
