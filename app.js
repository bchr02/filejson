const fs = require("fs");
const path = require("path");

/**
 * @class
 */
function Filejson(cfg) {
  "use strict";

  const self = this;

  // Used to store a reference to our setTimeout scheduled timer so that we can cancel pending saves (debounce).
  let scheduledTimers;

  // Prevents the oportunity for a race condition to occure in the scenario where one fs.writeFile operation tries to overlap another.
  // This could be the result of slow IO or a large object being written.
  let saving = false;

  const log = function (msg) {
    if (this.cfg.verbose) {
      console.log(msg);
    }
  }.bind(this);

  /**
   * Proxy handler that intercepts property get, set, and delete operations on
   * the Filejson instance and its nested `contents` object. Any mutation to
   * `contents` automatically schedules a debounced save to disk.
   * @private
   */
  var handler = {
    get: function (target, key, receiver) {
      if (key === "__isProxy") {
        // Implementing a virtual __isProxy key allows us to check whether an object is already a Proxy.
        return true;
      }

      return Reflect.get(target, key, receiver);
    },
    deleteProperty: function (target, property) {
      // The default behavior to delete the value
      Reflect.deleteProperty(target, property);

      if (!self.paused) {
        self.save(function (error) {
          if (error) {
            console.error(error);
            return;
          }
        });
      }

      // The deleteProperty method must return a Boolean indicating whether or not the property has been successfully deleted.
      return true;
    },
    set: function (target, key, value, receiver) {
      const check = function (value, tree) {
        const t = typeof value;
        if (!(t === "string" || t === "number" || t === "object" || t === "boolean" || t === "undefined")) {
          throw new Error("NON-JSON COMPATIBLE TYPE FOUND. " + t + " found at: " + tree);
        }
      };
      const loopAll = function (obj, parent) {
        let tree = parent || "";

        for (const key in obj) {
          if (typeof obj[key] !== "object" || (typeof obj[key] === "object" && obj[key] === null) /* fixes #10 */) {
            check(obj[key], tree);
          } else {
            tree = parent + "." + key;
            obj[key] = new Proxy(obj[key], handler);
            loopAll(obj[key], tree);
          }
        }
      };

      if (target == self && key != "contents") {
        // When target is at the root object but we are not updating the "contents" property then just store the value (the default action).
        return Reflect.set(target, key, value, receiver);
      }

      if (!self.cfg.filename) {
        throw new Error("You must specify a filename");
      }

      if (value instanceof Object && value.__isProxy === undefined) {
        value = new Proxy(value, handler);
        loopAll(value, "...");
      }

      // The default behavior to store the value
      Reflect.set(target, key, value, receiver);

      if (!self.paused) {
        self.save(function (error) {
          if (error) {
            console.error(error);
            return;
          }
        });
      }

      // A Proxy must return true
      return true;
    },
  };

  if (typeof cfg === "undefined") {
    cfg = {};
  }

  this.cfg = {
    filename: cfg.filename || "",
    space: cfg.space || 2,
    verbose: cfg.verbose || false,
    saveDelay: typeof cfg.saveDelay === "number" ? cfg.saveDelay : 100,
    atomicWrites: typeof cfg.atomicWrites === "boolean" ? cfg.atomicWrites : true,
  };

  // Boolean - pauses any future changes to this.contents from auto triggering a save to disk
  this.paused;

  /**
   * Atomic write helper - writes to a temp file then renames it atomically
   * @private
   */
  const atomicWrite = function (filename, contents, callback) {
    const tmpFilename = filename + ".tmp" + Date.now() + Math.random().toString(36).substring(7);

    fs.writeFile(tmpFilename, contents, function (writeError) {
      if (writeError) {
        // Clean up temp file if it exists
        fs.unlink(tmpFilename, function () {
          callback(writeError);
        });
        return;
      }

      // Rename is atomic on most file systems
      fs.rename(tmpFilename, filename, function (renameError) {
        if (renameError) {
          // Clean up temp file on rename failure
          fs.unlink(tmpFilename, function () {
            callback(renameError);
          });
          return;
        }

        callback(null);
      });
    });
  };

  /**
   * Asynchronously saves the current contents to the configured file.
   * Debounces rapid successive calls using `cfg.saveDelay` (default 100ms)
   * so that only the last call within the delay window triggers a disk write.
   * Uses atomic writes (write-to-temp + rename) when `cfg.atomicWrites` is
   * enabled (the default).
   *
   * @param {function} [callback] - Optional Node-style callback `(error, instance)`.
   *   If omitted a Promise is returned instead.
   * @returns {Promise|undefined} Returns a Promise when no callback is provided.
   *
   * @example
   * // Callback style
   * file.save(function(err) {
   *   if (err) console.error(err);
   * });
   *
   * @example
   * // Promise / async-await style
   * await file.save();
   */
  this.save = function (callback) {
    // Return a Promise if no callback is provided (for async/await support)
    if (typeof callback !== "function") {
      return new Promise(
        function (resolve, reject) {
          this.save(function (error, instance) {
            if (error) {
              reject(error);
            } else {
              resolve(instance);
            }
          });
        }.bind(this)
      );
    }

    // Clear any pending save timer (debounce)
    clearTimeout(scheduledTimers);

    // Schedule save with configured delay (default 100ms)
    scheduledTimers = setTimeout(
      function () {
        let contents;
        try {
          contents = JSON.stringify(this.contents, null, this.cfg.space);
        } catch (err) {
          callback(err, this);
          return;
        }
        if (!saving) {
          // prevents possible race condition
          saving = true;

          const writeFunction = this.cfg.atomicWrites ? atomicWrite : fs.writeFile;

          writeFunction(
            this.cfg.filename,
            contents,
            function (error) {
              saving = false;
              if (!error) {
                log("saved " + this.cfg.filename);
              }
              callback(error, this);
            }.bind(this)
          );
        } else {
          this.save(callback);
        }
      }.bind(this),
      this.cfg.saveDelay
    );
  };

  /**
   * Synchronously saves the current contents to disk.
   * Useful for exit handlers where async operations may not complete.
   * Clears any pending debounced saves and writes immediately.
   *
   * @throws {Error} If serialization or file write fails
   * @returns {Object} Returns the Filejson instance
   *
   * @example
   * // In an exit handler
   * process.on('SIGINT', () => {
   *   file.saveSync();
   *   process.exit(0);
   * });
   */
  this.saveSync = function () {
    // Clear any pending save timer (debounce)
    clearTimeout(scheduledTimers);

    if (!this.cfg.filename) {
      throw new Error("You must specify a filename");
    }

    // Serialize contents
    const contents = JSON.stringify(this.contents, null, this.cfg.space);

    // Write synchronously with or without atomic writes
    if (this.cfg.atomicWrites) {
      const tmpFilename = this.cfg.filename + ".tmp" + Date.now() + Math.random().toString(36).substring(7);

      try {
        fs.writeFileSync(tmpFilename, contents);
        fs.renameSync(tmpFilename, this.cfg.filename);
        log("saved " + this.cfg.filename + " (sync)");
      } catch (error) {
        // Clean up temp file on error
        try {
          if (fs.existsSync(tmpFilename)) {
            fs.unlinkSync(tmpFilename);
          }
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
        throw error;
      }
    } else {
      fs.writeFileSync(this.cfg.filename, contents);
      log("saved " + this.cfg.filename + " (sync)");
    }

    return this;
  };

  /**
   * This is the starting point for using Filejson. It is within this function's callback that you will be able to use this module.
   * @param {!string} filename - The filename where you would like to load/save changes to. The filename must exist.
   * @param {*} [overwriteWith] - You can optionally overwrite the contents of filename. Most of the time this will not be needed.
   * @param {callback} [callback] - Optional callback that handles the response. If omitted, returns a Promise.
   * @returns {Promise|undefined} Returns a Promise if no callback is provided
   */
  this.load = function () {
    const filename = arguments[0];
    const overwriteWith = typeof arguments[2] === "undefined" ? undefined : arguments[1];
    const callback = typeof arguments[2] === "undefined" ? arguments[1] : arguments[2];

    // Return a Promise if no callback is provided (for async/await support)
    if (typeof callback !== "function") {
      // When called without callback, arguments[1] might be overwriteWith (not a function) or undefined
      const actualOverwriteWith = typeof arguments[1] !== "undefined" && typeof arguments[1] !== "function" ? arguments[1] : undefined;
      return new Promise(
        function (resolve, reject) {
          if (actualOverwriteWith !== undefined) {
            this.load(filename, actualOverwriteWith, function (error, instance) {
              if (error) {
                reject(error);
              } else {
                resolve(instance);
              }
            });
          } else {
            this.load(filename, function (error, instance) {
              if (error) {
                reject(error);
              } else {
                resolve(instance);
              }
            });
          }
        }.bind(this)
      );
    }

    const updateContentsWithoutSaving = function (contents) {
      this.paused = true;
      this.contents = contents;
      this.paused = false;
    }.bind(this);

    this.cfg.filename = filename;

    if (overwriteWith) {
      updateContentsWithoutSaving(overwriteWith);
      this.save(
        function (error) {
          callback(error, this);
        }.bind(this)
      );
    } else {
      fs.readFile(
        filename,
        "utf-8",
        function (error, contents) {
          if (error) {
            callback(error, this);
            return;
          }

          try {
            contents = JSON.parse(contents);
          } catch (err) {
            callback("Error parsing JSON. " + err, this);
            return;
          }

          updateContentsWithoutSaving(contents);
          log("loaded " + this.cfg.filename);
          if (typeof callback === "function") {
            callback(null, this);
          }
          return;
        }.bind(this)
      );
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
