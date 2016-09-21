var fs = require("fs");

/**
 * @class
 */
function Filejson(cfg) {
    "use stict";

    var self = this;
    
    // Used to store a reference for our setTimeout function.
    // The setTimeout function is used to throttle the saving to disk.
    var task;

    // Prevents the oportunity for a race condition to occure in the scenario where one fs.writeFile operation tries to overlap another.
    // This could be the result of slow IO or a large object being written.
    var saving = false;

    var log = function(msg) {
        if(this.cfg.verbose) {
            console.log(msg);
        }
    }.bind(this);

    var handler = {
        get: function(target, key, receiver) {
            // return target[key];
            // return new Proxy(target[key], this);
            return Reflect.get(target, key, receiver);
        },
        set: function(target, key, value, receiver) {
            
            if(!self.cfg.filename) {
                throw new Error("You must specify a filename");
            }

            if( value instanceof Object ) {
                value = new Proxy(value, this);
            }

            // The default behavior to store the value
            Reflect.set(target, key, value, receiver);
            
            if(!self.paused) {
                self.save(function(error) {
                    if(error) {
                        console.error(error);
                        return;
                    }
                });
            }
        }
    };

    if( typeof cfg === "undefined" ) {
        cfg = {};
    }

    this.cfg = {
        filename: cfg.filename || "",
        space: cfg.space || 2,
        delay: cfg.delay || 3000,
        verbose: cfg.verbose || false
    };

    // Boolean - pauses any future changes to this.contents from auto triggering a save to disk
    this.paused;

    // Boolean - if a race condition needed to be avoided then there will be pending writes
    this.pendingWrites = false;

    this.save = function(callback) {
        clearTimeout(task);
        task = setTimeout(function() {
            var contents;
            try {
                contents = JSON.stringify(this.contents, null, this.cfg.space);
            }
            catch(err) {
                callback(err, this);
                return;
            }
            if(!saving) {
                saving = true;
                this.pendingWrites = false;
                fs.writeFile(this.cfg.filename, contents, function(error) {
                    saving = false;
                    if(!error) {
                        log("saved " + this.cfg.filename);
                    }
                    callback(error, this);
                }.bind(this));
            }
            else {
                this.pendingWrites = true;
            }
        }.bind(this), this.cfg.delay);
    };

    /**
     * This is the starting point for using Filejson. It is within this function's callback that you will be able to use this module.
     * @param {!string} filename - The filename where you would like to load/save changes to. The filename must exist.
     * @param {*} [overwriteWith] - You can optionally overwrite the contents of filename. Most of the time this will not be needed.
     * @param {!callback} callback - The callback that handles the response.
     */
    this.load = function() {
        var filename = arguments[0];
        var overwriteWith = (typeof arguments[2] === "undefined") ? undefined : arguments[1];
        var callback = (typeof arguments[2] === "undefined") ? arguments[1] : arguments[2];

        var updateContentsWithoutSaving = function(contents) {
            this.paused = true;
            this.contents = contents;
            this.paused = false;
        }.bind(this);

        this.cfg.filename = filename;

        if(overwriteWith) {
            updateContentsWithoutSaving(overwriteWith);
            this.save(function(error) {
                callback(error, this);
            }.bind(this));
        }
        else {
            fs.readFile(filename, "utf-8", function(error, contents) {
                if (error) {
                    callback(error, this);
                    return;
                }

                try {
                    contents = JSON.parse(contents);
                }
                catch(err) {
                    callback("Error parsing JSON. " + err, this);
                    return;
                }

                updateContentsWithoutSaving(contents);
                log("loaded " + this.cfg.filename);
                if(typeof callback === "function") {
                    callback(null, this);
                }
                return;
                
            }.bind(this));
        }
    };

    return new Proxy(this, handler);

    /**
     * @callback callback
     * @param {?string} error - callback error
     * @param {!Object} Filejson instance - returns the instance
     */

}

module.exports = Filejson;
