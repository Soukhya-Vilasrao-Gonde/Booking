
const dotenv = require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require('uuid');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory storage for demo (use database in production)
const dynamicLinks = new Map();
const formSubmissions = new Map();

// Base URL for your service (set in .env file)
const BASE_URL = process.env.BASE_URL || 'https://yourdomain.com';

app.get("/", (req, res) => {
    res.send("Dynamic Link Generator API - Live Now");
});

// Generate dynamic link endpoint
app.post("/api/generate-link", (req, res) => {
    try {
        const { formData, formId, submissionId } = req.body;
        
        // Generate unique link ID
        const linkId = uuidv4();
        
        // Create dynamic link data
        const linkData = {
            id: linkId,
            formId: formId,
            submissionId: submissionId,
            formData: formData,
            createdAt: new Date().toISOString(),
            accessed: false,
            accessCount: 0
        };
        
        // Store the link data
        dynamicLinks.set(linkId, linkData);
        
        // Generate the dynamic URL
        const dynamicUrl = `${BASE_URL}/link/${linkId}`;
        
        res.json({
            success: true,
            dynamicUrl: dynamicUrl,
            linkId: linkId,
            message: "Dynamic link generated successfully"
        });
        
    } catch (error) {
        console.error('Error generating dynamic link:', error);
        res.status(500).json({
            success: false,
            error: "Failed to generate dynamic link"
        });
    }
});

// Handle dynamic link access
app.get("/link/:linkId", (req, res) => {
    try {
        const { linkId } = req.params;
        const linkData = dynamicLinks.get(linkId);
        
        if (!linkData) {
            return res.status(404).send(`
                <html>
                    <head><title>Link Not Found</title></head>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h1>Link Not Found</h1>
                        <p>The requested link does not exist or has expired.</p>
                    </body>
                </html>
            `);
        }
        
        // Update access statistics
        linkData.accessed = true;
        linkData.accessCount += 1;
        linkData.lastAccessed = new Date().toISOString();
        
        // Generate dynamic content based on form data
        const dynamicContent = generateDynamicContent(linkData);
        
        res.send(dynamicContent);
        
    } catch (error) {
        console.error('Error accessing dynamic link:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Get link statistics
app.get("/api/link-stats/:linkId", (req, res) => {
    const { linkId } = req.params;
    const linkData = dynamicLinks.get(linkId);
    
    if (!linkData) {
        return res.status(404).json({
            success: false,
            error: "Link not found"
        });
    }
    
    res.json({
        success: true,
        stats: {
            id: linkData.id,
            createdAt: linkData.createdAt,
            accessed: linkData.accessed,
            accessCount: linkData.accessCount,
            lastAccessed: linkData.lastAccessed || null
        }
    });
});

// Webhook endpoint for Google Forms (Apps Script will call this)
app.post("/webhook/form-submission", (req, res) => {
    try {
        const { formId, submissionId, formData, responseUrl } = req.body;
        
        // Process the form submission
        const submissionData = {
            formId,
            submissionId,
            formData,
            responseUrl,
            timestamp: new Date().toISOString()
        };
        
        // Store submission data
        formSubmissions.set(submissionId, submissionData);
        
        // Generate dynamic link
        const linkId = uuidv4();
        const linkData = {
            id: linkId,
            formId: formId,
            submissionId: submissionId,
            formData: formData,
            createdAt: new Date().toISOString(),
            accessed: false,
            accessCount: 0
        };
        
        dynamicLinks.set(linkId, linkData);
        
        const dynamicUrl = `${BASE_URL}/link/${linkId}`;
        
        res.json({
            success: true,
            dynamicUrl: dynamicUrl,
            linkId: linkId
        });
        
    } catch (error) {
        console.error('Error processing form submission:', error);
        res.status(500).json({
            success: false,
            error: "Failed to process form submission"
        });
    }
});

// Function to generate dynamic content based on form data
function generateDynamicContent(linkData) {
    const { formData, createdAt, accessCount } = linkData;
    
    // Extract common form fields
    const name = formData.name || formData.Name || 'User';
    const email = formData.email || formData.Email || '';
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Personalized Link</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                overflow: hidden;
            }
            .header {
                background: #4285f4;
                color: white;
                padding: 30px;
                text-align: center;
            }
            .content {
                padding: 30px;
            }
            .info-card {
                background: #f8f9fa;
                border-left: 4px solid #4285f4;
                padding: 20px;
                margin: 20px 0;
                border-radius: 5px;
            }
            .button {
                display: inline-block;
                background: #34a853;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 5px;
                margin: 10px 5px;
                transition: background 0.3s;
            }
            .button:hover {
                background: #2d8f47;
            }
            .stats {
                background: #e8f0fe;
                padding: 15px;
                border-radius: 5px;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Hello ${name}!</h1>
                <p>Your personalized response page is ready</p>
            </div>
            <div class="content">
                <div class="info-card">
                    <h3>📋 Your Submission Details</h3>
                    ${generateFormDataHTML(formData)}
                </div>
                
                <div class="info-card">
                    <h3>🔗 Quick Actions</h3>
                    <a href="#" class="button" onclick="downloadPDF()">📄 Download PDF</a>
                    <a href="#" class="button" onclick="editResponse()">✏️ Edit Response</a>
                    <a href="#" class="button" onclick="shareLink()">🔗 Share Link</a>
                </div>
                
                <div class="stats">
                    <h4>📊 Link Statistics</h4>
                    <p><strong>Created:</strong> ${new Date(createdAt).toLocaleString()}</p>
                    <p><strong>Access Count:</strong> ${accessCount}</p>
                    <p><strong>Link ID:</strong> ${linkData.id}</p>
                </div>
            </div>
        </div>
        
        <script>
            function downloadPDF() {
                alert('PDF download functionality would be implemented here');
            }
            
            function editResponse() {
                alert('Edit response functionality would be implemented here');
            }
            
            function shareLink() {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            }
        </script>
    </body>
    </html>
    `;
}

// Helper function to generate HTML for form data
function generateFormDataHTML(formData) {
    let html = '<table style="width: 100%; border-collapse: collapse;">';
    
    for (const [key, value] of Object.entries(formData)) {
        html += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px; font-weight: bold; width: 30%;">${key}:</td>
                <td style="padding: 8px;">${value}</td>
            </tr>
        `;
    }
    
    html += '</table>';
    return html;
}

module.exports = app;