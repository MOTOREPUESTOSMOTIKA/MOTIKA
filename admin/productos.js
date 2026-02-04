const listaProductos = document.getElementById("listaProductos");
const listaCategorias = document.getElementById("listaCategorias");

// ================================
// CONTROL DE SESIÓN
// ================================
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "admin.html";
  } else {
    cargarProductos();
    cargarCategorias();
  }
});

// ================================
// LÓGICA DE PRODUCTOS
// ================================
async function cargarProductos() {
  listaProductos.innerHTML = "<p>Cargando productos...</p>";
  const snapshot = await db.collection("productos").get();
  listaProductos.innerHTML = "";

  snapshot.forEach(doc => {
    const p = doc.data();
    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.padding = "15px";
    div.style.marginBottom = "10px";
    div.style.borderRadius = "8px";
    div.style.background = "#fff";

    // Detectamos el estado actual para el selector
    const estadoActual = p.disponible === true ? "Disponible" : "Agotado";

    div.innerHTML = `
      <div id="view-${doc.id}" style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong style="font-size:16px;">${p.nombre}</strong> <br>
          <span>Precio: ${p.precio}</span> | 
          <span style="color: ${p.disponible ? 'green' : 'orange'}; font-weight:bold;">
            ${p.disponible ? '● En Stock' : '● Agotado'}
          </span>
        </div>
        <div>
          <button class="btn-editar" onclick="mostrarFormularioEdicion('${doc.id}')">Editar</button>
          <button onclick="eliminarProducto('${doc.id}')" style="background:#e74c3c; color:white; border:none; padding:7px 12px; cursor:pointer; border-radius:4px;">Eliminar</button>
        </div>
      </div>

      <div id="edit-${doc.id}" class="edit-box" style="display:none; margin-top:10px; border-top:2px solid #f2f2f2; padding-top:15px;">
        <label>Nombre del Repuesto:</label>
        <input type="text" id="edit-nombre-${doc.id}" value="${p.nombre}">
        
        <label>Precio:</label>
        <input type="text" id="edit-precio-${doc.id}" value="${p.precio}">
        
        <label>URL Imagen (ImgBB):</label>
        <input type="text" id="edit-imagen-${doc.id}" value="${p.imagen || ''}">
        
        <label>Disponibilidad:</label>
        <select id="edit-disponible-${doc.id}" style="display:block; width:100%; padding:8px; margin-bottom:15px; border-radius:4px;">
          <option value="true" ${p.disponible === true ? 'selected' : ''}>Disponible (Botón comprar)</option>
          <option value="false" ${p.disponible === false ? 'selected' : ''}>Agotado (Botón consultar)</option>
        </select>

        <div style="display:flex; gap:10px;">
          <button onclick="actualizarProducto('${doc.id}')" style="background:#2ecc71; color:white; border:none; padding:10px; cursor:pointer; flex:1; border-radius:4px; font-weight:bold;">GUARDAR CAMBIOS</button>
          <button onclick="cancelarEdicion('${doc.id}')" style="background:#95a5a6; color:white; border:none; padding:10px; cursor:pointer; flex:1; border-radius:4px;">CANCELAR</button>
        </div>
      </div>
    `;
    listaProductos.appendChild(div);
  });
}

function mostrarFormularioEdicion(id) {
  document.getElementById(`view-${id}`).style.display = "none";
  document.getElementById(`edit-${id}`).style.display = "block";
}

function cancelarEdicion(id) {
  document.getElementById(`view-${id}`).style.display = "flex";
  document.getElementById(`edit-${id}`).style.display = "none";
}

async function actualizarProducto(id) {
  const nuevoNombre = document.getElementById(`edit-nombre-${id}`).value;
  const nuevoPrecio = document.getElementById(`edit-precio-${id}`).value;
  const nuevaImagen = document.getElementById(`edit-imagen-${id}`).value;
  const nuevaDisponibilidad = document.getElementById(`edit-disponible-${id}`).value === "true";

  try {
    await db.collection("productos").doc(id).update({
      nombre: nuevoNombre,
      precio: nuevoPrecio,
      imagen: nuevaImagen,
      disponible: nuevaDisponibilidad
    });
    alert("✅ Producto actualizado correctamente");
    cargarProductos();
  } catch (error) {
    console.error("Error:", error);
    alert("❌ Error al guardar cambios");
  }
}

async function eliminarProducto(id) {
  if (confirm("¿Seguro que quieres eliminar este repuesto de la base de datos?")) {
    await db.collection("productos").doc(id).delete();
    cargarProductos();
  }
}

// ================================
// LÓGICA DE CATEGORÍAS
// ================================
async function cargarCategorias() {
  listaCategorias.innerHTML = "";
  const snapshot = await db.collection("categorias").get();

  snapshot.forEach(doc => {
    const cat = doc.data();
    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.padding = "10px";
    div.style.marginBottom = "8px";
    div.style.borderRadius = "6px";
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";
    div.style.background = "#f9f9f9";

    div.innerHTML = `
      <span><strong>${cat.nombre}</strong></span>
      <button onclick="eliminarCategoria('${doc.id}')" style="background:#e74c3c; color:white; border:none; padding:6px 10px; cursor:pointer; border-radius:4px;">Eliminar</button>
    `;
    listaCategorias.appendChild(div);
  });
}

async function eliminarCategoria(id) {
  if (confirm("¿Eliminar esta categoría? Los productos asociados NO se borrarán automáticamente.")) {
    await db.collection("categorias").doc(id).delete();
    cargarCategorias();
  }
}
