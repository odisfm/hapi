# HAPI Showcase — Final Requirements Specification Outline
- **Role:** BA — Imraan Mohammed
- **Date:** Monday, 23rd Oct 2026 (Version 9.0)
- **Status:** Draft (Version 9.0)
- **Details:** This document consolidates ideas from our signed project proposal and client meeting notes, complimenting them as an extension, providing implementation ready details, including functional and non-functional requirements, in addition to design elements our UX Designer (Max Thum) has already sketched out, and Infrastructure/Hosting Architecture planned by our Dev 1 (Nick Moore). **Revision (v9.0) finalises the requirements specification and design proposal, holistically incorporating final team and client feedback with UX Design and Dev Implementation considerations. These final revisions include: admins creating student accounts with a unified login page for students/admins automatically detecting the user role, a versioning system for project submissions by students via a Project Queue before changes go live, updated header navigation to include categories in addition to showcases with search capabilities site-wide, individual project pages including direct links to the associated showcases which covers the publish date, links are automatically recognised and defined when adding/editing projects whether it be github repo or AppStore/TestFlight or website link, three distinct user roles are now defined (HAPI Admin, Student/Developer, General Public), Showcases are restricted from deletion while projects remain associated with them, new dedicated Category & Showcase pages now specified, expansion of sorting behaviour with addition of Relevance (Default) and Most Popular based on individual project page views, consideration for mobile users with hamburger side-menu, outlining separation for staging and production environments handled by developers for showcasing/demoing purposes, analytics section expanded with "Most Viewed Projects" table and Umami finalised as the chosen analytics service. This document has also been structurally reorganised, with Sections 3 & 4 simplified to high level summaries, and all functional and non-functional requirements consolidated in Sections 1 & 2 for easier more coherent reading. Finally, a dedicated Section 5 has been introduced to close out the project lifecycle, consolidating all Stretch Goals with reflections and feedback received and considered throughout the project, including completed Stretch Goals delivered beyond the main/core scope, and reflections on UX Focus Group Survey findings recorded as well as UX Supervisor feedback received.**

- **Related Document:** The signed Client Project Proposal organised by our PM (Nirmal Rajesh) already covers the business context, such as the problem statement, our team roles, target users, stakeholders, proposed solution, success criteria, scope boundaries, 3-sprint roadmap, assumptions and constraints. 
    - [Signed Client Project Proposal (PDF)](https://rmiteduau.sharepoint.com/:b:/r/sites/CapstoneProgrammingProject2026-68-HAPIApplePlatformShowcaseTeamA/Shared%20Documents/SIGNED%20HAPI%20Showcase%20Client%20Project%20Proposal%5B64%5D.pdf?d=w5547aa661f4f466982b7ea8309db2338&csf=1&web=1&e=HEDrkA)
    - [`testing-scenarios-ua.md` "Phase 1 UAT Testing" (MD file - Version 3.0)](https://github.com/odisfm/hapi/blob/main/docs/testing-scenarios-ua.md)
    - [`testing-scenarios-ua.pdf` "Phase 1 UAT Testing" (PDF file - Version 3.0)](https://github.com/odisfm/hapi/blob/main/docs/testing-scenarios-ua.pdf)
    - [`testing-scenarios-ua-phase2.md` "Phase 2 UAT Testing" (MD file - Version 5.0)](https://github.com/odisfm/hapi/blob/main/docs/testing-scenarios-ua-phase2.md)
    - [`testing-scenarios-ua-phase2.pdf` "Phase 2 UAT Testing" (PDF file - Version 5.0)](https://github.com/odisfm/hapi/blob/main/docs/testing-scenarios-ua-phase2.pdf)

- **Scope Note:** This scope of this document simply defines the requirements for the project, and any edge cases raised by the client alone. EPICS and User Stories have already been derived from this document as a separate deliverable by our PM (Nirmal Rajesh) during the project planning phase in Sprint 1. Stretch Goals that have been implemented by UX and Devs shall be promoted to main/core requirements in this final version, while those not implemented are moved to a new Section 5 for future consideration and reflection of the project lifecycle. Completed Stretch Goals shall also be retained in Section 5 and clearly labelled as delivered beyond the main/core project scope, recognising the UX and Devs achievement, extra effort beyond requirements and initiative.

---

## 1. Functional Requirements/Rules

### User Roles:
- **HAPI Admin:** manages projects, Showcases, categories, featured projects, users and analytics through the Admin Dashboard.
- **Student/Developer:** logs in with an admin-created account to add projects and edit their project details, which are submitted for admin approval.
- **General Public:** browses, searches and views published projects without logging in.

### Browsing:
- The homepage shall be publicly accessible without requiring a login, and shall display a Featured Projects section with a browseable grid of featured, published showcase projects.
- The staging and production environments shall be distinct, as the staging environment shall serve as a pre-populated environment with AppStore apps as a placeholder representing projects for review and demo purposes, while the production environment shall display only real, published student projects to the public. Pre-populated Demo AppStore apps shall never appear on the live production site. 
- The Featured Projects section shall spotlight two projects, displayed using their Hero Banner Image, with all remaining featured projects beneath displayed as standard project cards, and no fixed limit on the number of featured projects. 
- Spotlight projects shall be randomly selected on every page refresh, keeping spotlighting fair and "democratically" aligned across student projects, addressing client concerns around favouritism. 
- Each showcase project cards shall display an icon, name and short description (subtitle), with no Showcase label, instead, each individual project page shall link to the Showcase it belongs to.
    - Clicking or tapping a project card shall navigate the user to that project's dedicated page.
    - Clicking or tapping the "View More" button shall navigate the user to the projects/search page to browse the full list of projects. 
- The header menu shall provide three sections on the right-hand side, with first being “Applications” linking to the Projects/Search page for finding individual projects, second being “Categories” linking to the Standard Categories Page and third being “Showcases” linking to the dedicated Showcases page. The HAPI logo shall sit on the left-hand side and link to the welcome homepage with Featured Projects, and the search button shall sit at the far right of the header menu beside the "Showcases" quick link. The search button shall be accessible from the header menu on every page, allowing users to search without having to navigate to the Projects/Search page. 
- On mobile view, the header menu shall collapse into a hamburger side menu opened when tapping/clicking the "≡" icon. The hamburger menu shall display the three quick links (Applications, Categories, Showcases) plus the search function bar, listed row by row.
- The site footer shall also include direct links to all Showcases with publish dates that have already passed.
- The site shall be installable to a device’s home screen as a Progressive Web App (PWA), providing an app-like experience without the need for a separate native app build.

### Category & Showcase Pages:
- **Categories:** The "Categories" header menu link shall open a page listing every Standard Category, with each Category selected/clicked directing users to the Search/Projects page with that Category selected as a filter to display all projects associated with that Category. Below the Category list, there shall be a "Discover More" spotlight borrowing the Featured Projects layout for displaying random project recommendations.
- **Showcases:** The "Showcases" header menu link shall open a page listing every Showcase, organised by Semester and Year. Each Showcase shall have its own dedicated page displaying the Showcase Name, Year, Semester, Publish Date, Description, and its associated projects, borrowing the Featured Projects layout for project display.
    
### Individual Project Pages:
- Project Attributes (Fields): 
  - Icon **|** Name **|** Subtitle (Short/Summary Description) **|** Developer/s **|** Category **|**  Showcase: Program/Year/Semester _(linking to that dedicated Showcase's page)_  **|** Available On (Supported Devices) : iPhone/iPod, iPad, macOS MacBooks, Apple Watch, Apple TV and/or Vision Pro **|** Download Link(s) **|** Contact Us **|** 
  - Screenshots Gallery **|** Video Walkthrough **|** Description
  - **Screenshots Gallery** shall display per supported device (iPhone/iPod, iPad, macOS MacBooks, Vision Pro, Apple Watch, Apple TV) each with a minimum of 4 images, and shall be shown in a carousel/slideshow format. By default, the gallery shall display all screenshots across all supported devices combined in a single carousel, and the user shall then be able to narrow this down to specific device screenshots from there. 
  - **Video Walkthrough** shall be optional for Demoing the Project/Showcase (**Optional, as students are not required to submit one**):
      - Auto-play feature shall not be implemented, as video playback shall be user-initiated only while still remaining in a muted state by default, reflecting the Apple design principle of user choice as agreed upon by UX and Client. This shall be displayed alongside the screenshots gallery/slideshow.  
      - One video walkthrough video shall be permitted per project, not per supported device/platform.
  - **Download Options:**
      - Each available download/contact option (App Store, TestFlight, Website/Link to Showcase-Project, GitHub, Contact Us) shall be displayed as its own separate and independent button, rather than collapsed into a single dropdown menu section.
      1. **App Store Link and/or TestFlight Link (Minimum/Required, if available):** These links shall be provided as easier installation options, for downloadable iOS app projects, and shall cover apps currently in beta testing (TestFlight) and/or apps that are fully live publicly via (App Store).
      2. **Link to Showcase/Project:** Specifically for projects that are not downloadable, like web-based projects.
      3. **GitHub Link (Optional):** shall be shown only if the project is open-sourced, and shall be used for version history. 
          - _If a linked GitHub repository becomes private or is deleted later, the remaining App Store/TestFlight links shall remain sufficient to keep the page functional._
  - **Contact Us:** the page shall display a Contact Us option by default alongside the Download option on every project page. The HAPI shared email shall act as the intermediary and middle-man between visitors wishing to connect with the original developers, since the developers may have since graduated or otherwise moved on. 
      - If a project has no download option available, the page shall display the Contact Us option in place of the downloads section, rather than disabling the or greying out the Download section.
      - This contact us option shall be a direct link to the shared HAPI email address, using the `mailto:` html attribute, allowing the user to send an email directly to the HAPI team. This shall not implement a custom pop-up form or messaging system.

### Projects/Search Page:
- **Visual Rule #1:** The Projects/Search Results Page shall reuse the homepage's card grid layout, displaying each project's category in place of its short description. 
- A **search bar** shall be positioned at the top of the page and shall match key terms against project Name and Description fields. Successful searches/filtering shall display a counter for "results matched" displaying the number of projects that matched the search criteria.
- **Standard Category** filtering shall be displayed on the left-hand side of the page. Category filtering options shall be revealed via clicking the menu button. A project shall now belong to multiple Standard Categories at once with a many-to-many relationship, and the Category filter shall allow multiple categories to be selected simultaneously, reflecting this updated relationship.
- **Showcase** filtering shall be displayed on the left-hand side of the page. Showcase filtering options shall be revealed via clicking the menu button. 
- **Sort:** the site shall support sorting filtered/searched showcase projects by Relevance (Default), Most Popular, A–Z, Z–A, Newest, Oldest. Popularity shall be based on the number of times a user has accessed an individual project's page. Newest/Oldest sorting shall be based on the project's associated Showcase publish date and not an individual project's creation date. 
- **Pagination:** the site shall limit the number of projects displayed per page to 15, in a 5 row x 3 column grid, and narrowed down to 14 projects in a 7 row x 2 column grid when the filter side-menu is opened, and shall display numbered page buttons at the bottom of the page once that limit has been reached, which shall allow users to jump to a specific page of results.
- **Visual Rule #2:** The site shall visually indicate to a user which category/filter options are currently selected or deselected, so that the user see exactly what they have searched or filtered by. _**<span style="color:red"> This issue was raised by Ace (HAPI Architect).</span>**_
- **Edge Case #1:** If a user clears/resets a search, only the search term shall be cleared, and any active sort or filtering selections shall remain unchanged. 
- **Edge Case #2:** If a user clears/resets their selected filter options, only the filters shall be cleared, and any active search terms shall remain unchanged.
- **Edge Case #3:** If a user changes the selection within one filter group, then only that group's filter option shall update, the other filter group's current selection shall remain unaffected.

### Admin/Student Dashboard Page:
- Admins and students shall sign in through one unified `/login` page, where the system shall automatically recognise each user’s role and provide access appropriate to that role.
- The Admin Dashboard shall only be accessible to authenticated admins.
- The Student Dashboard shall only be accessible to students/developers who have a student account.
- **Admin Dashboard Navigation:** The Admin Dashboard shall provide a horizontal top menu bar with seven sections, **first the "Projects" section** for searching/filtering projects, **second the "Featured Projects" section** for assigning and ranking the featured projects for display on the homepage, **third the "Project Queue" section** for reviewing project versions submitted for admin approval, **fourth the "Showcase" section** for adding/editing the Showcase categories, fifth the "Standard Categories" section for adding/editing the Standard categories, **sixth the "Users" section** for creating and deleting admin and student accounts, including CSV batch import of student accounts, and **seventh the "Analytics" section** for viewing popular projects (based on number of page views) and including analytics data via a dedicated link to an external Umami Analytics Dashboard.
- Admins shall be able to add, edit, publish/unpublish and delete projects, and approve or reject submitted project versions in the Project Queue.
- Each project shall be assigned a Showcase category with a Program (AFP / Capstone / Apple Minor), Year (2026/2027/etc.) and Semester (Semester 1 / Semester 2). Standard categories such as Health/Workplace/Education/etc, shall not be fixed, and a project may now be assigned to multiple Standard Categories at once with a many-to-many relationship, which shall replace the previous one-to-many relationship with a single select dropdown now removed. Admins shall be able to select from an existing categories dropdown, or create new Categories directly in the Admin Dashboard's CATEGORIES section.
- Each Showcase shall be individually definable and editable by admins via the Showcase Section, with a Showcase Name, Year, Semester, Publish Date (Event Date), Description in a Markdown editor, Banner Image and assignable slugs, which shall be displayed on that Showcase's dedicated page. Each Showcases Publish Date, shall determine when its associated projects may be displayed on the public site. When a project linked to a Showcase with a Publish Date not yet reached, it shall be treated as Unpublished regardless if the project details are ready and approved or not. A Showcase shall not be deletable while projects remain associated with it and those associated projects must first be reassigned or removed before the Showcase can be deleted.
- **Student Accounts:** only admins shall be able to create and delete accounts, whether admin or student. Students shall not sign themselves up, and shall receive their login credentials by email once an admin creates an account for them.
- **Batch Import (via CSV):** admins shall be able to add multiple student accounts at once by uploading a CSV file in the Users section "Batch Import" area.
- **Student/Developer Project Submission Details:** students/developers when adding a project shall first select a Showcase the project will be associated with and cannot be changed once submitted unless by admins. The project details students/developers shall provide include an Icon, Name, Subtitle (Short Description), Long Description, Developer Name(s), select relevant Standard Categories, relevant links, Screenshots/Images (minimum of 4 per supported device) which determines the Supported Devices, an optional Video Walkthrough and/or Hero Banner Image. 
- **Student Submissions:** students shall be able to add new projects and edit their project details, with every new project or edit submitted for admin approval via the Admin Dashboard's Project Queue. The Showcase, status and slug fields shall be admin-only, as well as changing the project's Showcase if initially assigned incorrectly, and all remaining fields shall be student-editable.
- **Project Queue and Versioning:** submitted projects and edits shall appear as versions in the Admin Dashboard's Project Queue and remain in a pending state on the Student Dashboard until approved/rejected. Students/Developers shall be able to withdraw their project edits, which shall revert the project to the last approved version and allow for further changes on the student/developer's end. Admins shall approve a version, which replaces the live version, or reject it with a feedback reason the student can see, and the existing live version shall remain public until a new version is approved. From the Student Dashboard, rejected project versions shall appear as rejected, including when the rejection was made, a feedback history log with which admin made the rejection including the reason/feedback, and the opportunity to revise the rejected version for an updated submission.
- **Public Visibility Rule:** A project shall only be publicly visible when it is published, its Showcase's publish date has been reached, and its current version has been approved. When a new version is approved, the previous live version shall be marked as superseded and no longer public.
- **Publishing on Approval:** projects shall be Unpublished by default until approved, and approving a project shall automatically set it to Published for live visibility on the public site with the last approved version.
- **Admins Adding Projects:** An "Add Project" button shall be displayed on the top-right corner of the Admin Dashboard. Clicking it shall navigate the admin to a dedicated Add Project page, which shall track and save changes live as the admin enters details, for the admin to manually enter a new project's details. This page shall also support uploading screenshots per device gallery, a single video walkthrough, an app icon, a Hero Banner Image which shall be used for the homepage Featured Projects spotlight alone and not displayed on the project's dedicated page, assigning multiple Standard Categories, and a slug field which shall validate against already taken slugs by other projects prevent reuse, and a include markdown editor for the project's long description. Links added to a project shall be automatically recognised as App Store, TestFlight, GitHub or Website links.
- **Admins Selecting Featured Projects:** admins shall select projects as Featured via a heart-button option, and rank them via a drag-and-drop feature and/or up/down arrow buttons provided for keyboard accessibility as an alternative to drag-and-drop ranking.
- **Layout:** The Admin Dashboard shall use a similar layout to the Projects/Search Results Page, except display listings as a horizontal list of cards, one project per row, instead of 2-3 or more columns that the Projects/Search page displays depending on screen size. Each row shall show the project's icon, name, short description, public visibility status (Published/Unpublished). Editorial review (Pending/Approved/Rejected) shall be handled in the Project Queue section. This design choice shall separate the admin and user interfaces visually to avoid any potential confusion between the two. _**Taking down a publicly visible/live project without deleting it shall be handled via the Published/Unpublished status instead.**_
    - **Review Statuses (Approved/Rejected/Pending)** shall represent the project's editorial review stage, and tracked separately from whether a Project is **Published or Unpublished for public visibility/accessibility**. This separation shall allow admins to manage the review queue of new projects and content updates effectively before they can be made public and without losing their review history.
    - **Pending** shall indicate a new project or version update that has been submitted by the student/developer to the Project Queue and is awaiting admin review.
    - **NOT SUBMITTED:** shall indicate a new project or version update that has been started and saved but not yet submitted for admin approval, and is still being edited by by the student/developer.
    - **Rejected** shall indicate a project or version submission that the admin has chosen to be unprepared for public visibility/accessibility with a feedback/reason provided to the student/developer's submitted project version. 
    - **Approved** shall indicate a completed project entry that has passed review. Approving a project shall automatically set it to Published, though it shall only be visible once its Showcase’s publish date has been reached.
    - **Additional Actions:** Each row representing a project shall display an "Action" button on the right-hand side, which shall show either an "Edit" and "Delete" button
        - Clicking the **"Edit"** button shall navigate the admin to a dedicated Edit project page, which shall match the Add Project page, while tracking live changes for editing the current project's details.
        - Clicking the **"Delete Project"** inside the dedicated Edit project page button shall open a pop-up form for confirming the deletion of the project from the database. Deleting a project shall cascade to its associated screenshot images, project icon, Hero Banner Image, and video walkthrough.
- **Sort/Pagination:** The Admin Dashboard page shall share the same sort/pagination behaviour and rules as the Projects/Search page. Sort Labels shall be displayed in the following order: Relevance (Default), Most Popular, A–Z, Z–A, Newest, Oldest.
- **Filtering:** the Admin Dashboard page shall provide three separate filter groups, one for Status (Published/Unpublished), one for Showcase Categories (Program/Year/Semester), and one for Dynamic/Custom Standard Categories (Health, Workplace, Education, etc.).
    - Within each group, only one option shall be selectable at a time, similar to the Projects/Search page, besides the Standard Category filtering, which shall be more dynamic allowing for multiple categories to be selectable at the same time, and shall reflect the revised many-to-many relationship between projects and categories similar to a tagging feature.
    - The three groups shall be combinable with each other at the same time, so that users can filter by both status, showcase and category all at the same time. This shall give admins greater control and refinement over what they're viewing. 
    - Projects set to Published whose Showcase publish date has not yet been reached shall be treated as Unpublished when filtering by status, separating live projects from those awaiting their Showcase’s publish date.
    - **Edge Cases #1-3:** Also apply to the Admin Dasbhoard's "Projects" section's filtering and search features.

---

## 2. Non-Functional (Business) Requirements/Rules

### Accessibility:
- The site shall meet WCAG (W3C) basic guidelines, including Alternate text for Images, Keyboard Navigation, Reasonable Colour Contrast,Text Resizing/Scaling Support. Colour contrast shall be considered during the UX Design stage by Max Thum (Sprint 1 already completed), and accessibility checks shall be covered by the WCAG scenarios in the UAT Testing document delivered in two phases (Sprint 2 and Sprint 3 already completed).

### Performance & Traffic:
- **Assumption:** While the site shall be Public-facing, traffic shall be expected to remain low overall, with short predictable spikes during HAPI showcase events (via QR code links to the project pages).
- The system shall support at least 10-12 projects at launch, scaling incrementally as more projects are approved and added over time. 
- **Analytics:** The Admin Dashboard's Analytics section main area shall cover a "Most Viewed Projects" table, ranking projects by view count, filterable by a predefined set of time ranges (Last 24 hours, Last 7 days, Last 30 days) or a custom date range, where projects that have a zero-view count shall be excluded and pagination limits 10 projects per page. This shall give admins visibility into which projects are receiving the most public engagement. Additionally, Key Performance Metrics shall be gathered using the Umami Analytics and accessible via a dedicated external dashboard link within the Analytics section. The Umami dashboard credentials shall be separate from admin login credentials, shared with the HAPI team during handover, and adjustable by HAPI thereafter. The Umami Analytics tool shall track site traffic, API response times, Lambda cold start times, and page load times amongst other metrics and statistics. Analytics shall serve as a benchmark for the HAPI team after handover is completed post project closure, and the dashboard shall remain accessible to HAPI for ongoing monitoring and future improvements. 

### User Acceptance Testing (UAT):
- Formal end-to-end UAT scenarios covering all functional requirements and identified edge cases shall be documented as a separate deliverable, covering both General/Public Access and Admin Access perspectives, with accessibility, backend and infrastructure concerns excluded from the scope. This shall serve as a working checklist against the current Requirements Specification Document, shall be carried out in two main phases, one in Sprint 2 and one in Sprint 3.

### User Experience (UX) Testing:
- In addition to functional User Acceptance Testing (UAT), a subjective and experience-based testing was conducted during Sprint 3 Week 1 (Week 7 of Project Lifecycle) via a focus group of six invited participants, work colleagues of the client Michael, whose emails were shared with the HAPI Showcase Project team for consideration as the UX Focus Group participants. Ultimately, feedback was received from two reviewers, which shall complement the UAT Testing Scenario checklist covered separately for functional requirements and acting as a guide for the UX Designer Max Thum, and serves as a baseline for the HAPI team to reference when considering future improvements after handover. Overall feedback was mixed but constructive, with actionable critiques identified and addressed where possible. Full findings, including responses, critiques considered and acted upon, shall be recorded in Section 5's HAPI Showcase Project Feedback/Response section.

### Public Access & Domain: 
- The Website's final reachable address shall be decided and confirmed in collaboration with the Dev team during handover, where the project repository shall be forked and deployed to the RACE environment, and final approval from RMIT on domain access for live showcasing shall be obtained. One of the following domain URL structures shall be utilised: 
  - _<span style="color:red">subdomain-based URL structure: `hapi.rmit.edu.au`</span>_
  - _<span style="color:red">path-based routing URL: `rmit.edu.au/hapi`</span>_

### Budget:
- No fixed budget limit has been set by the client beyond a general guideline of cost-minimisation and being in agreement with the dev teams estimation for ongoing AWS costs as approximately $25/month, which shall be a reasonable starting point for the project. The client has informally suggested a rough figure of $600/year, which shall still be considered, but requires confirmation from HAPI's own upper management. The AWS RDS database shall be acknowledged as the most costly component of the project. Video transcoding/compression processing is estimated at approximately $0.50/hour.

### Security
- Authentication shall be provided for admin and student accounts through a unified login, with accounts created by admins only and no student self-sign-up.
- All data in transit, especially admin login credentials, shall be secured via TLS/SSL encryption.
    - _AWS Certificate Manager (ACM): comes free with API Gateway._
- All data at rest, including admin and student account credentials and details, shall be encrypted natively by the chosen database solution, whether AWS RDS with Postgresql or Supabase.

### Branding
- The Visual Direction & Design shall blend an Apple App Store aesthetic with RMIT/HAPI identity and branding, incorporating the HAPI logo.

### Maintainability
- Ace (HAPI Platform Architect) shall be the designated contact for handover and post-project maintenance.
- Handover and maintenance documentation shall be published in the project's Github repository under the  `docs/` directory.

---

## 3. Backend Architecture Design:

> This section shall summarise the delivered backend architecture. Detailed schemas, relationships and configuration are maintained in the Developer handover documentation in the project’s Git repository.

- **Versioning & Source Control**: GitHub shall be our main solution, for tracking changes, updates, and feature releases of the site's source codebase. Project content versions shall be handled separately through the Project Queue.

- **Hosting:**
    - **Main:** Shall use RACE (AWS), now approved by RMIT.
        - The architecture solution shall leverage a serverless platform using AWS Lambda functions and API Gateway for backend functionality, a static website hosted on S3 for the front-end, and a database hosted on AWS RDS.
    - **MVP Delivery & Handover Redeployment:** Terraform shall be utilised regardless of any blockers or delays for implementing Infrastructure as Code provisioning, while the MVP site shall leverage a free-tier AWS account with Supabase as the database solution, and the project's Github repository as the source code repository, which shall allow the HAPI team to fork and maintain the project themselves post handover and work with the RACE team to put the site live officially.
    - **Environments:** Two separates environments shall be maintained.
      - **Staging:** This shall be a pre-populated environment with real, well-known AppStore apps as a placeholder representing projects, used for client demoing, developing and testing the site before live student projects are published. 
        - ***Link:*** https://dar0pva2cu4gc.cloudfront.net/
      - **Production:** This shall be the live environment for displaying only real, published student projects to the public.
        - ***Link:*** https://dgktnqjjhd28k.cloudfront.net/

- **Storage:** Shall use S3 Bucket (AWS) for Media Storage
    - **Screenshots/Icons (Static Media):** shall be stored on the same S3 Bucket as the Static Frontend Solution. Screenshots shall be organised per supported device (iPhone/iPod, iPad, macOS, Vision Pro, Apple Watch, Apple TV).
    - **Video (Dynamic Media):** Shall be stored in a separate S3 Bucket for dedicated video storage.
        - Videos shall be processed using in house AWS Media Services for transcoding and compressing video files received prior to storage in S3, outputting a standard format for consistency and optimised delivery to public users. Output format shall be webm, for better compatibility with different browsers and devices. Estimated processing costs shall be approximately 50 cents per hour. Implementation Details shall be addressed by the Devs. 

- **Data Store (Database):** 
    - **Main:** Shall use Postgresql via AWS RDS.
    - **Alternative/Backup Option:** Shall use Supabase, which is the database used for the MVP delivery, and remains the fallback if RDS proves too costly or not viable when going live under the RACE environment.
    - **Data Management:** Project and Showcase data shall be managed through Prisma, with detailed schemas, relationships and tables/attributes maintained in Developer handover documentation. 

- **Project Application Actions:** Projects shall be manipulatable by the admin, where new projects can be added, existing projects can be edited or permanently deleted.
    - **Add/Edit:** Shall be standard create and update actions for new and existing projects as records in the database. Add shall create a new entry via the Admin Dashboard's dedicated "Add Project" page, and "Edit" shall update an existing entry via a similar dedicated "Edit Project" page, pre-filled with the current project's details and tracking changes live as they're made. Both pages shall support uploading screenshots for the project's gallery per supported device (iPhone/iPod, iPad, macOS, Vision Pro, Apple Watch, Apple TV), a single video walkthrough file, a slug field for the project's unique URL, the project's icon image, a Hero Banner Image which shall be for the homepage Featured spotlight only, assigning multiple Standard Categories, and include a markdown editor for the project's description.
    - **Delete:** Shall be a permanent action that removes the project entirely, whereas "Unpublish" retains the record but hides it from the public view taking a site visibility perspective,  or "Rejected" removes a project version submission/proposal from the Project Queue taking an Editorial Review perspective. Deleting a project shall cascade to its associated screenshot images, project icon, Hero Banner Image, and video walkthrough.

- **Contact US:** Shall use the HAPI email address for direct messaging, which shall leverage the `mailto:` html attribute link, allowing the user to send an email directly to the HAPI team.

- **Search/Filtering:** Shall use a simple and quick server-side keyword search for partial matches on a Project Name and/or it's Description, where an exact match is not required, alongside Category Filtering. Server-side search was confirmed by Dev team, which shall offer easier backend integration, no need to load the full project dataset to the front-end, and better scalability as the number of projects grows, with only a minor trade-off of added network/query latency per search.

sat 24th @5pm

---

## 4. Frontend Interface Design:

> This section shall summarise the delivered frontend interface design, as designed in Figma by our UX Designer (Max Thum).

- **Overall Layout:** Shall blend an Apple App Store aesthetic fused with RMIT/HAPI branding, clean grid layouts, card-based browsing and clear imagery for individual project pages. The design shall be responsive to different screen sizes, accounting for iPad, iPhone and web/desktop.

- **Header Menu:** Shall provide a quick link to the Projects/Search page, a link to the Standard Categories page, a link to the Showcases page, for easy navigation between the different sections of the site. On mobile view, this shall collapse into a hamburger side menu, with the three quick links and search bar listed row by row.

- **Footer:** Shall include direct links to all Showcases with publish dates that have already passed (currently live).

- **Homepage:** Shall display a Welcome area and a Featured Projects section with two large spotlight projects above the remaining standard project cards below, each directly linking to that project's dedicated page, with a “View More” button leading to the Projects/Search page. 

- **Individual Project Pages:** Shall present the project’s details at the top, a screenshot carousel with an optional video walkthrough, project description in the middle and separate download/link buttons on the bottom besides a Contact Us button.

- **Project/Search Page:** Shall reuse the same card grid as the homepage for projects, with a search bar at the top of the page, filtering categories on left side of page, , Sort and Pagination controls, a counter for "results matched" on successful search/filtering, a visual indicator showing which filters are currently selected/deselected, and a no-results message when projects don't match the user search terms. Sort options shall be clearly labelled and shall include: Relevance (Default), Most Popular, A–Z, Z–A, Newest, Oldest.

- **Category & Showcase Pages:** The Categories page shall present a page listing all Standard Categories, with each Category linking through to the Projects/Search page with that filter applied, and a "Discover More" spotlight underneath the Category list displaying random project recommendations. The Showcases page shall list every Showcase organised by Semester and Year, with each Showcase opening its own dedicated page showing the Showcase details and its associated projects.

- **Admin Dashboard:** The Admin Dashboard shall provide a horizontal top menu with seven sections, including: Projects (search/filtering with Add, Edit, Publish/Unpublish, and Delete actions), Featured Projects (assigning and ranking), Project Queue (reviewing submitted project versions), Showcase (adding/editing/removing), Standard Categories (adding/renaming/deleting), Users (creating/deleting admin and student accounts, including CSV batch import), and Analytics (viewing popular projects and analytics data). The way projects are displayed in the "Projects" section of the Admin Dashboard shall differ to the general/public view using horizontal per row cards instead of vertical per column cards as an intentional design choice creating a clear visual distinction between user roles. 

---
<span style="color: brown;">

## 5. Stretch Goal Outcomes, Feedback & Reflection for Future Considerations:

### Accomplished Stretch Goals - Promoted to Main/Core Project Requirements:
- **Web Wrapper (PWA):** delivered as the site can now be added to a device’s home screen, packaging the existing website as an installable, app-like experience, whether for iPad or iPhone, rather than a complete rebuilding of the site.
- **Self-Serve Student Submission Portal:** delivered as admin-created student accounts with student-submitted projects, removing the need for a self sign-up portal. 
- **Editorial Review (Pending/Approved/Rejected):** delivered through the versioned Project Queue section in the Admin Dashboard, with rejection feedback reasons included by admins after which students/developer may revise their submission.
- **Unplanned Additions:** unified login for admins and students, tracking live updates before saving changes prior to publishing, and CSV batch import of student accounts, and a separate staging environment populated with demo apps as projects, kept distinct from the production environment of live student projects.
- **Most Popular Sorting/Analytics:** delivered, ranking projects by how many times a project’s page has been viewed and displaying this in the Admin Dashboard's Analytics section.
- **Audit Logging (Partially Implemented):** the Student Dashboard shows a rejection history log recording which admin rejected a version and when for easier accountability, traceability and communication, however, other admin changes to project records shall not be logged.

### Stretch Goals Not Implemented:
> These stretch goals were not implemented due to time constraints, with higher-priority client requirements and key refinements taking precedence.
- **Transition Effects:** this feature would have added a 3-5 second timer before changing spotlight projects in the Featured Projects section live, while using zoom transitions to improve the user experience during the transition delays/pauses and directly address the feedback from the UX Focus Group participants.
- **Banner Images for Showcase:** this feature would have allowed for the addition of a banner image to each Showcase, which would be displayed in the dedicated Showcase page to further promote the Showcase event or unit it represents.
- **Recycle Bin:** this feature would have allowed deleted projects to move to a recycle bin for restoring before a final and more permanent deletion would occur.
- **Archiving:** this feature suggested by the UX Supervisor would have created a dedicated "Archive Project" page for projects no longer maintained by students who now alumni, yet still available for public view.
- **Showcase Sub-Category Filtering:** this feature would have allowed for sub-category filtering of SHowcases by Program, Year and Semester.
- **Two Factor Authentication (2FA):** this feature would have enforced admin accounts and student accounts to use two-factor authentication (2FA) for increased security.
- **Search Engine Optimisation (SEO)** this feature would have been implemented to aid the search engine optimisation (SEO) of the HAPI showcase site and individual projects with strategies around increasing web traffic and improved visibility.

### Scoped Out (Descoped) Client Requirements:
- YouTube video embedding (S3 storage confirmed), per-platform and IPA downloads including "How to Install" instructions (App Store/TestFlight handle device compatibility and installation), per-project Date Created Fields (now replaced by direct links to project's associated showcase which already displays the publish date) Tags and Tag filtering (now replaced by multi-selectable Standard Categories), emailed project submissions (now replaced by student accounts and the Project Queue), student self sign-up (now replaced by automatic creation of student accounts for better security), and the Vercel backup hosting option (RACE approved for AWS resources).

### Feedback Received & Reflections for Future Considerations:

**UX Focus Group Feedback:**
- The UX Focus Group Survey feedback results were mixed but constructive, with the two testers largely viewing the site through an "App Store" like lens, which was intentional, though some felt it lacked visual engagement or uniqueness in its presentation. Responses ranged from neutral like "clean, boring, standard" to more critical "unimaginative, confusing, limited". The main actionable critiques considered included the following:
  1. **"View More" Button Contrast:** The "View More" button in the Featured Projects section of the welcome homepage lacked colour contrast and was easily overlooked, appearing as plain text against the "Featured Projects" subtitle rather than appear as a clear button. As of Sprint 3 Week 3 this has suggested change has been implemented, updating the button to appear clearly with improved colour contrast.
  2. **Categories Page Clarity:** The Categories page lacked clear subheadings to indicate what each category represents, due to the category page link in the header menu redirecting users back to the welcome homepage, as the page was still in development. As of Sprint 3 Week 3 the page has been updated with visuals from the UX and implementation by Devs to clarify the categories and their associated projects.
  3. **Project Context Confusion:** Testers were unsure whether they were browsing student projects or professional AppStore apps, with one commenting that the landing page "looks like a search result from the Apple Store" and does not "sell the uniqueness" of each app. This was understood to be an expected outcome of the survey test as the site was populated with real, well-known AppStore apps as a placeholder, pending final approval by the HAPI team upon project closure to showcase live student projects post handover.
  4. **Static Appearance:** Feedback describing the site as "simple" or "boring" was understood as a reflection of the site's static appearance without transitions. Transition effects were considered for the hero art of the Project Spotlight sections, but were ultimately descoped due to time constraints, with higher-priority client requirements and key refinements taking precedence.

**UX Supervisor Feedback:**
  - **Addition of a "Newsfeed Page"** for posting upcoming and past events Showcase Events.
  - **Expanding the "Category Page"** with additional descriptions and linking projects to a greater purpose, such as health or commerce students taking Apple-related minors to build apps related to their major, and linking categories to the university schools they relate to.
  - **Addition of a Project History/Inspiration Section** for each Individual Project shall allow the story behind a project to be shared, such as what inspired it, the development journey, challenges faced, the goals/vision, and a link to the real-world campus location where it was created, with photos taken throughout the project's development process. This section would have been displayed at the bottom of the project page if implemented. 
</span>
---

## Handoff to UX/Dev Notes:
- **N/A:** No handoff notes for UX/Devs in Sprint 3 Week 3 final deliverable. 

---

## Deliverable:
- This Requirements Specification document shall be delivered as a markdown file `.md`, named `requirements-specification.md` and committed to the project's `docs/` directory. A PDF-converted copy shall also be provided, named `requirements-specification.pdf` alongside the original `.md` file for easier reading and review by the client.
- The project’s primary deliverable shall be the Github repository, including the codebase, Terraform infrastructure code and Developer handover documentation, alongside the Figma designs.
- Upon project closure, the Dev Lead (Nick Moore) shall carry out the official handover, allowing HAPI to fork the repository and work with the RACE team to put the site live, with the website address to be confirmed upon RMIT approval.

