class SetStyleProperty {
    propertyName: string
    propertyValue: string

    constructor(propertyName: string, propertyValue: string) {
        this.propertyName = propertyName
        this.propertyValue = propertyValue
    }

    element(element: Element) {
        let currentStyleAttribute = element.getAttribute('style') || ''

        if (currentStyleAttribute.includes(`${this.propertyName}:`)) {
            const styleProperties = currentStyleAttribute.split(';')

            styleProperties.forEach((property) => {
                if (property.includes(`${this.propertyName}:`)) {
                    currentStyleAttribute = currentStyleAttribute.replace(
                        property,
                        `${this.propertyName}:${this.propertyValue}`
                    )
                }
            })
        } else {
            currentStyleAttribute += `${this.propertyName}:${this.propertyValue};`
        }

        element.setAttribute('style', currentStyleAttribute)
    }
}

export { SetStyleProperty }
