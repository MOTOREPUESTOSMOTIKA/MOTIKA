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
    let carrito = JSON.parse(localStorage.getItem("carrito_motika")) || [];

    btnAbrirCarrito.onclick = () => carritoPanel.classList.toggle("abierto");

    function mostrarProductos(lista) {
        const fragmento = document.createDocumentFragment();
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
                btnHTML = `<button class="btn-agregar ${estaEnCarrito ? 'agregado' : ''}" ${estaEnCarrito ? 'disabled' : ''} style="background-color: #3498db;">${estaEnCarrito ? 'Agregado ✓' : 'Encargar Repuesto'}</button>`;
            } else {
                estadoTexto = "Consultar disponibilidad";
                estadoClase = "no-disponible";
                btnHTML = `<button class="btn-consultar" style="background-color: #ff9800;">WhatsApp</button>`;
            }

            const urlImagen = p.imagen && p.imagen !== "" ? p.imagen : 'https://via.placeholder.com/300x300?text=Motika+Repuestos';
            
            // Estructura optimizada: Se fuerza a que la imagen y la info tengan espacios definidos
            div.innerHTML = `
                <div class="contenedor-img" style="height: 180px; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #f9f9f9;">
                    <img src="${urlImagen}" loading="lazy" referrerpolicy="no-referrer" 
                         style="max-width: 100%; max-height: 100%; object-fit: contain;"
                         onerror="this.src='https://via.placeholder.com/300x300?text=Error+al+cargar'">
                </div>
                <div class="producto-info" style="padding: 10px; display: flex; flex-direction: column; justify-content: space-between; flex-grow: 1;">
                    <h3 style="font-size: 15px; margin: 5px 0; height: 40px; overflow: hidden;">${p.nombre}</h3>
                    <div class="precio" style="font-weight: bold; color: #2c3e50;">${p.precio}</div>
                    <div class="estado ${estadoClase}" style="font-size: 12px; margin: 5px 0;">${estadoTexto}</div>
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
            fragmento.appendChild(div);
        });
        contenedor.appendChild(fragmento);
    }

    function mostrarCarrito() {
        listaCarrito.innerHTML = "";
        if (carrito.length === 0) {
            listaCarrito.innerHTML = `<div class="carrito-vacio-msg"><p style="font-size: 50px;">☹️</p><p>Tu carrito está vacío</p></div>`;
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
            itemDiv.innerHTML = `<button class="btn-borrar" data-index="${index}">✕</button><span class="nombre-p">${p.nombre}</span><span class="precio-p">${p.precio}</span>`;
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

        let mensajeFinal = `Hola Motika! 👋 Pedido:%0A%0A${listaTienda !== "" ? "*TIENDA:*%0A" + listaTienda + "%0A" : ""}${listaEncargo !== "" ? "*ENCARGO:*%0A" + listaEncargo + "%0A" : ""}*Total: $${total.toLocaleString('es-CO')}*`;
        if(precioTotalDoc) precioTotalDoc.innerText = `$${total.toLocaleString('es-CO')}`;
        btnComprar.href = `https://wa.me/573118612727?text=${mensajeFinal}`;
    }

    // Carga de productos desde Firebase
    db.collection("productos").get().then(snapshot => {
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

    buscador.onkeyup = () => {
        const t = buscador.value.toLowerCase();
        mostrarProductos(productos.filter(p => p.nombre.toLowerCase().includes(t)));
    };

    filtroCategoria.onchange = () => {
        const cat = filtroCategoria.value;
        mostrarProductos(cat === "todas" ? productos : productos.filter(p => p.categoria === cat));
    };
});
