const grid = document.getElementById("grid");
const status = document.getElementById("status");
const backBtn = document.getElementById("backBtn");
const homeBtn = document.getElementById("homeBtn");
const headerTitle = document.querySelector("header h1"); // <- nuestro h1
const DEFAULT_TITLE = headerTitle.textContent; // Guardamos el título original

const BASE = "./Recetas";

// -------------------
// Función para limpiar nombres de archivo
// -------------------
function beautifyName(filename) {
  return filename.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim();
}

// -------------------
// Función para renderizar markdown simple
// -------------------
function renderMarkdown(mdText) {
  // Escapar HTML
  mdText = mdText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Ignorar la primera línea de título (# ...) para no duplicarla
  const lines = mdText.split("\n");
  if (lines[0].startsWith("# ")) lines.shift();
  mdText = lines.join("\n");

  // Convertir subtítulos ##
  mdText = mdText.replace(/^## (.+)$/gm, '<h2 class="recipe-subtitle">$1</h2>');

  // Convertir listas ·
  mdText = mdText.replace(/^· (.+)$/gm, '<li>$1</li>');
  mdText = mdText.replace(/(<li>.+<\/li>)/gs, '<ul>$1</ul>');

  // Párrafos
  mdText = mdText.replace(/^(?!<h|<ul|<li)(.+)$/gm, '<p>$1</p>');

  return mdText;
}

// -------------------
// Función principal para cargar carpetas
// -------------------
async function loadFolder(path = "") {
  try {
    const indexPath = `${BASE}/${path ? path + "/" : ""}index.json`;
    const res = await fetch(indexPath);
    if (!res.ok) throw new Error("No se pudo cargar index.json");

    const items = await res.json();
    grid.innerHTML = "";
    status.textContent = "";
    grid.classList.remove("recipe-view");

    // Restauramos título original al entrar en carpeta
    headerTitle.textContent = DEFAULT_TITLE;

    if (!items.length) {
      status.textContent = "Carpeta vacía";
      return;
    }

    // Actualizamos URL y historial
    const url = path ? `#${path}` : "#";
    if (window.location.hash !== url) {
      window.history.pushState({ path }, "", url);
    }

    items
      .sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === "dir" ? -1 : 1;
      })
      .forEach(item => {
        const card = document.createElement("div");
        card.className = "card";

        const icon = document.createElement("div");
        icon.className = "icon";
        icon.textContent = item.type === "dir" ? "📁" : "📄";

        const name = document.createElement("div");
        name.className = "filename";
        name.textContent = beautifyName(item.name);

        card.appendChild(icon);
        card.appendChild(name);
        grid.appendChild(card);

        if (item.type === "dir") {
          card.onclick = () => loadFolder(path ? `${path}/${item.name}` : item.name);
        } else if (item.type === "file") {
          card.onclick = async () => {
            try {
              const filePath = `${BASE}/${path ? path + "/" : ""}${item.name}`;
              const res = await fetch(filePath);
              if (!res.ok) throw new Error("No se pudo cargar archivo");

              const content = await res.text();
              grid.innerHTML = "";
              grid.classList.add("recipe-view"); // ← activar centrado vertical

              const recipeDiv = document.createElement("div");
              recipeDiv.className = "recipe-content";
              recipeDiv.innerHTML = renderMarkdown(content);
              grid.appendChild(recipeDiv);


              // Cambiar título del header al título de la receta
              const firstLine = content.split("\n").find(line => line.startsWith("# "));
              if (firstLine) headerTitle.textContent = firstLine.replace("# ", "");

              // Guardamos archivo en historial
              const fileUrl = `#${path ? path + "/" : ""}${item.name}`;
              if (window.location.hash !== fileUrl) {
                window.history.pushState({ path, file: item.name }, "", fileUrl);
              }
            } catch {
              status.textContent = "Error mostrando archivo 😵";
            }
          };
        }
      });
  } catch (err) {
    console.error(err);
    status.textContent = "Error cargando carpeta 😵";
  }
}

// -------------------
// Botón Inicio
// -------------------
homeBtn.onclick = () => loadFolder("");

// -------------------
// Manejar botón atrás del navegador o móvil
// -------------------
window.onpopstate = (event) => {
  if (event.state) {
    if (event.state.file) {
      const folderPath = event.state.path;
      const fileName = event.state.file;

      loadFolder(folderPath).then(() => {
        const filePath = `${BASE}/${folderPath ? folderPath + "/" : ""}${fileName}`;
        fetch(filePath)
          .then(res => res.text())
          .then(content => {
            grid.innerHTML = "";
            const recipeDiv = document.createElement("div");
            recipeDiv.className = "recipe-content";
            recipeDiv.innerHTML = renderMarkdown(content);
            grid.appendChild(recipeDiv);

            const firstLine = content.split("\n").find(line => line.startsWith("# "));
            if (firstLine) headerTitle.textContent = firstLine.replace("# ", "");
          });
      });
    } else {
      loadFolder(event.state.path);
    }
  } else {
    loadFolder("");
  }
};

// -------------------
// Estado inicial en el historial
// -------------------
if (!window.location.hash) {
  window.history.replaceState({ path: "" }, "", "#");
}

// -------------------
// Cargar carpeta inicial según hash
// -------------------
const initialPath = window.location.hash ? window.location.hash.substring(1) : "";
loadFolder(initialPath);
