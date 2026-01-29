const owner = "andreslopezzamarreno";
const repo = "Recetas";
const branch = "main";

const url = `https://api.github.com/repos/${owner}/${repo}/contents/?ref=${branch}`;

const grid = document.getElementById("grid");
const status = document.getElementById("status");

function beautifyName(filename) {
  return filename
    .replace(/\.[^/.]+$/, "")     // quita la extensión
    .replace(/[-_]+/g, " ")       // convierte - y _ en espacios
    .trim();
}

fetch(url)
  .then(res => {
    if (!res.ok) throw new Error("GitHub no respondió bien");
    return res.json();
  })
  .then(files => {
    status.textContent = `Se encontraron ${files.length} archivos`;

    files.forEach(file => {
      const card = document.createElement("div");
      card.className = "card";

      const icon = document.createElement("div");
      icon.className = "icon";
      icon.textContent = file.type === "dir" ? "📁" : "📄";

      const name = document.createElement("div");
      name.className = "filename";
      name.textContent = beautifyName(file.name);

      card.appendChild(icon);
      card.appendChild(name);
      grid.appendChild(card);
    });
  })
  .catch(err => {
    status.textContent = "Error cargando archivos 😵";
    console.error(err);
  });
