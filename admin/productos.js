const listaProductos = document.getElementById("listaProductos");
const listaCategorias = document.getElementById("listaCategorias");

auth.onAuthStateChanged(user => {
  if (!user) location.href = "admin.html";
  cargarProductos();
  cargarCategorias();
});

// PRODUCTOS
async function cargarProductos() {
  listaProductos.innerHTML = "";
  const snap = await db.collection("productos").get();

  snap.forEach(doc => {
    const div = document.createElement("div");
    div.innerHTML = `
      ${doc.data().nombre}
      <button onclick="eliminarProducto('${doc.id}')">Eliminar</button>
    `;
    listaProductos.appendChild(div);
  });
}

async function eliminarProducto(id) {
  if (confirm("¿Eliminar producto?")) {
    await db.collection("productos").doc(id).delete();
    cargarProductos();
  }
}

// CATEGORÍAS
async function cargarCategorias() {
  listaCategorias.innerHTML = "";
  const snap = await db.collection("categorias").get();

  snap.forEach(doc => {
    const div = document.createElement("div");
    div.innerHTML = `
      ${doc.data().nombre}
      <button onclick="eliminarCategoria('${doc.id}')">Eliminar</button>
    `;
    listaCategorias.appendChild(div);
  });
}

async function eliminarCategoria(id) {
  if (confirm("¿Eliminar categoría?")) {
    await db.collection("categorias").doc(id).delete();
    cargarCategorias();
  }
}