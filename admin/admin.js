document.addEventListener("DOMContentLoaded", () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  // API KEY DE IMGBB
  const IMGBB_API_KEY = "c9c201374e8b952b54f76ac5acd6c23b";

  const nombre = document.getElementById("nombre");
  const precio = document.getElementById("precio");
  const archivoImagen = document.getElementById("archivoImagen"); // El nuevo input de archivo
  const estadoProducto = document.getElementById("estado"); 
  const categoriaProducto = document.getElementById("categoriaProducto");
  const btnAgregar = document.getElementById("agregar");

  const nombreCategoria = document.getElementById("nombreCategoria");
  const btnAgregarCategoria = document.getElementById("agregarCategoria");

  const loginBox = document.getElementById("loginBox");
  const adminPanel = document.getElementById("adminPanel");
  const btnLogin = document.getElementById("btnLogin");
  const loginError = document.getElementById("loginError");
  const btnLogout = document.getElementById("btnLogout");

  // ================= FUNCIÓN PARA SUBIR A IMGBB =================
  async function subirFoto(file) {
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      return data.success ? data.data.url : null;
    } catch (error) {
      console.error("Error al subir:", error);
      return null;
    }
  }

  // ================= LOGIN =================
  btnLogin.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
      await auth.signInWithEmailAndPassword(email, password);
      loginError.style.display = "none";
    } catch (error) {
      loginError.style.display = "block";
    }
  });

  btnLogout.addEventListener("click", () => auth.signOut());

  auth.onAuthStateChanged(user => {
    if (user) {
      loginBox.style.display = "none";
      adminPanel.style.display = "block";
      cargarCategoriasSelect();
    } else {
      loginBox.style.display = "block";
      adminPanel.style.display = "none";
    }
  });

  // ================= CATEGORÍAS =================
  async function cargarCategoriasSelect() {
    categoriaProducto.innerHTML = "";
    const snapshot = await db.collection("categorias").get();
    snapshot.forEach(doc => {
      const option = document.createElement("option");
      option.value = doc.data().nombre;
      option.textContent = doc.data().nombre;
      categoriaProducto.appendChild(option);
    });
  }

  btnAgregarCategoria.addEventListener("click", async () => {
    const nombreCat = nombreCategoria.value.trim();
    if (!nombreCat) return mostrarToast("Escribe un nombre de categoría", true);
    await db.collection("categorias").add({ nombre: nombreCat });
    nombreCategoria.value = "";
    mostrarToast("Categoría agregada correctamente");
    cargarCategoriasSelect();
  });

  // ================= PRODUCTOS (CON SUBIDA DE FOTO) =================
  btnAgregar.addEventListener("click", async () => {
    if (!nombre.value || !precio.value) {
        return mostrarToast("Nombre y Precio son obligatorios", true);
    }

    let urlFinal = "https://via.placeholder.com/300"; // Imagen por defecto

    // Si hay un archivo seleccionado, lo subimos primero
    if (archivoImagen.files.length > 0) {
        btnAgregar.innerText = "Subiendo imagen...";
        btnAgregar.disabled = true;
        
        const urlSubida = await subirFoto(archivoImagen.files[0]);
        if (urlSubida) {
            urlFinal = urlSubida;
        } else {
            btnAgregar.innerText = "Agregar Producto";
            btnAgregar.disabled = false;
            return mostrarToast("Error al subir la imagen", true);
        }
    }

    const estadoSeleccionado = estadoProducto.value;

    try {
      await db.collection("productos").add({
        nombre: nombre.value,
        precio: precio.value,
        imagen: urlFinal,
        categoria: categoriaProducto.value,
        estado: estadoSeleccionado,
        disponible: estadoSeleccionado === "disponible" 
      });

      mostrarToast("Producto agregado correctamente");

      // Limpiar campos
      nombre.value = "";
      precio.value = "";
      archivoImagen.value = ""; // Limpia el selector de archivos
      estadoProducto.value = "disponible";
      btnAgregar.innerText = "Agregar Producto";
      btnAgregar.disabled = false;

    } catch (e) {
      mostrarToast("Error al guardar en base de datos", true);
      btnAgregar.innerText = "Agregar Producto";
      btnAgregar.disabled = false;
    }
  });

  function mostrarToast(texto, error = false) {
    const toast = document.getElementById("toast");
    if(!toast) return alert(texto);
    toast.textContent = texto;
    toast.style.background = error ? "#e74c3c" : "#2ecc71";
    toast.style.display = "block";
    setTimeout(() => toast.style.display = "none", 2500);
  }
});
