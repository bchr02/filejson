// This example demonstrates backward compatibility
// All existing callback-based code continues to work exactly as before

const Filejson = require("./app.js");

console.log("=== Testing Backward Compatibility ===\n");

// Example 1: Original callback style still works
const file1 = new Filejson();

file1.load("callback-test.json", { original: "style", count: 0 }, function(error, file) {
    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log("1. Loaded with callback:", file.contents);

    file.contents.count++;
    file.contents.updated = true;

    console.log("2. Modified:", file.contents);

    // Manual save with callback also still works
    file.save(function(saveError) {
        if (saveError) {
            console.error("Save error:", saveError);
            return;
        }
        console.log("3. Saved successfully with callback!");

        // Example 2: Without overwrite parameter
        const file2 = new Filejson();
        file2.load("callback-test.json", function(error, file) {
            if (error) {
                console.error("Error:", error);
                return;
            }
            console.log("\n4. Re-loaded with callback (no overwrite):", file.contents);

            // Delete a property
            delete file.contents.updated;

            console.log("5. After delete:", file.contents);
            console.log("\n=== All backward compatibility tests passed! ===");
        });
    });
});
