const assert = require("assert");
const fs = require("fs");
const path = require("path");
const Filejson = require("../app.js");

describe("Filejson", function () {
  const testDir = path.join(__dirname, "test-files");

  // Setup: Create test directory
  before(function () {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  // Cleanup: Remove test files after each test
  afterEach(function () {
    if (fs.existsSync(testDir)) {
      const files = fs.readdirSync(testDir);
      files.forEach((file) => {
        const filePath = path.join(testDir, file);
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          // Ignore errors, file might already be deleted
        }
      });
    }
  });

  // Cleanup: Remove test directory after all tests
  after(function () {
    if (fs.existsSync(testDir)) {
      // Make sure all files are deleted first
      try {
        const files = fs.readdirSync(testDir);
        files.forEach((file) => {
          const filePath = path.join(testDir, file);
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            // Ignore
          }
        });
        fs.rmdirSync(testDir);
      } catch (err) {
        // If cleanup fails, just log it
        console.warn("Could not clean up test directory:", err.message);
      }
    }
  });

  describe("Constructor", function () {
    it("should create a new Filejson instance with default config", function () {
      const file = new Filejson();
      assert.strictEqual(file.cfg.filename, "");
      assert.strictEqual(file.cfg.space, 2);
      assert.strictEqual(file.cfg.verbose, false);
    });

    it("should create a new Filejson instance with custom config", function () {
      const file = new Filejson({
        filename: "test.json",
        space: 4,
        verbose: true,
      });
      assert.strictEqual(file.cfg.filename, "test.json");
      assert.strictEqual(file.cfg.space, 4);
      assert.strictEqual(file.cfg.verbose, true);
    });
  });

  describe("load() - Callback API", function () {
    it("should load an existing JSON file", function (done) {
      const testFile = path.join(testDir, "load-test.json");
      const testData = { msg: "Hello World", count: 42 };
      fs.writeFileSync(testFile, JSON.stringify(testData));

      const file = new Filejson();
      file.load(testFile, function (error, instance) {
        assert.strictEqual(error, null);
        assert.deepStrictEqual(instance.contents, testData);
        done();
      });
    });

    it("should return error for non-existent file", function (done) {
      const testFile = path.join(testDir, "non-existent.json");
      const file = new Filejson();

      file.load(testFile, function (error, _instance) {
        assert.notStrictEqual(error, null);
        assert.strictEqual(error.code, "ENOENT");
        done();
      });
    });

    it("should overwrite file with initial data", function (done) {
      const testFile = path.join(testDir, "overwrite-test.json");
      const initialData = { original: "data" };
      const newData = { new: "data", updated: true };

      fs.writeFileSync(testFile, JSON.stringify(initialData));

      const file = new Filejson();
      file.load(testFile, newData, function (error, instance) {
        assert.strictEqual(error, null);
        assert.deepStrictEqual(instance.contents, newData);

        // Verify file was actually overwritten
        const fileContents = JSON.parse(fs.readFileSync(testFile, "utf-8"));
        assert.deepStrictEqual(fileContents, newData);
        done();
      });
    });

    it("should return error for invalid JSON", function (done) {
      const testFile = path.join(testDir, "invalid.json");
      fs.writeFileSync(testFile, "{ invalid json }");

      const file = new Filejson();
      file.load(testFile, function (error, _instance) {
        assert.notStrictEqual(error, null);
        assert.ok(error.includes("Error parsing JSON"));
        done();
      });
    });
  });

  describe("load() - Promise API", function () {
    it("should load an existing JSON file with Promise", async function () {
      const testFile = path.join(testDir, "promise-load-test.json");
      const testData = { msg: "Promise Test", count: 99 };
      fs.writeFileSync(testFile, JSON.stringify(testData));

      const file = new Filejson();
      const instance = await file.load(testFile);

      assert.deepStrictEqual(instance.contents, testData);
    });

    it("should reject Promise for non-existent file", async function () {
      const testFile = path.join(testDir, "non-existent-promise.json");
      const file = new Filejson();

      try {
        await file.load(testFile);
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.strictEqual(error.code, "ENOENT");
      }
    });

    it("should overwrite file with initial data using Promise", async function () {
      const testFile = path.join(testDir, "promise-overwrite.json");
      const initialData = { original: "data" };
      const newData = { new: "data", promise: true };

      fs.writeFileSync(testFile, JSON.stringify(initialData));

      const file = new Filejson();
      const instance = await file.load(testFile, newData);

      // Verify the instance has the new data
      assert.deepStrictEqual(instance.contents, newData);

      // Manually save to ensure the save is complete before checking the file
      await instance.save();

      // Verify file was actually overwritten
      const fileContents = JSON.parse(fs.readFileSync(testFile, "utf-8"));
      assert.deepStrictEqual(fileContents, newData);
    });
  });

  describe("Auto-save functionality", function () {
    it("should automatically save when modifying a simple property", function (done) {
      const testFile = path.join(testDir, "autosave-simple.json");
      const initialData = { count: 0 };
      fs.writeFileSync(testFile, JSON.stringify(initialData));

      const file = new Filejson({ saveDelay: 0 });
      file.load(testFile, function (error, instance) {
        assert.strictEqual(error, null);

        instance.contents.count = 42;

        // Wait a bit for async save to complete
        setTimeout(function () {
          const savedData = JSON.parse(fs.readFileSync(testFile, "utf-8"));
          assert.strictEqual(savedData.count, 42);
          done();
        }, 100);
      });
    });

    it("should automatically save when adding a new property", function (done) {
      const testFile = path.join(testDir, "autosave-add.json");
      const initialData = { existing: "value" };
      fs.writeFileSync(testFile, JSON.stringify(initialData));

      const file = new Filejson({ saveDelay: 0 });
      file.load(testFile, function (error, instance) {
        assert.strictEqual(error, null);

        instance.contents.newProp = "new value";

        setTimeout(function () {
          const savedData = JSON.parse(fs.readFileSync(testFile, "utf-8"));
          assert.strictEqual(savedData.newProp, "new value");
          assert.strictEqual(savedData.existing, "value");
          done();
        }, 100);
      });
    });

    it("should automatically save when deleting a property", function (done) {
      const testFile = path.join(testDir, "autosave-delete.json");
      const initialData = { keep: "this", remove: "this" };
      fs.writeFileSync(testFile, JSON.stringify(initialData));

      const file = new Filejson({ saveDelay: 0 });
      file.load(testFile, function (error, instance) {
        assert.strictEqual(error, null);

        delete instance.contents.remove;

        setTimeout(function () {
          const savedData = JSON.parse(fs.readFileSync(testFile, "utf-8"));
          assert.strictEqual(savedData.keep, "this");
          assert.strictEqual(savedData.remove, undefined);
          done();
        }, 100);
      });
    });

    it("should automatically save nested object changes", function (done) {
      const testFile = path.join(testDir, "autosave-nested.json");
      const initialData = {
        user: {
          name: "John",
          settings: { theme: "dark" },
        },
      };
      fs.writeFileSync(testFile, JSON.stringify(initialData));

      const file = new Filejson({ saveDelay: 0 });
      file.load(testFile, function (error, instance) {
        assert.strictEqual(error, null);

        instance.contents.user.name = "Jane";
        instance.contents.user.settings.theme = "light";

        setTimeout(function () {
          const savedData = JSON.parse(fs.readFileSync(testFile, "utf-8"));
          assert.strictEqual(savedData.user.name, "Jane");
          assert.strictEqual(savedData.user.settings.theme, "light");
          done();
        }, 100);
      });
    });

    it("should automatically save array modifications", function (done) {
      const testFile = path.join(testDir, "autosave-array.json");
      const initialData = { items: [1, 2, 3] };
      fs.writeFileSync(testFile, JSON.stringify(initialData));

      const file = new Filejson({ saveDelay: 0 });
      file.load(testFile, function (error, instance) {
        assert.strictEqual(error, null);

        instance.contents.items.push(4);

        setTimeout(function () {
          const savedData = JSON.parse(fs.readFileSync(testFile, "utf-8"));
          assert.deepStrictEqual(savedData.items, [1, 2, 3, 4]);
          done();
        }, 100);
      });
    });
  });

  describe("save() - Manual save with callback", function () {
    it("should manually save with callback", function (done) {
      const testFile = path.join(testDir, "manual-save.json");
      const initialData = { value: "initial" };
      fs.writeFileSync(testFile, JSON.stringify(initialData));

      const file = new Filejson();
      file.load(testFile, function (error, instance) {
        assert.strictEqual(error, null);

        instance.paused = true;
        instance.contents.value = "updated";
        instance.paused = false;

        instance.save(function (saveError, _savedInstance) {
          assert.strictEqual(saveError, null);

          const savedData = JSON.parse(fs.readFileSync(testFile, "utf-8"));
          assert.strictEqual(savedData.value, "updated");
          done();
        });
      });
    });
  });

  describe("save() - Manual save with Promise", function () {
    it("should manually save with Promise", async function () {
      const testFile = path.join(testDir, "manual-save-promise.json");
      const initialData = { value: "initial" };
      fs.writeFileSync(testFile, JSON.stringify(initialData));

      const file = new Filejson();
      await file.load(testFile);

      file.paused = true;
      file.contents.value = "updated by promise";
      file.paused = false;

      await file.save();

      const savedData = JSON.parse(fs.readFileSync(testFile, "utf-8"));
      assert.strictEqual(savedData.value, "updated by promise");
    });
  });

  describe("paused property", function () {
    it("should not auto-save when paused", function (done) {
      const testFile = path.join(testDir, "paused-test.json");
      const initialData = { count: 0 };
      fs.writeFileSync(testFile, JSON.stringify(initialData));

      const file = new Filejson();
      file.load(testFile, function (error, instance) {
        assert.strictEqual(error, null);

        instance.paused = true;
        instance.contents.count = 100;

        setTimeout(function () {
          // Should still be 0 because auto-save was paused
          const savedData = JSON.parse(fs.readFileSync(testFile, "utf-8"));
          assert.strictEqual(savedData.count, 0);

          // Now unpause and manually save
          instance.paused = false;
          instance.save(function () {
            const finalData = JSON.parse(fs.readFileSync(testFile, "utf-8"));
            assert.strictEqual(finalData.count, 100);
            done();
          });
        }, 100);
      });
    });

    it("should allow multiple changes while paused then save once", function (done) {
      const testFile = path.join(testDir, "paused-multiple.json");
      const initialData = { a: 1, b: 2, c: 3 };
      fs.writeFileSync(testFile, JSON.stringify(initialData));

      const file = new Filejson();
      file.load(testFile, function (error, instance) {
        assert.strictEqual(error, null);

        instance.paused = true;
        instance.contents.a = 10;
        instance.contents.b = 20;
        instance.contents.c = 30;
        instance.paused = false;

        instance.save(function () {
          const savedData = JSON.parse(fs.readFileSync(testFile, "utf-8"));
          assert.deepStrictEqual(savedData, { a: 10, b: 20, c: 30 });
          done();
        });
      });
    });
  });

  describe("JSON formatting", function () {
    it("should respect custom space configuration", function (done) {
      const testFile = path.join(testDir, "format-test.json");
      const initialData = { test: "data" };
      fs.writeFileSync(testFile, JSON.stringify(initialData));

      const file = new Filejson({ space: 4, saveDelay: 0 });
      file.load(testFile, function (error, instance) {
        assert.strictEqual(error, null);

        instance.contents.nested = { key: "value" };

        setTimeout(function () {
          const fileContent = fs.readFileSync(testFile, "utf-8");
          // Should have 4-space indentation
          assert.ok(fileContent.includes('    "nested":'));
          done();
        }, 300);
      });
    });
  });

  describe("Data type validation", function () {
    it("should handle string values", function (done) {
      const testFile = path.join(testDir, "type-string.json");
      fs.writeFileSync(testFile, JSON.stringify({ value: "" }));

      const file = new Filejson({ saveDelay: 0 });
      file.load(testFile, function (error, instance) {
        instance.contents.value = "test string";

        setTimeout(function () {
          const savedData = JSON.parse(fs.readFileSync(testFile, "utf-8"));
          assert.strictEqual(savedData.value, "test string");
          done();
        }, 100);
      });
    });

    it("should handle number values", function (done) {
      const testFile = path.join(testDir, "type-number.json");
      fs.writeFileSync(testFile, JSON.stringify({ value: 0 }));

      const file = new Filejson({ saveDelay: 0 });
      file.load(testFile, function (error, instance) {
        instance.contents.value = 42.5;

        setTimeout(function () {
          const savedData = JSON.parse(fs.readFileSync(testFile, "utf-8"));
          assert.strictEqual(savedData.value, 42.5);
          done();
        }, 300);
      });
    });

    it("should handle boolean values", function (done) {
      const testFile = path.join(testDir, "type-boolean.json");
      fs.writeFileSync(testFile, JSON.stringify({ value: false }));

      const file = new Filejson({ saveDelay: 0 });
      file.load(testFile, function (error, instance) {
        instance.contents.value = true;

        setTimeout(function () {
          const savedData = JSON.parse(fs.readFileSync(testFile, "utf-8"));
          assert.strictEqual(savedData.value, true);
          done();
        }, 100);
      });
    });

    it("should handle null values", function (done) {
      const testFile = path.join(testDir, "type-null.json");
      fs.writeFileSync(testFile, JSON.stringify({ value: "not null" }));

      const file = new Filejson({ saveDelay: 0 });
      file.load(testFile, function (error, instance) {
        instance.contents.value = null;

        setTimeout(function () {
          const savedData = JSON.parse(fs.readFileSync(testFile, "utf-8"));
          assert.strictEqual(savedData.value, null);
          done();
        }, 100);
      });
    });

    it("should handle array values", function (done) {
      const testFile = path.join(testDir, "type-array.json");
      fs.writeFileSync(testFile, JSON.stringify({ value: [] }));

      const file = new Filejson({ saveDelay: 0 });
      file.load(testFile, function (error, instance) {
        instance.contents.value = [1, "two", { three: 3 }, null];

        setTimeout(function () {
          const savedData = JSON.parse(fs.readFileSync(testFile, "utf-8"));
          assert.deepStrictEqual(savedData.value, [1, "two", { three: 3 }, null]);
          done();
        }, 300);
      });
    });

    it("should handle deeply nested objects", function (done) {
      const testFile = path.join(testDir, "type-deep-nested.json");
      const deepData = {
        level1: {
          level2: {
            level3: {
              level4: {
                value: "deep",
              },
            },
          },
        },
      };
      fs.writeFileSync(testFile, JSON.stringify({ root: {} }));

      const file = new Filejson({ saveDelay: 0 });
      file.load(testFile, function (error, instance) {
        instance.contents.root = deepData;

        setTimeout(function () {
          const savedData = JSON.parse(fs.readFileSync(testFile, "utf-8"));
          assert.strictEqual(savedData.root.level1.level2.level3.level4.value, "deep");
          done();
        }, 100);
      });
    });
  });

  describe("Multiple instances", function () {
    it("should handle multiple independent file instances", function (done) {
      const testFile1 = path.join(testDir, "multi-1.json");
      const testFile2 = path.join(testDir, "multi-2.json");

      fs.writeFileSync(testFile1, JSON.stringify({ file: 1 }));
      fs.writeFileSync(testFile2, JSON.stringify({ file: 2 }));

      const file1 = new Filejson({ saveDelay: 0 });
      const file2 = new Filejson({ saveDelay: 0 });

      file1.load(testFile1, function (error1, instance1) {
        assert.strictEqual(error1, null);

        file2.load(testFile2, function (error2, instance2) {
          assert.strictEqual(error2, null);

          instance1.contents.modified = "first";
          instance2.contents.modified = "second";

          setTimeout(function () {
            const data1 = JSON.parse(fs.readFileSync(testFile1, "utf-8"));
            const data2 = JSON.parse(fs.readFileSync(testFile2, "utf-8"));

            assert.strictEqual(data1.file, 1);
            assert.strictEqual(data1.modified, "first");
            assert.strictEqual(data2.file, 2);
            assert.strictEqual(data2.modified, "second");
            done();
          }, 100);
        });
      });
    });
  });

  describe("Debounce/Save Delay", function () {
    it("should debounce rapid changes with saveDelay", function (done) {
      const testFile = path.join(testDir, "debounce-test.json");
      fs.writeFileSync(testFile, JSON.stringify({ count: 0 }));

      const file = new Filejson({ saveDelay: 100 });
      file.load(testFile, function (error, instance) {
        assert.strictEqual(error, null);

        // Make rapid changes
        instance.contents.count = 1;
        instance.contents.count = 2;
        instance.contents.count = 3;
        instance.contents.count = 4;
        instance.contents.count = 5;

        // Immediately after changes, file should still have old value
        setTimeout(function () {
          const immediateData = JSON.parse(fs.readFileSync(testFile, "utf-8"));
          assert.strictEqual(immediateData.count, 0, "File should not be saved yet");

          // After debounce delay, file should have final value
          setTimeout(function () {
            const finalData = JSON.parse(fs.readFileSync(testFile, "utf-8"));
            assert.strictEqual(finalData.count, 5, "File should have final value");
            done();
          }, 150);
        }, 10);
      });
    });

    it("should save immediately with saveDelay: 0 (default)", function (done) {
      const testFile = path.join(testDir, "immediate-save-test.json");
      fs.writeFileSync(testFile, JSON.stringify({ value: "initial" }));

      const file = new Filejson({ saveDelay: 0 });
      file.load(testFile, function (error, instance) {
        assert.strictEqual(error, null);

        instance.contents.value = "updated";

        // With saveDelay 0, should save almost immediately
        setTimeout(function () {
          const savedData = JSON.parse(fs.readFileSync(testFile, "utf-8"));
          assert.strictEqual(savedData.value, "updated");
          done();
        }, 50);
      });
    });

    it("should only save once after multiple rapid changes", function (done) {
      const testFile = path.join(testDir, "debounce-count-test.json");
      fs.writeFileSync(testFile, JSON.stringify({ value: 0 }));

      let saveCount = 0;
      const originalWriteFile = fs.writeFile;
      const originalRename = fs.rename;

      // Mock fs.writeFile and fs.rename to count saves
      // With atomic writes, we count renames (the final atomic operation)
      fs.writeFile = function (filename, data, callback) {
        originalWriteFile.call(fs, filename, data, callback);
      };

      fs.rename = function (tmpFile, targetFile, callback) {
        if (targetFile === testFile) {
          saveCount++;
        }
        originalRename.call(fs, tmpFile, targetFile, callback);
      };

      const file = new Filejson({ saveDelay: 100 });
      file.load(testFile, function (error, instance) {
        assert.strictEqual(error, null);

        // Make 10 rapid changes
        for (let i = 1; i <= 10; i++) {
          instance.contents.value = i;
        }

        // Wait for debounce to complete
        setTimeout(function () {
          // Restore originals
          fs.writeFile = originalWriteFile;
          fs.rename = originalRename;

          // Should only have saved once due to debouncing
          assert.strictEqual(saveCount, 1, "Should only save once");

          const finalData = JSON.parse(fs.readFileSync(testFile, "utf-8"));
          assert.strictEqual(finalData.value, 10, "Should have final value");
          done();
        }, 400);
      });
    });

    it("should work with custom saveDelay of 200ms", function (done) {
      const testFile = path.join(testDir, "custom-delay-test.json");
      fs.writeFileSync(testFile, JSON.stringify({ status: "pending" }));

      const file = new Filejson({ saveDelay: 200 });
      file.load(testFile, function (error, instance) {
        assert.strictEqual(error, null);

        instance.contents.status = "updated";

        // After 100ms, should not be saved yet
        setTimeout(function () {
          const earlyData = JSON.parse(fs.readFileSync(testFile, "utf-8"));
          assert.strictEqual(earlyData.status, "pending");

          // After 500ms total, should be saved
          setTimeout(function () {
            const lateData = JSON.parse(fs.readFileSync(testFile, "utf-8"));
            assert.strictEqual(lateData.status, "updated");
            done();
          }, 400);
        }, 100);
      });
    });

    it("should debounce with Promise API", async function () {
      const testFile = path.join(testDir, "promise-debounce-test.json");
      fs.writeFileSync(testFile, JSON.stringify({ counter: 0 }));

      const file = new Filejson({ saveDelay: 100 });
      await file.load(testFile);

      // Make rapid changes
      file.contents.counter = 1;
      file.contents.counter = 2;
      file.contents.counter = 3;

      // Check immediately - should not be saved yet
      await new Promise((resolve) => setTimeout(resolve, 50));
      let data = JSON.parse(fs.readFileSync(testFile, "utf-8"));
      assert.strictEqual(data.counter, 0);

      // Wait for debounce to complete
      await new Promise((resolve) => setTimeout(resolve, 200));
      data = JSON.parse(fs.readFileSync(testFile, "utf-8"));
      assert.strictEqual(data.counter, 3);
    });

    it("should allow manual save to bypass debounce", async function () {
      const testFile = path.join(testDir, "manual-bypass-test.json");
      fs.writeFileSync(testFile, JSON.stringify({ value: 0 }));

      const file = new Filejson({ saveDelay: 500 });
      await file.load(testFile);

      file.contents.value = 100;

      // Immediately call manual save (should bypass debounce)
      await file.save();

      // Check immediately - should be saved despite long delay
      const data = JSON.parse(fs.readFileSync(testFile, "utf-8"));
      assert.strictEqual(data.value, 100);
    });
  });

  describe("Atomic Writes", function () {
    it("should use atomic writes by default (write to temp then rename)", function (done) {
      const testFile = path.join(testDir, "atomic-write-test.json");
      fs.writeFileSync(testFile, JSON.stringify({ value: "initial" }));

      const originalRename = fs.rename;
      let renameCalled = false;
      let tempFileUsed = false;

      // Mock fs.rename to verify atomic write behavior
      fs.rename = function (source, target, callback) {
        if (target === testFile && source.includes(".tmp")) {
          renameCalled = true;
          tempFileUsed = true;
        }
        originalRename.call(fs, source, target, callback);
      };

      const file = new Filejson({ saveDelay: 0 });
      file.load(testFile, function (error, instance) {
        assert.strictEqual(error, null);

        instance.contents.value = "updated";

        setTimeout(function () {
          fs.rename = originalRename;

          assert.strictEqual(renameCalled, true, "fs.rename should be called");
          assert.strictEqual(tempFileUsed, true, "Should use temp file");

          const data = JSON.parse(fs.readFileSync(testFile, "utf-8"));
          assert.strictEqual(data.value, "updated");
          done();
        }, 300);
      });
    });

    it("should allow disabling atomic writes with atomicWrites: false", function (done) {
      const testFile = path.join(testDir, "no-atomic-write-test.json");
      fs.writeFileSync(testFile, JSON.stringify({ value: "initial" }));

      const originalWriteFile = fs.writeFile;
      const originalRename = fs.rename;
      let directWriteCalled = false;
      let renameCalled = false;

      fs.writeFile = function (filename, data, callback) {
        if (filename === testFile) {
          directWriteCalled = true;
        }
        originalWriteFile.call(fs, filename, data, callback);
      };

      fs.rename = function (source, target, callback) {
        if (target === testFile) {
          renameCalled = true;
        }
        originalRename.call(fs, source, target, callback);
      };

      const file = new Filejson({ saveDelay: 0, atomicWrites: false });
      file.load(testFile, function (error, instance) {
        assert.strictEqual(error, null);

        instance.contents.value = "updated";

        setTimeout(function () {
          fs.writeFile = originalWriteFile;
          fs.rename = originalRename;

          assert.strictEqual(directWriteCalled, true, "Should write directly to file");
          assert.strictEqual(renameCalled, false, "Should not use rename");

          const data = JSON.parse(fs.readFileSync(testFile, "utf-8"));
          assert.strictEqual(data.value, "updated");
          done();
        }, 100);
      });
    });

    it("should clean up temp file on write error", function (done) {
      const testFile = path.join(testDir, "atomic-error-test.json");
      fs.writeFileSync(testFile, JSON.stringify({ value: "initial" }));

      const originalWriteFile = fs.writeFile;
      let tempFileCreated = null;

      // Mock fs.writeFile to fail on temp file write
      fs.writeFile = function (filename, data, callback) {
        if (filename.includes(".tmp")) {
          tempFileCreated = filename;
          // Simulate write error
          callback(new Error("Simulated write error"));
        } else {
          originalWriteFile.call(fs, filename, data, callback);
        }
      };

      const file = new Filejson({ saveDelay: 0 });
      file.load(testFile, function (error, instance) {
        assert.strictEqual(error, null);

        instance.contents.value = "updated";

        setTimeout(function () {
          fs.writeFile = originalWriteFile;

          // Temp file should have been cleaned up
          if (tempFileCreated) {
            assert.strictEqual(fs.existsSync(tempFileCreated), false, "Temp file should be cleaned up");
          }

          // Original file should be unchanged
          const data = JSON.parse(fs.readFileSync(testFile, "utf-8"));
          assert.strictEqual(data.value, "initial", "Original file should be unchanged on error");
          done();
        }, 100);
      });
    });
  });

  describe("Synchronous Save (saveSync)", function () {
    it("should synchronously save with atomic writes", function () {
      const testFile = path.join(testDir, "sync-atomic-test.json");
      fs.writeFileSync(testFile, JSON.stringify({ value: "initial" }));

      const file = new Filejson({ atomicWrites: true });
      file.load(testFile, function (error, instance) {
        assert.strictEqual(error, null);

        instance.contents.value = "updated synchronously";
        instance.saveSync();

        // Verify immediately - should be written
        const data = JSON.parse(fs.readFileSync(testFile, "utf-8"));
        assert.strictEqual(data.value, "updated synchronously");
      });
    });

    it("should synchronously save without atomic writes", function () {
      const testFile = path.join(testDir, "sync-no-atomic-test.json");
      fs.writeFileSync(testFile, JSON.stringify({ value: "initial" }));

      const file = new Filejson({ atomicWrites: false });
      file.load(testFile, function (error, instance) {
        assert.strictEqual(error, null);

        instance.contents.value = "updated directly";
        instance.saveSync();

        // Verify immediately
        const data = JSON.parse(fs.readFileSync(testFile, "utf-8"));
        assert.strictEqual(data.value, "updated directly");
      });
    });

    it("should clear pending debounced saves when saveSync is called", function (done) {
      const testFile = path.join(testDir, "sync-debounce-test.json");
      fs.writeFileSync(testFile, JSON.stringify({ counter: 0 }));

      const file = new Filejson({ saveDelay: 200 });
      file.load(testFile, function (error, instance) {
        assert.strictEqual(error, null);

        // Make changes that would trigger debounced save
        instance.contents.counter = 1;
        instance.contents.counter = 2;
        instance.contents.counter = 3;

        // Immediately call saveSync (should clear debounce timer)
        instance.saveSync();

        // Verify sync write happened
        let data = JSON.parse(fs.readFileSync(testFile, "utf-8"));
        assert.strictEqual(data.counter, 3, "Should have sync saved immediately");

        // Wait longer than debounce delay to ensure no extra save happens
        setTimeout(function () {
          data = JSON.parse(fs.readFileSync(testFile, "utf-8"));
          assert.strictEqual(data.counter, 3, "Should still be 3 (no extra debounced save)");
          done();
        }, 300);
      });
    });

    it("should throw error if no filename is set", function (done) {
      const testFile = path.join(testDir, "temp-file-for-error-test.json");
      fs.writeFileSync(testFile, JSON.stringify({ value: "test" }));

      const file = new Filejson();
      file.load(testFile, function (error, instance) {
        assert.strictEqual(error, null);

        // Clear the filename to test error
        instance.cfg.filename = "";

        assert.throws(() => instance.saveSync(), /You must specify a filename/, "Should throw error when filename not set");

        done();
      });
    });

    it("should clean up temp file on atomic write error", function () {
      const testFile = "/invalid/path/that/does/not/exist.json";
      const file = new Filejson({ atomicWrites: true });

      file.cfg.filename = testFile;
      file.contents = { test: "data" };

      assert.throws(() => file.saveSync(), "Should throw error on write failure");

      // Verify no temp files left behind in current directory
      const files = fs.readdirSync(testDir);
      const tempFiles = files.filter((f) => f.includes(".tmp"));
      assert.strictEqual(tempFiles.length, 0, "Should not leave temp files behind");
    });

    it("should return the instance for method chaining", function (done) {
      const testFile = path.join(testDir, "sync-chain-test.json");
      fs.writeFileSync(testFile, JSON.stringify({ value: "test" }));

      const file = new Filejson({ saveDelay: 0 });
      file.load(testFile, function (error, instance) {
        assert.strictEqual(error, null);

        // Pause to prevent auto-save interference
        instance.paused = true;
        instance.contents.value = "chained";
        const result = instance.saveSync();

        assert.strictEqual(result, instance, "Should return the instance");

        const data = JSON.parse(fs.readFileSync(testFile, "utf-8"));
        assert.strictEqual(data.value, "chained");
        done();
      });
    });
  });
});
