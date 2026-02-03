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
    div.style.marginBottom = "8px";
    div.style.borderRadius = "6px";
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";

    div.innerHTML = `
      <span>${p.nombre}</span>
      <button onclick="eliminarProducto('${doc.id}')"
              style="background:#e74c3c; color:white; border:none; padding:6px 10px; cursor:pointer;">
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