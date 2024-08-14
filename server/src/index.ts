import { Elysia } from 'elysia'

const app = new Elysia().get('/', () => 'Hello Elysia').listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port} ` +
    `on Bun v${Bun.version} ` +
    `in ${process.env.NODE_ENV} mode.`,
)
