# HAPI Showcase — Requirements & Design Proposal (General Reference)
- **Role:** BA — Imraan Mohammed
- **Date:** Sun, 16th Aug 2026
- **Status:** Draft
- **Details:** This documents consolidates ideas from the project brief and client meeting. It also includes design elements our UX Designer (Max Thum) has already sketched out and Infrastructure/Hosting Architecture from our Dev 1 (Nick Moore). 

---

## 1. Functional Requirements/Rules

### Browsing:
- Homepage is publicly accessible, showing a browseable grid of featured (and approved) showcase projects without a login required for navigation.
- Each showcase project is shown in the form of a summary card with: icon, name, and short description.
    - _The card can be clicked which links to its own dedicated project page._
    - In addition, a view more button directs users to the project/search page to search for more projects.

### Individual Project Pages:
- Project Attributes (Fields): 
    - Name **|** Icon **|** Developer/s **|** Size **|** Version **|** 
    - Category **|** Tags **|**  Description **|** 
        - **_<span style="color:red"> Tags: (optional, and shown as small labels at bottom of card) </span>_**
    - Screenshots Gallery (minimum 4): <span style="color:red"> **Slideshow OR Grid** </span>
    - Video Walkthrough (**Optional**): for demoing the app
        - Hosted on a separate S3 Bucket from the Static Frontend Solution, with a bucket dedicated to Media Storage.
        - **_<span style="color:red"> YOUTUBE Embedding (Alternative Solution): for cost-savings however introduces external dependency. <span>_**
    - Download Options: 
        1. IPA (**Minimum/Required**): iOS App Store Package file (.ipa) 
        2. GitHub Link (**Optional**): for versioning history, only shown if the project is open-sourced. 
            - _If a linked GitHub repo goes private or is deleted later, the IPA/other link must still be enough to keep the page functional._

### Projects/Search Page:
- **_<span style="color:red">Display Results uses same card grid layout as homepage but with category instead of short description. </span>_**
- Search for Projects by key terms in their Name or Description on the top of the page.
- Filtering Capability: based on Category/Tags shown on the left hand side of the page.
- Reuses the homepage project card/grid pattern. 

### Admin Dashboard Page:
- Dashboard for admins: _Michael & Ace._
- _**<span style="color:red"> Single Shared Login for Admins only.</span>**_
- _**<span style="color:red"> hidden URL path, no direct access unless declared: `/admin-login`</span>**_
- Admins are the only users who can add, edit, and approve projects

### <span style="color:hsl(42, 100%, 75%)">Stretch Goal: Developer/Student Submission Form Page:</span>
1. **<span style="color:hsl(42, 100%, 75%)">Option 1:** Students submit their project applications to be showcased on the public site. Must use a valid student ID (front-end JS email validation rules - ending with `@student.rmit.edu.au`). Their application will be added to a waitlist queue table until a project is approved.
2. **<span style="color:hsl(42, 100%, 75%)">Option 2:** Students create an account via a sign-up/login dashboard and submit their project applications to be showcased on the public site. Must use a valid student ID (front-end JS email validation rules - ending with `@student.rmit.edu.au`). **<span style="color:hsl(42, 100%, 75%)"> May be more secure this way where a student must also verify their email via a link sent to them.</span>** Their application will be added to a waitlist queue table until a project is approved.

---

## 2. Non-Functional (Business) Requirements/Rules

### Accessibility:
- WCAG Web Content Accessibility Guidelines (W3C) Basics: 
    - Alternate text for Images, Keyboard Navigation, Reasonable Colour Contrast,Text Resizing/Scaling Support.
    - Scoped as part of Sprint 2 build/development stage, not Sprint 1. 
    - However, the design aspects at least in terms of colour contrast has already been considered in the UX Design stage by Max Thum.

### Performance & Traffic:
- While Public-facing, expecting low traffic besides predictable spikes during public HAPI showcase events (QR code links to the project page).
- No heavy load of showcase projects to display with an initially low number of projects between 10-12 at launch and then scaling up as more projects are added.

### Availability: 
- **_<span style="color:red">Website should be reachable via a yet to be confirmed address:</span>_**  
    - **_<span style="color:red">subdomain-based URL structure: `hapi.rmit.edu.au`</span>_**
    - **_<span style="color:red">path-based routing URL: `rmit.edu.au/hapi`</span>_**
- **Fallback**: in case a hosting platform solution cannot be reached, a packaged site + DB export is an acceptable deliverable via GitHub repo.
- Redundancy & High Availability: will be covered in the Backend Architecture section.

### Security
- Scope covers authentication for admin access alone currently. 
- TLS/SSL Certificate for secure data transmission (data in transit), particularly for authenticating admin login.
    - AWS Certificate Manager (ACM): free with API Gateway.
- Database solution natively covers encryption of data at rest, including admin account and future contact details of showcase project developers.

### Branding
- Visual Direction & Design will blend an Apple App Store aesthetic with RMIT/HAPI identity and branding.
- The HAPI logo will be incorporated into the design.

### Maintainability
- Ace (HAPI Platform Architect) is the designated contact for handover and post-project maintenance.
- Documentation will be made for handover and also for future maintenance, to be published in the `docs/` directory of the project's GitHub repo.

---

## 3. Backend Architecture Design — Proposal & Ideas:

> This details a list of possible solutions for the backend architecture of the HAPI Showcase. While nothing is finalised here, these are working ideas for our Dev to confirm and refine once we are authorised for access to RMIT's RACE/AWS infrastructure.

- **Versioning**: GitHub is our main solution, with each project's version tracking changes, updates and releases.

- **Hosting:**
    - **Main:** RACE (AWS), pending RMIT approval.
        - The architecture solution with this option leverages a serverless platform using AWS Lambda functions and API Gateway for backend functionality, a static website hosted on S3 for the front-end, and a database hosted on AWS RDS.
    - **Alternative/Backup Option:** Vercel, if RACE approval doesn't come through in time or at all.

- **Storage:** S3 Bucket (AWS) for Media Storage
    - **Screenshots/Icons (Static Media):** to be stored on the same S3 Bucket as the Static Frontend Solution. 
    - **Video (Dynamic Media):** to be stored in a separate S3 Bucket for dedicated video storage.
        - **_<span style="color:red"> YOUTUBE Embedding (Alternative Solution): for cost-savings however introduces external dependency. <span>_**

- **Data Store (Database):** 
    - **Main:** Postgresql via AWS RDS.
    - **Alternative/Backup Option:** Supabase, if RDS turns out too costly or otherwise not viable.
    
- **Project Application Approval Status:** projects have an approval-status field/attribute where only approved projects are visible on the public site. The values will be:
    - pending
    - under review (currently reviewing)
    - approved

- **Search/Filtering:** uses a simple and quick client-side JS keyword search for partial matches on a Project Name and/or it's Description, where an exact match is not required, alongside Category Filtering. 
    - **_<span style="color:red"> TAG Filtering (Optional Solution): can be used in addition to search and category filtering, allowing users to further refine results.  <span>_**

---

## 4. Frontend Interface Design — Proposal & Ideas:

> Nothing is finalised here, as these are working ideas for our UX to confirm and refine into a design that reflects a clearer visual representation of what the HAPI Showcase website will look like.

- **Overall Layout:** Apple App Store aesthetic fused with RMIT/HAPI branding, clean grid layouts, card-based browsing and clear imagery for individual project pages.

- **Homepage:** Welcome area, browseable grid of featured project in card format, including icon, name and short description and view more button directing users to the project/search page. 

- **Individual Project Pages:** Includes icon, name, developers, size, version, category, tags (optional, and shown as small labels at bottom of card), description, screenshots (carousel or grid), optional video walkthrough section, download/source link(s).

- **Project Search Page:** Reuses the same card grid as the homepage for projects, displays filtering categories on left side of page, and no results message displays when projects don't match the user search terms.

- **Admin Dashboard:** Retains each project's icon, name and short descriptionSimple, however is displayed in a list/table format of projects with an approval status and action button to approve/reject pending projects. This design separates the admin and user interfaces.

---

## Deliverable:
- This Business Requirements document will delivered as a markdown file `.md` and referenced as a source of truth in the project's GitHub repo.
- The deliverable will be named `requirements-general.md` and committed to the project's `docs/` directory
- The document is to be shared with the UX for refinements and feedback, then the Dev for implementation