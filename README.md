# SWE363-Project (Memory Of Place)

## 📌 Project Description
“Memory of Place” is an interactive platform that enables users to upload their memories about places through photos, videos, comments, and highlights of key details.

Those memories can be shared publicly, with a specific group such as family or friends, or kept private. Users can follow each other and get notified when new memories from followed users or groups are uploaded.

The platform also allows users to search for certain memories or places and apply search filters.

---

## ⚙️Frontend Setup and Installation

1. Clone the repository:
```
git clone https://github.com/FatemahCloudy/SWE363-Project.git
```


2. Navigate to the project directory:
```
cd SWE363-Project
```

3. install dependencies:
```
npm install
```


4. Start the development server:
```
npm run dev
```

## ⚙️Backend Setup and Installation

1. Navigate to the back-end folder:
   ```
   cd SWE363-Project/back-end
   ```

5. Start the development server:
```
node server.js
```


3. Backend runs at
```
http://localhost:6001/api
```


## 📌 API Documentation
Below is the main REST API documentation for authentication & memories.

## 🔐 AUTH APIs:
1️⃣ Signup :POST /api/auth/signup:

-  request body :
  ```
  {
  "username": "sara",
  "email": "sara@example.com",
  "password": "sara123",
  "fullName": "Sara Ali"
```

-  success response:
```
  {
  "id": "6923fd31a934b9e055316bcc",
  "username": "sara",
  "email": "sara@example.com"
}
```

✅ Login: POST /api/auth/login:

  - request body :
 ```
  {
  "identifier": "sara",
  "password": "sara123"
}

```


 - Response:
```
{
  "message": "Login successful",
  "token": "JWT_TOKEN_HERE",
  "user": {
    "id": "6923fd31a934b9e055316bcc",
    "username": "sara",
    "email": "sara@example.com"
  }
}
```


✅ Get Current User : GET /api/auth/me

( Requires Authorization → Bearer TOKEN) 


✅ LogOut:  POST /api/auth/logout


## 📸 Memory APIs
- 📍 Get All Memorie :GET /api/memories (Requires token)

```
- Response:
   {
  "success": true,
  "count": 0,
  "data": []
   }
```

- 📍 Create Memory : POST /api/memories

- Body Example:
```
{
  "title": "Sara Wedding",
  "description": "A beautiful night celebrating Sara's wedding.",
  "category": "family",
  "privacy": "public"
}
```

-Response:
   ``` 
{
  "success": true,
  "data": {
    "title": "Sara Wedding",
    "category": "family"
  }
}
```


- 📍Get Memory by ID : GET /api/memories/:id


- 📍 Update Memory : PUT /api/memories/:id

- 📍 Delete Memory : DELETE /api/memories/:id

## 💬 Comment APIs
- Add Comment: POST /api/memories/:id/comments
```
- Body:
{
  "content": "Beautiful memory!"
}
```

## ❤️ Reaction APIs
- Like Memory : POST /api/memories/:id/like

- Unlike Memory : DELETE /api/memories/:id/like

## 🔍  Search API
- Search Memories : GET /api/memories/search?keyword=paris

## 👤  User APIs 
- Get User Memories : GET /api/memories/user/:userId



## 🚀 Usage

- Upload memories (photos, videos, comments).
- Set visibility: Public, Group-specific, or Private.
- Follow other users and get notified about their uploads.
- Search for memories using keywords or filters (e.g., location, date, tags).

Examples: 
- User uploads a photo of a trip to Paris and adds a description and key highlights.
- User sets visibility to "Friends only".
- Friends following the user get notified and can like/comment on the memory.
- Memories can be retrieved later through search using keywords like "Eiffel Tower" or "Paris".

 ## User Accounts

To support testing and role-based access within the Memory of Place platform, the application includes two predefined user accounts. These accounts allow access to specific modules based on user roles.

### Admin Account

Username: admin

Password: admin123

Role: Administrator

### Admin Capabilities

- Add and edit content
- Add locations
- Invite users
- Manage flagged content
- Send notifications
- Customize search behavior

### Creator Account

Username: sarah

Password: sarah123

Role: Creator

### Creator Capabilities

- Add, edit, and delete memories
- Categorize memories
- Search personal memories
- Respond to comments
- Control privacy settings

## 👥 Team Member Roles

### 1. Admin Module – **Afrah**

#### 🔧 Functionalities implemented on React
- Add content  
- Edit content  
- Add locations  
- Invite users  
- Manage flagged content  
- Send notifications  
- Customize search behavior  

---

### 2. Creator Module – **Deema Almousa**

#### 🔧 Functionalities implemented on React
- Signup  
- Add memory  
- Edit memory  
- Delete memory  
- Categorize memories  
- Search own memories  
- Respond to comments  
- Control privacy  

---

### 3. Viewer Module – **Maryam Almobarak**

#### 🔧 Functionalities implemented on React
- Browse public memories  
- View memory details  
- Search memories  
- Filter memories  
- Like/react  
- Comment  
- Follow users  
- Bookmark memories  
- Share memories  

---

### 4. Core Application & Shared Components – **Fatemah Almarhoon**  

#### 🔧 Functionalities implemented on React
- Login  
- App-wide navigation  
- Page routing  
- Authentication handling  
- Shared UI behavior  
