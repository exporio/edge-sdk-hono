import { Context, MiddlewareHandler } from 'hono'

import { Instructions, ExporioMiddlewareOptions, RequestJson, Cookie } from './types'
import {
    After,
    Append,
    AppendGlobalCode,
    Before,
    Prepend,
    Remove,
    RemoveAndKeepContent,
    RemoveAttribute,
    Replace,
    SetAttribute,
    SetInnerContent,
    SetStyleProperty,
} from './htmlRewriterClasses'

export const exporioMiddleware = (options: ExporioMiddlewareOptions): MiddlewareHandler => {
    if (!options.url) {
        options.url = 'https://edge-api.exporio.cloud'
    }
    if (!options.apiKey) {
        throw new Error('Exporio middleware requires options for "apiKey"')
    }

    return async (c, next) => {
        const exporioInstructions = await fetchExporioInstructions(c, options)

        if (!exporioInstructions) {
            c.set('contentUrl', c.req.url)

            await next()
        } else {
            c.set('contentUrl', getContentUrl(exporioInstructions, c.req.url))

            await next()

            applyRewriterInstruction(c, exporioInstructions)
            applyCookieInstruction(c.res.headers, exporioInstructions)
        }
    }
}

const fetchExporioInstructions = async (
    c: Context,
    options: ExporioMiddlewareOptions
): Promise<Instructions | null> => {
    try {
        const requestJson = buildRequestJson(c, options.apiKey)
        const exporioRequest = new Request(options.url, {
            method: 'POST',
            body: JSON.stringify(requestJson),
            headers: { 'Content-Type': 'application/json' },
        })

        const exporioResponse = await fetch(exporioRequest)
        return await exporioResponse.json()
    } catch (err) {
        console.error('Failed to fetch exporio instructions', err)
        return null
    }
}

const buildRequestJson = (c: Context, apiKey: string): RequestJson => {
    const headersInit: HeadersInit = []
    c.req.headers.forEach((value: string, key: string) => headersInit.push([key, value]))

    return {
        originalRequest: {
            url: c.req.url,
            method: c.req.method,
            headersInit: headersInit,
        },
        params: {
            API_KEY: apiKey,
        },
    }
}

const getContentUrl = (instructions: Instructions, defaultUrl: string): string => {
    const customUrlInstruction = instructions?.customUrlInstruction
    return customUrlInstruction?.loadCustomUrl && customUrlInstruction?.customUrl
        ? customUrlInstruction.customUrl
        : defaultUrl
}

const applyRewriterInstruction = (c: Context, instructions: Instructions) => {
    try {
        let response = new Response(c.res.body, c.res)

        instructions?.rewriterInstruction?.transformations?.forEach(({ selector, argument1, argument2, method }) => {
            const rewriter = new HTMLRewriter().on(selector, getRewriterClass(method, argument1, argument2))
            response = rewriter.transform(response)
        })

        c.res = new Response(response.body, response)
    } catch (err) {
        console.error('Failed to apply exporio rewriter instruction', err)
    }
}

function getRewriterClass(method: string, arg1: any, arg2: any) {
    switch (method) {
        case 'After':
            return new After(arg1, arg2)
        case 'Append':
            return new Append(arg1, arg2)
        case 'Before':
            return new Before(arg1, arg2)
        case 'Prepend':
            return new Prepend(arg1, arg2)
        case 'Remove':
            return new Remove()
        case 'RemoveAndKeepContent':
            return new RemoveAndKeepContent()
        case 'RemoveAttribute':
            return new RemoveAttribute(arg1)
        case 'Replace':
            return new Replace(arg1, arg2)
        case 'SetAttribute':
            return new SetAttribute(arg1, arg2)
        case 'SetInnerContent':
            return new SetInnerContent(arg1, arg2)
        case 'AppendGlobalCode':
            return new AppendGlobalCode(arg1, arg2)
        case 'SetStyleProperty':
            return new SetStyleProperty(arg1, arg2)
        default:
            throw new Error(`Unknown method: ${method}`)
    }
}

const applyCookieInstruction = (headers: Headers, instructions: Instructions) => {
    try {
        instructions?.cookieInstruction?.cookies.forEach((cookie) => {
            const cookieString = getCookieString(cookie)
            headers.append('Set-Cookie', cookieString)
        })
    } catch (err) {
        console.error('Failed to set exporio cookies', err)
    }
}

const getCookieString = (cookie: Cookie): string => {
    let cookieAttributes = [`${cookie.name}=${cookie.value}`]

    if (cookie.domain) {
        cookieAttributes.push(`Domain=${cookie.domain}`)
    }
    if (cookie.path) {
        cookieAttributes.push(`Path=${cookie.path}`)
    }
    if (cookie.expires) {
        cookieAttributes.push(`Expires=${cookie.expires}`)
    }
    if (cookie.maxAge) {
        cookieAttributes.push(`Max-Age=${cookie.maxAge}`)
    }
    if (cookie.httpOnly) {
        cookieAttributes.push('HttpOnly')
    }
    if (cookie.secure) {
        cookieAttributes.push('Secure')
    }
    if (cookie.sameSite) {
        cookieAttributes.push(`SameSite=${cookie.sameSite}`)
    }
    if (cookie.partitioned) {
        cookieAttributes.push('Partitioned')
    }

    return cookieAttributes.join('; ')
}
