/**
 * Frontend Development, Module 5 - "Bonus Module: Git, GitHub & Vercel".
 *
 * Written from the lecture voiceover scripts (B.1 - B.6). The videos are
 * taught in Hinglish; the reading material and quizzes are plain English so
 * they work as a quick reference next to the video. Each lesson has:
 * video -> reading material -> short quiz -> AI tutor.
 */

export interface Quiz {
  title: string;
  questions: { question: string; options: string[]; correctIndex: number }[];
}

export interface ModuleLesson {
  slug: string;
  title: string;
  summary: string;
  /** Video + reading + quiz, in minutes. */
  estimatedMinutes: number;
  /** Cloudinary video, keyed to scripts/frontend-module-5-video-urls.json ("5-1" ... "5-6"). */
  videoKey: string;
  durationSeconds?: number;
  reading: string;
  quiz: Quiz;
}

export const MODULE_5_TITLE = "Bonus Module: Git, GitHub & Vercel";
export const MODULE_5_DESCRIPTION =
  "Save your work with Git, put it on GitHub, work in a team with pull requests, and take your React project live on Vercel.";

export const MODULE_5_LESSONS: ModuleLesson[] = [
  // ---------------------------------------------------------------- 5.1
  {
    slug: "git-basics-first-commits",
    title: "Git Basics: Your First Commits",
    summary:
      "What Git is, how to install and set it up, and how to save your work with add and commit.",
    estimatedMinutes: 19,
    videoKey: "5-1",
    durationSeconds: 739,
    reading: `## The problem Git solves

You have probably saved files as \`assignment.doc\`, \`assignment_v2\`, \`assignment_final\`, \`assignment_final_final\`. Which one is right? What if you need last week's version? What if two people edit the same file?

Real projects have hundreds of files, so this gets worse fast. **Version control** solves it, and the most popular version control system is **Git**.

Git remembers the history of your project. Each time you finish a piece of work you tell Git to save that moment. That saved moment is a **commit**: a snapshot of the whole project at one point in time. You can go back to any earlier commit later.

> **Think of a video game.** You save after each level. If you lose later, you restart from the last save point. A commit is a save point for your code.

## Git is not GitHub

| | What it is | Where it lives |
|---|---|---|
| **Git** | A tool that records your project's history | On your computer |
| **GitHub** | A website that stores your Git projects online | On the internet |

Git is the camera; GitHub is the photo album. The camera works without the album. This lesson is only about Git. GitHub comes in the next lessons.

## Install Git and set it up once

1. Download Git from git-scm.com for your operating system. On Windows, run the installer and keep the default options.
2. Open a terminal and check it worked:

\`\`\`bash
git --version
\`\`\`

If you see a version number, you are ready.

3. Tell Git who you are. Every commit carries your name. Use the same email you will use for GitHub later.

\`\`\`bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
\`\`\`

You only do this once per computer.

## Turn a folder into a repository

Go into your project folder in the terminal and run:

\`\`\`bash
git init
\`\`\`

Git creates a hidden folder called \`.git\`. This is where it keeps all the history. A folder tracked by Git is called a **repository** (or repo).

> **Two rules.** Never delete the \`.git\` folder, or the history is gone. And run \`git init\` only inside a project folder, never in your whole Desktop or Documents.

## The three places in Git

1. **Working directory** - your normal folder, where you edit files.
2. **Staging area** - a waiting room for the changes that will go into the next commit.
3. **Repository** - where commits are saved permanently.

> **Parcel analogy.** Your room is the working directory. You put the things you want to send into a box (staging). You seal and label the box (commit). Choose first, then seal.

## The daily commands

\`\`\`bash
git status                # what is going on right now?
git add index.html        # put one file in the staging area
git add .                 # put everything in this folder in the staging area
git commit -m "Add homepage"   # seal it with a message
git log --oneline         # see the history, one line per commit
\`\`\`

- \`git status\` shows **untracked** files (Git has not seen them yet) in red, and staged files in green. When in doubt, run it first.
- Always use \`-m\` with a message. Without it Git opens a text editor called vim, where many beginners get stuck. If that happens: press **Esc**, type \`:q!\` and press **Enter**.

## The loop you will repeat every day

1. Change some files.
2. \`git status\` - see what changed (modified files are listed).
3. \`git add .\`
4. \`git commit -m "Add heading"\`
5. \`git log --oneline\`

## Writing good commit messages

1. **Short and clear.** About 3-8 words: "Add contact form", "Fix navbar overlap".
2. **Say what you did.** "Update" or "fix" alone tell nobody anything. Never "asdf" or "final".
3. **One job per commit.** If you fixed the navbar and changed the footer, make two commits.
4. **Commit small and often**, not one huge commit at the end of the day.

## Common mistakes

- Forgetting \`git add\`, then seeing "nothing added to commit".
- Running \`git commit\` without \`-m\` and landing in vim.
- Running \`git init\` in the wrong folder (like the whole Desktop).
- Deleting the \`.git\` folder.
- Thinking a commit is online. **A commit is saved only on your laptop.** Putting it online needs GitHub.

## Practice

Create a folder called \`git-practice\` with an \`index.html\` file and run \`git init\`. Make one commit, change the file and make a second commit, then a third. Run \`git status\` after every step. Finish with \`git log --oneline\`. If you see three commits, you are ready for the next lesson.`,
    quiz: {
      title: "Git Basics Check",
      questions: [
        {
          question: "What is a commit in Git?",
          options: [
            "A website where your code is stored online",
            "A saved snapshot of your project at one moment in time",
            "A command that installs Git",
            "A folder that holds node_modules",
          ],
          correctIndex: 1,
        },
        {
          question: "What is the difference between Git and GitHub?",
          options: [
            "They are the same thing with two names",
            "Git is a website, GitHub is a tool on your computer",
            "Git is a tool on your computer that records history; GitHub is a website that stores Git projects online",
            "GitHub is the paid version of Git",
          ],
          correctIndex: 2,
        },
        {
          question: "Which order is correct for saving work in Git?",
          options: [
            "git commit, then git add",
            "git add, then git commit",
            "git init, then git status, then git push",
            "git log, then git add",
          ],
          correctIndex: 1,
        },
        {
          question: 'Why should you always write git commit -m "message" with the -m flag?',
          options: [
            "Without it Git deletes the commit",
            "Without it Git opens a text editor (vim) where beginners often get stuck",
            "It makes the commit upload to GitHub",
            "It is only needed on Mac",
          ],
          correctIndex: 1,
        },
      ],
    },
  },

  // ---------------------------------------------------------------- 5.2
  {
    slug: "gitignore-undo-and-branches",
    title: ".gitignore, Undoing Mistakes and Branches",
    summary:
      "Keep junk out of Git, undo mistakes safely, and use branches to build features without breaking your main code.",
    estimatedMinutes: 20,
    videoKey: "5-2",
    reading: `## Telling Git what to ignore

A React project folder contains things that should not go into Git:

- \`node_modules/\` - thousands of files, and anyone can recreate them with \`npm install\`.
- \`dist/\` - generated when you build the project.
- \`.env\` - private settings and secrets that must never be shared.

Create a file called **\`.gitignore\`** (the name starts with a dot and has no extension) in the top folder of the project, next to the \`.git\` folder. Each line is a name or pattern for Git to ignore:

\`\`\`
node_modules/
dist/
.env
.env.local
.DS_Store
*.log
\`\`\`

A trailing \`/\` means a folder, and \`*\` means "anything". A Vite project template already comes with a good \`.gitignore\`.

> **Create it before your first commit.** If a file is already committed, adding its name to \`.gitignore\` is not enough. Tell Git to stop tracking it (the file stays on your computer), then commit:

\`\`\`bash
git rm --cached .env
git commit -m "Stop tracking .env"
\`\`\`

Commit the \`.gitignore\` file itself so your whole team uses the same rules.

## See what changed before you commit

\`\`\`bash
git diff              # changes not yet staged
git diff --staged     # changes already staged
\`\`\`

Green lines were added, red lines were removed. Checking the diff before committing catches accidents.

## Undoing mistakes

Git lets you undo almost anything. Pick the situation:

| Situation | Command | What happens |
|---|---|---|
| I changed a file and want the last committed version back | \`git restore index.html\` | The file goes back to the last commit. **Your changes are lost for good**, so think first. |
| I staged a file by mistake | \`git restore --staged index.html\` | The file leaves the staging area; your work is kept. |
| My last commit has a typo or I forgot a file | \`git commit --amend -m "New message"\` | Replaces the last commit. If you forgot a file, \`git add\` it first. |
| My last commit was wrong and is only on my laptop | \`git reset --soft HEAD~1\` | Removes the commit but keeps your changes staged so you can redo it. |
| The commit is already online or shared | \`git revert <commit-id>\` | Creates a new commit that reverses the old one. History stays clean. |

> **Careful with \`git reset --hard\`.** It also erases changes you have not committed. Do not use it until you fully understand it.

Only amend or reset a commit that is **still only on your laptop**. Changing a commit others already have causes trouble for them.

## Branches

> **Photocopy analogy.** You photocopy your notebook and try an experiment on the copy. If it works, you add those pages to the original. If not, you throw the copy away. The original is untouched.

A **branch** is a separate line of work. The default branch is **main**, your stable, working code. New features are built on their own branches.

\`\`\`bash
git branch                       # list branches; * marks the one you are on
git switch -c feature/navbar     # create a branch and move to it (-c = create)
git switch main                  # go back to main
\`\`\`

Name branches short and lowercase with hyphens, for example \`feature/contact-form\` or \`fix/navbar-overlap\`.

### What it looks like

1. On \`feature/navbar\`, add a navbar and commit it.
2. Run \`git switch main\`. Your \`index.html\` is back to the version without the navbar, because that commit lives only on the feature branch.
3. Run \`git switch feature/navbar\`. The navbar is back.

Commit your changes **before** switching branches.

## Merging a finished feature

\`\`\`bash
git switch main
git merge feature/navbar
git branch -d feature/navbar     # delete the branch once merged
\`\`\`

If \`main\` did not change meanwhile, Git simply moves it forward (a **fast-forward**). If both sides changed, Git creates a **merge commit**. \`-d\` (small d) only deletes a branch that is already merged, so it is safe.

## The workflow in short

New feature -> new branch -> small commits -> switch to main -> merge -> delete the branch.

## Common mistakes

- Not ignoring \`node_modules\` and committing thousands of files.
- Committing \`.env\` and leaking secrets.
- Running \`git restore\` without thinking and losing work.
- Running \`git reset --hard\` without understanding it.
- Committing without checking which branch you are on. Run \`git status\` or \`git branch\` first.
- Doing all your work on \`main\`.

## Practice

In your \`git-practice\` folder, add a \`.gitignore\` with \`node_modules/\` and \`.env\` and commit it. Create a branch \`feature/heading\`, change the heading in \`index.html\`, commit, switch back to \`main\` and notice the old heading. Merge, then delete the branch. Finally, try \`git restore\` once on purpose to see what it does.`,
    quiz: {
      title: "Ignore, Undo and Branches Check",
      questions: [
        {
          question: "Which of these should normally be listed in .gitignore?",
          options: ["index.html", "src/App.jsx", "node_modules/ and .env", "package.json"],
          correctIndex: 2,
        },
        {
          question:
            "You staged a file by mistake and want to take it out of the staging area without losing your work. Which command do you use?",
          options: [
            "git restore --staged index.html",
            "git reset --hard",
            "git restore index.html",
            "git branch -d index.html",
          ],
          correctIndex: 0,
        },
        {
          question: "A commit has already been shared online. What is the safest way to undo it?",
          options: [
            "git reset --hard and force everyone to start over",
            "Delete the .git folder",
            "git revert with the commit ID, which adds a new commit that reverses it",
            "git commit --amend",
          ],
          correctIndex: 2,
        },
        {
          question: "What does a branch let you do?",
          options: [
            "Upload your code to GitHub",
            "Build a feature on a separate line of work without touching the stable main code",
            "Make your website load faster",
            "Hide files from Git",
          ],
          correctIndex: 1,
        },
      ],
    },
  },

  // ---------------------------------------------------------------- 5.3
  {
    slug: "github-push-clone-and-readme",
    title: "GitHub: Push, Clone and Your README",
    summary:
      "Put your project online on GitHub, bring other people's projects to your computer, and write a README that makes your project look professional.",
    estimatedMinutes: 19,
    videoKey: "5-3",
    reading: `## Why GitHub

Everything so far lives on your laptop. **GitHub** is a website where you keep your Git repositories online. It gives you three things:

1. **Backup** - if your laptop breaks, your code is safe.
2. **Teamwork** - many people can work on one project.
3. **Portfolio** - recruiters look at GitHub profiles. Your projects there act like a resume.

## Create your account and your first repository

1. Go to github.com and sign up. Pick a **professional username**, because it appears in your profile link. Use the same email as in your Git config so your commits link to your profile.
2. Click the **+** icon at the top right and choose **New repository**.
3. Fill in a short name with hyphens (for example \`my-portfolio\`), an optional description, and choose **Public** or **Private**. Portfolio projects are usually public.

> **Anything in a public repo is visible to everyone.** Never put passwords or secret keys in it.

4. **Leave "Add a README", "Add .gitignore" and "Choose a license" unchecked** when uploading a project you already have. Otherwise GitHub and your laptop end up with different histories.

## Connect and push

A **remote** is the online home of your repo. Tell Git its address:

\`\`\`bash
git remote add origin https://github.com/your-name/my-portfolio.git
git remote -v                    # check the address
git branch -M main               # make sure your branch is called main
git push -u origin main          # send your commits online
\`\`\`

- **push** means sending your local commits online.
- \`-u\` links your local \`main\` to \`origin/main\`, so later a plain \`git push\` is enough.
- \`origin\` is just the usual name for your main remote.

### Signing in

GitHub no longer accepts your password for pushing. Options:

1. **Git Credential Manager** (comes with Git on Windows): the first push opens a browser where you sign in. This is the easiest.
2. **GitHub CLI**: run \`gh auth login\` and follow the steps.
3. **Personal access token**: a long password-like string from GitHub settings that you paste instead of a password.

Pick whichever is easiest for you.

After the push, refresh the repo page: your files and your whole commit history are there.

## Your daily rhythm

\`\`\`bash
git add .
git commit -m "Describe the change"
git push
\`\`\`

> **Commit and push are different.** Commit saves on your laptop. Push sends it online.

## Clone and pull

To get a project from GitHub onto your computer:

\`\`\`bash
git clone https://github.com/someone/project.git
cd project
npm install
\`\`\`

Clone downloads the files and the full history, and sets \`origin\` for you. Run \`npm install\` afterwards, because \`node_modules\` is ignored and does not come with the clone.

To bring new online commits to your computer (for example from a teammate, or from your other laptop):

\`\`\`bash
git pull
\`\`\`

Run \`git pull\` before you start working.

## Tour of a repo page

- **Code** - your files (the green **Code** button holds the clone link)
- **Commits** - the history
- **Branches** - all branches
- **Issues** - bugs and ideas
- **Pull requests** - proposals to merge branches (next lesson)
- **Settings** - repo settings

## Write a README

\`README.md\` sits in the top folder, and GitHub shows it on your repo page. It is the front door of your project: recruiters and developers read it first.

\`.md\` means **Markdown**:

\`\`\`
# Big heading
## Smaller heading
- a bullet point
**bold text**
\`code\`
\`\`\`

A good README has five things:

1. Project name and a one-line description.
2. A **live demo** link (you will add this after deploying to Vercel).
3. The **tech stack**, for example React, Vite, CSS.
4. A **screenshot**.
5. How to run it locally: \`git clone\`, \`npm install\`, \`npm run dev\`.

Commit and push it, then look at the formatted result on GitHub. Tip: a repo named exactly like your username has its README shown on your GitHub profile.

## Common mistakes

- Pasting the wrong remote link, so the push fails. Check with \`git remote -v\`.
- Creating the GitHub repo with a README, then pushing a local repo: histories differ and the push is rejected.
- Pushing \`.env\` or secret keys to a public repo. Deleting the file is not enough, because it stays in history. **Change the key immediately.**
- Committing and assuming the code is online. Forgetting \`git push\` is the most common mistake.
- Forgetting \`npm install\` after a clone.

## Practice

Create a new public repo, add the remote and push your project (or \`git-practice\`). Write a \`README.md\` with the project name, a one-line description and the tech stack, then commit and push it. Check it on GitHub. If you have time, share the repo with a friend and ask them to clone and run it.`,
    quiz: {
      title: "GitHub Check",
      questions: [
        {
          question:
            "You already have a project on your laptop and want to upload it to a new GitHub repo. What should you do about the README, .gitignore and license checkboxes?",
          options: [
            "Tick all three so the repo is complete",
            "Leave them unchecked, so the online repo starts empty and the histories match",
            "Tick only the README",
            "They have no effect",
          ],
          correctIndex: 1,
        },
        {
          question: "What does git push -u origin main do the first time?",
          options: [
            "Downloads a project from GitHub",
            "Sends your local main branch online and links it, so later a plain git push works",
            "Deletes the remote repo",
            "Creates a README",
          ],
          correctIndex: 1,
        },
        {
          question: "After git clone, why do you need to run npm install?",
          options: [
            "Because Git does not copy files",
            "Because node_modules is in .gitignore, so it did not come with the clone",
            "Because it connects the repo to GitHub",
            "It is optional and does nothing",
          ],
          correctIndex: 1,
        },
        {
          question: "You accidentally pushed a secret key to a public repo. What must you do?",
          options: [
            "Delete the file and carry on, the key is now safe",
            "Make the repo private later",
            "Change (replace) the key immediately, because it stays in the history",
            "Nothing, public repos are safe",
          ],
          correctIndex: 2,
        },
      ],
    },
  },

  // ---------------------------------------------------------------- 5.4
  {
    slug: "pull-requests-conflicts-and-forks",
    title: "Teamwork: Pull Requests, Merge Conflicts and Forks",
    summary:
      "Work the way real teams do: feature branches, pull requests, resolving merge conflicts, and contributing to other people's projects with forks.",
    estimatedMinutes: 18,
    videoKey: "5-4",
    reading: `## Why teams use pull requests

If two people push straight to \`main\`, nobody sees each other's work, bugs reach main, and nobody reviews anything. Real teams follow the **feature branch workflow**:

- \`main\` is always stable and working.
- Every feature or bug fix gets its own branch.
- When the work is ready you open a **pull request** (PR): a request to the team to review your branch and merge it into \`main\`.

## The workflow, step by step

\`\`\`bash
git switch main
git pull                                   # get the latest code
git switch -c feature/contact-form         # new branch for your work
# ...work and make small commits...
git push -u origin feature/contact-form    # push your BRANCH, not main
\`\`\`

On GitHub a banner appears: **Compare & pull request**. If it does not, go to the **Pull requests** tab and click **New pull request**.

Fill in:

- **Title** - one line: "Add contact form".
- **Description** - what changed, how you tested it, and a screenshot if the UI changed. The clearer it is, the easier the review.

Then click **Create pull request**.

### Inside a pull request

- **Conversation** - discussion.
- **Commits** - the commits in this branch.
- **Files changed** - every change line by line (green added, red removed). A reviewer can comment on any line.

To fix something a reviewer asked for, just commit and push more to the same branch. The pull request updates itself.

### Merging

Click **Merge pull request**. You get three options:

1. **Create a merge commit** - keeps every commit in the history.
2. **Squash and merge** - turns all the small commits into one. The cleanest choice for beginners and small projects.
3. **Rebase and merge** - advanced, skip it for now.

Then click **Delete branch**. Finally update your laptop, because the merge happened only on GitHub:

\`\`\`bash
git switch main
git pull
git branch -d feature/contact-form
\`\`\`

Even when working alone, pull requests are a good habit: you review your own changes with fresh eyes, and each feature leaves a clear record.

## Merge conflicts

> A merge conflict is **not an error** and nothing is broken. Git is simply asking you which version to keep.

It happens when two people change the **same place in the same file**. Say you wrote "Welcome" in a heading and your friend wrote "Hello" in the same heading. Git cannot choose. If you changed different files or different lines, Git merges them on its own.

A conflict looks like this inside the file:

\`\`\`
<<<<<<< HEAD
<h1>Welcome</h1>
=======
<h1>Hello</h1>
>>>>>>> feature/greeting
\`\`\`

The part above \`=======\` is yours (HEAD), and the part below is the other branch. Those marker lines are not code and **must be removed**.

### Fixing a conflict in VS Code

Open the file. Above each conflict you get clickable options:

- **Accept Current Change** - keep yours
- **Accept Incoming Change** - keep theirs
- **Accept Both Changes** - keep both
- **Compare Changes** - look at them side by side

Or edit the file yourself and write the final version. Then:

\`\`\`bash
git add .
git commit
\`\`\`

Git proposes a default message such as "Merge branch ...". The merge is complete. If the conflict appeared in a pull request, resolve it on your branch and push again.

### Avoiding conflicts

- Run \`git pull\` before you start working.
- Keep branches small and short-lived.
- Talk to your team about who is working on which file.

You cannot avoid every conflict, so learn to resolve them calmly.

## "Updates were rejected"

When \`git push\` says **updates were rejected**, the online branch has commits you do not have. Run \`git pull\`, resolve any conflicts, then push again.

## Forks: contributing to someone else's project

You usually cannot write directly into other people's repos. A **fork** is your own copy of their repository, in your GitHub account.

1. Click **Fork** on the project.
2. Clone *your* copy.
3. Make a branch, change, commit, push.
4. Open a pull request from your fork to the original repo.
5. The owner reviews it and merges it if it is good.

This is how people contribute to huge open source projects. A first contribution can be as small as fixing a typo.

## Common mistakes

- Working and pushing directly on \`main\`.
- Opening a pull request with no description.
- Opening a huge pull request with ten unrelated changes. Small ones are easier to review.
- Leaving conflict markers (\`<<<<<<<\`) in the file and committing. This breaks the code.
- Forgetting \`git pull\` on \`main\` after a merge.

## Practice

(This is a two-person exercise, but you can do it alone.) In your repo, make a branch and write "Welcome" in the heading, then commit. On \`main\`, write "Hello" in the same heading and commit. Try merging the branch into \`main\`: a conflict appears. Fix it in VS Code and commit. Then create one more branch, push it, open a pull request on GitHub and merge it.`,
    quiz: {
      title: "Teamwork Check",
      questions: [
        {
          question: "In the feature branch workflow, where does new work happen?",
          options: [
            "Directly on main",
            "On a separate branch, which is then merged through a pull request",
            "On GitHub's website only",
            "In the .git folder",
          ],
          correctIndex: 1,
        },
        {
          question: "What is a merge conflict?",
          options: [
            "A bug that breaks your whole project",
            "Git asking you to choose when two people changed the same place in the same file",
            "A failed GitHub login",
            "A branch that has been deleted",
          ],
          correctIndex: 1,
        },
        {
          question:
            "What must you do with the <<<<<<<, ======= and >>>>>>> lines Git adds to a conflicted file?",
          options: [
            "Leave them, they are part of the code",
            "Remove them after choosing the right version, then git add and commit",
            "Rename them",
            "Push them to GitHub as they are",
          ],
          correctIndex: 1,
        },
        {
          question:
            "You want to contribute a fix to someone else's open source project. What is the usual first step?",
          options: [
            "Push directly to their main branch",
            "Fork the repository to get your own copy, then work on that",
            "Email them the files",
            "Delete their repo and recreate it",
          ],
          correctIndex: 1,
        },
      ],
    },
  },

  // ---------------------------------------------------------------- 5.5
  {
    slug: "deploy-your-react-app-on-vercel",
    title: "Deploy Your React App on Vercel",
    summary:
      "Build your React project for production, check it locally, deploy it on Vercel, and get a live link that updates on every push.",
    estimatedMinutes: 18,
    videoKey: "5-5",
    reading: `## Why localhost is not enough

When you run \`npm run dev\`, your site lives at \`localhost:5173\`. **localhost means "my own computer"**, so nobody else can open it.

To show the world your site, it must run on a computer that is always on and connected to the internet: a **server**. Putting a site on a server is called **hosting**.

## What a "build" is

While you develop, Vite runs a special server that converts your JSX instantly. The internet does not need that. It needs only plain **HTML, CSS and JavaScript** files that any browser can run. A project made of such files is a **static site**, and the process that creates them is a **build**.

\`\`\`bash
npm run build
\`\`\`

Vite reads your code, makes it small and fast, and writes the result into a new folder called **\`dist\`** (short for distribution). It holds \`index.html\` and an \`assets\` folder with compressed CSS and JavaScript. This is what goes on the internet. \`dist\` is in \`.gitignore\`, so it is not pushed to GitHub: Vercel builds it for you.

## Always check the build on your laptop first

Many people skip this. Run:

\`\`\`bash
npm run build      # finds errors: bad imports, unused variables caught by lint...
npm run preview    # serves the dist folder exactly as the internet will see it
\`\`\`

\`preview\` prints a local link (like \`localhost:4173\`). Open it and click through every page, image and button. Development and production sometimes differ, and finding the problem here is cheap. **If the build fails on your laptop, it will fail on Vercel too.**

## Get the code on GitHub

Vercel takes your code from GitHub. Make sure your latest work is pushed:

\`\`\`bash
git status
git add .
git commit -m "Prepare for deploy"
git push
\`\`\`

## Deploy with Vercel

1. Go to vercel.com, click **Sign up** and choose **Continue with GitHub**. This lets Vercel see your repositories. You can give it access to only the repos you choose.
2. Vercel's free **Hobby** plan is enough for personal projects. Plans and limits change over time, so check Vercel's pricing page for the current details.
3. In the dashboard click **Add New -> Project**, find your repository and click **Import**.
4. On the configuration page, check three settings (Vercel usually fills them in correctly):

| Setting | Should be |
|---|---|
| **Framework Preset** | Vite |
| **Build Command** | \`npm run build\` |
| **Output Directory** | \`dist\` |

   If your React app is inside a subfolder of the repo, set **Root Directory** to that folder. Leave **Environment Variables** empty for now.

5. Click **Deploy**. Vercel pulls your code from GitHub, runs \`npm install\`, then \`npm run build\`, then publishes the \`dist\` folder. You can watch the logs; it usually takes about a minute.
6. When it works you see **Congratulations**. Click **Visit** to open your site at an address like \`your-project.vercel.app\`.

That is a real public link. Open it on your phone: it is live.

## Auto-deploy

Vercel stays connected to your GitHub repo. **Every push to the \`main\` branch builds and publishes automatically.** Try it: change a heading, then:

\`\`\`bash
git add .
git commit -m "Update heading"
git push
\`\`\`

Open the **Deployments** tab in Vercel: a new deployment appears and turns **Ready** shortly. Your live site now shows the new heading.

## Preview deployments

Push a different branch or open a pull request, and Vercel creates a separate temporary link for it without touching the live site. You can test a feature like the real thing, show it to others, and merge only when you are happy. The Vercel bot even comments the preview link on your pull request.

A complete professional flow: new branch -> work -> push -> check the preview link -> pull request -> merge -> production updates itself.

## The dashboard

- **Overview** - your live link and the latest deployment
- **Deployments** - every deployment, with logs
- **Settings** - everything from the project name to environment variables

## Common mistakes

- Pushing without running \`npm run build\` locally, then watching Vercel fail.
- Choosing the wrong Framework Preset or Output Directory (for example "Other").
- Not setting **Root Directory** when the project is in a subfolder.
- Importing on Vercel before pushing the code to GitHub.
- Assuming that because it works on localhost it works online. Environment variables and routing need extra setup (next lesson).

## Practice

Run \`npm run build\` and \`npm run preview\` on your project. Push to GitHub, import it into Vercel and deploy. Add the live link to your README as "Live demo" and push. Make a small change, push, and watch the Deployments tab update the site. Finally push a new branch and open its preview link.`,
    quiz: {
      title: "Deploy Check",
      questions: [
        {
          question: "What does npm run build produce for a Vite React project?",
          options: [
            "A copy of node_modules",
            "A dist folder with plain HTML, CSS and JavaScript files ready for the internet",
            "A new Git repository",
            "A README.md file",
          ],
          correctIndex: 1,
        },
        {
          question: "Why should you run npm run build and npm run preview before deploying?",
          options: [
            "To upload the site to Vercel",
            "Because Vercel requires it",
            "To catch build errors and see the real production version on your own computer first",
            "To delete the dist folder",
          ],
          correctIndex: 2,
        },
        {
          question: "Which Vercel settings are right for a normal Vite project?",
          options: [
            "Framework Preset: Other, Output Directory: build",
            "Framework Preset: Vite, Build Command: npm run build, Output Directory: dist",
            "Framework Preset: Vite, Output Directory: src",
            "Build Command: git push",
          ],
          correctIndex: 1,
        },
        {
          question:
            "What happens when you push a new commit to the main branch of a project connected to Vercel?",
          options: [
            "Nothing, you must deploy manually each time",
            "Vercel builds and publishes the new version automatically",
            "Vercel deletes the old version permanently",
            "GitHub asks you to pay",
          ],
          correctIndex: 1,
        },
      ],
    },
  },

  // ---------------------------------------------------------------- 5.6
  {
    slug: "production-ready-env-vars-routing-domains",
    title: "Going Production-Ready: Env Variables, Routing 404s and Domains",
    summary:
      "Set environment variables on Vercel, fix the React Router refresh 404, read build errors, roll back a bad deploy, and add a custom domain.",
    estimatedMinutes: 20,
    videoKey: "5-6",
    reading: `## 1. Environment variables on Vercel

Locally you keep values such as your API address in a \`.env\` file, for example \`VITE_API_URL\`. That file is in \`.gitignore\`, so GitHub never has it, and Vercel (which gets your code from GitHub) never receives it. You give Vercel the value in its dashboard instead.

1. Open your project on Vercel -> **Settings** -> **Environment Variables**.
2. Enter the **Key** (for example \`VITE_API_URL\`) and the **Value** (the real address).
3. Choose the environments: **Production** (your live site), **Preview** (branch and pull-request links) and **Development**. You can use different values, such as a real API for Production and a test API for Preview.
4. Click **Save**.

Two things that trip people up:

> **Only names starting with \`VITE_\` reach the browser.** Vite exposes only those. A variable with any other name will not exist in your frontend code.

> **Saving is not enough. You must redeploy.** Vite bakes environment variables into the code *at build time*, so the live site keeps the old value until a new build. In **Deployments**, open the menu (three dots) on the latest deployment and choose **Redeploy**, or push a small commit.

Good habits:

- Keep a \`.env.example\` file in the repo with the variable *names* but no real values (\`VITE_API_URL=\`), so anyone who clones the project knows what to set.
- **Frontend environment variables are not secret.** Anything starting with \`VITE_\` is sent to the browser and anyone can read it. Never put passwords or private keys there.

## 2. The React Router refresh 404

You open your live site, click a link to \`/about\`, and it works. Then you refresh, or open \`/about\` directly, and Vercel shows **404 Not Found**. Why?

Your site has exactly one real file: \`index.html\`. There is no file called \`/about\` on the server. When you click a link, React Router changes the address inside the browser and never asks the server. On refresh, the browser asks the server for \`/about\`, and the server says "I have no such file".

**The fix:** tell the server to answer *every* address with \`index.html\`, and let React Router choose the page. In the **top folder of the project** (next to \`package.json\`) create a file named \`vercel.json\`:

\`\`\`json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
\`\`\`

Commit and push it. Vercel redeploys, and refreshing now works.

If it still fails: check that the file is named exactly \`vercel.json\`, that it is in the repo root (not a subfolder), and that Framework Preset is Vite and Root Directory is correct in the project settings.

## 3. When the build fails

A red **Error** or **Failed** in the Deployments tab is not a disaster. Click that deployment and open the **Build Logs**. Scroll down to the red error; it usually names a file and line number. One line often explains everything.

Common causes:

1. **Module not found / cannot resolve.** Often a **capital vs small letter** mismatch. Windows and Mac usually ignore the difference, but Vercel runs on Linux, which does not. If the file is \`Navbar.jsx\` and you import \`navbar\`, it works on your laptop and **fails on Vercel**. Always write imports with exactly the file's name.
2. **Package not installed.** You imported a package but it is not listed in \`package.json\`. Always add packages with \`npm install <name>\` and commit \`package.json\`.
3. **Lint or type errors** that appear when you build locally. This is why you run \`npm run build\` on your laptop first.
4. **Missing environment variable.** If your code needs a \`VITE_\` variable that you did not set on Vercel, the site can break or show blank. Open the browser console to see the error.

## 4. Roll back a broken deployment

If a new deployment is live and broken, do not panic. Vercel remembers every deployment. In **Deployments**, find an older one that worked, open its three-dot menu and choose the option to make it the **production** deployment. The live site goes back to that version immediately. Then fix the bug calmly on your laptop and push again.

## 5. A custom domain

Your link is \`project-name.vercel.app\`. A name like \`yourname.com\` looks more professional.

1. Buy a domain from a registrar such as Namecheap, GoDaddy or Hostinger (paid yearly).
2. In Vercel: your project -> **Settings** -> **Domains**, enter your domain and click **Add**.
3. Vercel shows **DNS records** (usually an **A record** with an IP address, or a **CNAME**). Enter exactly what Vercel shows in your registrar's DNS dashboard.
4. DNS changes can take from a few minutes to a few hours. When it is ready you see a green tick, and Vercel installs an **HTTPS certificate** automatically, so your site is secure.

You do not need a domain right away. Start with the \`vercel.app\` link on your portfolio and add a domain when you want one.

## Portfolio checklist (use it for every project)

1. Code on GitHub, public, with clear commits.
2. \`.gitignore\` contains \`node_modules\`, \`dist\` and \`.env\`.
3. README has the name, description, tech stack, a screenshot and the live demo link.
4. Every page works on the live site, **even after a refresh**.
5. Environment variables are set on Vercel, and \`.env.example\` is in the repo.
6. The site looks right on a phone.
7. Your GitHub profile has a README and your best projects pinned.
8. Each project's live link is on your resume and LinkedIn.

## Common mistakes

- Saving an environment variable but not redeploying.
- Putting \`vercel.json\` in the wrong place or giving it the wrong name.
- Wrong capital/small letters in import names.
- Guessing instead of reading the Build Logs.
- Putting secrets in frontend environment variables.

## Practice

Open a page like \`/about\` on your deployed project and refresh. If you get a 404, add \`vercel.json\` and push. Add one environment variable on Vercel, redeploy and confirm it works. On purpose, push an import with the wrong capital letters, find the error in the Build Logs, then fix it. Finally, go through the checklist above for your project.

Congratulations: with this lesson the Bonus Module is complete. You can manage your code with Git, keep it on GitHub and put it live on Vercel.`,
    quiz: {
      title: "Production-Ready Check",
      questions: [
        {
          question:
            "You saved a new environment variable on Vercel, but the live site still shows the old value. Why?",
          options: [
            "Vercel is broken",
            "Vite bakes environment variables in at build time, so you must redeploy",
            "The variable name must be in capitals",
            "Environment variables only work on localhost",
          ],
          correctIndex: 1,
        },
        {
          question:
            "Why does refreshing /about on a React Router site show a 404 on Vercel, and what fixes it?",
          options: [
            "The page is deleted; re-create it",
            "The server has no /about file; a vercel.json rewrite sends every address to index.html",
            "Your browser cache is full",
            "You need a custom domain",
          ],
          correctIndex: 1,
        },
        {
          question:
            "A build works on your Windows laptop but fails on Vercel with 'module not found'. What is a likely cause?",
          options: [
            "Windows is too fast",
            "A capital/small letter mismatch in an import (Linux servers care about case, your laptop did not)",
            "Vercel does not support React",
            "Your README is missing",
          ],
          correctIndex: 1,
        },
        {
          question: "Your latest deployment broke the live site. What is the quickest safe fix?",
          options: [
            "Delete the Vercel project",
            "Make an older working deployment the production deployment, then fix the bug and push again",
            "Wait for it to fix itself",
            "Delete your GitHub repository",
          ],
          correctIndex: 1,
        },
      ],
    },
  },
];

/** Final "Module 5 Quiz" lesson - 20 questions across all six lectures, pass mark 50% like the other module quizzes. */
export const MODULE_5_QUIZ_TITLE = "Module 5 Quiz: Git, GitHub & Deployment";
export const MODULE_5_QUIZ_SLUG = "module-5-quiz";
export const MODULE_5_QUIZ: Quiz = {
  title: MODULE_5_QUIZ_TITLE,
  questions: [
    {
      question: "What is the main job of Git?",
      options: [
        "Hosting your website on the internet",
        "Remembering the history of your project through saved snapshots (commits)",
        "Making your CSS load faster",
        "Writing your code for you",
      ],
      correctIndex: 1,
    },
    {
      question: "Which statement about Git and GitHub is correct?",
      options: [
        "GitHub is the tool on your computer, Git is the website",
        "Git runs on your computer; GitHub is a website that stores Git projects online",
        "They are two names for the same thing",
        "You must pay for GitHub to use Git",
      ],
      correctIndex: 1,
    },
    {
      question: "What does git init do?",
      options: [
        "Uploads your project to GitHub",
        "Turns the current folder into a Git repository by creating a hidden .git folder",
        "Installs Git",
        "Deletes the last commit",
      ],
      correctIndex: 1,
    },
    {
      question: "Git has three places a change can be in. Which order is right?",
      options: [
        "Repository, staging area, working directory",
        "Staging area, repository, working directory",
        "Working directory, staging area, repository",
        "Working directory, repository, staging area",
      ],
      correctIndex: 2,
    },
    {
      question: "What does git add . do?",
      options: [
        "Commits everything",
        "Puts all changed files in this folder into the staging area",
        "Pushes your code online",
        "Adds a new branch",
      ],
      correctIndex: 1,
    },
    {
      question: "Which commit message is the best?",
      options: ["update", "asdf", "final final", "Fix navbar overlap on mobile"],
      correctIndex: 3,
    },
    {
      question:
        "You run git commit without -m and a strange text editor (vim) opens. How do you get out?",
      options: [
        "Press Esc, type :q! and press Enter",
        "Close your laptop",
        "Delete the .git folder",
        "Run git push",
      ],
      correctIndex: 0,
    },
    {
      question: "Which entries should normally go in a React project's .gitignore?",
      options: [
        "src/ and index.html",
        "node_modules/, dist/ and .env",
        "package.json and README.md",
        "Nothing, everything should be committed",
      ],
      correctIndex: 1,
    },
    {
      question:
        "A file is already committed and you then add it to .gitignore. It is still tracked. What fixes this?",
      options: [
        "git rm --cached <file>, then commit",
        "git reset --hard",
        "Delete the repository",
        "git branch -d <file>",
      ],
      correctIndex: 0,
    },
    {
      question:
        "Which command throws away your uncommitted changes to a file and restores the last committed version?",
      options: [
        "git restore index.html",
        "git restore --staged index.html",
        "git commit --amend",
        "git revert",
      ],
      correctIndex: 0,
    },
    {
      question: "A bad commit was already pushed and shared. What is the safest way to undo it?",
      options: [
        "git reset --hard, then force everyone to start over",
        "git revert <commit-id>, which creates a new commit that reverses it",
        "Delete the .git folder",
        "Ignore it",
      ],
      correctIndex: 1,
    },
    {
      question: "What is the best reason to build a feature on its own branch?",
      options: [
        "Branches make code run faster",
        "The stable main branch stays untouched until the feature is finished and tested",
        "GitHub requires it",
        "It uses less disk space",
      ],
      correctIndex: 1,
    },
    {
      question: "Which command creates a new branch and switches to it?",
      options: [
        "git branch -d feature/navbar",
        "git switch main",
        "git switch -c feature/navbar",
        "git merge feature/navbar",
      ],
      correctIndex: 2,
    },
    {
      question: "What does git push -u origin main do the first time you run it?",
      options: [
        "Downloads a project",
        "Sends your local main branch online and links it, so later git push is enough",
        "Creates a README",
        "Deletes the remote",
      ],
      correctIndex: 1,
    },
    {
      question:
        "You have just cloned a React project from GitHub. What must you run before npm run dev?",
      options: ["git init", "npm install", "git push", "npm run build"],
      correctIndex: 1,
    },
    {
      question: "What is a pull request?",
      options: [
        "A command that downloads code",
        "A request to review your branch and merge it into main",
        "A way to delete a branch",
        "A GitHub paid plan",
      ],
      correctIndex: 1,
    },
    {
      question: "When does a merge conflict happen?",
      options: [
        "Whenever you run git merge",
        "When two people change the same place in the same file and Git cannot choose",
        "When your internet is slow",
        "When you forget git add",
      ],
      correctIndex: 1,
    },
    {
      question:
        "What must you do with the <<<<<<<, ======= and >>>>>>> lines in a conflicted file?",
      options: [
        "Keep them, they are part of the code",
        "Choose the right version, remove those marker lines, then git add and commit",
        "Rename them",
        "Push them to GitHub",
      ],
      correctIndex: 1,
    },
    {
      question: "What does npm run build create for a Vite project, and what is it for?",
      options: [
        "A node_modules folder, for development",
        "A dist folder of plain HTML, CSS and JavaScript, which is what goes on the internet",
        "A README, for GitHub",
        "A new Git branch",
      ],
      correctIndex: 1,
    },
    {
      question:
        "Your React Router site works when you click links on Vercel, but refreshing /about shows a 404. What fixes it?",
      options: [
        "A vercel.json rewrite that sends every address to index.html",
        "Buying a custom domain",
        "Deleting the dist folder",
        "Switching from GitHub to GitLab",
      ],
      correctIndex: 0,
    },
  ],
};
