```mermaid
erDiagram

        UserRole {
            ADMIN ADMIN
        }
    


        MediaType {
            SCREENSHOT SCREENSHOT
VIDEO VIDEO
        }
    


        MediaStatus {
            AVAILABLE AVAILABLE
PENDING PENDING
FAILED FAILED
        }
    


        DeviceType {
            PHONE PHONE
TABLET TABLET
DESKTOP DESKTOP
AR AR
WATCH WATCH
TV TV
        }
    


        ApprovalStatus {
            PENDING PENDING
APPROVED APPROVED
REJECTED REJECTED
        }
    
  "Category" {
    String id "🗝️"
    String name "🔒"
    }
  

  "Showcase" {
    String id "🗝️"
    String name "🔍"
    Int year "🔍"
    Int semester "🔍"
    String description "❓"
    DateTime publishedDate "❓ null or future = unpublished"
    }
  

  "User" {
    String id "🗝️"
    String email "🔒"
    String password 
    String name 
    UserRole role 
    Boolean needsPasswordReset 
    }
  

  "Session" {
    String id "🗝️"
    DateTime expiry 
    }
  

  "Project" {
    String id "🗝️"
    String name 
    String subtitle "❓"
    String description 
    String iconUrl 
    String developers 
    ApprovalStatus approvalStatus 
    String rejectionReason "❓ only relevant when approvalStatus = REJECTED"
    String links "parsed on frontend (GitHub/App Store/etc.)"
    String order "❓ Lexo-rank"
    Boolean published 
    Boolean featured 
    }
  

  "ProjectMedia" {
    String id "🗝️"
    String mediaUrl "🔒"
    MediaType mediaType 
    DeviceType deviceType 
    String order "Lexo-rank"
    MediaStatus status 
    }
  

  "ProjectSlug" {
    String slug "🗝️"
    DateTime assignedDate 
    }
  

  "PasswordResetRequest" {
    String id "🗝️"
    DateTime expiry "❓"
    String code 
    }
  
    "User" |o--|| "UserRole" : "enum:role"
    "Session" }o--|| "User" : "user"
    "Project" |o--|| "ApprovalStatus" : "enum:approvalStatus"
    "Project" }o--|| "Category" : "category"
    "Project" }o--|| "Showcase" : "showcase"
    "ProjectMedia" }o--|| "Project" : "project"
    "ProjectMedia" |o--|| "MediaType" : "enum:mediaType"
    "ProjectMedia" |o--|| "DeviceType" : "enum:deviceType"
    "ProjectMedia" |o--|| "MediaStatus" : "enum:status"
    "ProjectSlug" }o--|| "Project" : "project"
    "PasswordResetRequest" }o--|| "User" : "user"
```
