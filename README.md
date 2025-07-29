# 🔗 Dynamic Link Generator for Google Forms

Create personalized, dynamic links that appear on Google Form response pages after submission - similar to how payableapps.com works!

## ✨ Features

- **Dynamic Link Generation**: Automatically creates unique links for each form submission
- **Response Page Integration**: Links appear directly on the Google Form confirmation page
- **Personalized Content**: Each link shows customized content based on form responses
- **Easy Setup**: Simple Google Apps Script add-on with a user-friendly interface
- **Flexible Backend**: Node.js backend that can be customized for any use case
- **Real-time Updates**: Links are generated and displayed immediately after form submission

## 🚀 How It Works

1. **User submits Google Form** → Form data is captured
2. **Apps Script triggers** → Processes the submission
3. **Backend generates link** → Creates unique URL with form data
4. **Link appears on confirmation page** → User sees their personalized link
5. **User clicks link** → Accesses customized content page

## 📋 Prerequisites

- Google account with access to Google Forms and Apps Script
- Node.js and npm installed
- A hosting service for the backend (Heroku, Vercel, etc.)

## 🛠️ Installation

### Step 1: Backend Setup

1. **Clone or download this repository**
```bash
git clone <your-repo-url>
cd dynamic-link-generator
```

2. **Install dependencies**
```bash
cd backend
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env file with your configuration
```

4. **Start the backend server**
```bash
npm run dev
```

5. **Deploy to your hosting service**
   - Update `BASE_URL` in `.env` with your deployed URL
   - Deploy using your preferred service (Heroku, Vercel, Railway, etc.)

### Step 2: Google Apps Script Setup

1. **Open Google Apps Script**
   - Go to [script.google.com](https://script.google.com)
   - Create a new project

2. **Add the code files**
   - Replace `Code.gs` with the content from `google-apps-script/Code.gs`
   - Create `Sidebar.html` with the content from `google-apps-script/Sidebar.html`

3. **Update configuration**
   - In `Code.gs`, update `BACKEND_URL` with your deployed backend URL

4. **Save and authorize**
   - Save the project
   - Run any function to trigger authorization
   - Grant necessary permissions

### Step 3: Google Form Integration

1. **Open your Google Form**
   - Go to [forms.google.com](https://forms.google.com)
   - Open an existing form or create a new one

2. **Add the script to your form**
   - In Google Forms, click the three dots menu
   - Select "Script editor"
   - Paste the Apps Script code

3. **Configure the add-on**
   - In your form, click the puzzle piece icon (Add-ons)
   - Select "Dynamic Link Generator"
   - Click "Configure Dynamic Links"
   - Enable dynamic links and customize the message

## 🎯 Usage

### For Form Creators

1. **Enable Dynamic Links**
   - Open your Google Form
   - Click the add-on menu and select "Configure Dynamic Links"
   - Enable the feature and customize your message

2. **Test the Form**
   - Submit a test response
   - Check that the dynamic link appears on the confirmation page
   - Click the link to see the personalized content

### For Form Respondents

1. **Fill out the form** as usual
2. **Submit the form**
3. **See the dynamic link** on the confirmation page
4. **Click the link** to access personalized content

## 🎨 Customization

### Backend Customization

The backend can be customized to:
- **Change the dynamic page design** (modify `generateDynamicContent()` function)
- **Add database storage** (replace in-memory storage)
- **Integrate with external services** (payments, CRM, etc.)
- **Add authentication** (protect links with passwords)
- **Send email notifications** (automatically email links to users)

### Apps Script Customization

The Apps Script can be modified to:
- **Change trigger timing** (modify `setupFormSubmitTrigger()`)
- **Customize confirmation messages** (edit `updateConfirmationWithLink()`)
- **Add form validation** (validate responses before generating links)
- **Integrate with Google Sheets** (store additional data)

## 📊 API Endpoints

### POST `/api/generate-link`
Generate a new dynamic link
```json
{
  "formId": "form-id",
  "submissionId": "submission-id",
  "formData": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### GET `/link/:linkId`
Access a dynamic link (returns HTML page)

### GET `/api/link-stats/:linkId`
Get statistics for a specific link
```json
{
  "success": true,
  "stats": {
    "id": "link-id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "accessed": true,
    "accessCount": 5,
    "lastAccessed": "2024-01-01T12:00:00.000Z"
  }
}
```

### POST `/webhook/form-submission`
Webhook for form submissions (called by Apps Script)

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `BASE_URL` | Your deployed backend URL | `https://yourdomain.com` |
| `CORS_ORIGIN` | CORS origin setting | `*` |

### Apps Script Configuration

| Setting | Description |
|---------|-------------|
| `BACKEND_URL` | Your backend server URL |
| `API_ENDPOINT` | API endpoint for generating links |
| `WEBHOOK_ENDPOINT` | Webhook endpoint for form submissions |

## 🎭 Use Cases

This system can be used for:

- **Event Registration**: Generate ticket links or event details
- **Order Confirmations**: Show order status and tracking information
- **Survey Follow-ups**: Provide personalized results or recommendations
- **Application Status**: Show application progress and next steps
- **Payment Processing**: Similar to payableapps.com - generate payment links
- **Document Generation**: Create personalized PDFs or certificates
- **Appointment Booking**: Show booking confirmations and calendar links

## 🔍 How Payableapps.com Does It

Payableapps.com uses a similar approach:

1. **Google Forms Add-on**: Built with Apps Script
2. **Form Submission Trigger**: Captures form data when submitted
3. **Payment Link Generation**: Creates unique Stripe/PayPal checkout links
4. **Confirmation Page**: Shows the payment link on form confirmation
5. **Backend Processing**: Handles payment processing and order management

Our implementation provides the same foundation and can be extended for payment processing, e-commerce, or any other use case.

## 🚨 Troubleshooting

### Common Issues

1. **Links not appearing**
   - Check that the add-on is enabled
   - Verify backend URL is correct and accessible
   - Check Apps Script execution transcript for errors

2. **Backend connection failed**
   - Ensure backend is deployed and running
   - Check CORS settings
   - Verify environment variables

3. **Form submissions not triggering**
   - Check that triggers are properly set up
   - Verify form has required permissions
   - Check Apps Script quotas and limits

### Debug Mode

Enable debug logging by:
1. Adding console.log statements in Apps Script
2. Checking execution transcript in Apps Script editor
3. Monitoring backend logs

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you need help setting this up or have questions:
- Create an issue in this repository
- Check the troubleshooting section
- Review the Google Apps Script documentation

## 🌟 Examples

Check out these example implementations:
- **Basic Registration Form**: Simple event registration with confirmation links
- **Payment Form**: E-commerce form with payment processing (similar to Payable)
- **Survey Form**: Research survey with personalized results
- **Application Form**: Job application with status tracking

---

**Made with ❤️ for the Google Forms community**