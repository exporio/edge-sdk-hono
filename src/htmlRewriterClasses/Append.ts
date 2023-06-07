class Append {
    content: string
    contentOptions: ContentOptions

    constructor(content: string, contentOptions: ContentOptions) {
        this.content = content
        this.contentOptions = contentOptions
    }

    element(element: Element) {
        element.append(this.content, this.contentOptions)
    }
}

export { Append }
