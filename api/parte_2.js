import express from 'express'
import { createClient } from 'redis'

const app = express()

async function connect_db() {
    const client = createClient()
    try {
        await client.connect()
    } catch {
        print('Error al conectarse a la base de datos')
    }
    return client
}

app.get('/cargar', async (req, res) => {
    if (!req.query.episodio || !req.query.personaje) {
        res.sendStatus(400)
        return
    }
    try {
        const client = await connect_db()
        await client.lPush(req.query.episodio, req.query.personaje)
        res.sendStatus(200)
    } catch {
        res.sendStatus(500)
    }
})

app.get('/quitar', async (req, res) => {
    if (!req.query.episodio || !req.query.personaje) {
        res.sendStatus(400)
        return
    }
    try {
        const client = await connect_db()
        await client.lRem(req.query.episodio, 0, req.query.personaje)
        res.sendStatus(200)
    } catch {
        res.sendStatus(500)
    }
})

app.get('/listar', async (req, res) => {
    if (!req.query.episodio) {
        res.sendStatus(400)
        return
    }
    try {
        const client = await connect_db()
        const char_list = await client.lRange(req.query.episodio, 0, -1)
        res.send(char_list)
    } catch {
        res.sendStatus(500)
    }
})

app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000')
})
