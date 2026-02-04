const listaProductos = document.getElementById("listaProductos");
const listaCategorias = document.getElementById("listaCategorias");
const buscador = document.getElementById("buscador");

let productosGlobales = [];
let categoriasDisponibles = [];

const IMGBB_API_KEY = "c9c201374e8b952b54f76ac5acd6c23b"; 

auth.onAuthStateChanged(user => {
  if (!user) { window.location.href = "admin.html"; } 
  else { inicializarDatos(); }
});

async function inicializarDatos() {
    await cargarCategorias();
    await cargarProductos();
}

async function subirImagen(archivo) {
  const formData = new FormData();
  formData.append("image", archivo);
  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: "POST",
      body: formData
    });
    const data = await response.json();
    return data.success ? data.data.url : null;
  } catch (e) { return null; }
}

async function cargarCategorias() {
  const snapshot = await db.collection("categorias").get();
  listaCategorias.innerHTML = "";
  categoriasDisponibles = [];
  snapshot.forEach(doc => {
    const cat = doc.data();
    categoriasDisponibles.push(cat.nombre);
    const div = document.createElement("div");
    div.style = "border-bottom:1px solid #eee; padding:8px; display:flex; justify-content:space-between; align-items:center; background:white; border-radius:8px; margin-bottom:5px;";
    div.innerHTML = `<span><strong>${cat.nombre}</strong></span><button onclick="eliminarCategoria('${doc.id}')" style="color:white; border:none; background:#e74c3c; padding:5px 10px; border-radius:5px; cursor:pointer;">✖</button>`;
    listaCategorias.appendChild(div);
  });
}

async function cargarProductos() {
  listaProductos.innerHTML = "<p>Cargando inventario...</p>";
  const snapshot = await db.collection("productos").get();
  productosGlobales = [];
  snapshot.forEach(doc => { productosGlobales.push({ id: doc.id, ...doc.data() }); });
  
  // Ordenar alfabéticamente A-Z
  productosGlobales.sort((a, b) => a.nombre.localeCompare(b.nombre));
  
  renderizarProductos(productosGlobales);
}

function renderizarProductos(lista) {
  listaProductos.innerHTML = "";
  lista.forEach(p => {
    const div = document.createElement("div");
    div.className = "product-item";
    let opcionesCat = categoriasDisponibles.map(c => `<option value="${c}" ${p.categoria === c ? 'selected' : ''}>${c}</option>`).join("");

    div.innerHTML = `
      <div id="view-${p.id}">
        <div class="product-info">
          <img src="${p.imagen || 'https://via.placeholder.com/50'}" style="width:50px; height:50px; float:right; border-radius:8px; object-fit:cover;">
          <h4>${p.nombre}</h4>
          <small>${p.precio} | <b>${p.categoria || 'Sin Cat.'}</b></small><br>
          <span style="color:${p.estado === 'disponible' ? '#27ae60' : (p.estado === 'encargar' ? '#3498db' : '#f39c12')}; font-size:11px; font-weight:bold;">● ${p.estado || 'disponible'}</span>
        </div>
        <div class="btn-group">
          <button class="btn-edit" onclick="mostrarFormularioEdicion('${p.id}')">Editar</button>
          <button class="btn-delete" onclick="eliminarProducto('${p.id}')">Borrar</button>
        </div>
      </div>

      <div id="edit-${p.id}" class="edit-box" style="display:none; background:#f9f9f9; padding:15px; border-radius:10px; border:1px solid #ddd;">
        <label>Nombre:</label><input type="text" id="edit-nombre-${p.id}" value="${p.nombre}">
        <label>Precio:</label><input type="text" id="edit-precio-${p.id}" value="${p.precio}">
        <label>Categoría:</label><select id="edit-categoria-${p.id}">${opcionesCat}</select>
        <label>Estado:</label>
        <select id="edit-estado-${p.id}">
          <option value="disponible" ${p.estado === 'disponible' ? 'selected' : ''}>Disponible</option>
          <option value="encargar" ${p.estado === 'encargar' ? 'selected' : ''}>Para Encargar</option>
          <option value="consultar" ${p.estado === 'consultar' ? 'selected' : ''}>Consultar</option>
        </select>

        <div style="margin-top:10px; padding:10px; border:1px dashed #bbb; border-radius:8px;">
            <label>📷 Nueva foto (Archivo):</label>
            <input type="file" id="file-${p.id}" accept="image/*" style="margin-bottom:10px;">
            <label>🔗 O cambiar Link:</label>
            <input type="text" id="edit-link-${p.id}" value="${p.imagen || ''}">
        </div>
        
        <div class="btn-group" style="margin-top:15px;">
          <button class="btn-edit" onclick="actualizarProducto('${p.id}')">Guardar</button>
          <button class="btn-delete" onclick="cancelarEdicion('${p.id}')">Cerrar</button>
        </div>
      </div>
    `;
    listaProductos.appendChild(div);
  });
}

window.actualizarProducto = async id => {
  const fileInput = document.getElementById(`file-${id}`);
  const linkInput = document.getElementById(`edit-link-${id}`);
  const btnGuardar = document.querySelector(`#edit-${id} .btn-edit`);
  let urlFinal = linkInput.value.trim();

  if (fileInput.files.length > 0) {
    btnGuardar.innerText = "Subiendo...";
    btnGuardar.disabled = true;
    const subida = await subirImagen(fileInput.files[0]);
    if (subida) urlFinal = subida;
  }

  try {
    await db.collection("productos").doc(id).update({
      nombre: document.getElementById(`edit-nombre-${id}`).value,
      precio: document.getElementById(`edit-precio-${id}`).value,
      categoria: document.getElementById(`edit-categoria-${id}`).value,
      estado: document.getElementById(`edit-estado-${id}`).value,
      imagen: urlFinal
    });
    alert("✅ Cambios guardados");
    cargarProductos();
  } catch (e) { 
    alert("Error al guardar"); 
    btnGuardar.innerText = "Guardar";
    btnGuardar.disabled = false;
  }
}

window.mostrarFormularioEdicion = id => {
  document.getElementById(`view-${id}`).style.display = "none";
  document.getElementById(`edit-${id}`).style.display = "block";
}

window.cancelarEdicion = id => {
  document.getElementById(`view-${id}`).style.display = "block";
  document.getElementById(`edit-${id}`).style.display = "none";
}

window.eliminarProducto = async id => {
  if (confirm("¿Borrar producto?")) { 
    await db.collection("productos").doc(id).delete(); 
    cargarProductos(); 
  }
}

window.eliminarCategoria = async id => {
    if (confirm("¿Borrar categoría?")) { 
      await db.collection("categorias").doc(id).delete(); 
      inicializarDatos(); 
    }
}

buscador.addEventListener("input", e => {
  const t = e.target.value.toLowerCase();
  renderizarProductos(productosGlobales.filter(p => p.nombre.toLowerCase().includes(t) || (p.categoria && p.categoria.toLowerCase().includes(t))));
});
