document.addEventListener("DOMContentLoaded", () => {

    const contenedor = document.getElementById("productos");
    const buscador = document.getElementById("buscador");
    const filtroCategoria = document.getElementById("filtroCategoria");

    const btnAbrirCarrito = document.getElementById("btnAbrirCarrito");
    const carritoPanel = document.getElementById("carrito");
    const listaCarrito = document.getElementById("listaCarrito");
    const btnComprar = document.getElementById("btnComprar");

    let productos = [];
    let carrito = [];

    btnAbrirCarrito.onclick = () => {
        carritoPanel.classList.toggle("abierto");
    };

    function mostrarProductos(lista) {
        contenedor.innerHTML = "";

        lista.forEach(p => {
            const div = document.createElement("div");
            div.className = "producto";

            const botonHTML = p.disponible
                ? `<button class="btn-agregar">Agregar al carrito</button>`
                : `<button class="btn-consultar">Consultar disponibilidad</button>`;

            div.innerHTML = `
    <img src="${p.imagen}">
    <div class="producto-info">
        <h3>${p.nombre}</h3>
        <div class="precio">${p.precio}</div>
        <div class="estado ${p.disponible ? 'disponible' : 'no-disponible'}">
            ${p.disponible ? 'Disponible en tienda' : 'Consultar disponibilidad'}
        </div>
        ${botonHTML}
    </div>
`;

            const boton = div.querySelector("button");

            if (p.disponible) {
                boton.onclick = () => {
                    carrito.push(p);
                    mostrarCarrito();
                    boton.textContent = "Agregado ✓";
                    boton.disabled = true;
                    boton.classList.add("agregado");
                };
            } else {
                boton.onclick = () => {
                    const msg = `Hola, quisiera saber disponibilidad del producto: ${p.nombre}`;
                    window.open(`https://wa.me/573118612727?text=${encodeURIComponent(msg)}`);
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

    filtroCategoria.onchange = () => {
        if (filtroCategoria.value === "todas") {
            mostrarProductos(productos);
        } else {
            mostrarProductos(productos.filter(p => p.categoria === filtroCategoria.value));
        }
    };

    buscador.onkeyup = () => {
        const t = buscador.value.toLowerCase();
        mostrarProductos(productos.filter(p => p.nombre.toLowerCase().includes(t)));
    };

    db.collection("productos")
        .where("disponible", "==", true)
        .onSnapshot(snapshot => {
            productos = [];
            filtroCategoria.innerHTML = `<option value="todas">Todas las Categorías</option>`;

            snapshot.forEach(doc => {
                const p = doc.data();
                if (p.nombre && p.precio && p.imagen) {
                    productos.push(p);
                }
            });

            [...new Set(productos.map(p => p.categoria))].forEach(cat => {
                const o = document.createElement("option");
                o.value = cat;
                o.textContent = cat;
                filtroCategoria.appendChild(o);
            });

            mostrarProductos(productos);
        });

});
