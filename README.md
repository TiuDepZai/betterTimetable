![BetterTimetable](.github/assets/banner.png)

# BetterTimetable

The BetterTimetable project, developed for Code Network using **NextJS (TypsScript)**, enhances students' experience by creating a user-friendly timetable. It integrates React elements for effective data display and uses server components to process QUT course data into an organized API, which populates timetables based on student preferences.

<br>

Please join our Discord Server at: [betterTimetable Discord](https://discord.gg/VnX3rcMDNA)

<br>

## 📌 Features

**Generate**

- Select Units to be included in generated timetable
- Select your personal needs, including which days to have off, earliest and latest class times, etc
- View a generated timetable that suits your needs

**Plan**

- Add Units to the Sidebar for consideration
- Hover over unit activities to see all available timeslots
- Select timeslots to be added to the timetable
- See count of required number of activities to be added to timetable
- Save created timetable plans
- Load previously saved timetable plans

**Saved**

- See collection of previously saved timetables
- Rename previously saved timetables
- Delete previously saved timetables

  <br>

## 🚀 Install required software

1. Install Git Bash

> https://git-scm.com/downloads

2. Install GitHub Desktop

> https://desktop.github.com/?ref_cta=download+desktop&ref_loc=installing+github+desktop&ref_page=docs

3. Install Visual Studio Code

> https://code.visualstudio.com/download

4. Install mySQL Workbench

> https://dev.mysql.com/downloads/installer/

> [!IMPORTANT]
> Important Notes for MySQL Setup:
>
> - On the mySQL Downloader page, it will ask you for which option for the MSI Installer, select the first (though either should be ok).
> - Upon downloading the Installation Wizard, it asks you to select a version of MySQL to have on your computer, select ‘Full’ version. This way you can install WorkBench and the MySQL Command Line Client
> - DO NOT modify network port during MySQL Setup. Ensure it is set to port 3306. If not, reinstall MySQL
> - YOU MUST create a root user with a password during installation. DO NOT make a password that uses characters like @, # or $ as these will cause the environment script not to read the password correcty. Also, do not lose your username and password! These will be needed for the .env file later on (But if you do lose these details then simply reinstall MySQL)

5. Install Node

> https://nodejs.org/en/download
>
> - Please note: You will need to restart VS Code after installing for it to take effect


   
<br><br>



## 🚀 Setup Project on VS Code (after installing software)

1. Open GitHub Desktop App
2. Clone the repository

```bash
git clone https://github.com/codenetwork/betterTimetable.git
```

3. Open the project in VS Code

> [!IMPORTANT]
> If there is a no run scripts issue, then run Windows Powershell as an administrator and type:
> ```bash
> Set-ExecutionPolicy Bypass
> ```


4. Install necessary dependencies

```bash
npm install
```

5. Duplicate `.env.example` to `.env` and update the `DATABASE_URL` to have your username, password, and port.


`<br><br>`


### Using GitHub from the CLI

If you’re using the command line interface (CLI), follow these steps:

1. Fork the Repository `<br>`
   First, fork the original repository to your GitHub account.
2. Clone Your Fork `<br>`

```bash
git clone https://github.com/<your-github-username>/betterTimetable.git
cd betterTimetable
```

3. Push Your Changes `<br>`
   After making changes, commit and push them to your forked repository:

```bash
git add .
git commit -m "Your commit message"
git push origin <your-branch-name>
```

4. Create a Pull Request (PR)`<br>`
   Go to your forked repository on GitHub.`<br>`
   Click "Compare & pull request" and select the correct branches.`<br>`
   Click "Create pull request" to submit your changes.`<br>`

**Common Error: Pushing Directly to the Original Repository** `<br>`
If you try to push without this process, you may see:

```bash
ERROR: Permission to codenetwork/betterTimetable.git denied
fatal: Could not read from remote repository.
```

To fix this, fork the repository and follow the steps above.


<br><br>


## 🚀 Setup mySQL Database (after installing software)

Drizzle ORM doesn't automatically create the database for you. You'll need to create the betterTimetable database manually before proceeding. Here's how you can do it:

1. Create the Database Manually:

   - Connect to your MySQL server using a MySQL client. Do so via MySQL Command Line Editor
   - Run the following SQL command:
     ```bash
      CREATE DATABASE betterTimetable;
     ```
2. Update Your .env File:

   - Ensure your .env file has the correct DATABASE_URL pointing to the betterTimetable database:
     `<br>`

     ```bash
        DATABASE_URL="mysql://user:password@localhost:3306/betterTimetable"
     ```

3. Push database structure to mySQL Workbench
   - Use Drizzle Kit to push changes
      ```bash
      npx drizzle-kit push
       ```

<br><br>

## 🚀 How to populate the Database Schema

Drizzle ORM doesn't automatically populate the database for you. We will need to push the changes for them to take effect. Here's how you can do it:

1. Generate and Apply Migrations:
   - Use Drizzle Kit to generate and apply migrations:

     ```bash
        npx drizzle-kit generate
        npx drizzle-kit migrate
     ```

     Alternatively, you can also try:

     ```bash
     npx drizzle-kit push
     ```

> [!IMPORTANT]
> How to make changes to the schema if push does not work
>
> - First open mySQL Workbench and go into your profile
> - On the left hand side, ensure you are on the schemas tab (not Administration) 
> - Click on the dropdown next to the name "betterTimetable". This should now show the details including Tables, Views and more below
> - Click on the dropdown next to "Tables". This should show the list of tables we have for the project found in schema.ts
> - Right click on all of the tables (use ctrl + left click on each) and then right click to go "Drop Tables"
> - A popup will appear. You want to click "Drop now"
> - After these actions, there will no longer be any tables in the database. The npx drizzle-kit push command will now work if you try it again in the CLI


2. Seed the Database:
    - Run your seed script to populate the database with initial data: <br>
	  ```bash
	     npx tsx seed.ts
	  ```	
	
<br><br>


## 🖥️ Usage

Running BetterTimetable

1. Run the development server through VS Code Command Line Interface

```bash
npm run dev
```

2. Open your local server via your web browser to see the result

```bash
 http://localhost:3000
```

`<br><br>`

## 🛠️ Technologies Used

- **TypeScript**: for type-safe JavaScript development.
- **HTML**: for structuring the web pages.
- **CSS**: for global styling
- **Tailwind CSS**: for utility-first CSS framework.
- **React**: as the library for building user interfaces.
- **Drizzle ORM**: for object-relational mapping.
- **SQL**: for database management.

`<br><br>`

## 🧪 Methodology

API Data Pipeline

- **Get Course Data**: Fetch QUT Course Data to identify activities for each unit and their timeslots
- **Get Teaching Periods**: Fetch QUT Teaching Periods to identify when courses are offered

<br>

Manage Data and Show Timetable

- **Allocate Timeslots**: Extract one timeslot from each given activity that does not clash. Consider student needs when selecting timeslots
- **Output Timetable**: Show a grid output of the given timeslots for the selected units

`<br><br>`

## 🌟 If You Are Interested

If you have the following skills or if you are simply looking to learn, here's how you can contribute:

- **Front End Developer**: Focus on building user interfaces with React components and styling with CSS or Tailwind CSS. You can contribute by creating new UI elements, optimizing existing ones, and ensuring a responsive design.
- **Back End Developer**: Work on server-side logic using NextJS server components. Help by setting up APIs, managing databases using Drizzle ORM and SQL, and ensuring efficient data processing.
- **Algorithm Designer**: Develop and optimize algorithms for data manipulation, transformation, and retrieval. You can contribute by enhancing the efficiency of the data pipeline and implementing new features that improve performance.
- **UI/UX Designer**: Design user interfaces that are both visually appealing and intuitive. Focus on improving the user experience by creating mockups, wireframes, and user flows to ensure a seamless interaction.
- **QA Tester**: Run the project, identify any issues, and report them. Contribute by finding and fixing bugs, performing testing, and ensuring the overall quality of the project through thorough testing and debugging.
  Feel free to contribute and enhance this project!

`<br><br>`

## Learn More

To learn more about Next.js, Tailwind, and other technologies used in this project, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/get-started-mysql) - learn about DrizzleORM syntax
- [TailwindCSS Components](https://tailwindcss.com/docs/installation/using-vite) - learn about TailwindCSS

`<br><br>`

![Screenshot of a comment on a GitHub issue showing an image, added in the Markdown, of an Octocat smiling and raising a tentacle.](https://media.licdn.com/dms/image/v2/D4E12AQEIqlkU8NSvJg/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1692105491054?e=2147483647&v=beta&t=TmE4P7hBwEMLC-PROEmExcWzuVy4S4mAvZulxTqr5d4)
