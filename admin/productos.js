const listaProductos = document.getElementById("listaProductos");
const listaCategorias = document.getElementById("listaCategorias");
const buscador = document.getElementById("buscador");

let productosGlobales = [];
let categoriasDisponibles = [];

// ================================
// CONTROL DE SESIÓN
// ================================
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "admin.html";
  } else {
    inicializarDatos();
  }
});

async function inicializarDatos() {
    await cargarCategorias();
    await cargarProductos();
}

// ================================
// GESTIÓN DE CATEGORÍAS
// ================================
async function cargarCategorias() {
  const snapshot = await db.collection("categorias").get();
  listaCategorias.innerHTML = "";
  categoriasDisponibles = [];

  snapshot.forEach(doc => {
    const cat = doc.data();
    categoriasDisponibles.push(cat.nombre);

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
  productosGlobales = [];

  snapshot.forEach(doc => {
    productosGlobales.push({ id: doc.id, ...doc.data() });
  });

  renderizarProductos(productosGlobales);
}

function renderizarProductos(lista) {
  listaProductos.innerHTML = "";
  
  if (lista.length === 0) {
    listaProductos.innerHTML = "<p>No se encontraron productos.</p>";
    return;
  }

  lista.forEach(p => {
    const div = document.createElement("div");
    div.className = "product-item";

    let opcionesCategoria = categoriasDisponibles.map(cat => {
        const seleccionada = (p.categoria === cat) ? "selected" : "";
        return `<option value="${cat}" ${seleccionada}>${cat}</option>`;
    }).join("");

    div.innerHTML = `
      <div id="view-${p.id}">
        <div class="product-info">
          <h4>${p.nombre}</h4>
          <small>Precio: ${p.precio} | <b>${p.categoria || 'Sin categoría'}</b></small><br>
          <span style="color:${p.estado === 'disponible' ? '#27ae60' : (p.estado === 'encargar' ? '#3498db' : '#f39c12')}; font-size:12px; font-weight:bold;">
            ● ${p.estado || 'disponible'}
          </span>
        </div>
        <div style="display:flex; gap:8px; margin-top:10px;">
          <button onclick="mostrarFormularioEdicion('${p.id}')" style="background:#3498db; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; flex:1;">Editar</button>
          <button onclick="eliminarProducto('${p.id}')" style="background:#e74c3c; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; flex:1;">Eliminar</button>
        </div>
      </div>

      <div id="edit-${p.id}" class="edit-box" style="display:none;">
        <label style="font-size:12px; font-weight:bold;">Nombre:</label>
        <input type="text" id="edit-nombre-${p.id}" value="${p.nombre}">
        
        <label style="font-size:12px; font-weight:bold;">Precio:</label>
        <input type="text" id="edit-precio-${p.id}" value="${p.precio}">

        <label style="font-size:12px; font-weight:bold;">Categoría:</label>
        <select id="edit-categoria-${p.id}">
          ${opcionesCategoria}
        </select>
        
        <label style="font-size:12px; font-weight:bold;">Estado:</label>
        <select id="edit-estado-${p.id}">
          <option value="disponible" ${p.estado === 'disponible' ? 'selected' : ''}>Disponible</option>
          <option value="encargar" ${p.estado === 'encargar' ? 'selected' : ''}>Para Encargar</option>
          <option value="consultar" ${p.estado === 'consultar' ? 'selected' : ''}>Solo Consultar</option>
        </select>

        <div style="display:flex; gap:10px;">
          <button onclick="actualizarProducto('${p.id}')" style="background:#2ecc71; color:white; border:none; padding:10px; flex:1; border-radius:6px; font-weight:bold; cursor:pointer;">Guardar</button>
          <button onclick="cancelarEdicion('${p.id}')" style="background:#95a5a6; color:white; border:none; padding:10px; flex:1; border-radius:6px; cursor:pointer;">Cancelar</button>
        </div>
      </div>
    `;
    listaProductos.appendChild(div);
  });
}

// FUNCIONES DE CONTROL (Asegúrate de que existan)
window.mostrarFormularioEdicion = function(id) {
  document.getElementById(`view-${id}`).style.display = "none";
  document.getElementById(`edit-${id}`).style.display = "block";
}

window.cancelarEdicion = function(id) {
  document.getElementById(`view-${id}`).style.display = "block";
  document.getElementById(`edit-${id}`).style.display = "none";
}

window.actualizarProducto = async function(id) {
  const nuevoNombre = document.getElementById(`edit-nombre-${id}`).value;
  const nuevoPrecio = document.getElementById(`edit-precio-${id}`).value;
  const nuevaCategoria = document.getElementById(`edit-categoria-${id}`).value;
  const nuevoEstado = document.getElementById(`edit-estado-${id}`).value;

  try {
    await db.collection("productos").doc(id).update({
      nombre: nuevoNombre,
      precio: nuevoPrecio,
      categoria: nuevaCategoria,
      estado: nuevoEstado
    });
    alert("✅ Producto actualizado");
    cargarProductos();
  } catch (error) {
    alert("❌ Error al guardar");
  }
}

window.eliminarProducto = async function(id) {
  if (confirm("¿Eliminar este repuesto?")) {
    await db.collection("productos").doc(id).delete();
    cargarProductos();
  }
}

window.eliminarCategoria = async function(id) {
  if (confirm("¿Eliminar categoría?")) {
    await db.collection("categorias").doc(id).delete();
    inicializarDatos();
  }
}

// Lógica del buscador
if (buscador) {
    buscador.addEventListener("input", (e) => {
        const termino = e.target.value.toLowerCase();
        const filtrados = productosGlobales.filter(p => 
            p.nombre.toLowerCase().includes(termino) || 
            (p.categoria && p.categoria.toLowerCase().includes(termino))
        );
        renderizarProductos(filtrados);
    });
}
