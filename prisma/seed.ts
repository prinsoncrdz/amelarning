import { PrismaClient, Role, CourseStatus, LessonType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // --------------------------------------------------
  // 1. CLEAN EXISTING DEMO DATA
  // --------------------------------------------------

  await prisma.quizAnswer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizOption.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();

  await prisma.lessonProgress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();

  await prisma.enrollment.deleteMany();
  await prisma.certificate.deleteMany();

  await prisma.course.deleteMany();
  await prisma.category.deleteMany();

  await prisma.user.deleteMany({
    where: {
      email: {
        in: ["admin@example.com", "student@example.com"],
      },
    },
  });

  // --------------------------------------------------
  // 2. CREATE USERS
  // --------------------------------------------------

  const passwordHash = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      passwordHash,
      role: Role.ADMIN,
      status: "ACTIVE",
    },
  });

  const student = await prisma.user.create({
    data: {
      firstName: "Alex",
      lastName: "Johnson",
      email: "student@example.com",
      passwordHash,
      role: Role.STUDENT,
      status: "ACTIVE",
    },
  });

  console.log("✅ Users created");

  // --------------------------------------------------
  // 3. CREATE CATEGORY
  // --------------------------------------------------

  const category = await prisma.category.create({
    data: {
      name: "Technology",
      slug: "technology",
      description: "Technology and digital skills",
      status: "ACTIVE",
    },
  });

  // --------------------------------------------------
  // 4. CREATE COURSE
  // --------------------------------------------------

  const course = await prisma.course.create({
    data: {
      title: "Generative AI for Everyone",
      slug: "generative-ai-for-everyone",

      shortDescription:
        "Learn how generative AI works and how to use AI tools effectively in real-world situations.",

      description:
        "A practical introduction to generative AI covering concepts, tools, real-world use cases, hands-on projects, and advanced techniques.",

      thumbnail:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",

      bannerImage:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80",

      instructorId: admin.id,
      categoryId: category.id,

      level: "Beginner",
      language: "English",

      durationMinutes: 600,

      price: 49,

      status: CourseStatus.PUBLISHED,

      isFeatured: true,

      finalExamEnabled: true,
      finalPassingScore: 70,
      maxExamAttempts: 3,

      completionRequireAllModules: true,

      publishedAt: new Date(),
    },
  });

  console.log("✅ Course created");

  // --------------------------------------------------
  // 5. MODULE 1
  // --------------------------------------------------

  const module1 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: "Introduction",
      description: "Understand the fundamentals of generative AI.",
      order: 1,
      status: "ACTIVE",
      isRequired: true,
      unlockRule: "PREVIOUS_MODULE_COMPLETED",
    },
  });

  // --------------------------------------------------
  // MODULE 1 - VIDEO
  // --------------------------------------------------

  await prisma.lesson.create({
    data: {
      moduleId: module1.id,
      title: "Welcome to the Course",
      description: "Introduction to the course and learning journey.",
      type: LessonType.VIDEO,

      content: {
        videoUrl:
          "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",

        thumbnail:
          "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",

        duration: 120,

        requiredWatchPercentage: 80,
      },

      order: 1,
      isRequired: true,
      durationMinutes: 2,

      completionRule: "VIDEO_PERCENTAGE",
      completionThreshold: 80,
    },
  });

  // --------------------------------------------------
  // MODULE 1 - TEXT
  // --------------------------------------------------

  await prisma.lesson.create({
    data: {
      moduleId: module1.id,
      title: "What is Generative AI?",
      description: "Learn the basic concepts behind generative AI.",

      type: LessonType.RICH_TEXT,

      content: {
        html: `
          <h2>What is Generative AI?</h2>

          <p>
            Generative AI is a category of artificial intelligence
            capable of creating new content based on patterns learned
            from large datasets.
          </p>

          <h3>Examples</h3>

          <ul>
            <li>Text generation</li>
            <li>Image generation</li>
            <li>Code generation</li>
            <li>Audio generation</li>
            <li>Video generation</li>
          </ul>

          <p>
            In this course you will learn how these systems work
            and how they can be applied in real-world scenarios.
          </p>
        `,
      },

      order: 2,
      isRequired: true,
      durationMinutes: 10,

      completionRule: "MANUAL",
    },
  });

  // --------------------------------------------------
  // MODULE 1 - IMAGE
  // --------------------------------------------------

  await prisma.lesson.create({
    data: {
      moduleId: module1.id,

      title: "Generative AI Landscape",

      description:
        "Explore the different areas where generative AI is being used.",

      type: LessonType.IMAGE,

      content: {
        imageUrl:
          "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80",

        caption: "Generative AI and modern technology",

        altText: "Generative artificial intelligence concept",
      },

      order: 3,
      isRequired: true,
      durationMinutes: 5,

      completionRule: "MANUAL",
    },
  });

  // --------------------------------------------------
  // 6. MODULE 1 QUIZ
  // --------------------------------------------------

  const quiz1 = await prisma.quiz.create({
    data: {
      title: "Quiz 1: Fundamentals of Generative AI",

      description:
        "Test your understanding of the fundamentals covered in Module 1.",

      passingScore: 70,
      maxAttempts: 3,

      randomizeQuestions: false,
      randomizeOptions: false,

      timeLimitMinutes: 10,
    },
  });

  const q1 = await prisma.quizQuestion.create({
    data: {
      quizId: quiz1.id,

      question:
        "Which of the following is a real-world application of generative AI?",

      type: "SINGLE_CHOICE",

      points: 1,
      order: 1,

      options: {
        create: [
          {
            text: "Generating marketing content",
            isCorrect: true,
          },
          {
            text: "Running SQL queries",
            isCorrect: false,
          },
          {
            text: "Managing email inbox",
            isCorrect: false,
          },
          {
            text: "Creating Excel spreadsheets",
            isCorrect: false,
          },
        ],
      },
    },
  });

  const q2 = await prisma.quizQuestion.create({
    data: {
      quizId: quiz1.id,

      question: "Which type of content can generative AI create?",

      type: "SINGLE_CHOICE",

      points: 1,
      order: 2,

      options: {
        create: [
          {
            text: "Only text",
            isCorrect: false,
          },
          {
            text: "Only images",
            isCorrect: false,
          },
          {
            text: "Text, images, audio and code",
            isCorrect: true,
          },
          {
            text: "Only spreadsheets",
            isCorrect: false,
          },
        ],
      },
    },
  });

  const q3 = await prisma.quizQuestion.create({
    data: {
      quizId: quiz1.id,

      question: "Generative AI learns patterns from training data.",

      type: "TRUE_FALSE",

      points: 1,
      order: 3,

      options: {
        create: [
          {
            text: "True",
            isCorrect: true,
          },
          {
            text: "False",
            isCorrect: false,
          },
        ],
      },
    },
  });

  // --------------------------------------------------
  // CREATE QUIZ LESSON
  // --------------------------------------------------

  await prisma.lesson.create({
    data: {
      moduleId: module1.id,

      title: "Module 1 Quiz",

      description:
        "Complete the quiz and score at least 70% to complete Module 1.",

      type: LessonType.QUIZ,

      content: {
        quizId: quiz1.id,
      },

      order: 4,

      isRequired: true,

      durationMinutes: 10,

      completionRule: "QUIZ_PASS",
      completionThreshold: 70,

      quiz: {
        connect: {
          id: quiz1.id,
        },
      },
    },
  });

  console.log("✅ Module 1 created");

  // --------------------------------------------------
  // 7. MODULE 2
  // --------------------------------------------------

  const module2 = await prisma.module.create({
    data: {
      courseId: course.id,

      title: "Tools & Platforms",

      description:
        "Explore popular tools and platforms used with generative AI.",

      order: 2,

      status: "ACTIVE",

      isRequired: true,

      unlockRule: "PREVIOUS_MODULE_COMPLETED",
    },
  });

  // --------------------------------------------------
  // MODULE 2 VIDEO
  // --------------------------------------------------

  await prisma.lesson.create({
    data: {
      moduleId: module2.id,

      title: "Introduction to AI Tools",

      description:
        "Explore commonly used generative AI tools.",

      type: LessonType.VIDEO,

      content: {
        videoUrl:
          "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",

        thumbnail:
          "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",

        duration: 300,

        requiredWatchPercentage: 80,
      },

      order: 1,

      isRequired: true,

      durationMinutes: 5,

      completionRule: "VIDEO_PERCENTAGE",

      completionThreshold: 80,
    },
  });

  // --------------------------------------------------
  // MODULE 2 PDF
  // --------------------------------------------------

  await prisma.lesson.create({
    data: {
      moduleId: module2.id,

      title: "AI Tools Reference Guide",

      description:
        "Reference material covering common AI tools and platforms.",

      type: LessonType.PDF,

      content: {
        pdfUrl: "/sample-content/ai-tools-reference.pdf",

        title: "AI Tools Reference Guide",
      },

      order: 2,

      isRequired: true,

      durationMinutes: 15,

      completionRule: "MANUAL",
    },
  });

  // --------------------------------------------------
  // MODULE 3
  // --------------------------------------------------

  const module3 = await prisma.module.create({
    data: {
      courseId: course.id,

      title: "Hands-on Projects",

      description:
        "Apply generative AI concepts to practical projects.",

      order: 3,

      status: "ACTIVE",

      isRequired: true,

      unlockRule: "PREVIOUS_MODULE_COMPLETED",
    },
  });

  await prisma.lesson.create({
    data: {
      moduleId: module3.id,

      title: "Building Your First AI Workflow",

      description:
        "Create a practical AI-powered workflow.",

      type: LessonType.RICH_TEXT,

      content: {
        html: `
          <h2>Hands-on Project</h2>

          <p>
            In this project you will design a simple AI workflow.
          </p>

          <h3>Project Steps</h3>

          <ol>
            <li>Identify a repetitive task.</li>
            <li>Define the desired output.</li>
            <li>Create an effective prompt.</li>
            <li>Test the workflow.</li>
            <li>Evaluate the results.</li>
          </ol>
        `,
      },

      order: 1,

      isRequired: true,

      durationMinutes: 20,

      completionRule: "MANUAL",
    },
  });

  // --------------------------------------------------
  // MODULE 4
  // --------------------------------------------------

  const module4 = await prisma.module.create({
    data: {
      courseId: course.id,

      title: "Advanced Techniques",

      description:
        "Learn advanced concepts and techniques.",

      order: 4,

      status: "ACTIVE",

      isRequired: true,

      unlockRule: "PREVIOUS_MODULE_COMPLETED",
    },
  });

  await prisma.lesson.create({
    data: {
      moduleId: module4.id,

      title: "Advanced Prompt Engineering",

      description:
        "Learn techniques for creating better prompts.",

      type: LessonType.RICH_TEXT,

      content: {
        html: `
          <h2>Advanced Prompt Engineering</h2>

          <p>
            Effective prompting helps you communicate requirements
            clearly to generative AI systems.
          </p>

          <h3>Key Techniques</h3>

          <ul>
            <li>Provide clear context</li>
            <li>Define the desired output</li>
            <li>Give examples</li>
            <li>Specify constraints</li>
            <li>Iterate and evaluate</li>
          </ul>
        `,
      },

      order: 1,

      isRequired: true,

      durationMinutes: 20,

      completionRule: "MANUAL",
    },
  });

  // --------------------------------------------------
  // MODULE 5
  // --------------------------------------------------

  const module5 = await prisma.module.create({
    data: {
      courseId: course.id,

      title: "Final Project",

      description:
        "Complete the final project and prepare for the final assessment.",

      order: 5,

      status: "ACTIVE",

      isRequired: true,

      unlockRule: "PREVIOUS_MODULE_COMPLETED",
    },
  });

  await prisma.lesson.create({
    data: {
      moduleId: module5.id,

      title: "Final Project Instructions",

      description:
        "Instructions for completing the final project.",

      type: LessonType.RICH_TEXT,

      content: {
        html: `
          <h2>Final Project</h2>

          <p>
            Build a practical generative AI solution for a
            real-world business problem.
          </p>

          <h3>Requirements</h3>

          <ul>
            <li>Identify the problem</li>
            <li>Design an AI workflow</li>
            <li>Create prompts</li>
            <li>Test the workflow</li>
            <li>Document your results</li>
          </ul>
        `,
      },

      order: 1,

      isRequired: true,

      durationMinutes: 30,

      completionRule: "MANUAL",
    },
  });

  console.log("✅ Modules 2-5 created");

  // --------------------------------------------------
  // 8. FINAL EXAM
  // --------------------------------------------------

  const finalExam = await prisma.quiz.create({
    data: {
      title: "Final Exam",

      description:
        "Final assessment for Generative AI for Everyone.",

      passingScore: 70,

      maxAttempts: 3,

      randomizeQuestions: false,

      randomizeOptions: false,

      timeLimitMinutes: 30,
    },
  });

  const finalQuestions = [
    {
      question: "What is generative AI primarily designed to do?",
      correct: "Generate new content",
      options: [
        "Generate new content",
        "Only store data",
        "Only manage databases",
        "Only monitor networks",
      ],
    },

    {
      question: "Which is an example of generative AI?",
      correct: "AI-generated images",
      options: [
        "AI-generated images",
        "A traditional calculator",
        "A basic file system",
        "A network cable",
      ],
    },

    {
      question: "What is an important part of effective prompting?",
      correct: "Providing clear context",
      options: [
        "Providing clear context",
        "Using random words",
        "Avoiding instructions",
        "Removing all constraints",
      ],
    },

    {
      question: "Can generative AI be used for code generation?",
      correct: "Yes",
      options: [
        "Yes",
        "No",
        "Only for spreadsheets",
        "Only for networking",
      ],
    },

    {
      question: "Generative AI can be used in marketing.",
      correct: "True",
      options: ["True", "False"],
    },

    {
      question: "What should you do when an AI output is incorrect?",
      correct: "Review and refine the prompt",
      options: [
        "Review and refine the prompt",
        "Always accept it",
        "Delete the application",
        "Turn off the database",
      ],
    },

    {
      question: "Which content type can generative AI produce?",
      correct: "Multiple types",
      options: [
        "Multiple types",
        "Only text",
        "Only numbers",
        "Only tables",
      ],
    },

    {
      question: "Does context generally help an AI model understand a task?",
      correct: "Yes",
      options: [
        "Yes",
        "No",
        "Only in databases",
        "Only in programming",
      ],
    },

    {
      question: "What is prompt engineering?",
      correct: "Designing effective instructions for AI",
      options: [
        "Designing effective instructions for AI",
        "Managing computer hardware",
        "Installing databases",
        "Designing networks",
      ],
    },

    {
      question: "Generative AI can assist with document creation.",
      correct: "True",
      options: ["True", "False"],
    },
  ];

  let questionOrder = 1;

  for (const item of finalQuestions) {
    await prisma.quizQuestion.create({
      data: {
        quizId: finalExam.id,

        question: item.question,

        type:
          item.options.length === 2 &&
          (item.options.includes("True") ||
            item.options.includes("False"))
            ? "TRUE_FALSE"
            : "SINGLE_CHOICE",

        points: 1,

        order: questionOrder,

        options: {
          create: item.options.map((option) => ({
            text: option,

            isCorrect: option === item.correct,
          })),
        },
      },
    });

    questionOrder++;
  }

  // --------------------------------------------------
  // CONNECT FINAL EXAM TO COURSE
  // --------------------------------------------------

  await prisma.course.update({
    where: {
      id: course.id,
    },

    data: {
      finalExamId: finalExam.id,

      finalExamEnabled: true,

      finalPassingScore: 70,

      maxExamAttempts: 3,
    },
  });

  console.log("✅ Final exam created");

  // --------------------------------------------------
  // 9. CREATE ENROLLMENT
  // --------------------------------------------------

  await prisma.enrollment.create({
    data: {
      userId: student.id,

      courseId: course.id,

      status: "ENROLLED",

      progressPercentage: 0,
    },
  });

  console.log("✅ Student enrolled");

  // --------------------------------------------------
  // 10. SUMMARY
  // --------------------------------------------------

  console.log("");
  console.log("======================================");
  console.log("🎉 DATABASE SEED COMPLETED");
  console.log("======================================");
  console.log("");
  console.log("Admin:");
  console.log("  Email: admin@example.com");
  console.log("  Password: Password123!");
  console.log("");
  console.log("Student:");
  console.log("  Email: student@example.com");
  console.log("  Password: Password123!");
  console.log("");
  console.log("Course:");
  console.log("  Generative AI for Everyone");
  console.log("");
  console.log("Learning flow:");
  console.log("  Module 1 → Quiz");
  console.log("  Module 2 → Locked until Module 1 complete");
  console.log("  Module 3 → Locked until Module 2 complete");
  console.log("  Module 4 → Locked until Module 3 complete");
  console.log("  Module 5 → Locked until Module 4 complete");
  console.log("  Final Exam → Unlocks after required modules");
  console.log("  Certificate → Generated after course completion");
  console.log("");
  console.log("======================================");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });