/**
 * Exit Handler Examples with saveSync()
 *
 * This file demonstrates how to use saveSync() to ensure data is saved
 * before the process exits, even during crashes or interruptions.
 */

const Filejson = require("./app.js");
const fs = require("fs");
const path = require("path");

// Create a test directory
const testDir = path.join(__dirname, "examples-exit-handler");
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

const testFile = path.join(testDir, "app-state.json");

console.log("=".repeat(60));
console.log("Exit Handler Examples with saveSync()");
console.log("=".repeat(60));

/**
 * Example 1: Basic Exit Handler
 *
 * The most common use case - save data when user presses Ctrl+C
 */
async function example1() {
  console.log("\n📝 Example 1: Basic SIGINT Handler (Ctrl+C)");
  console.log("-".repeat(60));

  const file = new Filejson();
  await file.load(testFile, {
    appName: "My App",
    sessions: 0,
    lastRun: null,
  });

  console.log("✅ App state loaded");

  // Register exit handler
  const exitHandler = () => {
    console.log("\n🛑 Caught interrupt signal (Ctrl+C)");
    console.log("💾 Saving application state...");

    try {
      file.saveSync(); // Synchronous save
      console.log("✅ State saved successfully");
    } catch (error) {
      console.error("❌ Failed to save:", error.message);
    }

    console.log("👋 Goodbye!\n");
    process.exit(0);
  };

  process.on("SIGINT", exitHandler);

  console.log("\n✍️  Simulating application activity...");
  file.contents.sessions++;
  file.contents.lastRun = new Date().toISOString();

  console.log(`   Sessions: ${file.contents.sessions}`);
  console.log(`   Last run: ${file.contents.lastRun}`);

  console.log("\n💡 Press Ctrl+C to trigger exit handler and see saveSync() in action");
  console.log("   Or wait 5 seconds to continue to next example...\n");

  // Wait 5 seconds then cleanup handler
  await new Promise((resolve) => setTimeout(resolve, 5000));
  process.removeListener("SIGINT", exitHandler);
  console.log("✅ Exit handler removed (continuing to next example)");
}

/**
 * Example 2: Multiple Exit Signals
 *
 * Handle different types of termination signals
 */
async function example2() {
  console.log("\n📝 Example 2: Handling Multiple Exit Signals");
  console.log("-".repeat(60));

  const file = new Filejson();
  await file.load(testFile, {
    data: "important",
    counter: 0,
  });

  console.log("✅ File loaded with multiple exit handlers");

  // Shared exit handler function
  const gracefulShutdown = (signal) => {
    console.log(`\n🛑 Received ${signal} signal`);
    console.log("💾 Performing graceful shutdown...");

    try {
      // Update shutdown info
      file.contents.lastShutdown = {
        signal: signal,
        timestamp: new Date().toISOString(),
      };

      file.saveSync();
      console.log("✅ Data saved successfully");
      process.exit(0);
    } catch (error) {
      console.error("❌ Save failed:", error.message);
      process.exit(1);
    }
  };

  // Register multiple signals
  const signals = ["SIGINT", "SIGTERM", "SIGHUP"];
  signals.forEach((signal) => {
    process.on(signal, () => gracefulShutdown(signal));
  });

  console.log("   Registered handlers for:", signals.join(", "));

  // Make some changes
  file.contents.counter++;
  console.log(`   Counter updated: ${file.contents.counter}`);

  // Cleanup for next example
  await new Promise((resolve) => setTimeout(resolve, 1000));
  signals.forEach((signal) => process.removeAllListeners(signal));
  console.log("✅ Exit handlers removed");
}

/**
 * Example 3: saveSync vs save comparison
 *
 * Demonstrates why saveSync is necessary for exit handlers
 */
async function example3() {
  console.log("\n📝 Example 3: Why saveSync() Is Necessary");
  console.log("-".repeat(60));

  console.log("\n⚠️  Problem with async save() in exit handlers:");
  console.log("   ```javascript");
  console.log("   process.on('SIGINT', async () => {");
  console.log("       await file.save();  // ❌ May not complete!");
  console.log("       process.exit(0);");
  console.log("   });");
  console.log("   ```");
  console.log("   The process exits before async save() completes!");

  console.log("\n✅ Solution with saveSync():");
  console.log("   ```javascript");
  console.log("   process.on('SIGINT', () => {");
  console.log("       file.saveSync();  // ✅ Blocks until saved");
  console.log("       process.exit(0);");
  console.log("   });");
  console.log("   ```");
  console.log("   Synchronous operation completes before exit!");

  console.log("\n📊 Comparison:");
  console.log("   ┌────────────────────┬─────────┬──────────────┐");
  console.log("   │ Method             │ Async   │ Exit Handler │");
  console.log("   ├────────────────────┼─────────┼──────────────┤");
  console.log("   │ save()             │ Yes     │ ❌ Unreliable│");
  console.log("   │ saveSync()         │ No      │ ✅ Reliable  │");
  console.log("   └────────────────────┴─────────┴──────────────┘");
}

/**
 * Example 4: Production Pattern
 *
 * Complete production-ready exit handler with error handling
 */
async function example4() {
  console.log("\n📝 Example 4: Production-Ready Exit Handler");
  console.log("-".repeat(60));

  const file = new Filejson({
    atomicWrites: true, // Crash-safe writes
    saveDelay: 100, // Debounce for performance
  });

  await file.load(testFile, {
    environment: "production",
    stats: {
      requests: 0,
      errors: 0,
      uptime: 0,
    },
    lastSave: null,
  });

  console.log("✅ Production app initialized");

  // Track if we're already shutting down
  let isShuttingDown = false;

  const shutdown = (signal, exitCode = 0) => {
    if (isShuttingDown) {
      console.log("⚠️  Already shutting down...");
      return;
    }
    isShuttingDown = true;

    console.log(`\n🛑 Shutdown initiated (${signal})`);

    try {
      // Update final stats
      file.contents.stats.uptime = process.uptime();
      file.contents.lastSave = new Date().toISOString();

      console.log("💾 Saving final state...");
      const startTime = Date.now();

      file.saveSync();

      const duration = Date.now() - startTime;
      console.log(`✅ State saved in ${duration}ms`);
      console.log(`   Requests: ${file.contents.stats.requests}`);
      console.log(`   Errors: ${file.contents.stats.errors}`);
      console.log(`   Uptime: ${file.contents.stats.uptime.toFixed(2)}s`);

      console.log("👋 Shutdown complete\n");
      process.exit(exitCode);
    } catch (error) {
      console.error("❌ CRITICAL: Failed to save state on exit");
      console.error("   Error:", error.message);
      process.exit(1);
    }
  };

  // Register handlers
  process.on("SIGINT", () => shutdown("SIGINT", 0));
  process.on("SIGTERM", () => shutdown("SIGTERM", 0));

  // Simulate app activity
  console.log("\n✍️  Simulating production activity...");
  for (let i = 0; i < 5; i++) {
    file.contents.stats.requests += Math.floor(Math.random() * 100);
    file.contents.stats.errors += Math.floor(Math.random() * 3);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log(`   Total requests: ${file.contents.stats.requests}`);
  console.log(`   Total errors: ${file.contents.stats.errors}`);
  console.log("\n✅ Production pattern demonstrated");

  // Cleanup
  await new Promise((resolve) => setTimeout(resolve, 1000));
  process.removeAllListeners("SIGINT");
  process.removeAllListeners("SIGTERM");
}

/**
 * Example 5: Atomic Writes + saveSync
 *
 * Demonstrating crash safety even in exit handlers
 */
async function example5() {
  console.log("\n📝 Example 5: Crash Safety with Atomic Writes");
  console.log("-".repeat(60));

  console.log("\n🔒 With atomicWrites: true (default):");
  console.log("   Even in exit handlers, saves are atomic:");
  console.log("   1. Write to temp file");
  console.log("   2. Rename atomically");
  console.log("   3. No partial writes possible");

  const file = new Filejson({ atomicWrites: true });
  await file.load(testFile, { critical: "data" });

  console.log("\n✅ Benefits in exit handlers:");
  console.log("   • If saveSync() fails partway, original file intact");
  console.log("   • No corrupted JSON files");
  console.log("   • Production-grade reliability");

  file.contents.critical = "updated data";
  file.saveSync();

  console.log("\n✅ Data saved atomically with saveSync()");
}

/**
 * Run all examples
 */
async function runAllExamples() {
  try {
    await example1();
    await example2();
    await example3();
    await example4();
    await example5();

    console.log("\n" + "=".repeat(60));
    console.log("✅ All examples completed successfully!");
    console.log("=".repeat(60));
    console.log("\n💡 Key Takeaways:");
    console.log("   • Use saveSync() in ALL exit handlers");
    console.log("   • Async save() won't complete before process exit");
    console.log("   • saveSync() blocks until write completes");
    console.log("   • Works with atomic writes for crash safety");
    console.log("   • Essential for production applications");
    console.log("   • Always wrap in try-catch for error handling");
    console.log("\n📚 Best Practice Pattern:");
    console.log("   ```javascript");
    console.log("   process.on('SIGINT', () => {");
    console.log("     try {");
    console.log("       file.saveSync();");
    console.log("       process.exit(0);");
    console.log("     } catch (error) {");
    console.log("       console.error(error);");
    console.log("       process.exit(1);");
    console.log("     }");
    console.log("   });");
    console.log("   ```\n");
  } catch (error) {
    console.error("❌ Error running examples:", error);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}

module.exports = { runAllExamples };
