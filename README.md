# Interactive Bid Project

A interactive project timeline and scope visualization tool with an admin interface for data management.

## Features

- Overview of project details
- Scope of work editor
- Creative team management
- Project timeline visualization
- Budget dashboard
- Admin interface for data management

## Setup

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Run the API server for admin data management:

```bash
npm run server
```

## Admin Interface

The admin interface allows you to:

1. Edit all phases and their properties
2. Manage rounds, events, and deliverables
3. Edit team members and their information
4. Add or remove any data elements
5. Save changes to the data.json file

To access the admin interface:

1. Navigate to the application
2. Click on the "Admin" button in the navigation bar
3. Make your changes
4. Click "Save Changes" to persist the data

Note: The API server must be running (`npm run server`) for changes to be saved to the data.json file.

## Development

- Frontend: Vue 3 with Vite
- Backend: Express.js for data management API

## License

© 2025 Ophelia & Company. All rights reserved.
