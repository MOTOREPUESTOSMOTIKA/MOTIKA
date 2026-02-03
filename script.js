document.addEventListener("DOMContentLoaded", () => {

    const contenedor = document.getElementById("productos");
    const buscador = document.getElementById("buscador");
    const filtroCategoria = document.getElementById("filtroCategoria");

    const btnAbrirCarrito = document.getElementById("btnAbrirCarrito");
    const carritoPanel = document.getElementById("carrito");
    const listaCarrito = document.getElementById("listaCarrito");
    const btnComprar = document.getElementById("btnComprar");
    const precioTotalDoc = document.getElementById("precioTotal");

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
            carritoPanel.classList.remove("arbierto");
            carritoPanel.classList.remove("abierto");
        }
    });

    function mostrarProductos(lista) {
        contenedor.innerHTML = "";

        lista.forEach(p => {
            const div = document.createElement("div");
            div.className = "producto";

            const btnHTML = p.disponible
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
                    ${btnHTML}
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
                    const msg = `Hola, quisiera saber la disponibilidad del producto: ${p.nombre}`;
                    window.open(`https://wa.me/573118612727?text=${encodeURIComponent(msg)}`);
                };
            }

            contenedor.appendChild(div);
        });
    }

    function mostrarCarrito() {
        listaCarrito.innerHTML = "";
        
        if (carrito.length === 0) {
            listaCarrito.innerHTML = `
                <div class="carrito-vacio-msg">
                    <p style="font-size: 50px;">☹️</p>
                    <p>Tu carrito está vacío</p>
                </div>`;
            precioTotalDoc.innerText = "$0";
            btnComprar.style.display = "none";
            return;
        }

        btnComprar.style.display = "block";
        let mensaje = "Hola, quiero comprar:%0A";
        let total = 0;

        carrito.forEach(p => {
            listaCarrito.innerHTML += `<div class="item-carrito-lista"><span>${p.nombre}</span> <span>${p.precio}</span></div>`;
            mensaje += `- ${p.nombre} (${p.precio})%0A`;
            
            // Limpiar el precio (quitar $ y puntos) para sumar
            let valorNumerico = parseFloat(p.precio.replace(/[^0-9.-]+/g,""));
            total += valorNumerico;
        });

        precioTotalDoc.innerText = `$${total.toLocaleString('es-CO')}`;
        mensaje += `%0ATotal: $${total.toLocaleString('es-CO')}`;
        btnComprar.href = `https://wa.me/573118612727?text=${mensaje}`;
    }

    // Ejecutar una vez al inicio para mostrar carita triste
    mostrarCarrito();

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
                const opt = document.createElement("option");
                opt.value = cat;
                opt.textContent = cat;
                filtroCategoria.appendChild(opt);
            });

            mostrarProductos(productos);
        });

});
