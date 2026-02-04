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
// PRODUCTOS (CON SOLUCIÓN DE ERRORES)
// ================================
async function cargarProductos() {
  try {
    listaProductos.innerHTML = "<p>Cargando productos...</p>";
    const snapshot = await db.collection("productos").get();
    listaProductos.innerHTML = "";

    if (snapshot.empty) {
      listaProductos.innerHTML = "<p>No hay productos registrados.</p>";
      return;
    }

    snapshot.forEach(doc => {
      const p = doc.data();
      const div = document.createElement("div");
      div.style.border = "1px solid #ccc";
      div.style.padding = "15px";
      div.style.marginBottom = "10px";
      div.style.borderRadius = "8px";
      div.style.background = "#fff";

      // --- VALIDACIÓN DE ESTADO PARA PRODUCTOS ANTIGUOS ---
      // Si no tiene 'estado', usamos 'disponible' como respaldo
      let estadoActual = p.estado;
      if (!estadoActual) {
        estadoActual = p.disponible === false ? "consultar" : "disponible";
      }

      let colorEstado = "green";
      let textoEstado = "Disponible";
      
      if (estadoActual === "encargar") { 
          colorEstado = "#3498db"; 
          textoEstado = "Para Encargar"; 
      } else if (estadoActual === "consultar") { 
          colorEstado = "#ff9800"; 
          textoEstado = "Solo Consultar"; 
      }

      div.innerHTML = `
        <div id="view-${doc.id}" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong style="font-size:16px;">${p.nombre || 'Sin nombre'}</strong> <br>
            <span>Precio: ${p.precio || '$0'}</span> | 
            <span style="color: ${colorEstado}; font-weight:bold;">● ${textoEstado}</span>
          </div>
          <div>
            <button onclick="mostrarFormularioEdicion('${doc.id}')" style="background:#3498db; color:white; border:none; padding:7px 12px; cursor:pointer; border-radius:4px; margin-right:5px; font-weight:bold;">Editar</button>
            <button onclick="eliminarProducto('${doc.id}')" style="background:#e74c3c; color:white; border:none; padding:7px 12px; cursor:pointer; border-radius:4px; font-weight:bold;">Eliminar</button>
          </div>
        </div>

        <div id="edit-${doc.id}" style="display:none; margin-top:10px; border-top:2px solid #f2f2f2; padding-top:15px;">
          <label style="display:block; font-size:12px; color:#666; font-weight:bold;">Nombre del Repuesto:</label>
          <input type="text" id="edit-nombre-${doc.id}" value="${p.nombre || ''}" style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ddd; border-radius:4px;">
          
          <label style="display:block; font-size:12px; color:#666; font-weight:bold;">Precio:</label>
          <input type="text" id="edit-precio-${doc.id}" value="${p.precio || ''}" style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ddd; border-radius:4px;">
          
          <label style="display:block; font-size:12px; color:#666; font-weight:bold;">URL Imagen:</label>
          <input type="text" id="edit-imagen-${doc.id}" value="${p.imagen || ''}" style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ddd; border-radius:4px;">
          
          <label style="display:block; font-size:12px; color:#666; font-weight:bold;">Estado de Venta:</label>
          <select id="edit-estado-${doc.id}" style="width:100%; padding:8px; margin-bottom:15px; border-radius:4px; border:1px solid #ddd;">
            <option value="disponible" ${estadoActual === 'disponible' ? 'selected' : ''}>Disponible en tienda</option>
            <option value="encargar" ${estadoActual === 'encargar' ? 'selected' : ''}>Encargar (Va al carrito)</option>
            <option value="consultar" ${estadoActual === 'consultar' ? 'selected' : ''}>Solo Consultar (WhatsApp directo)</option>
          </select>

          <div style="display:flex; gap:10px;">
            <button onclick="actualizarProducto('${doc.id}')" style="background:#2ecc71; color:white; border:none; padding:10px; cursor:pointer; flex:1; border-radius:4px; font-weight:bold;">GUARDAR</button>
            <button onclick="cancelarEdicion('${doc.id}')" style="background:#95a5a6; color:white; border:none; padding:10px; cursor:pointer; flex:1; border-radius:4px; font-weight:bold;">CANCELAR</button>
          </div>
        </div>
      `;
      listaProductos.appendChild(div);
    });
  } catch (error) {
    console.error("Error cargando productos:", error);
    listaProductos.innerHTML = "<p>Error al conectar con la base de datos.</p>";
  }
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
      disponible: nuevoEstado === "disponible"
    });
    alert("✅ Producto actualizado");
    cargarProductos();
  } catch (error) {
    alert("❌ Error al guardar cambios");
  }
}

async function eliminarProducto(id) {
  if (confirm("¿Eliminar este repuesto?")) {
    await db.collection("productos").doc(id).delete();
    cargarProductos();
  }
}

// ================================
// CATEGORÍAS (MANTENIDO)
// ================================
async function cargarCategorias() {
  const snapshot = await db.collection("categorias").get();
  listaCategorias.innerHTML = "";
  snapshot.forEach(doc => {
    const cat = doc.data();
    const div = document.createElement("div");
    div.style = "border:1px solid #ccc; padding:10px; margin-bottom:8px; border-radius:6px; display:flex; justify-content:space-between; align-items:center; background:#f9f9f9;";
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
