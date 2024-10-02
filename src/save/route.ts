/*
Auth
1. Registration           'auth/register'
2. Login                  'auth/login'
3. Change Password        'auth/change-password'
4. Refresh Token          'auth/refresh-token'
5. Forget Password        'auth/forget-password'
6. Validate Reset Code    'auth/check-reset-code'
7. Reset Password         'auth/reset-password'

User 
1. Get all users(ADMIN)         "/users/all"
2. Update user role(ADMIN)      "/users/change-role/userId"
3. Get single User(Any Person)  "/users/userId"
4. Get my information(Only me)  "/users/me"
6. Manage users follow          "/users/follow/userId"
5. Delete user(Admin | Only user himself)   "/users/userId"

Post
1. Create Post          "/posts/"  POST
2. Get all posts        "/posts/"  GET
3. Get single post      "/posts/postId" GET
4. Update post          "/posts"   PATCH
5. Delete post          "/posts"   DELETE
6. UpVote DownVote      "/posts/vote"   POST
7. Favourite Post       "/posts/favourite/postId"  POST


Comment
1. Create   "/comments"
2. Get All Comments of a post   "/comments/postId"
3. Update   "/comments/commentID"
4. Delete   "/comments/commentID"

Category
1. Create       "/category"
2. Get All      "/category"
3. Update       "/category/categoryID"   
4. Delete Single    "/category/categoryID"
5. Delete All   "/category"


*/
