const nombre = document.getElementById("nombre");
const precio = document.getElementById("precio");
const imagen = document.getElementById("imagen");
const disponible = document.getElementById("disponible");
const categoriaProducto = document.getElementById("categoriaProducto");
const btnAgregar = document.getElementById("agregar");

const nombreCategoria = document.getElementById("nombreCategoria");
const btnAgregarCategoria = document.getElementById("agregarCategoria");
const mensajeProducto = document.getElementById("mensajeProducto");

// LOGIN
const loginBox = document.getElementById("loginBox");
const adminPanel = document.getElementById("adminPanel");
const btnLogin = document.getElementById("btnLogin");
const loginError = document.getElementById("loginError");
const btnLogout = document.getElementById("btnLogout");

btnLogin.onclick = async () => {
  try {
    await auth.signInWithEmailAndPassword(
      email.value, password.value
    );
    loginError.style.display = "none";
  } catch {
    loginError.style.display = "block";
  }
};

btnLogout.onclick = () => auth.signOut();

auth.onAuthStateChanged(user => {
  loginBox.style.display = user ? "none" : "block";
  adminPanel.style.display = user ? "block" : "none";
  if (user) cargarCategoriasSelect();
});

// CATEGORÍAS
async function cargarCategoriasSelect() {
  categoriaProducto.innerHTML = "";
  const snap = await db.collection("categorias").get();
  snap.forEach(doc => {
    const opt = document.createElement("option");
    opt.value = doc.data().nombre;
    opt.textContent = doc.data().nombre;
    categoriaProducto.appendChild(opt);
  });
}

btnAgregarCategoria.onclick = async () => {
  if (!nombreCategoria.value.trim()) return;
  await db.collection("categorias").add({ nombre: nombreCategoria.value });
  nombreCategoria.value = "";
  cargarCategoriasSelect();
};

// PRODUCTOS
btnAgregar.onclick = async () => {
  if (!nombre.value || !precio.value) return;

  await db.collection("productos").add({
    nombre: nombre.value,
    precio: precio.value,
    imagen: imagen.value || "",
    disponible: disponible.checked,
    categoria: categoriaProducto.value
  });

  mensajeProducto.style.display = "block";
  setTimeout(() => mensajeProducto.style.display = "none", 3000);

  nombre.value = precio.value = imagen.value = "";
};