class After {
    content: string
    contentOptions?: ContentOptions

    constructor(content: string, contentOptions?: ContentOptions) {
        this.content = content
        this.contentOptions = contentOptions
    }

    element(element: Element) {
        element.after(this.content, this.contentOptions)
    }
}

export { After }
