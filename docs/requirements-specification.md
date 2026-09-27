# HAPI Showcase — Requirements Specification & Design Proposal
- **Role:** BA — Imraan Mohammed
- **Date:** Tuesday, 22nd Sep 2026 (Version 6.0)
- **Status:** Draft (Version 6.0)
- **Details:** This document consolidates ideas from our signed project proposal and client meeting notes, complimenting them as an extension, providing implementation ready details, including functional and non-functional requirements, in addition to design elements our UX Designer (Max Thum) has already sketched out, and Infrastructure/Hosting Architecture planned by our Dev 1 (Nick Moore). **Revision (v6.0) considers further client feedback and UX design considerations, including Showcase categories being more dynamic with sub-categories, the return of standard categories, confirmed removal of Tags, removal of multi-platform awareness to reflect changes from recent v5.0 removal of IPA download links and avoid redundancy with features already existing in AppStore/TestFlight, confirmed S3 video storage with transcoding/compressing dropping the YouTube alternative, a visibility status (Published/Unpublished) working in conjunction with editorial/review statuses (Approved/Pending/Rejected), multiple admin accounts setup, dedicated Add/Edit project page for admins instead of a pop-up form (including screenshot and video uploads, slug URLs, icon image uploads and markdown description editor), a defined Admin Dashboard horizontal navigation bar (for Search/Filtering Projects, Assign/Rank Featured Projects, Define/Edit Showcase & Standard Categories, Manage Admin Accounts and Review Analytics Data), and also taken into consideration other Apple devices overlooked including Apple Watch and Apple TV.**

- **Related Document:** The signed Client Project Proposal organised by our PM (Nirmal Rajesh) already covers the business context, such as the problem statement, our team roles, target users, stakeholders, proposed solution, success criteria, scope boundaries, 3-sprint roadmap, assumptions and constraints. 
    - [Signed Client Project Proposal (PDF)](https://rmiteduau.sharepoint.com/:b:/r/sites/CapstoneProgrammingProject2026-68-HAPIApplePlatformShowcaseTeamA/Shared%20Documents/SIGNED%20HAPI%20Showcase%20Client%20Project%20Proposal%5B64%5D.pdf?d=w5547aa661f4f466982b7ea8309db2338&csf=1&web=1&e=HEDrkA)
- **Scope Note:** This scope of this document simply defines the requirements for the project, and any edge cases raised by the client alone. EPICS and User Stories have already been derived from this document as a separate deliverable by our PM (Nirmal Rajesh) during the project planning phase in Sprint 1.

---

## 1. Functional Requirements/Rules

### Browsing:
- The homepage shall be publicly accessible without requiring a login, and shall display a browseable grid of featured, approved showcase projects.
- Each showcase project shall be displayed as a summary card containing an icon, name, and short description.
    - Clicking or tapping a project card shall navigate the user to that project's dedicated page.
    - Clicking or tapping the "View More" button shall navigate the user to the projects/search page to browse the full list of projects. 
- A search bar shall also be available directly on the homepage, allowing users to search without having to navigate to the Projects/Search page.
    
### Individual Project Pages:
- Project Attributes (Fields): 
    - Icon **|** Name **|** Subtitle (Short/Summary Description) **|** Developer/s **|** Category **|**  Showcase: Program/Year/Semester _(with sub-categories)_ **|** Date Created **(AKA Publish Date)** **|** Available On (Supported Devices) : iPhone/iPod, iPad, macOS MacBooks, Apple Watch, Apple TV and/or Vision Pro **|** Download Link(s) **|** Contact Us **|** 
    - Screenshots Gallery **|** Video Walkthrough **|** Description
    - **Screenshots Gallery** shall display per supported device (iPhone/iPod, iPad, macOS MacBooks, Vision Pro, Apple Watch, Apple TV) each with a minimum of 4 images, and shall be shown in a carousel/slideshow format. Each device's gallery shall be displayed separately, rather than as a single shared collection.
    - **Video Walkthrough** shall be optional for Demoing the Project/Showcase (**Optional, as students are not required to submit one**):
        - Auto-play feature shall not be implemented, as video playback shall be user-initiated only while still remaining in a muted state by default, reflecting the Apple design principle of user choice as agreed upon by UX and Client. This shall be displayed directly below the project/showcase main details and above the screenshots gallery/slideshow.  
        - One video walkthrough video shall be permitted per project, not per supported device/platform.
        - Videos (Dynamic Media) shall stored on a separate S3 Bucket from the Static Frontend Solution, with a bucket dedicated to Media Storage.
        - Videos shall be processed using in house AWS Media Services or a third-party service for transcoding and compressing video files received prior to storage in S3, outputting a standard format for consistency and optimised delivery to public users. Implementation Details shall be addressed by the Devs. 
    - **Download Options:**
        1. **App Store Link and/or TestFlight Link (Minimum/Required, if available):** These links shall be provided as easier installation options compared with the manual download of the IPA file, for downloadable iOS app projects, and shall cover apps currently in beta testing (TestFlight) and/or apps that are fully live publicly via (App Store).
        2. **Link to Showcase/Project:** Specifically for projects that are not downloadable, like web-based projects.
        3. **GitHub Link (Optional):** shall be shown only if the project is open-sourced, and shall be used for version history. 
            - _If a linked GitHub repository becomes private or is deleted later, the remaining App Store/TestFlight links shall remain sufficient to keep the page functional._
            - **"How to Install" Guide:** A simplified guide shall be included to assist users with how to complete installations of downloadable projects or access non-downloadable projects.
    - **Contact Us:** the page shall display a Contact Us option by default alongside the Download option on every project page. The HAPI shared email shall act as the intermediary and middle-man between visitors wishing to connect with the original developers, since the developers may have since graduated or otherwise moved on. 
        - If a project has no download option available, the page shall display the Contact Us option in place of the downloads section, rather than disabling the or greying out the Download section.
        - This contact us option shall be a direct link to the shared HAPI email address, using the `mailto:` html attribute, allowing the user to send an email directly to the HAPI team. This shall not implement a custom pop-up form or messaging system.

### Projects/Search Page:
- **Visual Rule #1:** The Projects/Search Results Page shall reuse the homepage's card grid layout, displaying each project's category in place of its short description. 
- A **search bar** shall be positioned at the top of the page and shall match key terms against project Name and Description fields. Successful searches/filtering shall display a counter for "results matched" displaying the number of projects that matched the search criteria.
- **Category/** filtering shall be displayed on the left-hand side of the page. Category filtering options shall be revealed via clicking the menu button.
- **Showcase** filtering shall be displayed on the left-hand side of the page. Showcase filtering options shall be revealed via clicking the menu button. Showcases shall be further categorised using sub-categories, by Program (AFP / Capstone / Apple Minor), Year (2026/2027/etc.) and Semester (Semester 1 / Semester 2).
- **Sort:** the site shall support sorting filtered/searched showcase projects by A–Z, Z–A, Newest, and Oldest. <span style="color:hsl(42, 100%, 75%)">An optional "Popular" sort is being considered as a Stretch Goal.</span>
- **Pagination:** the site shall limit the number of projects displayed per page to 20, and shall display a _"Next Page"_ button at the bottom of the page to navigate users to the next page of results, once that limit of 20 projects has been reached.
- **Visual Rule #2:** The site shall visually indicate to a user which category/filter options are currently selected or deselected, so that the user see exactly what they have searched or filtered by. _**<span style="color:red"> This issue was raised by Ace (HAPI Architect).</span>**_
- **Edge Case #1:** If a category is already selected and the user selects a different category, the newly selected category shall replace the previously selected one, instead of appending or adding to the list of selected categories for filtering.
- **Edge Case #2:** If a user clears/resets a search, only the search term shall be cleared, and any active sort or filtering selections shall remain unchanged. 

### Admin Dashboard Page:
- Dashboard for admins: admins shall be able to create additional admin accounts as needed, where authenticated admins shall each have their own individual login credentials.
- The Admin Dashboard shall be accessible only via a hidden, non-linked URL path: `/admin-login`, and shall not be discoverable through public navigation unless the url path is manually entered into the browser's address bar.
- Only authenticated admins shall be able to add, edit, and approve/reject project in the projects listing queue.
- Each project shall be assigned a Showcase category with a Program (AFP / Capstone / Apple Minor), Year (2026/2027/etc.) and Semester (Semester 1 / Semester 2). Standard categories such as Health/Workplace/Education/etc. shall not be fixed. Admins shall be able to select from an existing categories dropdown, or create new Categories directly in the Admin Dashboard, where even Featured Projects shall be selected, Showcases defined, and Admin accounts created.   
- _<span style="color:hsl(160, 100%, 33%)">**External Dependency — Student Project Submission Details via HAPI Email:**_
    - _<span style="color:hsl(160, 100%, 33%)"> Students shall be expected to email their project submission details to the shared HAPI email address, as an automated student project submission portal/dashboard is currently out of scope. </span>_
    - _<span style="color:hsl(160, 100%, 33%)"> Admins shall be expected to coordinate with these students to ensure the following details are included before a project can be reviewed/approved and manually added to the site: Icon, Name, Subtitle (Short Description), Long Description, Developer Name/s, Category, Screenshots/Images (minium of 4 per supported device), Optional Video Walkthrough Link, Supported Platforms (iPhone/iPad, iPad, macOS MacBooks, and/or Vision Pro), and relevant download/source link/s, such as App Store, TestFlight, and/or GitHub repo if open-sourced.</span>_
- **Adding Projects:** An "Add Project" button shall be displayed on the top-right corner of the Admin Dashboard. Clicking it shall navigate the admin to a dedicated Add Project page, which shall track and save changes live as the admin enters details, for the admin to manually enter a new project's details. This page shall also support uploading screenshots per device gallery, a single video walkthrough, an app icon, slug field which shall validate against already taken slugs by other projects prevent reuse, and a include markdown editor for the project's long description.
- **Layout:** The Admin Dashboard shall use a similar layout to the Projects/Search Results Page, except display listings as a horizontal list of cards, one project per row, instead of 2-3 or more columns that the Projects/Search page displays depending on screen size. Each row shall show the project's icon, name, short description, public visibility status (Published/Unpublished), alongside editorial review status (Pending/Approved/Rejected). This design choice shall separate the admin and user interfaces visually to avoid any potential confusion between the two.
    - Review Statuses (Approved/Rejected/Pending) shall represent the project's editorial review stage, and tracked separately from whether a Project is Published or Unpublished for public visibility/accessibility. This separation shall allow an Approved project to be temporarily Unpublished for quick content updates, and shall take into consideration the possibility of a Self-Serve Student Portal to fully leverage the Pending Queue and review projects in an efficient manner.
    - **Pending** shall indicate the project entry is incomplete or awaiting further details from the student before it's ready for review and approval.
    - **Rejected** shall indicate a completed project entry that the admin has chosen not to make public. _**Taking down a previously public project without deleting it shall be handled via the Published/Unpublished status instead.**_
    - **Approved** shall indicate a completed project entry that has passed review, however, the project shall still requires to be set Published for it to be visible on the public site.
    - **Additional Actions:** Each row representing a project shall display an "Action" button on the right-hand side, which shall show either an "Edit" and "Delete" button
        - Clicking the **"Edit"** button shall navigate the admin to a dedicated Edit project page, which shall match the Add Project page, while tracking live changes for editing the current project's details.
        - Clicking the **"Delete"** button shall open a pop-up form for confirming the deletion of the project from the database.
        - _<span style="color:hsl(42, 100%, 75%)">**Stretch Goal - Recycle Bin:** shall send deleted projects to a recycle bin, which shall allow an admin to recover/restore an accidentally deleted project from the recycle bin, before a final permanent deletion step is taken. This shall prevent the immediate deletion of a project, which shall further complement the confirmation "Delete" button.</span>_
- **Sort/Pagination:** The Admin Dashboard page shall share the same sort/pagination behaviour and rules as the Projects/Search page. Sort Labels shall be displayed in the following order: A–Z, Z–A, Newest, Oldest.
- **Filtering:** the Admin Dashboard page shall provide three separate filter groups, one for Status (Published/Unpublished), one for Showcase Categories (AFP / Capstone / Apple Minor), and one for Dynamic Categories (AFP, Capstone, Apple Minor).
    - Within each group, only one option shall be selectable at a time, similar to the Projects/Search page.
    - The three groups shall be combinable with each other at the same time, so that users can filter by both status, showcase and category all at the same time. This shall give admins greater control and refinement over what they're viewing. 
    - **Edge Case #3:** If an admin changes the selection within one filter group, then only that group's filter option shall update, the other filter group's current selection shall remain unaffected.
    - When a project's status is set to rejected, the admin shall be required to enter a short feedback/reason for the rejection, which shall be stored as part of the project's record.
- _<span style="color:hsl(42, 100%, 75%)">**Stretch Goal - Audit Logging:** The system shall track which admin made each change to a project record, whether adding/editing/deleting or updating the project's status, for accountability and traceability, complimenting the addition of the multi-admin accounts support feature. If implemented, this log shall be viewable by admins within the Admin Dashboard and within each Edit Project page.</span>_

### <span style="color:hsl(42, 100%, 75%)">Stretch Goal - Web Wrapper Application:</span>
- _<span style="color:hsl(42, 100%, 75%)"> The system shall support the delivery of a lightweight wrapper packaging the existing website as an installable, app-like experience, whether for iPad or iPhone, rather than a complete rebuilding of the site._
- _<span style="color:hsl(42, 100%, 75%)"> This additional consideration is not a core deliverable of this project, but shall be a "Stretch Goal" brought up by the Client as declared in the originally signed Client Project Proposal document._
- The dev team proposed the Progressive Web App (PWA) approach as the most suitable implementation route for this wrapper, offering an installable, app-like experience without a separate native build. This direction was agreed upon as a deliverable by the Client once the MVP build sprint stage is complete. 

### <span style="color:hsl(42, 100%, 75%)">Future Consideration #1 - Self-Serve Student/Developer Submission Portal:</span>
- <span style="color:hsl(42, 100%, 75%)"> Students shall be able to create an account via a sign-up/login dashboard and submit their project applications directly. Student emails shall be validated against a front-end JS email validation rule - ending with `@student.rmit.edu.au` and verified via a link sent to their email. Student submissions/applications shall be added to a waitlist queue table under a pending status until their project is reviewed and approved/rejected.</span>
- <span style="color:hsl(42, 100%, 75%)"> **Justification:** This approach was considered more secure compared to the alternative with a fully public, unauthenticated submission form, which would introduce the risk of spam or fake submissions. However, since this also requires individual developer/student accounts on the site, the Client has decided to forgo this approach for now, until the main scope of this project has been completed, and time allows at the end of the sprint to re-evaluate as part of the final deliverable.</span>

### <span style="color:hsl(42, 100%, 75%)">Future Consideration #2 - Project History/Inspiration Section:</span>
- <span style="color:hsl(42, 100%, 75%)"> This section shall allow the story behind a project to be shared, such as what inspired it, the development journey, challenges faced along the way, the goals/vision for the project and a link/association to the real world campus location where the project was created, with photos of the space and experience. Similar to all other project details, the contents of this section shall be collected via project submission applications sent to the shared HAPI email address, then manually added to the site.  This section shall be displayed at the bottom of the project page if implemented.</span>

---

## 2. Non-Functional (Business) Requirements/Rules

### Accessibility:
- The site shall meet WCAG (W3C) basic guidelines, including Alternate text for Images, Keyboard Navigation, Reasonable Colour Contrast,Text Resizing/Scaling Support.
    - Scoped as part of Sprint 2 build/development stage, not Sprint 1. 
    - Colour contrast has already been considered during the UX Design stage by Max Thum, ahead of the full accessibility implementation stage dedicated to Sprint 2.

### Performance & Traffic:
- **Assumption:** While the site shall be Public-facing, traffic shall be expected to remain low overall, with short predictable spikes during HAPI showcase events (via QR code links to the project pages).
- The system shall support at least 10-12 projects at launch, scaling incrementally as more projects are approved and added over time. 
    - _<span style="color:hsl(42, 100%, 75%)"> **Stretch Goal - Search Engine Optimisation (SEO):** SEO shall be a "Stretch Goal" deliverable for this project, and shall be implemented once the core site functionality meets the project's base scope. If SEO is implemented, it shall support individual projects and the overall HAPI Showcase website receive additional traffic and increase visibility.</span>_
- **Key Performance Metrics That Shall be Tracked Include:** site traffic, API response times, Lambda cold start times, and page load times. An analytics service shall be considered for assisting gathering these metrics more easily, and shall serve as a benchmark for the HAPI team after handover is completed post project closure. Two options shall be currently under consideration: Umami and Google Analytics, with a final decision pending.

### User Acceptance Testing (UAT):
- Formal end-to-end UAT scenarios covering all functional requirements and identified edge cases shall be documented as a separate deliverable, covering both General/Public Access and Admin Access perspectives, with accessibility, backend and infrastructure concerns excluded from the scope. This shall serve as a working checklist against the current Requirements Specification Document, and shall be iteratively refined over the next two sprints following feedback and review from the team and client.

### User Experience Testing:
- In addition to functional User Acceptance Testing (UAT), a subjective and experience-based testing shall be conducted via a focus group of around 5 participants, organised by the Client Michael of internal members from the HAPI group. This shall complement the UAT checklist-based UAT Testing covered separately for functional requirements, focusing instead on overall user experiences and satisfaction acting as guide for the UX Designer Max Thum. Results shall also serve as a baseline for the HAPI team to reference when considering future improvements after handover is completed post project closure.

### Availability: 
- **_<span style="color:red">The Website shall be reachable via a yet to be confirmed address:</span>_**  
    - _<span style="color:red">subdomain-based URL structure: `hapi.rmit.edu.au`</span>_
    - _<span style="color:red">path-based routing URL: `rmit.edu.au/hapi`</span>_
- **Fallback**: if no hosting platform decision can be reached in time, a Packaged Site including a Database export delivered via the GitHub repository shall be an acceptable substitute deliverable.  
- Redundancy & High Availability: will be covered in the Backend Architecture section.

### Budget:
- No fixed budget limit has been set by the client beyond a general guideline of cost-minimisation and being in agreement with the dev teams estimation for ongoing AWS costs as approximately $25/month, which shall be a reasonable starting point for the project. The client has informally suggested a rough figure of $600/year, which shall still be considered, but requires confirmation from HAPI's own upper management. The AWS RDS database shall be acknowledged as the most costly component of the project.

### Security
- Authentication shall be scoped to admin access only, with no individual author/user accounts included as part of this project's current scope.
- All data in transit, especially admin login credentials, shall be secured via TLS/SSL encryption.
    - _AWS Certificate Manager (ACM): comes free with API Gateway._
- All data at rest, including admin credentials and any future developer contact details, shall be encrypted natively by the chosen database solution, whether AWS RDS with Postgresql or Supabase.
    - _<span style="color:hsl(42, 100%, 75%)"> **Stretch Goal - Two Factor Authentication (2FA):** 2FA shall be a "Stretch Goal" deliverable for this project, and shall be implemented once the core site functionality meets the project's base scope. If 2FA is implemented, it shall enhance security by requiring an additional layer of authentication to access the admin dashboard.</span>_

### Branding
- The Visual Direction & Design shall blend an Apple App Store aesthetic with RMIT/HAPI identity and branding, incorporating the HAPI logo.

### Maintainability
- Ace (HAPI Platform Architect) shall be the designated contact for handover and post-project maintenance.
- Handover and maintenance documentation shall be published in the project's Github repository under the  `docs/` directory.

---

## 3. Backend Architecture Design — Proposal & Ideas:

> This shall detail a list of possible solutions for the backend architecture of the HAPI Showcase. While nothing is finalised here, these shall be working ideas for our Dev to confirm and refine once we are authorised for access to RMIT's RACE/AWS infrastructure.

- **Versioning**: GitHub shall be our main solution, with each project's version tracking changes, updates and releases.

- **Hosting:**
    - **Main:** Shall use RACE (AWS), pending RMIT approval.
        - The architecture solution shall leverage a serverless platform using AWS Lambda functions and API Gateway for backend functionality, a static website hosted on S3 for the front-end, and a database hosted on AWS RDS.
    - **Alternative/Backup Option:** Vercel shall be considered, if RACE approval doesn't come through in time or at all.

- **Storage:** Shall use S3 Bucket (AWS) for Media Storage
    - **Screenshots/Icons (Static Media):** shall be stored on the same S3 Bucket as the Static Frontend Solution. Screenshots shall be organised per supported device (iPhone/iPod, iPad, macOS, Vision Pro, Apple Watch, Apple TV).
    - **Video (Dynamic Media):** Shall be stored in a separate S3 Bucket for dedicated video storage.
        - Videos shall be processed using in house AWS Media Services or a third-party service for transcoding and compressing video files received prior to storage in S3, outputting a standard format for consistency and optimised delivery to public users. Implementation Details shall be addressed by the Devs. 
        - S3 Video Storage shall be the confirmed solution for video storage, with YouTube embedding effectively removed from scope altogether.

- **Data Store (Database):** 
    - **Main:** Shall use Postgresql via AWS RDS, and a database schema shall be prepared based on the required attributes of each HAPI showcase project.
    - **Alternative/Backup Option:** Shall use Supabase, if RDS turns out too costly or otherwise not viable.
    - **Project Records Required Attributes:** Each project shall be represented as a database record containing the following attributes:
        - _ProjectID, Icon, Name, Subtitle (Short Description), Description (Long Description), Developers (Names), StandardCategory, ShowcaseCategory_Program, ShowcaseCategory_Year, ShowcaseCategory_Semester, DateCreated **(AKA PublishDate)**, PlatformVersion, SupportedDevices (iPhone/iPod, iPad, macOS, Vision Pro, Apple Watch, Apple TV), AppStore_Link, TestFlight_Link, ProjectLink, GitHubLink, VideoWalkthrough (Optional, one per project), ScreenshotsFolder (per-device: ScreenshotsiPhone, ScreenshotsiPad, ScreenshotsMacOS, ScreenshotsVisionPro), PublishedStatus (Published/Unpublished), Slug (unique and managed by admins), ReviewStatus (Approved/Rejected/Pending), RejectionFeedback (or RejectionReason), FeaturedProject (Boolean True/False for Drag and Drop after Choosing Project as Featured Showcase on Homepage)._
        - _**Note:** These attributes cover the necessary details for a project, per a specification requirements perspective, therefore, data types, rules and structure shall be determined by the development team._
        - _<span style="color:hsl(42, 100%, 75%)">**Stretch Goal - Multi-Admin Accounts Audit Logging & Recycle Attributes:** CreatedByAdminID, LastModifiedByAdminID, InRecycleBin (Boolean: True/False).</span>_
    
- **Project Application Approval Status:** Projects shall have an assignable approval-status field/attribute where only approved projects are visible on the public site. The ReviewStatus attribute (Approved/Rejected/Pending) shall represent the project's editorial review stage only, while the separate PublishedStatus attribute (Published/Unpublished) shall independently control whether a project is visible on the public site. Default values shall be:
    - **Published:** Shall indicate the project is currently visible on the public site.
    - **Unpublished:** Shall indicate the project is hidden from the public site, regardless of whether it has been approved or not.
    - ---
    - **Pending:** Shall be currently under review.
    - **Approved:** Shall be ready for public display on the site.
    - **Rejected:** Shall include a stored feedback/reason attribute, which is provided by the admin at the time of the rejection of the individual project. 

- **Project Application Actions:** Projects shall be manipulatable by the admin, where new projects can be added, existing projects can be edited or permanently deleted.
    - **Add/Edit:** Shall be standard create and update actions for new and existing projects as records in the database. Add shall create a new entry via the Admin Dashboard's dedicated "Add Project" page, and "Edit" shall update an existing entry via a similar dedicated "Edit Project" page, pre-filled with the current project's details and tracking changes live as they're made. Both pages shall support uploading screenshots for the project's gallery per supported device (iPhone/iPod, iPad, macOS, Vision Pro, Apple Watch, Apple TV), a single video walkthrough file, a slug field for the project's unique URL, the project's icon image and include a markdown editor for the project's description.
    - **Delete:** Shall be a distinctly permanent action from "Rejected", which shall remove the project entirely, while "Rejected" retains the record but hides it from the public view. 
    - _<span style="color:hsl(42, 100%, 75%)">**Stretch Goal - Recycle Bin:** shall send deleted projects to a recycle bin, which shall allow an admin to recover/restore an accidentally deleted project from the recycle bin, before a final permanent deletion step is taken. This shall prevent the immediate deletion of a project, which shall further complement the confirmation "Delete" button.</span>_

- **Contact US:** Shall use the HAPI email address for direct messaging, which shall leverage the `mailto:` html attribute link, allowing the user to send an email directly to the HAPI team.
    - _**Note:** Although the Contact Us option shall visually replace the Download button on the frontend when a project has no downloadable link, this shall only be a display isolated feature/behaviour, while the database schema shall still retain the download related fields for that project record, but empty/null.**_

- **Search/Filtering:** Shall use a simple and quick server-side keyword search for partial matches on a Project Name and/or it's Description, where an exact match is not required, alongside Category Filtering. Server-side search was confirmed by Dev team, which shall offer easier backend integration, no need to load the full project dataset to the front-end, and better scalability as the number of projects grows, with only a minor trade-off of added network/query latency per search. Successful searches/filtering shall return a counter for the number of results matched. Category filtering options shall be revealed via hover to the left or click menu button on the frontend. This search functionality shall be accessible from both the homepage and the dedicated Projects/Search page.

---

## 4. Frontend Interface Design — Proposal & Ideas:

> Nothing shall be considered finalised here, as these shall be working ideas for our UX to confirm and refine into a design that reflects a clearer visual representation of what the HAPI Showcase website shall look like.

- **Overall Layout:** Shall blend an Apple App Store aesthetic fused with RMIT/HAPI branding, clean grid layouts, card-based browsing and clear imagery for individual project pages. The design shall be responsive to different screen sizes, accounting for iPad, iPhone and web/desktop.

- **Homepage:** Shall display a Welcome area, a search bar,and a featured section each for each Showcase Category (AFP, Capstone, Apple Minor), each displaying one larger spotlight project alongside three smaller ones, with four featured projects per category as the minimum, which shall be manually selected by admins via the drag-and-drop feature in the Admin Dashboard, with key details including including icon, name, short description and label for Category (AFP, Capstone, Apple Minor), where clicking any project card shall direct users users to the individual project, and each categories featured project carousel shall include a view more button directing users to the project/search page with the Category filter applied. The homepage shall also include a search bar, allowing users to search without needing to navigate to the Projects/Search page.

- **Individual Project Pages:** Shall includes icon, name, subtitle (short summary), developers, date created **(AKA Publish Date)**, Showcase category: Program/Year/Semester _(with sub-categories)_, standard category, Supported Devices (iPhone/iPod, iPad, macOS MacBooks, Vision Pro, Apple Watch, Apple TV), long description, screenshots (minimum of 4 per supported device, shown in carousel or grid format), optional video walkthrough that is user-initiated but muted by default and positioned above the screenshot gallery, download/source link(s) (App Store and/or TestFlight, Link to Non-Downloadable Projects, GitHub for open-sourced projects), and a contact us button with a `mailto:` link to the HAPI email address shown by default which also replaces the download option if the project is not downloadable. _**"How to Install" Guide:** shall be provided to assist users with how to complete installations of downloadable projects._

- **Project Search Page:** Shall reuse the same card grid as the homepage for projects, with a search bar at the top of the page, filtering categories on left side of page, , Sort and Pagination controls, a counter for "results matched" on successful search/filtering, a visual indicator showing which filters are currently selected/deselected, and a no-results message when projects don't match the user search terms. Sort options shall be clearly labelled and shall include: A–Z, Z–A, Newest, Oldest. _<span style="color:hsl(42, 100%, 75%)">An optional "Popular" sort is being considered as a Stretch Goal.</span>

- **Admin Dashboard:** Shall retains each project's icon, name and subtitle (short description), but displayed it shall be displayed as a horizontal list of cards, with one project per row, rather than 2-3 or more columns that the Projects/Search page displays depending on screen size. It shall also include an "Add Project" button in the top-right corner of the page, which shall navigate the admin to a dedicated Add Project page for manually entering new projects, as well as an review status, either Pending/Approved/Rejected with a stored feedback/reason attribute for rejected project applications, a separate Published/Unpublished visibility status, independent of the Pending/Approved/Rejected editorial review status, and an "Edit" button per row/project, which shall shall navigate the admin to a dedicated Edit Project page for for editing the project's details or deleting the project entirely after a confirmation popup appears to verify the action, **_or, if the Recycle Bin stretch goal is implemented, then it shall move the project directly to the recycle bin first_**. Review Status changes between Pending/Approved/Rejected and Visibility Status changes between Published/Unpublished shall be done via the dedicated Edit page. 
- The Admin Dashboard shall be presented with a horizontal top menu bar, first with the "Projects" section for searching/filtering projects, second the "Featured Projects" section for assigning and ranking the featured projects for display on the homepage, third the "Showcase" section for adding/editing the Showcase categories, fourth the "Standard Categories" section for adding/editing the Standard categories, firth the "Admin Users" section for managing admin user accounts, and sixth the "Analytics" section for viewing analytics data.
- The filtering categories shall be displayed on the left-hand side of the page, which shall allow for combining of the Status Group and Category group for further narrowing of results. The exact filtering rules allowed in the Admin Dashboard shall be declared in the Functional Specifications of the Admin Dashboard Page above. Furthermore, the Admin Dashboard shall share the same sort/pagination behaviour and rules as the Projects/Search page. This design choice shall separate the admin and user interfaces visually to avoid any potential confusion between the two. The dashboard shall also support a drag-and-drop feature for admins to prioritise and approve projects which shall appear as featured on the homepage, per category. 

---

## Handoff to UX Notes:
- As the specifications requirements have evolved over the past few iterations, additional changes requiring the UX to be aware of shall be listed here. These include:
    - Retain the original filtering categories (Health, Education, Workplace) disregarding the recent changes I made in v5.0 as they are now complimentary to the previously added and confirmed Showcase categories (AFP / Capstone / Apple Minor).  
    - Tags which have been removed from the Specification Requirements and scope NO LONGER require consideration, from both a UX and Dev perspective.

---

## Deliverable:
- This Requirements Specification document shall be delivered as a markdown file `.md`, named `requirements-specification.md` and committed to the project's `docs/` directory.
- The document shall be shared as a deliverable with the UX for refinements and feedback, then the Dev for implementation.