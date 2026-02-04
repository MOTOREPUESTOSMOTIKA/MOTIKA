const listaProductos = document.getElementById("listaProductos");
const listaCategorias = document.getElementById("listaCategorias");
const buscador = document.getElementById("buscador");

let productosGlobales = [];
let categoriasDisponibles = [];

const IMGBB_API_KEY = "c9c201374e8b952b54f76ac5acd6c23b"; 

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
  } catch (e) { 
    return null; 
  }
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
    div.innerHTML = `
      <span><strong>${cat.nombre}</strong></span>
      <button onclick="eliminarCategoria('${doc.id}')" style="color:white; border:none; background:#e74c3c; padding:5px 10px; border-radius:5px; cursor:pointer;">✖</button>
    `;
    listaCategorias.appendChild(div);
  });
}

async function cargarProductos() {
  listaProductos.innerHTML = "<p>Cargando inventario...</p>";
  const snapshot = await db.collection("productos").get();
  productosGlobales = [];
  snapshot.forEach(doc => { 
    productosGlobales.push({ id: doc.id, ...doc.data() }); 
  });
  productosGlobales.sort((a, b) => a.nombre.localeCompare(b.nombre));
  renderizarProductos(productosGlobales);
}

function renderizarProductos(lista) {
  const fragmento = document.createDocumentFragment();
  listaProductos.innerHTML = "";
  
  lista.forEach(p => {
    const div = document.createElement("div");
    div.className = "product-item";
    let opcionesCat = categoriasDisponibles.map(c => 
      `<option value="${c}" ${p.categoria === c ? 'selected' : ''}>${c}</option>`
    ).join("");

    div.innerHTML = `
      <div id="view-${p.id}">
        <div class="product-info">
          <img src="${p.imagen || 'https://via.placeholder.com/60'}" loading="lazy" style="width:60px; height:60px; float:right; border-radius:12px; object-fit:cover; border: 1px solid #eee;">
          <h4 style="margin:0; color:#2c3e50;">${p.nombre}</h4>
          <p style="margin:5px 0; font-size:14px;">${p.precio} | <b style="color:#7f8c8d;">${p.categoria || 'Sin Cat.'}</b></p>
          <span style="color:${p.estado === 'disponible' ? '#27ae60' : (p.estado === 'encargar' ? '#3498db' : '#f39c12')}; font-size:12px; font-weight:bold;">
            ● ${p.estado || 'disponible'}
          </span>
        </div>
        <div class="btn-group" style="margin-top:15px; display:flex; gap:10px;">
          <button class="btn-edit" onclick="mostrarFormularioEdicion('${p.id}')" style="background-color: #3498db; color: white; border: none; padding: 10px; border-radius: 8px; flex:1; cursor:pointer; font-weight:bold;">Editar</button>
          <button class="btn-delete" onclick="eliminarProducto('${p.id}')" style="background-color: #e74c3c; color: white; border: none; padding: 10px; border-radius: 8px; flex:1; cursor:pointer; font-weight:bold;">Eliminar</button>
        </div>
      </div>
      <div id="edit-${p.id}" class="edit-box" style="display:none; background:#ffffff; padding:15px; border-radius:12px; border:2px solid #3498db;">
        <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:5px;">Nombre:</label>
        <input type="text" id="edit-nombre-${p.id}" value="${p.nombre}" style="width:100%; padding:8px; margin-bottom:10px; border-radius:6px; border:1px solid #ccc; box-sizing:border-box;">
        <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:5px;">Precio:</label>
        <input type="text" id="edit-precio-${p.id}" value="${p.precio}" style="width:100%; padding:8px; margin-bottom:10px; border-radius:6px; border:1px solid #ccc; box-sizing:border-box;">
        <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:5px;">Categoría:</label>
        <select id="edit-categoria-${p.id}" style="width:100%; padding:8px; margin-bottom:10px; border-radius:6px; border:1px solid #ccc;">${opcionesCat}</select>
        <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:5px;">Estado:</label>
        <select id="edit-estado-${p.id}" style="width:100%; padding:8px; margin-bottom:10px; border-radius:6px; border:1px solid #ccc;">
          <option value="disponible" ${p.estado === 'disponible' ? 'selected' : ''}>Disponible</option>
          <option value="encargar" ${p.estado === 'encargar' ? 'selected' : ''}>Para Encargar</option>
          <option value="consultar" ${p.estado === 'consultar' ? 'selected' : ''}>Consultar</option>
        </select>
        <div style="margin-top:10px; padding:10px; background:#f8f9fa; border-radius:8px; border:1px dashed #3498db;">
            <label style="font-size:11px; color:#34495e; font-weight:bold;">📷 Opción A: Nueva Foto</label>
            <input type="file" id="file-${p.id}" accept="image/*" style="font-size:11px; margin-bottom:10px; width:100%;">
            <label style="font-size:11px; color:#34495e; font-weight:bold;">🔗 Opción B: Cambiar Link</label>
            <input type="text" id="edit-link-${p.id}" value="${p.imagen || ''}" style="width:100%; padding:6px; font-size:11px; border-radius:4px; border:1px solid #ddd; box-sizing:border-box;">
        </div>
        <div class="btn-group" style="margin-top:15px; display:flex; gap:10px;">
          <button class="btn-edit" onclick="actualizarProducto('${p.id}')" style="background-color: #27ae60; color: white; border: none; padding: 10px; border-radius: 8px; flex:1; cursor:pointer; font-weight:bold;">Guardar</button>
          <button class="btn-delete" onclick="cancelarEdicion('${p.id}')" style="background-color: #95a5a6; color: white; border: none; padding: 10px; border-radius: 8px; flex:1; cursor:pointer; font-weight:bold;">Cerrar</button>
        </div>
      </div>
    `;
    fragmento.appendChild(div);
  });
  listaProductos.appendChild(fragmento);
}

window.actualizarProducto = async id => {
  const fileInput = document.getElementById(`file-${id}`);
  const linkInput = document.getElementById(`edit-link-${id}`);
  const btnGuardar = document.querySelector(`#edit-${id} button[onclick*="actualizarProducto"]`);
  let urlFinal = linkInput.value.trim();

  if (fileInput.files.length > 0) {
    btnGuardar.innerText = "Subiendo...";
    btnGuardar.disabled = true;
    const subida = await subirImagen(fileInput.files[0]);
    if (subida) urlFinal = subida;
    else {
      alert("Error al subir la imagen");
      btnGuardar.innerText = "Guardar";
      btnGuardar.disabled = false;
      return;
    }
  }

  try {
    await db.collection("productos").doc(id).update({
      nombre: document.getElementById(`edit-nombre-${id}`).value,
      precio: document.getElementById(`edit-precio-${id}`).value,
      categoria: document.getElementById(`edit-categoria-${id}`).value,
      estado: document.getElementById(`edit-estado-${id}`).value,
      imagen: urlFinal
    });
    alert("✅ Producto actualizado");
    cargarProductos();
  } catch (e) { alert("❌ Error"); }
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
  if (confirm("¿Eliminar?")) { await db.collection("productos").doc(id).delete(); cargarProductos(); }
}
window.eliminarCategoria = async id => {
  if (confirm("¿Borrar?")) { await db.collection("categorias").doc(id).delete(); inicializarDatos(); }
}

buscador.addEventListener("input", e => {
  const t = e.target.value.toLowerCase();
  renderizarProductos(productosGlobales.filter(p => p.nombre.toLowerCase().includes(t) || (p.categoria && p.categoria.toLowerCase().includes(t))));
});
