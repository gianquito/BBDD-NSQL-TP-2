import express from 'express'
import { createClient } from 'redis'
import CORS from 'cors'

const app = express()

app.use(CORS())

app.use(express.static('public'))

async function connect_db() {
    const client = createClient({ url: 'redis://db-redis:6379' })
    try {
        await client.connect()
    } catch (err) {
        console.log('Error al conectarse a la base de datos ' + err)
    }
    return client
}

function get_estado_cap(cap) {
    const date_alquiler = new Date(cap.fecha_alquiler)
    const date_reserva = new Date(cap.fecha_reserva)
    if (cap.fecha_alquiler !== null && date_alquiler.setHours(date_alquiler.getHours() + 24) >= new Date())
        return 'Alquilado'
    if (cap.fecha_reserva !== null && date_reserva.setMinutes(date_reserva.getMinutes() + 4) >= new Date())
        return 'Reservado'
    return 'Disponible'
}
async function cargar_datos() {
    const client = await connect_db()
    const size = await client.dbSize()
    if (size === 0) {
        await client.lPush('capitulos', [
            JSON.stringify({
                nombre: 'Chapter 1: The Mandalorian',
                num_capitulo: 1,
                precio: 1200,
                fecha_reserva: null,
                fecha_alquiler: null,
            }),
            JSON.stringify({
                nombre: 'Chapter 2: The Child',
                num_capitulo: 2,
                precio: 1100,
                fecha_reserva: null,
                fecha_alquiler: null,
            }),
            JSON.stringify({
                nombre: 'Chapter 3: The Sin',
                num_capitulo: 3,
                precio: 1300,
                fecha_reserva: null,
                fecha_alquiler: null,
            }),
            JSON.stringify({
                nombre: 'Chapter 4: Sanctuary',
                num_capitulo: 4,
                precio: 1500,
                fecha_reserva: null,
                fecha_alquiler: null,
            }),
            JSON.stringify({
                nombre: 'Chapter 5: The Gunslinger',
                num_capitulo: 5,
                precio: 2000,
                fecha_reserva: null,
                fecha_alquiler: null,
            }),
            JSON.stringify({
                nombre: 'Chapter 6: The Prisoner',
                num_capitulo: 6,
                precio: 1600,
                fecha_reserva: null,
                fecha_alquiler: null,
            }),
            JSON.stringify({
                nombre: 'Chapter 7: The Reckoning',
                num_capitulo: 7,
                precio: 1900,
                fecha_reserva: null,
                fecha_alquiler: null,
            }),
            JSON.stringify({
                nombre: 'Chapter 8: Redemption',
                num_capitulo: 8,
                precio: 1200,
                fecha_reserva: null,
                fecha_alquiler: null,
            }),
            JSON.stringify({
                nombre: 'Chapter 9: The Marshal',
                num_capitulo: 9,
                precio: 1300,
                fecha_reserva: null,
                fecha_alquiler: null,
            }),
            JSON.stringify({
                nombre: 'Chapter 10: The Passenger',
                num_capitulo: 10,
                precio: 1700,
                fecha_reserva: null,
                fecha_alquiler: null,
            }),
            JSON.stringify({
                nombre: 'Chapter 11: The Heiress',
                num_capitulo: 11,
                precio: 1100,
                fecha_reserva: null,
                fecha_alquiler: null,
            }),
            JSON.stringify({
                nombre: 'Chapter 12: The Siege',
                num_capitulo: 12,
                precio: 1800,
                fecha_reserva: null,
                fecha_alquiler: null,
            }),
        ])
    }
}

app.get('/listar', async (req, res) => {
    try {
        const client = await connect_db()
        const episodes = await client.lRange('capitulos', 0, -1)
        res.send(
            episodes.map((ep) => {
                const ep_data = JSON.parse(ep)
                return { ...ep_data, estado: get_estado_cap(ep_data) }
            })
        )
    } catch (err) {
        res.status(500).send({
            message: 'ERROR',
            error: err,
        })
    }
})

app.get('/reservar', async (req, res) => {
    if (!req.query.capitulo) {
        res.sendStatus(400)
        return
    }
    try {
        const client = await connect_db()
        const episodes_data = await client.lRange('capitulos', 0, -1)
        const episodes = episodes_data.map((ep) => JSON.parse(ep))

        const episode = episodes.find((ep) => ep.num_capitulo == req.query.capitulo)
        if (!episode) {
            res.status(404).send('Capítulo no encontrado')
            return
        } else if (get_estado_cap(episode) !== 'Disponible') {
            res.status(500).send('El capítulo no está disponible')
            return
        }

        client.lSet(
            'capitulos',
            episodes.indexOf(episode),
            JSON.stringify({
                ...episode,
                fecha_reserva: new Date(),
            })
        )

        res.sendStatus(200)
    } catch {
        res.sendStatus(500)
    }
})

app.get('/confirmarpago', async (req, res) => {
    if (!req.query.capitulo || !req.query.precio) {
        res.sendStatus(400)
        return
    }
    try {
        const client = await connect_db()
        const episodes_data = await client.lRange('capitulos', 0, -1)
        const episodes = episodes_data.map((ep) => JSON.parse(ep))

        const episode = episodes.find((ep) => ep.num_capitulo == req.query.capitulo)
        if (!episode) {
            res.status(404).send('Capítulo no encontrado')
            return
        } else if (get_estado_cap(episode) !== 'Reservado') {
            res.status(500).send('El capítulo no está reservado')
            return
        }
        client.lSet(
            'capitulos',
            episodes.indexOf(episode),
            JSON.stringify({
                ...episode,
                fecha_alquiler: new Date(),
            })
        )

        res.sendStatus(200)
    } catch {
        res.sendStatus(500)
    }
})

app.listen(3000, async () => {
    console.log('Servidor corriendo en el puerto 3000')
    await cargar_datos()
})
