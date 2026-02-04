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
// PRODUCTOS (CON EDICIÓN DE 3 ESTADOS)
// ================================
async function cargarProductos() {
  listaProductos.innerHTML = "<p>Cargando productos...</p>";
  const snapshot = await db.collection("productos").get();
  listaProductos.innerHTML = "";
  
  // ... dentro de cargarProductos() ...
    let colorEstado = "green";
    let textoEstado = "Disponible";
    if (p.estado === "encargar") { 
        colorEstado = "#3498db"; // Azul para encargo
        textoEstado = "Para Encargar"; 
    }
    if (p.estado === "consultar") { 
        colorEstado = "#f39c12"; // Naranja para consultar
        textoEstado = "Solo Consultar"; 
    }
// ...


  snapshot.forEach(doc => {
    const p = doc.data();
    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.padding = "15px";
    div.style.marginBottom = "10px";
    div.style.borderRadius = "8px";
    div.style.background = "#fff";

    // Definimos el color y texto según el estado para la vista previa
    let colorEstado = "green";
    let textoEstado = "Disponible";
    if (p.estado === "encargar") { colorEstado = "#3498db"; textoEstado = "Para Encargar"; }
    if (p.estado === "consultar") { colorEstado = "orange"; textoEstado = "Solo Consultar"; }

    div.innerHTML = `
      <div id="view-${doc.id}" style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong style="font-size:16px;">${p.nombre}</strong> <br>
          <span>Precio: ${p.precio}</span> | 
          <span style="color: ${colorEstado}; font-weight:bold;">● ${textoEstado}</span>
        </div>
        <div>
          <button onclick="mostrarFormularioEdicion('${doc.id}')" style="background:#3498db; color:white; border:none; padding:7px 12px; cursor:pointer; border-radius:4px; margin-right:5px;">Editar</button>
          <button onclick="eliminarProducto('${doc.id}')" style="background:#e74c3c; color:white; border:none; padding:7px 12px; cursor:pointer; border-radius:4px;">Eliminar</button>
        </div>
      </div>

      <div id="edit-${doc.id}" style="display:none; margin-top:10px; border-top:2px solid #f2f2f2; padding-top:15px;">
        <label style="display:block; font-size:12px; color:#666;">Nombre del Repuesto:</label>
        <input type="text" id="edit-nombre-${doc.id}" value="${p.nombre}" style="width:100%; padding:8px; margin-bottom:10px;">
        
        <label style="display:block; font-size:12px; color:#666;">Precio:</label>
        <input type="text" id="edit-precio-${doc.id}" value="${p.precio}" style="width:100%; padding:8px; margin-bottom:10px;">
        
        <label style="display:block; font-size:12px; color:#666;">URL Imagen:</label>
        <input type="text" id="edit-imagen-${doc.id}" value="${p.imagen || ''}" style="width:100%; padding:8px; margin-bottom:10px;">
        
        <label style="display:block; font-size:12px; color:#666;">Estado de Venta:</label>
        <select id="edit-estado-${doc.id}" style="width:100%; padding:8px; margin-bottom:15px; border-radius:4px;">
          <option value="disponible" ${p.estado === 'disponible' ? 'selected' : ''}>Disponible en tienda</option>
          <option value="encargar" ${p.estado === 'encargar' ? 'selected' : ''}>Encargar (Va al carrito)</option>
          <option value="consultar" ${p.estado === 'consultar' ? 'selected' : ''}>Solo Consultar (WhatsApp directo)</option>
        </select>

        <div style="display:flex; gap:10px;">
          <button onclick="actualizarProducto('${doc.id}')" style="background:#2ecc71; color:white; border:none; padding:10px; cursor:pointer; flex:1; border-radius:4px; font-weight:bold;">GUARDAR</button>
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
  const nuevoEstado = document.getElementById(`edit-estado-${id}`).value;

  try {
    await db.collection("productos").doc(id).update({
      nombre: nuevoNombre,
      precio: nuevoPrecio,
      imagen: nuevaImagen,
      estado: nuevoEstado,
      // Mantenemos disponible por compatibilidad
      disponible: nuevoEstado === "disponible"
    });
    alert("✅ Producto actualizado");
    cargarProductos();
  } catch (error) {
    alert("❌ Error al guardar");
  }
}

async function eliminarProducto(id) {
  if (confirm("¿Eliminar este repuesto?")) {
    await db.collection("productos").doc(id).delete();
    cargarProductos();
  }
}

// ================================
// CATEGORÍAS (SIN CAMBIOS)
// ================================
async function cargarCategorias() {
  listaCategorias.innerHTML = "";
  const snapshot = await db.collection("categorias").get();
  snapshot.forEach(doc => {
    const cat = doc.data();
    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.padding = "10px"; div.style.marginBottom = "8px"; div.style.borderRadius = "6px";
    div.style.display = "flex"; div.style.justifyContent = "space-between"; div.style.alignItems = "center";
    div.innerHTML = `<span><strong>${cat.nombre}</strong></span><button onclick="eliminarCategoria('${doc.id}')" style="background:#e74c3c; color:white; border:none; padding:6px 10px; cursor:pointer; border-radius:4px;">Eliminar</button>`;
    listaCategorias.appendChild(div);
  });
}

async function eliminarCategoria(id) {
  if (confirm("¿Eliminar esta categoría?")) {
    await db.collection("categorias").doc(id).delete();
    cargarCategorias();
  }
}
