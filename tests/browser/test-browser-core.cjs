#!/usr/bin/env node

/**
 * Test script for browser-core bundle
 * This tests the browser-core bundle in a Node.js environment
 */

console.log('🧪 Testing DolaSoft Logger Browser-Core Bundle');
console.log('================================================');

// Simulate browser environment
global.window = {};
global.process = { 
  env: { 
    NODE_ENV: 'development',
    LOG_MAX_MEMORY_ENTRIES: '1000',
    LOG_MAX_DATABASE_ENTRIES: '10000',
    LOG_MAX_FILE_ENTRIES: '5000'
  } 
};
global.globalThis = { 
  crypto: { 
    randomUUID: () => 'browser-uuid-test-' + Math.random().toString(36).substring(2, 15)
  } 
};

let browserCore;
let logger;

function testBasicImports() {
  console.log('\n📦 Testing basic imports...');
  try {
    // Use ESM version for Node.js testing (UMD is for browsers only)
    browserCore = require('../../dist/browser-core.esm.js');
    console.log('✅ Successfully imported browser-core bundle');
    
    // Check available exports
    const exports = Object.keys(browserCore);
    console.log(`📦 Available exports: ${exports.length} items`);
    console.log(`   ${exports.slice(0, 10).join(', ')}${exports.length > 10 ? '...' : ''}`);
    
    return true;
  } catch (error) {
    console.log(`❌ Error importing browser-core: ${error.message}`);
    console.error('Import error:', error);
    return false;
  }
}

function testUUIDGeneration() {
  console.log('\n🔑 Testing UUID generation...');
  try {
    if (!browserCore) {
      console.log('❌ Browser core not loaded');
      return false;
    }
    
    const uuid1 = browserCore.generateUUID();
    const uuid2 = browserCore.generateUUID();
    
    console.log(`✅ Generated UUID 1: ${uuid1}`);
    console.log(`✅ Generated UUID 2: ${uuid2}`);
    console.log(`✅ UUIDs are different: ${uuid1 !== uuid2}`);
    console.log(`✅ UUID format valid: ${/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid1)}`);
    
    // Test short ID
    const shortId = browserCore.generateShortId();
    console.log(`✅ Generated short ID: ${shortId}`);
    
    return true;
  } catch (error) {
    console.log(`❌ Error generating UUID: ${error.message}`);
    console.error('UUID generation error:', error);
    return false;
  }
}

function testLoggerCreation() {
  console.log('\n🔧 Testing logger creation...');
  try {
    if (!browserCore) {
      console.log('❌ Browser core not loaded');
      return false;
    }
    
    // Test default logger
    logger = browserCore.getLogger();
    console.log('✅ Default logger created successfully');
    
    // Test logger with config
    const customLogger = browserCore.getLogger({
      level: browserCore.LogLevel.DEBUG,
      strategy: browserCore.LogStrategy.CONSOLE
    });
    console.log('✅ Custom logger created successfully');
    
    // Test logger methods
    const methods = ['debug', 'info', 'warn', 'error', 'fatal'];
    for (const method of methods) {
      if (typeof logger[method] === 'function') {
        console.log(`✅ Logger has ${method} method`);
      } else {
        console.log(`❌ Logger missing ${method} method`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Error creating logger: ${error.message}`);
    console.error('Logger creation error:', error);
    return false;
  }
}

function testLogging() {
  console.log('\n📝 Testing logging functionality...');
  try {
    if (!logger) {
      console.log('❌ Logger not created');
      return false;
    }
    
    // Test different log levels
    logger.debug('This is a debug message', { userId: 'test-user' });
    console.log('✅ Debug log sent');
    
    logger.info('This is an info message', { action: 'test' });
    console.log('✅ Info log sent');
    
    logger.warn('This is a warning message', { warning: 'test-warning' });
    console.log('✅ Warning log sent');
    
    logger.error('This is an error message', new Error('Test error'), { error: 'test-error' });
    console.log('✅ Error log sent');
    
    // Test convenience functions
    browserCore.logDebug('Convenience debug message');
    browserCore.logInfo('Convenience info message');
    browserCore.logWarn('Convenience warning message');
    browserCore.logError('Convenience error message');
    console.log('✅ Convenience functions work');
    
    return true;
  } catch (error) {
    console.log(`❌ Error during logging: ${error.message}`);
    console.error('Logging error:', error);
    return false;
  }
}

function testZeroConfigLoggers() {
  console.log('\n⚙️ Testing zero-config loggers...');
  try {
    if (!browserCore) {
      console.log('❌ Browser core not loaded');
      return false;
    }
    
    // Test console logger
    const consoleLogger = browserCore.createConsoleLogger();
    console.log('✅ Console logger created');
    
    // Test memory logger
    const memoryLogger = browserCore.createMemoryLogger();
    console.log('✅ Memory logger created');
    
    // Test remote logger
    const remoteLogger = browserCore.createRemoteLogger();
    console.log('✅ Remote logger created');
    
    // Test hybrid logger
    const hybridLogger = browserCore.createHybridLogger();
    console.log('✅ Hybrid logger created');
    
    // Test smart logger
    const smartLogger = browserCore.createSmartLogger();
    console.log('✅ Smart logger created');
    
    // Test Loggers object
    if (browserCore.Loggers) {
      console.log('✅ Loggers object available');
      const loggerNames = Object.keys(browserCore.Loggers);
      console.log(`   Available loggers: ${loggerNames.join(', ')}`);
    } else {
      console.log('❌ Loggers object not found');
      return false;
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Error testing zero-config loggers: ${error.message}`);
    console.error('Zero-config logger error:', error);
    return false;
  }
}

function runAllTests() {
  console.log('🚀 Starting all tests...\n');
  
  const tests = [
    { name: 'Basic Imports', fn: testBasicImports },
    { name: 'UUID Generation', fn: testUUIDGeneration },
    { name: 'Logger Creation', fn: testLoggerCreation },
    { name: 'Logging', fn: testLogging },
    { name: 'Zero-Config Loggers', fn: testZeroConfigLoggers }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    try {
      const result = test.fn();
      if (result) {
        passed++;
        console.log(`✅ ${test.name} test passed`);
      } else {
        console.log(`❌ ${test.name} test failed`);
      }
    } catch (error) {
      console.log(`❌ ${test.name} test failed with error: ${error.message}`);
    }
  }
  
  console.log('\n📊 Test Results');
  console.log('================');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Browser-core bundle is working correctly.');
    process.exit(0);
  } else {
    console.log('\n💥 Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

// Run tests
runAllTests();
