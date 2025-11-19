// Google Apps Script for Website Registration Form
// ⚠️ DEPRECATED: Use google-apps-script-code-secure.gs instead for security features!
// This file is kept for reference only

function doPost(e) {
  try {
    // REPLACE THIS WITH YOUR GOOGLE SHEET ID
    // Get it from the Sheet URL: https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
    const SHEET_ID = 'YOUR_SHEET_ID_HERE';
    
    // Open your Google Sheet
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getActiveSheet();
    
    // Get form data from POST request
    const data = JSON.parse(e.postData.contents);
    
    // Prepare row data matching your column headers
    const rowData = [
      new Date(), // Timestamp (Column A)
      data.first_name || '', // First Name (Column B)
      data.last_name || '', // Last Name (Column C)
      data.email || '', // Email (Column D)
      data.phone || '', // Phone (Column E)
      data.gender || '', // Gender (Column F)
      data.education || '', // Education (Column G)
      data.date_of_birth || '', // Date of Birth (Column H)
      data.province || '', // Province (Column I)
      data.course_id || '', // Course ID (Column J)
      data.course_name || '', // Course Name (Column K)
      data.delivery_mode || '', // Delivery Mode (Column L)
      data.session_time || '', // Session Time (Column M)
      data.terms_accepted || '', // Terms Accepted (Column N)
      data.status || 'pending', // Status (Column O)
      data.timestamp || new Date().toISOString() // Timestamp ISO (Column P)
    ];
    
    // Append data to sheet
    sheet.appendRow(rowData);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Registration saved successfully',
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log error for debugging
    console.error('Error in doPost:', error);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        message: error.toString(),
        error: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: Test function to verify setup
function testFunction() {
  const testData = {
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

// Handle GET requests (optional, for testing)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      message: 'Registration API is active',
      method: 'GET',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

