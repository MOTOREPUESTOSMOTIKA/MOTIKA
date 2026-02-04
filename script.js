document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("productos");
    const btnAbrirCarrito = document.getElementById("btnAbrirCarrito");
    const carritoPanel = document.getElementById("carrito");
    const listaCarrito = document.getElementById("listaCarrito");
    const precioTotalDoc = document.getElementById("precioTotal");

    let productos = [];
    let carrito = JSON.parse(localStorage.getItem("carrito_motika")) || [];

    // Cierra el carrito si haces clic afuera o vuelves a tocar el botón
    btnAbrirCarrito.onclick = () => carritoPanel.classList.toggle("abierto");

    function mostrarProductos(lista) {
        contenedor.innerHTML = "";
        lista.forEach(p => {
            const div = document.createElement("div");
            div.className = "producto";
            
            let btnHTML = "";
            let estadoTexto = "";
            let estadoClase = "";

            if (p.estado === "disponible") {
                estadoTexto = "Disponible en tienda";
                estadoClase = "disponible";
                btnHTML = `<button class="btn-agregar">Agregar al carrito</button>`;
            } else if (p.estado === "encargar") {
                estadoTexto = "Diponible Solo encargo"; // Texto corregido según pides
                estadoClase = "encargo";
                btnHTML = `<button class="btn-encargar">Encargar Repuesto</button>`;
            } else {
                estadoTexto = "Consultar disponibilidad";
                estadoClase = "no-disponible";
                btnHTML = `<button class="btn-consultar">WhatsApp</button>`;
            }

            div.innerHTML = `
                <div class="contenedor-img">
                    <img src="${p.imagen || 'https://via.placeholder.com/150'}" loading="lazy">
                </div>
                <div class="producto-info">
                    <h3>${p.nombre}</h3>
                    <div class="precio">${p.precio}</div>
                    <div class="estado ${estadoClase}">${estadoTexto}</div>
                    ${btnHTML}
                </div>
            `;
            
            // Lógica de botones
            const btn = div.querySelector("button");
            btn.onclick = () => {
                if(p.estado !== "consultar") {
                    carrito.push(p);
                    localStorage.setItem("carrito_motika", JSON.stringify(carrito));
                    mostrarCarrito();
                } else {
                    window.open(`https://wa.me/573118612727?text=Hola, consulto por: ${p.nombre}`);
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
                    <p style="font-size: 60px;">☹️</p>
                    <p>Tu carrito está vacío</p>
                </div>`;
            precioTotalDoc.innerText = "$0";
            return;
        }
        
        let total = 0;
        carrito.forEach((p, index) => {
            const item = document.createElement("div");
            item.style.display = "flex";
            item.style.justifyContent = "space-between";
            item.style.marginBottom = "10px";
            item.innerHTML = `<span>${p.nombre}</span> <strong>${p.precio}</strong>`;
            listaCarrito.appendChild(item);
            
            let valor = String(p.precio).replace(/[^0-9]/g, "");
            total += parseInt(valor) || 0;
        });
        precioTotalDoc.innerText = `$${total.toLocaleString('es-CO')}`;
    }

    // Carga de Firebase (Simulada para el ejemplo, usa tu código de db.collection)
    db.collection("productos").get().then(snapshot => {
        productos = [];
        snapshot.forEach(doc => productos.push(doc.data()));
        mostrarProductos(productos);
        mostrarCarrito();
    });
});
