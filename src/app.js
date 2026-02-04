  const grid = document.getElementById("grid");
  const status = document.getElementById("status");
  const backBtn = document.getElementById("backBtn");
  const homeBtn = document.getElementById("homeBtn");

  let pathStack = [];

  function beautifyName(filename) {
    return filename
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]+/g, " ")
      .trim();
  }

  async function loadFolder(path = "./recetas") {
    try {
      const indexPath = `${path}/index.json`;

      const res = await fetch(indexPath);
      if (!res.ok) throw new Error("No se pudo cargar index.json");

      const items = await res.json();

      grid.innerHTML = "";
      status.textContent = "";

      if (!items.length) {
        status.textContent = "Carpeta vacía";
        return;
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
            card.onclick = () => {
              pathStack.push(path);
              backBtn.disabled = false;
              loadFolder(item.path);
            };
          } else {
            card.onclick = async () => {
              try {
                const res = await fetch(item.path);
                if (!res.ok) throw new Error();

                const content = await res.text();

                pathStack.push(path);
                backBtn.disabled = false;

                grid.innerHTML = "";

                const pre = document.createElement("pre");
                pre.textContent = content;
                grid.appendChild(pre);
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

  backBtn.onclick = () => {
    if (!pathStack.length) return;
    const prev = pathStack.pop();
    loadFolder(prev);
    if (!pathStack.length) backBtn.disabled = true;
  };

  homeBtn.onclick = () => {
    pathStack = [];
    backBtn.disabled = true;
    loadFolder();
  };

  loadFolder();
