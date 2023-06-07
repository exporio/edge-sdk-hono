class Replace {
    content: string
    contentOptions?: ContentOptions

    constructor(content: string, contentOptions?: ContentOptions) {
        this.content = content
        this.contentOptions = contentOptions
    }

    element(element: Element) {
        element.replace(this.content, this.contentOptions)
    }
}

export { Replace }
