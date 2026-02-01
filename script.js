document.addEventListener("DOMContentLoaded", () => {

    const contenedor = document.getElementById("productos");
    const btnComprar = document.getElementById("btnComprar");
    const buscador = document.getElementById("buscador");
    const filtroCategoria = document.getElementById("filtroCategoria");

    const btnAbrirCarrito = document.getElementById("btnAbrirCarrito");
    const carritoPanel = document.getElementById("carrito");
    const listaCarrito = document.getElementById("listaCarrito");

    let productos = [];
    let carrito = [];

    btnAbrirCarrito.onclick = () => {
        carritoPanel.classList.toggle("abierto");
    };

    document.addEventListener("click", (e) => {
        if (
            carritoPanel.classList.contains("abierto") &&
            !carritoPanel.contains(e.target) &&
            e.target !== btnAbrirCarrito
        ) {
            carritoPanel.classList.remove("abierto");
        }
    });

    btnComprar.onclick = () => {
        carritoPanel.classList.remove("abierto");
    };

    function mostrarProductos(lista) {
        contenedor.innerHTML = "";
        lista.forEach(p => {
            const div = document.createElement("div");
            div.className = "producto";
            div.innerHTML = `
                <img src="${p.imagen}">
                <div class="producto-info">
                    <h3>${p.nombre}</h3>
                    <div class="precio">${p.precio}</div>
                    ${p.disponible
    ? `<button class="btn-carrito">Agregar al carrito</button>`
    : `<button class="btn-consultar">Consultar disponibilidad</button>`
}
                </div>
            `;
           const boton = div.querySelector("button");

if (p.disponible) {
    boton.onclick = () => {
        carrito.push(p);
        mostrarCarrito();
    };
} else {
    boton.onclick = () => {
        const mensaje = `Hola, quisiera saber disponibilidad del producto: ${p.nombre}`;
        window.open(`https://wa.me/573118612727?text=${encodeURIComponent(mensaje)}`);
    };
}
            contenedor.appendChild(div);
        });
    }

    function mostrarCarrito() {
        listaCarrito.innerHTML = "";
        let mensaje = "Hola, quiero comprar:%0A";

        carrito.forEach(p => {
            listaCarrito.innerHTML += `<div>${p.nombre} - ${p.precio}</div>`;
            mensaje += `- ${p.nombre} (${p.precio})%0A`;
        });

        btnComprar.href = `https://wa.me/573118612727?text=${mensaje}`;
    }

    filtroCategoria.addEventListener("change", () => {
        if (filtroCategoria.value === "todas") {
            mostrarProductos(productos);
        } else {
            mostrarProductos(productos.filter(p => p.categoria === filtroCategoria.value));
        }
    });

    buscador.addEventListener("keyup", () => {
        const texto = buscador.value.toLowerCase();
        mostrarProductos(productos.filter(p => p.nombre.toLowerCase().includes(texto)));
    });

    if (typeof db !== "undefined") {
        db.collection("productos")
            .where("disponible", "==", true)
            .onSnapshot((snapshot) => {
                productos = [];
                filtroCategoria.innerHTML = `<option value="todas">Todas las Categorías</option>`;

                snapshot.forEach(doc => {
    const p = doc.data();
    if (p.nombre && p.precio && p.imagen) {
        productos.push(p);
    }
});

                const categorias = [...new Set(productos.map(p => p.categoria))];
                categorias.forEach(cat => {
                    const option = document.createElement("option");
                    option.value = cat;
                    option.textContent = cat;
                    filtroCategoria.appendChild(option);
                });

                mostrarProductos(productos);
            });
    }
});
