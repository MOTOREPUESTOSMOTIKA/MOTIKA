document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("productos");
    const buscador = document.getElementById("buscador");
    const filtroCategoria = document.getElementById("filtroCategoria");
    const btnAbrirCarrito = document.getElementById("btnAbrirCarrito");
    const btnCerrarCarrito = document.getElementById("btnCerrarCarrito");
    const carritoPanel = document.getElementById("carrito");
    const listaCarrito = document.getElementById("listaCarrito");
    const btnComprar = document.getElementById("btnComprar");
    const precioTotalDoc = document.getElementById("precioTotal");

    let productos = [];
    let carrito = JSON.parse(localStorage.getItem("carrito_motika")) || [];

    btnAbrirCarrito.onclick = (e) => {
        e.stopPropagation();
        carritoPanel.classList.add("abierto");
    };

    btnCerrarCarrito.onclick = () => {
        carritoPanel.classList.remove("abierto");
    };

    document.addEventListener("click", (event) => {
        if (
            carritoPanel.classList.contains("abierto") &&
            !carritoPanel.contains(event.target) &&
            event.target !== btnAbrirCarrito
        ) {
            carritoPanel.classList.remove("abierto");
        }
    });

    carritoPanel.onclick = (e) => e.stopPropagation();

    function mostrarProductos(lista) {
        contenedor.innerHTML = "";

        lista.forEach(p => {
            const div = document.createElement("div");
            div.className = "producto";
            const estaEnCarrito = carrito.some(item => item.nombre === p.nombre);

            let btnHTML = "";
            let estadoTexto = "";
            let estadoClase = "";

            if (p.estado === "disponible") {
                estadoTexto = "Disponible en tienda";
                estadoClase = "disponible";
                btnHTML = `<button class="btn-agregar ${estaEnCarrito ? 'agregado' : ''}" ${estaEnCarrito ? 'disabled' : ''}>${estaEnCarrito ? 'Agregado ✓' : 'Agregar al carrito'}</button>`;
            } else if (p.estado === "encargar") {
                estadoTexto = "Bajo pedido (Encargo)";
                estadoClase = "encargo";
                btnHTML = `<button class="btn-agregar ${estaEnCarrito ? 'agregado' : ''}" ${estaEnCarrito ? 'disabled' : ''} style="background-color:#3498db;">${estaEnCarrito ? 'Agregado ✓' : 'Encargar repuesto'}</button>`;
            } else {
                estadoTexto = "En reposición";
                estadoClase = "no-disponible";
                btnHTML = `<button class="btn-agregar ${estaEnCarrito ? 'agregado' : ''}" ${estaEnCarrito ? 'disabled' : ''} style="background-color:#ff9800;">${estaEnCarrito ? 'Agregado ✓' : 'Apartar'}</button>`;
            }

            const urlImagen = p.imagen && p.imagen !== "" ? p.imagen : "https://via.placeholder.com/300x300?text=Motika+Repuestos";

            div.innerHTML = `
                <div class="contenedor-img"><img src="${urlImagen}" loading="lazy"></div>
                <div class="producto-info">
                    <h3>${p.nombre}</h3>
                    <div class="precio">${p.precio}</div>
                    <div class="estado ${estadoClase}">${estadoTexto}</div>
                    ${btnHTML}
                </div>
            `;

            div.querySelector("button").onclick = () => {
                if (!estaEnCarrito) {
                    carrito.push(p);
                    localStorage.setItem("carrito_motika", JSON.stringify(carrito));
                    mostrarCarrito();
                    mostrarProductos(lista);
                }
            };

            contenedor.appendChild(div);
        });
    }

    function mostrarCarrito() {
        listaCarrito.innerHTML = "";

        if (carrito.length === 0) {
            listaCarrito.innerHTML = `<div class="carrito-vacio-msg"><p style="font-size:50px;">☹️</p><p>Tu carrito está vacío</p></div>`;
            precioTotalDoc.innerText = "$0";
            btnComprar.style.display = "none";
            return;
        }

        btnComprar.style.display = "block";
        let total = 0;
        let listaTienda = "";
        let listaEncargo = "";
        let listaApartar = "";

        carrito.forEach((p, index) => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "item-carrito-lista";
            itemDiv.innerHTML = `<button class="btn-borrar" data-index="${index}">✕</button><span>${p.nombre}</span><span>${p.precio}</span>`;
            listaCarrito.appendChild(itemDiv);

            if (p.estado === "encargar" || p.estado === "no-disponible") {
                listaEncargo += `- ${p.nombre} (${p.precio})\n`;
            } else {
                listaTienda += `- ${p.nombre} (${p.precio})\n`;
            }

            total += parseInt(String(p.precio).replace(/[^0-9]/g, "")) || 0;
        });

        // ✅ BOTÓN VACIAR CARRITO (COMO ANTES)
        const btnVaciar = document.createElement("button");
        btnVaciar.textContent = "Vaciar carrito";
        btnVaciar.className = "btn-vaciar-carrito";
        btnVaciar.onclick = vaciarCarritoCompleto;
        listaCarrito.appendChild(btnVaciar);

        document.querySelectorAll(".btn-borrar").forEach(btn => {
            btn.onclick = e => {
                carrito.splice(e.target.dataset.index, 1);
                localStorage.setItem("carrito_motika", JSON.stringify(carrito));
                mostrarCarrito();
                mostrarProductos(productos);
            };
        });

        precioTotalDoc.innerText = `$${total.toLocaleString("es-CO")}`;

        btnComprar.href = `https://wa.me/573118612727?text=${encodeURIComponent(
            `Hola Motika! 👋\n\n${listaTienda}${listaEncargo}\nTotal: $${total.toLocaleString("es-CO")}`
        )}`;
    }

    function vaciarCarritoCompleto() {
        carrito = [];
        localStorage.removeItem("carrito_motika");
        mostrarCarrito();
        mostrarProductos(productos);
    }

    db.collection("productos").onSnapshot(snapshot => {
        productos = [];
        const categorias = new Set();

        snapshot.forEach(doc => {
            const p = doc.data();
            productos.push(p);
            if (p.categoria) categorias.add(p.categoria);
        });

        filtroCategoria.innerHTML = `<option value="todas">Todas las Categorías</option>`;
        [...categorias].forEach(cat => {
            const o = document.createElement("option");
            o.value = o.textContent = cat;
            filtroCategoria.appendChild(o);
        });

        mostrarProductos(productos);
        mostrarCarrito();
    });

    buscador.onkeyup = () => mostrarProductos(productos.filter(p => p.nombre.toLowerCase().includes(buscador.value.toLowerCase())));
    filtroCategoria.onchange = () => mostrarProductos(filtroCategoria.value === "todas" ? productos : productos.filter(p => p.categoria === filtroCategoria.value));
});