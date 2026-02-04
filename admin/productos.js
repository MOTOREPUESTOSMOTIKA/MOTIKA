const listaProductos = document.getElementById("listaProductos");
const listaCategorias = document.getElementById("listaCategorias");
const buscador = document.getElementById("buscador"); // Asegúrate de agregar este ID en tu HTML

let productosGlobales = []; // Guardamos los productos aquí para filtrar sin volver a consultar Firebase
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
  productosGlobales = []; // Limpiamos la lista global

  snapshot.forEach(doc => {
    productosGlobales.push({ id: doc.id, ...doc.data() });
  });

  renderizarProductos(productosGlobales);
}

// Función separada para poder filtrar sin recargar desde la base de datos
function renderizarProductos(lista) {
  listaProductos.innerHTML = "";
  
  if (lista.length === 0) {
    listaProductos.innerHTML = "<p>No se encontraron productos.</p>";
    return;
  }

  lista.forEach(p => {
    const div = document.createElement("div");
    div.className = "product-item";
    div.style = "background:white; border-radius:12px; padding:15px; margin-bottom:15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;";

    let opcionesCategoria = categoriasDisponibles.map(cat => {
        const seleccionada = (p.categoria === cat) ? "selected" : "";
        return `<option value="${cat}" ${seleccionada}>${cat}</option>`;
    }).join("");

    div.innerHTML = `
      <div id="view-${p.id}" style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h4 style="margin:0; color:#2c3e50;">${p.nombre}</h4>
          <small style="color:#7f8c8d;">Precio: ${p.precio} | <b>${p.categoria || 'Sin categoría'}</b></small><br>
          <span style="color:${p.estado === 'disponible' ? '#27ae60' : (p.estado === 'encargar' ? '#3498db' : '#f39c12')}; font-size:12px; font-weight:bold;">
            ● ${p.estado || 'disponible'}
          </span>
        </div>
        <div style="display:flex; gap:8px;">
          <button onclick="mostrarFormularioEdicion('${p.id}')" style="background:#3498db; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer;">Editar</button>
          <button onclick="eliminarProducto('${p.id}')" style="background:#e74c3c; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer;">Eliminar</button>
        </div>
      </div>

      <div id="edit-${p.id}" style="display:none; margin-top:15px; padding-top:15px; border-top:1px solid #eee;">
        <label style="font-size:12px; font-weight:bold;">Nombre:</label>
        <input type="text" id="edit-nombre-${p.id}" value="${p.nombre}" style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ddd; border-radius:4px;">
        <label style="font-size:12px; font-weight:bold;">Categoría:</label>
        <select id="edit-categoria-${p.id}" style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ddd; border-radius:4px;">
          ${opcionesCategoria}
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

// --- Las funciones de actualizar/eliminar se mantienen igual que la versión anterior ---
