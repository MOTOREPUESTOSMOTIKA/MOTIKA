document.addEventListener("DOMContentLoaded", () => {

    const btnAbrirCarrito = document.getElementById("btnAbrirCarrito");
    const carritoPanel = document.getElementById("carrito");
    const listaCarrito = document.getElementById("listaCarrito");
    const btnComprar = document.getElementById("btnComprar");

    let carrito = [];

    // ===== ABRIR / CERRAR CARRITO =====
    btnAbrirCarrito.onclick = () => {
        carritoPanel.classList.toggle("abierto");
    };

    // ===== CERRAR AL HACER CLICK FUERA =====
    document.addEventListener("click", (e) => {
        if (
            carritoPanel.classList.contains("abierto") &&
            !carritoPanel.contains(e.target) &&
            e.target !== btnAbrirCarrito
        ) {
            carritoPanel.classList.remove("abierto");
        }
    });

    // ===== CERRAR AL HACER PEDIDO =====
    btnComprar.onclick = () => {
        carritoPanel.classList.remove("abierto");
    };

});










