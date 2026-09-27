# HAPI Showcase — Test Scenarios — for User Acceptance (UA) 
- **Role:** BA — Imraan Mohammed
- **Date:** Sprint 2, Week 1 (Week 5) — Thu, 24th Aug 2026 (Version 3.0)
- **Status:** Draft (Version 3.0)
- **Details:** This document includes test scenarios which are derived from the `requirements-specification.md` document, covering both General/Public Access and Admin Access from an end-user perspective, alongside any edge cases identified during feedback sessions from the client and our PM (Nirmal Rajesh). Revision (v3.0) aligns UAT Testing scenarios with the updated Requirements Specification from v6.0 while additionally including draft test scenarios for WCAG accessibility, which shall be expanded over time as full accessibility implementation progresses in Sprint 2 & 3.
- **Related Document:** The signed Client Project Proposal organised by our PM (Nirmal Rajesh) and the Sprint 1 Week 1's Requirements Specification Document prepared myself, the BA (Imraan Mohammed), which covers functional and non-functional requirements, edge cases and design guides, all are related documents and are referenced in this document as a source of truth.
    - [Signed Client Project Proposal (PDF)](https://rmiteduau.sharepoint.com/:b:/r/sites/CapstoneProgrammingProject2026-68-HAPIApplePlatformShowcaseTeamA/Shared%20Documents/SIGNED%20HAPI%20Showcase%20Client%20Project%20Proposal%5B64%5D.pdf?d=w5547aa661f4f466982b7ea8309db2338&csf=1&web=1&e=HEDrkA)
    - [`requirements-specification.md` (MD file - Version 6.0)](https://github.com/odisfm/hapi/blob/main/docs/requirements-specification.md)
- **Scope Note:** This document shall simply define testable scenarios covering the functional requirements and edge cases covered in the Requirements Specification Document, from a General/Public and Admin Access perspective. A draft set of WCAG Accessibility Testing Scenarios shall now also be included as part of this revision, covering basic guidelines named in the Specification Requirements Document. Backend and Infrastructure concerns, including hosting, storage, database and security/encryption matters, shall be acknowledged as important but sit outside a user acceptance scope, and excluded from this document for now. This document shall be a working checklist against the Requirements Specification Document, and shall be further refined iteratively over the next two sprints after feedback and review from the team and client.

---

## 1. General/Public Access — User Acceptance (UAT) Testing Scenarios

**Homepage**

- [X] 1. Confirm that the **HOMEPAGE SHALL LOAD WITHOUT** requiring a ***LOGIN***.
- [X] 2. Confirm that only **PUBLISHED PROJECTS** shall appear on the homepage, with Unpublished projects never publicly visible, regardless of their Pending/Approved/Rejected review status.
- [ ] 3. Confirm that the **FEATURED GALLERIES/CAROUSELS** shall appear for **each Showcase Category** (AFP, Capstone, Apple Minor).
- [ ] 4. Confirm that each **FEATURED GALLERY/CAROUSEL**, shall contain ***four featured projects per category***.
- [ ] 5. Confirm that each **PROJECT CARD SHALL DISPLAY** an ***icon, name, subtitle (short description) and label (showcase category)***, within their respective **featured gallery/carousel**.
- [X] 6. Confirm that **CLICKING OR TAPPING A PROJECT CARD** shall navigate/send the user to that ***project's dedicated page***.
- [X] 7. Confirm that **CLICKING OR TAPPING "VIEW MORE"** shall navigate/send the user to the ***Search/Projects page***, displaying the full list of projects.
- [X] 8. Confirm that the **SEARCH BAR** shall also be available directly on the homepage, allowing users to search without having to first navigate to the Projects/Search page.

**Individual Project Page**

- [X] 9. Confirm that **CORE PROJECT DETAILS SHALL DISPLAY**, including *icon, name, subtitle, developer(s), category, showcase (Program/Year/Semester), and supported devices (available on)*.
- [ ] 10. Confirm that the project page shall **DISPLAY ITS SHOWCASE CATEGORY (PROGRAM/YEAR/SEMESTER) DISTINCTLY FROM** its ***Standard Category*** alongside **DATE CREATED (PUBLISHED DATE)**.
- [X] 11. Confirm that each project's dedicated page URL shall **USE ITS ADMIN-DEFINED AND UNIQUE SLUG**.
- [X] 12. Confirm that the **SCREENSHOTS GALLERY SHALL SHOW A MINIMUM OF 4 IMAGEs** in a ***carousel/slideshow format*** per supported device, which shall be controlled by the user.
- [ ] 13. Confirm that a **VIDEO WALKTHROUGH**, if available, shall display above the screenshots gallery, ***remain in a muted state by default and shall only play when manually started by the user, removing the previous auto-play feature***.
- [X] 14. Confirm that the page shall still display the card grid layout cleanly, with no gap or broken content, if no video walkthrough is available.
- [X] 15. Confirm that **SUPPORTED DEVICES (iPhone/iPod, iPad, macOS, Vision Pro, Apple Watch, Apple TV) SHALL BE CLEARLY LABELLED** on the project page.
- [X] 16. Confirm that **APP STORE AND/OR TESTFLIGHT LINKS** shall appear/display as easier installation alternatives if available for the project.
- [X] 17. Confirm that **NON-DOWNLOADABLE PROJECTS** shall show a ***"Link to Project Showcase"*** in place of a download option if available.
- [X] 18. Confirm that a **GITHUB LINK** shall only display for ***open-sourced projects***.
- [X] 19. Confirm that **OTHER REMAINING LINKS** such as App Store, TestFlight, and/or Link to Project Showcase shall **CONTINUE TO FUNCTION CORRECTLY**, ***should the associated GitHub repository later become unavailable, removed or made private***.
- [X] 20. Confirm that a **CONTACT US OPTION** shall always be visible alongside downloads, opening the user's preferred emailing method and drafting a new mail to the shared HAPI email, which shall use the `mailto:` html attribute.
- [X] 21. Confirm that **CONTACT US SHALL REPLACE THE DOWNLOADS** section entirely ***when no available download option exists***, rather than appearing greyed out.

**Search/Projects Page**

- [X] 22. Confirm that the **SEARCH/PROJECTS PAGE** shall ***reuse the homepage's card grid layout***, displaying each project's category in place of its subtitle (short description).
- [X] 23. Confirm that the **SEARCH BAR** shall ***match entered terms against project names***.
- [X] 24. Confirm that the **SEARCH BAR** shall ***match entered terms against project descriptions***.
- [ ] 25. Confirm that **SHOWCASE FILTERING** (Program/Year/Semester) shall be available with sub-categories, and shall be separate from the independent Category filtering.
- [X] 26. Confirm that **CATEGORY FILTERING SHALL REMAIN SINGLE-SELECT ONLY**, so that ***selecting a new category replaces the previous selection*** rather than stacking or combing them on top of one another.
- [ ] 27. Confirm that **SORT SHALL FUNCTION** correctly by both ***alphabetical order and date created***.
- [X] 28. Confirm that **PAGINATION SHALL LIMIT RESULTS TO 15 PROJECTS PER PAGE**, with ***"Numbered Page Buttons" appearing once that limit is reached***.
- [X] 29. Confirm that **ANY SELECTED FILTER SHALL BE VISUALLY DISTINCT** from unselected ones, so that the ***user can see clearly identify what filter's currently applied***.
- [X] 30. Confirm that **CLEARING THE SEARCH TERM** shall ***leave any active filters or sort selections unaffected***.
- [X] 31. Confirm that a **NO-RESULTS MESSAGE** shall display ***when no projects match a search or filter combination***.

**Responsive Edge Cases (Public)**

- [X] 32. Confirm that the **CARD GRID SHALL DISPLAY AND FLOW CORRECTLY** ***across varying screen sizes, including iPhone, iPad, and wide-screen desktop monitors***.
- [X] 33. Confirm that the **SCREENSHOTS CAROUSEL** shall remain ***swipeable on touch devices***.

---

## 2. Admin Access — User Acceptance (UAT) Testing Scenarios

**Login & Access**

- [X] 34. Confirm that the **ADMIN DASHBOARD SHALL ONLY BE ACCESSIBLE** after a ***successful admin login***.
- [X] 35. Confirm that the **`/admin-login` PATH** shall not be accessible anywhere in the public site's navigation unless the user manually enters it into the browser's URL Address Bar.

**Admin Dashboard Navigation**
- [X] 36. Confirm that the **ADMIN DASHBOARD'S HORIZONTAL TOP MENU BAR SHALL PROVIDE ACCESS TO** ***Individual Projects, Assigning/Sorting Featured Projects, Defining Showcases, Defining Standard Categories, Managing Admin Users, and Analytics Data Viewing sections***.
- [X] 37. Confirm that **SELECTING A DIFFERENT TOP-MENU SECTION SHALL CHANGE THE CONTENT AREA**, while ***remaining within the Admin Dashboard***.

**PROJECTS SECTION #1: & Managing Projects**
- [X] 38. Confirm that the **DASHBOARD's PROJECT SECTION** shall ***list projects one per row***, each showing ***icon, name, subtitle (short description) and EDIT BUTTON***.
- [X] 39. Confirm that the **"ADD PROJECT" BUTTON**, positioned in the top-right section, shall ***navigate the admin to a dedicated Add Project page***.
- [X] 40. Confirm that **SELECTING EDIT** on an existing project shall ***navigate the admin to a dedicated Edit Project page, pre-filled with the project's existing details for editing***.
- [X] 41. Confirm that **SELECTING DELETE** shall ***open a confirmation pop-up***, and clicking the ***confirmation shall permanently remove the project's record***, which shall be distinct from the Unpublished and/or Rejected project statuses, which retains the project's record but does not display it instead.
- [X] 42. Confirm that the **ADD/EDIT PROJECT PAGE SHALL SUPPORT** ***assigning a name, subtitle (short description), showcase category (Program/Year/Semester), standard category, visibility status (Published/Unpublished), developer(s), and relevant links (AppStore, TestFlight, GitHub and Website)***.
- [ ] 43. Confirm that the **ADD/EDIT PROJECT PAGE SHALL SUPPORT** ***assigning a date created (publish date) auto-filled to the current date***.
- [X] 44. Confirm that the **ADD/EDIT PROJECT PAGE SHALL ADDITIONALLY SUPPORT** ***uploading screenshot images per supported device, a video walkthrough file, an icon image, including a slug field with validation preventing already-taken slugs, and a markdown editor for the project's long description***.
- [X] 45. Confirm that the **ADD/EDIT PROJECT PAGE SHALL SUPPORT** ***tracking changes made to the project live, saving changes made to the project's record***.
- [X] 46. Confirm that an **UNPUBLISHED PROJECT** shall ***remain hidden from the public site, regardless of its Pending/Approved/Rejected editorial review status***.
- [X] 47. Confirm that a **PUBLISHED PROJECT** shall ***become visible on the public site, regardless of its Pending/Approved/Rejected editorial review status***.

- ---

**PROJECTS SECTION #1.1: Managing Projects via Editorial Review (Stretch Goal)**
- [ ] 48. Confirm that an **APPROVED PROJECT** shall only ***become visible on the public site once it is also set to Published***, as approval alone shall not make it visible.
- [ ] 49. Confirm that a **PROJECT SET TO PENDING** status shall ***remain hidden from the public site so long as it is also set to Unpublished***.
- [ ] 50. Confirm that a **PROJECT SET TO REJECTED** status shall be ***hidden from the public site so long as it is also set to Unpublished***, while its record remains intact in the dashboard***.
- [ ] 51. Confirm that **SETTING A PROJECT TO REJECTED** shall ***require a reason/feedback to be provided*** by the admin for it's rejection before the status can be changed.

**PROJECTS SECTION #2: & Sorting, Pagination & Filters**
- [ ] 52. Confirm that the **SORTING BEHAVIOUR** on the Admin Dashboard ***shall match the General/Public Search page exactly***.
- [X] 53. Confirm that **PAGINATION BEHAVIOUR** on the Admin Dashboard, with a 10-per-page limit and numbered pagination buttons, ***shall match the General/Public Search page exactly***.
- [X] 54. Confirm that all **INDIVIDUAL GROUP FILTERS (VISIBILITY STATUS, SHOWCASE CATEGORY, STANDARD CATEGORY) SHALL REMAIN SINGLE-SELECT ONLY**, so that ***selecting a new option within a specific group filter replaces the previous selection*** rather than stacking or combing them on top of one another.
- [X] 55. Confirm that **VISIBILITY STATUS, SHOWCASE CATEGORY AND STANDARD CATEGORY FILTERS SHALL COMBINE**, so that the ***admin shall be able to narrow results further by all three options simultaneously***.
- [X] 56. Confirm that ***changing the selection in one filter group option shall leave the other filter group's selections unaffected***.

**FEATURED PROJECTS SECTION: & Assigning/Sorting Featured Projects**
- [ ] 57. Confirm that the **FEATURED PROJECTS SECTION SHALL SUPPORT** assigning and sorting Featured Projects ***via a HEART BUTTON for Selecting and DRAG-AND-DROP BEHAVIOUR for RANKING** of projects ***on the homepage***.

**SHOWCASE SECTION: & Defining Showcases Categories**
- [ ] 58. Confirm that admins shall be able to **DEFINE AND ADD A NEW SHOWCASE CATEGORY** (Program/Year/Semester) ***from this section***.
- [ ] 59. Confirm that admins shall be able to **EDIT AN EXISTING SHOWCASE CATEGORY** ***from this section***.

**STANDARD CATEGORY SECTION: & Defining Standard Categories**
- [ ] 60. Confirm that admins shall be able to **DEFINE AND ADD A NEW STANDARD CATEGORY** ***from this section***.
- [ ] 61. Confirm that admins shall be able to **EDIT AN EXISTING STANDARD CATEGORY** ***from this section***.

**ADMINS SECTION: & Managing Admin Users**
- [ ] 62. Confirm that **ADMINS SHALL BE ABLE TO CREATE ADDITIONAL ADMIN ACCOUNTS**, each with ***their own individual login credentials***.

**ANALYTICS SECTION: & Viewing Analytics**
- [ ] 63. Confirm that a **MINI ANALYTICS DASHBOARD** Card Layout Shall ***BE VIEWABLE WITH RELEVANT DATA*** below the Admin Dashboard.

**Responsive Edge Cases (Admin)**
- [X] 64. Confirm that the **DASHBOARD'S ONE PROJECT PER ROW LAYOUT SHALL REMAIN READABLE** ***across varying screen sizes, including iPhone, iPad, and wide-screen desktop monitors***.
- [X] 65. Confirm that the **DEDICATED ADD/EDIT PROJECT PAGES AND THE DELETE CONFIRMATION POP-UP REMAIN FULLY USABLE**, ***across both small and wide touch screen devices***.

---

## 3. DRAFT WCAG Accessibility (General/Public & Admin) — User Acceptance (UAT) Testing Scenarios

- [ ] 66. Confirm that **ALL IMAGES, INCLUDING PROJECT ICONS, SCREENSHOTS, AND CATEGORY LABELS, SHALL INCLUDE** ***descriptive alt text***.
- [X] 67. Confirm that **ALL INTERACTIVE ELEMENTS, SUCH AS BUTTONS, LINKS, FILTERS, AND POP-UP CONFIRMATIONS, SHALL BE REACHABLE** using ***keyboard navigation alone***.
- [X] 68. Confirm that **TEXT AND BACKGROUND COLOUR COMBINATIONS SHALL CREATE A CLEAR CONTRAST** for readability, ***per Max Thum's UX colour choices in Figma***.
- [X] 69. Confirm that **PAGE TEXT SHALL BE RESIZED/SCALED** ***without breaking the page layout or losing readability***.
- [ ] 70. Confirm that **THE SCREENSHOTS CAROUSEL SHALL INCLUDE ACCESSIBLE CONTROLS**, like labelled next/previous buttons which shall be ***operable via keyboard, and not just swipe or click***.
- [ ] 71. Confirm that **THE VIDEO WALKTHROUGH, IF AVAILABLE, SHALL INCLUDE CAPTIONS OR A TEXT TRANSCRIPT** for ***users who are deaf or hard of hearing***.
- [X] 72. Confirm that **THE VISIBILITY STATUS INDICATORS FOR PUBLISHED/UNPUBLISHED AND EDITORIAL REVIEW STATUS INDICATORS FOR PENDING/APPROVED/REJECTED SHALL BE DISTINGUISHABLE BY MORE THAN COLOUR ALONE**, like ***an icon or clear text label for users with colour vision deficiency***.
- [X] 73. Confirm that **THE "RESULTS MATCHED" COUNTER AND NO-RESULTS MESSAGE SHALL BE ANNOUNCEABLE TO SCREEN READER USERS** ***when search or filter results are updated***.
- [X] 74. Confirm that **ALL FIELDS IN THE DEDICATED ADD/EDIT PROJECT PAGE SHALL HAVE PROPERLY ASSOCIATED LABELS**, so ***screen readers announce each field correctly***.
- [X] 75. Confirm that **THE CONTACT US `mailto:` LINK SHALL HAVE A CLEAR, DESCRIPTIVE ACCESSIBLE NAME**, so that ***screen reader users understand its purpose***.
- [ ] 76. Confirm that **THE ADMIN DASHBOARD DRAG-AND-DROP FEATURED-PROJECT FEATURE SHALL INCLUDE A KEYBOARD-OPERABLE ALTERNATIVE**, such as ***a readable heart button for selecting a project as featured, then an up/down arrow button for ranking the project***.
- [X] 77. Confirm that **HEADING LEVELS SUCH AS H1, H2, H3 AND SO ON SHALL FOLLOW A SEQUENTIAL STRUCTURE** on each page, which shall aid ***screen readers in both navigating and visually understanding the hierarchy***.
- [X] 78. Confirm that **A VISIBLE FOCUS INDICATOR SHALL APPEAR ON ALL INTERACTIVE ELEMENTS**, such as buttons, links, filters, and pop-up confirmations when navigating via keyboard, which shall be ***distinct from the background colour for readability***.
- [X] 79. Confirm that **THE SHOWCASE/CATEGORY/STATUS FILTERING SELECTIONS SHALL BE CONVEYABLE TO SCREEN READER USERS** when in an active state, and ***not just shown with a visually distinct style***.
  
---

### Handoff Notes for UX Designer (Max Thum) + Dev Team (Nick Moore & Max Ivanovic):
- The WCAG Accessibility Requirements Consideration are Currently A Draft. It shall be planned for further refinement with feedback from the UX and Dev Considering the Frontend & Backend Implementations of Such Measures. 

---

## Deliverable:
- This Testing Scenarios document shall be delivered as a markdown file `.md`, named `testing-scenarios-ua.md` and committed to the project's `docs/` directory alongside the Requirements Specification document.
- The document shall be shared as a deliverable with the PM (Nirmal Rajesh) and the rest of the team ahead of the client meeting for review, then refined as needed before the Sprint 2 build/development stage.  