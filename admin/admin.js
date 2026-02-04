document.addEventListener("DOMContentLoaded", () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  // API KEY DE IMGBB CONFIGURADA
  const IMGBB_API_KEY = "c9c201374e8b952b54f76ac5acd6c23b";

  const nombre = document.getElementById("nombre");
  const precio = document.getElementById("precio");
  const archivoImagen = document.getElementById("archivoImagen");
  const imgPreview = document.getElementById("img-preview");
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

  // ================= VISTA PREVIA DE IMAGEN =================
  archivoImagen.addEventListener("change", function() {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imgPreview.src = e.target.result;
        imgPreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });

  // ================= FUNCIÓN SUBIR A IMGBB =================
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
    if (!nombreCat) return mostrarToast("Escribe un nombre", true);
    await db.collection("categorias").add({ nombre: nombreCat });
    nombreCategoria.value = "";
    mostrarToast("Categoría agregada");
    cargarCategoriasSelect();
  });

  // ================= AGREGAR PRODUCTO =================
  btnAgregar.addEventListener("click", async () => {
    if (!nombre.value || !precio.value) {
        return mostrarToast("Nombre y Precio obligatorios", true);
    }

    let urlFinal = "https://via.placeholder.com/300?text=Sin+Foto";

    // Si hay foto seleccionada, la subimos
    if (archivoImagen.files.length > 0) {
        const originalText = btnAgregar.innerText;
        btnAgregar.innerText = "Subiendo foto...";
        btnAgregar.disabled = true;
        
        const urlSubida = await subirFoto(archivoImagen.files[0]);
        if (urlSubida) {
            urlFinal = urlSubida;
        } else {
            btnAgregar.innerText = originalText;
            btnAgregar.disabled = false;
            return mostrarToast("Error al subir imagen", true);
        }
    }

    try {
      await db.collection("productos").add({
        nombre: nombre.value,
        precio: precio.value,
        imagen: urlFinal,
        categoria: categoriaProducto.value,
        estado: estadoProducto.value,
        disponible: estadoProducto.value === "disponible" 
      });

      mostrarToast("¡Producto agregado!");

      // Limpiar todo
      nombre.value = "";
      precio.value = "";
      archivoImagen.value = "";
      imgPreview.style.display = "none";
      btnAgregar.innerText = "Agregar producto";
      btnAgregar.disabled = false;

    } catch (e) {
      mostrarToast("Error al guardar", true);
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
