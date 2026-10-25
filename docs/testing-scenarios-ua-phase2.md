# HAPI Showcase — Test Scenarios — for User Acceptance (UA) Phase 2
- **Role:** BA — Imraan Mohammed
- **Date:** Sprint 3, Week 1 (Week 8) — Sat, 17th Oct 2026 (Version 6.0)
- **Status:** Draft (Version 6.0)
- **Details:** This document includes test scenarios which are derived from the `requirements-specification.md` document, covering three perspectives: General/Public Access, Student/Developer Access and Admin Access from an end-user perspective, alongside any edge cases identified during feedback sessions from the client and our PM (Nirmal Rajesh). Revision (v5.0) restructures the document into Phase 1 for Completed tests and Phase 2 being the current stage. This shall align UAT scenarios with the updated Requirements Specification from v9.0 while retaining the necessary WCAG Accessibility Testing Scenarios.
- **Related Document:** The signed Client Project Proposal organised by our PM (Nirmal Rajesh) and the Sprint 1 Week 1's Requirements Specification Document prepared myself, the BA (Imraan Mohammed), which covers functional and non-functional requirements, edge cases and design guides, all are related documents and are referenced in this document as a source of truth.
    - [Signed Client Project Proposal (PDF)](https://rmiteduau.sharepoint.com/:b:/r/sites/CapstoneProgrammingProject2026-68-HAPIApplePlatformShowcaseTeamA/Shared%20Documents/SIGNED%20HAPI%20Showcase%20Client%20Project%20Proposal%5B64%5D.pdf?d=w5547aa661f4f466982b7ea8309db2338&csf=1&web=1&e=HEDrkA)
    - [`requirements-specification.md` (MD file - Version 9.0)](https://github.com/odisfm/hapi/blob/main/docs/requirements-specification.md)
    - [`requirements-specification.pdf` (PDF file - Version 9.0)](https://github.com/odisfm/hapi/blob/main/docs/requirements-specification.pdf)

- **Scope Note:** This document shall simply define testable scenarios covering the functional requirements and edge cases covered in the Requirements Specification Document, from a General/Public, Student/Developer and Admin Access perspective. A draft set of WCAG Accessibility Testing Scenarios shall now also be included as part of this revision, covering basic guidelines named in the Specification Requirements Document. Backend and Infrastructure concerns, including hosting, storage, database and security/encryption matters, shall be acknowledged as important but sit outside a user acceptance scope, and excluded from this document for now. This document shall be a working checklist against the Requirements Specification Document, and shall be further refined iteratively in the final sprint after feedback and review from the team and client.
  
---

# PHASE 2 OUTSTANDING & RESOLVED TEST SCENARIOS (3/4 DONE)

**Individual Project Page**
- [ ] 01 (#01). Confirm that the project page shall **DISPLAY ITS SHOWCASE CATEGORY (PROGRAM/YEAR/SEMESTER) DISTINCTLY FROM** its ***Standard Category***, and that the showcase links through to its dedicated showcase page.
  - **STATUS:** IN-PROGRESS - [Issue #137](https://github.com/odisfm/hapi/issues/137)

**3. DRAFT WCAG Accessibility (General/Public & Admin) — User Acceptance (UAT) Testing Scenarios**
- [X] 02 (#02). Confirm that **THE ADMIN DASHBOARD DRAG-AND-DROP FEATURED-PROJECT FEATURE SHALL INCLUDE A KEYBOARD-OPERABLE ALTERNATIVE**, such as ***a readable heart button for selecting a project as featured, then an up/down arrow button for ranking the project***.
  - **STATUS:** DONE - [Issue #158](https://github.com/odisfm/hapi/issues/158)

**PROJECTS SECTION #2: & Sorting, Pagination & Filters**
- [X] 03 (#03). Confirm that the **SORTING BEHAVIOUR** on the Admin Dashboard ***shall match the General/Public Search page exactly***.
  - **STATUS:** DONE - [Issue #157](https://github.com/odisfm/hapi/issues/157)

**ANALYTICS SECTION: & Viewing Analytics**
- [X] 04 (#04). Confirm that **UMAMI ANALYTICS IS ACCESSIBLE** via a ***dedicated external dashboard*** link within the Analytics section.
  - **STATUS:** DONE - [Issue #128](https://github.com/odisfm/hapi/pull/128)

# PHASE 2 COMPLETED TEST SCENARIOS

## 1. General/Public Access — User Acceptance (UAT) Testing Scenarios

- [X] 01 (#05). Confirm that the **SITE CAN BE INSTALLED TO A DEVICE'S HOME SCREEN** as a ***Progressive Web App (PWA)***.
- [X] 02 (#06). Confirm that **ON MOBILE VIEW THE HEADER MENU COLLAPSES INTO A HAMBURGER SIDE MENU** after clicking/clicking the "≡" icon, and ***displays the three quick links (Applications, Categories, Showcases) and search bar row by row***, each navigating a user to their selected page. 
- [X] 03 (#07). Confirm that the **STAGING ENVIRONMENT SHALL DISPLAY PRE-POPULATED DEMO APPS AS PROJECTS**, and that ***no demo/placeholder projects appear on the production environment***.

**Header/Footer Navigation**
- [X] 04 (#08). Confirm that the **PUBLIC HEADER MENU** shall include **THREE** quick links, **APPLICATIONS** linking to the Projects/Search page, **CATEGORIES** linking to dedicated Standard Categories page, and **SHOWCASES** linking to dedicated Showcases page, **WITH A SEARCH BUTTON ACCESSIBLE ON EVERY PAGE**.
- [X] 05 (#09). Confirm that the **SITE FOOTER** shows ***direct links to all Showcases whose publish dates have already passed***.

**Homepage**
- [X] 06 (#10). Confirm that each **FEATURED SPOTLIGHT PROJECT CARD SHALL DISPLAY** an ***icon, name, subtitle (short description) and with NO SHOWCASE label displayed***, within their respective **featured gallery/carousel**.

**Category & Showcase Pages**
- [X] 07 (#11). Confirm that the **CATEGORIES PAGE** lists ***every Standard Category***, with each Category clickable to ***redirect users to the Projects/Search page with that Category selected as a filter.***
- [X] 08 (#12). Confirm that a **"DISCOVER MORE" SPOTLIGHT** is present below the Category list, ***displaying random project recommendations.***
- [X] 09 (#13). Confirm that the **SHOWCASES PAGE** lists every Showcase, ***organised by Semester and Year.***
- [X] 10 (#14). Confirm that each **SHOWCASE** opens its own **DEDICATED PAGE** displaying the ***Showcase Name, Year, Semester, Publish Date, Description, and its associated projects.***

**Individual Project Page**
- [X] 11 (#15). Confirm that **EACH AVAILABLE DOWNLOAD/CONTACT OPTION** (App Store, TestFlight, Website/Link to Showcase-Project, GitHub, Contact Us) are ***displayed independently as their own SEPARATE AND INDEPENDENT BUTTONS***, rather than collapsed into a single dropdown.

**Search/Projects Page**
- [X] 12 (#16). Confirm that **SORT SHALL FUNCTION** correctly by ***RELEVANCE (DEFAULT), MOST POPULAR, A–Z, Z–A, NEWEST, AND OLDEST***, with newest/oldest based on the associated showcase publish date, and popularity based on project page views.
- [X] 13 (#17). Confirm that the **PUBLIC VISIBILITY RULE** applies where a ***project is only visible when it is published, its Showcase publish date has been reached, and its current version approved.***
- [X] 14 (#18). Confirm that **WHEN A NEW PROJECT VERSION IS APPROVED**, the ***previous live version is marked as SUPERSEDED and its outdated content no longer publicly displayed.***
- [X] 15 (#19). Confirm that **CLEARING THE SELECTED FILTERS** ***leaves any active search term unaffected*** and vice versa.


## 2. Admin Access — User Acceptance (UAT) Testing Scenarios

- [X] 16 (#20). Confirm that the **ADMIN DASHBOARD'S HORIZONTAL TOP MENU** provides ***SEVEN SECTIONS: Projects, Featured Projects, Project Queue, Showcase, Standard Categories, Users, and Analytics***.
- [X] 17 (#21). Confirm that **NEW PROJECTS ARE UNPUBLISHED BY DEFAULT**, and that ***approving a project automatically sets it to Published***, then becomes visible once its Showcase publish date has been reached.

**SHOWCASE SECTION: & Defining Showcases Categories**
- [X] 18 (#22). Confirm that a **SHOWCASE CANNOT BE DELETED** while projects remain associated with it, and that an error or warning is shown.
- [X] 19 (#23). Confirm that each **SHOWCASE'S FIELDS**, including SHOWCASE NAME, YEAR, SEMESTER, PUBLISH DATE, DESCRIPTION (MARKDOWN EDITOR), AND SLUGs are all *editable and saved correctly*.
- [X] 20 (#24). Confirm that a **SHOWCASE'S PUBLISH DATE** ***determines when its associated projects become publicly visible.***
- [X] 21 (#25). Confirm that a ***project whose Showcase Publish Date has not yet been reached*** is **TREATED AS UNPUBLISHED**, regardless of its own approval status.

**STANDARD CATEGORY SECTION: & Defining Standard Categories**
- [X] 22 (#26). Confirm that admins shall be able to **DEFINE AND ADD A NEW STANDARD CATEGORY** ***from this section***.
- [X] 23 (#27). Confirm that admins shall be able to **RENAME/DELETE AN EXISTING STANDARD CATEGORY** ***from this section***.

**USERS SECTION: & Managing Admin/Student Accounts**
- [X] 24 (#28). Confirm that admins can **CREATE AND DELETE** student accounts, and that ***students receive login credentials by email upon creation.***
- [X] 25 (#29). Confirm that admins can **CSV BATCH IMPORT** ***multiple student accounts at once.***
- [X] 26 (#30). Confirm that **STUDENTS CANNOT SELF-SIGN-UP** to the site.

**PROJECT QUEUE SECTION: Managing Project Versions via Admin Editorial Review**
- [X] 27 (#31). Confirm that an **APPROVED PROJECT VERSION** *removes the version from the project queue and updates the live project record* with the new version's changes.
- [X] 28 (#32). Confirm that the **OLD VERSION REMAINS PUBLIC UNTIL THE NEW VERSION IS APPROVED**, at which point the old version is marked as SUPERSEDED.

**ANALYTICS SECTION: & Viewing Analytics**
- [X] 29 (#33). Confirm that the **"MOST VIEWED PROJECTS"** TABLE is present, ***ranking projects by page view count.***
- [X] 30 (#34). Confirm that the **"MOST VIEWED PROJECTS" TABLE CAN FILTER BY A PREDEFINED SET OF TIME RANGES** (Last 24 hours, Last 7 days, Last 30 days) or a CUSTOM DATE RANGE.
- [X] 31 (#35). Confirm that **PROJECTS WITH ZERO VIEWS ARE EXCLUDED** from the Most Viewed Projects table.
- [X] 32 (#36). Confirm that the **"MOST VIEWED PROJECTS"** TABLE PAGINATES at 10 projects per page.

**PROJECTS SECTION #1: & Managing Projects**
- [X] 33 (#37). Confirm that *links added to a project* are **AUTOMATICALLY RECOGNISED** as GitHub, App Store, TestFlight, or Website links.

## 3. Student/Developer Access — User Acceptance (UAT) Testing Scenarios

**Login & Access**
- [X] 34 (#38). Confirm that **STUDENTS SIGN** in through the **SAME UNIFIED /LOGIN PAGE AS ADMINS**, and the ***system automatically recognises the user's role***.
- [X] 35 (#39). Confirm that a **STUDENT CANNOT ACCESS THE ADMIN DASHBOARD** or any admin-only functionality.

**Student Dashboard**
- [X] 36 (#40). Confirm that the ***Student Dashboard is accessible only*** to **AUTHENTICATED STUDENTS** with an account.
- [X] 37 (#41). Confirm that the *Student Dashboard displays* the student's **OWN PROJECTS AND THEIR SUBMITTED VERSIONS.**

**Student/Developer Managing Projects**
- [X] 38 (#42). Confirm that students can **ADD A NEW PROJECT**, with all required fields (***Icon, Name, Subtitle, Long Description, Developer Name/s, Standard Categories, Links, Screenshots per device, Optional Video Walkthrough, Optional Hero Banner Image***).
- [X] 39 (#43). Confirm that students **MUST FIRST SELECT A SHOWCASE FIRST** when adding a project, and that this ***CANNOT BE CHANGED once submitted except by an admin.***
- [X] 40 (#44). Confirm that **STUDENTS CANNOT EDIT ADMIN-ONLY FIELDS** including: ***SHOWCASE, STATUS, and SLUGs***.
- [X] 41 (#45). Confirm that *submitted projects appear* in the **Admin Dashboard's PROJECT QUEUE** with a ***PENDING status.***
- [X] 42 (#46). Confirm that a **PROJECT STARTED BUT NOT YET SUBMITTED** appears as ***"NOT SUBMITTED"*** on the Student Dashboard, separate from PENDING.
- [X] 43 (#47). Confirm that ***"NOT SUBMITTED" PROJECTS*** do **NOT APPEAR IN THE ADMIN PROJECT QUEUE**.
- [X] 44 (#48). Confirm that **STUDENTS CAN EDIT** their own submitted project details, and that **EDITS CREATE A NEW VERSION SUBMITTED FOR ADMIN REVIEW.**
- [X] 45 (#49). Confirm that the **CURRENT APPROVED VERSION REMAINS PUBLIC** while a ***new version is under review.***
- [X] 46 (#50). Confirm that **REJECTED VERSIONS appear as REJECTED** on the Student Dashboard, including ***WHEN the rejection was made, WHICH ADMIN made it, and the FEEDBACK REASON.***
- [X] 47 (#51). Confirm that **STUDENTS CAN REVISE A REJECTED VERSION** and ***RESUBMIT for review.***
- [X] 48 (#52). Confirm that **STUDENTS CAN WITHDRAW THEIR SUBMITTED EDITS**, ***reverting the project to the LAST APPROVED VERSION and allowing further changes.***

---

# PHASE 1 COMPLETED TEST SCENARIOS

## 1. General/Public Access — User Acceptance (UAT) Testing Scenarios

**Homepage**

- [X] 01 (#53). Confirm that the **HOMEPAGE SHALL LOAD WITHOUT** requiring a ***LOGIN***.
- [X] 02 (#54). Confirm that only **PUBLISHED PROJECTS** shall appear on the homepage, with Unpublished projects never publicly visible, regardless of their Pending/Approved/Rejected review status.
- [X] 03 (#55). Confirm that the **FEATURED GALLERIES/CAROUSELS** shall **consolidate Showcases** and randomly spotlight two projects on ever page refresh.
- [X] 04 (#56). Confirm that **CLICKING OR TAPPING A PROJECT CARD** shall navigate/send the user to that ***project's dedicated page***.
- [X] 05 (#57). Confirm that **CLICKING OR TAPPING "VIEW MORE"** shall navigate/send the user to the ***Search/Projects page***, displaying the full list of projects.

**Individual Project Page**

- [X] 06 (#58). Confirm that **CORE PROJECT DETAILS SHALL DISPLAY**, including *icon, name, subtitle, developer(s), category, showcase (Program/Year/Semester), and supported devices (available on)*.
- [X] 07 (#59). Confirm that each project's dedicated page URL shall **USE ITS ADMIN-DEFINED AND UNIQUE SLUG**.
- [X] 08 (#60). Confirm that the **SCREENSHOTS GALLERY SHALL SHOW A MINIMUM OF 4 IMAGEs** in a ***carousel/slideshow format*** per supported device with the default view combining all supported devices in a single carousel, which shall be controlled by the user.
- [X] 09 (#61). Confirm that a **VIDEO WALKTHROUGH**, if available, shall display as part of the screenshots gallery, ***remain in a muted state by default and shall only play when manually started by the user, removing the previous auto-play feature***.
- [X] 10 (#62). Confirm that the page shall still display the card grid layout cleanly, with no gap or broken content, if no video walkthrough is available.
- [X] 11 (#63). Confirm that **SUPPORTED DEVICES (iPhone/iPod, iPad, macOS, Vision Pro, Apple Watch, Apple TV) SHALL BE CLEARLY LABELLED** on the project page using device icons.
- [X] 12 (#64). Confirm that **APP STORE AND/OR TESTFLIGHT LINKS** shall appear/display as easier installation alternatives if available for the project.
- [X] 13 (#65). Confirm that **NON-DOWNLOADABLE PROJECTS** shall show a ***"Link to Project Showcase"*** in place of a download option if available.
- [X] 14 (#66). Confirm that a **GITHUB LINK** shall only display for ***open-sourced projects***.
- [X] 15 (#67). Confirm that **OTHER REMAINING LINKS** such as App Store, TestFlight, and/or Link to Project Showcase shall **CONTINUE TO FUNCTION CORRECTLY**, ***should the associated GitHub repository later become unavailable, removed or made private***.
- [X] 16 (#68). Confirm that a **CONTACT US OPTION** shall always be visible alongside downloads, opening the user's preferred emailing method and drafting a new mail to the shared HAPI email, which shall use the `mailto:` html attribute.
- [X] 17 (#69). Confirm that **CONTACT US SHALL REPLACE THE DOWNLOADS** section entirely ***when no available download option exists***, rather than appearing greyed out.

**Search/Projects Page**

- [X] 18 (#70). Confirm that the **SEARCH/PROJECTS PAGE** shall ***reuse the homepage's card grid layout***, displaying each project's category in place of its subtitle (short description).
- [X] 19 (#71). Confirm that the **SEARCH BAR** shall ***match entered terms against project names***.
- [X] 20 (#72). Confirm that the **SEARCH BAR** shall ***match entered terms against project descriptions***.
- [X] 21 (#73). Confirm that **SHOWCASE FILTERING SHALL REMAIN SINGLE-SELECT ONLY**, so that ***selecting a new showcase replaces the previous selection*** rather than stacking or combing them on top of one another.
- [X] 22 (#74). Confirm that **CATEGORY FILTERING SHALL REMAIN MULTI-SELECT**, so that ***adding a new category complements the previously selected selection***, further narrowing results.
- [X] 23 (#75). Confirm that **PAGINATION SHALL LIMIT RESULTS TO 15 PROJECTS PER PAGE** and 14 when the filtering menu is open, with ***"Numbered Page Buttons" appearing once that limit is reached***.
- [X] 24 (#76). Confirm that **ANY SELECTED FILTER SHALL BE VISUALLY DISTINCT** from unselected ones, so that the ***user can see clearly identify what filter's currently applied***.
- [X] 25 (#77). Confirm that **CLEARING THE SEARCH TERM** shall ***leave any active filters or sort selections unaffected***.
- [X] 26 (#78). Confirm that a **NO-RESULTS MESSAGE** shall display ***when no projects match a search or filter combination***.

**Responsive Edge Cases (Public)**

- [X] 27 (#79). Confirm that the **CARD GRID SHALL DISPLAY AND FLOW CORRECTLY** ***across varying screen sizes, including iPhone, iPad, and wide-screen desktop monitors***.
- [X] 28 (#80). Confirm that the **ON MOBILE VIEW THE SCREENSHOTS CAROUSEL** shall remain ***swipeable on touch devices***.

---

## 2. Admin Access — User Acceptance (UAT) Testing Scenarios

**Login & Access**

- [X] 29 (#81). Confirm that the **ADMIN DASHBOARD SHALL ONLY BE ACCESSIBLE** after a ***successful admin login***.

**Admin Dashboard Navigation**
- [X] 30 (#82). Confirm that **SELECTING A DIFFERENT TOP-MENU SECTION SHALL CHANGE THE CONTENT AREA**, while ***remaining within the Admin Dashboard***.

**PROJECTS SECTION #1: & Managing Projects**
- [X] 31 (#83). Confirm that the **DASHBOARD's PROJECT SECTION** shall ***list projects one per row***, each showing ***icon, name, subtitle (short description) and EDIT BUTTON*** and paginate with a maximum of 15 projects per page until Numbered Page Buttons appear.
- [X] 32 (#84). Confirm that the **"ADD PROJECT" BUTTON**, positioned in the top-right section, shall ***navigate the admin to a dedicated Add Project page***.
- [X] 33 (#85). Confirm that **SELECTING EDIT** on an existing project shall ***navigate the admin to a dedicated Edit Project page, pre-filled with the project's existing details for editing***.
- [X] 34 (#86). Confirm that **SELECTING DELETE** shall ***open a confirmation pop-up***, and clicking the ***confirmation shall permanently remove the project's record***, which shall be distinct from the Unpublished and/or Rejected project statuses, which retains the project's record but does not display it instead.
- [X] 35 (#87). Confirm that the **ADD/EDIT PROJECT PAGE SHALL SUPPORT** ***assigning a name, subtitle (short description), showcase category (Program/Year/Semester), standard category, visibility status (Published/Unpublished), developer(s), and relevant links (AppStore, TestFlight, GitHub and Website)***.
- [X] 36 (#88). Confirm that the **ADD/EDIT PROJECT PAGE SHALL ADDITIONALLY SUPPORT** ***uploading screenshot images per supported device, a video walkthrough file, an icon image, including a slug field with validation preventing already-taken slugs, and a markdown editor for the project's long description***.
- [X] 37 (#89). Confirm that the **ADD/EDIT PROJECT PAGE SHALL SUPPORT** ***tracking changes made to the project live, saving changes made to the project's record***.
- [X] 38 (#90). Confirm that an **UNPUBLISHED PROJECT** shall ***remain hidden from the public site, regardless of its Pending/Approved/Rejected editorial review status***.

**PROJECTS SECTION #2: & Sorting, Pagination & Filters**
- [X] 39 (#91). Confirm that **PAGINATION BEHAVIOUR** on the Admin Dashboard, with a 15-per-page limit by default and 14-per-page limit when filtering is open, while including numbered pagination buttons, ***shall match the General/Public Search page exactly***.
- [X] 40 (#92). Confirm that all **INDIVIDUAL GROUP FILTERS (VISIBILITY STATUS, SHOWCASE CATEGORY) SHALL REMAIN SINGLE-SELECT ONLY**, so that ***selecting a new option within a specific group filter replaces the previous selection*** rather than stacking or combing them on top of one another.
- [X] 41 (#93). Confirm that the **STANDARD CATEGORY FILTERING SHALL REMAIN MULTI-SELECT ONLY**, so that ***selecting a new category complements the previously selected selection***, further narrowing results.
- [X] 42 (#94). Confirm that **VISIBILITY STATUS, SHOWCASE CATEGORY AND STANDARD CATEGORY FILTERS SHALL COMBINE**, so that the ***admin shall be able to narrow results further by all three options simultaneously***.
- [X] 43 (#95). Confirm that ***changing the selection in one filter group option shall leave the other filter group's selections unaffected***.

**FEATURED PROJECTS SECTION: & Assigning/Sorting Featured Projects**
- [X] 44 (#96). Confirm that the **FEATURED PROJECTS SECTION SHALL SUPPORT** assigning and sorting Featured Projects ***via a HEART BUTTON for Selecting and DRAG-AND-DROP BEHAVIOUR for RANKING** of projects ***on the homepage***.

**PROJECT QUEUE SECTION: Managing Projects Versions via Admin Editorial Review**
- [X] 45 (#97). Confirm that **SETTING A PROJECT TO REJECTED** shall ***require a reason/feedback to be provided*** by the admin for it's rejection before the status can be changed.

**SHOWCASE SECTION: & Defining Showcases Categories**
- [X] 46 (#98). Confirm that admins shall be able to **DEFINE AND ADD A NEW SHOWCASE CATEGORY** (Program/Year/Semester) ***from this section***.
- [X] 47 (#99). Confirm that admins shall be able to **EDIT AN EXISTING SHOWCASE CATEGORY** ***from this section***.

**ADMINS SECTION: & Managing Admin Users**
- [X] 48 (#100). Confirm that **ADMINS SHALL BE ABLE TO CREATE ADDITIONAL ADMIN and STUDENT ACCOUNTS**, each with ***their own individual login credentials***.

**Responsive Edge Cases (Admin)**
- [X] 49 (#101). Confirm that the **DASHBOARD'S ONE PROJECT PER ROW LAYOUT SHALL REMAIN READABLE** ***across varying screen sizes, including iPhone, iPad, and wide-screen desktop monitors***.
- [X] 50 (#102). Confirm that the **DEDICATED ADD/EDIT PROJECT PAGES AND THE DELETE CONFIRMATION POP-UP REMAIN FULLY USABLE**, ***across both small and wide touch screen devices***.

---

## 3. DRAFT WCAG Accessibility (General/Public & Admin) — User Acceptance (UAT) Testing Scenarios

- [X] 51 (#103). Confirm that **ALL IMAGES, INCLUDING PROJECT ICONS, SCREENSHOTS, AND CATEGORY LABELS, SHALL INCLUDE** ***descriptive alt text***.
- [X] 52 (#104). Confirm that **ALL INTERACTIVE ELEMENTS, SUCH AS BUTTONS, LINKS, FILTERS, AND POP-UP CONFIRMATIONS, SHALL BE REACHABLE** using ***keyboard navigation alone***.
- [X] 53 (#105). Confirm that **TEXT AND BACKGROUND COLOUR COMBINATIONS SHALL CREATE A CLEAR CONTRAST** for readability, ***per Max Thum's UX colour choices in Figma***.
- [X] 54 (#106). Confirm that **PAGE TEXT SHALL BE RESIZED/SCALED** ***without breaking the page layout or losing readability***.
- [X] 55 (#107). Confirm that **THE SCREENSHOTS CAROUSEL SHALL INCLUDE ACCESSIBLE CONTROLS**, like labelled next/previous buttons which shall be ***operable via keyboard, and not just swipe or click***.
- [X] 56 (#108). Confirm that **THE VISIBILITY STATUS INDICATORS FOR PUBLISHED/UNPUBLISHED AND EDITORIAL REVIEW STATUS INDICATORS FOR PENDING/APPROVED/REJECTED SHALL BE DISTINGUISHABLE BY MORE THAN COLOUR ALONE**, like ***an icon or clear text label for users with colour vision deficiency***.
- [X] 57 (#109). Confirm that **THE "RESULTS MATCHED" COUNTER AND NO-RESULTS MESSAGE SHALL BE ANNOUNCEABLE TO SCREEN READER USERS** ***when search or filter results are updated***.
- [X] 58 (#110). Confirm that **ALL FIELDS IN THE DEDICATED ADD/EDIT PROJECT PAGE SHALL HAVE PROPERLY ASSOCIATED LABELS**, so ***screen readers announce each field correctly***.
- [X] 59 (#111). Confirm that **THE CONTACT US `mailto:` LINK SHALL HAVE A CLEAR, DESCRIPTIVE ACCESSIBLE NAME**, so that ***screen reader users understand its purpose***.
- [X] 60 (#112). Confirm that **HEADING LEVELS SUCH AS H1, H2, H3 AND SO ON SHALL FOLLOW A SEQUENTIAL STRUCTURE** on each page, which shall aid ***screen readers in both navigating and visually understanding the hierarchy***.
- [X] 61 (#113). Confirm that **A VISIBLE FOCUS INDICATOR SHALL APPEAR ON ALL INTERACTIVE ELEMENTS**, such as buttons, links, filters, and pop-up confirmations when navigating via keyboard, which shall be ***distinct from the background colour for readability***.
- [X] 62 (#114). Confirm that **THE SHOWCASE/CATEGORY/STATUS FILTERING SELECTIONS SHALL BE CONVEYABLE TO SCREEN READER USERS** when in an active state, and ***not just shown with a visually distinct style***.

---

### User Experience (UX) Testing Results & Feedback:
- In addition to functional User Acceptance Testing (UAT), a subjective and experience-based testing was also conducted during Sprint 3 Week 1 (Week 7 of Project Lifecycle) via a focus group of six invited participants, work colleagues of the client Michael, whose emails were shared with the HAPI Showcase Project team for consideration as the UX Focus Group participants. Ultimately, feedback was received from two reviewers, which shall complement the UAT Testing Scenario checklist covered separately for functional requirements and acting as a guide for the UX Designer Max Thum, and serves as a baseline for the HAPI team to reference when considering future improvements after handover. Overall, the UX Focus Group Survey feedback results were mixed but constructive, with the two testers largely viewing the site through an "App Store" like lens, which was intentional, though some felt it lacked visual engagement or uniqueness in its presentation. Responses ranged from neutral like "clean, boring, standard" to more critical "unimaginative, confusing, limited". The main actionable critiques considered included the following:
  1. **"View More" Button Contrast:** The "View More" button in the Featured Projects section of the welcome homepage lacked colour contrast and was easily overlooked, appearing as plain text against the "Featured Projects" subtitle rather than appear as a clear button. As of Sprint 3 Week 3 this has suggested change has been implemented, updating the button to appear clearly with improved colour contrast.
  2. **Categories Page Clarity:** The Categories page lacked clear subheadings to indicate what each category represents, due to the category page link in the header menu redirecting users back to the welcome homepage, as the page was still in development. As of Sprint 3 Week 3 the page has been updated with visuals from the UX and implementation by Devs to clarify the categories and their associated projects.
  3. **Project Context Confusion:** Testers were unsure whether they were browsing student projects or professional AppStore apps, with one commenting that the landing page "looks like a search result from the Apple Store" and does not "sell the uniqueness" of each app. This was understood to be an expected outcome of the survey test as the site was populated with real, well-known AppStore apps as a placeholder, pending final approval by the HAPI team upon project closure to showcase live student projects post handover.
  4. **Static Appearance:** Feedback describing the site as "simple" or "boring" was understood as a reflection of the site's  static appearance without transitions. Transition effects were considered for the hero art of the Project Spotlight sections, but were ultimately descoped due to time constraints, with higher-priority client requirements and key refinements taking precedence.

---

## Handoff to UX/Dev Notes:
- **N/A:** No handoff notes for UX/Devs in Sprint 3 Week 3 final deliverable. 

---

## Deliverable:
- This Testing Scenarios document shall be delivered as a markdown file `.md`, named `testing-scenarios-ua.md` and committed to the project's `docs/` directory alongside the Requirements Specification document.
- The document shall be shared as a deliverable with the PM (Nirmal Rajesh) and the rest of the team ahead of the final client meeting for review and discussion.