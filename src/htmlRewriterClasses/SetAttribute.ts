class SetAttribute {
    name: string
    value: string

    constructor(name: string, value: string) {
        this.name = name
        this.value = value
    }

    element(element: Element) {
        element.setAttribute(this.name, this.value)
    }
}

export { SetAttribute }
