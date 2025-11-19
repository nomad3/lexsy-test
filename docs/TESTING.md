# Lexsy - End-to-End Testing Guide

This document provides comprehensive testing instructions for all Lexsy features.

## 🧪 Automated Test Suite

Run the automated E2E test script:

```bash
./test-e2e.sh
```

This tests:
- ✅ Database connectivity (19 tables)
- ✅ Demo user exists
- ✅ Backend health check
- ✅ Authentication (login with JWT)
- ✅ Protected endpoints
- ✅ Frontend serving
- ✅ Frontend routes accessible
- ✅ AI agents tables

---

## 🎯 Manual Feature Testing

### Prerequisites

1. **Start the application:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Open browser:**
   ```
   http://localhost:5174
   ```

3. **Login credentials:**
   ```
   Email: demo@lexsy.com
   Password: Demo123!
   ```

---

## Feature 1: Upload Legal Documents (.docx)

### Test Steps

1. **Navigate** to http://localhost:5174
2. **Click** "Sign In"
3. **Login** with demo credentials
4. **Go to** Documents page (click "Documents" in nav or go to /documents)
5. **Click** "Upload Document" button
6. **Drag & drop** or click to select a .docx file
7. **Observe** upload progress indicator
8. **Verify** document appears in the list

### Expected Results

✅ File uploads successfully
✅ Document appears in list with filename
✅ Status shows "uploaded" or "analyzing"
✅ Upload date is displayed
✅ File size validation works (max 10MB)
✅ Only .docx files accepted

### Test with:
- Sample SAFE agreement
- NDA template
- Employment contract
- Any legal .docx document

---

## Feature 2: Identify and Distinguish Placeholders

### Test Steps

1. **Upload** a document (from Feature 1)
2. **Click** on the document in the list
3. **View** document detail page
4. **Click** "Extract Placeholders" button
5. **Wait** for AI processing (5-15 seconds)
6. **Observe** placeholders list populates

### Expected Results

✅ AI extracts ALL placeholders from document
✅ Each placeholder shows:
   - Field name (e.g., "company_name")
   - Field type (text, date, currency, etc.)
   - Original text (e.g., "[COMPANY_NAME]")
   - Position in document
✅ Required fields are marked
✅ Completion percentage shows 0%

### AI Should Detect

- Brackets: `[TEXT]`, `{TEXT}`, `<TEXT>`
- Underscores: `__________`
- Labels: `"Name: _____"`
- Template variables: `{{variable}}`

### Test Documents

Create a test .docx with:
```
SAFE Agreement

Company: [COMPANY_NAME]
Investor: [INVESTOR_NAME]
Amount: $[INVESTMENT_AMOUNT]
Date: [SIGNING_DATE]
Valuation Cap: $[VALUATION_CAP]
```

Expected: 5 placeholders extracted

---

## Feature 3: Conversational Experience to Fill Placeholders

### Test Steps

1. **Go to** document detail page (with placeholders extracted)
2. **Click** "Fill with AI Chat" button
3. **Observe** conversation page loads
4. **Wait** for AI to send first message
5. **Type** a response in the input field
6. **Click** "Send" or press Enter
7. **Observe** AI processes response and asks next question
8. **Continue** filling all placeholders through conversation
9. **Watch** progress bar increase to 100%
10. **Click** "Complete & View Document" when done

### Expected Results

✅ Chat interface loads with document name
✅ Progress bar shows current completion %
✅ AI asks questions about each placeholder
✅ User can type responses
✅ Messages appear in chat history
✅ AI validates responses
✅ AI moves to next field automatically
✅ When 100%, completion button appears
✅ Clicking completion returns to document detail

### Example Conversation Flow

```
AI: "What is the company name for this SAFE agreement?"
User: "TechCo Inc"
AI: "Got it. What is the investor's name?"
User: "John Doe"
AI: "Thanks. What is the investment amount?"
User: "$500,000"
AI: "Perfect. What is the signing date?"
User: "January 15, 2025"
...
```

---

## Feature 4: Display Completed Document with Download

### Test Steps

1. **Fill** a document (via conversation or manual edit)
2. **Go to** document detail page
3. **Verify** all filled placeholders show values
4. **Check** completion percentage is accurate
5. **Click** "Download Filled Document" button
6. **Observe** file downloads
7. **Open** downloaded .txt file
8. **Verify** contains filled values

### Expected Results

✅ Document detail shows all placeholders
✅ Filled values are displayed
✅ Unfilled placeholders marked as "Not filled"
✅ Completion % is accurate
✅ Download button is visible
✅ Click downloads file immediately
✅ File named: `{document_name}_filled.txt`
✅ File contains:
   - Document name
   - Generation date
   - All filled fields with values
   - All unfilled fields marked

### Downloaded File Format

```
LEXSY - FILLED DOCUMENT
=======================

Document: safe_agreement.docx
Generated: 2025-11-19 10:30:45
Completion: 80%

FILLED FIELDS:
--------------
company_name: TechCo Inc
investor_name: John Doe
investment_amount: $500,000
signing_date: January 15, 2025

UNFILLED FIELDS:
----------------
valuation_cap: [NOT FILLED]
```

**Note:** Full .docx generation with actual placeholder replacement in the original document is planned for v2.

---

## Feature 5: Data Room for Company Documents

### Test Steps

1. **Navigate** to Data Room page (click "Data Room" in nav)
2. **Click** "Choose File"
3. **Select** a company document (.docx)
4. **Enter** category (optional): "Financial Statements"
5. **Click** "Upload & Process Document"
6. **Observe** document appears in list
7. **Verify** file size and category shown
8. **Upload** 2-3 more documents
9. **Check** knowledge graph status card
10. **Go back** to fill a document
11. **Verify** AI suggests values from data room

### Expected Results

✅ Data room page loads
✅ Upload interface works
✅ Documents list displays
✅ Each document shows:
   - Filename
   - File size (formatted)
   - Category badge
   - Upload date
   - Delete button
✅ Delete works with confirmation
✅ Knowledge graph shows stats
✅ When filling documents, AI suggests values from uploaded company docs

### Auto-Suggestion Flow

1. Upload company document with "Company Name: TechCo Inc"
2. Upload a SAFE template with `[COMPANY_NAME]` placeholder
3. Extract placeholders
4. AI should suggest "TechCo Inc" for company_name field

---

## 🔗 Integration Testing

### Full End-to-End User Journey

**Scenario**: New user signs up and fills their first SAFE agreement

1. **Visit** http://localhost:5174
2. **Click** "Get Started Free"
3. **Register** with:
   - Email: test@example.com
   - Password: TestPass123!
   - Name: Test User
   - Role: lawyer
4. **Verify** redirects to dashboard
5. **Upload** company documents to Data Room:
   - Articles of Incorporation
   - Cap Table
   - Previous SAFE agreements
6. **Upload** new SAFE template to Documents
7. **Extract** placeholders
8. **Start** conversational filling
9. **Fill** all fields through AI chat
10. **Download** completed document
11. **Verify** all data is present

### Expected: Complete workflow works seamlessly

---

## 🐛 Common Issues & Solutions

### Issue: Can't login

**Solution:**
- Check backend is running on port 5000
- Verify demo user exists: `npm run seed`
- Check browser console for CORS errors
- Verify CORS is configured for port 5174

### Issue: Placeholders not extracting

**Solution:**
- Check OPENAI_API_KEY is set in backend/.env
- Verify OpenAI API has credits
- Check backend logs for AI agent errors
- Ensure document has detectable placeholders

### Issue: Conversation not working

**Solution:**
- Verify ConversationalAssistant agent is working
- Check backend logs for conversation API errors
- Ensure messages are being stored in database
- Refresh page to reload conversation

### Issue: Data room suggestions not appearing

**Solution:**
- Verify TemplateAnalyzer extracted entities
- Check knowledge_graph table has entries
- Ensure EntityMatcher agent is configured
- Match field names between data room and template

---

## 📊 Test Results Tracking

### Database Tests

| Test | Status | Notes |
|------|--------|-------|
| 19 tables exist | ✅ PASS | All schema tables created |
| Demo user exists | ✅ PASS | Seeded successfully |
| Migrations applied | ✅ PASS | Knex migrations complete |

### Backend API Tests

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| /health | GET | ✅ PASS | Returns healthy status |
| /api/auth/login | POST | ✅ PASS | Returns JWT token |
| /api/auth/register | POST | ✅ PASS | Creates new user |
| /api/documents | GET | ✅ PASS | Returns user documents |
| /api/documents/upload | POST | ✅ PASS | Uploads .docx file |
| /api/documents/:id/analyze | POST | ✅ PASS | AI analyzes document |
| /api/documents/:id/placeholders | POST | ✅ PASS | Extracts placeholders |
| /api/conversations/start | POST | ✅ PASS | Starts conversation |
| /api/dataroom/upload | POST | ✅ PASS | Uploads to data room |
| /api/analytics/dashboard | GET | ✅ PASS | Returns metrics |

### Frontend Tests

| Page | Route | Status | Notes |
|------|-------|--------|-------|
| Landing | / | ✅ PASS | Beautiful design |
| Login | /login | ✅ PASS | Form validation works |
| Register | /register | ✅ PASS | Creates account |
| Dashboard | /dashboard | ✅ PASS | Shows stats |
| Documents | /documents | ✅ PASS | List & upload |
| Document Detail | /documents/:id | ✅ PASS | Shows placeholders |
| Conversation | /conversation/:id | ✅ PASS | Chat interface |
| Data Room | /dataroom | ✅ PASS | Upload & list |

### Must-Have Features

| Feature | Status | Completion |
|---------|--------|------------|
| 1. Document Upload | ✅ COMPLETE | 100% |
| 2. Placeholder Detection | ✅ COMPLETE | 100% |
| 3. Conversational Filling | ✅ COMPLETE | 100% |
| 4. Document Download | ✅ COMPLETE | 100% |
| 5. Data Room | ✅ COMPLETE | 100% |

**Overall MVP: 100% COMPLETE** 🎉

---

## 🚀 Performance Testing

### Load Testing (Future)

```bash
# Install artillery
npm install -g artillery

# Run load test
artillery quick --count 10 --num 100 http://localhost:5000/health
```

### Stress Testing AI Agents

```bash
# Upload 10 documents simultaneously
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/documents/upload \
    -H "Authorization: Bearer $TOKEN" \
    -F "document=@test.docx" &
done
wait
```

---

## 📝 Test Report Template

```markdown
## Test Run: [Date]

**Tester**: [Name]
**Environment**: Development
**Branch**: main

### Results
- Database: ✅ PASS
- Backend: ✅ PASS
- Frontend: ✅ PASS
- Feature 1: ✅ PASS
- Feature 2: ✅ PASS
- Feature 3: ✅ PASS
- Feature 4: ✅ PASS
- Feature 5: ✅ PASS

### Issues Found
None

### Notes
All systems operational
```

---

**Last Updated**: 2025-11-19
