class Prepend {
    content: string
    contentOptions: ContentOptions

    constructor(content: string, contentOptions: ContentOptions) {
        this.content = content
        this.contentOptions = contentOptions
    }

    element(element: Element) {
        element.prepend(this.content, this.contentOptions)
    }
}

export { Prepend }
