document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("productos");
    const buscador = document.getElementById("buscador");
    const filtroCategoria = document.getElementById("filtroCategoria");
    const btnAbrirCarrito = document.getElementById("btnAbrirCarrito");
    const btnCerrarCarrito = document.getElementById("btnCerrarCarrito"); // NUEVO
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

    // NUEVO: Cerrar con la X
    btnCerrarCarrito.onclick = () => {
        carritoPanel.classList.remove("abierto");
    };

    document.addEventListener("click", (event) => {
        const clicFueraDelPanel = !carritoPanel.contains(event.target);
        const clicFueraDelBoton = event.target !== btnAbrirCarrito;

        if (carritoPanel.classList.contains("abierto") && clicFueraDelPanel && clicFueraDelBoton) {
            carritoPanel.classList.remove("abierto");
        }
    });

    carritoPanel.onclick = (e) => {
        e.stopPropagation();
    };

    // --- Renderizado de Productos (Sin cambios) ---
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
                estadoTexto = "En tienda"; // Texto corto para que no rompa el diseño
                estadoClase = "disponible";
                btnHTML = `<button class="btn-agregar ${estaEnCarrito ? 'agregado' : ''}" ${estaEnCarrito ? 'disabled' : ''}>
                            ${estaEnCarrito ? 'Agregado ✓' : 'Agregar'}
                           </button>`;
            } else if (p.estado === "encargar") {
                estadoTexto = "Por encargo";
                estadoClase = "encargo";
                btnHTML = `<button class="btn-encargar ${estaEnCarrito ? 'agregado' : ''}" ${estaEnCarrito ? 'disabled' : ''}>
                            ${estaEnCarrito ? 'Agregado ✓' : 'Encargar'}
                           </button>`;
            } else {
                estadoTexto = "Consultar";
                estadoClase = "no-disponible";
                btnHTML = `<button class="btn-consultar">Pedir</button>`;
            }

            const urlImagen = p.imagen && p.imagen !== "" ? p.imagen : 'https://via.placeholder.com/300x300?text=Motika+Repuestos';

            div.innerHTML = `
                <div class="contenedor-img">
                    <img src="${urlImagen}" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='https://via.placeholder.com/300x300?text=Error+al+cargar'">
                </div>
                <div class="producto-info">
                    <h3>${p.nombre}</h3>
                    <div class="precio">${p.precio}</div>
                    <div class="estado ${estadoClase}">• ${estadoTexto}</div>
                    ${btnHTML}
                </div>
            `;

            const boton = div.querySelector("button");
            boton.onclick = () => {
                if (p.estado === "disponible" || p.estado === "encargar") {
                    carrito.push(p);
                    localStorage.setItem("carrito_motika", JSON.stringify(carrito));
                    mostrarCarrito();
                    mostrarProductos(lista); 
                } else {
                    const msg = `Hola Motika, quisiera saber la disponibilidad del: ${p.nombre}`;
                    window.open(`https://wa.me/573118612727?text=${encodeURIComponent(msg)}`);
                }
            };
            contenedor.appendChild(div);
        });
    }

    // --- Lógica del Carrito (CON CARITA CENTRADA) ---
    function mostrarCarrito() {
        listaCarrito.innerHTML = "";
        if (carrito.length === 0) {
            // Estructura para centrar carita y texto
            listaCarrito.innerHTML = `
                <div class="carrito-vacio-msg">
                    <p>☹️</p>
                    <p>Tu carrito está vacío</p>
                </div>`;
            if(precioTotalDoc) precioTotalDoc.innerText = "$0";
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
                <span class="nombre-p">${p.nombre}</span>
                <span class="precio-p">${p.precio}</span>
                <button class="btn-borrar" data-index="${index}">✕</button>
            `;
            listaCarrito.appendChild(itemDiv);

            if (p.estado === 'encargar') listaEncargo += `- ${p.nombre} (${p.precio})%0A`;
            else listaTienda += `- ${p.nombre} (${p.precio})%0A`;

            let valorLimpio = String(p.precio).replace(/[^0-9]/g, "");
            total += parseInt(valorLimpio) || 0;
        });

        document.querySelectorAll(".btn-borrar").forEach(btn => {
            btn.onclick = (e) => {
                const idx = e.currentTarget.getAttribute("data-index");
                carrito.splice(idx, 1);
                localStorage.setItem("carrito_motika", JSON.stringify(carrito));
                mostrarCarrito();
                mostrarProductos(productos); 
            };
        });

        let mensajeFinal = "Hola Motika! 👋 Pedido:%0A%0A";
        if (listaTienda !== "") mensajeFinal += "*TIENDA:*%0A" + listaTienda + "%0A";
        if (listaEncargo !== "") mensajeFinal += "*ENCARGO:*%0A" + listaEncargo + "%0A";
        mensajeFinal += "*Total: $" + total.toLocaleString('es-CO') + "*";

        if(precioTotalDoc) precioTotalDoc.innerText = `$${total.toLocaleString('es-CO')}`;
        btnComprar.href = `https://wa.me/573118612727?text=${mensajeFinal}`;
    }

    // --- Resto del código Firebase (Sin cambios) ---
    db.collection("productos").onSnapshot(snapshot => {
        productos = [];
        const categoriasSet = new Set();
        snapshot.forEach(doc => {
            const p = doc.data();
            if (p.nombre && p.precio) {
                productos.push(p);
                if(p.categoria) categoriasSet.add(p.categoria);
            }
        });

        productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
        filtroCategoria.innerHTML = `<option value="todas">Todas las Categorías</option>`;
        const categoriasOrdenadas = Array.from(categoriasSet).sort();
        categoriasOrdenadas.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = opt.textContent = cat;
            filtroCategoria.appendChild(opt);
        });

        mostrarProductos(productos);
        mostrarCarrito();
    });

    buscador.onkeyup = () => {
        const t = buscador.value.toLowerCase();
        mostrarProductos(productos.filter(p => p.nombre.toLowerCase().includes(t)));
    };

    filtroCategoria.onchange = () => {
        const cat = filtroCategoria.value;
        mostrarProductos(cat === "todas" ? productos : productos.filter(p => p.categoria === cat));
    };
});
