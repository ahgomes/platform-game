class Actor {
    constructor(prop = {}) {
        this.image = prop.image
        this.width = (prop.width ?? (this.image ? this.image.width : 0))
        this.height = (prop.height ?? (this.image ? this.image.height : 0))
        this.x = prop.x || 0
        this.y = prop.y || canvas.height - this.height
        this.rotation = 0
    }

    act() {
        return this
    }

    draw() {
        if (!this.image) return

        if (this.rotation) {
            c.save()
            c.translate(this.x + this.width / 2, this.y + this.height / 2)
            c.rotate(degs_to_rads(this.rotation * 2))
            c.drawImage(this.image, 0, 0, this.width, this.height)
            c.translate(-(this.x + this.width / 2), -(this.y + this.height / 2))
            c.restore()
        } else c.drawImage(this.image, this.x, this.y, this.width, this.height)

        console.log(this.image, this.x, this.y, this.width, this.height)

        return this
    }

    set_position(x, y) {
        this.x = x
        this.y = y
    }

    update() {
        this.act()
            .draw()
    }
}

class Background extends Actor {
    constructor(loc = -1, prop = {}) {
        super(prop)
        this.x = loc * this.width
    }

    scale_to_fill() {
        let scale = Math.max(canvas.width / this.width,
                canvas.height / this.height)
        this.width *= scale
        this.height *= scale
    }
}

class Player extends Actor {
    static State = {
        ALIVE: 'alive',
        DEAD: 'dead',
    }

    static GRAVITY = 1

    constructor(prop = {}) {
        super(prop)

    }

    act() {
        // TODO
    }

    fall() {
        // TODO
    }

    jump() {
        // TODO
    }

    run() {
        // TODO
    }
}


/* for background
let img_v = img.value
let scale = Math.max(canvas.width / img_v.width, canvas.height / img_v.height)
console.log(scale);
c.drawImage(img.value, 0, canvas.height - img_v.height * scale, img_v.width * scale, img_v.height * scale)
*/
