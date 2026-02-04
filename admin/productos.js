const listaProductos = document.getElementById("listaProductos");
const listaCategorias = document.getElementById("listaCategorias");

// Variable para guardar las categorías y usarlas en los editores de productos
let categoriasDisponibles = [];

// ================================
// CONTROL DE SESIÓN
// ================================
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "admin.html";
  } else {
    // IMPORTANTE: Primero cargamos categorías, luego productos
    inicializarDatos();
  }
});

async function inicializarDatos() {
    await cargarCategorias(); // Esperamos a tener las categorías
    await cargarProductos();  // Luego cargamos los productos
}

// ================================
// GESTIÓN DE CATEGORÍAS
// ================================
async function cargarCategorias() {
  const snapshot = await db.collection("categorias").get();
  listaCategorias.innerHTML = "";
  categoriasDisponibles = []; // Reiniciamos la lista

  snapshot.forEach(doc => {
    const cat = doc.data();
    categoriasDisponibles.push(cat.nombre); // Guardamos el nombre en nuestra lista global

    const div = document.createElement("div");
    div.style = "border:1px solid #eee; padding:10px; margin-bottom:5px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; background:#fff;";
    div.innerHTML = `
      <span><strong>${cat.nombre}</strong></span>
      <button onclick="eliminarCategoria('${doc.id}')" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Eliminar</button>
    `;
    listaCategorias.appendChild(div);
  });
}

// ================================
// GESTIÓN DE PRODUCTOS
// ================================
async function cargarProductos() {
  listaProductos.innerHTML = "<p>Cargando productos...</p>";
  const snapshot = await db.collection("productos").get();
  listaProductos.innerHTML = "";

  snapshot.forEach(doc => {
    const p = doc.data();
    const div = document.createElement("div");
    div.className = "product-item"; // Asegúrate de tener este estilo en tu CSS
    div.style = "background:white; border-radius:12px; padding:15px; margin-bottom:15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;";

    // GENERAR LAS OPCIONES DEL SELECTOR DE CATEGORÍA
    // Esto conecta el editor con tus categorías reales
    let opcionesCategoria = categoriasDisponibles.map(cat => {
        const seleccionada = (p.categoria === cat) ? "selected" : "";
        return `<option value="${cat}" ${seleccionada}>${cat}</option>`;
    }).join("");

    div.innerHTML = `
      <div id="view-${doc.id}" style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h4 style="margin:0; color:#2c3e50;">${p.nombre}</h4>
          <small style="color:#7f8c8d;">Precio: ${p.precio} | <b>${p.categoria || 'Sin categoría'}</b></small><br>
          <span style="color:${p.estado === 'disponible' ? '#27ae60' : (p.estado === 'encargar' ? '#3498db' : '#f39c12')}; font-size:12px; font-weight:bold;">
            ● ${p.estado || 'disponible'}
          </span>
        </div>
        <div style="display:flex; gap:8px;">
          <button onclick="mostrarFormularioEdicion('${doc.id}')" style="background:#3498db; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer;">Editar</button>
          <button onclick="eliminarProducto('${doc.id}')" style="background:#e74c3c; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer;">Eliminar</button>
        </div>
      </div>

      <div id="edit-${doc.id}" style="display:none; margin-top:15px; padding-top:15px; border-top:1px solid #eee;">
        <label style="font-size:12px; font-weight:bold;">Nombre del producto:</label>
        <input type="text" id="edit-nombre-${doc.id}" value="${p.nombre}" style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ddd; border-radius:4px;">
        
        <label style="font-size:12px; font-weight:bold;">Precio:</label>
        <input type="text" id="edit-precio-${doc.id}" value="${p.precio}" style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ddd; border-radius:4px;">

        <label style="font-size:12px; font-weight:bold;">Categoría:</label>
        <select id="edit-categoria-${doc.id}" style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ddd; border-radius:4px;">
          <option value="">-- Seleccionar Categoría --</option>
          ${opcionesCategoria}
        </select>
        
        <label style="font-size:12px; font-weight:bold;">Estado:</label>
        <select id="edit-estado-${doc.id}" style="width:100%; padding:8px; margin-bottom:15px; border:1px solid #ddd; border-radius:4px;">
          <option value="disponible" ${p.estado === 'disponible' ? 'selected' : ''}>Disponible</option>
          <option value="encargar" ${p.estado === 'encargar' ? 'selected' : ''}>Para Encargar</option>
          <option value="consultar" ${p.estado === 'consultar' ? 'selected' : ''}>Solo Consultar</option>
        </select>

        <div style="display:flex; gap:10px;">
          <button onclick="actualizarProducto('${doc.id}')" style="background:#2ecc71; color:white; border:none; padding:10px; flex:1; border-radius:6px; font-weight:bold; cursor:pointer;">Guardar Cambios</button>
          <button onclick="cancelarEdicion('${doc.id}')" style="background:#95a5a6; color:white; border:none; padding:10px; flex:1; border-radius:6px; cursor:pointer;">Cancelar</button>
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
  const nuevaCategoria = document.getElementById(`edit-categoria-${id}`).value;
  const nuevoEstado = document.getElementById(`edit-estado-${id}`).value;

  try {
    await db.collection("productos").doc(id).update({
      nombre: nuevoNombre,
      precio: nuevoPrecio,
      categoria: nuevaCategoria,
      estado: nuevoEstado,
      disponible: nuevoEstado === "disponible"
    });
    alert("✅ Producto actualizado correctamente");
    cargarProductos();
  } catch (error) {
    console.error("Error al actualizar:", error);
    alert("❌ Error al guardar los cambios");
  }
}

async function eliminarProducto(id) {
  if (confirm("¿Seguro que quieres eliminar este producto?")) {
    await db.collection("productos").doc(id).delete();
    cargarProductos();
  }
}

async function eliminarCategoria(id) {
  if (confirm("¿Eliminar categoría?")) {
    await db.collection("categorias").doc(id).delete();
    inicializarDatos(); // Recargamos todo para actualizar la lista global
  }
}
