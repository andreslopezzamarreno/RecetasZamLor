import os
import json

BASE_DIR = "../recetas"


def generar_index(ruta):
    items = []

    for nombre in sorted(os.listdir(ruta)):
        if nombre.startswith("."):
            continue

        path_completo = os.path.join(ruta, nombre)

        if os.path.isdir(path_completo):
            items.append({
                "name": nombre,
                "type": "dir",
                "path": path_completo.replace("\\", "/")
            })

            # Llamada recursiva para subcarpetas
            generar_index(path_completo)

        elif nombre.lower().endswith(".md"):
            items.append({
                "name": nombre,
                "type": "file",
                "path": path_completo.replace("\\", "/")
            })

    # Guardar index.json en la carpeta actual
    index_path = os.path.join(ruta, "index.json")
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)

    print(f"✔ index.json generado en: {ruta}")


if __name__ == "__main__":
    generar_index(BASE_DIR)
