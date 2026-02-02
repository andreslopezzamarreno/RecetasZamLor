// Configuración del repositorio
const owner = "andreslopezzamarreno";
const repo = "";
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
  status.textContent = ""; // Eliminar el texto del estado

  // Actualizar el historial del navegador
  const url = path ? `#${path}` : "#";
  if (window.location.hash !== url) {
    window.history.pushState({ path }, "", url);
  }

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

      items = items.filter(item => item.name.toLowerCase() !== "readme.md"); // Excluir README

      // Ordenar carpetas primero
      items.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name); // Orden alfabético
        return a.type === "dir" ? -1 : 1; // Carpetas primero
      });

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
        } else if (item.type === "file") {
          card.style.cursor = "pointer";
          card.onclick = () => {
            const fileUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`;
            fetch(fileUrl)
              .then(res => {
                if (!res.ok) throw new Error("No se pudo cargar el archivo");
                return res.text();
              })
              .then(content => {
                pathStack.push(path); // Guardar la ruta actual antes de mostrar el archivo
                backBtn.disabled = false; // Habilitar el botón 'Atrás'

                // Actualizar el historial del navegador para el archivo
                const fileUrl = `#${item.path}`;
                if (window.location.hash !== fileUrl) {
                  window.history.pushState({ path, file: item.path }, "", fileUrl);
                }

                grid.innerHTML = ""; // Limpiar la cuadrícula
                const fileContent = document.createElement("pre");
                fileContent.textContent = content;
                fileContent.style.whiteSpace = "pre-wrap"; // Ajustar texto
                fileContent.style.wordWrap = "break-word"; // Evitar desbordamiento
                grid.appendChild(fileContent);
                status.textContent = ""; // Eliminar el texto del estado
              })
              .catch(err => {
                status.textContent = "Error mostrando el archivo 😵";
                console.error(err);
              });
          };
        }
      });
    })
    .catch(err => {
      status.textContent = "Error cargando archivos 😵";
      console.error(err);
    });
}

// Manejar el botón 'Atrás' del navegador
window.onpopstate = (event) => {
  if (event.state) {
    if (event.state.file) {
      // Si es un archivo, cargar la carpeta y luego el archivo
      const filePath = event.state.file;
      const folderPath = event.state.path;
      loadFolder(folderPath);
      setTimeout(() => {
        const fileUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
        fetch(fileUrl)
          .then(res => {
            if (!res.ok) throw new Error("No se pudo cargar el archivo");
            return res.text();
          })
          .then(content => {
            grid.innerHTML = ""; // Limpiar la cuadrícula
            const fileContent = document.createElement("pre");
            fileContent.textContent = content;
            fileContent.style.whiteSpace = "pre-wrap"; // Ajustar texto
            fileContent.style.wordWrap = "break-word"; // Evitar desbordamiento
            grid.appendChild(fileContent);
            status.textContent = ""; // Eliminar el texto del estado
          })
          .catch(err => {
            status.textContent = "Error mostrando el archivo 😵";
            console.error(err);
          });
      }, 100);
    } else {
      // Si es una carpeta, cargar la carpeta
      loadFolder(event.state.path);
    }
  } else {
    loadFolder(); // Cargar la raíz si no hay estado
  }
};

// Cargar la carpeta inicial basada en el hash de la URL
const initialPath = window.location.hash ? window.location.hash.substring(1) : "";
loadFolder(initialPath);

// Botón "Atrás"
backBtn.onclick = () => {
  if (pathStack.length === 0) return;
  const prevPath = pathStack.pop();
  loadFolder(prevPath);
  if (pathStack.length === 0) backBtn.disabled = true;
};

// Botón "Inicio"
const homeBtn = document.getElementById("homeBtn");
homeBtn.onclick = () => {
  pathStack = []; // Vaciar la pila de rutas
  loadFolder(); // Cargar la raíz
  backBtn.disabled = true; // Deshabilitar el botón "Atrás"
};
