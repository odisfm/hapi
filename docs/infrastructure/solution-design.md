# Solution Design

## Overview

This document outlines the solution design for the HAPI Apple Platform
Showcase. It builds upon the agreed Solution Architecture and focuses on
the Front End, Backend and Data Layer approaches for the project. The
design follows the proposed technology stack agreed upon by the
developers as well as the wider project team.

## Front End

The frontend will be developed using React with TypeScript. React will
be used to structure the user interface through reusable components.
Elements of the Project Showcase, such as project cards, navigation bars
and image galleries, can be created as components and reused throughout
different pages. This will help maintain a consistent interface while
reducing the need to recreate similar elements during development.
Navigation between views will be handled using React Router, allowing
users to navigate through the React application without requiring a full
page reload for each view.

TypeScript will be used throughout the React application to implement
frontend logic and handle application data. Unlike JavaScript,
TypeScript provides static type checking, which can help identify errors
during development. This will be particularly useful when handling
structured project data passed between the frontend, backend, and data
layer.

Tailwind CSS will be used to style the React frontend to that of the
agreed UI/UX designs. Tailwind provides utility classes that can be
applied directly to elements within React components. By keeping these
styling rules alongside their associated components, development becomes
more efficient without having to search through multiple files.

Vite will be used as the development and build tool for the frontend.
Its development server provides developers with fast feedback when
making changes to the application. For production, Vite will create an
optimised build of the frontend that can be deployed to the AWS S3
bucket defined in the Solution Architecture. Vitest will be used as the
frontend testing framework due to its integration with Vite and
compatibility with the chosen technology stack. Frontend components and
application logic will be tested throughout development to identify
errors and reduce the risk of existing functionality being broken as new
changes are introduced.

## Backend

The backend will also be developed using TypeScript, with Hono used as
the web framework. TypeScript will be used to implement the backend
application logic while providing type checking when handling requests,
responses and application data. Using TypeScript across both the
frontend and backend also allows the development team to work with a
consistent language across the application.

Hono will be used to structure and handle the API routes required by the
Showcase, allowing the frontend to request and manage data through the
backend. The Hono application will run on AWS Lambda behind an API
Gateway, following the agreed Solution Architecture. Hono's lightweight
design is well suited to the serverless Lambda environment and the
relatively small API requirements of the Showcase. The backend will
primarily support operations relating to project browsing, search and
admin management without requiring a larger web framework.

## Data Layer

The Solution Architecture compared MySQL and PostgreSQL and recommended
PostgreSQL as the database engine for the Showcase. Following this
recommendation, PostgreSQL will be used to store the structured data
required for individual projects, including project details, authors and
links. Its relational structure is suitable for organising this
information and allowing it to be queried and managed by the backend.

Database hosting will be provided through Amazon Relational Database
Service (AWS RDS), following the client's stated preference. RDS
provides a managed PostgreSQL database, meaning AWS handles much of the
underlying database infrastructure and maintenance. This reduces the
maintenance required by the developers while keeping the database within
the same AWS environment as the other components.
