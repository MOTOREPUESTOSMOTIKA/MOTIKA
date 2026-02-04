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

    // --- Control del Panel ---
    btnAbrirCarrito.onclick = () => carritoPanel.classList.toggle("abierto");

    document.addEventListener("click", (e) => {
        if (carritoPanel.classList.contains("abierto") && 
            !carritoPanel.contains(e.target) && 
            e.target !== btnAbrirCarrito) {
            carritoPanel.classList.remove("abierto");
        }
    });

    // --- Renderizado de Productos con Lógica de 3 Estados ---
    function mostrarProductos(lista) {
        contenedor.innerHTML = "";
        lista.forEach(p => {
            const div = document.createElement("div");
            div.className = "producto";
            
            const estaEnCarrito = carrito.some(item => item.nombre === p.nombre);
            
            let btnHTML = "";
            let estadoTexto = "";
            let estadoClase = "";

            // Lógica según el estado definido en el Admin
            if (p.estado === "disponible") {
                estadoTexto = "Disponible en tienda";
                estadoClase = "disponible";
                btnHTML = `<button class="btn-agregar ${estaEnCarrito ? 'agregado' : ''}" ${estaEnCarrito ? 'disabled' : ''}>
                            ${estaEnCarrito ? 'Agregado ✓' : 'Agregar al carrito'}
                           </button>`;
            } else if (p.estado === "encargar") {
                estadoTexto = "Bajo pedido (Encargo)";
                estadoClase = "encargo"; // <--- CAMBIADO PARA AZUL
                btnHTML = `<button class="btn-agregar ${estaEnCarrito ? 'agregado' : ''}" ${estaEnCarrito ? 'disabled' : ''} style="background-color: #3498db;">
                            ${estaEnCarrito ? 'Agregado ✓' : 'Encargar Repuesto'}
                           </button>`;
            } else {
                // Estado: consultar o por defecto
                estadoTexto = "Consultar disponibilidad";
                estadoClase = "no-disponible"; // SE MANTIENE NARANJA
                btnHTML = `<button class="btn-consultar" style="background-color: #ff9800;">Consultar por WhatsApp</button>`;
            }

            div.innerHTML = `
                <img src="${p.imagen}" referrerpolicy="no-referrer" onerror="this.src='https://via.placeholder.com/150?text=Motika+Repuestos'">
                <div class="producto-info">
                    <h3>${p.nombre}</h3>
                    <div class="precio">${p.precio}</div>
                    <div class="estado ${estadoClase}">${estadoTexto}</div>
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

    // --- Lógica del Carrito con Separación de Mensaje ---
    function mostrarCarrito() {
        listaCarrito.innerHTML = "";
        if (carrito.length === 0) {
            listaCarrito.innerHTML = `
                <div class="carrito-vacio-msg">
                    <p style="font-size: 50px;">☹️</p>
                    <p>Tu carrito está vacío</p>
                </div>`;
            if(precioTotalDoc) precioTotalDoc.innerText = "$0";
            btnComprar.style.display = "none";
            return;
        }

        btnComprar.style.display = "block";
        
        const btnVaciar = document.createElement("button");
        btnVaciar.innerText = "Vaciar Carrito 🗑️";
        btnVaciar.className = "btn-vaciar";
        btnVaciar.onclick = () => { if(confirm("¿Seguro que quieres vaciar el carrito?")) vaciarTodo(); };
        listaCarrito.appendChild(btnVaciar);

        let total = 0;
        let listaTienda = "";
        let listaEncargo = "";

        carrito.forEach((p, index) => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "item-carrito-lista";
            itemDiv.innerHTML = `
                <button class="btn-borrar" data-index="${index}">✕</button>
                <span class="nombre-p">${p.nombre} ${p.estado === 'encargar' ? '<br><small style="color:#3498db;">(Para encargar)</small>' : ''}</span>
                <span class="precio-p">${p.precio}</span>
            `;
            listaCarrito.appendChild(itemDiv);

            // Clasificación para el mensaje de WhatsApp
            if (p.estado === 'encargar') {
                listaEncargo += `- ${p.nombre} (${p.precio})%0A`;
            } else {
                listaTienda += `- ${p.nombre} (${p.precio})%0A`;
            }

            let valorLimpio = String(p.precio).replace(/[^0-9]/g, "");
            total += parseInt(valorLimpio) || 0;
        });

        // Eventos para borrar
        document.querySelectorAll(".btn-borrar").forEach(btn => {
            btn.onclick = (e) => {
                const idx = e.currentTarget.getAttribute("data-index");
                carrito.splice(idx, 1);
                localStorage.setItem("carrito_motika", JSON.stringify(carrito));
                mostrarCarrito();
                mostrarProductos(productos); 
            };
        });

        // Construcción del mensaje de WhatsApp estructurado
        let mensajeFinal = "Hola Motika! 👋 Quiero realizar el siguiente pedido:%0A%0A";
        if (listaTienda !== "") {
            mensajeFinal += "*PRODUCTOS EN TIENDA:*%0A" + listaTienda + "%0A";
        }
        if (listaEncargo !== "") {
            mensajeFinal += "*PRODUCTOS PARA ENCARGAR:*%0A" + listaEncargo + "%0A";
        }
        mensajeFinal += "*Total a pagar: $" + total.toLocaleString('es-CO') + "*";

        if(precioTotalDoc) precioTotalDoc.innerText = `$${total.toLocaleString('es-CO')}`;
        btnComprar.href = `https://wa.me/573118612727?text=${mensajeFinal}`;
    }

    function vaciarTodo() {
        carrito = [];
        localStorage.removeItem("carrito_motika");
        mostrarCarrito();
        mostrarProductos(productos);
    }

    btnComprar.onclick = () => {
        setTimeout(() => { vaciarTodo(); }, 1500);
    };

    // --- Conexión Firebase ---
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
        filtroCategoria.innerHTML = `<option value="todas">Todas las Categorías</option>`;
        categoriasSet.forEach(cat => {
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
