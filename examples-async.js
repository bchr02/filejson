// Example demonstrating async/await usage with filejson

const Filejson = require("./app.js");

// Example 1: Basic async/await usage
async function basicExample() {
    console.log("=== Example 1: Basic async/await usage ===");

    const file = new Filejson();

    try {
    // Load a JSON file
        await file.load("example1.json", { counter: 0, name: "Test" });

        console.log("Initial contents:", file.contents);

        // Modify the contents - automatically saves
        file.contents.counter++;
        file.contents.timestamp = new Date().toISOString();

        console.log("Updated contents:", file.contents);

        // Manual save (if needed)
        await file.save();
        console.log("Manually saved!");
    } catch (error) {
        console.error("Error:", error);
    }
}

// Example 2: Multiple file operations
async function multipleFilesExample() {
    console.log("\n=== Example 2: Multiple file operations ===");

    const file1 = new Filejson();
    const file2 = new Filejson();

    try {
    // Load multiple files in parallel
        const [f1, f2] = await Promise.all([file1.load("example2a.json", { type: "A", value: 100 }), file2.load("example2b.json", { type: "B", value: 200 })]);

        console.log("File 1:", f1.contents);
        console.log("File 2:", f2.contents);

        // Modify both
        f1.contents.value += 10;
        f2.contents.value += 20;

        console.log("After updates:");
        console.log("File 1:", f1.contents);
        console.log("File 2:", f2.contents);
    } catch (error) {
        console.error("Error:", error);
    }
}

// Example 3: Error handling
async function errorHandlingExample() {
    console.log("\n=== Example 3: Error handling ===");

    const file = new Filejson();

    try {
    // Try to load a non-existent file
        await file.load("nonexistent.json");
    } catch (error) {
        console.log("Caught expected error:", error.code || error.message);
    }

    // Create the file instead
    try {
        await file.load("example3.json", { created: true });
        console.log("File created successfully:", file.contents);
    } catch (error) {
        console.error("Unexpected error:", error);
    }
}

// Example 4: Working with nested objects
async function nestedObjectsExample() {
    console.log("\n=== Example 4: Nested objects ===");

    const file = new Filejson();

    try {
        await file.load("example4.json", {
            user: {
                name: "John Doe",
                preferences: {
                    theme: "dark",
                    notifications: true
                }
            },
            stats: {
                logins: 0,
                lastLogin: null
            }
        });

        console.log("Initial:", JSON.stringify(file.contents, null, 2));

        // Modify nested properties - all automatically saved!
        file.contents.user.preferences.theme = "light";
        file.contents.stats.logins++;
        file.contents.stats.lastLogin = new Date().toISOString();

        console.log("Updated:", JSON.stringify(file.contents, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}

// Run all examples
async function runAllExamples() {
    await basicExample();
    await multipleFilesExample();
    await errorHandlingExample();
    await nestedObjectsExample();

    console.log("\n=== All examples completed! ===");
}

// Check if running directly
if (require.main === module) {
    runAllExamples().catch(console.error);
}

module.exports = { basicExample, multipleFilesExample, errorHandlingExample, nestedObjectsExample };
