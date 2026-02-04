document.addEventListener("DOMContentLoaded", () => {

  const auth = firebase.auth();
  const db = firebase.firestore();

  const nombre = document.getElementById("nombre");
  const precio = document.getElementById("precio");
  const imagen = document.getElementById("imagen");
  // ✅ Cambio: Ahora buscaremos un select llamado "estado" en el HTML
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

  // ================= PRODUCTOS (CON 3 ESTADOS) =================
  btnAgregar.addEventListener("click", async () => {
    if (!nombre.value || !precio.value) {
        return mostrarToast("Nombre y Precio son obligatorios", true);
    }

    const estadoSeleccionado = estadoProducto.value;

    await db.collection("productos").add({
      nombre: nombre.value,
      precio: precio.value,
      imagen: imagen.value || "https://via.placeholder.com/300",
      categoria: categoriaProducto.value,
      estado: estadoSeleccionado, // Guardamos: disponible, encargar o consultar
      // Mantenemos disponible como boolean por si otros archivos lo usan
      disponible: estadoSeleccionado === "disponible" 
    });

    mostrarToast("Producto agregado correctamente");

    // Limpiar campos
    nombre.value = "";
    precio.value = "";
    imagen.value = "";
    estadoProducto.value = "disponible"; // Reset a disponible por defecto
  });

  function mostrarToast(texto, error = false) {
    const toast = document.getElementById("toast");
    if(!toast) return alert(texto); // Por si no tienes el div toast
    toast.textContent = texto;
    toast.style.background = error ? "#e74c3c" : "#2ecc71";
    toast.style.display = "block";
    setTimeout(() => toast.style.display = "none", 2500);
  }

});
