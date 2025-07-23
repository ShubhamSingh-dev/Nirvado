# Steps I took to make this project

### 01 : Initialised project

npx create-next-app@latest
added shadcn

### 02 : Initailsied Database

initialised prisma in our project : npx prisma init
DATABASE_URL= "" added from neonDB : postgress
npm install @prisma/client
npx prisma generate
npx prisma db push

### 03 - Auth (Using next Auth)

Started with installing Auth.js : npm install next-auth@beta

- Setup Environment : by npx auth secret made .env.local

