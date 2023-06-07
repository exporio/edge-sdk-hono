class AppendGlobalCode {
    htmlTag?: string
    content: string

    constructor(htmlTag: string, content: string) {
        this.htmlTag = htmlTag
        this.content = content
    }

    element(element: Element) {
        const contentWithTags = `<${this.htmlTag}>${this.content}</${this.htmlTag}>`
        element.append(contentWithTags, { html: true })
    }
}

export { AppendGlobalCode }
