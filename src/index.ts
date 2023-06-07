import { Context, MiddlewareHandler } from 'hono'

import { Instructions, ExporioMiddlewareOptions, RequestJson } from './types'
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

const getContentUrl = (instructions: Instructions, defaultUrl: string): string => {
    const customUrlInstruction = instructions?.customUrlInstruction
    return customUrlInstruction?.loadCustomUrl && customUrlInstruction?.customUrl
        ? customUrlInstruction.customUrl
        : defaultUrl
}

const applyRewriterInstruction = (c: Context, instructions: Instructions) => {
    let response = new Response(c.res.body, c.res)

    instructions?.rewriterInstruction?.transformations?.forEach(({ selector, argument1, argument2, method }) => {
        switch (method) {
            // Default Methods
            case 'After': {
                const rewriter = new HTMLRewriter().on(selector, new After(argument1, argument2))
                response = rewriter.transform(response)
                break
            }

            case 'Append': {
                const rewriter = new HTMLRewriter().on(selector, new Append(argument1, argument2))
                response = rewriter.transform(response)
                break
            }

            case 'Before': {
                const rewriter = new HTMLRewriter().on(selector, new Before(argument1, argument2))
                response = rewriter.transform(response)
                break
            }

            case 'Prepend': {
                const rewriter = new HTMLRewriter().on(selector, new Prepend(argument1, argument2))
                response = rewriter.transform(response)
                break
            }

            case 'Remove': {
                const rewriter = new HTMLRewriter().on(selector, new Remove())
                response = rewriter.transform(response)
                break
            }

            case 'RemoveAndKeepContent': {
                const rewriter = new HTMLRewriter().on(selector, new RemoveAndKeepContent())
                response = rewriter.transform(response)
                break
            }

            case 'RemoveAttribute': {
                const rewriter = new HTMLRewriter().on(selector, new RemoveAttribute(argument1))
                response = rewriter.transform(response)
                break
            }

            case 'Replace': {
                const rewriter = new HTMLRewriter().on(selector, new Replace(argument1, argument2))
                response = rewriter.transform(response)
                break
            }

            case 'SetAttribute': {
                const rewriter = new HTMLRewriter().on(selector, new SetAttribute(argument1, argument2))
                response = rewriter.transform(response)
                break
            }

            case 'SetInnerContent': {
                const rewriter = new HTMLRewriter().on(selector, new SetInnerContent(argument1, argument2))
                response = rewriter.transform(response)
                break
            }

            // Custom Methods
            case 'AppendGlobalCode': {
                const rewriter = new HTMLRewriter().on(selector, new AppendGlobalCode(argument1, argument2))
                response = rewriter.transform(response)
                break
            }

            case 'SetStyleProperty': {
                const rewriter = new HTMLRewriter().on(selector, new SetStyleProperty(argument1, argument2))
                response = rewriter.transform(response)
                break
            }
        }
    })

    c.res = new Response(response.body, response)
}

const applyCookieInstruction = (headers: Headers, instructions: Instructions) => {
    instructions?.cookieInstruction?.cookies.forEach((cookie) => {
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

        headers.append('Set-Cookie', cookieAttributes.join('; '))
    })
}
