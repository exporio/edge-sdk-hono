class SetInnerContent {
    content: string
    contentOptions?: ContentOptions

    constructor(content: string, contentOptions?: ContentOptions) {
        this.content = content
        this.contentOptions = contentOptions
    }

    element(element: Element) {
        element.setInnerContent(this.content, this.contentOptions)
    }
}

export { SetInnerContent }
