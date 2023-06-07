type ExporioMiddlewareOptions = {
    url: string
    apiKey: string
}

type RequestJson = {
    originalRequest: {
        url: string
        method: string
        headersInit: HeadersInit
    }
    params: {
        API_KEY: string
        [key: string]: any
    }
}

export { ExporioMiddlewareOptions, RequestJson }
