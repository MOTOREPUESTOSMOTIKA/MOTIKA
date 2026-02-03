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

    function mostrarProductos(lista) {
        contenedor.innerHTML = "";
        lista.forEach(p => {
            const div = document.createElement("div");
            div.className = "producto";
            const estaEnCarrito = carrito.some(item => item.nombre === p.nombre);
            const btnHTML = p.disponible
                ? `<button class="btn-agregar ${estaEnCarrito ? 'agregado' : ''}" ${estaEnCarrito ? 'disabled' : ''}>
                    ${estaEnCarrito ? 'Agregado ✓' : 'Agregar al carrito'}
                   </button>`
                : `<button class="btn-consultar">Consultar disponibilidad</button>`;

            div.innerHTML = `
                <img src="${p.imagen}" referrerpolicy="no-referrer" onerror="this.src='https://via.placeholder.com/150?text=Motika+Repuestos'">
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
            boton.onclick = () => {
                if (p.disponible) {
                    carrito.push(p);
                    localStorage.setItem("carrito_motika", JSON.stringify(carrito));
                    mostrarCarrito();
                    mostrarProductos(lista); 
                } else {
                    const msg = `Hola, quisiera saber la disponibilidad del: ${p.nombre}`;
                    window.open(`https://wa.me/573118612727?text=${encodeURIComponent(msg)}`);
                }
            };
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
            if(precioTotalDoc) precioTotalDoc.innerText = "$0";
            btnComprar.style.display = "none";
            return;
        }

        btnComprar.style.display = "block";
        
        // --- BOTÓN VACIAR CARRITO ---
        const btnVaciar = document.createElement("button");
        btnVaciar.innerText = "Vaciar Carrito 🗑️";
        btnVaciar.className = "btn-vaciar";
        btnVaciar.onclick = () => {
            if(confirm("¿Seguro que quieres vaciar el carrito?")) {
                vaciarTodo();
            }
        };
        listaCarrito.appendChild(btnVaciar);

        let mensaje = "Hola Motika, quiero comprar:%0A";
        let total = 0;

        carrito.forEach((p, index) => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "item-carrito-lista";
            itemDiv.innerHTML = `
                <button class="btn-borrar" data-index="${index}">✕</button>
                <span class="nombre-p">${p.nombre}</span>
                <span class="precio-p">${p.precio}</span>
            `;
            listaCarrito.appendChild(itemDiv);
            mensaje += `- ${p.nombre} (${p.precio})%0A`;
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
        mensaje += `%0A*Total: $${total.toLocaleString('es-CO')}*`;
        btnComprar.href = `https://wa.me/573118612727?text=${mensaje}`;
    }

    // --- FUNCIÓN PARA LIMPIAR TODO ---
    function vaciarTodo() {
        carrito = [];
        localStorage.removeItem("carrito_motika");
        mostrarCarrito();
        mostrarProductos(productos);
    }

    // Al pulsar "Hacer pedido", vaciamos el carro después de un segundo
    btnComprar.onclick = () => {
        setTimeout(() => {
            vaciarTodo();
        }, 1000);
    };

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
