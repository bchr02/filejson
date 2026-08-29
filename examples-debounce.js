// Example demonstrating saveDelay/debouncing functionality

const Filejson = require("./app.js");

// Example 1: Without debouncing (default - immediate saves)
async function withoutDebouncing() {
  console.log("=== Example 1: Without Debouncing (saveDelay: 0) ===\n");

  const file = new Filejson({ saveDelay: 0 });
  await file.load("debounce-example1.json", { counter: 0, saveCount: 0 });

  console.log("Making 5 rapid changes...");
  const startTime = Date.now();

  for (let i = 1; i <= 5; i++) {
    file.contents.counter = i;
    // Each change triggers an immediate save
  }

  // Wait for all saves to complete
  await new Promise((resolve) => setTimeout(resolve, 100));
  const elapsed = Date.now() - startTime;

  console.log(`Final counter: ${file.contents.counter}`);
  console.log(`Time elapsed: ${elapsed}ms`);
  console.log("Result: Multiple disk writes occurred (one per change)\n");
}

// Example 2: With debouncing (100ms delay)
async function withDebouncing() {
  console.log("=== Example 2: With Debouncing (saveDelay: 100ms) ===\n");

  const file = new Filejson({ saveDelay: 100 });
  await file.load("debounce-example2.json", { counter: 0 });

  console.log("Making 5 rapid changes...");
  const startTime = Date.now();

  for (let i = 1; i <= 5; i++) {
    file.contents.counter = i;
    // Only the last change will be saved after 100ms of inactivity
  }

  console.log("Changes made, waiting for debounce...");

  // Wait for debounce to complete
  await new Promise((resolve) => setTimeout(resolve, 150));
  const elapsed = Date.now() - startTime;

  console.log(`Final counter: ${file.contents.counter}`);
  console.log(`Time elapsed: ${elapsed}ms`);
  console.log("Result: Only ONE disk write occurred after all changes stopped\n");
}

// Example 3: Real-world scenario - processing a stream of data
async function realtimeDataProcessing() {
  console.log("=== Example 3: Real-time Data Processing ===\n");

  const file = new Filejson({ saveDelay: 200 });
  await file.load("debounce-example3.json", {
    lastUpdate: null,
    dataPoints: [],
    totalProcessed: 0,
  });

  console.log("Simulating real-time data stream...");

  // Simulate receiving 50 data points over 1 second
  for (let i = 0; i < 50; i++) {
    file.contents.lastUpdate = new Date().toISOString();
    file.contents.dataPoints.push({
      value: Math.random() * 100,
      timestamp: Date.now(),
    });
    file.contents.totalProcessed++;

    // Small delay between data points
    await new Promise((resolve) => setTimeout(resolve, 20));
  }

  console.log("Data stream complete, waiting for final save...");

  // Wait for final save
  await new Promise((resolve) => setTimeout(resolve, 300));

  console.log(`Total data points processed: ${file.contents.totalProcessed}`);
  console.log(`Last update: ${file.contents.lastUpdate}`);
  console.log("Result: Despite 50 changes, only a few disk writes occurred\n");
}

// Example 4: Manual save bypassing debounce
async function manualSaveBypass() {
  console.log("=== Example 4: Manual Save Bypasses Debounce ===\n");

  const file = new Filejson({ saveDelay: 1000 }); // 1 second delay
  await file.load("debounce-example4.json", { status: "idle" });

  console.log("Making urgent change with 1000ms debounce...");
  file.contents.status = "critical";
  file.contents.timestamp = Date.now();

  console.log("Calling manual save to bypass debounce...");
  await file.save(); // Saves immediately, ignoring the 1000ms delay

  console.log(`Status: ${file.contents.status}`);
  console.log("Result: Saved immediately despite 1000ms debounce setting\n");
}

// Example 5: Comparing performance
async function performanceComparison() {
  console.log("=== Example 5: Performance Comparison ===\n");

  const iterations = 100;

  // Test without debouncing
  console.log(`Testing ${iterations} changes WITHOUT debouncing...`);
  const file1 = new Filejson({ saveDelay: 0 });
  await file1.load("debounce-perf1.json", { value: 0 });

  const start1 = Date.now();
  for (let i = 0; i < iterations; i++) {
    file1.contents.value = i;
  }
  await new Promise((resolve) => setTimeout(resolve, 200));
  const time1 = Date.now() - start1;

  console.log(`Time: ${time1}ms (${iterations} potential disk writes)\n`);

  // Test with debouncing
  console.log(`Testing ${iterations} changes WITH debouncing (100ms)...`);
  const file2 = new Filejson({ saveDelay: 100 });
  await file2.load("debounce-perf2.json", { value: 0 });

  const start2 = Date.now();
  for (let i = 0; i < iterations; i++) {
    file2.contents.value = i;
  }
  await new Promise((resolve) => setTimeout(resolve, 200));
  const time2 = Date.now() - start2;

  console.log(`Time: ${time2}ms (1 disk write after debounce)\n`);

  console.log(`Efficiency gain: ${(((time1 - time2) / time1) * 100).toFixed(1)}% faster with debouncing`);
}

// Run all examples
async function runAllExamples() {
  try {
    await withoutDebouncing();
    await withDebouncing();
    await realtimeDataProcessing();
    await manualSaveBypass();
    await performanceComparison();

    console.log("\n=== All examples completed! ===");
    console.log("\nKey Takeaways:");
    console.log("1. Debouncing reduces disk I/O for rapid changes");
    console.log("2. Default (saveDelay: 0) saves immediately");
    console.log("3. Manual save() bypasses debounce delay");
    console.log("4. Choose delay based on your update frequency");
  } catch (error) {
    console.error("Error:", error);
  }
}

// Check if running directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

module.exports = {
  withoutDebouncing,
  withDebouncing,
  realtimeDataProcessing,
  manualSaveBypass,
  performanceComparison,
};
