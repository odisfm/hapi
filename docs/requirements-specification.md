# HAPI Showcase — Requirements Specification & Design Proposal
- **Role:** BA — Imraan Mohammed
- **Date:** Monday, 24th Aug 2026 (Version 3.0)
- **Status:** Draft (Version 3.0)
- **Details:** This document consolidates ideas from our signed project proposal and client meeting notes, complimenting them as an extension, providing implementation ready details, including functional and non-functional requirements, in addition to design elements our UX Designer (Max Thum) has already sketched out, and Infrastructure/Hosting Architecture planned by our Dev 1 (Nick Moore). 
- **Related Document:** The signed Client Project Proposal organised by our PM (Nirmal Rajesh) already covers the business context, such as the problem statement, our team roles, target users, stakeholders, proposed solution, success criteria, scope boundaries, 3-sprint roadmap, assumptions and constraints.
    - [Signed Client Project Proposal (PDF)](https://rmiteduau.sharepoint.com/:b:/r/sites/CapstoneProgrammingProject2026-68-HAPIApplePlatformShowcaseTeamA/Shared%20Documents/SIGNED%20HAPI%20Showcase%20Client%20Project%20Proposal%5B64%5D.pdf?d=w5547aa661f4f466982b7ea8309db2338&csf=1&web=1&e=HEDrkA)
- **Scope Note:** This scope of this document simply defines the requirements for the project, and any edge cases raised by the client alone. EPICS and User Stories are to be derived from this document as a separate Sprint 1 (Week 2) deliverable by our PM (Nirmal Rajesh). As for formal end-to-end and user acceptance testing scenarios covering these requirements and edge cases identified are to be part of a separate Sprint 1 (Week 2) deliverable by myself as BA (Imraan Mohammed). 

---

## 1. Functional Requirements/Rules

### Browsing:
- The homepage shall be publicly accessible without requiring a login, and shall display a browseable grid of featured, approved showcase projects.
- Each showcase project shall be displayed as a summary card containing an icon, name, and short description.
    - Clicking or tapping a project card shall navigate the user to that project's dedicated page.
    - Clicking or tapping the "View More" button shall navigate the user to the projects/search page to browse the full list of projects. 
    
### Individual Project Pages:
- Project Attributes (Fields): 
    - Icon **|** Name **|** Subtitle (Short/Summary Description) **|** Developer/s **|**  Category **|** Date Created **|** **_<span style="color:red">Size (Optional)</span>_** **|** Version **|** Download Link(s) **|** Contact Us **|**
    - Screenshots Gallery **|** Video Walkthrough **|** Description **|** Tags
        - **_<span style="color:hsl(42, 100%, 75%)"> Tags shall be an optional field for implementation, and if present, shall be displayed as small labels at the bottom of the project details card. </span>_**
    - **Screenshots Gallery** shall have a minimum of 4 images and shall be shown in a carousel/slideshow format. 
    - **Video Walkthrough** shall be optional for Demoing the Project/Showcase (**Optional, as students are not required to submit one**):
        - Auto-play shall be an optional feature in a muted state by default. This shall be displayed directly below the project/showcase main details and above the screenshots gallery/slideshow.  
        - Videos (Dynamic Media) shall stored on a separate S3 Bucket from the Static Frontend Solution, with a bucket dedicated to Media Storage.
        - **_<span style="color:red"> YOUTUBE Embedding shall be an (Alternative Solution) to showcase videos, for cost-savings, however, keep in mind it introduces an external dependency besides the main hosting solution. <span>_**
    - **_<span style="color:red"> File Size shall be optional and not always be displayed, since not every project is a standalone downloadable app. However, if a project is downloadable, the size shall be shown alongside the download link. </span>_**
    - **Download Options:**
        1. **IPA (Minimum/Required, if available):** iOS App Store Package file shall available for download be in the (.ipa) package format.
        2. **App Store Link and/or TestFlight Link:** These links shall be provided as easier installation options compared with the manual download of the IPA file, for downloadable iOS app projects, and shall cover apps currently in beta testing (TestFlight) and/or apps that are fully live publicly via (App Store).
        3. **Link to Showcase/Project:** Specifically for projects that are not downloadable, like web-based projects.
        4. **GitHub Link (Optional):** shall be shown only if the project is open-sourced, and shall be used for version history. 
            - _If a linked GitHub repository becomes private or is deleted later, the remaining IPA/other links shall remain sufficient to keep the page functional._
        - If a project supports multiple platforms, for example iPhone and Vision Pro, each platform shall be treated as its own separate version/download, and NOT bundled into a single package. Each platform specific download version shall be clearly labelled by their platform so users can manually select the correct version they wish to download.
            - _<span style="color:hsl(42, 100%, 75%)">**Stretch Goal (optional, on the Dev-side):** the site shall implement a "Platform-Aware AUto-Detection" feature, which shall automatically detect whether the visitor is on macOS, iOS, or Vision Pro and suggest the matching version to download. If this feature is implemented, and the platform a user is on cannot be detected or is unsupported, the site shall fall back to manual platform selection rather than defaulting to an incorrectly guessing a version suggestion.</span>_
    - **Contact Us:** the page shall display a Contact Us option by default alongside the Download option on every project page. The HAPI shared email shall act as the intermediary and middle-man between visitors wishing to connect with the original developers, since the developers may have since graduated or otherwise moved on. 
        - If a project has no download option available, the page shall display the Contact Us option in place of the downloads section, rather than disabling the or greying out the Download section.
        - This contact us option shall be a direct link to the shared HAPI email address, using the `mailto:` html attribute, allowing the user to send an email directly to the HAPI team. This shall not implement a custom pop-up form or messaging system.

### Projects/Search Page:
- **Visual Rule #1:** The Projects/Search Results Page shall reuse the homepage's card grid layout, displaying each project's category in place of its short description. 
- A **search bar** shall be positioned at the top of the page and shall match key terms against project Name and Description fields. 
- **Category/Tag** filtering shall be displayed on the left-hand side of the page. 
    - _<span style="color:hsl(42, 100%, 75%)"> **Stretch Goal - Tag Filtering:** Tag Filtering is not part of the base scope and shall only be implemented once the core site functionality meets the project's base scope. **If implemented**, Tag Filtering shall be displayed on the left-hand side alongside Category Filtering, and shall complement it for additional narrowing of results. Unlike Category filtering, which shall only allow one category to be selected at a time, Tag Filtering shall allow for multiple tags to be selected in combination.</span>_
- **Sort:** the site shall support sorting filtered/searched showcase projects by either alphabetical order or date created.
- **Pagination:** the site shall limit the number of projects displayed per page to 20, and shall display a _"Next Page"_ button at the bottom of the page to navigate users to the next page of results, once that limit of 20 projects has been reached.
- **Visual Rule #2:** The site shall visually indicate to a user which category/filter options are currently selected or deselected, so that the user see exactly what they have searched or filtered by. _**<span style="color:red"> This issue was raised by Ace (HAPI Architect).</span>**_
- **Edge Case #1:** If a category is already selected and the user selects a different category, the newly selected category shall replace the previously selected one, instead of appending or adding to the list of selected categories for filtering.
- **Edge Case #2:** If a user clears/resets a search, only the search term shall be cleared, and any active sort or filtering selections shall remain unchanged. 

### Admin Dashboard Page:
- Dashboard for admins: _Michael & Ace._
- The Admin Dashboard shall be accessible only to Michael and Ace, via a single shared admin login. 
- The Admin Dashboard shall be accessible only via a hidden, non-linked URL path: `/admin-login`, and shall not be discoverable through public navigation unless the url path is manually entered into the browser's address bar.
- Only authenticated admins shall be able to add, edit, and approve/reject project in the projects listing queue.
- _<span style="color:hsl(160, 100%, 33%)">**External Dependency — Student Project Submission Details via HAPI Email:**_
    - _<span style="color:hsl(160, 100%, 33%)"> Students shall be expected to email their project submission details to the shared HAPI email address, as an automated student project submission portal/dashboard is currently out of scope. </span>_
    - _<span style="color:hsl(160, 100%, 33%)"> Admins shall be expected to coordinate with these students to ensure the following details are included before a project can be reviewed/approved and manually added to the site: Icon, Name, Subtitle (Short Description), Long Description, Developer Name/s, Category, Screenshots/Images (minium of 4), Optional Video Walkthrough Link, Supported Platform Version/s, (iOS, macOS, Vision Pro, etc.), and relevant download/source link/s, such as IPA, App Store, TestFlight, and/or GitHub repo if open-sourced.</span>_
- **Adding Projects:** An "Add Project" button shall be displayed on the top-right corner of the Admin Dashboard. Clicking it shall open a pop-up form, not a separate page, for the admin to manually enter a new project's details. 
- **Layout:** The Admin Dashboard shall use a similar layout to the Projects/Search Results Page, except display listings as a horizontal list of cards, one project per row, instead of 2-3 or more columns that the Projects/Search page displays depending on screen size. Each row shall show the project's icon, name, short description, status state (either: Pending/Approved/Rejected). This design choice shall separate the admin and user interfaces visually to avoid any potential confusion between the two.
    - **Pending** shall indicate the project entry is incomplete or awaiting further details from the student before it's ready for review and approval.
    - **Rejected** shall indicate a completed project entry that the admin has chosen not to make public. This status shall also allow taking down projects that were previously approved without deleting their records from the database.
    - **Approved** shall indicate a completed project entry that the admin has chosen to make public and display on the site.
    - **Additional Actions:** Each row representing a project shall display an "Action" button on the right-hand side, which shall show either an "Edit" and "Delete" button
        - Clicking the **"Edit"** button shall open a pop-up form for editing the current project's details.
        - Clicking the **"Delete"** button shall open a pop-up form for confirming the deletion of the project from the database.

- **Sort/Pagination:** The Admin Dashboard page shall share the same sort/pagination behaviour and rules as the Projects/Search page.
- **Filtering:** the Admin Dashboard page provide two separate filter groups, one for Status (Approved/Pending/Rejected) and one for Category (Health, Education, Workplace, etc.).
    - Within each group, only one option shall be selectable at a time, similar to the Projects/Search page.
    - The two groups shall be combinable with each other at the same time, so that users can filter by both status and category at the same time.
    - **Edge Case #3:** If an admin changes the selection within one filter group, then only that group's filter option shall update, the other filter group's current selection shall remain unaffected.
    - When a project's status is set to rejected, the admin shall be required to enter a short feedback/reason for the rejection, which shall be stored as part of the project's record.

### <span style="color:hsl(42, 100%, 75%)">Stretch Goal - Web Wrapper Application:</span>
- _<span style="color:hsl(42, 100%, 75%)"> The system shall support the delivery of a lightweight wrapper packaging the existing website as an installable, app-like experience, whether for iPad or iPhone, rather than a complete rebuilding of the site._
- _<span style="color:hsl(42, 100%, 75%)"> This additional consideration is not a core deliverable of this project, but shall be a "Stretch Goal" brought up by the Client as declared in the originally signed Client Project Proposal document._

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

### Availability: 
- **_<span style="color:red">The Website shall be reachable via a yet to be confirmed address:</span>_**  
    - _<span style="color:red">subdomain-based URL structure: `hapi.rmit.edu.au`</span>_
    - _<span style="color:red">path-based routing URL: `rmit.edu.au/hapi`</span>_
- **Fallback**: if no hosting platform decision can be reached in time, a Packaged Site including a Database export delivered via the GitHub repository shall be an acceptable substitute deliverable.  
- Redundancy & High Availability: will be covered in the Backend Architecture section.

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
    - **Screenshots/Icons (Static Media):** shall be stored on the same S3 Bucket as the Static Frontend Solution. 
    - **Video (Dynamic Media):** Shall be stored in a separate S3 Bucket for dedicated video storage.
        - **_<span style="color:red"> YOUTUBE Embedding shall be an (Alternative Solution) to showcase videos, for cost-savings, however, keep in mind it introduces an external dependency besides the main hosting solution. <span>_**

- **Data Store (Database):** 
    - **Main:** Shall use Postgresql via AWS RDS, and a database schema shall be prepared based on the required attributes of each HAPI showcase project.
    - **Alternative/Backup Option:** Shall use Supabase, if RDS turns out too costly or otherwise not viable.
    - **Project Records Required Attributes:** Each project shall be represented as a database record containing the following attributes:
        - _ProjectID, Icon, Name, Subtitle (Short Description), Description (Long Description), Developers (Names), Category, Tags (Optional), DataCreated, PlatformVersion, FileSize (Optional), IPA_Link, AppStore_Link, TestFlight_Link, ProjectLink, GitHubLink, VideoWalkthrough (Optional), ScreenshotsFolder, ApprovalStatus, RejectionFeedback (or RejectionReason)._
        - _**Note:** These attributes cover the necessary details for a project, per a specification requirements perspective, therefore, data types, rules and structure shall be determined by the development team._
    
- **Project Application Approval Status:** Projects shall have an assignable approval-status field/attribute where only approved projects are visible on the public site. The values shall be:
    - **Pending:** Shall be currently under review.
    - **Approved:** Shall be ready for public display on the site.
    - **Rejected:** Shall include a stored feedback/reason attribute, which is provided by the admin at the time of the rejection of the individual project. 

- **Project Application Actions:** Projects shall be manipulatable by the admin, where new projects can be added, existing projects can be edited or permanently deleted.
    - **Add/Edit:** Shall be standard create and update actions for new and existing projects as records in the database. Add shall create a new entry via the Admin Dashboard's "Add Project" popup form, and "Edit" shall update an existing entry via each project's pop-up "Action" button in the Admin Dashboard, displaying the same form, but pre-filled with the current project's details.
    - **Delete:** Shall be a distinctly permanent action from "Rejected", which shall remove the project entirely, while "Rejected" retains the record but hides it from the public view. 

- **Contact US:** Shall use the HAPI email address for direct messaging, which shall leverage the `mailto:` html attribute link, allowing the user to send an email directly to the HAPI team.
    - _**Note:** Although the Contact Us option shall visually replace the Download button on the frontend when a project has no downloadable link, this shall only be a display isolated feature/behaviour, while the database schema shall still retain the download related fields for that project record, but empty/null.**_

- **Search/Filtering:** Shall use a simple and quick client-side JS keyword search for partial matches on a Project Name and/or it's Description, where an exact match is not required, alongside Category Filtering. 
    - _<span style="color:hsl(42, 100%, 75%)"> Refer to **Stretch Goal - Tag Filtering (in Projects/Search Page):** for Further Details.</span>_

---

## 4. Frontend Interface Design — Proposal & Ideas:

> Nothing shall be considered finalised here, as these shall be working ideas for our UX to confirm and refine into a design that reflects a clearer visual representation of what the HAPI Showcase website shall look like.

- **Overall Layout:** Shall blend an Apple App Store aesthetic fused with RMIT/HAPI branding, clean grid layouts, card-based browsing and clear imagery for individual project pages. The design shall be responsive to different screen sizes, accounting for iPad, iPhone and web/desktop.

- **Homepage:** Shall display a Welcome area, browseable grid of featured project in card format, including icon, name and short description and view more button directing users to the project/search page. 

- **Individual Project Pages:** Shall includes icon, name, subtitle (short summary), developers, date created, version(s) with clear labels of supported Platform Type(s), category, _<span style="color:hsl(42, 100%, 75%)">**tags (optional, and shown as small labels at bottom of card)**</span>_, long description, screenshots (minimum of 4, shown in carousel or grid format), optional video walkthrough (auto-play optional, muted by default and positioned above the screenshot gallery), download/source link(s) (IPA, App Store and/or TestFlight, Link to Non-Downloadable Projects, GitHub for open-sourced projects), file size shown alongside the download link if downloadable, and a contact us button with a `mailto:` link to the HAPI email address shown by default which also replaces the download option if the project is not downloadable.

- **Project Search Page:** Shall reuse the same card grid as the homepage for projects, with a search bar at the top of the page, filtering categories on left side of page, _<span style="color:hsl(42, 100%, 75%)">**tag filtering (shall remain as a Stretch Goal alongside category filtering)**</span>_, Sort and Pagination controls, a visual indicator showing which filters are currently selected/deselected, and a no-results message when projects don't match the user search terms.

- **Admin Dashboard:** Shall retains each project's icon, name and subtitle (short description), but displayed it shall be displayed as a horizontal list of cards, with one project per row, rather than 2-3 or more columns that the Projects/Search page displays depending on screen size. It shall also include an "Add Project" button in the top-right corner of the page, which shall open a pop-up form for manually entering new projects, as well as an approval status, either Pending/Approved/Rejected with a stored feedback/reason attribute for rejected project applications, and an "Action" button per row/project, which shall reopen the pop-up form for editing the project's details or deleting the project entirely after a confirmation popup appears to verify the action. Status changes between Pending/Approved/Rejected shall be via the Edit option popup form. The filtering categories shall be displayed on the left-hand side of the page, which shall allow for combining of the Status Group and Category group for further narrowing of results. The exact filtering rules allowed in the Admin Dashboard shall be declared in the Functional Specifications of the Admin Dashboard Page above. Furthermore, the Admin Dashboard shall share the same sort/pagination behaviour and rules as the Projects/Search page. This design choice shall separate the admin and user interfaces visually to avoid any potential confusion between the two.

---

## Handoff to UX Notes:
- As the specifications requirements has evolved over the past few iterations, additional changes requiring the UX to be aware of shall be listed here. These include:
    - Subtitle (Short Summary) and Data Created Fields added to the Project Details Page.
    - Platform-Aware Labelling (iPhone, iPad, macOS, Vision Pro, etc.) clearly identified for each download version added to the Project Details Page.
    - Contact Us `mail:to` link added to the Project Details Page, replacing the Download option if the project is not downloadable.
    - Sort, Pagination, visual selected/deselected filter states, with the two filtering edge cases identified for inclusion to the Projects/Search Page.
    - **Admin Dashboard:** 
        - "Add Project" button, which shall open a popup form for manually entering new projects.
        - "Actions" button per row/project, shall display either the "Edit" or "Delete" options, where editing shall reopen the pop-up form for adjusting the project's details, or where deleting shall open a confirmation popup for verifying the action of deleting the project entirely.
        - Status Fields "Pending/Approved/Rejected" shall be assigned via the "Edit" popup form.
        - Separate Filtering Groups, which can be combined with each other, but within each group only one option shall be selectable at a time, which shall be "Status" as one, and "Category" as the other.

---

## Deliverable:
- This Requirements Specification document shall be delivered as a markdown file `.md`, named `requirements-specification.md` and committed to the project's `docs/` directory.
- The document shall be shared as a deliverable with the UX for refinements and feedback, then the Dev for implementation. 