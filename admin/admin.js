document.addEventListener("DOMContentLoaded", () => {

  // 🔥 Firebase (ASEGÚRATE DE QUE ESTO EXISTA)
  const auth = firebase.auth();
  const db = firebase.firestore();

  const nombre = document.getElementById("nombre");
  const precio = document.getElementById("precio");
  const imagen = document.getElementById("imagen");
  const disponible = document.getElementById("disponible");
  const categoriaProducto = document.getElementById("categoriaProducto");
  const btnAgregar = document.getElementById("agregar");

  const nombreCategoria = document.getElementById("nombreCategoria");
  const btnAgregarCategoria = document.getElementById("agregarCategoria");

  // LOGIN
  const loginBox = document.getElementById("loginBox");
  const adminPanel = document.getElementById("adminPanel");
  const btnLogin = document.getElementById("btnLogin");
  const loginError = document.getElementById("loginError");
  const btnLogout = document.getElementById("btnLogout");

  // ================================
  // LOGIN
  // ================================
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

  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      auth.signOut();
    });
  }

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

  // ================================
  // CATEGORÍAS
  // ================================
  async function cargarCategoriasSelect() {
    categoriaProducto.innerHTML = "";

    const snapshot = await db.collection("categorias").get();
    snapshot.forEach(doc => {
      const cat = doc.data();
      const option = document.createElement("option");
      option.value = cat.nombre;
      option.textContent = cat.nombre;
      categoriaProducto.appendChild(option);
    });
  }

  btnAgregarCategoria.addEventListener("click", async () => {
    const nombreCat = nombreCategoria.value.trim();
    if (!nombreCat) {
      mostrarToast("Escribe un nombre de categoría", true);
      return;
    }

    try {
      await db.collection("categorias").add({ nombre: nombreCat });
      mostrarToast("Categoría agregada correctamente");
      nombreCategoria.value = "";
      cargarCategoriasSelect();
    } catch (error) {
      mostrarToast("Error al agregar categoría", true);
    }
  });

  // ================================
  // PRODUCTOS
  // ================================
  btnAgregar.addEventListener("click", async () => {
    if (!nombre.value || !precio.value) return;

    try {
      await db.collection("productos").add({
        nombre: nombre.value,
        precio: precio.value,
        imagen: imagen.value || "https://via.placeholder.com/300",
        disponible: disponible.checked,
        categoria: categoriaProducto.value
      });

      mostrarToast("Producto agregado correctamente");
      nombre.value = "";
      precio.value = "";
      imagen.value = "";
      disponible.checked = true;

    } catch (error) {
      alert("Error al agregar producto");
    }
  });

  function mostrarToast(texto, error = false) {
    const toast = document.getElementById("toast");
    toast.textContent = texto;
    toast.style.background = error ? "#e74c3c" : "#2ecc71";
    toast.style.display = "block";

    setTimeout(() => {
      toast.style.display = "none";
    }, 2500);
  }

});