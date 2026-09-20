# HAPI Showcase — Test Scenarios — for User Acceptance (UA) 
- **Role:** BA — Imraan Mohammed
- **Date:** Sprint 2, Week 1 (Week 4) — Sat, 19th Aug 2026 (Version 2.0)
- **Status:** Draft (Version 2.0)
- **Details:** This document includes test scenarios which are derived from the `requirements-specification.md` document, covering both General/Public Access and Admin Access from an end-user perspective, alongside any edge cases identified during feedback sessions from the client and our PM (Nirmal Rajesh). Revision (v2.0) aligns UAT Testing scenarios with the updated Requirements Specification from v5.0 (removing the need of IPA and updating video walkthrough behaviour), while additionally including draft test scenarios for WCAG accessibility, which shall be expanded over time as full accessibility implementation progresses in Sprint 2 & 3.
- **Related Document:** The signed Client Project Proposal organised by our PM (Nirmal Rajesh) and the Sprint 1 Week 1's Requirements Specification Document prepared myself, the BA (Imraan Mohammed), which covers functional and non-functional requirements, edge cases and design guides, all are related documents and are referenced in this document as a source of truth.
    - [Signed Client Project Proposal (PDF)](https://rmiteduau.sharepoint.com/:b:/r/sites/CapstoneProgrammingProject2026-68-HAPIApplePlatformShowcaseTeamA/Shared%20Documents/SIGNED%20HAPI%20Showcase%20Client%20Project%20Proposal%5B64%5D.pdf?d=w5547aa661f4f466982b7ea8309db2338&csf=1&web=1&e=HEDrkA)
    - [`requirements-specification.md` (MD file - Version 5.0)](https://github.com/odisfm/hapi/blob/main/docs/requirements-specification.md)
- **Scope Note:** This document shall simply define testable scenarios covering the functional requirements and edge cases covered in the Requirements Specification Document, from a General/Public and Admin Access perspective. A draft set of WCAG Accessibility Testing Scenarios shall now also be included as part of this revision, covering basic guidelines named in the Specification Requirements Document. Backend and Infrastructure concerns, including hosting, storage, database and security/encryption matters, shall be acknowledged as important but sit outside a user acceptance scope, and excluded from this document for now. This document shall be a working checklist against the Requirements Specification Document, and shall be further refined iteratively over the next two sprints after feedback and review from the team and client.

---

## 1. General/Public Access — User Acceptance (UAT) Testing Scenarios

**Homepage**

- [ ] 1. Confirm that the **HOMEPAGE SHALL LOAD WITHOUT** requiring a ***LOGIN***.
- [ ] 2. Confirm that only **APPROVED PROJECTS** shall appear on the homepage, with pending and rejected projects never publicly visible.
- [ ] 3. Confirm that each **PROJECT CARD SHALL DISPLAY** an ***icon, name, and subtitle (short description)***, and nothing more beyond this for now.
- [ ] 4. Confirm that **CLICKING OR TAPPING A PROJECT CARD** shall navigate/send the user to that ***project's dedicated page***.
- [ ] 5. Confirm that **CLICKING OR TAPPING "VIEW MORE"** shall navigate/send the user to the ***Search/Projects page***, displaying the full list of projects.


**Individual Project Page**

- [ ] 6. Confirm that **CORE PROJECT DETAILS SHALL DISPLAY**, including *icon, name, subtitle, developer(s), category, date created, and platform version*.
- [ ] 7. Confirm that **FILE SIZE SHALL ONLY SHOW ALONGSIDE THE DOWNLOAD LINK FOR DOWNLOADABLE PROJECTS**, and shall not appear at for non-downloadable projects.
- [ ] 8. Confirm that **TAGS IF IMPLEMENTED SHALL ONLY DISPLAY AS SMALL LABELS BELOW** when associated with a project, with no empty tag placeholders shown if absent.
- [ ] 9. Confirm that the **SCREENSHOTS GALLERY SHALL SHOW A MINIMUM OF 4 IMAGEs** in a ***carousel/slideshow format***, which shall be controlled by the user.
- [ ] 10. Confirm that a **VIDEO WALKTHROUGH**, if available, shall display above the screenshots gallery, ***remain in a muted state by default and shall only play when manually started by the user, removing the auto-play feature***.
- [ ] 11. Confirm that the page shall still display the card grid layout cleanly, with no gap or broken content, if no video walkthrough is available.
- [ ] 12. Confirm that **APP STORE AND/OR TESTFLIGHT LINKS** shall appear/display as easier installation alternatives if available for the project.
- [ ] 13. Confirm that **NON-DOWNLOADABLE PROJECTS** shall show a ***"Link to Project Showcase"*** in place of a download option if available.
- [ ] 14. Confirm that a **GITHUB LINK** shall only display for ***open-sourced projects***.
- [ ] 15. Confirm that **OTHER REMAINING LINKS** such as App Store, TestFlight, and/or Link to Project Showcase shall **CONTINUE TO FUNCTION CORRECTLY**, ***should the associated GitHub repository later become unavailable, removed or made private***.
- [ ] 16. Confirm that **MULTI-PLATFORM PROJECTS** shall list each platform version as its ***own separately labelled download***, rather than bundling them together.
- [ ] 17. Confirm that a **CONTACT US OPTION** shall always be visible alongside downloads, opening the user's preferred emailing method and drafting a new mail to the shared HAPI email, which shall use the `mailto:` html attribute.
- [ ] 18. Confirm that **CONTACT US SHALL REPLACE THE DOWNLOADS** section entirely ***when no available download option exists***, rather than appearing greyed out.

**Search/Projects Page**

- [ ] 19. Confirm that the **SEARCH/PROJECTS PAGE** shall ***reuse the homepage's card grid layout***, displaying each project's category in place of its subtitle (short description).
- [ ] 20. Confirm that the **SEARCH BAR** shall ***match entered terms against project names***.
- [ ] 21. Confirm that the **SEARCH BAR** shall ***match entered terms against project descriptions***.
- [ ] 22. Confirm that **CATEGORY FILTERING SHALL REMAIN SINGLE-SELECT ONLY**, so that ***selecting a new category replaces the previous selection*** rather than stacking or combing them on top of one another.
- [ ] 23. Confirm that **SORT SHALL FUNCTION** correctly by both ***alphabetical order and date created***.
- [ ] 24. Confirm that **PAGINATION SHALL LIMIT RESULTS TO 20 PROJECTS PER PAGE**, with a ***"Next Page" button appearing once that limit is reached***.
- [ ] 25. Confirm that **ANY SELECTED FILTER SHALL BE VISUALLY DISTINCT** from unselected ones, so that the ***user can see clearly identify what filter's currently applied***.
- [ ] 26. Confirm that **CLEARING THE SEARCH TERM** shall ***leave any active filters or sort selections unaffected***.
- [ ] 27. Confirm that a **NO-RESULTS MESSAGE** shall display ***when no projects match a search or filter combination***.

**Responsive Edge Cases (Public)**

- [ ] 28. Confirm that the **CARD GRID SHALL DISPLAY AND FLOW CORRECTLY** ***across varying screen sizes, including iPhone, iPad, and wide-screen desktop monitors***.
- [ ] 29. Confirm that the **SCREENSHOTS CAROUSEL** shall remain ***swipeable on touch devices***.

---

## 2. Admin Access — User Acceptance (UAT) Testing Scenarios

**Login & Access**

- [ ] 30. Confirm that the **ADMIN DASHBOARD SHALL ONLY BE ACCESSIBLE** after a ***successful admin login***.
- [ ] 31. Confirm that the **`/admin-login` PATH** shall not be accessible anywhere in the public site's navigation unless the user manually enters it into the browser's address bar.

**Managing Projects**

- [ ] 32. Confirm that the **"ADD PROJECT" BUTTON**, positioned in the top-right section, shall ***open a pop-up form rather than directing the admin to a new page***.
- [ ] 33. Confirm that the **DASHBOARD** shall ***list projects one per row***, each showing ***icon, name, subtitle (short description) and status***.
- [ ] 34. Confirm that a **PROJECT SET TO PENDING** status shall ***remain hidden from the public site***.
- [ ] 35. Confirm that a **PROJECT SET TO APPROVED** status shall become ***visible on the public site***.
- [ ] 36. Confirm that a **PROJECT SET TO REJECTED** status shall be ***hidden from the public site while its record remains intact in the dashboard***.
- [ ] 37. Confirm that **EACH PROJECT'S "ACTION"** button shall ***display both the Edit and Delete options***.
- [ ] 38. Confirm that **SELECTING EDIT** shall ***reopen the pop-up form, pre-filled with the project's existing details for editing***.
- [ ] 39. Confirm that **SELECTING DELETE** shall ***open a confirmation pop-up***, and clicking the ***confirmation shall permanently remove the project's record***, which shall be distinct from Rejected, which retains it instead.
- [ ] 40. Confirm that **SETTING A PROJECT TO REJECTED** shall ***require a reason/feedback to be provided*** by the admin for it's rejection before the status can be changed.

**Sorting, Pagination & Filters**

- [ ] 41. Confirm that the **SORTING BEHAVIOUR** on the Admin Dashboard ***shall match the General/Public Search page exactly***.
- [ ] 42. Confirm that **PAGINATION BEHAVIOUR** on the Admin Dashboard, including the 20-per-page limit and Next Page button, ***shall match the General/Public Search page exactly***.
- [ ] 43. Confirm that the **STATUS FILTER SHALL REMAIN SINGLE-SELECT ONLY**, so that ***selecting a new status replaces the previous selection*** rather than stacking or combing them on top of one another.
- [ ] 44. Confirm that the **CATEGORY FILTER SHALL REMAIN SINGLE-SELECT ONLY**, so that ***selecting a new category replaces the previous selection*** rather than stacking or combing them on top of one another.
- [ ] 45. Confirm that **STATUS AND CATEGORY FILTERS SHALL COMBINE**, so that the ***admin shall be able to narrow results further by both options simultaneously***.
- [ ] 46. Confirm that ***changing the selection in one filter group option shall leave the other group's current selection unaffected***.

**Responsive Edge Cases (Admin)**

- [ ] 47. Confirm that the **DASHBOARD'S ONE PROJECT PER ROW LAYOUT SHALL REMAIN READABLE** ***across varying screen sizes, including iPhone, iPad, and wide-screen desktop monitors***.
- [ ] 48. Confirm that **POP-UP FORMS REMAIN FULLY USABLE**, including the Add, Edit, and Delete confirmation features, across both small and wide touch screen devices.

---

## 3. DRAFT WCAG Accessibility (General/Public & Admin) — User Acceptance (UAT) Testing Scenarios

- [ ] 49. Confirm that **ALL IMAGES, INCLUDING PROJECT ICONS, SCREENSHOTS, AND CATEGORY LABELS, SHALL INCLUDE** ***descriptive alt text***.
- [ ] 50. Confirm that **ALL INTERACTIVE ELEMENTS, SUCH AS BUTTONS, LINKS, FILTERS, AND POP-UP FORMS, SHALL BE REACHABLE** using ***keyboard navigation alone***.
- [ ] 51. Confirm that **TEXT AND BACKGROUND COLOUR COMBINATIONS SHALL CREATE A CLEAR CONTRAST** for readability, ***per Max Thum's UX colour choices in Figma***.
- [ ] 52. Confirm that **PAGE TEXT SHALL BE RESIZED/SCALED** ***without breaking the page layout or losing readability***.
- [ ] 53. Confirm that **THE SCREENSHOTS CAROUSEL SHALL INCLUDE ACCESSIBLE CONTROLS**, like labelled next/previous buttons which shall be ***operable via keyboard, and not just swipe or click***.
- [ ] 54. Confirm that **THE VIDEO WALKTHROUGH, IF AVAILABLE, SHALL INCLUDE CAPTIONS OR A TEXT TRANSCRIPT** for ***users who are deaf or hard of hearing***.
- [ ] 55. Confirm that **THE STATUS INDICATORS FOR PENDING/APPROVED/REJECTED SHALL BE DISTINGUISHABLE BY MORE THAN COLOUR ALONE**, like ***an icon or clear text label for users with colour vision deficiency***.
- [ ] 56. Confirm that **THE "RESULTS MATCHED" COUNTER AND NO-RESULTS MESSAGE SHALL BE ANNOUNCED TO SCREEN READER USERS** ***when search or filter results are updated***.
- [ ] 57. Confirm that **ALL FIELDS IN THE ADD/EDIT PROJECT POP-UP FORM SHALL HAVE PROPERLY ASSOCIATED LABELS**, so ***screen readers announce each field correctly***.
- [ ] 58. Confirm that **THE CONTACT US `mailto:` LINK SHALL HAVE A CLEAR, DESCRIPTIVE ACCESSIBLE NAME**, so that ***screen reader users understand its purpose***.
- [ ] 59. Confirm that **THE ADMIN DASHBOARD DRAG-AND-DROP FEATURED-PROJECT FEATURE SHALL INCLUDE A KEYBOARD-OPERABLE ALTERNATIVE**, such as ***a checkbox in the Add/Edit project form to mark a project as featured, for now***.
- [ ] 60. Confirm that **HEADING LEVELS SUCH AS H1, H2, H3 AND SO ON SHALL FOLLOW A SEQUENTIAL STRUCTURE** on each page, which shall aid ***screen readers in both navigating and visually understanding the hierarchy***.
- [ ] 61. Confirm that **A VISIBLE FOCUS INDICATOR SHALL APPEAR ON ALL INTERACTIVE ELEMENTS**, such as buttons, links, filters, and pop-up forms when navigating via keyboard, which shall be ***distinct from the background colour for readability***.
- [ ] 62. Confirm that **THE CATEGORY/STATUS FILTERING SELECTIONS SHALL BE CONVEYED TO SCREEN READER USERS** when in an active state, and ***not just shown with a visually distinct style***.
  
---

### Handoff Notes for UX Designer (Max Thum) + Dev Team (Nick Moore & Max Ivanovic):
- The WCAG Accessibility Requirements Consideration are Currently A Draft. It shall be planned for further refinement with feedback from the UX and Dev Considering the Frontend & Backend Implementations of Such Measures. 

---

## Deliverable:
- This Testing Scenarios document shall be delivered as a markdown file `.md`, named `testing-scenarios-ua.md` and committed to the project's `docs/` directory alongside the Requirements Specification document.
- The document shall be shared as a deliverable with the PM (Nirmal Rajesh) and the rest of the team ahead of the client meeting for review, then refined as needed before the Sprint 2 build/development stage.  