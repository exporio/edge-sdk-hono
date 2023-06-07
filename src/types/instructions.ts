type Cookie = {
    name: string
    value: string
    domain?: string
    path?: string
    expires?: string
    maxAge?: string
    httpOnly?: boolean
    secure?: boolean
    sameSite?: string
    partitioned?: boolean
}

type CookieInstruction = {
    setCookie: boolean
    cookies: Cookie[]
}

type Transformation = {
    method: string
    selector: string
    argument1: any
    argument2: any
}

type RewriterInstruction = {
    useRewriter: boolean
    transformations: Transformation[]
}

type CustomUrlInstruction = {
    loadCustomUrl: boolean
    customUrl: string | null
}

type Instructions = {
    customUrlInstruction: CustomUrlInstruction
    rewriterInstruction: RewriterInstruction
    cookieInstruction: CookieInstruction
}

export { Instructions, CustomUrlInstruction, RewriterInstruction, Transformation, CookieInstruction, Cookie }
