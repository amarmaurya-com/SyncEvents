## SMART EVENT MANAGER(SyncEvents) - Complete Project Specification

## Project Overview

**Name:** SMART Event Manager  
**Type:** Web Application (MERN Stack)  
**Purpose:** Academic institution event management system with data collection and analytics capabilities  
**Target Users:** Master Admins, Event Coordinators, Participants/Teams  

---

## Problem Statement

Academic institutions organize multiple events requiring participation from within and outside the institution. These events can have individual or team participation. The main challenge is efficient **data collection and analytics**.

The SMART Event Manager web platform addresses:
- Event creation and management
- Coordinator assignment and access control
- Flexible participation settings (individual/team, gender requirements)
- Registration management with duplicate prevention
- Data analytics and visualization
- Certificate generation (participation and achievement)

---

## System Architecture

### Technology Stack: MERN

- **M**ongoDB - NoSQL database for flexible document storage
- **E**xpress.js - Backend REST API framework
- **R**eact.js - Frontend UI library with component-based architecture
- **N**ode.js - JavaScript runtime environment

### Architecture Pattern
- **Three-tier architecture:** Frontend (React) → Backend (Express/Node.js) → Database (MongoDB)
- **RESTful API:** Stateless communication between frontend and backend
- **JWT Authentication:** Token-based authentication and authorization
- **Role-based Access Control (RBAC):** Three distinct user roles with different permissions

---

## User Roles and Capabilities

### 1. Master Admin (Highest Privilege)

**Capabilities:**
- ✅ Create, Read, Update, Delete (CRUD) events
- ✅ Create, Read, Update, Delete (CRUD) coordinators
- ✅ Assign one or more coordinators to events (many-to-many relationship)
- ✅ View comprehensive analytics for all events (summarized and detailed)
- ✅ Access visualized dashboard with key metrics
- ✅ Full system oversight and control

**Dashboard Components:**
- Total events (active, completed, upcoming)
- Participation trends across all events
- Institution-wise breakdown
- Gender distribution statistics
- Coordinator workload overview
- Event performance metrics

### 2. Event Coordinator (Event-Level Access)

**Capabilities:**
- ✅ Access only assigned events (scope-limited view)
- ✅ Configure event settings:
  - Individual vs Team participation
  - Team size constraints (min/max members)
  - Gender-specific requirements (e.g., "team must include at least 1 female")
  - Registration open/close dates
  - Event capacity limits
- ✅ View and manage participant lists with filters/search
- ✅ Prevent duplicate registrations
- ✅ Mark winning participants/teams
- ✅ Generate and manage certificates:
  - Participation certificates
  - Achievement certificates
- ✅ View event-specific analytics and statistics

**Dashboard Components:**
- Assigned events overview
- Registration trends (timeline chart)
- Participant demographics
- Team composition analysis
- Registration status tracking
- Certificate generation interface

### 3. Participant/Team (User-Level Access)

**Capabilities:**
- ✅ Browse available events with filters
- ✅ Enroll in events (individual or as team)
- ✅ Create and manage teams for team-based events
- ✅ Withdraw from events before deadline
- ✅ View personal participation statistics across events
- ✅ Download participation certificates
- ✅ Download achievement certificates (if winner)
- ✅ Track registration status

**Dashboard Components:**
- Available events browser
- My registered events
- Participation history
- My certificates collection
- Team management interface

---

## Database Schema (MongoDB Collections)

### Collection: users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed with bcrypt),
  role: String (enum: ['admin', 'coordinator', 'participant']),
  gender: String (enum: ['male', 'female', 'other']),
  institution: String,
  contactNumber: String,
  profileImage: String (URL),
  createdAt: Date,
  updatedAt: Date,
  isActive: Boolean
}
```

### Collection: events
```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  eventType: String (enum: ['technical', 'cultural', 'sports', 'academic', 'other']),
  participationType: String (enum: ['individual', 'team']),
  
  // Team configuration (only if participationType = 'team')
  teamConfig: {
    minTeamSize: Number,
    maxTeamSize: Number,
    genderRequirement: String (e.g., "at least 1 female", "at least 1 male", "mixed", "none"),
    allowCrossInstitution: Boolean
  },
  
  // Registration settings
  registrationStartDate: Date,
  registrationEndDate: Date,
  maxParticipants: Number (optional capacity limit),
  
  // Event details
  eventDate: Date,
  venue: String,
  
  // Coordinator assignment (many-to-many)
  coordinators: [{ type: ObjectId, ref: 'User' }],
  
  // Status tracking
  status: String (enum: ['draft', 'open', 'ongoing', 'completed', 'cancelled']),
  
  // Created by admin
  createdBy: { type: ObjectId, ref: 'User' },
  
  // Metadata
  createdAt: Date,
  updatedAt: Date,
  
  // Additional fields
  bannerImage: String (URL),
  rules: String,
  prizes: [String]
}
```

### Collection: registrations (Individual Participants)
```javascript
{
  _id: ObjectId,
  eventId: { type: ObjectId, ref: 'Event', required: true },
  participantId: { type: ObjectId, ref: 'User', required: true },
  
  // Registration metadata
  registrationDate: Date,
  status: String (enum: ['registered', 'withdrawn', 'participated', 'absent']),
  
  // Winner tracking
  isWinner: Boolean,
  rank: Number (optional: 1, 2, 3 for podium positions),
  
  // Withdrawal tracking
  withdrawnAt: Date,
  withdrawalReason: String,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}

// Compound unique index to prevent duplicates
Index: { eventId: 1, participantId: 1 }, { unique: true }
```

### Collection: teams
```javascript
{
  _id: ObjectId,
  teamName: String (required),
  eventId: { type: ObjectId, ref: 'Event', required: true },
  
  // Team leader
  leaderId: { type: ObjectId, ref: 'User', required: true },
  
  // Team members (including leader)
  members: [{
    userId: { type: ObjectId, ref: 'User' },
    role: String (enum: ['leader', 'member']),
    joinedAt: Date
  }],
  
  // Registration status
  registrationDate: Date,
  status: String (enum: ['registered', 'withdrawn', 'participated', 'absent']),
  
  // Winner tracking
  isWinner: Boolean,
  rank: Number,
  
  // Withdrawal
  withdrawnAt: Date,
  withdrawalReason: String,
  
  // Validation flags
  meetsGenderRequirement: Boolean,
  meetsTeamSizeRequirement: Boolean,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}

// Index to prevent duplicate team names per event
Index: { eventId: 1, teamName: 1 }, { unique: true }
```

### Collection: certificates
```javascript
{
  _id: ObjectId,
  certificateNumber: String (unique, e.g., "CERT-EVT123-USR456-001"),
  
  // References
  participantId: { type: ObjectId, ref: 'User', required: true },
  eventId: { type: ObjectId, ref: 'Event', required: true },
  teamId: { type: ObjectId, ref: 'Team' }, // Optional, for team events
  
  // Certificate details
  certificateType: String (enum: ['participation', 'achievement', 'winner']),
  rank: Number, // For achievement certificates (1st, 2nd, 3rd)
  
  // Generation metadata
  generatedAt: Date,
  generatedBy: { type: ObjectId, ref: 'User' }, // Coordinator who generated it
  
  // PDF storage
  pdfUrl: String, // Path or URL to stored PDF
  
  // Download tracking
  downloadCount: Number,
  lastDownloadedAt: Date,
  
  // Verification
  qrCodeData: String, // For certificate verification
  isVerified: Boolean,
  
  // Timestamps
  createdAt: Date
}

// Index for quick lookups
Index: { certificateNumber: 1 }, { unique: true }
Index: { participantId: 1, eventId: 1 }
```

### Collection: notifications (Optional - Future Enhancement)
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User' },
  eventId: { type: ObjectId, ref: 'Event' },
  type: String (enum: ['event_created', 'registration_confirmed', 'registration_opening', 'event_reminder', 'certificate_ready']),
  message: String,
  isRead: Boolean,
  createdAt: Date
}
```

---

## API Endpoints Structure

### Authentication Routes (`/api/auth`)

```
POST   /api/auth/register
  Body: { name, email, password, role, gender, institution }
  Response: { user, token }
  
POST   /api/auth/login
  Body: { email, password }
  Response: { user, token }
  
GET    /api/auth/me
  Headers: { Authorization: Bearer <token> }
  Response: { user }
  
POST   /api/auth/logout
  Headers: { Authorization: Bearer <token> }
  Response: { message }
```

### Event Routes (`/api/events`)

```
// Master Admin only
POST   /api/events
  Headers: { Authorization: Bearer <token> }
  Body: { name, description, eventType, participationType, teamConfig, registrationStartDate, registrationEndDate, eventDate, venue }
  Response: { event }
  
PUT    /api/events/:id
  Headers: { Authorization: Bearer <token> }
  Body: { fields to update }
  Response: { event }
  
DELETE /api/events/:id
  Headers: { Authorization: Bearer <token> }
  Response: { message }
  
// All authenticated users
GET    /api/events
  Query: ?status=open&type=technical&page=1&limit=20
  Response: { events[], totalCount, currentPage, totalPages }
  
GET    /api/events/:id
  Response: { event }
```

### Coordinator Assignment Routes (`/api/events/:eventId/coordinators`)

```
// Master Admin only
POST   /api/events/:eventId/coordinators
  Headers: { Authorization: Bearer <token> }
  Body: { coordinatorId }
  Response: { event, message }
  
DELETE /api/events/:eventId/coordinators/:coordinatorId
  Headers: { Authorization: Bearer <token> }
  Response: { event, message }
  
GET    /api/events/:eventId/coordinators
  Response: { coordinators[] }
```

### Event Configuration Routes (`/api/events/:eventId/config`)

```
// Coordinators only (for assigned events)
PUT    /api/events/:eventId/config
  Headers: { Authorization: Bearer <token> }
  Body: { participationType, teamConfig, registrationStartDate, registrationEndDate, maxParticipants }
  Response: { event }
```

### Registration Routes (`/api/registrations`)

```
// Individual registration
POST   /api/registrations
  Headers: { Authorization: Bearer <token> }
  Body: { eventId }
  Response: { registration }
  
// Withdraw from event
DELETE /api/registrations/:registrationId
  Headers: { Authorization: Bearer <token> }
  Body: { reason }
  Response: { message }
  
// Get my registrations
GET    /api/registrations/me
  Headers: { Authorization: Bearer <token> }
  Response: { registrations[] }
  
// Get registrations for an event (Coordinators only)
GET    /api/events/:eventId/registrations
  Headers: { Authorization: Bearer <token> }
  Query: ?status=registered&institution=SMS
  Response: { registrations[], count }
```

### Team Routes (`/api/teams`)

```
POST   /api/teams
  Headers: { Authorization: Bearer <token> }
  Body: { teamName, eventId, members: [userId1, userId2] }
  Response: { team }
  
PUT    /api/teams/:teamId
  Headers: { Authorization: Bearer <token> }
  Body: { teamName, members }
  Response: { team }
  
DELETE /api/teams/:teamId/withdraw
  Headers: { Authorization: Bearer <token> }
  Body: { reason }
  Response: { message }
  
GET    /api/teams/:teamId
  Response: { team }
  
POST   /api/teams/:teamId/members
  Headers: { Authorization: Bearer <token> }
  Body: { userId }
  Response: { team }
  
DELETE /api/teams/:teamId/members/:userId
  Headers: { Authorization: Bearer <token> }
  Response: { team }
```

### Winner Management Routes (`/api/events/:eventId/winners`)

```
// Coordinators only
POST   /api/events/:eventId/winners
  Headers: { Authorization: Bearer <token> }
  Body: { participantId OR teamId, rank }
  Response: { message }
  
GET    /api/events/:eventId/winners
  Response: { winners[] }
```

### Certificate Routes (`/api/certificates`)

```
// Generate individual certificate
POST   /api/certificates/generate
  Headers: { Authorization: Bearer <token> }
  Body: { participantId, eventId, certificateType }
  Response: { certificate }
  
// Batch generate for event (Coordinators only)
POST   /api/events/:eventId/certificates/batch
  Headers: { Authorization: Bearer <token> }
  Body: { certificateType }
  Response: { count, message }
  
// Download certificate (PDF)
GET    /api/certificates/:certificateId/download
  Headers: { Authorization: Bearer <token> }
  Response: PDF file stream
  
// Get my certificates
GET    /api/certificates/me
  Headers: { Authorization: Bearer <token> }
  Response: { certificates[] }
  
// Verify certificate
GET    /api/certificates/verify/:certificateNumber
  Response: { isValid, certificate }
```

### Analytics Routes (`/api/analytics`)

```
// Master Admin - Global analytics
GET    /api/analytics/overview
  Headers: { Authorization: Bearer <token> }
  Response: { totalEvents, totalParticipants, eventsByType, participationTrends, genderDistribution, institutionBreakdown }
  
// Event-specific analytics (Coordinators)
GET    /api/analytics/events/:eventId
  Headers: { Authorization: Bearer <token> }
  Response: { registrationTrend, genderStats, institutionStats, teamStats, participationStatus }
  
// Participant analytics
GET    /api/analytics/participants/me
  Headers: { Authorization: Bearer <token> }
  Response: { totalEventsParticipated, eventsByType, certificatesEarned, participationTimeline }
```

---

## Frontend Structure (React)

### Folder Structure
```
client/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── assets/
│       ├── logo.png
│       └── certificate-template.png
│
├── src/
│   ├── App.jsx
│   ├── index.js
│   ├── App.css
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── admin/
│   │   │   ├── EventForm.jsx
│   │   │   ├── EventList.jsx
│   │   │   ├── CoordinatorManagement.jsx
│   │   │   ├── CoordinatorAssignment.jsx
│   │   │   ├── AnalyticsDashboard.jsx
│   │   │   └── EventAnalytics.jsx
│   │   │
│   │   ├── coordinator/
│   │   │   ├── AssignedEvents.jsx
│   │   │   ├── EventConfiguration.jsx
│   │   │   ├── ParticipantList.jsx
│   │   │   ├── TeamList.jsx
│   │   │   ├── WinnerSelection.jsx
│   │   │   ├── CertificateGenerator.jsx
│   │   │   └── EventStats.jsx
│   │   │
│   │   └── participant/
│   │       ├── EventBrowser.jsx
│   │       ├── EventDetails.jsx
│   │       ├── RegistrationForm.jsx
│   │       ├── TeamCreation.jsx
│   │       ├── TeamManagement.jsx
│   │       ├── MyEvents.jsx
│   │       ├── MyCertificates.jsx
│   │       └── ParticipationStats.jsx
│   │
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── CoordinatorDashboard.jsx
│   │   ├── ParticipantDashboard.jsx
│   │   ├── ProfilePage.jsx
│   │   └── NotFoundPage.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── EventContext.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useEvents.js
│   │   └── useAnalytics.js
│   │
│   ├── services/
│   │   ├── api.js (Axios instance)
│   │   ├── authService.js
│   │   ├── eventService.js
│   │   ├── registrationService.js
│   │   ├── certificateService.js
│   │   └── analyticsService.js
│   │
│   ├── utils/
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   └── constants.js
│   │
│   └── styles/
│       ├── variables.css
│       ├── globals.css
│       └── responsive.css
│
└── package.json
```

### Key Components Description

#### Common Components
- **Navbar:** Top navigation with role-based menu items
- **Sidebar:** Dashboard navigation for admins and coordinators
- **ProtectedRoute:** HOC for route authorization based on user role
- **Table:** Reusable data table with sorting, filtering, pagination
- **Modal:** Reusable modal for forms and confirmations

#### Admin Components
- **EventForm:** Create/edit event with all configuration options
- **CoordinatorAssignment:** Multi-select component to assign coordinators to events
- **AnalyticsDashboard:** Charts showing system-wide metrics (Chart.js)

#### Coordinator Components
- **EventConfiguration:** Form to configure participation settings, dates, requirements
- **ParticipantList:** Searchable, filterable table of registered participants
- **WinnerSelection:** Interface to mark participants/teams as winners with rank
- **CertificateGenerator:** Batch or individual certificate generation interface

#### Participant Components
- **EventBrowser:** Grid/list view of available events with filters (type, date, status)
- **RegistrationForm:** Individual or team registration form with validation
- **TeamManagement:** Create team, add/remove members, view team details
- **MyCertificates:** Gallery view of earned certificates with download buttons

---

## Backend Structure (Express/Node.js)

### Folder Structure
```
server/
├── config/
│   ├── db.js (MongoDB connection)
│   ├── cloudinary.js (Image upload - optional)
│   └── email.js (Email service config) //not work on this at yet
│
├── models/
│   ├── User.js
│   ├── Event.js
│   ├── Registration.js
│   ├── Team.js
│   ├── Certificate.js
│   └── Notification.js
│
├── controllers/
│   ├── authController.js
│   ├── eventController.js
│   ├── registrationController.js
│   ├── teamController.js
│   ├── certificateController.js
│   ├── coordinatorController.js
│   ├── winnerController.js
│   └── analyticsController.js
│
├── routes/
│   ├── auth.js
│   ├── events.js
│   ├── registrations.js
│   ├── teams.js
│   ├── certificates.js
│   ├── coordinators.js
│   └── analytics.js
│
├── middleware/
│   ├── authMiddleware.js (JWT verification)
│   ├── roleMiddleware.js (Role-based access)
│   ├── errorHandler.js
│   ├── validator.js (Input validation)
│   └── upload.js (File upload - Multer)
│
├── utils/
│   ├── generateToken.js
│   ├── sendEmail.js
│   ├── pdfGenerator.js (Certificate PDF generation)
│   ├── qrCodeGenerator.js
│   └── validators.js
│
├── templates/
│   ├── participationCertificate.js
│   └── achievementCertificate.js
│
├── uploads/ (for temporary file storage)
├── certificates/ (generated PDFs)
│
├── .env
├── server.js (Entry point)
└── package.json
```

---

## Key Features Implementation Details

### 1. Duplicate Registration Prevention

**Database Level:**
```javascript
// Compound unique index in Registration model
registrationSchema.index({ eventId: 1, participantId: 1 }, { unique: true });
```

**Application Level:**
```javascript
// In registrationController.js
const existingRegistration = await Registration.findOne({
  eventId: req.body.eventId,
  participantId: req.user._id
});

if (existingRegistration) {
  return res.status(400).json({ 
    error: 'You are already registered for this event' 
  });
}

// For team events, check if participant is in another team
const existingTeamMembership = await Team.findOne({
  eventId: req.body.eventId,
  'members.userId': req.user._id
});

if (existingTeamMembership) {
  return res.status(400).json({ 
    error: 'You are already part of a team for this event' 
  });
}
```

**Frontend Validation:**
```javascript
// Real-time check before form submission
const checkDuplicateRegistration = async (eventId) => {
  const response = await axios.get(
    `/api/registrations/check/${eventId}`
  );
  return response.data.isRegistered;
};
```

### 2. Team Validation (Gender & Size Requirements)

**Validation Function:**
```javascript
// utils/validators.js
const validateTeamComposition = (team, event) => {
  const { minTeamSize, maxTeamSize, genderRequirement } = event.teamConfig;
  
  // Check team size
  if (team.members.length < minTeamSize || team.members.length > maxTeamSize) {
    return {
      valid: false,
      error: `Team size must be between ${minTeamSize} and ${maxTeamSize}`
    };
  }
  
  // Check gender requirement
  if (genderRequirement !== 'none') {
    const genderCounts = team.members.reduce((acc, member) => {
      acc[member.gender] = (acc[member.gender] || 0) + 1;
      return acc;
    }, {});
    
    if (genderRequirement === 'at least 1 female' && !genderCounts.female) {
      return { valid: false, error: 'Team must include at least 1 female member' };
    }
    
    if (genderRequirement === 'at least 1 male' && !genderCounts.male) {
      return { valid: false, error: 'Team must include at least 1 male member' };
    }
    
    if (genderRequirement === 'mixed' && (!genderCounts.female || !genderCounts.male)) {
      return { valid: false, error: 'Team must include both male and female members' };
    }
  }
  
  return { valid: true };
};
```

### 3. Certificate Generation (PDFKit)

**Certificate Generator:**
```javascript
// utils/pdfGenerator.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const QRCode = require('qrcode');

const generateParticipationCertificate = async (participant, event, certNumber) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      
      const filePath = `certificates/${certNumber}.pdf`;
      const stream = fs.createWriteStream(filePath);
      
      doc.pipe(stream);
      
      // Border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
         .lineWidth(3)
         .stroke('#1a1a1a');
      
      // Logo (if exists)
      if (fs.existsSync('assets/logo.png')) {
        doc.image('assets/logo.png', 50, 40, { width: 80 });
      }
      
      // Title
      doc.fontSize(40)
         .font('Helvetica-Bold')
         .fillColor('#1a1a1a')
         .text('Certificate of Participation', 0, 120, { align: 'center' });
      
      // Decorative line
      doc.moveTo(200, 180)
         .lineTo(doc.page.width - 200, 180)
         .lineWidth(2)
         .stroke('#4a90e2');
      
      // Body text
      doc.fontSize(18)
         .font('Helvetica')
         .fillColor('#333')
         .text('This is to certify that', 0, 220, { align: 'center' });
      
      // Participant name
      doc.fontSize(32)
         .font('Helvetica-Bold')
         .fillColor('#1a1a1a')
         .text(participant.name, 0, 260, { align: 'center' });
      
      // Underline for name
      const nameWidth = doc.widthOfString(participant.name);
      const nameX = (doc.page.width - nameWidth) / 2;
      doc.moveTo(nameX, 300)
         .lineTo(nameX + nameWidth, 300)
         .lineWidth(1)
         .stroke('#1a1a1a');
      
      // Event details
      doc.fontSize(18)
         .font('Helvetica')
         .fillColor('#333')
         .text(`has successfully participated in`, 0, 330, { align: 'center' });
      
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .fillColor('#4a90e2')
         .text(event.name, 0, 370, { align: 'center' });
      
      doc.fontSize(16)
         .font('Helvetica')
         .fillColor('#555')
         .text(`held on ${new Date(event.eventDate).toLocaleDateString('en-IN', { 
           day: 'numeric', 
           month: 'long', 
           year: 'numeric' 
         })}`, 0, 410, { align: 'center' });
      
      // Certificate number
      doc.fontSize(12)
         .fillColor('#666')
         .text(`Certificate No: ${certNumber}`, 50, doc.page.height - 100);
      
      // Date of issue
      doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 50, doc.page.height - 80);
      
      // QR Code for verification
      const qrCodeUrl = `${process.env.APP_URL}/verify/${certNumber}`;
      const qrDataUrl = await QRCode.toDataURL(qrCodeUrl);
      doc.image(qrDataUrl, doc.page.width - 150, doc.page.height - 150, { width: 100 });
      
      // Signature line
      doc.fontSize(12)
         .text('_____________________', doc.page.width - 250, doc.page.height - 100, { align: 'center' });
      doc.text('Authorized Signature', doc.page.width - 250, doc.page.height - 80, { align: 'center' });
      
      doc.end();
      
      stream.on('finish', () => {
        resolve(filePath);
      });
      
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateParticipationCertificate };
```

**Certificate Controller:**
```javascript
// controllers/certificateController.js
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const Event = require('../models/Event');
const { generateParticipationCertificate } = require('../utils/pdfGenerator');

exports.generateCertificate = async (req, res) => {
  try {
    const { participantId, eventId, certificateType } = req.body;
    
    // Fetch data
    const participant = await User.findById(participantId);
    const event = await Event.findById(eventId);
    
    if (!participant || !event) {
      return res.status(404).json({ error: 'Participant or event not found' });
    }
    
    // Check if certificate already exists
    const existingCert = await Certificate.findOne({ participantId, eventId, certificateType });
    if (existingCert) {
      return res.status(400).json({ error: 'Certificate already generated' });
    }
    
    // Generate unique certificate number
    const certNumber = `CERT-${eventId.toString().slice(-6)}-${participantId.toString().slice(-6)}-${Date.now().toString().slice(-4)}`;
    
    // Generate PDF
    const pdfPath = await generateParticipationCertificate(participant, event, certNumber);
    
    // Save to database
    const certificate = await Certificate.create({
      certificateNumber: certNumber,
      participantId,
      eventId,
      certificateType,
      pdfUrl: pdfPath,
      generatedBy: req.user._id,
      generatedAt: new Date(),
      downloadCount: 0
    });
    
    res.status(201).json({ 
      certificate,
      message: 'Certificate generated successfully' 
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.downloadCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.certificateId);
    
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    
    // Check authorization (only certificate owner can download)
    if (certificate.participantId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to download this certificate' });
    }
    
    // Update download count
    certificate.downloadCount += 1;
    certificate.lastDownloadedAt = new Date();
    await certificate.save();
    
    // Send PDF file
    res.download(certificate.pdfUrl, `certificate-${certificate.certificateNumber}.pdf`);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### 4. Analytics Implementation

**Analytics Controller:**
```javascript
// controllers/analyticsController.js
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const Team = require('../models/Team');

exports.getEventAnalytics = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Verify coordinator access
    const event = await Event.findById(eventId);
    if (!event.coordinators.includes(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Total registrations
    const totalRegistrations = await Registration.countDocuments({ eventId });
    
    // Gender distribution
    const genderStats = await Registration.aggregate([
      { $match: { eventId: mongoose.Types.ObjectId(eventId) } },
      { $lookup: { from: 'users', localField: 'participantId', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $group: { _id: '$user.gender', count: { $sum: 1 } } }
    ]);
    
    // Institution breakdown
    const institutionStats = await Registration.aggregate([
      { $match: { eventId: mongoose.Types.ObjectId(eventId) } },
      { $lookup: { from: 'users', localField: 'participantId', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $group: { _id: '$user.institution', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Registration trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const registrationTrend = await Registration.aggregate([
      { $match: { 
        eventId: mongoose.Types.ObjectId(eventId),
        registrationDate: { $gte: sevenDaysAgo }
      }},
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$registrationDate' } },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);
    
    // Status breakdown
    const statusStats = await Registration.aggregate([
      { $match: { eventId: mongoose.Types.ObjectId(eventId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    res.json({
      totalRegistrations,
      genderDistribution: genderStats,
      institutionBreakdown: institutionStats,
      registrationTrend,
      participationStatus: statusStats
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGlobalAnalytics = async (req, res) => {
  try {
    // Only admin can access
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Total events by status
    const eventStats = await Event.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Total participants
    const totalParticipants = await User.countDocuments({ role: 'participant' });
    
    // Events by type
    const eventsByType = await Event.aggregate([
      { $group: { _id: '$eventType', count: { $sum: 1 } } }
    ]);
    
    // Participation trends (monthly)
    const participationTrends = await Registration.aggregate([
      { $group: {
        _id: { 
          year: { $year: '$registrationDate' },
          month: { $month: '$registrationDate' }
        },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);
    
    res.json({
      eventStats,
      totalParticipants,
      eventsByType,
      participationTrends
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### 5. Authentication & Authorization

**JWT Middleware:**
```javascript
// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }
    
    // Attach user to request
    req.user = user;
    next();
    
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
```

**Role-Based Middleware:**
```javascript
// middleware/roleMiddleware.js
const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
      });
    }
    
    next();
  };
};

module.exports = roleCheck;
```

**Usage in Routes:**
```javascript
// routes/events.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleMiddleware');
const eventController = require('../controllers/eventController');

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

// Admin only routes
router.post('/', 
  authMiddleware, 
  roleCheck(['admin']), 
  eventController.createEvent
);

router.put('/:id', 
  authMiddleware, 
  roleCheck(['admin']), 
  eventController.updateEvent
);

router.delete('/:id', 
  authMiddleware, 
  roleCheck(['admin']), 
  eventController.deleteEvent
);

// Coordinator routes
router.put('/:id/config', 
  authMiddleware, 
  roleCheck(['coordinator', 'admin']), 
  eventController.configureEvent
);

module.exports = router;
```

---

## Environment Variables (.env)

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/smart-event-manager
# For MongoDB Atlas (production):
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-event-manager

# JWT Secret (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# File Upload
MAX_FILE_SIZE=5242880
# 5MB in bytes

# Certificate Generation
CERT_STORAGE_PATH=./certificates
APP_URL=http://localhost:5000

# Cloudinary (optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
# 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

---

## NPM Packages Required

### Backend Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.6.0",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "express-validator": "^7.0.1",
    "multer": "^1.4.5-lts.1",
    "pdfkit": "^0.13.0",
    "qrcode": "^1.5.3",
    "nodemailer": "^6.9.7",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "compression": "^1.7.4"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### Frontend Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.18.0",
    "axios": "^1.6.0",
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0",
    "date-fns": "^2.30.0",
    "react-toastify": "^9.1.3",
    "react-icons": "^4.11.0",
    "formik": "^2.4.5",
    "yup": "^1.3.3"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
```

---

## Validation Rules

### Event Validation
```javascript
// Event creation/update
{
  name: "required|string|min:3|max:100",
  description: "string|max:500",
  eventType: "required|in:technical,cultural,sports,academic,other",
  participationType: "required|in:individual,team",
  registrationStartDate: "required|date|after:now",
  registrationEndDate: "required|date|after:registrationStartDate",
  eventDate: "required|date|after:registrationEndDate",
  venue: "required|string",
  
  // Team config (if participationType = 'team')
  teamConfig: {
    minTeamSize: "required_if:participationType,team|integer|min:2",
    maxTeamSize: "required_if:participationType,team|integer|min:minTeamSize",
    genderRequirement: "string|in:at least 1 female,at least 1 male,mixed,none"
  }
}
```

### Registration Validation
```javascript
// Individual registration
{
  eventId: "required|mongoId|exists:events,_id"
}

// Team registration
{
  teamName: "required|string|min:3|max:50",
  eventId: "required|mongoId|exists:events,_id",
  members: "required|array|min:2",
  members.*: "required|mongoId|exists:users,_id"
}
```

### User Registration Validation
```javascript
{
  name: "required|string|min:3|max:50",
  email: "required|email|unique:users,email",
  password: "required|string|min:8|confirmed",
  role: "required|in:admin,coordinator,participant",
  gender: "required|in:male,female,other",
  institution: "required|string",
  contactNumber: "string|regex:/^[0-9]{10}$/"
}
```

---

## AI/ML Enhancement Opportunities

### 1. Smart Event Recommendations
```python
# Python microservice using collaborative filtering
# Input: User participation history
# Output: Recommended events

from sklearn.neighbors import NearestNeighbors
import pandas as pd

def recommend_events(user_id, participation_history):
    # Create user-event matrix
    # Apply collaborative filtering
    # Return top N recommended events
    pass
```

### 2. Attendance Prediction
```python
# Predict registration-to-attendance conversion rate
# Helps coordinators plan resources

from sklearn.ensemble import RandomForestClassifier

def predict_attendance(event_features, historical_data):
    # Features: event type, registration count, date, venue
    # Train model on historical attendance data
    # Predict attendance probability
    pass
```

### 3. Duplicate Detection with Fuzzy Matching
```javascript
// Detect similar names (handles typos)
const fuzzysort = require('fuzzysort');

const findSimilarNames = (newName, existingNames) => {
  const results = fuzzysort.go(newName, existingNames, { threshold: -10000 });
  return results.filter(r => r.score > -500); // Adjust threshold
};
```

### 4. Natural Language Event Search
```javascript
// NLP-based search using TF-IDF or embeddings
// "technical events in April" -> Filter by type + date

const nlpSearch = async (query) => {
  // Extract keywords using NLP library (natural, compromise)
  // Map to database filters
  // Return relevant events
};
```

### 5. Chatbot for Event Queries
```javascript
// Simple rule-based chatbot or integrate with OpenAI API

const handleUserQuery = async (question) => {
  // "What events are happening next week?"
  // "How do I register for a team event?"
  // Parse intent and provide relevant information
};
```

### 6. Certificate Fraud Detection
```javascript
// Blockchain-based verification (optional advanced feature)
// Or ML-based anomaly detection for suspicious downloads

const detectFraudulentCertificate = (certificateData) => {
  // Check for unusual patterns
  // Verify QR code authenticity
  // Cross-reference with database
};
```

---

## Development Phases (Suggested Roadmap)

### Phase 1: Foundation (Week 1-2)
- ✅ Setup project structure (MERN)
- ✅ Database schema and models
- ✅ User authentication (register, login, JWT)
- ✅ Basic routing and middleware
- ✅ Simple admin dashboard
- ✅ Event CRUD (Master Admin)

### Phase 2: Core Features (Week 3-4)
- ✅ Coordinator assignment (many-to-many)
- ✅ Event configuration system
- ✅ Individual registration
- ✅ Duplicate prevention
- ✅ Participant dashboard
- ✅ Basic event listing

### Phase 3: Advanced Features (Week 5-6)
- ✅ Team creation and management
- ✅ Team validation (gender, size)
- ✅ Winner marking system
- ✅ Coordinator dashboard
- ✅ Event status workflow
- ✅ Withdrawal functionality

### Phase 4: Analytics & Reporting (Week 7-8)
- ✅ Data visualization (Chart.js)
- ✅ Event-specific analytics
- ✅ Global analytics (Admin)
- ✅ Participant statistics
- ✅ Export to CSV/Excel
- ✅ Filters and search

### Phase 5: Certificate System (Week 9)
- ✅ PDF generation (PDFKit)
- ✅ Certificate templates
- ✅ QR code integration
- ✅ Batch generation
- ✅ Download management
- ✅ Certificate verification

### Phase 6: Polish & Testing (Week 10-11)
- ✅ Responsive design
- ✅ Input validation (frontend + backend)
- ✅ Error handling
- ✅ Email notifications
- ✅ Unit testing
- ✅ Integration testing
- ✅ Security hardening

### Phase 7: AI Features (Week 12 - Optional)
- ✅ Event recommendations
- ✅ Attendance prediction
- ✅ NLP search
- ✅ Chatbot integration

### Phase 8: Deployment (Week 13)
- ✅ Production environment setup
- ✅ Database migration
- ✅ Frontend deployment (Vercel/Netlify)
- ✅ Backend deployment (Heroku/Railway/DigitalOcean)
- ✅ SSL certificate
- ✅ Performance optimization

---

## Testing Strategy

### Backend Testing (Jest + Supertest)
```javascript
// tests/auth.test.js
describe('Authentication', () => {
  test('should register new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'participant'
      });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
  });
  
  test('should not allow duplicate email', async () => {
    // Create user first
    // Try to create again with same email
    // Expect 400 error
  });
});
```

### Frontend Testing (React Testing Library)
```javascript
// tests/EventCard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import EventCard from '../components/EventCard';

test('renders event card with correct data', () => {
  const event = { name: 'Hackathon', type: 'technical' };
  render(<EventCard event={event} />);
  expect(screen.getByText('Hackathon')).toBeInTheDocument();
});

test('calls registration handler on button click', () => {
  const handleRegister = jest.fn();
  render(<EventCard event={event} onRegister={handleRegister} />);
  fireEvent.click(screen.getByText('Register'));
  expect(handleRegister).toHaveBeenCalledTimes(1);
});
```

---

## Security Considerations

### 1. Password Security
```javascript
// Hash passwords with bcrypt (10 rounds)
const hashedPassword = await bcrypt.hash(password, 10);

// Never store plain text passwords
// Never send passwords in API responses
```

### 2. JWT Token Security
```javascript
// Set reasonable expiration (7 days)
// Store in httpOnly cookies (not localStorage)
// Implement refresh token mechanism
// Blacklist tokens on logout
```

### 3. Input Validation
```javascript
// Validate and sanitize all user inputs
// Use express-validator
// Prevent SQL injection (not applicable for MongoDB, but still validate)
// Prevent NoSQL injection
```

### 4. CORS Configuration
```javascript
// Allow only specific origins in production
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
```

### 5. Rate Limiting
```javascript
// Prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

### 6. File Upload Security
```javascript
// Validate file types
// Limit file sizes
// Sanitize filenames
// Scan for malware (if possible)
```

---

## Performance Optimization

### Database Indexing
```javascript
// Create indexes for frequently queried fields
eventSchema.index({ status: 1 });
eventSchema.index({ eventDate: 1 });
eventSchema.index({ coordinators: 1 });

registrationSchema.index({ eventId: 1, participantId: 1 }, { unique: true });
registrationSchema.index({ status: 1 });

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
```

### Pagination
```javascript
// Implement pagination for large datasets
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 20;
const skip = (page - 1) * limit;

const events = await Event.find()
  .skip(skip)
  .limit(limit)
  .sort({ createdAt: -1 });

const totalCount = await Event.countDocuments();

res.json({
  events,
  pagination: {
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
    hasNextPage: page * limit < totalCount,
    hasPrevPage: page > 1
  }
});
```

### Caching (Redis - Optional)
```javascript
// Cache frequently accessed data
const redis = require('redis');
const client = redis.createClient();

// Cache event details
const cacheKey = `event:${eventId}`;
const cached = await client.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
} else {
  const event = await Event.findById(eventId);
  await client.setEx(cacheKey, 3600, JSON.stringify(event)); // 1 hour TTL
  return event;
}
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Set NODE_ENV to 'production'
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up proper error logging (Winston, Sentry)
- [ ] Minify and bundle frontend assets
- [ ] Optimize images
- [ ] Database backups configured

### Backend Deployment (Options)
1. **Heroku** - Easy deployment, free tier available
2. **Railway** - Modern alternative to Heroku
3. **DigitalOcean** - VPS for more control
4. **AWS EC2** - Enterprise-grade, scalable

### Frontend Deployment (Options)
1. **Vercel** - Best for React apps, automatic deployments
2. **Netlify** - Similar to Vercel, good DX
3. **GitHub Pages** - Free static hosting
4. **AWS S3 + CloudFront** - Highly scalable

### Database Deployment
1. **MongoDB Atlas** - Managed MongoDB (recommended)
2. **Self-hosted** - On DigitalOcean/AWS

---

## Useful Resources

### Documentation
- MongoDB: https://docs.mongodb.com/
- Express.js: https://expressjs.com/
- React: https://react.dev/
- Node.js: https://nodejs.org/docs/

### Libraries
- PDFKit: https://pdfkit.org/
- Chart.js: https://www.chartjs.org/
- Axios: https://axios-http.com/
- Formik: https://formik.org/

### Tools
- Postman - API testing
- MongoDB Compass - Database GUI
- VS Code - Code editor
- Git - Version control

---

## Project Completion Criteria

### Minimum Viable Product (MVP)
- ✅ User authentication (all 3 roles)
- ✅ Event CRUD (Admin)
- ✅ Coordinator assignment
- ✅ Individual registration
- ✅ Duplicate prevention
- ✅ Basic dashboards for all roles
- ✅ Certificate generation (participation)

### Full Feature Set
- ✅ Team participation
- ✅ Team validation
- ✅ Event configuration system
- ✅ Winner marking
- ✅ Achievement certificates
- ✅ Analytics dashboards with charts
- ✅ Email notifications
- ✅ Certificate verification
- ✅ Responsive design

### Advanced Features (Optional)
- ✅ AI-powered recommendations
- ✅ Attendance prediction
- ✅ NLP search
- ✅ Chatbot
- ✅ Blockchain verification
- ✅ Mobile app (React Native)

---

## Contact Information for Clarifications

**For System/Technical Issues:**
- Mr. Debprio Banerjee: 9794112001
- Mr. Vijay Yadav: 8423174721

**For General Queries:**
- Prof. Shambhu Sharan Srivastava: 9415224645
- Prof. Ram Gopal Gupta: 9839424526

---

## Event Schedule Reference (Tech Marathon 12)

**Day 1: 25.04.2026**
- 9:00 AM - Problem Statement Announcement
- 9:30 AM - Event Start
- 6:00 PM - Refreshment
- 8:30 PM - Dinner
- 11:00 PM - Cool Refreshment

**Day 2: 26.04.2026**
- 2:00 AM - Tea and biscuits
- 4:00 AM - Tea and biscuits
- 7:30 AM - Heavy Breakfast
- Ending - 26th April 2026

---

## License & Credits

**Project:** SMART Event Manager  
**Institution:** School of Management Sciences, Varanasi  
**Event:** Tech Marathon 12 - A 24 hrs Techno Brain Race  
**Organized by:** LivEwire in association with SMS Varanasi  

---

## Final Notes for LLM

This document contains the complete specification for the SMART Event Manager project. When working on this project:

1. **Start with the database schema** - It's the foundation
2. **Build authentication first** - Secure the system from the start
3. **Follow the phase-wise approach** - Don't try to build everything at once
4. **Test as you go** - Write tests for each feature
5. **Keep security in mind** - Validate inputs, hash passwords, protect routes
6. **Document your code** - Future you (or others) will thank you
7. **Use meaningful variable names** - Code readability matters
8. **Handle errors gracefully** - Always provide helpful error messages
9. **Think about scalability** - Design for growth from the beginning
10. **User experience first** - The system should be intuitive and easy to use

**Remember:** This is a real-world problem that will help academic institutions manage events efficiently. Your implementation can make a real difference!

Good luck with the development! 🚀
