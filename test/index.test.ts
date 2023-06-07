import { Hono } from 'hono'
import { describe, expect, it, vi, afterEach } from 'vitest'

import { exporioMiddleware } from '../src/index'
import { Instructions } from '../src/types'

global.fetch = vi.fn()

const exampleHtml: string = `
<!DOCTYPE html>
<html>
    <head>
        <title>Page Title</title>
    </head>
    <body>
        <h1 id="myTeaser">Teaser</h1>
        <h2 id="myDescription">Page Description</h2>
        
        <button id="myButton" style="color:red;background:white;">Click Me</button>
    </body>
</html>
`

function createFetchResponse(data) {
    return { json: () => new Promise((resolve) => resolve(data)) }
}

describe('Exporio middleware', () => {
    type Variables = { contentUrl: string }

    const app = new Hono<{ Variables: Variables }>()

    app.use(
        '*',
        exporioMiddleware({
            url: 'http://edge-api.exporio.cloud',
            apiKey: 'testAPIKey',
        })
    )

    app.get('*', async (c) => {
        const contentUrl = c.get('contentUrl')

        const headers = new Headers()
        headers.set('X-contentUrl', contentUrl)
        headers.set('Set-Cookie', 'myCookie=123; Path=/')

        return new Response(exampleHtml, { headers: headers })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('Should successfully execute Exporio Instructions', async () => {
        const exampleInstructions: Instructions = {
            customUrlInstruction: {
                loadCustomUrl: true,
                customUrl: 'http://localhost/new/',
            },
            rewriterInstruction: {
                useRewriter: true,
                transformations: [
                    { selector: '#myTeaser', method: 'SetInnerContent', argument1: 'New Teaser', argument2: null },
                    { selector: '#myDescription', method: 'Remove', argument1: null, argument2: null },
                    { selector: '#myButton', method: 'SetStyleProperty', argument1: 'color', argument2: 'green' },
                ],
            },
            cookieInstruction: {
                setCookie: true,
                cookies: [
                    { name: 'exporioCookie1', value: '456', path: '/' },
                    { name: 'exporioCookie2', value: '789', path: '/', expires: 'Sun, 01 Jan 2023 01:01:01 GMT' },
                ],
            },
        }

        // @ts-ignore
        fetch.mockResolvedValue(createFetchResponse(exampleInstructions))

        const res = await app.request('http://localhost/')
        const resText = await res.text()

        expect(res.status).toBe(200)
        expect(res.headers.get('X-contentUrl')).toEqual('http://localhost/new/')
        expect(res.headers.get('Set-Cookie')).toEqual(
            'myCookie=123; Path=/, exporioCookie1=456; Path=/, exporioCookie2=789; Path=/; Expires=Sun, 01 Jan 2023 01:01:01 GMT'
        )
        expect(resText).toContain('<h1 id="myTeaser">New Teaser</h1>')
        expect(resText).not.toContain('<h2 id="myDescription">Page Description</h2>')
        expect(resText).toContain('<button id="myButton" style="color:green;background:white;">Click Me</button>')
    })

    it('Should successfully return request when Exporio Instructions do not exist', async () => {
        // @ts-ignore
        fetch.mockResolvedValue(createFetchResponse({}))

        const res = await app.request('http://localhost/')
        const resText = await res.text()

        expect(res.status).toBe(200)
        expect(res.headers.get('X-contentUrl')).toEqual('http://localhost/')
        expect(res.headers.get('Set-Cookie')).toContain('myCookie=123; Path=/')
        expect(resText).toBe(exampleHtml)
    })

    it('Should successfully return request when Exporio Edge API fails', async () => {
        // @ts-ignore
        fetch.mockResolvedValue(createFetchResponse(undefined))

        const res = await app.request('http://localhost/abc')
        const resText = await res.text()

        expect(res.status).toBe(200)
        expect(res.headers.get('X-contentUrl')).toEqual('http://localhost/abc')
        expect(res.headers.get('Set-Cookie')).toContain('myCookie=123; Path=/')
        expect(resText).toBe(exampleHtml)
    })
})
