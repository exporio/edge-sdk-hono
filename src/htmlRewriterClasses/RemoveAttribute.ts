class RemoveAttribute {
    name: string

    constructor(name: string) {
        this.name = name
    }

    element(element: Element) {
        element.removeAttribute(this.name)
    }
}

export { RemoveAttribute }
