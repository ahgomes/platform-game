class Actor {
    constructor(prop = {}) {
        this.start = {
            x: prop.x,
            y: prop.y,
        }
        this.x = this.start.x
        this.y = this.start.y
        this.image = prop.image
        this.width = (prop.width ?? (this.image ? this.image.width : 0))
        this.height = (prop.height ?? (this.image ? this.image.height : 0))
        this.rotation = 0
    }

    act() {
        // TODO: action of actor
        return this
    }

    draw() {
        
        if (this.rotation) {
            c.save()
            c.translate(this.x + this.width / 2, this.y + this.height / 2)
            c.rotate(degs_to_rads(this.rotation * 2))
            c.drawImage(this.image, 0, 0, this.width, this.height)
            c.translate(-(this.x + this.width / 2), -(this.y + this.height / 2))
            c.restore()
        } else c.drawImage(this.image, this.x, this.y, this.width, this.height)


        return this
    }

    update() {
        this.act()
            .draw()
    }
}
