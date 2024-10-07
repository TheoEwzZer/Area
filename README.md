# AREA

## Description

The goal of this project is to discover, as a whole, the software platform that you have chosen through the creation of a business application. To do this, you must implement a software suite that functions similarly to that of **IFTTT** and/or **Zapier**.

This software suite will be broken into three parts:

1. **Application Server**: Responsible for implementing all the business logic and features.
2. **Web Client**: Allows users to interact with the platform from their browsers by querying the application server.
3. **Mobile Client**: Allows users to access the platform from their mobile devices, also by querying the application server.

## Technologies

The project is built using the following technologies:

- **Next.js** (React) - Frontend and server-side rendering framework.
- **PostgreSQL** - Database for managing data.
- **Prisma** - ORM for interacting with the PostgreSQL database.

## Services

### Discord

#### Discord Actions

- **New pinned message in channel**: This trigger fires when a new message is pinned in a channel you select.
- **New message in channel**: This trigger fires when a new message is posted in a channel you select.
- **New pinned message in channel**: This trigger fires when a new message is pinned in a channel you select.
- **Reaction added to message**: This trigger fires when a reaction is added to a in a channel you select.
- **Message deleted in channel**: This trigger fires when a message is deleted in a channel you select.
- **New member in guild**: This trigger is activated when a new member joins a guild you have selected.
- **Member left guild**: This trigger is activated when a member leaves a guild you have selected.

#### Discord Reactions

- **Post a message to a channel**: This action will send a message from the AREA Bot to the channel you specify.
- **Post a rich message to a channel**: This action will send a rich message from the AREA Bot to the channel you specify. Although most fields are optional, running the action requires content in the message body or content in at least one of the embed attributes.

### Google Calendar

#### Google Calendar Actions

- **New event added**: This trigger fires every time a new event is added to your Google Calendar.
- **Event deleted**: This trigger fires every time an event is deleted from your Google Calendar.
- **Event modified**: This trigger fires every time an event is modified in your Google Calendar.

#### Google Calendar Reactions

- **Quick add event**: This action will add an event to your Google Calendar. Simply include a detailed description of when and what.
- **Create a detailed event**: This action will create a detailed event in your Google Calendar.

### YouTube

#### YouTube Reactions

- **Upload video from URL**: This action will publish a video or Short from a given URL to your YouTube channel. Video will be uploaded as a Short or regular video based on the video length and aspect ratio.

### GitHub

#### GitHub Actions

- **Any new pull request**: This trigger fires every time any new pull request is opened in a repository you own or collaborate on.
- **Any new issue**: This trigger fires every time any new issue is opened in a repository you own or collaborate on.

#### GitHub Reactions

- **Create new Gist**: This action will create a Gist for you.
- **Create an issue/pull request comment**: This action will comment in a specific issue or pull request on GitHub.

### Gmail

#### Gmail Reactions

- **Send an email**: This action will send an email to up to twenty recipients from your Gmail account.
- **Send yourself an email**: This action will send yourself an email. HTML, images, and links are supported.

## API Routes

Here are the available API routes:

- **GET /action-parameters/route.ts**: Retrieve action parameters.

### Response

```json
[
  {
    "id": int;
    "name": "string";
  }
]
```

- **PATCH /areas/[areaId]/route.ts**: Update a specific area by ID.

### Response

```json
[
  {
    "id": int,
    "title": "string",
    "isActive": bool,
    "userId": "string"
  }
]
```

- **DELETE /areas/[areaId]/route.ts**: Delete a specific area by ID.

### Response

```json
[
  {
    "id": int
  }
]
```

- **POST /areas/route.ts**: Create a new area.

### Response

```json
[
  {
    "id": int,
    "userId": "string",
    "actionId": int,
    "reactionId": int,
    "actionData": { json },
    "reactionData": { json },
    "title": "string",
  }
]
```

- **GET /areas/route.ts**: Get all areas.

```json
[
  {
    "id": int,
    "userId": "string",
    "actionId": int,
    "reactionId": int,
    "actionData": { json },
    "reactionData": { json },
    "title": "string",
    "actionServiceInfo": {
      id: int;
      type: "string";
      color: "string";
      image_url: "string";
      description: "string";
     },
    "reactionServiceInfo": {
      id: int;
      type: "string";
      color: "string";
      image_url: "string";
      description: "string";
     }
  }
]
```

- **GET /check-admin/route.ts**: Verify if the user has admin rights.

```json
[
  {
    "isAdmin": bool
  }
]
```

- **GET /services/route.ts**: Get available services for automation.

```json
[
  {
    "id": int,
    "type": "string",
    "actions": [
      {
        "id": int,
        "name": "string",
      }
    ],
    "reactions": [
      {
        "id": int,
        "name": "string",
      }
    ]
  }
]
```

- **PUT /users/[userId]/role/route.ts**: Update a user's role.

```json
[
  {
    "detail": "string"
  }
]
```

- **GET /users/[userId]/services/[service]/route.ts**: Get a specific service for a user.

```json
[
  {
    "services": [
      {
        "id": int,
        "userId": "string",
        "service": "string",
      }
    ]
  }
]
```

- **DELETE /users/[userId]/services/[service]/route.ts**: Delete a specific service for a user.

```json
[
  {
    "detail": "string"
  }
]
```

- **GET /users/[userId]/services/route.ts**: Get all services for a user.

```json
[
  {
    "services": [
      {
        "id": int,
        "userId": "string",
        "service": "string",
      }
    ]
  }
]
```

- **GET /users/me/route.ts**: Get current logged-in user info.

```json
[
  {
    "id": int,
    "firstName": "string",
    "lastName": "string",
    "email": "string",
  }
]
```

- **GET /users/route.ts**: Get all users.

```json
[
  {
    "id": int,
    "firstName": "string",
    "lastName": "string",
    "email": "string",
  }
]
```
