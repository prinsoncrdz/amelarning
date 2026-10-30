import crypto from "node:crypto";
import { prisma } from "./prisma";

export async function courseState(userId: string, courseId: string) {
  return getCourseLearningState(courseId, userId);
}

export async function getCourseLearningState(
  courseId: string,
  userId: string
) {
  const course = await prisma.course.findFirst({
    where: {
      OR: [{ id: courseId }, { slug: courseId }],
    },
    include: {
      instructor: true,
      category: true,
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              quiz: true,
            },
          },
        },
      },
      finalExam: true,
    },
  });

  if (!course) {
    throw new Error("COURSE_NOT_FOUND");
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: course.id,
      },
    },
    include: {
      user: true,
    },
  });

  if (!enrollment) {
    const error: any = new Error("NOT_ENROLLED");
    error.courseSlug = course.slug;
    error.courseTitle = course.title;
    throw error;
  }

  const lessonIds = course.modules.flatMap((module) =>
    module.lessons.map((lesson) => lesson.id)
  );

  const progressRecords =
    lessonIds.length > 0
      ? await prisma.lessonProgress.findMany({
          where: {
            userId,
            lessonId: {
              in: lessonIds,
            },
          },
        })
      : [];

  const progressMap = new Map(
    progressRecords.map((progress) => [progress.lessonId, progress])
  );

  const requiredLessons = course.modules.flatMap((module) =>
    module.lessons.filter((lesson) => lesson.isRequired)
  );

  const completedRequiredLessons = requiredLessons.filter((lesson) => {
    const progress = progressMap.get(lesson.id);
    return progress?.status === "COMPLETED";
  });

  const totalRequiredLessons = requiredLessons.length;
  const completedRequiredLessonCount = completedRequiredLessons.length;

  const overallProgress =
    totalRequiredLessons > 0
      ? Math.round(
          (completedRequiredLessonCount / totalRequiredLessons) * 100
        )
      : 0;

  let finalExamPassed = true;
  if (course.finalExam) {
    const passedAttempt = await prisma.quizAttempt.findFirst({
      where: {
        userId,
        quizId: course.finalExam.id,
        passed: true,
      },
    });
    finalExamPassed = !!passedAttempt;
  }

  const allRequiredLessonsCompleted =
    totalRequiredLessons > 0 &&
    completedRequiredLessonCount === totalRequiredLessons;

  const isCourseCompleted = allRequiredLessonsCompleted && finalExamPassed;

  if (isCourseCompleted && enrollment) {
    if (enrollment.status !== "COMPLETED") {
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: {
          status: "COMPLETED",
          progressPercentage: 100,
          completedAt: new Date(),
        },
      });
      enrollment.status = "COMPLETED";
      enrollment.progressPercentage = 100;
    }

    const existingCert = await prisma.certificate.findFirst({
      where: { userId, courseId: course.id },
    });

    if (!existingCert && enrollment.user) {
      const studentName = `${enrollment.user.firstName} ${enrollment.user.lastName}`;
      await prisma.certificate.create({
        data: {
          certificateNumber: `CERT-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
          verificationCode: crypto.randomUUID(),
          userId,
          courseId: course.id,
          studentName,
          courseTitle: course.title,
          completionDate: new Date(),
          instructorName: `${course.instructor.firstName} ${course.instructor.lastName}`,
        },
      });
    }
  }

  const completedModules = course.modules.filter((module) => {
    const requiredLessonsInModule = module.lessons.filter(
      (lesson) => lesson.isRequired
    );

    if (requiredLessonsInModule.length === 0) {
      return true;
    }

    return requiredLessonsInModule.every((lesson) => {
      const progress = progressMap.get(lesson.id);
      return progress?.status === "COMPLETED";
    });
  });

  const modules = course.modules.map((module, index) => {
    const requiredLessonsInModule = module.lessons.filter(
      (lesson) => lesson.isRequired
    );

    const completedRequiredLessonsInModule =
      requiredLessonsInModule.filter((lesson) => {
        const progress = progressMap.get(lesson.id);
        return progress?.status === "COMPLETED";
      });

    const moduleCompleted =
      requiredLessonsInModule.length === 0 ||
      completedRequiredLessonsInModule.length ===
        requiredLessonsInModule.length;

    const previousModule = index > 0 ? course.modules[index - 1] : null;

    const previousModuleRequiredLessons = previousModule
      ? previousModule.lessons.filter((lesson) => lesson.isRequired)
      : [];

    const previousModuleComplete =
      !previousModule ||
      previousModuleRequiredLessons.length === 0 ||
      previousModuleRequiredLessons.every((lesson) => {
        const progress = progressMap.get(lesson.id);
        return progress?.status === "COMPLETED";
      });

    const locked =
      index > 0 &&
      !moduleCompleted &&
      !previousModuleComplete;

    const moduleProgress =
      requiredLessonsInModule.length > 0
        ? Math.round(
            (completedRequiredLessonsInModule.length /
              requiredLessonsInModule.length) *
              100
          )
        : 100;

    return {
      id: module.id,
      title: module.title,
      description: module.description,
      order: module.order,
      isRequired: module.isRequired,
      locked,
      completed: moduleCompleted,
      progress: moduleProgress,

      lessons: module.lessons.map((lesson) => {
        const progress = progressMap.get(lesson.id);

        return {
          id: lesson.id,
          title: lesson.title,
          type: lesson.type,
          description: lesson.description,

          content:
            lesson.type === "QUIZ"
              ? {
                  quizId: lesson.quiz?.id,
                }
              : lesson.content,

          order: lesson.order,
          isRequired: lesson.isRequired,
          durationMinutes: lesson.durationMinutes,

          status: progress?.status ?? "NOT_STARTED",
          progressPercentage: progress?.progressPercentage ?? 0,
          lastPosition: progress?.lastPosition ?? 0,

          locked:
            locked ||
            (!moduleCompleted && index > 0 && !previousModuleComplete),
        };
      }),
    };
  });

  const finalExamLocked =
    completedModules.length < course.modules.filter((m) => m.isRequired).length;

  return {
    course: {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      shortDescription: course.shortDescription,
      thumbnail: course.thumbnail,
      bannerImage: course.bannerImage,
      level: course.level,
      language: course.language,
      durationMinutes: course.durationMinutes,
      price: Number(course.price),

      instructor: {
        id: course.instructor.id,
        name: `${course.instructor.firstName} ${course.instructor.lastName}`,
      },

      category: {
        id: course.category.id,
        name: course.category.name,
      },
    },

    enrollment,

    progress: {
      percentage: overallProgress,
      completed: isCourseCompleted || enrollment?.status === "COMPLETED",
    },

    modules,

    finalExam: course.finalExam
      ? {
          id: course.finalExam.id,
          title: course.finalExam.title,
          passingScore: course.finalExam.passingScore,
          locked: finalExamLocked,
        }
      : null,
  };
}