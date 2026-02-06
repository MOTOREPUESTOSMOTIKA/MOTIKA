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

    // --- Control del Panel ---
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

    // --- Renderizado de Productos ---
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
                btnHTML = `
                    <button class="btn-agregar ${estaEnCarrito ? 'agregado' : ''}" ${estaEnCarrito ? 'disabled' : ''}>
                        ${estaEnCarrito ? 'Agregado ✓' : 'Agregar al carrito'}
                    </button>`;
            } 
            else if (p.estado === "encargar") {
                estadoTexto = "Bajo pedido (Encargo)";
                estadoClase = "encargo";
                btnHTML = `
                    <button class="btn-agregar ${estaEnCarrito ? 'agregado' : ''}" ${estaEnCarrito ? 'disabled' : ''} style="background-color:#3498db;">
                        ${estaEnCarrito ? 'Agregado ✓' : 'Encargar repuesto'}
                    </button>`;
            } 
            else {
                // 🔴 CAMBIO SOLICITADO
                estadoTexto = "En reposición";
                estadoClase = "no-disponible";
                btnHTML = `
                    <button class="btn-agregar ${estaEnCarrito ? 'agregado' : ''}" ${estaEnCarrito ? 'disabled' : ''} style="background-color:#ff9800;">
                        ${estaEnCarrito ? 'Agregado ✓' : 'Apartar'}
                    </button>`;
            }

            const urlImagen = p.imagen && p.imagen !== ""
                ? p.imagen
                : "https://via.placeholder.com/300x300?text=Motika+Repuestos";

            div.innerHTML = `
                <div class="contenedor-img">
                    <img src="${urlImagen}" loading="lazy" referrerpolicy="no-referrer">
                </div>
                <div class="producto-info">
                    <h3>${p.nombre}</h3>
                    <div class="precio">${p.precio}</div>
                    <div class="estado ${estadoClase}">${estadoTexto}</div>
                    ${btnHTML}
                </div>
            `;

            const boton = div.querySelector("button");
            boton.onclick = () => {
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

    // --- Carrito ---
    function mostrarCarrito() {
        listaCarrito.innerHTML = "";

        if (carrito.length === 0) {
            listaCarrito.innerHTML = `
                <div class="carrito-vacio-msg">
                    <p style="font-size:50px;">☹️</p>
                    <p>Tu carrito está vacío</p>
                </div>`;
            if (precioTotalDoc) precioTotalDoc.innerText = "$0";
            btnComprar.style.display = "none";
            return;
        }

        btnComprar.style.display = "block";
        let total = 0;
        let listaTienda = "";
        let listaEncargo = "";

        carrito.forEach((p, index) => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "item-carrito-lista";
            itemDiv.innerHTML = `
                <button class="btn-borrar" data-index="${index}" style="font-size:22px;">✕</button>
                <span class="nombre-p">${p.nombre}</span>
                <span class="precio-p">${p.precio}</span>
            `;
            listaCarrito.appendChild(itemDiv);

            if (p.estado === "encargar" || p.estado === "no-disponible") {
                listaEncargo += `- ${p.nombre} (${p.precio})\n`;
            } else {
                listaTienda += `- ${p.nombre} (${p.precio})\n`;
            }

            let valor = String(p.precio).replace(/[^0-9]/g, "");
            total += parseInt(valor) || 0;
        });

        document.querySelectorAll(".btn-borrar").forEach(btn => {
            btn.onclick = (e) => {
                const idx = e.currentTarget.dataset.index;
                carrito.splice(idx, 1);
                localStorage.setItem("carrito_motika", JSON.stringify(carrito));
                mostrarCarrito();
                mostrarProductos(productos);
            };
        });

        let mensajeWhatsApp = `Hola Motika! 👋 Quiero realizar el siguiente pedido:\n\n`;
        if (listaTienda) {
    mensajeWhatsApp += `*🟢 PRODUCTOS EN TIENDA:*\n${listaTienda}\n`;
}

if (listaEncargo) {
    mensajeWhatsApp += `*🔵 PRODUCTOS PARA ENCARGAR:*\n${listaEncargo}\n`;
}

if (listaApartar) {
    mensajeWhatsApp += `*🟠 PRODUCTOS PARA APARTAR:*\n${listaApartar}\n`;
}
        mensajeWhatsApp += `*Total a pagar: $${total.toLocaleString("es-CO")}*`;

        if (precioTotalDoc) precioTotalDoc.innerText = `$${total.toLocaleString("es-CO")}`;
        btnComprar.href = `https://wa.me/573118612727?text=${encodeURIComponent(mensajeWhatsApp)}`;

        btnComprar.onclick = () => {
            setTimeout(() => vaciarCarritoCompleto(), 1000);
        };
    }

    function vaciarCarritoCompleto() {
        carrito = [];
        localStorage.removeItem("carrito_motika");
        mostrarCarrito();
        mostrarProductos(productos);
    }

    // --- Firebase ---
    db.collection("productos").onSnapshot(snapshot => {
        productos = [];
        const categoriasSet = new Set();

        snapshot.forEach(doc => {
            const p = doc.data();
            if (p.nombre && p.precio) {
                productos.push(p);
                if (p.categoria) categoriasSet.add(p.categoria);
            }
        });

        productos.sort((a, b) => a.nombre.localeCompare(b.nombre));

        filtroCategoria.innerHTML = `<option value="todas">Todas las Categorías</option>`;
        [...categoriasSet].sort().forEach(cat => {
            const opt = document.createElement("option");
            opt.value = opt.textContent = cat;
            filtroCategoria.appendChild(opt);
        });

        mostrarProductos(productos);
        mostrarCarrito();
    });

    buscador.onkeyup = () => {
        mostrarProductos(
            productos.filter(p =>
                p.nombre.toLowerCase().includes(buscador.value.toLowerCase())
            )
        );
    };

    filtroCategoria.onchange = () => {
        mostrarProductos(
            filtroCategoria.value === "todas"
                ? productos
                : productos.filter(p => p.categoria === filtroCategoria.value)
        );
    };
});