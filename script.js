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
        if (carritoPanel.classList.contains("abierto") && !carritoPanel.contains(event.target) && event.target !== btnAbrirCarrito) {
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
                estadoTexto = "En tienda";
                estadoClase = "disponible";
                btnHTML = `<button class="btn-agregar ${estaEnCarrito ? 'agregado' : ''}" ${estaEnCarrito ? 'disabled' : ''}>${estaEnCarrito ? 'Agregado ✓' : 'Agregar'}</button>`;
            } else if (p.estado === "encargar") {
                estadoTexto = "Por encargo";
                estadoClase = "encargo";
                btnHTML = `<button class="btn-encargar ${estaEnCarrito ? 'agregado' : ''}" ${estaEnCarrito ? 'disabled' : ''}>${estaEnCarrito ? 'Agregado ✓' : 'Encargar'}</button>`;
            } else {
                estadoTexto = "Consultar";
                estadoClase = "no-disponible";
                btnHTML = `<button class="btn-consultar">Consultar</button>`;
            }

            const urlImagen = p.imagen && p.imagen !== "" ? p.imagen : 'https://via.placeholder.com/300x300?text=Motika+Repuestos';

            div.innerHTML = `
                <div class="contenedor-img"><img src="${urlImagen}" loading="lazy"></div>
                <div class="producto-info">
                    <h3>${p.nombre}</h3>
                    <div class="precio">${p.precio}</div>
                    <div class="estado ${estadoClase}">• ${estadoTexto}</div>
                    ${btnHTML}
                </div>`;

            const boton = div.querySelector("button");
            boton.onclick = () => {
                if (p.estado !== "consultar") {
                    if(!estaEnCarrito) {
                        carrito.push(p);
                        localStorage.setItem("carrito_motika", JSON.stringify(carrito));
                        mostrarCarrito();
                        mostrarProductos(lista);
                    }
                } else {
                    const msg = `Hola Motika 👋, me gustaría consultar la disponibilidad de este repuesto: *${p.nombre}*. Quedo atento, gracias!`;
                    window.open(`https://wa.me/573118612727?text=${encodeURIComponent(msg)}`);
                }
            };
            contenedor.appendChild(div);
        });
    }

    function mostrarCarrito() {
        listaCarrito.innerHTML = "";
        if (carrito.length === 0) {
            listaCarrito.innerHTML = `<div class="carrito-vacio-msg"><p>☹️</p><p>Tu carrito está vacío</p></div>`;
            if(precioTotalDoc) precioTotalDoc.innerText = "$0";
            btnComprar.style.display = "none";
            return;
        }

        btnComprar.style.display = "block";
        let total = 0;
        let listaPedido = "";

        carrito.forEach((p, index) => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "item-carrito-lista";
            itemDiv.innerHTML = `
                <span class="nombre-p">${p.nombre}</span>
                <span class="precio-p">${p.precio}</span>
                <button class="btn-borrar" data-index="${index}">✕</button>`;
            listaCarrito.appendChild(itemDiv);

            listaPedido += `✅ *${p.nombre}* (${p.precio})\n`;
            let valorLimpio = String(p.precio).replace(/[^0-9]/g, "");
            total += parseInt(valorLimpio) || 0;
        });

        document.querySelectorAll(".btn-borrar").forEach(btn => {
            btn.onclick = (e) => {
                carrito.splice(e.currentTarget.getAttribute("data-index"), 1);
                localStorage.setItem("carrito_motika", JSON.stringify(carrito));
                mostrarCarrito();
                mostrarProductos(productos);
            };
        });

        // NUEVO MENSAJE PROFESIONAL
        let mensajeWhatsApp = `¡Hola *Motika*! 👋\n\nHe seleccionado los siguientes productos desde su catálogo digital y me gustaría concretar el pedido:\n\n${listaPedido}\n💰 *Total estimado: $${total.toLocaleString('es-CO')}*\n\n¿Me podrían confirmar disponibilidad y los pasos para el pago? ¡Gracias!`;

        if(precioTotalDoc) precioTotalDoc.innerText = `$${total.toLocaleString('es-CO')}`;
        btnComprar.href = `https://wa.me/573118612727?text=${encodeURIComponent(mensajeWhatsApp)}`;
    }

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
        Array.from(categoriasSet).sort().forEach(cat => {
            const opt = document.createElement("option");
            opt.value = opt.textContent = cat;
            filtroCategoria.appendChild(opt);
        });
        mostrarProductos(productos);
        mostrarCarrito();
    });

    buscador.onkeyup = () => mostrarProductos(productos.filter(p => p.nombre.toLowerCase().includes(buscador.value.toLowerCase())));
    filtroCategoria.onchange = () => mostrarProductos(filtroCategoria.value === "todas" ? productos : productos.filter(p => p.categoria === filtroCategoria.value));
});
