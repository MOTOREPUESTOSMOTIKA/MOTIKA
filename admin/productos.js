const listaProductos = document.getElementById("listaProductos");

auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "admin.html";
  } else {
    cargarProductos();
  }
});

async function cargarProductos() {
  listaProductos.innerHTML = "";

  const snapshot = await db.collection("productos").get();

  snapshot.forEach(doc => {
    const p = doc.data();

    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.padding = "10px";
    div.style.marginBottom = "10px";
    div.style.borderRadius = "6px";

    const estado = p.disponible ? "Disponible" : "Consultar";

    div.innerHTML = `
      <strong>${p.nombre}</strong><br>
      Precio: $${p.precio}<br>
      Categoría: ${p.categoria}<br>
      Estado: ${estado}<br><br>
      <button onclick="eliminarProducto('${doc.id}')">
        Eliminar
      </button>
    `;

    listaProductos.appendChild(div);
  });
}

async function eliminarProducto(id) {
  const confirmar = confirm("¿Eliminar este producto?");
  if (!confirmar) return;

  await db.collection("productos").doc(id).delete();
  cargarProductos();
}
