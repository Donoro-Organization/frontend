import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import config from '../config/config';

export default function APITestComponent() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setTestResults(prev => [...prev, logMessage]);
  };

  const clearLogs = () => {
    setTestResults([]);
  };

  // Test 1: Check if API endpoint is loaded
  const testConfigLoad = () => {
    addLog('=== Testing Config Load ===');
    addLog(`Backend API Endpoint: ${config.BACKEND_API_ENDPOINT}`);
    
    if (config.BACKEND_API_ENDPOINT) {
      addLog('✅ Config loaded successfully!');
    } else {
      addLog('❌ Config not loaded - check .env file and app.config.js');
    }
  };

  // Test 2: Test backend connection with simple GET request
  const testBackendConnection = async () => {
    setTesting(true);
    addLog('=== Testing Backend Connection ===');
    
    if (!config.BACKEND_API_ENDPOINT) {
      addLog('❌ No API endpoint configured');
      setTesting(false);
      return;
    }

    try {
      addLog(`Making GET request to: ${config.BACKEND_API_ENDPOINT}/health`);
      
      const response = await fetch(`${config.BACKEND_API_ENDPOINT}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      addLog(`Response Status: ${response.status}`);
      addLog(`Response Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);

      if (response.ok) {
        const data = await response.json();
        addLog(`✅ Response Data: ${JSON.stringify(data, null, 2)}`);
        addLog('✅ Backend connection successful!');
      } else {
        const errorText = await response.text();
        addLog(`❌ Backend responded with error: ${errorText}`);
      }
    } catch (error) {
      addLog(`❌ Network Error: ${error}`);
      addLog('This might indicate network issues or CORS problems');
    } finally {
      setTesting(false);
    }
  };

  // Test 3: Test POST request (similar to registration)
  const testPostRequest = async () => {
    setTesting(true);
    addLog('=== Testing POST Request ===');
    
    if (!config.BACKEND_API_ENDPOINT) {
      addLog('❌ No API endpoint configured');
      setTesting(false);
      return;
    }

    try {
      const testData = {
        email: 'test@example.com',
        password: 'testpassword123'
      };

      addLog(`Making POST request to: ${config.BACKEND_API_ENDPOINT}/auth/test`);
      addLog(`Request Body: ${JSON.stringify(testData)}`);
      
      const response = await fetch(`${config.BACKEND_API_ENDPOINT}/auth/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      addLog(`Response Status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        addLog(`✅ Response Data: ${JSON.stringify(data, null, 2)}`);
        addLog('✅ POST request successful!');
      } else {
        const errorText = await response.text();
        addLog(`❌ POST request failed: ${errorText}`);
      }
    } catch (error) {
      addLog(`❌ POST Error: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  // Test 4: Test actual signup endpoint
  const testSignupEndpoint = async () => {
    setTesting(true);
    addLog('=== Testing Signup Endpoint ===');
    
    if (!config.BACKEND_API_ENDPOINT) {
      addLog('❌ No API endpoint configured');
      setTesting(false);
      return;
    }

    try {
      const testData = {
        email: 'testuser@example.com',
        password: 'TestPass123'
      };

      addLog(`Making POST request to: ${config.BACKEND_API_ENDPOINT}/auth/signup`);
      addLog(`Request Body: ${JSON.stringify(testData)}`);
      
      const response = await fetch(`${config.BACKEND_API_ENDPOINT}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      addLog(`Response Status: ${response.status}`);

      const data = await response.json().catch(() => ({}));
      addLog(`Response Data: ${JSON.stringify(data, null, 2)}`);

      if (response.ok) {
        addLog('✅ Signup endpoint working!');
      } else {
        addLog(`⚠️ Signup endpoint responded with: ${response.status}`);
        addLog('This might be expected if user already exists or validation fails');
      }
    } catch (error) {
      addLog(`❌ Signup Error: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  const runAllTests = async () => {
    clearLogs();
    testConfigLoad();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testBackendConnection();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testPostRequest();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testSignupEndpoint();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backend API Connection Test</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testConfigLoad}>
          <Text style={styles.buttonText}>Test Config</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, testing && styles.buttonDisabled]} 
          onPress={testBackendConnection}
          disabled={testing}
        >
          <Text style={styles.buttonText}>Test GET</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, testing && styles.buttonDisabled]} 
          onPress={testPostRequest}
          disabled={testing}
        >
          <Text style={styles.buttonText}>Test POST</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, testing && styles.buttonDisabled]} 
          onPress={testSignupEndpoint}
          disabled={testing}
        >
          <Text style={styles.buttonText}>Test Signup</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton, testing && styles.buttonDisabled]} 
          onPress={runAllTests}
          disabled={testing}
        >
          <Text style={styles.buttonText}>Run All Tests</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={clearLogs}>
          <Text style={styles.buttonText}>Clear Logs</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.logsTitle}>Test Results:</Text>
      <ScrollView style={styles.logsContainer}>
        {testResults.map((log, index) => (
          <Text key={index} style={styles.logText}>
            {log}
          </Text>
        ))}
        {testResults.length === 0 && (
          <Text style={styles.noLogsText}>No test results yet. Run a test to see output.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    marginVertical: 5,
    minWidth: 80,
  },
  primaryButton: {
    backgroundColor: '#D32F2F',
    minWidth: 120,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 10,
    color: '#333',
  },
  logsContainer: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 10,
  },
  logText: {
    color: '#00FF00',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  noLogsText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
});