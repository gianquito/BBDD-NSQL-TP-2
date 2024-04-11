import { createClient } from 'redis'

// creamos el client
const client = createClient()

// nos conectamos a la base de datos
await client.connect()

// hacemos un set
await client.set('nombre', 'Gian')

// hacemos un get y lo mostramos
const nombre = await client.get('nombre')
console.log(nombre)

// hacemos push a la lista "colores"
await client.del('colores')
await client.lPush('colores', ['azul', 'rojo', 'verde', 'amarillo'])

// mostramos los elementos en la lista
let colores = await client.lRange('colores', 0, -1)
console.log(colores)

// agregamos un nuevo elemento a la lista
await client.lPush('colores', 'violeta')

// mostramos los elementos en la lista
colores = await client.lRange('colores', 0, -1)
console.log(colores)

// mostramos el tamaño de la lista
let len = await client.lLen('colores')
console.log(len)

// sacamos un elemento de la lista y lo mostramos
const pop = await client.lPop('colores')
console.log(pop)

// mostramos el nuevo tamaño de la lista
len = await client.lLen('colores')
console.log(len)
