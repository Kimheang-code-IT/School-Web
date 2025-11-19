// Google Apps Script for Website Registration Form - SECURE VERSION
// Copy this entire code into Google Apps Script Editor

function doPost(e) {
  try {
    // SECURITY: Secret token for authentication
    // IMPORTANT: Change this to match the SECURITY_TOKEN in your React config file
    // Use the same token in both files for security
    const SECRET_TOKEN = 'YrLnocfx9wMAkkYICTjlO9xye7CUxy5uqqPsvsVSDiTzTcRpkBVhGJjoE56AIRFhgEJDgDupYcJhQjKucL6hbG9dKq9FPVy';
    
    // YOUR GOOGLE SHEET ID
    // Extract from URL: https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
    const SHEET_ID = '1ZvehP_Erz8KZIAgyODd0XHLEJDw1snM2hxig7TTC3DQ';
    
    // Parse incoming data
    const requestData = JSON.parse(e.postData.contents);
    
    // SECURITY CHECK: Verify token
    if (!requestData.token || requestData.token !== SECRET_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: false, 
          message: 'Unauthorized: Invalid security token',
          error: 'Authentication failed'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Additional security: Rate limiting check (optional)
    // You can add rate limiting here to prevent spam
    
    // Open your Google Sheet
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getActiveSheet();
    
    // Extract registration data (excluding token for storage)
    const data = {
      first_name: requestData.first_name || '',
      last_name: requestData.last_name || '',
      email: requestData.email || '',
      phone: requestData.phone || '',
      gender: requestData.gender || '',
      education: requestData.education || '',
      date_of_birth: requestData.date_of_birth || '',
      province: requestData.province || '',
      course_id: requestData.course_id || '',
      course_name: requestData.course_name || '',
      delivery_mode: requestData.delivery_mode || '',
      session_time: requestData.session_time || '',
      terms_accepted: requestData.terms_accepted || '',
      status: requestData.status || 'pending',
      timestamp: requestData.timestamp || new Date().toISOString()
    };
    
    // Validate required fields
    if (!data.first_name || !data.last_name || !data.phone) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: false, 
          message: 'Validation error: Missing required fields',
          error: 'Required fields: first_name, last_name, phone'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Prepare row data matching your column headers
    const rowData = [
      new Date(), // Timestamp (Column A)
      data.first_name, // First Name (Column B)
      data.last_name, // Last Name (Column C)
      data.email, // Email (Column D)
      data.phone, // Phone (Column E)
      data.gender, // Gender (Column F)
      data.education, // Education (Column G)
      data.date_of_birth, // Date of Birth (Column H)
      data.province, // Province (Column I)
      data.course_id, // Course ID (Column J)
      data.course_name, // Course Name (Column K)
      data.delivery_mode, // Delivery Mode (Column L)
      data.session_time, // Session Time (Column M)
      data.terms_accepted, // Terms Accepted (Column N)
      data.status, // Status (Column O)
      data.timestamp // Timestamp ISO (Column P)
    ];
    
    // Append data to sheet
    sheet.appendRow(rowData);
    
    // Log successful registration (for monitoring)
    console.log('Registration saved:', {
      name: data.first_name + ' ' + data.last_name,
      email: data.email,
      course: data.course_name,
      timestamp: new Date().toISOString()
    });
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Registration saved successfully',
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log error for debugging (but don't expose details to client)
    console.error('Error in doPost:', error);
    
    // Return generic error response (don't expose internal errors)
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        message: 'An error occurred while processing your registration',
        error: 'Internal server error'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests (for testing and health checks)
function doGet(e) {
  // Optional: Add token check for GET requests too
  const token = e.parameter.token;
  const SECRET_TOKEN = 'YrLnocfx9wMAkkYICTjlO9xye7CUxy5uqqPsvsVSDiTzTcRpkBVhGJjoE56AIRFhgEJDgDupYcJhQjKucL6hbG9dKq9FPVy';
  
  if (token !== SECRET_TOKEN) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        message: 'Unauthorized access',
        error: 'Invalid token'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({ 
      message: 'Registration API is active and secure',
      method: 'GET',
      timestamp: new Date().toISOString(),
      status: 'operational'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Optional: Test function to verify setup (run this in Apps Script editor)
function testFunction() {
  const SECRET_TOKEN = 'YrLnocfx9wMAkkYICTjlO9xye7CUxy5uqqPsvsVSDiTzTcRpkBVhGJjoE56AIRFhgEJDgDupYcJhQjKucL6hbG9dKq9FPVy';
  
  const testData = {
    token: SECRET_TOKEN, // Include token
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    phone: '+855123456789',
    gender: 'Male',
    education: 'High School',
    date_of_birth: '2000-01-01',
    province: 'Phnom Penh',
    course_id: '1',
    course_name: 'Test Course',
    delivery_mode: 'Online',
    session_time: 'Morning',
    terms_accepted: 'Yes',
    status: 'pending',
    timestamp: new Date().toISOString()
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}


