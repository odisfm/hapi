# HAPI Showcase — Test Scenarios — for User Acceptance (UA) 
- **Role:** BA — Imraan Mohammed
- **Date:** Sprint 1, Week 2 — Tue, 25th Aug 2026 (Version 1.0)
- **Status:** Draft (Version 1.0)
- **Details:** This document includes test scenarios which are derived from the `requirements-specification.md` document, covering both General/Public Access and Admin Access from an end-user perspective, alongside any edge cases identified during feedback sessions from the client and our PM (Nirmal Rajesh).
- **Related Document:** The signed Client Project Proposal organised by our PM (Nirmal Rajesh) and the Sprint 1 Week 1's Requirements Specification Document prepared myself, the BA (Imraan Mohammed), which covers functional and non-functional requirements, edge cases and design guides, all are related documents and are referenced in this document as a source of truth.
    - [Signed Client Project Proposal (PDF)](https://rmiteduau.sharepoint.com/:b:/r/sites/CapstoneProgrammingProject2026-68-HAPIApplePlatformShowcaseTeamA/Shared%20Documents/SIGNED%20HAPI%20Showcase%20Client%20Project%20Proposal%5B64%5D.pdf?d=w5547aa661f4f466982b7ea8309db2338&csf=1&web=1&e=HEDrkA)
    - [`requirements-specification.md` (MD file - Version 3.0)](https://github.com/odisfm/hapi/blob/main/docs/requirements-specification.md)
- **Scope Note:** This document shall simply define testable scenarios covering the functional requirements and edge cases covered in the Requirements Specification Document, from a General/Public and Admin Access perspective. Accessibility (WCAG) considerations shall be scoped for the Sprint 2 build/development stage and shall not be covered in the current document yet. Backend and Infrastructure concerns, including hosting, storage, database and security/encryption matters, shall be acknowledged as important but sit outside a user acceptance scope, and excluded from this document for now. This document shall be a working checklist against the Requirements Specification Document, and shall be further refined iteratively over the next two sprints after feedback and review from the team and client.

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
- [ ] 10. Confirm that a **VIDEO WALKTHROUGH**, if available, shall display above the screenshots gallery and shall ***autoplay in a muted state*** by default.
- [ ] 11. Confirm that the page shall still display the card grid layout cleanly, with no gap or broken content, if no video walkthrough is available.
- [ ] 12. Confirm that an **IPA DOWNLOAD LINK** shall be available on the project page if the project supports one.
- [ ] 13. Confirm that **APP STORE AND/OR TESTFLIGHT LINKS** shall appear/display as easier installation alternatives if available for the project.
- [ ] 14. Confirm that **NON-DOWNLOADABLE PROJECTS** shall show a ***"Link to Project Showcase"*** in place of a download option if available.
- [ ] 15. Confirm that a **GITHUB LINK** shall only display for ***open-sourced projects***.
- [ ] 16. Confirm that **OTHER REMAINING LINKS** such as IPA, App Store, TestFlight, and/or Link to Project Showcase shall **CONTINUE TO FUNCTION CORRECTLY**, ***should the associated GitHub repository later become unavailable, removed or made private***.
- [ ] 17. Confirm that **MULTI-PLATFORM PROJECTS** shall list each platform version as its ***own separately labelled download***, rather than bundling them together.
- [ ] 18. Confirm that a **CONTACT US OPTION** shall always be visible alongside downloads, opening the user's preferred emailing method and drafting a new mail to the shared HAPI email, which shall use the `mailto:` html attribute.
- [ ] 19. Confirm that **CONTACT US SHALL REPLACE THE DOWNLOADS** section entirely ***when no available download option exists***, rather than appearing greyed out.

**Search/Projects Page**

- [ ] 20. Confirm that the **SEARCH/PROJECTS PAGE** shall ***reuse the homepage's card grid layout***, displaying each project's category in place of its subtitle (short description).
- [ ] 21. Confirm that the **SEARCH BAR** shall ***match entered terms against project names***.
- [ ] 22. Confirm that the **SEARCH BAR** shall ***match entered terms against project descriptions***.
- [ ] 23. Confirm that **CATEGORY FILTERING SHALL REMAIN SINGLE-SELECT ONLY**, so that ***selecting a new category replaces the previous selection*** rather than stacking or combing them on top of one another.
- [ ] 24. Confirm that **SORT SHALL FUNCTION** correctly by both ***alphabetical order and date created***.
- [ ] 25. Confirm that **PAGINATION SHALL LIMIT RESULTS TO 20 PROJECTS PER PAGE**, with a ***"Next Page" button appearing once that limit is reached***.
- [ ] 26. Confirm that **ANY SELECTED FILTER SHALL BE VISUALLY DISTINCT** from unselected ones, so that the ***user can see clearly identify what filter's currently applied***.
- [ ] 27. Confirm that **CLEARING THE SEARCH TERM** shall ***leave any active filters or sort selections unaffected***.
- [ ] 28. Confirm that a **NO-RESULTS MESSAGE** shall display ***when no projects match a search or filter combination***.

**Responsive Edge Cases (Public)**

- [ ] 29. Confirm that the **CARD GRID SHALL DISPLAY AND FLOW CORRECTLY** ***across varying screen sizes, including iPhone, iPad, and wide-screen desktop monitors***.
- [ ] 30. Confirm that the **SCREENSHOTS CAROUSEL** shall remain ***swipeable on touch devices***.

---

## 2. Admin Access — User Acceptance (UAT) Testing Scenarios

**Login & Access**

- [ ] 31. Confirm that the **ADMIN DASHBOARD SHALL ONLY BE ACCESSIBLE** after a ***successful admin login***.
- [ ] 32. Confirm that the **`/admin-login` PATH** shall not be accessible anywhere in the public site's navigation unless the user manually enters it into the browser's address bar.

**Managing Projects**

- [ ] 33. Confirm that the **"ADD PROJECT" BUTTON**, positioned in the top-right section, shall ***open a pop-up form rather than directing the admin to a new page***.
- [ ] 34. Confirm that the **DASHBOARD** shall ***list projects one per row***, each showing ***icon, name, subtitle (short description) and status***.
- [ ] 35. Confirm that a **PROJECT SET TO PENDING** status shall ***remain hidden from the public site***.
- [ ] 36. Confirm that a **PROJECT SET TO APPROVED** status shall become ***visible on the public site***.
- [ ] 37. Confirm that a **PROJECT SET TO REJECTED** status shall be ***hidden from the public site while its record remains intact in the dashboard***.
- [ ] 38. Confirm that **EACH PROJECT'S "ACTION"** button shall ***display both the Edit and Delete options***.
- [ ] 39. Confirm that **SELECTING EDIT** shall ***reopen the pop-up form, pre-filled with the project's existing details for editing***.
- [ ] 40. Confirm that **SELECTING DELETE** shall ***open a confirmation pop-up***, and clicking the ***confirmation shall permanently remove the project's record***, which shall be distinct from Rejected, which retains it instead.
- [ ] 41. Confirm that **SETTING A PROJECT TO REJECTED** shall ***require a reason/feedback to be provided*** by the admin for it's rejection before the status can be changed.

**Sorting, Pagination & Filters**

- [ ] 42. Confirm that the **SORTING BEHAVIOUR** on the Admin Dashboard ***shall match the General/Public Search page exactly***.
- [ ] 43. Confirm that **PAGINATION BEHAVIOUR** on the Admin Dashboard, including the 20-per-page limit and Next Page button, ***shall match the General/Public Search page exactly***.
- [ ] 44. Confirm that the **STATUS FILTER SHALL REMAIN SINGLE-SELECT ONLY**, so that ***selecting a new category replaces the previous selection*** rather than stacking or combing them on top of one another.
- [ ] 45. Confirm that the **CATEGORY FILTER SHALL REMAIN SINGLE-SELECT ONLY**, so that ***selecting a new category replaces the previous selection*** rather than stacking or combing them on top of one another.
- [ ] 46. Confirm that **STATUS AND CATEGORY FILTERS SHALL COMBINE**, so that the ***admin shall be able to narrow results further by both options simultaneously***.
- [ ] 47. Confirm that ***changing the selection in one filter group option shall leave the other group's current selection unaffected***.

**Responsive Edge Cases (Admin)**

- [ ] 48. Confirm that the **DASHBOARD'S ONE PROJECT PER ROW LAYOUT SHALL REMAIN READABLE** ***across varying screen sizes, including iPhone, iPad, and wide-screen desktop monitors***.
- [ ] 49. Confirm that **POP-UP FORMS REMAIN FULLY USABLE**, including the Add, Edit, and Delete confirmation features, across both small and wide touch screen devices.

---

### Handoff Notes for UX Designer (Max Thum):
- Updates to be considered with regards to design choices include the: pop-up form for adding/editing a project in the admin dashboard, clearly separated select/deselect states for the category filter in the general/public search page and category/status filters in the admin dashboard, and a clear contact us section for individual project pages.

### Handoff Notes for Dev Team (Nick Moore & Max Ivanovic):
- Updates to be considered with regards to the backend logic include the: status based rules as to whether a project is pending/approved/rejected to determine what projects are publicly available, the category and status filters in the admin dashboard combine to narrow results without resetting each other's current current selection, the distinction between a rejected project (with it's project record still retained) and a deleted project (with it's project record permanently removed), and careful handling and storage of distinct download options/links as various platform version are supported for each project. 

---

## Deliverable:
- This Testing Scenarios document shall be delivered as a markdown file `.md`, named `testing-scenarios-ua.md` and committed to the project's `docs/` directory alongside the Requirements Specification document.
- The document shall be shared as a deliverable with the PM (Nirmal Rajesh) and the rest of the team ahead of the client meeting for review, then refined as needed before the Sprint 2 build/development stage.  