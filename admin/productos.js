const listaProductos = document.getElementById("listaProductos");
const listaCategorias = document.getElementById("listaCategorias");

auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "admin.html";
  } else {
    cargarProductos();
    cargarCategorias();
  }
});

// ================================
// PRODUCTOS
// ================================
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

    // Usamos un ID único para el contenedor de edición de este producto
    div.id = `prod-${doc.id}`;

    div.innerHTML = `
      <div id="view-${doc.id}" style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong>${p.nombre}</strong> - ${p.precio} <br>
          <small>${p.categoria || 'Sin categoría'}</small>
        </div>
        <div>
          <button class="btn-editar" onclick="mostrarFormularioEdicion('${doc.id}', '${p.nombre}', '${p.precio}', '${p.imagen || ''}')">Editar</button>
          <button onclick="eliminarProducto('${doc.id}')" style="background:#e74c3c; color:white; border:none; padding:6px 10px; cursor:pointer; border-radius:4px;">Eliminar</button>
        </div>
      </div>
      <div id="edit-${doc.id}" class="edit-box" style="display:none; margin-top:10px; border-top:1px solid #eee; padding-top:10px;">
        <input type="text" id="edit-nombre-${doc.id}" value="${p.nombre}" placeholder="Nombre">
        <input type="text" id="edit-precio-${doc.id}" value="${p.precio}" placeholder="Precio (Ej: $20.000)">
        <input type="text" id="edit-imagen-${doc.id}" value="${p.imagen || ''}" placeholder="URL Imagen">
        <button onclick="actualizarProducto('${doc.id}')" style="background:#2ecc71; color:white; border:none; padding:8px; cursor:pointer; width:48%; border-radius:4px;">Guardar</button>
        <button onclick="cancelarEdicion('${doc.id}')" style="background:#95a5a6; color:white; border:none; padding:8px; cursor:pointer; width:48%; border-radius:4px;">Cancelar</button>
      </div>
    `;
    listaProductos.appendChild(div);
  });
}

// Muestra los inputs y oculta el texto
function mostrarFormularioEdicion(id) {
  document.getElementById(`view-${id}`).style.display = "none";
  document.getElementById(`edit-${id}`).style.display = "block";
}

// Oculta los inputs y vuelve al texto
function cancelarEdicion(id) {
  document.getElementById(`view-${id}`).style.display = "flex";
  document.getElementById(`edit-${id}`).style.display = "none";
}

// Función que guarda los cambios en Firebase
async function actualizarProducto(id) {
  const nuevoNombre = document.getElementById(`edit-nombre-${id}`).value;
  const nuevoPrecio = document.getElementById(`edit-precio-${id}`).value;
  const nuevaImagen = document.getElementById(`edit-imagen-${id}`).value;

  try {
    await db.collection("productos").doc(id).update({
      nombre: nuevoNombre,
      precio: nuevoPrecio,
      imagen: nuevaImagen
    });
    alert("¡Producto actualizado!");
    cargarProductos(); // Recargamos la lista
  } catch (error) {
    console.error("Error al actualizar:", error);
    alert("Hubo un error al actualizar");
  }
}

async function eliminarProducto(id) {
  const confirmar = confirm("¿Eliminar este producto?");
  if (!confirmar) return;
  await db.collection("productos").doc(id).delete();
  cargarProductos();
}

// ================================
// CATEGORÍAS (Igual que antes)
// ================================
async function cargarCategorias() {
  listaCategorias.innerHTML = "";
  const snapshot = await db.collection("categorias").get();
  snapshot.forEach(doc => {
    const cat = doc.data();
    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.padding = "8px";
    div.style.marginBottom = "6px";
    div.style.borderRadius = "6px";
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";
    div.innerHTML = `
      <span>${cat.nombre}</span>
      <button onclick="eliminarCategoria('${doc.id}')" style="background:#e74c3c; color:white; border:none; padding:5px 8px; cursor:pointer;">Eliminar</button>
    `;
    listaCategorias.appendChild(div);
  });
}

async function eliminarCategoria(id) {
  const confirmar = confirm("¿Eliminar esta categoría?");
  if (!confirmar) return;
  await db.collection("categorias").doc(id).delete();
  cargarCategorias();
}
