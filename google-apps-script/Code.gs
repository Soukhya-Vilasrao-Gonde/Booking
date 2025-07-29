/**
 * Dynamic Link Generator for Google Forms
 * This add-on generates dynamic links that are shown on the form response page
 */

// Configuration - Update these with your backend URL
const BACKEND_URL = 'https://yourdomain.com'; // Replace with your actual backend URL
const API_ENDPOINT = `${BACKEND_URL}/api/generate-link`;
const WEBHOOK_ENDPOINT = `${BACKEND_URL}/webhook/form-submission`;

/**
 * Called when the add-on is first installed or when the form is opened
 */
function onOpen() {
  const ui = FormApp.getUi();
  ui.createAddonMenu()
    .addItem('Configure Dynamic Links', 'showSidebar')
    .addItem('View Settings', 'showSettings')
    .addToUi();
}

/**
 * Called when the add-on is installed
 */
function onInstall() {
  onOpen();
}

/**
 * Shows the configuration sidebar
 */
function showSidebar() {
  const html = HtmlService.createTemplateFromFile('Sidebar')
    .evaluate()
    .setTitle('Dynamic Link Generator')
    .setWidth(300);
  
  FormApp.getUi().showSidebar(html);
}

/**
 * Shows current settings
 */
function showSettings() {
  const form = FormApp.getActiveForm();
  const properties = PropertiesService.getDocumentProperties();
  const isEnabled = properties.getProperty('dynamicLinksEnabled') === 'true';
  const customMessage = properties.getProperty('customMessage') || '';
  
  const ui = FormApp.getUi();
  const message = `Dynamic Links Status: ${isEnabled ? 'Enabled' : 'Disabled'}\n` +
                 `Custom Message: ${customMessage || 'None set'}\n` +
                 `Form ID: ${form.getId()}`;
  
  ui.alert('Current Settings', message, ui.ButtonSet.OK);
}

/**
 * Enables dynamic link generation for the form
 */
function enableDynamicLinks(customMessage) {
  try {
    const form = FormApp.getActiveForm();
    const properties = PropertiesService.getDocumentProperties();
    
    // Store configuration
    properties.setProperties({
      'dynamicLinksEnabled': 'true',
      'customMessage': customMessage || 'Click the link below to access your personalized response page:',
      'backendUrl': BACKEND_URL
    });
    
    // Set up form submit trigger
    setupFormSubmitTrigger();
    
    // Update form confirmation message
    updateFormConfirmationMessage();
    
    return { success: true, message: 'Dynamic links enabled successfully!' };
    
  } catch (error) {
    console.error('Error enabling dynamic links:', error);
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * Disables dynamic link generation
 */
function disableDynamicLinks() {
  try {
    const properties = PropertiesService.getDocumentProperties();
    properties.deleteProperty('dynamicLinksEnabled');
    properties.deleteProperty('customMessage');
    
    // Remove triggers
    removeFormSubmitTriggers();
    
    // Reset form confirmation message
    const form = FormApp.getActiveForm();
    form.setConfirmationMessage('Thank you for your response!');
    
    return { success: true, message: 'Dynamic links disabled successfully!' };
    
  } catch (error) {
    console.error('Error disabling dynamic links:', error);
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * Sets up the form submit trigger
 */
function setupFormSubmitTrigger() {
  // Remove existing triggers first
  removeFormSubmitTriggers();
  
  // Create new trigger
  const form = FormApp.getActiveForm();
  ScriptApp.newTrigger('onFormSubmit')
    .timeBased()
    .everyMinutes(1) // Check every minute for new responses
    .create();
    
  // Also create a form submit trigger if possible
  try {
    ScriptApp.newTrigger('onFormSubmitEvent')
      .timeBased()
      .everyMinutes(1)
      .create();
  } catch (e) {
    console.log('Could not create form submit trigger:', e);
  }
}

/**
 * Removes all form submit triggers
 */
function removeFormSubmitTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'onFormSubmit' || 
        trigger.getHandlerFunction() === 'onFormSubmitEvent') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
}

/**
 * Called when form is submitted - main logic for generating dynamic links
 */
function onFormSubmit() {
  try {
    const properties = PropertiesService.getDocumentProperties();
    const isEnabled = properties.getProperty('dynamicLinksEnabled') === 'true';
    
    if (!isEnabled) {
      return;
    }
    
    const form = FormApp.getActiveForm();
    const responses = form.getResponses();
    const lastResponse = responses[responses.length - 1];
    
    if (!lastResponse) {
      return;
    }
    
    // Process the latest response
    processFormResponse(lastResponse);
    
  } catch (error) {
    console.error('Error in onFormSubmit:', error);
  }
}

/**
 * Alternative form submit handler
 */
function onFormSubmitEvent(e) {
  try {
    const properties = PropertiesService.getDocumentProperties();
    const isEnabled = properties.getProperty('dynamicLinksEnabled') === 'true';
    
    if (!isEnabled || !e || !e.response) {
      return;
    }
    
    processFormResponse(e.response);
    
  } catch (error) {
    console.error('Error in onFormSubmitEvent:', error);
  }
}

/**
 * Processes a form response and generates dynamic link
 */
function processFormResponse(response) {
  try {
    const form = FormApp.getActiveForm();
    const formId = form.getId();
    const submissionId = response.getId();
    const timestamp = response.getTimestamp();
    
    // Extract form data
    const formData = extractFormData(response);
    
    // Generate dynamic link
    const dynamicUrl = generateDynamicLink(formId, submissionId, formData);
    
    if (dynamicUrl) {
      // Update the form's confirmation message with the dynamic link
      updateConfirmationWithLink(dynamicUrl);
      
      // Optionally send email with the link
      sendEmailWithLink(formData, dynamicUrl);
    }
    
  } catch (error) {
    console.error('Error processing form response:', error);
  }
}

/**
 * Extracts form data from response
 */
function extractFormData(response) {
  const formData = {};
  const itemResponses = response.getItemResponses();
  
  itemResponses.forEach(itemResponse => {
    const question = itemResponse.getItem().getTitle();
    const answer = itemResponse.getResponse();
    formData[question] = answer;
  });
  
  // Add metadata
  formData._timestamp = response.getTimestamp();
  formData._responseId = response.getId();
  
  return formData;
}

/**
 * Generates dynamic link by calling backend API
 */
function generateDynamicLink(formId, submissionId, formData) {
  try {
    const payload = {
      formId: formId,
      submissionId: submissionId,
      formData: formData
    };
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload)
    };
    
    const response = UrlFetchApp.fetch(API_ENDPOINT, options);
    const result = JSON.parse(response.getContentText());
    
    if (result.success) {
      return result.dynamicUrl;
    } else {
      console.error('Failed to generate dynamic link:', result.error);
      return null;
    }
    
  } catch (error) {
    console.error('Error calling backend API:', error);
    return null;
  }
}

/**
 * Updates form confirmation message to include dynamic link
 */
function updateConfirmationWithLink(dynamicUrl) {
  try {
    const properties = PropertiesService.getDocumentProperties();
    const customMessage = properties.getProperty('customMessage') || 
                         'Click the link below to access your personalized response page:';
    
    const form = FormApp.getActiveForm();
    const confirmationMessage = `
Thank you for your response!

${customMessage}

🔗 Your personalized link: ${dynamicUrl}

This link contains your submission details and additional resources.
    `.trim();
    
    form.setConfirmationMessage(confirmationMessage);
    
  } catch (error) {
    console.error('Error updating confirmation message:', error);
  }
}

/**
 * Updates the default form confirmation message
 */
function updateFormConfirmationMessage() {
  try {
    const form = FormApp.getActiveForm();
    const properties = PropertiesService.getDocumentProperties();
    const customMessage = properties.getProperty('customMessage') || 
                         'Your personalized link will appear here after submission.';
    
    const confirmationMessage = `
Thank you for your response!

${customMessage}

Please wait a moment while we generate your personalized link...
    `.trim();
    
    form.setConfirmationMessage(confirmationMessage);
    
  } catch (error) {
    console.error('Error updating form confirmation message:', error);
  }
}

/**
 * Sends email with dynamic link (optional feature)
 */
function sendEmailWithLink(formData, dynamicUrl) {
  try {
    // Look for email field in form data
    const emailField = findEmailField(formData);
    
    if (!emailField) {
      return; // No email field found
    }
    
    const recipientEmail = formData[emailField];
    const name = formData.Name || formData.name || 'User';
    
    const subject = 'Your Form Response - Personalized Link';
    const body = `
Hello ${name},

Thank you for your form submission!

You can access your personalized response page using the link below:
${dynamicUrl}

This link contains your submission details and additional resources.

Best regards,
Form Team
    `.trim();
    
    MailApp.sendEmail(recipientEmail, subject, body);
    
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

/**
 * Finds email field in form data
 */
function findEmailField(formData) {
  const emailPatterns = ['email', 'Email', 'EMAIL', 'e-mail', 'E-mail'];
  
  for (const pattern of emailPatterns) {
    if (formData.hasOwnProperty(pattern)) {
      return pattern;
    }
  }
  
  // Look for fields containing 'email'
  for (const key of Object.keys(formData)) {
    if (key.toLowerCase().includes('email')) {
      return key;
    }
  }
  
  return null;
}

/**
 * Gets current configuration
 */
function getCurrentConfig() {
  const properties = PropertiesService.getDocumentProperties();
  const form = FormApp.getActiveForm();
  
  return {
    isEnabled: properties.getProperty('dynamicLinksEnabled') === 'true',
    customMessage: properties.getProperty('customMessage') || '',
    backendUrl: properties.getProperty('backendUrl') || BACKEND_URL,
    formId: form.getId(),
    formTitle: form.getTitle()
  };
}

/**
 * Tests the backend connection
 */
function testBackendConnection() {
  try {
    const response = UrlFetchApp.fetch(BACKEND_URL);
    return {
      success: true,
      status: response.getResponseCode(),
      message: 'Backend connection successful'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Backend connection failed: ' + error.toString()
    };
  }
}