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

  loadComponent("/components/_footer.html", "footer").then(() => {
    // após o footer carregar, atualiza o ano dinamicamente
    const yearSpan = document.getElementById("current-year");
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }
  });

  // --- FONTE DE DADOS DO MENU ---
  const menuLinks = [
    { texto: "Início", url: "/pages/index.html" },
    { texto: "Serviços", url: "/pages/servico.html" },
    { texto: "Notícias", url: "/pages/noticia-interna.html" },
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
