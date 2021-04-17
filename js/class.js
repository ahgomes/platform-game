class Actor {
    constructor(prop = {}) {
        // TODO: set up actor properities
    }

    act() {
        // TODO: action of actor
        return this
    }

    draw() {
        // TODO: draw actor to canvas
        return this
    }

    update() {
        this.act()
            .draw()
    }
}
