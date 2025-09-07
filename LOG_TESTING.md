# 🧪 Log Testing & Generation Tools

This project includes comprehensive tools for testing the Enhanced Logs Dashboard without waiting for real errors or issues to occur.

## 🎯 Available Testing Methods

### 1. **Web-Based Log Generator** (`/test-log-generation`)

A comprehensive web interface for generating realistic test logs:

- **📍 URL**: `http://localhost:3000/test-log-generation`
- **🎯 Comprehensive Test Suite**: Generates 15 realistic logs across all levels
- **🚨 Critical Error Simulation**: Tests cascading system failures  
- **📈 High Volume Traffic**: Tests dashboard performance with rapid log generation
- **⚡ Quick Individual Tests**: Single-click buttons for each log level

**Features:**
- Realistic log messages simulating actual application scenarios
- Varied components (DatabaseService, AuthService, PaymentProcessor, etc.)
- Detailed metadata and error contexts
- Timed generation to simulate real-world patterns

### 2. **Command Line Scripts**

Quick terminal-based log generation:

```bash
# Generate mixed logs (default: 15 logs)
npm run test:logs

# Generate 10 error logs
npm run test:logs:errors  

# Generate 8 warning logs
npm run test:logs:warnings

# Generate high-volume burst (25 logs)
npm run test:logs:burst

# Custom generation
node scripts/generate-test-logs.js [type] [count]
```

**Available log types:**
- `error` - Critical errors and failures
- `warn` - Warnings and performance issues  
- `info` - General information and user actions
- `debug` - Debug traces and technical details
- `mixed` - Random combination of all types

### 3. **Basic Console Testing** (`/test-console-logging`)

Simple interface for basic console log testing:

- **📍 URL**: `http://localhost:3000/test-console-logging`
- Direct console method testing
- Basic log level verification

## 🔧 Testing Scenarios

### **Error Testing**
```bash
npm run test:logs:errors
```
Generates realistic error scenarios:
- Database connection failures
- Authentication errors  
- Payment processing failures
- Critical system exceptions
- API endpoint errors

### **Warning Testing**
```bash
npm run test:logs:warnings
```
Generates performance and system warnings:
- High memory usage alerts
- API rate limit warnings
- Deprecated function usage
- Slow database queries
- Cache performance issues

### **Volume Testing**
```bash
npm run test:logs:burst
```
Tests dashboard performance with:
- Rapid log generation (25+ logs)
- Mixed log levels and components
- High-frequency database writes
- Real-time dashboard updates

## 🎮 Usage Instructions

### **Getting Started**
1. **Start the development server**: `npm run dev`
2. **Choose your testing method**:
   - **Web Interface**: Visit `/test-log-generation`
   - **Command Line**: Use `npm run test:logs`
3. **View results**: Open `/logs-dashboard` to see generated logs
4. **Test features**: Use time range buttons to filter logs

### **Testing the Time Range Buttons**
1. Generate logs using any method above
2. Go to the Logs Dashboard (`/logs-dashboard`)
3. Click the time range buttons (5m, 30m, 1h, 6h, 12h, 1d, 1w, all)
4. Verify filtering works correctly

### **Testing Database Connectivity**
1. Generate logs and verify they appear in the dashboard
2. Check that logs persist between page refreshes
3. Verify real-time updates (logs appear within 2 seconds)

## 📊 Dashboard Features to Test

### **Enhanced Time Range Filtering**
- ✅ **Button Interface**: Individual clickable buttons instead of dropdown
- ✅ **Time Ranges**: 5m, 30m, 1h, 6h, 12h, 1d, 1w, all time
- ✅ **Active States**: Visual indication of selected time range
- ✅ **Real-time Filtering**: Immediate results when switching ranges

### **Log Level Filtering**  
- Filter by ERROR, WARN, INFO, DEBUG levels
- Visual statistics cards with clickable filtering
- Color-coded log entries

### **Component & Search Filtering**
- Filter by specific components/services
- Text search across log messages and data
- Combined filter states

### **Real-time Features**
- Auto-refresh every 2 seconds
- Database persistence and memory combination
- Performance optimizations with caching

## 🚀 Advanced Testing

### **Performance Testing**
```bash
# Generate high volume
npm run test:logs:burst

# Generate continuous load
for i in {1..5}; do npm run test:logs && sleep 2; done
```

### **Error Scenario Testing**
```bash
# Simulate system failure
npm run test:logs:errors

# Then check auto-log-review page for analysis
```

### **Cross-Component Testing**
Generate logs from multiple components and verify:
- Component filtering works
- Search functionality finds logs across components  
- Time-based filtering respects all components

## 📁 File Structure

```
/app/test-log-generation/     # Web-based log generator
/app/test-console-logging/    # Basic console testing
/scripts/generate-test-logs.js # Command-line generator
/components/logging/LoggingNav.tsx # Navigation with new routes
```

## 🔍 Troubleshooting

### **Logs Not Appearing**
1. Check browser console for JavaScript errors
2. Verify database connection in Network tab
3. Try refreshing the logs dashboard page

### **Time Range Filtering Issues**  
1. Generate logs within the selected time range
2. Check that system time is correct
3. Verify the time range buttons are clickable

### **Performance Issues**
1. Clear browser cache and reload
2. Check database connection speed
3. Reduce log generation frequency

---

## 🎯 Quick Start Commands

```bash
# Start development server
npm run dev

# Generate comprehensive test logs
npm run test:logs

# Open dashboard
open http://localhost:3000/logs-dashboard

# Generate specific error scenarios  
npm run test:logs:errors
```

**Happy Testing! 🚀**
