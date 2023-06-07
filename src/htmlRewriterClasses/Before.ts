class Before {
    content: string
    contentOptions?: ContentOptions

    constructor(content: string, contentOptions?: ContentOptions) {
        this.content = content
        this.contentOptions = contentOptions
    }

    element(element: Element) {
        element.before(this.content, this.contentOptions)
    }
}

export { Before }
