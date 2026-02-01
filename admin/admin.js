let categorias = JSON.parse(localStorage.getItem("categorias")) || [];

const nombre = document.getElementById("nombre");
const precio = document.getElementById("precio");
const imagen = document.getElementById("imagen");
const disponible = document.getElementById("disponible");
const categoriaProducto = document.getElementById("categoriaProducto");
const btnAgregar = document.getElementById("agregar");
const lista = document.getElementById("lista");

const nombreCategoria = document.getElementById("nombreCategoria");
const btnAgregarCategoria = document.getElementById("agregarCategoria");
const listaCategorias = document.getElementById("listaCategorias");

function guardarCategorias() {
    localStorage.setItem("categorias", JSON.stringify(categorias));
}

function cargarCategoriasSelect() {
    categoriaProducto.innerHTML = "";
    categorias.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categoriaProducto.appendChild(option);
    });
}

function renderCategorias() {
    listaCategorias.innerHTML = "";
    categorias.forEach((cat, index) => {
        const div = document.createElement("div");
        div.textContent = cat;

        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.onclick = () => {
            categorias.splice(index, 1);
            guardarCategorias();
            renderCategorias();
            cargarCategoriasSelect();
        };

        div.appendChild(btnEliminar);
        listaCategorias.appendChild(div);
    });
}

btnAgregarCategoria.addEventListener("click", () => {
    if (!nombreCategoria.value.trim()) return;
    categorias.push(nombreCategoria.value.trim());
    guardarCategorias();
    renderCategorias();
    cargarCategoriasSelect();
    nombreCategoria.value = "";
});

btnAgregar.addEventListener("click", async () => {
    if (!nombre.value || !precio.value) return;

    await db.collection("productos").add({
        nombre: nombre.value,
        precio: precio.value,
        imagen: imagen.value || "https://via.placeholder.com/300",
        disponible: disponible.checked,
        categoria: categoriaProducto.value
    });

    nombre.value = "";
    precio.value = "";
    imagen.value = "";
    disponible.checked = false;
});

renderCategorias();
cargarCategoriasSelect();