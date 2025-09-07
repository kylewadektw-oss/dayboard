console.log("✅ Testing new logging system - this should appear in dashboard");
console.error("❌ Testing error logging - this should also appear");
console.warn("⚠️ Testing warning logging");
console.info("ℹ️ Testing info logging");

// Test with some data
console.log("📊 Testing object logging", { 
  timestamp: new Date().toISOString(), 
  test: "data", 
  success: true 
});

console.log("🎯 Log generation test completed - check logs dashboard!");
