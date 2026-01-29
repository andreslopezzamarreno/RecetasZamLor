// Configuración del repositorio
const owner = "andreslopezzamarreno";
const repo = "Recetas";
const branch = "main";

const grid = document.getElementById("grid");
const status = document.getElementById("status");
const backBtn = document.getElementById("backBtn");

// Pila de rutas para navegar "Atrás"
let pathStack = [];

function beautifyName(filename) {
  return filename
    .replace(/\.[^/.]+$/, "") // quita extensión
    .replace(/[-_]+/g, " ")   // guiones y underscores → espacios
    .trim();
}

// Carga carpeta desde GitHub
function loadFolder(path = "") {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  grid.innerHTML = "";
  status.textContent = path ? `Carpeta: ${path}` : "Raíz";

  fetch(apiUrl)
    .then(res => {
      if (!res.ok) throw new Error("GitHub no respondió bien");
      return res.json();
    })
    .then(items => {
      if (items.length === 0) {
        status.textContent = "Carpeta vacía";
        return;
      }

      items.forEach(item => {
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
          card.style.cursor = "pointer";
          card.onclick = () => {
            pathStack.push(path); // guardar la ruta actual
            loadFolder(item.path);
            backBtn.disabled = false;
          };
        }
      });
    })
    .catch(err => {
      status.textContent = "Error cargando archivos 😵";
      console.error(err);
    });
}

// Botón "Atrás"
backBtn.onclick = () => {
  if (pathStack.length === 0) return;
  const prevPath = pathStack.pop();
  loadFolder(prevPath);
  if (pathStack.length === 0) backBtn.disabled = true;
};

// Cargar raíz al inicio
loadFolder();
