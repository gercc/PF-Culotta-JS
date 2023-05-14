class Producto {
    constructor(id, nombre, precio, stock) {
        this.id = id
        this.nombre = nombre
        this.precio = precio
        this.stock = stock
    }
}

const producto1 = new Producto(1, "Lavarropas", 190000, 500)
const producto2 = new Producto(2, "TV QLED 65'' 4K", 345000, 350)
const producto3 = new Producto(3, "Heladera c/ dispenser", 220000, 400)
const producto4 = new Producto(4, "Aspiradora Robot Wi-Fi", 90000, 800)

const productos = [producto1, producto2, producto3, producto4]


const contenedorProductos = document.getElementById('contenedorProductos');

productos.forEach((producto) => {
    const divProducto = document.createElement('div')
    divProducto.classList.add('card', 'col-xl-3', 'col-md-6', 'col-sm-12')
    divProducto.innerHTML = `
        <div>
            <img src="assets/images/${producto.id}.avif" class="card-img-top img-fluid">
            <div class="card-body">
                <h3 class="card-title"> ${producto.nombre}</h3>
                <p class="card-text"> $${producto.precio}</p>
                <div class="input-group mb-3">
                    <input type="number" class="form-control, w-25" min="1" value="1" id="cantidad${producto.id}">
                    <div class="input-group-append">
                        <button class="btn btn-primary" type="button" id="boton${producto.id}">Agregar al Carrito</button>
                    </div>
                </div>
            </div>
        </div>
    `
    contenedorProductos.appendChild(divProducto)

    //Boton para agregar al carrito
    const boton = document.getElementById(`boton${producto.id}`)
    boton.addEventListener('click', () => {
        const cantidad = parseInt(document.getElementById(`cantidad${producto.id}`).value)
        agregarAlCarrito(producto.id, cantidad)
    })
});


let carrito = JSON.parse(localStorage.getItem("carrito")) || []


const agregarAlCarrito = (id, cantidad) => {
    const producto = productos.find((producto) => producto.id === id)
    if (producto.stock > 0) {
        const productoEnCarrito = carrito.find((producto) => producto.id === id)
        const cantidadMaxima = Math.min(cantidad, producto.stock); // obtener cantidad maxima
        if (productoEnCarrito) {
            productoEnCarrito.cantidad += cantidadMaxima;
        } else {
            carrito.push({ ...producto, cantidad: cantidadMaxima });
        }
        producto.stock -= cantidadMaxima;
        actualizarCarrito()
        Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Producto agregado al carrito',
            showConfirmButton: false,
            timer: 1300
        })
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Lo sentimos, no hay mas stock de este producto.'
        })
    }
};

//Carrito de compras

let contenedorCarrito = document.getElementById('contenedorCarrito');

function actualizarCarrito() {
    let contenido = ''
    carrito.forEach((producto) => {
        contenido += `
            <div class="card col-xl-3 col-md-6 col-sm-12">
                <img src="assets/images/${producto.id}.avif" class="card-img-top img-fluid py-3">
                <div class="card-body">
                    <h3 class="card-title"> ${producto.nombre} </h3>
                    <p class="card-text"> $${producto.precio} </p>
                    <p class="card-text"> Cantidad: ${producto.cantidad} </p>
                    <button onClick = "eliminarDelCarrito(${producto.id})" class="btn btn-primary"> Eliminar del Carrito </button>
                </div>
            </div>
        `;
    });

    contenedorCarrito.innerHTML = contenido;
    localStorage.setItem("carrito", JSON.stringify(carrito))
    calcularTotalCompra()
}


//Eliminar productos del carrito

const eliminarDelCarrito = (id) => {
    const productoEnCarrito = carrito.find((producto) => producto.id === id);
    productoEnCarrito.cantidad -= 1
    if (productoEnCarrito.cantidad <= 0) {
        carrito.splice(carrito.indexOf(productoEnCarrito), 1)
    }
    const producto = productos.find((producto) => producto.id === id);
    producto.stock += 1
    actualizarCarrito()
    Swal.fire({
        position: 'center',
        icon: 'warning',
        title: 'El producto ha sido eliminado del carrito',
        showConfirmButton: false,
        timer: 1300
    })
}


//Vaciar carrito

const vaciarCarrito = document.getElementById('vaciarCarrito');

vaciarCarrito.addEventListener('click', () => {
    carrito.forEach((productoEnCarrito) => {
        const producto = productos.find((producto) => producto.id === productoEnCarrito.id);
        producto.stock += productoEnCarrito.cantidad;
    });
    carrito.splice(0, carrito.length)
    actualizarCarrito()
});

//Ver precio total

const totalCompra = document.getElementById('totalCompra');
const cambiarPrecio = document.getElementById('cambiarPrecio');
let monedaActual = "ARS"

const getTasaDeCambio = () => {
    return fetch("https://api.exchangerate.host/latest?base=ARS&symbols=USD")
    .then(response => response.json())
    .then(data => {
        return data.rates.USD;
})
}

const calcularTotalCompra = () => {
    let total = 0
    carrito.forEach(async (producto) => {
        //Obtengo el precio actual en pesos argentinos
        let precioActual = producto.precio * producto.cantidad;
        if (monedaActual === "USD") {
            //Obtengo la tasa de cambio USD/ARS mediante una API

                    //Obtengo la tasa de cambio USD/ARS
                    let tasaCambio = await getTasaDeCambio();
                    //Multiplico el precio en pesos por la tasa de cambio para obtener el precio en dolares
                    precioActual = precioActual * tasaCambio;
                    //Actualizo el total con el precio en dolares
                    total += precioActual;
                    //Actualizo el valor en la pagina con el simbolo de dolares
                    if (carrito.length === 0) {
                        totalCompra.innerHTML = "$ 0"
                    } else {
                        totalCompra.innerHTML = "US$ " + total.toFixed(2)
                    }
                ;
        } else {
            total += precioActual
            if (carrito.length === 0) {
                totalCompra.innerHTML = "$ 0"
            } else {
                totalCompra.innerHTML = "$ " + total;
            }
        }
    })
    if (carrito.length === 0) {
        totalCompra.innerHTML = "$ 0"
    }
    else if (monedaActual === "USD") {
        totalCompra.innerHTML = "US$ " + total.toFixed(2);
    } else {
        totalCompra.innerHTML = "$ " + total
    }
}

cambiarPrecio.addEventListener('click', () => {
    if (monedaActual === "ARS") {
        monedaActual = "USD"
    } else {
        monedaActual = "ARS"
    }
    calcularTotalCompra()
})

actualizarCarrito()
