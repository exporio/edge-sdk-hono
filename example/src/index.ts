import { Hono } from 'hono'
import { exporioMiddleware } from '@exporio/edge-sdk-hono'

type Variables = { contentUrl: string }

const app = new Hono<{ Variables: Variables }>()

app.use(
    '*',
    exporioMiddleware({
        url: 'https://edge-api.exporio.cloud',
        apiKey: 'EXPORIO_API_KEY',
    })
)

app.all('*', async (c) => {
    // https://developers.cloudflare.com/workers/runtime-apis/fetch-event/#passthroughonexception
    c.executionCtx.passThroughOnException()

    const contentUrl = c.get('contentUrl')
    const request = new Request(contentUrl, c.req)

    const response = await fetch(request)

    return new Response(response.body, response)
})

export default app
