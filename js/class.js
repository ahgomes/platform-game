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
        this.scale_to_fill()
        this.y = canvas.height - this.height
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
        BIRD_DEATH: 'eaten',
        TOASTER_DEATH: 'burned',
        FALLING_DEATH: 'fallen',
        ZONE_DEATH: 'zoned'
    }

    static GRAVITY = 1

    constructor(prop = {}) {
        super(prop)
        this.direction = 0
        this.speed = 1
        this.jump_strength = 0
        this.can_jump = true
        this.is_jumping = false
        this.jump_count = 0
        this.meters_run = 0
        this.butter_count = 0
        this.state = Player.State.ALIVE
    }

    act() {
        switch (this.state) {
            case Player.State.BIRD_DEATH:
                // TODO
                break;
            case Player.State.TOASTER_DEATH:
                this.image = images['burnt-bread']
                break;
            case Player.State.FALLING_DEATH:
                this.y += this.height
                break;
            case Player.State.ZONE_DEATH:
                this.image = images['GF-bread']
                this.rotation = 30
                this.y += 5
                break;
        }

        if (this.state != Player.State.ALIVE) {
            this.direction = 0
            this.jump_strength = 0
            return
        }

        if (this.can_jump && this.jump_count < 2) {
            this.jump_strength = -15
            this.can_jump = false
            this.is_jumping = true
            this.jump_count++
            this.y += this.jump_strength
        }

        if (this.is_jumping) this.roation = this.jump_strength * 2

        this.fall()

        // TODO: Key interaction

        // TODO: Butter collection

        return this
    }

    is_on_platform() {
        // TODO
        return true
    }

    fall() {
        if (this.is_on_platform()) {
            this.jump_strength = 0
            this.jump_count = 0
            this.rotation = 0
            this.is_jumping = false
        } else this.jump_strength += GRAVITY
        this.y += this.jump_strength
    }

    run() {
        this.x += this.direction * this.speed
    }

}
