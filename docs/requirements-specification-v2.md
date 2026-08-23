# HAPI Showcase — Requirements Specification & Design Proposal
- **Role:** BA — Imraan Mohammed
- **Date:** Sun, 23rd Aug 2026 (Version 2.0)
- **Status:** Draft (Version 2.0)
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
        1. IPA (**Minimum/Required, if available**): iOS App Store Package file shall available for download be in the (.ipa) package format.
        2. Link to Showcase/Project (OR) App Store Link shall be an option for downloading/accessing.
        3. GitHub Link (**Optional**): shall be shown only if the project is open-sourced, and shall be used for version history. 
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
- **Layout:** the Admin Dashboard shall use a similar layout to the Projects/Search Results Page, except display listings as a horizontal list of cards, one project per row, instead of 2-3 or more columns that the Projects/Search page displays depending on screen size. Each row shall show the project's icon, name, short description, status state (either: approved/pending/rejected), and action button to approve/reject or keep the project pending in queue. This design choice shall separate the admin and user interfaces visually to avoid any potential confusion between the two.
- **Sort/Pagination:** The Admin Dashboard page shall share the same sort/pagination behaviour and rules as the Projects/Search page.
- **Filtering:** the Admin Dashboard page provide two separate filter groups, one for Status (Approved/Pending/Rejected) and one for Category (Health, Education, Workplace, etc.).
    - Within each group, only one option shall be selectable at a time, similar to the Projects/Search page.
    - The two groups shall be combinable with each other at the same time, so that users can filter by both status and category at the same time.
    - **Edge Case #3:** If an admin changes the selection within one filter group, then only that group's filter option shall update, the other filter group's current selection shall remain unaffected.
    - When a project is rejected, the admin shall be required to enter a short feedback or reason for the rejection as an attached message to the project, which shall be stored as part of the project's record in the database.

### <span style="color:hsl(42, 100%, 75%)">Stretch Goal - Developer/Student Submission Form Page:</span>
1. **<span style="color:hsl(42, 100%, 75%)">Option 1:** Students may submit an email to the shared HAPI email address with their project application, thereby not requiring any further from the members of this project in terms ensuring project submission requests are received. It is expected that the minimal details to be sent include: Project Icon, Project Name, Developer Names, Short Description, Long Description, Category Section, Screenshots/Images (minium of 4), Link to a Video Walkthrough of the Project (expected to be their shared OneDrive link), Accepted Versions the Project Supports (iOS, macOS, Vision Pro, etc) and packaged files like (.ipa) or links to the Project itself, even a GitHub link to the project's repository if open-sourced.
2. **<span style="color:hsl(42, 100%, 75%)">Option 2:** Students may submit their project applications to be showcased on the public site. Students must use a valid student ID (front-end JS email validation rules - ending with `@student.rmit.edu.au`). Their application will be added to a waitlist queue table until a project is approved.
3. **<span style="color:hsl(42, 100%, 75%)">Option 3:** Students may create an account via a sign-up/login dashboard and submit their project applications to be showcased on the public site. Students must use a valid student ID (front-end JS email validation rules - ending with `@student.rmit.edu.au`). **<span style="color:hsl(42, 100%, 75%)"> May be more secure this way where a student must also verify their email via a link sent to them.</span>** Their application will be added to a waitlist queue table until a project is approved.

### <span style="color:hsl(42, 100%, 75%)">Stretch Goal - Web Wrapper Application:</span>
- _<span style="color:hsl(42, 100%, 75%)"> The system shall support the delivery of a lightweight wrapper packaging the existing website as an installable, app-like experience, whether for iPad or iPhone, rather than a complete rebuilding of the site._
- _<span style="color:hsl(42, 100%, 75%)"> This additional consideration is not a core deliverable of this project, but shall be a "Stretch Goal" brought up by the Client as declared in the originally signed Client Project Proposal document._

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
    - **Main:** Shall use Postgresql via AWS RDS.
    - **Alternative/Backup Option:** Shall use Supabase, if RDS turns out too costly or otherwise not viable.
    
- **Project Application Approval Status:** Projects shall have an approval-status field/attribute where only approved projects are visible on the public site. The values shall be:
    - pending (currently/under reviewing)
    - approved
    - rejected: which shall include a stored feedback/reason attribute, which is provided by the admin at the time of the rejection of the individual project. 

- **Contact US:** shall use the HAPI email address for direct messaging, which shall leverage the `mailto:` html attribute link, allowing the user to send an email directly to the HAPI team.

- **Search/Filtering:** Shall use a simple and quick client-side JS keyword search for partial matches on a Project Name and/or it's Description, where an exact match is not required, alongside Category Filtering. 
    - _<span style="color:hsl(42, 100%, 75%)"> **Stretch Goal - Tag Filtering:** Tag Filtering is not part of the base scope and shall only be implemented once the core site functionality meets the project's base scope. **If implemented**, Tag Filtering shall be displayed on the left-hand side alongside Category Filtering, and shall complement it for additional narrowing of results. Unlike Category filtering, which shall only allow one category to be selected at a time, Tag Filtering shall allow for multiple tags to be selected in combination.</span>_

---

## 4. Frontend Interface Design — Proposal & Ideas:

> Nothing shall be considered finalised here, as these shall be working ideas for our UX to confirm and refine into a design that reflects a clearer visual representation of what the HAPI Showcase website shall look like.

- **Overall Layout:** Shall blend an Apple App Store aesthetic fused with RMIT/HAPI branding, clean grid layouts, card-based browsing and clear imagery for individual project pages. The design shall be responsive to different screen sizes, accounting for iPad, iPhone and web/desktop.

- **Homepage:** Shall display a Welcome area, browseable grid of featured project in card format, including icon, name and short description and view more button directing users to the project/search page. 

- **Individual Project Pages:** Shall includes icon, name, subtitle, developers, version(s) with clear labels of supported Platform Type(s), category, tags (optional, and shown as small labels at bottom of card), description, screenshots (minimum of 4, shown in carousel or grid format), optional video walkthrough (auto-play optional, muted by default and positioned above the screenshot gallery), download/source link(s) (IPA, App Store Link, GitHub), file size shown alongside the download link if downloadable, and a contact us button with a `mailto:` link to the HAPI email address shown by default which also replaces the download option if the project is not downloadable.

- **Project Search Page:** Shall reuse the same card grid as the homepage for projects, displays filtering categories on left side of page, and no results message displays when projects don't match the user search terms.

- **Admin Dashboard:** Shall retains each project's icon, name and subtitle (short description), but displayed it shall be displayed as a horizontal list of cards, with one project per row, rather than 2-3 or more columns that the Projects/Search page displays depending on screen size. It shall also, in addition include an approval status with a stored feedback attribute for rejected project applications, and an action button to approve/reject pending projects. The filtering categories shall be displayed on the left-hand side of the page, which shall allow for combining of the Status Group and Category group for further narrowing of results. The exact filtering rules allowed in the Admin Dashboard shall be declared in the Functional Specifications of the Admin Dashboard Page above. Furthermore, the Admin Dashboard shall share the same sort/pagination behaviour and rules as the Projects/Search page. This design choice shall separate the admin and user interfaces visually to avoid any potential confusion between the two.

---

## Deliverable:
- This Requirements Specification document shall be delivered as a markdown file `.md`, named `requirements-specification.md` and committed to the project's `docs/` directory.
- The document shall be shared as a deliverable with the UX for refinements and feedback, then the Dev for implementation.