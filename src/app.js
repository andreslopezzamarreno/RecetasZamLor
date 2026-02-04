const grid = document.getElementById("grid");
const status = document.getElementById("status");
const backBtn = document.getElementById("backBtn");
const homeBtn = document.getElementById("homeBtn");

const BASE = "./Recetas";

// Función para limpiar nombres de archivo
function beautifyName(filename) {
  return filename.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim();
}

// Función para cargar carpetas
async function loadFolder(path = "") {
  try {
    const indexPath = `${BASE}/${path ? path + "/" : ""}index.json`;
    const res = await fetch(indexPath);
    if (!res.ok) throw new Error("No se pudo cargar index.json");

    const items = await res.json();
    grid.innerHTML = "";
    status.textContent = "";

    if (!items.length) {
      status.textContent = "Carpeta vacía";
      return;
    }

    // Actualizamos la URL y el historial
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
              if (!res.ok) throw new Error();

              const content = await res.text();
              grid.innerHTML = "";

              const pre = document.createElement("pre");
              pre.textContent = content;
              grid.appendChild(pre);

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

// Botón Inicio
homeBtn.onclick = () => loadFolder("");

// Manejar botón atrás del navegador o móvil
window.onpopstate = (event) => {
  if (event.state) {
    if (event.state.file) {
      // Es un archivo
      const folderPath = event.state.path;
      const fileName = event.state.file;

      loadFolder(folderPath).then(() => {
        const filePath = `${BASE}/${folderPath ? folderPath + "/" : ""}${fileName}`;
        fetch(filePath)
          .then(res => res.text())
          .then(content => {
            grid.innerHTML = "";
            const pre = document.createElement("pre");
            pre.textContent = content;
            grid.appendChild(pre);
          });
      });
    } else {
      // Es una carpeta
      loadFolder(event.state.path);
    }
  } else {
    // Sin estado (por ejemplo primer pushState) -> raíz
    loadFolder("");
  }
};

// Registramos el estado inicial para la raíz al cargar la página
if (!window.location.hash) {
  window.history.replaceState({ path: "" }, "", "#");
}

// Cargar carpeta inicial según hash
const initialPath = window.location.hash ? window.location.hash.substring(1) : "";
loadFolder(initialPath);
