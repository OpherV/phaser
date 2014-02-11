/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2014 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* @class Phaser.Sprite
*
* @classdesc Create a new `Sprite` object. Sprites are the lifeblood of your game, used for nearly everything visual.
*
* At its most basic a Sprite consists of a set of coordinates and a texture that is rendered to the canvas.
* They also contain additional properties allowing for physics motion (via Sprite.body), input handling (via Sprite.input),
* events (via Sprite.events), animation (via Sprite.animations), camera culling and more. Please see the Examples for use cases.
*
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {number} x - The x coordinate (in world space) to position the Sprite at.
* @param {number} y - The y coordinate (in world space) to position the Sprite at.
* @param {string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture} key - This is the image or texture used by the Sprite during rendering. It can be a string which is a reference to the Cache entry, or an instance of a RenderTexture or PIXI.Texture.
* @param {string|number} frame - If this Sprite is using part of a sprite sheet or texture atlas you can specify the exact frame to use by giving a string or numeric index.
*/
Phaser.Sprite = function (game, x, y, key, frame) {

    x = x || 0;
    y = y || 0;
    key = key || null;
    frame = frame || null;
    
    /**
    * @property {Phaser.Game} game - A reference to the currently running Game.
    */
    this.game = game;
 
    /**
    * @property {boolean} exists - If exists = false then the Sprite isn't updated by the core game loop or physics subsystem at all.
    * @default
    */
    this.exists = true;

    /**
    * @property {string} name - The user defined name given to this Sprite.
    * @default
    */
    this.name = '';

    /**
    * @property {number} type - The const type of this object.
    * @readonly
    */
    this.type = Phaser.SPRITE;

    /**
    * @property {Phaser.Events} events - The Events you can subscribe to that are dispatched when certain things happen on this Sprite or its components.
    */
    this.events = new Phaser.Events(this);

    /**
    * @property {Phaser.AnimationManager} animations - This manages animations of the sprite. You can modify animations through it (see Phaser.AnimationManager)
    */
    this.animations = new Phaser.AnimationManager(this);

    /**
    *  @property {string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture} key - This is the image or texture used by the Sprite during rendering. It can be a string which is a reference to the Cache entry, or an instance of a RenderTexture, BitmapData or PIXI.Texture.
    */
    this.key = key;

    /**
    * @property {number} _frame - Internal cache var.
    * @private
    */
    this._frame = 0;

    /**
    * @property {string} _frameName - Internal cache var.
    * @private
    */
    this._frameName = '';

    PIXI.Sprite.call(this, PIXI.TextureCache['__default']);

    this.loadTexture(key, frame);

    this.position.set(x, y);

    /**
    * @property {Phaser.Point} world - The world coordinates of this Sprite. This differs from the x/y coordinates which are relative to the Sprites container.
    */
    this.world = new Phaser.Point(x, y);

    /**
    * Should this Sprite be automatically culled if out of range of the camera?
    * A culled sprite has its renderable property set to 'false'.
    * Be advised this is quite an expensive operation, as it has to calculate the bounds of the object every frame, so only enable it if you really need it.
    *
    * @property {boolean} autoCull - A flag indicating if the Sprite should be automatically camera culled or not.
    * @default
    */
    this.autoCull = false;

    /**
    * A Sprite that is fixed to the camera uses its x/y coordinates as offsets from the top left of the camera.
    * Note that if this Image is a child of a display object that has changed its position then the offset will be calculated from that.
    * @property {boolean} fixedToCamera - Fixes this Sprite to the Camera.
    * @default
    */
    this.fixedToCamera = false;

    /**
    * @property {Phaser.InputHandler|null} input - The Input Handler for this object. Needs to be enabled with image.inputEnabled = true before you can use it.
    */
    this.input = null;

    /**
    * @property {Phaser.Physics.Body|null} body - The Sprites physics Body. Will be null unless physics has been enabled via `Sprite.physicsEnabled = true`.
    */
    this.body = null;

    /**
    * @property {number} health - Health value. Used in combination with damage() to allow for quick killing of Sprites.
    */
    this.health = 1;

    /**
    * If you would like the Sprite to have a lifespan once 'born' you can set this to a positive value. Handy for particles, bullets, etc.
    * The lifespan is decremented by game.time.elapsed each update, once it reaches zero the kill() function is called.
    * @property {number} lifespan - The lifespan of the Sprite (in ms) before it will be killed.
    * @default
    */
    this.lifespan = 0;

    /**
    * If true the Sprite checks if it is still within the world each frame, when it leaves the world it dispatches Sprite.events.onOutOfBounds
    * and optionally kills the sprite (if Sprite.outOfBoundsKill is true). By default this is disabled because the Sprite has to calculate its
    * bounds every frame to support it, and not all games need it. Enable it by setting the value to true.
    * @property {boolean} checkWorldBounds
    * @default
    */
    this.checkWorldBounds = false;

    /**
    * @property {boolean} outOfBoundsKill - If true Sprite.kill is called as soon as Sprite.inWorld returns false, as long as Sprite.checkWorldBounds is true.
    * @default
    */
    this.outOfBoundsKill = false;

    /**
    * @property {boolean} debug - Handy flag to use with Game.enableStep
    * @default
    */
    this.debug = false;

    /**
    * A small internal cache:
    * 0 = previous position.x
    * 1 = previous position.y
    * 2 = previous rotation
    * 3 = renderID
    * 4 = fresh? (0 = no, 1 = yes)
    * 5 = outOfBoundsFired (0 = no, 1 = yes)
    * @property {array} _cache
    * @private
    */
    this._cache = [0, 0, 0, 0, 1, 0];

    /**
    * @property {Phaser.Rectangle} _bounds - Internal cache var.
    * @private
    */
    this._bounds = new Phaser.Rectangle();

};

Phaser.Sprite.prototype = Object.create(PIXI.Sprite.prototype);
Phaser.Sprite.prototype.constructor = Phaser.Sprite;

/**
* Automatically called by World.preUpdate.
*
* @method Phaser.Sprite#preUpdate
* @memberof Phaser.Sprite
* @return {boolean} True if the Sprite was rendered, otherwise false.
*/
Phaser.Sprite.prototype.preUpdate = function() {

    if (this._cache[4] === 1)
    {
        this.world.setTo(this.parent.position.x + this.position.x, this.parent.position.y + this.position.y);
        this.worldTransform.tx = this.world.x;
        this.worldTransform.ty = this.world.y;
        this._cache[0] = this.world.x;
        this._cache[1] = this.world.y;
        this._cache[2] = this.rotation;
        this._cache[4] = 0;

        // if (this.body)
        // {
        //     this.body.x = (this.world.x - (this.anchor.x * this.width)) + this.body.offset.x;
        //     this.body.y = (this.world.y - (this.anchor.y * this.height)) + this.body.offset.y;
        //     this.body.preX = this.body.x;
        //     this.body.preY = this.body.y;
        // }

        return false;
    }

    this._cache[0] = this.world.x;
    this._cache[1] = this.world.y;
    this._cache[2] = this.rotation;

    if (!this.exists || !this.parent.exists)
    {
        //  Reset the renderOrderID
        this._cache[3] = -1;
        return false;
    }

    if (this.lifespan > 0)
    {
        this.lifespan -= this.game.time.elapsed;

        if (this.lifespan <= 0)
        {
            this.kill();
            return false;
        }
    }

    //  Cache the bounds if we need it
    if (this.autoCull || this.checkWorldBounds)
    {
        this._bounds.copyFrom(this.getBounds());
    }

    if (this.autoCull)
    {
        //  Won't get rendered but will still get its transform updated
        this.renderable = this.game.world.camera.screenView.intersects(this._bounds);
    }

    if (this.checkWorldBounds)
    {
        //  The Sprite is already out of the world bounds, so let's check to see if it has come back again
        if (this._cache[5] === 1 && this.game.world.bounds.intersects(this._bounds))
        {
            this._cache[5] = 0;
        }
        else if (this._cache[5] === 0 && !this.game.world.bounds.intersects(this._bounds))
        {
            //  The Sprite WAS in the screen, but has now left.
            this._cache[5] = 1;
            this.events.onOutOfBounds.dispatch(this);

            if (this.outOfBoundsKill)
            {
                this.kill();
                return false;
            }
        }
    }

    this.world.setTo(this.game.camera.x + this.worldTransform.tx, this.game.camera.y + this.worldTransform.ty);

    if (this.visible)
    {
        this._cache[3] = this.game.world.currentRenderOrderID++;
    }

    this.animations.update();

    if (this.body)
    {
        this.body.preUpdate();
    }

    return true;

};

/**
* Internal function called by the World postUpdate cycle.
*
* @method Phaser.Sprite#postUpdate
* @memberof Phaser.Sprite
*/
Phaser.Sprite.prototype.postUpdate = function() {

    if (this.key instanceof Phaser.BitmapData && this.key._dirty)
    {
        this.key.render();
    }

    if (this.exists)
    {
        if (this.body)
        {
            this.body.postUpdate();
        }

        if (this.fixedToCamera)
        {
            // this.position.x = this.game.camera.view.x + this.x;
            // this.position.y = this.game.camera.view.y + this.y;
        }
    }

};

/**
* Changes the Texture the Sprite is using entirely. The old texture is removed and the new one is referenced or fetched from the Cache.
* This causes a WebGL texture update, so use sparingly or in low-intensity portions of your game.
*
* @method Phaser.Sprite#loadTexture
* @memberof Phaser.Sprite
* @param {string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture} key - This is the image or texture used by the Sprite during rendering. It can be a string which is a reference to the Cache entry, or an instance of a RenderTexture, BitmapData or PIXI.Texture.
* @param {string|number} frame - If this Sprite is using part of a sprite sheet or texture atlas you can specify the exact frame to use by giving a string or numeric index.
*/
Phaser.Sprite.prototype.loadTexture = function (key, frame) {

    frame = frame || 0;

    if (key instanceof Phaser.RenderTexture)
    {
        this.key = key.key;
        this.setTexture(key);
        return;
    }
    else if (key instanceof Phaser.BitmapData)
    {
        this.key = key.key;
        this.setTexture(key.texture);
        return;
    }
    else if (key instanceof PIXI.Texture)
    {
        this.key = key;
        this.setTexture(key);
        return;
    }
    else
    {
        if (key === null || typeof key === 'undefined')
        {
            this.key = '__default';
            this.setTexture(PIXI.TextureCache[this.key]);
            return;
        }
        else if (typeof key === 'string' && !this.game.cache.checkImageKey(key))
        {
            this.key = '__missing';
            this.setTexture(PIXI.TextureCache[this.key]);
            return;
        }

        if (this.game.cache.isSpriteSheet(key))
        {
            this.key = key;

            // var frameData = this.game.cache.getFrameData(key);
            this.animations.loadFrameData(this.game.cache.getFrameData(key));

            if (typeof frame === 'string')
            {
                this.frameName = frame;
            }
            else
            {
                this.frame = frame;
            }
        }
        else
        {
            this.key = key;
            this.setTexture(PIXI.TextureCache[key]);
            return;
        }
    }

};

/**
* Crop allows you to crop the texture used to display this Image.
* Cropping takes place from the top-left of the Image and can be modified in real-time by providing an updated rectangle object.
*
* @method Phaser.Sprite#crop
* @memberof Phaser.Sprite
* @param {Phaser.Rectangle} rect - The Rectangle to crop the Image to. Pass null or no parameters to clear a previously set crop rectangle.
*/
Phaser.Sprite.prototype.crop = function(rect) {

    if (typeof rect === 'undefined' || rect === null)
    {
        //  Clear any crop that may be set
        if (this.texture.hasOwnProperty('sourceWidth'))
        {
            this.texture.setFrame(new Phaser.Rectangle(0, 0, this.texture.sourceWidth, this.texture.sourceHeight));
        }
    }
    else
    {
        //  Do we need to clone the PIXI.Texture object?
        if (this.texture instanceof PIXI.Texture)
        {
            //  Yup, let's rock it ...
            var local = {};

            Phaser.Utils.extend(true, local, this.texture);

            local.sourceWidth = local.width;
            local.sourceHeight = local.height;
            local.frame = rect;
            local.width = rect.width;
            local.height = rect.height;

            this.texture = local;

            this.texture.updateFrame = true;
            PIXI.Texture.frameUpdates.push(this.texture);
        }
        else
        {
            this.texture.setFrame(rect);
        }
    }

};

/**
* Brings a 'dead' Sprite back to life, optionally giving it the health value specified.
* A resurrected Sprite has its alive, exists and visible properties all set to true.
* It will dispatch the onRevived event, you can listen to Sprite.events.onRevived for the signal.
* 
* @method Phaser.Sprite#revive
* @memberof Phaser.Sprite
* @param {number} [health=1] - The health to give the Sprite.
* @return (Phaser.Sprite) This instance.
*/
Phaser.Sprite.prototype.revive = function(health) {

    if (typeof health === 'undefined') { health = 1; }

    this.alive = true;
    this.exists = true;
    this.visible = true;
    this.health = health;

    if (this.events)
    {
        this.events.onRevived.dispatch(this);
    }

    return this;

};

/**
* Kills a Sprite. A killed Sprite has its alive, exists and visible properties all set to false.
* It will dispatch the onKilled event, you can listen to Sprite.events.onKilled for the signal.
* Note that killing a Sprite is a way for you to quickly recycle it in a Sprite pool, it doesn't free it up from memory.
* If you don't need this Sprite any more you should call Sprite.destroy instead.
* 
* @method Phaser.Sprite#kill
* @memberof Phaser.Sprite
* @return (Phaser.Sprite) This instance.
*/
Phaser.Sprite.prototype.kill = function() {

    this.alive = false;
    this.exists = false;
    this.visible = false;

    if (this.events)
    {
        this.events.onKilled.dispatch(this);
    }

    return this;

};

/**
* Destroys the Sprite. This removes it from its parent group, destroys the input, event and animation handlers if present
* and nulls its reference to game, freeing it up for garbage collection.
* 
* @method Phaser.Sprite#destroy
* @memberof Phaser.Sprite
*/
Phaser.Sprite.prototype.destroy = function() {

    if (this.filters)
    {
        this.filters = null;
    }

    if (this.parent)
    {
        this.parent.remove(this);
    }

    if (this.input)
    {
        this.input.destroy();
    }

    if (this.animations)
    {
        this.animations.destroy();
    }

    if (this.body)
    {
        this.body.destroy();
    }

    if (this.events)
    {
        this.events.destroy();
    }

    this.alive = false;
    this.exists = false;
    this.visible = false;

    this.game = null;

};

/**
* Damages the Sprite, this removes the given amount from the Sprites health property.
* If health is then taken below zero Sprite.kill is called.
* 
* @method Phaser.Sprite#damage
* @memberof Phaser.Sprite
* @param {number} amount - The amount to subtract from the Sprite.health value.
* @return (Phaser.Sprite) This instance.
*/
Phaser.Sprite.prototype.damage = function(amount) {

    if (this.alive)
    {
        this.health -= amount;

        if (this.health < 0)
        {
            this.kill();
        }
    }

    return this;

};

/**
* Resets the Sprite. This places the Sprite at the given x/y world coordinates and then
* sets alive, exists, visible and renderable all to true. Also resets the outOfBounds state and health values.
* If the Sprite has a physics body that too is reset.
* 
* @method Phaser.Sprite#reset
* @memberof Phaser.Sprite
* @param {number} x - The x coordinate (in world space) to position the Sprite at.
* @param {number} y - The y coordinate (in world space) to position the Sprite at.
* @param {number} [health=1] - The health to give the Sprite.
* @return (Phaser.Sprite) This instance.
*/
Phaser.Sprite.prototype.reset = function(x, y, health) {

    if (typeof health === 'undefined') { health = 1; }

    this.world.setTo(x, y);
    this.position.x = x;
    this.position.y = y;
    this.alive = true;
    this.exists = true;
    this.visible = true;
    this.renderable = true;
    this._outOfBoundsFired = false;

    this.health = health;

    if (this.body)
    {
        this.body.reset(false);
    }

    return this;
    
};

/**
* Brings the Sprite to the top of the display list it is a child of. Sprites that are members of a Phaser.Group are only
* bought to the top of that Group, not the entire display list.
* 
* @method Phaser.Sprite#bringToTop
* @memberof Phaser.Sprite
* @return (Phaser.Sprite) This instance.
*/
Phaser.Sprite.prototype.bringToTop = function(child) {

    if (typeof child === 'undefined')
    {
        if (this.parent)
        {
            this.parent.bringToTop(this);
        }
    }
    else
    {

    }

    return this;

};

/**
* Play an animation based on the given key. The animation should previously have been added via sprite.animations.add()
* If the requested animation is already playing this request will be ignored. If you need to reset an already running animation do so directly on the Animation object itself.
* 
* @method Phaser.Sprite#play
* @memberof Phaser.Sprite
* @param {string} name - The name of the animation to be played, e.g. "fire", "walk", "jump".
* @param {number} [frameRate=null] - The framerate to play the animation at. The speed is given in frames per second. If not provided the previously set frameRate of the Animation is used.
* @param {boolean} [loop=false] - Should the animation be looped after playback. If not provided the previously set loop value of the Animation is used.
* @param {boolean} [killOnComplete=false] - If set to true when the animation completes (only happens if loop=false) the parent Sprite will be killed.
* @return {Phaser.Animation} A reference to playing Animation instance.
*/
Phaser.Sprite.prototype.play = function (name, frameRate, loop, killOnComplete) {

    if (this.animations)
    {
        return this.animations.play(name, frameRate, loop, killOnComplete);
    }

};

/**
* Indicates the rotation of the Sprite, in degrees, from its original orientation. Values from 0 to 180 represent clockwise rotation; values from 0 to -180 represent counterclockwise rotation.
* Values outside this range are added to or subtracted from 360 to obtain a value within the range. For example, the statement player.angle = 450 is the same as player.angle = 90.
* If you wish to work in radians instead of degrees use the property Sprite.rotation instead. Working in radians is also a little faster as it doesn't have to convert the angle.
* 
* @name Phaser.Sprite#angle
* @property {number} angle - The angle of this Sprite in degrees.
*/
Object.defineProperty(Phaser.Sprite.prototype, "angle", {

    get: function() {

        return Phaser.Math.wrapAngle(Phaser.Math.radToDeg(this.rotation));

    },

    set: function(value) {

        this.rotation = Phaser.Math.degToRad(Phaser.Math.wrapAngle(value));

    }

});

/**
* Returns the delta x value. The difference between world.x now and in the previous step.
*
* @name Phaser.Sprite#deltaX
* @property {number} deltaX - The delta value. Positive if the motion was to the right, negative if to the left.
* @readonly
*/
Object.defineProperty(Phaser.Sprite.prototype, "deltaX", {

    get: function() {

        return this.world.x - this._cache[0];

    }

});

/**
* Returns the delta y value. The difference between world.y now and in the previous step.
*
* @name Phaser.Sprite#deltaY
* @property {number} deltaY - The delta value. Positive if the motion was downwards, negative if upwards.
* @readonly
*/
Object.defineProperty(Phaser.Sprite.prototype, "deltaY", {

    get: function() {
    
        return this.world.y - this._cache[1];

    }

});

/**
* Returns the delta z value. The difference between rotation now and in the previous step.
*
* @name Phaser.Sprite#deltaZ
* @property {number} deltaZ - The delta value.
* @readonly
*/
Object.defineProperty(Phaser.Sprite.prototype, "deltaZ", {

    get: function() {
    
        return this.rotation - this._cache[2];

    }

});

/**
* Checks if the Image bounds are within the game world, otherwise false if fully outside of it.
*
* @name Phaser.Sprite#inWorld
* @property {boolean} inWorld - True if the Image bounds is within the game world, even if only partially. Otherwise false if fully outside of it.
* @readonly
*/
Object.defineProperty(Phaser.Sprite.prototype, "inWorld", {

    get: function() {

        return this.game.world.bounds.intersects(this.getBounds());

    }

});

/**
* Checks if the Image bounds are within the game camera, otherwise false if fully outside of it.
*
* @name Phaser.Sprite#inCamera
* @property {boolean} inCamera - True if the Image bounds is within the game camera, even if only partially. Otherwise false if fully outside of it.
* @readonly
*/
Object.defineProperty(Phaser.Sprite.prototype, "inCamera", {

    get: function() {
    
        return this.game.world.camera.screenView.intersects(this.getBounds());

    }

});

/**
* @name Phaser.Sprite#frame
* @property {number} frame - Gets or sets the current frame index and updates the Texture Cache for display.
*/
Object.defineProperty(Phaser.Sprite.prototype, "frame", {

    get: function () {
        return this.animations.frame;
    },

    set: function (value) {
        this.animations.frame = value;
    }

});

/**
* @name Phaser.Sprite#frameName
* @property {string} frameName - Gets or sets the current frame name and updates the Texture Cache for display.
*/
Object.defineProperty(Phaser.Sprite.prototype, "frameName", {

    get: function () {
        return this.animations.frameName;
    },

    set: function (value) {
        this.animations.frameName = value;
    }

});

/**
* @name Phaser.Sprite#renderOrderID
* @property {number} renderOrderID - The render order ID, reset every frame.
* @readonly
*/
Object.defineProperty(Phaser.Sprite.prototype, "renderOrderID", {

    get: function() {

        return this._cache[3];

    }

});

/**
* By default a Sprite won't process any input events at all. By setting inputEnabled to true the Phaser.InputHandler is
* activated for this object and it will then start to process click/touch events and more.
*
* @name Phaser.Sprite#inputEnabled
* @property {boolean} inputEnabled - Set to true to allow this object to receive input events.
*/
Object.defineProperty(Phaser.Sprite.prototype, "inputEnabled", {
    
    get: function () {

        return (this.input && this.input.enabled);

    },

    set: function (value) {

        if (value)
        {
            if (this.input === null)
            {
                this.input = new Phaser.InputHandler(this);
                this.input.start();
            }
        }
        else
        {
            if (this.input && this.input.enabled)
            {
                this.input.stop();
            }
        }
    }

});

/**
* By default Sprites won't add themselves to the physics world. By setting physicsEnabled to true a Physics Body is
* attached to this Sprite and it will then start to process physics world updates. Access all of its properties via Sprite.body.
*
* @name Phaser.Sprite#physicsEnabled
* @property {boolean} physicsEnabled - Set to true to add this Sprite to the physics world. Set to false to destroy the body and remove it from the physics world.
*/
Object.defineProperty(Phaser.Sprite.prototype, "physicsEnabled", {
    
    get: function () {

        return (this.body !== null);

    },

    set: function (value) {

        if (value)
        {
            if (this.body === null)
            {
                this.body = new Phaser.Physics.Body(this);
            }
        }
        else
        {
            if (this.body)
            {
                this.body.destroy();
            }
        }
    }

});
