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
                estadoTexto = "En Tienda";
                estadoClase = "disponible";
                btnHTML = `<button class="btn-agregar ${estaEnCarrito ? 'agregado' : ''}" ${estaEnCarrito ? 'disabled' : ''}>${estaEnCarrito ? 'Agregado ✓' : 'Agregar'}</button>`;
            } else if (p.estado === "encargar") {
                estadoTexto = "Por Encargo";
                estadoClase = "encargo";
                btnHTML = `<button class="btn-agregar ${estaEnCarrito ? 'agregado' : ''}" ${estaEnCarrito ? 'disabled' : ''} style="background-color: #3498db;">${estaEnCarrito ? 'Agregado ✓' : 'Encargar'}</button>`;
            } else {
                estadoTexto = "Consultar";
                estadoClase = "no-disponible";
                btnHTML = `<button class="btn-consultar">WhatsApp</button>`;
            }

            const urlImagen = p.imagen && p.imagen !== "" ? p.imagen : 'https://via.placeholder.com/300x300?text=Sin+Foto';
            
            div.innerHTML = `
                <div class="contenedor-img">
                    <img src="${urlImagen}" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='https://via.placeholder.com/300x300?text=Error+Carga'">
                </div>
                <div class="producto-info">
                    <h3>${p.nombre}</h3>
                    <div class="precio">$${p.precio}</div>
                    <div class="estado ${estadoClase}">● ${estadoTexto}</div>
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
            listaCarrito.innerHTML = `<div class="carrito-vacio-msg"><p style="font-size: 50px;">☹️</p><p>Vacío</p></div>`;
            if(precioTotalDoc) precioTotalDoc.innerText = "$0";
            btnComprar.style.display = "none";
            return;
        }
        btnComprar.style.display = "block";
        let total = 0;
        let listaTexto = "Hola Motika! 👋 Pedido:%0A%0A";

        carrito.forEach((p, index) => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "item-carrito-lista";
            itemDiv.innerHTML = `<button class="btn-borrar" data-index="${index}">✕</button><span class="nombre-p">${p.nombre}</span><span class="precio-p">${p.precio}</span>`;
            listaCarrito.appendChild(itemDiv);
            listaTexto += `- ${p.nombre} (${p.precio})%0A`;
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

        if(precioTotalDoc) precioTotalDoc.innerText = `$${total.toLocaleString('es-CO')}`;
        btnComprar.href = `https://wa.me/573118612727?text=${listaTexto}%0A*Total: $${total.toLocaleString('es-CO')}*`;
    }

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
        
        filtroCategoria.innerHTML = `<option value="todas">Todas</option>`;
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
