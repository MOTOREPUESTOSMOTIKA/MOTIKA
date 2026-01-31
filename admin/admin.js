let productos = JSON.parse(localStorage.getItem("productos")) || [];
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

function guardar() {
    localStorage.setItem("productosMOTIKA", JSON.stringify(productos));
}

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

function render() {
    lista.innerHTML = "";
    productos.forEach((p, i) => {
        const div = document.createElement("div");
        div.innerHTML = `
            ${p.nombre} - ${p.precio} - ${p.categoria} - 
            ${p.disponible ? "Disponible" : "No disponible"}
            <button onclick="eliminar(${i})">Eliminar</button>
        `;
        lista.appendChild(div);
    });
}

function eliminar(index) {
    productos.splice(index, 1);
    guardar();
    render();
}

btnAgregar.addEventListener("click", () => {
    if (!nombre.value || !precio.value) return;

    productos.push({
        nombre: nombre.value,
        precio: precio.value,
        imagen: imagen.value || "https://via.placeholder.com/300",
        disponible: disponible.checked,
        categoria: categoriaProducto.value
    });

    guardar();
    render();

    nombre.value = "";
    precio.value = "";
    imagen.value = "";
    disponible.checked = false;
});

renderCategorias();
cargarCategoriasSelect();
render();

